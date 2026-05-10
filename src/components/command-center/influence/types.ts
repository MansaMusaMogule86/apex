export type Platform = "Instagram" | "YouTube" | "LinkedIn" | "X" | "Podcast";

export type RiskLevel = "low" | "medium" | "high";

export type InfluenceCluster = "Elite Finance" | "Luxury Lifestyle" | "Cultural Authority" | "HNWI Mobility";

export type CreatorRow = {
  id: string;
  creator: string;
  platform: Platform;
  prestigeScore: number;
  audienceWealthDensity: number;
  luxuryAlignment: number;
  conversionGravity: number;
  trustTransferPotential: number;
  influenceYield: number;
  narrativeCategory: string;
  riskLevel: RiskLevel;
  cluster: InfluenceCluster;
  aiPriority: number;
};

export type InfluenceKpi = {
  id: string;
  label: string;
  value: string;
  deltaPct: number;
  confidence: number;
  momentum: "accelerating" | "stable" | "cooling";
  commentary: string;
  sparkline: { x: string; y: number }[];
};

export type AudiencePoint = {
  label: string;
  wealthConcentration: number;
  hnwiOverlap: number;
  luxuryBehavior: number;
  culturalPositioning: number;
  prestigeMigration: number;
  attentionDensity: number;
};

export type DistrictHeat = {
  district: string;
  luxuryAttention: number;
  prestigeConcentration: number;
  movement: number;
  creatorTerritory: number;
};

export type TrustTransferPoint = {
  label: string;
  trustCompatibility: number;
  brandSafety: number;
  reputationAlignment: number;
  sentimentStability: number;
  authorityCrossover: number;
  prestigeCompatibility: number;
};

export type Recommendation = {
  id: string;
  action: string;
  confidence: number;
  impact: string;
  priority: "critical" | "high" | "medium";
};

export type CulturalPoint = {
  label: string;
  narrativeShift: number;
  trendAcceleration: number;
  prestigeMigration: number;
  audienceEvolution: number;
  influenceSpikes: number;
};

export type ExecutiveRailSignal = {
  id: string;
  type: "risk" | "anomaly" | "volatility" | "competitor" | "conflict" | "trend";
  title: string;
  body: string;
  timestamp: string;
};
