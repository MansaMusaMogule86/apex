"use client";

import { useState } from "react";
import {
  Bell,
  Bot,
  ChevronDown,
  Command,
  Film,
  Menu,
  PanelRightOpen,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import { useCommandCenterShell } from "@/components/command-center/ShellContext";
import { useExecutiveDemoMode } from "@/components/command-center/demo/ExecutiveDemoModeProvider";
import { useLiveIntelligenceStore } from "@/stores/live-intelligence-store";
import ApexConciergePanel from "@/components/command-center/ApexConciergePanel";

const ORGANIZATIONS = ["Maison Atelier", "Apex Developments", "Noor Holdings"];

export default function CommandCenterTopBar() {
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const { setMobileSidebarOpen, setMobileRailOpen, theme, setTheme } = useCommandCenterShell();
  const {
    enabled: demoModeEnabled,
    autoplay,
    phase,
    activeScenario,
    toggleEnabled,
    toggleAutoplay,
  } = useExecutiveDemoMode();
  const [org, setOrg] = useState(ORGANIZATIONS[0]);
  const connection = useLiveIntelligenceStore((state) => state.connection);
  const liveAlertsCount = useLiveIntelligenceStore((state) => state.alerts.length);
  const presence = useLiveIntelligenceStore((state) => state.presence);
  const onlineUsers = Object.values(presence).reduce((sum, row) => sum + row.onlineUsers, 0);

  const streamTone =
    connection.state === "connected"
      ? "bg-signal-blue"
      : connection.state === "degraded"
        ? "bg-risk-amber"
        : connection.state === "offline"
          ? "bg-critical-crimson"
          : "bg-titanium";

  return (
    <>
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-white/12 bg-[var(--cc-surface)] px-3 backdrop-blur-xl md:gap-3 md:px-6">
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-[2px] border border-white/15 text-titanium xl:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <button
        type="button"
        className="group flex min-w-0 max-w-[520px] flex-1 items-center gap-2 rounded-[2px] border border-white/15 bg-void/50 px-3 py-2 text-left"
        data-cursor="interactive"
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-mist group-hover:text-signal-blue" />
        <span className="flex-1 truncate text-xs text-mist sm:text-sm">Search operators, properties, signals...</span>
        <kbd className="hidden items-center gap-1 rounded-[2px] border border-white/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mist sm:inline-flex">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <div className="ml-auto hidden items-center gap-2 lg:flex">
        <span className="inline-flex items-center gap-2 rounded-[2px] border border-signal-blue/30 bg-signal-blue/[0.1] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-signal-blue">
          <span className={`h-1.5 w-1.5 rounded-full ${streamTone}`} /> Stream {connection.state}
        </span>
        <span className="inline-flex items-center gap-2 rounded-[2px] border border-white/15 bg-void/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium">
          Presence {onlineUsers}
        </span>
        <span className="inline-flex items-center gap-2 rounded-[2px] border border-white/15 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-platinum/90">
          Demo {phase}
        </span>
        <button
          type="button"
          onClick={() => {
            const cycle: Record<string, "obsidian" | "carbon" | "light"> = {
              obsidian: "carbon",
              carbon: "light",
              light: "obsidian",
            };
            setTheme(cycle[theme] ?? "obsidian");
          }}
          className="inline-flex h-8 items-center gap-2 rounded-[2px] border border-white/15 px-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium hover:border-white/30 hover:text-warm-white transition-colors"
          data-cursor="interactive"
          title={`Switch theme`}
        >
          <span
            className="h-2 w-2 rounded-full shrink-0 transition-colors duration-300"
            style={{
              backgroundColor:
                theme === "obsidian"
                  ? "rgba(110,140,255,0.9)"
                  : theme === "carbon"
                  ? "rgba(200,169,110,0.9)"
                  : "rgba(180,160,120,0.9)",
            }}
          />
          {theme === "obsidian" ? "Obsidian" : theme === "carbon" ? "Carbon" : "Light"}
        </button>
        <button
          type="button"
          onClick={toggleEnabled}
          className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-white/15 px-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-platinum/90"
          data-cursor="interactive"
        >
          <Film className="h-3.5 w-3.5" />
          {demoModeEnabled ? "Demo on" : "Demo off"}
        </button>
        <button
          type="button"
          onClick={toggleAutoplay}
          className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-white/15 px-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium"
          data-cursor="interactive"
        >
          <Play className="h-3.5 w-3.5" />
          {autoplay ? "Autoplay on" : "Autoplay off"}
        </button>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <button type="button" className="inline-flex h-10 min-w-0 max-w-[220px] items-center gap-2 rounded-[2px] border border-white/15 px-3 text-sm text-warm-white">
          <span className="truncate">{org}</span>
          <ChevronDown className="h-3.5 w-3.5 text-titanium" />
        </button>
        <button
          type="button"
          onClick={() => setOrg((prev) => ORGANIZATIONS[(ORGANIZATIONS.indexOf(prev) + 1) % ORGANIZATIONS.length])}
          className="rounded-[2px] border border-white/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium"
        >
          Switch
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden rounded-[2px] border border-white/15 bg-void/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-titanium md:inline-flex">
          {activeScenario.label}
        </span>
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-white/15 text-titanium"
          data-cursor="interactive"
        >
          <Bell className="h-4 w-4" />
          {liveAlertsCount ? (
            <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-risk-amber px-1 text-[9px] font-mono text-void">
              {Math.min(9, liveAlertsCount)}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setConciergeOpen(true)}
          className="hidden h-10 items-center gap-2 rounded-[2px] border border-gold/30 bg-gold/[0.08] px-3 text-[11px] uppercase tracking-[0.18em] text-gold md:inline-flex hover:bg-gold/20 transition-colors"
          data-cursor="interactive"
        >
          <Sparkles className="h-3.5 w-3.5" /> Run Command
        </button>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[2px] border border-white/15 text-platinum xl:hidden"
          onClick={() => setMobileRailOpen(true)}
        >
          <PanelRightOpen className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setConciergeOpen((v) => !v)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[2px] border border-gold/25 bg-gold/[0.06] text-gold transition-colors hover:bg-gold/[0.14]"
          data-cursor="interactive"
          aria-label="Open APEX Concierge"
          title="APEX Concierge"
        >
          <Bot className="h-4 w-4" />
        </button>
      </div>
    </header>

    <ApexConciergePanel open={conciergeOpen} onClose={() => setConciergeOpen(false)} />
    </>
  );
}
