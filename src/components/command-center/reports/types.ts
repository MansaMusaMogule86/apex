export type ReportCategory =
  | "Luxury Market Intelligence Reports"
  | "Founder Authority Reports"
  | "Influence Intelligence Reports"
  | "Lead Conversion Intelligence Reports"
  | "Competitor Intelligence Reports"
  | "Prestige Risk Reports"
  | "Narrative Intelligence Reports"
  | "Executive Strategy Briefings";

export type ImpactLevel = "critical" | "high" | "medium";

export type RiskLevel = "low" | "medium" | "high";

export type DecisionPriority = "Immediate" | "This Week" | "Monitor";

export type ExecutiveAudience = "Founder Office" | "Board" | "C-Suite" | "Strategy Pod";

export type ReportKpi = {
  id: string;
  label: string;
  value: string;
  deltaPct: number;
  confidence: number;
  momentum: "accelerating" | "stable" | "cooling";
  commentary: string;
  sparkline: { x: string; y: number }[];
};

export type ReportCard = {
  id: string;
  title: string;
  category: ReportCategory;
  confidence: number;
  executiveImpact: ImpactLevel;
  summary: string;
  risk: RiskLevel;
  suggestedActions: string[];
  generatedAt: string;
  decisionPriority: DecisionPriority;
  executiveAudience: ExecutiveAudience;
};

export type ForecastPoint = {
  label: string;
  baseline: number;
  projected: number;
  riskLower: number;
  riskUpper: number;
};

export type EvidenceItem = {
  id: string;
  source: string;
  detail: string;
  confidence: number;
};

export type TimelineEvent = {
  id: string;
  label: string;
  type: "market" | "founder" | "influence" | "competitor" | "audience" | "inflection";
  severity: "high" | "medium" | "low";
  timestamp: string;
  note: string;
};

export type ExecutiveSignal = {
  id: string;
  type: "risk" | "anomaly" | "prestige" | "competitor" | "narrative" | "volatility";
  title: string;
  body: string;
  timestamp: string;
};
