"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Radar, X } from "lucide-react";
import { RIGHT_RAIL_ITEMS } from "@/components/command-center/config";
import { useExecutiveDemoMode } from "@/components/command-center/demo/ExecutiveDemoModeProvider";
import { COMMAND_EASE, panelReveal } from "@/components/command-center/motion";
import { useCommandCenterShell } from "@/components/command-center/ShellContext";
import { cn } from "@/lib/utils";
import { useLiveIntelligenceStore } from "@/stores/live-intelligence-store";

function SeverityDot({ severity }: { severity: "opportunity" | "risk" | "signal" }) {
  const dotClass =
    severity === "opportunity"
      ? "bg-emerald-400"
      : severity === "risk"
        ? "bg-amber-400"
        : "bg-gold";
  return <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />;
}

type RailSeverity = "opportunity" | "risk" | "signal";

type RailItem = {
  id: string;
  title: string;
  body: string;
  severity: RailSeverity;
  timestamp: string;
};

function RailContent({ onItemClick }: { onItemClick?: () => void }) {
  const {
    enabled: demoModeEnabled,
    autoplay,
    activeScenario,
    scenarios,
    jumpToScenario,
  } = useExecutiveDemoMode();
  const liveAlerts = useLiveIntelligenceStore((state) => state.alerts).slice(0, 5);
  const connection = useLiveIntelligenceStore((state) => state.connection);

  const scenarioFeed: RailItem[] = demoModeEnabled
    ? scenarios.slice(0, 4).map((scenario) => ({
        id: `scenario-${scenario.id}`,
        title: scenario.label,
        body:
          scenario.id === activeScenario.id
            ? `Active scenario lane. ${autoplay ? "Autoplay routing engaged." : "Manual control engaged."}`
            : `Standby scenario for ${scenario.domain} domain.`,
        severity: scenario.urgency === "critical" ? "risk" : "signal",
        timestamp: scenario.id === activeScenario.id ? "live" : "queued",
      }))
    : [];

  const mergedItems: RailItem[] = [
    ...scenarioFeed,
    ...liveAlerts.map((item): RailItem => ({
      id: item.id,
      title: item.title,
      body: item.body,
      severity:
        item.type === "risk"
          ? "risk"
          : item.type === "competitor"
            ? "risk"
            : "signal",
      timestamp: item.timestamp,
    })),
    ...RIGHT_RAIL_ITEMS,
  ].slice(0, 8);

  return (
    <div className="flex h-full flex-col rounded-[2px] border border-gold/15 bg-[var(--cc-surface)] backdrop-blur-2xl">
      <div className="border-b border-gold/10 px-4 py-3">
        <p className="command-typography-kicker text-gold">Intelligence Rail</p>
        <p className="mt-2 text-sm text-titanium">Recommendations, risk alerts, and strategic signals.</p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-gold-light">Stream {connection.state}</p>
        {demoModeEnabled ? (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold-light">Scenario {activeScenario.label}</p>
        ) : null}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {mergedItems.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            {...panelReveal}
            className="w-full rounded-[2px] border border-white/10 bg-white/[0.02] px-3 py-3 text-left transition-colors duration-300 hover:border-gold/30"
            onClick={onItemClick}
            data-cursor="interactive"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
                <SeverityDot severity={item.severity} />
                {item.title}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">{item.timestamp}</span>
            </div>
            <p className="text-sm leading-6 text-beige">{item.body}</p>
          </motion.button>
        ))}
      </div>

      {demoModeEnabled ? (
        <div className="border-t border-gold/10 px-3 py-2">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mist">Scenario lanes</p>
          <div className="grid gap-1.5">
            {scenarios.slice(0, 4).map((scenario) => {
              const active = scenario.id === activeScenario.id;
              return (
                <button
                  key={`jump-${scenario.id}`}
                  type="button"
                  onClick={() => jumpToScenario(scenario.id)}
                  className={cn(
                    "rounded-[2px] border px-2 py-1 text-left font-mono text-[10px] uppercase tracking-[0.15em]",
                    active
                      ? "border-gold/35 bg-gold/[0.1] text-gold-light"
                      : "border-white/10 bg-white/[0.02] text-titanium",
                  )}
                >
                  {scenario.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="border-t border-gold/10 p-3">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-[2px] border border-gold/20 bg-gold/[0.08] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-gold-light"
          data-cursor="interactive"
        >
          <Radar className="h-3.5 w-3.5" />
          Open full intelligence timeline
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function IntelligenceRail() {
  const { mobileRailOpen, setMobileRailOpen } = useCommandCenterShell();

  return (
    <>
      <aside className="hidden w-[336px] xl:block">
        <RailContent />
      </aside>

      <AnimatePresence>
        {mobileRailOpen ? (
          <motion.div
            className="fixed inset-0 z-50 xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={() => setMobileRailOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-label="Close intelligence rail"
            />
            <motion.aside
              initial={{ x: 360 }}
              animate={{ x: 0 }}
              exit={{ x: 360 }}
              transition={{ duration: 0.35, ease: COMMAND_EASE }}
              className="absolute right-0 top-0 h-full w-[90%] max-w-[360px] p-3"
            >
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMobileRailOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-white/15 bg-obsidian text-titanium"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <RailContent onItemClick={() => setMobileRailOpen(false)} />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
