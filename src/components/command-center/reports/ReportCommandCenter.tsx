"use client";

import ReportsPanel from "@/components/command-center/reports/ReportsPanel";
import type { ReportCategory } from "@/components/command-center/reports/types";

type ReportCommandCenterProps = {
  categories: ReportCategory[];
  active: ReportCategory | "all";
  onSelect: (value: ReportCategory | "all") => void;
};

export default function ReportCommandCenter({ categories, active, onSelect }: ReportCommandCenterProps) {
  return (
    <ReportsPanel
      title="Report Command Center"
      subtitle="Main Report Categories"
      decisionTie="Filter strategic reports by intelligence domain and executive priority."
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelect("all")}
          className={[
            "rounded-xs border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]",
            active === "all" ? "border-gold/45 bg-gold/12 text-warm-white" : "border-white/10 bg-white/2 text-titanium",
          ].join(" ")}
        >
          All reports
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={[
              "rounded-xs border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]",
              active === category ? "border-gold/45 bg-gold/12 text-warm-white" : "border-white/10 bg-white/2 text-titanium",
            ].join(" ")}
          >
            {category}
          </button>
        ))}
      </div>
    </ReportsPanel>
  );
}
