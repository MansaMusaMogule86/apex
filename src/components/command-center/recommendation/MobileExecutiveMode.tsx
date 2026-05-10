import type { Recommendation } from "@/components/command-center/recommendation/types";

type MobileExecutiveModeProps = {
  recommendations: Recommendation[];
};

export default function MobileExecutiveMode({ recommendations }: MobileExecutiveModeProps) {
  return (
    <section className="rounded-xs border border-white/10 bg-white/3 p-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold/70">Mobile executive mode</p>
      <div className="mt-2 space-y-2">
        {recommendations.slice(0, 3).map((rec) => (
          <article key={rec.id} className="rounded-xs border border-white/10 bg-white/2 p-2">
            <h4 className="text-sm text-warm-white">{rec.title}</h4>
            <p className="text-xs text-titanium">{rec.summary}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gold-light">
              <span>Priority {rec.score.priorityIndex.toFixed(1)}</span>
              <span>Confidence {rec.score.confidence.toFixed(1)}%</span>
              <span>Risk {rec.score.riskLevel}</span>
            </div>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {rec.suggestedActions.slice(0, 2).map((action) => (
                <button
                  key={action}
                  type="button"
                  className="rounded-xs border border-gold/20 bg-gold/10 px-2 py-1 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-gold-light"
                >
                  One-click action: {action}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
