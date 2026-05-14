import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { completeJSON } from "@/lib/openrouter";

export const runtime = "nodejs";

const HistorySchema = z.object({
  date: z.string().min(4).max(24),
  value: z.number(),
});

const Schema = z.object({
  metric: z.string().min(2).max(80),
  unit: z.string().max(24).optional(),
  history: z.array(HistorySchema).min(3).max(180),
  horizon: z.enum(["7d", "30d", "90d", "180d"]).default("30d"),
  drivers: z.array(z.string().max(120)).max(8).optional(),
});

interface ForecastPoint {
  date: string;
  value: number;
  lower: number;
  upper: number;
}

interface GrowthForecastResult {
  metric: string;
  unit: string | null;
  horizon: string;
  trajectory: "expanding" | "steady" | "softening";
  confidence: number;
  forecast: ForecastPoint[];
  narrative: string;
  levers: { name: string; expected_lift_pct: number; effort: "low" | "med" | "high" }[];
}

const SYSTEM = `You are APEX — a forecasting analyst for luxury growth.
Return strict JSON only. Be calibrated, never optimistic for its own sake.
Schema:
{
  "metric": "<echo>",
  "unit": "<unit or null>",
  "horizon": "<echo>",
  "trajectory": "expanding" | "steady" | "softening",
  "confidence": <0-100>,
  "forecast": [ { "date", "value", "lower", "upper" } ... 6-12 points ],
  "narrative": "<2-3 sentences, plain prose>",
  "levers": [ { "name", "expected_lift_pct", "effort": "low" | "med" | "high" } ... 3-5 entries ]
}`;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 422 },
    );
  }
  const { metric, unit, history, horizon, drivers } = parsed.data;
  const prompt = [
    `Metric: ${metric}${unit ? ` (${unit})` : ""}`,
    `Horizon: ${horizon}`,
    drivers?.length ? `Known drivers: ${drivers.join(", ")}` : null,
    "History:",
    ...history.map((h) => `- ${h.date}: ${h.value}`),
    "",
    "Compose the forecast.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await completeJSON<GrowthForecastResult>({
      prompt,
      system: SYSTEM,
      model: "balanced",
      maxTokens: 1600,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
