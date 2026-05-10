import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import RecommendationPanel from "@/components/command-center/recommendation/RecommendationPanel";

type RealtimePoint = {
  tick: string;
  queueDepth: number;
  confidence: number;
  anomalies: number;
  recommendations: number;
};

type RealtimeEnginePanelProps = {
  points: RealtimePoint[];
};

export default function RealtimeEnginePanel({ points }: RealtimeEnginePanelProps) {
  return (
    <RecommendationPanel title="Realtime engine" eyebrow="Streaming updates and recalculation pipeline">
      <div className="h-64 w-full rounded-xs border border-white/10 bg-white/2 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis dataKey="tick" stroke="#5a5a6a" tick={{ fontSize: 10 }} />
            <YAxis stroke="#5a5a6a" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "#111217",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f5f0e8",
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="queueDepth" stroke="#e2c99a" strokeWidth={1.8} dot={false} />
            <Line type="monotone" dataKey="confidence" stroke="#9a9a9a" strokeWidth={1.4} dot={false} />
            <Line type="monotone" dataKey="anomalies" stroke="#fca5a5" strokeWidth={1.2} dot={false} />
            <Line type="monotone" dataKey="recommendations" stroke="#86efac" strokeWidth={1.2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid gap-1 text-xs text-titanium md:grid-cols-2">
        <p>Streaming update cadence: 4.5s event ingestion and recommendation recalculation in live mode.</p>
        <p>Invalidation logic: recommendations are marked stale when confidence falls below policy threshold.</p>
      </div>
    </RecommendationPanel>
  );
}
