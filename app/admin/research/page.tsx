'use client'

import { useState, useEffect, useCallback } from 'react'

interface Insight {
  title: string
  summary: string
  source: string
  suburb?: string
  state?: string
  category: string
  urgency: string
  impact: string
  relevanceScore: number
  classifiedAt: string
}

interface DAInsight {
  council: string
  state: string
  applications: string[]
  scannedAt: string
}

interface Sentiment {
  overallSentiment: string
  sentimentScore: number
  keyThemes: string[]
  policyRisks: string[]
  opportunities: string[]
  interestRateOutlook: string
  housingSupplyOutlook: string
  demandOutlook: string
}

interface KVStats {
  totalInsights: number
  urgentInsights: number
  infraAlerts: number
  sentimentHistory: number
  kvConfigured: boolean
}

interface ResearchData {
  summary: {
    feedsScanned: number
    feedsSuccessful: number
    articlesFound: number
    insightsExtracted: number
    councilDAsScanned: number
    sentiment: string
    sentimentScore: number
    sourcesMonitored: number
    durationMs: number
    completedAt: string
  }
  kvStats: KVStats
  insights: Insight[]
  daInsights: DAInsight[]
  sentiment: Sentiment
}

interface StoredData {
  stats: KVStats
  latestInsights: Insight[]
  urgentInsights: Insight[]
  sentiment: Sentiment | null
  infraAlerts: Array<{ project?: string; location?: string; impact?: string; urgency?: string }>
}

function UrgencyBadge({ urgency }: { urgency: string }) {
  const colors: Record<string, string> = {
    breaking: 'bg-red-600 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-400 text-gray-900',
    low: 'bg-gray-200 text-gray-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[urgency] || colors.low}`}>
      {urgency.toUpperCase()}
    </span>
  )
}

function ImpactBadge({ impact }: { impact: string }) {
  const colors: Record<string, string> = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[impact] || colors.neutral}`}>
      {impact}
    </span>
  )
}

function SentimentGauge({ score, label }: { score: number; label: string }) {
  const pct = ((score + 100) / 200) * 100
  const color = score > 20 ? 'bg-green-500' : score < -20 ? 'bg-red-500' : 'bg-yellow-500'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className={score > 20 ? 'text-green-600' : score < -20 ? 'text-red-600' : 'text-yellow-600'}>
          {score > 0 ? '+' : ''}{score}
        </span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function ResearchDashboard() {
  const [data, setData] = useState<ResearchData | null>(null)
  const [stored, setStored] = useState<StoredData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStored, setLoadingStored] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adminKey, setAdminKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)

  const loadStoredData = useCallback(async () => {
    setLoadingStored(true)
    try {
      const res = await fetch('/api/research-update', {
        method: 'GET',
        headers: { 'x-admin-key': adminKey },
      })
      if (res.ok) {
        const json = await res.json()
        setStored(json)
      }
    } catch {
      // Silently fail — stored data is supplementary
    } finally {
      setLoadingStored(false)
    }
  }, [adminKey])

  const runResearch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/research-update', {
        method: 'POST',
        headers: {
          'x-admin-key': adminKey,
          'Content-Type': 'application/json',
        },
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `HTTP ${res.status}`)
      }
      const json = await res.json()
      setData(json)
      // Refresh stored data after a run
      loadStoredData()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [adminKey, loadStoredData])

  useEffect(() => {
    const key = typeof window !== 'undefined' ? localStorage.getItem('yardscore-admin-key') : null
    if (key) {
      setAdminKey(key)
      setAuthenticated(true)
    }
  }, [])

  // Load stored data on authentication
  useEffect(() => {
    if (authenticated && adminKey) {
      loadStoredData()
    }
  }, [authenticated, adminKey, loadStoredData])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('yardscore-admin-key', adminKey)
    setAuthenticated(true)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Yardscore Research</h1>
          <p className="text-sm text-gray-500 mb-6">Enter admin key to access the intelligence centre.</p>
          <input
            type="password"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            placeholder="Admin key"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 transition"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    )
  }

  // Determine which sentiment to show — latest run or stored
  const activeSentiment = data?.sentiment || stored?.sentiment
  const activeInsights = data?.insights || stored?.latestInsights || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Yardscore Research Intelligence Centre</h1>
            <p className="text-sm text-gray-500">Monitoring Australian property markets in real-time</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runResearch}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Running...' : 'Run Research Now'}
            </button>
            <button
              onClick={loadStoredData}
              disabled={loadingStored}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition"
            >
              {loadingStored ? 'Loading...' : 'Refresh Stored Data'}
            </button>
            <button
              onClick={() => { localStorage.removeItem('yardscore-admin-key'); setAuthenticated(false) }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && !data && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">Running full research cycle... This may take a few minutes.</p>
          </div>
        )}

        {/* Stored Intelligence Summary — always shown if KV has data */}
        {stored?.stats && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Stored Intelligence (Persistent Database)</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-gray-500">Total Insights</p>
                <p className="text-xl font-bold text-blue-700">{stored.stats.totalInsights}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Urgent Signals</p>
                <p className="text-xl font-bold text-orange-600">{stored.stats.urgentInsights}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Infra Alerts</p>
                <p className="text-xl font-bold text-purple-600">{stored.stats.infraAlerts}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Sentiment History</p>
                <p className="text-xl font-bold text-green-600">{stored.stats.sentimentHistory}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">KV Status</p>
                <p className={`text-xl font-bold ${stored.stats.kvConfigured ? 'text-green-600' : 'text-red-600'}`}>
                  {stored.stats.kvConfigured ? 'Connected' : 'Not configured'}
                </p>
              </div>
            </div>

            {/* Urgent insights from store */}
            {stored.urgentInsights && stored.urgentInsights.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Urgent Signals</p>
                <div className="space-y-2">
                  {stored.urgentInsights.slice(0, 5).map((insight, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 flex items-start gap-2">
                      <UrgencyBadge urgency={insight.urgency} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
                        <p className="text-xs text-gray-500">{insight.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Infrastructure alerts from store */}
            {stored.infraAlerts && stored.infraAlerts.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Infrastructure Alerts</p>
                <div className="space-y-2">
                  {stored.infraAlerts.slice(0, 5).map((alert, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 text-sm">
                      <span className="font-semibold">{alert.project}</span>
                      {alert.location && <span className="text-gray-500"> in {alert.location}</span>}
                      {alert.impact && <span className="text-gray-600"> — {alert.impact}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!data && !loading && !stored?.stats?.totalInsights && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Click &quot;Run Research Now&quot; to start scanning sources.</p>
          </div>
        )}

        {/* Latest Run Stats */}
        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <StatCard label="Sources Monitored" value={data.summary.sourcesMonitored} />
              <StatCard label="Feeds Scanned" value={`${data.summary.feedsSuccessful}/${data.summary.feedsScanned}`} />
              <StatCard label="Articles Found" value={data.summary.articlesFound} />
              <StatCard label="Insights Extracted" value={data.summary.insightsExtracted} />
              <StatCard label="Council DAs" value={data.summary.councilDAsScanned} />
              <StatCard
                label="KV Store"
                value={data.kvStats?.totalInsights ?? 0}
                sub={data.kvStats?.kvConfigured ? 'connected' : 'not configured'}
              />
              <StatCard
                label="Last Updated"
                value={new Date(data.summary.completedAt).toLocaleTimeString()}
                sub={`${(data.summary.durationMs / 1000).toFixed(1)}s`}
              />
            </div>
          </>
        )}

        {/* Sentiment Panel */}
        {activeSentiment && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Market Sentiment</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <SentimentGauge score={activeSentiment.sentimentScore} label="Overall Sentiment" />
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Interest Rates</p>
                    <p className="font-semibold text-sm mt-1 capitalize">{activeSentiment.interestRateOutlook}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Housing Supply</p>
                    <p className="font-semibold text-sm mt-1 capitalize">{activeSentiment.housingSupplyOutlook}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Demand</p>
                    <p className="font-semibold text-sm mt-1 capitalize">{activeSentiment.demandOutlook}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {activeSentiment.keyThemes && activeSentiment.keyThemes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Key Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {activeSentiment.keyThemes.map((theme, i) => (
                        <span key={i} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs">{theme}</span>
                      ))}
                    </div>
                  </div>
                )}
                {activeSentiment.policyRisks && activeSentiment.policyRisks.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Policy Risks</p>
                    <ul className="text-sm text-red-600 space-y-1">
                      {activeSentiment.policyRisks.map((risk, i) => (
                        <li key={i}>• {risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {activeSentiment.opportunities && activeSentiment.opportunities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Opportunities</p>
                    <ul className="text-sm text-green-600 space-y-1">
                      {activeSentiment.opportunities.map((opp, i) => (
                        <li key={i}>• {opp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Intelligence Feed */}
        {activeInsights.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Latest Intelligence ({activeInsights.length} insights)
            </h2>
            <div className="max-h-[600px] overflow-y-auto space-y-3">
              {activeInsights.map((insight, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <UrgencyBadge urgency={insight.urgency} />
                        <ImpactBadge impact={insight.impact} />
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{insight.category}</span>
                        {insight.state && (
                          <span className="text-xs text-blue-600 font-medium">{insight.state}</span>
                        )}
                        {insight.suburb && (
                          <span className="text-xs text-purple-600 font-medium">{insight.suburb}</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{insight.summary}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-gray-900">{insight.relevanceScore}/10</div>
                      <p className="text-xs text-gray-400">relevance</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Council DA Highlights */}
        {data?.daInsights && data.daInsights.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Council Development Applications ({data.daInsights.length} councils scanned)
            </h2>
            <div className="space-y-4">
              {data.daInsights.map((da, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm text-gray-900">{da.council}</span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{da.state}</span>
                    <span className="text-xs text-gray-400">{da.applications.length} applications</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                    {da.applications.slice(0, 5).map((app, j) => (
                      <li key={j} className="truncate">• {app}</li>
                    ))}
                    {da.applications.length > 5 && (
                      <li className="text-gray-400">... and {da.applications.length - 5} more</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
