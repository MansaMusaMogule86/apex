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

import { EVIDENCE, FORECAST_SERIES } from "@/components/command-center/reports/data";
import ReportsPanel from "@/components/command-center/reports/ReportsPanel";
import type { ReportCard } from "@/components/command-center/reports/types";

type ReportReaderExperienceProps = {
  report: ReportCard;
};

export default function ReportReaderExperience({ report }: ReportReaderExperienceProps) {
  return (
    <ReportsPanel
      title="Report Reader Experience"
      subtitle="Immersive Institutional Viewer"
      decisionTie="Convert synthesized intelligence into board-level actions with clear risk and confidence framing."
    >
      <div className="space-y-4">
        <section className="rounded-xs border border-white/10 bg-white/2 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold/70">Executive summary</p>
          <p className="mt-1 text-sm text-warm-white">{report.summary}</p>
          <div className="mt-2 grid gap-2 text-xs text-titanium md:grid-cols-3">
            <p>AI confidence {report.confidence}%</p>
            <p>Impact {report.executiveImpact}</p>
            <p>Risk overlay {report.risk}</p>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="h-56 rounded-xs border border-white/10 bg-white/2 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FORECAST_SERIES}>
                <defs>
                  <linearGradient id="reportForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C8A96E" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#C8A96E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
                <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
                <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
                <Area dataKey="projected" stroke="#C8A96E" fill="url(#reportForecast)" strokeWidth={2} />
                <Line dataKey="baseline" stroke="#E8D7B5" strokeWidth={1.4} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="h-56 rounded-xs border border-white/10 bg-white/2 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FORECAST_SERIES}>
                <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
                <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
                <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
                <Line dataKey="riskLower" stroke="#B97070" strokeWidth={1.4} dot={false} />
                <Line dataKey="riskUpper" stroke="#8EA4B3" strokeWidth={1.4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <article className="rounded-xs border border-white/10 bg-white/2 p-3 text-xs text-titanium">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold/70">Strategic recommendations</p>
            <p className="mt-2">{report.suggestedActions.join(" | ")}</p>
            <p className="mt-2">Narrative analysis: maintain exclusivity tone while tightening trust reinforcement cadence.</p>
            <p className="mt-2">Competitive positioning: competitor narrative coherence weakening in top value cohorts.</p>
            <p className="mt-2">Founder authority implication: increase founder-facing evidence content to preserve confidence edge.</p>
          </article>
          <article className="rounded-xs border border-white/10 bg-white/2 p-3 text-xs text-titanium">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold/70">Supporting intelligence evidence</p>
            <div className="mt-2 space-y-2">
              {EVIDENCE.map((item) => (
                <div key={item.id} className="rounded-xs border border-white/10 bg-white/3 p-2">
                  <p className="text-warm-white">{item.source}</p>
                  <p className="mt-1">{item.detail}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.13em] text-gold-light">{item.confidence}% confidence</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </ReportsPanel>
  );
}
