"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SILK = [0.16, 1, 0.3, 1] as const;

export type InsightSeverity = "opportunity" | "risk" | "signal" | "suggestion";

export type AIInsightCardProps = {
  severity?: InsightSeverity;
  title: string;
  body: string;
  confidence?: number; // 0–100
  source?: string; // model / dataset attribution
  timestamp?: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
};

const SEVERITY_MAP: Record<
  InsightSeverity,
  { icon: LucideIcon; label: string; tone: string; ring: string }
> = {
  opportunity: {
    icon: TrendingUp,
    label: "Opportunity",
    tone: "text-gold",
    ring: "border-gold/30 bg-gold/5",
  },
  risk: {
    icon: AlertTriangle,
    label: "Risk Signal",
    tone: "text-warm-white",
    ring: "border-mist/25 bg-mist/5",
  },
  signal: {
    icon: Sparkles,
    label: "Pattern",
    tone: "text-gold-light",
    ring: "border-gold/20 bg-gold/5",
  },
  suggestion: {
    icon: Lightbulb,
    label: "Suggestion",
    tone: "text-titanium",
    ring: "border-gold/15 bg-carbon/40",
  },
};

export default function AIInsightCard({
  severity = "opportunity",
  title,
  body,
  confidence,
  source = "Apex Intelligence",
  timestamp,
  actionLabel,
  onAction,
  onDismiss,
  className,
}: AIInsightCardProps) {
  const [dismissed, setDismissed] = useState(false);
  const meta = SEVERITY_MAP[severity];
  const Icon = meta.icon;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 24, scale: 0.98 }}
          transition={{ duration: 0.6, ease: SILK }}
          className={cn(
            "group relative overflow-hidden rounded-[2px] border border-gold/15 bg-obsidian/70 p-6 backdrop-blur-sm",
            "transition-colors duration-700 hover:border-gold/30",
            className
          )}
        >
          {/* Ambient gold glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-gold/[0.04] blur-3xl transition-opacity duration-1000 group-hover:bg-gold/[0.08]"
          />

          {/* Left rail */}
          <span className="pointer-events-none absolute inset-y-6 left-0 w-px bg-gradient-to-b from-transparent via-gold/40 to-transparent" />

          {/* Header */}
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[2px] border",
                  meta.ring
                )}
              >
                <Icon className={cn("h-4 w-4", meta.tone)} />
              </span>
              <div className="flex flex-col">
                <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-gold">
                  {meta.label}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist">
                  {source}
                  {timestamp && <span className="text-mist/50"> · {timestamp}</span>}
                </span>
              </div>
            </div>

            {onDismiss && (
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss insight"
                className="flex h-7 w-7 items-center justify-center rounded-[2px] text-mist transition-colors duration-500 hover:bg-carbon/60 hover:text-warm-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </header>

          {/* Body */}
          <div className="mt-5">
            <h3 className="font-display text-xl leading-snug text-warm-white">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-titanium">{body}</p>
          </div>

          {/* Confidence */}
          {typeof confidence === "number" && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist">
                  Confidence
                </span>
                <span className="font-mono text-[10px] tracking-wider text-gold-light tabular-nums">
                  {Math.round(confidence)}%
                </span>
              </div>
              <div className="relative h-px w-full bg-carbon">
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: confidence / 100 }}
                  transition={{ duration: 1.2, ease: SILK, delay: 0.2 }}
                  style={{ transformOrigin: "0% 50%" }}
                  className="absolute inset-y-0 left-0 block w-full bg-gradient-to-r from-gold/40 via-gold to-gold-light"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          {(actionLabel || onAction) && (
            <div className="mt-6 flex items-center gap-3 border-t border-gold/10 pt-5">
              <button
                type="button"
                onClick={onAction}
                className="group/btn inline-flex items-center gap-2 text-sm tracking-wide text-warm-white transition-colors duration-500 hover:text-gold-light"
              >
                <Check className="h-3.5 w-3.5 text-gold" />
                <span>{actionLabel ?? "Apply"}</span>
                <ArrowRight className="h-3.5 w-3.5 translate-x-0 text-gold transition-transform duration-500 group-hover/btn:translate-x-1" />
              </button>
            </div>
          )}
        </motion.article>
      )}
    </AnimatePresence>
  );
}
