/**
 * YARDSCORE RESEARCH AGENT
 * Fetches RSS feeds from all configured sources, extracts property
 * investment intelligence using Claude, classifies insights, and
 * integrates council DA monitoring and news sentiment analysis.
 */

import axios from 'axios'
import { askClaude } from '@/lib/claude'
import { getAllFeedUrls, getSourceCount } from '@/lib/research-sources'
import { classifyAndRank, type ClassifiedInsight } from '@/lib/intelligence-classifier'
import { monitorCouncilDAs, type DAInsight } from '@/lib/council-da-monitor'
import { analyzeNewsSentiment, type SentimentResult } from '@/lib/news-sentiment-analyzer'
import { KnowledgeStore } from '@/lib/knowledge-store'
import { scoreArticle } from '@/lib/sentiment-lexicon'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface FeedItem {
  title: string
  link: string
  description: string
  pubDate: string
  source: string
}

export interface ResearchCycleResult {
  feedsScanned: number
  feedsSuccessful: number
  articlesFound: number
  insights: ClassifiedInsight[]
  daInsights: DAInsight[]
  sentiment: SentimentResult
  sourcesMonitored: number
  completedAt: string
  durationMs: number
  kvStats: {
    totalInsights: number
    urgentInsights: number
    infraAlerts: number
    sentimentHistory: number
    kvConfigured: boolean
  }
}

// ─────────────────────────────────────────────────────────────
// RSS FEED PARSER (lightweight, no extra dependency)
// ─────────────────────────────────────────────────────────────

function extractTagContent(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  const match = xml.match(regex)
  return (match?.[1] || match?.[2] || '').trim()
}

function parseRssFeed(xml: string, sourceUrl: string): FeedItem[] {
  const items: FeedItem[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match: RegExpExecArray | null

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    const title = extractTagContent(itemXml, 'title')
    const link = extractTagContent(itemXml, 'link')
    const description = extractTagContent(itemXml, 'description')
      .replace(/<[^>]+>/g, '') // strip HTML tags
      .slice(0, 500)
    const pubDate = extractTagContent(itemXml, 'pubDate')

    if (title) {
      items.push({ title, link, description, pubDate, source: sourceUrl })
    }
  }

  // Also handle Atom feeds (<entry> instead of <item>)
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi
  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1]
    const title = extractTagContent(entryXml, 'title')
    const linkMatch = entryXml.match(/<link[^>]*href="([^"]*)"/)
    const link = linkMatch?.[1] || extractTagContent(entryXml, 'link')
    const description = (extractTagContent(entryXml, 'summary') || extractTagContent(entryXml, 'content'))
      .replace(/<[^>]+>/g, '')
      .slice(0, 500)
    const pubDate = extractTagContent(entryXml, 'published') || extractTagContent(entryXml, 'updated')

    if (title) {
      items.push({ title, link, description, pubDate, source: sourceUrl })
    }
  }

  return items
}

// ─────────────────────────────────────────────────────────────
// FETCH ALL FEEDS
// ─────────────────────────────────────────────────────────────

async function fetchFeed(url: string): Promise<FeedItem[]> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Yardscore/1.0 Research Bot',
        Accept: 'application/rss+xml, application/xml, text/xml, application/atom+xml',
      },
      responseType: 'text',
    })
    return parseRssFeed(response.data, url)
  } catch {
    return []
  }
}

async function fetchAllFeeds(): Promise<{ items: FeedItem[]; scanned: number; successful: number }> {
  const urls = getAllFeedUrls()
  const results = await Promise.allSettled(urls.map(url => fetchFeed(url)))

  const allItems: FeedItem[] = []
  let successful = 0

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      allItems.push(...result.value)
      successful++
    }
  }

  return { items: allItems, scanned: urls.length, successful }
}

// ─────────────────────────────────────────────────────────────
// INTELLIGENCE EXTRACTION
// ─────────────────────────────────────────────────────────────

const EXTRACTION_SYSTEM_PROMPT =
  'You are an Australian property investment intelligence analyst. ' +
  'Extract actionable insights from news articles and data feeds. ' +
  'Return ONLY a valid JSON array of insight objects. No markdown, no explanation.'

const EXTRACTION_SIGNALS = `Pay special attention to these high-value signals:

COUNCIL DA ALERTS (Development Applications):
- New rezoning applications that could increase density
- Major development applications near residential areas
- Objections to developments that might indicate NIMBYism
- Infrastructure contributions from developers

NEWS SENTIMENT SIGNALS:
- Government housing policy announcements
- Interest rate decisions and forecasts
- Migration policy changes
- Foreign investment rule changes
- Negative gearing policy discussions
- First home buyer scheme changes

INFRASTRUCTURE PROPOSALS (not yet approved):
- Roads being proposed to state or federal government
- New school proposals
- Hospital expansion plans
- Shopping centre proposals
- University campus expansions
- Sports facility proposals
- Public transport route proposals

ECONOMIC SIGNALS:
- Employment data by region
- Business investment announcements
- Factory or distribution centre openings
- Major employer relocations
- Mine openings or closures
- Port expansions

RISK SIGNALS:
- Insurance company changes to coverage areas
- Flood mapping reviews
- Climate risk assessments
- Council financial stress indicators
- Oversupply warnings from developers
- Building company collapses affecting settlements`

/** Sort articles by source priority and take the top N most relevant */
function prioritiseArticles(items: FeedItem[], limit: number): FeedItem[] {
  function getSourcePriority(source: string): number {
    // Priority 1: Google News property-specific searches
    if (source.includes('news.google.com') && (
      source.includes('property') || source.includes('real+estate') ||
      source.includes('housing') || source.includes('infrastructure')
    )) return 1
    // Priority 2: Property media blogs
    if (source.includes('propertyupdate') || source.includes('realestate.com.au') ||
        source.includes('propertyology') || source.includes('propertychat') ||
        source.includes('yourinvestmentproperty') || source.includes('apimagazine') ||
        source.includes('eliteagent') || source.includes('microburbs')) return 2
    // Priority 3: Government and economic sources
    if (source.includes('treasury') || source.includes('rba.gov') ||
        source.includes('investing.com') || source.includes('gov.au')) return 3
    // Priority 4: Reddit property discussion
    if (source.includes('reddit.com')) return 4
    // Priority 5: General news
    return 5
  }

  return [...items]
    .sort((a, b) => getSourcePriority(a.source) - getSourcePriority(b.source))
    .slice(0, limit)
}

/** Call Claude with a timeout wrapper */
async function askClaudeWithTimeout(system: string, user: string, timeoutMs: number): Promise<string> {
  return Promise.race([
    askClaude(system, user),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Claude call timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ])
}

const BATCH_SIZE = 5
const MAX_ARTICLES = 30
const BATCH_TIMEOUT_MS = 45_000
const BATCH_DELAY_MS = 2_000

async function extractIntelligence(items: FeedItem[]): Promise<Array<{
  title: string
  summary: string
  source: string
  suburb?: string
  state?: string
  category: string
}>> {
  if (items.length === 0) return []

  // Prioritise and limit articles
  const prioritised = prioritiseArticles(items, MAX_ARTICLES)
  const totalBatches = Math.ceil(prioritised.length / BATCH_SIZE)
  console.log(`[research] Processing ${prioritised.length} priority articles in ${totalBatches} batches of ${BATCH_SIZE}`)

  const allInsights: Array<{
    title: string
    summary: string
    source: string
    suburb?: string
    state?: string
    category: string
  }> = []

  for (let i = 0; i < prioritised.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const batch = prioritised.slice(i, i + BATCH_SIZE)
    console.log(`[research] Processing batch ${batchNum} of ${totalBatches} (${batch.length} articles)`)

    try {
      // Pre-score each article with the sentiment lexicon
      const articlesText = batch.map((item, idx) => {
        const articleText = `${item.title} ${item.description}`
        const lexiconScore = scoreArticle(articleText)
        const signals = lexiconScore.topSignals.length > 0
          ? `\nPre-scored: ${lexiconScore.sentiment} (${lexiconScore.normalisedScore}/10). Signals: ${lexiconScore.topSignals.join(', ')}`
          : ''
        return `[${idx + 1}] ${item.title}\n${item.description}\nSource: ${item.source}${signals}`
      }).join('\n\n')

      const userContent = `Extract property investment intelligence from these articles.
Each article has been pre-scored by our sentiment lexicon — use those scores to inform your analysis.

${EXTRACTION_SIGNALS}

Articles:
${articlesText}

Return a JSON array where each object has:
{
  "title": "concise insight title",
  "summary": "2-3 sentence actionable summary for property investors",
  "source": "source URL",
  "suburb": "affected suburb if identifiable, or null",
  "state": "Australian state code (QLD/NSW/VIC/WA/SA/TAS/NT/ACT) or null",
  "category": "infrastructure|policy|market_data|risk|economic|demographic|construction|rental|finance|council_da"
}

Only include insights relevant to Australian property investment. Skip generic or irrelevant articles.`

      const text = await askClaudeWithTimeout(EXTRACTION_SYSTEM_PROMPT, userContent, BATCH_TIMEOUT_MS)
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        console.log(`[research] Batch ${batchNum}: extracted ${parsed.length} insights`)
        allInsights.push(...parsed)
      }
    } catch (e) {
      console.error(`[research] Batch ${batchNum} failed:`, e instanceof Error ? e.message : String(e))
    }

    // Delay between batches to avoid rate limits
    if (i + BATCH_SIZE < prioritised.length) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  return allInsights
}

// ─────────────────────────────────────────────────────────────
// SUBURB SCORING — updates scores based on today's articles
// No Claude API calls needed — uses article impact directly
// ─────────────────────────────────────────────────────────────

/**
 * Update suburb scores based on today's classified insights.
 * Positive articles push scores up, negative articles push them down.
 * Uses the lexicon pre-scores already attached to each insight.
 */
async function updateSuburbScoresFromInsights(
  insights: ClassifiedInsight[],
  sentiment: SentimentResult,
): Promise<void> {
  // Group insights by suburb
  const suburbMap = new Map<string, ClassifiedInsight[]>()
  for (const i of insights) {
    if (!i.suburb || !i.state) continue
    const key = `${i.suburb}|${i.state}`
    if (!suburbMap.has(key)) suburbMap.set(key, [])
    suburbMap.get(key)!.push(i)
  }

  if (suburbMap.size === 0) {
    console.log('[research] No suburb-specific insights to update scores')
    return
  }

  let updated = 0
  for (const [key, articles] of Array.from(suburbMap.entries())) {
    const [suburb, state] = key.split('|')

    // Get existing score (may be null if suburb not yet scored)
    const existing = await KnowledgeStore.getSuburbScore(suburb, state)

    const positive = articles.filter(a => a.impact === 'positive')
    const negative = articles.filter(a => a.impact === 'negative')
    const infra = articles.filter(a => a.category === 'infrastructure')
    const rental = articles.filter(a => a.category === 'rental')

    // Calculate sentiment adjustment from today's articles
    // Each positive article: +0.5, each negative: -0.5
    const sentimentDelta = (positive.length * 0.5) - (negative.length * 0.5)

    // Base scores — use existing or start from 5 (neutral)
    const baseYield = (existing?.yieldScore as number) ?? 5
    const baseGrowth = (existing?.growthScore as number) ?? 5
    const baseInfra = (existing?.infrastructureScore as number) ?? 5
    const baseRisk = (existing?.riskScore as number) ?? 5
    const baseSentiment = (existing?.sentimentScore as number) ?? 5

    // Apply adjustments
    const newSentiment = Math.max(0, Math.min(10, baseSentiment + sentimentDelta))
    const newInfra = infra.length > 0
      ? Math.min(10, baseInfra + infra.length * 0.5)
      : baseInfra
    const newRisk = negative.some(a => a.category === 'risk')
      ? Math.max(0, baseRisk - 0.5)
      : baseRisk
    const newYield = rental.some(a => a.impact === 'positive')
      ? Math.min(10, baseYield + 0.3)
      : rental.some(a => a.impact === 'negative')
        ? Math.max(0, baseYield - 0.3)
        : baseYield
    const newGrowth = positive.length > negative.length
      ? Math.min(10, baseGrowth + 0.3)
      : negative.length > positive.length
        ? Math.max(0, baseGrowth - 0.3)
        : baseGrowth

    // Weighted overall score
    const overallScore = Math.round(
      (newYield * 0.25 + newGrowth * 0.25 + newInfra * 0.20 + newRisk * 0.15 + newSentiment * 0.15) * 10
    ) / 10

    // Build key reasons from today's articles
    const keyReasons = articles.slice(0, 3).map(a =>
      `[${a.impact}] ${a.title}`
    )
    // Keep existing reasons if we have them
    const existingReasons = (existing?.keyReasons as string[]) || []
    const mergedReasons = [...keyReasons, ...existingReasons.slice(0, 2)].slice(0, 5)

    await KnowledgeStore.saveSuburbScore(suburb, state, {
      yieldScore: Math.round(newYield * 10) / 10,
      growthScore: Math.round(newGrowth * 10) / 10,
      infrastructureScore: Math.round(newInfra * 10) / 10,
      riskScore: Math.round(newRisk * 10) / 10,
      sentimentScore: Math.round(newSentiment * 10) / 10,
      overallScore,
      priceRange: (existing?.priceRange as string) || 'N/A',
      keyReasons: mergedReasons,
      lastUpdated: new Date().toISOString(),
    })

    const direction = sentimentDelta > 0 ? '+' + sentimentDelta.toFixed(1) : sentimentDelta.toFixed(1)
    console.log(`[scoring] ${suburb}, ${state}: sentiment ${direction} → overall ${overallScore} (${positive.length}+ ${negative.length}-)`)
    updated++
  }

  console.log(`[research] Updated scores for ${updated} suburbs from today's ${insights.length} insights`)
}

/**
 * Seed scores for handbook suburbs that don't have a score yet.
 * Uses static data from investment-intelligence.ts as baseline.
 * Only runs for suburbs not already in the database.
 */
async function seedMissingSuburbScores(sentiment: SentimentResult): Promise<void> {
  try {
    const { investmentIntelligence } = await import('@/lib/investment-intelligence')

    let seeded = 0
    for (const [state, tiers] of Object.entries(investmentIntelligence)) {
      for (const tier of Object.values(tiers)) {
        for (const pick of (tier as { topPicks: Array<{
          suburb: string; yieldScore: number; growthScore: number;
          riskScore: number; medianHousePrice: number;
          infrastructureProjects: string[]; rationale: string
        }> }).topPicks || []) {
          // Check if score already exists
          const existing = await KnowledgeStore.getSuburbScore(pick.suburb, state)
          if (existing) continue // Already scored, skip

          const yieldScore = Math.min(10, pick.yieldScore)
          const growthScore = Math.min(10, pick.growthScore)
          const infraScore = Math.min(10, (pick.infrastructureProjects?.length || 0) * 2 + 2)
          const riskScore = Math.min(10, 10 - pick.riskScore)
          const sentimentScore = sentiment.overallSentiment === 'bullish' ? 6 : sentiment.overallSentiment === 'bearish' ? 4 : 5

          const overallScore = Math.round(
            (yieldScore * 0.25 + growthScore * 0.25 + infraScore * 0.2 + riskScore * 0.15 + sentimentScore * 0.15) * 10
          ) / 10

          const priceK = Math.round(pick.medianHousePrice / 1000)
          await KnowledgeStore.saveSuburbScore(pick.suburb, state, {
            yieldScore, growthScore, infrastructureScore: infraScore,
            riskScore, sentimentScore, overallScore,
            priceRange: `$${Math.round(priceK * 0.85)}k–$${Math.round(priceK * 1.15)}k`,
            keyReasons: [pick.rationale?.slice(0, 100) || 'Handbook baseline'],
            lastUpdated: new Date().toISOString(),
          })
          seeded++
        }
      }
    }
    if (seeded > 0) console.log(`[research] Seeded ${seeded} new suburb scores from handbook`)
  } catch (e) {
    console.error('[research] Handbook seed failed:', e instanceof Error ? e.message : String(e))
  }
}

// ─────────────────────────────────────────────────────────────
// FULL RESEARCH CYCLE
// ─────────────────────────────────────────────────────────────

export async function runFullResearchCycle(): Promise<ResearchCycleResult> {
  const startTime = Date.now()
  console.log(`[research] Starting full research cycle — ${getSourceCount()} sources configured`)

  // Step 1: Fetch all RSS feeds
  console.log('[research] Step 1: Fetching RSS feeds...')
  const { items: allItems, scanned, successful } = await fetchAllFeeds()
  console.log(`[research] Fetched ${allItems.length} articles from ${successful}/${scanned} feeds`)

  // Step 2: Council DA monitoring (parallel with intelligence extraction)
  console.log('[research] Step 2: Extracting intelligence + monitoring council DAs...')
  const [daInsights, rawInsights] = await Promise.all([
    monitorCouncilDAs(),
    extractIntelligence(allItems),
  ])
  console.log(`[research] Scanned ${daInsights.length} council DA portals`)
  console.log(`[research] Extracted ${rawInsights.length} raw insights from ${Math.min(allItems.length, MAX_ARTICLES)} priority articles`)

  // Step 3: News sentiment analysis (lexicon-powered — scans ALL articles, no API calls)
  console.log('[research] Step 3: Analyzing news sentiment via lexicon...')
  const allArticleTexts = allItems.map(item => `${item.title}\n${item.description}`)
  const sentiment = await analyzeNewsSentiment(allArticleTexts)
  console.log(`[research] Sentiment: ${sentiment.overallSentiment} (${sentiment.sentimentScore}). ${sentiment.articlesScored} articles scored, avg ${sentiment.avgArticleScore}/10`)
  console.log(`[research] Top bullish: ${sentiment.bullishSignals.slice(0, 3).join(', ')}`)
  console.log(`[research] Top bearish: ${sentiment.bearishSignals.slice(0, 3).join(', ')}`)

  // Step 4: Classify and rank all insights
  console.log('[research] Step 4: Classifying insights...')
  const classifiedInsights = classifyAndRank(rawInsights)
  console.log(`[research] Classified ${classifiedInsights.length} insights`)

  // Step 5: Persist to knowledge store (KV)
  console.log('[research] Step 5: Persisting to knowledge store...')
  let savedCount = 0
  let mentionCount = 0
  for (const insight of classifiedInsights) {
    await KnowledgeStore.saveInsight(insight as unknown as Record<string, unknown>)
    // Save infrastructure-category insights as infrastructure alerts too
    if (insight.category === 'infrastructure') {
      await KnowledgeStore.saveInfrastructureAlert({
        project: insight.title,
        location: insight.suburb || 'Unknown',
        state: insight.state || 'Unknown',
        impact: insight.summary,
        urgency: insight.urgency,
        source: insight.source,
      })
    }
    // Track suburb mentions for trending
    if (insight.suburb && insight.state) {
      await KnowledgeStore.incrementSuburbMention(insight.suburb, insight.state)
      mentionCount++
    }
    savedCount++
  }
  // Persist sentiment
  await KnowledgeStore.saveSentiment(sentiment as unknown as Record<string, unknown>)

  // Step 6: Update suburb scores from today's insights (fast, no Claude call)
  console.log('[research] Step 6: Updating suburb scores from today\'s insights...')
  await updateSuburbScoresFromInsights(classifiedInsights, sentiment)

  // Step 7: Seed scores for any handbook suburbs not yet scored
  console.log('[research] Step 7: Seeding missing suburb scores from handbook...')
  await seedMissingSuburbScores(sentiment)

  const kvStats = await KnowledgeStore.getStats()
  console.log(`[research] Persisted ${savedCount} insights, ${mentionCount} suburb mentions to KV. Total in store: ${kvStats.totalInsights} insights, ${kvStats.infraAlerts} infra alerts, ${kvStats.sentimentHistory} sentiment records`)

  const durationMs = Date.now() - startTime
  console.log(`[research] Full cycle completed in ${durationMs}ms`)

  return {
    feedsScanned: scanned,
    feedsSuccessful: successful,
    articlesFound: allItems.length,
    insights: classifiedInsights,
    daInsights,
    sentiment,
    sourcesMonitored: getSourceCount(),
    completedAt: new Date().toISOString(),
    durationMs,
    kvStats,
  }
}
