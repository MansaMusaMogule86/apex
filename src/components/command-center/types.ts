import type { LucideIcon } from "lucide-react";

export type CommandNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type RightRailItem = {
  id: string;
  title: string;
  body: string;
  severity: "opportunity" | "risk" | "signal";
  timestamp: string;
};

export type CommandTheme = "obsidian" | "carbon";
