export interface PropertyInput {
  address: string;
}

export interface GeocodedProperty {
  address: string;
  lat: number;
  lng: number;
  suburb: string;
  state: string;
  postcode: string;
}

export interface PropertyAnalysis {
  address: string;
  lastSalePrice: number | null;
  lastSaleDate: string | null;
  landSize: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  yearBuilt: number | null;
  priceHistory: { date: string; price: number }[];
  comparables: { address: string; price: number; date: string; distanceM: number }[];
  medianPricePerSqm: number | null;
  trendSummary: string;
}

export interface RiskAnalysis {
  floodRisk: "none" | "low" | "medium" | "high";
  bushfireRisk: "none" | "low" | "medium" | "high";
  zoningCode: string;
  zoningDescription: string;
  hasHeritage: boolean;
  hasEasement: boolean;
  socialHousingPct: number | null;
  riskFlags: { label: string; severity: "green" | "amber" | "red" }[];
  riskSummary: string;
}

export interface InfrastructureAnalysis {
  projects: {
    name: string;
    type: string;
    status: "confirmed" | "under-construction" | "proposed";
    distanceKm: number;
    completionYear: number | null;
  }[];
  supplyDemandSignal: "undersupplied" | "balanced" | "oversupplied";
  daysOnMarket: number | null;
  infrastructureScore: number;
  opportunitySummary: string;
}

export interface YieldAnalysis {
  estimatedWeeklyRent: number | null;
  grossYieldPct: number | null;
  netYieldPct: number | null;
  vacancyRatePct: number | null;
  cashflowWeekly: number | null;
  rentalDemandSummary: string;
}

export interface ValuationAnalysis {
  fairValueLow: number;
  fairValueMid: number;
  fairValueHigh: number;
  askingPrice: number | null;
  vendorExpectationGap: number | null;
  negotiationHeadroomPct: number | null;
  signal: "buy" | "hold" | "avoid";
  investmentThesis: string;
}

export interface FinalReport {
  property: GeocodedProperty;
  analysis: PropertyAnalysis;
  risk: RiskAnalysis;
  infrastructure: InfrastructureAnalysis;
  yield: YieldAnalysis;
  valuation: ValuationAnalysis;
  overallScore: number;
  executiveSummary: string;
  generatedAt: string;
  listingSearchUrl?: string;
  suburbPhotoUrl?: string;
  pipelineMeta?: {
    candidatesFound: number;
    candidatesPassed: number;
    checksRun: string[];
    clientGoal: string;
    rankPosition: number;
    rankTotal: number;
    clientScore: number;
  };
}

export interface MultiPropertyReport {
  recommendedSuburbs: string[];
  suburbReasoning: string;
  properties: FinalReport[];
  generatedAt: string;
}

// Legacy types retained for backwards compatibility
export interface PropertyData {
  address: string;
  suburb: string;
  postcode: string;
  state: string;
  lat?: number;
  lng?: number;
  listingUrl?: string;
  askingPrice?: number;
  raw?: Record<string, unknown>;
}

export interface AgentResult {
  step: string;
  output: Record<string, unknown>;
  error?: string;
}

export interface SynthesisOutput {
  recommendation: string;
  /** Overall investment score out of 100 */
  score: number;
  summary: string;
  results: AgentResult[];
}

export interface AnalyseRequest {
  address: string;
  listingUrl?: string;
  askingPrice?: number;
}

export interface AnalyseResponse {
  synthesis: SynthesisOutput;
  agentResults: AgentResult[];
}
