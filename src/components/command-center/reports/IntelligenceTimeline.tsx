"use client";

import ReportsPanel from "@/components/command-center/reports/ReportsPanel";
import { TIMELINE } from "@/components/command-center/reports/data";

const SEVERITY_CLASS = {
  high: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  medium: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  low: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
} as const;

export default function IntelligenceTimeline() {
  return (
    <ReportsPanel
      title="Intelligence Timeline"
      subtitle="Strategic Event Timeline"
      decisionTie="Track inflection events across market, founder, influence, and competitor systems."
    >
      <div className="space-y-2">
        {TIMELINE.map((event) => (
          <article key={event.id} className="rounded-xs border border-white/10 bg-white/2 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-warm-white">{event.label}</p>
              <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]", SEVERITY_CLASS[event.severity]].join(" ")}>
                {event.severity}
              </span>
            </div>
            <p className="text-xs text-titanium">{event.note}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.13em] text-mist">{event.type} | {event.timestamp}</p>
          </article>
        ))}
      </div>
    </ReportsPanel>
  );
}
