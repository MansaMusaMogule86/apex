export type DomainArea =
  | "luxury-market"
  | "founder-authority"
  | "influence-system"
  | "lead-intelligence"
  | "prestige-stability"
  | "revenue-acceleration"
  | "market-positioning"
  | "executive-risk";

export type SignalSource =
  | "founder-authority"
  | "lead-intelligence"
  | "influence-network"
  | "market-intelligence"
  | "competitor-movement"
  | "sentiment-shift"
  | "conversion-change"
  | "audience-migration"
  | "prestige-volatility"
  | "executive-engagement";

export type RecommendationType =
  | "founder-narrative"
  | "luxury-positioning"
  | "influence-deployment"
  | "hnwi-optimization"
  | "prestige-mitigation"
  | "investor-messaging"
  | "creator-partnership"
  | "revenue-acceleration"
  | "competitive-response"
  | "strategic-timing";

export type RiskLevel = "low" | "moderate" | "high" | "critical";
export type EscalationState = "normal" | "watch" | "escalated" | "urgent";

export type SignalEvent = {
  id: string;
  source: SignalSource;
  area: DomainArea;
  magnitude: number;
  direction: "up" | "down" | "volatile";
  velocity: number;
  trust: number;
  createdAt: string;
  note: string;
};

export type AggregatedSignal = {
  source: SignalSource;
  weightedStrength: number;
  anomalyProbability: number;
  confidenceStability: number;
  trend: "favorable" | "neutral" | "adverse";
};

export type RecommendationScore = {
  confidence: number;
  strategicImpact: number;
  revenueImpact: number;
  prestigeImpact: number;
  riskLevel: RiskLevel;
  timeSensitivity: number;
  executionComplexity: number;
  outcomeWindow: string;
  priorityIndex: number;
};

export type RecommendationEvidence = {
  source: SignalSource;
  statement: string;
  weight: number;
};

export type Recommendation = {
  id: string;
  title: string;
  summary: string;
  reasoning: string;
  type: RecommendationType;
  area: DomainArea;
  suggestedActions: string[];
  forecastOutcome: string;
  urgency: string;
  escalationState: EscalationState;
  supportingEvidence: RecommendationEvidence[];
  score: RecommendationScore;
  createdAt: string;
  invalidated?: boolean;
};

export type AgentName =
  | "Market Intelligence Agent"
  | "Founder Authority Agent"
  | "Influence Strategy Agent"
  | "Prestige Risk Agent"
  | "Revenue Optimization Agent"
  | "Competitor Intelligence Agent"
  | "Narrative Strategy Agent"
  | "Executive Decision Agent";

export type AgentSpec = {
  name: AgentName;
  inputs: string[];
  outputs: string[];
  responsibilities: string[];
  triggerConditions: string[];
  coordinationFlows: string[];
  escalationLogic: string[];
};

export type RecommendationMemory = {
  executiveInteractions: string[];
  strategicHistory: string[];
  recommendationOutcomes: string[];
  organizationMemory: string[];
  prestigeTrajectory: string[];
  narrativeEvolution: string[];
};

export type EngineMode = "streaming" | "snapshot";

export type OrchestrationState = {
  mode: EngineMode;
  queueDepth: number;
  eventRate: number;
  suppressionCount: number;
  dedupeCount: number;
  contradictionResolutions: number;
  invalidations: number;
};

export type ExecutiveRailSignal = {
  id: string;
  title: string;
  body: string;
  severity: "opportunity" | "threat" | "instability";
  confidenceDrift: number;
};
