"use client";

import { motion } from "framer-motion";

const PANELS = [
  ["Luxury Lead Score", "94.2", "+12.1%"],
  ["Buyer Intent Heat", "88.5", "+8.7%"],
  ["Forecast Confidence", "91.3", "+3.2%"],
  ["Prestige Index", "96.0", "+6.4%"],
] as const;

const FEED = [
  "DIFC investor segment shows 2.4x response to founder-led narrative video.",
  "Jumeirah Bay inventory pressure expected in 14 days. Recommend pricing adjustment +3.5%.",
  "Elite broker cluster B now outperforming cluster A on appointment quality by 19%.",
  "Competitor launch detected in Palm. Suggested counter-positioning narrative generated.",
];

export default function ExecutiveDashboards() {
  return (
    <section className="border-y border-white/10 bg-obsidian/70 py-24 md:py-32" id="executive-dashboards">
      <div className="mx-auto max-w-335 px-4 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Executive Dashboards</p>
            <h2 className="font-display text-4xl leading-[0.95] text-warm-white md:text-6xl">Bloomberg-grade command for prestige portfolios.</h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-titanium">Data-heavy and decision-first. Every panel maps directly to revenue outcomes and strategic next actions.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="rounded-[2px] border border-white/10 bg-[#0b0b10] p-5 md:p-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {PANELS.map(([label, value, delta]) => (
                <motion.div key={label} whileHover={{ y: -4 }} className="rounded-[2px] border border-white/10 bg-white/[0.03] p-4" data-cursor="interactive">
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-titanium">{label}</p>
                  <p className="mt-2 font-display text-4xl text-gold-light">{value}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">{delta}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 rounded-[2px] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(200,169,110,0.16),transparent_56%),#0a0a0f] p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-light">Luxury Audience Heatmap</p>
              <div className="mt-4 grid grid-cols-8 gap-1.5">
                {Array.from({ length: 64 }).map((_, index) => (
                  <span
                    key={index}
                    className="aspect-square rounded-[2px]"
                    style={{
                      backgroundColor: `rgba(200,169,110,${Math.max(0.08, (index % 9) / 9)})`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2px] border border-gold/20 bg-gradient-to-b from-gold/[0.08] to-transparent p-5 md:p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-light">Real-time Intelligence Feed</p>
            <div className="mt-4 space-y-3">
              {FEED.map((line) => (
                <div key={line} className="rounded-[2px] border border-white/10 bg-black/30 p-3">
                  <p className="text-sm leading-6 text-beige">{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
