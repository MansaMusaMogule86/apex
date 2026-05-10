"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PanelCard from "@/components/command-center/home/PanelCard";
import {
  FOUNDER_TIMELINE,
  INFLUENCE_MATRIX,
  MOMENTUM_DATA,
  REVENUE_ATTRIBUTION,
} from "@/components/command-center/home/data";

const HEATMAP_ROWS = ["Palm", "DIFC", "Downtown", "JBR", "Jumeirah Bay"];
const HEATMAP_COLS = ["HNWI", "Family Office", "Broker Elite", "Founder-led", "Global Investor", "Relocation"];

export default function LowerAnalytics() {
  const heatmap = useMemo(
    () =>
      HEATMAP_ROWS.map((row, rIndex) => ({
        row,
        values: HEATMAP_COLS.map((col, cIndex) => ({
          id: `${row}-${col}`,
          label: `${row} / ${col}`,
          intensity: Math.min(0.95, 0.25 + ((rIndex + cIndex) % 6) * 0.12),
        })),
      })),
    [],
  );

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <PanelCard
        title="Revenue Attribution"
        subtitle="Channel contribution by month"
        decisionTie="Reallocate spend by top-contributing trust channels"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_ATTRIBUTION}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#9a9a9a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9a9a9a", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                contentStyle={{ borderRadius: 2, border: "1px solid rgba(200,169,110,0.3)", background: "#0e0e12" }}
              />
              <Bar dataKey="founder" stackId="a" fill="#c8a96e" />
              <Bar dataKey="influencer" stackId="a" fill="#b78d4d" />
              <Bar dataKey="paid" stackId="a" fill="#6a6a72" />
              <Bar dataKey="referral" stackId="a" fill="#4f4f58" />
              <Bar dataKey="direct" stackId="a" fill="#35353f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      <PanelCard
        title="Buyer Intent Heatmap"
        subtitle="Luxury segment density by district"
        decisionTie="Deploy brokers and creatives to hottest district-segment cells"
      >
        <div className="overflow-auto">
          <div className="min-w-[560px]">
            <div className="mb-2 grid grid-cols-7 gap-1.5">
              <span />
              {HEATMAP_COLS.map((col) => (
                <p key={col} className="text-center font-mono text-[9px] uppercase tracking-[0.16em] text-mist">
                  {col}
                </p>
              ))}
            </div>
            <div className="space-y-1.5">
              {heatmap.map((row) => (
                <div key={row.row} className="grid grid-cols-7 gap-1.5">
                  <p className="flex items-center font-mono text-[9px] uppercase tracking-[0.16em] text-titanium">{row.row}</p>
                  {row.values.map((cell) => (
                    <button
                      key={cell.id}
                      type="button"
                      className="h-10 rounded-[2px] border border-gold/20 transition-transform hover:scale-[1.03]"
                      style={{ backgroundColor: `rgba(200, 169, 110, ${cell.intensity})` }}
                      title={`${cell.label}: ${(cell.intensity * 100).toFixed(0)} intensity`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PanelCard>

      <PanelCard
        title="Market Momentum"
        subtitle="APEX vs market baseline"
        decisionTie="Amplify channels where APEX momentum divergence is widest"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOMENTUM_DATA}>
              <defs>
                <linearGradient id="apexMomentum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c8a96e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#c8a96e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#9a9a9a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9a9a9a", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ borderRadius: 2, border: "1px solid rgba(200,169,110,0.3)", background: "#0e0e12" }} />
              <Area type="monotone" dataKey="apex" stroke="#c8a96e" fill="url(#apexMomentum)" strokeWidth={2.2} />
              <Line type="monotone" dataKey="market" stroke="#8f919a" strokeWidth={1.8} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      <PanelCard
        title="Founder Authority Timeline"
        subtitle="Authority index vs conversion impact"
        decisionTie="Increase founder publication cadence at conversion acceleration points"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={FOUNDER_TIMELINE}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#9a9a9a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9a9a9a", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={{ borderRadius: 2, border: "1px solid rgba(200,169,110,0.3)", background: "#0e0e12" }} />
              <Line type="monotone" dataKey="authority" stroke="#e2c99a" strokeWidth={2.2} dot={false} />
              <Line type="monotone" dataKey="conversion" stroke="#c8a96e" strokeWidth={2.2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      <PanelCard
        title="Influence Performance Matrix"
        subtitle="Reach, trust, and yield by influence channel"
        decisionTie="Prioritize channels with highest trust-yield ratio"
        className="xl:col-span-2"
      >
        <div className="overflow-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gold/10">
                {[
                  "Channel",
                  "Reach",
                  "Trust",
                  "Yield",
                  "Strategic note",
                ].map((header) => (
                  <th key={header} className="px-3 py-2 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INFLUENCE_MATRIX.map((row) => (
                <tr key={row.name} className="border-b border-white/10">
                  <td className="px-3 py-3 font-display text-2xl text-warm-white">{row.name}</td>
                  <td className="px-3 py-3 text-sm text-beige">{row.reach}</td>
                  <td className="px-3 py-3 text-sm text-beige">{row.trust}</td>
                  <td className="px-3 py-3 text-sm text-beige">{row.yield}</td>
                  <td className="px-3 py-3 text-sm text-titanium">
                    {row.yield > 88
                      ? "Scale premium allocation"
                      : row.yield > 80
                        ? "Maintain, monitor trust"
                        : "Optimize before scaling"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </section>
  );
}
