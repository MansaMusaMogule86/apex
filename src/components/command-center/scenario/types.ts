export type ScenarioKpi = {
  id: string;
  label: string;
  value: string;
  deltaPct: number;
  confidence: number;
  momentum: "accelerating" | "stable" | "cooling";
  commentary: string;
  sparkline: { x: string; y: number }[];
};

export type ScenarioPreset = {
  id: string;
  name: string;
  description: string;
  aggression: number;
  riskTolerance: number;
  capitalAllocation: number;
  influenceBudget: number;
  founderContent: number;
  luxuryPositioning: number;
  influencerDeployment: number;
  prActivation: number;
  investorMessaging: number;
  geographicExpansion: number;
  pricingChange: number;
  narrativeFraming: number;
};

export type SimulationControls = {
  founderContent: number;
  luxuryPositioning: number;
  influencerDeployment: number;
  prActivation: number;
  investorMessaging: number;
  geographicExpansion: number;
  pricingChange: number;
  narrativeFraming: number;
  aggression: number;
  riskTolerance: number;
  capitalAllocation: number;
  influenceBudget: number;
  timeline: "7d" | "30d" | "90d" | "180d" | "long";
};

export type ForecastPoint = {
  label: string;
  revenue: number;
  prestige: number;
  trust: number;
  influence: number;
  marketPenetration: number;
  investorConfidence: number;
  luxuryMovement: number;
  competitorResponse: number;
};

export type CompetitorResponse = {
  id: string;
  vector: string;
  probability: number;
  severity: "low" | "medium" | "high";
  implication: string;
};

export type Recommendation = {
  id: string;
  action: string;
  confidence: number;
  impact: string;
  priority: "critical" | "high" | "medium";
};

export type TimelineSignal = {
  id: string;
  horizon: "7d" | "30d" | "90d" | "180d" | "long";
  label: string;
  note: string;
  severity: "low" | "medium" | "high";
};

export type ExecutiveRailSignal = {
  id: string;
  type: "risk" | "instability" | "volatility" | "confidence" | "escalation" | "narrative" | "saturation";
  title: string;
  body: string;
  timestamp: string;
};
