import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";
import RecommendationPanel from "@/components/command-center/recommendation/RecommendationPanel";
import type { AggregatedSignal, SignalEvent } from "@/components/command-center/recommendation/types";

type SignalStreamMatrixProps = {
  events: SignalEvent[];
  signals: AggregatedSignal[];
};

export default function SignalStreamMatrix({ events, signals }: SignalStreamMatrixProps) {
  const radarData = signals.map((item) => ({
    source: item.source.replaceAll("-", " "),
    strength: item.weightedStrength,
  }));

  return (
    <RecommendationPanel title="Signal aggregation matrix" eyebrow="Event ingestion and aggregation pipeline">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold/70">Recent events</p>
          <div className="space-y-2">
            {events.slice(0, 6).map((event) => (
              <article key={event.id} className="rounded-xs border border-white/10 bg-white/3 p-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <p className="text-warm-white">{event.note}</p>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-light">{event.createdAt}</span>
                </div>
                <p className="mt-1 text-[11px] text-titanium">
                  Source: {event.source} | Magnitude {event.magnitude} | Velocity {event.velocity} | Trust {event.trust}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-xs border border-white/10 bg-white/2 p-2">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-gold/70">Signal weighting logic</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="78%">
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="source" stroke="#9a9a9a" tick={{ fontSize: 10 }} />
                <Radar dataKey="strength" stroke="#e2c99a" fill="#c8a96e" fillOpacity={0.2} strokeWidth={1.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid gap-1 text-xs text-titanium">
            {signals.slice(0, 4).map((signal) => (
              <p key={signal.source}>
                {signal.source}: weighted {signal.weightedStrength}, anomaly {signal.anomalyProbability}%, trend {signal.trend}
              </p>
            ))}
          </div>
        </div>
      </div>
    </RecommendationPanel>
  );
}
