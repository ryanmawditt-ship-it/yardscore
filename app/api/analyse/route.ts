import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { geocodeAddress } from "@/lib/geocode";
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
  PropertyInput,
  RiskAnalysis,
  InfrastructureAnalysis,
  YieldAnalysis,
  ValuationAnalysis,
} from "@/types";

// ---------------------------------------------------------------------------
// Safe defaults — used when an agent fails so the pipeline always completes
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
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  console.log("API route hit");

  let body: PropertyInput;

  try {
    body = await request.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[/api/analyse] Failed to parse request body:", message);
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  if (!body?.address || typeof body.address !== "string" || !body.address.trim()) {
    console.error("[/api/analyse] Validation failed: missing or empty address field.", body);
    return NextResponse.json(
      { error: "Request body must include a non-empty 'address' string." },
      { status: 400 }
    );
  }

  const startTime = Date.now();
  console.log("[api] Request started at", new Date().toISOString());

  try {
    // Step 1: Geocode — the only hard failure; no address means no report
    const property = await geocodeAddress(body.address.trim());
    console.log("[api] Step 1 (geocode) completed in", Date.now() - startTime, "ms");

    // Steps 4 & 5: run in parallel; each falls back to safe defaults on failure
    console.log("Starting step 4 - property analysis");
    console.log("Starting step 5 - risk analysis");
    const [analysis, risk] = await Promise.all([
      safeAnalyseProperty(property),
      safeAnalyseRisk(property),
    ]);
    console.log("[api] Steps 4 & 5 completed in", Date.now() - startTime, "ms");

    // Steps 6 & 7: run in parallel; each falls back to safe defaults on failure
    console.log("Starting step 6 - infrastructure analysis");
    console.log("Starting step 7 - yield analysis");
    const [infrastructure, yieldData] = await Promise.all([
      safeAnalyseInfrastructure(property),
      safeAnalyseYield(property, analysis),
    ]);
    console.log("[api] Steps 6 & 7 completed in", Date.now() - startTime, "ms");

    // Step 8: falls back to safe defaults on failure
    console.log("Starting step 8 - valuation analysis");
    const valuation = await safeAnalyseValuation(property, analysis, risk, infrastructure, yieldData);
    console.log("[api] Step 8 completed in", Date.now() - startTime, "ms");

    // Synthesis: instruct Claude to work with whatever data is available
    const { overallScore, executiveSummary } = await synthesise(
      property,
      analysis,
      risk,
      infrastructure,
      yieldData,
      valuation
    );

    console.log("[api] Synthesis completed in", Date.now() - startTime, "ms");

    const report: FinalReport = {
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

    return NextResponse.json(report);
  } catch (error) {
    // Only geocoding or synthesis can reach here now
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[/api/analyse] Pipeline error:", message);
    if (stack) console.error("[/api/analyse] Stack trace:\n", stack);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
