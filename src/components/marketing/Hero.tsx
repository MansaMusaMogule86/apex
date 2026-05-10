"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import MagneticButton from "@/components/marketing/MagneticButton";

export default function Hero() {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .fromTo("[data-hero='kicker']", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
        .fromTo("[data-hero='title']", { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.5")
        .fromTo("[data-hero='sub']", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, "-=0.5")
        .fromTo("[data-hero='cta']", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.5")
        .fromTo("[data-hero='scroll']", { opacity: 0 }, { opacity: 1, duration: 0.7 }, "-=0.3");
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="top"
      ref={rootRef}
      className="relative flex min-h-screen items-center overflow-hidden px-4 pt-28 pb-14 md:px-8 md:pt-32"
    >
      <div className="apex-radial-orb left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      <motion.div
        className="apex-radial-orb -right-48 top-[16%]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-270 flex-col items-center text-center">
        <p data-hero="kicker" className="mb-8 font-mono text-[10px] uppercase tracking-[0.42em] text-gold">
          Private AI Intelligence Ecosystem
        </p>

        <h1 data-hero="title" className="font-display text-[clamp(3rem,9vw,7rem)] leading-[0.92] text-warm-white">
          We Engineer <span className="apex-shimmer italic">Influence</span> For The Elite
        </h1>

        <p data-hero="sub" className="mt-7 max-w-[64ch] text-balance text-base leading-8 text-[#b5b4be] md:text-lg">
          A private AI intelligence platform where luxury brands, HNWI, and elite creators gain unfair advantage over
          their market.
        </p>

        <div data-hero="cta" className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton href="#contact" label="Request Access" />
          <MagneticButton href="#work" label="View Case Studies" variant="ghost" />
        </div>

        <div data-hero="scroll" className="mt-14 flex flex-col items-center gap-2 text-mist" aria-hidden="true">
          <span className="h-12 w-px bg-linear-to-b from-gold/90 to-transparent" />
          <span className="font-mono text-[9px] uppercase tracking-[0.34em]">Scroll</span>
        </div>
      </div>
    </section>
  );
}
