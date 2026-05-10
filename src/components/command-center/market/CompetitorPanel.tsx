"use client";

import { motion } from "framer-motion";

import { COMPETITOR_EVENTS } from "@/components/command-center/market/data";
import MarketPanel from "@/components/command-center/market/MarketPanel";

const SILK = [0.16, 1, 0.3, 1] as const;

const RISK_CLASS = {
  low: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  medium: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  high: "border-rose-400/35 bg-rose-400/10 text-rose-100",
} as const;

export default function CompetitorPanel() {
  return (
    <MarketPanel
      title="Competitor Tracking"
      subtitle="Competitive Intelligence"
      decisionTie="Pre-empt launches and narrative moves before attention velocity compounds."
    >
      <div className="space-y-2">
        {COMPETITOR_EVENTS.map((event, idx) => (
          <motion.article
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: SILK, delay: idx * 0.04 }}
            className="rounded-xs border border-white/10 bg-white/2 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-warm-white">{event.competitor}</p>
                <p className="text-xs text-titanium">Launch: {event.launch}</p>
              </div>
              <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]", RISK_CLASS[event.riskLevel]].join(" ")}>
                {event.riskLevel} risk
              </span>
            </div>
            <div className="grid gap-1.5 text-xs text-mist sm:grid-cols-2">
              <p>Narrative: {event.narrativeShift}</p>
              <p>Influencer: {event.influencerPartnership}</p>
              <p>Pricing: {event.pricingChange}</p>
              <p>Attention: {event.attentionVelocity}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </MarketPanel>
  );
}
