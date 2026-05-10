export type BuyerSegment =
  | "Sovereign Capital"
  | "Legacy Wealth"
  | "Prestige Lifestyle"
  | "Yield Strategists"
  | "Relocation Elites";

export type PriorityLevel = "critical" | "high" | "medium" | "watch";

export type LeadRow = {
  id: string;
  buyerName: string;
  segment: BuyerSegment;
  intentScore: number;
  prestigeScore: number;
  brokerAssignment: string;
  probabilityToClose: number;
  lastInteraction: string;
  aiPriorityLevel: PriorityLevel;
  conversationQuality: number;
  responseLatencyMin: number;
  emotionalSentiment: number;
  conversionContribution: number;
};

export type IntentPoint = {
  label: string;
  intentTrend: number;
  attentionDepth: number;
  conversionReadiness: number;
  trustAlignment: number;
  urgencyMomentum: number;
};

export type ActionRecommendation = {
  id: string;
  action: "Reassign broker" | "Trigger concierge outreach" | "Deploy founder content" | "Schedule appointment" | "Increase luxury trust touchpoints";
  leadName: string;
  confidence: number;
  impact: string;
  eta: string;
};
