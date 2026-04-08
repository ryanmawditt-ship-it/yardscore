import { getSuburbPrices } from "./suburb-prices";
import { findSuburbPick } from "./investment-intelligence";

export interface PriceEstimate {
  estimatedPrice: number;
  confidence: "high" | "medium" | "low";
  basis: string;
}

export function estimateListingPrice(
  suburb: string,
  state: string,
  bedrooms: number,
  bathrooms: number | null,
  landSizeM2: number | null,
): PriceEstimate {
  const bedroomMultiplier: Record<number, number> = { 1: 0.65, 2: 0.82, 3: 1.00, 4: 1.22, 5: 1.45 };
  const bedMult = bedroomMultiplier[bedrooms] ?? 1.0;
  const bathMult = bathrooms && bathrooms >= 2 ? 1.05 : 1.0;
  const landMult = landSizeM2 && landSizeM2 > 600 ? 1.08 : 1.0;

  // Source 1: Verified AllHomes median from our scraped data (best)
  const verified = getSuburbPrices(suburb, state);
  if (verified?.median) {
    const est = Math.round(verified.median * bedMult * bathMult * landMult);
    return {
      estimatedPrice: est,
      confidence: "high",
      basis: `Verified AllHomes median $${verified.median.toLocaleString()} for ${suburb} (${verified.pricedListings} listings)`,
    };
  }

  // Source 2: Intelligence handbook
  const pick = findSuburbPick(suburb, state);
  if (pick?.medianHousePrice) {
    const est = Math.round(pick.medianHousePrice * bedMult * bathMult * landMult);
    return {
      estimatedPrice: est,
      confidence: "medium",
      basis: `Yardscore handbook median $${pick.medianHousePrice.toLocaleString()} for ${suburb}`,
    };
  }

  // Source 3: State-level fallback
  const stateFallbacks: Record<string, number> = {
    QLD: 650000, NSW: 900000, VIC: 750000,
    WA: 680000, SA: 580000, TAS: 550000,
    ACT: 800000, NT: 550000,
  };
  const base = stateFallbacks[state.toUpperCase()] ?? 650000;
  const est = Math.round(base * bedMult * bathMult * landMult);

  return {
    estimatedPrice: est,
    confidence: "low",
    basis: `State median estimate for ${state} — price not publicly listed`,
  };
}
