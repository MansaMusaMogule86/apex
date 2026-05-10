"use client";

import { motion } from "framer-motion";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

import type { ScenarioKpi } from "@/components/command-center/scenario/types";

type TopKpiRibbonProps = {
  data: ScenarioKpi[];
  loading?: boolean;
};

const MOMENTUM_STYLE = {
  accelerating: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  stable: "border-gold/40 bg-gold/12 text-gold-light",
  cooling: "border-amber-400/35 bg-amber-400/10 text-amber-100",
} as const;

function KpiSkeleton() {
  return <div className="h-48 animate-pulse rounded-xs border border-white/10 bg-white/3" />;
}

export default function TopKpiRibbon({ data, loading = false }: TopKpiRibbonProps) {
  if (loading) {
    return (
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <KpiSkeleton key={index} />
        ))}
      </section>
    );
  }

  if (!data.length) {
    return (
      <section className="rounded-xs border border-dashed border-white/20 bg-white/2 p-6 text-center">
        <p className="font-display text-2xl font-light text-warm-white">No scenario telemetry</p>
        <p className="mt-1 text-sm text-titanium">Enable simulation streams to initialize strategic KPIs.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {data.map((kpi, index) => (
        <motion.article
          key={kpi.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          className="rounded-xs border border-white/10 bg-linear-to-b from-white/6 to-white/2 p-4"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-titanium">{kpi.label}</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="font-display text-3xl font-light text-warm-white">{kpi.value}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold-light">
              {kpi.deltaPct >= 0 ? "+" : ""}
              {kpi.deltaPct}%
            </p>
          </div>
          <div className="mt-3 h-14">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={kpi.sparkline}>
                <Tooltip
                  contentStyle={{
                    background: "#0E0E12",
                    border: "1px solid rgba(200,169,110,0.35)",
                    borderRadius: 2,
                    fontSize: 11,
                  }}
                />
                <Line dataKey="y" type="monotone" stroke="#C8A96E" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">Confidence {kpi.confidence}%</span>
            <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]", MOMENTUM_STYLE[kpi.momentum]].join(" ")}>
              {kpi.momentum}
            </span>
          </div>
          <p className="mt-2 text-xs text-titanium">{kpi.commentary}</p>
        </motion.article>
      ))}
    </section>
  );
}
