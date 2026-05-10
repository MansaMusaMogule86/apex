"use client";

import { FileText, LayoutPanelTop, Printer } from "lucide-react";

import ReportsPanel from "@/components/command-center/reports/ReportsPanel";
import type { ReportCard } from "@/components/command-center/reports/types";

type PdfExportSystemProps = {
  report: ReportCard;
};

export default function PdfExportSystem({ report }: PdfExportSystemProps) {
  return (
    <ReportsPanel
      title="PDF Export System"
      subtitle="Executive Export Architecture"
      decisionTie="Generate boardroom-ready reports with institutional hierarchy and premium typography."
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <article className="rounded-xs border border-white/10 bg-white/2 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold/70">Luxury PDF export experience</p>
          <div className="mt-2 space-y-1 text-xs text-titanium">
            <p>Layout: Boardroom intelligence dossier</p>
            <p>Typography: Display + mono institutional stack</p>
            <p>Sections: Summary, forecasts, risks, recommendations, evidence</p>
            <p>Visual hierarchy: Matte black + warm gold + titanium metadata</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="inline-flex items-center gap-1 rounded-xs border border-white/15 bg-white/6 px-2.5 py-1.5 text-xs text-warm-white">
              <LayoutPanelTop className="h-3.5 w-3.5" />
              Preview layout
            </button>
            <button type="button" className="inline-flex items-center gap-1 rounded-xs border border-gold/30 bg-gold/12 px-2.5 py-1.5 text-xs text-gold-light">
              <FileText className="h-3.5 w-3.5" />
              Generate PDF
            </button>
            <button type="button" className="inline-flex items-center gap-1 rounded-xs border border-white/15 bg-white/6 px-2.5 py-1.5 text-xs text-warm-white">
              <Printer className="h-3.5 w-3.5" />
              Print briefing
            </button>
          </div>
        </article>

        <article className="rounded-xs border border-white/10 bg-black/30 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-titanium">Executive-ready formatting preview</p>
          <div className="mt-2 rounded-xs border border-white/10 bg-white/3 p-3">
            <p className="text-sm text-warm-white">{report.title}</p>
            <p className="mt-1 text-xs text-titanium">{report.category}</p>
            <p className="mt-2 text-xs text-titanium">Confidence {report.confidence}% | Priority {report.decisionPriority}</p>
            <p className="mt-2 text-xs text-mist">{report.summary}</p>
          </div>
        </article>
      </div>
    </ReportsPanel>
  );
}
