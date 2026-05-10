"use client";

import ScenarioPanel from "@/components/command-center/scenario/ScenarioPanel";

type MainSimulationEngineProps = {
  outcomes: {
    revenueProjection: number;
    prestigeVolatility: number;
    hnwiConversion: number;
    investorSentiment: number;
    authorityEvolution: number;
  };
};

export default function MainSimulationEngine({ outcomes }: MainSimulationEngineProps) {
  return (
    <ScenarioPanel
      title="Main Simulation Engine"
      subtitle="Multi-Variable Strategic Simulator"
      decisionTie="Model strategic outcomes before execution to minimize downside and maximize prestige and revenue impact."
    >
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-xs border border-white/10 bg-white/2 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-titanium">Revenue outcome</p>
          <p className="mt-1 text-xl font-light text-warm-white">${outcomes.revenueProjection.toFixed(1)}M</p>
        </article>
        <article className="rounded-xs border border-white/10 bg-white/2 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-titanium">Prestige volatility</p>
          <p className="mt-1 text-xl font-light text-warm-white">{outcomes.prestigeVolatility.toFixed(1)}</p>
        </article>
        <article className="rounded-xs border border-white/10 bg-white/2 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-titanium">HNWI conversion</p>
          <p className="mt-1 text-xl font-light text-warm-white">{outcomes.hnwiConversion.toFixed(1)}%</p>
        </article>
        <article className="rounded-xs border border-white/10 bg-white/2 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-titanium">Investor sentiment</p>
          <p className="mt-1 text-xl font-light text-warm-white">{outcomes.investorSentiment.toFixed(1)}</p>
        </article>
        <article className="rounded-xs border border-white/10 bg-white/2 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-titanium">Authority evolution</p>
          <p className="mt-1 text-xl font-light text-warm-white">{outcomes.authorityEvolution.toFixed(1)}</p>
        </article>
      </div>
    </ScenarioPanel>
  );
}
