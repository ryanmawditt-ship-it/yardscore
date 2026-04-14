/**
 * Lightweight endpoint that ONLY reads from Redis.
 * No heavy imports (no research-agent, no sentiment-lexicon).
 * Used by the admin dashboard to load stored data on page mount.
 */
import { NextRequest, NextResponse } from 'next/server'
import { KnowledgeStore } from '@/lib/knowledge-store'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const xAdminKey = request.headers.get('x-admin-key')
  const adminKey = process.env.ADMIN_KEY

  if (adminKey && xAdminKey !== adminKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [stats, latestInsights, urgentInsights, sentiment, infraAlerts, lastRun, runHistory, connected, trendingSuburbs, topScored] = await Promise.all([
      KnowledgeStore.getStats(),
      KnowledgeStore.getLatestInsights(50),
      KnowledgeStore.getUrgentInsights(),
      KnowledgeStore.getLatestSentiment(),
      KnowledgeStore.getInfrastructureAlerts(),
      KnowledgeStore.getLastRunStats(),
      KnowledgeStore.getRunHistory(7),
      KnowledgeStore.testConnection(),
      KnowledgeStore.getTopMentionedSuburbs(10),
      KnowledgeStore.getTopScoredSuburbs(50),
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
      trendingSuburbs,
      topScored,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
