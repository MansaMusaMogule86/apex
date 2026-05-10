import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { complete } from "@/lib/openrouter";

export const runtime = "nodejs";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const Schema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  client: z
    .object({
      org_name: z.string().max(120).optional(),
      tier: z.enum(["prestige", "elite", "bespoke"]).optional(),
      apex_score: z.number().int().min(0).max(1000).optional(),
    })
    .optional(),
});

const SYSTEM = `You are the APEX Concierge — the in-platform advisor for luxury houses.
Tone: quiet, precise, never breathless. No emoji, no exclamation marks. No markdown headers, no bullet floods. Prefer prose over lists.
You can answer questions about campaigns, audiences, creators, brand safety, growth, and the platform itself.
If asked to do something destructive (delete data, send messages externally), politely decline and recommend the proper screen.`;

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
  const { messages, client } = parsed.data;

  const context = client
    ? `Client: ${client.org_name ?? "—"}${client.tier ? ` · tier ${client.tier}` : ""}${
        client.apex_score !== undefined ? ` · APEX ${client.apex_score}` : ""
      }`
    : null;

  const transcript = messages
    .map((m) => `${m.role === "user" ? "Principal" : "Concierge"}: ${m.content}`)
    .join("\n\n");

  const prompt = [context, "Conversation so far:", transcript, "", "Concierge:"]
    .filter(Boolean)
    .join("\n");

  try {
    const reply = await complete({
      prompt,
      system: SYSTEM,
      model: "best",
      maxTokens: 800,
    });
    return NextResponse.json({ reply: reply.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
