"use client";

import { useState } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { FORECAST_DATA } from "@/components/command-center/market/data";
import MarketPanel from "@/components/command-center/market/MarketPanel";

type Horizon = "forecast30" | "forecast90" | "forecast180";

const HORIZON_LABEL: Record<Horizon, string> = {
  forecast30: "30-Day",
  forecast90: "90-Day",
  forecast180: "180-Day",
};

export default function ForecastingModule() {
  const [active, setActive] = useState<Horizon>("forecast90");

  return (
    <MarketPanel
      title="Demand Forecasting"
      subtitle="Forecasting Module"
      decisionTie="Use confidence and risk overlays to stage pricing and inventory bets."
      rightSlot={
        <div className="flex items-center gap-2">
          {(Object.keys(HORIZON_LABEL) as Horizon[]).map((horizon) => {
            const selected = active === horizon;
            return (
              <button
                key={horizon}
                type="button"
                onClick={() => setActive(horizon)}
                className={[
                  "rounded-xs border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em]",
                  selected
                    ? "border-gold/50 bg-gold/12 text-warm-white"
                    : "border-white/10 bg-white/2 text-titanium hover:border-gold/30 hover:text-warm-white",
                ].join(" ")}
              >
                {HORIZON_LABEL[horizon]}
              </button>
            );
          })}
        </div>
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={FORECAST_DATA}>
            <XAxis
              dataKey="label"
              stroke="#777884"
              tick={{ fill: "#9ca0ad", fontSize: 10 }}
              tickLine={false}
            />
            <YAxis stroke="#777884" tick={{ fill: "#9ca0ad", fontSize: 10 }} tickLine={false} />
            <Tooltip
              cursor={{ stroke: "rgba(200,169,110,0.25)" }}
              contentStyle={{
                background: "#0E0E12",
                border: "1px solid rgba(200,169,110,0.35)",
                borderRadius: 2,
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="riskUpper"
              stroke="transparent"
              fill="rgba(200,169,110,0.10)"
            />
            <Area
              type="monotone"
              dataKey="riskLower"
              stroke="transparent"
              fill="#0E0E12"
            />
            <Line type="monotone" dataKey="baseline" stroke="#898d98" strokeWidth={1.2} dot={false} />
            <Line type="monotone" dataKey={active} stroke="#C8A96E" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-titanium md:grid-cols-3">
        <p>30-day: tactical demand and inquiry acceleration.</p>
        <p>90-day: campaign and channel reallocation planning.</p>
        <p>180-day: strategic district exposure and inventory posture.</p>
      </div>
    </MarketPanel>
  );
}
