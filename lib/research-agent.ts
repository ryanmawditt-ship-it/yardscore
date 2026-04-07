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
      const articlesText = batch.map((item, idx) =>
        `[${idx + 1}] ${item.title}\n${item.description}\nSource: ${item.source}`
      ).join('\n\n')

      const userContent = `Extract property investment intelligence from these articles.

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

  // Step 3: News sentiment analysis
  console.log('[research] Step 3: Analyzing news sentiment...')
  const newsArticles = allItems
    .filter(item =>
      item.source.includes('news.com.au') ||
      item.source.includes('abc.net.au') ||
      item.source.includes('afr.com') ||
      item.source.includes('smh.com.au') ||
      item.source.includes('7news') ||
      item.source.includes('9news') ||
      item.source.includes('theaustralian')
    )
    .map(item => `${item.title}\n${item.description}`)
  const sentiment = await analyzeNewsSentiment(newsArticles)
  console.log(`[research] News sentiment: ${sentiment.overallSentiment} (${sentiment.sentimentScore})`)

  // Step 4: Classify and rank all insights
  console.log('[research] Step 4: Classifying insights...')
  const classifiedInsights = classifyAndRank(rawInsights)
  console.log(`[research] Classified ${classifiedInsights.length} insights`)

  // Step 5: Persist to knowledge store (KV)
  console.log('[research] Step 5: Persisting to knowledge store...')
  let savedCount = 0
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
    savedCount++
  }
  // Persist sentiment
  await KnowledgeStore.saveSentiment(sentiment as unknown as Record<string, unknown>)
  const kvStats = await KnowledgeStore.getStats()
  console.log(`[research] Persisted ${savedCount} insights to KV. Total in store: ${kvStats.totalInsights} insights, ${kvStats.infraAlerts} infra alerts, ${kvStats.sentimentHistory} sentiment records`)

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
