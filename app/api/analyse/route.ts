import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { geocodeAddress } from "@/lib/geocode";
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
  return {
    address,
    lastSalePrice: null,
    lastSaleDate: null,
    landSize: null,
    bedrooms: null,
    bathrooms: null,
    yearBuilt: null,
    priceHistory: [],
    comparables: [],
    medianPricePerSqm: null,
    trendSummary: "Property data unavailable.",
  };
}

function defaultRiskAnalysis(): RiskAnalysis {
  return {
    floodRisk: "none",
    bushfireRisk: "none",
    zoningCode: "unknown",
    zoningDescription: "Zoning data unavailable.",
    hasHeritage: false,
    hasEasement: false,
    socialHousingPct: null,
    riskFlags: [],
    riskSummary: "Risk data unavailable.",
  };
}

function defaultInfrastructureAnalysis(): InfrastructureAnalysis {
  return {
    projects: [],
    supplyDemandSignal: "balanced",
    daysOnMarket: null,
    infrastructureScore: 0,
    opportunitySummary: "Infrastructure data unavailable.",
  };
}

function defaultYieldAnalysis(): YieldAnalysis {
  return {
    estimatedWeeklyRent: null,
    grossYieldPct: null,
    netYieldPct: null,
    vacancyRatePct: null,
    cashflowWeekly: null,
    rentalDemandSummary: "Yield data unavailable.",
  };
}

function defaultValuationAnalysis(): ValuationAnalysis {
  return {
    fairValueLow: 0,
    fairValueMid: 0,
    fairValueHigh: 0,
    askingPrice: null,
    vendorExpectationGap: null,
    negotiationHeadroomPct: null,
    signal: "hold",
    investmentThesis: "Valuation data unavailable.",
  };
}

// ---------------------------------------------------------------------------
// Safe agent wrappers
// ---------------------------------------------------------------------------

async function safeAnalyseProperty(property: GeocodedProperty): Promise<PropertyAnalysis> {
  try {
    return await analyseProperty(property);
  } catch (error) {
    console.error("[step4] analyseProperty failed:", error instanceof Error ? error.message : String(error));
    return defaultPropertyAnalysis(property.address);
  }
}

async function safeAnalyseRisk(property: GeocodedProperty): Promise<RiskAnalysis> {
  try {
    return await analyseRisk(property);
  } catch (error) {
    console.error("[step5] analyseRisk failed:", error instanceof Error ? error.message : String(error));
    return defaultRiskAnalysis();
  }
}

async function safeAnalyseInfrastructure(property: GeocodedProperty): Promise<InfrastructureAnalysis> {
  try {
    return await analyseInfrastructure(property);
  } catch (error) {
    console.error("[step6] analyseInfrastructure failed:", error instanceof Error ? error.message : String(error));
    return defaultInfrastructureAnalysis();
  }
}

async function safeAnalyseYield(property: GeocodedProperty, analysis: PropertyAnalysis): Promise<YieldAnalysis> {
  try {
    return await analyseYield(property, analysis);
  } catch (error) {
    console.error("[step7] analyseYield failed:", error instanceof Error ? error.message : String(error));
    return defaultYieldAnalysis();
  }
}

async function safeAnalyseValuation(
  property: GeocodedProperty,
  analysis: PropertyAnalysis,
  risk: RiskAnalysis,
  infrastructure: InfrastructureAnalysis,
  yieldData: YieldAnalysis
): Promise<ValuationAnalysis> {
  try {
    return await analyseValuation(property, analysis, risk, infrastructure, yieldData);
  } catch (error) {
    console.error("[step8] analyseValuation failed:", error instanceof Error ? error.message : String(error));
    return defaultValuationAnalysis();
  }
}

// ---------------------------------------------------------------------------
// Analyse a single property address (full pipeline)
// ---------------------------------------------------------------------------

async function analyseSingleProperty(address: string): Promise<FinalReport | null> {
  try {
    const property = await geocodeAddress(address);

    const [analysis, risk] = await Promise.all([
      safeAnalyseProperty(property),
      safeAnalyseRisk(property),
    ]);

    const [infrastructure, yieldData] = await Promise.all([
      safeAnalyseInfrastructure(property),
      safeAnalyseYield(property, analysis),
    ]);

    const valuation = await safeAnalyseValuation(property, analysis, risk, infrastructure, yieldData);

    const { overallScore, executiveSummary } = await synthesise(
      property, analysis, risk, infrastructure, yieldData, valuation
    );

    return {
      property,
      analysis,
      risk,
      infrastructure,
      yield: yieldData,
      valuation,
      overallScore,
      executiveSummary,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[analyse] Failed for "${address}":`, error instanceof Error ? error.message : String(error));
    return null;
  }
}

// ---------------------------------------------------------------------------
// Parse budget string to number
// ---------------------------------------------------------------------------

function parseBudget(budget: string): number {
  // Check ranges first (most specific), then single values
  if (budget.includes("1.5M+")) return 2000000;
  if (budget.includes("1M") && budget.includes("1.5M")) return 1500000;
  if (budget.includes("1M")) return 1000000;
  if (budget.includes("750k") && budget.includes("1M")) return 1000000;
  if (budget.includes("500k") && budget.includes("750k")) return 750000;
  if (budget.includes("750k")) return 750000;
  if (budget.includes("500k")) return 500000;
  if (budget.includes("Under")) return 500000;
  const match = budget.match(/[\d,.]+/);
  if (match) return parseInt(match[0].replace(/[,]/g, ""), 10);
  return 750000;
}

function parseYieldTarget(yieldStr: string): number {
  const match = yieldStr.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function parseBedrooms(bedroomStr: string): number {
  const match = bedroomStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 2;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  console.log("API route hit");

  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[/api/analyse] Failed to parse request body:", message);
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  const startTime = Date.now();
  console.log("[api] Request started at", new Date().toISOString());

  // ── State-based multi-property search ──
  if (body.state && typeof body.state === "string") {
    const state = body.state as string;
    const budget = parseBudget((body.budget as string) || "$500k–$750k");
    const purpose = (body.purpose as string) || "Investment property";
    const propertyType = (body.propertyType as string) || "Any";
    const bedrooms = parseBedrooms((body.bedrooms as string) || "2");
    const yieldTarget = parseYieldTarget((body.yieldTarget as string) || "0");
    const primaryGoal = (body.goal as string) || "Balance of both";

    console.log(`[api] State-based search: ${state}, budget: $${budget}, goal: ${primaryGoal}`);

    try {
      // Step 1: Select best suburbs from intelligence data
      console.log("[api] Step 1: Selecting best suburbs...");
      const selection = await selectBestSuburbs(state, budget, purpose, propertyType, bedrooms, yieldTarget, primaryGoal);
      console.log(`[api] Step 1 completed in ${Date.now() - startTime}ms — suburbs:`, selection.suburbs);

      // Step 2: Discover 2 properties per suburb
      console.log("[api] Step 2: Discovering properties...");
      const discoveryResults = await Promise.all(
        selection.suburbs.map((suburb) => discoverProperties(suburb, state, budget, bedrooms, propertyType))
      );
      const allAddresses = discoveryResults.flat();
      console.log(`[api] Step 2 completed in ${Date.now() - startTime}ms — ${allAddresses.length} addresses`);

      // Step 3: Analyse all properties in parallel
      console.log("[api] Step 3: Analysing all properties...");
      const results = await Promise.allSettled(
        allAddresses.map((addr) => analyseSingleProperty(addr))
      );

      const reports = results
        .filter((r): r is PromiseFulfilledResult<FinalReport | null> => r.status === "fulfilled")
        .map((r) => r.value)
        .filter((r): r is FinalReport => r !== null);

      console.log(`[api] Step 3 completed in ${Date.now() - startTime}ms — ${reports.length} successful reports`);

      // Step 4: Sort by score descending, attach listing URLs and photos, take top 5
      reports.sort((a, b) => b.overallScore - a.overallScore);
      for (const r of reports) {
        if (r.property) {
          const meta = getCachedListingMeta(r.property.address);
          if (meta) {
            r.listingSearchUrl = meta.listingUrl;
            r.suburbPhotoUrl = meta.photoUrl || getSuburbPhotoUrl(r.property.suburb);
            console.log(`[api] Enriched ${r.property.suburb} with ${meta.source} listing`);
          } else {
            r.suburbPhotoUrl = getSuburbPhotoUrl(r.property.suburb);
            r.listingSearchUrl = buildListingSearchUrl(
              r.property.suburb, r.property.state, r.property.postcode,
              propertyType, bedrooms, budget
            );
          }
        }
      }
      const topReports = reports.slice(0, 5);

      console.log(`[api] Pipeline completed in ${Date.now() - startTime}ms`);

      const response: MultiPropertyReport = {
        recommendedSuburbs: selection.suburbs,
        suburbReasoning: selection.reasoning,
        properties: topReports,
        generatedAt: new Date().toISOString(),
      };

      return NextResponse.json(response);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[/api/analyse] Multi-property pipeline error:", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ── Legacy single-address mode ──
  if (!body.address || typeof body.address !== "string" || !(body.address as string).trim()) {
    console.error("[/api/analyse] Validation failed: missing address or state.", body);
    return NextResponse.json(
      { error: "Request body must include 'state' or 'address'." },
      { status: 400 }
    );
  }

  try {
    const report = await analyseSingleProperty((body.address as string).trim());
    if (!report) {
      return NextResponse.json({ error: "Analysis failed for the given address." }, { status: 500 });
    }
    return NextResponse.json(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[/api/analyse] Pipeline error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
