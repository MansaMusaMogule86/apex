import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { streamCompletion, type ModelKey } from "@/lib/openrouter";

export const runtime = "nodejs";

const Schema = z.object({
  brand: z.string().min(1).max(120),
  industry: z.string().max(120).optional(),
  audience: z.string().max(280).optional(),
  goals: z.string().max(560).optional(),
  model: z.enum(["fast", "balanced", "smart", "best"]).optional(),
});

const SYSTEM = `You are APEX — a discreet luxury growth atelier.
Write in the voice of a quiet, world-class brand strategist:
restrained, considered, never breathless. No bullet bloat, no emoji.
Compose a brand intelligence brief in plain markdown with these sections:
1. Positioning
2. Audience signal
3. Channel posture
4. Three quiet opportunities
5. One sharper warning
Keep total length under ~500 words.`;

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

  const { brand, industry, audience, goals, model } = parsed.data;

  const prompt = [
    `Brand: ${brand}`,
    industry && `Industry: ${industry}`,
    audience && `Audience: ${audience}`,
    goals && `Goals: ${goals}`,
    "",
    "Compose the brief.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const stream = await streamCompletion({
      prompt,
      system: SYSTEM,
      model: (model ?? "smart") as ModelKey,
    });

    const encoder = new TextEncoder();
    const encoded = stream.pipeThrough(
      new TransformStream<string, Uint8Array>({
        transform(chunk, controller) {
          controller.enqueue(encoder.encode(chunk));
        },
      }),
    );

    return new Response(encoded, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
