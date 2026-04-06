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
  "You are a senior buyers agent preparing a final investment report for an Australian property. " +
  "You will be given the full outputs of five specialist analysis agents: property details, " +
  "risk assessment, infrastructure, rental yield, and valuation. " +
  "Return ONLY a valid JSON object with exactly two keys: " +
  '"overallScore" (a number from 1 to 10) and "executiveSummary" (a string). ' +
  "overallScore must reflect the overall investment quality: weight valuation signal (30%), " +
  "yield (25%), risk (25%), and infrastructure (20%). Penalise red risk flags heavily. " +
  "executiveSummary must be 3-4 paragraphs covering: " +
  "(1) property overview and market context, " +
  "(2) key risks and any red or amber flags, " +
  "(3) income potential and yield outlook, " +
  "(4) investment recommendation with clear buy/hold/avoid reasoning. " +
  "No markdown, no explanation outside the JSON, just the JSON object.";

export async function synthesise(
  property: GeocodedProperty,
  analysis: PropertyAnalysis,
  risk: RiskAnalysis,
  infrastructure: InfrastructureAnalysis,
  yieldData: YieldAnalysis,
  valuation: ValuationAnalysis
): Promise<{ overallScore: number; executiveSummary: string }> {
  const userContent = JSON.stringify(
    {
      address: property.address,
      suburb: property.suburb,
      state: property.state,
      propertyAnalysis: analysis,
      riskAnalysis: risk,
      infrastructureAnalysis: infrastructure,
      yieldAnalysis: yieldData,
      valuationAnalysis: valuation,
    },
    null,
    2
  );

  const response = await askClaude(SYSTEM_PROMPT, userContent);

  const parsed = JSON.parse(response) as { overallScore: number; executiveSummary: string };
  return parsed;
}
