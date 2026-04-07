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
 * Parses listing data from the body text using the pattern:
 * "...[price text]...[street number][street name][suburb] [STATE] [postcode]Bedrooms[N]Bathrooms[N]Parking[N][type]"
 *
 * The key anchor is "Bedrooms" which always appears with the bed count.
 * We walk backwards from each "Bedrooms" occurrence to find the address and price.
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

  // Find each listing block using the Bedrooms/Bathrooms/Parking anchor
  const blockPattern = new RegExp(
    `(\\d+\\/)?\\d+[A-Za-z]?\\s+[A-Z][a-z]+[^]*?${suburb}[^]*?${state}\\s*${postcode}\\s*Bedrooms(\\d+)Bathrooms(\\d+)Parking(\\d+)(\\w*)`,
    "gi"
  );

  // Simpler approach: split on "Bedrooms" and parse each segment
  const segments = bodyText.split(/(?=Bedrooms\d)/);

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg.startsWith("Bedrooms")) continue;

    // Parse beds/baths/parking from this segment
    const bpMatch = seg.match(/^Bedrooms(\d+)Bathrooms(\d+)Parking(\d+)(\w*)/);
    if (!bpMatch) continue;

    const beds = parseInt(bpMatch[1]);
    const baths = parseInt(bpMatch[2]);
    const parks = parseInt(bpMatch[3]);
    const propType = bpMatch[4] || propertyType;

    // Filter bedrooms
    if (minBedrooms > 0 && beds < minBedrooms) continue;

    // Look backwards in the previous segment for the address and price
    const prevSeg = i > 0 ? segments[i - 1] : "";
    if (!prevSeg) continue;

    // Extract address: find pattern like "Unit X/Y Street Name" or "N Street Name" followed by suburb+state+postcode
    const addrPattern = new RegExp(
      `(?:(?:Unit|Lot)?\\s*\\d+[A-Za-z]?(?:\\/\\d+)?\\s+[A-Z][A-Za-z'\\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Circuit|Cct|Crescent|Cres|Close|Cl|Court|Ct|Place|Pl|Way|Boulevard|Blvd|Parade|Pde|Terrace|Tce|Lane|Ln|Grove|Gr)[\\s,]*)${suburb}\\s*${state}\\s*${postcode}`,
      "i"
    );
    const addrMatch = prevSeg.match(addrPattern);

    let address = "";
    if (addrMatch) {
      address = addrMatch[0].replace(new RegExp(`${suburb}\\s*${state}\\s*${postcode}`, "i"), "").trim();
    } else {
      // Fallback: grab the last address-like text before suburb
      const fallback = prevSeg.match(
        /(\d+[A-Za-z]?(?:\/\d+)?\s+[A-Z][A-Za-z'\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Circuit|Close|Court|Place|Way|Boulevard|Parade|Terrace|Lane|Grove|Crescent))/i
      );
      if (fallback) address = fallback[1].trim();
    }

    if (address.length < 5) continue;

    // Clean address of any leading junk (price text, marketing copy)
    address = address.replace(/^[^0-9]*(?=\d)/, ""); // strip everything before first digit
    if (address.length < 5) continue;

    // Extract price from previous segment
    const priceMatch = prevSeg.match(/\$\s*([\d,]{3,})/);
    let price: number | null = null;
    let priceDisplay = "Contact agent";
    if (priceMatch) {
      price = parseInt(priceMatch[1].replace(/,/g, ""), 10);
      if (price < 10000) price = null; // too small, probably not a real price
      if (price) priceDisplay = `$${price.toLocaleString()}`;
    }

    // Budget filter
    if (price && price > maxBudget * 1.05) continue;

    const fullAddress = `${address}, ${suburb} ${state} ${postcode}`;

    // Deduplicate
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
      listingUrl: `https://www.allhomes.com.au/sale/${suburb.toLowerCase().replace(/\s+/g, "-")}-${state.toLowerCase()}-${postcode}/`,
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

    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || "");
        if (json["@type"] === "RealEstateListing") {
          if (json.primaryImageOfPage) fullPhotoUrl = json.primaryImageOfPage;
          if (json.mainEntity?.description) description = json.mainEntity.description;
        }
      } catch {}
    });

    // 2. Extract price from body text
    const pricePatterns = [
      /(?:Offers?\s*(?:Over|From|Above))\s*\$\s*([\d,]+)/i,
      /(?:Price\s*Guide|Asking)\s*\$\s*([\d,]+)/i,
      /\$\s*([\d,]{6,})/,
    ];
    for (const pat of pricePatterns) {
      const m = bodyText.match(pat);
      if (m) {
        price = parseInt(m[1].replace(/,/g, ""), 10);
        if (price > 10000) {
          priceDisplay = `$${price.toLocaleString()}`;
          break;
        }
        price = null;
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
