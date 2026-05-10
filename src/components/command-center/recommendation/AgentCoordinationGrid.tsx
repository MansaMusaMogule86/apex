import RecommendationPanel from "@/components/command-center/recommendation/RecommendationPanel";
import type { AgentSpec } from "@/components/command-center/recommendation/types";

type AgentCoordinationGridProps = {
  agents: AgentSpec[];
};

export default function AgentCoordinationGrid({ agents }: AgentCoordinationGridProps) {
  return (
    <RecommendationPanel title="Multi-agent architecture" eyebrow="Specialized strategic agents">
      <div className="grid gap-3 lg:grid-cols-2">
        {agents.map((agent) => (
          <article key={agent.name} className="rounded-xs border border-white/10 bg-white/3 p-3">
            <h4 className="font-display text-xl font-light text-warm-white">{agent.name}</h4>
            <GridRow label="Inputs" values={agent.inputs} />
            <GridRow label="Outputs" values={agent.outputs} />
            <GridRow label="Responsibilities" values={agent.responsibilities} />
            <GridRow label="Trigger conditions" values={agent.triggerConditions} />
            <GridRow label="Coordination flows" values={agent.coordinationFlows} />
            <GridRow label="Escalation logic" values={agent.escalationLogic} />
          </article>
        ))}
      </div>
    </RecommendationPanel>
  );
}

function GridRow({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="mt-2 rounded-xs border border-white/8 bg-white/2 p-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold/70">{label}</p>
      <div className="mt-1 space-y-1">
        {values.map((value) => (
          <p key={value} className="text-xs text-titanium">{value}</p>
        ))}
      </div>
    </div>
  );
}
