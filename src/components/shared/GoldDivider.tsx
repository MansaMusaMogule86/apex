"use client";

import { motion } from "framer-motion";

const SILK = [0.16, 1, 0.3, 1] as const;

type GoldDividerProps = {
  /** Width style of the divider line */
  variant?: "hairline" | "ornament" | "centered";
  /** Optional small label rendered above the line in mono uppercase */
  label?: string;
  /** Tailwind className overrides for the wrapper */
  className?: string;
  /** Animate on scroll into view */
  animate?: boolean;
};

export default function GoldDivider({
  variant = "hairline",
  label,
  className = "",
  animate = true,
}: GoldDividerProps) {
  const initial = animate ? { scaleX: 0, opacity: 0 } : false;
  const whileInView = animate ? { scaleX: 1, opacity: 1 } : undefined;

  return (
    <div
      className={`flex flex-col items-center justify-center w-full ${className}`}
    >
      {label ? (
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-gold mb-6">
          {label}
        </span>
      ) : null}

      {variant === "ornament" ? (
        <div className="flex items-center gap-4 w-full max-w-[480px]">
          <motion.span
            className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/40 to-gold/40 origin-right"
            initial={initial}
            whileInView={whileInView}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.2, ease: SILK }}
          />
          <span className="h-1 w-1 rotate-45 bg-gold" />
          <motion.span
            className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/40 to-gold/40 origin-left"
            initial={initial}
            whileInView={whileInView}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.2, ease: SILK }}
          />
        </div>
      ) : variant === "centered" ? (
        <motion.div
          className="h-px w-16 bg-gold/60 origin-center"
          initial={initial}
          whileInView={whileInView}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1, ease: SILK }}
        />
      ) : (
        <motion.div
          className="h-px w-full bg-gradient-to-r from-transparent via-gold/20 to-transparent origin-left"
          initial={initial}
          whileInView={whileInView}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.4, ease: SILK }}
        />
      )}
    </div>
  );
}
