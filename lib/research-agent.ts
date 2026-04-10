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
import { scoreArticle, scoreSuburbFromArticle } from '@/lib/sentiment-lexicon'
import { detectSuburbsInText, tagInsightWithSuburb } from '@/lib/suburb-detector'

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

async function fetchFeed(url: string, timeoutMs: number = 8000): Promise<FeedItem[]> {
  try {
    const response = await axios.get(url, {
      timeout: timeoutMs,
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

async function fetchAllFeeds(maxFeeds?: number): Promise<{ items: FeedItem[]; scanned: number; successful: number }> {
  let urls = getAllFeedUrls()
  const isLimited = maxFeeds && maxFeeds < urls.length
  if (isLimited) {
    // For manual runs: prioritise suburb-specific feeds
    const suburbFeeds = urls.filter(u => u.includes('%22'))
    const otherFeeds = urls.filter(u => !u.includes('%22'))
    urls = [...suburbFeeds.slice(0, Math.floor(maxFeeds * 0.7)), ...otherFeeds.slice(0, Math.floor(maxFeeds * 0.3))]
    console.log(`[research] Limited to ${urls.length} feeds (${Math.floor(maxFeeds * 0.7)} suburb-specific)`)
  }
  const timeout = isLimited ? 5000 : 8000 // faster timeouts for manual runs
  const results = await Promise.allSettled(urls.map(url => fetchFeed(url, timeout)))

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
  'CRITICAL: Every insight MUST have suburb and state populated — NEVER return null for these fields. ' +
  'If a specific suburb is mentioned use it. If only a city is mentioned use the city name. ' +
  'If only a state is mentioned use the state capital. If national news use "Australia" with state "AUS". ' +
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

/** Filter out property listings and junk articles */
function isListingOrJunk(title: string): boolean {
  return /\d+\s+bedroom|\bopen for inspection\b|\bopen home\b|street,|avenue,|crescent,|drive,|road,|QLD\s+\d{4}|NSW\s+\d{4}|VIC\s+\d{4}|WA\s+\d{4}|SA\s+\d{4}|\bfor sale\b.*realestate\.com/i.test(title)
}

/** Sort articles by source priority and take the top N most relevant */
function prioritiseArticles(items: FeedItem[], limit: number): FeedItem[] {
  // First filter out property listings (not investment intelligence)
  const filtered = items.filter(item => !isListingOrJunk(item.title))

  function getSourcePriority(item: FeedItem): number {
    const source = item.source
    // Priority 0: Suburb-specific Google News feeds (quoted suburb names in query)
    if (source.includes('news.google.com') && source.includes('%22')) return 0
    // Priority 1: Google News property searches (national)
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

  // Also boost articles that mention known suburbs in their title
  function getSuburbBoost(item: FeedItem): number {
    const detected = detectSuburbsInText(item.title)
    return detected.length > 0 ? -1 : 0 // Lower number = higher priority
  }

  return [...filtered]
    .sort((a, b) => {
      const priA = getSourcePriority(a) + getSuburbBoost(a)
      const priB = getSourcePriority(b) + getSuburbBoost(b)
      return priA - priB
    })
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

const CLAUDE_BATCH_SIZE = 5
const CLAUDE_MAX_ARTICLES = 30
const BATCH_TIMEOUT_MS = 45_000
const BATCH_DELAY_MS = 2_000

type RawInsight = {
  title: string
  summary: string
  source: string
  suburb?: string
  state?: string
  category: string
}

// ─────────────────────────────────────────────────────────────
// STEP A: Scan ALL articles with lexicon + suburb detector (free, instant)
// Creates basic insights for every article that mentions a known suburb.
// ─────────────────────────────────────────────────────────────

function scanAllArticlesForSuburbs(items: FeedItem[]): {
  suburbInsights: RawInsight[]
  suburbArticles: FeedItem[] // articles that mention suburbs (for Claude)
} {
  const suburbInsights: RawInsight[] = []
  const suburbArticles: FeedItem[] = []
  const seenTitles = new Set<string>()

  for (const item of items) {
    if (isListingOrJunk(item.title)) continue

    const articleText = `${item.title} ${item.description}`
    const detected = detectSuburbsInText(articleText)

    if (detected.length === 0) continue // No suburb mentioned — skip

    // This article mentions suburbs — mark it for potential Claude processing
    if (!seenTitles.has(item.title)) {
      seenTitles.add(item.title)
      suburbArticles.push(item)
    }

    // Create a basic insight for each suburb detected (no Claude needed)
    const lexScore = scoreArticle(articleText)
    for (const { suburb, state, mentions } of detected.slice(0, 3)) {
      suburbInsights.push({
        title: `${suburb}: ${item.title.slice(0, 70)}`,
        summary: `${suburb}, ${state} mentioned ${mentions}x. Sentiment: ${lexScore.sentiment} (${lexScore.normalisedScore}/10). Signals: ${lexScore.topSignals.slice(0, 3).join(', ') || 'none'}.`,
        source: item.link || item.source,
        suburb,
        state,
        category: lexScore.infrastructureSignals.length > 0 ? 'infrastructure'
          : lexScore.rentalSignals.length > 0 ? 'rental'
          : lexScore.policySignals.length > 0 ? 'policy'
          : 'market_data',
      })
    }
  }

  return { suburbInsights, suburbArticles }
}

// ─────────────────────────────────────────────────────────────
// STEP B: Send top 30 suburb-specific articles to Claude for deep analysis
// ─────────────────────────────────────────────────────────────

async function extractDeepInsights(suburbArticles: FeedItem[]): Promise<RawInsight[]> {
  // Pick the 30 most important suburb-specific articles
  const prioritised = prioritiseArticles(suburbArticles, CLAUDE_MAX_ARTICLES)
  if (prioritised.length === 0) return []

  const totalBatches = Math.ceil(prioritised.length / CLAUDE_BATCH_SIZE)
  console.log(`[research] Sending ${prioritised.length} suburb-specific articles to Claude in ${totalBatches} batches`)

  const allInsights: RawInsight[] = []

  for (let i = 0; i < prioritised.length; i += CLAUDE_BATCH_SIZE) {
    const batchNum = Math.floor(i / CLAUDE_BATCH_SIZE) + 1
    const batch = prioritised.slice(i, i + CLAUDE_BATCH_SIZE)
    console.log(`[research] Claude batch ${batchNum}/${totalBatches} (${batch.length} articles)`)

    try {
      const articlesText = batch.map((item, idx) => {
        const articleText = `${item.title} ${item.description}`
        const lexScore = scoreArticle(articleText)
        const detected = detectSuburbsInText(articleText)
        const suburbHint = detected.length > 0 ? `\nSuburbs detected: ${detected.map(d => d.suburb + ', ' + d.state).join('; ')}` : ''
        const signals = lexScore.topSignals.length > 0
          ? `\nLexicon: ${lexScore.sentiment} (${lexScore.normalisedScore}/10). Signals: ${lexScore.topSignals.join(', ')}`
          : ''
        return `[${idx + 1}] ${item.title}\n${item.description}${suburbHint}${signals}`
      }).join('\n\n')

      const userContent = `Extract suburb-specific property investment intelligence.

${EXTRACTION_SIGNALS}

Articles:
${articlesText}

RULES:
- ONLY create insights for SPECIFIC suburbs or cities — never "Australia" or state names
- Each insight must name a real suburb, city, or region
- If an article is about national trends with no specific location, SKIP IT
- suburb must be a place name like "Ipswich", "North Lakes", "Brisbane" — NEVER "Australia", "Queensland", "National"

Return a JSON array:
[{
  "title": "concise insight title mentioning the suburb",
  "summary": "2-3 sentence summary specific to this suburb",
  "source": "source URL",
  "suburb": "specific suburb or city name",
  "state": "QLD/NSW/VIC/WA/SA/TAS/ACT/NT",
  "category": "infrastructure|policy|market_data|risk|economic|demographic|construction|rental|finance|council_da"
}]`

      const text = await askClaudeWithTimeout(EXTRACTION_SYSTEM_PROMPT, userContent, BATCH_TIMEOUT_MS)
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        // Tag any remaining nulls and filter out "Australia"
        for (const insight of parsed) {
          if (!insight.suburb || !insight.state || insight.suburb === 'null') {
            const matched = batch.find(b =>
              (insight.title || '').toLowerCase().split(' ').filter((w: string) => w.length > 4)
                .some((w: string) => b.title.toLowerCase().includes(w))
            )
            if (matched) {
              const result = tagInsightWithSuburb(insight, `${matched.title} ${matched.description}`)
              insight.suburb = result.suburb
              insight.state = result.state
            }
          }
        }

        const suburbOnly = parsed.filter((ins: RawInsight) =>
          ins.suburb && ins.state &&
          ins.suburb !== 'Australia' && ins.state !== 'AUS' &&
          ins.suburb !== 'National'
        )

        console.log(`[research] Claude batch ${batchNum}: ${suburbOnly.length} suburb insights (filtered ${parsed.length - suburbOnly.length} non-suburb)`)
        allInsights.push(...suburbOnly)
      }
    } catch (e) {
      console.error(`[research] Claude batch ${batchNum} failed:`, e instanceof Error ? e.message : String(e))
    }

    if (i + CLAUDE_BATCH_SIZE < prioritised.length) {
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
 * Update suburb scores by scanning RAW article texts through the dimension-aware lexicon.
 * Uses the full article title+description (not Claude's short summary) so the lexicon
 * can detect flood/infrastructure/rental/growth signals properly.
 */
async function updateSuburbScoresFromArticles(allItems: FeedItem[]): Promise<void> {
  // Group articles by which suburb they mention
  const suburbArticleMap = new Map<string, string[]>()

  for (const item of allItems) {
    if (isListingOrJunk(item.title)) continue
    const articleText = `${item.title} ${item.description}`
    const detected = detectSuburbsInText(articleText)

    for (const { suburb, state } of detected.slice(0, 3)) {
      if (suburb === 'Australia' || state === 'AUS') continue
      const key = `${suburb}|${state}`
      if (!suburbArticleMap.has(key)) suburbArticleMap.set(key, [])
      suburbArticleMap.get(key)!.push(articleText)
    }
  }

  if (suburbArticleMap.size === 0) {
    console.log('[research] No suburb-specific articles found for scoring')
    return
  }

  console.log(`[research] Found ${suburbArticleMap.size} suburbs mentioned in articles`)

  let updated = 0
  let totalSignals = 0
  for (const [key, articles] of Array.from(suburbArticleMap.entries())) {
    const [suburb, state] = key.split('|')

    const existing = await KnowledgeStore.getSuburbScore(suburb, state)
    let currentScores = {
      riskScore: (existing?.riskScore as number) ?? 5,
      infrastructureScore: (existing?.infrastructureScore as number) ?? 5,
      yieldScore: (existing?.yieldScore as number) ?? 5,
      growthScore: (existing?.growthScore as number) ?? 5,
      sentimentScore: (existing?.sentimentScore as number) ?? 5,
      overallScore: (existing?.overallScore as number) ?? 5,
    }

    const allSignals: Array<{ dimension: string; term: string; impact: number; direction: string }> = []

    // Score up to 10 articles per suburb through the dimension-aware lexicon
    for (const articleText of articles.slice(0, 10)) {
      const result = scoreSuburbFromArticle(articleText, suburb, state, currentScores)
      currentScores = {
        riskScore: result.riskScore,
        infrastructureScore: result.infrastructureScore,
        yieldScore: result.yieldScore,
        growthScore: result.growthScore,
        sentimentScore: result.sentimentScore,
        overallScore: result.overallScore,
      }
      allSignals.push(...result.signalsFound)
    }

    if (allSignals.length > 0) {
      const keyReasons = allSignals
        .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
        .slice(0, 5)
        .map(s => `${s.term} → ${s.dimension} ${s.direction === 'positive' ? ' ↑' : ' ↓'}`)

      const existingReasons = (existing?.keyReasons as string[]) || []
      const mergedReasons = [...keyReasons, ...existingReasons.slice(0, 3)].slice(0, 8)

      await KnowledgeStore.saveSuburbScore(suburb, state, {
        ...currentScores,
        priceRange: (existing?.priceRange as string) || 'N/A',
        keyReasons: mergedReasons,
        lastUpdated: new Date().toISOString(),
      })

      totalSignals += allSignals.length
      console.log(`[scoring] ${suburb}, ${state}: ${allSignals.length} signals from ${articles.length} articles → overall:${currentScores.overallScore}`)
      updated++
    }
  }

  console.log(`[research] Updated ${updated} suburb scores with ${totalSignals} dimension-specific signals`)
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

export async function runFullResearchCycle(options?: { maxFeeds?: number; quick?: boolean }): Promise<ResearchCycleResult> {
  const isQuick = options?.quick ?? false
  const startTime = Date.now()
  console.log(`[research] Starting ${isQuick ? 'QUICK' : 'FULL'} research cycle — ${getSourceCount()} sources configured`)

  // Step 1: Fetch RSS feeds (limited for manual/quick runs)
  console.log('[research] Step 1: Fetching RSS feeds...')
  const { items: allItems, scanned, successful } = await fetchAllFeeds(options?.maxFeeds)
  console.log(`[research] Fetched ${allItems.length} articles from ${successful}/${scanned} feeds`)

  // Step 2: Lexicon scan ALL articles + suburb detection (instant, free)
  console.log('[research] Step 2: Scanning ALL articles for suburbs + lexicon scoring...')
  const { suburbInsights: lexiconInsights, suburbArticles } = scanAllArticlesForSuburbs(allItems)
  console.log(`[research] Lexicon scan: ${lexiconInsights.length} suburb insights from ${suburbArticles.length} suburb-mentioning articles (out of ${allItems.length} total)`)

  // Step 3: Claude deep extraction (skip for quick runs) + council DA monitoring
  let claudeInsights: RawInsight[] = []
  let daInsights: DAInsight[] = []
  if (isQuick) {
    // Quick mode: skip Claude and council DAs to save time
    console.log('[research] Step 3: SKIPPED Claude + council DAs (quick mode — lexicon insights only)')
  } else {
    console.log('[research] Step 3: Claude deep extraction + council DA monitoring...')
    const results = await Promise.all([
      monitorCouncilDAs(),
      extractDeepInsights(suburbArticles),
    ])
    daInsights = results[0]
    claudeInsights = results[1]
    console.log(`[research] Claude extracted ${claudeInsights.length} deep insights`)
    console.log(`[research] Scanned ${daInsights.length} council DA portals`)
  }

  // Step 4: News sentiment analysis (lexicon-powered — scans ALL articles)
  console.log('[research] Step 4: Analyzing news sentiment via lexicon...')
  const allArticleTexts = allItems.map(item => `${item.title}\n${item.description}`)
  const sentiment = await analyzeNewsSentiment(allArticleTexts)
  console.log(`[research] Sentiment: ${sentiment.overallSentiment} (${sentiment.sentimentScore}). ${sentiment.articlesScored} articles scored, avg ${sentiment.avgArticleScore}/10`)

  // Step 5: Merge all insights, filter out "Australia"/"AUS", classify
  console.log('[research] Step 5: Merging and classifying insights...')
  const allRawInsights = [...claudeInsights, ...lexiconInsights]
    .filter(i => i.suburb && i.state && i.suburb !== 'Australia' && i.state !== 'AUS' && i.suburb !== 'National')

  // Deduplicate by suburb+title
  const seen = new Set<string>()
  const deduped = allRawInsights.filter(i => {
    const key = `${(i.suburb || '').toLowerCase()}|${(i.title || '').slice(0, 40).toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const classifiedInsights = classifyAndRank(deduped)
  console.log(`[research] ${classifiedInsights.length} unique suburb insights (${claudeInsights.length} from Claude, ${lexiconInsights.length} from lexicon, ${allRawInsights.length - deduped.length} duplicates removed)`)

  // Step 6: Persist to knowledge store (KV)
  console.log('[research] Step 6: Persisting to knowledge store...')
  let savedCount = 0
  let mentionCount = 0
  for (const insight of classifiedInsights) {
    await KnowledgeStore.saveInsight(insight as unknown as Record<string, unknown>)
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
    if (insight.suburb && insight.state) {
      await KnowledgeStore.incrementSuburbMention(insight.suburb, insight.state)
      mentionCount++
    }
    savedCount++
  }
  await KnowledgeStore.saveSentiment(sentiment as unknown as Record<string, unknown>)

  // Step 7: Update suburb scores from RAW article texts
  console.log('[research] Step 7: Updating suburb scores from article texts...')
  // In quick mode only score suburbs from the articles we already detected
  const articlesToScore = isQuick ? suburbArticles : allItems
  await updateSuburbScoresFromArticles(articlesToScore)

  // Step 8: Seed scores for any handbook suburbs not yet scored (skip in quick mode)
  if (!isQuick) {
    console.log('[research] Step 8: Seeding missing suburb scores from handbook...')
    await seedMissingSuburbScores(sentiment)
  }

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
