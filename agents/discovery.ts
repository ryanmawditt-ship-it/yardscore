import { askClaude } from "@/lib/claude";

const SYSTEM_PROMPT =
  "You are an Australian real estate data assistant. " +
  "Generate realistic residential property addresses that could plausibly be for sale. " +
  "Use real street names from the suburb. Include the correct postcode. " +
  "Return ONLY a valid JSON array of address strings. No explanations.";

const SUBURB_PHOTOS: Record<string, string> = {
  redcliffe: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80",
  "north lakes": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  ipswich: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
  caboolture: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  narangba: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
  bundaberg: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  rockhampton: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  toowoomba: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  footscray: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  sunshine: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  werribee: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
  melton: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  ballarat: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  geelong: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  parramatta: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  penrith: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  wollongong: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
  maylands: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  prospect: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  chermside: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
  nundah: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  paddington: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
  bulimba: "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&q=80",
  "new farm": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80",
  ascot: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
};

const DEFAULT_PHOTO = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80";

export function getSuburbPhotoUrl(suburb: string): string {
  return SUBURB_PHOTOS[suburb.toLowerCase()] || DEFAULT_PHOTO;
}

export function buildListingSearchUrl(
  suburb: string,
  state: string,
  postcode: string,
  propertyType: string,
  bedrooms: number,
  maxBudget: number
): string {
  const suburbSlug = suburb.toLowerCase().replace(/\s+/g, "-");
  const stateSlug = state.toLowerCase();
  const typeParam = propertyType.toLowerCase() === "any" ? "house" : propertyType.toLowerCase();
  return `https://www.realestate.com.au/buy/in-${suburbSlug},+${stateSlug}+${postcode}/list-1?propertyTypes=${typeParam}&numBeds-min=${bedrooms}&price-max=${maxBudget}`;
}

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
