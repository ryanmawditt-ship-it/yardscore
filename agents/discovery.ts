import { askClaude } from "@/lib/claude";

const SYSTEM_PROMPT =
  "You are an Australian real estate data assistant. " +
  "Generate realistic residential property addresses that could plausibly be for sale. " +
  "Use real street names from the suburb. Include the correct postcode. " +
  "Return ONLY a valid JSON array of address strings. No explanations.";

export async function discoverProperties(
  suburb: string,
  state: string,
  maxBudget: number,
  bedrooms: number,
  propertyType: string
): Promise<string[]> {
  const userContent = `Generate 2 realistic residential property addresses for sale in ${suburb}, ${state}, Australia with asking price under $${maxBudget.toLocaleString()}.

Properties must be ${bedrooms}+ bedroom ${propertyType.toLowerCase()}s.
Use real street names from ${suburb}. Include the correct postcode for ${suburb}, ${state}.

Each address must include: street number, street name, suburb, state abbreviation and postcode.
Return as a JSON array of strings only.
Example: ["14 Langshaw Street, ${suburb} ${state} 4005", "22 Moray Street, ${suburb} ${state} 4005"]
Return only the JSON array, no other text.`;

  console.log(`[discovery] Generating 2 addresses in ${suburb}, ${state} (budget: $${maxBudget.toLocaleString()})`);

  const response = await askClaude(SYSTEM_PROMPT, userContent);
  const addresses = JSON.parse(response) as string[];

  console.log(`[discovery] Generated addresses for ${suburb}:`, addresses);

  return addresses.slice(0, 2);
}
