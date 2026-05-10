"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, UserCog } from "lucide-react";
import type { Recommendation } from "@/components/command-center/home/types";
import PanelCard from "@/components/command-center/home/PanelCard";

const RISK_CLASS: Record<Recommendation["riskLevel"], string> = {
  low: "text-emerald-300 border-emerald-400/35 bg-emerald-400/10",
  medium: "text-amber-300 border-amber-400/35 bg-amber-400/10",
  high: "text-red-300 border-red-400/35 bg-red-400/10",
};

export default function RecommendationFeed({ data, loading = false }: { data: Recommendation[]; loading?: boolean }) {
  return (
    <PanelCard
      title="AI Recommendation Feed"
      subtitle="Priority-ranked strategic directives"
      decisionTie="Apply highest-confidence recommendation each cycle"
      className="h-full"
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-[2px] border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
      ) : data.length ? (
        <div className="space-y-3">
          {data.map((entry, index) => (
            <motion.article
              key={entry.id}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
              className="rounded-[2px] border border-white/10 bg-white/[0.02] p-4 transition-colors duration-300 hover:border-gold/30"
              data-cursor="interactive"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-2xl text-warm-white">{entry.title}</p>
                <span className={`rounded-[2px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${RISK_CLASS[entry.riskLevel]}`}>
                  Risk {entry.riskLevel}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-beige">{entry.summary}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                <MetricMini label="Expected uplift" value={entry.expectedUplift} />
                <MetricMini label="Confidence" value={`${entry.confidence}%`} />
                <MetricMini label="Timeline" value={entry.timeline} />
                <MetricMini label="Action owner" value={entry.actionOwner} icon />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-[2px] border border-gold/20 bg-gold/[0.06] p-3">
                <p className="text-xs leading-5 text-beige">{entry.suggestedAction}</p>
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-2 rounded-[2px] border border-gold/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold-light"
                >
                  Execute
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        <p className="rounded-[2px] border border-dashed border-white/15 bg-white/[0.02] p-6 text-sm text-titanium">
          No recommendations available. AI engine will populate once strategic events are detected.
        </p>
      )}
    </PanelCard>
  );
}

function MetricMini({ label, value, icon = false }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="rounded-[2px] border border-white/10 bg-void/70 px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist">{label}</p>
      <p className="mt-1 inline-flex items-center gap-1 text-sm text-warm-white">
        {icon ? <UserCog className="h-3.5 w-3.5 text-gold" /> : null}
        {value}
      </p>
    </div>
  );
}
