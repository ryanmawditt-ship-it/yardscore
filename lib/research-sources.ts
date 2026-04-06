/**
 * YARDSCORE RESEARCH INTELLIGENCE SOURCES
 * ============================================================
 * Comprehensive Australian property market data sources.
 * Covers mainstream news, property media, government, councils,
 * economic indicators, demographics, construction, and more.
 * ============================================================
 */

export const researchSources = {

  // MAINSTREAM NEWS - affects sentiment and policy
  mainstreamNews: [
    'https://www.abc.net.au/news/feed/51120/rss.xml',
    'https://www.abc.net.au/news/business/feed/2942/rss.xml',
    'https://www.smh.com.au/rss/feed.xml',
    'https://www.theage.com.au/rss/feed.xml',
    'https://www.afr.com/rss',
    'https://www.news.com.au/finance/real-estate/rss',
    'https://www.couriermail.com.au/property/rss',
    'https://www.heraldsun.com.au/property/rss',
    'https://www.dailytelegraph.com.au/property/rss',
    'https://www.theaustralian.com.au/property/rss',
    'https://www.brisbanetimes.com.au/rss/feed.xml',
    'https://www.watoday.com.au/rss/feed.xml',
    'https://www.canberratimes.com.au/rss/feed.xml',
    'https://7news.com.au/news/property/rss',
    'https://9news.com.au/property/rss',
    'https://www.10news.com.au/rss',
  ],

  // PROPERTY SPECIFIC BLOGS AND MEDIA
  propertyMedia: [
    'https://www.propertyupdate.com.au/feed/',
    'https://www.smartpropertyinvestment.com.au/feed/',
    'https://www.reiq.com/articles/feed/',
    'https://www.propertyobserver.com.au/feed/',
    'https://www.domain.com.au/news/feed/',
    'https://www.realestate.com.au/news/feed/',
    'https://www.yourinvestmentpropertymag.com.au/feed/',
    'https://www.apimagazine.com.au/feed/',
    'https://www.propertychat.com.au/community/forums/-/index.rss',
    'https://www.somersoft.com/forum/rss.php',
    'https://www.propertyinvestingforum.com.au/feed/',
    'https://www.investoproperty.com.au/feed/',
    'https://www.microburbs.com.au/blog/feed/',
    'https://www.propertyology.com.au/feed/',
    'https://eliteagent.com/feed/',
    'https://www.ratemyagent.com.au/blog/feed/',
  ],

  // MARKET DATA PROVIDERS
  marketData: [
    'https://sqmresearch.com.au/blog/feed/',
    'https://corelogic.com.au/news-research/feed/',
    'https://www.pipa.asn.au/feed/',
    'https://htag.com.au/blog/feed/',
    'https://www.proptrack.com.au/insights/feed/',
    'https://www.pexa.com.au/insights/feed/',
    'https://www.rea-group.com/media/news/feed/',
    'https://www.rpm.com.au/research/feed/',
  ],

  // QUEENSLAND GOVERNMENT SOURCES
  qldGovernment: [
    'https://www.qld.gov.au/transport/projects/rss',
    'https://www.tmr.qld.gov.au/projects/rss',
    'https://www.infrastructure.qld.gov.au/rss',
    'https://www.planning.qld.gov.au/rss',
    'https://www.qld.gov.au/housing/rss',
    'https://www.treasury.qld.gov.au/rss',
    'https://www.economicdevelopment.qld.gov.au/rss',
    'https://www.olympics.com.au/news/feed/',
    'https://www.brisbane2032.com/news/feed/',
  ],

  // FEDERAL GOVERNMENT
  federalGovernment: [
    'https://www.infrastructure.gov.au/rss',
    'https://www.abs.gov.au/rss',
    'https://www.rba.gov.au/rss/',
    'https://www.treasury.gov.au/rss',
    'https://www.nhfic.gov.au/news/feed/',
    'https://www.housingaustralia.gov.au/news/feed/',
    'https://www.infrastructure.gov.au/infrastructure/infrastructure-investment/rss',
  ],

  // STATE GOVERNMENT SOURCES - ALL STATES
  stateGovernment: [
    // NSW
    'https://www.planning.nsw.gov.au/news/feed/',
    'https://www.transport.nsw.gov.au/news/feed/',
    'https://www.nsw.gov.au/media-releases/feed/',
    // VIC
    'https://www.planning.vic.gov.au/news/feed/',
    'https://bigbuild.vic.gov.au/news/feed/',
    'https://www.vic.gov.au/news/feed/',
    // WA
    'https://www.planning.wa.gov.au/news/feed/',
    'https://www.mainroads.wa.gov.au/news/feed/',
    // SA
    'https://www.sa.gov.au/news/feed/',
    'https://www.dpti.sa.gov.au/news/feed/',
  ],

  // LOCAL COUNCIL DA PORTALS
  councilDAs: [
    'https://www.brisbane.qld.gov.au/planning-and-building/applications-and-permits/rss',
    'https://www.moretonbay.qld.gov.au/Council/News/RSS',
    'https://www.ipswich.qld.gov.au/about_council/news-and-media/rss',
    'https://www.logan.qld.gov.au/council/news/rss',
    'https://www.goldcoast.qld.gov.au/council/news/rss',
    'https://www.sunshinecoast.qld.gov.au/Council/News-Centre/RSS',
    'https://www.toowoomba.qld.gov.au/council-information/news-and-media/rss',
    'https://www.cityofparramatta.nsw.gov.au/news/rss',
    'https://www.innerwest.nsw.gov.au/news/rss',
    'https://www.melbourne.vic.gov.au/news/rss',
    'https://www.cityofmelbourne.vic.gov.au/news/rss',
  ],

  // ECONOMIC AND FINANCIAL NEWS
  economicNews: [
    'https://www.rba.gov.au/media-releases/rss.xml',
    'https://www.apra.gov.au/news-and-publications/rss',
    'https://www.accc.gov.au/media-releases/rss',
    'https://tradingeconomics.com/australia/rss',
    'https://www.investing.com/rss/news_301.rss',
    'https://www.marketindex.com.au/rss/news',
  ],

  // DEMOGRAPHIC AND MIGRATION DATA
  demographicSources: [
    'https://www.abs.gov.au/statistics/people/population/rss',
    'https://www.homeaffairs.gov.au/news/rss',
    'https://immi.homeaffairs.gov.au/news/rss',
    'https://www.ceda.com.au/news/rss',
  ],

  // CONSTRUCTION AND DEVELOPMENT INDUSTRY
  constructionNews: [
    'https://www.constructionreview.com.au/feed/',
    'https://www.theurbandeveloper.com/feed/',
    'https://www.architectureau.com/feed/',
    'https://www.sourceable.net/feed/',
    'https://www.hia.com.au/news/rss',
    'https://www.masterbuilders.com.au/news/rss',
    'https://www.aiqs.com.au/news/rss',
  ],

  // RENTAL MARKET SOURCES
  rentalSources: [
    'https://www.rent.com.au/blog/feed/',
    'https://www.flatmates.com.au/blog/feed/',
    'https://www.propertymanager.com.au/feed/',
    'https://www.rentinvest.com.au/feed/',
  ],

  // INTEREST RATES AND BANKING
  financeSources: [
    'https://www.canstar.com.au/home-loans/rss/',
    'https://www.ratecity.com.au/home-loans/rss/',
    'https://www.mozo.com.au/home-loans/rss/',
    'https://www.finder.com.au/home-loans/rss/',
  ],

  // TWITTER/X ACCOUNTS TO MONITOR
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

  // PROPERTY PODCASTS
  podcasts: [
    'https://www.propertycouch.com.au/feed/podcast/',
    'https://www.australianpropertypodcast.com.au/feed/',
    'https://www.propertypodcast.com.au/feed/',
    'https://www.smartpropertyinvestment.com.au/podcasts/feed/',
  ],

  // OVERSEAS SOURCES AFFECTING AUSTRALIAN PROPERTY
  internationalSources: [
    'https://www.interest.co.nz/property/rss',
    'https://www.globalpropertyguide.com/rss',
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

/** Get total source count */
export function getSourceCount(): number {
  let count = 0
  for (const value of Object.values(researchSources)) {
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
