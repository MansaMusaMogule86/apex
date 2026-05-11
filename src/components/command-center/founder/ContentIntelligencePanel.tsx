"use client";

import { motion } from "framer-motion";
import { ExternalLink, TrendingUp } from "lucide-react";

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { CONTENT_INTELLIGENCE } from "@/components/command-center/founder/data";

const SIGNAL_COLOR: Record<string, string> = {
  Strong: "border-emerald-400/35 bg-emerald-400/10 text-emerald-200",
  Moderate: "border-gold/35 bg-gold/10 text-gold-light",
  Weak: "border-rose-400/35 bg-rose-400/10 text-rose-200",
};

function ScoreBar({ value }: { value: number }) {
  return (
    <div className="relative h-1 w-16 overflow-hidden rounded-full bg-white/8">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="h-full rounded-full bg-gold/55"
      />
    </div>
  );
}

export default function ContentIntelligencePanel() {
  return (
    <AuthorityPanel
      title="Content Intelligence Panel"
      subtitle="Content Performance"
      decisionTie="Double down on content that compounds trust and appointment conversion."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-130">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-2.5 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                Content
              </th>
              <th className="pb-2.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                Trust
              </th>
              <th className="pb-2.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                Auth Conv
              </th>
              <th className="pb-2.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                Engagement
              </th>
              <th className="pb-2.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                Appts
              </th>
              <th className="pb-2.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                Investor Signal
              </th>
              <th className="pb-2.5" />
            </tr>
          </thead>
          <tbody>
            {CONTENT_INTELLIGENCE.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.07 }}
                className="group border-b border-white/6 transition-colors hover:bg-white/3"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/50" />
                    <p className="text-xs font-medium leading-snug text-warm-white">{item.title}</p>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-xs text-gold-light">{item.trustScore}</span>
                    <ScoreBar value={item.trustScore} />
                  </div>
                </td>
                <td className="py-3 text-center">
                  <span className="font-mono text-xs text-warm-white">
                    {item.authorityConversion}%
                  </span>
                </td>
                <td className="py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-mono text-xs text-titanium">{item.engagementQuality}</span>
                    <ScoreBar value={item.engagementQuality} />
                  </div>
                </td>
                <td className="py-3 text-center">
                  <span className="font-mono text-xs text-warm-white">{item.appointments}</span>
                </td>
                <td className="py-3 text-center">
                  <span
                    className={[
                      "rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
                      SIGNAL_COLOR[item.investorSignal] ?? "text-titanium",
                    ].join(" ")}
                  >
                    {item.investorSignal}
                  </span>
                </td>
                <td className="py-3">
                  <button
                    type="button"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Open content"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-titanium hover:text-warm-white" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xs border border-white/8 bg-white/2 px-3 py-2">
        <p className="text-xs text-titanium">
          Total appointments generated:{" "}
          <span className="text-warm-white">
            {CONTENT_INTELLIGENCE.reduce((s, c) => s + c.appointments, 0)}
          </span>
        </p>
        <p className="text-xs text-titanium">
          Avg trust score:{" "}
          <span className="text-gold-light">
            {Math.round(
              CONTENT_INTELLIGENCE.reduce((s, c) => s + c.trustScore, 0) /
                CONTENT_INTELLIGENCE.length,
            )}
          </span>
        </p>
      </div>
    </AuthorityPanel>
  );
}
