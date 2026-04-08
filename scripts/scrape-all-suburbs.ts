/**
 * Scrapes AllHomes for EVERY suburb with active listings in Australia.
 * Uses the AllHomes search by region/LGA to discover all suburbs.
 *
 * Strategy:
 * 1. Hit AllHomes LGA/region browse pages to discover suburb URLs
 * 2. Scrape each suburb's listing page for price data
 * 3. Output to /data/suburb-prices.json (replaces existing)
 *
 * Run: npx tsx scripts/scrape-all-suburbs.ts
 * Expected runtime: 30-60 minutes for ~2000 suburbs at 1.5s rate limit
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html",
  "Accept-Language": "en-AU",
  Referer: "https://www.allhomes.com.au/",
};

interface SuburbEntry {
  suburb: string;
  state: string;
  postcode: string;
}

interface SuburbPriceData {
  suburb: string;
  state: string;
  postcode: string;
  totalListings: number;
  pricedListings: number;
  cheapest: number | null;
  mostExpensive: number | null;
  median: number | null;
  prices: number[];
  scrapedAt: string;
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// ── Step 1: Discover suburbs from AllHomes region pages ──

const REGION_URLS: Record<string, string[]> = {
  QLD: [
    "https://www.allhomes.com.au/browse-sale/qld/",
    "https://www.allhomes.com.au/browse-sale/brisbane-city-qld/",
    "https://www.allhomes.com.au/browse-sale/moreton-bay-qld/",
    "https://www.allhomes.com.au/browse-sale/logan-city-qld/",
    "https://www.allhomes.com.au/browse-sale/ipswich-city-qld/",
    "https://www.allhomes.com.au/browse-sale/gold-coast-city-qld/",
    "https://www.allhomes.com.au/browse-sale/sunshine-coast-qld/",
    "https://www.allhomes.com.au/browse-sale/redland-city-qld/",
    "https://www.allhomes.com.au/browse-sale/somerset-qld/",
    "https://www.allhomes.com.au/browse-sale/scenic-rim-qld/",
    "https://www.allhomes.com.au/browse-sale/toowoomba-qld/",
    "https://www.allhomes.com.au/browse-sale/fraser-coast-qld/",
    "https://www.allhomes.com.au/browse-sale/bundaberg-qld/",
    "https://www.allhomes.com.au/browse-sale/gladstone-qld/",
    "https://www.allhomes.com.au/browse-sale/rockhampton-qld/",
    "https://www.allhomes.com.au/browse-sale/mackay-qld/",
    "https://www.allhomes.com.au/browse-sale/townsville-city-qld/",
    "https://www.allhomes.com.au/browse-sale/cairns-qld/",
  ],
  NSW: [
    "https://www.allhomes.com.au/browse-sale/nsw/",
    "https://www.allhomes.com.au/browse-sale/sydney-nsw/",
    "https://www.allhomes.com.au/browse-sale/newcastle-nsw/",
    "https://www.allhomes.com.au/browse-sale/wollongong-nsw/",
    "https://www.allhomes.com.au/browse-sale/central-coast-nsw/",
    "https://www.allhomes.com.au/browse-sale/western-sydney-nsw/",
    "https://www.allhomes.com.au/browse-sale/hunter-valley-nsw/",
    "https://www.allhomes.com.au/browse-sale/illawarra-nsw/",
    "https://www.allhomes.com.au/browse-sale/blue-mountains-nsw/",
    "https://www.allhomes.com.au/browse-sale/southern-highlands-nsw/",
  ],
  VIC: [
    "https://www.allhomes.com.au/browse-sale/vic/",
    "https://www.allhomes.com.au/browse-sale/melbourne-vic/",
    "https://www.allhomes.com.au/browse-sale/geelong-vic/",
    "https://www.allhomes.com.au/browse-sale/ballarat-vic/",
    "https://www.allhomes.com.au/browse-sale/bendigo-vic/",
    "https://www.allhomes.com.au/browse-sale/mornington-peninsula-vic/",
    "https://www.allhomes.com.au/browse-sale/gippsland-vic/",
  ],
  WA: [
    "https://www.allhomes.com.au/browse-sale/wa/",
    "https://www.allhomes.com.au/browse-sale/perth-wa/",
    "https://www.allhomes.com.au/browse-sale/mandurah-wa/",
    "https://www.allhomes.com.au/browse-sale/bunbury-wa/",
  ],
  SA: [
    "https://www.allhomes.com.au/browse-sale/sa/",
    "https://www.allhomes.com.au/browse-sale/adelaide-sa/",
  ],
  TAS: [
    "https://www.allhomes.com.au/browse-sale/tas/",
    "https://www.allhomes.com.au/browse-sale/hobart-tas/",
    "https://www.allhomes.com.au/browse-sale/launceston-tas/",
  ],
  ACT: [
    "https://www.allhomes.com.au/browse-sale/act/",
  ],
  NT: [
    "https://www.allhomes.com.au/browse-sale/nt/",
    "https://www.allhomes.com.au/browse-sale/darwin-nt/",
  ],
};

async function discoverSuburbs(): Promise<SuburbEntry[]> {
  const seen = new Set<string>();
  const suburbs: SuburbEntry[] = [];

  const stateFromPostcode = (pc: string): string => {
    const n = parseInt(pc);
    if (n >= 800 && n <= 899) return "NT";
    if (n >= 900 && n <= 999) return "NT";
    if (n >= 200 && n <= 299) return "ACT";
    if (n >= 2600 && n <= 2620) return "ACT";
    if (n >= 2900 && n <= 2920) return "ACT";
    if (n >= 1000 && n <= 2599) return "NSW";
    if (n >= 2621 && n <= 2899) return "NSW";
    if (n >= 2921 && n <= 2999) return "NSW";
    if (n >= 3000 && n <= 3999) return "VIC";
    if (n >= 4000 && n <= 4999) return "QLD";
    if (n >= 5000 && n <= 5799) return "SA";
    if (n >= 6000 && n <= 6797) return "WA";
    if (n >= 7000 && n <= 7799) return "TAS";
    return "NSW"; // fallback
  };

  for (const [state, urls] of Object.entries(REGION_URLS)) {
    for (const url of urls) {
      try {
        const r = await axios.get(url, { timeout: 15_000, headers: HEADERS });
        const $ = cheerio.load(r.data);

        // Find suburb links: /sale/suburb-name-state-postcode/
        $('a[href*="/sale/"]').each((_, el) => {
          const href = $(el).attr("href") || "";
          const match = href.match(/\/sale\/(.+)-(qld|nsw|vic|wa|sa|tas|act|nt)-(\d{3,4})\//i);
          if (match) {
            const name = match[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            const pc = match[3].padStart(4, "0");
            const actualState = stateFromPostcode(pc);
            const key = `${name}:${pc}`;
            if (!seen.has(key)) {
              seen.add(key);
              suburbs.push({ suburb: name, state: actualState, postcode: pc });
            }
          }
        });

        // Also find links in /browse-sale/ subpages
        $('a[href*="/browse-sale/"]').each((_, el) => {
          const href = $(el).attr("href") || "";
          // These are region links — we'll follow them later if needed
        });

        await delay(1000);
      } catch {
        // Skip failed pages
      }
    }
    console.log(`[discover] ${state}: ${suburbs.filter((s) => s.state === state).length} suburbs found so far`);
  }

  // Also add our existing 127 suburbs to ensure coverage
  try {
    const existing = JSON.parse(readFileSync(join(process.cwd(), "data", "suburb-prices.json"), "utf-8"));
    for (const s of existing.suburbs) {
      const key = `${s.suburb}:${s.postcode}`;
      if (!seen.has(key)) {
        seen.add(key);
        suburbs.push({ suburb: s.suburb, state: s.state, postcode: s.postcode });
      }
    }
    console.log(`[discover] Added ${existing.suburbs.length} existing suburbs`);
  } catch {}

  return suburbs;
}

// ── Step 2: Scrape prices for each suburb ──

async function scrapeSuburbPrices(suburb: string, state: string, postcode: string): Promise<SuburbPriceData> {
  const slug = suburb.toLowerCase().replace(/\s+/g, "-");
  const stateSlug = state.toLowerCase();
  const url = `https://www.allhomes.com.au/sale/${slug}-${stateSlug}-${postcode}/`;

  try {
    const r = await axios.get(url, { timeout: 12_000, headers: HEADERS });
    const $ = cheerio.load(r.data);
    const bodyText = $("body").text().replace(/\n/g, "");

    const priceRegex = /\$\s*(\d{1,3}(?:,\d{3}){1,2})/g;
    const allPrices: number[] = [];
    let match;
    while ((match = priceRegex.exec(bodyText)) !== null) {
      const p = parseInt(match[1].replace(/,/g, ""), 10);
      if (p >= 50_000 && p <= 15_000_000) allPrices.push(p);
    }

    const unique = Array.from(new Set(allPrices)).sort((a, b) => a - b);
    const title = $("title").text();
    const countMatch = title.match(/(\d+)\s*propert/i);
    const totalListings = countMatch ? parseInt(countMatch[1], 10) : 0;
    const median = unique.length > 0 ? unique[Math.floor(unique.length / 2)] : null;

    return {
      suburb, state, postcode, totalListings,
      pricedListings: unique.length,
      cheapest: unique[0] ?? null,
      mostExpensive: unique[unique.length - 1] ?? null,
      median, prices: unique,
      scrapedAt: new Date().toISOString(),
    };
  } catch {
    return {
      suburb, state, postcode, totalListings: 0, pricedListings: 0,
      cheapest: null, mostExpensive: null, median: null, prices: [],
      scrapedAt: new Date().toISOString(),
    };
  }
}

// ── Main ──

async function main() {
  console.log("=== FULL AUSTRALIAN SUBURB PRICE SCRAPE ===\n");
  console.log("Step 1: Discovering suburbs from AllHomes region pages...\n");

  const suburbs = await discoverSuburbs();
  console.log(`\nTotal suburbs to scrape: ${suburbs.length}\n`);
  console.log(`Estimated time: ${Math.ceil(suburbs.length * 1.5 / 60)} minutes\n`);

  console.log("Step 2: Scraping prices...\n");

  const results: SuburbPriceData[] = [];
  let withData = 0;
  let noData = 0;
  const startTime = Date.now();

  for (let i = 0; i < suburbs.length; i++) {
    const s = suburbs[i];
    const data = await scrapeSuburbPrices(s.suburb, s.state, s.postcode);
    results.push(data);

    if (data.pricedListings > 0) {
      withData++;
      if (i % 50 === 0 || data.pricedListings >= 10) {
        console.log(`[${i + 1}/${suburbs.length}] ${s.suburb} ${s.state}: ${data.totalListings} listed, median $${data.median?.toLocaleString() ?? "N/A"}`);
      }
    } else {
      noData++;
    }

    // Progress every 100
    if ((i + 1) % 100 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = (i + 1) / elapsed;
      const remaining = Math.ceil((suburbs.length - i - 1) / rate / 60);
      console.log(`--- Progress: ${i + 1}/${suburbs.length} (${withData} with data, ${noData} empty) ~${remaining}min remaining ---`);
    }

    if (i < suburbs.length - 1) await delay(1200);
  }

  // Write output
  const outDir = join(process.cwd(), "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "suburb-prices.json");

  const output = {
    generatedAt: new Date().toISOString(),
    totalSuburbs: results.length,
    withPriceData: withData,
    withoutPriceData: noData,
    suburbs: results.filter((r) => r.pricedListings > 0).sort((a, b) => {
      if (a.state !== b.state) return a.state.localeCompare(b.state);
      return (a.median ?? 0) - (b.median ?? 0);
    }),
  };

  writeFileSync(outPath, JSON.stringify(output, null, 2));

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n✓ Done in ${Math.floor(elapsed / 60)}m ${elapsed % 60}s`);
  console.log(`✓ ${output.suburbs.length} suburbs with data written to ${outPath}`);
  console.log(`✓ ${noData} suburbs had no listings`);

  // Summary
  const byState: Record<string, number> = {};
  for (const s of output.suburbs) {
    byState[s.state] = (byState[s.state] ?? 0) + 1;
  }
  console.log("\nBy state:", Object.entries(byState).sort().map(([s, c]) => `${s}: ${c}`).join(" | "));
}

main().catch(console.error);
