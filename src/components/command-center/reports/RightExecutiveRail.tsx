"use client";

import ReportsPanel from "@/components/command-center/reports/ReportsPanel";
import { EXEC_SIGNALS } from "@/components/command-center/reports/data";

const TYPE_CLASS = {
  risk: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  anomaly: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  prestige: "border-orange-400/35 bg-orange-400/10 text-orange-100",
  competitor: "border-violet-400/35 bg-violet-400/10 text-violet-100",
  narrative: "border-blue-400/35 bg-blue-400/10 text-blue-100",
  volatility: "border-slate-300/35 bg-slate-300/10 text-slate-100",
} as const;

export default function RightExecutiveRail() {
  return (
    <ReportsPanel
      title="Right Executive Rail"
      subtitle="High-Priority Executive Signals"
      decisionTie="Escalate signals that threaten strategic confidence and prestige stability."
    >
      <div className="space-y-2">
        {EXEC_SIGNALS.map((signal) => (
          <article key={signal.id} className="rounded-xs border border-white/10 bg-white/2 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-warm-white">{signal.title}</p>
              <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]", TYPE_CLASS[signal.type]].join(" ")}>
                {signal.type}
              </span>
            </div>
            <p className="text-xs text-titanium">{signal.body}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.13em] text-mist">{signal.timestamp}</p>
          </article>
        ))}
      </div>
    </ReportsPanel>
  );
}
