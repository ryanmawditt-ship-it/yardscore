import {
  GeocodedProperty,
  PropertyAnalysis,
  RiskAnalysis,
  InfrastructureAnalysis,
  YieldAnalysis,
  ValuationAnalysis,
} from "@/types";
import { askClaude } from "@/lib/claude";
import { getSuburbPrices } from "@/lib/suburb-prices";
import { findSuburbPick } from "@/lib/investment-intelligence";

const SYSTEM_PROMPT =
  "You are a senior buyers agent valuing an Australian property. " +
  "You will be given the property data, risk flags, infrastructure score, yield metrics, " +
  "AND verified current market data for the suburb. " +
  "CRITICAL RULES: " +
  "1. If a REAL ASKING PRICE is provided, your fairValueMid MUST be within 10% of that asking price. " +
  "   The asking price reflects what the vendor expects in today's market. Your job is to assess " +
  "   whether it's fair value, not to invent a completely different price. " +
  "2. If the VERIFIED SUBURB MEDIAN is provided, use it as a sanity check. " +
  "   fairValueMid should be in the range of the suburb's actual price range. " +
  "3. If NO asking price is provided, base fairValueMid on the verified suburb median " +
  "   adjusted for bedrooms, bathrooms, and land size. " +
  "4. fairValueLow = fairValueMid * 0.95, fairValueHigh = fairValueMid * 1.05. " +
  "5. Set signal: 'buy' if asking price < fairValueMid, 'hold' if within 5%, 'avoid' if >5% above. " +
  "6. NEVER return fairValueMid below 50% of the asking price or suburb median — that indicates an error. " +
  "Write a 3 sentence investmentThesis. " +
  "Return ONLY a valid JSON object matching ValuationAnalysis. No markdown.";

export async function analyseValuation(
  property: GeocodedProperty,
  analysis: PropertyAnalysis,
  risk: RiskAnalysis,
  infrastructure: InfrastructureAnalysis,
  yieldData: YieldAnalysis
): Promise<ValuationAnalysis> {
  // Get verified suburb data from our 700-suburb database
  const verifiedPrices = getSuburbPrices(property.suburb, property.state);
  const intelligencePick = findSuburbPick(property.suburb, property.state);

  // The asking price — from AllHomes listing or analysis
  const askingPrice = analysis.lastSalePrice ?? null;

  const userContent = JSON.stringify(
    {
      address: property.address,
      suburb: property.suburb,
      state: property.state,
      postcode: property.postcode,

      // Real asking price from AllHomes listing
      askingPrice,
      askingPriceNote: askingPrice
        ? `This is a REAL asking price from AllHomes.com.au. Your valuation MUST be anchored to this price.`
        : "No asking price available — use suburb median as basis.",

      // Verified suburb market data
      verifiedSuburbData: verifiedPrices
        ? {
            median: verifiedPrices.median,
            cheapest: verifiedPrices.cheapest,
            mostExpensive: verifiedPrices.mostExpensive,
            totalListings: verifiedPrices.totalListings,
            pricedListings: verifiedPrices.pricedListings,
            note: `These are REAL prices from AllHomes as of ${verifiedPrices.scrapedAt?.split("T")[0]}. Use as sanity check.`,
          }
        : null,

      intelligenceMedian: intelligencePick?.medianHousePrice ?? null,

      // Analysis data
      comparables: analysis.comparables,
      medianPricePerSqm: analysis.medianPricePerSqm,
      trendSummary: analysis.trendSummary,
      bedrooms: analysis.bedrooms,
      bathrooms: analysis.bathrooms,
      landSize: analysis.landSize,

      // Risk and infra
      riskFlags: risk.riskFlags ?? [],
      riskSummary: risk.riskSummary,
      infrastructureScore: infrastructure.infrastructureScore,

      // Yield
      grossYieldPct: yieldData.grossYieldPct,
      netYieldPct: yieldData.netYieldPct,
    },
    null,
    2
  );

  const response = await askClaude(SYSTEM_PROMPT, userContent);
  return JSON.parse(response) as ValuationAnalysis;
}
