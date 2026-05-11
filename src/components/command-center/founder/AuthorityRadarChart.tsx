"use client";

import { motion } from "framer-motion";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { AUTHORITY_RADAR } from "@/components/command-center/founder/data";

export default function AuthorityRadarChart() {
  const apex = AUTHORITY_RADAR;
  const avgScore = Math.round(apex.reduce((sum, p) => sum + p.score, 0) / apex.length);
  const avgBench = Math.round(apex.reduce((sum, p) => sum + p.benchmark, 0) / apex.length);

  return (
    <AuthorityPanel
      title="Authority Radar"
      subtitle="Multi-Dimensional Score"
      decisionTie="Sustain dominance across all six authority vectors simultaneously."
      rightSlot={
        <div className="flex flex-col items-end gap-1">
          <p className="font-display text-2xl font-light text-warm-white">{avgScore}</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold/60">mean score</p>
        </div>
      }
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={apex} cx="50%" cy="50%" outerRadius="76%">
            <PolarGrid stroke="rgba(200,169,110,0.12)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "#9CA0AD", fontSize: 9, fontFamily: "var(--font-mono)" }}
            />
            <Tooltip
              contentStyle={{
                background: "#0E0E12",
                border: "1px solid rgba(200,169,110,0.35)",
                borderRadius: 2,
                fontSize: 11,
              }}
            />
            <Radar
              name="APEX Founder"
              dataKey="score"
              stroke="#C8A96E"
              fill="#C8A96E"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Radar
              name="Benchmark"
              dataKey="benchmark"
              stroke="rgba(245,240,231,0.28)"
              fill="rgba(245,240,231,0.04)"
              strokeWidth={1.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.14em]">
          <span className="flex items-center gap-1.5 text-gold-light">
            <span className="h-0.5 w-4 rounded-full bg-gold" />
            APEX Founder
          </span>
          <span className="flex items-center gap-1.5 text-titanium">
            <span className="h-0.5 w-4 rounded-full bg-white/25" />
            Benchmark
          </span>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1 font-mono text-[10px] text-titanium"
        >
          Gap <span className="ml-1 text-gold-light">+{avgScore - avgBench} pts</span>
        </motion.div>
      </div>
    </AuthorityPanel>
  );
}
