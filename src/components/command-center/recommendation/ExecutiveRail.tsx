import RecommendationPanel from "@/components/command-center/recommendation/RecommendationPanel";
import type { ExecutiveRailSignal } from "@/components/command-center/recommendation/types";

type ExecutiveRailProps = {
  items: ExecutiveRailSignal[];
};

export default function ExecutiveRail({ items }: ExecutiveRailProps) {
  const severityTone: Record<ExecutiveRailSignal["severity"], string> = {
    opportunity: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
    threat: "text-rose-200 border-rose-300/30 bg-rose-500/10",
    instability: "text-amber-200 border-amber-300/30 bg-amber-500/10",
  };

  return (
    <RecommendationPanel title="Executive rail" eyebrow="Escalated threats and opportunity spikes">
      <div className="space-y-2">
        {items.map((item) => (
          <article key={item.id} className={`rounded-xs border p-2 ${severityTone[item.severity]}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em]">{item.severity}</p>
                <p className="mt-1 text-sm text-warm-white">{item.title}</p>
                <p className="text-xs text-titanium">{item.body}</p>
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em]">drift {item.confidenceDrift}</p>
            </div>
          </article>
        ))}
      </div>
    </RecommendationPanel>
  );
}
