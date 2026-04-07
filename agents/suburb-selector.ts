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
import { askClaude } from "@/lib/claude";

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
  // ── Gather all intelligence sources ──

  // Source 1: Our curated picks for this budget tier
  const picks = getTopPicksForBudget(state, maxBudget);

  // Source 2: Handbook research data
  const handbookGoal = toGoal(primaryGoal);
  const handbookTier = toBudgetTier(maxBudget);
  const handbookSuburbs = querySuburbs({ state: state as State, budgetTier: handbookTier, investmentGoal: handbookGoal });
  const metricType = handbookGoal === "yield" ? "yield" : handbookGoal === "growth" ? "growth" : "combined";
  const topByMetric = getTopSuburbsByMetric(metricType, state as State, handbookTier, 8);

  // Source 3: Live research from knowledge store + in-memory cache
  const kvStateInsights = await KnowledgeStore.getStateInsights(state);
  const kvUrgent = await KnowledgeStore.getUrgentInsights();
  const kvInfraAlerts = await KnowledgeStore.getInfrastructureAlerts(state);
  const kvSentiment = await KnowledgeStore.getLatestSentiment();

  const cacheInsights = getInsightsForState(state);
  const cacheSentiment = getLatestSentiment();

  const stateInsights = kvStateInsights.length > 0
    ? kvStateInsights.map((i) => `${i.title ?? ""}: ${i.summary ?? ""}`.slice(0, 150))
    : cacheInsights.map((i) => `${i.title}: ${i.summary}`.slice(0, 150));

  const urgentSignals = (kvUrgent ?? []).map((i) => `[${i.urgency ?? "medium"}] ${i.title ?? ""}: ${i.summary ?? ""}`.slice(0, 150));

  const infraAlerts = (kvInfraAlerts ?? []).map((a) => `${a.project ?? "Project"} in ${a.location ?? "TBD"}: ${a.impact ?? "TBD"}`.slice(0, 120));

  const sentiment = kvSentiment
    ? { overall: kvSentiment.overallSentiment as string, rates: kvSentiment.interestRateOutlook as string, supply: kvSentiment.housingSupplyOutlook as string, demand: kvSentiment.demandOutlook as string }
    : cacheSentiment
      ? { overall: cacheSentiment.overallSentiment, rates: cacheSentiment.interestRateOutlook, supply: cacheSentiment.housingSupplyOutlook, demand: cacheSentiment.demandOutlook }
      : null;

  // Build candidate list from all sources (deduplicated)
  const candidateMap = new Map<string, string>();
  for (const p of picks) {
    candidateMap.set(p.suburb, `median $${p.medianHousePrice.toLocaleString()}, yield ${p.grossYield}%, vacancy ${p.vacancyRate}% — ${p.rationale}`);
  }
  for (const h of handbookSuburbs) {
    if (!candidateMap.has(h.suburb)) {
      candidateMap.set(h.suburb, `median $${h.medianPrice.toLocaleString()}, growth ${h.annualGrowthPercent}%, yield ${h.grossRentalYield ?? "N/A"}% — ${h.keyDrivers.join(", ")}`);
    }
  }
  for (const h of topByMetric) {
    if (!candidateMap.has(h.suburb)) {
      candidateMap.set(h.suburb, `median $${h.medianPrice.toLocaleString()}, growth ${h.annualGrowthPercent}%, yield ${h.grossRentalYield ?? "N/A"}%`);
    }
  }

  const candidateList = Array.from(candidateMap.entries())
    .map(([suburb, desc]) => `- ${suburb}: ${desc}`)
    .join("\n");

  console.log(`[suburb-selector] Candidates: ${candidateMap.size} suburbs`);
  console.log(`[suburb-selector] State insights: ${stateInsights.length}`);
  console.log(`[suburb-selector] Urgent signals: ${urgentSignals.length}`);
  console.log(`[suburb-selector] Infra alerts: ${infraAlerts.length}`);
  console.log(`[suburb-selector] Sentiment: ${sentiment?.overall ?? "unknown"}`);

  // ── Ask Claude to select the best 3 based on all context ──

  const userContent = `Today's date: ${new Date().toISOString().split("T")[0]}

CURRENT MARKET INTELLIGENCE for ${state}:
${stateInsights.length > 0 ? stateInsights.join("\n") : "No recent intelligence available — use your knowledge of current Australian market conditions."}

${urgentSignals.length > 0 ? `URGENT SIGNALS:\n${urgentSignals.join("\n")}` : ""}

${infraAlerts.length > 0 ? `INFRASTRUCTURE ALERTS:\n${infraAlerts.join("\n")}` : ""}

MARKET SENTIMENT: ${sentiment ? `${sentiment.overall}. Interest rates: ${sentiment.rates}. Supply: ${sentiment.supply}. Demand: ${sentiment.demand}.` : "Neutral — stable conditions."}

CANDIDATE SUBURBS for ${state} at budget $${maxBudget.toLocaleString()}:
${candidateList}

CLIENT REQUIREMENTS:
- Maximum budget: $${maxBudget.toLocaleString()}
- Purpose: ${purpose}
- Property type: ${propertyType}
- Minimum bedrooms: ${bedrooms}+
- Primary goal: ${primaryGoal}
- Minimum yield target: ${yieldTarget}%

Based on ALL of the above — today's intelligence AND the client's specific requirements — select the 3 BEST suburbs from the candidate list.

Important: Vary your recommendations based on the client profile.
For yield-focused investors prioritise regional centres with high rental demand.
For growth-focused investors prioritise infrastructure corridors and gentrifying areas.
For balanced investors prioritise established middle-ring suburbs with both income and growth.
Do not always recommend the same suburbs — the selection must reflect this client's unique needs.

Return ONLY a JSON object with exactly two keys:
{"suburbs": ["Suburb1", "Suburb2", "Suburb3"], "reasoning": "2-3 sentences explaining why these suburbs were chosen for THIS client based on current conditions."}`;

  const systemPrompt =
    "You are an expert Australian property investment analyst selecting suburbs for a client. " +
    "Return ONLY a valid JSON object with 'suburbs' (array of 3 strings) and 'reasoning' (string). " +
    "No markdown, no explanation outside the JSON.";

  try {
    const response = await askClaude(systemPrompt, userContent);
    const parsed = JSON.parse(response) as { suburbs: string[]; reasoning: string };

    const selectedSuburbs = parsed.suburbs.slice(0, 3);
    const reasoning = parsed.reasoning;

    console.log(`[suburb-selector] Claude selected: ${selectedSuburbs.join(", ")}`);
    console.log(`[suburb-selector] Reasoning: ${reasoning.slice(0, 200)}`);

    // Match selected suburbs back to our intelligence data for enrichment
    const selectedPicks = selectedSuburbs
      .map((s) => picks.find((p) => p.suburb.toLowerCase() === s.toLowerCase()))
      .filter((p): p is SuburbPick => p !== undefined);

    const selectedProfiles = selectedSuburbs
      .map((s) =>
        handbookSuburbs.find((h) => h.suburb.toLowerCase() === s.toLowerCase()) ||
        topByMetric.find((h) => h.suburb.toLowerCase() === s.toLowerCase())
      )
      .filter((p): p is SuburbProfile => p !== undefined);

    return {
      suburbs: selectedSuburbs,
      reasoning,
      picks: selectedPicks,
      handbookProfiles: selectedProfiles,
    };
  } catch (error) {
    // Claude call failed — fall back to deterministic selection with variety
    console.error("[suburb-selector] Claude failed, using fallback:", error instanceof Error ? error.message : String(error));

    const goal = primaryGoal.toLowerCase();
    const sorted = [...picks].sort((a, b) => {
      if (goal.includes("yield")) return b.yieldScore - a.yieldScore;
      if (goal.includes("growth")) return b.growthScore - a.growthScore;
      return (b.yieldScore + b.growthScore) - (a.yieldScore + a.growthScore);
    });

    const top3 = sorted.slice(0, 3);
    const fallbackReasoning = top3
      .map((p) => `${p.suburb} (median $${p.medianHousePrice.toLocaleString()}, yield ${p.grossYield}%): ${p.rationale}`)
      .join(" ");

    return {
      suburbs: top3.map((p) => p.suburb),
      reasoning: fallbackReasoning,
      picks: top3,
      handbookProfiles: [],
    };
  }
}
