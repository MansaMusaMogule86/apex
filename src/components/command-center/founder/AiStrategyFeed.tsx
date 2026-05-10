"use client";

import { motion } from "framer-motion";

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { STRATEGY_FEED } from "@/components/command-center/founder/data";

const PRIORITY_CLASS = {
  critical: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  high: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  medium: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
} as const;

export default function AiStrategyFeed() {
  return (
    <AuthorityPanel
      title="AI Strategy Feed"
      subtitle="Strategy Recommendations"
      decisionTie="Ship only high-confidence recommendations that strengthen trust and influence conversion."
    >
      <div className="space-y-2">
        {STRATEGY_FEED.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.03 }}
            className="rounded-xs border border-white/10 bg-white/2 p-3"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-warm-white">{item.action}</p>
              <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]", PRIORITY_CLASS[item.priority]].join(" ")}>
                {item.priority}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-titanium">
              <p>Impact: {item.impact}</p>
              <p className="font-mono uppercase tracking-[0.13em] text-gold-light">{item.confidence}% confidence</p>
            </div>
          </motion.article>
        ))}
      </div>
    </AuthorityPanel>
  );
}
