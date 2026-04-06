/**
 * In-memory cache for the latest research cycle results.
 * Populated by /api/research-update and read by agents.
 */
import type { ClassifiedInsight } from "@/lib/intelligence-classifier";
import type { SentimentResult } from "@/lib/news-sentiment-analyzer";

interface CachedResearch {
  insights: ClassifiedInsight[];
  sentiment: SentimentResult;
  updatedAt: string;
}

let cache: CachedResearch | null = null;

export function setResearchCache(data: CachedResearch) {
  cache = data;
}

export function getResearchCache(): CachedResearch | null {
  return cache;
}

export function getInsightsForSuburb(suburb: string, state: string): ClassifiedInsight[] {
  if (!cache) return [];
  return cache.insights.filter(
    (i) =>
      (i.suburb?.toLowerCase() === suburb.toLowerCase() && i.state?.toUpperCase() === state.toUpperCase()) ||
      (i.state?.toUpperCase() === state.toUpperCase() && !i.suburb)
  );
}

export function getInsightsForState(state: string): ClassifiedInsight[] {
  if (!cache) return [];
  return cache.insights
    .filter((i) => !i.state || i.state.toUpperCase() === state.toUpperCase())
    .slice(0, 10);
}

export function getLatestSentiment(): SentimentResult | null {
  return cache?.sentiment ?? null;
}
