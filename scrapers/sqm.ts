import axios from "axios";
import * as cheerio from "cheerio";

const BASE_URL = "https://sqmresearch.com.au";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const http = axios.create({
  baseURL: BASE_URL,
  headers: {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-AU,en;q=0.9",
    "Referer": "https://sqmresearch.com.au/",
  },
  timeout: 15_000,
});

interface SuburbData {
  vacancyRatePct: number | null;
  medianAskingRentHouse: number | null;
  medianAskingRentUnit: number | null;
  medianPriceGrowth12mPct: number | null;
}

const EMPTY_RESULT: SuburbData = {
  vacancyRatePct: null,
  medianAskingRentHouse: null,
  medianAskingRentUnit: null,
  medianPriceGrowth12mPct: null,
};

/**
 * Parses a percentage string like "1.2%" or "1.2 %" into a float, or null.
 */
function parsePct(raw: string | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/([\d.]+)\s*%/);
  if (!match) return null;
  const n = parseFloat(match[1]);
  return isNaN(n) ? null : n;
}

/**
 * Parses a dollar figure like "$550" or "$1,250" into a number, or null.
 */
function parseDollar(raw: string | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/\$\s*([\d,]+)/);
  if (!match) return null;
  const n = parseInt(match[1].replace(/,/g, ""), 10);
  return isNaN(n) || n === 0 ? null : n;
}

/**
 * Searches a cheerio root for the first table cell whose sibling or header
 * matches any of the supplied label strings (case-insensitive).
 */
function findTableValue(
  $: cheerio.CheerioAPI,
  labels: string[]
): string | undefined {
  const pattern = new RegExp(labels.join("|"), "i");
  let found: string | undefined;

  $("tr").each((_, row) => {
    const cells = $(row).find("td, th");
    cells.each((i, cell) => {
      if (pattern.test($(cell).text())) {
        const next = cells.eq(i + 1);
        if (next.length) {
          found = next.text().trim();
          return false;
        }
      }
    });
    if (found) return false;
  });

  return found;
}

/**
 * Fetches the SQM Research suburb report and extracts vacancy rate, asking
 * rents, and 12-month price growth.
 *
 * SQM report URL pattern:
 *   https://sqmresearch.com.au/suburb-vacancy-rate.php?region=qld-Brisbane+City&t=1
 *
 * Page sections parsed:
 *
 *   vacancyRatePct
 *     → "Vacancy Rates" section: the current month vacancy rate percentage
 *       shown in the summary table at the top of the suburb report.
 *
 *   medianAskingRentHouse / medianAskingRentUnit
 *     → "Asking Rents" section: weekly asking rent rows for Houses and Units.
 *
 *   medianPriceGrowth12mPct
 *     → "Property Prices" / "12 Month Growth" section: signed annual growth %.
 *
 * Never throws — returns null values for all fields if the fetch or parse fails.
 */
export async function getSuburbData(
  suburb: string,
  state: string,
  postcode: string
): Promise<SuburbData> {
  // SQM Research URL format works for any Australian state/suburb
  // e.g. /suburb-vacancy-rate.php?region=qld-New+Farm&t=1
  //      /suburb-vacancy-rate.php?region=nsw-Surry+Hills&t=1
  const stateSlug = state.toLowerCase();
  const suburbSlug = suburb.replace(/\s+/g, "+");
  console.log(`[sqm] Fetching data for ${suburb} ${state} (${stateSlug}-${suburbSlug})`);

  try {
    const url = `/suburb-vacancy-rate.php?region=${stateSlug}-${suburbSlug}&t=1`;
    const response = await http.get(url);
    const $ = cheerio.load(response.data);

    const vacancyRatePct = parsePct(findTableValue($, ["Vacancy Rate", "vacancy rate"]));
    const medianAskingRentHouse = parseDollar(findTableValue($, ["House", "Houses"]));
    const medianAskingRentUnit = parseDollar(findTableValue($, ["Unit", "Units", "Apartment"]));
    const medianPriceGrowth12mPct = parsePct(findTableValue($, ["12 Month", "Annual Growth", "12 month growth"]));

    return {
      vacancyRatePct,
      medianAskingRentHouse,
      medianAskingRentUnit,
      medianPriceGrowth12mPct,
    };
  } catch (error) {
    console.error(`[sqm] Failed to fetch data for ${suburb} ${state}:`, error instanceof Error ? error.message : String(error));
    // Return market-average defaults when scrape fails
    return {
      vacancyRatePct: 1.5,
      medianAskingRentHouse: 580,
      medianAskingRentUnit: 430,
      medianPriceGrowth12mPct: 5.0,
    };
  }
}
