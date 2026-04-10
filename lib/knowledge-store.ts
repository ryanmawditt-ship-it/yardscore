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

let _kv: Redis | null = null

function getKv(): Redis {
  if (!_kv) {
    _kv = new Redis({
      url: process.env.KV_REST_API_URL || '',
      token: process.env.KV_REST_API_TOKEN || '',
    })
  }
  return _kv
}

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
      await getKv().set(id, JSON.stringify(insight), { ex: 60 * 60 * 24 * 90 }) // 90 days — auto-expires
      await getKv().lpush('insights:all', id)
      // No ltrim — keep all insights. Individual records auto-expire after 90 days.
      // Lists accumulate stale IDs over time but getters handle null lookups gracefully.

      // Index by state
      const state = insight.state as string | undefined
      if (state) {
        await getKv().lpush(`insights:state:${state}`, id)
      }

      // Index by suburb
      const suburb = insight.suburb as string | undefined
      if (suburb) {
        const suburbKey = suburb.toLowerCase().replace(/\s+/g, '-')
        await getKv().lpush(`insights:suburb:${suburbKey}`, id)
      }

      // Index by urgency
      const urgency = insight.urgency as string | undefined
      if (urgency === 'high' || urgency === 'breaking') {
        await getKv().lpush('insights:urgent', id)
      }
    } catch (e) {
      console.error('[knowledge-store] saveInsight failed:', e instanceof Error ? e.message : String(e))
    }
  },

  async getLatestInsights(limit: number = 50): Promise<Record<string, unknown>[]> {
    if (!isKvConfigured()) return []
    try {
      const ids = await getKv().lrange('insights:all', 0, limit - 1) as string[]
      if (!ids || ids.length === 0) return []
      const insights = await Promise.all(
        ids.map(async (id) => {
          const data = await getKv().get(id)
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
      const ids = await getKv().lrange(`insights:suburb:${suburbKey}`, 0, 99) as string[]
      if (!ids || ids.length === 0) return []
      const insights = await Promise.all(
        ids.map(async (id) => {
          const data = await getKv().get(id)
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
      const ids = await getKv().lrange(`insights:state:${state}`, 0, 199) as string[]
      if (!ids || ids.length === 0) return []
      const insights = await Promise.all(
        ids.map(async (id) => {
          const data = await getKv().get(id)
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
      const ids = await getKv().lrange('insights:urgent', 0, 99) as string[]
      if (!ids || ids.length === 0) return []
      const insights = await Promise.all(
        ids.map(async (id) => {
          const data = await getKv().get(id)
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
      await getKv().set('sentiment:latest', JSON.stringify({
        ...sentiment,
        savedAt: new Date().toISOString(),
      }))
      await getKv().lpush('sentiment:history', JSON.stringify(sentiment))
      await getKv().ltrim('sentiment:history', 0, 29) // 30 days history
    } catch (e) {
      console.error('[knowledge-store] saveSentiment failed:', e instanceof Error ? e.message : String(e))
    }
  },

  async getLatestSentiment(): Promise<Record<string, unknown> | null> {
    if (!isKvConfigured()) return null
    try {
      const data = await getKv().get('sentiment:latest')
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
      await getKv().set(id, JSON.stringify(alert), { ex: 60 * 60 * 24 * 180 }) // 6 months — auto-expires
      await getKv().lpush('infra:alerts', id)

      const state = alert.state as string | undefined
      if (state) {
        await getKv().lpush(`infra:state:${state}`, id)
      }
    } catch (e) {
      console.error('[knowledge-store] saveInfrastructureAlert failed:', e instanceof Error ? e.message : String(e))
    }
  },

  async getInfrastructureAlerts(state?: string): Promise<Record<string, unknown>[]> {
    if (!isKvConfigured()) return []
    try {
      const key = state ? `infra:state:${state}` : 'infra:alerts'
      const ids = await getKv().lrange(key, 0, 99) as string[]
      if (!ids || ids.length === 0) return []
      const alerts = await Promise.all(
        ids.map(async (id) => {
          const data = await getKv().get(id)
          if (!data) return null
          return typeof data === 'string' ? JSON.parse(data) : data
        })
      )
      return alerts.filter(Boolean) as Record<string, unknown>[]
    } catch { return [] }
  },

  // ─────────────────────────────────────────────────────────
  // SUBURB MENTIONS (trending tracking)
  // ─────────────────────────────────────────────────────────

  async incrementSuburbMention(suburb: string, state: string): Promise<void> {
    if (!isKvConfigured()) return
    try {
      const countKey = `mentions:count:${state.toLowerCase()}:${suburb.toLowerCase().replace(/\s+/g, '-')}`
      await getKv().incr(countKey)
      await getKv().expire(countKey, 60 * 60 * 24 * 30) // 30-day rolling window
    } catch (e) {
      console.error('[knowledge-store] incrementSuburbMention failed:', e instanceof Error ? e.message : String(e))
    }
  },

  async getTopMentionedSuburbs(limit: number = 10): Promise<Array<{
    suburb: string
    state: string
    mentions: number
  }>> {
    if (!isKvConfigured()) return []
    try {
      const keys = await getKv().keys('mentions:count:*') as string[]
      if (!keys || keys.length === 0) return []

      const suburbs = await Promise.all(
        keys.map(async (key) => {
          const parts = key.replace('mentions:count:', '').split(':')
          const state = parts[0].toUpperCase()
          const suburb = parts[1].replace(/-/g, ' ')
            .split(' ')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
          const count = await getKv().get(key)
          const mentions = typeof count === 'number' ? count : parseInt(String(count || '0'))
          return { suburb, state, mentions }
        })
      )

      return suburbs
        .filter(s => s.mentions > 0)
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, limit)
    } catch { return [] }
  },

  // ─────────────────────────────────────────────────────────
  // SUBURB SCORES (investment scorecard)
  // ─────────────────────────────────────────────────────────

  async saveSuburbScore(suburb: string, state: string, data: Record<string, unknown>): Promise<void> {
    if (!isKvConfigured()) return
    try {
      const key = `score:${state.toLowerCase()}:${suburb.toLowerCase().replace(/\s+/g, '-')}`
      const overall = (data.overallScore as number) || 0
      await getKv().set(key, JSON.stringify({
        ...data,
        suburb,
        state,
        updatedAt: new Date().toISOString(),
      }), { ex: 60 * 60 * 24 * 30 }) // 30 days
      // Sorted set for ranking
      await getKv().zadd('suburbs:scores:all', { score: overall, member: `${suburb}|${state}` })
    } catch (e) {
      console.error('[knowledge-store] saveSuburbScore failed:', e instanceof Error ? e.message : String(e))
    }
  },

  async getSuburbScore(suburb: string, state: string): Promise<Record<string, unknown> | null> {
    if (!isKvConfigured()) return null
    try {
      const key = `score:${state.toLowerCase()}:${suburb.toLowerCase().replace(/\s+/g, '-')}`
      const data = await getKv().get(key)
      if (!data) return null
      return typeof data === 'string' ? JSON.parse(data) : data as Record<string, unknown>
    } catch { return null }
  },

  async getTopScoredSuburbs(limit: number = 50): Promise<Record<string, unknown>[]> {
    if (!isKvConfigured()) return []
    try {
      const members = await getKv().zrange('suburbs:scores:all', 0, limit - 1, { rev: true }) as string[]
      if (!members || members.length === 0) return []

      const scores = await Promise.all(
        members.map(async (member) => {
          const [suburb, subState] = member.split('|')
          const key = `score:${subState.toLowerCase()}:${suburb.toLowerCase().replace(/\s+/g, '-')}`
          const data = await getKv().get(key)
          if (!data) return null
          return typeof data === 'string' ? JSON.parse(data) : data
        })
      )
      return scores.filter(Boolean) as Record<string, unknown>[]
    } catch { return [] }
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
        getKv().llen('insights:all'),
        getKv().llen('insights:urgent'),
        getKv().llen('infra:alerts'),
        getKv().llen('sentiment:history'),
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

  // ─────────────────────────────────────────────────────────
  // RUN HISTORY
  // ─────────────────────────────────────────────────────────

  async saveLastRunStats(stats: {
    articlesFound: number
    insightsExtracted: number
    feedsScanned: number
    runAt: string
  }): Promise<void> {
    if (!isKvConfigured()) return
    try {
      await getKv().set('research:lastRun', JSON.stringify(stats))
      await getKv().lpush('research:runHistory', JSON.stringify(stats))
      await getKv().ltrim('research:runHistory', 0, 29) // keep 30 runs
    } catch (e) {
      console.error('[knowledge-store] saveLastRunStats failed:', e instanceof Error ? e.message : String(e))
    }
  },

  async getLastRunStats(): Promise<Record<string, unknown> | null> {
    if (!isKvConfigured()) return null
    try {
      const data = await getKv().get('research:lastRun')
      if (!data) return null
      return typeof data === 'string' ? JSON.parse(data) : data as Record<string, unknown>
    } catch { return null }
  },

  async getRunHistory(limit: number = 7): Promise<Record<string, unknown>[]> {
    if (!isKvConfigured()) return []
    try {
      const items = await getKv().lrange('research:runHistory', 0, limit - 1) as string[]
      if (!items || items.length === 0) return []
      return items.map(item => typeof item === 'string' ? JSON.parse(item) : item) as Record<string, unknown>[]
    } catch { return [] }
  },

  // ─────────────────────────────────────────────────────────
  // CONNECTION TEST
  // ─────────────────────────────────────────────────────────

  async testConnection(): Promise<boolean> {
    if (!isKvConfigured()) return false
    try {
      await getKv().set('test:connection', 'ok', { ex: 60 })
      const result = await getKv().get('test:connection')
      return result === 'ok'
    } catch { return false }
  },
}
