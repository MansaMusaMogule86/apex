export type KpiMetric = {
  id: string;
  label: string;
  value: string;
  deltaPct: number;
  confidence: number;
  commentary: string;
  sparkline: { x: string; y: number }[];
};

export type Recommendation = {
  id: string;
  title: string;
  summary: string;
  expectedUplift: string;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  actionOwner: string;
  timeline: string;
  suggestedAction: string;
};

export type AlertItem = {
  id: string;
  type: "risk" | "sentiment" | "lead" | "competitor" | "market";
  title: string;
  body: string;
  severity: "P1" | "P2" | "P3";
  timestamp: string;
};
