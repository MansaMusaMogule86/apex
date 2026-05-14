"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BrainCircuit, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ScenarioPanel from "@/components/command-center/scenario/ScenarioPanel";

type ScenarioAnalysis = {
  headline: string;
  verdict: "bullish" | "cautious" | "bearish";
  confidence: number;
  topRisk: string;
  topOpportunity: string;
  recommendations: string[];
  executiveSummary: string;
};

type Props = {
  controls?: {
    founderContent: number;
    luxuryPositioning: number;
    influencerDeployment: number;
    prActivation: number;
    investorMessaging: number;
    geographicExpansion: number;
    pricingChange: number;
    narrativeFraming: number;
    aggression: number;
    riskTolerance: number;
    capitalAllocation: number;
    influenceBudget: number;
    timeline: string;
  };
  outcomes?: {
    revenueProjection: number;
    prestigeVolatility: number;
    hnwiConversion: number;
    investorSentiment: number;
    authorityEvolution: number;
  };
};

const DEFAULT_CONTROLS = {
  founderContent: 55,
  luxuryPositioning: 60,
  influencerDeployment: 50,
  prActivation: 45,
  investorMessaging: 58,
  geographicExpansion: 40,
  pricingChange: 42,
  narrativeFraming: 60,
  aggression: 50,
  riskTolerance: 45,
  capitalAllocation: 52,
  influenceBudget: 48,
  timeline: "90d",
};

const DEFAULT_OUTCOMES = {
  revenueProjection: 12.4,
  prestigeVolatility: 24.1,
  hnwiConversion: 41.8,
  investorSentiment: 71.2,
  authorityEvolution: 68.5,
};

const VERDICT_STYLES = {
  bullish:
    "border-emerald-400/40 bg-emerald-400/[0.08] text-emerald-300",
  cautious:
    "border-amber-400/40 bg-amber-400/[0.08] text-amber-300",
  bearish:
    "border-rose-400/40 bg-rose-400/[0.08] text-rose-300",
};

const SILK = [0.16, 1, 0.3, 1] as const;

export default function AiRecommendationEngine({ controls, outcomes }: Props) {
  const [analysis, setAnalysis] = useState<ScenarioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controls: controls ?? DEFAULT_CONTROLS,
          outcomes: outcomes ?? DEFAULT_OUTCOMES,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as { analysis: ScenarioAnalysis };
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI analysis failed");
    } finally {
      setLoading(false);
    }
  }, [controls, outcomes]);

  useEffect(() => {
    void fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScenarioPanel
      title="AI Recommendation Engine"
      subtitle="Live Strategic Analysis"
      decisionTie="Execute highest-confidence actions to improve scenario quality."
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-3.5 w-3.5 text-gold/70" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
              Gemini Flash · Scenario Intelligence
            </span>
          </div>
          <button
            type="button"
            onClick={() => void fetchAnalysis()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-[2px] border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-titanium transition-colors hover:border-gold/25 hover:text-warm-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-8"
            >
              <Loader2 className="h-6 w-6 animate-spin text-gold/60" />
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
                Analyzing scenario parameters...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-[2px] border border-rose-400/25 bg-rose-400/[0.06] p-3 text-xs text-rose-300"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-400/80">
                Analysis unavailable
              </p>
              <p className="mt-1 text-xs text-rose-300/70">{error}</p>
              <p className="mt-1 text-[10px] text-rose-300/50">
                Ensure OPENROUTER_API_KEY is set in .env.local
              </p>
            </motion.div>
          ) : analysis ? (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: SILK }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium leading-5 text-warm-white">
                  {analysis.headline}
                </p>
                <span
                  className={`shrink-0 rounded-[2px] border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] ${VERDICT_STYLES[analysis.verdict]}`}
                >
                  {analysis.verdict}
                </span>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-mist">
                    AI Confidence
                  </span>
                  <span className="font-mono text-[10px] text-gold-light">
                    {analysis.confidence}%
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-white/10">
                  <motion.div
                    className="h-1 rounded-full bg-gold/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.confidence}%` }}
                    transition={{ duration: 0.8, ease: SILK }}
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-[2px] border border-rose-400/20 bg-rose-400/[0.05] p-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-rose-400/80">
                    Top risk
                  </p>
                  <p className="mt-1 text-xs leading-4 text-rose-200">{analysis.topRisk}</p>
                </div>
                <div className="rounded-[2px] border border-emerald-400/20 bg-emerald-400/[0.05] p-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-emerald-400/80">
                    Top opportunity
                  </p>
                  <p className="mt-1 text-xs leading-4 text-emerald-200">
                    {analysis.topOpportunity}
                  </p>
                </div>
              </div>

              <div className="rounded-[2px] border border-gold/15 bg-gold/[0.04] p-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-gold/70">
                  Executive summary
                </p>
                <p className="mt-1.5 text-xs leading-5 text-beige">{analysis.executiveSummary}</p>
              </div>

              <div>
                <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-mist">
                  Strategic actions
                </p>
                <div className="space-y-1.5">
                  {analysis.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-[2px] border border-white/8 bg-white/[0.02] p-2"
                    >
                      <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-gold/60" />
                      <p className="text-xs leading-4 text-titanium">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </ScenarioPanel>
  );
}
