"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { INTENT_TREND } from "@/components/command-center/lead/data";
import LeadPanel from "@/components/command-center/lead/LeadPanel";

const METRICS = [
  { id: "intentTrend", label: "Intent trends", color: "#C8A96E" },
  { id: "attentionDepth", label: "Attention depth", color: "#D9BE8A" },
  { id: "conversionReadiness", label: "Conversion readiness", color: "#E9DCC1" },
  { id: "trustAlignment", label: "Trust alignment", color: "#8EA4B3" },
  { id: "urgencyMomentum", label: "Urgency momentum", color: "#D18C7A" },
] as const;

type Metric = (typeof METRICS)[number]["id"];

export default function BuyerIntentEngine() {
  const [activeMetric, setActiveMetric] = useState<Metric>("intentTrend");

  return (
    <LeadPanel
      title="Buyer Intent Engine"
      subtitle="Intent Intelligence"
      decisionTie="Focus action plans where urgency and trust move together."
      rightSlot={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {METRICS.map((metric) => {
            const active = metric.id === activeMetric;
            return (
              <button
                key={metric.id}
                type="button"
                onClick={() => setActiveMetric(metric.id)}
                className={[
                  "rounded-xs border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                  active
                    ? "border-gold/45 bg-gold/12 text-warm-white"
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
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={INTENT_TREND}>
            <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
            <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
            <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
            <Tooltip
              cursor={{ stroke: "rgba(200,169,110,0.25)" }}
              contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }}
            />
            {METRICS.map((metric) => (
              <Line
                key={metric.id}
                type="monotone"
                dataKey={metric.id}
                stroke={metric.color}
                strokeWidth={metric.id === activeMetric ? 2.1 : 1.1}
                opacity={metric.id === activeMetric ? 1 : 0.35}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </LeadPanel>
  );
}
