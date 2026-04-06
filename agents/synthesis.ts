import {
  GeocodedProperty,
  PropertyAnalysis,
  RiskAnalysis,
  InfrastructureAnalysis,
  YieldAnalysis,
  ValuationAnalysis,
} from "@/types";
import { askClaude } from "@/lib/claude";
import {
  querySuburbs,
  MARKET_FUNDAMENTALS,
  QLD_INFRASTRUCTURE_PIPELINE,
  INTERSTATE_MIGRATION_DATA,
  getInfrastructureByState,
  type State,
  type SuburbProfile,
} from "@/lib/investors-handbook";
import { findSuburbPick } from "@/lib/investment-intelligence";
import { getInsightsForSuburb, getLatestSentiment } from "@/lib/research-cache";

const SYSTEM_PROMPT =
  "You are a senior Australian property investment analyst with access to: " +
  "daily market intelligence from 50+ Australian property sources, " +
  "real-time news sentiment analysis, council development application monitoring, " +
  "government infrastructure pipeline data, economic indicator tracking, " +
  "and demographic and migration data. " +
  "You will be given the full outputs of five specialist analysis agents PLUS curated market research " +
  "from the Yardscore Investors Handbook — including suburb profiles, infrastructure data, migration trends, " +
  "and market fundamentals. " +
  "When writing investment recommendations reference specific current intelligence where available. " +
  "If there are recent news items or infrastructure announcements affecting the suburb mention them specifically. " +
  "If there are DA applications or rezoning proposals nearby flag these as either opportunities or risks. " +
  "Return ONLY a valid JSON object with exactly two keys: " +
  '"overallScore" (a number from 1 to 10) and "executiveSummary" (a string). ' +
  "overallScore must reflect the overall investment quality: weight valuation signal (30%), " +
  "yield (25%), risk (25%), and infrastructure (20%). Penalise red risk flags heavily. " +
  "executiveSummary must be 3-4 paragraphs covering: " +
  "(1) property overview and market context — reference specific data points like annual growth %, vacancy rate, days on market from the research data, " +
  "(2) key risks and any red or amber flags, " +
  "(3) income potential and yield outlook — cite specific yield figures, rental estimates, and cashflow projections, " +
  "(4) investment recommendation with clear buy/hold/avoid reasoning — reference infrastructure projects, migration trends, and supply/demand dynamics from the handbook data. " +
  "Use specific numbers and data points from the provided research to justify your recommendation. " +
  "No markdown, no explanation outside the JSON, just the JSON object.";

export async function synthesise(
  property: GeocodedProperty,
  analysis: PropertyAnalysis,
  risk: RiskAnalysis,
  infrastructure: InfrastructureAnalysis,
  yieldData: YieldAnalysis,
  valuation: ValuationAnalysis
): Promise<{ overallScore: number; executiveSummary: string }> {
  // Look up handbook data for this suburb
  const handbookSuburbs = querySuburbs({ state: property.state as State });
  const suburbProfile = handbookSuburbs.find(
    (s) => s.suburb.toLowerCase() === property.suburb.toLowerCase()
  );

  // Look up intelligence data
  const intelligencePick = findSuburbPick(property.suburb, property.state);

  // Get infrastructure pipeline for the state
  const stateInfra = getInfrastructureByState(property.state as State);

  // Get recent research insights for this suburb
  const recentInsights = getInsightsForSuburb(property.suburb, property.state);
  const marketSentiment = getLatestSentiment();

  // Get key migration data
  const migrationContext = INTERSTATE_MIGRATION_DATA;

  // Get top market fundamentals
  const supplyShortage = MARKET_FUNDAMENTALS.priceGrowthDrivers.find(
    (d) => d.driver.includes("Supply")
  );
  const migrationDriver = MARKET_FUNDAMENTALS.priceGrowthDrivers.find(
    (d) => d.driver.includes("Migration")
  );

  const userContent = JSON.stringify(
    {
      address: property.address,
      suburb: property.suburb,
      state: property.state,
      propertyAnalysis: analysis,
      riskAnalysis: risk,
      infrastructureAnalysis: infrastructure,
      yieldAnalysis: yieldData,
      valuationAnalysis: valuation,
      // Yardscore research data
      handbookResearch: {
        suburbProfile: suburbProfile
          ? {
              annualGrowth: suburbProfile.annualGrowthPercent + "%",
              fiveYearGrowth: suburbProfile.fiveYearGrowthPercent ? suburbProfile.fiveYearGrowthPercent + "%" : null,
              grossYield: suburbProfile.grossRentalYield ? suburbProfile.grossRentalYield + "%" : null,
              vacancyRate: suburbProfile.vacancyRate ? suburbProfile.vacancyRate + "%" : null,
              daysOnMarket: suburbProfile.daysOnMarket,
              keyDrivers: suburbProfile.keyDrivers,
              risks: suburbProfile.risks,
              infrastructureNearby: suburbProfile.infrastructureNearby,
              notes: suburbProfile.notes,
            }
          : null,
        intelligenceData: intelligencePick
          ? {
              medianHousePrice: "$" + intelligencePick.medianHousePrice.toLocaleString(),
              medianWeeklyRent: "$" + intelligencePick.medianWeeklyRent,
              grossYield: intelligencePick.grossYield + "%",
              vacancyRate: intelligencePick.vacancyRate + "%",
              supplyDemand: intelligencePick.supplyDemand,
              demographics: intelligencePick.demographics,
              infrastructureProjects: intelligencePick.infrastructureProjects,
            }
          : null,
        stateInfrastructurePipeline: stateInfra.slice(0, 3).map((p) => ({
          name: p.name,
          type: p.type,
          value: p.investmentValue,
          completion: p.estimatedCompletion,
          priceImpact: p.expectedPriceImpact,
        })),
        migrationTrends: {
          qldNetInterstateMigration: migrationContext.summary2024_2025.qldNetMigration,
          nswNetLoss: migrationContext.summary2024_2025.nswNetLoss,
          keyInsight: migrationContext.keyInsight,
          nationalContext: migrationDriver?.explanation.slice(0, 200),
        },
        supplyContext: supplyShortage?.explanation.slice(0, 200),
      },
      // Live research intelligence
      liveResearch: {
        recentInsights: recentInsights.slice(0, 5).map((i) => ({
          title: i.title,
          summary: i.summary,
          urgency: i.urgency,
          impact: i.impact,
          category: i.category,
        })),
        marketSentiment: marketSentiment
          ? {
              overall: marketSentiment.overallSentiment,
              score: marketSentiment.sentimentScore,
              interestRates: marketSentiment.interestRateOutlook,
              supply: marketSentiment.housingSupplyOutlook,
              demand: marketSentiment.demandOutlook,
              keyThemes: marketSentiment.keyThemes,
              opportunities: marketSentiment.opportunities,
              policyRisks: marketSentiment.policyRisks,
            }
          : null,
      },
    },
    null,
    2
  );

  const response = await askClaude(SYSTEM_PROMPT, userContent);

  const parsed = JSON.parse(response) as { overallScore: number; executiveSummary: string };
  return parsed;
}
