"use client";

import { motion } from "framer-motion";

import ReportsPanel from "@/components/command-center/reports/ReportsPanel";
import type { ReportCard } from "@/components/command-center/reports/types";

type MainReportFeedProps = {
  reports: ReportCard[];
  selectedReportId: string;
  onSelectReport: (id: string) => void;
};

const IMPACT_CLASS = {
  critical: "border-rose-400/35 bg-rose-400/10 text-rose-100",
  high: "border-amber-400/35 bg-amber-400/10 text-amber-100",
  medium: "border-emerald-400/35 bg-emerald-400/10 text-emerald-100",
} as const;

const RISK_CLASS = {
  high: "text-rose-200",
  medium: "text-amber-200",
  low: "text-emerald-200",
} as const;

export default function MainReportFeed({ reports, selectedReportId, onSelectReport }: MainReportFeedProps) {
  return (
    <ReportsPanel
      title="Main Report Feed"
      subtitle="AI-Generated Intelligence Feed"
      decisionTie="Prioritize reports by impact, confidence, and decision urgency."
    >
      <div className="space-y-2">
        {reports.map((report, index) => {
          const selected = report.id === selectedReportId;
          return (
            <motion.article
              key={report.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.03 }}
              onClick={() => onSelectReport(report.id)}
              className={[
                "cursor-pointer rounded-xs border p-3 transition-colors",
                selected ? "border-gold/40 bg-gold/12" : "border-white/10 bg-white/2 hover:border-gold/30",
              ].join(" ")}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-warm-white">{report.title}</p>
                <span className={["rounded-xs border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]", IMPACT_CLASS[report.executiveImpact]].join(" ")}>
                  {report.executiveImpact} impact
                </span>
              </div>

              <div className="grid gap-1 text-xs text-titanium md:grid-cols-2">
                <p>Category: {report.category}</p>
                <p>Confidence: {report.confidence}%</p>
                <p>Priority: {report.decisionPriority}</p>
                <p>Audience: {report.executiveAudience}</p>
              </div>

              <p className="mt-2 text-xs text-mist">{report.summary}</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-xs border border-white/15 bg-white/6 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.13em] text-titanium">
                  {report.generatedAt}
                </span>
                <span className={`font-mono text-[10px] uppercase tracking-[0.13em] ${RISK_CLASS[report.risk]}`}>
                  risk {report.risk}
                </span>
                {report.suggestedActions.map((action) => (
                  <span key={action} className="rounded-xs border border-gold/25 bg-gold/10 px-2 py-0.5 text-[10px] text-gold-light">
                    {action}
                  </span>
                ))}
              </div>
            </motion.article>
          );
        })}
      </div>
    </ReportsPanel>
  );
}
