"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AiRecommendationFeed from "@/components/command-center/influence/AiRecommendationFeed";
import AudienceIntelligenceEngine from "@/components/command-center/influence/AudienceIntelligenceEngine";
import CreatorCommandTable from "@/components/command-center/influence/CreatorCommandTable";
import { CREATORS, INFLUENCE_KPIS } from "@/components/command-center/influence/data";
import CulturalMomentumEngine from "@/components/command-center/influence/CulturalMomentumEngine";
import InfluenceHeatmap from "@/components/command-center/influence/InfluenceHeatmap";
import RightExecutiveRail from "@/components/command-center/influence/RightExecutiveRail";
import TopKpiRibbon from "@/components/command-center/influence/TopKpiRibbon";
import TrustTransferEngine from "@/components/command-center/influence/TrustTransferEngine";
import type { CreatorRow } from "@/components/command-center/influence/types";
import { applyDomainKpiDrift, useLiveIntelligence } from "@/hooks/useLiveIntelligence";

function mutateCreators(creators: CreatorRow[]) {
  return creators.map((creator) => {
    const trustDrift = Math.floor((Math.random() - 0.5) * 4);
    const gravityDrift = Math.floor((Math.random() - 0.5) * 3);
    const yieldDrift = (Math.random() - 0.5) * 0.25;
    return {
      ...creator,
      trustTransferPotential: Math.min(99, Math.max(60, creator.trustTransferPotential + trustDrift)),
      conversionGravity: Math.min(99, Math.max(55, creator.conversionGravity + gravityDrift)),
      influenceYield: Math.min(10, Math.max(5.5, Number((creator.influenceYield + yieldDrift).toFixed(1)))),
    };
  });
}

function ExecutiveQuickScan({ creators }: { creators: CreatorRow[] }) {
  const top = [...creators].sort((a, b) => b.aiPriority - a.aiPriority).slice(0, 3);

  return (
    <section className="rounded-xs border border-white/10 bg-white/2 p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-gold/70">Executive quick scans</p>
      <div className="space-y-2">
        {top.map((creator) => (
          <article key={creator.id} className="rounded-xs border border-white/10 bg-white/3 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-warm-white">{creator.creator}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-light">priority {creator.aiPriority}</p>
            </div>
            <p className="mt-1 text-xs text-titanium">{creator.platform} | {creator.cluster}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function InfluenceNetworkScreen() {
  const { runtime, alerts: liveAlerts, connection } = useLiveIntelligence("influence");

  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [mobileExecutiveMode, setMobileExecutiveMode] = useState(false);
  const [creators, setCreators] = useState<CreatorRow[]>(CREATORS);
  const [selectedCreatorId, setSelectedCreatorId] = useState(CREATORS[0]?.id ?? "");

  useEffect(() => {
    if (!liveMode) return;
    const interval = window.setInterval(() => {
      setCreators((current) => mutateCreators(current));
    }, 6500);
    return () => window.clearInterval(interval);
  }, [liveMode]);

  const selectedCreator = useMemo(
    () => creators.find((creator) => creator.id === selectedCreatorId) ?? creators[0],
    [creators, selectedCreatorId],
  );

  const alerts = useMemo(() => {
    const baseline = [
      "Prestige conflict probability rising in one high-reach creator narrative.",
      "HNWI attention migration accelerating toward DIFC influence cluster.",
      "Competitor creator pod activated in Luxury Lifestyle segment.",
    ];

    return [...liveAlerts.slice(0, 3).map((item) => item.title), ...baseline].slice(0, 3);
  }, [liveAlerts]);

  return (
    <div className="mx-auto flex max-w-420 flex-col gap-5 md:gap-6">
      <header className="space-y-4 rounded-xs border border-gold/10 bg-linear-to-r from-gold/6 to-transparent px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold/70">Apex Influence Network</p>
            <h1 className="font-display text-3xl font-light tracking-tight text-warm-white md:text-4xl">
              Luxury influence intelligence operating system
            </h1>
            <p className="max-w-3xl text-sm text-titanium">
              Boardroom-grade intelligence for prestige-aligned creator ecosystems, trust transfer, and conversion gravity decisions.
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

        <TopKpiRibbon data={applyDomainKpiDrift(INFLUENCE_KPIS, runtime.driftPct, runtime.confidenceBias)} loading={loading} />
        <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-gold-light">
          <span>Stream {connection.state}</span>
          <span>Queue {runtime.queueDepth}</span>
          <span>Rate {runtime.eventRate}/m</span>
        </div>
      </header>

      <section className="rounded-xs border border-amber-300/20 bg-amber-400/8 p-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-200" />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100">Priority influence alerts</p>
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
              Synchronizing influence intelligence grid...
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
            <p className="font-display text-2xl font-light text-warm-white">No influence intelligence in active scope</p>
            <p className="mt-2 text-sm text-titanium">Current filters produced no qualified creator clusters.</p>
          </motion.section>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {mobileExecutiveMode ? (
              <div className="space-y-4">
                <ExecutiveQuickScan creators={creators} />
                <AiRecommendationFeed />
                <RightExecutiveRail />
              </div>
            ) : (
              <>
                <CreatorCommandTable creators={creators} selectedCreatorId={selectedCreatorId} onSelectCreator={setSelectedCreatorId} />
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
                  <AudienceIntelligenceEngine />
                  <RightExecutiveRail />
                </div>
                <InfluenceHeatmap />
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <TrustTransferEngine />
                  <AiRecommendationFeed />
                </div>
                <CulturalMomentumEngine />
              </>
            )}

            <section className="rounded-xs border border-gold/20 bg-gold/8 p-3 text-xs text-gold-light">
              Executive interaction flow: select creator from command table, review trust transfer and district influence heat, execute AI recommendation, then monitor rail for risk/anomaly drift in realtime.
            </section>

            <section className="rounded-xs border border-white/10 bg-white/2 p-3 text-xs text-titanium">
              Selected creator context: {selectedCreator ? `${selectedCreator.creator} | ${selectedCreator.platform} | ${selectedCreator.cluster}` : "none"}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
