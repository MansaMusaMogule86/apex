"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AUDIENCE_INTEL } from "@/components/command-center/influence/data";
import InfluencePanel from "@/components/command-center/influence/InfluencePanel";

export default function AudienceIntelligenceEngine() {
  return (
    <InfluencePanel
      title="Audience Intelligence Engine"
      subtitle="Audience and Wealth Signals"
      decisionTie="Prioritize creators where wealth concentration, HNWI overlap, and attention density converge."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="h-60 w-full rounded-xs border border-white/10 bg-white/2 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={AUDIENCE_INTEL}>
              <defs>
                <linearGradient id="wealthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8A96E" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C8A96E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
              <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
              <Area dataKey="wealthConcentration" stroke="#C8A96E" fill="url(#wealthFill)" strokeWidth={2} />
              <Line dataKey="hnwiOverlap" stroke="#E8D7B5" strokeWidth={1.4} dot={false} />
              <Line dataKey="attentionDensity" stroke="#8FA6B6" strokeWidth={1.4} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-60 w-full rounded-xs border border-white/10 bg-white/2 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={AUDIENCE_INTEL}>
              <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
              <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
              <Line dataKey="luxuryBehavior" stroke="#C8A96E" strokeWidth={1.5} dot={false} />
              <Line dataKey="culturalPositioning" stroke="#D8C4A0" strokeWidth={1.5} dot={false} />
              <Line dataKey="prestigeMigration" stroke="#8FA6B6" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-titanium md:grid-cols-4">
        <p>Audience geography and wealth concentration</p>
        <p>HNWI overlap and luxury behavior clusters</p>
        <p>Cultural positioning and prestige migration</p>
        <p>Attention density acceleration</p>
      </div>
    </InfluencePanel>
  );
}
