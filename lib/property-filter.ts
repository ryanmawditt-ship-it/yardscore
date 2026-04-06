/**
 * Hard filter engine — eliminates candidates before expensive deep analysis.
 * Any single failure immediately disqualifies the property.
 */

import { estimateMarketRent, calculateGrossYield, calculateNetYield, calculateWeeklyCashflow } from "./market-rent-estimator";

export interface YieldPreCalc {
  estimatedWeeklyRent: number;
  grossYield: number;
  netYield: number;
  cashflowWeekly: number;
  rentSource: string;
  rentConfidence: string;
}

export interface FilterResult {
  passed: boolean;
  failedReason: string | null;
  riskData: {
    floodRisk: string;
    bushfireRisk: string;
    zoningCode: string;
    hasHeritage: boolean;
    hasEasement: boolean;
  } | null;
  checksRun: string[];
  yieldData: YieldPreCalc | null;
}

export async function runHardFilters(
  address: string,
  lat: number,
  lng: number,
  suburb: string,
  state: string,
  knownPrice: number | null,
  knownBedrooms: number | null,
  clientBudget: number,
  clientMinBedrooms: number,
  clientYieldTarget: number,
  propertyType: string
): Promise<FilterResult> {
  const checksRun: string[] = [];
  let riskData: FilterResult["riskData"] = null;

  // Filter 1: Budget
  if (knownPrice && knownPrice > clientBudget * 1.05) {
    console.log(`[filter] ELIMINATED ${address} — price $${knownPrice.toLocaleString()} exceeds budget $${clientBudget.toLocaleString()}`);
    return { passed: false, failedReason: `Price $${knownPrice.toLocaleString()} exceeds budget $${clientBudget.toLocaleString()}`, riskData: null, checksRun: ["budget"], yieldData: null };
  }
  checksRun.push("budget");

  // Filter 2: Bedrooms
  if (knownBedrooms && knownBedrooms < clientMinBedrooms) {
    console.log(`[filter] ELIMINATED ${address} — ${knownBedrooms} beds below minimum ${clientMinBedrooms}`);
    return { passed: false, failedReason: `${knownBedrooms} bedrooms below minimum ${clientMinBedrooms}`, riskData: null, checksRun, yieldData: null };
  }
  checksRun.push("bedrooms");

  // Filters 3-6: Risk overlays
  if (lat && lng) {
    try {
      const { getOverlays } = await import("./risk-overlays");
      const overlays = await getOverlays(lat, lng, state);
      riskData = overlays;

      if (overlays.floodRisk === "high") {
        console.log(`[filter] ELIMINATED ${address} — high flood risk zone`);
        return { passed: false, failedReason: "High flood risk zone", riskData, checksRun: [...checksRun, "flood"], yieldData: null };
      }
      checksRun.push("flood");

      if (overlays.bushfireRisk === "high") {
        console.log(`[filter] ELIMINATED ${address} — high bushfire risk zone`);
        return { passed: false, failedReason: "High bushfire risk zone", riskData, checksRun: [...checksRun, "bushfire"], yieldData: null };
      }
      checksRun.push("bushfire");

      const zoning = overlays.zoningCode.toLowerCase();
      if (zoning.includes("industrial") || zoning.includes("commercial") || zoning.includes("rural")) {
        console.log(`[filter] ELIMINATED ${address} — non-residential zoning: ${overlays.zoningCode}`);
        return { passed: false, failedReason: `Non-residential zoning: ${overlays.zoningCode}`, riskData, checksRun: [...checksRun, "zoning"], yieldData: null };
      }
      checksRun.push("zoning");
    } catch (e) {
      console.log(`[filter] Risk overlay check failed for ${address}: ${e instanceof Error ? e.message : String(e)} — continuing`);
      checksRun.push("flood", "bushfire", "zoning");
    }
  } else {
    checksRun.push("flood", "bushfire", "zoning");
  }

  // Filter 7: Yield pre-qualification
  const purchasePrice = knownPrice || clientBudget * 0.9;
  const beds = knownBedrooms || clientMinBedrooms;

  const rentEstimate = await estimateMarketRent(suburb, state, beds, null, null, propertyType);
  const grossYield = calculateGrossYield(rentEstimate.weeklyRent, purchasePrice);
  const netYield = calculateNetYield(rentEstimate.weeklyRent, purchasePrice);
  const cashflow = calculateWeeklyCashflow(rentEstimate.weeklyRent, purchasePrice);

  const yieldData: YieldPreCalc = {
    estimatedWeeklyRent: rentEstimate.weeklyRent,
    grossYield,
    netYield,
    cashflowWeekly: cashflow,
    rentSource: rentEstimate.source,
    rentConfidence: rentEstimate.confidence,
  };

  console.log(`[filter] Yield check for ${address}: $${rentEstimate.weeklyRent}/wk (${rentEstimate.source}), gross ${grossYield.toFixed(1)}%, target ${clientYieldTarget}%`);

  if (clientYieldTarget > 0 && grossYield < clientYieldTarget) {
    console.log(`[filter] ELIMINATED ${address} — gross yield ${grossYield.toFixed(1)}% below target ${clientYieldTarget}%`);
    return {
      passed: false,
      failedReason: `Gross yield ${grossYield.toFixed(1)}% below ${clientYieldTarget}% target ($${rentEstimate.weeklyRent}/wk at $${purchasePrice.toLocaleString()})`,
      riskData,
      checksRun: [...checksRun, "yield"],
      yieldData,
    };
  }
  checksRun.push("yield");

  return { passed: true, failedReason: null, riskData, checksRun, yieldData };
}
