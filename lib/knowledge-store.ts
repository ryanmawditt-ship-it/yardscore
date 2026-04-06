/**
 * YARDSCORE PERSISTENT KNOWLEDGE STORE
 * ============================================================
 * Stores research intelligence in Upstash Redis so data
 * persists across research runs and server restarts.
 *
 * Requires KV_REST_API_URL and KV_REST_API_TOKEN env vars
 * (set automatically when connecting Upstash via Vercel).
 *
 * Falls back gracefully to in-memory cache when not configured.
 * ============================================================
 */

import { Redis } from '@upstash/redis'

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

function isKvConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

export const KnowledgeStore = {

  // ─────────────────────────────────────────────────────────
  // INSIGHTS
  // ─────────────────────────────────────────────────────────

  async saveInsight(insight: Record<string, unknown>): Promise<void> {
    if (!isKvConfigured()) return
    try {
      const id = `insight:${Date.now()}:${Math.random().toString(36).slice(2)}`
      await kv.set(id, JSON.stringify(insight), { ex: 60 * 60 * 24 * 90 }) // 90 days
      await kv.lpush('insights:all', id)
      await kv.ltrim('insights:all', 0, 999) // keep last 1000

      // Index by state
      const state = insight.state as string | undefined
      if (state) {
        await kv.lpush(`insights:state:${state}`, id)
        await kv.ltrim(`insights:state:${state}`, 0, 199)
      }

      // Index by suburb
      const suburb = insight.suburb as string | undefined
      if (suburb) {
        const suburbKey = suburb.toLowerCase().replace(/\s+/g, '-')
        await kv.lpush(`insights:suburb:${suburbKey}`, id)
        await kv.ltrim(`insights:suburb:${suburbKey}`, 0, 49)
      }

      // Index by urgency
      const urgency = insight.urgency as string | undefined
      if (urgency === 'high' || urgency === 'breaking') {
        await kv.lpush('insights:urgent', id)
        await kv.ltrim('insights:urgent', 0, 99)
      }
    } catch (e) {
      console.error('[knowledge-store] saveInsight failed:', e instanceof Error ? e.message : String(e))
    }
  },

  async getLatestInsights(limit: number = 50): Promise<Record<string, unknown>[]> {
    if (!isKvConfigured()) return []
    try {
      const ids = await kv.lrange('insights:all', 0, limit - 1) as string[]
      if (!ids || ids.length === 0) return []
      const insights = await Promise.all(
        ids.map(async (id) => {
          const data = await kv.get(id)
          if (!data) return null
          return typeof data === 'string' ? JSON.parse(data) : data
        })
      )
      return insights.filter(Boolean) as Record<string, unknown>[]
    } catch { return [] }
  },

  async getSuburbInsights(suburb: string): Promise<Record<string, unknown>[]> {
    if (!isKvConfigured()) return []
    try {
      const suburbKey = suburb.toLowerCase().replace(/\s+/g, '-')
      const ids = await kv.lrange(`insights:suburb:${suburbKey}`, 0, 19) as string[]
      if (!ids || ids.length === 0) return []
      const insights = await Promise.all(
        ids.map(async (id) => {
          const data = await kv.get(id)
          if (!data) return null
          return typeof data === 'string' ? JSON.parse(data) : data
        })
      )
      return insights.filter(Boolean) as Record<string, unknown>[]
    } catch { return [] }
  },

  async getStateInsights(state: string): Promise<Record<string, unknown>[]> {
    if (!isKvConfigured()) return []
    try {
      const ids = await kv.lrange(`insights:state:${state}`, 0, 29) as string[]
      if (!ids || ids.length === 0) return []
      const insights = await Promise.all(
        ids.map(async (id) => {
          const data = await kv.get(id)
          if (!data) return null
          return typeof data === 'string' ? JSON.parse(data) : data
        })
      )
      return insights.filter(Boolean) as Record<string, unknown>[]
    } catch { return [] }
  },

  async getUrgentInsights(): Promise<Record<string, unknown>[]> {
    if (!isKvConfigured()) return []
    try {
      const ids = await kv.lrange('insights:urgent', 0, 19) as string[]
      if (!ids || ids.length === 0) return []
      const insights = await Promise.all(
        ids.map(async (id) => {
          const data = await kv.get(id)
          if (!data) return null
          return typeof data === 'string' ? JSON.parse(data) : data
        })
      )
      return insights.filter(Boolean) as Record<string, unknown>[]
    } catch { return [] }
  },

  // ─────────────────────────────────────────────────────────
  // SENTIMENT
  // ─────────────────────────────────────────────────────────

  async saveSentiment(sentiment: Record<string, unknown>): Promise<void> {
    if (!isKvConfigured()) return
    try {
      await kv.set('sentiment:latest', JSON.stringify({
        ...sentiment,
        savedAt: new Date().toISOString(),
      }))
      await kv.lpush('sentiment:history', JSON.stringify(sentiment))
      await kv.ltrim('sentiment:history', 0, 29) // 30 days history
    } catch (e) {
      console.error('[knowledge-store] saveSentiment failed:', e instanceof Error ? e.message : String(e))
    }
  },

  async getLatestSentiment(): Promise<Record<string, unknown> | null> {
    if (!isKvConfigured()) return null
    try {
      const data = await kv.get('sentiment:latest')
      if (!data) return null
      return typeof data === 'string' ? JSON.parse(data) : data as Record<string, unknown>
    } catch { return null }
  },

  // ─────────────────────────────────────────────────────────
  // INFRASTRUCTURE ALERTS
  // ─────────────────────────────────────────────────────────

  async saveInfrastructureAlert(alert: Record<string, unknown>): Promise<void> {
    if (!isKvConfigured()) return
    try {
      const id = `infra:${Date.now()}:${Math.random().toString(36).slice(2)}`
      await kv.set(id, JSON.stringify(alert), { ex: 60 * 60 * 24 * 180 }) // 6 months
      await kv.lpush('infra:alerts', id)
      await kv.ltrim('infra:alerts', 0, 199)

      const state = alert.state as string | undefined
      if (state) {
        await kv.lpush(`infra:state:${state}`, id)
        await kv.ltrim(`infra:state:${state}`, 0, 49)
      }
    } catch (e) {
      console.error('[knowledge-store] saveInfrastructureAlert failed:', e instanceof Error ? e.message : String(e))
    }
  },

  async getInfrastructureAlerts(state?: string): Promise<Record<string, unknown>[]> {
    if (!isKvConfigured()) return []
    try {
      const key = state ? `infra:state:${state}` : 'infra:alerts'
      const ids = await kv.lrange(key, 0, 19) as string[]
      if (!ids || ids.length === 0) return []
      const alerts = await Promise.all(
        ids.map(async (id) => {
          const data = await kv.get(id)
          if (!data) return null
          return typeof data === 'string' ? JSON.parse(data) : data
        })
      )
      return alerts.filter(Boolean) as Record<string, unknown>[]
    } catch { return [] }
  },

  // ─────────────────────────────────────────────────────────
  // SUBURB SCORES
  // ─────────────────────────────────────────────────────────

  async saveSuburbScore(suburb: string, state: string, data: Record<string, unknown>): Promise<void> {
    if (!isKvConfigured()) return
    try {
      const key = `suburb:${state.toLowerCase()}:${suburb.toLowerCase().replace(/\s+/g, '-')}`
      await kv.set(key, JSON.stringify({
        ...data,
        suburb,
        state,
        updatedAt: new Date().toISOString(),
      }), { ex: 60 * 60 * 24 * 7 }) // 7 days
    } catch (e) {
      console.error('[knowledge-store] saveSuburbScore failed:', e instanceof Error ? e.message : String(e))
    }
  },

  async getSuburbScore(suburb: string, state: string): Promise<Record<string, unknown> | null> {
    if (!isKvConfigured()) return null
    try {
      const key = `suburb:${state.toLowerCase()}:${suburb.toLowerCase().replace(/\s+/g, '-')}`
      const data = await kv.get(key)
      if (!data) return null
      return typeof data === 'string' ? JSON.parse(data) : data as Record<string, unknown>
    } catch { return null }
  },

  // ─────────────────────────────────────────────────────────
  // STATS
  // ─────────────────────────────────────────────────────────

  async getStats(): Promise<{
    totalInsights: number
    urgentInsights: number
    infraAlerts: number
    sentimentHistory: number
    kvConfigured: boolean
  }> {
    if (!isKvConfigured()) {
      return { totalInsights: 0, urgentInsights: 0, infraAlerts: 0, sentimentHistory: 0, kvConfigured: false }
    }
    try {
      const [totalInsights, urgentInsights, infraAlerts, sentimentHistory] = await Promise.all([
        kv.llen('insights:all'),
        kv.llen('insights:urgent'),
        kv.llen('infra:alerts'),
        kv.llen('sentiment:history'),
      ])
      return {
        totalInsights: totalInsights ?? 0,
        urgentInsights: urgentInsights ?? 0,
        infraAlerts: infraAlerts ?? 0,
        sentimentHistory: sentimentHistory ?? 0,
        kvConfigured: true,
      }
    } catch {
      return { totalInsights: 0, urgentInsights: 0, infraAlerts: 0, sentimentHistory: 0, kvConfigured: false }
    }
  },
}
