import { getTopPicksForBudget, SuburbPick } from "@/lib/investment-intelligence";
import {
  querySuburbs,
  getTopSuburbsByMetric,
  type State,
  type BudgetTier,
  type InvestmentGoal,
  type SuburbProfile,
} from "@/lib/investors-handbook";
import { getInsightsForState, getLatestSentiment } from "@/lib/research-cache";
import { KnowledgeStore } from "@/lib/knowledge-store";

export interface SuburbSelection {
  suburbs: string[];
  reasoning: string;
  picks: SuburbPick[];
  handbookProfiles: SuburbProfile[];
}

function toBudgetTier(budget: number): BudgetTier {
  if (budget <= 500000) return "under_500k";
  if (budget <= 750000) return "500k_750k";
  if (budget <= 1000000) return "750k_1m";
  return "over_1m";
}

function toGoal(primaryGoal: string): InvestmentGoal {
  if (primaryGoal.toLowerCase().includes("yield")) return "yield";
  if (primaryGoal.toLowerCase().includes("growth")) return "growth";
  return "balanced";
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
  // Source 1: Our curated intelligence picks
  const picks = getTopPicksForBudget(state, maxBudget);

  // Source 2: Investors Handbook research data
  const handbookGoal = toGoal(primaryGoal);
  const handbookTier = toBudgetTier(maxBudget);
  const handbookSuburbs = querySuburbs({
    state: state as State,
    budgetTier: handbookTier,
    investmentGoal: handbookGoal,
  });

  // Also get top suburbs by the user's preferred metric from handbook
  const metricType = handbookGoal === "yield" ? "yield" : handbookGoal === "growth" ? "growth" : "combined";
  const topByMetric = getTopSuburbsByMetric(metricType, state as State, handbookTier, 5);

  console.log(`[suburb-selector] Intelligence picks: ${picks.map((p) => p.suburb).join(", ")}`);
  console.log(`[suburb-selector] Handbook matches: ${handbookSuburbs.map((s) => s.suburb).join(", ")}`);
  console.log(`[suburb-selector] Handbook top by ${metricType}: ${topByMetric.map((s) => s.suburb).join(", ")}`);

  if (!picks || picks.length === 0) {
    // Fall back to handbook data only
    if (topByMetric.length > 0) {
      const top3 = topByMetric.slice(0, 3);
      return {
        suburbs: top3.map((s) => s.suburb),
        reasoning: top3
          .map((s) => `${s.suburb} (median $${s.medianPrice.toLocaleString()}, ${s.annualGrowthPercent}% annual growth, yield ${s.grossRentalYield ?? "N/A"}%): ${s.keyDrivers.join(". ")}${s.notes ? " " + s.notes : ""}`)
          .join("\n\n"),
        picks: [],
        handbookProfiles: top3,
      };
    }
    return {
      suburbs: ["Bundaberg", "Caboolture", "Ipswich"],
      reasoning: "These suburbs offer strong investment fundamentals within your budget.",
      picks: [],
      handbookProfiles: [],
    };
  }

  // Sort intelligence picks by goal
  const sorted = [...picks].sort((a, b) => {
    if (primaryGoal.toLowerCase().includes("yield")) return b.yieldScore - a.yieldScore;
    if (primaryGoal.toLowerCase().includes("growth")) return b.growthScore - a.growthScore;
    return b.yieldScore + b.growthScore - (a.yieldScore + a.growthScore);
  });

  const top3 = sorted.slice(0, 3);

  // Get recent research insights — try KV persistent store first, fall back to in-memory cache
  const kvStateInsights = await KnowledgeStore.getStateInsights(state);
  const kvSentiment = await KnowledgeStore.getLatestSentiment();
  const kvInfraAlerts = await KnowledgeStore.getInfrastructureAlerts(state);

  // Fall back to in-memory cache if KV is empty
  const cacheInsights = getInsightsForState(state);
  const cacheSentiment = getLatestSentiment();

  const stateInsights = kvStateInsights.length > 0 ? kvStateInsights.map(i => ({
    title: (i.title as string) || '',
    summary: (i.summary as string) || '',
    suburb: i.suburb as string | undefined,
    state: i.state as string | undefined,
    urgency: (i.urgency as string) || 'medium',
    impact: (i.impact as string) || 'neutral',
    category: (i.category as string) || 'general',
    source: (i.source as string) || '',
    relevanceScore: (i.relevanceScore as number) || 5,
    classifiedAt: (i.classifiedAt as string) || '',
    timeframe: (i.timeframe as string) || '12months',
    confidence: (i.confidence as string) || 'reported',
  })) : cacheInsights;
  const sentiment = kvSentiment ? {
    overallSentiment: (kvSentiment.overallSentiment as string) || 'neutral',
    sentimentScore: (kvSentiment.sentimentScore as number) || 0,
    interestRateOutlook: (kvSentiment.interestRateOutlook as string) || 'stable',
    housingSupplyOutlook: (kvSentiment.housingSupplyOutlook as string) || 'stable',
    demandOutlook: (kvSentiment.demandOutlook as string) || 'moderate',
    keyThemes: (kvSentiment.keyThemes as string[]) || [],
    policyRisks: (kvSentiment.policyRisks as string[]) || [],
    opportunities: (kvSentiment.opportunities as string[]) || [],
  } : cacheSentiment;

  // Enrich reasoning with handbook data and live research
  const reasoning = top3
    .map((p) => {
      const handbookMatch = handbookSuburbs.find(
        (h) => h.suburb.toLowerCase() === p.suburb.toLowerCase()
      );
      let text = `${p.suburb} (median $${p.medianHousePrice.toLocaleString()}, yield ${p.grossYield}%): ${p.rationale}`;
      if (handbookMatch) {
        text += ` Research data: ${handbookMatch.annualGrowthPercent}% annual growth, vacancy ${handbookMatch.vacancyRate ?? "N/A"}%, ${handbookMatch.daysOnMarket ? handbookMatch.daysOnMarket + " days on market" : ""}. Key drivers: ${handbookMatch.keyDrivers.join(", ")}.`;
      }
      // Add any recent research insights for this suburb
      const suburbInsights = stateInsights.filter(
        (i) => i.suburb?.toLowerCase() === p.suburb.toLowerCase()
      );
      if (suburbInsights.length > 0) {
        text += ` Recent intelligence: ${suburbInsights.map((i) => i.title).join("; ")}.`;
      }
      return text;
    })
    .join("\n\n");

  // Append infrastructure alerts from KV
  const infraContext = kvInfraAlerts.length > 0
    ? `\n\nInfrastructure alerts for ${state}: ${kvInfraAlerts.slice(0, 3).map(a => `${a.project || 'Project'} in ${a.location || 'TBD'}: ${a.impact || 'TBD'}`).join('; ')}.`
    : '';

  // Append market sentiment if available
  const fullReasoning = sentiment
    ? `${reasoning}${infraContext}\n\nMarket sentiment: ${sentiment.overallSentiment} (score: ${sentiment.sentimentScore}). Interest rate outlook: ${sentiment.interestRateOutlook}. Supply outlook: ${sentiment.housingSupplyOutlook}. Demand: ${sentiment.demandOutlook}.`
    : `${reasoning}${infraContext}`;

  if (stateInsights.length > 0) {
    console.log(`[suburb-selector] Enriched with ${stateInsights.length} research insights for ${state}`);
  }

  // Collect matching handbook profiles for the selected suburbs
  const matchedProfiles = top3
    .map((p) =>
      handbookSuburbs.find((h) => h.suburb.toLowerCase() === p.suburb.toLowerCase()) ||
      topByMetric.find((h) => h.suburb.toLowerCase() === p.suburb.toLowerCase())
    )
    .filter((p): p is SuburbProfile => p !== undefined);

  console.log(
    `[suburb-selector] Selected ${top3.map((p) => p.suburb).join(", ")} in ${state} for budget $${maxBudget.toLocaleString()}`
  );

  return {
    suburbs: top3.map((p) => p.suburb),
    reasoning: fullReasoning,
    picks: top3,
    handbookProfiles: matchedProfiles,
  };
}
