import { NextRequest, NextResponse } from 'next/server'
import { runFullResearchCycle } from '@/lib/research-agent'
import { setResearchCache } from '@/lib/research-cache'
import { KnowledgeStore } from '@/lib/knowledge-store'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/** Vercel Cron hits this via GET, dashboard can also trigger it */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  const adminKey = process.env.ADMIN_KEY
  const xAdminKey = request.headers.get('x-admin-key')

  // Accept cron secret OR admin key
  const authorized = (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (adminKey && xAdminKey === adminKey) ||
    (adminKey && authHeader === `Bearer ${adminKey}`)

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[cron/research] Starting scheduled research cycle...')
    const result = await runFullResearchCycle()

    setResearchCache({
      insights: result.insights,
      sentiment: result.sentiment,
      updatedAt: result.completedAt,
    })

    await KnowledgeStore.saveLastRunStats({
      articlesFound: result.articlesFound,
      insightsExtracted: result.insights.length,
      feedsScanned: result.feedsScanned,
      runAt: result.completedAt,
    })

    console.log(`[cron/research] Completed: ${result.insights.length} insights from ${result.articlesFound} articles`)

    return NextResponse.json({
      success: true,
      insightsExtracted: result.insights.length,
      articlesFound: result.articlesFound,
      durationMs: result.durationMs,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[cron/research] Failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
