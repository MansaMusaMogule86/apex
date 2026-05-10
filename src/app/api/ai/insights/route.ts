import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { completeJSON } from "@/lib/openrouter";

export const runtime = "nodejs";

const MetricSchema = z.object({
  label: z.string(),
  value: z.number(),
  delta: z.number().optional(),
});

const Schema = z.object({
  window: z.enum(["7d", "30d", "90d"]).default("30d"),
  metrics: z.array(MetricSchema).min(1).max(24),
  context: z.string().max(560).optional(),
});

interface Insight {
  headline: string;
  body: string;
  severity: "calm" | "watch" | "act";
  metric?: string;
}

interface InsightsResult {
  summary: string;
  insights: Insight[];
}

const SYSTEM = `You are APEX — a senior growth analyst writing for a luxury house's principal.
Tone: quiet, precise, never breathless. No emoji, no exclamation marks.
Return strict JSON in this exact shape:
{
  "summary": "<one paragraph, ~50 words, plain prose>",
  "insights": [
    { "headline": "<short title>", "body": "<2-3 sentences>", "severity": "calm" | "watch" | "act", "metric": "<optional metric label>" }
  ]
}
Provide between 3 and 5 insights, ordered by importance.`;

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

  const { window, metrics, context } = parsed.data;

  const prompt = [
    `Window: ${window}`,
    context && `Context: ${context}`,
    "Metrics:",
    ...metrics.map(
      (m) =>
        `- ${m.label}: ${m.value}${m.delta !== undefined ? ` (Δ ${m.delta > 0 ? "+" : ""}${m.delta}%)` : ""}`,
    ),
    "",
    "Compose the briefing.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await completeJSON<InsightsResult>({
      prompt,
      system: SYSTEM,
      model: "smart",
      maxTokens: 1200,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
