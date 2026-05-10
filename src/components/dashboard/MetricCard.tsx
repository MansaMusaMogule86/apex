"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SILK = [0.16, 1, 0.3, 1] as const;

export type MetricCardProps = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta?: number; // percentage, signed
  deltaLabel?: string; // e.g. "vs. last 30d"
  icon?: LucideIcon;
  sparkline?: number[];
  accent?: boolean; // gold treatment
  className?: string;
};

export default function MetricCard({
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
  delta,
  deltaLabel = "vs. last period",
  icon: Icon,
  sparkline,
  accent = false,
  className,
}: MetricCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const count = useMotionValue(0);
  const display = useTransform(count, (v) =>
    v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
  const previousValue = useRef(value);
  const [pulseId, setPulseId] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.6, ease: SILK });
    return controls.stop;
  }, [inView, value, count]);

  useEffect(() => {
    if (previousValue.current !== value) {
      previousValue.current = value;
      setPulseId((n) => n + 1);
    }
  }, [value]);

  const positive = (delta ?? 0) >= 0;
  const DeltaIcon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.7, ease: SILK }}
      className={cn(
        "group relative overflow-hidden rounded-[2px] border border-gold/10 bg-obsidian/60 p-6 backdrop-blur-sm",
        "transition-colors duration-700 hover:border-gold/30",
        accent && "border-gold/25 bg-gradient-to-br from-carbon/80 to-obsidian/80",
        className
      )}
    >
      {/* Realtime pulse halo */}
      <AnimatePresence>
        {pulseId > 0 && (
          <motion.span
            key={pulseId}
            aria-hidden
            initial={{ opacity: 0.55, scale: 0.96 }}
            animate={{ opacity: 0, scale: 1.04 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: SILK }}
            className="pointer-events-none absolute inset-0 rounded-[2px] border border-gold/40 shadow-[0_0_60px_-10px_rgba(200,169,110,0.45)]"
          />
        )}
      </AnimatePresence>

      {/* Hairline corner ornaments */}
      <span className="pointer-events-none absolute left-0 top-0 h-px w-8 bg-gold/40" />
      <span className="pointer-events-none absolute left-0 top-0 h-8 w-px bg-gold/40" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-px w-8 bg-gold/20 transition-all duration-700 group-hover:w-16 group-hover:bg-gold/40" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-8 w-px bg-gold/20 transition-all duration-700 group-hover:h-16 group-hover:bg-gold/40" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-mist">
          {label}
        </div>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-gold/15 bg-void/60 text-gold/80">
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mt-6 flex items-baseline gap-1">
        {prefix && (
          <span className="font-display text-2xl text-gold/70">{prefix}</span>
        )}
        <motion.span className="font-display text-4xl tracking-tight text-warm-white tabular-nums">
          {display}
        </motion.span>
        {suffix && (
          <span className="font-display text-2xl text-titanium">{suffix}</span>
        )}
      </div>

      {/* Footer: delta + sparkline */}
      <div className="mt-5 flex items-end justify-between gap-4">
        {typeof delta === "number" && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-[2px] border px-2 py-0.5 font-mono text-[10px] tracking-wider",
                positive
                  ? "border-gold/30 bg-gold/5 text-gold-light"
                  : "border-mist/20 bg-mist/5 text-mist"
              )}
            >
              <DeltaIcon className="h-3 w-3" />
              {positive ? "+" : ""}
              {delta.toFixed(1)}%
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist">
              {deltaLabel}
            </span>
          </div>
        )}
        {sparkline && sparkline.length > 1 && (
          <Sparkline data={sparkline} positive={positive} />
        )}
      </div>
    </motion.div>
  );
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const w = 84;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");
  const stroke = positive ? "var(--color-gold)" : "var(--color-mist)";

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="overflow-visible opacity-80"
      aria-hidden
    >
      <defs>
        <linearGradient id="spark-fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: SILK }}
      />
      <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#spark-fade)" />
    </svg>
  );
}
