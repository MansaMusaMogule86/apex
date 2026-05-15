"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, Radar } from "lucide-react";
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
  const [activeRecommendationId, setActiveRecommendationId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const handleRecommendationAction = (id: string, actionName: string) => {
    setActiveRecommendationId(id);
    setIsLoading(true);

    // Simulate "Back End" processing and data integrity check
    setTimeout(() => {
      setIsLoading(false);
      setActiveRecommendationId(null);
      setNotification({
        message: `${actionName} executed successfully. Intelligence layer updated.`,
        type: "success"
      });

      // Clear notification after 3s
      setTimeout(() => setNotification(null), 3000);
    }, 1200);
  };

  const handleDecision = (id: string, action: "approved" | "dismissed" | "simulated") => {
    const decision = decisions.find(d => d.id === id);
    if (!decision) return;

    setDecisions(prev => prev.map(d => d.id === id ? { ...d, status: action } : d));
    
    setNotification({
      message: `Strategic decision '${decision.action}' marked as ${action}.`,
      type: "info"
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopilotSubmit = () => {
    if (!copilotInput.trim()) return;
    setIsLoading(true);
    setCopilotResponse(null);
    
    // Simulate AI strategy generation
    setTimeout(() => {
      setCopilotResponse(`Based on current market signals, I recommend focusing on founder authority content this week. Lead intelligence shows a 22% correlation between content velocity and VIP conversions. Consider increasing founder content budget by 20-30% while pausing underperforming external channels.`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <PageShell>
      {/* Notification Overlay */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-20 left-1/2 z-50 flex items-center gap-3 rounded-[2px] border px-6 py-3 shadow-2xl backdrop-blur-xl ${
              notification.type === "success" 
                ? "border-gold/30 bg-gold/10 text-gold" 
                : "border-white/20 bg-white/5 text-platinum"
            }`}
          >
            {notification.type === "success" ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <MetricCard
          title="Active Recommendations"
          value="12"
          subtitle="3 high priority"
          trend="up"
          trendValue="+4 this week"
          className="bg-white/[0.01] border-white/5 hover:border-gold/20 transition-all"
        />
        <MetricCard
          title="Avg Confidence"
          value="87%"
          subtitle="Above threshold"
          trend="up"
          trendValue="+2.3%"
          className="bg-white/[0.01] border-white/5 hover:border-gold/20 transition-all"
        />
        <MetricCard
          title="Risk Alerts"
          value="4"
          subtitle="1 P2, 3 P3/P4"
          trend="down"
          trendValue="-2 from yesterday"
          className="bg-white/[0.01] border-white/5 hover:border-gold/20 transition-all"
        />
        <MetricCard
          title="Actions Pending"
          value={decisions.filter(d => d.status === "pending").length.toString()}
          subtitle="Awaiting approval"
          className="bg-white/[0.01] border-white/5 hover:border-gold/20 transition-all"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-10">
        {/* Left Column */}
        <div className="space-y-12">
          {/* Priority Recommendations */}
          <section>
            <div className="flex items-end justify-between mb-6 px-1">
              <div>
                <span className="text-[10px] font-mono tracking-[0.4em] text-gold/60 uppercase">Strategic Priority</span>
                <h2 className="text-3xl text-white font-light tracking-tighter mt-1 italic font-display">Priority Recommendations</h2>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20">
                AI GEN. ALPHA-4
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRIORITY_RECOMMENDATIONS.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  {...rec}
                  onAction={() => handleRecommendationAction(rec.id, rec.suggestedAction)}
                  isLoading={activeRecommendationId === rec.id}
                />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Risk Alerts */}
            <section>
              <div className="flex items-end justify-between mb-6 px-1">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.4em] text-cinnabar/60 uppercase">Defense Layer</span>
                  <h2 className="text-2xl text-white font-light tracking-tighter mt-1 font-display italic">Risk Alerts</h2>
                </div>
              </div>
              <div className="space-y-3">
                {RISK_ALERTS.map((alert) => (
                  <AlertCard 
                    key={alert.id} 
                    {...alert} 
                    className="bg-white/[0.01] border-white/5 hover:border-cinnabar/20 transition-all"
                  />
                ))}
              </div>
            </section>

            {/* Decision Queue */}
            <section>
              <div className="flex items-end justify-between mb-6 px-1">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.4em] text-gold/60 uppercase">Operations</span>
                  <h2 className="text-2xl text-white font-light tracking-tighter mt-1 font-display italic">Decision Queue</h2>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20">
                  {decisions.filter(d => d.status === "pending").length} REVIEWS REQ.
                </span>
              </div>
              <div className="space-y-3">
                {decisions.map((decision) => (
                  <motion.div
                    key={decision.id}
                    layout
                    className="rounded-[2px] border border-white/5 p-5 bg-white/[0.01] hover:bg-white/[0.03] transition-all"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white mb-2 tracking-tight">{decision.action}</h4>
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{decision.context}</p>
                          <div className="w-1 h-1 rounded-full bg-gold/20" />
                          <p className="text-[10px] font-mono text-gold-light uppercase tracking-widest">Impact: {decision.impact}</p>
                        </div>
                      </div>
                      
                      {decision.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDecision(decision.id, "approved")}
                            className="p-2.5 rounded-sm bg-gold/5 border border-gold/20 text-gold hover:bg-gold/20 transition-all"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDecision(decision.id, "dismissed")}
                            className="p-2.5 rounded-sm bg-white/5 border border-white/10 text-white/40 hover:text-white/80 transition-all"
                            title="Dismiss"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`
                          text-[9px] font-mono uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm border
                          ${decision.status === "approved" ? "border-gold/30 bg-gold/10 text-gold" : "border-white/10 text-white/20"}
                        `}>
                          {decision.status}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* AI Strategy Copilot */}
          <section className="relative overflow-hidden rounded-[2px] border border-gold/20 bg-gold/5 p-10 backdrop-blur-md">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <Sparkles size={120} className="text-gold" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="h-5 w-5 text-gold" />
                <h2 className="text-2xl text-white font-light tracking-tighter font-display italic">Executive Strategy Copilot</h2>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {COPILOT_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setCopilotInput(suggestion)}
                    className="px-4 py-2 rounded-sm text-[10px] font-mono tracking-widest bg-white/5 border border-white/5 text-white/40 hover:border-gold/40 hover:text-gold transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCopilotSubmit()}
                  placeholder="Inquire for strategic synthesis..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-sm px-5 py-4 text-sm text-white placeholder:text-white/20 focus:border-gold/40 focus:outline-none transition-all font-serif italic"
                />
                <button
                  onClick={handleCopilotSubmit}
                  disabled={isLoading || !copilotInput.trim()}
                  className="px-8 py-4 bg-gold text-black text-[11px] font-mono font-bold tracking-[0.3em] uppercase hover:bg-gold-light transition-all rounded-sm disabled:opacity-30"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full"
                    />
                  ) : (
                    "Synthesize"
                  )}
                </button>
              </div>

              {copilotResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 rounded-sm bg-black/40 border border-gold/10 relative"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold/40" />
                  <p className="text-sm text-white/70 leading-relaxed font-serif italic">{copilotResponse}</p>
                </motion.div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Intelligence Rail */}
        <aside className="space-y-6">
          <div className="sticky top-24">
            <div className="flex items-center gap-3 mb-6 px-1">
              <Radar size={16} className="text-gold/60" />
              <h2 className="text-lg text-white font-light tracking-tighter uppercase font-mono tracking-[0.2em]">Live Intel</h2>
            </div>
            <div className="rounded-[2px] border border-white/5 bg-white/[0.01] p-1 backdrop-blur-sm">
              <IntelligenceRail signals={RAIL_SIGNALS} />
            </div>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:italic,wght@400;700&family=JetBrains+Mono&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>
    </PageShell>
  );
}
