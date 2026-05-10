"use client";

import { EXECUTIVE_RAIL } from "@/components/command-center/influence/data";
import InfluencePanel from "@/components/command-center/influence/InfluencePanel";

const TYPE_CLASS = {
  risk: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  anomaly: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  volatility: "border-orange-400/35 bg-orange-400/10 text-orange-100",
  competitor: "border-violet-400/35 bg-violet-400/10 text-violet-100",
  conflict: "border-red-400/35 bg-red-400/10 text-red-100",
  trend: "border-blue-400/35 bg-blue-400/10 text-blue-100",
} as const;

export default function RightExecutiveRail() {
  return (
    <InfluencePanel
      title="Right Executive Rail"
      subtitle="Executive Signals"
      decisionTie="Escalate influence risk and prestige conflicts before narrative damage compounds."
    >
      <div className="space-y-2">
        {EXECUTIVE_RAIL.map((item) => (
          <article key={item.id} className="rounded-xs border border-white/10 bg-white/2 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-warm-white">{item.title}</p>
              <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]", TYPE_CLASS[item.type]].join(" ")}>
                {item.type}
              </span>
            </div>
            <p className="text-xs text-titanium">{item.body}</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.13em] text-mist">{item.timestamp}</p>
          </article>
        ))}
      </div>
    </InfluencePanel>
  );
}
