import axios from "axios";
import * as cheerio from "cheerio";

export interface HomelyListing {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  price: number | null;
  priceDisplay: string;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  propertyType: string;
  listingUrl: string;
  photoUrl: string | null;
  landSize: string | null;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-AU,en;q=0.9",
  Connection: "keep-alive",
  "Cache-Control": "no-cache",
};

const STATE_MAP: Record<string, string> = {
  QLD: "queensland",
  NSW: "new-south-wales",
  VIC: "victoria",
  WA: "western-australia",
  SA: "south-australia",
  TAS: "tasmania",
  ACT: "australian-capital-territory",
  NT: "northern-territory",
};

function parsePrice(text: string): number | null {
  const cleaned = text.replace(/,/g, "").replace(/\s/g, "");
  const match = cleaned.match(/(\d{5,})/);
  return match ? parseInt(match[1], 10) : null;
}

function trySelectors($: cheerio.CheerioAPI, card: unknown, selectors: string[]): string {
  const $card = $(card as string);
  for (const sel of selectors) {
    const text = $card.find(sel).first().text().trim();
    if (text) return text;
  }
  return "";
}

export async function scrapeHomelyListings(
  suburb: string,
  state: string,
  maxBudget: number,
  minBedrooms: number,
  propertyType: string
): Promise<HomelyListing[]> {
  const stateName = STATE_MAP[state.toUpperCase()] || state.toLowerCase();
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
  const url = `https://www.homely.com.au/buy/${suburbSlug}-${stateName}/pg-1?maxprice=${maxBudget}&minbeds=${minBedrooms}`;

  console.log("[homely] Scraping:", url);

  try {
    const response = await axios.get(url, { timeout: 20_000, headers: HEADERS });
    const $ = cheerio.load(response.data);
    const listings: HomelyListing[] = [];

    const candidateSelectors = [
      '[data-testid="listing-card"]',
      ".listing-card",
      ".property-card",
      "article.listing",
      '[class*="ListingCard"]',
      '[class*="listing-card"]',
      '[class*="PropertyCard"]',
      '[class*="property-card"]',
    ];

    let listingCards = $("");
    for (const selector of candidateSelectors) {
      listingCards = $(selector);
      if (listingCards.length > 0) {
        console.log(`[homely] Found ${listingCards.length} listings with selector: ${selector}`);
        break;
      }
    }

    if (listingCards.length === 0) {
      // Try broader approach — look for links to buy pages
      const buyLinks = $('a[href*="/buy/"]').filter((_, el) => {
        const href = $(el).attr("href") || "";
        return href.includes(suburbSlug) || !!href.match(/\/buy\/\d+-/);
      });
      console.log(`[homely] No card selectors matched. Found ${buyLinks.length} buy links. Page title: ${$("title").text()}`);
      return [];
    }

    listingCards.each((_, card) => {
      try {
        const $card = $(card);

        const address = trySelectors($, card, [
          '[data-testid="address"]', ".address", "h2", "h3",
          '[class*="address"]', '[class*="Address"]',
        ]);

        const priceText = trySelectors($, card, [
          '[data-testid="price"]', ".price",
          '[class*="price"]', '[class*="Price"]',
        ]);
        const price = parsePrice(priceText);

        const bedsText = trySelectors($, card, [
          '[data-testid="bedrooms"]', '[aria-label*="bed"]',
          '[class*="bed"]', '[class*="Bed"]',
        ]);
        const bedrooms = parseInt(bedsText) || null;

        const bathsText = trySelectors($, card, [
          '[data-testid="bathrooms"]', '[aria-label*="bath"]',
          '[class*="bath"]', '[class*="Bath"]',
        ]);
        const bathrooms = parseInt(bathsText) || null;

        const linkEl = $card.find('a[href*="/buy/"]').first();
        const href = linkEl.attr("href") || "";
        const listingUrl = href.startsWith("http") ? href : `https://www.homely.com.au${href}`;

        const imgEl = $card.find("img").first();
        const photoUrl = imgEl.attr("src") || imgEl.attr("data-src") || null;

        if (address && listingUrl !== "https://www.homely.com.au") {
          const postcodeMatch = address.match(/\b(\d{4})\b/);
          listings.push({
            address,
            suburb,
            state,
            postcode: postcodeMatch ? postcodeMatch[1] : "",
            price,
            priceDisplay: priceText || "Contact agent",
            bedrooms,
            bathrooms,
            parking: null,
            propertyType,
            listingUrl,
            photoUrl,
            landSize: null,
          });
        }
      } catch {
        // Skip malformed cards
      }
    });

    console.log(`[homely] Successfully scraped ${listings.length} listings`);
    return listings.slice(0, 8);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log("[homely] Scrape failed:", msg);
    return [];
  }
}

export async function scrapeViewListings(
  suburb: string,
  state: string,
  maxBudget: number,
  minBedrooms: number
): Promise<HomelyListing[]> {
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
  const stateSlug = state.toLowerCase();
  const url = `https://www.view.com.au/for-sale/${suburbSlug}-${stateSlug}/?maxPrice=${maxBudget}&bedrooms=${minBedrooms}`;

  console.log("[view] Scraping:", url);

  try {
    const response = await axios.get(url, { timeout: 20_000, headers: HEADERS });
    const $ = cheerio.load(response.data);
    const listings: HomelyListing[] = [];

    $('[class*="listing"], [class*="property-card"], article').each((_, card) => {
      try {
        const $card = $(card);
        const address = $card.find('[class*="address"], h2, h3').first().text().trim();
        const priceText = $card.find('[class*="price"]').first().text().trim();
        const price = parsePrice(priceText);
        const href = $card.find("a").first().attr("href") || "";
        const listingUrl = href.startsWith("http") ? href : `https://www.view.com.au${href}`;
        const photoUrl = $card.find("img").first().attr("src") || null;
        const bedsText = $card.find('[class*="bed"]').first().text().trim();
        const bedrooms = parseInt(bedsText) || null;

        if (address && listingUrl.includes("view.com.au")) {
          listings.push({
            address,
            suburb,
            state,
            postcode: "",
            price,
            priceDisplay: priceText || "Contact agent",
            bedrooms,
            bathrooms: null,
            parking: null,
            propertyType: "house",
            listingUrl,
            photoUrl,
            landSize: null,
          });
        }
      } catch {
        // skip
      }
    });

    console.log(`[view] Scraped ${listings.length} listings`);
    return listings.slice(0, 8);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log("[view] Scrape failed:", msg);
    return [];
  }
}

/**
 * Tries Homely, then View.com.au. Returns empty array if both fail.
 */
export async function getRealListings(
  suburb: string,
  state: string,
  maxBudget: number,
  minBedrooms: number,
  propertyType: string
): Promise<HomelyListing[]> {
  const homelyResults = await scrapeHomelyListings(suburb, state, maxBudget, minBedrooms, propertyType);
  if (homelyResults.length > 0) {
    console.log(`[listings] Using ${homelyResults.length} Homely listings`);
    return homelyResults;
  }

  const viewResults = await scrapeViewListings(suburb, state, maxBudget, minBedrooms);
  if (viewResults.length > 0) {
    console.log(`[listings] Using ${viewResults.length} View.com.au listings`);
    return viewResults;
  }

  console.log("[listings] All scrapers returned 0 results — will use fallback addresses");
  return [];
}
