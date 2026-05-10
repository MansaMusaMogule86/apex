"use client";

import { motion } from "framer-motion";
import MagneticButton from "@/components/marketing/MagneticButton";
import { fadeUp } from "@/lib/motion";

export default function CTASection() {
  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="mx-auto max-w-[1120px] px-4 md:px-8">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-[2px] border border-gold/30 bg-gradient-to-br from-gold/[0.14] via-[#14141c] to-[#0a0a0e] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.55)] md:p-14"
        >
          <div className="absolute -right-28 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

          <div className="relative z-10">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-gold-light">Private Access</p>
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
                className="apex-glass h-12 rounded-[2px] border-gold/30 px-4 text-sm text-warm-white outline-none placeholder:text-titanium focus:border-gold focus:shadow-[0_0_28px_rgba(200,169,110,0.25)]"
              />
              <MagneticButton href="#" label="Request Access" className="h-12 w-full md:w-auto" />
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
