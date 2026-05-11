"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { EXTENDED_TREND, NARRATIVE_SIGNALS } from "@/components/command-center/founder/data";

export default function NarrativeIntelligenceEngine() {
  const latest = EXTENDED_TREND[EXTENDED_TREND.length - 1]!;
  const prev = EXTENDED_TREND[EXTENDED_TREND.length - 2]!;
  const authDelta = latest.authority - prev.authority;

  return (
    <AuthorityPanel
      title="Narrative Intelligence Engine"
      subtitle="Main Center Panel"
      decisionTie="Scale only narratives that increase trust and investor confidence together."
      rightSlot={
        <div className="flex flex-col items-end gap-1">
          <p className="font-display text-2xl font-light text-warm-white">{latest.authority}</p>
          <p
            className={[
              "font-mono text-[10px] uppercase tracking-[0.15em]",
              authDelta >= 0 ? "text-emerald-300" : "text-rose-300",
            ].join(" ")}
          >
            {authDelta >= 0 ? "+" : ""}
            {authDelta} this week
          </p>
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="space-y-3">
          {/* 12-week authority + trust composite */}
          <div className="h-52 w-full rounded-xs border border-white/10 bg-white/2 p-2">
            <p className="mb-1 px-1 font-mono text-[9px] uppercase tracking-[0.18em] text-mist">
              12-week authority composite
            </p>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={EXTENDED_TREND} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="narrAuthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C8A96E" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#C8A96E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="narrTrustGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6E8CFF" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#6E8CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(200,169,110,0.07)" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="#7D818E"
                  tick={{ fill: "#9CA0AD", fontSize: 9 }}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  stroke="#7D818E"
                  tick={{ fill: "#9CA0AD", fontSize: 9 }}
                  tickLine={false}
                  domain={[40, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0E0E12",
                    border: "1px solid rgba(200,169,110,0.35)",
                    borderRadius: 2,
                    fontSize: 11,
                  }}
                />
                <ReferenceLine y={80} stroke="rgba(200,169,110,0.2)" strokeDasharray="3 3" />
                <Area
                  dataKey="authority"
                  stroke="#C8A96E"
                  fill="url(#narrAuthGrad)"
                  strokeWidth={2}
                  name="Authority"
                />
                <Area
                  dataKey="trust"
                  stroke="#6E8CFF"
                  fill="url(#narrTrustGrad)"
                  strokeWidth={1.5}
                  name="Trust"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* prestige + voice share */}
          <div className="h-40 w-full rounded-xs border border-white/10 bg-white/2 p-2">
            <p className="mb-1 px-1 font-mono text-[9px] uppercase tracking-[0.18em] text-mist">
              Prestige & voice share
            </p>
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={EXTENDED_TREND} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="rgba(200,169,110,0.07)" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="#7D818E"
                  tick={{ fill: "#9CA0AD", fontSize: 9 }}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  stroke="#7D818E"
                  tick={{ fill: "#9CA0AD", fontSize: 9 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0E0E12",
                    border: "1px solid rgba(200,169,110,0.35)",
                    borderRadius: 2,
                    fontSize: 11,
                  }}
                />
                <Line
                  dataKey="prestige"
                  stroke="#E8DAC0"
                  strokeWidth={1.8}
                  dot={false}
                  name="Prestige"
                />
                <Line
                  dataKey="voiceShare"
                  stroke="#9CB2C2"
                  strokeWidth={1.4}
                  dot={false}
                  name="Voice Share"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Narrative signal cards */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
            Active narratives
          </p>
          {NARRATIVE_SIGNALS.map((signal, index) => (
            <motion.article
              key={signal.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="rounded-xs border border-white/10 bg-white/2 p-3"
            >
              <p className="text-sm font-medium leading-snug text-warm-white">
                {signal.narrative}
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <div className="flex justify-between text-titanium">
                  <span>Velocity</span>
                  <span className="text-gold-light">{signal.velocity}</span>
                </div>
                <div className="flex justify-between text-titanium">
                  <span>Trust lift</span>
                  <span className="text-warm-white">+{signal.trustLift}%</span>
                </div>
                <div className="flex justify-between text-titanium">
                  <span>Conversion</span>
                  <span className="text-warm-white">+{signal.conversionLift}%</span>
                </div>
                <div className="flex justify-between text-titanium">
                  <span>Investor conf.</span>
                  <span className="text-warm-white">{signal.investorConfidence}</span>
                </div>
                <div className="col-span-2 flex justify-between text-titanium">
                  <span>Prestige amp.</span>
                  <span className="text-warm-white">{signal.prestigeAmplification}</span>
                </div>
              </div>

              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${signal.velocity}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                  className="h-full rounded-full bg-gold/60"
                />
              </div>
            </motion.article>
          ))}

          <article className="rounded-xs border border-gold/28 bg-gold/8 p-3 text-xs text-titanium">
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.16em] text-gold/70">
              AI recommendation
            </p>
            Concentrate founder narratives on governance and scarcity framing in investor-facing
            channels for the next 10-day cycle.
          </article>
        </div>
      </div>
    </AuthorityPanel>
  );
}
