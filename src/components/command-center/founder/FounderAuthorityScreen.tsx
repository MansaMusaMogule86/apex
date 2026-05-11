"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Shield, TrendingUp, Users, Zap } from "lucide-react";
import { useMemo, useState } from "react";

import AiStrategyFeed from "@/components/command-center/founder/AiStrategyFeed";
import AudiencePenetrationPanel from "@/components/command-center/founder/AudiencePenetrationPanel";
import AuthorityRadarChart from "@/components/command-center/founder/AuthorityRadarChart";
import CompetitorMatrixPanel from "@/components/command-center/founder/CompetitorMatrixPanel";
import ContentIntelligencePanel from "@/components/command-center/founder/ContentIntelligencePanel";
import ExecutiveTrustEngine from "@/components/command-center/founder/ExecutiveTrustEngine";
import { FOUNDER_KPIS } from "@/components/command-center/founder/data";
import LiveSignalStream from "@/components/command-center/founder/LiveSignalStream";
import NarrativeIntelligenceEngine from "@/components/command-center/founder/NarrativeIntelligenceEngine";
import RightExecutiveRail from "@/components/command-center/founder/RightExecutiveRail";
import TopKpiRibbon from "@/components/command-center/founder/TopKpiRibbon";
import VoiceShareAnalytics from "@/components/command-center/founder/VoiceShareAnalytics";
import { applyDomainKpiDrift, useLiveIntelligence } from "@/hooks/useLiveIntelligence";

// ---------------------------------------------------------------------------
// Authority gauge — SVG radial arc
// ---------------------------------------------------------------------------
function AuthorityGauge({ score }: { score: number }) {
  const cx = 70;
  const cy = 70;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const totalArc = circ * 0.75; // 270-degree sweep
  const progressArc = totalArc * (score / 100);

  return (
    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        className="absolute inset-0"
        aria-hidden
      >
        {/* Outer glow ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 10}
          fill="none"
          stroke="rgba(200,169,110,0.06)"
          strokeWidth="18"
        />
        {/* Track arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(200,169,110,0.14)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${totalArc} ${circ - totalArc}`}
          transform={`rotate(135, ${cx}, ${cy})`}
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#C8A96E"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${progressArc} ${circ - progressArc}`}
          transform={`rotate(135, ${cx}, ${cy})`}
          style={{ filter: "drop-shadow(0 0 8px rgba(200,169,110,0.75))" }}
        />
        {/* Inner tick marks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240].map((deg, i) => {
          const angle = ((135 + deg) * Math.PI) / 180;
          const x1 = cx + (r - 10) * Math.cos(angle);
          const y1 = cy + (r - 10) * Math.sin(angle);
          const x2 = cx + (r - 7) * Math.cos(angle);
          const y2 = cy + (r - 7) * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(200,169,110,0.25)"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      <div className="relative z-10 text-center">
        <p className="font-display text-[2.2rem] font-light leading-none text-warm-white">
          {score.toFixed(1)}
        </p>
        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.26em] text-gold/60">
          Authority
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header quick-stat pill
// ---------------------------------------------------------------------------
function QuickStat({
  icon: Icon,
  label,
  value,
  delta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xs border border-white/10 bg-white/3 px-3 py-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-gold/60" />
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <p className="font-display text-base font-light text-warm-white">{value}</p>
          {delta && (
            <p className="font-mono text-[10px] text-emerald-300">{delta}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export default function FounderAuthorityScreen() {
  const { runtime, alerts: liveAlerts, connection } = useLiveIntelligence("founder");

  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);

  const kpis = useMemo(
    () => applyDomainKpiDrift(FOUNDER_KPIS, runtime.driftPct, runtime.confidenceBias),
    [runtime.driftPct, runtime.confidenceBias],
  );

  const authorityScore = useMemo(() => {
    const base = 93.2;
    return Math.min(99.9, Math.max(50, base * (1 + runtime.driftPct / 100)));
  }, [runtime.driftPct]);

  const alerts = useMemo(() => {
    const baseline = [
      "Prestige momentum decelerating in one investor-facing channel cluster.",
      "Narrative overlap with competitor founder increased beyond safe threshold.",
      "Sentiment stability improved after executive governance briefing.",
    ];
    return [...liveAlerts.slice(0, 3).map((a) => a.title), ...baseline].slice(0, 3);
  }, [liveAlerts]);

  return (
    <div className="mx-auto flex max-w-420 flex-col gap-5 md:gap-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="rounded-xs border border-gold/12 bg-linear-to-r from-gold/7 via-gold/3 to-transparent px-4 py-5 md:px-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: identity */}
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold/60">
              APEX Founder Authority System
            </p>
            <h1 className="font-display text-3xl font-light tracking-tight text-warm-white md:text-4xl">
              Strategic perception
              <br />
              <span className="apex-shimmer">operating system</span>
            </h1>
            <p className="max-w-xl text-sm text-titanium">
              Track trust, authority, narrative penetration, market influence, and prestige
              momentum for boardroom-grade founder decisions.
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-2 pt-1">
              <QuickStat
                icon={TrendingUp}
                label="Trust Momentum"
                value="+17.4%"
                delta="↑3.1%"
              />
              <QuickStat icon={Shield} label="Prestige Index" value="89.7" />
              <QuickStat icon={Users} label="Voice Share" value="41.8%" delta="↑1.9%" />
              <QuickStat icon={Zap} label="Influence Yield" value="7.6×" delta="↑5.3%" />
            </div>
          </div>

          {/* Right: gauge + connection */}
          <div className="flex flex-col items-center gap-3 lg:items-end">
            <AuthorityGauge score={authorityScore} />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em]">
              <span
                className={[
                  "flex items-center gap-1",
                  connection.state === "connected" ? "text-emerald-300" : "text-amber-300",
                ].join(" ")}
              >
                <span
                  className={[
                    "h-1.5 w-1.5 rounded-full",
                    connection.state === "connected" ? "bg-emerald-400" : "bg-amber-400",
                  ].join(" ")}
                />
                Stream {connection.state}
              </span>
              <span className="text-mist">Queue {runtime.queueDepth}</span>
              <span className="text-mist">Rate {runtime.eventRate}/m</span>
            </div>

            {/* Dev toggles — small + unobtrusive */}
            <div className="flex gap-1.5">
              {(
                [
                  { label: "Loading", action: () => setLoading((v) => !v) },
                  { label: "Empty", action: () => setEmpty((v) => !v) },
                ] as { label: string; action: () => void }[]
              ).map(({ label, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  className="rounded-xs border border-white/8 bg-white/2 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-mist hover:border-white/15 hover:text-titanium"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI ribbon */}
        <div className="mt-5">
          <TopKpiRibbon data={kpis} loading={loading} />
        </div>
      </header>

      {/* ── Executive alerts ───────────────────────────────────────────────── */}
      <section className="rounded-xs border border-amber-300/18 bg-amber-400/6 px-4 py-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-200" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-100">
            Executive alerts
          </p>
        </div>
        <div className="grid gap-1.5 text-xs text-amber-100/80 md:grid-cols-3">
          {alerts.map((alert) => (
            <p key={alert} className="flex gap-2">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400/60" />
              {alert}
            </p>
          ))}
        </div>
      </section>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.section
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xs border border-white/10 bg-white/2 p-6"
          >
            <div className="mb-4 flex items-center gap-2 text-sm text-titanium">
              <Loader2 className="h-4 w-4 animate-spin text-gold/60" />
              Synchronizing authority intelligence streams...
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xs border border-white/10 bg-white/3"
                />
              ))}
            </div>
          </motion.section>
        ) : empty ? (
          <motion.section
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xs border border-dashed border-white/20 bg-white/2 p-10 text-center"
          >
            <p className="font-display text-2xl font-light text-warm-white">
              No authority telemetry in active scope
            </p>
            <p className="mt-2 text-sm text-titanium">
              Adjust filters or reconnect intelligence channels to repopulate this view.
            </p>
          </motion.section>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 md:space-y-5"
          >
            {/* Row 1: Narrative Engine + Executive Rail */}
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
              <NarrativeIntelligenceEngine />
              <RightExecutiveRail />
            </div>

            {/* Row 2: Radar | Audience Penetration | Competitor Matrix */}
            <div className="grid gap-4 lg:grid-cols-3">
              <AuthorityRadarChart />
              <AudiencePenetrationPanel />
              <CompetitorMatrixPanel />
            </div>

            {/* Row 3: Voice Share (full width) */}
            <VoiceShareAnalytics />

            {/* Row 4: Trust Engine + AI Strategy Feed */}
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <ExecutiveTrustEngine />
              <AiStrategyFeed />
            </div>

            {/* Row 5: Content Intelligence (full width) */}
            <ContentIntelligencePanel />

            {/* Row 6: Live Signal Stream (full width) */}
            <LiveSignalStream />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
