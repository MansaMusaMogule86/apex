"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

const SILK = [0.16, 1, 0.3, 1] as const;
const SIZE = 220;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;
const MAX_SCORE = 1000;

interface APEXGaugeProps {
  score: number;
  label?: string;
  size?: number;
  className?: string;
}

export default function APEXGauge({
  score,
  label = "APEX Score",
  size = SIZE,
  className = "",
}: APEXGaugeProps) {
  const clamped = Math.max(0, Math.min(MAX_SCORE, score));
  const ratio = useMotionValue(0);
  const dash = useTransform(ratio, (v) => `${v * CIRC} ${CIRC}`);
  const display = useTransform(ratio, (v) => Math.round(v * MAX_SCORE).toString());

  useEffect(() => {
    const controls = animate(ratio, clamped / MAX_SCORE, {
      duration: 1.6,
      ease: SILK,
    });
    return () => controls.stop();
  }, [clamped, ratio]);

  const stroke = (SIZE / size) * STROKE;
  const radius = (SIZE - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dashScaled = useTransform(ratio, (v) => `${v * circ} ${circ}`);

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeWidth={STROKE}
          className="text-gold"
        />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="url(#apex-gauge-gradient)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          style={{ strokeDasharray: size === SIZE ? dash : dashScaled }}
        />
        <defs>
          <linearGradient
            id="apex-gauge-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#e2c99a" />
            <stop offset="100%" stopColor="#c8a96e" />
          </linearGradient>
        </defs>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
        <motion.span className="font-display text-5xl tracking-tight text-warm-white tabular-nums">
          {display}
        </motion.span>
        <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-gold/80">
          {label}
        </span>
      </div>
    </div>
  );
}
