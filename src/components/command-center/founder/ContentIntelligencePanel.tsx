"use client";

import AuthorityPanel from "@/components/command-center/founder/AuthorityPanel";
import { CONTENT_INTELLIGENCE } from "@/components/command-center/founder/data";

export default function ContentIntelligencePanel() {
  return (
    <AuthorityPanel
      title="Content Intelligence Panel"
      subtitle="Content Performance"
      decisionTie="Double down on content that compounds trust and appointment conversion."
    >
      <div className="space-y-2">
        {CONTENT_INTELLIGENCE.map((item) => (
          <article key={item.id} className="rounded-xs border border-white/10 bg-white/2 p-3">
            <p className="text-sm font-medium text-warm-white">{item.title}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-titanium md:grid-cols-5">
              <p>Trust {item.trustScore}</p>
              <p>Authority conv {item.authorityConversion}%</p>
              <p>Engagement {item.engagementQuality}</p>
              <p>Appointments {item.appointments}</p>
              <p>Investor signal {item.investorSignal}</p>
            </div>
          </article>
        ))}
      </div>
    </AuthorityPanel>
  );
}
