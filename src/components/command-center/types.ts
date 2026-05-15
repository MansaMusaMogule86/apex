import type { LucideIcon } from "lucide-react";

export type CommandNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
};

export type RightRailItem = {
  id: string;
  title: string;
  body: string;
  severity: "opportunity" | "risk" | "signal";
  timestamp: string;
};

export type CommandTheme = "obsidian" | "carbon";

// Page section types for AI Recommendation Engine
export type RecommendationCard = {
  id: string;
  type: "high-impact" | "medium-risk" | "fast-win";
  recommendation: string;
  reason: string;
  expectedImpact: string;
  confidence: number;
  suggestedAction: string;
};

export type RiskAlertItem = {
  id: string;
  severity: "P1" | "P2" | "P3" | "P4";
  title: string;
  description: string;
  timestamp: string;
  autoResolve: boolean;
  resolved?: boolean;
};

export type DecisionQueueItem = {
  id: string;
  action: string;
  context: string;
  impact: string;
  status: "pending" | "approved" | "dismissed" | "simulated";
};

export type IntelligenceRailSignal = {
  id: string;
  type: "market" | "risk" | "insight" | "competitor" | "recommendation";
  title: string;
  body: string;
  timestamp: string;
  severity: "opportunity" | "risk" | "signal";
};
