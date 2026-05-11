"use client";

import { motion } from "framer-motion";
import MagneticButton from "@/components/marketing/MagneticButton";
import { fadeUp } from "@/lib/motion";

export default function CTASection() {
  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="mx-auto max-w-280 px-4 md:px-8">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-xs border border-white/20 bg-linear-to-br from-carbon/90 via-graphite/80 to-obsidian p-8 shadow-[0_40px_100px_rgba(0,0,0,0.55)] md:p-14"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(110,140,255,0.26),transparent_45%),radial-gradient(circle_at_85%_78%,rgba(201,178,124,0.22),transparent_48%),linear-gradient(rgba(232,228,218,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(232,228,218,0.07)_1px,transparent_1px)] bg-size-[auto,auto,46px_46px,46px_46px] opacity-45" />

          <div className="relative z-10">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-signal-blue">Private Access</p>
            <h2 className="font-display text-5xl leading-[0.92] text-warm-white md:text-7xl">Your Market Won&apos;t Wait.</h2>
            <p className="mt-5 max-w-[54ch] text-base leading-8 text-[#cbc6bc] md:text-lg">
              APEX accepts a limited number of clients each quarter.
            </p>

            <form className="mt-9 grid gap-3 md:grid-cols-[1fr_auto]" action="#" method="post">
              <label className="sr-only" htmlFor="privateEmail">
                Private email address
              </label>
              <input
                id="privateEmail"
                name="email"
                type="email"
                required
                placeholder="Enter your private email"
                className="apex-glass h-12 rounded-xs border-white/20 px-4 text-sm text-warm-white outline-none placeholder:text-titanium focus:border-signal-blue/45 focus:shadow-[0_0_28px_rgba(110,140,255,0.22)]"
              />
              <MagneticButton href="/private-access" label="Request Access" className="h-12 w-full md:w-auto" />
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
