"use client";

import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import MagneticButton from "@/components/marketing/MagneticButton";
import { useLiveIntelligenceStore, type LiveDomain } from "@/stores/live-intelligence-store";
import { useLiveIntelligence } from "@/hooks/useLiveIntelligence";

type IntelMetric = {
  label: string;
  value: string;
  delta: string;
  commentary: string;
  status: "Live" | "Stable" | "Watch";
  spark: number[];
  domain: LiveDomain;
};

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = Math.max(1, max - min);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - ((value - min) / spread) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-8 w-full" aria-hidden="true">
      <polyline
        fill="none"
        stroke="var(--signal-blue)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function Hero() {
  const rootRef = useRef<HTMLElement | null>(null);
  
  // Connect to the home domain for real-time overview updates
  const { connection } = useLiveIntelligence("home");
  const domainKpi = useLiveIntelligenceStore((state) => state.domainKpi);

  const metrics: IntelMetric[] = useMemo(() => {
    const config = [
      { label: "Prestige Index", domain: "home" as LiveDomain, format: (v: number) => v.toFixed(1), unit: "", commentary: "Brand authority strengthening in GCC urban clusters." },
      { label: "Market Velocity", domain: "market" as LiveDomain, format: (v: number) => v.toFixed(1), unit: "x", commentary: "Transaction cadence accelerating in private channels." },
      { label: "Revenue Projection", domain: "reports" as LiveDomain, format: (v: number) => `AED ${Math.round(v)}M`, unit: "", commentary: "Quarter outcome favored by launch sequencing shift." },
      { label: "Influence Yield", domain: "influence" as LiveDomain, format: (v: number) => v.toFixed(1), unit: "x", commentary: "Creator cohort B outperforming expected trust transfer." },
      { label: "Lead Purity", domain: "lead" as LiveDomain, format: (v: number) => v.toFixed(1), unit: "", commentary: "Inbound quality improving from intent-based segmentation." },
      { label: "Founder Gravity", domain: "founder" as LiveDomain, format: (v: number) => v.toFixed(1), unit: "", commentary: "Founder narrative now driving direct board-level inquiries." },
    ];

    return config.map((c) => {
      const kpi = domainKpi[c.domain];
      const val = kpi.rollingAvg || (c.label === "Prestige Index" ? 96.4 : c.label === "Market Velocity" ? 2.8 : 85); // Fallback to realistic values if store is zero
      
      return {
        label: c.label,
        value: `${c.format(val)}${c.unit}`,
        delta: `${kpi.driftPct >= 0 ? "+" : ""}${kpi.driftPct}%`,
        commentary: c.commentary,
        status: kpi.driftPct > 5 ? "Live" : kpi.driftPct < -2 ? "Watch" : "Stable",
        spark: [30, 35, 32, 45, 50, 48, 60].map(v => v + (kpi.driftPct * 2)), // Simulated spark shift
        domain: c.domain,
      };
    });
  }, [domainKpi]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo("[data-hero='kicker']", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 })
        .fromTo("[data-hero='title']", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.95 }, "-=0.45")
        .fromTo("[data-hero='sub']", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.45")
        .fromTo("[data-hero='cta']", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 }, "-=0.45")
        .fromTo("[data-hero='strip']", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, "-=0.35");
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={rootRef}
      className="relative flex min-h-[100dvh] items-center overflow-hidden px-4 pt-24 pb-10 md:px-8 md:pt-32 md:pb-12"
    >
      <div className="apex-intel-grid" />
      <div className="apex-radial-orb left-[16%] top-[22%]" />
      <motion.div
        className="apex-radial-orb right-[-12rem] top-[20%]"
        animate={{ scale: [1, 1.06, 1], opacity: [0.32, 0.56, 0.32] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-350 flex-col items-center text-center">
        <p data-hero="kicker" className="mb-8 font-mono text-[10px] uppercase tracking-[0.42em] text-gold">
          Private AI Intelligence Ecosystem
        </p>

        <h1 data-hero="title" className="font-display text-[clamp(2.6rem,8.2vw,6.6rem)] leading-[0.92] text-warm-white">
          We Engineer <span className="apex-shimmer italic">Influence</span> For The Elite
        </h1>

        <p data-hero="sub" className="mt-7 max-w-[70ch] text-balance text-sm leading-7 text-titanium md:text-lg md:leading-8">
          APEX is a private AI intelligence operating system for elite operators, founders, and capital-backed luxury ecosystems.
          Detect shifts early, direct influence precisely, and execute with institutional confidence.
        </p>

        <div data-hero="cta" className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton href="/private-access" label="Request Access" />
          <MagneticButton href="#work" label="View Case Studies" variant="ghost" />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {[
            "Live Intelligence",
            "Signal Matrix Active",
            "Private Operator Network",
          ].map((chip, index) => (
            <motion.span
              key={chip}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.55 }}
              className="inline-flex items-center gap-2 rounded-[2px] border border-white/12 bg-white/[0.02] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-titanium"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${connection.state === 'connected' ? 'bg-signal-blue' : 'bg-risk-amber animate-pulse'}`} />
              {chip}
            </motion.span>
          ))}
        </div>

        <div data-hero="strip" className="mt-10 w-full rounded-[2px] border border-white/12 bg-gradient-to-b from-carbon/90 to-obsidian/90 p-3 shadow-[0_28px_70px_rgba(0,0,0,0.42)] md:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-titanium md:text-[10px]">Live Intelligence Overview</p>
            <span className={`inline-flex items-center gap-2 rounded-[2px] border border-signal-blue/35 bg-signal-blue/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-signal-blue ${connection.state !== 'connected' ? 'opacity-50' : ''}`}>
              <span className={`h-1.5 w-1.5 rounded-full bg-signal-blue ${connection.state === 'connected' ? 'animate-pulse' : ''}`} />
              {connection.state === 'connected' ? 'Stream Active' : 'Connecting...'}
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric, index) => (
              <motion.article
                key={metric.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 + index * 0.05, duration: 0.45 }}
                className="rounded-[2px] border border-white/10 bg-[#0d0f15] p-3 text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-titanium">{metric.label}</p>
                  <span
                    className={`inline-flex items-center rounded-[2px] px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em] ${
                      metric.status === "Live"
                        ? "border border-signal-blue/35 bg-signal-blue/12 text-signal-blue"
                        : metric.status === "Watch"
                          ? "border border-risk-amber/35 bg-risk-amber/10 text-risk-amber"
                          : "border border-white/20 bg-white/[0.04] text-titanium"
                    }`}
                  >
                    {metric.status}
                  </span>
                </div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="font-display text-2xl leading-none text-warm-white md:text-[1.75rem]">{metric.value}</p>
                  <p className={`font-mono text-[10px] uppercase tracking-[0.18em] ${metric.delta.startsWith('-') ? 'text-risk-amber' : 'text-gold-light'}`}>{metric.delta}</p>
                </div>
                <div className="mt-2">
                  <Sparkline values={metric.spark} />
                </div>
                <p className="mt-1 text-[11px] leading-5 text-beige/90">AI: {metric.commentary}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
