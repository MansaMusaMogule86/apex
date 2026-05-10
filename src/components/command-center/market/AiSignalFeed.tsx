"use client";

import { motion } from "framer-motion";

import { SIGNAL_FEED } from "@/components/command-center/market/data";
import MarketPanel from "@/components/command-center/market/MarketPanel";

const SILK = [0.16, 1, 0.3, 1] as const;

const TYPE_CLASS = {
  anomaly: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  pricing: "border-gold/45 bg-gold/12 text-gold-light",
  undervalued: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
  migration: "border-blue-400/35 bg-blue-400/10 text-blue-100",
  investor: "border-violet-400/35 bg-violet-400/10 text-violet-100",
} as const;

export default function AiSignalFeed() {
  return (
    <MarketPanel
      title="AI Signal Feed"
      subtitle="Live Signal Intelligence"
      decisionTie="Escalate only the highest-confidence signals into execution queues."
    >
      <div className="space-y-2">
        {SIGNAL_FEED.map((signal, idx) => (
          <motion.article
            key={signal.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: SILK, delay: idx * 0.04 }}
            className="rounded-xs border border-white/10 bg-white/2 p-3"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]", TYPE_CLASS[signal.type]].join(" ")}>
                {signal.type}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-titanium">
                {signal.timestamp}
              </span>
            </div>
            <p className="text-sm font-medium text-warm-white">{signal.title}</p>
            <p className="mt-1 text-xs text-mist">{signal.insight}</p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-titanium">Action: {signal.action}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold-light">
                {signal.confidence}% confidence
              </p>
            </div>
          </motion.article>
        ))}
      </div>
    </MarketPanel>
  );
}
