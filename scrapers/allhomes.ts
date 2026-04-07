import axios from "axios";
import * as cheerio from "cheerio";

export interface AllHomesListing {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  price: number | null;
  priceDisplay: string;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  landSize: string | null;
  propertyType: string;
  listingUrl: string;
  photoUrl: string | null;
  listingId: string | null;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-AU,en;q=0.9",
  "Cache-Control": "no-cache",
  Referer: "https://www.allhomes.com.au/",
};

/**
 * Robust Australian price parser. Handles:
 * $620,000 → 620000 | $1.425M → 1425000 | $620k → 620000
 * $450,000 - $495,000 → 472500 (midpoint) | Contact agent → null
 */
function parseAusPrice(text: string): number | null {
  if (!text) return null;
  const t = text.toLowerCase().replace(/,/g, "");

  // Millions: $1.4M or $1.4m or $1.425m
  const mMatch = t.match(/\$?([\d.]+)\s*m\b/);
  if (mMatch) return Math.round(parseFloat(mMatch[1]) * 1_000_000);

  // Thousands: $620k
  const kMatch = t.match(/\$?([\d.]+)\s*k\b/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1_000);

  // Range: $450000 - $495000 → midpoint
  const rangeMatch = t.match(/\$?(\d{5,})\D+\$?(\d{5,})/);
  if (rangeMatch) {
    const lo = parseInt(rangeMatch[1]);
    const hi = parseInt(rangeMatch[2]);
    if (lo > 50_000 && hi > 50_000) return Math.round((lo + hi) / 2);
  }

  // Plain: $620000 or 620000
  const plainMatch = t.match(/\$?(\d{5,})/);
  if (plainMatch) {
    const n = parseInt(plainMatch[1]);
    return n > 50_000 ? n : null;
  }

  return null;
}

/**
 * Extracts listings by splitting the body text on the "BedroomsN" anchors.
 * The text flow is: ...PRICE_TEXT ADDRESS SUBURB STATE POSTCODEBedroomsNBathroomsNParkingN...
 */
function extractListingsFromText(
  bodyText: string,
  suburb: string,
  state: string,
  postcode: string,
  maxBudget: number,
  minBedrooms: number,
  propertyType: string
): AllHomesListing[] {
  const listings: AllHomesListing[] = [];
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");

  // Split on "BedroomsN" — each segment starts with the bed/bath/parking data
  const segments = bodyText.split(/(?=Bedrooms\d)/);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg.startsWith("Bedrooms")) continue;

    // Parse beds/baths/parking
    const bpMatch = seg.match(/^Bedrooms(\d+)Bathrooms(\d+)Parking(\d+)(\w*)/);
    if (!bpMatch) continue;

    const beds = parseInt(bpMatch[1]);
    const baths = parseInt(bpMatch[2]);
    const parks = parseInt(bpMatch[3]);
    const propType = bpMatch[4] || propertyType;

    if (minBedrooms > 0 && beds < minBedrooms) continue;

    // The previous segment contains PRICE + ADDRESS + SUBURB STATE POSTCODE
    const prevSeg = i > 0 ? segments[i - 1] : "";
    if (!prevSeg) continue;

    // Extract the chunk ending with "suburb STATE postcode" — look back up to 500 chars
    const tailPattern = new RegExp(`(.{10,500})${suburb}\\s*${state}\\s*${postcode}\\s*$`, "i");
    const tailMatch = prevSeg.match(tailPattern);
    if (!tailMatch) continue;

    let chunk = tailMatch[1]; // everything before "Ipswich QLD 4305"

    // If chunk starts with another listing's data (BedroomsNBathrooms...),
    // strip that prefix to isolate this listing's price + address section
    const innerListingEnd = chunk.lastIndexOf("House");
    const innerListingEnd2 = chunk.lastIndexOf("Apartment");
    const innerListingEnd3 = chunk.lastIndexOf("Townhouse");
    const lastPropType = Math.max(innerListingEnd, innerListingEnd2, innerListingEnd3);
    if (lastPropType > 0) {
      // Take everything after the last property type label — that's this listing's section
      chunk = chunk.slice(lastPropType);
    }

    // Extract price — Australian format: $NNN,NNN or $N,NNN,NNN (3-7 digits with commas)
    // The price text bleeds into the address (e.g. "$865,000401/4-8 Sutton St")
    // Match exactly the comma-formatted price pattern, NOT trailing digits
    const priceRegex = /\$\s*(\d{1,3}(?:,\d{3}){1,2})/g;
    const allPrices = Array.from(chunk.matchAll(priceRegex));
    let price: number | null = null;
    let priceDisplay = "Contact agent";
    if (allPrices.length > 0) {
      const raw = allPrices[allPrices.length - 1][1].replace(/,/g, "");
      const parsed = parseInt(raw, 10);
      if (parsed >= 50_000 && parsed <= 9_999_999) {
        price = parsed;
        priceDisplay = `$${price.toLocaleString()}`;
      }
    }

    // Also try $X.XM format
    if (!price) {
      const mMatch = chunk.match(/\$([\d.]+)\s*[mM]/);
      if (mMatch) {
        const val = Math.round(parseFloat(mMatch[1]) * 1_000_000);
        if (val >= 50_000) { price = val; priceDisplay = `$${price.toLocaleString()}`; }
      }
    }

    // Extract address — find the street address after the price
    // The address starts with a number (street number) and ends just before suburb name
    let address = "";

    // Try to find "Unit N/N StreetName" or "N StreetName" pattern
    const addrMatch = chunk.match(
      /(?:Unit\s*)?(\d+[A-Za-z]?(?:\/\d+)?\s+[A-Z][A-Za-z'\s-]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Circuit|Cct|Crescent|Cres|Close|Cl|Court|Ct|Place|Pl|Way|Boulevard|Blvd|Parade|Pde|Terrace|Tce|Lane|Ln|Grove|Gr))\s*$/i
    );
    if (addrMatch) {
      address = addrMatch[0].trim();
    } else {
      // Broader fallback: grab everything from the last digit-starting word to end
      const broadMatch = chunk.match(/(\d+[A-Za-z]?(?:\/\d+)?\s+[A-Z].{3,60})\s*$/);
      if (broadMatch) address = broadMatch[1].trim();
    }

    // Clean leading junk (price digits bleed into address: "0009/5" → "9/5")
    address = address.replace(/^0+(?=\d)/, ""); // strip leading zeros
    address = address.replace(/^.*?(?=\d+[A-Za-z]?(?:\/\d+)?\s+[A-Z])/i, "").trim();
    if (address.length < 5) continue;

    // Budget filter: only eliminate if price is known and clearly over budget
    if (price && price > maxBudget * 1.10) continue;

    const fullAddress = `${address}, ${suburb} ${state} ${postcode}`;
    if (listings.some((l) => l.address === fullAddress)) continue;

    listings.push({
      address: fullAddress,
      suburb,
      state,
      postcode,
      price,
      priceDisplay,
      bedrooms: beds,
      bathrooms: baths,
      parking: parks,
      landSize: null,
      propertyType: propType || propertyType,
      listingUrl: `https://www.allhomes.com.au/sale/${suburbSlug}-${state.toLowerCase()}-${postcode}/`,
      photoUrl: null,
      listingId: null,
    });
  }

  return listings;
}

export async function scrapeAllHomesListings(
  suburb: string,
  state: string,
  postcode: string,
  maxBudget: number,
  minBedrooms: number,
  propertyType: string
): Promise<AllHomesListing[]> {
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
  const stateSlug = state.toLowerCase();

  const urls = [
    `https://www.allhomes.com.au/sale/${suburbSlug}-${stateSlug}-${postcode}/`,
    `https://www.allhomes.com.au/sale/${suburbSlug}-${stateSlug}/`,
  ];

  for (const url of urls) {
    try {
      console.log("[allhomes] Trying:", url);

      const response = await axios.get(url, { timeout: 20_000, headers: HEADERS });
      if (response.status !== 200) continue;

      const html = response.data as string;
      const $ = cheerio.load(html);
      const title = $("title").text();
      console.log("[allhomes] Title:", title.slice(0, 80));

      // Extract listing IDs from digitalData
      let listingIds: string[] = [];
      $("script").each((_, el) => {
        const content = $(el).html() || "";
        const idsMatch = content.match(/"resultsRecords":"([^"]+)"/);
        if (idsMatch) {
          listingIds = idsMatch[1].split(",");
          console.log(`[allhomes] Found ${listingIds.length} listing IDs`);
        }
      });

      // Extract listing images
      const images: string[] = [];
      $("img[src*='allhomes.com.au/property/photo']").each((_, el) => {
        const src = $(el).attr("src");
        if (src) images.push(src);
      });
      console.log(`[allhomes] Found ${images.length} listing photos`);

      // Extract real listing page URLs from the page (format: /43-sydney-street-redcliffe-qld-4020)
      const detailUrls: string[] = [];
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href") || "";
        // Match property detail pages — contain suburb slug + state + postcode in the path
        if (href.includes(`-${stateSlug}-${postcode}`) && !href.includes("/sale/") && !href.includes("/sold/") && !href.includes("/agency/") && !href.includes("/browse") && !href.includes("/search") && !href.includes("/ah/")) {
          const full = href.startsWith("http") ? href : `https://www.allhomes.com.au${href}`;
          if (!detailUrls.includes(full)) detailUrls.push(full);
        }
      });
      console.log(`[allhomes] Found ${detailUrls.length} detail page URLs`);

      // Extract listing data from page text
      const bodyText = $("body").text().replace(/\n/g, "");
      const listings = extractListingsFromText(bodyText, suburb, state, postcode, maxBudget, minBedrooms, propertyType);

      // Enrich with photos, IDs, and detail page URLs
      for (let i = 0; i < listings.length; i++) {
        if (i < images.length) listings[i].photoUrl = images[i];
        if (i < listingIds.length) listings[i].listingId = listingIds[i];

        // Match listing to a detail URL by address
        const addrSlug = listings[i].address.split(",")[0].toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const matchedUrl = detailUrls.find((u) => u.toLowerCase().includes(addrSlug));
        listings[i].listingUrl = matchedUrl || (listingIds[i] ? `https://www.allhomes.com.au/sale/${suburbSlug}-${stateSlug}-${postcode}/?pid=${listingIds[i]}` : `https://www.allhomes.com.au/sale/${suburbSlug}-${stateSlug}-${postcode}/`);
      }

      if (listings.length > 0) {
        console.log(`[allhomes] Extracted ${listings.length} listings from ${url}`);
        return listings.slice(0, 8);
      }

      // Fallback: check if page says "X properties for sale"
      const countMatch = title.match(/(\d+)\s*propert/i);
      if (countMatch) {
        console.log(`[allhomes] Page says ${countMatch[1]} properties but text extraction failed`);
      }

      console.log("[allhomes] No listings extracted from text for", url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`[allhomes] Failed on ${url}: ${msg}`);
    }
  }

  console.log("[allhomes] All URLs exhausted — returning empty");
  return [];
}

// ---------------------------------------------------------------------------
// Detail page scraper — enriches a listing with price, size, description
// ---------------------------------------------------------------------------

export interface AllHomesDetail {
  price: number | null;
  priceDisplay: string;
  landSizeM2: number | null;
  houseSizeM2: number | null;
  yearBuilt: number | null;
  description: string | null;
  fullPhotoUrl: string | null;
  priceHistory: { date: string; price: number }[];
}

export async function scrapeAllHomesDetail(listingUrl: string): Promise<AllHomesDetail | null> {
  if (!listingUrl || !listingUrl.includes("allhomes.com.au")) return null;

  try {
    console.log("[allhomes-detail] Fetching:", listingUrl);
    const r = await axios.get(listingUrl, { timeout: 15_000, headers: HEADERS });
    const html = r.data as string;
    const $ = cheerio.load(html);
    const bodyText = $("body").text().replace(/\s+/g, " ");

    // 1. Extract from JSON-LD (most reliable)
    let price: number | null = null;
    let priceDisplay = "Contact agent";
    let description: string | null = null;
    let fullPhotoUrl: string | null = null;

    let jsonLdBeds: number | null = null;
    let jsonLdBaths: number | null = null;

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "");
        if (json["@type"] === "RealEstateListing") {
          if (json.primaryImageOfPage) fullPhotoUrl = json.primaryImageOfPage;
          if (json.mainEntity?.description) description = json.mainEntity.description;
          if (json.mainEntity?.numberOfBedrooms) jsonLdBeds = parseInt(json.mainEntity.numberOfBedrooms, 10);
          if (json.mainEntity?.numberOfBathroomsTotal) jsonLdBaths = parseInt(json.mainEntity.numberOfBathroomsTotal, 10);
        }
      } catch {}
    });

    // 2. Try JSON-LD offers.price first (most reliable)
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "");
        const offerPrice = json?.offers?.price ?? json?.offers?.lowPrice;
        if (offerPrice) {
          const p = parseInt(String(offerPrice).replace(/[^0-9]/g, ""), 10);
          if (p >= 50_000) { price = p; priceDisplay = `$${p.toLocaleString()}`; }
        }
      } catch {}
    });

    // 3. Extract price from body text using comma-format regex
    if (!price) {
      const pricePatterns = [
        /(?:Offers?\s*(?:Over|From|Above))\s*\$\s*(\d{1,3}(?:,\d{3}){1,2})/i,
        /(?:Price\s*Guide|Asking)\s*\$\s*(\d{1,3}(?:,\d{3}){1,2})/i,
        /\$\s*(\d{1,3}(?:,\d{3}){1,2})/,
      ];
      for (const pat of pricePatterns) {
        const m = bodyText.match(pat);
        if (m) {
          const p = parseInt(m[1].replace(/,/g, ""), 10);
          if (p >= 50_000) { price = p; priceDisplay = `$${p.toLocaleString()}`; break; }
        }
      }
    }

    // 4. Try $X.XM format
    if (!price) {
      const mMatch = bodyText.match(/\$([\d.]+)\s*[mM]/);
      if (mMatch) {
        const val = Math.round(parseFloat(mMatch[1]) * 1_000_000);
        if (val >= 50_000) { price = val; priceDisplay = `$${val.toLocaleString()}`; }
      }
    }

    // 3. Extract sizes
    let landSizeM2: number | null = null;
    let houseSizeM2: number | null = null;

    const landMatch = bodyText.match(/(?:Land|Block)\s*(?:size|area)?[:\s]*(\d[\d,]*)\s*m/i);
    if (landMatch) landSizeM2 = parseInt(landMatch[1].replace(/,/g, ""), 10);

    const houseMatch = bodyText.match(/(?:House|Floor|Building|Unit\s*\/\s*Apartment)\s*size[:\s]*(\d[\d,]*)\s*m/i);
    if (houseMatch) houseSizeM2 = parseInt(houseMatch[1].replace(/,/g, ""), 10);

    // 4. Year built
    let yearBuilt: number | null = null;
    const yearMatch = bodyText.match(/(?:Year\s*built|Built\s*in?)[:\s]*(\d{4})/i);
    if (yearMatch) yearBuilt = parseInt(yearMatch[1], 10);

    // 5. Price history (sold prices on the page)
    const priceHistory: { date: string; price: number }[] = [];
    const soldPattern = /(?:Sold|Last\s*sold)\s*(?:on|for)?\s*(?:\w+\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4})\s*(?:for)?\s*\$\s*([\d,]+)/gi;
    let soldMatch;
    while ((soldMatch = soldPattern.exec(bodyText)) !== null) {
      const soldPrice = parseInt(soldMatch[1].replace(/,/g, ""), 10);
      if (soldPrice > 10000) {
        priceHistory.push({ date: soldMatch[0].match(/\d{4}/)![0], price: soldPrice });
      }
    }

    console.log(`[allhomes-detail] Price: ${priceDisplay} | Land: ${landSizeM2}m² | House: ${houseSizeM2}m² | Photo: ${fullPhotoUrl ? "YES" : "NO"}`);

    return { price, priceDisplay, landSizeM2, houseSizeM2, yearBuilt, description, fullPhotoUrl, priceHistory };
  } catch (e) {
    console.log("[allhomes-detail] Failed:", e instanceof Error ? e.message : String(e));
    return null;
  }
}
