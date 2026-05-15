"use client";

import { motion } from "framer-motion";
import { Users, Filter, Star, TrendingUp, AlertTriangle, Phone } from "lucide-react";
import PageShell from "@/components/command-center/PageShell";
import MetricCard from "@/components/command-center/ui/MetricCard";
import IntelligenceRail from "@/components/command-center/ui/IntelligenceRail";
import type { IntelligenceRailSignal } from "@/components/command-center/types";

const RAIL_SIGNALS: IntelligenceRailSignal[] = [
  {
    id: "s1",
    type: "risk",
    title: "Lead Quality Drop",
    body: "External referral channel purity down 11.2% in 48h",
    timestamp: "9m ago",
    severity: "risk",
  },
  {
    id: "s2",
    type: "insight",
    title: "VIP Conversion Up",
    body: "Founder content correlates with +22% meeting conversion",
    timestamp: "1h ago",
    severity: "opportunity",
  },
  {
    id: "s3",
    type: "market",
    title: "Source Shift",
    body: "Organic inquiries now 45% of pipeline vs 38% last month",
    timestamp: "3h ago",
    severity: "opportunity",
  },
];

const LEADS = [
  { name: "Ahmed Al-Rashid", segment: "Sovereign Capital", score: 94, source: "Referral", status: "Hot" },
  { name: "Sarah Mitchell", segment: "Legacy Wealth", score: 91, source: "Organic", status: "Warm" },
  { name: "Karim Farid", segment: "Prestige Lifestyle", score: 88, source: "Event", status: "Hot" },
  { name: "Wei Zhang", segment: "Yield Strategists", score: 82, source: "Paid", status: "Warm" },
  { name: "Fatima Al-Sayed", segment: "Relocation Elites", score: 79, source: "Referral", status: "Cold" },
];

const SEGMENTS = [
  { name: "Sovereign Capital", count: 12, conversion: 28, quality: 94 },
  { name: "Legacy Wealth", count: 23, conversion: 22, quality: 91 },
  { name: "Prestige Lifestyle", count: 45, conversion: 18, quality: 84 },
  { name: "Yield Strategists", count: 31, conversion: 15, quality: 79 },
  { name: "Relocation Elites", count: 18, conversion: 12, quality: 76 },
];

export default function LeadIntelligenceScreen() {
  return (
    <PageShell>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Leads"
              value="129"
              subtitle="Active pipeline"
              trend="up"
              trendValue="+12 this week"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard
              title="Lead Quality"
              value="87.3"
              subtitle="Purity score"
              trend="down"
              trendValue="-2.1%"
              icon={<Filter className="h-4 w-4" />}
            />
            <MetricCard
              title="VIP Pipeline"
              value="35"
              subtitle="High-value prospects"
              trend="up"
              trendValue="+8"
              icon={<Star className="h-4 w-4" />}
            />
            <MetricCard
              title="Conversion Rate"
              value="18.4%"
              subtitle="Qualified to closed"
              trend="up"
              trendValue="+1.2%"
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>

          {/* Lead Quality Alert */}
          <section className="rounded-sm border border-critical-crimson/30 bg-critical-crimson/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-critical-crimson shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-display text-base text-warm-white mb-1">Lead Quality Alert</h4>
                <p className="text-sm text-titanium mb-3">
                  External referral channel purity has declined 11.2% in the last 48 hours. 
                  CAC increasing disproportionately. Recommend pausing spend pending review.
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-sm bg-critical-crimson/20 border border-critical-crimson/40 text-critical-crimson text-xs hover:bg-critical-crimson/30 transition-colors">
                    Pause Channel
                  </button>
                  <button className="px-3 py-1.5 rounded-sm border border-white/15 text-titanium text-xs hover:border-white/30 transition-colors">
                    Review Details
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* VIP Leads Table */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-warm-white">VIP Pipeline</h3>
              <button className="text-[11px] text-gold hover:text-gold-light transition-colors">
                View All Leads
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Lead</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Segment</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Score</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Source</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Status</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {LEADS.map((lead) => (
                    <tr key={lead.name} className="border-b border-white/5 last:border-0">
                      <td className="py-3 text-warm-white">{lead.name}</td>
                      <td className="py-3 text-titanium">{lead.segment}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gold rounded-full"
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                          <span className="text-xs">{lead.score}</span>
                        </div>
                      </td>
                      <td className="py-3 text-titanium">{lead.source}</td>
                      <td className="py-3">
                        <span className={`
                          text-[10px] uppercase px-2 py-0.5 rounded-sm
                          ${lead.status === "Hot" ? "bg-critical-crimson/20 text-critical-crimson" : ""}
                          ${lead.status === "Warm" ? "bg-risk-amber/20 text-risk-amber" : ""}
                          ${lead.status === "Cold" ? "bg-white/10 text-titanium" : ""}
                        `}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="p-1.5 rounded-sm border border-white/15 text-titanium hover:border-gold/30 hover:text-gold transition-colors">
                          <Phone className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Segment Analysis */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-display text-lg text-warm-white mb-4">Segment Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SEGMENTS.map((segment) => (
                <div
                  key={segment.name}
                  className="rounded-sm border border-white/8 p-4 bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-warm-white">{segment.name}</span>
                    <span className="text-xs text-mist">{segment.count} leads</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-mist">Conversion</span>
                        <span className="text-warm-white">{segment.conversion}%</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-signal-blue rounded-full"
                          style={{ width: `${segment.conversion * 2}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-mist">Quality Score</span>
                        <span className="text-warm-white">{segment.quality}</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${segment.quality}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Intelligence Rail */}
        <aside className="rounded-sm border border-white/10 bg-white/[0.02] p-5 h-fit">
          <IntelligenceRail signals={RAIL_SIGNALS} />
        </aside>
      </div>
    </PageShell>
  );
}
