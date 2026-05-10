"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fadeUp, SILK_EASE, stagger } from "@/lib/motion";

const SUITE_ITEMS = [
  "Live metrics telemetry",
  "Influencer scoring engine",
  "Audience micro-segmentation",
  "Market sentiment analysis",
  "Predictive growth forecasting",
  "AI recommendation feed",
];

const TREND = [
  { month: "Jan", value: 31 },
  { month: "Feb", value: 44 },
  { month: "Mar", value: 38 },
  { month: "Apr", value: 56 },
  { month: "May", value: 64 },
  { month: "Jun", value: 72 },
];

export default function AISuite() {
  return (
    <section id="ai-suite" className="relative py-28 md:py-36">
      <div className="mx-auto grid max-w-[1340px] gap-14 px-4 md:px-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <motion.div {...fadeUp} className="space-y-7">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold">AI Intelligence Suite</p>
          <h2 className="font-display text-5xl leading-[0.95] text-warm-white md:text-7xl">
            The private
            <br />
            operating system
            <br />
            for <em className="not-italic text-gold">influence.</em>
          </h2>
          <p className="max-w-[35ch] text-base leading-8 text-titanium">
            Designed like a private banking terminal for modern luxury operators. See audience pressure points, creative performance, and strategic next moves before your competitors do.
          </p>
          <motion.ul
            variants={stagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-3 pt-2"
          >
            {SUITE_ITEMS.map((item) => (
              <motion.li
                key={item}
                variants={{
                  initial: { opacity: 0, y: 16 },
                  whileInView: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SILK_EASE } },
                }}
                className="rounded-[2px] border border-white/10 bg-white/[0.02] px-4 py-3 text-sm tracking-wide text-warm-white/90"
              >
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="apex-glass rounded-[2px] border-gold/20 p-5 shadow-[0_32px_72px_rgba(0,0,0,0.45)] md:p-7"
        >
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-titanium">APEX Intelligence Console</p>
            <span className="rounded-[2px] border border-gold/40 bg-gold/[0.1] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-gold-light">
              Live
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Sentiment", value: "+22%" },
              { label: "Influence Index", value: "94.8" },
              { label: "Forecast Uplift", value: "+31%" },
            ].map((cell) => (
              <div key={cell.label} className="rounded-[2px] border border-white/10 bg-void/70 p-4">
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.28em] text-titanium">{cell.label}</p>
                <p className="font-display text-3xl text-gold-light">{cell.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 h-56 rounded-[2px] border border-white/10 bg-[#0a0a0e] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND} margin={{ left: -16, right: 8, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c8a96e" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#c8a96e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#8f919a", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8f919a", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 2,
                    border: "1px solid rgba(200,169,110,0.3)",
                    backgroundColor: "#0e0e12",
                    color: "#f5f0e8",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#c8a96e" strokeWidth={2} fill="url(#goldArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
