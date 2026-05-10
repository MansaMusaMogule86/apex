"use client";

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import AiSignalFeed from "@/components/command-center/market/AiSignalFeed";
import CompetitorPanel from "@/components/command-center/market/CompetitorPanel";
import DistrictHeatmap from "@/components/command-center/market/DistrictHeatmap";
import ExecutiveInsightsRail from "@/components/command-center/market/ExecutiveInsightsRail";
import ForecastingModule from "@/components/command-center/market/ForecastingModule";
import ForecastSimulator from "@/components/command-center/market/ForecastSimulator";
import MarketDynamics from "@/components/command-center/market/MarketDynamics";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";

function HeaderKpis() {
  const kpis = [
    { label: "Demand Pulse", value: "84", delta: "+6.2%" },
    { label: "Capital Inflow Index", value: "91", delta: "+4.9%" },
    { label: "Pricing Pressure", value: "77", delta: "+3.1%" },
    { label: "Buyer Migration Flux", value: "68", delta: "+9.4%" },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <article key={kpi.label} className="rounded-xs border border-white/10 bg-white/2 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-titanium">{kpi.label}</p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <p className="font-display text-3xl font-light text-warm-white">{kpi.value}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-light">{kpi.delta}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-36 animate-pulse rounded-xs border border-white/10 bg-white/3" />
      ))}
    </div>
  );
}

export default function MarketIntelligenceScreen() {
  const { runtime, alerts: liveAlerts, connection } = useLiveIntelligence("market");

  const [isLoading, setIsLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [liveMode, setLiveMode] = useState(true);

  const alerts = useMemo(() => {
    const baseline = [
      "Palm + DIFC pricing pressure exceeded safe threshold by 4 points.",
      "Competitor launch narrative overlap detected in two districts.",
      "Prestige migration acceleration observed in founder-led corridors.",
    ];

    return [...liveAlerts.slice(0, 3).map((item) => item.title), ...baseline].slice(0, 3);
  }, [liveAlerts]);

  return (
    <div className="mx-auto flex max-w-420 flex-col gap-5 md:gap-6">
      <header className="space-y-4 rounded-xs border border-gold/10 bg-linear-to-r from-gold/6 to-transparent px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold/70">Apex Market Intelligence</p>
            <h1 className="font-display text-3xl font-light tracking-tight text-warm-white md:text-4xl">
              Dubai market intelligence infrastructure
            </h1>
            <p className="max-w-3xl text-sm text-titanium">
              Built for billion-dollar decisions: live district heat, competitor movement, pricing pressure, and AI-guided scenario outcomes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLiveMode((value) => !value)}
              className="rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-warm-white"
            >
              {liveMode ? "Live mode" : "Snapshot mode"}
            </button>
            <button
              type="button"
              onClick={() => setIsLoading((value) => !value)}
              className="inline-flex items-center gap-1 rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Toggle loading
            </button>
            <button
              type="button"
              onClick={() => setShowEmpty((value) => !value)}
              className="rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              Toggle empty
            </button>
          </div>
        </div>

        <HeaderKpis />
        <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-gold-light">
          <span>Stream {connection.state}</span>
          <span>Queue {runtime.queueDepth}</span>
          <span>Rate {runtime.eventRate}/m</span>
        </div>
      </header>

      <section className="rounded-xs border border-amber-300/20 bg-amber-400/8 p-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-200" />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100">Priority alerts</p>
        </div>
        <div className="grid gap-1 text-xs text-amber-100 md:grid-cols-3">
          {alerts.map((alert) => (
            <p key={alert}>{alert}</p>
          ))}
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-xs border border-white/10 bg-white/2 p-4">
          <div className="mb-3 inline-flex items-center gap-2 text-sm text-titanium">
            <Loader2 className="h-4 w-4 animate-spin" />
            Updating live market layers...
          </div>
          <SkeletonGrid />
        </section>
      ) : showEmpty ? (
        <section className="rounded-xs border border-dashed border-white/20 bg-white/2 p-6 text-center">
          <p className="font-display text-2xl font-light text-warm-white">No active market intelligence snapshots</p>
          <p className="mt-2 text-sm text-titanium">
            Data stream is available but no filtered districts are currently selected.
          </p>
        </section>
      ) : (
        <>
          <DistrictHeatmap />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <CompetitorPanel />
            <AiSignalFeed />
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <ForecastingModule />
            <ExecutiveInsightsRail />
          </div>
          <MarketDynamics />
          <ForecastSimulator />
        </>
      )}
    </div>
  );
}
