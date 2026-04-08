/**
 * Scrapes AllHomes for real market prices across key Australian suburbs.
 * Outputs to /data/suburb-prices.json for use by the pipeline.
 *
 * Run: npx tsx scripts/scrape-suburb-prices.ts
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html",
  "Accept-Language": "en-AU",
  Referer: "https://www.allhomes.com.au/",
};

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

// Key suburbs by state — handbook + intelligence + top investment suburbs
const SUBURBS: { suburb: string; state: string; postcode: string }[] = [
  // QLD — already verified + new additions
  { suburb: "Bundaberg", state: "QLD", postcode: "4670" },
  { suburb: "Rockhampton", state: "QLD", postcode: "4700" },
  { suburb: "Toowoomba", state: "QLD", postcode: "4350" },
  { suburb: "Caboolture", state: "QLD", postcode: "4510" },
  { suburb: "Morayfield", state: "QLD", postcode: "4506" },
  { suburb: "Goodna", state: "QLD", postcode: "4300" },
  { suburb: "Deception Bay", state: "QLD", postcode: "4508" },
  { suburb: "Kallangur", state: "QLD", postcode: "4503" },
  { suburb: "Caboolture South", state: "QLD", postcode: "4510" },
  { suburb: "Eagleby", state: "QLD", postcode: "4207" },
  { suburb: "Southport", state: "QLD", postcode: "4215" },
  { suburb: "Redcliffe", state: "QLD", postcode: "4020" },
  { suburb: "North Lakes", state: "QLD", postcode: "4509" },
  { suburb: "Chermside", state: "QLD", postcode: "4032" },
  { suburb: "Nundah", state: "QLD", postcode: "4012" },
  { suburb: "Ripley", state: "QLD", postcode: "4306" },
  { suburb: "Narangba", state: "QLD", postcode: "4504" },
  { suburb: "Ipswich", state: "QLD", postcode: "4305" },
  { suburb: "Beenleigh", state: "QLD", postcode: "4207" },
  { suburb: "Logan Central", state: "QLD", postcode: "4114" },
  { suburb: "Springfield Lakes", state: "QLD", postcode: "4300" },
  { suburb: "Zillmere", state: "QLD", postcode: "4034" },
  { suburb: "Mitchelton", state: "QLD", postcode: "4053" },
  { suburb: "Woolloongabba", state: "QLD", postcode: "4102" },
  { suburb: "Stafford Heights", state: "QLD", postcode: "4053" },
  { suburb: "Maroochydore", state: "QLD", postcode: "4558" },
  { suburb: "Deagon", state: "QLD", postcode: "4017" },
  { suburb: "Paddington", state: "QLD", postcode: "4064" },
  { suburb: "Bulimba", state: "QLD", postcode: "4171" },
  { suburb: "New Farm", state: "QLD", postcode: "4005" },
  { suburb: "Ascot", state: "QLD", postcode: "4007" },
  { suburb: "Coorparoo", state: "QLD", postcode: "4151" },
  { suburb: "Stones Corner", state: "QLD", postcode: "4120" },
  { suburb: "East Brisbane", state: "QLD", postcode: "4169" },
  { suburb: "Herston", state: "QLD", postcode: "4006" },
  { suburb: "Kangaroo Point", state: "QLD", postcode: "4169" },
  { suburb: "Fortitude Valley", state: "QLD", postcode: "4006" },
  { suburb: "Spring Hill", state: "QLD", postcode: "4000" },
  { suburb: "Buderim", state: "QLD", postcode: "4556" },
  { suburb: "Coolum Beach", state: "QLD", postcode: "4573" },
  { suburb: "Ashmore", state: "QLD", postcode: "4214" },
  { suburb: "Burpengary", state: "QLD", postcode: "4505" },
  { suburb: "Griffin", state: "QLD", postcode: "4503" },
  { suburb: "Petrie", state: "QLD", postcode: "4502" },
  { suburb: "Mango Hill", state: "QLD", postcode: "4509" },
  { suburb: "Dakabin", state: "QLD", postcode: "4503" },
  { suburb: "Redbank Plains", state: "QLD", postcode: "4301" },
  { suburb: "Brassall", state: "QLD", postcode: "4305" },
  { suburb: "Bellbird Park", state: "QLD", postcode: "4300" },
  { suburb: "Collingwood Park", state: "QLD", postcode: "4301" },
  { suburb: "Loganholme", state: "QLD", postcode: "4129" },
  { suburb: "Marsden", state: "QLD", postcode: "4132" },
  { suburb: "Browns Plains", state: "QLD", postcode: "4118" },
  { suburb: "Crestmead", state: "QLD", postcode: "4132" },

  // NSW
  { suburb: "Cessnock", state: "NSW", postcode: "2325" },
  { suburb: "Raymond Terrace", state: "NSW", postcode: "2324" },
  { suburb: "Maitland", state: "NSW", postcode: "2320" },
  { suburb: "Parramatta", state: "NSW", postcode: "2150" },
  { suburb: "Penrith", state: "NSW", postcode: "2750" },
  { suburb: "Wollongong", state: "NSW", postcode: "2500" },
  { suburb: "Newcastle", state: "NSW", postcode: "2300" },
  { suburb: "Liverpool", state: "NSW", postcode: "2170" },
  { suburb: "Campbelltown", state: "NSW", postcode: "2560" },
  { suburb: "Blacktown", state: "NSW", postcode: "2148" },
  { suburb: "Mount Druitt", state: "NSW", postcode: "2770" },
  { suburb: "Gosford", state: "NSW", postcode: "2250" },
  { suburb: "Wyong", state: "NSW", postcode: "2259" },
  { suburb: "Tamworth", state: "NSW", postcode: "2340" },
  { suburb: "Dubbo", state: "NSW", postcode: "2830" },
  { suburb: "Orange", state: "NSW", postcode: "2800" },
  { suburb: "Wagga Wagga", state: "NSW", postcode: "2650" },
  { suburb: "Bathurst", state: "NSW", postcode: "2795" },
  { suburb: "Surry Hills", state: "NSW", postcode: "2010" },
  { suburb: "Newtown", state: "NSW", postcode: "2042" },
  { suburb: "Marrickville", state: "NSW", postcode: "2204" },
  { suburb: "Bankstown", state: "NSW", postcode: "2200" },

  // VIC
  { suburb: "Melton", state: "VIC", postcode: "3337" },
  { suburb: "Ballarat", state: "VIC", postcode: "3350" },
  { suburb: "Geelong", state: "VIC", postcode: "3220" },
  { suburb: "Footscray", state: "VIC", postcode: "3011" },
  { suburb: "Sunshine", state: "VIC", postcode: "3020" },
  { suburb: "Werribee", state: "VIC", postcode: "3030" },
  { suburb: "Craigieburn", state: "VIC", postcode: "3064" },
  { suburb: "Tarneit", state: "VIC", postcode: "3029" },
  { suburb: "Cranbourne", state: "VIC", postcode: "3977" },
  { suburb: "Frankston", state: "VIC", postcode: "3199" },
  { suburb: "Dandenong", state: "VIC", postcode: "3175" },
  { suburb: "Reservoir", state: "VIC", postcode: "3073" },
  { suburb: "Preston", state: "VIC", postcode: "3072" },
  { suburb: "Brunswick", state: "VIC", postcode: "3056" },
  { suburb: "Fitzroy", state: "VIC", postcode: "3065" },
  { suburb: "Richmond", state: "VIC", postcode: "3121" },
  { suburb: "St Kilda", state: "VIC", postcode: "3182" },
  { suburb: "Bendigo", state: "VIC", postcode: "3550" },
  { suburb: "Shepparton", state: "VIC", postcode: "3630" },

  // WA
  { suburb: "Armadale", state: "WA", postcode: "6112" },
  { suburb: "Maylands", state: "WA", postcode: "6051" },
  { suburb: "Bayswater", state: "WA", postcode: "6053" },
  { suburb: "Fremantle", state: "WA", postcode: "6160" },
  { suburb: "Rockingham", state: "WA", postcode: "6168" },
  { suburb: "Mandurah", state: "WA", postcode: "6210" },
  { suburb: "Baldivis", state: "WA", postcode: "6171" },
  { suburb: "Midland", state: "WA", postcode: "6056" },
  { suburb: "Ellenbrook", state: "WA", postcode: "6069" },
  { suburb: "Joondalup", state: "WA", postcode: "6027" },
  { suburb: "Cannington", state: "WA", postcode: "6107" },

  // SA
  { suburb: "Elizabeth", state: "SA", postcode: "5112" },
  { suburb: "Prospect", state: "SA", postcode: "5082" },
  { suburb: "Unley", state: "SA", postcode: "5061" },
  { suburb: "Salisbury", state: "SA", postcode: "5108" },
  { suburb: "Morphett Vale", state: "SA", postcode: "5162" },
  { suburb: "Glenelg", state: "SA", postcode: "5045" },
  { suburb: "Norwood", state: "SA", postcode: "5067" },
  { suburb: "Marion", state: "SA", postcode: "5043" },
  { suburb: "Port Adelaide", state: "SA", postcode: "5015" },

  // TAS
  { suburb: "Glenorchy", state: "TAS", postcode: "7010" },
  { suburb: "Launceston", state: "TAS", postcode: "7250" },
  { suburb: "Devonport", state: "TAS", postcode: "7310" },
  { suburb: "Hobart", state: "TAS", postcode: "7000" },
  { suburb: "Kingston", state: "TAS", postcode: "7050" },

  // ACT
  { suburb: "Belconnen", state: "ACT", postcode: "2617" },
  { suburb: "Tuggeranong", state: "ACT", postcode: "2900" },
  { suburb: "Gungahlin", state: "ACT", postcode: "2912" },
  { suburb: "Woden Valley", state: "ACT", postcode: "2606" },

  // NT
  { suburb: "Darwin", state: "NT", postcode: "0800" },
  { suburb: "Palmerston", state: "NT", postcode: "0830" },
  { suburb: "Alice Springs", state: "NT", postcode: "0870" },
];

async function scrapeSuburbPrices(
  suburb: string, state: string, postcode: string
): Promise<SuburbPriceData> {
  const slug = suburb.toLowerCase().replace(/\s+/g, "-");
  const stateSlug = state.toLowerCase();
  const url = `https://www.allhomes.com.au/sale/${slug}-${stateSlug}-${postcode}/`;

  try {
    const r = await axios.get(url, { timeout: 15_000, headers: HEADERS });
    const $ = cheerio.load(r.data);
    const bodyText = $("body").text().replace(/\n/g, "");

    // Extract all prices using comma-format regex
    const priceRegex = /\$\s*(\d{1,3}(?:,\d{3}){1,2})/g;
    const allPrices: number[] = [];
    let match;
    while ((match = priceRegex.exec(bodyText)) !== null) {
      const p = parseInt(match[1].replace(/,/g, ""), 10);
      if (p >= 50_000 && p <= 15_000_000) allPrices.push(p);
    }

    // Deduplicate (prices appear multiple times on page)
    const unique = Array.from(new Set(allPrices)).sort((a, b) => a - b);

    // Count total listings from title
    const title = $("title").text();
    const countMatch = title.match(/(\d+)\s*propert/i);
    const totalListings = countMatch ? parseInt(countMatch[1], 10) : 0;

    const median = unique.length > 0 ? unique[Math.floor(unique.length / 2)] : null;

    return {
      suburb, state, postcode,
      totalListings,
      pricedListings: unique.length,
      cheapest: unique.length > 0 ? unique[0] : null,
      mostExpensive: unique.length > 0 ? unique[unique.length - 1] : null,
      median,
      prices: unique,
      scrapedAt: new Date().toISOString(),
    };
  } catch {
    return {
      suburb, state, postcode,
      totalListings: 0, pricedListings: 0,
      cheapest: null, mostExpensive: null, median: null,
      prices: [],
      scrapedAt: new Date().toISOString(),
    };
  }
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  console.log(`Scraping ${SUBURBS.length} suburbs from AllHomes...\n`);

  const results: SuburbPriceData[] = [];
  let success = 0;
  let empty = 0;

  for (let i = 0; i < SUBURBS.length; i++) {
    const s = SUBURBS[i];
    const data = await scrapeSuburbPrices(s.suburb, s.state, s.postcode);
    results.push(data);

    if (data.pricedListings > 0) {
      success++;
      console.log(
        `[${i + 1}/${SUBURBS.length}] ${s.suburb} ${s.state}: ${data.totalListings} listed, ${data.pricedListings} priced, median $${data.median?.toLocaleString() ?? "N/A"}, range $${data.cheapest?.toLocaleString() ?? "?"}-$${data.mostExpensive?.toLocaleString() ?? "?"}`
      );
    } else {
      empty++;
      console.log(`[${i + 1}/${SUBURBS.length}] ${s.suburb} ${s.state}: no data`);
    }

    // Rate limit: 1 request per 1.5 seconds
    if (i < SUBURBS.length - 1) await delay(1500);
  }

  // Write output
  const outDir = join(process.cwd(), "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "suburb-prices.json");

  const output = {
    generatedAt: new Date().toISOString(),
    totalSuburbs: results.length,
    withPriceData: success,
    withoutPriceData: empty,
    suburbs: results,
  };

  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Written ${results.length} suburbs to ${outPath}`);
  console.log(`  ${success} with price data, ${empty} without`);

  // Print summary by state
  const byState: Record<string, SuburbPriceData[]> = {};
  for (const r of results) {
    if (!byState[r.state]) byState[r.state] = [];
    byState[r.state].push(r);
  }

  console.log("\n=== SUMMARY BY STATE ===");
  for (const [state, subs] of Object.entries(byState).sort()) {
    const withData = subs.filter((s) => s.pricedListings > 0);
    console.log(`\n${state}: ${withData.length}/${subs.length} suburbs with data`);
    for (const s of withData.sort((a, b) => (a.median ?? 0) - (b.median ?? 0))) {
      console.log(`  ${s.suburb.padEnd(22)} median $${s.median?.toLocaleString().padStart(10) ?? "N/A"} (${s.cheapest?.toLocaleString()}-${s.mostExpensive?.toLocaleString()}) [${s.pricedListings} priced of ${s.totalListings}]`);
    }
  }
}

main().catch(console.error);
