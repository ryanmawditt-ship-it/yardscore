import { askClaude } from "@/lib/claude";

const SYSTEM_PROMPT =
  "You are an expert Australian property investment analyst. " +
  "You recommend suburbs strictly within the client's budget based on current market conditions. " +
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
  const lowEnd = Math.round(maxBudget * 0.6);

  const userContent = `A client wants to buy in ${state} with a MAXIMUM budget of $${maxBudget.toLocaleString()}.

CRITICAL: Only recommend suburbs where the median house price is BELOW $${maxBudget.toLocaleString()}. This is a hard requirement. Do not recommend any suburb where properties typically sell above this budget.

For a budget of $${maxBudget.toLocaleString()}, focus on suburbs where ${bedrooms} bedroom ${propertyType.toLowerCase()}s regularly sell between $${lowEnd.toLocaleString()} and $${maxBudget.toLocaleString()}.

Client criteria:
- Maximum budget: $${maxBudget.toLocaleString()}
- Purpose: ${purpose}
- Property type: ${propertyType}
- Minimum bedrooms: ${bedrooms}
- Primary goal: ${primaryGoal}
- Minimum yield target: ${yieldTarget}%

Recommend exactly 3 suburbs that match ALL criteria, especially the budget.
Return ONLY a JSON array: ["Suburb1", "Suburb2", "Suburb3"]`;

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

Write a 2-3 sentence explanation of why these suburbs were selected. Mention the typical price range in each suburb to confirm they fit the budget. Be specific about each suburb's investment strengths. Do not use markdown formatting like **bold** — write plain text only.`;

  const response = await askClaude(
    "You are an Australian property investment analyst. Write concise, specific suburb recommendations in plain text without any markdown formatting.",
    userContent
  );

  return response;
}
