"use client";

import ReportsPanel from "@/components/command-center/reports/ReportsPanel";

const RECOMMENDATIONS = [
  "Increase founder narrative deployment",
  "Shift luxury positioning",
  "Expand HNWI penetration",
  "Increase trust reinforcement",
  "Activate creator clusters",
  "Reduce prestige volatility",
  "Accelerate investor-facing messaging",
  "Increase exclusivity framing",
];

export default function StrategicRecommendationEngine() {
  return (
    <ReportsPanel
      title="Strategic Recommendation Engine"
      subtitle="AI Strategy Recommendations"
      decisionTie="Prioritize recommendations by executive impact, confidence, and timing sensitivity."
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {RECOMMENDATIONS.map((recommendation) => (
          <article key={recommendation} className="rounded-xs border border-white/10 bg-white/2 p-3">
            <p className="text-sm text-warm-white">{recommendation}</p>
            <p className="mt-1 text-xs text-titanium">AI confidence band: high. Suggested deployment window: immediate to 7 days.</p>
          </article>
        ))}
      </div>
    </ReportsPanel>
  );
}
