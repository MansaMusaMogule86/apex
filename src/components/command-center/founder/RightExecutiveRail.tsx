"use client";

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { EXEC_RAIL } from "@/components/command-center/founder/data";

const TYPE_CLASS = {
  risk: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  anomaly: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  sentiment: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
  reaction: "border-blue-400/35 bg-blue-400/10 text-blue-100",
  competitor: "border-violet-400/35 bg-violet-400/10 text-violet-100",
} as const;

export default function RightExecutiveRail() {
  return (
    <AuthorityPanel
      title="Right Executive Rail"
      subtitle="Live Executive Signals"
      decisionTie="Escalate prestige and sentiment risks before they impact market perception."
    >
      <div className="space-y-2">
        {EXEC_RAIL.map((item) => (
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
    </AuthorityPanel>
  );
}
