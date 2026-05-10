import RecommendationPanel from "@/components/command-center/recommendation/RecommendationPanel";
import type { Recommendation } from "@/components/command-center/recommendation/types";

type PriorityEngineTableProps = {
  recommendations: Recommendation[];
};

export default function PriorityEngineTable({ recommendations }: PriorityEngineTableProps) {
  return (
    <RecommendationPanel title="Priority ranking engine" eyebrow="Scoring and strategic prioritization">
      <div className="overflow-x-auto">
        <table className="w-full min-w-220 border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-titanium">
              <th className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">Recommendation</th>
              <th className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">Confidence</th>
              <th className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">Strategic impact</th>
              <th className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">Revenue impact</th>
              <th className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">Prestige impact</th>
              <th className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">Risk</th>
              <th className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">Time sensitivity</th>
              <th className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">Execution complexity</th>
              <th className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">Outcome window</th>
              <th className="px-2 py-2 font-mono text-[10px] uppercase tracking-[0.14em]">Priority index</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map((rec) => (
              <tr key={rec.id} className="border-b border-white/6 text-warm-white/90">
                <td className="px-2 py-2">{rec.title}</td>
                <td className="px-2 py-2">{rec.score.confidence.toFixed(1)}%</td>
                <td className="px-2 py-2">{rec.score.strategicImpact.toFixed(1)}</td>
                <td className="px-2 py-2">{rec.score.revenueImpact.toFixed(1)}</td>
                <td className="px-2 py-2">{rec.score.prestigeImpact.toFixed(1)}</td>
                <td className="px-2 py-2 capitalize">{rec.score.riskLevel}</td>
                <td className="px-2 py-2">{rec.score.timeSensitivity.toFixed(1)}</td>
                <td className="px-2 py-2">{rec.score.executionComplexity.toFixed(1)}</td>
                <td className="px-2 py-2">{rec.score.outcomeWindow}</td>
                <td className="px-2 py-2 font-semibold text-gold-light">{rec.score.priorityIndex.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RecommendationPanel>
  );
}
