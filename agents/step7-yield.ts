import { GeocodedProperty, PropertyAnalysis, YieldAnalysis } from "@/types";
import { getSuburbData } from "@/scrapers/sqm";
import { scrapeRentalListings } from "@/scrapers/onthehouse";
import { askClaude } from "@/lib/claude";

const SYSTEM_PROMPT =
  "You are a property investment analyst. You will be given rental market data for an Australian suburb. " +
  "Return ONLY a valid JSON object matching the YieldAnalysis type. " +
  "Calculate grossYieldPct as (weeklyRent * 52 / lastSalePrice) * 100. " +
  "Calculate netYieldPct by subtracting 8% management, 1% maintenance, $2000 rates, $1500 insurance annually. " +
  "Calculate cashflowWeekly assuming 80% LVR at 6.5% interest rate. " +
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

  const userContent = JSON.stringify(
    {
      address: property.address,
      suburb: property.suburb,
      bedrooms,
      lastSalePrice: analysis.lastSalePrice,
      averageWeeklyRent,
      rentalListingsCount: rentalListings.length,
      sqmData,
    },
    null,
    2
  );

  const response = await askClaude(SYSTEM_PROMPT, userContent);

  return JSON.parse(response) as YieldAnalysis;
}
