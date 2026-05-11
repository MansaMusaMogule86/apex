import type {
  AudienceSegment,
  AuthorityRadarPoint,
  CompetitorEntry,
  ContentIntel,
  ExecutiveRailItem,
  ExtendedTrend,
  FounderKpi,
  LiveSignal,
  NarrativeSignal,
  StrategyRecommendation,
  TrustPoint,
  VoiceShareEntry,
} from "@/components/command-center/founder/types";

export const FOUNDER_KPIS: FounderKpi[] = [
  {
    id: "k1",
    label: "Founder Gravity Score",
    value: "93.2",
    deltaPct: 4.8,
    confidence: 91,
    momentum: "accelerating",
    commentary: "Gravity strengthened after investor roundtable narratives.",
    sparkline: [
      { x: "1", y: 71 },
      { x: "2", y: 74 },
      { x: "3", y: 79 },
      { x: "4", y: 83 },
      { x: "5", y: 89 },
      { x: "6", y: 93 },
    ],
  },
  {
    id: "k2",
    label: "Trust Momentum",
    value: "+17.4%",
    deltaPct: 3.1,
    confidence: 88,
    momentum: "accelerating",
    commentary: "HNWI trust velocity sustained for 3 consecutive cycles.",
    sparkline: [
      { x: "1", y: 58 },
      { x: "2", y: 61 },
      { x: "3", y: 66 },
      { x: "4", y: 71 },
      { x: "5", y: 74 },
      { x: "6", y: 79 },
    ],
  },
  {
    id: "k3",
    label: "Prestige Index",
    value: "89.7",
    deltaPct: 2.2,
    confidence: 86,
    momentum: "stable",
    commentary: "Prestige resonance remains above competitor benchmark band.",
    sparkline: [
      { x: "1", y: 67 },
      { x: "2", y: 70 },
      { x: "3", y: 74 },
      { x: "4", y: 78 },
      { x: "5", y: 83 },
      { x: "6", y: 87 },
    ],
  },
  {
    id: "k4",
    label: "Voice Share",
    value: "41.8%",
    deltaPct: 1.9,
    confidence: 84,
    momentum: "stable",
    commentary: "Founder-owned narrative share expanded in premium channels.",
    sparkline: [
      { x: "1", y: 32 },
      { x: "2", y: 34 },
      { x: "3", y: 36 },
      { x: "4", y: 38 },
      { x: "5", y: 40 },
      { x: "6", y: 42 },
    ],
  },
  {
    id: "k5",
    label: "Influence Yield",
    value: "7.6x",
    deltaPct: 5.3,
    confidence: 90,
    momentum: "accelerating",
    commentary: "Authority content now converts at 7.6x blended baseline.",
    sparkline: [
      { x: "1", y: 44 },
      { x: "2", y: 49 },
      { x: "3", y: 55 },
      { x: "4", y: 61 },
      { x: "5", y: 67 },
      { x: "6", y: 73 },
    ],
  },
  {
    id: "k6",
    label: "Narrative Penetration",
    value: "78.1",
    deltaPct: 2.7,
    confidence: 85,
    momentum: "stable",
    commentary: "Key narrative themes now reached 78% premium audience penetration.",
    sparkline: [
      { x: "1", y: 51 },
      { x: "2", y: 56 },
      { x: "3", y: 61 },
      { x: "4", y: 67 },
      { x: "5", y: 73 },
      { x: "6", y: 78 },
    ],
  },
];

export const NARRATIVE_SIGNALS: NarrativeSignal[] = [
  {
    id: "n1",
    narrative: "Founder as market architect",
    velocity: 92,
    trustLift: 18,
    conversionLift: 13,
    investorConfidence: 89,
    prestigeAmplification: 86,
  },
  {
    id: "n2",
    narrative: "Scarcity-backed development discipline",
    velocity: 84,
    trustLift: 15,
    conversionLift: 11,
    investorConfidence: 82,
    prestigeAmplification: 88,
  },
  {
    id: "n3",
    narrative: "Institutional governance in luxury delivery",
    velocity: 77,
    trustLift: 12,
    conversionLift: 10,
    investorConfidence: 91,
    prestigeAmplification: 79,
  },
];

export const AUTHORITY_TREND = [
  { label: "W1", velocity: 61, trust: 58, perception: 55 },
  { label: "W2", velocity: 66, trust: 62, perception: 60 },
  { label: "W3", velocity: 71, trust: 68, perception: 65 },
  { label: "W4", velocity: 76, trust: 72, perception: 70 },
  { label: "W5", velocity: 82, trust: 77, perception: 74 },
  { label: "W6", velocity: 88, trust: 83, perception: 80 },
];

export const VOICE_SHARE: VoiceShareEntry[] = [
  { name: "APEX Founder", founderShare: 42, competitorShare: 24, overlap: 21, migration: 14 },
  { name: "Competitor A", founderShare: 24, competitorShare: 34, overlap: 26, migration: -5 },
  { name: "Competitor B", founderShare: 18, competitorShare: 28, overlap: 19, migration: -3 },
  { name: "Competitor C", founderShare: 16, competitorShare: 14, overlap: 12, migration: 2 },
];

export const TRUST_ENGINE: TrustPoint[] = [
  { label: "W1", trustVolatility: 39, reputationRisk: 34, sentiment: 63, positioning: 58, hnwiQuality: 55 },
  { label: "W2", trustVolatility: 36, reputationRisk: 31, sentiment: 66, positioning: 63, hnwiQuality: 59 },
  { label: "W3", trustVolatility: 33, reputationRisk: 29, sentiment: 70, positioning: 68, hnwiQuality: 64 },
  { label: "W4", trustVolatility: 30, reputationRisk: 26, sentiment: 74, positioning: 72, hnwiQuality: 69 },
  { label: "W5", trustVolatility: 28, reputationRisk: 24, sentiment: 79, positioning: 77, hnwiQuality: 73 },
  { label: "W6", trustVolatility: 25, reputationRisk: 22, sentiment: 83, positioning: 82, hnwiQuality: 78 },
];

export const STRATEGY_FEED: StrategyRecommendation[] = [
  { id: "s1", action: "Deploy founder narrative", confidence: 93, impact: "+11 trust momentum", priority: "critical" },
  { id: "s2", action: "Increase investor-facing content", confidence: 90, impact: "+9 investor confidence", priority: "high" },
  { id: "s3", action: "Shift communication tone", confidence: 85, impact: "-6 sentiment volatility", priority: "high" },
  { id: "s4", action: "Increase exclusivity framing", confidence: 82, impact: "+8 prestige velocity", priority: "medium" },
  { id: "s5", action: "Deploy authority interviews", confidence: 86, impact: "+7 narrative penetration", priority: "high" },
  { id: "s6", action: "Launch market positioning report", confidence: 79, impact: "+6 voice share", priority: "medium" },
  { id: "s7", action: "Reduce narrative dilution", confidence: 88, impact: "+10 influence conversion", priority: "critical" },
  { id: "s8", action: "Increase trust reinforcement touchpoints", confidence: 91, impact: "+12 sentiment stability", priority: "critical" },
];

export const CONTENT_INTELLIGENCE: ContentIntel[] = [
  {
    id: "c1",
    title: "Founder market memo: scarcity and discipline",
    trustScore: 92,
    authorityConversion: 38,
    engagementQuality: 88,
    appointments: 14,
    investorSignal: "Strong",
  },
  {
    id: "c2",
    title: "Institutional brief: delivery certainty framework",
    trustScore: 87,
    authorityConversion: 33,
    engagementQuality: 84,
    appointments: 11,
    investorSignal: "Strong",
  },
  {
    id: "c3",
    title: "Founder interview: strategic capital lens",
    trustScore: 84,
    authorityConversion: 29,
    engagementQuality: 81,
    appointments: 9,
    investorSignal: "Moderate",
  },
];

export const EXEC_RAIL: ExecutiveRailItem[] = [
  {
    id: "r1",
    type: "risk",
    title: "Prestige risk",
    body: "Narrative fatigue detected in one premium channel cluster.",
    timestamp: "6m ago",
  },
  {
    id: "r2",
    type: "anomaly",
    title: "Narrative anomaly",
    body: "Competitor messaging overlap increased 9 points in 24h.",
    timestamp: "11m ago",
  },
  {
    id: "r3",
    type: "sentiment",
    title: "Sentiment spike",
    body: "Trust sentiment spiked after founder governance briefing.",
    timestamp: "19m ago",
  },
  {
    id: "r4",
    type: "reaction",
    title: "Market reaction",
    body: "Investor cohort engagement depth rose 14% post-report release.",
    timestamp: "33m ago",
  },
  {
    id: "r5",
    type: "competitor",
    title: "Competitor founder activity",
    body: "Competitor A launching executive interview series next week.",
    timestamp: "42m ago",
  },
];

export const AUTHORITY_RADAR: AuthorityRadarPoint[] = [
  { axis: "Narrative Control", score: 88, benchmark: 62 },
  { axis: "Investor Confidence", score: 91, benchmark: 58 },
  { axis: "HNWI Resonance", score: 85, benchmark: 61 },
  { axis: "Prestige Velocity", score: 79, benchmark: 54 },
  { axis: "Market Authority", score: 93, benchmark: 67 },
  { axis: "Trust Stability", score: 83, benchmark: 55 },
];

export const AUDIENCE_SEGMENTS: AudienceSegment[] = [
  { segment: "HNWI Investors", reach: 84, quality: 93, conversion: 31, trust: 91 },
  { segment: "Institutional Capital", reach: 71, quality: 88, conversion: 24, trust: 86 },
  { segment: "Premium Media", reach: 78, quality: 76, conversion: 19, trust: 79 },
  { segment: "Industry Thought Leaders", reach: 63, quality: 82, conversion: 22, trust: 84 },
  { segment: "Strategic Partners", reach: 57, quality: 91, conversion: 38, trust: 89 },
];

export const COMPETITOR_MATRIX: CompetitorEntry[] = [
  { competitor: "APEX Founder", authorityScore: 93, trustIndex: 89, narrativeReach: 78, investorGrade: 91, prestige: 87 },
  { competitor: "Competitor A", authorityScore: 71, trustIndex: 68, narrativeReach: 62, investorGrade: 73, prestige: 65 },
  { competitor: "Competitor B", authorityScore: 64, trustIndex: 61, narrativeReach: 58, investorGrade: 66, prestige: 71 },
  { competitor: "Competitor C", authorityScore: 58, trustIndex: 54, narrativeReach: 51, investorGrade: 59, prestige: 61 },
];

export const LIVE_SIGNALS: LiveSignal[] = [
  { id: "ls1", type: "authority", message: "Founder gravity score surpassed 93 threshold", delta: "+4.8%", ts: "just now" },
  { id: "ls2", type: "investor", message: "High-conviction investor cohort engagement up 14%", delta: "+14%", ts: "2m ago" },
  { id: "ls3", type: "narrative", message: "Market architect narrative velocity accelerating", delta: "+9%", ts: "5m ago" },
  { id: "ls4", type: "trust", message: "HNWI trust sentiment spiked post governance brief", delta: "+6%", ts: "8m ago" },
  { id: "ls5", type: "competitor", message: "Competitor A narrative overlap reduced 4 points", delta: "−4pts", ts: "11m ago" },
  { id: "ls6", type: "authority", message: "Voice share expanded in premium institutional channels", delta: "+2.1%", ts: "14m ago" },
  { id: "ls7", type: "narrative", message: "Scarcity framing content reached peak distribution", delta: "+18%", ts: "19m ago" },
  { id: "ls8", type: "investor", message: "Series B investor cohort added to authority watch list", delta: "new", ts: "23m ago" },
];

export const EXTENDED_TREND: ExtendedTrend[] = [
  { week: "W1", authority: 61, trust: 58, prestige: 55, voiceShare: 29 },
  { week: "W2", authority: 64, trust: 62, prestige: 58, voiceShare: 31 },
  { week: "W3", authority: 68, trust: 65, prestige: 61, voiceShare: 33 },
  { week: "W4", authority: 71, trust: 68, prestige: 65, voiceShare: 34 },
  { week: "W5", authority: 74, trust: 70, prestige: 68, voiceShare: 35 },
  { week: "W6", authority: 77, trust: 73, prestige: 71, voiceShare: 37 },
  { week: "W7", authority: 80, trust: 76, prestige: 74, voiceShare: 38 },
  { week: "W8", authority: 83, trust: 78, prestige: 77, voiceShare: 39 },
  { week: "W9", authority: 86, trust: 81, prestige: 80, voiceShare: 40 },
  { week: "W10", authority: 88, trust: 83, prestige: 82, voiceShare: 41 },
  { week: "W11", authority: 91, trust: 86, prestige: 85, voiceShare: 41 },
  { week: "W12", authority: 93, trust: 89, prestige: 87, voiceShare: 42 },
];
