"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

const METRICS = [
  "98% client retention",
  "340+ influencer network",
  "12 countries",
  "AED 1.2B attributed pipeline",
  "APEX ScoreTM 94.8",
  "AI intelligence index 9.7",
];

export default function PrestigeMetrics() {
  const row = [...METRICS, ...METRICS];

  return (
    <section id="metrics" className="border-y border-white/10 py-10 lg:py-14">
      <motion.div {...fadeUp} className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="apex-marquee">
          <div className="apex-marquee-track">
            {row.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="mx-2 flex min-w-max items-center gap-5 rounded-[2px] border border-gold/25 bg-gold/[0.04] px-5 py-2.5 text-[10px] font-mono uppercase tracking-[0.34em] text-gold-light md:mx-3 md:px-7"
              >
                <span className="size-1.5 rounded-full bg-gold/70" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
