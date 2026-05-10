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

import { CULTURAL_MOMENTUM } from "@/components/command-center/influence/data";
import InfluencePanel from "@/components/command-center/influence/InfluencePanel";

export default function CulturalMomentumEngine() {
  return (
    <InfluencePanel
      title="Cultural Momentum Engine"
      subtitle="Cultural and Narrative Momentum"
      decisionTie="Advance creator allocations where narrative shifts and trend acceleration produce premium audience evolution."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="h-56 w-full rounded-xs border border-white/10 bg-white/2 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CULTURAL_MOMENTUM}>
              <defs>
                <linearGradient id="momentumFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8A96E" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C8A96E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
              <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
              <Area dataKey="trendAcceleration" stroke="#C8A96E" fill="url(#momentumFill)" strokeWidth={2} />
              <Line dataKey="narrativeShift" stroke="#E8D7B5" strokeWidth={1.4} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-56 w-full rounded-xs border border-white/10 bg-white/2 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CULTURAL_MOMENTUM}>
              <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
              <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
              <Line dataKey="prestigeMigration" stroke="#C8A96E" strokeWidth={1.5} dot={false} />
              <Line dataKey="audienceEvolution" stroke="#9CB2C2" strokeWidth={1.5} dot={false} />
              <Line dataKey="influenceSpikes" stroke="#D8C4A0" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </InfluencePanel>
  );
}
