'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

interface Insight {
  title: string; summary: string; source: string; suburb?: string; state?: string
  category: string; urgency: string; impact: string; relevanceScore: number; classifiedAt: string
}
interface DAInsight { council: string; state: string; applications: string[]; scannedAt: string }
interface Sentiment {
  overallSentiment: string; sentimentScore: number; keyThemes: string[]; policyRisks: string[]
  opportunities: string[]; interestRateOutlook: string; housingSupplyOutlook: string; demandOutlook: string
}
interface KVStats { totalInsights: number; urgentInsights: number; infraAlerts: number; sentimentHistory: number; kvConfigured: boolean }
interface RunStats { articlesFound: number; insightsExtracted: number; feedsScanned: number; runAt: string }
interface TrendingSuburb { suburb: string; state: string; mentions: number }
interface SuburbScore {
  suburb: string; state: string; overallScore: number; yieldScore: number; growthScore: number
  infrastructureScore: number; riskScore: number; sentimentScore: number; priceRange: string
  keyReasons: string[]; lastUpdated: string
}
interface ResearchData {
  summary: { feedsScanned: number; feedsSuccessful: number; articlesFound: number; insightsExtracted: number
    councilDAsScanned: number; sentiment: string; sentimentScore: number; sourcesMonitored: number
    durationMs: number; completedAt: string }
  kvStats: KVStats; insights: Insight[]; daInsights: DAInsight[]; sentiment: Sentiment
}
interface StoredData {
  stats: KVStats; latestInsights: Insight[]; urgentInsights: Insight[]
  sentiment: Sentiment | null; infraAlerts: Array<{ project?: string; location?: string; impact?: string; urgency?: string }>
  lastRun: RunStats | null; runHistory: RunStats[]; connected: boolean
  trendingSuburbs: TrendingSuburb[]; topScored: SuburbScore[]
}

// ─────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────

function UrgencyBadge({ urgency }: { urgency: string }) {
  const c: Record<string, string> = { breaking: 'bg-red-600 text-white', high: 'bg-orange-500 text-white', medium: 'bg-yellow-400 text-gray-900', low: 'bg-gray-200 text-gray-700' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c[urgency] || c.low}`}>{urgency.toUpperCase()}</span>
}
function ImpactBadge({ impact }: { impact: string }) {
  const c: Record<string, string> = { positive: 'bg-green-100 text-green-800', negative: 'bg-red-100 text-red-800', neutral: 'bg-gray-100 text-gray-600' }
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c[impact] || c.neutral}`}>{impact}</span>
}
function SentimentGauge({ score, label }: { score: number; label: string }) {
  const pct = ((score + 100) / 200) * 100
  const color = score > 20 ? 'bg-green-500' : score < -20 ? 'bg-red-500' : 'bg-yellow-500'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className={score > 20 ? 'text-green-600' : score < -20 ? 'text-red-600' : 'text-yellow-600'}>{score > 0 ? '+' : ''}{score}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div>
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
function ScoreCell({ score }: { score: number }) {
  const color = score >= 7 ? 'text-green-600' : score >= 5 ? 'text-amber-600' : 'text-red-600'
  return <span className={`font-bold ${color}`}>{score}</span>
}
function SignalPill({ score }: { score: number }) {
  if (score >= 7) return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">BUY</span>
  if (score >= 5) return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-semibold">WATCH</span>
  return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">AVOID</span>
}
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const mins = Math.floor(diff / (1000 * 60))
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h ago`
  if (hours > 0) return `${hours}h ${mins % 60}m ago`
  return `${mins}m ago`
}

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────

export default function ResearchDashboard() {
  const [data, setData] = useState<ResearchData | null>(null)
  const [stored, setStored] = useState<StoredData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStored, setLoadingStored] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adminKey, setAdminKey] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  // Scorecard filters
  const [stateFilter, setStateFilter] = useState('All')
  const [sortBy, setSortBy] = useState('overallScore')
  const [searchTerm, setSearchTerm] = useState('')
  // Suburb drill-down
  const [selectedSuburb, setSelectedSuburb] = useState<{ suburb: string; state: string } | null>(null)

  const loadStoredData = useCallback(async () => {
    setLoadingStored(true)
    try {
      const res = await fetch('/api/research-update', { method: 'GET', headers: { 'x-admin-key': adminKey } })
      if (res.ok) setStored(await res.json())
    } catch {} finally { setLoadingStored(false) }
  }, [adminKey])

  const runResearch = useCallback(async () => {
    setLoading(true); setError(null); setProgressMsg('Scanning 45 RSS feeds...')
    try {
      const res = await fetch('/api/research-update', { method: 'POST', headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' } })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error || `HTTP ${res.status}`) }
      setProgressMsg('Processing results...')
      const json = await res.json(); setData(json)
      setProgressMsg(`Done! ${json.summary.insightsExtracted} insights from ${json.summary.articlesFound} articles`)
      loadStoredData(); setTimeout(() => setProgressMsg(''), 5000)
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); setProgressMsg('') } finally { setLoading(false) }
  }, [adminKey, loadStoredData])

  useEffect(() => { const k = typeof window !== 'undefined' ? localStorage.getItem('yardscore-admin-key') : null; if (k) { setAdminKey(k); setAuthenticated(true) } }, [])
  useEffect(() => { if (authenticated && adminKey) loadStoredData() }, [authenticated, adminKey, loadStoredData])

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); localStorage.setItem('yardscore-admin-key', adminKey); setAuthenticated(true) }

  // Scorecard filtering
  const filteredScores = useMemo(() => {
    let scores = stored?.topScored || []
    if (stateFilter !== 'All') scores = scores.filter(s => s.state === stateFilter)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      scores = scores.filter(s => s.suburb.toLowerCase().includes(term))
    }
    scores = [...scores].sort((a, b) => {
      const aVal = (a as unknown as Record<string, number>)[sortBy] || 0
      const bVal = (b as unknown as Record<string, number>)[sortBy] || 0
      return bVal - aVal
    })
    return scores
  }, [stored?.topScored, stateFilter, sortBy, searchTerm])

  // Insights for the selected suburb
  const suburbInsights = useMemo(() => {
    if (!selectedSuburb) return []
    const all = stored?.latestInsights || data?.insights || []
    const name = selectedSuburb.suburb.toLowerCase()
    const st = selectedSuburb.state.toUpperCase()
    return all.filter(i =>
      (i.suburb && i.suburb.toLowerCase() === name) ||
      (i.state === st && (
        i.title.toLowerCase().includes(name) ||
        i.summary.toLowerCase().includes(name)
      ))
    )
  }, [selectedSuburb, stored?.latestInsights, data?.insights])

  const selectedScore = useMemo(() => {
    if (!selectedSuburb) return null
    return stored?.topScored?.find(
      sc => sc.suburb.toLowerCase() === selectedSuburb.suburb.toLowerCase() && sc.state === selectedSuburb.state
    ) || null
  }, [selectedSuburb, stored?.topScored])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Yardscore Research</h1>
          <p className="text-sm text-gray-500 mb-6">Enter admin key to access the intelligence centre.</p>
          <input type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} placeholder="Admin key"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 transition">Access Dashboard</button>
        </form>
      </div>
    )
  }

  const activeSentiment = data?.sentiment || stored?.sentiment
  const activeInsights = data?.insights || stored?.latestInsights || []
  const lastRun = stored?.lastRun
  const hoursSinceLastRun = lastRun?.runAt ? (Date.now() - new Date(lastRun.runAt).getTime()) / (1000 * 60 * 60) : null

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
            <button onClick={runResearch} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
              {loading ? 'Running...' : 'Run Research Now'}
            </button>
            <button onClick={loadStoredData} disabled={loadingStored} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition">Refresh</button>
            <button onClick={() => { localStorage.removeItem('yardscore-admin-key'); setAuthenticated(false) }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm"><strong>Error:</strong> {error}</div>}
        {progressMsg && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 text-sm flex items-center gap-3">
            {loading && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />}
            {progressMsg}
          </div>
        )}
        {hoursSinceLastRun !== null && hoursSinceLastRun > 25 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            Research not updated in {Math.floor(hoursSinceLastRun)} hours — run now to get fresh intelligence.
          </div>
        )}

        {/* Status Row */}
        {stored && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Last Research Run</p>
              {lastRun?.runAt ? (<><p className="text-lg font-bold text-gray-900 mt-1">{timeAgo(lastRun.runAt)}</p><p className="text-xs text-gray-400 mt-1">{lastRun.insightsExtracted} insights from {lastRun.articlesFound} articles</p></>) : (<p className="text-lg font-bold text-gray-400 mt-1">Never</p>)}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Next Scheduled Run</p>
              <p className="text-lg font-bold text-gray-900 mt-1">6:00 AM AEST daily</p>
              <p className="text-xs text-gray-400 mt-1">Vercel Cron: 0 6 * * *</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Upstash Redis</p>
              <p className={`text-lg font-bold mt-1 ${stored.connected ? 'text-green-600' : 'text-red-600'}`}>{stored.connected ? 'Connected' : 'Disconnected'}</p>
              <p className="text-xs text-gray-400 mt-1">{stored.stats?.totalInsights ?? 0} insights stored</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 1: TRENDING SUBURBS
            ═══════════════════════════════════════════════════════ */}
        {stored?.trendingSuburbs && stored.trendingSuburbs.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Trending Suburbs</h2>
            <p className="text-sm text-gray-500 mb-4">Most mentioned in Australian property news this month — click to see articles</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {stored.trendingSuburbs.slice(0, 10).map((s, i) => {
                const score = stored.topScored?.find(sc => sc.suburb.toLowerCase() === s.suburb.toLowerCase() && sc.state === s.state)
                const isSelected = selectedSuburb?.suburb.toLowerCase() === s.suburb.toLowerCase() && selectedSuburb?.state === s.state
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedSuburb(isSelected ? null : { suburb: s.suburb, state: s.state })}
                    className={`border rounded-lg p-4 text-left transition cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-100 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl font-bold text-blue-800 leading-none">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{s.suburb}</p>
                        <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{s.state}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{s.mentions} mentions</p>
                    {score && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Score</span>
                          <ScoreCell score={score.overallScore} />
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${score.overallScore >= 7 ? 'bg-green-500' : score.overallScore >= 5 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${score.overallScore * 10}%` }} />
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Suburb drill-down panel */}
            {selectedSuburb && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedSuburb.suburb}, {selectedSuburb.state}</h3>
                    <p className="text-sm text-gray-500">Research intelligence and articles</p>
                  </div>
                  <button onClick={() => setSelectedSuburb(null)} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
                </div>

                {/* Score breakdown */}
                {selectedScore && (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
                    {[
                      { label: 'Overall', val: selectedScore.overallScore },
                      { label: 'Yield', val: selectedScore.yieldScore },
                      { label: 'Growth', val: selectedScore.growthScore },
                      { label: 'Infra', val: selectedScore.infrastructureScore },
                      { label: 'Risk', val: selectedScore.riskScore },
                      { label: 'Sentiment', val: selectedScore.sentimentScore },
                    ].map((m, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">{m.label}</p>
                        <p className={`text-xl font-bold mt-1 ${m.val >= 7 ? 'text-green-600' : m.val >= 5 ? 'text-amber-600' : 'text-red-600'}`}>{m.val}</p>
                      </div>
                    ))}
                  </div>
                )}
                {selectedScore?.priceRange && (
                  <p className="text-sm text-gray-600 mb-4">Price range: <span className="font-semibold">{selectedScore.priceRange}</span></p>
                )}

                {/* Matching articles/insights */}
                {suburbInsights.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {suburbInsights.map((insight, i) => (
                      <div key={i} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                        <div className="flex items-center gap-2 mb-1">
                          <UrgencyBadge urgency={insight.urgency} />
                          <ImpactBadge impact={insight.impact} />
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{insight.category}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{insight.summary}</p>
                        {insight.source && (
                          <a href={insight.source} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                            View source article
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>No specific articles found for {selectedSuburb.suburb} in the current research data.</p>
                    <p className="mt-1">Run a new research cycle to gather fresh intelligence, or search Google News:</p>
                    <a
                      href={`https://news.google.com/search?q=${encodeURIComponent(selectedSuburb.suburb + ' ' + selectedSuburb.state + ' property')}&hl=en-AU&gl=AU&ceid=AU:en`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Search &quot;{selectedSuburb.suburb} property&quot; on Google News
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SECTION 2: AUSTRALIA-WIDE INVESTMENT SCORECARD
            ═══════════════════════════════════════════════════════ */}
        {(stored?.topScored && stored.topScored.length > 0) && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Australia-wide Investment Scorecard</h2>
            <p className="text-sm text-gray-500 mb-4">{stored.topScored.length} suburbs scored from research intelligence</p>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="All">All States</option>
                {['QLD','NSW','VIC','WA','SA','TAS','NT','ACT'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="overallScore">Overall Score</option>
                <option value="yieldScore">Yield</option>
                <option value="growthScore">Growth</option>
                <option value="infrastructureScore">Infrastructure</option>
                <option value="riskScore">Risk (low=safe)</option>
              </select>
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search suburb..."
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
              <span className="text-sm text-gray-400 self-center">{filteredScores.length} suburbs</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 pr-2 font-medium w-8">#</th>
                    <th className="pb-2 pr-3 font-medium">Suburb</th>
                    <th className="pb-2 pr-2 font-medium">State</th>
                    <th className="pb-2 pr-2 font-medium text-center">Overall</th>
                    <th className="pb-2 pr-2 font-medium text-center">Yield</th>
                    <th className="pb-2 pr-2 font-medium text-center">Growth</th>
                    <th className="pb-2 pr-2 font-medium text-center">Infra</th>
                    <th className="pb-2 pr-2 font-medium text-center">Risk</th>
                    <th className="pb-2 pr-2 font-medium">Price Range</th>
                    <th className="pb-2 font-medium text-center">Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScores.map((s, i) => (
                    <tr key={`${s.suburb}-${s.state}`} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 pr-2 text-gray-400 font-medium">{i + 1}</td>
                      <td className="py-2.5 pr-3 font-semibold text-gray-900">{s.suburb}</td>
                      <td className="py-2.5 pr-2"><span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{s.state}</span></td>
                      <td className="py-2.5 pr-2 text-center text-lg"><ScoreCell score={s.overallScore} /></td>
                      <td className="py-2.5 pr-2 text-center"><ScoreCell score={s.yieldScore} /></td>
                      <td className="py-2.5 pr-2 text-center"><ScoreCell score={s.growthScore} /></td>
                      <td className="py-2.5 pr-2 text-center"><ScoreCell score={s.infrastructureScore} /></td>
                      <td className="py-2.5 pr-2 text-center"><ScoreCell score={s.riskScore} /></td>
                      <td className="py-2.5 pr-2 text-gray-600">{s.priceRange}</td>
                      <td className="py-2.5 text-center"><SignalPill score={s.overallScore} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredScores.length === 0 && <p className="text-center text-gray-400 py-8">No suburbs match your filters. Run research to populate scores.</p>}
            </div>
          </div>
        )}

        {/* Knowledge Store Stats */}
        {stored?.stats && stored.stats.totalInsights > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Persistent Knowledge Store</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-xs text-gray-500">Total Insights</p><p className="text-xl font-bold text-blue-700">{stored.stats.totalInsights}</p></div>
              <div><p className="text-xs text-gray-500">Urgent Signals</p><p className="text-xl font-bold text-orange-600">{stored.stats.urgentInsights}</p></div>
              <div><p className="text-xs text-gray-500">Infra Alerts</p><p className="text-xl font-bold text-purple-600">{stored.stats.infraAlerts}</p></div>
              <div><p className="text-xs text-gray-500">Sentiment History</p><p className="text-xl font-bold text-green-600">{stored.stats.sentimentHistory}</p></div>
            </div>
          </div>
        )}

        {/* Run History */}
        {stored?.runHistory && stored.runHistory.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Run History</h2>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-2 font-medium">When</th><th className="pb-2 font-medium">Feeds</th><th className="pb-2 font-medium">Articles</th><th className="pb-2 font-medium">Insights</th></tr></thead>
              <tbody>{stored.runHistory.map((run, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 text-gray-900">{run.runAt ? new Date(run.runAt).toLocaleString() : '—'}</td>
                  <td className="py-2 text-gray-600">{run.feedsScanned ?? '—'}</td>
                  <td className="py-2 text-gray-600">{run.articlesFound ?? '—'}</td>
                  <td className="py-2 font-semibold text-gray-900">{run.insightsExtracted ?? '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* Latest Run Stats */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <StatCard label="Sources" value={data.summary.sourcesMonitored} />
            <StatCard label="Feeds" value={`${data.summary.feedsSuccessful}/${data.summary.feedsScanned}`} />
            <StatCard label="Articles" value={data.summary.articlesFound} />
            <StatCard label="Insights" value={data.summary.insightsExtracted} />
            <StatCard label="Council DAs" value={data.summary.councilDAsScanned} />
            <StatCard label="KV Store" value={data.kvStats?.totalInsights ?? 0} sub={data.kvStats?.kvConfigured ? 'connected' : 'not configured'} />
            <StatCard label="Duration" value={`${(data.summary.durationMs / 1000).toFixed(1)}s`} sub={new Date(data.summary.completedAt).toLocaleTimeString()} />
          </div>
        )}

        {/* Sentiment */}
        {activeSentiment && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Market Sentiment</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <SentimentGauge score={activeSentiment.sentimentScore} label="Overall Sentiment" />
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Interest Rates</p><p className="font-semibold text-sm mt-1 capitalize">{activeSentiment.interestRateOutlook}</p></div>
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Supply</p><p className="font-semibold text-sm mt-1 capitalize">{activeSentiment.housingSupplyOutlook}</p></div>
                  <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500">Demand</p><p className="font-semibold text-sm mt-1 capitalize">{activeSentiment.demandOutlook}</p></div>
                </div>
              </div>
              <div className="space-y-4">
                {activeSentiment.keyThemes?.length > 0 && (<div><p className="text-sm font-medium text-gray-700 mb-2">Key Themes</p><div className="flex flex-wrap gap-2">{activeSentiment.keyThemes.map((t, i) => <span key={i} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs">{t}</span>)}</div></div>)}
                {activeSentiment.policyRisks?.length > 0 && (<div><p className="text-sm font-medium text-gray-700 mb-2">Policy Risks</p><ul className="text-sm text-red-600 space-y-1">{activeSentiment.policyRisks.map((r, i) => <li key={i}>• {r}</li>)}</ul></div>)}
                {activeSentiment.opportunities?.length > 0 && (<div><p className="text-sm font-medium text-gray-700 mb-2">Opportunities</p><ul className="text-sm text-green-600 space-y-1">{activeSentiment.opportunities.map((o, i) => <li key={i}>• {o}</li>)}</ul></div>)}
              </div>
            </div>
          </div>
        )}

        {/* Intelligence Feed */}
        {activeInsights.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Latest Intelligence ({activeInsights.length})</h2>
            <div className="max-h-[600px] overflow-y-auto space-y-3">
              {activeInsights.map((insight, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <UrgencyBadge urgency={insight.urgency} />
                        <ImpactBadge impact={insight.impact} />
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{insight.category}</span>
                        {insight.state && <span className="text-xs text-blue-600 font-medium">{insight.state}</span>}
                        {insight.suburb && <span className="text-xs text-purple-600 font-medium">{insight.suburb}</span>}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{insight.summary}</p>
                    </div>
                    <div className="text-right shrink-0"><div className="text-lg font-bold text-gray-900">{insight.relevanceScore}/10</div><p className="text-xs text-gray-400">relevance</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Council DA Highlights */}
        {data?.daInsights && data.daInsights.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Council DAs ({data.daInsights.length} councils)</h2>
            <div className="space-y-4">
              {data.daInsights.map((da, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm text-gray-900">{da.council}</span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{da.state}</span>
                    <span className="text-xs text-gray-400">{da.applications.length} applications</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
                    {da.applications.slice(0, 5).map((app, j) => <li key={j} className="truncate">• {app}</li>)}
                    {da.applications.length > 5 && <li className="text-gray-400">... and {da.applications.length - 5} more</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {!data && !loading && !stored?.stats?.totalInsights && (
          <div className="text-center py-20"><p className="text-gray-400 text-lg">Click &quot;Run Research Now&quot; to start scanning sources.</p></div>
        )}
      </main>
    </div>
  )
}
