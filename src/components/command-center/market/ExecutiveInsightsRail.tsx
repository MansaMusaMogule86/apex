"use client";

import MarketPanel from "@/components/command-center/market/MarketPanel";

const INSIGHTS = [
  {
    title: "Pricing Pressure Rising in Palm + DIFC",
    detail: "Inventory pressure crossed 80 with sustained capital inflow, enabling selective premium moves.",
    impact: "High",
  },
  {
    title: "Competitor Narrative Consolidation",
    detail: "Top competitors are converging around scarcity messaging; differentiation window narrowing.",
    impact: "Medium",
  },
  {
    title: "Buyer Migration Toward Founder-Led Districts",
    detail: "Prestige buyer movement favors districts with visible founder authority narratives.",
    impact: "High",
  },
  {
    title: "Undervalued Attention Pockets in Marina",
    detail: "Attention velocity outpacing pricing adjustments by an estimated 6-8 points.",
    impact: "Medium",
  },
];

export default function ExecutiveInsightsRail() {
  return (
    <MarketPanel
      title="Executive Insights"
      subtitle="Insights Rail"
      decisionTie="Condensed board-ready signals to drive billion-dollar allocation calls."
    >
      <div className="space-y-2">
        {INSIGHTS.map((insight) => (
          <article key={insight.title} className="rounded-xs border border-white/10 bg-white/2 p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-warm-white">{insight.title}</p>
              <span className="rounded-xs border border-gold/35 bg-gold/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-gold-light">
                {insight.impact}
              </span>
            </div>
            <p className="text-xs text-mist">{insight.detail}</p>
          </article>
        ))}
      </div>
    </MarketPanel>
  );
}
