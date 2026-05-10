import RecommendationPanel from "@/components/command-center/recommendation/RecommendationPanel";

export default function OrchestrationDiagram() {
  const nodes = [
    "Event Ingestion",
    "Signal Aggregation",
    "Anomaly Detection",
    "Scoring Engine",
    "Priority Ranking",
    "Contradiction Resolver",
    "Executive Decision Agent",
    "Recommendation Feed",
    "Feedback + Memory",
  ];

  return (
    <RecommendationPanel title="AI orchestration diagram" eyebrow="Recommendation lifecycle architecture">
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-5">
        {nodes.map((node, index) => (
          <article key={node} className="relative rounded-xs border border-white/10 bg-white/3 p-3 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold/70">Node {index + 1}</p>
            <p className="mt-1 text-sm text-warm-white">{node}</p>
            {index < nodes.length - 1 ? (
              <span className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-4 bg-gold/40 xl:block" />
            ) : null}
          </article>
        ))}
      </div>

      <div className="mt-3 grid gap-2 rounded-xs border border-gold/20 bg-gold/8 p-3 text-xs text-gold-light lg:grid-cols-4">
        <p>Event-driven triggering: signal threshold, anomaly spike, confidence drift.</p>
        <p>Suppression logic: low confidence + high complexity strategic suppression.</p>
        <p>Duplicate prevention: type-area uniqueness hash with latest-highest priority retention.</p>
        <p>Decay and invalidation: priority/confidence decay over cycles with invalidation on confidence collapse.</p>
      </div>
    </RecommendationPanel>
  );
}
