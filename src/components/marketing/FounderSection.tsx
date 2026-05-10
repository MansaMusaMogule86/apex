"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export default function FounderSection() {
  return (
    <section id="founder" className="border-y border-white/10 bg-obsidian/60 py-24 md:py-32">
      <div className="mx-auto grid max-w-[1340px] gap-10 px-4 md:px-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <motion.div {...fadeUp} className="mx-auto w-full max-w-md lg:mx-0">
          <div className="relative rounded-[2px] border border-white/20 bg-[#0c0c10] p-3">
            <div className="aspect-[3/4] rounded-[2px] border border-gold/25 bg-[radial-gradient(circle_at_55%_20%,rgba(245,240,232,0.34),transparent_58%),linear-gradient(150deg,#2a2a2f,#09090d)]" />
            <span className="absolute bottom-6 left-6 border border-gold/40 bg-void/75 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.3em] text-gold-light">
              Founder
            </span>
          </div>
        </motion.div>

        <motion.div {...fadeUp} className="space-y-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Founder Philosophy</p>
          <h2 className="font-display text-4xl leading-[0.95] text-warm-white md:text-6xl">
            Influence is not noise.
            <br />
            It is strategic architecture.
          </h2>
          <p className="max-w-[60ch] text-base leading-8 text-titanium">
            We built APEX for decision-makers who cannot afford random growth. Every campaign is engineered through data, psychology, and elite positioning. Quiet signals. Precise execution. Compounding authority.
          </p>
          <blockquote className="border-l border-gold/60 pl-6 font-display text-2xl italic leading-relaxed text-beige md:text-3xl">
            &ldquo;Prestige is earned when intelligence and aesthetics move in perfect alignment.&rdquo;
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
