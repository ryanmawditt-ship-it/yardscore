/**
 * YARDSCORE INTELLIGENCE CLASSIFIER
 * Categorises each piece of intelligence by urgency, impact,
 * timeframe, confidence, and relevance to property investment.
 */

export interface ClassifiedInsight {
  title: string
  summary: string
  source: string
  suburb?: string
  state?: string
  category: string
  urgency: 'breaking' | 'high' | 'medium' | 'low'
  impact: 'positive' | 'negative' | 'neutral'
  timeframe: 'immediate' | '3months' | '6months' | '12months' | 'longterm'
  confidence: 'verified' | 'reported' | 'rumoured'
  relevanceScore: number // 1-10
  classifiedAt: string
}

const HIGH_URGENCY_KEYWORDS = [
  'announced', 'approved', 'construction begins', 'opens',
  'rate decision', 'policy change', 'rezoned', 'da approved',
  'breaking', 'urgent', 'immediately', 'effective immediately',
  'rate cut', 'rate hike', 'emergency', 'collapsed',
]

const BREAKING_KEYWORDS = [
  'breaking', 'just announced', 'emergency', 'effective immediately',
  'rba decision', 'rate cut today', 'rate hike today',
]

const POSITIVE_KEYWORDS = [
  'infrastructure', 'investment', 'growth', 'development',
  'jobs', 'hospital', 'school', 'rail', 'highway', 'upgrade',
  'approved', 'funding', 'billion', 'million', 'rate cut',
  'population growth', 'migration', 'demand', 'shortage',
  'rezoned', 'higher density', 'new station', 'expansion',
  'employment growth', 'construction starts', 'completions down',
]

const NEGATIVE_KEYWORDS = [
  'flood', 'fire', 'contamination', 'closure', 'shutdown',
  'job losses', 'oversupply', 'vacancy rising', 'prices falling',
  'insurance', 'risk', 'rejected', 'cancelled', 'rate hike',
  'crash', 'collapse', 'default', 'foreclosure', 'recession',
  'building defects', 'cladding', 'asbestos', 'council debt',
  'population decline', 'mine closure',
]

const IMMEDIATE_KEYWORDS = [
  'today', 'now', 'immediately', 'effective', 'opens', 'launched',
  'breaking', 'just',
]

const SHORT_TERM_KEYWORDS = [
  'next quarter', 'coming months', 'q1', 'q2', 'q3', 'q4',
  'this year', '2026', 'under construction',
]

const MEDIUM_TERM_KEYWORDS = [
  'proposed', 'planning', 'feasibility', 'expected', 'forecast',
  '2027', '2028',
]

const LONG_TERM_KEYWORDS = [
  '2029', '2030', '2031', '2032', 'olympics', 'decade',
  'long-term', 'master plan', 'vision',
]

const VERIFIED_KEYWORDS = [
  'official', 'government', 'council', 'approved', 'gazetted',
  'abs', 'rba', 'apra', 'minister', 'treasury',
]

const RUMOUR_KEYWORDS = [
  'rumour', 'rumored', 'sources say', 'reportedly', 'allegedly',
  'unconfirmed', 'speculation', 'could', 'might', 'may',
]

export function classifyIntelligence(insight: {
  title?: string
  summary?: string
  source?: string
  suburb?: string
  state?: string
  category?: string
}): ClassifiedInsight {
  const text = JSON.stringify(insight).toLowerCase()

  // Urgency
  const isBreaking = BREAKING_KEYWORDS.some(k => text.includes(k))
  const isHighUrgency = HIGH_URGENCY_KEYWORDS.some(k => text.includes(k))
  const urgency: ClassifiedInsight['urgency'] = isBreaking
    ? 'breaking'
    : isHighUrgency
      ? 'high'
      : text.includes('update') || text.includes('report')
        ? 'medium'
        : 'low'

  // Impact
  const positiveScore = POSITIVE_KEYWORDS.filter(k => text.includes(k)).length
  const negativeScore = NEGATIVE_KEYWORDS.filter(k => text.includes(k)).length
  const impact: ClassifiedInsight['impact'] = positiveScore > negativeScore
    ? 'positive'
    : negativeScore > positiveScore
      ? 'negative'
      : 'neutral'

  // Timeframe
  const timeframe: ClassifiedInsight['timeframe'] = IMMEDIATE_KEYWORDS.some(k => text.includes(k))
    ? 'immediate'
    : SHORT_TERM_KEYWORDS.some(k => text.includes(k))
      ? '3months'
      : MEDIUM_TERM_KEYWORDS.some(k => text.includes(k))
        ? '6months'
        : LONG_TERM_KEYWORDS.some(k => text.includes(k))
          ? 'longterm'
          : '12months'

  // Confidence
  const confidence: ClassifiedInsight['confidence'] = VERIFIED_KEYWORDS.some(k => text.includes(k))
    ? 'verified'
    : RUMOUR_KEYWORDS.some(k => text.includes(k))
      ? 'rumoured'
      : 'reported'

  // Relevance score (1-10)
  let relevanceScore = 5
  // Boost for property-specific content
  if (text.includes('property') || text.includes('real estate') || text.includes('housing')) relevanceScore += 2
  if (text.includes('suburb') || text.includes('rezoning') || text.includes('da ')) relevanceScore += 1
  if (text.includes('infrastructure') || text.includes('transport') || text.includes('rail')) relevanceScore += 1
  // Boost for data-driven content
  if (text.includes('corelogic') || text.includes('sqm') || text.includes('proptrack')) relevanceScore += 1
  // Reduce for tangential content
  if (text.includes('sport') && !text.includes('infrastructure')) relevanceScore -= 1
  if (text.includes('entertainment')) relevanceScore -= 2
  relevanceScore = Math.max(1, Math.min(10, relevanceScore))

  return {
    title: insight.title || '',
    summary: insight.summary || '',
    source: insight.source || '',
    suburb: insight.suburb,
    state: insight.state,
    category: insight.category || 'general',
    urgency,
    impact,
    timeframe,
    confidence,
    relevanceScore,
    classifiedAt: new Date().toISOString(),
  }
}

/** Batch classify and sort by relevance */
export function classifyAndRank(insights: Array<{
  title?: string
  summary?: string
  source?: string
  suburb?: string
  state?: string
  category?: string
}>): ClassifiedInsight[] {
  return insights
    .map(classifyIntelligence)
    .sort((a, b) => {
      // Sort by urgency first, then relevance
      const urgencyOrder = { breaking: 0, high: 1, medium: 2, low: 3 }
      const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      if (urgencyDiff !== 0) return urgencyDiff
      return b.relevanceScore - a.relevanceScore
    })
}
