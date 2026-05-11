"use client";

import { motion } from "framer-motion";

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { COMPETITOR_MATRIX } from "@/components/command-center/founder/data";
import type { CompetitorEntry } from "@/components/command-center/founder/types";

const COLS: { key: keyof Omit<CompetitorEntry, "competitor">; label: string }[] = [
  { key: "authorityScore", label: "Auth" },
  { key: "trustIndex", label: "Trust" },
  { key: "narrativeReach", label: "Narr" },
  { key: "investorGrade", label: "Inv" },
  { key: "prestige", label: "Pres" },
];

function ScoreCell({ value, isApex }: { value: number; isApex: boolean }) {
  const color = isApex
    ? "text-gold-light"
    : value >= 80
      ? "text-warm-white"
      : value >= 65
        ? "text-titanium"
        : "text-mist";
  return (
    <td className="px-2 py-2.5 text-center">
      <span className={["font-mono text-xs font-medium", color].join(" ")}>{value}</span>
      {isApex && <div className="mx-auto mt-0.5 h-px w-5 rounded-full bg-gold/50" />}
    </td>
  );
}

export default function CompetitorMatrixPanel() {
  const apexRow = COMPETITOR_MATRIX[0]!;
  const competitors = COMPETITOR_MATRIX.slice(1);
  const meanGap = Math.round(
    COLS.reduce((sum, col) => {
      const compAvg = competitors.reduce((s, c) => s + c[col.key], 0) / competitors.length;
      return sum + (apexRow[col.key] - compAvg);
    }, 0) / COLS.length,
  );

  return (
    <AuthorityPanel
      title="Competitive Positioning Matrix"
      subtitle="Authority vs Competitors"
      decisionTie="Maintain dominant separation across all five authority vectors."
      rightSlot={
        <div className="flex flex-col items-end gap-1">
          <p className="font-display text-2xl font-light text-gold-light">+{meanGap}</p>
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-mist">mean gap</p>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-2 text-left font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                Founder
              </th>
              {COLS.map((col) => (
                <th
                  key={col.key}
                  className="pb-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-mist"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPETITOR_MATRIX.map((entry, index) => {
              const isApex = index === 0;
              return (
                <motion.tr
                  key={entry.competitor}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.07 }}
                  className={[
                    "border-b border-white/6 transition-colors hover:bg-white/3",
                    isApex ? "bg-gold/5" : "",
                  ].join(" ")}
                >
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "text-xs font-medium",
                          isApex ? "text-gold-light" : "text-titanium",
                        ].join(" ")}
                      >
                        {isApex ? "APEX Founder" : entry.competitor}
                      </span>
                      {isApex && (
                        <span className="rounded-xs border border-gold/30 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gold">
                          you
                        </span>
                      )}
                    </div>
                  </td>
                  {COLS.map((col) => (
                    <ScoreCell key={col.key} value={entry[col.key]} isApex={isApex} />
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-titanium">
        APEX leads all five dimensions — mean separation{" "}
        <span className="text-gold-light">+{meanGap} pts</span> above nearest competitor.
      </p>
    </AuthorityPanel>
  );
}
