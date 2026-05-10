"use client";

import type { LeadRow } from "@/components/command-center/lead/types";
import LeadPanel from "@/components/command-center/lead/LeadPanel";

type ExecutiveInsightsRailProps = {
  lead: LeadRow;
};

export default function ExecutiveInsightsRail({ lead }: ExecutiveInsightsRailProps) {
  const insights = [
    {
      title: "Close probability acceleration",
      text: `${lead.buyerName} moved to ${lead.probabilityToClose}% probability with elevated trust alignment signals.`,
    },
    {
      title: "Broker fit check",
      text: `${lead.brokerAssignment} currently holds highest prestige-conversion alignment for ${lead.segment}.`,
    },
    {
      title: "WhatsApp emotional contour",
      text: `Sentiment ${lead.emotionalSentiment}/100 with ${lead.responseLatencyMin}m response latency suggests a high-value timing window.`,
    },
  ];

  return (
    <LeadPanel
      title="Executive Insights Rail"
      subtitle="Board Signal Digest"
      decisionTie="Convert AI insights into principal-level weekly action directives."
    >
      <div className="space-y-2">
        {insights.map((insight) => (
          <article key={insight.title} className="rounded-xs border border-white/10 bg-white/2 p-3">
            <p className="text-sm font-medium text-warm-white">{insight.title}</p>
            <p className="mt-1 text-xs text-titanium">{insight.text}</p>
          </article>
        ))}
      </div>
    </LeadPanel>
  );
}
