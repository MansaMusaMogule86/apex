"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const SYSTEMS = [
  {
    id: "market",
    title: "AI Market Intelligence",
    detail: "District-level demand velocity, premium pricing pressure, and competitor launch detection.",
    metrics: ["Demand Velocity +19%", "Luxury Spread 1.34x", "Launch Threat: Moderate"],
  },
  {
    id: "buyers",
    title: "Buyer Psychology Grid",
    detail: "HNWI behavior clustering by intent depth, trust channel, and urgency profile.",
    metrics: ["Intent Tier A: 29%", "Trust-Led Inquiries: 61%", "Urgency Spike: Palm/JBR"],
  },
  {
    id: "influence",
    title: "Influence Engineering",
    detail: "Creator and founder narrative impact mapped to qualified appointments and offers.",
    metrics: ["Authority Lift: +26%", "Signal Quality: 92.1", "Pipeline Impact: AED 118M"],
  },
] as const;

export default function IntelligenceSystems() {
  const [active, setActive] = useState<typeof SYSTEMS[number]["id"]>("market");
  const item = useMemo(() => SYSTEMS.find((entry) => entry.id === active) ?? SYSTEMS[0], [active]);

  return (
    <section className="py-24 md:py-32" id="intelligence-systems">
      <div className="mx-auto max-w-335 px-4 md:px-8">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.4em] text-gold">Interactive Intelligence Systems</p>
        <h2 className="font-display text-4xl leading-[0.95] text-warm-white md:text-6xl">
          Private command modules for
          <br />
          elite real estate operators.
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3">
            {SYSTEMS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setActive(entry.id)}
                className={`w-full rounded-[2px] border px-4 py-4 text-left transition-all duration-300 ${
                  active === entry.id
                    ? "border-gold/60 bg-gold/[0.08] shadow-[0_0_28px_rgba(200,169,110,0.22)]"
                    : "border-white/10 bg-white/[0.02] hover:border-gold/30"
                }`}
                data-cursor="interactive"
              >
                <p className="font-display text-2xl text-warm-white">{entry.title}</p>
                <p className="mt-2 text-sm leading-6 text-titanium">{entry.detail}</p>
              </button>
            ))}
          </div>

          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[2px] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.01] p-6"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-gold-light">{item.title}</p>
            <p className="mt-4 max-w-[54ch] text-base leading-8 text-beige">{item.detail}</p>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {item.metrics.map((metric) => (
                <div key={metric} className="rounded-[2px] border border-gold/30 bg-gold/[0.05] px-3 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-light">{metric}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
