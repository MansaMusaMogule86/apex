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

import ScenarioPanel from "@/components/command-center/scenario/ScenarioPanel";
import type { ForecastPoint } from "@/components/command-center/scenario/types";

type ForecastVisualizationEngineProps = {
  data: ForecastPoint[];
};

export default function ForecastVisualizationEngine({ data }: ForecastVisualizationEngineProps) {
  return (
    <ScenarioPanel
      title="Forecast Visualization Engine"
      subtitle="Forecast and Outcome Visualization"
      decisionTie="Compare scenario trajectories across revenue, prestige, trust, influence, and competitor response."
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-56 rounded-xs border border-white/10 bg-white/2 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8A96E" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C8A96E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
              <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
              <Area dataKey="revenue" stroke="#C8A96E" fill="url(#revenueFill)" strokeWidth={2} />
              <Line dataKey="marketPenetration" stroke="#9CB2C2" strokeWidth={1.4} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-56 rounded-xs border border-white/10 bg-white/2 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
              <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
              <Line dataKey="prestige" stroke="#C8A96E" strokeWidth={1.5} dot={false} />
              <Line dataKey="trust" stroke="#E8D7B5" strokeWidth={1.5} dot={false} />
              <Line dataKey="influence" stroke="#8FA6B6" strokeWidth={1.5} dot={false} />
              <Line dataKey="investorConfidence" stroke="#8EC2A0" strokeWidth={1.5} dot={false} />
              <Line dataKey="competitorResponse" stroke="#D68B8B" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ScenarioPanel>
  );
}
