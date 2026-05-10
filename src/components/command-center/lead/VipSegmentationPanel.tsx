"use client";

import LeadPanel from "@/components/command-center/lead/LeadPanel";
import { LEAD_ROWS, SEGMENTS } from "@/components/command-center/lead/data";

export default function VipSegmentationPanel() {
  return (
    <LeadPanel
      title="VIP Segmentation"
      subtitle="Segment Intelligence"
      decisionTie="Deploy differentiated narrative and broker strategy by wealth psychology."
    >
      <div className="space-y-2">
        {SEGMENTS.map((segment) => {
          const segmentLeads = LEAD_ROWS.filter((lead) => lead.segment === segment);
          const avgIntent = Math.round(
            segmentLeads.reduce((sum, lead) => sum + lead.intentScore, 0) / Math.max(segmentLeads.length, 1),
          );
          const avgPrestige = Math.round(
            segmentLeads.reduce((sum, lead) => sum + lead.prestigeScore, 0) / Math.max(segmentLeads.length, 1),
          );

          return (
            <article key={segment} className="rounded-xs border border-white/10 bg-white/2 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-warm-white">{segment}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-light">
                  {segmentLeads.length} buyers
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p className="text-titanium">Avg intent: <span className="text-warm-white">{avgIntent}</span></p>
                <p className="text-titanium">Avg prestige: <span className="text-warm-white">{avgPrestige}</span></p>
              </div>
            </article>
          );
        })}
      </div>
    </LeadPanel>
  );
}
