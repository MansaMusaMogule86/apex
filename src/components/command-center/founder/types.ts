export type FounderKpi = {
  id: string;
  label: string;
  value: string;
  deltaPct: number;
  confidence: number;
  momentum: "accelerating" | "stable" | "cooling";
  commentary: string;
  sparkline: { x: string; y: number }[];
};

export type NarrativeSignal = {
  id: string;
  narrative: string;
  velocity: number;
  trustLift: number;
  conversionLift: number;
  investorConfidence: number;
  prestigeAmplification: number;
};

export type VoiceShareEntry = {
  name: string;
  founderShare: number;
  competitorShare: number;
  overlap: number;
  migration: number;
};

export type TrustPoint = {
  label: string;
  trustVolatility: number;
  reputationRisk: number;
  sentiment: number;
  positioning: number;
  hnwiQuality: number;
};

export type StrategyRecommendation = {
  id: string;
  action: string;
  confidence: number;
  impact: string;
  priority: "critical" | "high" | "medium";
};

export type ContentIntel = {
  id: string;
  title: string;
  trustScore: number;
  authorityConversion: number;
  engagementQuality: number;
  appointments: number;
  investorSignal: string;
};

export type ExecutiveRailItem = {
  id: string;
  type: "risk" | "anomaly" | "sentiment" | "reaction" | "competitor";
  title: string;
  body: string;
  timestamp: string;
};
