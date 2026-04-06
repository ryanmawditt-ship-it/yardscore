/**
 * Hard filter engine — eliminates candidates before expensive deep analysis.
 * Any single failure immediately disqualifies the property.
 */

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
}

export async function runHardFilters(
  address: string,
  lat: number,
  lng: number,
  state: string,
  knownPrice: number | null,
  knownBedrooms: number | null,
  clientBudget: number,
  clientMinBedrooms: number
): Promise<FilterResult> {
  const checksRun: string[] = [];

  // Filter 1: Budget
  if (knownPrice && knownPrice > clientBudget * 1.05) {
    console.log(`[filter] ELIMINATED ${address} — price $${knownPrice.toLocaleString()} exceeds budget $${clientBudget.toLocaleString()}`);
    return { passed: false, failedReason: `Price $${knownPrice.toLocaleString()} exceeds budget $${clientBudget.toLocaleString()}`, riskData: null, checksRun: ["budget"] };
  }
  checksRun.push("budget");

  // Filter 2: Bedrooms
  if (knownBedrooms && knownBedrooms < clientMinBedrooms) {
    console.log(`[filter] ELIMINATED ${address} — ${knownBedrooms} beds below minimum ${clientMinBedrooms}`);
    return { passed: false, failedReason: `${knownBedrooms} bedrooms below minimum ${clientMinBedrooms}`, riskData: null, checksRun };
  }
  checksRun.push("bedrooms");

  // Filters 3-6: Risk overlays (flood, bushfire, zoning)
  if (lat && lng) {
    try {
      const { getOverlays } = await import("./risk-overlays");
      const overlays = await getOverlays(lat, lng, state);

      // Filter 3: Flood
      if (overlays.floodRisk === "high") {
        console.log(`[filter] ELIMINATED ${address} — high flood risk zone`);
        return { passed: false, failedReason: "High flood risk zone", riskData: overlays, checksRun: [...checksRun, "flood"] };
      }
      checksRun.push("flood");

      // Filter 4: Bushfire
      if (overlays.bushfireRisk === "high") {
        console.log(`[filter] ELIMINATED ${address} — high bushfire risk zone`);
        return { passed: false, failedReason: "High bushfire risk zone", riskData: overlays, checksRun: [...checksRun, "bushfire"] };
      }
      checksRun.push("bushfire");

      // Filter 5: Zoning (non-residential)
      const zoning = overlays.zoningCode.toLowerCase();
      if (zoning.includes("industrial") || zoning.includes("commercial") || zoning.includes("rural")) {
        console.log(`[filter] ELIMINATED ${address} — non-residential zoning: ${overlays.zoningCode}`);
        return { passed: false, failedReason: `Non-residential zoning: ${overlays.zoningCode}`, riskData: overlays, checksRun: [...checksRun, "zoning"] };
      }
      checksRun.push("zoning");

      return { passed: true, failedReason: null, riskData: overlays, checksRun };
    } catch (e) {
      // Overlay check failed — don't eliminate, just log
      console.log(`[filter] Risk overlay check failed for ${address}: ${e instanceof Error ? e.message : String(e)} — continuing`);
      checksRun.push("flood", "bushfire", "zoning");
      return { passed: true, failedReason: null, riskData: null, checksRun };
    }
  }

  checksRun.push("flood", "bushfire", "zoning");
  return { passed: true, failedReason: null, riskData: null, checksRun };
}
