import axios from "axios";
import * as cheerio from "cheerio";
import { PropertyAnalysis } from "@/types";

const BASE_URL = "https://www.onthehouse.com.au";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-AU,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
  },
  timeout: 30_000,
});

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Converts an address string into the slug format OnTheHouse uses in URLs.
 * e.g. "12 Smith St, Brisbane QLD 4000" → "12-smith-st-brisbane-qld-4000"
 */
function addressToSlug(address: string): string {
  return address
    .toLowerCase()
    .replace(/[,]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Converts a suburb name to a lowercase hyphenated slug.
 * e.g. "Brisbane City" → "brisbane-city"
 */
function suburbToSlug(suburb: string): string {
  return suburb
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * Parses a price string like "$1,250,000" or "1250000" into a number, or null.
 */
function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9]/g, "");
  const n = parseInt(cleaned, 10);
  return isNaN(n) || n === 0 ? null : n;
}

/**
 * Parses a numeric string like "652 m²" or "3" into a number, or null.
 */
function parseNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/[\d,]+/);
  if (!match) return null;
  const n = parseInt(match[0].replace(/,/g, ""), 10);
  return isNaN(n) ? null : n;
}

/**
 * Normalises a date string to ISO yyyy-mm-dd, or returns null.
 */
function parseDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const d = new Date(raw.trim());
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// 1. Property details
// ---------------------------------------------------------------------------

/**
 * Fetches property details and sale history from OnTheHouse for a given address.
 * Returns a partial PropertyAnalysis with whatever data is available.
 * Never throws — returns safe empty defaults on any failure.
 */
export async function scrapePropertyDetails(
  address: string
): Promise<Partial<PropertyAnalysis>> {
  const EMPTY: Partial<PropertyAnalysis> = {
    address,
    priceHistory: [],
    comparables: [],
    trendSummary: "",
  };

  const slug = addressToSlug(address);

  /** Attempts a GET request, retrying once on timeout before giving up. */
  async function fetchWithRetry(path: string, label: string): Promise<string | null> {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[onthehouse] ${label} attempt ${attempt}: ${BASE_URL}${path}`);
        const res = await http.get(path, { timeout: 30_000 });
        return res.data as string;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[onthehouse] ${label} attempt ${attempt} failed: ${message}`);
        // Log response body if available (e.g. 403/404 with HTML body)
        const axiosErr = error as { response?: { status?: number; data?: unknown } };
        if (axiosErr.response) {
          console.error(`[onthehouse] HTTP ${axiosErr.response.status} response body (first 1000 chars):`,
            String(axiosErr.response.data ?? "").slice(0, 1000));
        }
        if (attempt === 2) return null;
        await delay(1_000);
      }
    }
    return null;
  }

  let html: string;
  const directHtml = await fetchWithRetry(`/property/${slug}`, "property page");
  if (directHtml) {
    html = directHtml;
    // Log a snippet so we can see if the page has useful content or a redirect/block
    console.log(`[onthehouse] property page HTML snippet (first 500 chars):`, html.slice(0, 500));
  } else {
    const searchHtml = await fetchWithRetry(
      `/search?q=${encodeURIComponent(address)}&type=property`,
      "search fallback"
    );
    if (!searchHtml) {
      console.error("[onthehouse] Both attempts failed. Returning empty result.");
      return EMPTY;
    }
    html = searchHtml;
    console.log(`[onthehouse] search fallback HTML snippet (first 500 chars):`, html.slice(0, 500));
  }

  try {
    const $ = cheerio.load(html);

    // --- Core attributes ---
    const lastSalePrice = parsePrice(
      $("[data-testid='last-sale-price'], .last-sale-price, .sold-price").first().text()
    );

    const lastSaleDate = parseDate(
      $("[data-testid='last-sale-date'], .last-sale-date, .sold-date").first().text()
    );

    const landSize = parseNumber(
      $("[data-testid='land-size'], .land-size, [class*='landSize']").first().text()
    );

    const bedrooms = parseNumber(
      $("[data-testid='bedrooms'], [class*='bedrooms'], [aria-label='Bedrooms']").first().text()
    );

    const bathrooms = parseNumber(
      $("[data-testid='bathrooms'], [class*='bathrooms'], [aria-label='Bathrooms']").first().text()
    );

    const yearBuilt = parseNumber(
      $("[data-testid='year-built'], .year-built, [class*='yearBuilt']").first().text()
    );

    // --- Price history ---
    const priceHistory: { date: string; price: number }[] = [];

    $(
      "[data-testid='price-history'] tr, .price-history__row, .sales-history tr"
    ).each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length < 2) return;

      const date = parseDate($(cells[0]).text());
      const price = parsePrice($(cells[1]).text());

      if (date && price) {
        priceHistory.push({ date, price });
      }
    });

    // Log if we found nothing — helps diagnose selector mismatches
    if (!lastSalePrice && !bedrooms && priceHistory.length === 0) {
      console.warn("[onthehouse] Parsed page but found no data — selectors may not match. HTML snippet:");
      console.warn(html.slice(0, 2000));
    }

    // Assemble result — only include defined keys
    const result: Partial<PropertyAnalysis> = {
      address,
      priceHistory,
      comparables: [],
      trendSummary: "",
    };

    if (lastSalePrice !== null) result.lastSalePrice = lastSalePrice;
    if (lastSaleDate !== null) result.lastSaleDate = lastSaleDate;
    if (landSize !== null) result.landSize = landSize;
    if (bedrooms !== null) result.bedrooms = bedrooms;
    if (bathrooms !== null) result.bathrooms = bathrooms;
    if (yearBuilt !== null) result.yearBuilt = yearBuilt;

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[onthehouse] Failed to parse property page for "${address}": ${message}. Returning empty result.`);
    return EMPTY;
  }
}

// ---------------------------------------------------------------------------
// 2. Comparable sales — realestate.com.au sold listings
// ---------------------------------------------------------------------------

export interface ComparableSale {
  address: string;
  price: number;
  date: string;
  bedrooms: number | null;
}

/**
 * Scrapes sold property listings for a suburb from two sources in sequence:
 *   1. homely.com.au  — small portal, no Kasada, embeds __NEXT_DATA__ JSON
 *   2. onthehouse.com.au suburb sold page — fallback
 *
 * realestate.com.au returns 429 (Kasada) and domain.com.au sold pages time out,
 * so neither is used here.
 *
 * Returns up to 10 results. Never throws — returns empty array on any failure.
 */
export async function scrapeComparableSales(
  suburb: string,
  state: string,
  postcode: string
): Promise<ComparableSale[]> {
  // --- Attempt 1: homely.com.au ---
  const homelyResults = await scrapeHomelyComparables(suburb, state, postcode);
  if (homelyResults.length > 0) return homelyResults;

  // --- Attempt 2: onthehouse.com.au suburb sold page ---
  const othResults = await scrapeOnTheHouseSuburbSold(suburb, state, postcode);
  return othResults;
}

const SCRAPE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-AU,en;q=0.9",
};

async function scrapeHomelyComparables(
  suburb: string,
  state: string,
  postcode: string
): Promise<ComparableSale[]> {
  // homely.com.au sold URL: /real-estate/new-farm-qld-4005/sold
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
  const stateSlug = state.toLowerCase();
  const url = `https://www.homely.com.au/real-estate/${suburbSlug}-${stateSlug}-${postcode}/sold`;

  console.log(`[homely] Scraping __NEXT_DATA__ from: ${url}`);

  let html: string;
  try {
    const response = await axios.get(url, {
      headers: { ...SCRAPE_HEADERS, Referer: "https://www.homely.com.au/" },
      timeout: 20_000,
    });
    html = response.data as string;
    console.log(`[homely] Got response, HTML length: ${html.length}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[homely] Request failed: ${message}`);
    const axiosErr = error as { response?: { status?: number; data?: unknown } };
    if (axiosErr.response) {
      console.error(
        `[homely] HTTP ${axiosErr.response.status} body (first 500 chars):`,
        String(axiosErr.response.data ?? "").slice(0, 500)
      );
    }
    return [];
  }

  try {
    const $ = cheerio.load(html);

    // Try __NEXT_DATA__ first
    const nextDataRaw = $("script#__NEXT_DATA__").html();
    if (nextDataRaw) {
      console.log(`[homely] Found __NEXT_DATA__, length: ${nextDataRaw.length}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextData: any = JSON.parse(nextDataRaw);
      const topKeys = Object.keys(nextData?.props?.pageProps ?? {});
      console.log(`[homely] pageProps keys: ${topKeys.join(", ")}`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listings: any[] =
        nextData?.props?.pageProps?.listings ??
        nextData?.props?.pageProps?.soldListings ??
        nextData?.props?.pageProps?.properties ??
        nextData?.props?.pageProps?.results ??
        nextData?.props?.pageProps?.data?.listings ??
        [];

      if (listings.length > 0) {
        console.log(`[homely] Found ${listings.length} listings in __NEXT_DATA__`);
        const results: ComparableSale[] = [];

        for (const item of listings) {
          if (results.length >= 10) break;
          const listing = item?.listing ?? item;

          const addressText: string =
            listing?.address?.displayAddress ??
            listing?.address ??
            listing?.streetAddress ??
            "";

          let price: number | null = null;
          const priceStr: string = listing?.soldPrice ?? listing?.price?.display ?? listing?.displayPrice ?? "";
          if (typeof priceStr === "number") {
            price = priceStr;
          } else {
            const m = String(priceStr).match(/\$\s*([\d,]+)/);
            if (m) price = parseInt(m[1].replace(/,/g, ""), 10);
          }
          if (!price && typeof listing?.price === "number") price = listing.price;

          const rawDate: string = listing?.soldDate ?? listing?.dateSold ?? "";
          const date = parseDate(rawDate) ?? rawDate.slice(0, 10);

          const bedrooms: number | null =
            typeof listing?.bedrooms === "number" ? listing.bedrooms :
            parseNumber(String(listing?.features?.bedrooms ?? ""));

          if (addressText && price && price > 100_000) {
            results.push({ address: addressText, price, date, bedrooms });
          }
        }

        console.log(`[homely] Extracted ${results.length} comparables from __NEXT_DATA__`);
        if (results.length > 0) return results;
      } else {
        const pagePropsJson = JSON.stringify(nextData?.props?.pageProps ?? {});
        console.warn("[homely] No listings found in __NEXT_DATA__. pageProps (first 2000 chars):");
        console.warn(pagePropsJson.slice(0, 2000));
      }
    } else {
      console.warn("[homely] No __NEXT_DATA__ found. Trying cheerio selectors.");
    }

    // Fallback: try cheerio card selectors
    const results: ComparableSale[] = [];
    $("[class*='listing'], [class*='property-card'], article").each((_, card) => {
      if (results.length >= 10) return false;
      const el = $(card);

      const addressText = el.find("[class*='address'], h2, h3").first().text().trim();
      const priceText = el.find("[class*='price']").first().text().trim();
      const priceMatch = priceText.match(/\$\s*([\d,]+)/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ""), 10) : null;
      const bedText = el.find("[class*='bed'], [aria-label*='bed']").first().text().trim();
      const bedrooms = parseNumber(bedText);

      if (addressText && price && price > 100_000) {
        results.push({ address: addressText, price, date: "", bedrooms });
      }
    });

    console.log(`[homely] Extracted ${results.length} comparables via cheerio selectors`);
    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[homely] Parse failed: ${message}`);
    return [];
  }
}

async function scrapeOnTheHouseSuburbSold(
  suburb: string,
  state: string,
  postcode: string
): Promise<ComparableSale[]> {
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
  const stateSlug = state.toLowerCase();
  const url = `https://www.onthehouse.com.au/real-estate/${stateSlug}/${suburbSlug}-${postcode}/sold/`;

  console.log(`[oth-sold] Scraping suburb sold page: ${url}`);

  let html: string;
  try {
    const response = await axios.get(url, {
      headers: { ...SCRAPE_HEADERS, Referer: "https://www.onthehouse.com.au/" },
      timeout: 20_000,
    });
    html = response.data as string;
    console.log(`[oth-sold] Got response, HTML length: ${html.length}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[oth-sold] Request failed: ${message}`);
    return [];
  }

  try {
    const $ = cheerio.load(html);

    // OTH is a Next.js app — try __NEXT_DATA__ first (most reliable)
    const nextDataRaw = $("script#__NEXT_DATA__").html();
    if (nextDataRaw) {
      console.log(`[oth-sold] Found __NEXT_DATA__, length: ${nextDataRaw.length}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextData: any = JSON.parse(nextDataRaw);
      const topKeys = Object.keys(nextData?.props?.pageProps ?? {});
      console.log(`[oth-sold] pageProps keys: ${topKeys.join(", ")}`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listings: any[] =
        nextData?.props?.pageProps?.listings ??
        nextData?.props?.pageProps?.properties ??
        nextData?.props?.pageProps?.results?.listings ??
        nextData?.props?.pageProps?.data?.listings ??
        nextData?.props?.pageProps?.searchResults ??
        [];

      if (listings.length > 0) {
        console.log(`[oth-sold] Found ${listings.length} listings in __NEXT_DATA__`);
        const results: ComparableSale[] = [];

        for (const item of listings) {
          if (results.length >= 10) break;
          const listing = item?.listing ?? item?.property ?? item;

          const addressText: string =
            listing?.address?.displayAddress ??
            listing?.address?.fullAddress ??
            listing?.address?.streetAddress ??
            listing?.displayAddress ??
            "";

          let price: number | null = null;
          if (typeof listing?.soldPrice === "number") {
            price = listing.soldPrice;
          } else if (typeof listing?.price === "number") {
            price = listing.price;
          } else {
            const priceStr: string =
              listing?.soldPrice ??
              listing?.price?.display ??
              listing?.displayPrice ??
              "";
            const m = String(priceStr).match(/\$\s*([\d,]+)/);
            if (m) price = parseInt(m[1].replace(/,/g, ""), 10);
          }

          const rawDate: string =
            listing?.dateSold ?? listing?.soldDate ?? listing?.lastSaleDate ?? "";
          const date = parseDate(rawDate) ?? rawDate.slice(0, 10);

          const bedrooms: number | null =
            typeof listing?.bedrooms === "number" ? listing.bedrooms :
            typeof listing?.features?.bedrooms === "number" ? listing.features.bedrooms :
            parseNumber(String(listing?.bedrooms ?? ""));

          if (addressText && price && price > 100_000) {
            results.push({ address: addressText, price, date, bedrooms });
          }
        }

        console.log(`[oth-sold] Extracted ${results.length} comparables from __NEXT_DATA__`);
        if (results.length > 0) return results;
      } else {
        const pagePropsJson = JSON.stringify(nextData?.props?.pageProps ?? {});
        console.warn("[oth-sold] No listings in __NEXT_DATA__. pageProps (first 3000 chars):");
        console.warn(pagePropsJson.slice(0, 3000));
      }
    } else {
      console.warn("[oth-sold] No __NEXT_DATA__ found");
    }

    // Fallback: cheerio selectors
    const results: ComparableSale[] = [];
    $("[data-testid='listing-card'], [class*='listing-card'], [class*='ListingCard'], article").each(
      (_, card) => {
        if (results.length >= 10) return false;
        const el = $(card);

        const addressText = el
          .find("[data-testid='address'], [class*='address'], [class*='Address']")
          .first().text().trim();
        const priceText = el
          .find("[data-testid='price'], [class*='price'], [class*='Price']")
          .first().text().trim();
        const priceMatch = priceText.match(/\$\s*([\d,]+)/);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, ""), 10) : null;
        const dateText = el.find("[class*='date'], [class*='Date'], time").first().text().trim();
        const date = parseDate(dateText) ?? "";
        const bedrooms = parseNumber(el.find("[aria-label*='bed'], [class*='bed']").first().text().trim());

        if (addressText && price && price > 100_000) {
          results.push({ address: addressText, price, date, bedrooms });
        }
      }
    );

    console.log(`[oth-sold] Extracted ${results.length} comparables via cheerio`);
    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[oth-sold] Parse failed: ${message}`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// 3. Rental listings
// ---------------------------------------------------------------------------

/**
 * Fetches rental listings from domain.com.au for a suburb using the path format:
 *   https://www.domain.com.au/rent/brisbane-city-qld-4000/
 *
 * Returns up to 10 weekly rent figures from active listings.
 * Never throws — returns an empty array on any failure.
 */
export async function scrapeRentalListings(
  suburb: string,
  bedrooms: number
): Promise<{ weeklyRent: number }[]> {
  await delay(1_000);

  const suburbSlug = suburbToSlug(suburb);
  const domainBase = "https://www.domain.com.au";
  const rentPath = `/rent/${suburbSlug}-qld/`;
  const rentUrl = `${domainBase}${rentPath}`;
  console.log(`[domain] Requesting rental listings URL: ${rentUrl}`);

  const domainHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-AU,en;q=0.9",
  };

  let response;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`[domain] Rental listings attempt ${attempt}: ${rentUrl}`);
      response = await axios.get(rentUrl, { headers: domainHeaders, timeout: 30_000 });
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[domain] Rental listings attempt ${attempt} failed: ${message}`);
      if (attempt === 2) {
        console.error("[domain] Both attempts failed. Returning empty result.");
        return [];
      }
      await delay(1_000);
    }
  }
  if (!response) return [];

  try {
    const $ = cheerio.load(response.data as string);
    const results: { weeklyRent: number }[] = [];

    $(
      "[data-testid='listing-card-price'], " +
      "[class*='price'], " +
      "[class*='Price'], " +
      ".listing-price, " +
      "[data-testid='price']"
    ).each((_, el) => {
      if (results.length >= 10) return false;

      const text = $(el).text().trim();
      const match = text.match(/\$\s*([\d,]+)\s*(?:per\s*week|\/\s*w(?:eek|k)?|pw)/i);
      if (!match) return;

      const rent = parseInt(match[1].replace(/,/g, ""), 10);
      if (!isNaN(rent) && rent > 0) {
        results.push({ weeklyRent: rent });
      }
    });

    return results;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[domain] Failed to parse rental listings from ${rentUrl}: ${message}. Returning empty result.`);
    return [];
  }
}
