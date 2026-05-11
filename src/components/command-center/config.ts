import {
  Activity,
  BarChart3,
  BrainCircuit,
  Building2,
  Command,
  FlaskConical,
  Network,
  Settings,
  UserSquare2,
} from "lucide-react";
import type { CommandNavItem, RightRailItem } from "@/components/command-center/types";

export const COMMAND_NAV_ITEMS: CommandNavItem[] = [
  { label: "Command Center", href: "/dashboard", icon: Command },
  { label: "Market Intelligence", href: "/dashboard/analytics", icon: Building2 },
  { label: "Lead Intelligence", href: "/dashboard/leads", icon: UserSquare2 },
  { label: "Founder Authority", href: "/dashboard/founder-authority", icon: Activity },
  { label: "Influence Network", href: "/dashboard/influencers", icon: Network },
  { label: "Executive Reports", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Scenario Simulator", href: "/dashboard/scenario-simulator", icon: FlaskConical, badge: "AI" },
  { label: "AI Recommendation Engine", href: "/dashboard/ai", icon: BrainCircuit, badge: "CORE" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const RIGHT_RAIL_ITEMS: RightRailItem[] = [
  {
    id: "r1",
    title: "AI recommendation",
    body: "Shift 14% of Palm inventory promotion budget to DIFC founder-led narratives.",
    severity: "opportunity",
    timestamp: "3m ago",
  },
  {
    id: "r2",
    title: "Risk alert",
    body: "Lead purity from external referral channel dropped 11.2% in last 48h.",
    severity: "risk",
    timestamp: "9m ago",
  },
  {
    id: "r3",
    title: "Market signal",
    body: "Jumeirah Bay buyer intent intensity crossed premium threshold (91.4).",
    severity: "signal",
    timestamp: "18m ago",
  },
  {
    id: "r4",
    title: "Competitor anomaly",
    body: "New waterfront campaign from competitor cluster C detected. Sentiment neutral.",
    severity: "risk",
    timestamp: "31m ago",
  },
  {
    id: "r5",
    title: "Executive insight",
    body: "Founder content velocity correlates with +22% meeting conversion in VIP tier.",
    severity: "opportunity",
    timestamp: "1h ago",
  },
];
