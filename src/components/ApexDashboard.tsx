import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  X,
  Radar
} from "lucide-react";

// === TYPES ===
interface ContentItem {
  id: string;
  title: string;
  trust: number;
  authConv: number;
  engagement: number;
  appts: number;
  investorSignal: 'STRONG' | 'MODERATE' | 'WEAK';
  type: 'memo' | 'brief' | 'interview' | 'analysis';
}

interface Signal {
  id: string;
  tag: 'AUTH' | 'TRUST' | 'NARR' | 'INV' | 'COMP';
  headline: string;
  value: string;
  timestamp: string;
  status: 'positive' | 'negative' | 'neutral';
  source: 'internal' | 'external' | 'ai_generated';
}

interface Alert {
  id: string;
  level: 'P1' | 'P2' | 'P3' | 'P4';
  title: string;
  description: string;
  timestamp: string;
  autoResolve: boolean;
  resolved?: boolean;
}

// === MOCK DATA ===
const INITIAL_CONTENT: ContentItem[] = [
  {
    id: '1',
    title: 'Q4 Market Outlook: Scarcity & Discipline',
    trust: 92,
    authConv: 85,
    engagement: 78,
    appts: 12,
    investorSignal: 'STRONG',
    type: 'memo'
  },
  {
    id: '2',
    title: 'Delivery Certainty Framework',
    trust: 88,
    authConv: 72,
    engagement: 81,
    appts: 8,
    investorSignal: 'MODERATE',
    type: 'brief'
  },
  {
    id: '3',
    title: 'Strategic Capital Lens Interview',
    trust: 85,
    authConv: 91,
    engagement: 86,
    appts: 15,
    investorSignal: 'STRONG',
    type: 'interview'
  }
];

const INITIAL_SIGNALS: Signal[] = [
  { id: 's1', tag: 'AUTH', headline: 'Authority conversion +23% on founder memo', value: '+23%', timestamp: '2m ago', status: 'positive', source: 'ai_generated' },
  { id: 's2', tag: 'TRUST', headline: 'Trust score exceeded 90 on market outlook', value: '92/100', timestamp: '5m ago', status: 'positive', source: 'ai_generated' },
  { id: 's3', tag: 'NARR', headline: 'Narrative engagement up 18% week-over-week', value: '+18%', timestamp: '12m ago', status: 'positive', source: 'ai_generated' },
  { id: 's4', tag: 'INV', headline: 'Strong investor signal on delivery framework', value: 'STRONG', timestamp: '18m ago', status: 'positive', source: 'ai_generated' },
  { id: 's5', tag: 'COMP', headline: 'Competitor voice share declining', value: '-8%', timestamp: '25m ago', status: 'positive', source: 'external' },
];

const INITIAL_ALERTS: Alert[] = [
  { id: 'a1', level: 'P3', title: 'Lead purity drop detected', description: 'External channel quality declined 11% in 48h', timestamp: '9m ago', autoResolve: true },
  { id: 'a2', level: 'P2', title: 'Founder authority velocity decline', description: 'Content engagement down 8% week-over-week', timestamp: '1h ago', autoResolve: false },
];

const RECOMMENDATIONS = [
  {
    id: 'r1',
    priority: 'HIGH',
    headline: 'Double down on founder-led narratives',
    action: 'Increase founder content budget by 30%',
    reason: 'Authority content showing 3.2x conversion vs promotional'
  },
  {
    id: 'r2',
    priority: 'MEDIUM',
    headline: 'Pause underperforming external channels',
    action: 'Reallocate 20% of paid spend to organic',
    reason: 'CAC increasing 45% while quality declines'
  },
  {
    id: 'r3',
    priority: 'FAST',
    headline: 'Deploy trust signals for DIFC prospects',
    action: 'Generate micro-content for high-intent segment',
    reason: '40% longer decision cycles detected'
  }
];

// === COMPONENT ===
export default function ApexDashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'signals' | 'alerts'>('overview');
  const [content] = useState<ContentItem[]>(INITIAL_CONTENT);
  const [signals] = useState<Signal[]>(INITIAL_SIGNALS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulateScenario, setSimulateScenario] = useState<'content' | 'budget' | 'market'>('content');
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationResult(null);
    
    setTimeout(() => {
      const results = {
        content: 'Simulating 30% increase in founder content...\n\nProjected outcomes (90 days):\n• Authority score: +18% (72 → 85)\n• Trust index: +12% (88 → 98)\n• Lead quality: +22%\n• Conversion rate: +15%\n\nRisk level: LOW\nConfidence: 87%',
        budget: 'Simulating budget reallocation...\n\nShifting 20% from paid to organic:\n• CAC reduction: -35%\n• Lead quality improvement: +28%\n• Short-term volume impact: -12%\n• 90-day net revenue impact: +8%\n\nRisk level: MEDIUM\nConfidence: 82%',
        market: 'Simulating market entry timing...\n\nDelaying launch by 2 weeks:\n• Pricing power improvement: +8%\n• Competitive positioning: STRONGER\n• Market readiness: +15%\n• Opportunity cost: $2.1M\n\nRisk level: LOW\nConfidence: 79%'
      };
      
      setSimulationResult(results[simulateScenario]);
      setIsSimulating(false);
    }, 2000);
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  const getInvestorSignalColor = (signal: string) => {
    switch (signal) {
      case 'STRONG': return 'text-emerald-400 bg-emerald-400/10';
      case 'MODERATE': return 'text-amber-400 bg-amber-400/10';
      case 'WEAK': return 'text-rose-400 bg-rose-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'P1': return 'text-rose-400 border-rose-400/30 bg-rose-400/5';
      case 'P2': return 'text-orange-400 border-orange-400/30 bg-orange-400/5';
      case 'P3': return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
      case 'P4': return 'text-blue-400 border-blue-400/30 bg-blue-400/5';
      default: return 'text-slate-400 border-slate-400/30 bg-slate-400/5';
    }
  };

  const compositeScore = (item: ContentItem) => 
    Math.round((item.trust * 0.3 + item.authConv * 0.25 + item.engagement * 0.25 + Math.min(item.appts * 5, 100) * 0.2));

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#030305] text-[#e8e4da] font-sans selection:bg-[#c9b27c]/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#030305]/90 backdrop-blur-xl border-b border-[#c9b27c]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c9b27c] to-[#8b7355] flex items-center justify-center">
              <span className="text-[#030305] font-bold text-xl">A</span>
            </div>
            <div>
              <h1 className="font-display text-xl tracking-wider text-[#c9b27c]">APEX</h1>
              <p className="text-[10px] text-[#9b9ca3] uppercase tracking-[0.3em]">Command Center</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-1 bg-[#0a0a0d] rounded-lg p-1 border border-[#c9b27c]/10">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'content', label: 'Content' },
              { key: 'signals', label: 'Signals' },
              { key: 'alerts', label: 'Alerts' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-[#c9b27c]/20 text-[#c9b27c]'
                    : 'text-[#9b9ca3] hover:text-[#e8e4da]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSimulateModal(true)}
              className="px-4 py-2 bg-[#c9b27c]/10 border border-[#c9b27c]/30 rounded-lg text-xs font-mono uppercase tracking-wider text-[#c9b27c] hover:bg-[#c9b27c]/20 transition-all duration-300 flex items-center gap-2"
            >
              <Radar className="w-4 h-4" />
              Simulate
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Market Velocity", value: "+12.4%", trend: "up", icon: TrendingUp },
                  { label: "Lead Quality", value: "87.3", trend: "up", icon: TrendingUp },
                  { label: "Conversion Rate", value: "4.8%", trend: "up", icon: TrendingUp },
                  { label: "Active Alerts", value: "4", trend: "down", icon: TrendingDown },
                ].map((kpi) => (
                  <div
                    key={kpi.label}
                    className="bg-[#0a0a0d] border border-[#c9b27c]/10 rounded-xl p-5 hover:border-[#c9b27c]/30 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#9b9ca3]">{kpi.label}</span>
                      <kpi.icon className={`w-4 h-4 ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`} />
                    </div>
                    <div className="text-2xl font-display text-[#e8e4da]">{kpi.value}</div>
                  </div>
                ))}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recommendations */}
                <div className="lg:col-span-2 space-y-4">
                  <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-[#c9b27c] mb-4">Priority Recommendations</h2>
                  {RECOMMENDATIONS.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-[#0a0a0d] border border-[#c9b27c]/10 rounded-xl p-5 hover:border-[#c9b27c]/30 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded ${
                          rec.priority === 'HIGH' ? 'bg-rose-400/10 text-rose-400' :
                          rec.priority === 'MEDIUM' ? 'bg-amber-400/10 text-amber-400' :
                          'bg-emerald-400/10 text-emerald-400'
                        }`}>
                          {rec.priority} PRIORITY
                        </span>
                      </div>
                      <h3 className="font-display text-lg text-[#e8e4da] mb-2 group-hover:text-[#c9b27c] transition-colors">{rec.headline}</h3>
                      <p className="text-sm text-[#9b9ca3] mb-3">{rec.reason}</p>
                      <div className="flex items-center gap-2 text-xs text-[#c9b27c]">
                        <span className="font-mono uppercase tracking-wider">Suggested Action:</span>
                        <span>{rec.action}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Signals */}
                <div className="space-y-4">
                  <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-[#c9b27c] mb-4">Live Signals</h2>
                  <div className="bg-[#0a0a0d] border border-[#c9b27c]/10 rounded-xl p-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {signals.map((signal) => (
                      <div
                        key={signal.id}
                        className="p-3 rounded-lg bg-[#030305] border border-[#c9b27c]/5 hover:border-[#c9b27c]/20 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono text-[#c9b27c]">{signal.tag}</span>
                          <span className="text-[10px] text-[#9b9ca3]">{signal.timestamp}</span>
                        </div>
                        <p className="text-xs text-[#e8e4da] mb-1">{signal.headline}</p>
                        <span className={`text-xs font-mono ${signal.status === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {signal.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CONTENT TAB */}
          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-[#c9b27c]">Content Intelligence</h2>
                <button className="text-xs text-[#9b9ca3] hover:text-[#c9b27c] transition-colors">View All</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedContent(item)}
                    className="bg-[#0a0a0d] border border-[#c9b27c]/10 rounded-xl p-5 hover:border-[#c9b27c]/30 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#9b9ca3]">{item.type}</span>
                      <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded ${getInvestorSignalColor(item.investorSignal)}`}>
                        {item.investorSignal}
                      </span>
                    </div>
                    <h3 className="font-display text-base text-[#e8e4da] mb-4 group-hover:text-[#c9b27c] transition-colors line-clamp-2">{item.title}</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#9b9ca3]">Trust</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1 bg-[#c9b27c]/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#c9b27c] rounded-full" style={{ width: `${item.trust}%` }} />
                          </div>
                          <span className="text-[#e8e4da] font-mono">{item.trust}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#9b9ca3]">Authority</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1 bg-[#c9b27c]/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#c9b27c] rounded-full" style={{ width: `${item.authConv}%` }} />
                          </div>
                          <span className="text-[#e8e4da] font-mono">{item.authConv}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#9b9ca3]">Engagement</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1 bg-[#c9b27c]/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#c9b27c] rounded-full" style={{ width: `${item.engagement}%` }} />
                          </div>
                          <span className="text-[#e8e4da] font-mono">{item.engagement}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#c9b27c]/10 flex items-center justify-between">
                      <span className="text-[10px] text-[#9b9ca3]">{item.appts} appointments</span>
                      <span className="text-[10px] font-mono text-[#c9b27c]">Score: {compositeScore(item)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SIGNALS TAB */}
          {activeTab === 'signals' && (
            <motion.div
              key="signals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-[#c9b27c]">Signal Stream</h2>
              
              <div className="space-y-3">
                {signals.map((signal) => (
                  <div
                    key={signal.id}
                    className="bg-[#0a0a0d] border border-[#c9b27c]/10 rounded-xl p-5 hover:border-[#c9b27c]/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          signal.status === 'positive' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'
                        }`}>
                          <span className="text-xs font-mono font-bold">{signal.tag}</span>
                        </div>
                        <div>
                          <p className="text-[#e8e4da] mb-1">{signal.headline}</p>
                          <div className="flex items-center gap-3 text-[10px] text-[#9b9ca3]">
                            <span>{signal.timestamp}</span>
                            <span>•</span>
                            <span className="capitalize">{signal.source.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-lg font-mono font-bold ${
                        signal.status === 'positive' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {signal.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ALERTS TAB */}
          {activeTab === 'alerts' && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-[#c9b27c]">Active Alerts</h2>
              
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-xl p-5 transition-all duration-300 ${
                      alert.resolved ? 'opacity-50 bg-[#0a0a0d]/50 border-[#c9b27c]/5' : getAlertColor(alert.level)
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                          alert.level === 'P1' ? 'text-rose-400' :
                          alert.level === 'P2' ? 'text-orange-400' :
                          alert.level === 'P3' ? 'text-amber-400' : 'text-blue-400'
                        }`} />
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-mono font-bold">{alert.level}</span>
                            <h3 className="text-[#e8e4da] font-medium">{alert.title}</h3>
                          </div>
                          <p className="text-sm text-[#9b9ca3] mb-2">{alert.description}</p>
                          <span className="text-[10px] text-[#9b9ca3]">{alert.timestamp}</span>
                        </div>
                      </div>
                      {!alert.resolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-3 py-1.5 bg-[#c9b27c]/10 border border-[#c9b27c]/30 rounded text-xs font-mono uppercase tracking-wider text-[#c9b27c] hover:bg-[#c9b27c]/20 transition-all"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Simulation Modal */}
      <AnimatePresence>
        {showSimulateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030305]/90 backdrop-blur-xl p-6"
            onClick={() => !isSimulating && setShowSimulateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0d] border border-[#c9b27c]/20 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl text-[#c9b27c]">Scenario Simulator</h2>
                <button
                  onClick={() => setShowSimulateModal(false)}
                  className="p-2 hover:bg-[#c9b27c]/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#9b9ca3]" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-3">
                  {[
                    { key: 'content', label: 'Content Strategy' },
                    { key: 'budget', label: 'Budget Shift' },
                    { key: 'market', label: 'Market Timing' },
                  ].map((scenario) => (
                    <button
                      key={scenario.key}
                      onClick={() => setSimulateScenario(scenario.key as typeof simulateScenario)}
                      disabled={isSimulating}
                      className={`flex-1 py-3 px-4 rounded-lg border text-xs font-mono uppercase tracking-wider transition-all ${
                        simulateScenario === scenario.key
                          ? 'bg-[#c9b27c]/20 border-[#c9b27c] text-[#c9b27c]'
                          : 'border-[#c9b27c]/20 text-[#9b9ca3] hover:border-[#c9b27c]/50'
                      }`}
                    >
                      {scenario.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="w-full py-4 bg-[#c9b27c] text-[#030305] rounded-lg font-mono uppercase tracking-wider text-sm font-bold hover:bg-[#d4bd8b] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSimulating ? 'Running Simulation...' : 'Run Simulation'}
                </button>

                {simulationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#030305] border border-[#c9b27c]/20 rounded-lg p-6 font-mono text-sm whitespace-pre-line text-[#e8e4da]"
                  >
                    {simulationResult}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Detail Modal */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030305]/90 backdrop-blur-xl p-6"
            onClick={() => setSelectedContent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a0d] border border-[#c9b27c]/20 rounded-2xl p-8 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9b9ca3]">{selectedContent.type}</span>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="p-2 hover:bg-[#c9b27c]/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[#9b9ca3]" />
                </button>
              </div>

              <h2 className="font-display text-2xl text-[#e8e4da] mb-6">{selectedContent.title}</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#030305] border border-[#c9b27c]/10 rounded-lg p-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9b9ca3]">Trust Score</span>
                  <div className="text-2xl font-display text-[#c9b27c] mt-1">{selectedContent.trust}</div>
                </div>
                <div className="bg-[#030305] border border-[#c9b27c]/10 rounded-lg p-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9b9ca3]">Authority Conv.</span>
                  <div className="text-2xl font-display text-[#c9b27c] mt-1">{selectedContent.authConv}</div>
                </div>
                <div className="bg-[#030305] border border-[#c9b27c]/10 rounded-lg p-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9b9ca3]">Engagement</span>
                  <div className="text-2xl font-display text-[#c9b27c] mt-1">{selectedContent.engagement}</div>
                </div>
                <div className="bg-[#030305] border border-[#c9b27c]/10 rounded-lg p-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#9b9ca3]">Appointments</span>
                  <div className="text-2xl font-display text-[#c9b27c] mt-1">{selectedContent.appts}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-[#c9b27c]/10">
                <span className={`text-xs font-mono uppercase px-3 py-1.5 rounded ${getInvestorSignalColor(selectedContent.investorSignal)}`}>
                  {selectedContent.investorSignal} Signal
                </span>
                <span className="text-sm font-mono text-[#9b9ca3]">Composite: {compositeScore(selectedContent)}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono&display=swap');
        
        .font-display { font-family: 'Playfair Display', serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(200, 169, 110, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(200, 169, 110, 0.3); }
      `}</style>
    </div>
  );
}
