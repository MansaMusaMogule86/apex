"use client";

import { motion } from "framer-motion";
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

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { AUTHORITY_TREND, NARRATIVE_SIGNALS } from "@/components/command-center/founder/data";

export default function NarrativeIntelligenceEngine() {
  return (
    <AuthorityPanel
      title="Narrative Intelligence Engine"
      subtitle="Main Center Panel"
      decisionTie="Scale only narratives that increase trust and investor confidence together."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-4">
          <div className="h-56 w-full rounded-xs border border-white/10 bg-white/2 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={AUTHORITY_TREND}>
                <defs>
                  <linearGradient id="narrVel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C8A96E" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#C8A96E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
                <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
                <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
                <Area dataKey="velocity" stroke="#C8A96E" fill="url(#narrVel)" strokeWidth={2} />
                <Line dataKey="trust" stroke="#EAD9B7" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="h-48 w-full rounded-xs border border-white/10 bg-white/2 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={AUTHORITY_TREND}>
                <CartesianGrid stroke="rgba(200,169,110,0.09)" vertical={false} />
                <XAxis dataKey="label" stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
                <YAxis stroke="#7D818E" tick={{ fill: "#9CA0AD", fontSize: 10 }} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0E0E12", border: "1px solid rgba(200,169,110,0.35)", borderRadius: 2, fontSize: 11 }} />
                <Line dataKey="perception" stroke="#9CB2C2" strokeWidth={1.8} dot={false} />
                <Line dataKey="trust" stroke="#C8A96E" strokeWidth={1.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          {NARRATIVE_SIGNALS.map((signal, index) => (
            <motion.article
              key={signal.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className="rounded-xs border border-white/10 bg-white/2 p-3"
            >
              <p className="text-sm font-medium text-warm-white">{signal.narrative}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <p className="text-titanium">Velocity <span className="text-gold-light">{signal.velocity}</span></p>
                <p className="text-titanium">Trust lift <span className="text-warm-white">+{signal.trustLift}%</span></p>
                <p className="text-titanium">Conversion <span className="text-warm-white">+{signal.conversionLift}%</span></p>
                <p className="text-titanium">Investor confidence <span className="text-warm-white">{signal.investorConfidence}</span></p>
                <p className="col-span-2 text-titanium">Prestige amplification <span className="text-warm-white">{signal.prestigeAmplification}</span></p>
              </div>
            </motion.article>
          ))}
          <article className="rounded-xs border border-gold/30 bg-gold/12 p-3 text-xs text-titanium">
            AI recommendation: concentrate founder narratives on governance and scarcity framing in investor-facing channels for the next 10-day cycle.
          </article>
        </div>
      </div>
    </AuthorityPanel>
  );
}
