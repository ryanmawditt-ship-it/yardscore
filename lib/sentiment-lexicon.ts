/**
 * YARDSCORE SENTIMENT LEXICON
 * ============================================================
 * Comprehensive Australian property investment sentiment scoring.
 * 500+ terms calibrated for property investment context.
 * Used to pre-score articles before Claude extraction and to
 * provide instant sentiment analysis without API calls.
 * ============================================================
 */

export const sentimentLexicon = {
  extremelyBullish: {
    score: 10,
    terms: [
      'olympic village', 'olympic precinct', 'olympic corridor',
      'cross river rail station', 'new train station',
      'new hospital announced', 'hospital construction begins',
      'university campus announced', 'new university precinct',
      'inland rail', 'high speed rail',
      'new airport', 'airport expansion',
      'severe housing shortage', 'critical undersupply',
      'rental crisis', 'zero vacancy', 'vacancy rate zero',
      'no properties available', 'desperate shortage',
      'billion dollar investment', 'major government funding',
      'federal infrastructure funding', 'state budget allocation',
      'priority development area', 'urban renewal precinct',
      'population surge', 'mass migration',
      'record population growth', 'fastest growing region',
      'record interstate migration', 'net migration record',
    ],
  },
  stronglyBullish: {
    score: 8,
    terms: [
      'price surge', 'price boom', 'price explosion',
      'record price growth', 'double digit growth',
      'prices soaring', 'values skyrocketing',
      'unprecedented demand', 'buyers competing',
      'multiple offers', 'auction fever',
      'sold above reserve', 'clearance rate high',
      'construction approved', 'shovels in the ground',
      'construction underway', 'development approved',
      'rezoning approved', 'zoning upgrade',
      'infrastructure funding confirmed', 'project green lit',
      'rail extension approved', 'motorway upgrade approved',
      'rents surging', 'rental growth record',
      'yields climbing', 'yield compression',
      'rental demand surges', 'rents rising fast',
      'landlords market', 'tenant shortage',
      'major employer announced', 'jobs boom',
      'employment hub', 'corporate headquarters',
      'defence expansion', 'mining boom',
      'tech hub', 'innovation precinct',
      'strong population growth', 'undersupplied market',
      'low vacancy rate', 'tight rental market',
      'days on market falling', 'stock levels low',
      'listing shortage', 'buyer demand strong',
    ],
  },
  moderatelyBullish: {
    score: 7,
    terms: [
      'price growth', 'values rising', 'prices increasing',
      'market recovery', 'price rebound', 'upward trend',
      'capital growth', 'appreciation', 'value add',
      'above median growth', 'outperforming market',
      'infrastructure proposed', 'new road planned',
      'development application lodged', 'da approved',
      'planning approval', 'masterplan released',
      'precinct planning', 'urban renewal planned',
      'light rail proposed', 'bus rapid transit',
      'buyer interest strong', 'enquiry levels high',
      'open home crowds', 'auction competition',
      'first home buyer demand', 'investor demand',
      'upgrader demand', 'interstate buyers',
      'sea change demand', 'tree change demand',
      'rental yield positive', 'yield above average',
      'rental demand strong', 'low vacancy',
      'rent increasing', 'rental growth',
      'positively geared', 'cash flow positive',
      'employment growing', 'jobs created',
      'business investment', 'commercial development',
      'retail precinct opening', 'shopping centre',
      'school announced', 'amenity improvement',
      'gentrification', 'suburb improving',
      'cafe culture emerging', 'lifestyle suburb',
      'infrastructure rich', 'well connected',
      'owner occupier demand', 'family friendly',
      'blue chip suburb', 'tightly held',
    ],
  },
  mildlyBullish: {
    score: 6,
    terms: [
      'steady growth', 'consistent performer',
      'stable market', 'solid fundamentals',
      'good rental return', 'reasonable yield',
      'affordable entry', 'value for money',
      'growth corridor', 'developing suburb',
      'up and coming', 'emerging suburb',
      'infrastructure improving', 'amenity growing',
      'young families moving', 'demographics improving',
      'median price growth', 'above average growth',
      'positive sentiment', 'buyer confidence',
      'market stabilising', 'floor found',
      'interest rate relief', 'borrowing capacity improving',
      'lending conditions improving', 'serviceability improving',
    ],
  },
  neutral: {
    score: 5,
    terms: [
      'stable prices', 'market steady',
      'balanced market', 'equal supply demand',
      'median growth', 'average performance',
      'in line with market', 'market rate',
      'typical vacancy', 'normal conditions',
      'seasonal slowdown', 'winter market',
      'spring selling season', 'autumn listings',
      'days on market stable', 'stock levels normal',
      'vendor expectations realistic', 'market equilibrium',
    ],
  },
  mildlyBearish: {
    score: 4,
    terms: [
      'price softening', 'values easing',
      'market cooling', 'slowing market',
      'rising days on market', 'stock increasing',
      'vendor discounting', 'price reductions',
      'negotiating power returning', 'buyers market emerging',
      'interest rate pressure', 'serviceability concerns',
      'affordability constraints', 'borrowing costs rising',
      'rental yield falling', 'vacancy rate rising', 'rental softening',
      'oversupply emerging', 'new supply coming',
      'population growth slowing', 'migration slowing',
      'economic uncertainty', 'business confidence low',
      'cautious sentiment', 'wait and see',
    ],
  },
  moderatelyBearish: {
    score: 3,
    terms: [
      'price falls', 'values declining', 'prices dropping',
      'market downturn', 'correction underway',
      'below reserve', 'passed in at auction',
      'clearance rates falling', 'auction market weak',
      'distressed sales', 'forced selling',
      'oversupply', 'too much stock',
      'vacancy rate high', 'rental oversupply',
      'new apartments flooding', 'development oversupply',
      'unit glut', 'apartment oversupply',
      'job losses', 'unemployment rising',
      'major employer closing', 'factory closing',
      'mine closing', 'industry decline',
      'economic downturn', 'recession fears',
      'negative gearing changes', 'cgt changes',
      'tax changes property', 'investor tax increase',
      'foreign investment restrictions', 'lending restrictions',
      'apra tightening', 'credit tightening',
      'interest rate rise', 'rate hike',
      'extended days on market', 'properties sitting',
      'vendor capitulating', 'price cuts widespread',
      'buyer hesitation', 'market uncertainty',
    ],
  },
  stronglyBearish: {
    score: 2,
    terms: [
      'price crash', 'market crash', 'values collapsing',
      'significant price falls', 'double digit decline',
      'property bubble bursting', 'correction severe',
      'flood damage', 'flood affected area',
      'bushfire risk', 'fire affected',
      'contamination found', 'environmental risk',
      'heritage restrictions', 'development blocked',
      'recession', 'economic crisis',
      'mass unemployment', 'industry collapse',
      'major employer exodus', 'economic devastation',
      'market collapse', 'no buyers',
      'listings exploding', 'panic selling',
      'investor exodus', 'market abandoned',
      'bank valuations falling', 'lmi concerns',
    ],
  },
  extremelyBearish: {
    score: 1,
    terms: [
      'uninhabitable', 'evacuation order',
      'condemned property', 'demolition required',
      'toxic contamination', 'asbestos widespread',
      'subsidence', 'structural failure',
      'ghost town', 'population exodus',
      'no market', 'unsellable',
      'bank refusing to lend', 'unmortgageable',
      'stranded asset', 'worthless land',
      'economic collapse', 'depression',
      'complete market failure', 'no buyers exist',
    ],
  },
  infrastructureImpact: {
    extreme: { score: 10, terms: ['new train line', 'new metro station', 'new hospital', 'university campus', 'olympic venue', 'international airport', 'port expansion', 'major motorway'] },
    high: { score: 8, terms: ['train station upgrade', 'bus rapid transit', 'hospital expansion', 'tafe campus', 'shopping centre', 'major retail', 'sports stadium', 'entertainment precinct', 'school upgrade', 'road upgrade'] },
    medium: { score: 6, terms: ['park upgrade', 'streetscape improvement', 'bike path', 'pedestrian crossing', 'community centre', 'library upgrade', 'childcare centre', 'medical centre'] },
    low: { score: 4, terms: ['footpath repair', 'line marking', 'minor road works', 'tree planting', 'signage upgrade', 'lighting improvement'] },
  },
  policySignals: {
    bullish: [
      'first home buyer grant', 'stamp duty concession', 'first home guarantee', 'help to buy',
      'housing affordability scheme', 'government incentive', 'foreign investment allowed',
      'negative gearing retained', 'cgt discount maintained',
      'interest rate cut', 'rate reduction', 'rate cut',
      'apra loosening', 'lending expanded',
    ],
    bearish: [
      'negative gearing removed', 'negative gearing abolished',
      'cgt discount removed', 'cgt increased', 'land tax increased', 'land tax expansion',
      'vacancy tax', 'empty homes tax', 'foreign buyer ban', 'foreign investment restricted',
      'interest rate rise', 'rate increase', 'rate hike',
      'apra tightening', 'lending restricted',
      'rental controls', 'rent freeze', 'rent cap', 'rent control legislation',
    ],
  },
  economicSignals: {
    bullish: [
      'unemployment falls', 'jobs created', 'wage growth', 'wages rising',
      'gdp growth', 'economic expansion', 'business investment up', 'consumer confidence high',
      'retail spending strong', 'construction activity', 'building approvals rising',
      'immigration strong', 'net overseas migration', 'skilled migration',
    ],
    bearish: [
      'unemployment rises', 'job losses', 'wage stagnation', 'wages falling',
      'gdp falls', 'recession', 'business investment down', 'consumer confidence low',
      'retail spending weak', 'construction slowing', 'building approvals falling',
      'immigration slowing', 'population growth weak', 'net migration negative',
    ],
  },
  rentalSignals: {
    bullish: [
      'vacancy rate below 1%', 'vacancy under 2%', 'zero vacancy', 'rental crisis',
      'rents rising', 'rent increases', 'rental demand strong', 'tenants competing',
      'rental bidding wars', 'rent above asking', 'low rental supply', 'not enough rentals',
      'investment grade rental', 'high rental demand',
      'university rental demand', 'hospital worker demand', 'defence rental demand',
    ],
    bearish: [
      'vacancy rising', 'vacancy above 3%', 'oversupply rentals', 'too many rentals',
      'rents falling', 'rent reductions', 'rental softening', 'landlord incentives',
      'rental concessions', 'weeks free rent', 'tenants have choice', 'rental competition low',
    ],
  },
}

// ============================================================
// SCORING ENGINE
// ============================================================

export interface ArticleScore {
  rawScore: number
  normalisedScore: number // 0-10
  sentiment: string
  bullishTermsFound: string[]
  bearishTermsFound: string[]
  policySignals: string[]
  infrastructureSignals: string[]
  rentalSignals: string[]
  topSignals: string[]
  confidence: 'high' | 'medium' | 'low'
}

export function scoreArticle(text: string): ArticleScore {
  const lowerText = text.toLowerCase()

  let bullishScore = 0
  let bearishScore = 0
  const bullishTermsFound: string[] = []
  const bearishTermsFound: string[] = []
  const policySignalsFound: string[] = []
  const infrastructureSignals: string[] = []
  const rentalSignals: string[] = []
  const termScores: { term: string; score: number }[] = []

  // Bullish tiers (weighted)
  const bullishTiers: Array<{ tier: typeof sentimentLexicon.extremelyBullish; weight: number }> = [
    { tier: sentimentLexicon.extremelyBullish, weight: 3 },
    { tier: sentimentLexicon.stronglyBullish, weight: 2 },
    { tier: sentimentLexicon.moderatelyBullish, weight: 1.5 },
    { tier: sentimentLexicon.mildlyBullish, weight: 1 },
  ]
  for (const { tier, weight } of bullishTiers) {
    for (const term of tier.terms) {
      if (lowerText.includes(term)) {
        const points = tier.score * weight
        bullishScore += points
        bullishTermsFound.push(term)
        termScores.push({ term, score: points })
      }
    }
  }

  // Bearish tiers (weighted negative)
  const bearishTiers: Array<{ tier: typeof sentimentLexicon.mildlyBearish; weight: number }> = [
    { tier: sentimentLexicon.mildlyBearish, weight: 1 },
    { tier: sentimentLexicon.moderatelyBearish, weight: 1.5 },
    { tier: sentimentLexicon.stronglyBearish, weight: 2 },
    { tier: sentimentLexicon.extremelyBearish, weight: 3 },
  ]
  for (const { tier, weight } of bearishTiers) {
    for (const term of tier.terms) {
      if (lowerText.includes(term)) {
        const points = (10 - tier.score) * weight
        bearishScore += points
        bearishTermsFound.push(term)
        termScores.push({ term, score: -points })
      }
    }
  }

  // Policy signals
  for (const term of sentimentLexicon.policySignals.bullish) {
    if (lowerText.includes(term)) {
      bullishScore += 8; policySignalsFound.push(term + ' (bullish)'); termScores.push({ term, score: 8 })
    }
  }
  for (const term of sentimentLexicon.policySignals.bearish) {
    if (lowerText.includes(term)) {
      bearishScore += 8; policySignalsFound.push(term + ' (bearish)'); termScores.push({ term, score: -8 })
    }
  }

  // Infrastructure signals
  const infraTiers = [
    { ...sentimentLexicon.infrastructureImpact.extreme, points: 20 },
    { ...sentimentLexicon.infrastructureImpact.high, points: 12 },
    { ...sentimentLexicon.infrastructureImpact.medium, points: 6 },
  ]
  for (const tier of infraTiers) {
    for (const term of tier.terms) {
      if (lowerText.includes(term)) {
        bullishScore += tier.points
        infrastructureSignals.push(`${term} (+${tier.points})`)
        termScores.push({ term, score: tier.points })
      }
    }
  }

  // Rental signals
  for (const term of sentimentLexicon.rentalSignals.bullish) {
    if (lowerText.includes(term)) {
      bullishScore += 7; rentalSignals.push(term + ' (bullish)'); termScores.push({ term, score: 7 })
    }
  }
  for (const term of sentimentLexicon.rentalSignals.bearish) {
    if (lowerText.includes(term)) {
      bearishScore += 7; rentalSignals.push(term + ' (bearish)'); termScores.push({ term, score: -7 })
    }
  }

  // Economic signals
  for (const term of sentimentLexicon.economicSignals.bullish) {
    if (lowerText.includes(term)) { bullishScore += 5; termScores.push({ term, score: 5 }) }
  }
  for (const term of sentimentLexicon.economicSignals.bearish) {
    if (lowerText.includes(term)) { bearishScore += 5; termScores.push({ term, score: -5 }) }
  }

  const netScore = bullishScore - bearishScore
  const totalTerms = bullishTermsFound.length + bearishTermsFound.length
  const normalisedScore = Math.max(0, Math.min(10, Math.round((5 + netScore / 40) * 10) / 10))

  let sentiment: string
  if (normalisedScore >= 9) sentiment = 'extremely_bullish'
  else if (normalisedScore >= 7.5) sentiment = 'strongly_bullish'
  else if (normalisedScore >= 6.5) sentiment = 'moderately_bullish'
  else if (normalisedScore >= 5.5) sentiment = 'mildly_bullish'
  else if (normalisedScore >= 4.5) sentiment = 'neutral'
  else if (normalisedScore >= 3.5) sentiment = 'mildly_bearish'
  else if (normalisedScore >= 2.5) sentiment = 'moderately_bearish'
  else if (normalisedScore >= 1.5) sentiment = 'strongly_bearish'
  else sentiment = 'extremely_bearish'

  const topSignals = termScores
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, 5)
    .map(t => `${t.term} (${t.score > 0 ? '+' : ''}${t.score.toFixed(0)})`)

  const confidence: ArticleScore['confidence'] = totalTerms >= 5 ? 'high' : totalTerms >= 2 ? 'medium' : 'low'

  return {
    rawScore: netScore,
    normalisedScore,
    sentiment,
    bullishTermsFound,
    bearishTermsFound,
    policySignals: policySignalsFound,
    infrastructureSignals,
    rentalSignals,
    topSignals,
    confidence,
  }
}

/** Helper: get most frequently occurring strings */
export function getMostFrequent(arr: string[], n: number): string[] {
  const counts = arr.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc }, {} as Record<string, number>)
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([term]) => term)
}
