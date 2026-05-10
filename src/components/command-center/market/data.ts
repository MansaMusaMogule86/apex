import type {
  CompetitorEvent,
  DistrictMetric,
  ForecastPoint,
  SignalFeedItem,
} from "@/components/command-center/market/types";

export const DISTRICT_DATA: DistrictMetric[] = [
  {
    district: "Palm Jumeirah",
    demandIntensity: 92,
    buyerConcentration: 86,
    luxuryMomentum: 89,
    capitalInflow: 94,
    inventoryPressure: 81,
  },
  {
    district: "DIFC",
    demandIntensity: 88,
    buyerConcentration: 84,
    luxuryMomentum: 91,
    capitalInflow: 87,
    inventoryPressure: 74,
  },
  {
    district: "Dubai Marina",
    demandIntensity: 73,
    buyerConcentration: 68,
    luxuryMomentum: 72,
    capitalInflow: 70,
    inventoryPressure: 66,
  },
  {
    district: "Downtown",
    demandIntensity: 81,
    buyerConcentration: 79,
    luxuryMomentum: 83,
    capitalInflow: 82,
    inventoryPressure: 77,
  },
  {
    district: "Jumeirah Bay",
    demandIntensity: 95,
    buyerConcentration: 91,
    luxuryMomentum: 93,
    capitalInflow: 96,
    inventoryPressure: 88,
  },
  {
    district: "Business Bay",
    demandIntensity: 66,
    buyerConcentration: 62,
    luxuryMomentum: 64,
    capitalInflow: 68,
    inventoryPressure: 58,
  },
];

export const COMPETITOR_EVENTS: CompetitorEvent[] = [
  {
    id: "c1",
    competitor: "Orion Prestige",
    launch: "Waterfront Signature Towers",
    narrativeShift: "From investor yield to scarcity-led prestige story.",
    influencerPartnership: "2 ultra-luxury lifestyle creators onboarded.",
    pricingChange: "+4.1% premium floor",
    attentionVelocity: "+21% WoW",
    riskLevel: "high",
  },
  {
    id: "c2",
    competitor: "Nexa Estates",
    launch: "DIFC Private Residences",
    narrativeShift: "Boardroom-centric positioning targeting family offices.",
    influencerPartnership: "Founder-led podcasts, no celebrity creators.",
    pricingChange: "+1.8% selective",
    attentionVelocity: "+11% WoW",
    riskLevel: "medium",
  },
  {
    id: "c3",
    competitor: "Velour Developments",
    launch: "Marina Skyline Collection",
    narrativeShift: "Shifting to experiential community narratives.",
    influencerPartnership: "3 hospitality influencers contracted.",
    pricingChange: "-1.2% tactical",
    attentionVelocity: "+7% WoW",
    riskLevel: "low",
  },
];

export const SIGNAL_FEED: SignalFeedItem[] = [
  {
    id: "s1",
    type: "anomaly",
    title: "Market anomaly detected",
    insight: "HNWI conversion latency in Palm dropped 18% in 72 hours.",
    confidence: 90,
    action: "Increase concierge follow-up bandwidth immediately.",
    timestamp: "4m ago",
  },
  {
    id: "s2",
    type: "pricing",
    title: "Pricing opportunity",
    insight: "DIFC premium units can absorb +2.9% without quality decay.",
    confidence: 86,
    action: "Apply tiered increase to top two demand segments.",
    timestamp: "12m ago",
  },
  {
    id: "s3",
    type: "undervalued",
    title: "Undervalued district",
    insight: "Select Marina assets are under-indexed versus intent heat.",
    confidence: 82,
    action: "Deploy targeted narrative to unlock suppressed demand.",
    timestamp: "23m ago",
  },
  {
    id: "s4",
    type: "migration",
    title: "Prestige migration trend",
    insight: "Founder-led investors moving attention from Downtown to DIFC cluster.",
    confidence: 88,
    action: "Reweight district campaign allocations by 9% toward DIFC.",
    timestamp: "39m ago",
  },
  {
    id: "s5",
    type: "investor",
    title: "Investor movement pattern",
    insight: "London and Zurich corridors showing synchronized capital inflow spikes.",
    confidence: 84,
    action: "Activate cross-border broker pods for these geographies.",
    timestamp: "1h ago",
  },
];

export const FORECAST_DATA: ForecastPoint[] = [
  { label: "W1", baseline: 62, forecast30: 66, forecast90: 69, forecast180: 72, riskLower: 58, riskUpper: 76 },
  { label: "W2", baseline: 64, forecast30: 69, forecast90: 73, forecast180: 77, riskLower: 60, riskUpper: 80 },
  { label: "W3", baseline: 67, forecast30: 72, forecast90: 77, forecast180: 81, riskLower: 62, riskUpper: 84 },
  { label: "W4", baseline: 70, forecast30: 76, forecast90: 81, forecast180: 86, riskLower: 65, riskUpper: 89 },
  { label: "W5", baseline: 73, forecast30: 79, forecast90: 85, forecast180: 90, riskLower: 67, riskUpper: 93 },
  { label: "W6", baseline: 76, forecast30: 82, forecast90: 88, forecast180: 94, riskLower: 69, riskUpper: 97 },
];

export const SIMULATION_SCENARIOS = [
  {
    id: "base",
    name: "Base Case",
    description: "Current momentum and capital inflow assumptions.",
    uplift: "+8.2%",
    risk: "0.22",
  },
  {
    id: "aggressive",
    name: "Aggressive Prestige",
    description: "Higher founder narrative cadence and selective price lift.",
    uplift: "+14.9%",
    risk: "0.31",
  },
  {
    id: "defensive",
    name: "Defensive Allocation",
    description: "Risk-prioritized spend control under competitor pressure.",
    uplift: "+4.7%",
    risk: "0.14",
  },
] as const;
