"use client";

import { motion } from "framer-motion";

import { ACTION_RECOMMENDATIONS } from "@/components/command-center/lead/data";
import LeadPanel from "@/components/command-center/lead/LeadPanel";

export default function AiActionSystem() {
  return (
    <LeadPanel
      title="AI Action System"
      subtitle="Execution Intelligence"
      decisionTie="Convert predictive signals into immediate, assigned actions."
    >
      <div className="space-y-2">
        {ACTION_RECOMMENDATIONS.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="rounded-xs border border-white/10 bg-white/2 p-3"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-warm-white">{item.action}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold-light">{item.confidence}% confidence</p>
            </div>
            <p className="text-xs text-mist">Target lead: {item.leadName}</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <p className="text-titanium">Impact: {item.impact}</p>
              <p className="text-titanium">ETA: {item.eta}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </LeadPanel>
  );
}
