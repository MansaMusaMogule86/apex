"use client";

import { motion } from "framer-motion";
import { Network, Users, Share2, TrendingUp, Award, Link2 } from "lucide-react";
import PageShell from "@/components/command-center/PageShell";
import MetricCard from "@/components/command-center/ui/MetricCard";
import IntelligenceRail from "@/components/command-center/ui/IntelligenceRail";
import type { IntelligenceRailSignal } from "@/components/command-center/types";

const RAIL_SIGNALS: IntelligenceRailSignal[] = [
  {
    id: "s1",
    type: "insight",
    title: "Network Effect",
    body: "Referral conversion 3.2x higher than paid channels",
    timestamp: "25m ago",
    severity: "opportunity",
  },
  {
    id: "s2",
    type: "market",
    title: "Partner Activation",
    body: "Top 3 partners generated 42% of qualified leads this month",
    timestamp: "1h ago",
    severity: "opportunity",
  },
  {
    id: "s3",
    type: "recommendation",
    title: "Influencer Opportunity",
    body: "Luxury lifestyle creator with 89% audience overlap",
    timestamp: "2h ago",
    severity: "opportunity",
  },
];

const PARTNERS = [
  { name: "Private Wealth Advisors", type: "Financial", leads: 24, conversion: 32, status: "Active" },
  { name: "Luxury Concierge Dubai", type: "Lifestyle", leads: 18, conversion: 28, status: "Active" },
  { name: "Family Office Network", type: "Referral", leads: 15, conversion: 41, status: "Active" },
  { name: "Design District Gallery", type: "Cultural", leads: 12, conversion: 19, status: "Pending" },
  { name: "Yacht Club Dubai", type: "Lifestyle", leads: 9, conversion: 22, status: "Active" },
];

const INFLUENCERS = [
  { name: "@luxuryhomesdxb", followers: "245K", engagement: 4.2, overlap: 89, tier: "Macro" },
  { name: "@dubairealestate", followers: "189K", engagement: 3.8, overlap: 76, tier: "Macro" },
  { name: "@prestigedubai", followers: "87K", engagement: 5.1, overlap: 82, tier: "Mid" },
  { name: "@luxurylivingae", followers: "156K", engagement: 3.2, overlap: 71, tier: "Macro" },
];

export default function InfluenceNetworkScreen() {
  return (
    <PageShell>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Network Reach"
              value="2.4M"
              subtitle="Combined audience"
              trend="up"
              trendValue="+18% this month"
              icon={<Network className="h-4 w-4" />}
            />
            <MetricCard
              title="Active Partners"
              value="12"
              subtitle="4 pending activation"
              trend="up"
              trendValue="+2 new"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard
              title="Referral Rate"
              value="28%"
              subtitle="Of total pipeline"
              trend="up"
              trendValue="+4.2%"
              icon={<Share2 className="h-4 w-4" />}
            />
            <MetricCard
              title="Network Strength"
              value="87.4"
              subtitle="Composite score"
              trend="up"
              trendValue="+5.1"
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>

          {/* Partnership Performance */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-warm-white">Partnership Performance</h3>
              <button className="px-3 py-1.5 rounded-sm border border-white/15 text-[11px] text-titanium hover:border-gold/30 hover:text-gold transition-colors">
                Add Partner
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Partner</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Type</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Leads</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Conversion</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {PARTNERS.map((partner) => (
                    <tr key={partner.name} className="border-b border-white/5 last:border-0">
                      <td className="py-3 text-warm-white">{partner.name}</td>
                      <td className="py-3 text-titanium">{partner.type}</td>
                      <td className="py-3 text-warm-white">{partner.leads}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gold rounded-full"
                              style={{ width: `${partner.conversion * 2}%` }}
                            />
                          </div>
                          <span className="text-xs">{partner.conversion}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`
                          text-[10px] uppercase px-2 py-0.5 rounded-sm
                          ${partner.status === "Active" ? "bg-emerald-400/20 text-emerald-400" : ""}
                          ${partner.status === "Pending" ? "bg-risk-amber/20 text-risk-amber" : ""}
                        `}>
                          {partner.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Influencer Opportunities */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-warm-white">Influencer Opportunities</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                Audience Overlap Analysis
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INFLUENCERS.map((influencer) => (
                <div
                  key={influencer.name}
                  className="rounded-sm border border-white/8 p-4 bg-white/[0.02] hover:border-white/15 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-warm-white">{influencer.name}</p>
                      <p className="text-xs text-mist">{influencer.followers} followers</p>
                    </div>
                    <span className={`
                      text-[10px] uppercase px-2 py-0.5 rounded-sm
                      ${influencer.tier === "Macro" ? "bg-gold/20 text-gold" : "bg-signal-blue/20 text-signal-blue"}
                    `}>
                      {influencer.tier}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-mist">Engagement</span>
                      <p className="text-warm-white">{influencer.engagement}%</p>
                    </div>
                    <div>
                      <span className="text-mist">Audience Overlap</span>
                      <p className="text-emerald-400">{influencer.overlap}%</p>
                    </div>
                  </div>
                  <button className="mt-3 w-full py-2 rounded-sm border border-white/15 text-[11px] text-titanium hover:border-gold/30 hover:text-gold transition-colors">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Relationship Map Placeholder */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-display text-lg text-warm-white mb-4">Network Relationship Map</h3>
            <div className="aspect-[2/1] rounded-sm border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center">
              <div className="text-center">
                <Link2 className="h-8 w-8 text-mist mx-auto mb-2" />
                <p className="text-sm text-titanium">Interactive network visualization</p>
                <p className="text-xs text-mist mt-1">Click to explore connections</p>
              </div>
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
