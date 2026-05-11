"use client";

import { motion } from "framer-motion";

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { AUDIENCE_SEGMENTS } from "@/components/command-center/founder/data";

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/8">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className={["h-full rounded-full", color].join(" ")}
      />
    </div>
  );
}

export default function AudiencePenetrationPanel() {
  return (
    <AuthorityPanel
      title="Audience Penetration"
      subtitle="Segment Intelligence"
      decisionTie="Maximize quality and trust in HNWI and institutional segments first."
    >
      <div className="space-y-4">
        {AUDIENCE_SEGMENTS.map((seg, index) => (
          <motion.div
            key={seg.segment}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.07 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-warm-white">{seg.segment}</p>
              <div className="flex shrink-0 items-center gap-3 font-mono text-[10px] text-titanium">
                <span>
                  conv <span className="text-gold-light">{seg.conversion}%</span>
                </span>
                <span>
                  trust <span className="text-warm-white">{seg.trust}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-mist">
                  <span>Reach</span>
                  <span>{seg.reach}%</span>
                </div>
                <Bar value={seg.reach} color="bg-gold/65" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.1em] text-mist">
                  <span>Quality</span>
                  <span>{seg.quality}</span>
                </div>
                <Bar value={seg.quality} color="bg-signal-blue/55" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </AuthorityPanel>
  );
}
