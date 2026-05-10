"use client";

import { motion } from "framer-motion";
import { fadeUp, SILK_EASE } from "@/lib/motion";

const FEED = [
  "MENA high-net-worth segment: +18% engagement with cinematic launch format.",
  "Top-performing creator cluster aligns with prestige watch category this week.",
  "Recommendation: Shift 12% media to evening windows in DIFC and Marina zones.",
  "Brand heatmap signals opportunity spike in private aviation adjacent audiences.",
];

export default function LuxuryDashboardDemo() {
  return (
    <section id="dashboard-demo" className="relative border-y border-white/10 bg-obsidian/85 py-24 md:py-32">
      <div className="mx-auto max-w-[1340px] px-4 md:px-8">
        <motion.div {...fadeUp} className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-signal-blue">Luxury Dashboard Demo</p>
            <h2 className="font-display text-4xl text-warm-white md:text-6xl">Strategic clarity. In real time.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-titanium md:text-base">
            Built for boardrooms, founders, and private operators who require confidence at speed. Every signal is filtered through APEX intelligence models.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="grid gap-5 rounded-[2px] border border-white/10 bg-gradient-to-br from-carbon/90 to-obsidian/90 p-4 shadow-[0_28px_72px_rgba(0,0,0,0.45)] md:grid-cols-[1.4fr_1fr] md:p-6"
        >
          <div className="rounded-[2px] border border-white/10 bg-void/70 p-4 md:p-6">
            <div className="mb-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {[
                ["Audience Quality", "91.2"],
                ["Growth Forecast", "+27%"],
                ["Luxury Fit", "96.4"],
                ["Conversion Delta", "+14.7%"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[2px] border border-white/12 bg-white/[0.02] p-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-titanium">{label}</p>
                  <p className="mt-2 font-display text-2xl text-platinum">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {[72, 48, 91, 67, 88, 54].map((value, idx) => (
                <div key={idx} className="rounded-[2px] border border-white/10 bg-[#101018] px-3 py-4">
                  <p className="mb-4 font-mono text-[9px] uppercase tracking-[0.24em] text-mist">Signal {idx + 1}</p>
                  <div className="h-1.5 w-full rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: SILK_EASE, delay: idx * 0.06 }}
                      className="h-1.5 rounded-full bg-gradient-to-r from-signal-blue to-gold-light"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2px] border border-white/10 bg-[#0b0b10] p-4 md:p-5">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-signal-blue">AI Recommendation Feed</p>
            <div className="max-h-[330px] space-y-3 overflow-auto pr-1">
              {FEED.map((entry) => (
                <div key={entry} className="rounded-[2px] border border-white/10 bg-white/[0.02] p-3">
                  <p className="text-sm leading-6 text-platinum/90">{entry}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
