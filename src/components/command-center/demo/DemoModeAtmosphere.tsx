"use client";

import { motion } from "framer-motion";
import { useExecutiveDemoMode } from "@/components/command-center/demo/ExecutiveDemoModeProvider";

const PHASE_TONE = {
  steady: "rgba(200,169,110,0.2)",
  surge: "rgba(212,152,72,0.3)",
  critical: "rgba(212,96,72,0.34)",
} as const;

export default function DemoModeAtmosphere() {
  const { enabled, phase, signalDensity } = useExecutiveDemoMode();

  if (!enabled) {
    return null;
  }

  const pulseCount = Math.round(7 + signalDensity * 10);

  return (
    <div className="demo-mode-atmosphere pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
      <motion.div
        className="demo-mode-scanline absolute inset-0"
        animate={{ opacity: [0.18, 0.3, 0.2], y: [0, -6, 0] }}
        transition={{ duration: 7.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 22%, ${PHASE_TONE[phase]}, transparent 48%), radial-gradient(circle at 76% 72%, rgba(200,169,110,0.12), transparent 52%)`,
        }}
        animate={{ opacity: [0.35, 0.55, 0.4] }}
        transition={{ duration: 6.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="absolute inset-0">
        {Array.from({ length: pulseCount }).map((_, index) => {
          const left = (index * 13) % 100;
          const top = (index * 17) % 100;
          const delay = index * 0.28;

          return (
            <motion.span
              key={`pulse-${index}`}
              className="absolute h-1 w-1 rounded-full bg-gold/45"
              style={{ left: `${left}%`, top: `${top}%` }}
              animate={{
                opacity: [0.15, 0.65, 0.15],
                scale: [0.8, 1.8, 0.8],
              }}
              transition={{
                duration: 3.2,
                delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
