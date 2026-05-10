"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SILK_EASE } from "@/lib/motion";

const TESTIMONIALS = [
  [
    "APEX engineered a strategic influence architecture that made our market narrative impossible to ignore.",
    "Managing Director · Private Luxury Group",
  ],
  [
    "Their intelligence layer gave us decision confidence at a level usually reserved for institutional firms.",
    "Founder · Consumer Prestige Brand",
  ],
  [
    "Quiet execution, serious outcomes. We saw premium demand quality improve in under one quarter.",
    "Partner · Dubai Family Office",
  ],
] as const;

export default function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Testimonials</p>

        <div className="rounded-[2px] border-y border-white/15 py-10 md:py-14">
          <AnimatePresence mode="wait">
            <motion.figure
              key={active}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease: SILK_EASE }}
            >
              <blockquote className="font-display text-4xl leading-[1.06] text-warm-white md:text-6xl">
                &ldquo;{TESTIMONIALS[active][0]}&rdquo;
              </blockquote>
              <figcaption className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-titanium">
                {TESTIMONIALS[active][1]}
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          <div className="mt-8 flex gap-2">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View testimonial ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${active === index ? "w-12 bg-gold" : "w-6 bg-white/20"}`}
                data-cursor="interactive"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
