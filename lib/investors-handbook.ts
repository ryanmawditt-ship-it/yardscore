/**
 * YARDSCORE INVESTORS HANDBOOK
 * ============================================================
 * Comprehensive Australian Property Investment Reference
 * Version: 2.0 | Data Period: 2024–2026
 * Sources: CoreLogic, Domain, REIQ, SQM Research, ABS, PropTrack,
 *          Smart Property Investment, Canstar, OpenAgent, Hotspotting
 * ============================================================
 *
 * Usage: Import specific sections by state, budget, or investment goal.
 * All data points are research-based and should be used as directional
 * guidance. Always verify with current market data before transacting.
 */

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────

export type State = "QLD" | "NSW" | "VIC" | "WA" | "SA" | "TAS" | "NT" | "ACT";
export type BudgetTier = "under_500k" | "500k_750k" | "750k_1m" | "over_1m";
export type InvestmentGoal = "yield" | "growth" | "balanced";
export type PropertyType = "house" | "unit" | "townhouse" | "land";
export type RiskLevel = "low" | "medium" | "high" | "very_high";

export interface SuburbProfile {
  suburb: string;
  state: State;
  postcode?: string;
  medianPrice: number;
  medianPriceType: PropertyType;
  annualGrowthPercent: number;
  fiveYearGrowthPercent?: number;
  grossRentalYield?: number;
  netRentalYield?: number;
  vacancyRate?: number;
  daysOnMarket?: number;
  ownerOccupierRatio?: number; // % owner-occupiers vs renters
  budgetTier: BudgetTier;
  investmentGoal: InvestmentGoal[];
  keyDrivers: string[];
  risks?: string[];
  infrastructureNearby?: string[];
  notes?: string;
}

export interface MarketIndicator {
  name: string;
  threshold: string;
  interpretation: string;
  actionSignal: string;
}

export interface RiskFlag {
  category: string;
  indicator: string;
  threshold: string;
  impact: string;
  mitigationStrategy: string;
}

export interface InfrastructureProject {
  name: string;
  state: State;
  type: string;
  estimatedCompletion: string;
  investmentValue: string;
  affectedCorridors: string[];
  expectedPriceImpact: string;
  leadTime: string; // how far in advance prices typically move
}

export interface InvestmentFramework {
  name: string;
  description: string;
  formula?: string;
  benchmarks: Record<string, string>;
  steps?: string[];
  warnings?: string[];
}

export interface RegionalMarket {
  city: string;
  state: State;
  medianHousePrice: number;
  annualGrowthPercent: number;
  fiveYearGrowthPercent: number;
  rentalYield: number;
  vacancyRate: number;
  keyIndustries: string[];
  infrastructureCatalysts: string[];
  riskLevel: RiskLevel;
  investmentCase: string;
}

// ─────────────────────────────────────────────────────────────
// SECTION 1 — AUSTRALIAN PROPERTY MARKET FUNDAMENTALS
// ─────────────────────────────────────────────────────────────

export const MARKET_FUNDAMENTALS = {

  /**
   * Primary drivers of Australian property price growth.
   * Validated against CoreLogic research and ABS data 2024–2026.
   */
  priceGrowthDrivers: [
    {
      driver: "Population Growth & Net Migration",
      weight: "primary",
      explanation:
        "Australia's population growth consistently outpaces new housing supply. In FY2024, net overseas migration reached ~500,000 people. Queensland alone sees 100,000+ new residents annually against ~36,000 new homes built — a structural supply deficit that underpins price growth. Population growth of 1.5%+ annually in a suburb is a strong buy signal.",
      dataSource: "ABS, REIQ, Empire Legal 2024",
    },
    {
      driver: "Housing Supply Shortage",
      weight: "primary",
      explanation:
        "National dwelling approvals of ~163,760 in FY2024 are well below the National Cabinet target of 240,000 per year. This chronic undersupply — compounded by construction cost blowouts, labour shortages, and insolvencies — creates enduring price pressure. Suburbs with fewer than 2% vacancy rates signal acute supply constraints.",
      dataSource: "ABS Building Approvals, CoreLogic 2024",
    },
    {
      driver: "Interest Rate Environment",
      weight: "primary",
      explanation:
        "The RBA cash rate cycle directly influences borrowing capacity. A 100bps rate cut increases borrowing capacity by roughly 10–12%, immediately expanding the buyer pool. Conversely, rate rises compress demand — but the effect is uneven: investors in high-yield assets are less rate-sensitive than owner-occupiers chasing growth suburbs. Fixed-rate mortgage cliffs (2023–2024) suppressed some demand that is now returning.",
      dataSource: "RBA, CoreLogic, ANZ Research 2024",
    },
    {
      driver: "Interstate & Internal Migration",
      weight: "primary",
      explanation:
        "NSWs projected net outflow of 115,300 people by 2028–29 is flowing primarily to QLD, WA, and SA. Queensland's net interstate migration hit 29,910 in FY2024 — the highest of any state and its best in 20 years. Townsville recorded an 857% increase in net migration from capital cities. Follow the people: price growth reliably follows migration flows within 12–24 months.",
      dataSource: "Federal Budget 2025, ABS, Attwoodmarshall 2024",
    },
    {
      driver: "Infrastructure Investment",
      weight: "secondary",
      explanation:
        "Major infrastructure signals permanent uplift in liveability and connectivity. Rail extensions, motorway completions, hospital builds, and university campuses all drive population inflows and reduce commute friction. The price premium for properties within 800m of a new train station is typically 5–15%. Infrastructure announcement alone can trigger 3–8% price moves before construction begins.",
      dataSource: "Infrastructure Australia, Smart Property Investment 2024",
    },
    {
      driver: "Employment & Economic Diversity",
      weight: "secondary",
      explanation:
        "Suburbs and cities with diverse employment bases (healthcare, defence, education, logistics, government) sustain demand through economic cycles. Avoid single-industry dependence. Cities with growing defence spending (Townsville, Darwin), hospital clusters, and university precincts show resilient demand.",
      dataSource: "REIQ, Propertyology 2025",
    },
    {
      driver: "Investor Activity & Sentiment",
      weight: "secondary",
      explanation:
        "Investor-driven markets can accelerate both growth and correction cycles. Queensland's housing market saw $11 trillion in total residential real estate nationally by October 2024 (CoreLogic). When investors represent >40% of buyers in a suburb, watch for over-reliance on sentiment rather than fundamentals.",
      dataSource: "CoreLogic October Housing Chart Pack 2024",
    },
    {
      driver: "Affordability Gradient",
      weight: "secondary",
      explanation:
        "As prices rise in premium suburbs, buyers and investors migrate to the next affordable ring — a ripple effect. When Brisbane's inner suburbs pushed past $1M, demand surged into the $500k–$750k tier in Logan, Ipswich, Moreton Bay, and Redlands. Track the median-to-income ratio: when it exceeds 8x, spillover into cheaper corridors accelerates.",
      dataSource: "ANZ CoreLogic Housing Affordability Report 2024",
    },
  ] as const,

  /**
   * How to identify a suburb on the verge of gentrification.
   */
  gentrificationIndicators: {
    earlySignals: [
      "Builder's utes, cement trucks, and tradesperson vans appearing in street parking — renovation activity is the earliest physical signal",
      "First boutique café or specialty coffee shop (soy lattes on the menu) opening in previously working-class retail strip",
      "Artisan bars, wine bars, or farm-to-table restaurants replacing tired pubs or fast-food strips",
      "Public art murals appearing on building walls and electricity infrastructure",
      "Yoga studios, pilates studios, or dog-grooming salons opening — lifestyle businesses follow the demographic",
      "Property portal searches spiking for the suburb name — monitor CoreLogic, Domain, and REA search volumes",
      "First owner-occupier renovator buying a 'worst house on best street' and doing a full rebuild",
      "New residential approvals for townhouses and dual-occupancy dwellings in traditionally single-house streets",
    ],
    demographicShifts: [
      "Average household income rising faster than surrounding suburbs (ABS Census data)",
      "Proportion of university-educated residents increasing — check ABS Community Profiles",
      "Renters-to-owners ratio beginning to shift toward ownership (owner-occupiers moving in)",
      "Average age of resident declining — younger professionals replacing older retirees",
      "Crime rate declining for three or more consecutive years (publicly available state police data)",
    ],
    infrastructureTriggers: [
      "New train station or bus rapid transit stop announced or under construction within 800m",
      "Major hospital, university campus, or TAFE expansion planned nearby",
      "Suburb rezoned from low-density residential to medium-density — allows townhouses and units",
      "Council-funded streetscape upgrade — new footpaths, street trees, public lighting",
      "Local council actively marketing the suburb for tourism or lifestyle (food trails, art precincts)",
    ],
    dataPointsToMonitor: [
      "Sales volumes rising year-on-year while price growth is still modest (accumulation phase)",
      "Days on market falling faster than surrounding suburbs",
      "Rental yield compression beginning — owner-occupier buyers pushing prices up faster than rents",
      "Listed properties receiving multiple offers within first week",
      "Auction clearance rate for the suburb rising above 65% consistently",
    ],
    warningAboutTiming:
      "Entry is optimal in Stage 2 (early adoption) not Stage 4 (mass media coverage). Once a suburb appears on 'top 10 hotspot' lists in mainstream media, most of the easy money has been made. The best indicator is boots-on-ground observation combined with data from SQM Research and CoreLogic Suburb Reports.",
  },

  /**
   * Infrastructure types and their price impact signals.
   */
  infrastructureSignals: {
    highImpact: [
      {
        type: "New Rail Station or Line Extension",
        priceImpact: "+5% to +15% for properties within 800m",
        leadTime: "Prices move at announcement, peak at completion",
        exampleProjects: ["Cross River Rail (Brisbane 2029)", "Yanchep Rail Extension (Perth 2024)"],
      },
      {
        type: "Major Hospital or Health Precinct",
        priceImpact: "+4% to +10% within 2km radius",
        leadTime: "Construction commencement triggers demand, especially for units near employment clusters",
        exampleProjects: ["Bundaberg Hospital ($1.2B)", "Toowoomba Hospital ($1B under construction)"],
      },
      {
        type: "University Campus or TAFE Expansion",
        priceImpact: "+3% to +8% within 1.5km — high rental demand driver",
        leadTime: "Strong unit and townhouse demand from student and academic population",
        exampleProjects: ["Sunshine Coast University Hospital precinct", "CQU expansions in Mackay and Rockhampton"],
      },
      {
        type: "Olympic or Major Sporting Venue",
        priceImpact: "+10% to +25% in host corridors pre-games",
        leadTime: "Historical data from Sydney, Barcelona, London shows peak gains occur 3–5 years BEFORE the event",
        exampleProjects: ["Brisbane 2032 Olympics — Woolloongabba, Herston, Bowen Hills, Chandler"],
      },
      {
        type: "Major Motorway or Bypass Completion",
        priceImpact: "+5% to +12% in previously isolated suburbs that gain commute access",
        leadTime: "Land values adjacent to interchange points lift at announcement",
        exampleProjects: ["Toowoomba Second Range Crossing — opens Gatton, Laidley, Toowoomba outer corridors"],
      },
    ],
    mediumImpact: [
      {
        type: "Shopping Centre Major Upgrade or New Centre",
        priceImpact: "+2% to +5% within 1km",
        leadTime: "Signals commercial confidence in the area; retail follows rooftops",
      },
      {
        type: "School Rezoning or New Public School Opening",
        priceImpact: "+4% to +8% in catchment zone for family demographics",
        leadTime: "Immediate and sustained demand from owner-occupier families",
      },
      {
        type: "Port Upgrade or Industrial Precinct Expansion",
        priceImpact: "+3% to +7% in surrounding worker accommodation suburbs",
        leadTime: "Employment multiplier effect — each industrial job creates ~2.5 local service jobs",
      },
    ],
    negativeInfrastructure: [
      "New correctional facility (prison) within 3km — measurable negative price effect of -5% to -15%",
      "Major waste treatment or industrial facility — odour and amenity concerns depress residential values",
      "Flight path extension or airport expansion bringing new noise corridors",
      "Major road widening removing green buffer or increasing traffic noise",
      "Electricity substation or high-voltage transmission line within 200m",
    ],
  },

  /**
   * Vacancy rate data interpretation and thresholds.
   */
  vacancyRateGuide: {
    thresholds: [
      {
        range: "< 1%",
        marketType: "Extreme Landlord's Market",
        interpretation: "Critical rental shortage. Rents rising rapidly. Multiple applicants per property. Vacancy allowance for cash flow modelling should be near zero.",
        investorAction: "Strong buy signal for yield-focused investors. Expect significant rental growth in next 12 months.",
      },
      {
        range: "1% – 2%",
        marketType: "Tight Landlord's Market",
        interpretation: "Significant undersupply. Rents rising 5–15% annually. Landlords can select quality tenants. National vacancy rate was 1.1% as of early 2026.",
        investorAction: "Ideal acquisition conditions. Model rental growth at 5–10% in cash flow projections.",
      },
      {
        range: "2% – 3%",
        marketType: "Balanced to Landlord-Favoured",
        interpretation: "Healthy equilibrium with slight landlord advantage. Standard lease renewals and moderate rent increases.",
        investorAction: "Solid market conditions. Model vacancy allowance of 2 weeks per year in cash flow.",
      },
      {
        range: "3% – 4%",
        marketType: "Balanced / Equilibrium",
        interpretation: "Industry benchmark for 'healthy' market. Neither landlord nor tenant advantage. Rents tracking CPI.",
        investorAction: "Neutral conditions. Standard 3–4 week vacancy allowance. Monitor for directional movement.",
      },
      {
        range: "4% – 6%",
        marketType: "Tenant's Market",
        interpretation: "Landlords competing for tenants. Incentives (rent-free periods, upgrades) may be needed. Rent growth flat or negative.",
        investorAction: "Caution. Over-supply risk. Investigate if new supply pipeline is the cause or structural population decline.",
      },
      {
        range: "> 6%",
        marketType: "Oversupplied / Distressed",
        interpretation: "Significant oversupply. Properties sitting vacant. Capital values under pressure. Developer or investor dumping of stock.",
        investorAction: "High risk. Avoid unless purchasing below replacement cost with clear catalyst for recovery.",
      },
    ],
    dataSources: [
      "SQM Research (sqmresearch.com.au) — best monthly suburb-level data, subscription required",
      "REIQ Vacancy Rate Reports — Queensland-specific, quarterly",
      "Domain Vacancy Rate Reports — major capital cities",
      "REA Group (realestate.com.au) rental listings trends as proxy indicator",
    ],
    nationalContext2025: "Australia's national vacancy rate hit 1.1% in early 2026 — a multi-year low — driven by record overseas migration and chronic undersupply. This is below the equilibrium rate of 3% in every mainland state.",
  },

  /**
   * Days on market (DOM) interpretation.
   */
  daysOnMarketGuide: {
    interpretation: [
      {
        range: "< 20 days",
        signal: "Very hot market",
        meaning: "Properties selling immediately with multiple offers. Buyers making rapid decisions — typically translates to price growth in the following 3–6 months.",
      },
      {
        range: "20–35 days",
        signal: "Strong demand",
        meaning: "Healthy buyer competition. Sellers hold leverage. Price growth likely continuing or accelerating.",
      },
      {
        range: "35–50 days",
        signal: "Balanced market",
        meaning: "Fair negotiation conditions. Prices stable. Neither buyer nor seller has structural advantage.",
      },
      {
        range: "50–75 days",
        signal: "Softening market",
        meaning: "Buyers becoming selective. Vendor discounting likely. Watch for price reductions as confirmation.",
      },
      {
        range: "> 75 days",
        signal: "Buyer's market",
        meaning: "Over-supply or weakened demand. Negotiate aggressively. Motivated vendors likely. Exercise caution on underlying drivers before transacting.",
      },
    ],
    leadingIndicatorPrinciple:
      "DOM changes BEFORE prices do. When DOM starts dropping in a suburb, buyer urgency is increasing — this predicts price growth 3–6 months ahead. This makes DOM the most underappreciated leading indicator available for free on most listing portals.",
    howToUse:
      "Compare a suburb's current DOM against its 12-month average and against comparable suburbs. A suburb with DOM falling faster than its peers is accumulating buyer demand and prices will follow.",
    dataSources: ["CoreLogic RP Data", "Domain suburb profiles", "REA Suburb Insights", "Picki (picki.com.au) for automated DOM tracking"],
  },

  /**
   * Rental yield vs. capital growth trade-off.
   */
  yieldVsGrowthTradeoff: {
    principle:
      "Yield and capital growth are generally inversely correlated in Australian property. The highest-yielding suburbs (regional mining towns at 10–12%) typically deliver the worst long-term capital growth, while the strongest growth suburbs (inner-city metro) often yield below 3%. The optimal strategy depends on your tax position, income, and investment horizon.",
    yieldFocusedStrategy: {
      idealFor: "Investors who need cash flow positive properties, those with high borrowing relative to income, SMSF investors, and those with shorter 5–7 year horizons",
      targetMetrics: "Net yield > 5.5%, vacancy rate < 2%, population growth positive, economic base diversified",
      risks: "Lower capital growth means wealth accumulation is slower. Exit liquidity can be limited in pure yield plays in small regional centres.",
      bestSuburbTypes: "Regional cities (Townsville, Bundaberg, Mackay, Cairns), working-class Brisbane suburbs, mining-adjacent diversified economies",
    },
    growthFocusedStrategy: {
      idealFor: "High-income investors in top tax brackets who benefit from negative gearing, long-term (10+ year) buy-and-hold investors, those close to paid-off principal residences who can service debt",
      targetMetrics: "Capital growth > 8% per annum average over 10 years, owner-occupier ratio > 65%, land content > 50% of property value, within 15km of major CBD",
      risks: "Negative cash flow requires income support. Vulnerable to rate rises and income interruptions.",
      bestSuburbTypes: "Inner-ring Brisbane, inner Perth, established Adelaide suburbs, Sydney outer rings with infrastructure",
    },
    balancedStrategy: {
      idealFor: "Most investors building a portfolio over 7–15 years",
      targetMetrics: "Net yield 4–5.5%, capital growth 6–10% per annum, vacancy < 2.5%, diverse employer base",
      bestSuburbTypes: "Middle-ring Brisbane ($500k–$750k tier), outer Adelaide, metro Perth ($500k–$700k), Toowoomba, Sunshine Coast outer suburbs",
    },
    interactionEffect:
      "As a suburb gentrifies and capital growth accelerates, rental yield typically compresses — meaning yields are highest BEFORE the growth happens. The skill is identifying high-yield suburbs before the capital growth narrative takes hold.",
  },

  /**
   * Population growth and property demand relationship.
   */
  populationAndDemand: {
    keyPrinciple:
      "Population growth is the fundamental engine of housing demand. Every additional person needs housing — as either an owner-occupier or a renter. In markets where population grows faster than dwellings are built, prices rise.",
    thresholds: [
      { annualGrowthRate: "> 2%", signal: "Strong demand pressure — prices likely rising", action: "High conviction buy zone" },
      { annualGrowthRate: "1.5% – 2%", signal: "Solid demand — above national average", action: "Good buy conditions" },
      { annualGrowthRate: "0.5% – 1.5%", signal: "Moderate demand — track closely", action: "Consider with other positive indicators" },
      { annualGrowthRate: "< 0.5%", signal: "Weak demand — caution warranted", action: "Only buy if yield is exceptional and supply is constrained" },
      { annualGrowthRate: "Negative", signal: "Population decline — high risk", action: "Avoid unless major turnaround catalyst is clear and imminent" },
    ],
    queenslandContext:
      "Queensland's population grows by ~100,000+ people per year (interstate + overseas), while only ~36,000 new homes are built — a 2.8x demand-to-supply ratio. This structural imbalance underpins QLD's outperformance since 2020.",
    dataSources: ["ABS Regional Population Growth (annual)", "Queensland Government Statistician's Office", "id.com.au community profiles (free)", "Migration.com.au"],
  },

  /**
   * How interest rates affect different property types differently.
   */
  interestRateImpactByType: {
    houses: {
      sensitivity: "Medium",
      explanation: "Owner-occupier houses in family suburbs are the most rate-sensitive because buyers are stretching maximum borrowing capacity. A 50bps cut can add $50k–$80k in borrowing power, immediately expanding the buyer pool and pushing prices up.",
      rateRiseSensitivity: "Strong sellers shift to vendor discounting. First-home buyer demand falls sharply. Investors who can support negative cash flow still active.",
    },
    units: {
      sensitivity: "High (for new off-the-plan), Lower (for established)",
      explanation: "New apartment developments are extremely rate-sensitive — buyer demand evaporates during high-rate cycles, causing settlements risks and developer distress. Established units in tight rental markets are more resilient because strong rental income offsets rate cost.",
      rateRiseSensitivity: "Off-the-plan cancellations spike. Established units in sub-1% vacancy areas can maintain or grow rents to offset investor holding costs.",
    },
    townhouses: {
      sensitivity: "Medium",
      explanation: "Occupies a sweet spot: affordable entry for owner-occupiers and investors, reasonable land content, strong rental demand. Less sensitive to rate rises than pure investment units because owner-occupier demand provides a floor.",
    },
    regionals: {
      sensitivity: "Low-to-Medium",
      explanation: "Regional property is less sensitive to rate changes because: (1) absolute prices are lower, meaning repayments are smaller; (2) cash-on-cash yields are higher, making the asset more self-funding; (3) buyers tend to have lower LVRs. However, regional areas dependent on a single industry (mining) can be acutely rate-sensitive if commodity prices fall simultaneously.",
    },
    investmentGradeHouses: {
      sensitivity: "Low",
      explanation: "Well-located investment properties with strong yields are counter-cyclically appealing during rate rises — rental income rises (due to landlord cost-passing) while prices moderate, creating improved entry points. Professional investors use rate-rise periods to accumulate in fundamentally sound suburbs.",
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 2 — QUEENSLAND INVESTMENT HOTSPOTS 2024–2026
// ─────────────────────────────────────────────────────────────

export const QLD_HOTSPOTS: SuburbProfile[] = [

  // ── UNDER $500K — CAPITAL GROWTH ──────────────────────────

  {
    suburb: "Deeragun",
    state: "QLD",
    medianPrice: 450000,
    medianPriceType: "house",
    annualGrowthPercent: 18,
    grossRentalYield: 6.2,
    vacancyRate: 0.8,
    budgetTier: "under_500k",
    investmentGoal: ["growth", "yield"],
    keyDrivers: ["Townsville proximity at 20% lower price point", "Strong rental demand from defence/healthcare workforce", "Limited new supply"],
    infrastructureNearby: ["Townsville University Hospital", "Lavarack Barracks (Defence)"],
    notes: "50–100k cheaper than comparable Townsville suburbs. Vacancy rate below 1%. High yield and growth combination rare at this price point.",
  },
  {
    suburb: "Goondiwindi",
    state: "QLD",
    medianPrice: 350000,
    medianPriceType: "house",
    annualGrowthPercent: 12,
    grossRentalYield: 6.8,
    vacancyRate: 1.1,
    budgetTier: "under_500k",
    investmentGoal: ["yield", "balanced"],
    keyDrivers: ["Agricultural hub with stable employment base", "Border town with NSW demand spillover", "Low entry price creates strong yield"],
    notes: "Steady rental growth and solid capital gains. Strong agricultural economy diversified from mining risk.",
  },
  {
    suburb: "Warwick",
    state: "QLD",
    medianPrice: 390000,
    medianPriceType: "house",
    annualGrowthPercent: 14,
    grossRentalYield: 6.5,
    vacancyRate: 1.3,
    budgetTier: "under_500k",
    investmentGoal: ["yield", "balanced"],
    keyDrivers: ["Southern QLD regional hub", "Infrastructure investment in health and education", "Spillover from Toowoomba premium"],
    notes: "Significant rental growth and strong capital gains. Regional lifestyle appeal attracting tree-changers.",
  },
  {
    suburb: "Atherton",
    state: "QLD",
    medianPrice: 440000,
    medianPriceType: "house",
    annualGrowthPercent: 11,
    grossRentalYield: 5.8,
    vacancyRate: 1.5,
    budgetTier: "under_500k",
    investmentGoal: ["yield", "balanced"],
    keyDrivers: ["Atherton Tablelands lifestyle hub", "Tourism and agricultural base", "Cairns commuter demand"],
    infrastructureNearby: ["Cairns Regional Hospital (regional referral)", "Atherton Hospital"],
    notes: "Cooler climate alternative to coastal QLD. Under-the-radar market with steady demand from Cairns professionals.",
  },
  {
    suburb: "Blacks Beach",
    state: "QLD",
    medianPrice: 480000,
    medianPriceType: "house",
    annualGrowthPercent: 18,
    grossRentalYield: 6.4,
    vacancyRate: 0.9,
    budgetTier: "under_500k",
    investmentGoal: ["growth", "yield"],
    keyDrivers: ["Mackay coastal lifestyle", "Mining sector demand (Bowen Basin)", "Extremely tight vacancy"],
    notes: "Vacancy under 1%, house rents rose 14% in 2024. Rare coastal suburb still under $500k with beach access.",
  },
  {
    suburb: "Mareeba",
    state: "QLD",
    medianPrice: 380000,
    medianPriceType: "house",
    annualGrowthPercent: 10,
    grossRentalYield: 6.2,
    vacancyRate: 1.8,
    budgetTier: "under_500k",
    investmentGoal: ["yield"],
    keyDrivers: ["Agricultural and tourism base", "Cairns Airport proximity (30min)", "Affordable lifestyle market"],
    notes: "Gateway to Atherton Tablelands. Strong yields and low vacancy driven by agricultural workforce.",
  },
  {
    suburb: "Dysart",
    state: "QLD",
    medianPrice: 250000,
    medianPriceType: "house",
    annualGrowthPercent: 8,
    grossRentalYield: 10.5,
    vacancyRate: 2.0,
    budgetTier: "under_500k",
    investmentGoal: ["yield"],
    keyDrivers: ["Bowen Basin coal mining", "Extreme yield plays", "FIFO worker demand"],
    risks: ["Single industry concentration — coal price sensitive", "Population volatile", "Banks restrict lending"],
    notes: "HIGH RISK. Extraordinary yield but classic mining town volatility. Only for sophisticated investors with full understanding of cycle risk.",
  },
  {
    suburb: "Eagleby",
    state: "QLD",
    postcode: "4207",
    medianPrice: 480000,
    medianPriceType: "house",
    annualGrowthPercent: 16,
    grossRentalYield: 5.8,
    vacancyRate: 1.2,
    budgetTier: "under_500k",
    investmentGoal: ["growth", "yield"],
    keyDrivers: ["Logan City affordability corridor", "Major infrastructure south of Brisbane", "First-home buyer and investor demand"],
    infrastructureNearby: ["Logan Motorway", "Beenleigh Train Station"],
    notes: "Brisbane's southern affordability gradient. Median still under $500k with strong growth trajectory as inner Logan suburbs push higher.",
  },
  {
    suburb: "Caboolture",
    state: "QLD",
    postcode: "4510",
    medianPrice: 490000,
    medianPriceType: "house",
    annualGrowthPercent: 14,
    grossRentalYield: 5.3,
    vacancyRate: 1.6,
    budgetTier: "under_500k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["North Brisbane growth corridor", "Bruce Highway and rail connectivity", "Population growth in Moreton Bay region"],
    infrastructureNearby: ["Caboolture Train Station", "Sunshine Coast Hospital District (30min)"],
    notes: "Northern gateway suburb. Moreton Bay Council growth corridor with improving amenities.",
  },
  {
    suburb: "Zillmere",
    state: "QLD",
    postcode: "4034",
    medianPrice: 485000,
    medianPriceType: "house",
    annualGrowthPercent: 15,
    grossRentalYield: 5.4,
    vacancyRate: 1.1,
    budgetTier: "under_500k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["North Brisbane value play", "Chermside Westfield proximity (major retail/jobs hub)", "Excellent transport connections"],
    infrastructureNearby: ["Zillmere Train Station", "Chermside Westfield", "Prince Charles Hospital (5km)"],
    notes: "Northside Brisbane suburb still under $500k with direct access to Chermside employment and retail hub. Rapidly gentrifying.",
  },

  // ── $500K – $750K — CAPITAL GROWTH ───────────────────────

  {
    suburb: "Woolloongabba",
    state: "QLD",
    postcode: "4102",
    medianPrice: 1150000,
    medianPriceType: "house",
    annualGrowthPercent: 18,
    grossRentalYield: 3.8,
    budgetTier: "500k_750k",
    investmentGoal: ["growth"],
    keyDrivers: ["2032 Olympics — main stadium site", "Cross River Rail station", "Gentrifying inner-south Brisbane"],
    infrastructureNearby: ["Cross River Rail Woolloongabba Station (2029)", "Gabba Stadium Redevelopment (2030)", "Princess Alexandra Hospital"],
    notes: "Units are accessible in the $500k–$750k range. Ground zero for Brisbane's Olympics transformation. Historic data: Olympics host suburbs peak 3–5 years before the Games.",
  },
  {
    suburb: "Bowen Hills",
    state: "QLD",
    postcode: "4006",
    medianPrice: 650000,
    medianPriceType: "unit",
    annualGrowthPercent: 14,
    grossRentalYield: 5.2,
    vacancyRate: 1.4,
    budgetTier: "500k_750k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Inner-Brisbane Olympics corridor", "Cross River Rail proximity", "Urban renewal precinct"],
    infrastructureNearby: ["RNA Showgrounds Precinct", "Cross River Rail", "Brisbane Metro"],
    notes: "Major urban renewal with Olympics investment. Units and townhouses in target budget range. Strong rental demand from inner-city professionals.",
  },
  {
    suburb: "Chermside",
    state: "QLD",
    postcode: "4032",
    medianPrice: 710000,
    medianPriceType: "house",
    annualGrowthPercent: 13,
    grossRentalYield: 4.8,
    vacancyRate: 1.3,
    budgetTier: "500k_750k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Major retail and employment hub (Westfield Chermside)", "Prince Charles Hospital", "Airport corridor connectivity"],
    infrastructureNearby: ["Westfield Chermside (largest QLD shopping centre)", "Prince Charles Hospital", "Brisbane Airport (20min)"],
    notes: "North Brisbane's commercial capital. Strong owner-occupier to investor mix. Consistent demand driver from hospital and retail employment.",
  },
  {
    suburb: "Deagon",
    state: "QLD",
    postcode: "4017",
    medianPrice: 750000,
    medianPriceType: "house",
    annualGrowthPercent: 12,
    grossRentalYield: 4.6,
    vacancyRate: 1.8,
    budgetTier: "500k_750k",
    investmentGoal: ["balanced"],
    keyDrivers: ["Redcliffe Peninsula affordability corridor", "Moreton Bay coastal lifestyle", "Rail connectivity to Brisbane"],
    infrastructureNearby: ["Moreton Bay Rail Link", "Deagon Wetlands"],
    notes: "Northside bayside with rail access. Value relative to Redcliffe and Sandgate. Family demographics driving owner-occupier demand.",
  },
  {
    suburb: "Maroochydore",
    state: "QLD",
    postcode: "4558",
    medianPrice: 750000,
    medianPriceType: "unit",
    annualGrowthPercent: 11,
    grossRentalYield: 5.4,
    vacancyRate: 1.5,
    budgetTier: "500k_750k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Sunshine Coast CBD designation", "New Maroochydore CBD development (10-year project)", "Tourism and lifestyle demand"],
    infrastructureNearby: ["Sunshine Coast Airport (5min)", "Maroochydore City Centre development", "Sunshine Coast University Hospital"],
    notes: "Sunshine Coast's emerging CBD. 500 unit sales in 2024 at median $750k. City centre development adds long-term demand driver.",
  },
  {
    suburb: "Stafford Heights",
    state: "QLD",
    postcode: "4053",
    medianPrice: 680000,
    medianPriceType: "house",
    annualGrowthPercent: 13,
    grossRentalYield: 4.9,
    vacancyRate: 1.2,
    budgetTier: "500k_750k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Northside Brisbane gentrification wave", "Chermside proximity", "Remaining affordability relative to inner-north"],
    notes: "Undervalued relative to Stafford and Lutwyche. Gentrification wave moving north through the corridor.",
  },
  {
    suburb: "Mitchelton",
    state: "QLD",
    postcode: "4053",
    medianPrice: 720000,
    medianPriceType: "house",
    annualGrowthPercent: 12,
    grossRentalYield: 4.3,
    vacancyRate: 1.4,
    budgetTier: "500k_750k",
    investmentGoal: ["growth"],
    keyDrivers: ["North Brisbane lifestyle suburb with strong café culture", "Train station connectivity", "Proximity to Brookside Shopping Centre"],
    infrastructureNearby: ["Mitchelton Train Station", "Brookside Shopping Centre"],
    notes: "Westside Brisbane lifestyle precinct. Strong owner-occupier appeal — high proportion of long-term holders. Cultural and café scene emerging.",
  },
  {
    suburb: "Coolum Beach",
    state: "QLD",
    postcode: "4573",
    medianPrice: 730000,
    medianPriceType: "house",
    annualGrowthPercent: 11,
    grossRentalYield: 4.2,
    vacancyRate: 1.9,
    budgetTier: "500k_750k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Sunshine Coast beachside lifestyle", "Remote work migration", "Tourism and short-stay income potential"],
    notes: "Coastal QLD lifestyle at relative value vs Noosa. Remote work migration sustaining demand. Short-stay market supplements yield.",
  },
  {
    suburb: "Redcliffe",
    state: "QLD",
    postcode: "4020",
    medianPrice: 680000,
    medianPriceType: "house",
    annualGrowthPercent: 14,
    grossRentalYield: 5.0,
    vacancyRate: 1.6,
    budgetTier: "500k_750k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Moreton Bay peninsula lifestyle", "Moreton Bay Rail Link (opened 2016 — still driving growth)", "Coastal lifestyle at Brisbane prices"],
    infrastructureNearby: ["Kippa-Ring Train Station", "Moreton Bay coastline"],
    notes: "Rail connection unlocked Redcliffe from isolated peninsula to Brisbane commuter suburb. Growth still running as infrastructure premium is absorbed.",
  },
  {
    suburb: "Southport",
    state: "QLD",
    postcode: "4215",
    medianPrice: 710000,
    medianPriceType: "unit",
    annualGrowthPercent: 12,
    grossRentalYield: 4.8,
    vacancyRate: 1.7,
    budgetTier: "500k_750k",
    investmentGoal: ["balanced"],
    keyDrivers: ["Gold Coast CBD hub", "Light rail connectivity", "Healthcare and education employment"],
    infrastructureNearby: ["Gold Coast Light Rail G:link", "Gold Coast University Hospital", "Griffith University"],
    notes: "Gold Coast's commercial CBD with university and hospital anchor tenants creating sustained rental demand.",
  },

  // ── $750K – $1M — CAPITAL GROWTH ─────────────────────────

  {
    suburb: "Herston",
    state: "QLD",
    postcode: "4006",
    medianPrice: 850000,
    medianPriceType: "house",
    annualGrowthPercent: 16,
    grossRentalYield: 4.2,
    vacancyRate: 1.1,
    budgetTier: "750k_1m",
    investmentGoal: ["growth"],
    keyDrivers: ["Royal Brisbane & Women's Hospital precinct", "Brisbane Metro station (2027)", "Olympics corridor — Herston Velodrome"],
    infrastructureNearby: ["Royal Brisbane & Women's Hospital (largest QLD hospital)", "Brisbane Metro Herston Station", "Queensland Institute of Medical Research"],
    notes: "Medical precinct suburb with Olympics infrastructure. One of the few inner-Brisbane suburbs still under $1M for quality houses.",
  },
  {
    suburb: "Spring Hill",
    state: "QLD",
    postcode: "4000",
    medianPrice: 800000,
    medianPriceType: "unit",
    annualGrowthPercent: 14,
    grossRentalYield: 7.2,
    vacancyRate: 1.0,
    budgetTier: "750k_1m",
    investmentGoal: ["yield", "balanced"],
    keyDrivers: ["Brisbane CBD fringe — walkable to CBD", "Highest rental yield in inner Brisbane at 7.2%", "Limited new supply — heritage-listed streetscapes restrict development"],
    notes: "Best rental yield in inner Brisbane. Spring Hill's supply is constrained by heritage protections — a natural moat for existing landlords.",
  },
  {
    suburb: "East Brisbane",
    state: "QLD",
    postcode: "4169",
    medianPrice: 980000,
    medianPriceType: "house",
    annualGrowthPercent: 15,
    grossRentalYield: 3.9,
    vacancyRate: 1.2,
    budgetTier: "750k_1m",
    investmentGoal: ["growth"],
    keyDrivers: ["Olympics corridor — Woolloongabba adjacency", "Lifestyle village feel with Mowbray Park", "Inner-south Brisbane gentrification"],
    infrastructureNearby: ["Cross River Rail Woolloongabba (800m)", "PA Hospital", "South Bank"],
    notes: "Premium inner-south suburb in the Olympics growth corridor. Strong owner-occupier demand limits rental availability.",
  },
  {
    suburb: "Coorparoo",
    state: "QLD",
    postcode: "4151",
    medianPrice: 950000,
    medianPriceType: "house",
    annualGrowthPercent: 14,
    grossRentalYield: 4.0,
    vacancyRate: 1.3,
    budgetTier: "750k_1m",
    investmentGoal: ["growth"],
    keyDrivers: ["South-east Brisbane lifestyle precinct", "Olympics corridor proximity", "High owner-occupier demographic"],
    notes: "Consistently strong performer. Coorparoo Square development adding retail and hospitality to suburb identity.",
  },
  {
    suburb: "Kangaroo Point",
    state: "QLD",
    postcode: "4169",
    medianPrice: 900000,
    medianPriceType: "unit",
    annualGrowthPercent: 13,
    grossRentalYield: 4.5,
    vacancyRate: 1.5,
    budgetTier: "750k_1m",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Riverfront lifestyle", "New pedestrian bridge to South Bank and CBD", "Olympics proximity"],
    infrastructureNearby: ["New Kangaroo Point Bridge (completed 2023)", "South Bank (walkable)"],
    notes: "The new free bridge to South Bank transformed walkability scores overnight. One of Brisbane's best lifestyle locations with Olympics uplift.",
  },
  {
    suburb: "Fortitude Valley",
    state: "QLD",
    postcode: "4006",
    medianPrice: 780000,
    medianPriceType: "unit",
    annualGrowthPercent: 13,
    grossRentalYield: 5.6,
    vacancyRate: 1.3,
    budgetTier: "750k_1m",
    investmentGoal: ["balanced"],
    keyDrivers: ["Entertainment and hospitality precinct", "Cross River Rail station", "Olympics corridor — media and entertainment hub"],
    infrastructureNearby: ["Fortitude Valley Train Station", "Cross River Rail upgrade", "Brisbane Live (new entertainment venue proposal)"],
    notes: "Inner Brisbane lifestyle precinct undergoing significant gentrification. Cross River Rail will reduce travel to Gabba to <5 minutes.",
  },
  {
    suburb: "Stones Corner",
    state: "QLD",
    postcode: "4120",
    medianPrice: 860000,
    medianPriceType: "house",
    annualGrowthPercent: 15,
    grossRentalYield: 4.2,
    budgetTier: "750k_1m",
    investmentGoal: ["growth"],
    keyDrivers: ["Coorparoo/Woolloongabba adjacency", "Emerging café and retail strip", "Olympics corridor spillover"],
    notes: "The next Coorparoo. Attracts buyers priced out of Woolloongabba and Camp Hill. Gentrification firmly underway.",
  },
  {
    suburb: "Dutton Park",
    state: "QLD",
    postcode: "4102",
    medianPrice: 880000,
    medianPriceType: "house",
    annualGrowthPercent: 16,
    grossRentalYield: 4.0,
    budgetTier: "750k_1m",
    investmentGoal: ["growth"],
    keyDrivers: ["Boggo Road precinct development", "PA Hospital employment hub", "UQ and Mater Hospital proximity"],
    infrastructureNearby: ["Princess Alexandra Hospital", "Boggo Road Urban Village", "University of Queensland"],
    notes: "Education and health employment anchor creates stable long-term demand. Boggo Road precinct transformation underway.",
  },
  {
    suburb: "Buderim",
    state: "QLD",
    postcode: "4556",
    medianPrice: 880000,
    medianPriceType: "house",
    annualGrowthPercent: 11,
    grossRentalYield: 4.3,
    vacancyRate: 1.8,
    budgetTier: "750k_1m",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Sunshine Coast hinterland lifestyle", "Sunshine Coast University Hospital (10min)", "Remote work migration destination"],
    infrastructureNearby: ["Sunshine Coast University Hospital", "USC Sippy Downs campus", "Maroochydore CBD (15min)"],
    notes: "Premium Sunshine Coast address. Consistent long-term performer with healthcare employment as structural demand driver.",
  },
  {
    suburb: "Ashmore",
    state: "QLD",
    postcode: "4214",
    medianPrice: 745000,
    medianPriceType: "unit",
    annualGrowthPercent: 12,
    grossRentalYield: 5.3,
    vacancyRate: 1.6,
    budgetTier: "750k_1m",
    investmentGoal: ["balanced"],
    keyDrivers: ["Gold Coast hinterland value", "Gold Coast Light Rail proximity", "Healthcare and retail employment corridor"],
    notes: "Unit yield of 5.3% is exceptional for Gold Coast. GCUH and Griffith employment creates stable rental demand.",
  },

  // ── TOP RENTAL YIELD — ANY BUDGET ─────────────────────────

  {
    suburb: "Pioneer (Mount Isa)",
    state: "QLD",
    medianPrice: 200000,
    medianPriceType: "house",
    annualGrowthPercent: 5,
    grossRentalYield: 12.0,
    vacancyRate: 2.5,
    budgetTier: "under_500k",
    investmentGoal: ["yield"],
    keyDrivers: ["Mount Isa mining economy", "Extreme yield from low price and high rents"],
    risks: ["Single-industry concentration", "Cyclical commodity price exposure", "Bank lending restrictions", "Limited buyer pool on exit"],
    notes: "EXTREME YIELD, EXTREME RISK. Suitable only for sophisticated investors who understand and can manage mining cycle risk.",
  },
  {
    suburb: "Spring Hill",
    state: "QLD",
    medianPrice: 800000,
    medianPriceType: "unit",
    annualGrowthPercent: 14,
    grossRentalYield: 7.2,
    vacancyRate: 1.0,
    budgetTier: "750k_1m",
    investmentGoal: ["yield", "balanced"],
    keyDrivers: ["Brisbane CBD fringe", "Heritage supply constraint", "Professional tenant demographic"],
    notes: "Brisbane's best inner-city yield. Heritage protections act as permanent supply moat.",
  },
  {
    suburb: "Eagleby",
    state: "QLD",
    medianPrice: 480000,
    medianPriceType: "house",
    annualGrowthPercent: 16,
    grossRentalYield: 5.8,
    vacancyRate: 1.2,
    budgetTier: "under_500k",
    investmentGoal: ["yield", "growth"],
    keyDrivers: ["Southern Brisbane affordability corridor", "Logan Motorway access", "Beenleigh rail connectivity"],
    notes: "Best Brisbane metro yield under $500k with genuine growth credentials.",
  },
];

// ─────────────────────────────────────────────────────────────
// QLD REGIONAL MARKETS
// ─────────────────────────────────────────────────────────────

export const QLD_REGIONAL_MARKETS: RegionalMarket[] = [
  {
    city: "Toowoomba",
    state: "QLD",
    medianHousePrice: 934405,
    annualGrowthPercent: 14.04,
    fiveYearGrowthPercent: 91.48,
    rentalYield: 4.8,
    vacancyRate: 0.9,
    keyIndustries: ["Agriculture", "Transport/Logistics", "Healthcare", "Education", "Retail"],
    infrastructureCatalysts: [
      "Inland Rail Link (Toowoomba logistics hub)",
      "Wellcamp Airport (freight and passenger)",
      "Toowoomba Hospital ($1B rebuild underway)",
      "Toowoomba Second Range Crossing (completed)",
      "University of Southern Queensland expansion",
    ],
    riskLevel: "low",
    investmentCase:
      "Australia's second-largest inland city with extraordinary 5-year growth of 91%. Inland Rail positions Toowoomba as the nation's logistics hub. Diversified economy with no single-industry risk. Vacancy sub-1% creating rent growth. Units still affordable for investors seeking yield.",
  },
  {
    city: "Townsville",
    state: "QLD",
    medianHousePrice: 713838,
    annualGrowthPercent: 19.87,
    fiveYearGrowthPercent: 107.77,
    rentalYield: 6.5,
    vacancyRate: 1.2,
    keyIndustries: ["Defence (Lavarack Barracks — 7,500+ military personnel)", "Healthcare", "Mining", "Education (JCU)", "Tourism"],
    infrastructureCatalysts: [
      "Defence expansion — Lavarack Barracks investment",
      "Townsville University Hospital growth",
      "North Queensland Stadium precinct",
      "Sun Metals Zinc Refinery expansion",
      "Port of Townsville channel upgrade",
    ],
    riskLevel: "low",
    investmentCase:
      "Propertyology's pick for best capital growth potential nationally. 107% 5-year growth validates structural demand from defence, healthcare, and mining. Diversified economy with Federal Government defence investment as a 20-year demand anchor. Net migration from capitals growing 857%. Still affordable compared to SEQ.",
  },
  {
    city: "Bundaberg",
    state: "QLD",
    medianHousePrice: 736283,
    annualGrowthPercent: 13.21,
    fiveYearGrowthPercent: 114.63,
    rentalYield: 5.8,
    vacancyRate: 1.4,
    keyIndustries: ["Agriculture", "Healthcare", "Tourism", "Retail"],
    infrastructureCatalysts: [
      "Bundaberg Hospital ($1.2B rebuild)",
      "Port of Bundaberg ($20M upgrade)",
      "Bruce Highway upgrades improving connectivity",
    ],
    riskLevel: "low",
    investmentCase:
      "Best 5-year growth of any large QLD regional at 114.63%. $1.2B hospital investment is a generational employment anchor. Port upgrade signals commercial confidence. Still affordable with strong yield profile and vacancy below 2%.",
  },
  {
    city: "Cairns",
    state: "QLD",
    medianHousePrice: 773598,
    annualGrowthPercent: 10.82,
    fiveYearGrowthPercent: 69.03,
    rentalYield: 6.2,
    vacancyRate: 1.1,
    keyIndustries: ["Tourism", "Healthcare", "Education (JCU)", "Agriculture", "Defence"],
    infrastructureCatalysts: [
      "Cairns Airport expansion ($1.2B masterplan)",
      "Cairns Convention Centre",
      "Northern Australia Infrastructure Facility projects",
      "Reef tourism infrastructure investment",
    ],
    riskLevel: "low",
    investmentCase:
      "Gateway to the Great Barrier Reef and Far North Queensland. Airport expansion will grow tourism significantly. University and healthcare create stable employment base. Units under $400k still available with yields above 7% in some pockets.",
  },
  {
    city: "Mackay",
    state: "QLD",
    medianHousePrice: 550000,
    annualGrowthPercent: 14,
    fiveYearGrowthPercent: 85,
    rentalYield: 7.0,
    vacancyRate: 1.0,
    keyIndustries: ["Mining (Bowen Basin)", "Agriculture (sugar)", "Healthcare", "Port operations"],
    infrastructureCatalysts: [
      "Bowen Basin coal production (long-term — critical minerals transition)",
      "Mackay Base Hospital expansion",
      "Port of Mackay upgrades",
    ],
    riskLevel: "medium",
    investmentCase:
      "Premium QLD regional yield play. Vacancy sub-1% with rents rising sharply. The diversified economy (not pure mining) reduces risk vs. pure Bowen Basin towns. Coastal lifestyle adds owner-occupier demand. Caution: coal price sensitivity adds medium risk.",
  },
];

// ─────────────────────────────────────────────────────────────
// QLD OLYMPICS 2032 INFRASTRUCTURE IMPACT
// ─────────────────────────────────────────────────────────────

export const BRISBANE_2032_OLYMPICS = {
  overview: {
    model: "Regional Games model — spread across Brisbane, Gold Coast, Sunshine Coast (unlike Sydney's concentrated model)",
    venueInvestment: "$7.1 billion committed to Olympic venues",
    transportInvestment: "$12.4+ billion in transport upgrades planned or underway",
    historicalPattern:
      "Data from Sydney (2000), Barcelona (1992), and London (2012) shows consistent pattern: peak capital gains occur 3–5 YEARS BEFORE the Games, not during or after. Brisbane investors who wait until 2031 will have missed the majority of the uplift.",
    peakGainWindow: "2024–2029 (3–5 years pre-Games)",
  },
  keyInfrastructure: [
    {
      project: "Cross River Rail",
      completion: "2029",
      type: "Underground rail tunnel — Brisbane River to CBD",
      benefitedSuburbs: ["Woolloongabba", "South Brisbane", "Fortitude Valley", "Roma Street"],
      priceImpact: "Already pricing in — Woolloongabba house prices up 18% YoY",
    },
    {
      project: "Brisbane Metro",
      completion: "2027",
      type: "High-frequency bus rapid transit",
      benefitedSuburbs: ["Herston", "Royal Brisbane Hospital", "South Bank", "Cultural Centre"],
      priceImpact: "Herston emerging as under-valued with Metro stop",
    },
    {
      project: "Gabba Stadium Redevelopment",
      completion: "2030",
      type: "Main Olympic Stadium — $2.7B redevelopment",
      benefitedSuburbs: ["Woolloongabba", "East Brisbane", "Kangaroo Point", "Stones Corner"],
      priceImpact: "Central to Olympics corridor; sustained demand expected 2024–2032",
    },
    {
      project: "Brisbane Live Entertainment Precinct",
      completion: "TBC — planned for Roma Street",
      type: "Major entertainment venue",
      benefitedSuburbs: ["Petrie Terrace", "Spring Hill", "Paddington"],
      priceImpact: "Precinct activation effect for surrounding residential",
    },
  ],
  olympicsCorridorSuburbs: [
    { suburb: "Woolloongabba", proximity: "Main Stadium", impact: "Primary" },
    { suburb: "Bowen Hills", proximity: "RNA Showgrounds venue", impact: "Primary" },
    { suburb: "Herston", proximity: "Velodrome + Brisbane Metro stop", impact: "Primary" },
    { suburb: "Fortitude Valley", proximity: "Entertainment/media hub + Cross River Rail", impact: "Primary" },
    { suburb: "East Brisbane", proximity: "Adjacent to Gabba", impact: "High" },
    { suburb: "Kangaroo Point", proximity: "River proximity + new bridge", impact: "High" },
    { suburb: "Stones Corner", proximity: "Coorparoo spillover corridor", impact: "High" },
    { suburb: "Dutton Park", proximity: "Boggo Road precinct + PA Hospital", impact: "Medium-High" },
    { suburb: "South Bank", proximity: "Olympic Park precinct + cultural venues", impact: "High" },
    { suburb: "Coorparoo", proximity: "Inner-south lifestyle corridor", impact: "Medium" },
    { suburb: "Newstead", proximity: "Inner-city gentrification + entertainment", impact: "Medium" },
    { suburb: "Spring Hill", proximity: "CBD fringe + entertainment precinct", impact: "Medium" },
    { suburb: "Chandler", proximity: "Aquatic and velodrome venues", impact: "Medium" },
    { suburb: "Carrara (Gold Coast)", proximity: "Gold Coast Stadium venue", impact: "Medium" },
    { suburb: "Broadbeach (Gold Coast)", proximity: "Gold Coast 2032 Athletes Village area", impact: "Medium" },
  ],
  investorWarning:
    "Post-games oversupply has been a risk in every Olympic city. Sydney's Homebush Bay took 10+ years to recover from post-2000 oversupply. Focus on suburbs with STRUCTURAL demand drivers beyond the Olympics (transport, employment, lifestyle) rather than pure Olympics proximity plays.",
};

// ─────────────────────────────────────────────────────────────
// SECTION 3 — OTHER STATE HOTSPOTS 2024–2026
// ─────────────────────────────────────────────────────────────

export const NSW_HOTSPOTS: SuburbProfile[] = [
  // Under $750k
  {
    suburb: "Wagga Wagga",
    state: "NSW",
    medianPrice: 700000,
    medianPriceType: "house",
    annualGrowthPercent: 9,
    grossRentalYield: 4.49,
    budgetTier: "under_500k",
    investmentGoal: ["balanced"],
    keyDrivers: ["Largest inland NSW city", "Charles Sturt University anchor", "RAAF Base Wagga Wagga (defence employment)", "Healthcare hub"],
    notes: "Houses $700k, units $425k. Diversified economy makes it resilient. Gross yield 4.49% houses, 5.64% units.",
  },
  {
    suburb: "San Remo",
    state: "NSW",
    medianPrice: 700000,
    medianPriceType: "house",
    annualGrowthPercent: 10,
    budgetTier: "under_500k",
    investmentGoal: ["growth"],
    keyDrivers: ["Central Coast lakeside lifestyle", "Sydney commuter demand", "5-year average growth 10% pa"],
    notes: "Budgewoi Lake location. Consistent 10% pa growth — underappreciated by Sydney-focused media.",
  },
  {
    suburb: "Mayfield (Newcastle)",
    state: "NSW",
    medianPrice: 920000,
    medianPriceType: "house",
    annualGrowthPercent: 7,
    budgetTier: "500k_750k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Newcastle gentrification wave", "Hunter Street revitalisation", "Light rail connectivity"],
    notes: "Newcastle's northside gentrification corridor. Rents rising 8.1% in 12 months. Newcastle outperforming Sydney on affordability-growth curve.",
  },
  {
    suburb: "South Penrith",
    state: "NSW",
    medianPrice: 986000,
    medianPriceType: "house",
    annualGrowthPercent: 12,
    budgetTier: "750k_1m",
    investmentGoal: ["growth"],
    keyDrivers: ["Western Sydney Airport (Badgerys Creek) — opens 2026", "Aerotropolis employment precinct", "Western Sydney connectivity investment"],
    infrastructureNearby: ["Western Sydney Airport (Badgerys Creek)", "Sydney Metro West extension"],
    notes: "Western Sydney Airport is a once-in-a-generation infrastructure event for the corridor. Land prices in the entire western Sydney arc will be structurally elevated.",
  },
  {
    suburb: "Bonnyrigg",
    state: "NSW",
    medianPrice: 850000,
    medianPriceType: "house",
    annualGrowthPercent: 11,
    budgetTier: "750k_1m",
    investmentGoal: ["growth"],
    keyDrivers: ["South-west Sydney growth corridor", "Fairfield to Liverpool employment belt", "Affordability relative to inner Sydney"],
    notes: "One of NSW's top 12-month performers. South-west Sydney Aerotropolis spillover. Cultural diversity creates strong community retention.",
  },
];

export const VIC_HOTSPOTS: SuburbProfile[] = [
  {
    suburb: "Melton",
    state: "VIC",
    medianPrice: 500000,
    medianPriceType: "house",
    annualGrowthPercent: 8,
    grossRentalYield: 4.5,
    budgetTier: "under_500k",
    investmentGoal: ["balanced"],
    keyDrivers: ["Melbourne's most affordable metro house market", "Population explosion in Melbourne's west", "First-home buyer and investor convergence zone"],
    notes: "35km west of Melbourne CBD. First-home buyer magnet and investor play in the sub-$500k bracket. Infrastructure improving with Melton train line upgrades.",
  },
  {
    suburb: "Cranbourne",
    state: "VIC",
    medianPrice: 651000,
    medianPriceType: "house",
    annualGrowthPercent: 9.6,
    grossRentalYield: 4.4,
    budgetTier: "500k_750k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["South-east Melbourne growth corridor", "Cranbourne East land releases", "Rail connectivity to CBD"],
    infrastructureNearby: ["Cranbourne Train Station", "Casey Hospital"],
    notes: "One of Melbourne's fastest growing corridors. Units at $491k with 9.6% YoY growth. Casey region population set to double.",
  },
  {
    suburb: "Werribee",
    state: "VIC",
    medianPrice: 620000,
    medianPriceType: "house",
    annualGrowthPercent: 8,
    grossRentalYield: 4.2,
    budgetTier: "500k_750k",
    investmentGoal: ["balanced"],
    keyDrivers: ["Werribee Employment and Activity Centre designation", "Western Melbourne affordability corridor", "Rail and freeway connectivity"],
    infrastructureNearby: ["Werribee Train Station", "Williams Landing employment hub"],
    notes: "Melbourne's west is undergoing significant economic development. Werribee Employment Centre adds structural demand.",
  },
  {
    suburb: "Warranwood",
    state: "VIC",
    medianPrice: 950000,
    medianPriceType: "house",
    annualGrowthPercent: 7.3,
    budgetTier: "750k_1m",
    investmentGoal: ["growth"],
    keyDrivers: ["Outer-east Melbourne family market", "Ringwood-Mitcham corridor gentrification", "School catchment premium"],
    notes: "7.3% growth in 2024 while broader Melbourne declined — demonstrates quality school catchment as demand resilience factor.",
  },
  {
    suburb: "Caroline Springs",
    state: "VIC",
    medianPrice: 720000,
    medianPriceType: "house",
    annualGrowthPercent: 8,
    grossRentalYield: 4.3,
    budgetTier: "500k_750k",
    investmentGoal: ["balanced"],
    keyDrivers: ["Western Melbourne community hub", "Sunshine Hospital catchment", "Brimbank corridor affordability"],
    notes: "Planned estate with improving infrastructure. Families and first-home buyers. Sunshine and Airport West employment proximity.",
  },
];

export const WA_HOTSPOTS: SuburbProfile[] = [
  {
    suburb: "Yokine",
    state: "WA",
    medianPrice: 780000,
    medianPriceType: "house",
    annualGrowthPercent: 17,
    fiveYearGrowthPercent: 85,
    grossRentalYield: 4.2,
    budgetTier: "750k_1m",
    investmentGoal: ["growth"],
    keyDrivers: ["Inner-north Perth gentrification", "Proximity to Stirling city centre development", "17% annual growth sustained"],
    notes: "13% average annual growth. Perth's inner-north transformation corridor. Still 20% cheaper than equivalent Brisbane suburbs.",
  },
  {
    suburb: "Nollamara",
    state: "WA",
    medianPrice: 550000,
    medianPriceType: "house",
    annualGrowthPercent: 23,
    budgetTier: "500k_750k",
    investmentGoal: ["growth"],
    keyDrivers: ["North Perth affordability play", "Gentrification wave from Mt Lawley and Yokine pushing north", "Over 23% annual growth in both prices and rents"],
    notes: "One of Perth's top growth performers. Rents and prices both up 23% — a rare simultaneous growth that signals genuine demand not speculation.",
  },
  {
    suburb: "Maylands",
    state: "WA",
    medianPrice: 850000,
    medianPriceType: "house",
    annualGrowthPercent: 18,
    grossRentalYield: 4.0,
    budgetTier: "750k_1m",
    investmentGoal: ["growth"],
    keyDrivers: ["Bayswater-Maylands gentrification strip", "Maylands café and arts precinct", "Swan River lifestyle"],
    notes: "Unit median $435k with 24% growth — accessible entry for yield investors. Gentrification well underway with café strip fully established.",
  },
  {
    suburb: "Yanchep",
    state: "WA",
    medianPrice: 520000,
    medianPriceType: "house",
    annualGrowthPercent: 20,
    budgetTier: "500k_750k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Yanchep Rail Extension (completed 2024)", "North-west coastal lifestyle growth corridor", "New communities and infrastructure"],
    infrastructureNearby: ["Yanchep Train Station (Metronet 2024)", "Yanchep National Park"],
    notes: "Rail extension completed 2024 — a classic infrastructure unlock. Land values still moving post-completion as commuter demand activates.",
  },
  {
    suburb: "Alkimos",
    state: "WA",
    medianPrice: 560000,
    medianPriceType: "house",
    annualGrowthPercent: 18,
    budgetTier: "500k_750k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Government North-West growth corridor plan", "Coastal lifestyle", "New schools and retail opening"],
    notes: "40km north of Perth CBD with beachside lifestyle and strong population growth. Part of the planned Alkimos-Eglinton growth corridor.",
  },
  {
    suburb: "Byford",
    state: "WA",
    medianPrice: 490000,
    medianPriceType: "house",
    annualGrowthPercent: 16,
    budgetTier: "under_500k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Transformation from rural to suburban", "South-east Perth growth corridor", "Byford rail extension planned"],
    notes: "33km south-east of Perth. Rapid transformation with new schools, retail, and planned rail extension. Strong family demographics.",
  },
  {
    suburb: "Piara Waters",
    state: "WA",
    medianPrice: 820000,
    medianPriceType: "house",
    annualGrowthPercent: 23,
    fiveYearGrowthPercent: 70,
    budgetTier: "750k_1m",
    investmentGoal: ["growth"],
    keyDrivers: ["South Perth premium lifestyle", "High owner-occupier ratio", "School premium (Harrisdale Senior High catchment)"],
    notes: "Was $480k 4 years ago, now $820k+ — 70% 5-year growth. Still growing. Premium south Perth suburb with exceptional school catchment.",
  },
];

export const SA_HOTSPOTS: SuburbProfile[] = [
  {
    suburb: "Salisbury",
    state: "SA",
    medianPrice: 560000,
    medianPriceType: "house",
    annualGrowthPercent: 20.74,
    budgetTier: "500k_750k",
    investmentGoal: ["growth"],
    keyDrivers: ["Northern Adelaide defence industry employment (BAE Systems, Raytheon)", "Affordability relative to inner suburbs", "Infrastructure investment in northern corridor"],
    notes: "BAE Systems and defence sector making Salisbury a high-employment node. 20.74% house growth and 10.16% unit growth in 12 months.",
  },
  {
    suburb: "Paralowie",
    state: "SA",
    medianPrice: 490000,
    medianPriceType: "house",
    annualGrowthPercent: 22,
    budgetTier: "under_500k",
    investmentGoal: ["growth"],
    keyDrivers: ["Northern Adelaide affordability corridor", "Defence employment proximity (Salisbury)", "Strong capital growth momentum"],
    notes: "22%+ annual growth. Entry-level northern Adelaide suburb riding the defence employment and affordability tailwinds.",
  },
  {
    suburb: "Elizabeth North",
    state: "SA",
    medianPrice: 490200,
    medianPriceType: "house",
    annualGrowthPercent: 22,
    budgetTier: "under_500k",
    investmentGoal: ["growth"],
    keyDrivers: ["Cheapest significant growth suburb in Adelaide", "Northern Adelaide renewal investment", "Value investor accumulation"],
    notes: "22% growth from low base. Urban renewal investment is changing perception of northern Adelaide suburbs.",
  },
  {
    suburb: "Christies Beach",
    state: "SA",
    medianPrice: 700000,
    medianPriceType: "house",
    annualGrowthPercent: 18.4,
    budgetTier: "500k_750k",
    investmentGoal: ["growth", "balanced"],
    keyDrivers: ["Southern Adelaide coastal lifestyle", "Affordable beachside entry", "Long-term capital growth track record"],
    notes: "Coastal southern Adelaide. Up 18.4% — coastal SA has been a standout performer as lifestyle migration continues.",
  },
  {
    suburb: "Marden",
    state: "SA",
    medianPrice: 750000,
    medianPriceType: "house",
    annualGrowthPercent: 14,
    budgetTier: "500k_750k",
    investmentGoal: ["growth"],
    keyDrivers: ["Inner-east Adelaide gentrification", "Norwood proximity", "85% of Adelaide suburbs recording 5%+ rental growth"],
    notes: "Finder's Property Investment Index scores Marden 92.9/100 for growth potential. Inner-east Adelaide transformation in progress.",
  },
];

export const INTERSTATE_MIGRATION_DATA = {
  summary2024_2025: {
    qldNetMigration: 29910,
    nswNetLoss: "Projected -115,300 over 3 years to 2028-29",
    vicNetPosition: "Broadly neutral — Melbourne receiving from NSW but losing to QLD",
    waNetGain: "Positive — mining employment and affordability relative to east coast",
    topOriginForQLD: ["Sydney", "Melbourne", "ACT"],
    topDestinationsFromSydney: ["Brisbane", "Gold Coast", "Perth", "Regional NSW"],
    townsvlleMigrationSurge: "857% increase in net migration from capital cities — extraordinary",
  },
  propertyImpact:
    "Interstate migration flows lead property price movements by 6–18 months. Track ABS internal migration data quarterly. Where the people go, the money follows — landlords, developers, and employers all chase the population.",
  keyInsight:
    "Cost-of-living pressure is the #1 driver of interstate mobility in 2024–2026. NSW and VIC residents are selling $1.5M+ homes in Sydney/Melbourne and buying in QLD, SA, and WA for $500k–$800k — creating a capital injection effect that accelerates price growth in destination markets.",
};

// ─────────────────────────────────────────────────────────────
// SECTION 4 — RED FLAGS AND RISK INDICATORS
// ─────────────────────────────────────────────────────────────

export const RED_FLAGS: RiskFlag[] = [
  {
    category: "Social Housing Concentration",
    indicator: "Proportion of social/public housing in the suburb",
    threshold: "> 20% of dwellings being public housing is a significant risk; > 30% is a red line for most professional investors",
    impact:
      "High social housing concentration suppresses owner-occupier demand, creates perception issues, makes resale difficult, and reduces the pool of comparable sales that can support valuations. Capital growth is structurally impaired.",
    mitigationStrategy:
      "Check ABS Census data for tenure type. Australian suburbs with declining social housing ratios (gentrification) can be excellent investment targets — it is the static or growing concentration that is the risk.",
  },
  {
    category: "Flood Zone Risk",
    indicator: "Properties in flood-prone zones as defined by council overlay maps",
    threshold:
      "Any property in a High Flood Risk zone (1-in-20 year or 1-in-100 year ARI) carries material risk. Since 2000, flood-prone homes have underperformed comparable non-flood properties by 22 percentage points (~$75,500 for a median 3-bedroom).",
    impact:
      "Flood insurance may be unaffordable or unavailable (especially post-2022 Northern Rivers and SEQ floods). Banks may restrict LVR or refuse lending. Capital growth impaired. Climate Council estimates Australia's flood-exposed property stock will lose $170B in relative value by 2050.",
    mitigationStrategy:
      "Check council flood overlay maps (free), Climate Valuation report (climatevaluation.com.au), and verify insurance availability and cost BEFORE making an offer. Always obtain a building and pest inspection noting flood history. Request vendor disclosure on flood events.",
  },
  {
    category: "Oversupply",
    indicator: "Building approvals outpacing population growth in a suburb or postcode",
    threshold:
      "When building approvals exceed dwelling demand growth by 1.5x or more over 24 months. Vacancy rates rising above 4%. More than 15% of new apartment stock showing distress (price reductions, re-listings).",
    impact:
      "Capital growth stalls or reverses. Rental yield compresses. Valuation gap between new and established stock widens as new stock floods the market.",
    mitigationStrategy:
      "Avoid: off-the-plan apartments in high-approval postcodes (inner Brisbane CBD, Melbourne Docklands, Sydney CBD). Check ABS Building Approvals by postcode. Use SQM Research to track listing volumes — a rising stock/listing count is an early oversupply signal.",
  },
  {
    category: "Economic Concentration / Single Industry Risk",
    indicator: "Suburb or town where >60% of employment is in one industry or with one employer",
    threshold:
      "Mining towns where a single company or commodity drives >50% of local employment. Coal mining towns where global coal price sensitivity directly affects local property demand.",
    impact:
      "Property values can decline 50–70% when the dominant industry contracts. Moranbah, Port Hedland, and Roxby Downs all experienced catastrophic corrections. Banks restrict LVR to 60–70% or decline lending entirely in recognised mining towns.",
    mitigationStrategy:
      "Check employment diversity index from ABS Economic Activity. Require minimum 3 major industries, each <40% of total local employment. If mining is present, look for towns like Townsville or Mackay where mining coexists with healthcare, defence, and agriculture.",
  },
  {
    category: "Infrastructure That Signals Decline",
    indicator: "Negative infrastructure signals",
    threshold: "Any of the following within 3km of a target property",
    impact: "Permanent amenity reduction, stigma effect, reduced buyer pool, potential insurance and lending complications",
    mitigationStrategy:
      "Research council DA applications and state government planning portals for approved or proposed facilities. Check if the suburb is in an industrial zoning transition area. Never rely solely on a listing agent's representation of the surroundings.",
  },
  {
    category: "Negative Infrastructure Proximity",
    indicator: "Prison/correctional facility, waste treatment plant, freight rail line, sewage treatment facility",
    threshold: "Within 3km boundary — verify via council zoning maps",
    impact: "Measurable negative price effect of -5% to -15% for prison proximity. Odour complaints from waste facilities can render properties un-tenantable.",
    mitigationStrategy: "Drive the suburb at multiple times of day. Check council's approved uses maps. Review historical listings for any mention of odour or noise.",
  },
  {
    category: "Days on Market (Rising)",
    indicator: "DOM increasing faster than comparable suburbs over 3+ consecutive months",
    threshold: "DOM > 60 days and rising while comparable suburbs are below 40 days",
    impact: "Signals weakening demand or vendor mispricing. Properties sitting often result in further discounting to achieve sale.",
    mitigationStrategy: "Track on a monthly basis. If DOM rising AND new listing volumes rising simultaneously = double oversupply signal. Exit or avoid.",
  },
  {
    category: "Excessive Investor Concentration",
    indicator: "Owner-occupier ratio below 50% (renters > 50% of residents)",
    threshold: "< 50% owner-occupiers is a concern; < 35% is a serious red flag for long-term capital growth",
    impact:
      "Investment-heavy suburbs are sentiment-driven. When investor selling begins (triggered by rate rises, tax changes, or cash flow stress), coordinated selling can crash prices rapidly. Owner-occupiers provide price floor stability that investor-heavy markets lack.",
    mitigationStrategy:
      "Check ABS Census dwelling tenure data. Target suburbs where owner-occupiers are in clear majority and the ratio is improving (not declining).",
  },
  {
    category: "Uninsurable Properties",
    indicator: "Properties where standard building and landlord insurance is unavailable or cost-prohibitive",
    threshold: "Annual insurance cost > 2% of property value is a red flag (normal is 0.3–0.6%)",
    impact:
      "Uninsured or under-insured investment properties represent an existential financial risk. Post 2022 floods, several Northern NSW and SEQ postcodes have seen insurance withdrawn by all major insurers.",
    mitigationStrategy:
      "Obtain insurance quotes BEFORE purchasing — not after. Budget $1,000–$2,500 annually for standard landlord insurance. If quotes exceed $5,000–$10,000 or are unavailable, the property presents unacceptable risk.",
  },
];

// ─────────────────────────────────────────────────────────────
// SECTION 5 — INVESTMENT FRAMEWORKS
// ─────────────────────────────────────────────────────────────

export const INVESTMENT_FRAMEWORKS: InvestmentFramework[] = [
  {
    name: "True Net Yield Calculation",
    description:
      "The only yield calculation that matters for investment decisions. Gross yield is for marketing material. Net yield is the truth.",
    formula: "Net Yield (%) = [(Annual Rent - Annual Expenses) ÷ Property Value] × 100",
    benchmarks: {
      "< 3%": "Yield is weak — requires strong capital growth conviction to justify",
      "3% – 4%": "Below average — acceptable only in premium growth locations",
      "4% – 5%": "Healthy — the standard for quality metro investment property",
      "5% – 6%": "Strong — approaching cash-flow neutral at standard LVR and rates",
      "> 6%": "Exceptional — but investigate why. Usually regional or high-risk locations",
      "> 8%": "Extreme — almost always involves significant risk (mining, small town, high vacancy potential)",
    },
    steps: [
      "Step 1 — Calculate Annual Gross Rent: Weekly rent × 52 weeks",
      "Step 2 — Deduct Property Management Fees: 7–10% of gross rent (Brisbane avg 8%)",
      "Step 3 — Deduct Council Rates: $1,200–$3,500 per year (vary by council)",
      "Step 4 — Deduct Water Rates: $600–$1,200 per year",
      "Step 5 — Deduct Landlord Insurance: $1,000–$2,500 per year (always include)",
      "Step 6 — Deduct Strata Fees (units only): $2,000–$8,000 per year depending on building",
      "Step 7 — Deduct Maintenance and Repairs: Budget 1–2% of property value annually (older properties: 2–3%)",
      "Step 8 — Deduct Vacancy Allowance: 2–4 weeks of rent per year (use 2 weeks for tight markets, 4 for softer)",
      "Step 9 — Deduct Accounting, Depreciation Schedules: $500–$1,500 per year",
      "Step 10 — Divide net income by property value × 100 = Net Yield %",
    ],
    warnings: [
      "Gross yield figures quoted by selling agents are marketing tools. Always convert to net yield.",
      "Strata levies for older buildings can increase dramatically with special levies for major repairs — always request 3 years of Body Corporate financials.",
      "Maintenance costs for properties built before 1990 should be budgeted at 2–3% of value annually, not 1%.",
    ],
  },
  {
    name: "Cash Flow Modelling Framework",
    description:
      "Model cash flow at multiple LVR and interest rate scenarios to understand the true cost of holding an asset across different market conditions.",
    formula: "Annual Cash Flow = Net Rental Income - (Loan Repayments + Holding Costs)",
    benchmarks: {
      "80% LVR at 6.5% rate": "Standard investor scenario — model this as your base case",
      "80% LVR at 7.5% rate": "Stress test — what if rates rise 100bps from your purchase rate?",
      "90% LVR at 6.5% rate": "High-LVR investor scenario — cash flow will typically be deeply negative",
      "60% LVR at 6.5% rate": "Conservative scenario for cash-flow conscious investors",
      "Cash purchase": "Yield is your total return metric — compare against other asset classes",
    },
    steps: [
      "Model with 80% LVR as base case, 90% as stress, 70% as conservative",
      "Use P&I repayments (principal + interest) for long-term modelling — IO periods end",
      "Model interest rate at current rate PLUS 150bps — this is the prudent stress test",
      "Include all outgoings: insurance, rates, management, maintenance, vacancy, strata",
      "Include depreciation benefit from tax depreciation schedule (new builds: $5,000–$15,000 annually)",
      "Calculate after-tax cash flow using your marginal tax rate (negative gearing benefit)",
      "Calculate break-even point: the capital growth rate required to generate positive total return after cash outflow",
      "Model at 5-year and 10-year horizons — time changes everything",
    ],
    warnings: [
      "IO loans expire — always model P&I to avoid 'cliff' surprises when IO period ends and repayments increase 20–30%",
      "Rental income growth of 3–5% annually is a reasonable base assumption — not flat",
      "A positively geared property is not necessarily a better investment than a negatively geared one — depends on total return",
    ],
  },
  {
    name: "Capital Growth vs. Yield Trade-Off Matrix",
    description:
      "Framework for making the explicit decision between prioritising yield vs. capital growth based on personal financial position.",
    benchmarks: {
      "High income + low debt": "Favour capital growth. Negative gearing tax benefit maximised. 10-year horizon.",
      "Low-mid income + existing mortgage": "Favour balanced approach. Neutral or mildly negative cash flow sustainable.",
      "SMSF investor": "Favour yield. SMSF cannot sustain significant negative cash flow. Target net yield > 5%.",
      "Portfolio builder (2nd-5th property)": "Balance is key. Each new property must not overextend serviceability.",
      "Near retirement": "Favour yield. Capital preservation and income generation over growth.",
    },
    steps: [
      "Identify your marginal tax rate — defines the value of negative gearing benefit",
      "Identify your current debt serviceability headroom — defines how much negative cash flow you can sustain",
      "Identify your investment horizon — growth plays require 7+ years to deliver",
      "Calculate total return (yield + growth) not just yield or growth in isolation",
      "Model the opportunity cost: what would the same equity earn in a high-yield share portfolio (ASX200 averaging 9% pa total return)?",
    ],
  },
  {
    name: "Owner-Occupier Appeal Assessment",
    description:
      "Assess how desirable a property is to owner-occupiers, not just investors. This is the single most underutilised metric in Australian property investment.",
    benchmarks: {
      "> 70% owner-occupiers": "Ideal. Strong price floor, motivated buyers on exit, value maintenance.",
      "60%–70% owner-occupiers": "Good. Healthy mix with genuine owner-occupier demand.",
      "50%–60% owner-occupiers": "Acceptable. Watch for trend direction — improving or declining?",
      "< 50% owner-occupiers": "Concern. Sentiment-driven market, vulnerable to coordinated investor selling.",
      "< 35% owner-occupiers": "Red flag. Avoid unless exceptional yield with clear catalyst.",
    },
    steps: [
      "Check ABS Census suburb profile for tenure type (% owned outright, % with mortgage, % renting)",
      "Assess property features that appeal to owner-occupiers: street appeal, natural light, storage, parking, outdoor space",
      "Identify if the suburb trend is toward more or fewer owner-occupiers (gentrification vs. decline)",
      "Assess school catchment quality — the strongest owner-occupier signal in Australian property",
      "Evaluate walk score and lifestyle amenities — owner-occupiers weight these heavily",
    ],
    warnings: [
      "A suburb designed only for investors (high-rise apartments with no parking, tiny rooms, hotel-style layouts) has no owner-occupier floor and is extremely vulnerable in a downturn.",
      "Owner-occupier desirability is often more correlated with long-term capital growth than yield.",
    ],
  },
  {
    name: "Land Content Analysis",
    description:
      "Understanding the proportion of a property's value represented by land vs. improvements (buildings). Land appreciates; buildings depreciate.",
    formula: "Land Content % = (Land Value ÷ Total Property Value) × 100",
    benchmarks: {
      "> 60% land content": "Ideal for long-term capital growth. Land is the appreciating asset.",
      "50%–60% land content": "Good. Solid long-term growth potential.",
      "40%–50% land content": "Moderate. Townhouses and newer houses typically fall here.",
      "< 30% land content": "Caution. High-rise apartments have minimal land content — growth driven by demand not scarcity.",
      "< 15% land content": "Avoid for pure growth strategy. High-density apartments in oversupplied markets.",
    },
    steps: [
      "Obtain unimproved land value from state valuer-general (public record in QLD, NSW, VIC, WA, SA)",
      "Compare land value to total purchase price — the difference is the building value",
      "Higher land content + corner block + sub-divisible block = compound growth potential",
      "In areas where land is scarce (inner suburbs, coastal, heritage-constrained), land content drives value even for units",
    ],
    warnings: [
      "High land content doesn't automatically mean growth — you still need demand, population growth, and amenity improvement",
      "Strata units have low land content as a structural feature — their growth depends entirely on suburb-level demand",
      "Always check if the block has subdivision potential (further value upside) using council zoning maps",
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// SECTION 6 — MARKET TIMING INDICATORS
// ─────────────────────────────────────────────────────────────

export const MARKET_TIMING_INDICATORS: MarketIndicator[] = [
  {
    name: "Days on Market (DOM) Trend",
    threshold: "DOM falling > 20% from 12-month average AND below 30 days",
    interpretation:
      "The single best free leading indicator available. When DOM falls, buyers are making faster decisions — this reflects urgency and competition. DOM changes before prices do because it captures buyer psychology in real time. A suburb with falling DOM predicts price growth 3–6 months ahead.",
    actionSignal: "BUY SIGNAL: DOM falling + vacancy falling simultaneously = strongest early-entry signal available.",
  },
  {
    name: "Auction Clearance Rate",
    threshold:
      "Above 70% = seller's market in Sydney and Melbourne. Above 65% = strong in Brisbane (smaller auction market). Below 55% = buyer's market.",
    interpretation:
      "Clearance rates measure the percentage of auctioned properties that successfully sell at auction. They reflect current buyer sentiment and competition. However: clearance rates are primarily relevant in Sydney and Melbourne where auction is the dominant sale method. Brisbane, Perth, and Adelaide have smaller auction markets — price negotiation data is more relevant.",
    actionSignal:
      "DIRECTIONAL SIGNAL: Rising clearance rate trend (3+ consecutive weeks) signals increasing buyer confidence. CAUTION: Only meaningful when auction volumes are adequate (50+ auctions per week in the market measured).",
  },
  {
    name: "Building Approval Data",
    threshold: "Building approvals rising faster than population growth in a suburb = future supply risk",
    interpretation:
      "Building approvals are a leading indicator of housing supply hitting the market 12–24 months in the future. A suburb with high current approval volume may face rental and price pressure when that supply is delivered. Conversely, suburbs with very low approval rates (heritage-constrained, fully built-out) have structural supply scarcity.",
    actionSignal:
      "GREEN LIGHT: Low building approvals + falling vacancy + rising population = supply-demand squeeze → buy. RED FLAG: Building approvals > 1.5x population-implied demand = future oversupply → investigate before buying.",
  },
  {
    name: "Rental Listing Volume (SQM Research)",
    threshold: "Rising rental listings = weakening demand or increasing supply. Falling rental listings = tightening market.",
    interpretation:
      "SQM Research publishes monthly rental listing volumes by suburb. This is a leading indicator for vacancy rate direction. When rental listing counts fall, it means tenants are snapping up properties faster — rental vacancy is tightening, rent growth follows.",
    actionSignal: "BUY SIGNAL: Rental listings falling for 3+ consecutive months in a suburb with vacancy below 2%. Rental growth forecast of 5%+ will follow.",
  },
  {
    name: "Vendor Discount Rate",
    threshold: "Vendor discount < 2% = sellers holding firm = strong market. Vendor discount > 4% = sellers capitulating = buyer's market.",
    interpretation:
      "The average percentage difference between a property's initial listing price and its ultimate sale price. Low discounting signals vendor confidence, multiple-offer conditions, and strong buyer demand. High discounting signals overpricing relative to demand, softening conditions, or motivated vendors.",
    actionSignal:
      "ENTRY TIMING TOOL: In a rising market, vendor discounting narrows toward zero. Buy when discounting is still moderate (2–3%) before it compresses further. Don't buy when discounting is RISING — it means conditions are turning.",
  },
  {
    name: "Population Movement Data",
    threshold: "Net population growth > 1.5% annually in a suburb = strong demand signal",
    interpretation:
      "The ultimate leading indicator. People must live somewhere — population growth creates housing demand with a lag of 6–18 months before it appears in vacancy and then price data. Track ABS Regional Population Statistics (annual, released June) and estimate intercensal growth using building completion + net migration data from state planning departments.",
    actionSignal:
      "LONG SIGNAL: Suburb with accelerating population growth, limited new dwelling approvals, and vacancy rate below 2% = multi-year price growth ahead.",
  },
  {
    name: "Search Volume Trends",
    threshold: "REA/Domain suburb search volumes rising faster than comparable suburbs",
    interpretation:
      "Both realestate.com.au and Domain publish 'demand' or 'search' metrics by suburb. When a suburb's search volume rises sharply while prices are still modest, it signals early buyer and investor interest — a leading indicator that predicts increased competition and price growth.",
    actionSignal:
      "EARLY ENTRY SIGNAL: Combine rising search volumes with falling DOM and you have a high-conviction early-entry indicator before prices move significantly.",
  },
  {
    name: "Investor Loan Approval Volumes",
    threshold: "ABS Housing Finance data showing investor borrowing rising YoY signals incoming demand",
    interpretation:
      "The ABS publishes monthly housing finance commitment data split by owner-occupier and investor. When investor loan approvals rise significantly, experienced property investors are actively acquiring — they typically lead cycles. RBA data on credit growth by property type provides a similar signal.",
    actionSignal:
      "CYCLE SIGNAL: Investor loan approvals rising + owner-occupier approvals rising together = broad market entry. Investor approvals rising + OO flat = speculative cycle — caution needed.",
  },
];

// ─────────────────────────────────────────────────────────────
// QLD INFRASTRUCTURE PIPELINE
// ─────────────────────────────────────────────────────────────

export const QLD_INFRASTRUCTURE_PIPELINE: InfrastructureProject[] = [
  {
    name: "Cross River Rail",
    state: "QLD",
    type: "Underground rail — 10.2km tunnel under Brisbane River with new CBD stations",
    estimatedCompletion: "2029",
    investmentValue: "$7.1B (Olympics-linked budget)",
    affectedCorridors: ["Woolloongabba", "South Brisbane", "Fortitude Valley", "Roma Street", "Bowen Hills"],
    expectedPriceImpact: "5–15% uplift within 800m of new stations. Already pricing in for Woolloongabba.",
    leadTime: "Prices moving now (2024–2026). Completion uplift is incremental, not a step change.",
  },
  {
    name: "Brisbane Metro",
    state: "QLD",
    type: "High-frequency bus rapid transit through CBD tunnel",
    estimatedCompletion: "2027",
    investmentValue: "$944M",
    affectedCorridors: ["Herston (Royal Brisbane Hospital)", "Cultural Centre", "South Bank", "QUT Gardens Point"],
    expectedPriceImpact: "3–8% uplift for Herston (currently undervalued relative to Olympics footprint).",
    leadTime: "Herston is the under-valued station in this corridor — buy before 2026 announcement pricing.",
  },
  {
    name: "Inland Rail Link (Toowoomba Node)",
    state: "QLD",
    type: "National freight rail network — Toowoomba as key logistics hub",
    estimatedCompletion: "2027–2030",
    investmentValue: "$10B+ national project",
    affectedCorridors: ["Toowoomba", "Wellcamp", "Gatton", "Rosewood"],
    expectedPriceImpact: "Transformative for Toowoomba industrial and residential demand. Industrial land already re-pricing.",
    leadTime: "Already underway — Toowoomba residential prices reflecting logistics employment premium.",
  },
  {
    name: "Bruce Highway Upgrade Program",
    state: "QLD",
    type: "Major arterial highway upgrades (1,700km Brisbane to Cairns)",
    estimatedCompletion: "Rolling 2024–2032",
    investmentValue: "$9B",
    affectedCorridors: ["Sunshine Coast", "Gympie", "Maryborough", "Bundaberg", "Rockhampton", "Mackay", "Townsville", "Cairns"],
    expectedPriceImpact: "Reduces isolation premium on regional QLD towns. Improved commute viability between regional centres.",
    leadTime: "Section-specific — completed sections already showing local price response.",
  },
  {
    name: "Toowoomba Second Range Crossing",
    state: "QLD",
    type: "41km bypass relieving CBD of heavy freight",
    estimatedCompletion: "Completed 2019 — ongoing value crystallisation",
    investmentValue: "$1.6B",
    affectedCorridors: ["Toowoomba CBD", "Wellcamp Airport precinct", "Gatton", "Laidley"],
    expectedPriceImpact: "Completed — now driving commercial and industrial investment that flows through to residential demand.",
    leadTime: "Infrastructure benefit now mature — Toowoomba is pricing in the full network effect.",
  },
  {
    name: "Bundaberg Hospital Redevelopment",
    state: "QLD",
    type: "New tertiary hospital — Bundaberg region",
    estimatedCompletion: "2027",
    investmentValue: "$1.2B",
    affectedCorridors: ["Bundaberg", "Bargara", "Burnett Heads"],
    expectedPriceImpact: "Healthcare employment multiplier — estimated 2,000+ direct jobs, 5,000+ total economic impact. Residential demand rising.",
    leadTime: "Construction commenced — residential prices already responding to employment announcement.",
  },
  {
    name: "Port of Townsville Channel Upgrade",
    state: "QLD",
    type: "Major port channel deepening — allows larger vessels",
    estimatedCompletion: "2025",
    investmentValue: "$193M",
    affectedCorridors: ["Townsville CBD", "Mundingburra", "North Ward", "Stuart", "Bohle"],
    expectedPriceImpact: "Enhances Townsville's position as North Queensland's commercial hub. Supports industrial and trade employment.",
    leadTime: "Near completion — residential demand already running ahead of supply.",
  },
];

// ─────────────────────────────────────────────────────────────
// QUERY INTERFACE FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Query suburbs by state, budget tier, and investment goal.
 * Returns matching suburb profiles with optional type filter.
 */
export function querySuburbs(params: {
  state?: State;
  budgetTier?: BudgetTier;
  investmentGoal?: InvestmentGoal;
  propertyType?: PropertyType;
  minYield?: number;
  minGrowth?: number;
}): SuburbProfile[] {
  const allSuburbs: SuburbProfile[] = [
    ...QLD_HOTSPOTS,
    ...NSW_HOTSPOTS,
    ...VIC_HOTSPOTS,
    ...WA_HOTSPOTS,
    ...SA_HOTSPOTS,
  ];

  return allSuburbs.filter((suburb) => {
    if (params.state && suburb.state !== params.state) return false;
    if (params.budgetTier && suburb.budgetTier !== params.budgetTier) return false;
    if (params.investmentGoal && !suburb.investmentGoal.includes(params.investmentGoal)) return false;
    if (params.propertyType && suburb.medianPriceType !== params.propertyType) return false;
    if (params.minYield && (suburb.grossRentalYield ?? 0) < params.minYield) return false;
    if (params.minGrowth && suburb.annualGrowthPercent < params.minGrowth) return false;
    return true;
  });
}

/**
 * Get suburbs sorted by a specific metric.
 */
export function getTopSuburbsByMetric(
  metric: "growth" | "yield" | "combined",
  state?: State,
  budgetTier?: BudgetTier,
  limit: number = 10
): SuburbProfile[] {
  let suburbs = querySuburbs({ state, budgetTier });

  suburbs = suburbs.sort((a, b) => {
    if (metric === "growth") return b.annualGrowthPercent - a.annualGrowthPercent;
    if (metric === "yield") return (b.grossRentalYield ?? 0) - (a.grossRentalYield ?? 0);
    if (metric === "combined") {
      const aScore = a.annualGrowthPercent + (a.grossRentalYield ?? 0);
      const bScore = b.annualGrowthPercent + (b.grossRentalYield ?? 0);
      return bScore - aScore;
    }
    return 0;
  });

  return suburbs.slice(0, limit);
}

/**
 * Get all red flags for a given risk category.
 */
export function getRedFlagsByCategory(category: string): RiskFlag[] {
  return RED_FLAGS.filter((flag) =>
    flag.category.toLowerCase().includes(category.toLowerCase())
  );
}

/**
 * Get infrastructure projects by state and completion window.
 */
export function getInfrastructureByState(
  state: State,
  beforeYear?: number
): InfrastructureProject[] {
  return QLD_INFRASTRUCTURE_PIPELINE.filter((project) => {
    if (project.state !== state) return false;
    if (beforeYear) {
      const completionYear = parseInt(project.estimatedCompletion.split("–")[0]);
      if (completionYear > beforeYear) return false;
    }
    return true;
  });
}

/**
 * Get a market timing assessment for a given suburb based on
 * available indicators. Returns structured assessment with
 * signals and recommended action.
 */
export function assessMarketTiming(params: {
  daysOnMarket: number;
  daysOnMarketTrend: "rising" | "falling" | "stable";
  vacancyRate: number;
  vacancyTrend: "rising" | "falling" | "stable";
  auctionClearanceRate?: number;
  vendorDiscountRate?: number;
}): {
  overallSignal: "strong_buy" | "buy" | "hold" | "caution" | "avoid";
  signals: string[];
  confidence: "high" | "medium" | "low";
} {
  const signals: string[] = [];
  let buyPoints = 0;
  let cautionPoints = 0;

  // DOM assessment
  if (params.daysOnMarket < 25 && params.daysOnMarketTrend === "falling") {
    signals.push("✅ DOM below 25 days and falling — strong buyer competition ahead of price movement");
    buyPoints += 2;
  } else if (params.daysOnMarket < 35 && params.daysOnMarketTrend === "falling") {
    signals.push("✅ DOM trending down — market gaining momentum");
    buyPoints += 1;
  } else if (params.daysOnMarket > 60 && params.daysOnMarketTrend === "rising") {
    signals.push("⚠️ DOM high and rising — softening demand");
    cautionPoints += 2;
  }

  // Vacancy assessment
  if (params.vacancyRate < 2 && params.vacancyTrend === "falling") {
    signals.push("✅ Vacancy below 2% and tightening — rent growth imminent, strong investor demand");
    buyPoints += 2;
  } else if (params.vacancyRate < 3 && params.vacancyTrend === "falling") {
    signals.push("✅ Vacancy tightening toward landlord market");
    buyPoints += 1;
  } else if (params.vacancyRate > 4) {
    signals.push("⚠️ Vacancy above 4% — oversupply risk");
    cautionPoints += 2;
  }

  // Auction clearance
  if (params.auctionClearanceRate !== undefined) {
    if (params.auctionClearanceRate > 70) {
      signals.push("✅ Clearance rate above 70% — strong seller's market conditions");
      buyPoints += 1;
    } else if (params.auctionClearanceRate < 55) {
      signals.push("⚠️ Clearance rate below 55% — buyers have leverage");
      cautionPoints += 1;
    }
  }

  // Vendor discount
  if (params.vendorDiscountRate !== undefined) {
    if (params.vendorDiscountRate < 1.5) {
      signals.push("✅ Vendor discount minimal — sellers holding firm, market is competitive");
      buyPoints += 1;
    } else if (params.vendorDiscountRate > 4) {
      signals.push("⚠️ Vendor discount elevated — market softening or overpriced listings");
      cautionPoints += 1;
    }
  }

  const netScore = buyPoints - cautionPoints;
  let overallSignal: "strong_buy" | "buy" | "hold" | "caution" | "avoid";
  if (netScore >= 4) overallSignal = "strong_buy";
  else if (netScore >= 2) overallSignal = "buy";
  else if (netScore >= 0) overallSignal = "hold";
  else if (netScore >= -2) overallSignal = "caution";
  else overallSignal = "avoid";

  const totalIndicators = (params.auctionClearanceRate !== undefined ? 1 : 0) + (params.vendorDiscountRate !== undefined ? 1 : 0) + 2;
  const confidence = totalIndicators >= 4 ? "high" : totalIndicators >= 2 ? "medium" : "low";

  return { overallSignal, signals, confidence };
}

/**
 * Calculate gross and net rental yield.
 */
export function calculateYield(params: {
  propertyValue: number;
  weeklyRent: number;
  managementFeePercent?: number;
  councilRates?: number;
  waterRates?: number;
  insurance?: number;
  strataFees?: number;
  maintenancePercent?: number;
  vacancyWeeks?: number;
  otherExpenses?: number;
}): {
  grossYield: number;
  netYield: number;
  annualGrossIncome: number;
  annualNetIncome: number;
  annualExpenses: number;
  expenseBreakdown: Record<string, number>;
} {
  const annualGrossIncome = params.weeklyRent * 52;
  const managementFee = annualGrossIncome * ((params.managementFeePercent ?? 8) / 100);
  const councilRates = params.councilRates ?? 2000;
  const waterRates = params.waterRates ?? 900;
  const insurance = params.insurance ?? 1500;
  const strataFees = params.strataFees ?? 0;
  const maintenance = params.propertyValue * ((params.maintenancePercent ?? 1) / 100);
  const vacancyLoss = params.weeklyRent * (params.vacancyWeeks ?? 2);
  const otherExpenses = params.otherExpenses ?? 700;

  const expenseBreakdown: Record<string, number> = {
    managementFee: Math.round(managementFee),
    councilRates,
    waterRates,
    insurance,
    strataFees,
    maintenance: Math.round(maintenance),
    vacancyLoss,
    otherExpenses,
  };

  const annualExpenses = Object.values(expenseBreakdown).reduce((a, b) => a + b, 0);
  const annualNetIncome = annualGrossIncome - annualExpenses;

  return {
    grossYield: Math.round((annualGrossIncome / params.propertyValue) * 10000) / 100,
    netYield: Math.round((annualNetIncome / params.propertyValue) * 10000) / 100,
    annualGrossIncome,
    annualNetIncome,
    annualExpenses,
    expenseBreakdown,
  };
}

/**
 * Get the complete handbook as a structured reference object.
 * Useful for AI agents that need full context injection.
 */
export const YARDSCORE_HANDBOOK = {
  version: "2.0",
  lastUpdated: "2026-04",
  dataQuality: "Research-based from publicly available reports. Verify current prices before transacting.",
  sections: {
    fundamentals: MARKET_FUNDAMENTALS,
    qldHotspots: QLD_HOTSPOTS,
    qldRegional: QLD_REGIONAL_MARKETS,
    qldOlympics: BRISBANE_2032_OLYMPICS,
    qldInfrastructure: QLD_INFRASTRUCTURE_PIPELINE,
    nswHotspots: NSW_HOTSPOTS,
    vicHotspots: VIC_HOTSPOTS,
    waHotspots: WA_HOTSPOTS,
    saHotspots: SA_HOTSPOTS,
    migrationData: INTERSTATE_MIGRATION_DATA,
    redFlags: RED_FLAGS,
    frameworks: INVESTMENT_FRAMEWORKS,
    marketTiming: MARKET_TIMING_INDICATORS,
  },
  queryFunctions: {
    querySuburbs,
    getTopSuburbsByMetric,
    getRedFlagsByCategory,
    getInfrastructureByState,
    assessMarketTiming,
    calculateYield,
  },
} as const;

export default YARDSCORE_HANDBOOK;

// ─────────────────────────────────────────────────────────────
// SECTION 7 — 2032 OLYMPICS EXTENDED RESEARCH
// ─────────────────────────────────────────────────────────────

export const OLYMPICS_2032_EXTENDED = {

  historicalOlympicsPropertyImpact: {
    sydney2000: {
      hostCity: "Sydney",
      preGamesGrowth: "Dwelling values rose ~20% between 1998 and 2000 during buildup",
      postGamesGrowth: "Median house prices grew 38.5% in the 2 years post-Games, 66.4% in 3 years",
      keyLesson: "Sydney was a mid-tier city with large upside potential — similar to Brisbane's position pre-2032. Inner-west and Homebush Bay suburbs led gains. Post-Games oversupply at Homebush took 10+ years to resolve.",
      peakReturnWindow: "1997–2000 (3 years pre-Games) delivered the strongest investor returns",
      cautionNote: "Homebush Bay high-density apartments experienced significant oversupply post-2000 — a cautionary tale for investors buying Olympic Village-adjacent units",
    },
    london2012: {
      hostCity: "London",
      preGamesGrowth: "5–10% uplift in Olympic boroughs in 5 years pre-Games",
      postGamesGrowth: "Olympic boroughs and postal districts led London-wide house price growth in the decade after 2012. Properties within 3-mile radius of main stadium had sustained 5% premium",
      priceEffect: "2.1% price rise on announcement alone. Stratford and surrounding East London transformed permanently",
      keyLesson: "London's East End underwent a structural transformation — not just an Olympic bounce. Infrastructure investment (Crossrail, DLR extensions) created permanent connectivity gains that sustained growth long after the Games",
      peakReturnWindow: "2008–2012 pre-Games period delivered strongest returns. Post-2012 Stratford continues outperforming London average",
    },
    tokyo2020: {
      hostCity: "Tokyo",
      note: "COVID disruption makes Tokyo 2020/2021 a flawed data point. Games held without spectators.",
      limitedDataConclusion: "Transport investment (new Shinkansen lines, station upgrades) still created localised property premiums in connected suburbs",
      keyLesson: "Even without a normal Games, infrastructure investment delivered residential price uplift in transit-connected areas",
    },
    barcelonaPattern: {
      hostCity: "Barcelona 1992",
      keyLesson: "Barcelona's Games were transformative — waterfront regeneration permanently upgraded the city's global standing. Barceloneta and Poblenou saw 200%+ growth over the following decade. The lesson: Games that regenerate neglected precincts create the most durable value.",
      brisbanrelevance: "Brisbane's Woolloongabba and Bowen Hills regeneration mirror Barcelona's Poblenou transformation",
    },
    keyUniversalPattern: "Across all Olympic host cities, the consensus finding from academic research: peak capital gains accrue to investors who buy 3–5 years BEFORE the Games. Post-Games prices either plateau (if oversupply emerges) or continue rising modestly (if structural improvements are genuine). The announcement effect is real — prices respond immediately to IOC selection.",
  },

  confirmedVenues2032: [
    {
      venueName: "Victoria Park Stadium (New Main Stadium)",
      sport: "Opening/Closing Ceremony, Athletics",
      location: "Victoria Park, Spring Hill / Bowen Hills border",
      status: "New build — replaces Gabba as main stadium",
      suburbsWithin2km: ["Spring Hill", "Bowen Hills", "Herston", "Fortitude Valley", "Kelvin Grove", "Red Hill"],
      suburbsWithin5km: ["New Farm", "Newstead", "Teneriffe", "Windsor", "Paddington", "Milton"],
      investmentNote: "Victoria Park is the epicentre of the 2032 Games. The new world-class stadium in the heart of Brisbane creates a permanent legacy precinct. Spring Hill and Bowen Hills are the primary beneficiary suburbs — both still accessible under $1M for quality properties.",
      infrastructureLinked: ["Brisbane Metro (Herston stop)", "Inner City Bypass", "Kelvin Grove Urban Village"],
    },
    {
      venueName: "Woolloongabba / Brisbane Arena (GoPrint Site)",
      sport: "Entertainment, concerts, indoor events — post-Games legacy",
      location: "GoPrint site, Woolloongabba — adjacent to Cross River Rail station",
      status: "New development — privately developed entertainment precinct",
      suburbsWithin2km: ["Woolloongabba", "East Brisbane", "South Brisbane", "Kangaroo Point", "Dutton Park"],
      suburbsWithin5km: ["Coorparoo", "Stones Corner", "Norman Park", "Greenslopes", "Annerley"],
      investmentNote: "Cross River Rail station + Brisbane Arena = permanent entertainment destination. The GoPrint site transformation mirrors what happened to Sydney's Darling Harbour precinct. This is a 20-year capital growth play, not just an Olympics trade.",
      priceGrowthObserved2024: "Woolloongabba house prices up ~18% YoY as of 2025",
    },
    {
      venueName: "Brisbane Showgrounds — Athletes Village",
      sport: "Athlete accommodation — 15,000 athletes during Games",
      location: "RNA Showgrounds, Bowen Hills",
      status: "Existing showgrounds — Athletes Village development",
      suburbsWithin2km: ["Bowen Hills", "Fortitude Valley", "Newstead", "Herston", "Windsor"],
      suburbsWithin5km: ["New Farm", "Teneriffe", "Albion", "Lutwyche", "Wilston"],
      investmentNote: "Post-Games the Athletes Village converts to approximately 3,500 residential dwellings — a massive new housing precinct injected into Brisbane's inner north. This follows the London 2012 Stratford model where the Athletes Village became the East Village — now one of London's most sought-after inner-city residential precincts.",
      postGamesConversion: "3,500+ residential dwellings — conversion to permanent inner-city community",
    },
    {
      venueName: "Chandler Sports Precinct — Sleeman Centre",
      sport: "Aquatics (Brisbane Aquatic Centre), BMX, Cycling",
      location: "Chandler, 12km east of Brisbane CBD",
      status: "Upgraded — National Aquatic Centre proposed adjacent",
      suburbsWithin2km: ["Chandler", "Carindale", "Belmont", "Wakerley", "Gumdale"],
      suburbsWithin5km: ["Tingalpa", "Carina Heights", "Camp Hill", "Mansfield", "Mackenzie"],
      investmentNote: "Chandler is the 'sleeper' suburb in the Olympics play. Infrastructure investment into the sports precinct, combined with the suburb's existing family-market demographics and relative affordability vs inner Brisbane, creates a longer-dated but real value proposition.",
    },
    {
      venueName: "Brisbane Entertainment Centre",
      sport: "Basketball, Boxing (existing venue)",
      location: "Boondall, northern Brisbane",
      status: "Existing — upgrades underway",
      suburbsWithin2km: ["Boondall", "Taigum", "Zillmere", "Wavell Heights", "Nudgee"],
      suburbsWithin5km: ["Northgate", "Virginia", "Geebung", "Chermside", "Aspley"],
      investmentNote: "Lower-profile venue but northern corridor suburbs benefit from profile uplift and improved transport links planned for Games period. Zillmere and Boondall remain under $600k — affordability buffer exists.",
    },
    {
      venueName: "Moreton Bay Venues — QSAC",
      sport: "Football (Soccer)",
      location: "Nathan (Griffith University campus)",
      status: "Existing stadium — upgrades",
      suburbsWithin2km: ["Nathan", "Salisbury", "Moorooka", "Rocklea", "Runcorn"],
      suburbsWithin5km: ["Sunnybank", "Coopers Plains", "Acacia Ridge", "Macgregor", "Robertson"],
      investmentNote: "Southern Brisbane corridor. Nathan and surrounding suburbs benefit from Griffith University employment and stadium profile. Still significantly undervalued vs inner south.",
    },
    {
      venueName: "Gold Coast Sports Venues",
      sport: "Rugby Sevens, Beach Volleyball, Modern Pentathlon",
      location: "Carrara Stadium, Broadbeach",
      status: "Existing — upgrades",
      suburbsWithin2km: ["Carrara", "Broadbeach Waters", "Bundall", "Robina"],
      suburbsWithin5km: ["Surfers Paradise", "Miami", "Mermaid Waters", "Southport"],
      investmentNote: "Gold Coast venues add to existing tourism infrastructure rather than creating new precincts. Benefit is incremental — lifestyle and profile rather than structural transformation.",
    },
    {
      venueName: "Sunshine Coast Sports Complex",
      sport: "Triathlon, Road Cycling",
      location: "Kawana Waters area",
      status: "Existing/upgraded venues",
      suburbsWithin2km: ["Bokarina", "Birtinya", "Buddina", "Warana"],
      suburbsWithin5km: ["Kawana Waters", "Minyama", "Parrearra", "Mountain Creek"],
      investmentNote: "Sunshine Coast venues are catalysts for the new rail line approval (The Wave). The combined Olympics + rail effect is the real story for Sunshine Coast property — Birtinya and Bokarina are ground zero.",
    },
  ],

  undervaluedOlympicsSuburbs2024: [
    {
      suburb: "Herston",
      rationale: "Has both Brisbane Metro stop AND Olympics Velodrome. Royal Brisbane Hospital employment anchor. Inner-Brisbane suburb still under $1M for quality houses. The most underpriced Olympics suburb relative to infrastructure investment.",
      currentMedianHouse: 850000,
      targetPricePost2029: "1.2M–1.5M (conservative estimate)",
      keyRisk: "Hospital precinct = some noise/traffic",
    },
    {
      suburb: "Bowen Hills",
      rationale: "Athletes Village conversion will inject 3,500 dwellings but also create a permanent inner-city precinct with retail, parks, and connectivity. The permanent legacy is more valuable than the temporary Games accommodation.",
      currentMedianHouse: 700000,
      targetPricePost2029: "1.0M–1.2M",
      keyRisk: "Short-term construction disruption 2026–2031",
    },
    {
      suburb: "Kelvin Grove",
      rationale: "Adjacent to Victoria Park main stadium. QUT campus + stadium precinct = dual demand driver. Currently underpriced relative to Paddington and Red Hill.",
      currentMedianHouse: 780000,
      targetPricePost2029: "1.1M–1.3M",
      keyRisk: "Event-night noise/traffic if not managed",
    },
    {
      suburb: "Nathan",
      rationale: "Griffith University + QSAC football venue. South Brisbane corridor. Significantly cheaper than comparable northern suburbs. University employment is structurally stable.",
      currentMedianHouse: 780000,
      targetPricePost2029: "950k–1.1M",
      keyRisk: "Acacia Ridge industrial proximity (southern boundary)",
    },
    {
      suburb: "Zillmere",
      rationale: "Brisbane Entertainment Centre precinct suburb. Still under $600k. Best risk-adjusted Olympics-adjacent play in north Brisbane.",
      currentMedianUnit: 420000,
      currentMedianHouse: 590000,
      targetPricePost2029: "750k–850k",
      keyRisk: "Longer distance from CBD limits owner-occupier premium",
    },
  ],

  investorWarnings: [
    "The Athletes Village at Bowen Hills will convert to 3,500 residential dwellings — a significant supply injection into the inner-north. Buy houses and townhouses in surrounding streets rather than units within the village itself to avoid this post-Games supply hit.",
    "Gold Coast venue suburbs offer incremental benefit only — they already price in lifestyle premium. Do not overpay for 'Olympics exposure' in Surfers Paradise or Broadbeach.",
    "The 2024 venue master plan revision (Victoria Park replacing Gabba as main stadium) significantly changed the investment map. Properties marketed as 'Games-adjacent' based on the original Gabba plan are now less relevant.",
    "Olympic-linked infrastructure (Cross River Rail, Brisbane Metro) creates PERMANENT value. Olympic venue proximity is temporary. Prioritise infrastructure adjacency over venue adjacency.",
  ],
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 8 — QLD INFRASTRUCTURE PIPELINE (EXTENDED)
// ─────────────────────────────────────────────────────────────

export const QLD_INFRASTRUCTURE_EXTENDED = {

  crossRiverRail: {
    projectValue: "$7.848 billion",
    completionDate: "2026 (delayed from original 2025)",
    description: "10.2km twin rail tunnels under Brisbane River, 4 new underground stations + Exhibition upgrade",
    stations: [
      {
        station: "Albert Street",
        suburb: "Brisbane CBD",
        precinct: "New CBD station — no existing CBD underground rail",
        benefitedSuburbs: ["Brisbane CBD", "Spring Hill", "South Brisbane"],
        propertyImpact: "Office and mixed-use precinct activation. Residential benefit flows to Spring Hill (walkable) and South Brisbane (ferry/walkable)",
        priceImpactEstimate: "3–7% premium within 500m",
      },
      {
        station: "Woolloongabba",
        suburb: "Woolloongabba",
        precinct: "Gabba precinct — Olympics + entertainment",
        benefitedSuburbs: ["Woolloongabba", "East Brisbane", "Kangaroo Point", "Dutton Park"],
        propertyImpact: "Most impactful station. Already 10–15% price premium observed within 800m. Olympic venue adjacency adds second demand layer.",
        priceImpactEstimate: "10–15% within 800m — partially priced in, further upside to 2032",
      },
      {
        station: "Boggo Road",
        suburb: "Dutton Park",
        precinct: "Health and Knowledge Precinct (PA Hospital, UQ, Mater)",
        benefitedSuburbs: ["Dutton Park", "Annerley", "Woolloongabba south", "Greenslopes"],
        propertyImpact: "Healthcare and university employment hub gains direct CBD rail access. Dutton Park still undervalued relative to its post-CRR connectivity.",
        priceImpactEstimate: "8–12% over 3 years post opening",
      },
      {
        station: "Roma Street",
        suburb: "Petrie Terrace / Spring Hill",
        precinct: "Existing Roma Street — upgraded and expanded",
        benefitedSuburbs: ["Petrie Terrace", "Red Hill", "Paddington", "Auchenflower"],
        propertyImpact: "Existing high-performing suburbs get enhanced connectivity. Marginal additional uplift as already premium priced.",
        priceImpactEstimate: "3–6% incremental on already strong market",
      },
      {
        station: "Exhibition",
        suburb: "Bowen Hills",
        precinct: "RNA Showgrounds — Athletes Village site",
        benefitedSuburbs: ["Bowen Hills", "Fortitude Valley", "Newstead", "Herston"],
        propertyImpact: "Station serves Athletes Village precinct. Post-Games residential conversion will be highly connected. Bowen Hills is a long-term 10-year play.",
        priceImpactEstimate: "8–15% over the decade to 2035",
      },
    ],
  },

  brisbaneMetro: {
    projectValue: "$944 million",
    completionDate: "2027",
    description: "High-frequency underground bus rapid transit through CBD tunnel — South East Busway to RBWH",
    keyStops: ["Cultural Centre", "South Bank", "QUT Gardens Point", "CBD", "Roma Street", "Spring Hill", "RBWH Herston"],
    hertstonOpportunity: "Herston is the Metro's northern terminus and most underpriced stop. Royal Brisbane Women's Hospital (largest QLD hospital by bed count) + Herston Velodrome (Olympics) + Metro access. Currently trading at $850k median — significant upside.",
    propertyImpactSummary: "Metro reduces effective commute time from Herston to CBD to under 10 minutes. This will re-rate Herston from 'hospital suburb' to 'connected inner city'.",
  },

  sunshineCoastRail: {
    projectName: "The Wave — Direct Sunshine Coast Rail Line",
    projectValue: "$5.5 billion (estimated)",
    stages: {
      stage1: {
        route: "Beerwah to Birtinya (new stations: Bells Creek/Aura, Caloundra, Aroona, Birtinya)",
        constructionStart: "Major works 2026–2027",
        completion: "2031 (estimated)",
        benefitedSuburbs: ["Aura / Bells Creek", "Caloundra", "Aroona", "Birtinya", "Kawana Waters"],
        propertyImpact: "Aura (Australia's largest master-planned community — 20,000 homes at completion) gains rail access for first time. Caloundra prices expected to lift 10–15% on announcement effect.",
      },
      stage2: {
        route: "Birtinya to Maroochydore CBD via Airport",
        note: "Metro-style service — elevated/at-grade through Sunshine Coast CBD",
        completion: "2033–2035 (estimated)",
        benefitedSuburbs: ["Maroochydore", "Alexandra Headland", "Mooloolaba", "Kawana"],
        propertyImpact: "Maroochydore CBD development + rail = Queensland's 'second capital city' narrative. Already pricing this in but upside remains substantial.",
      },
    },
    investorOpportunity: "The Wave is the most significant Sunshine Coast infrastructure announcement in a generation. Aura (Bells Creek) is the standout — massive master-planned community with imminent rail access. Entry prices $550k–$700k for new houses.",
  },

  goldCoastLightRail: {
    stage3: {
      route: "Broadbeach South to Burleigh Heads (6.7km extension)",
      projectValue: "$1.2 billion",
      completion: "Mid-2026 (passenger service)",
      benefitedSuburbs: ["Mermaid Beach", "Miami", "Burleigh Heads", "Burleigh Waters"],
      propertyImpact: "Burleigh Heads has been pricing in this rail connection for years. Miami and Mermaid Beach are the suburbs with remaining upside — both within 800m of new stops.",
      priceImpactEstimate: "5–10% for Burleigh adjacent stops. Partially priced in.",
    },
    stage4: {
      status: "CANCELLED — September 2025 (Crisafulli Government)",
      originalRoute: "Burleigh Heads to Coolangatta/Gold Coast Airport (13km)",
      originalCost: "Estimated $5.7B–$9.8B (cost blowout from $3.1B estimate)",
      investorImplication: "Palm Beach, Tugun, Coolangatta, and Bilinga do NOT get light rail. A rapid bus service is the alternative. The cancellation removes a significant infrastructure catalyst from Gold Coast's southern suburbs. Investors who purchased in these areas anticipating Stage 4 face a re-rating downward.",
      alternativeTransport: "Multi-modal transport study underway for Gold Coast Airport corridor",
    },
  },

  springfieldRipleyRail: {
    projectName: "Ipswich-to-Springfield Public Transport Corridor (I2S)",
    route: "25km corridor — Ipswich Central to Springfield Central (9 new stations)",
    plannedStations: ["Redbank Plains", "Swanbank", "Ripley Valley Town Centre", "Ripley North", "Deebing South", "Yamanto", "Berry Street", "One Mile", "UQ Ipswich Campus", "Sadliers Crossing"],
    status: "Planning/corridor study — not yet funded for construction",
    populationContext: "Ipswich is Queensland's fastest growing city — 270,624 residents as of January 2026, adding 10,000 in one year. Ripley Valley alone will house 133,800 new residents by 2036.",
    propertyImpact: {
      ripley: "Ripley is already growing rapidly without rail. Rail announcement will be a significant price catalyst — estimated 15–25% uplift in adjacent suburbs within 12 months of funding confirmation.",
      springfieldLakes: "Already a premium estate market. Rail extension extends the catchment of Springfield's employment corridor.",
      currentOpportunity: "Buy Ripley and South Ripley NOW before rail announcement. Entry $550k–$700k for houses with 800sqm+ blocks. High land content + incoming rail = compound value upside.",
    },
  },

  rockhamptonRingRoad: {
    projectValue: "$1.73 billion",
    route: "17.4km bypass of Rockhampton CBD — removes heavy freight from city streets",
    completionEstimate: "2026–2027",
    status: "Construction commenced November 2023. Roundabout at Rockhampton-Ridgelands Rd operational April 2025.",
    propertyImpact: "Reduces CBD congestion permanently. Opens western industrial and residential growth corridors. Rockhampton median house price ~$450k — strong yield (6%+) with improving amenity. Ring road signals long-term commercial confidence in the region.",
    nearbySuburbs: ["Rockhampton City", "Gracemere", "Parkhurst", "Norman Gardens", "Berserker"],
  },

  townsvilleWaterfrontStadium: {
    queenslandCountryBankStadium: {
      type: "25,000-seat multi-purpose stadium",
      location: "Townsville CBD waterfront",
      opened: "February 2020",
      propertyImpact: "Stadium already delivered. CBD activation effect ongoing — waterfront dining, entertainment precinct developing around venue. North Ward and Belgian Gardens (waterfront suburbs) have been beneficiaries.",
    },
    townsvilleCityWaterfrontPDA: {
      type: "Priority Development Area — mixed-use CBD waterfront regeneration",
      scope: "Commercial, retail, hospitality, residential development along Ross Creek",
      propertyImpact: "Ongoing CBD gentrification creating new residential precinct in the heart of Townsville. City deal investment driving long-term transformation.",
      benefitedSuburbs: ["Townsville City", "North Ward", "South Townsville", "Pimlico"],
    },
  },

  cairnsHospitalExpansion: {
    projectValue: "$250 million",
    completion: "2026–2027",
    scope: "96 additional beds, 64 new overnight beds, 1,220+ jobs created",
    propertyImpact: "Healthcare workers, specialists, and support staff create stable year-round rental demand. Cairns vacancy rate at 0.7% — one of the tightest in Australia. Hospital expansion extends this structural tightness.",
    bestInvestmentSuburbs: ["Manunda (near hospital, median $400k, yields 5%+)", "Westcourt", "Bungalow", "Edge Hill"],
    unitYieldOpportunity: "Cairns unit yields averaging 7.8% in 2025 — highest of any major regional QLD city. $250–$350k unit entry point delivers exceptional cash-on-cash returns.",
  },
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 9 — RENTAL YIELD HOTSPOTS BY STATE
// ─────────────────────────────────────────────────────────────

export const RENTAL_YIELD_HOTSPOTS = {

  nationalContext2025: {
    nationalVacancyRate: "1.1% (multi-year low as of early 2026)",
    nationalAvgHouseYield: "3.8% gross (capitals), 4.5% (regional)",
    nationalAvgUnitYield: "4.6% gross (capitals), 5.8% (regional)",
    keyTheme: "Regional and resource-backed towns outperform capital cities for cash flow. Capital cities offer lower yields but stronger long-term growth.",
    buildingApprovalsGap: "195,523 homes approved in 2025 vs 240,000 target — 44,477 shortfall. Structural undersupply sustaining rental market tightness.",
  },

  queensland: {
    topHouseYields: [
      { suburb: "Pioneer (Mount Isa)", yield: 12.0, medianPrice: 200000, vacancyRate: 2.5, riskLevel: "very_high", note: "Mining-dependent. Extreme yield, extreme risk." },
      { suburb: "Collinsville", yield: 11.2, medianPrice: 205000, vacancyRate: 2.0, riskLevel: "high", note: "Bowen Basin coal. High yield, commodity cycle risk." },
      { suburb: "Middlemount", yield: 11.0, medianPrice: 225000, vacancyRate: 2.2, riskLevel: "high", note: "Bowen Basin — mines expanding. Higher confidence than Collinsville." },
      { suburb: "Moranbah", yield: 10.5, medianPrice: 280000, vacancyRate: 1.8, riskLevel: "high", note: "Largest Bowen Basin town. More diversified than pure mining camps." },
      { suburb: "Dysart", yield: 10.5, medianPrice: 250000, vacancyRate: 2.0, riskLevel: "high", note: "Coal mining. Banks restrict lending — require 30–40% deposit." },
      { suburb: "Emerald", yield: 8.2, medianPrice: 320000, vacancyRate: 1.5, riskLevel: "medium", note: "Central QLD agricultural + mining hub. More diversified economy." },
      { suburb: "Blackwater", yield: 8.0, medianPrice: 260000, vacancyRate: 1.9, riskLevel: "high", note: "Coal rail corridor. Higher supply risk if miners reduce FIFO." },
      { suburb: "Rockhampton", yield: 6.8, medianPrice: 450000, vacancyRate: 1.2, riskLevel: "low", note: "Regional capital. Diversified economy. Ring Road uplift incoming." },
      { suburb: "Townsville", yield: 6.5, medianPrice: 714000, vacancyRate: 1.2, riskLevel: "low", note: "Best risk-adjusted yield in QLD. Defence + healthcare anchor." },
      { suburb: "Mackay", yield: 6.4, medianPrice: 550000, vacancyRate: 1.0, riskLevel: "medium", note: "Bowen Basin mining proximity + coastal lifestyle. Vacancy sub-1%." },
      { suburb: "Blacks Beach (Mackay)", yield: 6.4, medianPrice: 480000, vacancyRate: 0.9, riskLevel: "medium", note: "Coastal Mackay suburb. Rents up 14% in 2024." },
      { suburb: "Bundaberg", yield: 5.8, medianPrice: 560000, vacancyRate: 1.4, riskLevel: "low", note: "Agricultural + hospital rebuild. Best diversified regional yield." },
      { suburb: "Cairns", yield: 4.9, medianPrice: 774000, vacancyRate: 0.7, riskLevel: "low", note: "Houses. Units yield 7.8% — superior entry point." },
      { suburb: "Eagleby (Brisbane metro)", yield: 5.8, medianPrice: 480000, vacancyRate: 1.2, riskLevel: "low", note: "Metro Brisbane. Best metro yield sub-$500k." },
      { suburb: "Spring Hill (Brisbane)", yield: 7.2, medianPrice: 800000, vacancyRate: 1.0, riskLevel: "low", note: "Inner Brisbane units. Heritage supply constraint = permanent moat." },
      { suburb: "Zillmere (Brisbane)", yield: 5.4, medianPrice: 490000, vacancyRate: 1.1, riskLevel: "low", note: "North Brisbane. Olympics corridor adjacency + strong yield." },
      { suburb: "Toowoomba", yield: 4.8, medianPrice: 934000, vacancyRate: 0.9, riskLevel: "low", note: "Inland logistics hub. Vacancy sub-1%." },
      { suburb: "Goondiwindi", yield: 6.8, medianPrice: 350000, vacancyRate: 1.1, riskLevel: "low", note: "Agricultural border town. Strong and stable." },
      { suburb: "Warwick", yield: 6.5, medianPrice: 390000, vacancyRate: 1.3, riskLevel: "low", note: "Southern QLD regional. Agricultural base." },
      { suburb: "Ipswich (inner)", yield: 5.2, medianPrice: 520000, vacancyRate: 1.5, riskLevel: "low", note: "Western Brisbane corridor. Population boom driving demand." },
    ],
    topUnitYields: [
      { suburb: "Cairns City", yield: 7.8, medianPrice: 320000, note: "Best capital/regional unit yield in QLD. Tourism + healthcare tenants." },
      { suburb: "Spring Hill", yield: 7.2, medianPrice: 600000, note: "Inner Brisbane. Heritage supply constraint." },
      { suburb: "South Brisbane", yield: 5.9, medianPrice: 580000, note: "Cultural precinct, South Bank proximity." },
      { suburb: "Southport (Gold Coast)", yield: 4.8, medianPrice: 710000, note: "Gold Coast CBD. GCUH employment anchor." },
      { suburb: "Ashmore (Gold Coast)", yield: 5.3, medianPrice: 745000, note: "GC hinterland. GCUH + Griffith employment." },
    ],
  },

  newSouthWales: {
    topHouseYields: [
      { suburb: "Broken Hill", yield: 8.9, medianPrice: 190000, riskLevel: "medium", note: "Far West NSW. Mining/tourism. Very low entry price." },
      { suburb: "Warren", yield: 8.5, medianPrice: 180000, riskLevel: "medium", note: "Central-west agricultural town. Extremely affordable." },
      { suburb: "Coonamble", yield: 8.5, medianPrice: 200000, riskLevel: "medium", note: "Inland agricultural. Low liquidity on exit." },
      { suburb: "Koonawarra (Wollongong)", yield: 5.1, medianPrice: 680000, riskLevel: "low", note: "Wollongong southern suburbs. Strong commuter demand." },
      { suburb: "Berkeley (Wollongong)", yield: 5.0, medianPrice: 650000, riskLevel: "low", note: "Wollongong corridor. Steel City employment diversifying." },
      { suburb: "Wagga Wagga", yield: 5.6, medianPrice: 425000, riskLevel: "low", note: "Units. RAAF base + CSU + regional hospital. Diversified economy." },
      { suburb: "Dubbo", yield: 5.0, medianPrice: 520000, riskLevel: "low", note: "Central-west hub. Growing healthcare and education sector." },
      { suburb: "Tamworth", yield: 4.9, medianPrice: 490000, riskLevel: "low", note: "Northern NSW regional capital. Country music tourism + agriculture." },
      { suburb: "San Remo (Central Coast)", yield: 4.5, medianPrice: 700000, riskLevel: "low", note: "Lifestyle lakeside. 10% pa growth over 5 years." },
      { suburb: "Mayfield (Newcastle)", yield: 4.3, medianPrice: 920000, riskLevel: "low", note: "Newcastle gentrification. Rents rising 8.1% YoY." },
    ],
    stateContext: "NSW's best yields are in regional centres with diversified economies (Wagga, Dubbo, Tamworth) or outer metro areas (Wollongong corridor). Inner Sydney yields below 3% make it a growth-only play.",
  },

  victoria: {
    topHouseYields: [
      { suburb: "Echuca", yield: 10.6, medianPrice: 450000, riskLevel: "low", note: "Murray River regional hub. Tourism + agriculture. Victoria's top house yield." },
      { suburb: "St Arnaud", yield: 7.4, medianPrice: 240000, riskLevel: "medium", note: "Wimmera region. Very affordable. Limited liquidity." },
      { suburb: "Warracknabeal", yield: 7.4, medianPrice: 275000, riskLevel: "medium", note: "Wimmera agricultural. Grain belt economy." },
      { suburb: "Mildura", yield: 6.2, medianPrice: 380000, riskLevel: "low", note: "Murray regional city. Agriculture + tourism + healthcare. Best VIC regional play." },
      { suburb: "Shepparton", yield: 5.8, medianPrice: 400000, riskLevel: "low", note: "Northern Victoria agricultural hub. GV Health hospital employment." },
      { suburb: "Ballarat", yield: 4.8, medianPrice: 490000, riskLevel: "low", note: "Large regional city. University + healthcare. Commuter demand from Melbourne." },
      { suburb: "Bendigo", yield: 4.6, medianPrice: 510000, riskLevel: "low", note: "Regional city. La Trobe University + Bendigo Health. Strong owner-occupier market." },
      { suburb: "Melton", yield: 4.5, medianPrice: 500000, riskLevel: "low", note: "Melbourne metro. Fastest growing Melbourne corridor." },
      { suburb: "Werribee", yield: 4.2, medianPrice: 620000, riskLevel: "low", note: "Western Melbourne growth corridor." },
      { suburb: "Cranbourne", yield: 4.4, medianPrice: 651000, riskLevel: "low", note: "South-east Melbourne growth. 9.6% YoY growth." },
    ],
    stateContext: "Victoria's yield plays are in regional Victoria (Echuca, Mildura, Shepparton) where prices are low and demand stable. Melbourne metro yields compressed below 4% across most areas. Melbourne expected to grow 6.6% in 2026 per KPMG — growth over yield is the Melbourne thesis.",
  },

  westernAustralia: {
    topHouseYields: [
      { suburb: "Pegs Creek (Karratha)", yield: 12.5, medianPrice: 380000, riskLevel: "high", note: "Pilbara mining. Extreme yield but commodity dependent." },
      { suburb: "Baynton (Karratha)", yield: 12.0, medianPrice: 420000, riskLevel: "high", note: "Karratha LNG precinct. More infrastructure than typical mining town." },
      { suburb: "Newman", yield: 11.0, medianPrice: 280000, riskLevel: "very_high", note: "BHP iron ore town. Extreme cycle risk." },
      { suburb: "Kalgoorlie", yield: 7.2, medianPrice: 350000, riskLevel: "medium", note: "Gold mining. More diversified than most WA mining towns. Gold price resilience." },
      { suburb: "Geraldton", yield: 6.8, medianPrice: 380000, riskLevel: "low", note: "Mid-West WA regional hub. Agricultural + fishing + mining. Diversified." },
      { suburb: "Bunbury", yield: 6.0, medianPrice: 440000, riskLevel: "low", note: "South-west WA regional city. Timber + alumina + port employment." },
      { suburb: "Nollamara (Perth)", yield: 4.5, medianPrice: 550000, riskLevel: "low", note: "Inner-north Perth. 23% annual growth. Yield + growth combination." },
      { suburb: "Byford (Perth)", yield: 4.8, medianPrice: 490000, riskLevel: "low", note: "South-east Perth corridor. New schools + planned rail." },
      { suburb: "Yanchep (Perth)", yield: 4.6, medianPrice: 520000, riskLevel: "low", note: "North coastal Perth. Rail unlocked 2024." },
      { suburb: "Alkimos (Perth)", yield: 4.4, medianPrice: 560000, riskLevel: "low", note: "Coastal growth corridor. New community infrastructure opening." },
    ],
    stateContext: "WA leads Australia for yield in resource towns — but Pilbara and Goldfields carry significant commodity-cycle risk. Perth metro's 17.6% growth in 2024 has compressed yields. Regional diversified WA (Geraldton, Bunbury, Kalgoorlie) offers the best risk-adjusted yield in the state.",
  },

  southAustralia: {
    topHouseYields: [
      { suburb: "Port Augusta", yield: 7.0, medianPrice: 280000, riskLevel: "medium", note: "SA renewable energy investment. Green hydrogen hub incoming." },
      { suburb: "Whyalla", yield: 6.8, medianPrice: 250000, riskLevel: "medium", note: "Green steel transformation (GFG Alliance) — medium risk but genuine catalyst." },
      { suburb: "Salisbury (Adelaide)", yield: 5.2, medianPrice: 560000, riskLevel: "low", note: "Northern Adelaide defence hub. 20.74% annual growth AND strong yield." },
      { suburb: "Elizabeth North", yield: 5.5, medianPrice: 490000, riskLevel: "low", note: "Northern Adelaide. Affordable with improving infrastructure." },
      { suburb: "Paralowie", yield: 5.4, medianPrice: 490000, riskLevel: "low", note: "Northern Adelaide corridor. 22% annual growth." },
      { suburb: "Christies Beach", yield: 4.8, medianPrice: 700000, riskLevel: "low", note: "Coastal southern Adelaide. 18.4% growth in 12 months." },
      { suburb: "Glenelg", yield: 4.6, medianPrice: 850000, riskLevel: "low", note: "Premium beachside Adelaide. Strong owner-occupier appeal." },
      { suburb: "Marden", yield: 4.3, medianPrice: 750000, riskLevel: "low", note: "Inner-east Adelaide gentrification. 92.9/100 growth score." },
    ],
    stateContext: "Adelaide's market is on a tear — 14.9% growth in the past year. 85% of suburbs recording 5%+ rental growth. SA offers the best risk-adjusted combination of yield AND growth of any Australian capital. Northern Adelaide (Salisbury corridor) is the sweet spot — affordable, high-growth, defence-anchored.",
  },
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 10 — POPULATION & MIGRATION DATA
// ─────────────────────────────────────────────────────────────

export const POPULATION_MIGRATION_DATA = {

  nationalOverview2024: {
    totalPopulation: "27.19 million (June 2024)",
    annualGrowth: "541,600 people — second largest absolute growth in Australian history",
    netOverseasMigration: "Approximately 80% of total growth",
    populationGrowthRate: "2.0% nationally",
    housingAccordTarget: "1.2 million new homes by 2029 (240,000/year)",
    currentApprovalRate: "196,000 dwellings approved in 2025 — 44,000 below target",
    structuralImplication: "Population growing 2x faster than homes being built. This is the most reliable long-term driver of Australian property values.",
  },

  fastestGrowingCapitals: [
    { city: "Greater Perth", growthRate: 3.15, absoluteGrowth: 72700, note: "Highest growth rate among capitals. Mining employment + affordability migration." },
    { city: "Greater Brisbane", growthRate: 2.74, absoluteGrowth: 95000, note: "Interstate migration + overseas arrivals. Olympics narrative accelerating trend." },
    { city: "Greater Melbourne", growthRate: 2.74, absoluteGrowth: 142600, note: "Largest absolute growth. International student and skilled migration primary driver." },
    { city: "Greater Adelaide", growthRate: 1.8, absoluteGrowth: 30000, note: "Accelerating — defence industry + affordability driving interstate arrivals." },
    { city: "Greater Sydney", growthRate: 1.6, absoluteGrowth: 100000, note: "Net interstate loss offset by overseas arrivals. High cost suppressing domestic migration." },
  ],

  fastestGrowingRegionals: [
    { lga: "Ipswich (QLD)", growthRate: 4.1, population2026: 270624, note: "Queensland's fastest growing city. Adding 10,000+ residents per year. 133,800 expected in Ripley Valley alone by 2036." },
    { lga: "Moreton Bay (QLD)", growthRate: 3.2, population2026: 530000, note: "Northern Brisbane corridor. One of Australia's most populous LGAs and fastest growing." },
    { lga: "Gold Coast (QLD)", growthRate: 2.8, population2026: 720000, note: "Sustained interstate migration from southern states. Lifestyle and affordability." },
    { lga: "Sunshine Coast (QLD)", growthRate: 2.9, population2026: 390000, note: "Remote work migration + lifestyle. 'Second capital of QLD' narrative gaining traction." },
    { lga: "Wyndham (VIC)", growthRate: 4.5, population2026: 330000, note: "Melbourne's fastest growing LGA (Werribee corridor). Greenfield land releases." },
    { lga: "Casey (VIC)", growthRate: 3.1, population2026: 420000, note: "South-east Melbourne. Cranbourne and Berwick are key population centres." },
    { lga: "Swan (WA)", growthRate: 3.5, population2026: 195000, note: "Perth northern corridor. Ellenbrook, Ballajura, Midland growth centres." },
    { lga: "Armadale (WA)", growthRate: 3.2, population2026: 110000, note: "Perth south-east corridor. Byford and Harrisdale leading growth." },
    { lga: "Playford (SA)", growthRate: 2.8, population2026: 100000, note: "Northern Adelaide. Elizabeth North, Davoren Park, Andrews Farm." },
    { lga: "Townsville (QLD)", growthRate: 2.1, population2026: 240000, note: "North QLD — strongest major regional city growth nationally." },
  ],

  interstateFlows: {
    netLosers: [
      { state: "NSW", netLoss2024: "29,000+", mainDestinations: ["QLD", "WA", "SA"], driver: "Housing affordability and cost of living" },
      { state: "VIC", netLoss2024: "15,000+", mainDestinations: ["QLD", "SA", "WA"], driver: "Cost of living, stamp duty burden, state tax perception" },
      { state: "ACT", netLoss2024: "Moderate", mainDestinations: ["QLD", "NSW Regional"], driver: "Cost of living for government workers" },
    ],
    netGainers: [
      { state: "QLD", netGain2024: 29910, mainSources: ["NSW", "VIC", "ACT"], driver: "Affordability, lifestyle, climate, Olympics narrative" },
      { state: "WA", netGain2024: 15000, mainSources: ["NSW", "VIC"], driver: "Mining employment, affordable housing" },
      { state: "SA", netGain2024: 8000, mainSources: ["NSW", "VIC"], driver: "Affordability, defence employment growth" },
    ],
    capitalInjectionEffect: "NSW/VIC residents selling at $1.5M+ are buying in QLD/SA/WA at $600k–$900k, banking the difference. This creates 2–3x the normal purchasing power in destination markets, accelerating price growth beyond what local income growth would support.",
    townsvilleMigrationSurge: "857% increase in net capital city migration to Townsville in 2024 — the largest surge of any regional city in Australia. Driven by affordability, defence employment expansion, and lifestyle appeal.",
  },

  overseasMigrationImpacts: {
    internationalStudents: "Major demand driver for inner-city units near universities. Melbourne (Monash, Melbourne Uni, RMIT), Sydney (USYD, UNSW, UTS), Brisbane (UQ, QUT, Griffith) are primary hotspots. Student visa changes and international enrolment rates are leading indicators for this demand segment.",
    skilledMigrants: "Concentrated in infrastructure, healthcare, and technology sectors. Gravitate to major capitals initially — then disperse to regional areas for affordability. Townsville, Cairns, and Toowoomba are absorbing skilled migrants as secondary destinations.",
    keySuburbImpact: "International migration flows create particularly strong unit demand within 3km of major universities and within 15 minutes of CBD. 1-bed and 2-bed units in these zones have sub-1% vacancy in 2024–2026.",
  },

  populationProjections10Year: {
    brisbane2034: "3.4 million (from 2.7M in 2024) — 26% population growth over decade",
    southEastQLD2034: "5.2 million total (from ~3.8M) — massive infrastructure demand",
    perth2034: "2.8 million (from 2.2M) — strong sustained growth",
    adelaide2034: "1.5 million (from 1.3M)",
    ipswich2036: "390,000+ (from 270,000 today) — fastest growing QLD city",
    morningtonPeninsulaNote: "Mornington Peninsula and Geelong becoming genuine population centres driven by remote work — no longer pure 'weekender' markets",
    implication: "Suburbs along the north-south Brisbane growth spine (Ipswich to Caboolture), Perth's northern and southern corridors, and Adelaide's northern defence corridor will face the most acute supply shortfalls relative to demand growth.",
  },
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 11 — ECONOMIC DRIVERS BY REGION
// ─────────────────────────────────────────────────────────────

export const ECONOMIC_DRIVERS_BY_REGION = {

  defenceBases: [
    {
      base: "Lavarack Barracks, Townsville",
      service: "Army",
      personnel: "7,500+ military + 2,000 civilian",
      propertyImpact: "Townsville's largest single employer. Defence Housing Australia (DHA) manages hundreds of properties. Demand from military families is structurally stable regardless of economic cycles. Rent guaranteed by Federal Government through DHA leases.",
      bestInvestmentSuburbs: ["Bohle Plains", "Idalia", "Kirwan", "Annandale", "Douglas"],
      dhaLeaseNote: "DHA properties guarantee rent even if vacant — exceptional for risk-averse investors. DHA currently seeking more properties in Townsville.",
      expansionSignal: "Federal Government defence spending in North QLD is increasing — AUKUS submarine program, Indo-Pacific strategy. Townsville base expected to grow.",
    },
    {
      base: "RAAF Base Williamtown, Newcastle",
      service: "Air Force (main fighter training base)",
      personnel: "3,500+ military + civilian",
      propertyImpact: "Hunter Valley property market has a stable defence employment floor. Raymond Terrace, Medowie, and Tilligerry Peninsula all benefit from RAAF employment demand.",
      bestInvestmentSuburbs: ["Raymond Terrace", "Medowie", "Williamtown (careful — PFAS contamination concern)", "Tighes Hill"],
      warning: "Williamtown and Medowie have documented PFAS (firefighting foam) groundwater contamination from the base. This has materially impacted specific streets — verify individual blocks before purchasing.",
    },
    {
      base: "RAAF Base Edinburgh, Adelaide",
      service: "Air Force (surveillance aircraft, No. 92 Wing)",
      personnel: "2,500+ military + defence industry",
      propertyImpact: "Edinburgh Parks industrial precinct + BAE Systems + Raytheon = defence technology cluster north of Adelaide. Salisbury, Elizabeth, and Para Hills benefit from this employment anchor.",
      bestInvestmentSuburbs: ["Salisbury", "Para Hills", "Elizabeth North", "Mawson Lakes"],
      growthSignal: "AUKUS submarine programme creating significant defence industry employment growth in northern Adelaide corridor. Mawson Lakes (defence tech + Uni SA campus) is particularly well positioned.",
    },
    {
      base: "HMAS Creswell / HMAS Albatross, Nowra (NSW)",
      service: "Navy / Air Force",
      personnel: "3,000+ military",
      propertyImpact: "Shoalhaven region (Nowra, Bomaderry, Greenwell Point) has stable defence demand floor. Yield-focused investors benefit from guaranteed rental demand.",
      bestInvestmentSuburbs: ["Nowra", "Bomaderry", "South Nowra", "Culburra Beach"],
    },
    {
      base: "RAAF Base Tindal, Katherine (NT)",
      service: "Air Force",
      personnel: "1,500+ military (expanding under AUKUS)",
      propertyImpact: "Katherine is experiencing a mini property boom driven by RAAF Tindal expansion. US Air Force presence under Enhanced Force Posture Initiatives adding demand. Limited housing stock + growing workforce = extremely tight vacancy.",
      note: "High risk market (remote NT) but defence anchor provides unusual stability for remote location.",
    },
  ],

  healthcarePrecincts: [
    {
      precinct: "Princess Alexandra Hospital / Boggo Road Health & Knowledge Precinct, Brisbane",
      scale: "QLD's largest hospital + UQ + Mater Medical Research Institute",
      employment: "15,000+ direct healthcare and research employees in 3km radius",
      propertyImpact: "Dutton Park, Annerley, Greenslopes, and Woolloongabba all benefit from this employment cluster. PA Hospital alone employs 5,500+ staff. The Cross River Rail Boggo Road station (2026) will transform connectivity.",
      bestSuburbs: ["Dutton Park", "Annerley", "Woolloongabba", "Greenslopes", "Fairfield"],
    },
    {
      precinct: "Royal Brisbane & Women's Hospital / Herston Precinct",
      scale: "Largest hospital in QLD by beds. QLD Health Sciences precinct.",
      employment: "8,000+ direct staff. Queensland Institute of Medical Research adjacent.",
      propertyImpact: "Spring Hill and Herston have the most direct benefit. Brisbane Metro (Herston stop, 2027) adds a second infrastructure catalyst on top of existing healthcare demand.",
      bestSuburbs: ["Herston", "Spring Hill", "Kelvin Grove", "Red Hill", "Paddington"],
    },
    {
      precinct: "Sunshine Coast University Hospital, Birtinya",
      scale: "540 beds, growing to 738 beds. Northernmost major hospital in SEQ.",
      employment: "5,000+ staff, growing significantly",
      propertyImpact: "Birtinya and Bokarina are the primary beneficiary suburbs — both still under $800k for quality houses. The Wave rail project (Stage 1 Birtinya terminus) adds rail connectivity by 2031.",
      bestSuburbs: ["Birtinya", "Bokarina", "Wurtulla", "Parrearra", "Minyama"],
    },
    {
      precinct: "Gold Coast University Hospital, Southport",
      scale: "750 beds. Largest hospital in QLD by floor area.",
      employment: "6,500+ staff. Griffith University Medical School adjacent.",
      propertyImpact: "Southport, Ashmore, and Labrador benefit from healthcare employment demand. Gold Coast Light Rail G:link connects hospital to Broadbeach and Helensvale.",
      bestSuburbs: ["Southport", "Ashmore", "Labrador", "Parkwood", "Molendinar"],
    },
    {
      precinct: "Townsville University Hospital",
      scale: "600+ beds. Regional referral centre for North QLD and NT.",
      employment: "5,000+ staff",
      propertyImpact: "Douglas and Aitkenvale are the primary residential precincts adjacent to the hospital. Combined with Lavarack Barracks, Townsville's dual major employer clusters create unusually stable property demand.",
      bestSuburbs: ["Douglas", "Aitkenvale", "Cranbrook", "Hyde Park", "Mundingburra"],
    },
    {
      precinct: "Bundaberg Hospital ($1.2B rebuild)",
      scale: "New tertiary hospital — largest building project in Wide Bay history",
      employment: "2,000+ direct jobs, 5,000+ total economic impact when fully operational",
      propertyImpact: "The hospital rebuild is the most significant economic event in Bundaberg's history. Healthcare workers require accommodation — vacancy is already below 1.5%.",
      bestSuburbs: ["Bundaberg North", "Kepnock", "Svensson Heights", "Bargara"],
      completionDate: "2027",
    },
  ],

  universityTowns: [
    {
      university: "University of Queensland (UQ), St Lucia",
      students: "55,000+ students",
      propertyImpact: "St Lucia has chronic rental undersupply — units typically sub-1% vacancy. Toowong, Taringa, and Indooroopilly provide overflow rental demand.",
      bestSuburbs: ["St Lucia", "Toowong", "Indooroopilly", "Taringa", "Auchenflower"],
      yieldNote: "UQ-adjacent 1-bed and 2-bed units frequently achieve 5–6% gross yield in the $450k–$600k bracket.",
    },
    {
      university: "James Cook University (JCU), Townsville + Cairns",
      students: "22,000+ students across campuses",
      propertyImpact: "Douglas (Townsville) and Smithfield (Cairns) benefit from student and academic rental demand. JCU's tropical research credentials attract international students and researchers.",
      bestSuburbs: ["Douglas (Townsville)", "Smithfield (Cairns)", "Manunda (Cairns near TAFE)"],
    },
    {
      university: "University of Southern Queensland (USQ), Toowoomba + Springfield",
      students: "35,000+ students (online-heavy)",
      propertyImpact: "Springfield Lakes benefits from USQ Springfield Campus — combined with Inland Rail, creates dual demand anchor for the Western Corridor.",
      bestSuburbs: ["Springfield Lakes", "Toowoomba (Rangeville near main campus)"],
    },
    {
      university: "University of Newcastle",
      students: "40,000+ students",
      propertyImpact: "Callaghan and surrounding Hunter suburbs have sub-2% vacancy. Newcastle is undergoing broad gentrification with the university as a key anchor.",
      bestSuburbs: ["Jesmond", "Callaghan", "New Lambton Heights", "Hamilton"],
    },
    {
      university: "Curtin University / Murdoch University, Perth",
      students: "55,000 + 25,000 students",
      propertyImpact: "Bentley and Murdoch have sustained unit demand. Proximity to CBD via Fremantle line is a secondary demand driver.",
      bestSuburbs: ["Bentley", "Murdoch", "Melville", "South Lake"],
    },
  ],

  miningRegions2024OutlookRefined: {
    bowenBasin_QLD: {
      currentCycle: "Metallurgical coal (used for steelmaking) at elevated prices due to India and Southeast Asia steel demand. Thermal coal declining long-term. Net: cautious positive for next 3–5 years.",
      bestTownForInvestment: "Emerald — most diversified, serves as regional service hub for entire Bowen Basin. Not purely mining-dependent.",
      avoidList: ["Dysart", "Blackwater", "Collinsville", "Moranbah (unless sophisticated investor)"],
      opportunityNote: "Rockhampton (not in the Basin but servicing it) is the best risk-adjusted play on Bowen Basin growth — diversified economy, ring road incoming, 6.8% yield, $450k median.",
    },
    pilbara_WA: {
      currentCycle: "Iron ore prices fluctuating with Chinese steel demand. LNG (Karratha) on long-term contracts — more stable than iron ore.",
      bestTownForInvestment: "Karratha — LNG-anchored, not purely iron ore. More institutional investment and long-term employers than Port Hedland.",
      avoidList: ["Newman", "Tom Price", "Wickham"],
      opportunityNote: "LNG long-term contracts give Karratha more cycle resilience. Roebourne district properties near NW Shelf LNG operations have 15–20 year contract visibility.",
    },
    renewableEnergyRegions_SA: {
      emergingHubs: ["Port Augusta (hydrogen hub)", "Whyalla (Green Steel — GFG Alliance transformation)", "Ceduna (offshore wind)"],
      propertyImpact: "Green energy infrastructure requires workers, many of whom need long-term accommodation. Port Augusta and Whyalla have historically been depressed markets — green energy transition is a genuine structural change catalyst.",
      cautionNote: "GFG Alliance (Whyalla steelworks owner) has experienced financial difficulties. Verify project financing status before purchasing in Whyalla.",
    },
    goldfields_WA: {
      goldPriceDynamic: "Gold at multi-decade highs (AUD $4,500+ per ounce as of 2025). Kalgoorlie production expanding. Gold is counter-cyclical to economic downturns.",
      kalgoorlieOpportunity: "Kalgoorlie-Boulder is the most diversified WA mining city — gold, nickel, lithium all present. 7.2% house yield at $350k median. Best WA mining play for diversified investors.",
      lithiumAddendum: "Pilbara and Goldfields lithium operations (driven by EV supply chains) creating new long-term employment demand beyond traditional gold/iron ore.",
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 12 — RISK DATA (EXTENDED)
// ─────────────────────────────────────────────────────────────

export const RISK_DATA_EXTENDED = {

  floodRiskQLD: {
    post2022FloodChanges: {
      scope: "177 out of 184 Brisbane suburbs affected by 2022 floods",
      mappingUpdate: "Brisbane City Council added 2022 flood data alongside 1974 and 2011 historical overlays in FloodCheck",
      insuranceImpact: "Post-2022, insurers updated their internal flood models independently of council maps — many properties now assessed at higher risk even if not on council flood overlays",
      keyTool: "FloodWise Property Report (Brisbane City Council) — free search by address. FloodCheck Queensland (state government) for regional areas.",
      insurer_divergence: "Council flood maps and insurer flood models often diverge. A property may not appear on council overlay but still face elevated premiums based on insurer proprietary data. ALWAYS get insurance quotes before purchasing.",
    },
    highRiskBrisbaneSuburbs: [
      { suburb: "Oxley", riskLevel: "high", note: "Flood-affected in 1974, 2011, and 2022. Avoid for investment unless property is verified above flood level." },
      { suburb: "Yeronga", riskLevel: "high", note: "Significant 2022 flood impact. Multiple streets affected." },
      { suburb: "Chelmer", riskLevel: "high", note: "Adjacent to Brisbane River. Premium suburb but significant flood exposure." },
      { suburb: "Graceville", riskLevel: "medium-high", note: "Parts of suburb affected. Street-level due diligence essential." },
      { suburb: "Rocklea", riskLevel: "very_high", note: "Industrial/residential mix. Severe and repeated flood impact." },
      { suburb: "Seventeen Mile Rocks", riskLevel: "high", note: "Bremer River junction. Repeated flood events." },
      { suburb: "Jindalee", riskLevel: "medium", note: "Higher areas OK. Lower streets near river — verify individual blocks." },
      { suburb: "Corinda", riskLevel: "medium", note: "Some streets affected. Check individual addresses on FloodWise." },
    ],
    statewideTool: "https://floodcheck.information.qld.gov.au/ — free, address-level flood mapping for all of Queensland",
    dueDiligenceChecklist: [
      "Pull FloodWise or FloodCheck report for specific address",
      "Check historical insurance claims data (ask vendor directly via Section 6 property disclosure)",
      "Obtain at least 3 insurance quotes BEFORE signing contract — note if any decline or quote >$5,000/year",
      "Conduct physical inspection after heavy rain if possible",
      "Review council overlays for waterway buffers (not just flood extent)",
      "Verify driveway and access not flood-affected even if house is elevated",
    ],
  },

  bushfireRisk: {
    balRatings: {
      system: "Bushfire Attack Level (BAL) ratings classify bushfire risk from BAL-LOW to BAL-FZ (Flame Zone)",
      ratings: [
        { level: "BAL-LOW", meaning: "Minimal risk — standard construction", insuranceImpact: "Normal premiums" },
        { level: "BAL-12.5", meaning: "Low risk — ember attack possible", insuranceImpact: "Marginally higher premiums" },
        { level: "BAL-19", meaning: "Moderate risk — additional construction requirements", insuranceImpact: "Moderately higher premiums. BAL-specific materials required." },
        { level: "BAL-29", meaning: "High risk", insuranceImpact: "Significantly higher premiums. Some insurers exclude." },
        { level: "BAL-40", meaning: "Very high risk", insuranceImpact: "Very high premiums. Limited insurer options." },
        { level: "BAL-FZ (Flame Zone)", meaning: "Extreme risk — direct flame contact possible", insuranceImpact: "Some insurers will not cover. Rebuild costs 30–50% higher due to building standards." },
      ],
    },
    investmentImplications: [
      "BAL-29 and above properties face significant ongoing insurance cost — budget $3,000–$8,000+ annually for building insurance in high-risk areas",
      "Underinsurance is endemic — MCG Quantity Surveyors found many properties underinsured by up to 66%. In bushfire-prone areas, replacement cost is always higher than market value.",
      "BAL rating must be declared to lenders. Some lenders restrict LVR for high BAL properties in known fire corridors.",
      "Post-2019/2020 bushfire season (Black Summer), several ACT, NSW and VIC coastal hinterland areas had insurance withdrawn by major insurers",
      "Always check the Bush Fire Prone Land (BFPL) register for NSW. Queensland uses the State Planning Policy to identify bushfire hazard areas.",
    ],
    checkTools: [
      "NSW: rfs.nsw.gov.au — Bush Fire Prone Land online check by address",
      "QLD: State Planning Policy mapping — planning.des.qld.gov.au",
      "VIC: Country Fire Authority (CFA) planning zones",
      "WA: DFES Bushfire Risk Management System",
    ],
  },

  insurancePremiumHotspots: {
    uninsurableZones: [
      "Parts of Northern NSW (Lismore, Mullumbimby, Murwillumbah) — 2022 floods rendered some properties uninsurable with mainstream providers",
      "Parts of South-East Queensland (Ipswich flats, parts of Logan) — multiple insurers declining or pricing at $15,000+ annually",
      "Parts of Cairns and Townsville — cyclone risk overlaid with flood risk creates dual-peril premiums that exceed 2% of property value annually",
      "Far North QLD coastal — cyclone risk in Category 3–5 zones can push premiums to $5,000–$15,000+ per year",
    ],
    cycloneRiskQLD: {
      affected: "All QLD coast north of approximately Bundaberg. Risk increases significantly north of Mackay.",
      insuranceImpact: "Cyclone building requirements (tie-downs, roof construction standards) for properties built before 1982 significantly increase insurer liability and premiums",
      dueDiligence: "Properties built before 1982 in cyclone regions require wind engineering assessments. Many investors overlook this — it can make an otherwise attractive yield play uninsurable at reasonable cost.",
    },
    pfasContamination: {
      definition: "PFAS (per- and polyfluoroalkyl substances) — firefighting foam chemicals used at airports and military bases that have contaminated groundwater in surrounding areas",
      affectedAreas: ["Williamtown (NSW) — RAAF Base", "Oakey (QLD) — Army Aviation Centre", "Darwin (NT) — multiple defence sites", "Katherine (NT)", "Tindal (NT)"],
      propertyImpact: "Properties in PFAS contamination zones face: reduced buyer pool, lender restrictions, disclosure obligations, and potential future remediation liability. Some lenders refuse to lend.",
      checkProcess: "Defence Department publishes PFAS investigation site maps. Always check DoD environmental maps for properties near military bases or airports.",
    },
  },

  socialHousingData: {
    concentrationThresholds: {
      safe: "< 10% social housing as percentage of total dwellings",
      caution: "10–20% — worth investigating trend (improving or worsening?)",
      concern: "20–30% — suppresses owner-occupier demand and comparable sales",
      redFlag: "> 30% — structurally impairs capital growth. Avoid for growth strategy.",
    },
    howToCheck: [
      "ABS Census QuickStats — dwelling tenure data by suburb (free, updated every 5 years at Census)",
      "AIHW Social Housing datasets — state-level housing commission data",
      "Local council strategic plans — often show social housing distribution maps",
      "Street-level observation: Housing Commission properties often have distinctive architectural style (1960s–1980s brick veneer, uniform window types)",
    ],
    suburbsWithDecliningConcentration: "Suburbs where social housing ratio is FALLING are excellent investment targets — it signals gentrification pressure. Examples: Fortitude Valley (QLD), Waterloo (NSW), Fitzroy North (VIC) all had declining social housing ratios before their price surges.",
    importantNote: "Social housing is being decentralised away from traditional inner-city concentrations under LAHC and Housing Queensland programs. Suburbs receiving new social housing must be identified — the addition of social housing can suppress gentrification momentum.",
  },

  coastalErosionRisk: {
    overview: "Climate Council estimates 250,000 Australian coastal properties face significant erosion risk by 2030. This is an underappreciated risk for beachfront investment.",
    riskZones: [
      "Gold Coast northern beaches — Surfers Paradise, Main Beach: some erosion management required",
      "Sunshine Coast northern beaches — Noosa, Marcus Beach: natural dune systems provide some protection",
      "Far North QLD — Cairns northern beaches: high cyclone + erosion risk combination",
      "NSW south coast — Shoalhaven, Bega Valley: accelerating erosion patterns",
    ],
    investorProtocol: "For any beachfront or near-beachfront property, obtain a coastal erosion risk assessment from a qualified coastal engineer. Check CSIRO CoastalRisk portal (coastalrisk.com.au) for sea level rise projections.",
    insuranceLinkage: "Properties in designated coastal erosion zones may face non-renewal of strata title insurance (affects unit complexes) or refusal of building insurance by major providers.",
  },
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 13 — MARKET CONDITIONS 2025–2026
// ─────────────────────────────────────────────────────────────

export const MARKET_CONDITIONS_2026 = {

  auctionClearanceRates: {
    dataDate: "March 2026",
    national: {
      clearanceRate: 56.9,
      signal: "Buyer's market nationally — below the 70% seller's market threshold",
      note: "National rate at lowest since January 2025. Sellers adjusting expectations.",
    },
    byCityMarch2026: [
      {
        city: "Adelaide",
        clearanceRate: 73,
        signal: "SELLER'S MARKET",
        interpretation: "Adelaide the only major capital in strong seller's territory. Reflect supply scarcity and ongoing migration inflows. Best current buying conditions for investors who can access stock.",
      },
      {
        city: "Sydney",
        clearanceRate: 55,
        signal: "BUYER'S MARKET",
        interpretation: "Sydney's lowest clearance since January 2025. Inner suburbs holding better than outer rings. Opportunity for negotiated purchases in outer metro.",
      },
      {
        city: "Melbourne",
        clearanceRate: 57.4,
        signal: "BALANCED / BUYER-LEANING",
        interpretation: "Melbourne is a 'two-speed market' — affordable suburbs performing strongly while premium segments softer. Post-auction negotiation increasingly common.",
      },
      {
        city: "Brisbane",
        clearanceRate: 52,
        signal: "BUYER'S MARKET",
        interpretation: "Brisbane at lowest clearance rate of 2026. After 3 years of exceptional growth, market pausing. This is a buying window — structural fundamentals (Olympics, population, infrastructure) remain intact.",
      },
      {
        city: "Perth",
        clearanceRate: 61,
        signal: "BALANCED",
        interpretation: "Perth moderating after 17.6% growth in 2024. Still strong fundamentals but pace slowing. Good negotiation conditions emerging.",
      },
      {
        city: "Canberra",
        clearanceRate: 58,
        signal: "BALANCED",
        interpretation: "Government employment stability supports baseline demand. Rate sensitive due to high average mortgage sizes.",
      },
    ],
    criticalNote: "Brisbane auction clearance data is less reliable than Sydney/Melbourne due to smaller auction market volume. Brisbane investors should weight price negotiation data and DOM trends more heavily than clearance rates.",
  },

  buildingApprovals2025_2026: {
    nationalTotal2025: 196000,
    targetRequired: 240000,
    shortfall: 44000,
    trend: "Improving — November 2025 approvals 20.2% above prior year. February 2026 surged 29.7% month-on-month.",
    accordProgress: "60,000 homes short in first year of National Housing Accord. 255,000/year required over remaining 4 years — currently unachievable at current approval and commencement rates.",
    multiUnitSurge: "Multi-unit approvals hit highest since June 2018 in November 2025 — pipeline building. Will add supply pressure to high-density inner-city markets in 2027–2028.",
    houseVsUnit: {
      houses: "Approvals stable — constrained by land availability and trade labour shortage",
      units: "Multi-unit surge driven by interest rate cuts and renewed developer confidence — WATCH for oversupply in specific inner-city corridors",
    },
    implicationForInvestors: [
      "Detached houses in middle and outer ring suburbs face minimal new supply competition — buy with confidence",
      "New apartment supply pipeline building in Brisbane CBD, South Brisbane, Fortitude Valley — avoid purchasing new units in these corridors without checking approval pipeline",
      "Regional QLD (Toowoomba, Townsville, Bundaberg) building approvals remain well below population-implied demand — strong structural undersupply",
      "Perth new approvals still below 10-year average — supply not keeping pace with population growth, sustaining the price growth thesis",
    ],
  },

  interestRateOutlook: {
    cashRateContext: "RBA began cutting cycle in early 2025 following peak of 4.35% in November 2023.",
    marketExpectations: "Markets pricing 2–3 further cuts through 2025–2026. ANZ forecasting 5.8% average capital city house price growth for 2026.",
    propertyMarketImpact: {
      each50bpsCut: "Adds approximately $25,000–$35,000 in borrowing capacity for median income earner. Expands buyer pool significantly.",
      fixedRateExpiry: "Most fixed-rate mortgages written at 2–3% rates in 2020–2022 have now expired. Borrowers have adjusted to variable rates — this overhang has largely cleared.",
      investorBehavior: "Falling rates reduce holding costs for negatively geared portfolios. Cash-flow stress that forced selling in 2023–2024 is easing. Expect investor activity to increase through 2025–2026.",
    },
    westpacForecast: "Perth +8% in 2026",
    kpmgForecast: "Melbourne houses +6.6%, Melbourne units +7.1% in 2026",
    domainForecast: "Melbourne median to reach $1.11M by FY26 (+6%)",
    anzForecast: "Brisbane to remain a top performer driven by Olympics, population, and affordability relative to Sydney",
  },

  vendorDiscounting2026: {
    national: "Vendor discounting has increased from historic lows of 2021–2022 (~1.5%) to approximately 3.2% nationally in early 2026",
    byCityBenchmark: [
      { city: "Adelaide", rate: 1.8, signal: "Minimal discounting — sellers firm" },
      { city: "Perth", rate: 2.4, signal: "Slight moderation but still tight" },
      { city: "Brisbane", rate: 3.0, signal: "Moderate discounting — some negotiation possible" },
      { city: "Sydney", rate: 3.5, signal: "More negotiation room than 2 years ago" },
      { city: "Melbourne", rate: 4.2, signal: "Best negotiation conditions of major capitals" },
    ],
    interpretation: "Rising vendor discounting + clearing lower clearance rates = buyer opportunity window. This is NOT a crash signal — structural demand (population growth, undersupply) remains. It is a cyclical pause creating entry opportunities.",
  },

  daysOnMarketTrends2026: {
    national: {
      averageDOM: 35,
      trend: "Rising from 2021–2022 lows of 18–22 days",
      signal: "Market slowing from extreme heat of 2021. Now approaching balanced.",
    },
    byCityApril2026: [
      { city: "Adelaide", avgDOM: 22, trend: "Falling", signal: "Strong buyer urgency — seller's market confirmed" },
      { city: "Perth", avgDOM: 26, trend: "Stable", signal: "Strong market with moderate urgency" },
      { city: "Brisbane", avgDOM: 32, trend: "Slightly rising", signal: "Market slowing from 2024 peak — opportunity window" },
      { city: "Sydney", avgDOM: 38, trend: "Rising", signal: "Buyers have time to negotiate — use it" },
      { city: "Melbourne", avgDOM: 45, trend: "Rising", signal: "Best buyer conditions in major capitals" },
    ],
    regionalQLD: "Regional QLD DOM averaging 20–28 days — significantly tighter than capital city market. Townsville, Cairns, Bundaberg all under 25 days. Strong urgency signals in regionals.",
    investorAction: "The divergence between Adelaide/Perth (falling DOM, high clearance) and Melbourne (high DOM, low clearance) is the most important current market signal. Adelaide is late in its growth cycle but still accelerating; Melbourne may be approaching inflection upward after underperformance.",
  },
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 14 — INVESTMENT STRATEGIES (WITH CASE STUDIES)
// ─────────────────────────────────────────────────────────────

export const INVESTMENT_STRATEGIES_DETAILED = {

  buyAndHoldGrowthCorridor: {
    name: "Buy and Hold in Growth Corridors",
    description: "Purchase a well-located property in an infrastructure-triggered growth corridor and hold for 7–15 years. The bread-and-butter strategy of Australia's most successful property investors.",
    typicalReturns: {
      capitalGrowth: "7–12% per annum in premium corridors over 10-year holds",
      rentalGrowth: "3–6% per annum in tight markets",
      totalReturn: "10–18% gross per annum (pre-tax, pre-leverage)",
      leveragedReturn: "On 80% LVR, total returns on equity can exceed 25% in strong growth years",
    },
    riskProfile: "Low-Medium (assuming quality suburb selection, diversified economy, not over-leveraged)",
    bestCurrentSuburbs2024_2026: [
      { suburb: "Townsville inner suburbs", state: "QLD", rationale: "Defence + healthcare + affordability. 20% growth pa. 7+ year hold." },
      { suburb: "Salisbury / Elizabeth corridor", state: "SA", rationale: "Defence industry expansion. AUKUS employment growth 15-year horizon." },
      { suburb: "Ripley / South Ripley", state: "QLD", rationale: "Population explosion. Rail announcement incoming. 10-year play." },
      { suburb: "Herston", state: "QLD", rationale: "Olympics + Brisbane Metro + hospital. Most underpriced inner Brisbane suburb." },
      { suburb: "Yanchep / Alkimos", state: "WA", rationale: "Rail unlocked 2024. Coastal lifestyle. Government growth corridor." },
    ],
    commonMistakes: [
      "Selling in year 3–5 when carrying costs feel high — this is exactly when to hold",
      "Buying in gentrifying suburb but selecting wrong street (social housing side vs owner-occupier side)",
      "Choosing yield over location — a 6% yield in a declining town beats a 4% yield in a growing suburb only if you don't need capital",
      "Ignoring land content — buying unit in oversupplied corridor when house on 600sqm could be secured nearby",
    ],
  },

  dualIncomeGrannyFlat: {
    name: "Dual Income / Granny Flat Strategy",
    description: "Purchase a house on a large block (600sqm+) and construct a secondary dwelling (granny flat, SLUG, or dual-key). This converts a single rental income to dual income from one asset.",
    typicalReturns: {
      grannyFlatCost: "$80,000–$200,000 depending on size, state, and specification",
      additionalWeeklyRent: "$300–$550 per week for a well-located 1–2 bedroom secondary dwelling",
      additionalAnnualIncome: "$15,600–$28,600 per year",
      grannyFlatROI: "Average 20% ROI on construction cost — among the highest ROI renovation strategies available",
      totalPropertyYieldImpact: "Can improve total property yield from 3.5% to 5.5%–6.5%",
    },
    riskProfile: "Low-Medium",
    regulatoryContext: {
      QLD: "State planning laws allow secondary dwellings up to 80sqm on residential lots. Can rent to non-family since 2023.",
      NSW: "Complying development allows secondary dwellings up to 60sqm. SEPP 2009 enables fast approval in many areas.",
      VIC: "Council-by-council — some progressive councils allow secondary dwellings easily, others restrict. Check before purchasing.",
      WA: "Secondary dwellings allowed on R30+ zoned lots. Simplified approval process in place.",
      SA: "Code-assessed development allows secondary dwellings in most residential zones. Strong government support for secondary dwellings.",
    },
    bestCurrentSuburbs: [
      { suburb: "Ipswich (inner)", state: "QLD", note: "Large blocks affordable under $550k. Pop growth = high demand for secondary rental." },
      { suburb: "Logan City", state: "QLD", note: "Affordable large blocks. High rental demand. Council supportive of secondary dwellings." },
      { suburb: "Penrith corridor", state: "NSW", note: "R3 zoning allows secondary dwellings easily. Western Sydney Airport proximity." },
      { suburb: "Salisbury / Elizabeth", state: "SA", note: "Large blocks, affordable, dual income demand from defence workers." },
      { suburb: "Morley / Bassendean", state: "WA", note: "Perth inner-north. Large blocks still accessible. R30+ zoning supports secondary." },
    ],
    caseStudy: {
      location: "Ipswich, QLD",
      purchasePrice: 540000,
      grannyFlatCost: 140000,
      totalInvestment: 680000,
      mainDwellingRent: 550,
      grannyFlatRent: 380,
      totalWeeklyRent: 930,
      grossYield: 7.1,
      comment: "Investors regularly achieving $900–$1,000/week total rent on $650k–$700k total investment in Ipswich. Effectively cash-flow neutral at 80% LVR with current rates.",
    },
    commonMistakes: [
      "Building a granny flat that doesn't have private access — shared driveways or entries kill rental appeal",
      "Over-capitalising — a $250k granny flat on a $400k house in a flat market does not add $250k of value",
      "Ignoring council setback and size requirements — unapproved structures create compliance risk on sale",
      "Not separating utilities — tenants paying own utility costs is essential for granny flat management",
    ],
  },

  renovationManufacturedGrowth: {
    name: "Renovation / Manufactured Growth Strategy",
    description: "Purchase a cosmetically dated property below its potential market value, renovate strategically, and either sell for profit or refinance to extract equity for next purchase.",
    typicalReturns: {
      renovationROI: "Kitchen: ~75% ROI. Bathroom: 60–80% ROI. External repaint + landscaping: 100–150% ROI.",
      totalProfitExample: "Brisbane example: $600k purchase + $100k renovation = $800k valuation (profit $100k in 6 months)",
      cashFlowImprovement: "Strategic renovation can lift weekly rent by $100–$200/week — $5,200–$10,400 annually",
      equityExtraction: "Refinance post-renovation to extract equity for next deposit — the 'equity recycling' strategy",
    },
    riskProfile: "Medium — contractor risk, budget overruns, time risk",
    bestSuburbsForRenovation: [
      { suburb: "Deagon / Sandgate", state: "QLD", note: "Character Queenslander homes. Strong owner-occupier buyer pool post-renovation." },
      { suburb: "Mitchelton / Gaythorne", state: "QLD", note: "Pre-war homes on large blocks. Gentrification wave ongoing." },
      { suburb: "Mayfield / Hamilton", state: "NSW", note: "Newcastle gentrification. Post-war housing stock ready for modernisation." },
      { suburb: "Echuca / Bendigo inner", state: "VIC", note: "Period housing stock. Growing lifestyle market appreciation." },
      { suburb: "Unley / Thebarton", state: "SA", note: "Adelaide inner south/west. Victorian and Edwardian housing stock." },
    ],
    renovationPriorityOrder: [
      "1. External presentation (paint, gardens, front fence) — highest ROI, lowest cost",
      "2. Kitchen modernisation — most buyer-influential single room",
      "3. Bathroom(s) — second most influential",
      "4. Flooring (polished timber or hybrid plank) — visual impact disproportionate to cost",
      "5. Lighting upgrade — transforms perceived quality cheaply",
      "6. AVOID: Pool installation (low ROI), extensions (over-capitalisation risk), structural changes (cost blowout risk)",
    ],
    caseStudy: {
      location: "Brisbane, QLD",
      purchasePrice: 600000,
      renovationCost: 100000,
      postRenovationValue: 800000,
      netProfit: 70000,
      timeframe: "6 months",
      strategyNote: "Kitchen/bathroom/paint/flooring/landscaping. Property sold in 11 days after listing post-renovation.",
    },
    commonMistakes: [
      "Over-renovating for the suburb — granite benchtops in a $500k suburb add cost not value",
      "DIY structural work without permits — creates disclosure obligations and buyer suspicion",
      "Under-estimating renovation time — every extra month costs holding costs (~$3,000–$5,000/month)",
      "Not getting a building inspection pre-purchase — discovering structural issues mid-renovation destroys returns",
      "Ignoring the exit market — renovate for owner-occupiers not renters for maximum resale value",
    ],
  },

  developmentSiteAcquisition: {
    name: "Development Site Acquisition (Subdivision / Duplex / Townhouse)",
    description: "Acquire a large or corner block with subdivision or multi-dwelling potential. Either develop immediately or land-bank until rezoning or market conditions improve. Highest complexity, highest potential return.",
    typicalReturns: {
      subdivision: "40%+ equity creation by subdividing rear lot and building/selling new dwelling",
      duplex: "25–40% total return on cost in strong markets. Two lots worth 1.5–1.8x single lot value.",
      townhouse: "Developer margins of 20–30% in well-priced markets. Higher in undersupplied corridors.",
      landBank: "Holding un-subdivided land in a rezoning area can deliver 50–100%+ gains over 3–7 years",
    },
    riskProfile: "High — planning risk, construction risk, market risk, funding risk",
    keyChecks: [
      "Zoning classification — must be R3 (medium density) or higher in NSW, LMR or higher in QLD, R30+ in WA",
      "Minimum lot size for subdivision — varies by council. QLD typically 400–600sqm minimum",
      "Setback and site coverage requirements — determines how much can be built",
      "Sewer and stormwater infrastructure capacity — critical constraint often overlooked",
      "Overlay mapping — flood, bushfire, character, demolition control overlays all affect what can be built",
      "Access requirements — corner blocks preferred for dual access. Right-of-way issues must be resolved",
    ],
    bestCurrentOpportunities: [
      { suburb: "Ripley / South Ripley (QLD)", note: "Large blocks, strong growth corridor, dual occupancy permitted. Buy now before rail announcement adds 15–25%." },
      { suburb: "Logan City inner (QLD)", note: "LMR zoning accessible. Large blocks affordable. Council supportive of dual occupancy." },
      { suburb: "Penrith outer (NSW)", note: "R3 zoning near Western Sydney Airport growth zone. Development upside substantial." },
      { suburb: "Salisbury North / Para Hills West (SA)", note: "Affordable large blocks. Rezoning happening in northern Adelaide corridor." },
      { suburb: "Armadale / Kelmscott (WA)", note: "Perth south-east. R20+ blocks with subdivision potential under $500k." },
    ],
    caseStudy: {
      location: "Perth, WA",
      strategy: "Rear lot subdivision",
      purchasePrice: 550000,
      grannyFlatConstruction: 150000,
      totalInvestment: 700000,
      weeklyRentalIncome: 850,
      alternativeExitValue: "Rear lot sell-down: $250,000 vacant lot value. Total asset value: $900k+",
      returnOnInvestment: "35%+ on development cost",
      timeframe: "18 months",
    },
    commonMistakes: [
      "Purchasing without DA pre-approval or at minimum a planning advice from council",
      "Under-estimating infrastructure contribution costs (developer levies can be $20,000–$60,000 per lot)",
      "Not including contingency (budget minimum 15–20% above quote for first-time developers)",
      "Choosing the wrong builder — fixed-price contracts are essential for development projects",
      "Over-improving the development product for the target market — keeps it simple and saleable",
    ],
  },

  regionalYieldPlay: {
    name: "Regional Yield Play",
    description: "Acquire high-yielding properties in diversified regional cities (not pure mining towns) where cashflow positive returns are achievable and population/economic growth provides capital growth upside.",
    typicalReturns: {
      grossYield: "5.5–8% in well-selected regionals",
      netYield: "4–6% after costs",
      capitalGrowth: "5–10% in strong regional markets, 2–4% in stable regionals",
      totalReturn: "9–16% gross per annum in optimal regional markets",
    },
    riskProfile: "Medium (diversified regionals) to Very High (mining towns)",
    currentBestRegionals2024_2026: [
      {
        city: "Townsville QLD",
        medianHouse: 714000,
        grossYield: 6.5,
        annualGrowth: 19.87,
        riskLevel: "low",
        rationale: "Best risk-adjusted regional in Australia. Defence + healthcare = structural demand. 107% 5-year growth.",
      },
      {
        city: "Bundaberg QLD",
        medianHouse: 560000,
        grossYield: 5.8,
        annualGrowth: 13.21,
        riskLevel: "low",
        rationale: "$1.2B hospital rebuild creating 2,000+ jobs in a $560k median market.",
      },
      {
        city: "Rockhampton QLD",
        medianHouse: 450000,
        grossYield: 6.8,
        annualGrowth: 12,
        riskLevel: "low",
        rationale: "Regional capital with ring road uplift. Services Bowen Basin without mining concentration risk.",
      },
      {
        city: "Kalgoorlie WA",
        medianHouse: 350000,
        grossYield: 7.2,
        annualGrowth: 15,
        riskLevel: "medium",
        rationale: "Gold at multi-decade highs. More diversified than other WA mining cities.",
      },
      {
        city: "Wagga Wagga NSW",
        medianHouse: 700000,
        grossYield: 4.49,
        annualGrowth: 9,
        riskLevel: "low",
        rationale: "RAAF + CSU + regional hospital. Classic diversified regional. Units yield 5.64%.",
      },
      {
        city: "Geraldton WA",
        medianHouse: 380000,
        grossYield: 6.8,
        annualGrowth: 12,
        riskLevel: "low",
        rationale: "Mid-west WA hub. Fishing, agriculture, mining — triple diversification.",
      },
    ],
    selectionCriteria: [
      "Minimum 3 distinct industry employers (no single industry > 40% of employment)",
      "Population growth positive and accelerating",
      "Vacancy rate below 2.5%",
      "Hospital, university, or government office as anchor employer",
      "Median house price less than 5x regional median income (affordability floor)",
      "Not purely dependent on commodity price cycle",
    ],
    commonMistakes: [
      "Confusing 'regional' with 'mining town' — very different risk profiles",
      "Chasing the highest yield number without understanding the employment base",
      "Ignoring exit liquidity — some regional properties take 6–18 months to sell in softer markets",
      "Not stress-testing for 10% rental vacancy in cash flow model for medium-risk regionals",
    ],
  },

  counterCyclicalBuying: {
    name: "Counter-Cyclical Buying Strategy",
    description: "Acquire quality assets in fundamentally sound locations during periods of market softness, rate pressure, or negative sentiment — when most investors are fearful. Requires financial buffer and conviction in underlying fundamentals.",
    principle: "Property cycles typically create opportunities for those who act strategically rather than emotionally. Each downturn sets the scene for the next upturn. The good news is property value slumps are only temporary, while long-term escalation of values in capital cities is seemingly permanent.",
    identifyingOpportunityWindow: [
      "Vendor discounting above 4% in a suburb with strong fundamentals",
      "Days on market above 50 but vacancy below 2% — prices disconnected from rental reality",
      "Clearance rates below 55% for 4+ consecutive weeks",
      "Negative media narrative ('property crash') coinciding with strong population growth data",
      "Rising interest rates causing 'forced seller' supply — distressed sales at below-market prices",
    ],
    currentOpportunityAssessment2026: {
      brisbane: "Clearance rate at 52% — lowest of 2026. Olympic infrastructure spending continues. Population growing. Structural fundamentals intact. A cyclical pause in a structural growth trend = buy window for patient investors.",
      melbourne: "Melbourne underperformed for 3 years (2022–2024). Units particularly weak. With KPMG forecasting 7.1% unit growth in 2026 and supply constrained, Melbourne units are the counter-cyclical opportunity of the current cycle.",
      perth: "Post 17.6% growth in 2024, Perth is moderating. Early-cycle dynamics playing out. Still 30–40% cheaper than comparable Sydney suburbs for similar amenity.",
    },
    riskProfile: "Medium — requires patience, financial buffer, and fundamentals research. Not market timing — it is quality asset acquisition in a window of reduced competition.",
    caseStudy: {
      scenario: "Melbourne unit purchase in 2022 (peak rate rise fear)",
      purchasePrice: 550000,
      marketSentiment: "Widespread 'property crash' media narrative. Clearance rates at 55%.",
      actualOutcome: "Melbourne units forecast +7.1% in 2026. Similar units now valued $620k–$650k.",
      lessong: "Buying quality assets when sentiment is most negative delivers the best entry prices and subsequent returns",
    },
    commonMistakes: [
      "Confusing counter-cyclical with distressed — buying flood-damaged, title-compromised, or structurally unsound properties at discount is not strategy, it is speculation",
      "Counter-cyclical buying in cities with STRUCTURAL problems (population decline, job loss) rather than CYCLICAL weakness",
      "Insufficient financial buffer — counter-cyclical strategy can extend. Need 12+ months of holding costs in reserve.",
      "Panic selling 6 months into the hold when prices don't immediately recover",
    ],
  },
} as const;

// ─────────────────────────────────────────────────────────────
// SECTION 15 — UPDATED YARDSCORE MASTER REFERENCE
// ─────────────────────────────────────────────────────────────

/**
 * Extended query function covering new sections.
 */
export function queryInvestmentStrategy(goal: InvestmentGoal, riskTolerance: RiskLevel, budget: BudgetTier) {
  const strategies = INVESTMENT_STRATEGIES_DETAILED;
  const recommendations: string[] = [];

  if (goal === "yield" && riskTolerance === "low") {
    recommendations.push("Regional Yield Play — focus on Townsville, Bundaberg, Rockhampton");
    recommendations.push("Dual Income / Granny Flat — strong cashflow in Logan or Ipswich");
  }
  if (goal === "growth" && riskTolerance === "low") {
    recommendations.push("Buy and Hold Growth Corridor — Townsville, Salisbury SA, Herston QLD");
    recommendations.push("Counter-Cyclical Buying — Brisbane and Melbourne 2026 window");
  }
  if (goal === "balanced" && budget === "under_500k") {
    recommendations.push("Dual Income / Granny Flat in Ipswich or Logan — cashflow positive");
    recommendations.push("Regional Yield Play — Wagga Wagga, Bundaberg, Rockhampton");
  }
  if (goal === "growth" && budget === "500k_750k") {
    recommendations.push("Olympics corridor Brisbane — Bowen Hills, Herston, Fortitude Valley units");
    recommendations.push("Buy and Hold — Sunshine Coast (Wave rail announcement effect)");
  }

  return { recommendations, fundamentals: MARKET_FUNDAMENTALS, redFlags: RED_FLAGS };
}

/**
 * Get Olympics corridor suburb data for a given suburb.
 */
export function getOlympicsSuburbData(suburb: string) {
  const venue = OLYMPICS_2032_EXTENDED.confirmedVenues2032.find(
    v => v.suburbsWithin2km.some(s => s.toLowerCase().includes(suburb.toLowerCase())) ||
         v.suburbsWithin5km.some(s => s.toLowerCase().includes(suburb.toLowerCase()))
  );
  const undervalued = OLYMPICS_2032_EXTENDED.undervaluedOlympicsSuburbs2024.find(
    u => u.suburb.toLowerCase().includes(suburb.toLowerCase())
  );
  return { venueProximity: venue, undervaluedProfile: undervalued };
}

/**
 * Get infrastructure projects affecting a given suburb.
 */
export function getSuburbInfrastructure(suburb: string) {
  const results: string[] = [];
  const ext = QLD_INFRASTRUCTURE_EXTENDED;

  ext.crossRiverRail.stations.forEach(s => {
    if (s.benefitedSuburbs.some(b => b.toLowerCase().includes(suburb.toLowerCase()))) {
      results.push(`Cross River Rail: ${s.station} station — ${s.propertyImpact}`);
    }
  });

  if (ext.sunshineCoastRail.stages.stage1.benefitedSuburbs.some(s => s.toLowerCase().includes(suburb.toLowerCase()))) {
    results.push(`The Wave Stage 1 rail — Sunshine Coast connection`);
  }

  if (ext.goldCoastLightRail.stage3.benefitedSuburbs.some(s => s.toLowerCase().includes(suburb.toLowerCase()))) {
    results.push(`Gold Coast Light Rail Stage 3 — Burleigh Heads extension (opening mid-2026)`);
  }

  return results.length > 0 ? results : ["No major infrastructure projects found in database for this suburb"];
}

/**
 * Assess a suburb's risk profile across all risk dimensions.
 */
export function assessSuburbRisk(params: {
  suburb: string;
  isFloodProne?: boolean;
  isBushfireZone?: boolean;
  socialHousingPercent?: number;
  nearMiningDependentArea?: boolean;
  vacancyRate?: number;
  ownerOccupierPercent?: number;
}): { riskScore: number; riskLevel: RiskLevel; flags: string[] } {
  let riskScore = 0;
  const flags: string[] = [];

  if (params.isFloodProne) { riskScore += 25; flags.push("FLOOD ZONE — insurance risk, growth impairment"); }
  if (params.isBushfireZone) { riskScore += 15; flags.push("BUSHFIRE ZONE — BAL assessment required, elevated insurance"); }
  if ((params.socialHousingPercent ?? 0) > 30) { riskScore += 20; flags.push(`HIGH SOCIAL HOUSING: ${params.socialHousingPercent}% — structural growth impairment`); }
  else if ((params.socialHousingPercent ?? 0) > 20) { riskScore += 10; flags.push(`ELEVATED SOCIAL HOUSING: ${params.socialHousingPercent}%`); }
  if (params.nearMiningDependentArea) { riskScore += 20; flags.push("MINING AREA — commodity price cycle risk, bank lending restrictions"); }
  if ((params.vacancyRate ?? 3) > 5) { riskScore += 15; flags.push(`HIGH VACANCY: ${params.vacancyRate}% — oversupply risk`); }
  if ((params.ownerOccupierPercent ?? 60) < 35) { riskScore += 15; flags.push(`LOW OWNER OCCUPIER: ${params.ownerOccupierPercent}% — sentiment-driven market`); }

  let riskLevel: RiskLevel = "low";
  if (riskScore >= 50) riskLevel = "very_high";
  else if (riskScore >= 35) riskLevel = "high";
  else if (riskScore >= 20) riskLevel = "medium";

  return { riskScore, riskLevel, flags };
}

export const YARDSCORE_HANDBOOK_V2 = {
  version: "3.0",
  lastUpdated: "2026-04",
  sections: {
    olympicsExtended: OLYMPICS_2032_EXTENDED,
    qldInfrastructureExtended: QLD_INFRASTRUCTURE_EXTENDED,
    rentalYieldHotspots: RENTAL_YIELD_HOTSPOTS,
    populationMigration: POPULATION_MIGRATION_DATA,
    economicDrivers: ECONOMIC_DRIVERS_BY_REGION,
    riskDataExtended: RISK_DATA_EXTENDED,
    marketConditions2026: MARKET_CONDITIONS_2026,
    investmentStrategies: INVESTMENT_STRATEGIES_DETAILED,
  },
  queryFunctions: {
    queryInvestmentStrategy,
    getOlympicsSuburbData,
    getSuburbInfrastructure,
    assessSuburbRisk,
  },
} as const;
