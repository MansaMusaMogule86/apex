"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { TRUST_TRANSFER } from "@/components/command-center/influence/data";
import InfluencePanel from "@/components/command-center/influence/InfluencePanel";

export default function TrustTransferEngine() {
  return (
    <InfluencePanel
      title="Trust Transfer Engine"
      subtitle="Trust and Compatibility"
      decisionTie="Maximize authority crossover while minimizing sentiment instability and safety risk."
    >
      <div className="h-64 w-full rounded-xs border border-white/10 bg-white/2 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={TRUST_TRANSFER}>
            <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
            <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
            <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
            <Line dataKey="trustCompatibility" stroke="#C8A96E" strokeWidth={1.7} dot={false} />
            <Line dataKey="brandSafety" stroke="#E8D7B5" strokeWidth={1.4} dot={false} />
            <Line dataKey="reputationAlignment" stroke="#9CB2C2" strokeWidth={1.4} dot={false} />
            <Line dataKey="sentimentStability" stroke="#8EC2A0" strokeWidth={1.4} dot={false} />
            <Line dataKey="authorityCrossover" stroke="#D8B680" strokeWidth={1.4} dot={false} />
            <Line dataKey="prestigeCompatibility" stroke="#F2E6CF" strokeWidth={1.4} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-titanium md:grid-cols-3">
        <p>Trust compatibility and brand safety</p>
        <p>Reputation alignment and sentiment stability</p>
        <p>Authority crossover and prestige compatibility</p>
      </div>
    </InfluencePanel>
  );
}
