"use client";

import { Users, Target, Zap, Activity, Globe } from "lucide-react";
import PageShell from "@/components/command-center/PageShell";
import MetricCard from "@/components/command-center/ui/MetricCard";
import IntelligenceRail from "@/components/command-center/ui/IntelligenceRail";
import type { IntelligenceRailSignal } from "@/components/command-center/types";

const RAIL_SIGNALS: IntelligenceRailSignal[] = [
  {
    id: "s1",
    type: "market",
    title: "Market Overview",
    body: "Dubai luxury market showing 12% YoY growth in premium segment",
    timestamp: "Just now",
    severity: "opportunity",
  },
  {
    id: "s2",
    type: "insight",
    title: "System Status",
    body: "All intelligence agents operational. 847 signals processed today.",
    timestamp: "2m ago",
    severity: "signal",
  },
  {
    id: "s3",
    type: "recommendation",
    title: "Daily Brief",
    body: "3 high-priority recommendations awaiting review",
    timestamp: "15m ago",
    severity: "opportunity",
  },
];

const ACTIVITY_FEED = [
  { id: 1, time: "09:42", event: "Lead intelligence updated", detail: "VIP pipeline +3", type: "lead" },
  { id: 2, time: "09:28", event: "Market signal detected", detail: "Jumeirah Bay demand surge", type: "market" },
  { id: 3, time: "08:55", event: "Content published", detail: "Founder memo: Q4 strategy", type: "content" },
  { id: 4, time: "08:30", event: "Competitor alert", detail: "New pricing from Cluster B", type: "competitor" },
  { id: 5, time: "08:15", event: "Report generated", detail: "Weekly performance summary", type: "report" },
];

export default function CommandCenterScreen() {
  return (
    <PageShell>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Executive Summary */}
          <section className="rounded-sm border border-gold/20 bg-gold/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-sm bg-gold/20">
                <Activity className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="font-display text-xl text-warm-white">Executive Summary</h2>
                <p className="text-xs text-mist">Daily strategic briefing • December 15, 2025</p>
              </div>
            </div>
            <p className="text-sm text-titanium leading-relaxed">
              Market conditions remain favorable with Jumeirah Bay buyer intent crossing premium thresholds. 
              Lead quality has stabilized following the founder content velocity increase. 
              Recommend immediate action on Palm inventory repositioning to capture emerging demand.
            </p>
          </section>

          {/* KPI Grid */}
          <section>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Market Velocity"
                value="+12.4%"
                subtitle="vs last month"
                trend="up"
                trendValue="Premium segment"
                icon={<Globe className="h-4 w-4" />}
              />
              <MetricCard
                title="Lead Quality"
                value="87.3"
                subtitle="Purity score"
                trend="up"
                trendValue="+3.2%"
                icon={<Users className="h-4 w-4" />}
              />
              <MetricCard
                title="Conversion Rate"
                value="4.8%"
                subtitle="VIP tier"
                trend="up"
                trendValue="+0.6%"
                icon={<Target className="h-4 w-4" />}
              />
              <MetricCard
                title="Active Alerts"
                value="4"
                subtitle="1 P2, 3 P3"
                trend="down"
                trendValue="-2 from yesterday"
                icon={<Zap className="h-4 w-4" />}
              />
            </div>
          </section>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
              <h3 className="font-display text-lg text-warm-white mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-mist">Revenue Target</span>
                    <span className="text-warm-white">78%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-gold rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-mist">Lead Conversion</span>
                    <span className="text-warm-white">64%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[64%] bg-signal-blue rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-mist">Content Engagement</span>
                    <span className="text-warm-white">91%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[91%] bg-emerald-400 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-mist">Network Reach</span>
                    <span className="text-warm-white">45%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-risk-amber rounded-full" />
                  </div>
                </div>
              </div>
            </section>

            {/* Activity Feed */}
            <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
              <h3 className="font-display text-lg text-warm-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {ACTIVITY_FEED.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 text-sm">
                    <span className="font-mono text-[10px] text-mist w-12 shrink-0">{item.time}</span>
                    <div>
                      <p className="text-warm-white">{item.event}</p>
                      <p className="text-xs text-titanium">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Quick Actions */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-display text-lg text-warm-white mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              {["Generate Report", "Review Alerts", "Update Forecast", "Export Data"].map((action) => (
                <button
                  key={action}
                  className="px-4 py-2 rounded-sm border border-white/15 bg-white/5 text-sm text-titanium hover:border-gold/30 hover:text-gold transition-colors"
                >
                  {action}
                </button>
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
