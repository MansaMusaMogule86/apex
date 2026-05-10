export type DistrictMetric = {
  district: string;
  demandIntensity: number;
  buyerConcentration: number;
  luxuryMomentum: number;
  capitalInflow: number;
  inventoryPressure: number;
};

export type CompetitorEvent = {
  id: string;
  competitor: string;
  launch: string;
  narrativeShift: string;
  influencerPartnership: string;
  pricingChange: string;
  attentionVelocity: string;
  riskLevel: "low" | "medium" | "high";
};

export type SignalFeedItem = {
  id: string;
  type: "anomaly" | "pricing" | "undervalued" | "migration" | "investor";
  title: string;
  insight: string;
  confidence: number;
  action: string;
  timestamp: string;
};

export type ForecastPoint = {
  label: string;
  baseline: number;
  forecast30: number;
  forecast90: number;
  forecast180: number;
  riskLower: number;
  riskUpper: number;
};
