"use client";

import { motion } from "framer-motion";
import { Play, Zap } from "lucide-react";
import { useState } from "react";

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { STRATEGY_FEED } from "@/components/command-center/founder/data";

const PRIORITY_CLASS = {
  critical: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  high: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  medium: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
} as const;

export default function AiStrategyFeed() {
  const [executed, setExecuted] = useState<Set<string>>(new Set());

  function handleExecute(id: string) {
    setExecuted((prev) => new Set(prev).add(id));
  }

  const critical = STRATEGY_FEED.filter((s) => s.priority === "critical");
  const rest = STRATEGY_FEED.filter((s) => s.priority !== "critical");

  return (
    <AuthorityPanel
      title="AI Strategy Feed"
      subtitle="Strategy Recommendations"
      decisionTie="Ship only high-confidence recommendations that strengthen trust and influence conversion."
      rightSlot={
        <div className="flex items-center gap-1 rounded-xs border border-rose-400/30 bg-rose-400/8 px-2 py-1">
          <Zap className="h-3 w-3 text-rose-300" />
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-rose-200">
            {critical.length} critical
          </span>
        </div>
      }
    >
      <div className="space-y-2">
        {STRATEGY_FEED.map((item, index) => {
          const isDone = executed.has(item.id);
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: isDone ? 0.45 : 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.03 }}
              className={[
                "rounded-xs border border-white/10 bg-white/2 p-3 transition-opacity",
                isDone ? "opacity-45" : "",
              ].join(" ")}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p
                  className={[
                    "text-sm font-medium",
                    isDone ? "line-through text-titanium" : "text-warm-white",
                  ].join(" ")}
                >
                  {item.action}
                </p>
                <span
                  className={[
                    "shrink-0 rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]",
                    PRIORITY_CLASS[item.priority],
                  ].join(" ")}
                >
                  {item.priority}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-titanium">
                  <span>Impact: {item.impact}</span>
                  <span className="font-mono uppercase tracking-[0.12em] text-gold-light">
                    {item.confidence}%
                  </span>
                </div>

                {!isDone && (
                  <button
                    type="button"
                    onClick={() => handleExecute(item.id)}
                    className="flex shrink-0 items-center gap-1 rounded-xs border border-white/15 bg-white/4 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-titanium transition-colors hover:border-gold/40 hover:bg-gold/8 hover:text-gold-light"
                  >
                    <Play className="h-2.5 w-2.5" />
                    Deploy
                  </button>
                )}
                {isDone && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-400">
                    Deployed
                  </span>
                )}
              </div>

              <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gold/40"
                  style={{ width: `${item.confidence}%` }}
                />
              </div>
            </motion.article>
          );
        })}
      </div>
    </AuthorityPanel>
  );
}
