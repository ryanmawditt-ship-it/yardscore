import { GeocodedProperty, PropertyAnalysis, YieldAnalysis } from "@/types";
import { getSuburbData } from "@/scrapers/sqm";
import { scrapeRentalListings } from "@/scrapers/onthehouse";
import { askClaude } from "@/lib/claude";

const SYSTEM_PROMPT =
  "You are a property investment analyst. You will be given rental market data for an Australian suburb. " +
  "Return ONLY a valid JSON object matching the YieldAnalysis type. " +
  "CRITICAL: Never return null for any numeric field. Always calculate or estimate values. " +
  "Calculate grossYieldPct as (weeklyRent * 52 / estimatedPrice) * 100. " +
  "Calculate netYieldPct by subtracting 8% management, 1% maintenance, $2000 rates, $1500 insurance annually. " +
  "Calculate cashflowWeekly assuming 80% LVR at 6.5% interest rate. " +
  "If scraper data is unavailable, use the fallback estimates provided. " +
  "estimatedWeeklyRent, grossYieldPct, netYieldPct, vacancyRatePct, cashflowWeekly must all be numbers, never null. " +
  "Write a 2 sentence rentalDemandSummary. No markdown, no explanation, just the JSON object.";

export async function analyseYield(
  property: GeocodedProperty,
  analysis: PropertyAnalysis
): Promise<YieldAnalysis> {
  const bedrooms = analysis.bedrooms ?? 3;

  const [sqmData, rentalListings] = await Promise.all([
    getSuburbData(property.suburb, property.state, property.postcode),
    scrapeRentalListings(property.suburb, bedrooms),
  ]);

  const averageWeeklyRent =
    rentalListings.length > 0
      ? Math.round(
          rentalListings.reduce((sum, l) => sum + l.weeklyRent, 0) / rentalListings.length
        )
      : null;

  // Estimate a property price from comparables or median
  const estimatedPrice = analysis.lastSalePrice
    ?? (analysis.medianPricePerSqm && analysis.landSize
      ? analysis.medianPricePerSqm * analysis.landSize
      : null);

  const userContent = JSON.stringify(
    {
      address: property.address,
      suburb: property.suburb,
      state: property.state,
      bedrooms,
      lastSalePrice: analysis.lastSalePrice,
      estimatedPrice,
      averageWeeklyRent,
      rentalListingsCount: rentalListings.length,
      sqmData,
      fallbackEstimates: {
        weeklyRent: sqmData.medianAskingRentHouse ?? 550,
        vacancyRatePct: sqmData.vacancyRatePct ?? 1.5,
        note: "Use these fallback values if scraper data is null. Always return numbers, never null.",
      },
    },
    null,
    2
  );

  const response = await askClaude(SYSTEM_PROMPT, userContent);

  return JSON.parse(response) as YieldAnalysis;
}
