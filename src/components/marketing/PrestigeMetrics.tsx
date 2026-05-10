"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const METRICS = [
  "Signal Uptime 99.2%",
  "340+ verified influence nodes",
  "12 active markets",
  "AED 1.2B attributed pipeline",
  "APEX Operator Score 94.8",
  "AI intelligence confidence 9.7",
];

export default function PrestigeMetrics() {
  const row = [...METRICS, ...METRICS];

  return (
    <section id="metrics" className="border-y border-white/10 bg-obsidian/60 py-10 lg:py-14">
      <motion.div {...fadeUp} className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="apex-marquee">
          <div className="apex-marquee-track">
            {row.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="mx-2 flex min-w-max items-center gap-5 rounded-[2px] border border-white/15 bg-carbon/70 px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.32em] text-platinum md:mx-3 md:px-7"
              >
                <span className="size-1.5 rounded-full bg-signal-blue" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
