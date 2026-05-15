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

/**
 * APEX Command Center Navigation Configuration
 * 
 * Each nav item maps to a specific route with exact matching.
 * The active state is determined by exact pathname match.
 */
export const COMMAND_NAV_ITEMS: CommandNavItem[] = [
  { 
    label: "Command Center", 
    href: "/command-center", 
    icon: Command,
    description: "Overview metrics and daily strategic summary"
  },
  { 
    label: "Market Intelligence", 
    href: "/market-intelligence", 
    icon: Building2,
    description: "Buyer intent, area demand, competitor movement, pricing pressure"
  },
  { 
    label: "Lead Intelligence", 
    href: "/lead-intelligence", 
    icon: UserSquare2,
    description: "Lead quality, source purity, conversion tiers, VIP pipeline"
  },
  { 
    label: "Founder Authority", 
    href: "/founder-authority", 
    icon: Activity,
    description: "Trust momentum, prestige index, voice share, narrative penetration"
  },
  { 
    label: "Influence Network", 
    href: "/influence-network", 
    icon: Network,
    description: "Referral nodes, partner influence, network strength, relationship map"
  },
  { 
    label: "Executive Reports", 
    href: "/executive-reports", 
    icon: BarChart3,
    description: "Board-ready summaries, exportable reports, weekly performance narrative"
  },
  { 
    label: "Scenario Simulator", 
    href: "/scenario-simulator", 
    icon: FlaskConical, 
    badge: "AI",
    description: "What-if simulations, budget shifts, content velocity impact, market response"
  },
  { 
    label: "AI Recommendation Engine", 
    href: "/ai-recommendation-engine", 
    icon: BrainCircuit, 
    badge: "CORE",
    description: "Strategic recommendations, risk alerts, and next best actions"
  },
  { 
    label: "Settings", 
    href: "/settings", 
    icon: Settings,
    description: "Workspace, theme, integrations, notification preferences"
  },
];

/**
 * Intelligence Rail Items
 * Live signals displayed in the right panel across all pages
 */
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

/**
 * Helper to get nav item by href
 */
export function getNavItemByHref(href: string): CommandNavItem | undefined {
  return COMMAND_NAV_ITEMS.find(item => item.href === href);
}

/**
 * Helper to get page title by pathname
 */
export function getPageTitle(pathname: string): string {
  const item = COMMAND_NAV_ITEMS.find(item => pathname === item.href);
  return item?.label ?? "APEX Command Center";
}

/**
 * Helper to get page description by pathname
 */
export function getPageDescription(pathname: string): string {
  const item = COMMAND_NAV_ITEMS.find(item => pathname === item.href);
  return item?.description ?? "Strategic intelligence for luxury real estate operations";
}
