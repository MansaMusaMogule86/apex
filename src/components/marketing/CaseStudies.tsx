"use client";

import { motion } from "framer-motion";
import { fadeUp, SILK_EASE } from "@/lib/motion";

const CASES = [
  ["Luxury real estate launch", "+41% qualified demand"],
  ["Celebrity brand campaign", "118M premium impressions"],
  ["DIFC private members club", "3.2x conversion uplift"],
  ["Private aviation campaign", "AED 86M attributed pipeline"],
  ["Luxury clinic growth system", "92% retention across six quarters"],
] as const;

export default function CaseStudies() {
  return (
    <section id="work" className="py-24 md:py-32">
      <div className="mx-auto max-w-335 px-4 md:px-8">
        <motion.div {...fadeUp} className="mb-10">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Selected Work</p>
          <h2 className="font-display text-4xl leading-[0.95] text-warm-white md:text-6xl">
            Cinematic execution.
            <br />
            Commercial precision.
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          {CASES.map(([title, result], index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.85, ease: SILK_EASE, delay: index * 0.06 }}
              whileHover={{ y: -8 }}
              className={`group relative overflow-hidden rounded-[2px] border border-white/12 p-6 md:p-8 ${
                index === 0 ? "md:col-span-2 min-h-[340px]" : "min-h-[300px]"
              }`}
              data-cursor="interactive"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(226,201,154,0.22),transparent_46%),linear-gradient(145deg,#171721,#09090f)] transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />

              <div className="relative z-10 flex h-full flex-col">
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-gold/90">Case Study 0{index + 1}</p>
                <h3 className="max-w-[22ch] font-display text-3xl text-warm-white md:text-5xl">{title}</h3>
                <div className="flex-1" />
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-light">{result}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
