import { GeocodedProperty, RiskAnalysis } from "@/types";
import { getOverlays } from "@/lib/risk-overlays";
import { getDemographics } from "@/scrapers/atlas";
import { askClaude } from "@/lib/claude";

const SYSTEM_PROMPT =
  "You are a property risk analyst. You will be given overlay and demographic data for an Australian property. " +
  "Return ONLY a valid JSON object matching the RiskAnalysis type. " +
  "Assign severity ratings: flood high = red, flood medium = amber, flood low = green, " +
  "bushfire any = amber, social housing over 15% = amber, over 25% = red, " +
  "heritage = amber, easement = amber. " +
  "Write a 2 sentence riskSummary. No markdown, no explanation, just the JSON object.";

export async function analyseRisk(property: GeocodedProperty): Promise<RiskAnalysis> {
  const [overlays, demographics] = await Promise.all([
    getOverlays(property.lat, property.lng, property.state),
    getDemographics(property.suburb, property.state),
  ]);

  const userContent = JSON.stringify(
    { address: property.address, overlays, demographics },
    null,
    2
  );

  const response = await askClaude(SYSTEM_PROMPT, userContent);

  return JSON.parse(response) as RiskAnalysis;
}
