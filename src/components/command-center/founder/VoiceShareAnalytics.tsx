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

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { VOICE_SHARE } from "@/components/command-center/founder/data";

export default function VoiceShareAnalytics() {
  return (
    <AuthorityPanel
      title="Voice Share Analytics"
      subtitle="Influence Dominance"
      decisionTie="Defend founder dominance where audience migration is positive and overlap is strategic."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="h-60 w-full rounded-xs border border-white/10 bg-white/2 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={VOICE_SHARE} barCategoryGap={14}>
              <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
              <XAxis dataKey="name" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
              <Bar dataKey="founderShare" radius={[2, 2, 0, 0]}>
                {VOICE_SHARE.map((entry) => (
                  <Cell key={entry.name} fill="rgba(200,169,110,0.76)" />
                ))}
              </Bar>
              <Bar dataKey="competitorShare" fill="rgba(245,240,231,0.45)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xs border border-white/10 bg-white/2 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-titanium">Influence heatmap</p>
          <div className="grid grid-cols-4 gap-1">
            {VOICE_SHARE.flatMap((entry) =>
              [entry.founderShare, entry.overlap, entry.migration + 20, entry.competitorShare].map((value, index) => {
                const tone = value > 35 ? "bg-gold/40" : value > 20 ? "bg-gold/25" : "bg-white/8";
                return <div key={`${entry.name}-${index}`} className={`h-10 rounded-xs border border-white/10 ${tone}`} title={`${entry.name}: ${value}`} />;
              }),
            )}
          </div>
          <p className="mt-3 text-xs text-titanium">Heat intensity encodes founder dominance, overlap, and attention migration by cohort.</p>
        </div>
      </div>
    </AuthorityPanel>
  );
}
