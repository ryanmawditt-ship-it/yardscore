import {
  GeocodedProperty,
  PropertyAnalysis,
  RiskAnalysis,
  InfrastructureAnalysis,
  YieldAnalysis,
  ValuationAnalysis,
} from "@/types";
import { askClaude } from "@/lib/claude";

const SYSTEM_PROMPT =
  "You are a senior buyers agent valuing an Australian property. " +
  "You will be given comparable sales (which may be AI-estimated if scraped data was unavailable), " +
  "risk flags, infrastructure data, and yield metrics. " +
  "IMPORTANT: Always produce a fairValueLow, fairValueMid and fairValueHigh — never return null for these. " +
  "If comparables are available, calculate fairValueMid from their median price. " +
  "If comparables are absent or estimated, use your knowledge of the suburb to determine a realistic fairValueMid. " +
  "Then apply adjustments: each red risk flag deduct 4%, each amber flag deduct 2%, " +
  "infrastructureScore above 5 add 3%, above 8 add 5%. " +
  "Set fairValueLow at 95% of mid, fairValueHigh at 105% of mid. " +
  "Set signal to 'buy' if asking price is below fairValueMid, " +
  "'hold' if within 5% above, 'avoid' if more than 5% above or any red risk flags exist. " +
  "If no asking price is provided, set signal based on yield and risk profile. " +
  "Write a 3 sentence investmentThesis. " +
  "No markdown, no explanation, just the JSON object.";

export async function analyseValuation(
  property: GeocodedProperty,
  analysis: PropertyAnalysis,
  risk: RiskAnalysis,
  infrastructure: InfrastructureAnalysis,
  yieldData: YieldAnalysis
): Promise<ValuationAnalysis> {
  const userContent = JSON.stringify(
    {
      address: property.address,
      suburb: property.suburb,
      state: property.state,
      postcode: property.postcode,
      comparables: analysis.comparables,
      medianPricePerSqm: analysis.medianPricePerSqm,
      trendSummary: analysis.trendSummary,
      riskFlags: risk.riskFlags ?? (risk as unknown as Record<string, unknown>),
      infrastructureScore: infrastructure.infrastructureScore,
      grossYieldPct: yieldData.grossYieldPct,
      netYieldPct: yieldData.netYieldPct,
      askingPrice: analysis.lastSalePrice ?? null,
    },
    null,
    2
  );

  const response = await askClaude(SYSTEM_PROMPT, userContent);

  return JSON.parse(response) as ValuationAnalysis;
}
