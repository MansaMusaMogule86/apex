import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight,
  Clock,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle2,
  X,
  Maximize2
} from 'lucide-react';

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
  tag: 'AUTH' | 'INV' | 'NARR' | 'TRUST' | 'COMP';
  headline: string;
  value: string;
  timestamp: string;
  status: 'positive' | 'negative' | 'neutral';
}

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  category: string;
}

// === MOCK DATA GENERATOR ===
const generateContentData = (): ContentItem[] => [
  {
    id: '1',
    title: 'Founder market memo: scarcity and discipline',
    trust: 92,
    authConv: 38,
    engagement: 88,
    appts: 14,
    investorSignal: 'STRONG',
    type: 'memo'
  },
  {
    id: '2',
    title: 'Institutional brief: delivery certainty framework',
    trust: 87,
    authConv: 33,
    engagement: 84,
    appts: 11,
    investorSignal: 'STRONG',
    type: 'brief'
  },
  {
    id: '3',
    title: 'Founder interview: strategic capital lens',
    trust: 84,
    authConv: 29,
    engagement: 81,
    appts: 9,
    investorSignal: 'MODERATE',
    type: 'interview'
  }
];

const generateSignals = (): Signal[] => [
  { id: '1', tag: 'AUTH', headline: 'Founder gravity score surpassed 93 threshold', value: '+4.8%', timestamp: 'just now', status: 'positive' },
  { id: '2', tag: 'INV', headline: 'High-conviction investor cohort engagement up 14%', value: '+14%', timestamp: '2m ago', status: 'positive' },
  { id: '3', tag: 'NARR', headline: 'Market architect narrative velocity accelerating', value: '+9%', timestamp: '5m ago', status: 'positive' },
  { id: '4', tag: 'TRUST', headline: 'HNWI trust sentiment spiked post governance brief', value: '+6%', timestamp: '8m ago', status: 'positive' },
  { id: '5', tag: 'COMP', headline: 'Competitor A narrative overlap reduced 4 points', value: '-4pts', timestamp: '11m ago', status: 'negative' },
  { id: '6', tag: 'AUTH', headline: 'Voice share expanded in premium institutional channels', value: '+2.1%', timestamp: '14m ago', status: 'positive' },
  { id: '7', tag: 'NARR', headline: 'Scarcity framing content reached peak distribution', value: '+18%', timestamp: '19m ago', status: 'positive' },
  { id: '8', tag: 'INV', headline: 'Series B investor cohort added to authority watch list', value: 'new', timestamp: '23m ago', status: 'neutral' }
];

const generateTimeline = (): TimelineEvent[] => [
  { id: '1', time: '09:42', title: 'Critical threshold crossed', description: 'Founder gravity score exceeded 93 — automatic authority escalation triggered', impact: 'critical', category: 'Authority' },
  { id: '2', time: '09:38', title: 'Investor engagement spike', description: 'High-conviction cohort showed 14% engagement increase following scarcity memo', impact: 'high', category: 'Investor' },
  { id: '3', time: '09:35', title: 'Narrative velocity alert', description: 'Market architect narrative accelerating beyond baseline — content distribution peak', impact: 'high', category: 'Narrative' },
  { id: '4', time: '09:31', title: 'Trust sentiment recovery', description: 'HNWI trust rebounded +6% post-governance brief delivery', impact: 'medium', category: 'Trust' },
  { id: '5', time: '09:28', title: 'Competitor gap widened', description: 'Competitor A narrative overlap reduced to historic low — defensive advantage', impact: 'high', category: 'Competitive' },
  { id: '6', time: '09:24', title: 'Voice share expansion', description: 'Premium institutional channel voice share increased 2.1% — authority reinforcement', impact: 'medium', category: 'Authority' },
  { id: '7', time: '09:19', title: 'Distribution peak reached', description: 'Scarcity framing content achieved maximum network distribution', impact: 'high', category: 'Distribution' },
  { id: '8', time: '09:15', title: 'New cohort identified', description: 'Series B investor segment added to authority watch list for targeted engagement', impact: 'medium', category: 'Investor' }
];

// === COMPONENT ===
export default function ApexDashboard() {
  const [contentData, setContentData] = useState<ContentItem[]>(generateContentData());
  const [signals, setSignals] = useState<Signal[]>(generateSignals());
  const [timeline, setTimeline] = useState<TimelineEvent[]>(generateTimeline());
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // Update random signal
      setSignals(prev => {
        const newSignals = [...prev];
        const randomIdx = Math.floor(Math.random() * newSignals.length);
        const signal = newSignals[randomIdx];

        // Update value slightly
        const currentVal = parseFloat(signal.value);
        if (!isNaN(currentVal)) {
          const change = (Math.random() - 0.5) * 2;
          signal.value = `${currentVal >= 0 ? '+' : ''}${(currentVal + change).toFixed(1)}%`;
        }
        signal.timestamp = 'just now';

        return newSignals;
      });

      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getSignalColor = (tag: Signal['tag']) => {
    const colors = {
      AUTH: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      INV: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      NARR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      TRUST: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      COMP: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[tag];
  };

  const getStatusIcon = (status: Signal['status']) => {
    if (status === 'positive') return <TrendingUp className="w-3 h-3 text-emerald-400" />;
    if (status === 'negative') return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Activity className="w-3 h-3 text-amber-400" />;
  };

  const getImpactColor = (impact: TimelineEvent['impact']) => {
    const colors = {
      critical: 'text-red-400 bg-red-500/10 border-red-500/20',
      high: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      low: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    };
    return colors[impact];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-300 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-white tracking-wide">APEX COMMAND CENTER</h1>
          <p className="text-xs text-gray-500 mt-1">Executive intelligence operating surface</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
            <span className={isLive ? 'text-emerald-400' : 'text-gray-500'}>
              {isLive ? 'STREAM CONNECTED' : 'OFFLINE'}
            </span>
          </div>
          <button 
            onClick={() => setIsLive(!isLive)}
            className="px-3 py-1 text-xs border border-white/10 rounded hover:bg-white/5 transition-colors"
          >
            {isLive ? 'PAUSE' : 'RESUME'}
          </button>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white/[0.02] border border-red-500/20 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-red-400 font-medium">CRITICAL</span>
            <span className="text-xs text-emerald-400">DEPLOYED</span>
          </div>
          <p className="text-sm text-gray-300">Reduce narrative dilution</p>
          <p className="text-xs text-gray-500 mt-1">Impact: +10 influence conversion</p>
          <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500/50 w-[88%]" />
          </div>
          <span className="text-xs text-gray-500">88%</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white/[0.02] border border-red-500/20 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-red-400 font-medium">CRITICAL</span>
            <span className="text-xs text-emerald-400">DEPLOYED</span>
          </div>
          <p className="text-sm text-gray-300">Increase trust reinforcement touchpoints</p>
          <p className="text-xs text-gray-500 mt-1">Impact: +12 sentiment stability</p>
          <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500/50 w-[91%]" />
          </div>
          <span className="text-xs text-gray-500">91%</span>
        </motion.div>
      </div>

      {/* Content Intelligence Panel */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs text-gray-500 tracking-widest">CONTENT PERFORMANCE</h2>
            <h3 className="text-xl font-light text-white">Content Intelligence Panel</h3>
            <p className="text-xs text-gray-500 mt-1">
              Decision: Double down on content that compounds trust and appointment conversion.
            </p>
          </div>
          <div className="text-xs text-gray-500">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 p-3 text-xs text-gray-500 border-b border-white/10">
            <span>CONTENT</span>
            <span className="text-center">TRUST</span>
            <span className="text-center">AUTH CONV</span>
            <span className="text-center">ENGAGEMENT</span>
            <span className="text-center">APPTS</span>
            <span className="text-center">INVESTOR SIGNAL</span>
          </div>

          {/* Table Rows */}
          <AnimatePresence>
            {contentData.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedContent(selectedContent === item.id ? null : item.id)}
                className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 p-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/[0.03] ${
                  selectedContent === item.id ? 'bg-white/[0.05]' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-amber-500/50" />
                  <span className="text-sm text-gray-300">{item.title}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-amber-400">{item.trust}</span>
                  <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.trust}%` }}
                      className="h-full bg-amber-500/50" 
                    />
                  </div>
                </div>
                <div className="text-center text-sm text-gray-400">{item.authConv}%</div>
                <div className="text-center text-sm text-gray-400">{item.engagement}</div>
                <div className="text-center text-sm text-gray-400">{item.appts}</div>
                <div className="flex justify-center">
                  <span className={`px-2 py-0.5 text-xs rounded border ${
                    item.investorSignal === 'STRONG' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : item.investorSignal === 'MODERATE'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {item.investorSignal}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center justify-between p-3 text-xs text-gray-500">
            <span>Total appointments generated: <span className="text-amber-400">34</span></span>
            <span>Avg trust score: <span className="text-amber-400">88</span></span>
          </div>
        </div>
      </motion.div>

      {/* Live Signal Stream */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs text-gray-500 tracking-widest">REAL-TIME AUTHORITY INTELLIGENCE</h2>
            <h3 className="text-xl font-light text-white">Live Signal Stream</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400">LIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {signals.map((signal, idx) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 bg-white/[0.02] border border-white/10 rounded-lg hover:bg-white/[0.04] transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      signal.status === 'positive' ? 'bg-emerald-500' : 
                      signal.status === 'negative' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {signal.headline}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${getSignalColor(signal.tag)}`}>
                          {signal.tag}
                        </span>
                        <span className={`text-xs font-mono ${
                          signal.value.startsWith('+') ? 'text-emerald-400' : 
                          signal.value.startsWith('-') ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {signal.value}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="w-3 h-3" />
                    {signal.timestamp}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Open Full Intelligence Timeline Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowTimeline(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-colors"
      >
        <Target className="w-4 h-4" />
        <span className="text-sm">OPEN FULL INTELLIGENCE TIMELINE</span>
        <ArrowRight className="w-4 h-4" />
      </motion.button>

      {/* Full Timeline Modal */}
      <AnimatePresence>
        {showTimeline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-[80vh] bg-[#0f0f13] border border-white/10 rounded-xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-light text-white">Intelligence Timeline</h2>
                  <p className="text-xs text-gray-500">Complete chronological record of all signals and decisions</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => setShowTimeline(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Timeline Content */}
              <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
                {timeline.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-mono text-gray-500">{event.time}</span>
                      <div className="w-px h-full bg-white/10 mt-1" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-[10px] rounded border ${getImpactColor(event.impact)}`}>
                          {event.impact.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{event.category}</span>
                      </div>
                      <h4 className="text-sm text-white font-medium">{event.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                    </div>
                    <div className="flex items-center">
                      {event.impact === 'critical' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      {event.impact === 'high' && <Zap className="w-4 h-4 text-amber-400" />}
                      {event.impact === 'medium' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      {event.impact === 'low' && <Shield className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-4 border-t border-white/10">
                <span className="text-xs text-gray-500">{timeline.length} events recorded</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs border border-white/10 rounded hover:bg-white/5 transition-colors">
                    Export JSON
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded hover:bg-amber-500/20 transition-colors">
                    Generate Report
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}