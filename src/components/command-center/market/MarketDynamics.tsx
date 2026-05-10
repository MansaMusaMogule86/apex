"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import MarketPanel from "@/components/command-center/market/MarketPanel";

const PRICING_PRESSURE = [
  { district: "Palm", pressure: 84, elasticity: 67 },
  { district: "DIFC", pressure: 79, elasticity: 72 },
  { district: "Downtown", pressure: 74, elasticity: 63 },
  { district: "Marina", pressure: 62, elasticity: 58 },
  { district: "Jumeirah Bay", pressure: 88, elasticity: 70 },
];

const BUYER_MOVEMENT = [
  { source: "London", inflow: 34 },
  { source: "Zurich", inflow: 27 },
  { source: "Singapore", inflow: 24 },
  { source: "Riyadh", inflow: 21 },
  { source: "Mumbai", inflow: 19 },
];

export default function MarketDynamics() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <MarketPanel
        title="Pricing Pressure Analysis"
        subtitle="Price Intelligence"
        decisionTie="Escalate pricing only where pressure and elasticity move in lockstep."
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PRICING_PRESSURE} barCategoryGap={12}>
              <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
              <XAxis dataKey="district" stroke="#858896" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#858896" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#0E0E12",
                  border: "1px solid rgba(200,169,110,0.35)",
                  borderRadius: 2,
                  fontSize: 11,
                }}
              />
              <Bar dataKey="pressure" radius={[2, 2, 0, 0]}>
                {PRICING_PRESSURE.map((entry) => (
                  <Cell key={entry.district} fill="rgba(200,169,110,0.72)" />
                ))}
              </Bar>
              <Bar dataKey="elasticity" fill="rgba(244,240,231,0.45)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </MarketPanel>

      <MarketPanel
        title="Luxury Buyer Movement"
        subtitle="Capital Route Analysis"
        decisionTie="Prioritize geo-source corridors with strongest inflow acceleration."
      >
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BUYER_MOVEMENT} layout="vertical" barCategoryGap={14}>
              <CartesianGrid stroke="rgba(200,169,110,0.09)" horizontal={false} />
              <XAxis type="number" stroke="#858896" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <YAxis type="category" dataKey="source" stroke="#858896" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} width={64} />
              <Tooltip
                contentStyle={{
                  background: "#0E0E12",
                  border: "1px solid rgba(200,169,110,0.35)",
                  borderRadius: 2,
                  fontSize: 11,
                }}
              />
              <Bar dataKey="inflow" fill="rgba(200,169,110,0.75)" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </MarketPanel>
    </div>
  );
}
