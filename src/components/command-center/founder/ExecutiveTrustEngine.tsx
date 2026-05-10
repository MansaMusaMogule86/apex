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

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { TRUST_ENGINE } from "@/components/command-center/founder/data";

export default function ExecutiveTrustEngine() {
  return (
    <AuthorityPanel
      title="Executive Trust Engine"
      subtitle="Trust and Risk"
      decisionTie="Reduce volatility and reputation risk while compounding HNWI engagement quality."
    >
      <div className="h-64 w-full rounded-xs border border-white/10 bg-white/2 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={TRUST_ENGINE}>
            <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
            <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
            <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
            <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
            <Line dataKey="trustVolatility" stroke="#D08E7D" strokeWidth={1.7} dot={false} />
            <Line dataKey="reputationRisk" stroke="#B76A6A" strokeWidth={1.7} dot={false} />
            <Line dataKey="sentiment" stroke="#C8A96E" strokeWidth={1.7} dot={false} />
            <Line dataKey="positioning" stroke="#E8DAC0" strokeWidth={1.4} dot={false} />
            <Line dataKey="hnwiQuality" stroke="#8EA4B3" strokeWidth={1.4} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-titanium md:grid-cols-5">
        <p>Trust volatility</p>
        <p>Reputation risk</p>
        <p>Luxury audience sentiment</p>
        <p>Executive positioning strength</p>
        <p>HNWI engagement quality</p>
      </div>
    </AuthorityPanel>
  );
}
