/**
 * YARDSCORE NEWS SENTIMENT ANALYZER
 * Analyzes news sentiment to understand market mood using Claude.
 */

import { askClaude } from '@/lib/claude'

export interface SentimentResult {
  overallSentiment: 'bullish' | 'bearish' | 'neutral'
  sentimentScore: number // -100 to 100
  keyThemes: string[]
  policyRisks: string[]
  opportunities: string[]
  interestRateOutlook: 'rising' | 'falling' | 'stable'
  housingSupplyOutlook: 'improving' | 'worsening' | 'stable'
  demandOutlook: 'strong' | 'moderate' | 'weak'
}

const SENTIMENT_SYSTEM_PROMPT =
  'You are an Australian property market sentiment analyst. ' +
  'Analyze news articles and return ONLY a valid JSON object with your analysis. ' +
  'No markdown, no explanation, just the JSON.'

export async function analyzeNewsSentiment(articles: string[]): Promise<SentimentResult> {
  if (articles.length === 0) {
    return defaultSentiment()
  }

  try {
    const userContent = `Analyze the sentiment and extract key themes from these Australian property and economic news articles.

Articles:
${articles.slice(0, 10).join('\n\n---\n\n')}

Return JSON:
{
  "overallSentiment": "bullish|bearish|neutral",
  "sentimentScore": -100 to 100,
  "keyThemes": ["theme1", "theme2"],
  "policyRisks": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"],
  "interestRateOutlook": "rising|falling|stable",
  "housingSupplyOutlook": "improving|worsening|stable",
  "demandOutlook": "strong|moderate|weak"
}`

    const text = await askClaude(SENTIMENT_SYSTEM_PROMPT, userContent)
    const parsed = JSON.parse(text)
    return {
      overallSentiment: parsed.overallSentiment || 'neutral',
      sentimentScore: typeof parsed.sentimentScore === 'number' ? parsed.sentimentScore : 0,
      keyThemes: Array.isArray(parsed.keyThemes) ? parsed.keyThemes : [],
      policyRisks: Array.isArray(parsed.policyRisks) ? parsed.policyRisks : [],
      opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
      interestRateOutlook: parsed.interestRateOutlook || 'stable',
      housingSupplyOutlook: parsed.housingSupplyOutlook || 'stable',
      demandOutlook: parsed.demandOutlook || 'moderate',
    }
  } catch (e) {
    console.error('[sentiment] Analysis failed:', e instanceof Error ? e.message : String(e))
    return defaultSentiment()
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
  }
}
