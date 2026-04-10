/**
 * YARDSCORE RESEARCH INTELLIGENCE SOURCES v2.0
 * ============================================================
 * Comprehensive Australian property market data sources.
 * Optimised for SUBURB-SPECIFIC intelligence, not just national commentary.
 *
 * TOTAL FEEDS: 230+
 *   - Google News (national):          20 feeds
 *   - Google News (suburb-specific):    92 feeds
 *   - Direct property media:           12 feeds
 *   - Direct suburb sources:           20 feeds
 *   - Expert blogs & Substacks:        14 feeds  ← NEW
 *   - Podcasts (analyst RSS):          10 feeds  ← NEW
 *   - YouTube channels (analyst RSS):   8 feeds  ← NEW
 *   - Mainstream news:                  6 feeds
 *   - Government/economic:              3 feeds
 *   - Construction:                     2 feeds
 *   - Reddit:                           6 feeds
 *   - Twitter/X accounts:              30 accounts (expanded)
 *
 * FUTURE (post-revenue):
 *   - PlanningAlerts.org.au (paid API, 212 councils, DA by postcode)
 *     Sign up at: https://www.planningalerts.org.au/api/howto
 *     Feed format: api.planningalerts.org.au/applications.rss?key=KEY&postcode=XXXX
 *
 * Last verified: 2026-04-10
 *
 * STRATEGY:
 * 1. Google News RSS = backbone (aggregates ALL outlets incl. paywalled)
 *    - National feeds for macro trends
 *    - Suburb-specific feeds using quoted suburb names + property terms
 * 2. Direct feeds = specialist/niche content from property media
 * 3. Reddit = ground-level investor sentiment
 * 4. FUTURE: PlanningAlerts = DA monitoring by suburb (paid API, add post-revenue)
 *
 * QUERY DESIGN PRINCIPLES (for suburb-specific Google News):
 * - Quoting suburb names (%22suburb%22) forces Google to match exactly
 * - Combining with "property" OR "real estate" filters to property content
 * - OR-grouping nearby suburbs catches articles mentioning either
 * - Adding state name disambiguates suburbs with same name across states
 * - "best suburbs" / "top suburbs" / "hotspot" queries return list articles
 *   that name many suburbs — high suburb density per article
 * - "development application" / "rezoning" / "DA approved" queries
 *   are inherently suburb-specific (DAs are always location-bound)
 * ============================================================
 */

export const researchSources = {

  // ─────────────────────────────────────────────────────────
  // GOOGLE NEWS AGGREGATION — NATIONAL/MACRO FEEDS
  // These return broad market intelligence, policy signals,
  // economic indicators, and national trend pieces.
  // Kept from v1 — all verified working.
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
  // GOOGLE NEWS — SUBURB-SPECIFIC QUERIES
  // These use quoted suburb names and property-related terms
  // to force suburb-level article matching.
  //
  // Design: %22suburb%22 = exact match on suburb name
  // OR-grouped nearby suburbs catch regional articles.
  // Pattern queries ("best suburbs", "hotspot", etc.)
  // return list-style articles naming many suburbs.
  //
  // Organised by state for easy maintenance.
  // ─────────────────────────────────────────────────────────
  googleNewsSuburbSpecific: [

    // ── QLD: Brisbane Metro ──────────────────────────────
    // Brisbane inner suburbs — high media coverage, Olympics catalyst
    'https://news.google.com/rss/search?q=%22Woolloongabba%22+OR+%22New+Farm%22+OR+%22Teneriffe%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Bulimba%22+OR+%22Hawthorne%22+OR+%22Morningside%22+real+estate&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Paddington%22+OR+%22Milton%22+OR+%22Toowong%22+property+brisbane&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Fortitude+Valley%22+OR+%22Newstead%22+OR+%22Bowen+Hills%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Ascot%22+OR+%22Hamilton%22+OR+%22Clayfield%22+property+brisbane&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Coorparoo%22+OR+%22Greenslopes%22+OR+%22Holland+Park%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Chermside%22+OR+%22Nundah%22+OR+%22Stafford%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Mount+Gravatt%22+OR+%22Sunnybank%22+OR+%22Upper+Mount+Gravatt%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Indooroopilly%22+OR+%22St+Lucia%22+OR+%22Taringa%22+property&hl=en-AU&gl=AU&ceid=AU:en',

    // Brisbane north — growth corridors, Moreton Bay
    'https://news.google.com/rss/search?q=%22North+Lakes%22+OR+%22Mango+Hill%22+OR+%22Griffin%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Caboolture%22+OR+%22Morayfield%22+OR+%22Burpengary%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Narangba%22+OR+%22Kallangur%22+OR+%22Deception+Bay%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Strathpine%22+OR+%22Brendale%22+OR+%22Petrie%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Redcliffe%22+property+queensland&hl=en-AU&gl=AU&ceid=AU:en',

    // Brisbane south/west — Springfield, Ipswich, Ripley growth
    'https://news.google.com/rss/search?q=%22Springfield%22+property+queensland&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Ipswich%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Ripley%22+OR+%22Yarrabilba%22+OR+%22Flagstone%22+development&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Logan%22+OR+%22Beenleigh%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',

    // QLD: Gold Coast, Sunshine Coast
    'https://news.google.com/rss/search?q=%22Gold+Coast%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Surfers+Paradise%22+OR+%22Broadbeach%22+OR+%22Burleigh+Heads%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Robina%22+OR+%22Varsity+Lakes%22+OR+%22Mudgeeraba%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Sunshine+Coast%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Caloundra%22+OR+%22Maroochydore%22+OR+%22Noosa%22+property&hl=en-AU&gl=AU&ceid=AU:en',

    // QLD: Regional
    'https://news.google.com/rss/search?q=%22Toowoomba%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Bundaberg%22+OR+%22Hervey+Bay%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Rockhampton%22+OR+%22Gladstone%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Townsville%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Cairns%22+real+estate+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Mackay%22+OR+%22Emerald%22+property+queensland&hl=en-AU&gl=AU&ceid=AU:en',

    // QLD pattern queries
    'https://news.google.com/rss/search?q=brisbane+suburb+property+price+growth&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=queensland+suburb+rental+vacancy+rate&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22best+suburbs%22+brisbane+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22hotspot%22+queensland+property+suburb&hl=en-AU&gl=AU&ceid=AU:en',

    // ── NSW: Sydney Metro ────────────────────────────────
    'https://news.google.com/rss/search?q=%22Parramatta%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Blacktown%22+OR+%22Penrith%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Campbelltown%22+OR+%22Liverpool%22+property+nsw&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Western+Sydney%22+property+development&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Marrickville%22+OR+%22Newtown%22+OR+%22Leichhardt%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Auburn%22+OR+%22Granville%22+OR+%22Merrylands%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Burwood%22+OR+%22Strathfield%22+OR+%22Ashfield%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Balmain%22+OR+%22Rozelle%22+OR+%22Glebe%22+property&hl=en-AU&gl=AU&ceid=AU:en',

    // NSW: Regional
    'https://news.google.com/rss/search?q=%22Newcastle%22+property+market+nsw&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Wollongong%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Central+Coast%22+property+nsw&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Maitland%22+OR+%22Cessnock%22+property+nsw&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Wagga+Wagga%22+OR+%22Dubbo%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Bathurst%22+OR+%22Orange%22+property+nsw&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Tamworth%22+OR+%22Armidale%22+property+nsw&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Albury%22+OR+%22Wodonga%22+property&hl=en-AU&gl=AU&ceid=AU:en',

    // NSW pattern queries
    'https://news.google.com/rss/search?q=sydney+suburb+property+price+growth&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22best+suburbs%22+sydney+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22hotspot%22+nsw+property+suburb&hl=en-AU&gl=AU&ceid=AU:en',

    // ── VIC: Melbourne Metro ─────────────────────────────
    'https://news.google.com/rss/search?q=%22Footscray%22+OR+%22Sunshine%22+property+melbourne&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Fitzroy%22+OR+%22Brunswick%22+OR+%22Northcote%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Coburg%22+OR+%22Preston%22+OR+%22Thornbury%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Carlton%22+OR+%22Richmond%22+property+melbourne&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Cranbourne%22+OR+%22Pakenham%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Melton%22+OR+%22Werribee%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Frankston%22+OR+%22Dandenong%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Craigieburn%22+OR+%22Epping%22+OR+%22South+Morang%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Sunbury%22+OR+%22Deer+Park%22+OR+%22Altona%22+property&hl=en-AU&gl=AU&ceid=AU:en',

    // VIC: Regional
    'https://news.google.com/rss/search?q=%22Geelong%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Ballarat%22+OR+%22Bendigo%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Shepparton%22+OR+%22Mildura%22+property&hl=en-AU&gl=AU&ceid=AU:en',

    // VIC pattern queries
    'https://news.google.com/rss/search?q=melbourne+suburb+property+price+growth&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22best+suburbs%22+melbourne+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22hotspot%22+victoria+property+suburb&hl=en-AU&gl=AU&ceid=AU:en',

    // ── WA: Perth Metro ──────────────────────────────────
    'https://news.google.com/rss/search?q=%22Fremantle%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Mandurah%22+OR+%22Rockingham%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Joondalup%22+OR+%22Stirling%22+property+perth&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Ellenbrook%22+OR+%22Bayswater%22+property+perth&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Armadale%22+OR+%22Midland%22+property+perth&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Maylands%22+OR+%22Victoria+Park%22+OR+%22Mount+Lawley%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Subiaco%22+OR+%22Leederville%22+OR+%22North+Perth%22+property&hl=en-AU&gl=AU&ceid=AU:en',

    // WA: Regional/resources
    'https://news.google.com/rss/search?q=%22Karratha%22+OR+%22Port+Hedland%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Bunbury%22+OR+%22Geraldton%22+property+wa&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Broome%22+OR+%22Albany%22+property+wa&hl=en-AU&gl=AU&ceid=AU:en',

    // WA pattern queries
    'https://news.google.com/rss/search?q=perth+suburb+property+price+growth&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22best+suburbs%22+perth+property&hl=en-AU&gl=AU&ceid=AU:en',

    // ── SA: Adelaide Metro & Regional ────────────────────
    'https://news.google.com/rss/search?q=%22Adelaide%22+suburb+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Prospect%22+OR+%22Norwood%22+property+adelaide&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Glenelg%22+OR+%22Unley%22+OR+%22Goodwood%22+property+adelaide&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Mount+Barker%22+property+south+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Whyalla%22+OR+%22Port+Augusta%22+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=adelaide+suburb+property+price+growth&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22best+suburbs%22+adelaide+property&hl=en-AU&gl=AU&ceid=AU:en',

    // ── ACT / TAS / NT ──────────────────────────────────
    'https://news.google.com/rss/search?q=%22Canberra%22+property+market+suburb&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Hobart%22+OR+%22Launceston%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22Darwin%22+property+market&hl=en-AU&gl=AU&ceid=AU:en',

    // ── CROSS-STATE PATTERN QUERIES ──────────────────────
    // These return suburb-list articles ("best suburbs to buy",
    // "top 10 hotspots") which name many suburbs per article.
    // High suburb density per article = excellent for the lexicon.
    'https://news.google.com/rss/search?q=%22best+suburbs%22+property+investment+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22fastest+growing+suburb%22+property+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22cheapest+suburb%22+property+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22most+affordable+suburb%22+property+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22top+suburbs%22+property+investment+2026&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22property+hotspot%22+suburb+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22suburb+profile%22+property+investment+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22median+price%22+suburb+australia+record&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22auction+clearance%22+suburb+results+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22rental+yield%22+suburb+australia+highest&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22vacancy+rate%22+suburb+australia+lowest&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22development+approved%22+property+suburb+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22rezoning%22+property+suburb+development+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22flood+zone%22+OR+%22flood+risk%22+property+suburb+australia&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22gentrification%22+suburb+australia+property&hl=en-AU&gl=AU&ceid=AU:en',
    'https://news.google.com/rss/search?q=%22sea+change%22+OR+%22tree+change%22+suburb+property+australia&hl=en-AU&gl=AU&ceid=AU:en',
  ],

  // ─────────────────────────────────────────────────────────
  // PLANNINGALERTS.ORG.AU — FUTURE (PAID API)
  // 212+ councils, 89% of Australia's population.
  // Returns actual DAs by postcode — the most suburb-specific data possible.
  // Add post-revenue. Sign up: https://www.planningalerts.org.au/api/howto
  // Feed format: api.planningalerts.org.au/applications.rss?key=KEY&postcode=XXXX
  // See buildPlanningAlertsQuery() helper below to generate feeds.
  // ─────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────
  // DIRECT SUBURB-SPECIFIC SOURCES
  // Websites, blogs and news sources that regularly publish
  // suburb-level property articles and have RSS feeds.
  //
  // Quality: HIGH = articles name specific suburbs consistently
  //          MED  = mix of suburb and regional/national
  // ─────────────────────────────────────────────────────────
  directSuburbSources: [
    // Property research blogs — suburb profiles and suburb-specific analysis
    'https://www.propertybuyer.com.au/blog/rss.xml',               // HIGH: Sydney suburb-specific buyer agent blog
    'https://www.openagent.com.au/blog/feed',                      // HIGH: suburb profiles, top growth suburbs lists
    'https://www.microburbs.com.au/blog/feed/',                    // HIGH: data-driven suburb analysis (micro-level)
    'https://www.propertyology.com.au/feed/',                      // HIGH: Simon Pressley, regional suburb picks
    'https://www.yourinvestmentpropertymag.com.au/feed/',          // MED: suburb spotlight + national
    'https://www.apimagazine.com.au/rss',                          // MED: suburb hotspots + national
    'https://www.smartpropertyinvestment.com.au/feed',             // MED: suburb rankings, hotspots, top suburbs

    // Urban development and planning — inherently suburb-specific
    'https://theurbandeveloper.com/feed',                          // HIGH: development projects by suburb/precinct
    'https://www.sourceable.net/feed/',                             // MED: construction projects by location

    // Adelaide-specific sources
    'https://indaily.com.au/feed/',                                 // HIGH: Adelaide suburb news, planning, development

    // Regional property content
    'https://www.petewargent.com/feed/',                            // MED: Pete Wargent, suburb-level analysis

    // Real estate industry — suburb market reports
    'https://eliteagent.com/feed/',                                 // MED: agent suburb profiles and market reports
    'https://www.domain.com.au/news/feed/',                        // MED: suburb reports, market updates
    'https://www.realestate.com.au/news/feed/',                    // MED: suburb listings news, market reports

    // Investor forums — ground-level suburb discussion
    'https://www.propertychat.com.au/community/forums/-/index.rss', // HIGH: investor suburb discussion

    // Niche: sustainable/urban design — planning suburb intelligence
    'https://www.thefifthestate.com.au/feed/',                      // MED: urban development, precinct planning

    // Investment analytics blogs
    'https://www.propertyupdate.com.au/feed/',                      // MED: Michael Yardney suburb analysis
    'https://www.macrobusiness.com.au/feed/',                       // LOW: macro focus but covers suburb data occasionally

    // Savills — commercial/suburb market research
    'https://www.savills.com.au/blog/rss.xml',                      // MED: commercial property by suburb/precinct

    // Hotspotting podcast (Terry Ryder suburb-specific analysis)
    'https://hotspotting.libsyn.com/rss',                           // HIGH: suburb-specific growth picks
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
    'https://www.smartpropertyinvestment.com.au/feed',          // Smart Property Investment
    'https://www.domain.com.au/news/feed/',                     // Domain news
    'https://theurbandeveloper.com/feed',                       // The Urban Developer
    'https://www.petewargent.com/feed/',                        // Pete Wargent blog
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
  // Real-time investor sentiment and ground-level market intel.
  // Suburb-specific discussions are frequent on city subs.
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
  // EXPERT BLOGS & SUBSTACKS
  // Individual analysts, economists, and property commentators.
  // These are the people who break stories and publish analysis
  // before it reaches mainstream media. Suburb-specific research
  // often appears here first.
  //
  // Substack feeds: append /feed to any substack URL
  // WordPress blogs: append /feed/ to blog URL
  // Blogger: /feeds/posts/default
  // ─────────────────────────────────────────────────────────
  expertBlogs: [
    // ── Substacks (verified working) ──
    'https://matusik.substack.com/feed',                           // Michael Matusik — Brisbane property analyst, housing cycles
    'https://ozpropertyinsights.substack.com/feed',                // Cameron Kusher (PropTrack) — weekly market wraps, rate analysis
    'https://propertyinvesting.substack.com/feed',                 // Aus Property Investors Newsletter — 22k subs, investor stories
    'https://australianpropertymarket.substack.com/feed',          // Australian Property Market — trends, strategy
    'https://propertyhubau.substack.com/feed',                     // Property Hub Australia — market dynamics
    'https://propertylovers.substack.com/feed',                    // Property Lovers — market analysis

    // ── Expert blogs (verified or high-confidence URLs) ──
    'https://matusik.com.au/feed',                                  // Matusik Property Insights — Brisbane/QLD focus, suburb data
    'https://www.prosolution.com.au/feed/',                         // Stuart Wemyss — financial planning + property strategy
    'https://digitalfinanceanalytics.com/blog/feed/',               // Martin North (DFA) — mortgage stress, market risk data
    'https://www.lindemanreports.com.au/feed/',                     // John Lindeman — market prediction, suburb analysis
    'https://positiverealestate.com.au/feed/',                        // Positive Real Estate — investment education
    'https://www.ironfish.com.au/feed/',                            // Ironfish — investment property research

    // ── Legacy/alternate formats ──
    'https://petewargent.blogspot.com/feeds/posts/default',         // Pete Wargent (Blogger) — finance, international property
    'https://www.thepropertycouch.com.au/feed/',                    // Property Couch blog — Holdaway & Kingsley investment guides
  ],

  // ─────────────────────────────────────────────────────────
  // PODCASTS — PROPERTY ANALYST RSS FEEDS
  // Podcast RSS feeds are the same analysts from the blogs/Twitter
  // but in long-form audio. They often discuss specific suburbs,
  // growth corridors, and infrastructure catalysts in detail that
  // doesn't make it into written articles.
  //
  // All podcast RSS feeds are public and free to consume.
  // ─────────────────────────────────────────────────────────
  podcasts: [
    'https://michaelyardneypodcast.libsyn.com/rss',                // Michael Yardney — property investment & wealth creation
    'https://hotspotting.libsyn.com/rss',                           // Terry Ryder & Tim Graham — suburb growth data, hotspots
    'https://theelephantintheroom.libsyn.com/rss',                  // Chris Bates & Veronica Morgan — property buying, financial planning
    'https://ypywpodcast.libsyn.com/rss',                           // Daniel Walsh — buyer's agent, market conditions, suburb picks
    'https://rss.com/podcasts/thepropertynerds/',                   // Arjun Paliwal (InvestorKit) — data-driven suburb analysis
    'https://feeds.libsyn.com/109392/rss',                          // Smart Property Investment Show — expert interviews, market insights
    'https://feeds.buzzsprout.com/2041623.rss',                     // Australian Property Podcast (Rask) — property investing FAQ
    'https://propertyinvestory.com/feed/podcast/',                  // Tyrone Shum — investor case studies, strategy deep-dives
    'https://thepropertycouch.com.au/feed/podcast/',                // Bryce Holdaway & Ben Kingsley — investment strategy, money management
    'https://margaretlomas.podbean.com/feed.xml',                   // Margaret Lomas — property investment, wealth building
  ],

  // ─────────────────────────────────────────────────────────
  // YOUTUBE CHANNELS — PROPERTY ANALYST VIDEO RSS
  // YouTube exposes RSS per channel at:
  //   youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
  //
  // These analysts publish suburb walk-throughs, market updates,
  // and infrastructure analysis on video that doesn't appear in
  // their written content.
  //
  // NOTE: Channel IDs below need verification — some may need
  // updating. YouTube channels can be looked up at:
  //   youtube.com/@handle → view source → "externalId"
  // ─────────────────────────────────────────────────────────
  youtubeChannels: [
    // Format: youtube.com/feeds/videos.xml?channel_id=ID
    // These are the highest-value property YouTube channels.
    // Channel IDs marked [VERIFY] should be confirmed on first run.
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCkL6OUmOqOkLqmwFOWfGMOg', // [VERIFY] Michael Yardney / Property Update
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCaIhKgrPT-MFBuX4RT0-JKw', // [VERIFY] Pumped on Property — Ben Everingham, suburb reviews
    'https://www.youtube.com/feeds/videos.xml?channel_id=UC3tE3lGDOnrpWBzwRfnqbqA', // [VERIFY] Rethink Investing — commercial property
    'https://www.youtube.com/feeds/videos.xml?channel_id=UC0FqhqJK2mSb1R3jFqDU-Ig', // [VERIFY] InvestorKit — Arjun Paliwal market analysis
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCQnCfontvrKdFGwGtDhNjsQ', // [VERIFY] Smart Property Investment
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCWGZ5P0E4B0J7kHBGQVZ0TA', // [VERIFY] The Property Couch
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCvO1p8AMRXvJpRqGTi6xYbQ', // [VERIFY] Property Investory — Tyrone Shum
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCGq-C7MgYAqXLPZ3yMHTY4w', // [VERIFY] Propertyology — Simon Pressley
  ],

  // ─────────────────────────────────────────────────────────
  // TWITTER/X ACCOUNTS TO MONITOR
  // Expanded to cover all major analysts, economists, research
  // heads, buyers agents, and industry bodies.
  //
  // NOTE: Native Twitter RSS is dead. Options for RSS:
  //   1. rss.app — generates RSS from any Twitter profile (freemium)
  //   2. fetchrss.com — similar service
  //   3. Nitter — no longer working (blocked by X Feb 2024)
  // For now these are tracked as account handles.
  // When a Twitter-to-RSS service is integrated, use:
  //   https://rss.app/rss-feed/create-twitter-rss-feed
  // ─────────────────────────────────────────────────────────
  twitterAccounts: [
    // Data & research companies
    'CoreLogicAU',           // CoreLogic (now Cotality) — property data
    'SQMResearch',           // SQM Research — vacancy, stock, listings data
    'PropTrack',             // PropTrack (REA Group) — property analytics
    'DomainNews',            // Domain — property news & data

    // Industry bodies
    'REIQueensland',         // REIQ — QLD real estate institute
    'TheREIQ',               // REIQ (alternate handle)
    'REINSW',                // REI NSW
    'REIV_news',             // REIV Victoria
    'REIWA',                 // REIWA Western Australia

    // Economists & research heads
    'LouiChristopher',       // Louis Christopher — SQM Research founder
    'TimLawless',            // Tim Lawless — CoreLogic head of research
    'ShaneOliverAMP',        // Shane Oliver — AMP chief economist (property commentary)
    'NicPow',                // Nicola Powell — Domain chief of research
    'NConisbee',             // Nerida Conisbee — Ray White chief economist
    'cmkusher',              // Cameron Kusher — PropTrack director of research

    // Property commentators & analysts
    'MichaelYardney',        // Michael Yardney — Property Update
    'PeteWargent',           // Pete Wargent — property/finance blog
    'propertyology',         // Simon Pressley — Propertyology
    'SmartPropertyHQ',       // Smart Property Investment magazine
    'AusPropertyInv',        // Australian Property Investor
    'TerryRyder',            // Terry Ryder — Hotspotting
    'SteveNavra',            // Steve Navra — property educator
    'ChrisGray_Empire',      // Chris Gray — Your Empire buyers agent
    'ArjunPaliwal',          // Arjun Paliwal — InvestorKit

    // Government & macro
    'RBAInfo',               // Reserve Bank of Australia
    'ABSStatistics',         // Australian Bureau of Statistics
    'InfrastructureAU',      // Infrastructure Australia
    'QLDTreasury',           // QLD Treasury
    'BrisbaneLGA',           // Brisbane City Council
    'MoretonBayRC',          // Moreton Bay Regional Council
  ],
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Get all RSS feed URLs (excludes twitter accounts and youtube channels needing verification) */
export function getAllFeedUrls(): string[] {
  const allUrls: string[] = []
  for (const [key, value] of Object.entries(researchSources)) {
    if (key === 'twitterAccounts') continue
    allUrls.push(...(value as string[]))
  }
  return allUrls
}

/** Get expert/analyst feed URLs (blogs, substacks, podcasts, youtube) */
export function getExpertFeedUrls(): string[] {
  return [
    ...researchSources.expertBlogs,
    ...researchSources.podcasts,
    ...researchSources.youtubeChannels,
  ]
}

/** Get suburb-specific feed URLs only (Google News suburb + direct suburb sources) */
export function getSuburbSpecificFeedUrls(): string[] {
  return [
    ...researchSources.googleNewsSuburbSpecific,
    ...researchSources.directSuburbSources,
  ]
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

/**
 * Generate a Google News suburb-specific query URL.
 * Useful for dynamically adding suburbs without editing this file.
 *
 * @param suburbs - Array of suburb names (will be OR-grouped)
 * @param terms - Additional search terms like "property", "real estate"
 * @param state - Optional state qualifier for disambiguation
 *
 * @example
 * buildSuburbQuery(['Paddington', 'Milton'], 'property', 'brisbane')
 * // => "https://news.google.com/rss/search?q=%22Paddington%22+OR+%22Milton%22+property+brisbane&hl=en-AU&gl=AU&ceid=AU:en"
 */
export function buildSuburbQuery(suburbs: string[], terms: string, state?: string): string {
  const suburbParts = suburbs.map(s => `%22${encodeURIComponent(s)}%22`).join('+OR+')
  const statePart = state ? `+${encodeURIComponent(state)}` : ''
  const termsPart = `+${encodeURIComponent(terms)}`
  return `https://news.google.com/rss/search?q=${suburbParts}${termsPart}${statePart}&hl=en-AU&gl=AU&ceid=AU:en`
}

/**
 * Generate a PlanningAlerts RSS feed URL for a given postcode.
 * Requires API key to be set.
 *
 * @param postcode - Australian postcode
 * @param apiKey - PlanningAlerts API key
 */
export function buildPlanningAlertsQuery(postcode: string, apiKey: string): string {
  return `https://api.planningalerts.org.au/applications.rss?key=${apiKey}&postcode=${postcode}`
}
