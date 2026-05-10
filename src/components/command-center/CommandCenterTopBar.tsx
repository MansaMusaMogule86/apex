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

const ORGANIZATIONS = ["Maison Atelier", "Apex Developments", "Noor Holdings"];

export default function CommandCenterTopBar() {
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
      ? "bg-emerald-400"
      : connection.state === "degraded"
        ? "bg-amber-400"
        : connection.state === "offline"
          ? "bg-rose-400"
          : "bg-gold";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-gold/10 bg-[var(--cc-surface)] px-4 backdrop-blur-xl md:px-6">
      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-gold/15 text-titanium xl:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <button
        type="button"
        className="group flex max-w-[520px] flex-1 items-center gap-3 rounded-[2px] border border-gold/15 bg-void/40 px-3 py-2 text-left"
        data-cursor="interactive"
      >
        <Search className="h-3.5 w-3.5 text-mist group-hover:text-gold" />
        <span className="flex-1 text-sm text-mist">Search operators, properties, signals...</span>
        <kbd className="inline-flex items-center gap-1 rounded-[2px] border border-gold/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <div className="ml-auto hidden items-center gap-2 lg:flex">
        <span className="inline-flex items-center gap-2 rounded-[2px] border border-gold/20 bg-gold/[0.08] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold-light">
          <span className={`h-1.5 w-1.5 rounded-full ${streamTone}`} /> Stream {connection.state}
        </span>
        <span className="inline-flex items-center gap-2 rounded-[2px] border border-white/15 bg-void/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium">
          Presence {onlineUsers}
        </span>
        <span className="inline-flex items-center gap-2 rounded-[2px] border border-gold/20 bg-gold/[0.08] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-gold-light">
          Demo {phase}
        </span>
        <button
          type="button"
          onClick={() => setTheme(theme === "obsidian" ? "carbon" : "obsidian")}
          className="inline-flex h-8 items-center rounded-[2px] border border-white/15 px-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-titanium"
          data-cursor="interactive"
        >
          Theme
        </button>
        <button
          type="button"
          onClick={toggleEnabled}
          className="inline-flex h-8 items-center gap-1.5 rounded-[2px] border border-gold/20 px-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold-light"
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
        <button type="button" className="inline-flex h-9 items-center gap-2 rounded-[2px] border border-white/15 px-3 text-sm text-warm-white">
          {org}
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
            <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-mono text-void">
              {Math.min(9, liveAlertsCount)}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          className="hidden h-9 items-center gap-2 rounded-[2px] border border-gold/20 px-3 text-[11px] uppercase tracking-[0.18em] text-gold md:inline-flex"
          data-cursor="interactive"
        >
          <Sparkles className="h-3.5 w-3.5" /> Run Command
        </button>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-gold/20 text-gold xl:hidden"
          onClick={() => setMobileRailOpen(true)}
        >
          <PanelRightOpen className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-white/15 text-titanium"
          data-cursor="interactive"
        >
          <Bot className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
