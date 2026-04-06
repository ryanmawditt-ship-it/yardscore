import { askClaude } from "@/lib/claude";

const SYSTEM_PROMPT =
  "You are an expert Australian property investment analyst. " +
  "You recommend suburbs based on current market conditions, rental yields, capital growth, " +
  "infrastructure development, demographic trends, vacancy rates, and days on market. " +
  "Return ONLY a valid JSON array of exactly 3 suburb name strings. No explanations.";

export async function selectBestSuburbs(
  state: string,
  maxBudget: number,
  purpose: string,
  propertyType: string,
  bedrooms: number,
  yieldTarget: number,
  primaryGoal: string
): Promise<string[]> {
  const userContent = `A client is looking to invest in ${state}, Australia with these criteria:
- Maximum budget: $${maxBudget.toLocaleString()}
- Purpose: ${purpose}
- Property type: ${propertyType}
- Minimum bedrooms: ${bedrooms}
- Primary goal: ${primaryGoal}
- Minimum yield target: ${yieldTarget}%

Based on current Australian property market knowledge, recommend exactly 3 suburbs in ${state} that best match these criteria.

Consider:
- Affordability within the budget
- Rental yield potential
- Capital growth history
- Infrastructure development
- Demographic trends
- Vacancy rates
- Days on market

Return ONLY a JSON array of 3 suburb names.
Example: ["Newstead", "West End", "Paddington"]
No explanations, just the JSON array.`;

  console.log(`[suburb-selector] Selecting 3 suburbs in ${state} for budget $${maxBudget.toLocaleString()}`);

  const response = await askClaude(SYSTEM_PROMPT, userContent);
  const suburbs = JSON.parse(response) as string[];

  console.log(`[suburb-selector] Recommended suburbs:`, suburbs);

  return suburbs.slice(0, 3);
}

export async function getSuburbReasoning(
  state: string,
  suburbs: string[],
  maxBudget: number,
  purpose: string,
  primaryGoal: string
): Promise<string> {
  const userContent = `You recommended these 3 suburbs in ${state} for a property investor:
${suburbs.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Their criteria: budget $${maxBudget.toLocaleString()}, purpose: ${purpose}, goal: ${primaryGoal}.

Write a 2-3 sentence explanation of why these suburbs were selected and what makes them strong investment candidates. Be specific about each suburb's strengths. No JSON, just plain text.`;

  const response = await askClaude(
    "You are an Australian property investment analyst. Write concise, specific suburb recommendations.",
    userContent
  );

  return response;
}
