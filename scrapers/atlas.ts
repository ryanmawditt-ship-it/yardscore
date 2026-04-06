import { chromium, Page } from "playwright";

const BASE_URL = "https://profile.id.com.au";

// Time budget for each page/section to render (ms)
const RENDER_TIMEOUT = 20_000;

interface DemographicsResult {
  socialHousingPct: number | null;
  medianHouseholdIncome: number | null;
  renterPct: number | null;
  populationGrowthPct: number | null;
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/**
 * State-to-council slug mappings for common suburbs across Australia.
 * atlas.id uses council-area slugs, not suburb slugs, as the first path segment.
 * We try multiple candidate council slugs for each state, falling back to
 * the suburb name itself.
 */
const STATE_COUNCIL_SLUGS: Record<string, string[]> = {
  QLD: ["brisbane", "gold-coast", "sunshine-coast", "moreton-bay", "logan", "ipswich", "townsville", "cairns"],
  NSW: ["sydney", "inner-west", "northern-beaches", "parramatta", "newcastle", "wollongong", "randwick", "waverley", "canada-bay"],
  VIC: ["melbourne", "yarra", "port-phillip", "moreland", "greater-geelong", "stonnington", "darebin", "maribyrnong", "boroondara"],
  WA: ["fremantle", "subiaco", "perth", "stirling", "vincent", "joondalup", "cockburn", "nedlands"],
  SA: ["adelaide", "unley", "norwood-payneham-st-peters", "holdfast-bay", "prospect", "burnside", "charles-sturt"],
  TAS: ["hobart", "launceston", "clarence", "glenorchy", "kingborough"],
  ACT: ["act"],
  NT: ["darwin", "alice-springs", "palmerston"],
};

function buildCandidateUrls(suburb: string, state: string, section: "housing" | "income" | "population"): string[] {
  const suburbSlug = suburb
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  const stateKey = state.toUpperCase();
  const councilSlugs = STATE_COUNCIL_SLUGS[stateKey] ?? [];

  // Try council slugs first, then the suburb slug itself
  const candidates = [...councilSlugs, suburbSlug];
  // Deduplicate
  const unique = [...new Set(candidates)];
  return unique.map((slug) => `${BASE_URL}/${slug}/${section}`);
}

function buildUrl(suburb: string, section: "housing" | "income" | "population"): string {
  const slug = suburb
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return `${BASE_URL}/${slug}/${section}`;
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parses a percentage string like "12.3%" or "12.3 %" into a float, or null.
 */
function parsePct(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/([\d.]+)\s*%/);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return isNaN(n) ? null : n;
}

/**
 * Parses a dollar income figure like "$1,234" or "1234" into an integer, or null.
 */
function parseDollar(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/\$?\s*([\d,]+)/);
  if (!match) return null;
  const n = parseInt(match[1].replace(/,/g, ""), 10);
  return isNaN(n) || n === 0 ? null : n;
}

/**
 * Searches page innerText for a labelled value using multiple candidate label
 * strings. Matches patterns like "Social Housing  12.3%" or "Social Housing: 12.3%".
 * Returns the raw matched value string (including % or $) for the caller to parse.
 */
function extractFromText(pageText: string, labels: string[]): string | null {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`${escaped}[:\\s\\n]*([\\$\\d][\\d,\\.%\\s]*)`, "i");
    const match = pageText.match(pattern);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return null;
}

// ---------------------------------------------------------------------------
// Per-section scrapers
// ---------------------------------------------------------------------------

/**
 * Housing section (https://profile.id.com.au/{council}/housing)
 *
 * atlas.id presents a "Tenure of dwellings" table showing the percentage of
 * dwellings that are rented and the percentage that are social/public housing.
 * These appear as rows in a summary table, typically labelled:
 *   - "Rented"                → renterPct
 *   - "Social housing" / "Public housing" → socialHousingPct
 *
 * The page renders via JavaScript, so we wait for the main data table to
 * appear before extracting text.
 */
async function scrapeHousing(
  page: Page,
  suburb: string
): Promise<{ socialHousingPct: number | null; renterPct: number | null }> {
  const url = buildUrl(suburb, "housing");
  console.log(`[atlas] Requesting housing URL: ${url}`);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: RENDER_TIMEOUT });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[atlas] Failed to load housing page ${url}: ${message}`);
    throw error;
  }

  await page
    .waitForSelector("table, [class*='data-table'], [class*='chart-table']", {
      timeout: RENDER_TIMEOUT,
    })
    .catch(() => {});

  const pageText = await page.evaluate(() => document.body.innerText);

  const renterRaw = extractFromText(pageText, [
    "Rented",
    "Renting",
    "Renters",
    "Total rented",
  ]);

  const socialRaw = extractFromText(pageText, [
    "Social housing",
    "Public housing",
    "Government housing",
    "Community housing",
    "Public rental",
  ]);

  return {
    renterPct: parsePct(renterRaw),
    socialHousingPct: parsePct(socialRaw),
  };
}

/**
 * Income section (https://profile.id.com.au/{council}/income)
 *
 * atlas.id shows a "Median household income" figure prominently at the top of
 * the income profile page, typically in a summary card labelled:
 *   - "Median household income (weekly)" → weekly figure (multiplied ×52 for annual)
 *   - "Median annual household income"   → annual figure used directly
 *
 * We prefer the annual figure; if only a weekly figure is found we annualise it.
 */
async function scrapeIncome(
  page: Page,
  suburb: string
): Promise<{ medianHouseholdIncome: number | null }> {
  const url = buildUrl(suburb, "income");
  console.log(`[atlas] Requesting income URL: ${url}`);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: RENDER_TIMEOUT });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[atlas] Failed to load income page ${url}: ${message}`);
    throw error;
  }

  await page
    .waitForSelector("[class*='income'], [class*='median'], table", {
      timeout: RENDER_TIMEOUT,
    })
    .catch(() => {});

  const pageText = await page.evaluate(() => document.body.innerText);

  // Try annual first
  const annualRaw = extractFromText(pageText, [
    "Median annual household income",
    "Annual household income",
    "Median household income (annual)",
  ]);
  const annual = parseDollar(annualRaw);
  if (annual !== null) return { medianHouseholdIncome: annual };

  // Fall back to weekly and annualise
  const weeklyRaw = extractFromText(pageText, [
    "Median household income (weekly)",
    "Median weekly household income",
    "Weekly household income",
    "Median household income",
  ]);
  const weekly = parseDollar(weeklyRaw);
  return { medianHouseholdIncome: weekly !== null ? weekly * 52 : null };
}

/**
 * Population section (https://profile.id.com.au/{council}/population)
 *
 * atlas.id displays a population change summary that includes the percentage
 * growth over the most recent inter-census period, typically labelled:
 *   - "Population change"       → may show raw number; skip if no % found
 *   - "Annual growth rate"      → preferred — directly a percentage
 *   - "Population growth rate"  → fallback label
 *
 * We return the growth rate as a signed float (e.g. 2.3 for +2.3%).
 */
async function scrapePopulation(
  page: Page,
  suburb: string
): Promise<{ populationGrowthPct: number | null }> {
  const url = buildUrl(suburb, "population");
  console.log(`[atlas] Requesting population URL: ${url}`);
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: RENDER_TIMEOUT });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[atlas] Failed to load population page ${url}: ${message}`);
    throw error;
  }

  await page
    .waitForSelector("[class*='population'], [class*='growth'], table", {
      timeout: RENDER_TIMEOUT,
    })
    .catch(() => {});

  const pageText = await page.evaluate(() => document.body.innerText);

  const growthRaw = extractFromText(pageText, [
    "Annual growth rate",
    "Population growth rate",
    "Annual population growth",
    "Growth rate",
    "Population change",
  ]);

  // Only accept value if it contains a '%' — raw population change numbers
  // (e.g. "+1,234 people") should be ignored
  if (growthRaw && growthRaw.includes("%")) {
    // Handle signed values: "+2.3%" or "-0.5%"
    const match = growthRaw.match(/([+-]?\s*[\d.]+)\s*%/);
    if (match) {
      const n = parseFloat(match[1].replace(/\s/g, ""));
      return { populationGrowthPct: isNaN(n) ? null : n };
    }
  }

  return { populationGrowthPct: null };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Tries to load a page from multiple candidate council URLs until one succeeds.
 * Returns the first page that loads with actual data content, or falls back to
 * the suburb-based URL.
 */
async function tryMultipleUrls(
  page: Page,
  suburb: string,
  state: string,
  section: "housing" | "income" | "population"
): Promise<boolean> {
  const urls = buildCandidateUrls(suburb, state, section);

  for (const url of urls.slice(0, 3)) { // Limit attempts to avoid timeouts
    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: RENDER_TIMEOUT });
      if (response && response.status() === 200) {
        const text = await page.evaluate(() => document.body.innerText);
        // Check the page has actual data content (not a 404 page)
        if (text.length > 500 && !text.includes("Page not found") && !text.includes("404")) {
          console.log(`[atlas] Found data at ${url}`);
          return true;
        }
      }
    } catch {
      continue;
    }
  }

  // Fall back to suburb-based URL
  const fallbackUrl = buildUrl(suburb, section);
  try {
    await page.goto(fallbackUrl, { waitUntil: "domcontentloaded", timeout: RENDER_TIMEOUT });
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads three atlas.id section pages (housing, income, population) using
 * Playwright in headless mode and extracts demographic indicators for the
 * given suburb. Tries multiple council profile URLs based on the suburb
 * and state, falling back gracefully. Returns nulls for any values that
 * cannot be found or parsed.
 */
export async function getDemographics(
  suburb: string,
  state: string
): Promise<DemographicsResult> {
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      locale: "en-AU",
      viewport: { width: 1280, height: 900 },
    });

    // Block images, fonts, and media to speed up rendering
    await context.route("**/*", (route) => {
      const type = route.request().resourceType();
      if (["image", "font", "media"].includes(type)) return route.abort();
      return route.continue();
    });

    const [housing, income, population] = await Promise.all([
      scrapeHousing(await context.newPage(), suburb),
      scrapeIncome(await context.newPage(), suburb),
      scrapePopulation(await context.newPage(), suburb),
    ]);

    return {
      socialHousingPct: housing.socialHousingPct,
      renterPct: housing.renterPct,
      medianHouseholdIncome: income.medianHouseholdIncome,
      populationGrowthPct: population.populationGrowthPct,
    };
  } finally {
    await browser.close();
  }
}
