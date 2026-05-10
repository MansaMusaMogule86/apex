"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import AgentCoordinationGrid from "@/components/command-center/recommendation/AgentCoordinationGrid";
import { AGENT_SPECS, BASE_RECOMMENDATIONS, EXECUTIVE_RAIL_BASE, INITIAL_EVENTS, MEMORY_SEEDS } from "@/components/command-center/recommendation/data";
import ExecutiveRail from "@/components/command-center/recommendation/ExecutiveRail";
import MemorySystemPanel from "@/components/command-center/recommendation/MemorySystemPanel";
import MobileExecutiveMode from "@/components/command-center/recommendation/MobileExecutiveMode";
import OrchestrationDiagram from "@/components/command-center/recommendation/OrchestrationDiagram";
import PriorityEngineTable from "@/components/command-center/recommendation/PriorityEngineTable";
import RecommendationFeed from "@/components/command-center/recommendation/RecommendationFeed";
import RecommendationKpiRibbon from "@/components/command-center/recommendation/RecommendationKpiRibbon";
import RealtimeEnginePanel from "@/components/command-center/recommendation/RealtimeEnginePanel";
import SignalStreamMatrix from "@/components/command-center/recommendation/SignalStreamMatrix";
import {
  aggregateSignals,
  applyDecay,
  applySuppressionAndDedupe,
  buildEvidenceFromSignals,
  invalidateRecommendations,
  resolveContradictions,
  scoreRecommendation,
} from "@/components/command-center/recommendation/orchestration";
import type { EngineMode, OrchestrationState, Recommendation, SignalEvent } from "@/components/command-center/recommendation/types";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";

const SILK = [0.16, 1, 0.3, 1] as const;

function generateEvent(seed: number): SignalEvent {
  const sources = [
    "founder-authority",
    "lead-intelligence",
    "influence-network",
    "market-intelligence",
    "competitor-movement",
    "sentiment-shift",
    "conversion-change",
    "audience-migration",
    "prestige-volatility",
    "executive-engagement",
  ] as const;
  const areas = [
    "luxury-market",
    "founder-authority",
    "influence-system",
    "lead-intelligence",
    "prestige-stability",
    "revenue-acceleration",
    "market-positioning",
    "executive-risk",
  ] as const;

  const source = sources[seed % sources.length];
  const area = areas[(seed * 3) % areas.length];
  const direction = seed % 4 === 0 ? "volatile" : seed % 3 === 0 ? "down" : "up";

  return {
    id: `evt-live-${seed}-${Date.now()}`,
    source,
    area,
    magnitude: 48 + ((seed * 7) % 44),
    direction,
    velocity: 42 + ((seed * 9) % 52),
    trust: 60 + ((seed * 5) % 36),
    createdAt: "now",
    note: `Streaming signal from ${source.replaceAll("-", " ")} in ${area.replaceAll("-", " ")} domain.`,
  };
}

export default function RecommendationEngineScreen() {
  const {
    recommendations: liveRecommendations,
    alerts: liveAlerts,
    runtime,
    recommendationQuery,
    connection,
  } = useLiveIntelligence("recommendation");

  const [isLive, setIsLive] = useState(true);
  const [mobileMode, setMobileMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [events, setEvents] = useState<SignalEvent[]>(INITIAL_EVENTS);
  const [engineMode, setEngineMode] = useState<EngineMode>("streaming");
  const [eventRate, setEventRate] = useState(24);

  useEffect(() => {
    if (!isLive) return;

    let seed = 10;
    const interval = window.setInterval(() => {
      seed += 1;
      const next = generateEvent(seed);
      setEvents((current) => [next, ...current].slice(0, 28));
      setEventRate(Math.min(88, 20 + (seed % 14) * 3));
    }, 4500);

    return () => window.clearInterval(interval);
  }, [isLive]);

  const signals = useMemo(() => aggregateSignals(events), [events]);

  const pipeline = useMemo(() => {
    if (empty) {
      return {
        recommendations: [] as Recommendation[],
        suppressionCount: 0,
        dedupeCount: 0,
        contradictionResolutions: 0,
        invalidations: 0,
        queueDepth: 0,
      };
    }

    const interactionBias = MEMORY_SEEDS.executiveInteractions.length * 2.4;
    const scored = BASE_RECOMMENDATIONS.map((base) => ({
      ...base,
      score: scoreRecommendation(base, signals, interactionBias),
      supportingEvidence: buildEvidenceFromSignals(signals),
    }));

    const { filtered, suppressed, deduped } = applySuppressionAndDedupe(scored);
    const { adjusted, contradictionResolutions } = resolveContradictions(filtered);
    const decayed = applyDecay(adjusted).sort((a, b) => b.score.priorityIndex - a.score.priorityIndex);
    const { updated, invalidations } = invalidateRecommendations(decayed);

    return {
      recommendations: updated,
      suppressionCount: suppressed,
      dedupeCount: deduped,
      contradictionResolutions,
      invalidations,
      queueDepth: Math.max(0, Math.min(99, events.length - suppressed - deduped)),
    };
  }, [empty, events.length, signals]);

  const liveRecommendationCards = useMemo(() => {
    if (!liveRecommendations.length) {
      return [] as Recommendation[];
    }

    return liveRecommendations.slice(0, 6).map((live, index) => {
      const fallback = BASE_RECOMMENDATIONS[index % BASE_RECOMMENDATIONS.length];
      return {
        ...fallback,
        id: `live-${live.id}`,
        title: live.title,
        summary: live.executiveSummary,
        urgency: live.escalationState === "urgent" ? "Immediate" : fallback.urgency,
        escalationState: live.escalationState,
        createdAt: live.createdAt,
        score: {
          ...fallback.score,
          confidence: live.confidenceScore,
          priorityIndex: live.priorityIndex,
          riskLevel: live.riskLevel,
        },
      };
    });
  }, [liveRecommendations]);

  const recommendations = useMemo(() => {
    const merged = [...liveRecommendationCards, ...pipeline.recommendations];
    const seen = new Set<string>();
    return merged
      .filter((item) => {
        if (seen.has(item.title)) {
          return false;
        }
        seen.add(item.title);
        return true;
      })
      .sort((a, b) => b.score.priorityIndex - a.score.priorityIndex)
      .slice(0, 12);
  }, [liveRecommendationCards, pipeline.recommendations]);

  const orchestration: OrchestrationState = {
    mode: engineMode,
    queueDepth: Math.max(pipeline.queueDepth, runtime.queueDepth),
    eventRate: Math.max(eventRate, runtime.eventRate),
    suppressionCount: Math.max(pipeline.suppressionCount, Math.max(0, liveRecommendationCards.length - recommendations.length)),
    dedupeCount: pipeline.dedupeCount,
    contradictionResolutions: pipeline.contradictionResolutions,
    invalidations: pipeline.invalidations,
  };

  const realtimePoints = useMemo(
    () =>
      events.slice(0, 10).reverse().map((event, index) => ({
        tick: `t${index + 1}`,
        queueDepth: Math.max(2, Math.round(orchestration.queueDepth - index * 1.4)),
        confidence: Math.max(25, Math.round(82 - event.velocity * 0.2 + index)),
        anomalies: Math.round((event.direction === "volatile" ? 70 : 30) + event.velocity * 0.15),
        recommendations: Math.max(1, recommendations.length - Math.floor(index / 3)),
      })),
    [events, orchestration.queueDepth, recommendations.length],
  );

  const executiveRailItems = useMemo(() => {
    const confidenceShift = recommendations.length ? recommendations[0].score.confidence - 82 : -12;
    return EXECUTIVE_RAIL_BASE.map((item, index) => ({
      ...item,
      confidenceDrift: Number((item.confidenceDrift + confidenceShift * 0.2 - index).toFixed(1)),
    }));
  }, [recommendations]);

  return (
    <div className="mx-auto flex max-w-420 flex-col gap-5 md:gap-6">
      <header className="rounded-xs border border-gold/10 bg-linear-to-r from-gold/7 to-transparent px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold/70">APEX AI Recommendation Engine</p>
            <h1 className="font-display text-3xl font-light tracking-tight text-warm-white md:text-4xl">
              Strategic intelligence brain for institutional luxury operators
            </h1>
            <p className="max-w-3xl text-sm text-titanium">
              Real-time executive recommendation orchestration across markets, authority, influence, risk, prestige, and revenue acceleration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsLive((value) => !value);
                setEngineMode((current) => (current === "streaming" ? "snapshot" : "streaming"));
              }}
              className="rounded-xs border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-warm-white"
            >
              {isLive ? "Streaming mode" : "Snapshot mode"}
            </button>
            <button
              type="button"
              onClick={() => setMobileMode((value) => !value)}
              className="inline-flex items-center gap-1 rounded-xs border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              <Smartphone className="h-3.5 w-3.5" />
              {mobileMode ? "Full mode" : "Mobile executive"}
            </button>
            <button
              type="button"
              onClick={() => setLoading((value) => !value)}
              className="rounded-xs border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              Toggle loading
            </button>
            <button
              type="button"
              onClick={() => setEmpty((value) => !value)}
              className="rounded-xs border border-white/10 bg-white/4 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-titanium"
            >
              Toggle empty
            </button>
          </div>
        </div>

        <div className="mt-4">
          <RecommendationKpiRibbon
            recommendations={recommendations}
            queueDepth={orchestration.queueDepth}
            eventRate={orchestration.eventRate}
          />
        </div>
      </header>

      <section className="rounded-xs border border-amber-300/20 bg-amber-400/8 p-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-200" />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-100">Orchestration status and alert system</p>
        </div>
        <div className="grid gap-1 text-xs text-amber-100 md:grid-cols-4">
          <p>Suppressed: {orchestration.suppressionCount}</p>
          <p>Deduplicated: {orchestration.dedupeCount}</p>
          <p>Contradictions resolved: {orchestration.contradictionResolutions}</p>
          <p>Invalidated: {orchestration.invalidations}</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.14em] text-gold-light">
          <span>Stream {connection.state}</span>
          <span>Live recs {liveRecommendations.length}</span>
          <span>Alerts {liveAlerts.length}</span>
          <span>Sync {recommendationQuery.isFetching ? "running" : "idle"}</span>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {loading || (recommendationQuery.isLoading && !recommendations.length) ? (
          <motion.section
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: SILK }}
            className="rounded-xs border border-white/10 bg-white/2 p-4"
          >
            <div className="mb-3 inline-flex items-center gap-2 text-sm text-titanium">
              <Loader2 className="h-4 w-4 animate-spin" />
              Running recommendation orchestration and confidence modeling...
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
            transition={{ duration: 0.35, ease: SILK }}
            className="rounded-xs border border-dashed border-white/20 bg-white/2 p-6 text-center"
          >
            <p className="font-display text-2xl font-light text-warm-white">No active recommendation state</p>
            <p className="mt-2 text-sm text-titanium">Streaming is active, but no recommendations pass confidence and policy gates.</p>
          </motion.section>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: SILK }}
            className="space-y-4"
          >
            {mobileMode ? (
              <div className="space-y-4">
                <MobileExecutiveMode recommendations={recommendations} />
                <ExecutiveRail items={executiveRailItems} />
              </div>
            ) : (
              <>
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <SignalStreamMatrix events={events} signals={signals} />
                  <ExecutiveRail items={executiveRailItems} />
                </div>
                <RecommendationFeed recommendations={recommendations} />
                <PriorityEngineTable recommendations={recommendations} />
                <RealtimeEnginePanel points={realtimePoints} />
                <OrchestrationDiagram />
                <AgentCoordinationGrid agents={AGENT_SPECS} />
                <MemorySystemPanel memory={MEMORY_SEEDS} />
              </>
            )}

            <section className="rounded-xs border border-gold/20 bg-gold/8 p-3 text-xs text-gold-light">
              Executive interaction flow: stream ingestion -&gt; anomaly and opportunity detection -&gt; recommendation scoring -&gt; priority ranking -&gt; contradiction resolution -&gt; executive routing -&gt; feedback memory reinforcement.
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
