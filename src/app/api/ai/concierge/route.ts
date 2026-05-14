import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { complete, streamCompletion } from "@/lib/openrouter";

export const runtime = "nodejs";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const Schema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  stream: z.boolean().default(false),
  client: z
    .object({
      org_name: z.string().max(120).optional(),
      tier: z.enum(["prestige", "elite", "bespoke"]).optional(),
      apex_score: z.number().int().min(0).max(1000).optional(),
    })
    .optional(),
});

const SYSTEM = `You are the APEX Concierge — the embedded strategic advisor for luxury real estate and brand operators.
You have deep expertise in luxury market dynamics, founder authority positioning, influencer strategy, HNWI lead intelligence, and prestige brand management.
Tone: quiet authority. Precise, never breathless. Speak like a senior strategic advisor, not a chatbot.
No emoji. No exclamation marks. No markdown headers. No bullet-point floods. Prefer concise, high-signal prose.
You help with: campaign strategy, audience segmentation, market signals, competitor intelligence, brand safety, growth forecasting, and platform navigation.
If asked to take destructive actions (delete data, send external messages), decline gracefully and redirect to the appropriate screen.
Keep responses concise — under 200 words unless the question demands depth. Lead with the insight, not the preamble.`;

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

  const { messages, client, stream: wantStream } = parsed.data;

  const context = client
    ? `Client context: ${client.org_name ?? "—"}${client.tier ? ` · tier ${client.tier}` : ""}${
        client.apex_score !== undefined ? ` · APEX score ${client.apex_score}` : ""
      }`
    : null;

  const transcript = messages
    .map((m) => `${m.role === "user" ? "Principal" : "Concierge"}: ${m.content}`)
    .join("\n\n");

  const prompt = [context, "Conversation so far:", transcript, "", "Concierge:"]
    .filter(Boolean)
    .join("\n");

  // ─── Streaming response ───────────────────────────────────────────
  if (wantStream) {
    try {
      const readable = await streamCompletion({ prompt, system: SYSTEM, model: "smart" });
      const encoder = new TextEncoder();

      const transformed = new TransformStream<string, Uint8Array>({
        transform(chunk, controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`));
        },
        flush(controller) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        },
      });

      return new Response(readable.pipeThrough(transformed), {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Streaming failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // ─── Standard response ────────────────────────────────────────────
  try {
    const reply = await complete({ prompt, system: SYSTEM, model: "smart", maxTokens: 800 });
    return NextResponse.json({ reply: reply.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
