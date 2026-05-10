import RecommendationPanel from "@/components/command-center/recommendation/RecommendationPanel";
import type { RecommendationMemory } from "@/components/command-center/recommendation/types";

type MemorySystemPanelProps = {
  memory: RecommendationMemory;
};

export default function MemorySystemPanel({ memory }: MemorySystemPanelProps) {
  const sections: Array<{ title: string; values: string[] }> = [
    { title: "Executive interaction memory", values: memory.executiveInteractions },
    { title: "Strategic history memory", values: memory.strategicHistory },
    { title: "Recommendation outcome memory", values: memory.recommendationOutcomes },
    { title: "Organizational memory", values: memory.organizationMemory },
    { title: "Prestige trajectory memory", values: memory.prestigeTrajectory },
    { title: "Narrative evolution memory", values: memory.narrativeEvolution },
  ];

  return (
    <RecommendationPanel title="AI memory system" eyebrow="Adaptive recommendation memory layers">
      <div className="grid gap-3 lg:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="rounded-xs border border-white/10 bg-white/3 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold/70">{section.title}</p>
            <div className="mt-2 space-y-1 text-xs text-titanium">
              {section.values.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </RecommendationPanel>
  );
}
