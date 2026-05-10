"use client";

import { motion } from "framer-motion";
import type { AlertItem } from "@/components/command-center/home/types";
import PanelCard from "@/components/command-center/home/PanelCard";

const SEVERITY_CLASS: Record<AlertItem["severity"], string> = {
  P1: "bg-red-400/15 text-red-300 border-red-400/35",
  P2: "bg-amber-400/15 text-amber-300 border-amber-400/35",
  P3: "bg-gold/10 text-gold-light border-gold/35",
};

export default function AlertCenter({ data, loading = false }: { data: AlertItem[]; loading?: boolean }) {
  return (
    <PanelCard
      title="Right Alert Center"
      subtitle="Risk, sentiment, lead quality, competitor, market anomalies"
      decisionTie="Escalate P1 immediately, route P2 in < 30 min"
      className="h-full"
    >
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-[2px] border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
      ) : data.length ? (
        <div className="space-y-2">
          {data.map((alert, index) => (
            <motion.article
              key={alert.id}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-[2px] border border-white/10 bg-white/[0.02] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-xl text-warm-white">{alert.title}</p>
                <span className={`rounded-[2px] border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${SEVERITY_CLASS[alert.severity]}`}>
                  {alert.severity}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-titanium">{alert.body}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mist">{alert.timestamp}</p>
            </motion.article>
          ))}
        </div>
      ) : (
        <p className="rounded-[2px] border border-dashed border-white/15 bg-white/[0.02] p-6 text-sm text-titanium">
          No active anomalies right now. Monitoring remains armed.
        </p>
      )}
    </PanelCard>
  );
}
