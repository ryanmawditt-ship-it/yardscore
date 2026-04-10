/**
 * LIGHTWEIGHT research endpoint for manual dashboard triggers.
 * Fetches 10 suburb-specific feeds, lexicon-scores articles,
 * saves suburb insights + updates scores. No Claude, no heavy imports.
 * Completes in ~10-15 seconds.
 */
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Inline lightweight versions — no heavy module imports

const SUBURB_FEEDS = [
  'https://news.google.com/rss/search?q=%22Brisbane%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
  'https://news.google.com/rss/search?q=%22Ipswich%22+property+real+estate&hl=en-AU&gl=AU&ceid=AU:en',
  'https://news.google.com/rss/search?q=%22Toowoomba%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
  'https://news.google.com/rss/search?q=%22Gold+Coast%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
  'https://news.google.com/rss/search?q=%22North+Lakes%22+%22Redcliffe%22+property&hl=en-AU&gl=AU&ceid=AU:en',
  'https://news.google.com/rss/search?q=%22Bundaberg%22+rental+yield&hl=en-AU&gl=AU&ceid=AU:en',
  'https://news.google.com/rss/search?q=%22Sydney%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
  'https://news.google.com/rss/search?q=%22Melbourne%22+property+investment&hl=en-AU&gl=AU&ceid=AU:en',
  'https://news.google.com/rss/search?q=%22Perth%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
  'https://news.google.com/rss/search?q=%22Adelaide%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
]

// Known suburbs for detection (lightweight inline list)
const KNOWN_SUBURBS: Array<{ suburb: string; state: string }> = [
  { suburb: 'Brisbane', state: 'QLD' }, { suburb: 'Gold Coast', state: 'QLD' },
  { suburb: 'Sunshine Coast', state: 'QLD' }, { suburb: 'Toowoomba', state: 'QLD' },
  { suburb: 'Ipswich', state: 'QLD' }, { suburb: 'Bundaberg', state: 'QLD' },
  { suburb: 'Rockhampton', state: 'QLD' }, { suburb: 'Townsville', state: 'QLD' },
  { suburb: 'Cairns', state: 'QLD' }, { suburb: 'Caboolture', state: 'QLD' },
  { suburb: 'North Lakes', state: 'QLD' }, { suburb: 'Redcliffe', state: 'QLD' },
  { suburb: 'Springfield', state: 'QLD' }, { suburb: 'Logan', state: 'QLD' },
  { suburb: 'Hervey Bay', state: 'QLD' }, { suburb: 'Gladstone', state: 'QLD' },
  { suburb: 'Narangba', state: 'QLD' }, { suburb: 'Ripley', state: 'QLD' },
  { suburb: 'Chermside', state: 'QLD' }, { suburb: 'Paddington', state: 'QLD' },
  { suburb: 'Sydney', state: 'NSW' }, { suburb: 'Newcastle', state: 'NSW' },
  { suburb: 'Parramatta', state: 'NSW' }, { suburb: 'Penrith', state: 'NSW' },
  { suburb: 'Maitland', state: 'NSW' }, { suburb: 'Wollongong', state: 'NSW' },
  { suburb: 'Raymond Terrace', state: 'NSW' }, { suburb: 'Central Coast', state: 'NSW' },
  { suburb: 'Melbourne', state: 'VIC' }, { suburb: 'Geelong', state: 'VIC' },
  { suburb: 'Ballarat', state: 'VIC' }, { suburb: 'Bendigo', state: 'VIC' },
  { suburb: 'Melton', state: 'VIC' }, { suburb: 'Footscray', state: 'VIC' },
  { suburb: 'Sunshine', state: 'VIC' }, { suburb: 'Werribee', state: 'VIC' },
  { suburb: 'Perth', state: 'WA' }, { suburb: 'Mandurah', state: 'WA' },
  { suburb: 'Adelaide', state: 'SA' }, { suburb: 'Hobart', state: 'TAS' },
]

// Bullish/bearish term lists for quick scoring
const BULLISH = ['price growth', 'prices rising', 'market recovery', 'strong demand', 'population growth', 'undersupply', 'record high', 'boom', 'surge', 'soar', 'construction approved', 'new train', 'new hospital', 'infrastructure', 'gentrification', 'low vacancy', 'rental crisis', 'yields climbing', 'investor demand']
const BEARISH = ['price falls', 'market crash', 'oversupply', 'vacancy rising', 'flood', 'bushfire', 'rate hike', 'recession', 'job losses', 'prices dropping', 'correction', 'downturn', 'distressed', 'panic selling', 'lending restrictions']

function detectSuburb(text: string): { suburb: string; state: string } | null {
  const lower = text.toLowerCase()
  for (const { suburb, state } of KNOWN_SUBURBS) {
    if (lower.includes(suburb.toLowerCase())) return { suburb, state }
  }
  return null
}

function quickScore(text: string): { score: number; bullish: string[]; bearish: string[] } {
  const lower = text.toLowerCase()
  const bull = BULLISH.filter(t => lower.includes(t))
  const bear = BEARISH.filter(t => lower.includes(t))
  const score = Math.max(0, Math.min(10, 5 + bull.length - bear.length))
  return { score, bullish: bull, bearish: bear }
}

function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return (m?.[1] || m?.[2] || '').trim()
}

export async function POST(request: NextRequest) {
  const adminKey = process.env.ADMIN_KEY
  const xAdminKey = request.headers.get('x-admin-key')
  if (adminKey && xAdminKey !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()

  try {
    // Fetch 10 feeds in parallel with 5s timeout
    const feedResults = await Promise.allSettled(
      SUBURB_FEEDS.map(url =>
        axios.get(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' }, responseType: 'text' })
          .then(r => r.data as string)
          .catch(() => '')
      )
    )

    // Parse articles
    const articles: Array<{ title: string; text: string; source: string }> = []
    for (const result of feedResults) {
      if (result.status !== 'fulfilled' || !result.value) continue
      const xml = result.value
      const itemRegex = /<item>([\s\S]*?)<\/item>/gi
      let match: RegExpExecArray | null
      while ((match = itemRegex.exec(xml)) !== null) {
        const title = extractTag(match[1], 'title').replace(/<[^>]+>/g, '')
        if (title && !/\d+\s*bedroom|open for inspection/i.test(title)) {
          articles.push({ title, text: title, source: extractTag(match[1], 'link') })
        }
      }
    }

    // Detect suburbs and score
    const suburbInsights: Array<{
      title: string; summary: string; source: string
      suburb: string; state: string; category: string
      impact: string; score: number
    }> = []

    const suburbScoreUpdates = new Map<string, { suburb: string; state: string; bullish: number; bearish: number; articles: number }>()

    for (const article of articles) {
      const detected = detectSuburb(article.text)
      if (!detected) continue

      const { score, bullish, bearish } = quickScore(article.text)
      const key = `${detected.suburb}|${detected.state}`

      if (!suburbScoreUpdates.has(key)) {
        suburbScoreUpdates.set(key, { ...detected, bullish: 0, bearish: 0, articles: 0 })
      }
      const entry = suburbScoreUpdates.get(key)!
      entry.bullish += bullish.length
      entry.bearish += bearish.length
      entry.articles++

      suburbInsights.push({
        title: `${detected.suburb}: ${article.title.slice(0, 60)}`,
        summary: `Score: ${score}/10. ${bullish.length > 0 ? 'Bullish: ' + bullish.join(', ') + '. ' : ''}${bearish.length > 0 ? 'Bearish: ' + bearish.join(', ') + '.' : ''}`,
        source: article.source,
        suburb: detected.suburb,
        state: detected.state,
        category: 'market_data',
        impact: score >= 6 ? 'positive' : score <= 4 ? 'negative' : 'neutral',
        score,
      })
    }

    // Save to KV
    const kvConfigured = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
    let savedInsights = 0
    let updatedScores = 0

    if (kvConfigured) {
      const kv = new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
      })

      // Save insights
      for (const insight of suburbInsights.slice(0, 50)) {
        const id = `insight:${Date.now()}:${Math.random().toString(36).slice(2)}`
        await kv.set(id, JSON.stringify(insight), { ex: 60 * 60 * 24 * 90 })
        await kv.lpush('insights:all', id)
        if (insight.suburb) {
          const subKey = insight.suburb.toLowerCase().replace(/\s+/g, '-')
          await kv.lpush(`insights:suburb:${subKey}`, id)
          await kv.lpush(`insights:state:${insight.state}`, id)
          const mentionKey = `mentions:count:${insight.state.toLowerCase()}:${subKey}`
          await kv.incr(mentionKey)
          await kv.expire(mentionKey, 60 * 60 * 24 * 30)
        }
        savedInsights++
      }

      // Update suburb scores
      for (const [, data] of Array.from(suburbScoreUpdates.entries())) {
        const scoreKey = `score:${data.state.toLowerCase()}:${data.suburb.toLowerCase().replace(/\s+/g, '-')}`
        const existing = await kv.get(scoreKey) as Record<string, unknown> | null
        const base = existing ? (typeof existing === 'string' ? JSON.parse(existing) : existing) : null

        const sentimentDelta = (data.bullish * 0.3) - (data.bearish * 0.3)
        const newSentiment = Math.max(0, Math.min(10, ((base?.sentimentScore as number) ?? 5) + sentimentDelta))
        const newOverall = Math.round((
          ((base?.yieldScore as number) ?? 5) * 0.25 +
          ((base?.growthScore as number) ?? 5) * 0.25 +
          ((base?.infrastructureScore as number) ?? 5) * 0.20 +
          ((base?.riskScore as number) ?? 5) * 0.15 +
          newSentiment * 0.15
        ) * 10) / 10

        const updated = {
          ...(base || {}),
          suburb: data.suburb,
          state: data.state,
          sentimentScore: Math.round(newSentiment * 10) / 10,
          overallScore: newOverall,
          keyReasons: [`${data.articles} articles today (${data.bullish} bullish, ${data.bearish} bearish signals)`],
          lastUpdated: new Date().toISOString(),
        }

        await kv.set(scoreKey, JSON.stringify(updated), { ex: 60 * 60 * 24 * 30 })
        await kv.zadd('suburbs:scores:all', { score: newOverall, member: `${data.suburb}|${data.state}` })
        updatedScores++
      }

      // Save run stats
      await kv.set('research:lastRun', JSON.stringify({
        articlesFound: articles.length,
        insightsExtracted: savedInsights,
        feedsScanned: SUBURB_FEEDS.length,
        runAt: new Date().toISOString(),
      }))
      await kv.lpush('research:runHistory', JSON.stringify({
        articlesFound: articles.length,
        insightsExtracted: savedInsights,
        feedsScanned: SUBURB_FEEDS.length,
        runAt: new Date().toISOString(),
      }))
      await kv.ltrim('research:runHistory', 0, 29)
    }

    const durationMs = Date.now() - start

    return NextResponse.json({
      success: true,
      summary: {
        feedsScanned: SUBURB_FEEDS.length,
        feedsSuccessful: feedResults.filter(r => r.status === 'fulfilled').length,
        articlesFound: articles.length,
        insightsExtracted: savedInsights,
        suburbsDetected: suburbScoreUpdates.size,
        scoresUpdated: updatedScores,
        durationMs,
        completedAt: new Date().toISOString(),
        sourcesMonitored: SUBURB_FEEDS.length,
        sentiment: 'neutral',
        sentimentScore: 0,
        councilDAsScanned: 0,
      },
      kvStats: { totalInsights: savedInsights, kvConfigured },
      insights: suburbInsights.slice(0, 50),
      daInsights: [],
      sentiment: {
        overallSentiment: 'neutral', sentimentScore: 0,
        keyThemes: [], policyRisks: [], opportunities: [],
        interestRateOutlook: 'stable', housingSupplyOutlook: 'stable', demandOutlook: 'moderate',
      },
      suburbs: Array.from(suburbScoreUpdates.values()).map(s =>
        `${s.suburb}, ${s.state}: ${s.articles} articles (${s.bullish}+ ${s.bearish}-)`
      ),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message, durationMs: Date.now() - start }, { status: 500 })
  }
}
