import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Recommendation } from "@/components/command-center/recommendation/types";

type RecommendationKpiRibbonProps = {
  recommendations: Recommendation[];
  queueDepth: number;
  eventRate: number;
};

export default function RecommendationKpiRibbon({ recommendations, queueDepth, eventRate }: RecommendationKpiRibbonProps) {
  const top = recommendations[0];
  const confidence = top?.score.confidence ?? 0;
  const strategicImpact = top?.score.strategicImpact ?? 0;
  const avgPriority = recommendations.length
    ? recommendations.reduce((sum, item) => sum + item.score.priorityIndex, 0) / recommendations.length
    : 0;
  const criticalCount = recommendations.filter((item) => item.score.riskLevel === "critical").length;

  const sparkData = recommendations.slice(0, 6).map((item, index) => ({
    label: `T${index + 1}`,
    priority: item.score.priorityIndex,
    confidence: item.score.confidence,
  }));

  const cards = [
    { label: "Top confidence", value: `${confidence.toFixed(1)}%`, detail: "Model certainty" },
    { label: "Strategic impact", value: `${strategicImpact.toFixed(1)}`, detail: "Executive impact score" },
    { label: "Avg priority", value: `${avgPriority.toFixed(1)}`, detail: "Ranking engine output" },
    { label: "Critical threats", value: `${criticalCount}`, detail: "Escalated recommendations" },
    { label: "Event queue depth", value: `${queueDepth}`, detail: "Realtime event ingestion" },
    { label: "Stream event rate", value: `${eventRate}/m`, detail: "Signal throughput" },
  ];

  return (
    <section className="grid gap-3 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xs border border-white/10 bg-white/4 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold/70">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-light text-warm-white">{card.value}</p>
            <p className="text-xs text-titanium">{card.detail}</p>
          </article>
        ))}
      </div>
      <article className="rounded-xs border border-white/10 bg-white/4 p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-gold/70">Priority-confidence trend</p>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priorityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c8a96e" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#c8a96e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  background: "#111217",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f5f0e8",
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="priority" stroke="#e2c99a" fill="url(#priorityFill)" strokeWidth={1.8} />
              <Area type="monotone" dataKey="confidence" stroke="#9a9a9a" fill="transparent" strokeWidth={1.4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
