"use client";

import { COMPETITOR_RESPONSES } from "@/components/command-center/scenario/data";
import ScenarioPanel from "@/components/command-center/scenario/ScenarioPanel";

const SEVERITY_CLASS = {
  high: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  medium: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  low: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
} as const;

export default function CompetitorResponseEngine() {
  return (
    <ScenarioPanel
      title="Competitor Response Engine"
      subtitle="Predicted Competitor Reactions"
      decisionTie="Prepare counter-strategy for high-probability competitor responses before deployment."
    >
      <div className="space-y-2">
        {COMPETITOR_RESPONSES.map((item) => (
          <article key={item.id} className="rounded-xs border border-white/10 bg-white/2 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-warm-white">{item.vector}</p>
              <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]", SEVERITY_CLASS[item.severity]].join(" ")}>
                {item.severity}
              </span>
            </div>
            <p className="text-xs text-titanium">{item.implication}</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.13em] text-gold-light">{item.probability}% probability</p>
          </article>
        ))}
      </div>
    </ScenarioPanel>
  );
}
