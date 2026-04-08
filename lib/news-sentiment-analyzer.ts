/**
 * YARDSCORE NEWS SENTIMENT ANALYZER
 * Uses the sentiment lexicon for instant analysis — no API calls needed.
 * Scans all articles through 500+ property-specific terms.
 */

import { scoreArticle, getMostFrequent } from '@/lib/sentiment-lexicon'

export interface SentimentResult {
  overallSentiment: 'bullish' | 'bearish' | 'neutral'
  sentimentScore: number // -100 to 100
  keyThemes: string[]
  policyRisks: string[]
  opportunities: string[]
  interestRateOutlook: 'rising' | 'falling' | 'stable'
  housingSupplyOutlook: 'improving' | 'worsening' | 'stable'
  demandOutlook: 'strong' | 'moderate' | 'weak'
  // New: lexicon-powered detail
  bullishSignals: string[]
  bearishSignals: string[]
  infrastructureSignals: string[]
  rentalSignals: string[]
  articlesScored: number
  avgArticleScore: number
}

export async function analyzeNewsSentiment(articles: string[]): Promise<SentimentResult> {
  if (articles.length === 0) return defaultSentiment()

  // Score every article through the lexicon
  const scores = articles.map(a => scoreArticle(a))
  const avgScore = scores.reduce((sum, s) => sum + s.normalisedScore, 0) / scores.length

  const allBullish = scores.flatMap(s => s.bullishTermsFound)
  const allBearish = scores.flatMap(s => s.bearishTermsFound)
  const allInfra = scores.flatMap(s => s.infrastructureSignals)
  const allPolicy = scores.flatMap(s => s.policySignals)
  const allRental = scores.flatMap(s => s.rentalSignals)

  const bearishPolicies = allPolicy.filter(p => p.includes('bearish'))
  const bullishPolicies = allPolicy.filter(p => p.includes('bullish'))

  return {
    overallSentiment: avgScore >= 6 ? 'bullish' : avgScore <= 4 ? 'bearish' : 'neutral',
    sentimentScore: Math.round((avgScore - 5) * 20), // maps 0-10 to -100 to +100
    keyThemes: getMostFrequent([...allBullish, ...allBearish], 5),
    policyRisks: getMostFrequent(bearishPolicies.map(p => p.replace(' (bearish)', '')), 3),
    opportunities: getMostFrequent(allBullish, 3),
    interestRateOutlook: allPolicy.some(p => p.includes('rate cut') || p.includes('rate reduction'))
      ? 'falling'
      : allPolicy.some(p => p.includes('rate rise') || p.includes('rate hike') || p.includes('rate increase'))
        ? 'rising'
        : 'stable',
    housingSupplyOutlook: allBullish.some(t => t.includes('shortage') || t.includes('undersupply'))
      ? 'worsening'
      : allBearish.some(t => t.includes('oversupply'))
        ? 'improving'
        : 'stable',
    demandOutlook: avgScore >= 6 ? 'strong' : avgScore <= 4 ? 'weak' : 'moderate',
    // Lexicon details
    bullishSignals: getMostFrequent(allBullish, 10),
    bearishSignals: getMostFrequent(allBearish, 10),
    infrastructureSignals: getMostFrequent(allInfra.map(s => s.replace(/ \(\+\d+\)/, '')), 5),
    rentalSignals: getMostFrequent(allRental.map(s => s.replace(/ \((bullish|bearish)\)/, '')), 5),
    articlesScored: scores.length,
    avgArticleScore: Math.round(avgScore * 10) / 10,
  }
}

function defaultSentiment(): SentimentResult {
  return {
    overallSentiment: 'neutral',
    sentimentScore: 0,
    keyThemes: [],
    policyRisks: [],
    opportunities: [],
    interestRateOutlook: 'stable',
    housingSupplyOutlook: 'stable',
    demandOutlook: 'moderate',
    bullishSignals: [],
    bearishSignals: [],
    infrastructureSignals: [],
    rentalSignals: [],
    articlesScored: 0,
    avgArticleScore: 5,
  }
}
