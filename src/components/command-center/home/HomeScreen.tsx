"use client";

import { motion } from "framer-motion";
import AlertCenter from "@/components/command-center/home/AlertCenter";
import KpiRibbon from "@/components/command-center/home/KpiRibbon";
import LowerAnalytics from "@/components/command-center/home/LowerAnalytics";
import RecommendationFeed from "@/components/command-center/home/RecommendationFeed";
import { ALERTS, KPI_DATA, RECOMMENDATIONS } from "@/components/command-center/home/data";
import { applyDomainKpiDrift, useLiveIntelligence } from "@/hooks/useLiveIntelligence";
import type { AlertItem, Recommendation } from "@/components/command-center/home/types";

export default function HomeScreen() {
  const { runtime, recommendations, alerts, recommendationQuery, connection } = useLiveIntelligence("home");

  const loading = recommendationQuery.isLoading && !recommendations.length;

  const kpiData = applyDomainKpiDrift(KPI_DATA, runtime.driftPct, runtime.confidenceBias);

  const recommendationData: Recommendation[] = recommendations.length
    ? recommendations.slice(0, 5).map((item, index) => ({
        id: item.id,
        title: item.title,
        summary: item.executiveSummary,
        expectedUplift: `+${Math.max(1, Math.round(item.priorityIndex / 8))}% decision advantage`,
        confidence: Math.round(item.confidenceScore),
        riskLevel: item.riskLevel === "critical" ? "high" : item.riskLevel === "moderate" ? "medium" : item.riskLevel,
        actionOwner: "Executive Orchestration",
        timeline: item.escalationState === "urgent" ? "Immediate" : "Next 24h",
        suggestedAction: `Execute priority lane ${index + 1} for ${item.title.toLowerCase()}.`,
      }))
    : RECOMMENDATIONS;

  const alertData: AlertItem[] = alerts.length
    ? alerts.slice(0, 5).map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        body: item.body,
        severity: item.severity,
        timestamp: item.timestamp,
      }))
    : ALERTS;

  return (
    <div className="mx-auto flex max-w-[1680px] flex-col gap-5 md:gap-6">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-[2px] border border-gold/10 bg-gradient-to-r from-gold/[0.06] to-transparent px-4 py-4 md:px-5"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">APEX Command Center Home</p>
        <h1 className="mt-2 font-display text-5xl leading-[0.92] text-warm-white md:text-6xl">
          Executive intelligence operating surface.
        </h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-titanium">
          Every metric and chart below is decision-bound. The interface prioritizes directional actions over passive analytics.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-gold-light">
          <span>Stream {connection.state}</span>
          <span>Queue {runtime.queueDepth}</span>
          <span>Rate {runtime.eventRate}/m</span>
        </div>
      </motion.header>

      <KpiRibbon data={kpiData} loading={loading} />

      <section className="grid gap-4 2xl:grid-cols-[1.55fr_0.95fr]">
        <RecommendationFeed data={recommendationData} loading={loading} />
        <AlertCenter data={alertData} loading={loading} />
      </section>

      <LowerAnalytics />
    </div>
  );
}
