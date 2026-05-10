import { motion } from "framer-motion";
import { ArrowUpRight, ShieldAlert } from "lucide-react";
import RecommendationPanel from "@/components/command-center/recommendation/RecommendationPanel";
import type { Recommendation } from "@/components/command-center/recommendation/types";

type RecommendationFeedProps = {
  recommendations: Recommendation[];
};

const SILK = [0.16, 1, 0.3, 1] as const;

export default function RecommendationFeed({ recommendations }: RecommendationFeedProps) {
  return (
    <RecommendationPanel title="Executive recommendation feed" eyebrow="Strategic AI advisor feed">
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <motion.article
            key={rec.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.04, ease: SILK }}
            className="rounded-xs border border-white/10 bg-white/3 p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold/70">{rec.type.replaceAll("-", " ")}</p>
                <h4 className="font-display text-xl font-light text-warm-white">{rec.title}</h4>
                <p className="max-w-4xl text-sm text-titanium">{rec.summary}</p>
              </div>
              <div className="rounded-xs border border-gold/20 bg-gold/8 px-2 py-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-light">Priority {rec.score.priorityIndex.toFixed(1)}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div className="rounded-xs border border-white/10 bg-white/2 p-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold/70">AI reasoning</p>
                <p className="mt-1 text-xs text-titanium">{rec.reasoning}</p>
              </div>
              <div className="rounded-xs border border-white/10 bg-white/2 p-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold/70">Forecast outcomes</p>
                <p className="mt-1 text-xs text-titanium">{rec.forecastOutcome}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-5">
              <Metric label="Confidence" value={`${rec.score.confidence.toFixed(1)}%`} />
              <Metric label="Strategic impact" value={rec.score.strategicImpact.toFixed(1)} />
              <Metric label="Revenue impact" value={rec.score.revenueImpact.toFixed(1)} />
              <Metric label="Prestige impact" value={rec.score.prestigeImpact.toFixed(1)} />
              <Metric label="Escalation" value={rec.escalationState} />
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div className="rounded-xs border border-white/10 bg-white/2 p-2">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold/70">Suggested actions</p>
                <div className="space-y-1">
                  {rec.suggestedActions.map((action) => (
                    <p key={action} className="inline-flex items-center gap-1 text-xs text-titanium">
                      <ArrowUpRight className="h-3 w-3 text-gold-light" />
                      {action}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xs border border-white/10 bg-white/2 p-2">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold/70">Supporting evidence</p>
                <div className="space-y-1 text-xs text-titanium">
                  {rec.supportingEvidence.map((evidence) => (
                    <p key={`${rec.id}-${evidence.source}`}>
                      {evidence.source}: {evidence.statement} (w {evidence.weight})
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <footer className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <p className="text-titanium">Timeline urgency: {rec.urgency}</p>
              <p className="inline-flex items-center gap-1 text-gold-light">
                <ShieldAlert className="h-3.5 w-3.5" />
                Risk level: {rec.score.riskLevel}
              </p>
            </footer>
          </motion.article>
        ))}
      </div>
    </RecommendationPanel>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xs border border-white/10 bg-white/2 p-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold/70">{label}</p>
      <p className="mt-1 text-sm text-warm-white">{value}</p>
    </article>
  );
}
