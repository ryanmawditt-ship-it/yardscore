export interface SuburbPick {
  suburb: string;
  postcode: string;
  rationale: string;
  medianHousePrice: number;
  medianWeeklyRent: number;
  grossYield: number;
  vacancyRate: number;
  growthScore: number;
  yieldScore: number;
  riskScore: number;
  infrastructureProjects: string[];
  demographics: string;
  supplyDemand: string;
}

interface BudgetTier {
  topPicks: SuburbPick[];
}

interface StateData {
  [tier: string]: BudgetTier;
}

export const investmentIntelligence: Record<string, StateData> = {
  QLD: {
    under500k: {
      topPicks: [
        {
          suburb: "Bundaberg",
          postcode: "4670",
          rationale: "Regional centre with hospital, university and port. Median house price $350-420k. Rental yields 6-7%. Strong population growth driven by agriculture and healthcare sectors.",
          medianHousePrice: 390000,
          medianWeeklyRent: 480,
          grossYield: 6.4,
          vacancyRate: 1.8,
          growthScore: 7,
          yieldScore: 9,
          riskScore: 3,
          infrastructureProjects: ["Bruce Highway upgrade", "Bundaberg Hospital expansion"],
          demographics: "Families, retirees, healthcare workers",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Rockhampton",
          postcode: "4700",
          rationale: "Central Queensland hub with beef industry, mining services and government employment. Median $320-400k. Yields 6.5-7.5%. Rookwood Weir driving regional investment.",
          medianHousePrice: 360000,
          medianWeeklyRent: 460,
          grossYield: 6.6,
          vacancyRate: 1.5,
          growthScore: 6,
          yieldScore: 9,
          riskScore: 4,
          infrastructureProjects: ["Rookwood Weir", "Brownshill Solar Farm", "CQ University expansion"],
          demographics: "Mining workers, government employees, families",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Toowoomba",
          postcode: "4350",
          rationale: "Queensland's second largest inland city. Inland Rail ($9.9B) transforms logistics hub. Verified AllHomes: houses from $329k. Diversified economy.",
          medianHousePrice: 450000,
          medianWeeklyRent: 520,
          grossYield: 6.0,
          vacancyRate: 1.2,
          growthScore: 8,
          yieldScore: 8,
          riskScore: 2,
          infrastructureProjects: ["Inland Rail $9.9B", "Toowoomba Second Range Crossing", "Wellcamp Airport expansion"],
          demographics: "Families, students, agricultural workers",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Eagleby",
          postcode: "4207",
          rationale: "South Logan corridor. Verified AllHomes: houses from $231k-$949k, median $749k. High yield potential at entry level. Close to M1 motorway and Beenleigh rail.",
          medianHousePrice: 450000,
          medianWeeklyRent: 500,
          grossYield: 5.8,
          vacancyRate: 1.2,
          growthScore: 6,
          yieldScore: 8,
          riskScore: 4,
          infrastructureProjects: ["M1 Pacific Motorway upgrade", "Beenleigh rail station upgrade"],
          demographics: "First home buyers, young families",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Southport",
          postcode: "4215",
          rationale: "Gold Coast CBD. Verified AllHomes: units/townhouses from $345k-$600k. Light rail connectivity. Gold Coast University Hospital employment hub.",
          medianHousePrice: 480000,
          medianWeeklyRent: 530,
          grossYield: 5.7,
          vacancyRate: 1.0,
          growthScore: 7,
          yieldScore: 8,
          riskScore: 2,
          infrastructureProjects: ["Gold Coast Light Rail Stage 4", "Gold Coast University Hospital expansion"],
          demographics: "Students, professionals, healthcare workers",
          supplyDemand: "undersupplied",
        },
      ],
    },
    from500kTo750k: {
      topPicks: [
        {
          suburb: "Caboolture",
          postcode: "4510",
          rationale: "Northern Brisbane corridor. Verified AllHomes: 3-bed houses $550k-$725k. 82 listings on market. New hospital, Bruce Highway upgrades, rail to Sunshine Coast.",
          medianHousePrice: 630000,
          medianWeeklyRent: 580,
          grossYield: 4.8,
          vacancyRate: 1.0,
          growthScore: 8,
          yieldScore: 7,
          riskScore: 2,
          infrastructureProjects: ["Caboolture Hospital expansion", "Bruce Highway upgrade", "Sunshine Coast rail"],
          demographics: "Young families, tradies, commuters",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Morayfield",
          postcode: "4506",
          rationale: "Adjacent to Caboolture with strong retail precinct. Verified AllHomes: 3-bed houses $569k-$800k. Morayfield Road upgrade and new shopping centre driving growth.",
          medianHousePrice: 650000,
          medianWeeklyRent: 600,
          grossYield: 4.8,
          vacancyRate: 0.9,
          growthScore: 7,
          yieldScore: 7,
          riskScore: 2,
          infrastructureProjects: ["Morayfield Road upgrade", "Bruce Highway upgrade", "Caboolture Hospital nearby"],
          demographics: "Families, first home buyers",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Goodna",
          postcode: "4300",
          rationale: "Ipswich corridor 25km to Brisbane CBD. Verified AllHomes: 3-bed houses $530k-$800k. Rail to Brisbane, Springfield masterplan nearby. Strong rental demand.",
          medianHousePrice: 600000,
          medianWeeklyRent: 560,
          grossYield: 4.9,
          vacancyRate: 1.0,
          growthScore: 7,
          yieldScore: 7,
          riskScore: 3,
          infrastructureProjects: ["Ipswich Motorway upgrade", "Springfield rail extension", "Redbank Plains growth"],
          demographics: "Young families, commuters, defence workers",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Deception Bay",
          postcode: "4508",
          rationale: "Waterfront suburb in Moreton Bay. Verified AllHomes: 3-bed houses $680k-$879k. Waterfront lifestyle at affordable prices compared to Redcliffe.",
          medianHousePrice: 700000,
          medianWeeklyRent: 630,
          grossYield: 4.7,
          vacancyRate: 0.9,
          growthScore: 7,
          yieldScore: 6,
          riskScore: 2,
          infrastructureProjects: ["Bruce Highway upgrade", "Moreton Bay Rail extension"],
          demographics: "Families, sea changers, retirees",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Kallangur",
          postcode: "4503",
          rationale: "Moreton Bay growth corridor with rail to Brisbane. Verified AllHomes: houses from $599k-$999k. Petrie University precinct nearby driving demand.",
          medianHousePrice: 680000,
          medianWeeklyRent: 620,
          grossYield: 4.7,
          vacancyRate: 0.9,
          growthScore: 7,
          yieldScore: 6,
          riskScore: 2,
          infrastructureProjects: ["Petrie University campus", "Bruce Highway upgrade", "Moreton Bay Rail"],
          demographics: "Families, students, commuters",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Caboolture South",
          postcode: "4510",
          rationale: "Emerging suburb adjacent to Caboolture. Verified AllHomes: 3-bed houses $669k-$999k. New residential estates with modern stock.",
          medianHousePrice: 700000,
          medianWeeklyRent: 610,
          grossYield: 4.5,
          vacancyRate: 0.9,
          growthScore: 7,
          yieldScore: 6,
          riskScore: 2,
          infrastructureProjects: ["Caboolture Hospital expansion", "Bruce Highway upgrade"],
          demographics: "Young families, first home buyers",
          supplyDemand: "undersupplied",
        },
      ],
    },
    from750kTo1M: {
      topPicks: [
        {
          suburb: "Redcliffe",
          postcode: "4020",
          rationale: "Peninsula lifestyle suburb. Verified AllHomes: 3-bed houses from $875k. Moreton Bay Rail Link complete. Waterfront amenity driving premium prices.",
          medianHousePrice: 875000,
          medianWeeklyRent: 720,
          grossYield: 4.3,
          vacancyRate: 0.9,
          growthScore: 8,
          yieldScore: 5,
          riskScore: 2,
          infrastructureProjects: ["Moreton Bay Rail Link complete", "Redcliffe Hospital upgrade", "Waterfront precinct"],
          demographics: "Families, sea changers, retirees",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "North Lakes",
          postcode: "4509",
          rationale: "Master planned community. Verified AllHomes: houses $849k-$1M+. Costco, major retail, excellent schools. 2032 Olympics northern corridor.",
          medianHousePrice: 920000,
          medianWeeklyRent: 750,
          grossYield: 4.2,
          vacancyRate: 0.8,
          growthScore: 7,
          yieldScore: 5,
          riskScore: 1,
          infrastructureProjects: ["Bruce Highway upgrade", "Moreton Bay Rail extension", "2032 Olympics precinct"],
          demographics: "Young families, professionals",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Chermside",
          postcode: "4032",
          rationale: "Major northern Brisbane activity centre. Verified AllHomes: 3-bed houses ~$900k. Westfield Chermside, Prince Charles Hospital.",
          medianHousePrice: 900000,
          medianWeeklyRent: 780,
          grossYield: 4.5,
          vacancyRate: 1.0,
          growthScore: 7,
          yieldScore: 6,
          riskScore: 2,
          infrastructureProjects: ["Prince Charles Hospital expansion", "Chermside activity centre upgrade"],
          demographics: "Medical workers, young professionals, families",
          supplyDemand: "balanced",
        },
        {
          suburb: "Nundah",
          postcode: "4012",
          rationale: "Inner north Brisbane. Verified AllHomes: 3-bed houses $950k-$1M. Airport rail line. Gentrifying with cafes and restaurants.",
          medianHousePrice: 960000,
          medianWeeklyRent: 820,
          grossYield: 4.4,
          vacancyRate: 0.8,
          growthScore: 8,
          yieldScore: 5,
          riskScore: 1,
          infrastructureProjects: ["Airport rail line", "Nundah village upgrade"],
          demographics: "Young professionals, couples, airport workers",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Ripley",
          postcode: "4306",
          rationale: "Major growth area south-west of Brisbane. Verified AllHomes: houses $736k-$939k. Massive residential development, future rail extension.",
          medianHousePrice: 850000,
          medianWeeklyRent: 680,
          grossYield: 4.2,
          vacancyRate: 0.8,
          growthScore: 8,
          yieldScore: 5,
          riskScore: 2,
          infrastructureProjects: ["Ripley Valley masterplan", "Springfield rail extension", "Ipswich Motorway"],
          demographics: "Young families, first home buyers",
          supplyDemand: "undersupplied",
        },
      ],
    },
    from1MTo1_5M: {
      topPicks: [
        {
          suburb: "Narangba",
          postcode: "4504",
          rationale: "Family suburb in Moreton Bay. Verified AllHomes: houses $950k-$1.2M. Large blocks, rail station, industrial precinct employment. Has moved out of the $750k bracket.",
          medianHousePrice: 1050000,
          medianWeeklyRent: 720,
          grossYield: 3.6,
          vacancyRate: 0.9,
          growthScore: 7,
          yieldScore: 4,
          riskScore: 2,
          infrastructureProjects: ["Bruce Highway upgrade", "Morayfield Road upgrade", "Narangba industrial estate"],
          demographics: "Families, tradies, first home buyers",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Paddington",
          postcode: "4064",
          rationale: "Prestige inner Brisbane. Character Queenslanders. 3km to CBD. Strong owner occupier demand underpins values. Median $1.1-1.4M. Tight supply of quality stock.",
          medianHousePrice: 1250000,
          medianWeeklyRent: 900,
          grossYield: 3.7,
          vacancyRate: 0.7,
          growthScore: 7,
          yieldScore: 4,
          riskScore: 1,
          infrastructureProjects: ["Given Tce streetscape", "Paddington precinct upgrade"],
          demographics: "Professionals, families, owner occupiers",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Bulimba",
          postcode: "4171",
          rationale: "Prestige riverside suburb 5km east of CBD. Oxford Street restaurant strip. Median $1.2-1.5M. Strong capital growth. Ferry to CBD. High owner occupier demand.",
          medianHousePrice: 1350000,
          medianWeeklyRent: 950,
          grossYield: 3.7,
          vacancyRate: 0.6,
          growthScore: 7,
          yieldScore: 4,
          riskScore: 1,
          infrastructureProjects: ["Bulimba ferry upgrade", "Oxford Street precinct"],
          demographics: "Affluent families, professionals",
          supplyDemand: "undersupplied",
        },
      ],
    },
    above1_5M: {
      topPicks: [
        {
          suburb: "New Farm",
          postcode: "4005",
          rationale: "Tightly held inner Brisbane. Merthyr Village, riverfront parks. Median $1.6-2.2M. Extremely low vacancy. Strong capital growth history. New Farm Park and James Street precinct.",
          medianHousePrice: 1900000,
          medianWeeklyRent: 1100,
          grossYield: 3.0,
          vacancyRate: 0.5,
          growthScore: 8,
          yieldScore: 3,
          riskScore: 1,
          infrastructureProjects: ["Cross River Rail", "Brisbane Metro", "2032 Olympics"],
          demographics: "Affluent professionals, executives",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Ascot",
          postcode: "4007",
          rationale: "Blue chip Brisbane suburb. Eagle Farm racecourse redevelopment. Median $1.8-2.5M. Prestigious schools, riverfront access. Consistently strong capital growth.",
          medianHousePrice: 2100000,
          medianWeeklyRent: 1200,
          grossYield: 3.0,
          vacancyRate: 0.4,
          growthScore: 7,
          yieldScore: 3,
          riskScore: 1,
          infrastructureProjects: ["Eagle Farm racecourse redevelopment", "Hamilton Northshore"],
          demographics: "High net worth families",
          supplyDemand: "undersupplied",
        },
      ],
    },
  },
  NSW: {
    under500k: {
      topPicks: [
        {
          suburb: "Cessnock",
          postcode: "2325",
          rationale: "Hunter Valley wine region. Mining and tourism employment. Median $380-450k. Strong yields 6-7%. Growing tourism infrastructure.",
          medianHousePrice: 420000,
          medianWeeklyRent: 500,
          grossYield: 6.2,
          vacancyRate: 1.5,
          growthScore: 6,
          yieldScore: 8,
          riskScore: 4,
          infrastructureProjects: ["Hunter Expressway", "Wine region tourism investment"],
          demographics: "Mining workers, tourism workers, families",
          supplyDemand: "balanced",
        },
        {
          suburb: "Raymond Terrace",
          postcode: "2324",
          rationale: "Port Stephens gateway town. 30min to Newcastle. Median $400-480k. Affordable family suburb with strong rental demand. Hunter region growth.",
          medianHousePrice: 440000,
          medianWeeklyRent: 500,
          grossYield: 5.9,
          vacancyRate: 1.3,
          growthScore: 6,
          yieldScore: 8,
          riskScore: 3,
          infrastructureProjects: ["M1 Pacific Motorway extension", "Williamtown RAAF expansion"],
          demographics: "Families, defence workers, commuters",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Maitland",
          postcode: "2320",
          rationale: "Historic Hunter Valley city experiencing strong growth. Median $450-500k. New hospital, retail precinct. 30min to Newcastle. Yields 5.5-6%.",
          medianHousePrice: 475000,
          medianWeeklyRent: 530,
          grossYield: 5.8,
          vacancyRate: 1.2,
          growthScore: 7,
          yieldScore: 8,
          riskScore: 3,
          infrastructureProjects: ["Maitland Hospital expansion", "Hunter Expressway", "Maitland Levee upgrade"],
          demographics: "Families, healthcare workers, commuters",
          supplyDemand: "undersupplied",
        },
      ],
    },
    from500kTo750k: {
      topPicks: [
        {
          suburb: "Parramatta",
          postcode: "2150",
          rationale: "Sydney's second CBD. Massive government investment. Parramatta Light Rail, Westmead Hospital precinct. Median $650-750k units. Strong rental demand.",
          medianHousePrice: 700000,
          medianWeeklyRent: 720,
          grossYield: 5.3,
          vacancyRate: 1.2,
          growthScore: 8,
          yieldScore: 7,
          riskScore: 2,
          infrastructureProjects: ["Parramatta Light Rail", "Westmead health precinct", "Powerhouse Museum"],
          demographics: "Young professionals, multicultural families",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Penrith",
          postcode: "2750",
          rationale: "Western Sydney gateway. Western Sydney Airport and Aerotropolis. Median $620-720k. Strong population growth. Government investment hub.",
          medianHousePrice: 670000,
          medianWeeklyRent: 650,
          grossYield: 5.0,
          vacancyRate: 1.0,
          growthScore: 9,
          yieldScore: 7,
          riskScore: 2,
          infrastructureProjects: ["Western Sydney Airport", "Sydney Metro Western", "Aerotropolis"],
          demographics: "Young families, tradies, essential workers",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Wollongong",
          postcode: "2500",
          rationale: "Coastal city 80km south of Sydney. University town with growing tech sector. Median $650-750k. Strong lifestyle appeal driving demand.",
          medianHousePrice: 700000,
          medianWeeklyRent: 680,
          grossYield: 5.0,
          vacancyRate: 1.1,
          growthScore: 7,
          yieldScore: 7,
          riskScore: 2,
          infrastructureProjects: ["South Coast rail upgrade", "Wollongong CBD renewal"],
          demographics: "Students, professionals, sea changers",
          supplyDemand: "undersupplied",
        },
      ],
    },
  },
  VIC: {
    under500k: {
      topPicks: [
        {
          suburb: "Melton",
          postcode: "3337",
          rationale: "Fastest growing LGA in Victoria. Rail to Melbourne CBD. Massive residential development. Median $420-500k. Strong rental demand from young families.",
          medianHousePrice: 460000,
          medianWeeklyRent: 520,
          grossYield: 5.9,
          vacancyRate: 1.0,
          growthScore: 7,
          yieldScore: 8,
          riskScore: 3,
          infrastructureProjects: ["Melton rail duplication", "Western Rail Plan", "Melton Health hub"],
          demographics: "Young families, first home buyers",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Ballarat",
          postcode: "3350",
          rationale: "Major regional city. Fast train to Melbourne. Median $400-480k. Growing university and health sector. Consistent yields 5.5-6%.",
          medianHousePrice: 440000,
          medianWeeklyRent: 480,
          grossYield: 5.7,
          vacancyRate: 1.3,
          growthScore: 7,
          yieldScore: 8,
          riskScore: 2,
          infrastructureProjects: ["Ballarat Line upgrade", "Ballarat West employment zone", "Ballarat Base Hospital"],
          demographics: "Families, students, Melbourne commuters",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Geelong",
          postcode: "3220",
          rationale: "Victoria's second city. Major revitalisation. Fast rail to Melbourne. Median $480-560k. Strong employment growth in health, education and tech.",
          medianHousePrice: 520000,
          medianWeeklyRent: 560,
          grossYield: 5.6,
          vacancyRate: 1.1,
          growthScore: 8,
          yieldScore: 7,
          riskScore: 2,
          infrastructureProjects: ["Geelong Fast Rail", "Geelong Arts Precinct", "Deakin University expansion"],
          demographics: "Families, professionals, Melbourne sea changers",
          supplyDemand: "undersupplied",
        },
      ],
    },
    from500kTo750k: {
      topPicks: [
        {
          suburb: "Footscray",
          postcode: "3011",
          rationale: "Inner west Melbourne. Gentrifying rapidly. New Footscray Hospital ($1.5B) — largest in Victorian history. Median $650-750k. Strong rental demand from medical workers.",
          medianHousePrice: 700000,
          medianWeeklyRent: 700,
          grossYield: 5.2,
          vacancyRate: 0.9,
          growthScore: 9,
          yieldScore: 7,
          riskScore: 2,
          infrastructureProjects: ["New Footscray Hospital $1.5B", "West Gate Tunnel", "Footscray precinct renewal"],
          demographics: "Medical workers, young professionals, multicultural community",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Sunshine",
          postcode: "3020",
          rationale: "Western Melbourne hub. Melbourne Airport Rail Link station. Massive government investment. Median $600-700k. Strong gentrification trajectory.",
          medianHousePrice: 650000,
          medianWeeklyRent: 620,
          grossYield: 5.0,
          vacancyRate: 1.0,
          growthScore: 9,
          yieldScore: 7,
          riskScore: 2,
          infrastructureProjects: ["Melbourne Airport Rail Link", "Sunshine Super Hub", "Western Rail Plan"],
          demographics: "Young professionals, multicultural families",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Werribee",
          postcode: "3030",
          rationale: "Western growth corridor. Major employment at Werribee Mercy Hospital and Pacific Werribee. Median $550-650k. Strong family demand. Rail to Melbourne CBD.",
          medianHousePrice: 600000,
          medianWeeklyRent: 580,
          grossYield: 5.0,
          vacancyRate: 0.9,
          growthScore: 7,
          yieldScore: 7,
          riskScore: 2,
          infrastructureProjects: ["Werribee rail upgrade", "Pacific Werribee expansion", "Wyndham Vale growth"],
          demographics: "Young families, essential workers",
          supplyDemand: "undersupplied",
        },
      ],
    },
  },
  WA: {
    under500k: {
      topPicks: [
        {
          suburb: "Armadale",
          postcode: "6112",
          rationale: "South east Perth. Massive government investment in METRONET. Median $380-460k. Strong rental demand. Growing employment corridor.",
          medianHousePrice: 420000,
          medianWeeklyRent: 500,
          grossYield: 6.2,
          vacancyRate: 0.8,
          growthScore: 7,
          yieldScore: 8,
          riskScore: 3,
          infrastructureProjects: ["METRONET Byford extension", "Armadale Line upgrade"],
          demographics: "Families, first home buyers",
          supplyDemand: "undersupplied",
        },
      ],
    },
    from500kTo750k: {
      topPicks: [
        {
          suburb: "Maylands",
          postcode: "6051",
          rationale: "Inner Perth suburb on Swan River. Cafe strip on Eighth Avenue. 5km to Perth CBD. Median $620-720k. Strong rental demand. METRONET rail upgrades.",
          medianHousePrice: 670000,
          medianWeeklyRent: 680,
          grossYield: 5.3,
          vacancyRate: 0.8,
          growthScore: 8,
          yieldScore: 7,
          riskScore: 1,
          infrastructureProjects: ["METRONET Morley-Ellenbrook Line", "Swan River foreshore"],
          demographics: "Young professionals, couples, creatives",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Bayswater",
          postcode: "6053",
          rationale: "Inner Perth on train line. METRONET Bayswater station upgrade. Median $600-700k. Gentrifying rapidly. Close to airport and CBD.",
          medianHousePrice: 650000,
          medianWeeklyRent: 660,
          grossYield: 5.3,
          vacancyRate: 0.7,
          growthScore: 8,
          yieldScore: 7,
          riskScore: 1,
          infrastructureProjects: ["METRONET Bayswater station", "Morley-Ellenbrook Line"],
          demographics: "Young professionals, families",
          supplyDemand: "undersupplied",
        },
      ],
    },
  },
  SA: {
    under500k: {
      topPicks: [
        {
          suburb: "Elizabeth",
          postcode: "5112",
          rationale: "Northern Adelaide. Major urban renewal. Median $320-400k. High yields 6-7%. Lyell McEwin Hospital employment hub.",
          medianHousePrice: 360000,
          medianWeeklyRent: 430,
          grossYield: 6.2,
          vacancyRate: 1.2,
          growthScore: 6,
          yieldScore: 9,
          riskScore: 4,
          infrastructureProjects: ["Elizabeth urban renewal", "Lyell McEwin Hospital expansion"],
          demographics: "Young families, essential workers",
          supplyDemand: "undersupplied",
        },
      ],
    },
    from500kTo750k: {
      topPicks: [
        {
          suburb: "Prospect",
          postcode: "5082",
          rationale: "Inner north Adelaide. Vibrant Prospect Road cafe strip. 4km to CBD. Median $620-700k. Strong capital growth. Tight rental market.",
          medianHousePrice: 660000,
          medianWeeklyRent: 650,
          grossYield: 5.1,
          vacancyRate: 0.7,
          growthScore: 7,
          yieldScore: 6,
          riskScore: 1,
          infrastructureProjects: ["Adelaide Metro upgrade", "Prospect Road streetscape"],
          demographics: "Young professionals, families",
          supplyDemand: "undersupplied",
        },
        {
          suburb: "Unley",
          postcode: "5061",
          rationale: "Inner south Adelaide. Prestigious suburb. King William Road shopping. Median $650-750k. Strong owner occupier demand supports values.",
          medianHousePrice: 700000,
          medianWeeklyRent: 680,
          grossYield: 5.0,
          vacancyRate: 0.8,
          growthScore: 7,
          yieldScore: 6,
          riskScore: 1,
          infrastructureProjects: ["Goodwood Junction upgrade", "Unley Road renewal"],
          demographics: "Families, professionals",
          supplyDemand: "undersupplied",
        },
      ],
    },
  },
  TAS: {
    under500k: {
      topPicks: [
        {
          suburb: "Glenorchy",
          postcode: "7010",
          rationale: "Northern Hobart. Affordable entry to Tasmanian market. Median $400-480k. Strong yields. Growing population.",
          medianHousePrice: 440000,
          medianWeeklyRent: 480,
          grossYield: 5.7,
          vacancyRate: 1.0,
          growthScore: 7,
          yieldScore: 8,
          riskScore: 2,
          infrastructureProjects: ["Hobart Light Rail feasibility", "MONA tourism precinct"],
          demographics: "Families, essential workers",
          supplyDemand: "undersupplied",
        },
      ],
    },
  },
  ACT: {
    from500kTo750k: {
      topPicks: [
        {
          suburb: "Belconnen",
          postcode: "2617",
          rationale: "Major Canberra town centre. University of Canberra. Lake Ginninderra. Median $600-700k. Strong government and education employment.",
          medianHousePrice: 650000,
          medianWeeklyRent: 650,
          grossYield: 5.2,
          vacancyRate: 1.0,
          growthScore: 7,
          yieldScore: 7,
          riskScore: 1,
          infrastructureProjects: ["Belconnen town centre renewal", "Light Rail Stage 2"],
          demographics: "Government workers, students, families",
          supplyDemand: "balanced",
        },
      ],
    },
  },
};

export function getBudgetTier(budget: number): string {
  if (budget <= 500000) return "under500k";
  if (budget <= 750000) return "from500kTo750k";
  if (budget <= 1000000) return "from750kTo1M";
  if (budget <= 1500000) return "from1MTo1_5M";
  return "above1_5M";
}

export function getTopPicksForBudget(state: string, budget: number): SuburbPick[] {
  const stateData = investmentIntelligence[state];
  if (!stateData) return investmentIntelligence.QLD.from500kTo750k.topPicks;

  // Collect ALL suburbs from tiers at or below budget, filtered by actual median price
  const allPicks: SuburbPick[] = [];
  const seen = new Set<string>();

  for (const tier of Object.values(stateData)) {
    for (const pick of tier.topPicks) {
      if (pick.medianHousePrice <= budget * 1.10 && !seen.has(pick.suburb)) {
        seen.add(pick.suburb);
        allPicks.push(pick);
      }
    }
  }

  if (allPicks.length > 0) return allPicks;

  // Fallback: nearest tier
  const tier = getBudgetTier(budget);
  const tierData = stateData[tier];
  if (tierData) return tierData.topPicks;

  const tiers = Object.values(stateData);
  return tiers[0]?.topPicks || investmentIntelligence.QLD.from500kTo750k.topPicks;
}

export function findSuburbPick(suburb: string, state: string): SuburbPick | null {
  const stateData = investmentIntelligence[state];
  if (!stateData) return null;
  for (const tier of Object.values(stateData)) {
    const found = tier.topPicks.find(
      (p) => p.suburb.toLowerCase() === suburb.toLowerCase()
    );
    if (found) return found;
  }
  return null;
}
