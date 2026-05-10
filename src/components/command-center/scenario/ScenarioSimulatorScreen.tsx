"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AiRecommendationEngine from "@/components/command-center/scenario/AiRecommendationEngine";
import CompetitorResponseEngine from "@/components/command-center/scenario/CompetitorResponseEngine";
import ForecastVisualizationEngine from "@/components/command-center/scenario/ForecastVisualizationEngine";
import MainSimulationEngine from "@/components/command-center/scenario/MainSimulationEngine";
import RightExecutiveRail from "@/components/command-center/scenario/RightExecutiveRail";
import ScenarioControlsPanel from "@/components/command-center/scenario/ScenarioControlsPanel";
import { SCENARIO_KPIS } from "@/components/command-center/scenario/data";
import TimelineEngine from "@/components/command-center/scenario/TimelineEngine";
import TopKpiRibbon from "@/components/command-center/scenario/TopKpiRibbon";
import type { ForecastPoint, ScenarioPreset, SimulationControls } from "@/components/command-center/scenario/types";
import { applyDomainKpiDrift, useLiveIntelligence } from "@/hooks/useLiveIntelligence";

const DEFAULT_CONTROLS: SimulationControls = {
  founderContent: 55,
  luxuryPositioning: 60,
  influencerDeployment: 50,
  prActivation: 45,
  investorMessaging: 58,
  geographicExpansion: 40,
  pricingChange: 42,
  narrativeFraming: 60,
  aggression: 50,
  riskTolerance: 45,
  capitalAllocation: 52,
  influenceBudget: 48,
  timeline: "90d",
};

function buildForecast(controls: SimulationControls): ForecastPoint[] {
  const points = ["P1", "P2", "P3", "P4", "P5", "P6"];
  const growthSeed =
    controls.founderContent * 0.08 +
    controls.luxuryPositioning * 0.07 +
    controls.influencerDeployment * 0.06 +
    controls.investorMessaging * 0.07 +
    controls.capitalAllocation * 0.06;
  const riskPenalty = controls.riskTolerance * 0.03 + controls.pricingChange * 0.02;
  const base = 45 + (growthSeed - riskPenalty) * 0.25;

  return points.map((label, index) => {
    const step = index * 4;
    const revenue = base + step + controls.aggression * 0.06;
    const prestige = base + step + controls.narrativeFraming * 0.04 - controls.pricingChange * 0.03;
    const trust = base + step + controls.founderContent * 0.05 + controls.investorMessaging * 0.03;
    const influence = base + step + controls.influencerDeployment * 0.06 + controls.influenceBudget * 0.05;
    const marketPenetration = base + step + controls.geographicExpansion * 0.05;
    const investorConfidence = base + step + controls.investorMessaging * 0.06 - controls.aggression * 0.02;
    const luxuryMovement = base + step + controls.luxuryPositioning * 0.07;
    const competitorResponse = base + step + controls.aggression * 0.05 + controls.prActivation * 0.03;

    return {
      label,
      revenue: Number(revenue.toFixed(1)),
      prestige: Number(prestige.toFixed(1)),
      trust: Number(trust.toFixed(1)),
      influence: Number(influence.toFixed(1)),
      marketPenetration: Number(marketPenetration.toFixed(1)),
      investorConfidence: Number(investorConfidence.toFixed(1)),
      luxuryMovement: Number(luxuryMovement.toFixed(1)),
      competitorResponse: Number(competitorResponse.toFixed(1)),
    };
  });
}

function MobileQuickSnapshot({ outcomes }: { outcomes: { revenueProjection: number; prestigeVolatility: number; hnwiConversion: number } }) {
  return (
    <section className="rounded-xs border border-white/10 bg-white/2 p-4">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold/70">Executive simulation snapshot</p>
      <div className="grid gap-2 sm:grid-cols-3">
        <article className="rounded-xs border border-white/10 bg-white/3 p-2 text-xs text-titanium">Revenue ${outcomes.revenueProjection.toFixed(1)}M</article>
        <article className="rounded-xs border border-white/10 bg-white/3 p-2 text-xs text-titanium">Prestige volatility {outcomes.prestigeVolatility.toFixed(1)}</article>
        <article className="rounded-xs border border-white/10 bg-white/3 p-2 text-xs text-titanium">HNWI conversion {outcomes.hnwiConversion.toFixed(1)}%</article>
      </div>
    </section>
  );
}

export default function ScenarioSimulatorScreen() {
  const { runtime, alerts: liveAlerts, connection } = useLiveIntelligence("scenario");

  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [mobileExecutiveMode, setMobileExecutiveMode] = useState(false);
  const [controls, setControls] = useState<SimulationControls>(DEFAULT_CONTROLS);

  const onControlChange = <K extends keyof SimulationControls>(key: K, value: SimulationControls[K]) => {
    setControls((current) => ({ ...current, [key]: value }));
  };

  const onApplyPreset = (preset: ScenarioPreset) => {
    setControls((current) => ({
      ...current,
      aggression: preset.aggression,
      riskTolerance: preset.riskTolerance,
      capitalAllocation: preset.capitalAllocation,
      influenceBudget: preset.influenceBudget,
      founderContent: preset.founderContent,
      luxuryPositioning: preset.luxuryPositioning,
      influencerDeployment: preset.influencerDeployment,
      prActivation: preset.prActivation,
      investorMessaging: preset.investorMessaging,
      geographicExpansion: preset.geographicExpansion,
      pricingChange: preset.pricingChange,
      narrativeFraming: preset.narrativeFraming,
    }));
  };

  useEffect(() => {
    if (!liveMode) return;
    const interval = window.setInterval(() => {
      setControls((current) => {
        const drift = (value: number, max = 100) => Math.min(max, Math.max(0, value + Math.floor((Math.random() - 0.5) * 4)));
        return {
          ...current,
          founderContent: drift(current.founderContent),
          influencerDeployment: drift(current.influencerDeployment),
          investorMessaging: drift(current.investorMessaging),
          pricingChange: drift(current.pricingChange),
        };
      });
    }, 6500);
    return () => window.clearInterval(interval);
  }, [liveMode]);

  const forecast = useMemo(() => {
    const base = buildForecast(controls);
    if (!runtime.driftPct) {
      return base;
    }

    return base.map((point) => ({
      ...point,
      revenue: Number((point.revenue * (1 + runtime.driftPct / 100)).toFixed(1)),
      investorConfidence: Number((point.investorConfidence + runtime.confidenceBias * 0.03).toFixed(1)),
      competitorResponse: Number((point.competitorResponse + runtime.amplifiedSignal * 0.03).toFixed(1)),
    }));
  }, [controls, runtime.amplifiedSignal, runtime.confidenceBias, runtime.driftPct]);

  const outcomes = useMemo(() => {
    const last = forecast[forecast.length - 1];
    return {
      revenueProjection: Number((last.revenue * 0.14).toFixed(1)),
      prestigeVolatility: Number((100 - last.prestige + controls.riskTolerance * 0.12).toFixed(1)),
      hnwiConversion: Number((last.marketPenetration * 0.72).toFixed(1)),
      investorSentiment: Number(last.investorConfidence.toFixed(1)),
      authorityEvolution: Number(((last.trust + last.influence) / 2).toFixed(1)),
    };
  }, [controls.riskTolerance, forecast]);

  const alerts = useMemo(() => {
    const seeded = [
      "Competitor response probability exceeded threshold for aggressive scenarios.",
      "Prestige volatility widening under current pricing change settings.",
      "Investor confidence dips projected in 90-day trajectory without trust reinforcement.",
    ];

    const live = liveAlerts.slice(0, 3).map((item) => item.title);
    return [...live, ...seeded].slice(0, 3);
  }, [liveAlerts]);

  return (
    <div className="mx-auto flex max-w-420 flex-col gap-5 md:gap-6">
      <header className="space-y-4 rounded-xs border border-gold/10 bg-linear-to-r from-gold/6 to-transparent px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold/70">Apex Scenario Simulator</p>
            <h1 className="font-display text-3xl font-light tracking-tight text-warm-white md:text-4xl">
              Strategic forecasting and simulation operating system
            </h1>
            <p className="max-w-3xl text-sm text-titanium">
              Simulate founder, market, influence, and competitor futures before execution to optimize high-stakes decisions.
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
              onClick={() => setMobileExecutiveMode((value) => !value)}
              className="inline-flex items-center gap-1 rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              <Smartphone className="h-3.5 w-3.5" />
              {mobileExecutiveMode ? "Full mode" : "Mobile executive"}
            </button>
            <button
              type="button"
              onClick={() => setLoading((value) => !value)}
              className="rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              Toggle loading
            </button>
            <button
              type="button"
              onClick={() => setEmpty((value) => !value)}
              className="rounded-xs border border-white/10 bg-white/3 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              Toggle empty
            </button>
          </div>
        </div>

        <TopKpiRibbon data={applyDomainKpiDrift(SCENARIO_KPIS, runtime.driftPct, runtime.confidenceBias)} loading={loading} />
        <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-gold-light">
          <span>Stream {connection.state}</span>
          <span>Queue {runtime.queueDepth}</span>
          <span>Rate {runtime.eventRate}/m</span>
        </div>
      </header>

      <section className="rounded-xs border border-amber-300/20 bg-amber-400/8 p-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-200" />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100">Strategic alerts</p>
        </div>
        <div className="grid gap-1 text-xs text-amber-100 md:grid-cols-3">
          {alerts.map((alert) => (
            <p key={alert}>{alert}</p>
          ))}
        </div>
      </section>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.section
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xs border border-white/10 bg-white/2 p-4"
          >
            <div className="mb-3 inline-flex items-center gap-2 text-sm text-titanium">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running multi-variable simulation models...
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-xs border border-white/10 bg-white/3" />
              ))}
            </div>
          </motion.section>
        ) : empty ? (
          <motion.section
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xs border border-dashed border-white/20 bg-white/2 p-6 text-center"
          >
            <p className="font-display text-2xl font-light text-warm-white">No active scenario output</p>
            <p className="mt-2 text-sm text-titanium">Adjust controls or apply a preset to generate a simulation path.</p>
          </motion.section>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {mobileExecutiveMode ? (
              <div className="space-y-4">
                <MobileQuickSnapshot outcomes={outcomes} />
                <AiRecommendationEngine />
                <RightExecutiveRail />
              </div>
            ) : (
              <>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <ScenarioControlsPanel controls={controls} onControlChange={onControlChange} onApplyPreset={onApplyPreset} />
                  <RightExecutiveRail />
                </div>
                <MainSimulationEngine outcomes={outcomes} />
                <ForecastVisualizationEngine data={forecast} />
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <CompetitorResponseEngine />
                  <AiRecommendationEngine />
                </div>
                <TimelineEngine timeline={controls.timeline} />
              </>
            )}

            <section className="rounded-xs border border-gold/20 bg-gold/8 p-3 text-xs text-gold-light">
              Executive interaction flow: choose preset, tune controls, inspect forecast trajectories, review competitor responses and AI recommendations, then commit strategy with risk-aware confidence.
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
