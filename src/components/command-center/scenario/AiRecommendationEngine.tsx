"use client";

import { AI_RECOMMENDATIONS } from "@/components/command-center/scenario/data";
import ScenarioPanel from "@/components/command-center/scenario/ScenarioPanel";

const PRIORITY_CLASS = {
  critical: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  high: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  medium: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
} as const;

export default function AiRecommendationEngine() {
  return (
    <ScenarioPanel
      title="AI Recommendation Engine"
      subtitle="Strategic Recommendations"
      decisionTie="Execute high-confidence actions to improve scenario quality and reduce downside." 
    >
      <div className="space-y-2">
        {AI_RECOMMENDATIONS.map((item) => (
          <article key={item.id} className="rounded-xs border border-white/10 bg-white/2 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-warm-white">{item.action}</p>
              <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]", PRIORITY_CLASS[item.priority]].join(" ")}>
                {item.priority}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-titanium">
              <p>Impact: {item.impact}</p>
              <p className="font-mono uppercase tracking-[0.13em] text-gold-light">{item.confidence}% confidence</p>
            </div>
          </article>
        ))}
      </div>
    </ScenarioPanel>
  );
}
