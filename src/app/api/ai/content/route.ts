import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { streamCompletion, type ModelKey } from "@/lib/openrouter";

export const runtime = "nodejs";

const Schema = z.object({
  brief: z.string().min(4).max(2000),
  channel: z.enum(["email", "instagram", "linkedin", "press", "long-form"]).default("email"),
  tone: z.enum(["restrained", "warm", "incisive", "ceremonial"]).default("restrained"),
  model: z.enum(["fast", "balanced", "smart", "best"]).optional(),
});

const VOICE: Record<z.infer<typeof Schema>["channel"], string> = {
  email: "A discreet, hand-written email. No subject line. Two short paragraphs maximum.",
  instagram: "An Instagram caption. Three lines. No hashtags. One hairline em-dash.",
  linkedin: "A LinkedIn post for a founder. 90 words. Plain. No buzzwords.",
  press: "A press blurb. 70 words. Third person. Editorial tone.",
  "long-form": "An essay opener. ~180 words. Patient, considered, slightly literary.",
};

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

  const { brief, channel, tone, model } = parsed.data;

  const system = `You are APEX — a luxury copywriter.
Write in a ${tone} voice. ${VOICE[channel]}
Never use emoji, exclamation marks, or marketing clichés.
Return only the copy itself — no preface, no explanation.`;

  try {
    const stream = await streamCompletion({
      prompt: brief,
      system,
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
