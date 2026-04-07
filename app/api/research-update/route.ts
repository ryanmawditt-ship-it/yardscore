import { NextRequest, NextResponse } from 'next/server'
import { runFullResearchCycle } from '@/lib/research-agent'
import { setResearchCache } from '@/lib/research-cache'
import { KnowledgeStore } from '@/lib/knowledge-store'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max for research cycle

export async function POST(request: NextRequest) {
  // Verify cron secret or admin key
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const adminKey = process.env.ADMIN_KEY

  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && authHeader !== `Bearer ${adminKey}`) {
    const xAdminKey = request.headers.get('x-admin-key')
    if (xAdminKey !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    console.log('[api/research-update] Starting research cycle...')
    const result = await runFullResearchCycle()

    // Cache results in-memory for use by suburb-selector and synthesis agents
    setResearchCache({
      insights: result.insights,
      sentiment: result.sentiment,
      updatedAt: result.completedAt,
    })
    console.log(`[api/research-update] Cached ${result.insights.length} insights for agent use`)

    // Save run stats to KV
    await KnowledgeStore.saveLastRunStats({
      articlesFound: result.articlesFound,
      insightsExtracted: result.insights.length,
      feedsScanned: result.feedsScanned,
      runAt: result.completedAt,
    })

    return NextResponse.json({
      success: true,
      summary: {
        feedsScanned: result.feedsScanned,
        feedsSuccessful: result.feedsSuccessful,
        articlesFound: result.articlesFound,
        insightsExtracted: result.insights.length,
        councilDAsScanned: result.daInsights.length,
        sentiment: result.sentiment.overallSentiment,
        sentimentScore: result.sentiment.sentimentScore,
        sourcesMonitored: result.sourcesMonitored,
        durationMs: result.durationMs,
        completedAt: result.completedAt,
      },
      kvStats: result.kvStats,
      insights: result.insights.slice(0, 50),
      daInsights: result.daInsights,
      sentiment: result.sentiment,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[api/research-update] Research cycle failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Return stored intelligence from KV
  const xAdminKey = request.headers.get('x-admin-key')
  const adminKey = process.env.ADMIN_KEY

  if (adminKey && xAdminKey !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [stats, latestInsights, urgentInsights, sentiment, infraAlerts, lastRun, runHistory, connected] = await Promise.all([
      KnowledgeStore.getStats(),
      KnowledgeStore.getLatestInsights(50),
      KnowledgeStore.getUrgentInsights(),
      KnowledgeStore.getLatestSentiment(),
      KnowledgeStore.getInfrastructureAlerts(),
      KnowledgeStore.getLastRunStats(),
      KnowledgeStore.getRunHistory(7),
      KnowledgeStore.testConnection(),
    ])

    return NextResponse.json({
      stats,
      latestInsights,
      urgentInsights,
      sentiment,
      infraAlerts,
      lastRun,
      runHistory,
      connected,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
