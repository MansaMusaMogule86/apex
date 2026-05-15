"use client";

import { motion } from "framer-motion";
import { MapPin, TrendingUp, Building, DollarSign, AlertTriangle } from "lucide-react";
import PageShell from "@/components/command-center/PageShell";
import MetricCard from "@/components/command-center/ui/MetricCard";
import IntelligenceRail from "@/components/command-center/ui/IntelligenceRail";
import type { IntelligenceRailSignal } from "@/components/command-center/types";

const RAIL_SIGNALS: IntelligenceRailSignal[] = [
  {
    id: "s1",
    type: "market",
    title: "Demand Surge",
    body: "Jumeirah Bay buyer intent crossed premium threshold (91.4)",
    timestamp: "18m ago",
    severity: "opportunity",
  },
  {
    id: "s2",
    type: "competitor",
    title: "Competitor Move",
    body: "Cluster C launched waterfront campaign, sentiment neutral",
    timestamp: "31m ago",
    severity: "signal",
  },
  {
    id: "s3",
    type: "risk",
    title: "Pricing Pressure",
    body: "Palm Jumeirah inventory showing discount expectations",
    timestamp: "2h ago",
    severity: "risk",
  },
  {
    id: "s4",
    type: "insight",
    title: "DIFC Momentum",
    body: "Commercial interest up 28% QoQ in financial district",
    timestamp: "3h ago",
    severity: "opportunity",
  },
];

const DISTRICTS = [
  { name: "Palm Jumeirah", demand: 87, price: "$8.2M avg", trend: "stable", intent: 78 },
  { name: "Jumeirah Bay", demand: 94, price: "$12.5M avg", trend: "up", intent: 91 },
  { name: "DIFC", demand: 82, price: "$6.8M avg", trend: "up", intent: 76 },
  { name: "Emirates Hills", demand: 76, price: "$15.2M avg", trend: "stable", intent: 72 },
  { name: "Dubai Marina", demand: 71, price: "$4.5M avg", trend: "down", intent: 65 },
  { name: "Business Bay", demand: 68, price: "$3.2M avg", trend: "stable", intent: 61 },
];

const COMPETITORS = [
  { name: "Emaar Properties", activity: "High", focus: "Waterfront", sentiment: "Neutral" },
  { name: "Damac", activity: "Medium", focus: "Luxury towers", sentiment: "Positive" },
  { name: "Sobha Realty", activity: "High", focus: "Super-prime", sentiment: "Neutral" },
  { name: "Omniyat", activity: "Low", focus: "Boutique", sentiment: "Positive" },
];

export default function MarketIntelligenceScreen() {
  return (
    <PageShell>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Market Velocity"
              value="+12.4%"
              subtitle="YoY growth"
              trend="up"
              trendValue="Premium segment"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <MetricCard
              title="Buyer Intent"
              value="84.2"
              subtitle="Weighted average"
              trend="up"
              trendValue="+5.1 points"
              icon={<MapPin className="h-4 w-4" />}
            />
            <MetricCard
              title="Avg Price/Sqft"
              value="$4,850"
              subtitle="Luxury tier"
              trend="up"
              trendValue="+8.3%"
              icon={<DollarSign className="h-4 w-4" />}
            />
            <MetricCard
              title="Inventory Pressure"
              value="Medium"
              subtitle="3.2 months supply"
              trend="neutral"
              icon={<Building className="h-4 w-4" />}
            />
          </div>

          {/* District Heatmap */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-warm-white">District Demand Analysis</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                Live Data
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DISTRICTS.map((district) => (
                <div
                  key={district.name}
                  className="rounded-sm border border-white/8 p-4 bg-white/[0.02] hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-warm-white">{district.name}</span>
                    <span className={`
                      text-[10px] uppercase px-1.5 py-0.5 rounded-sm
                      ${district.trend === "up" ? "bg-emerald-400/20 text-emerald-400" : ""}
                      ${district.trend === "down" ? "bg-critical-crimson/20 text-critical-crimson" : ""}
                      ${district.trend === "stable" ? "bg-white/10 text-titanium" : ""}
                    `}>
                      {district.trend}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-mist">Demand Score</span>
                        <span className="text-warm-white">{district.demand}</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gold rounded-full"
                          style={{ width: `${district.demand}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-mist">Avg Price</span>
                      <span className="text-gold-light">{district.price}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-mist">Intent</span>
                      <span className={district.intent > 80 ? "text-emerald-400" : "text-titanium"}>
                        {district.intent}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Competitor Activity */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-warm-white">Competitor Movement</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                Real-time tracking
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Competitor</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Activity Level</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Current Focus</th>
                    <th className="pb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-mist font-normal">Sentiment</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {COMPETITORS.map((comp) => (
                    <tr key={comp.name} className="border-b border-white/5 last:border-0">
                      <td className="py-3 text-warm-white">{comp.name}</td>
                      <td className="py-3">
                        <span className={`
                          text-[10px] uppercase px-2 py-0.5 rounded-sm
                          ${comp.activity === "High" ? "bg-critical-crimson/20 text-critical-crimson" : ""}
                          ${comp.activity === "Medium" ? "bg-risk-amber/20 text-risk-amber" : ""}
                          ${comp.activity === "Low" ? "bg-white/10 text-titanium" : ""}
                        `}>
                          {comp.activity}
                        </span>
                      </td>
                      <td className="py-3 text-titanium">{comp.focus}</td>
                      <td className="py-3">
                        <span className={`
                          text-[10px] uppercase
                          ${comp.sentiment === "Positive" ? "text-emerald-400" : ""}
                          ${comp.sentiment === "Neutral" ? "text-titanium" : ""}
                          ${comp.sentiment === "Negative" ? "text-critical-crimson" : ""}
                        `}>
                          {comp.sentiment}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pricing Pressure Alert */}
          <section className="rounded-sm border border-risk-amber/30 bg-risk-amber/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-risk-amber shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display text-base text-warm-white mb-1">Pricing Pressure Detected</h4>
                <p className="text-sm text-titanium mb-3">
                  Palm Jumeirah inventory showing 15% increase in discount inquiries. 
                  Competitor pricing 8% below market average in comparable units.
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-sm bg-risk-amber/20 border border-risk-amber/40 text-risk-amber text-xs hover:bg-risk-amber/30 transition-colors">
                    View Analysis
                  </button>
                  <button className="px-3 py-1.5 rounded-sm border border-white/15 text-titanium text-xs hover:border-white/30 transition-colors">
                    Ignore
                  </button>
                </div>
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
