"use client";

import { motion } from "framer-motion";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import type { KpiMetric } from "@/components/command-center/home/types";

type KpiRibbonProps = {
  data: KpiMetric[];
  loading?: boolean;
};

function KpiCardSkeleton() {
  return (
    <div className="rounded-[2px] border border-white/10 bg-white/[0.02] p-4 animate-pulse">
      <div className="h-3 w-28 bg-white/10" />
      <div className="mt-3 h-8 w-24 bg-white/10" />
      <div className="mt-3 h-10 w-full bg-white/10" />
    </div>
  );
}

export default function KpiRibbon({ data, loading = false }: KpiRibbonProps) {
  if (loading) {
    return (
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <KpiCardSkeleton key={index} />
        ))}
      </section>
    );
  }

  if (!data.length) {
    return (
      <section className="rounded-[2px] border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
        <p className="font-display text-3xl text-warm-white">No KPI intelligence yet</p>
        <p className="mt-2 text-sm text-titanium">Connect your data streams to initialize strategic telemetry.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {data.map((metric, index) => (
        <motion.article
          key={metric.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -4 }}
          className="group rounded-[2px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 transition-colors duration-300 hover:border-gold/35"
          data-cursor="interactive"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-mist">{metric.label}</p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="font-display text-4xl leading-none text-warm-white">{metric.value}</p>
            <span
              className={`rounded-[2px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${
                metric.deltaPct >= 0
                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                  : "border-red-400/40 bg-red-400/10 text-red-300"
              }`}
            >
              {metric.deltaPct >= 0 ? "+" : ""}
              {metric.deltaPct}%
            </span>
          </div>

          <div className="mt-3 h-14">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metric.sparkline}>
                <Tooltip
                  contentStyle={{
                    border: "1px solid rgba(200,169,110,0.25)",
                    borderRadius: 2,
                    backgroundColor: "#0e0e12",
                    color: "#f5f0e8",
                    fontSize: 11,
                  }}
                />
                <Line dataKey="y" type="monotone" stroke="#c8a96e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-titanium">Confidence {metric.confidence}%</p>
            <div className="h-1.5 w-20 rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-gold"
                initial={{ width: 0 }}
                animate={{ width: `${metric.confidence}%` }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-titanium">{metric.commentary}</p>
        </motion.article>
      ))}
    </section>
  );
}
