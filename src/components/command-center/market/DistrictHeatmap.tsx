"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { DISTRICT_DATA } from "@/components/command-center/market/data";
import MarketPanel from "@/components/command-center/market/MarketPanel";

const METRICS = [
  { key: "demandIntensity", label: "Demand Intensity" },
  { key: "buyerConcentration", label: "Buyer Concentration" },
  { key: "luxuryMomentum", label: "Luxury Momentum" },
  { key: "capitalInflow", label: "Capital Inflow" },
  { key: "inventoryPressure", label: "Inventory Pressure" },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

const SILK = [0.16, 1, 0.3, 1] as const;

function tone(value: number) {
  if (value >= 90) return "bg-gold/40 border-gold/60 text-warm-white";
  if (value >= 80) return "bg-gold/30 border-gold/50 text-warm-white";
  if (value >= 70) return "bg-gold/20 border-gold/40 text-warm-white";
  if (value >= 60) return "bg-gold/15 border-gold/30 text-mist";
  return "bg-white/5 border-white/15 text-titanium";
}

export default function DistrictHeatmap() {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("demandIntensity");

  const ranking = useMemo(() => {
    return [...DISTRICT_DATA].sort((a, b) => b[activeMetric] - a[activeMetric]);
  }, [activeMetric]);

  return (
    <MarketPanel
      title="Dubai District Heatmap"
      subtitle="Main Heatmap"
      decisionTie="Route spend and broker deployment by district intensity and pressure."
      rightSlot={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {METRICS.map((metric) => {
            const active = activeMetric === metric.key;
            return (
              <button
                key={metric.key}
                type="button"
                onClick={() => setActiveMetric(metric.key)}
                className={[
                  "rounded-xs border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-all",
                  active
                    ? "border-gold/50 bg-gold/12 text-warm-white"
                    : "border-white/10 bg-white/3 text-titanium hover:border-gold/30 hover:text-warm-white",
                ].join(" ")}
              >
                {metric.label}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ranking.map((district, idx) => (
          <motion.article
            key={district.district}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: SILK, delay: idx * 0.03 }}
            className={[
              "rounded-xs border p-3",
              tone(district[activeMetric]),
            ].join(" ")}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="font-medium text-sm">{district.district}</p>
              <p className="font-mono text-[11px]">{district[activeMetric]} / 100</p>
            </div>
            <div className="space-y-2">
              {METRICS.map((metric) => (
                <div key={metric.key} className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
                    <span className="text-mist">{metric.label}</span>
                    <span>{district[metric.key]}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-xs bg-black/40">
                    <div
                      className="h-full rounded-xs bg-gold/70"
                      style={{ width: `${district[metric.key]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.article>
        ))}
      </div>
    </MarketPanel>
  );
}
