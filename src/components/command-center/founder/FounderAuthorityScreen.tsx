"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Smartphone } from "lucide-react";
import { useMemo, useState } from "react";

import AiStrategyFeed from "@/components/command-center/founder/AiStrategyFeed";
import ContentIntelligencePanel from "@/components/command-center/founder/ContentIntelligencePanel";
import ExecutiveTrustEngine from "@/components/command-center/founder/ExecutiveTrustEngine";
import { FOUNDER_KPIS } from "@/components/command-center/founder/data";
import NarrativeIntelligenceEngine from "@/components/command-center/founder/NarrativeIntelligenceEngine";
import RightExecutiveRail from "@/components/command-center/founder/RightExecutiveRail";
import TopKpiRibbon from "@/components/command-center/founder/TopKpiRibbon";
import VoiceShareAnalytics from "@/components/command-center/founder/VoiceShareAnalytics";
import { applyDomainKpiDrift, useLiveIntelligence } from "@/hooks/useLiveIntelligence";

function ExecutiveQuickActions() {
  const actions = [
    "Publish founder narrative memo",
    "Escalate investor trust brief",
    "Trigger authority interview",
    "Deploy exclusivity framing",
  ];

  return (
    <section className="rounded-xs border border-white/10 bg-white/2 p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-gold/70">Executive quick actions</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action}
            type="button"
            className="rounded-xs border border-white/10 bg-white/3 px-3 py-2 text-left text-xs text-warm-white hover:border-gold/35"
          >
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function FounderAuthorityScreen() {
  const { runtime, alerts: liveAlerts, connection } = useLiveIntelligence("founder");

  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [mobileExecutiveMode, setMobileExecutiveMode] = useState(false);

  const alerts = useMemo(() => {
    const baseline = [
      "Prestige momentum decelerating in one investor-facing channel cluster.",
      "Narrative overlap with competitor founder increased beyond safe threshold.",
      "Sentiment stability improved after executive governance briefing.",
    ];

    return [...liveAlerts.slice(0, 3).map((item) => item.title), ...baseline].slice(0, 3);
  }, [liveAlerts]);

  return (
    <div className="mx-auto flex max-w-420 flex-col gap-5 md:gap-6">
      <header className="space-y-4 rounded-xs border border-gold/10 bg-linear-to-r from-gold/6 to-transparent px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold/70">Apex Founder Authority System</p>
            <h1 className="font-display text-3xl font-light tracking-tight text-warm-white md:text-4xl">
              Strategic perception operating system
            </h1>
            <p className="max-w-3xl text-sm text-titanium">
              Track trust, authority, narrative penetration, market influence, and prestige momentum for boardroom-grade founder decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

        <TopKpiRibbon data={applyDomainKpiDrift(FOUNDER_KPIS, runtime.driftPct, runtime.confidenceBias)} loading={loading} />
        <div className="flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-gold-light">
          <span>Stream {connection.state}</span>
          <span>Queue {runtime.queueDepth}</span>
          <span>Rate {runtime.eventRate}/m</span>
        </div>
      </header>

      <section className="rounded-xs border border-amber-300/20 bg-amber-400/8 p-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-200" />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100">Executive alerts</p>
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
              Synchronizing authority intelligence streams...
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
            <p className="font-display text-2xl font-light text-warm-white">No authority telemetry in active scope</p>
            <p className="mt-2 text-sm text-titanium">Adjust filters or reconnect intelligence channels to repopulate this view.</p>
          </motion.section>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {mobileExecutiveMode ? (
              <div className="space-y-4">
                <ExecutiveQuickActions />
                <RightExecutiveRail />
                <AiStrategyFeed />
              </div>
            ) : (
              <>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
                  <NarrativeIntelligenceEngine />
                  <RightExecutiveRail />
                </div>
                <VoiceShareAnalytics />
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <ExecutiveTrustEngine />
                  <AiStrategyFeed />
                </div>
                <ContentIntelligencePanel />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
