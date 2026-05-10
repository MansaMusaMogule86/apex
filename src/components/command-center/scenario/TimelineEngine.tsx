"use client";

import { TIMELINE_SIGNALS } from "@/components/command-center/scenario/data";
import ScenarioPanel from "@/components/command-center/scenario/ScenarioPanel";
import type { SimulationControls } from "@/components/command-center/scenario/types";

type TimelineEngineProps = {
  timeline: SimulationControls["timeline"];
};

const SEVERITY_CLASS = {
  high: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  medium: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  low: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
} as const;

export default function TimelineEngine({ timeline }: TimelineEngineProps) {
  const visible = TIMELINE_SIGNALS.filter((signal) => signal.horizon === timeline || timeline === "long");

  return (
    <ScenarioPanel
      title="Timeline Engine"
      subtitle="Scenario Outlook Timeline"
      decisionTie="Track strategic inflection points by selected simulation horizon."
    >
      <div className="space-y-2">
        {visible.map((signal) => (
          <article key={signal.id} className="rounded-xs border border-white/10 bg-white/2 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-warm-white">{signal.label}</p>
              <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]", SEVERITY_CLASS[signal.severity]].join(" ")}>
                {signal.severity}
              </span>
            </div>
            <p className="text-xs text-titanium">{signal.note}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.13em] text-mist">{signal.horizon} outlook</p>
          </article>
        ))}
      </div>
    </ScenarioPanel>
  );
}
