"use client";

import { FileText, Download, Calendar, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import PageShell from "@/components/command-center/PageShell";
import MetricCard from "@/components/command-center/ui/MetricCard";
import IntelligenceRail from "@/components/command-center/ui/IntelligenceRail";
import type { IntelligenceRailSignal } from "@/components/command-center/types";

const RAIL_SIGNALS: IntelligenceRailSignal[] = [
  {
    id: "s1",
    type: "insight",
    title: "Report Generated",
    body: "Weekly performance summary ready for review",
    timestamp: "15m ago",
    severity: "signal",
  },
  {
    id: "s2",
    type: "market",
    title: "Board Metrics",
    body: "Q4 KPIs tracking 8% above target",
    timestamp: "1h ago",
    severity: "opportunity",
  },
  {
    id: "s3",
    type: "recommendation",
    title: "Export Ready",
    body: "Monthly narrative report available for download",
    timestamp: "3h ago",
    severity: "opportunity",
  },
];

const REPORTS = [
  { 
    title: "Weekly Executive Summary", 
    type: "Automated", 
    lastGenerated: "Today, 09:00 AM",
    status: "Ready",
    format: "PDF"
  },
  { 
    title: "Market Intelligence Brief", 
    type: "Automated", 
    lastGenerated: "Yesterday, 06:00 PM",
    status: "Ready",
    format: "PDF + XLSX"
  },
  { 
    title: "Lead Quality Analysis", 
    type: "On-demand", 
    lastGenerated: "Dec 12, 2025",
    status: "Archive",
    format: "PDF"
  },
  { 
    title: "Founder Authority Impact Report", 
    type: "Weekly", 
    lastGenerated: "Dec 10, 2025",
    status: "Ready",
    format: "PDF + PPTX"
  },
  { 
    title: "Q4 Board Presentation", 
    type: "Quarterly", 
    lastGenerated: "Dec 01, 2025",
    status: "Ready",
    format: "PPTX"
  },
];

export default function ExecutiveReportsScreen() {
  return (
    <PageShell>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Reports Generated"
              value="24"
              subtitle="This month"
              trend="up"
              trendValue="+6 from last month"
              icon={<FileText className="h-4 w-4" />}
            />
            <MetricCard
              title="Board Meetings"
              value="3"
              subtitle="Upcoming"
              icon={<Calendar className="h-4 w-4" />}
            />
            <MetricCard
              title="Data Sources"
              value="8"
              subtitle="Integrated"
              icon={<PieChart className="h-4 w-4" />}
            />
            <MetricCard
              title="Auto-Export"
              value="Active"
              subtitle="Weekly schedule"
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>

          {/* Weekly Narrative */}
          <section className="rounded-sm border border-gold/20 bg-gold/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-sm bg-gold/20">
                <BarChart3 className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="font-display text-xl text-warm-white">Weekly Performance Narrative</h2>
                <p className="text-xs text-mist">December 9-15, 2025</p>
              </div>
            </div>
            <div className="space-y-4 text-sm text-titanium leading-relaxed">
              <p>
                <strong className="text-warm-white">Market Position:</strong> Dubai luxury real estate continues to show 
                resilience with Jumeirah Bay and Palm Jumeirah driving premium demand. Our authority positioning strategy 
                has yielded a 22% increase in qualified inbound inquiries.
              </p>
              <p>
                <strong className="text-warm-white">Lead Intelligence:</strong> While overall volume increased 12%, 
                external channel quality requires attention with an 11.2% purity decline. Organic and referral sources 
                now represent 67% of high-intent pipeline.
              </p>
              <p>
                <strong className="text-warm-white">Strategic Outlook:</strong> Recommendation to shift Palm inventory 
                messaging from promotional to founder-led authority narratives. Early indicators suggest 18% improvement 
                in engagement quality.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 rounded-sm bg-gold/20 border border-gold/40 text-gold text-xs hover:bg-gold/30 transition-colors">
                Download PDF
              </button>
              <button className="px-4 py-2 rounded-sm border border-white/15 text-titanium text-xs hover:border-white/30 transition-colors">
                Share with Board
              </button>
            </div>
          </section>

          {/* Available Reports */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-warm-white">Available Reports</h3>
              <button className="px-3 py-1.5 rounded-sm border border-white/15 text-[11px] text-titanium hover:border-gold/30 hover:text-gold transition-colors">
                Generate Custom
              </button>
            </div>
            <div className="space-y-3">
              {REPORTS.map((report) => (
                <div
                  key={report.title}
                  className="flex items-center justify-between p-4 rounded-sm border border-white/8 bg-white/[0.02] hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-sm bg-white/5">
                      <FileText className="h-4 w-4 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-medium text-warm-white">{report.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-mist">
                        <span>{report.type}</span>
                        <span>•</span>
                        <span>{report.lastGenerated}</span>
                        <span>•</span>
                        <span>{report.format}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`
                      text-[10px] uppercase px-2 py-0.5 rounded-sm
                      ${report.status === "Ready" ? "bg-emerald-400/20 text-emerald-400" : ""}
                      ${report.status === "Archive" ? "bg-white/10 text-titanium" : ""}
                    `}>
                      {report.status}
                    </span>
                    <button className="p-2 rounded-sm border border-white/15 text-titanium hover:border-gold/30 hover:text-gold transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Export Schedule */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <h3 className="font-display text-lg text-warm-white mb-4">Automated Export Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { report: "Weekly Summary", day: "Monday", time: "09:00 AM", recipients: "Executive Team" },
                { report: "Market Brief", day: "Daily", time: "06:00 PM", recipients: "Strategy Team" },
                { report: "Board Pack", day: "Friday", time: "08:00 AM", recipients: "Board Members" },
              ].map((schedule) => (
                <div key={schedule.report} className="rounded-sm border border-white/8 p-4 bg-white/[0.02]">
                  <p className="font-medium text-warm-white mb-1">{schedule.report}</p>
                  <p className="text-xs text-mist">{schedule.day} at {schedule.time}</p>
                  <p className="text-xs text-titanium mt-2">To: {schedule.recipients}</p>
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
