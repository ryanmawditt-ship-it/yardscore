import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { geocodeAddress } from "@/lib/geocode";
import { runHardFilters, type FilterResult } from "@/lib/property-filter";
import { selectBestSuburbs } from "@/agents/suburb-selector";
import { discoverProperties, getSuburbPhotoUrl, buildListingSearchUrl, getCachedListingMeta } from "@/agents/discovery";
import { analyseProperty } from "@/agents/step4-property";
import { analyseRisk } from "@/agents/step5-risk";
import { analyseInfrastructure } from "@/agents/step6-infrastructure";
import { analyseYield } from "@/agents/step7-yield";
import { analyseValuation } from "@/agents/step8-valuation";
import { synthesise } from "@/agents/synthesis";
import {
  FinalReport,
  GeocodedProperty,
  PropertyAnalysis,
  RiskAnalysis,
  InfrastructureAnalysis,
  YieldAnalysis,
  ValuationAnalysis,
  MultiPropertyReport,
} from "@/types";

// ---------------------------------------------------------------------------
// Safe defaults
// ---------------------------------------------------------------------------

function defaultPropertyAnalysis(address: string): PropertyAnalysis {
  return { address, lastSalePrice: null, lastSaleDate: null, landSize: null, bedrooms: null, bathrooms: null, yearBuilt: null, priceHistory: [], comparables: [], medianPricePerSqm: null, trendSummary: "Property data unavailable." };
}
function defaultRiskAnalysis(): RiskAnalysis {
  return { floodRisk: "none", bushfireRisk: "none", zoningCode: "unknown", zoningDescription: "Zoning data unavailable.", hasHeritage: false, hasEasement: false, socialHousingPct: null, riskFlags: [], riskSummary: "Risk data unavailable." };
}
function defaultInfrastructureAnalysis(): InfrastructureAnalysis {
  return { projects: [], supplyDemandSignal: "balanced", daysOnMarket: null, infrastructureScore: 0, opportunitySummary: "Infrastructure data unavailable." };
}
function defaultYieldAnalysis(): YieldAnalysis {
  return { estimatedWeeklyRent: null, grossYieldPct: null, netYieldPct: null, vacancyRatePct: null, cashflowWeekly: null, rentalDemandSummary: "Yield data unavailable." };
}
function defaultValuationAnalysis(): ValuationAnalysis {
  return { fairValueLow: 0, fairValueMid: 0, fairValueHigh: 0, askingPrice: null, vendorExpectationGap: null, negotiationHeadroomPct: null, signal: "hold", investmentThesis: "Valuation data unavailable." };
}

// ---------------------------------------------------------------------------
// Safe agent wrappers
// ---------------------------------------------------------------------------

async function safeAnalyseProperty(property: GeocodedProperty): Promise<PropertyAnalysis> {
  try { return await analyseProperty(property); } catch (e) { console.error("[step4]", e instanceof Error ? e.message : e); return defaultPropertyAnalysis(property.address); }
}
async function safeAnalyseRisk(property: GeocodedProperty): Promise<RiskAnalysis> {
  try { return await analyseRisk(property); } catch (e) { console.error("[step5]", e instanceof Error ? e.message : e); return defaultRiskAnalysis(); }
}
async function safeAnalyseInfrastructure(property: GeocodedProperty): Promise<InfrastructureAnalysis> {
  try { return await analyseInfrastructure(property); } catch (e) { console.error("[step6]", e instanceof Error ? e.message : e); return defaultInfrastructureAnalysis(); }
}
async function safeAnalyseYield(property: GeocodedProperty, analysis: PropertyAnalysis): Promise<YieldAnalysis> {
  try { return await analyseYield(property, analysis); } catch (e) { console.error("[step7]", e instanceof Error ? e.message : e); return defaultYieldAnalysis(); }
}
async function safeAnalyseValuation(p: GeocodedProperty, a: PropertyAnalysis, r: RiskAnalysis, i: InfrastructureAnalysis, y: YieldAnalysis): Promise<ValuationAnalysis> {
  try { return await analyseValuation(p, a, r, i, y); } catch (e) { console.error("[step8]", e instanceof Error ? e.message : e); return defaultValuationAnalysis(); }
}

// ---------------------------------------------------------------------------
// Budget / input parsing
// ---------------------------------------------------------------------------

function parseBudget(budget: string): number {
  if (budget.includes("1.5M+")) return 2000000;
  if (budget.includes("1M") && budget.includes("1.5M")) return 1500000;
  if (budget.includes("1M")) return 1000000;
  if (budget.includes("750k") && budget.includes("1M")) return 1000000;
  if (budget.includes("500k") && budget.includes("750k")) return 750000;
  if (budget.includes("750k")) return 750000;
  if (budget.includes("500k")) return 500000;
  if (budget.includes("Under")) return 500000;
  const m = budget.match(/[\d,.]+/);
  return m ? parseInt(m[0].replace(/,/g, ""), 10) : 750000;
}
function parseYieldTarget(s: string): number { const m = s.match(/([\d.]+)/); return m ? parseFloat(m[1]) : 0; }
function parseBedrooms(s: string): number { const m = s.match(/(\d+)/); return m ? parseInt(m[1], 10) : 2; }

// ---------------------------------------------------------------------------
// Phase 4: Client-specific scoring
// ---------------------------------------------------------------------------

function computeClientScore(report: FinalReport, primaryGoal: string): number {
  const y = report.yield as unknown as Record<string, unknown>;
  const infra = report.infrastructure as unknown as Record<string, unknown>;
  const grossYield = Number(y?.grossYieldPct ?? 0);
  const infraScore = Number(infra?.infrastructureScore ?? 0) / 10;
  const overall = report.overallScore / 10;
  const vacancy = Math.max(0, 1 - Number(y?.vacancyRatePct ?? 2) / 10); // lower vacancy = higher score

  const goal = primaryGoal.toLowerCase();
  if (goal.includes("yield")) {
    return (grossYield / 10) * 0.4 + overall * 0.3 + infraScore * 0.2 + vacancy * 0.1;
  }
  if (goal.includes("growth")) {
    return infraScore * 0.4 + overall * 0.3 + (grossYield / 10) * 0.2 + vacancy * 0.1;
  }
  // balanced
  return overall * 0.4 + (grossYield / 10) * 0.25 + infraScore * 0.25 + vacancy * 0.1;
}

// ---------------------------------------------------------------------------
// Full deep analysis for a single property
// ---------------------------------------------------------------------------

async function deepAnalyse(property: GeocodedProperty, listingPrice?: number | null): Promise<FinalReport | null> {
  try {
    const [analysis, risk] = await Promise.all([safeAnalyseProperty(property), safeAnalyseRisk(property)]);

    // Inject the real listing price so yield and valuation agents use it
    if (listingPrice && !analysis.lastSalePrice) {
      analysis.lastSalePrice = listingPrice;
    }

    const [infrastructure, yieldData] = await Promise.all([safeAnalyseInfrastructure(property), safeAnalyseYield(property, analysis)]);
    const valuation = await safeAnalyseValuation(property, analysis, risk, infrastructure, yieldData);
    const { overallScore, executiveSummary } = await synthesise(property, analysis, risk, infrastructure, yieldData, valuation);

    return { property, analysis, risk, infrastructure, yield: yieldData, valuation, overallScore, executiveSummary, generatedAt: new Date().toISOString() };
  } catch (error) {
    console.error(`[deep-analyse] Failed for "${property.address}":`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const startTime = Date.now();
  const elapsed = () => `${Date.now() - startTime}ms`;

  // ── State-based multi-property pipeline ──
  if (body.state && typeof body.state === "string") {
    const state = body.state as string;
    const budget = parseBudget((body.budget as string) || "$500k–$750k");
    const purpose = (body.purpose as string) || "Investment property";
    const propertyType = (body.propertyType as string) || "Any";
    const bedrooms = parseBedrooms((body.bedrooms as string) || "2");
    const yieldTarget = parseYieldTarget((body.yieldTarget as string) || "0");
    const primaryGoal = (body.goal as string) || "Balance of both";

    console.log(`\n${"=".repeat(60)}`);
    console.log(`[pipeline] NEW REPORT: ${state} | budget $${budget.toLocaleString()} | ${bedrooms}+ bed ${propertyType} | goal: ${primaryGoal}`);
    console.log(`${"=".repeat(60)}`);

    try {
      // ── PHASE 1: Suburb selection + broad discovery ──
      console.log(`\n[pipeline] Phase 1: Suburb selection and broad discovery...`);
      const selection = await selectBestSuburbs(state, budget, purpose, propertyType, bedrooms, yieldTarget, primaryGoal);
      console.log(`[pipeline] Selected suburbs: ${selection.suburbs.join(", ")} (${elapsed()})`);

      const discoveryResults = await Promise.all(
        selection.suburbs.map((suburb) => discoverProperties(suburb, state, budget, bedrooms, propertyType))
      );
      const allAddresses = discoveryResults.flat();
      console.log(`[pipeline] Phase 1 complete: Found ${allAddresses.length} candidates across ${selection.suburbs.length} suburbs (${elapsed()})`);

      // ── PHASE 2: Hard filters ──
      console.log(`\n[pipeline] Phase 2: Running hard filters on ${allAddresses.length} candidates...`);

      interface Candidate { address: string; property: GeocodedProperty; filterResult: FilterResult; }
      const candidates: Candidate[] = [];
      const eliminated: { address: string; reason: string }[] = [];

      const geocodeResults = await Promise.allSettled(
        allAddresses.map((addr) => geocodeAddress(addr))
      );

      const geocoded: GeocodedProperty[] = [];
      for (let i = 0; i < geocodeResults.length; i++) {
        const r = geocodeResults[i];
        if (r.status === "fulfilled") {
          geocoded.push(r.value);
        } else {
          console.log(`[filter] ELIMINATED ${allAddresses[i]} — geocoding failed`);
          eliminated.push({ address: allAddresses[i], reason: "Geocoding failed" });
        }
      }

      // Get listing metadata for price/bedroom data
      const filterResults = await Promise.allSettled(
        geocoded.map(async (prop) => {
          const meta = getCachedListingMeta(prop.address);
          const knownPrice = meta?.price ?? null;
          const knownBeds = meta?.bedrooms ?? null;

          const result = await runHardFilters(
            prop.address, prop.lat, prop.lng, prop.suburb, prop.state,
            knownPrice, knownBeds, budget, bedrooms, yieldTarget, propertyType
          );
          return { property: prop, filterResult: result };
        })
      );

      for (const r of filterResults) {
        if (r.status === "fulfilled") {
          if (r.value.filterResult.passed) {
            candidates.push({ address: r.value.property.address, property: r.value.property, filterResult: r.value.filterResult });
          } else {
            eliminated.push({ address: r.value.property.address, reason: r.value.filterResult.failedReason ?? "Unknown" });
          }
        }
      }

      console.log(`[pipeline] Phase 2 complete: ${candidates.length} of ${allAddresses.length} candidates passed hard filters, ${eliminated.length} eliminated (${elapsed()})`);
      for (const e of eliminated) {
        console.log(`[pipeline]   Eliminated: ${e.address} — ${e.reason}`);
      }

      if (candidates.length === 0) {
        console.log("[pipeline] No candidates passed filters — returning error");
        return NextResponse.json({ error: "No properties matched your criteria after quality checks. Try adjusting your budget or bedroom requirements." }, { status: 200 });
      }

      // ── PHASE 3: Deep analysis (cap at 9 to control cost/time) ──
      const toAnalyse = candidates.slice(0, 9);
      console.log(`\n[pipeline] Phase 3: Running deep analysis on ${toAnalyse.length} candidates...`);

      const analysisResults = await Promise.allSettled(
        toAnalyse.map((c) => {
          const meta = getCachedListingMeta(c.property.address);
          return deepAnalyse(c.property, meta?.price ?? null);
        })
      );

      const reports: FinalReport[] = [];
      for (let i = 0; i < analysisResults.length; i++) {
        const r = analysisResults[i];
        if (r.status === "fulfilled" && r.value) {
          reports.push(r.value);
        } else {
          console.log(`[pipeline] Deep analysis failed for ${toAnalyse[i].address}`);
        }
      }

      console.log(`[pipeline] Phase 3 complete: ${reports.length} successful analyses (${elapsed()})`);

      // ── PHASE 4: Client-specific ranking ──
      console.log(`\n[pipeline] Phase 4: Ranking by "${primaryGoal}"...`);

      const scored = reports.map((r) => ({
        report: r,
        clientScore: computeClientScore(r, primaryGoal),
      }));
      scored.sort((a, b) => b.clientScore - a.clientScore);

      for (const { report: r, clientScore } of scored) {
        console.log(`[pipeline]   ${r.property.suburb}: ${r.property.address.split(",")[0]} — overall ${r.overallScore}/10, client score ${(clientScore * 10).toFixed(1)}/10`);
      }

      // ── PHASE 5: Final selection — guarantee 3 minimum ──
      console.log(`\n[pipeline] Phase 5: Selecting top properties (target 3-5)...`);

      // Take top 3-5 regardless of score — the client paid for a report
      const selected = scored.slice(0, Math.max(3, Math.min(5, scored.length)));

      console.log(`[pipeline] Phase 5 complete: ${selected.length} properties selected (${elapsed()})`);

      // ── Enrich with metadata ──
      for (let i = 0; i < selected.length; i++) {
        const r = selected[i].report;
        if (r.property) {
          const meta = getCachedListingMeta(r.property.address);
          r.suburbPhotoUrl = meta?.photoUrl || getSuburbPhotoUrl(r.property.suburb);
          r.listingSearchUrl = meta?.listingUrl || buildListingSearchUrl(r.property.suburb, r.property.state, r.property.postcode, propertyType, bedrooms, budget);

          r.pipelineMeta = {
            candidatesFound: allAddresses.length,
            candidatesPassed: candidates.length,
            checksRun: candidates[0]?.filterResult.checksRun ?? [],
            clientGoal: primaryGoal,
            rankPosition: i + 1,
            rankTotal: selected.length,
            clientScore: Math.round(selected[i].clientScore * 100) / 10,
          };
        }
      }

      // ── PHASE 6: Complete ──
      const topReports = selected.map((s) => s.report);

      console.log(`\n[pipeline] Phase 6: Pipeline complete (${elapsed()})`);
      console.log(`[pipeline] Delivered ${topReports.length} properties to client`);
      console.log(`${"=".repeat(60)}\n`);

      const response: MultiPropertyReport = {
        recommendedSuburbs: selection.suburbs,
        suburbReasoning: selection.reasoning,
        properties: topReports,
        generatedAt: new Date().toISOString(),
        pipelineSummary: {
          candidatesFound: allAddresses.length,
          candidatesPassed: candidates.length,
          eliminated,
        },
      };

      return NextResponse.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[pipeline] FATAL:", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ── Legacy single-address mode ──
  if (!body.address || typeof body.address !== "string" || !(body.address as string).trim()) {
    return NextResponse.json({ error: "Request body must include 'state' or 'address'." }, { status: 400 });
  }

  try {
    const property = await geocodeAddress((body.address as string).trim());
    const report = await deepAnalyse(property);
    if (!report) return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
    return NextResponse.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
