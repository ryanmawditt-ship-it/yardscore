import { investmentIntelligence } from "./investment-intelligence";
import { KnowledgeStore } from "./knowledge-store";

export interface RentEstimate {
  weeklyRent: number;
  source: "knowledge-store" | "intelligence-handbook" | "bedroom-formula";
  confidence: "high" | "medium" | "low";
}

export async function estimateMarketRent(
  suburb: string,
  state: string,
  bedrooms: number,
  bathrooms: number | null,
  landSize: number | null,
  propertyType: string
): Promise<RentEstimate> {
  // Step 1: Check knowledge store for recent rental data
  try {
    const suburbInsights = await KnowledgeStore.getSuburbInsights(suburb);
    const rentalInsight = suburbInsights.find(
      (i) => String(i.dataType) === "yield" && i.value && String(i.suburb ?? "").toLowerCase() === suburb.toLowerCase()
    );
    if (rentalInsight?.value) {
      const weeklyRent = parseFloat(String(rentalInsight.value));
      if (weeklyRent > 0) {
        return { weeklyRent: Math.round(weeklyRent), source: "knowledge-store", confidence: "high" };
      }
    }
  } catch {
    // KV not available — continue
  }

  // Step 2: Check investment intelligence handbook
  const stateData = investmentIntelligence[state];
  if (stateData) {
    for (const tier of Object.values(stateData)) {
      const pick = tier.topPicks.find(
        (p) => p.suburb.toLowerCase() === suburb.toLowerCase()
      );
      if (pick) {
        const baseRent = pick.medianWeeklyRent;
        const bedroomMultiplier: Record<number, number> = { 1: 0.70, 2: 0.85, 3: 1.00, 4: 1.20, 5: 1.40 };
        const multiplier = bedroomMultiplier[bedrooms] ?? 1.0;
        return { weeklyRent: Math.round(baseRent * multiplier), source: "intelligence-handbook", confidence: "high" };
      }
    }
  }

  // Step 3: Bedroom-based formula with state averages
  const stateBaseRents: Record<string, Record<string, number>> = {
    QLD: { house: 550, unit: 420 },
    NSW: { house: 680, unit: 520 },
    VIC: { house: 580, unit: 450 },
    WA: { house: 620, unit: 480 },
    SA: { house: 480, unit: 370 },
    TAS: { house: 440, unit: 340 },
    ACT: { house: 680, unit: 520 },
    NT: { house: 580, unit: 440 },
  };

  const typeKey = propertyType.toLowerCase() === "unit" ? "unit" : "house";
  const baseRent = stateBaseRents[state.toUpperCase()]?.[typeKey] ?? 500;

  const bedroomMultiplier: Record<number, number> = { 1: 0.65, 2: 0.82, 3: 1.00, 4: 1.22, 5: 1.45 };
  const bathroomPremium = bathrooms && bathrooms >= 2 ? 1.05 : 1.0;
  const landPremium = landSize && landSize > 600 ? 1.08 : 1.0;
  const multiplier = (bedroomMultiplier[bedrooms] ?? 1.0) * bathroomPremium * landPremium;

  return { weeklyRent: Math.round(baseRent * multiplier), source: "bedroom-formula", confidence: "medium" };
}

export function calculateGrossYield(weeklyRent: number, purchasePrice: number): number {
  if (purchasePrice <= 0) return 0;
  return (weeklyRent * 52 / purchasePrice) * 100;
}

export function calculateNetYield(weeklyRent: number, purchasePrice: number): number {
  if (purchasePrice <= 0) return 0;
  const annualRent = weeklyRent * 52;
  const expenses = annualRent * 0.08 + purchasePrice * 0.01 + 2000 + 1500;
  return ((annualRent - expenses) / purchasePrice) * 100;
}

export function calculateWeeklyCashflow(
  weeklyRent: number,
  purchasePrice: number,
  lvr = 0.80,
  interestRate = 0.065
): number {
  const weeklyInterest = (purchasePrice * lvr * interestRate) / 52;
  const weeklyExpenses = weeklyInterest + weeklyRent * 0.08 + (purchasePrice * 0.01) / 52 + 2000 / 52 + 1500 / 52;
  return Math.round(weeklyRent - weeklyExpenses);
}
