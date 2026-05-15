"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Check, X, Play, Sparkles } from "lucide-react";
import PageShell from "@/components/command-center/PageShell";
import RecommendationCard from "@/components/command-center/ui/RecommendationCard";
import AlertCard from "@/components/command-center/ui/AlertCard";
import IntelligenceRail from "@/components/command-center/ui/IntelligenceRail";
import MetricCard from "@/components/command-center/ui/MetricCard";
import type { DecisionQueueItem, IntelligenceRailSignal } from "@/components/command-center/types";

// Mock data for recommendations
const PRIORITY_RECOMMENDATIONS = [
  {
    id: "1",
    type: "high-impact" as const,
    recommendation: "Shift Palm Jumeirah inventory to founder-led narrative",
    reason: "Current promotional messaging showing 23% lower engagement vs authority content",
    expectedImpact: "+18% qualified inquiries, +12% meeting conversion",
    confidence: 92,
    suggestedAction: "Approve Strategy Shift",
  },
  {
    id: "2",
    type: "medium-risk" as const,
    recommendation: "Pause external referral channel spend",
    reason: "Lead purity dropped 11.2% in 48h, CAC increasing disproportionately",
    expectedImpact: "-8% volume, +35% lead quality, -15% CAC",
    confidence: 87,
    suggestedAction: "Review Channel Data",
  },
  {
    id: "3",
    type: "fast-win" as const,
    recommendation: "Deploy trust signal micro-content for DIFC prospects",
    reason: "High-intent segment showing 40% longer decision cycles",
    expectedImpact: "-25% sales cycle, +15% conversion",
    confidence: 84,
    suggestedAction: "Generate Content",
  },
];

// Mock risk alerts
const RISK_ALERTS = [
  {
    id: "r1",
    severity: "P2" as const,
    title: "Lead quality drop detected",
    description: "External referral channel purity declined 11.2% in last 48 hours",
    timestamp: "9m ago",
  },
  {
    id: "r2",
    severity: "P3" as const,
    title: "Competitor campaign anomaly",
    description: "New waterfront campaign from competitor cluster C detected",
    timestamp: "31m ago",
  },
  {
    id: "r3",
    severity: "P3" as const,
    title: "Founder authority velocity decline",
    description: "Content engagement down 8% week-over-week",
    timestamp: "2h ago",
  },
  {
    id: "r4",
    severity: "P4" as const,
    title: "Inventory promotion imbalance",
    description: "Palm inventory over-indexed on discount messaging vs value",
    timestamp: "4h ago",
  },
];

// Mock decision queue
const INITIAL_DECISIONS: DecisionQueueItem[] = [
  {
    id: "d1",
    action: "Increase founder content budget by 30%",
    context: "Scenario: Q4 authority positioning",
    impact: "+22% trust score, +15% investor confidence",
    status: "pending",
  },
  {
    id: "d2",
    action: "Reallocate 20% of paid spend to influencer partnerships",
    context: "Scenario: Network effect optimization",
    impact: "+18% reach, +12% engagement quality",
    status: "pending",
  },
  {
    id: "d3",
    action: "Delay Jumeirah Bay launch by 2 weeks",
    context: "Scenario: Market timing optimization",
    impact: "+8% pricing power, -5% early momentum",
    status: "pending",
  },
];

// Mock intelligence rail signals
const RAIL_SIGNALS: IntelligenceRailSignal[] = [
  {
    id: "s1",
    type: "market",
    title: "Jumeirah Bay Intent Surge",
    body: "Buyer intent intensity crossed premium threshold (91.4)",
    timestamp: "18m ago",
    severity: "opportunity",
  },
  {
    id: "s2",
    type: "risk",
    title: "Lead Purity Decline",
    body: "External channel quality dropped 11.2% in 48h",
    timestamp: "9m ago",
    severity: "risk",
  },
  {
    id: "s3",
    type: "insight",
    title: "Founder Content Correlation",
    body: "Content velocity correlates with +22% VIP conversion",
    timestamp: "1h ago",
    severity: "opportunity",
  },
  {
    id: "s4",
    type: "competitor",
    title: "Waterfront Campaign Launch",
    body: "Competitor cluster C detected with neutral sentiment",
    timestamp: "31m ago",
    severity: "signal",
  },
  {
    id: "s5",
    type: "recommendation",
    title: "Budget Reallocation",
    body: "Shift 14% Palm budget to DIFC founder narratives",
    timestamp: "3m ago",
    severity: "opportunity",
  },
];

// Copilot suggestions
const COPILOT_SUGGESTIONS = [
  "What should we do this week?",
  "Where is lead quality dropping?",
  "Which founder narrative is strongest?",
  "Simulate increasing founder content by 30%",
];

export default function AIRecommendationEngineScreen() {
  const [decisions, setDecisions] = useState<DecisionQueueItem[]>(INITIAL_DECISIONS);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDecision = (id: string, action: "approved" | "dismissed" | "simulated") => {
    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: action } : d));
  };

  const handleCopilotSubmit = () => {
    if (!copilotInput.trim()) return;
    setIsLoading(true);
    // Simulate AI response
    setTimeout(() => {
      setCopilotResponse(`Based on current market signals, I recommend focusing on founder authority content this week. Lead intelligence shows a 22% correlation between content velocity and VIP conversions. Consider increasing founder content budget by 20-30% while pausing underperforming external channels.`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <PageShell>
      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Active Recommendations"
          value="12"
          subtitle="3 high priority"
          trend="up"
          trendValue="+4 this week"
        />
        <MetricCard
          title="Avg Confidence"
          value="87%"
          subtitle="Above threshold"
          trend="up"
          trendValue="+2.3%"
        />
        <MetricCard
          title="Risk Alerts"
          value="4"
          subtitle="1 P2, 3 P3/P4"
          trend="down"
          trendValue="-2 from yesterday"
        />
        <MetricCard
          title="Actions Pending"
          value={decisions.filter(d => d.status === "pending").length.toString()}
          subtitle="Awaiting approval"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Priority Recommendations */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-warm-white">Priority Recommendations</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                AI-Generated
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRIORITY_RECOMMENDATIONS.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  {...rec}
                  onAction={() => console.log("Action:", rec.suggestedAction)}
                />
              ))}
            </div>
          </section>

          {/* Risk Alerts */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-warm-white">Risk Alerts</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-critical-crimson">
                Live Monitoring
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RISK_ALERTS.map((alert) => (
                <AlertCard key={alert.id} {...alert} />
              ))}
            </div>
          </section>

          {/* Decision Queue */}
          <section className="rounded-sm border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-warm-white">Decision Queue</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist">
                {decisions.filter(d => d.status === "pending").length} Pending
              </span>
            </div>
            <div className="space-y-3">
              {decisions.map((decision) => (
                <motion.div
                  key={decision.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-sm border border-white/8 p-4 bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-warm-white mb-1">{decision.action}</h4>
                      <p className="text-xs text-mist mb-1">{decision.context}</p>
                      <p className="text-xs text-gold-light">Impact: {decision.impact}</p>
                    </div>
                    
                    {decision.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecision(decision.id, "approved")}
                          className="p-2 rounded-sm bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/20 transition-colors"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDecision(decision.id, "dismissed")}
                          className="p-2 rounded-sm bg-critical-crimson/10 border border-critical-crimson/30 text-critical-crimson hover:bg-critical-crimson/20 transition-colors"
                          title="Dismiss"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDecision(decision.id, "simulated")}
                          className="p-2 rounded-sm bg-signal-blue/10 border border-signal-blue/30 text-signal-blue hover:bg-signal-blue/20 transition-colors"
                          title="Simulate"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`
                        text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded-sm
                        ${decision.status === "approved" ? "bg-emerald-400/20 text-emerald-400" : ""}
                        ${decision.status === "dismissed" ? "bg-critical-crimson/20 text-critical-crimson" : ""}
                        ${decision.status === "simulated" ? "bg-signal-blue/20 text-signal-blue" : ""}
                      `}>
                        {decision.status}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* AI Strategy Copilot */}
          <section className="rounded-sm border border-gold/20 bg-gold/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-gold" />
              <h2 className="font-display text-xl text-warm-white">AI Strategy Copilot</h2>
            </div>
            
            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {COPILOT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setCopilotInput(suggestion)}
                  className="px-3 py-1.5 rounded-full text-[11px] bg-white/5 border border-white/10 text-titanium hover:border-gold/30 hover:text-gold transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCopilotSubmit()}
                placeholder="Ask the AI Strategy Copilot..."
                className="flex-1 bg-void border border-white/15 rounded-sm px-4 py-2.5 text-sm text-warm-white placeholder:text-mist focus:border-gold/40 focus:outline-none transition-colors"
              />
              <button
                onClick={handleCopilotSubmit}
                disabled={isLoading || !copilotInput.trim()}
                className="px-4 py-2.5 rounded-sm bg-gold/20 border border-gold/40 text-gold hover:bg-gold/30 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 border-2 border-gold/30 border-t-gold rounded-full"
                  />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Response */}
            {copilotResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-sm bg-void border border-gold/20"
              >
                <p className="text-sm text-titanium leading-relaxed">{copilotResponse}</p>
              </motion.div>
            )}
          </section>
        </div>

        {/* Right Column - Intelligence Rail */}
        <aside className="rounded-sm border border-white/10 bg-white/[0.02] p-5 h-fit">
          <IntelligenceRail signals={RAIL_SIGNALS} />
        </aside>
      </div>
    </PageShell>
  );
}
