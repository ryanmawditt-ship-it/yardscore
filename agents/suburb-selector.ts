import { getTopPicksForBudget, SuburbPick } from "@/lib/investment-intelligence";

export interface SuburbSelection {
  suburbs: string[];
  reasoning: string;
  picks: SuburbPick[];
}

export async function selectBestSuburbs(
  state: string,
  maxBudget: number,
  purpose: string,
  propertyType: string,
  bedrooms: number,
  yieldTarget: number,
  primaryGoal: string
): Promise<SuburbSelection> {
  const picks = getTopPicksForBudget(state, maxBudget);

  if (!picks || picks.length === 0) {
    console.log(`[suburb-selector] No intelligence data for ${state} at budget $${maxBudget.toLocaleString()}, using QLD defaults`);
    return {
      suburbs: ["Bundaberg", "Caboolture", "Ipswich"],
      reasoning: "These suburbs offer strong investment fundamentals within your budget.",
      picks: [],
    };
  }

  // Sort by the user's primary goal
  const sorted = [...picks].sort((a, b) => {
    if (primaryGoal.toLowerCase().includes("yield")) return b.yieldScore - a.yieldScore;
    if (primaryGoal.toLowerCase().includes("growth")) return b.growthScore - a.growthScore;
    return b.yieldScore + b.growthScore - (a.yieldScore + a.growthScore);
  });

  const top3 = sorted.slice(0, 3);

  console.log(
    `[suburb-selector] Selected ${top3.map((p) => p.suburb).join(", ")} in ${state} for budget $${maxBudget.toLocaleString()}`
  );

  const reasoning = top3
    .map(
      (p) =>
        `${p.suburb} (median $${p.medianHousePrice.toLocaleString()}, yield ${p.grossYield}%): ${p.rationale}`
    )
    .join("\n\n");

  return {
    suburbs: top3.map((p) => p.suburb),
    reasoning,
    picks: top3,
  };
}
