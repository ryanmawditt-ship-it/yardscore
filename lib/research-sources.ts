/**
 * YARDSCORE RESEARCH INTELLIGENCE SOURCES
 * ============================================================
 * Comprehensive Australian property market data sources.
 * All feeds verified working as of 2026-04-06.
 *
 * Strategy: Google News RSS aggregation is the backbone — it pulls
 * from ALL Australian news sources (including paywalled ones like
 * AFR, News Corp, etc.) and never blocks automated access.
 * Direct feeds supplement with specialist/niche content.
 * ============================================================
 */

export const researchSources = {

  // ─────────────────────────────────────────────────────────
  // GOOGLE NEWS AGGREGATION — the most powerful source
  // Aggregates from ALL news outlets including paywalled ones.
  // Covers ABC, SMH, AFR, Courier Mail, Herald Sun, 7/9/10 News
  // all in one feed. Clean RSS, never blocks, real-time updates.
  // ─────────────────────────────────────────────────────────
  googleNewsAggregation: [
    'https://news.google.com/rss/search?q=australian+property+investment&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=queensland+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=australian+real+estate+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=RBA+interest+rates+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=brisbane+property+2025&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=sydney+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=melbourne+property+investment&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=infrastructure+australia+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=queensland+infrastructure+2025&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=perth+property+market+2025&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=brisbane+2032+olympics+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=australia+rental+market+vacancy&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=australia+housing+affordability&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=property+development+application+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=australian+property+price+growth&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=investment+property+australia+yield&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=corelogic+property+data+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=domain+property+report+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=sqm+research+vacancy+rates&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=australia+population+growth+housing&hl=en-AU&gl=AU&ceid=AU:en',
  ],

  // ─────────────────────────────────────────────────────────
  // DIRECT MAINSTREAM NEWS FEEDS (verified working)
  // ─────────────────────────────────────────────────────────
  mainstreamNews: [
    'https://www.abc.net.au/news/feed/51120/rss.xml',          // ABC News top stories
    'https://www.smh.com.au/rss/feed.xml',                     // Sydney Morning Herald
    'https://www.theage.com.au/rss/feed.xml',                  // The Age (Melbourne)
    'https://www.brisbanetimes.com.au/rss/feed.xml',           // Brisbane Times
    'https://www.watoday.com.au/rss/feed.xml',                 // WA Today (Perth)
    'https://9news.com.au/property/rss',                       // 9 News property
  ],

  // ─────────────────────────────────────────────────────────
  // PROPERTY SPECIFIC BLOGS AND MEDIA (verified working)
  // ─────────────────────────────────────────────────────────
  propertyMedia: [
    'https://www.propertyupdate.com.au/feed/',                  // Michael Yardney's blog
    'https://www.realestate.com.au/news/feed/',                 // REA Group news
    'https://www.yourinvestmentpropertymag.com.au/feed/',       // Your Investment Property mag
    'https://www.apimagazine.com.au/rss',                      // Australian Property Investor mag
    'https://www.propertychat.com.au/community/forums/-/index.rss', // PropertyChat forums
    'https://www.microburbs.com.au/blog/feed/',                 // Microburbs data blog
    'https://www.propertyology.com.au/feed/',                   // Propertyology insights
    'https://eliteagent.com/feed/',                             // Elite Agent (industry)
  ],

  // ─────────────────────────────────────────────────────────
  // GOVERNMENT AND ECONOMIC (verified working)
  // ─────────────────────────────────────────────────────────
  government: [
    'https://www.treasury.qld.gov.au/rss',                     // QLD Treasury
    'https://www.rba.gov.au/rss/rss-cb-media-releases.xml',    // RBA media releases
    'https://www.investing.com/rss/news_301.rss',              // Investing.com AU economy
  ],

  // ─────────────────────────────────────────────────────────
  // CONSTRUCTION AND DEVELOPMENT (verified working)
  // ─────────────────────────────────────────────────────────
  constructionNews: [
    'https://www.sourceable.net/feed/',                         // Sourceable (construction)
    'https://www.aiqs.com.au/news/rss',                        // AIQS (quantity surveyors)
  ],

  // ─────────────────────────────────────────────────────────
  // REDDIT PROPERTY DISCUSSION
  // Real-time investor sentiment and ground-level market intel
  // ─────────────────────────────────────────────────────────
  redditFeeds: [
    'https://www.reddit.com/r/AusProperty/new/.rss',
    'https://www.reddit.com/r/AusFinance/search/.rss?q=property&sort=new',
    'https://www.reddit.com/r/brisbane/search/.rss?q=property&sort=new',
    'https://www.reddit.com/r/perth/search/.rss?q=property&sort=new',
    'https://www.reddit.com/r/melbourne/search/.rss?q=property&sort=new',
    'https://www.reddit.com/r/sydney/search/.rss?q=property&sort=new',
  ],

  // ─────────────────────────────────────────────────────────
  // TWITTER/X ACCOUNTS TO MONITOR
  // ─────────────────────────────────────────────────────────
  twitterAccounts: [
    'CoreLogicAU',
    'SQMResearch',
    'REIQueensland',
    'DomainNews',
    'PropTrack',
    'AusPropertyInv',
    'SmartPropertyInv',
    'propertyology',
    'MichaelYardney',
    'PeteWargent',
    'SteveNavra',
    'ChrisGray_Empire',
    'reiq',
    'RBAInfo',
    'ABSStatistics',
    'InfrastructureAU',
    'QLDTreasury',
    'BrisbaneLGA',
    'MoretonBayRC',
  ],
}

/** Get all RSS feed URLs (excludes twitter accounts) */
export function getAllFeedUrls(): string[] {
  const allUrls: string[] = []
  for (const [key, value] of Object.entries(researchSources)) {
    if (key === 'twitterAccounts') continue
    allUrls.push(...(value as string[]))
  }
  return allUrls
}

/** Get total source count (all categories including twitter) */
export function getSourceCount(): number {
  let count = 0
  for (const value of Object.values(researchSources)) {
    count += (value as string[]).length
  }
  return count
}

/** Get RSS feed count only (excludes twitter) */
export function getFeedCount(): number {
  let count = 0
  for (const [key, value] of Object.entries(researchSources)) {
    if (key === 'twitterAccounts') continue
    count += (value as string[]).length
  }
  return count
}

/** Get category breakdown */
export function getSourceBreakdown(): Record<string, number> {
  const breakdown: Record<string, number> = {}
  for (const [key, value] of Object.entries(researchSources)) {
    breakdown[key] = (value as string[]).length
  }
  return breakdown
}
