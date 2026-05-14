import { type NextRequest } from "next/server";
import { openrouter, MODELS, type ModelKey } from "@/lib/openrouter";
import { RequestAccessInputSchema } from "@/lib/access-request/schema";

export const runtime = "nodejs";

const SYSTEM = `You are the APEX Intelligence System — a classified AI evaluation layer for an invitation-only private intelligence platform. You evaluate elite operators with precise, institutional, terminal-style analysis. Your voice is cold, analytical, and authoritative — not promotional. Write for the operator to read in real-time as their profile is being scored. Be rigorously honest: reward proven authority and specific market position; penalize vague claims and weak luxury adjacency.`;

function buildPrompt(d: ReturnType<typeof RequestAccessInputSchema.parse>): string {
  return `Run a live intelligence qualification scan on this operator. Stream the output directly to them.

OPERATOR DOSSIER INTAKE:
Name: ${d.fullName}
Company / Portfolio: ${d.company}
Industry: ${d.industry}
Website: ${d.website ?? "Not submitted"}
LinkedIn: ${d.linkedin ?? "Not submitted"}
Revenue Range: ${d.revenueRange}
Market Focus: ${d.marketFocus}
Strategic Objective: ${d.strategicObjective}
Why APEX: ${d.whyApex}

Output the intelligence scan in the exact format below. Start immediately — no preamble.
Replace every <placeholder> with the actual evaluated content.
Scores must be integers 0–100. Be analytically rigorous.

APEX INTELLIGENCE SYSTEM — INITIALIZING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPERATOR: ${d.fullName.toUpperCase()} · ${d.company.toUpperCase()}
SECTOR: ${d.industry.toUpperCase()}
REVENUE BAND: ${d.revenueRange}
QUALIFICATION RUN: ACTIVE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ PHASE 01 · AUTHORITY MAPPING ]

<2–3 sentences evaluating their authority signals: company standing, industry position, professional footprint, claimed expertise. Reward specific and verifiable. Penalize vague.>

AUTHORITY SCORE: <integer>/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ PHASE 02 · PRESTIGE SIGNAL ANALYSIS ]

<2–3 sentences on prestige alignment: brand quality indicators, sector status, positioning relative to ultra-high-net-worth market standards, luxury ecosystem fit.>

PRESTIGE SCORE: <integer>/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ PHASE 03 · MARKET POTENTIAL ASSESSMENT ]

<2–3 sentences on market scale, growth vectors, strategic leverage. Evaluate whether their revenue band and market focus represent meaningful opportunity.>

MARKET POTENTIAL SCORE: <integer>/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ PHASE 04 · LUXURY FIT CALIBRATION ]

<2–3 sentences on alignment with luxury intelligence deployment standards: does this operator serve, influence, or operate within UHNW/ultra-luxury contexts?

LUXURY FIT SCORE: <integer>/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ PHASE 05 · EXECUTIVE VERDICT ]

<3–4 sentences as the final institutional assessment. Synthesize all four dimensions into a cohesive evaluation of this operator's strategic fit and value potential for the APEX platform.>

STRATEGIC RECOMMENDATION: <One sharp sentence directive for executive handling.>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIORITY CLASSIFICATION: <CRITICAL | HIGH | MEDIUM | WATCH>
ROUTING: EXECUTIVE REVIEW QUEUE — ACTIVE
SCAN STATUS: COMPLETE`;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const parsed = RequestAccessInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response("Invalid payload", { status: 422 });
  }

  if (!openrouter) {
    return new Response(
      "AI streaming is not configured — add OPENROUTER_API_KEY to your environment",
      { status: 503 }
    );
  }

  const requestedModel =
    typeof body === "object" && body !== null && "modelKey" in body
      ? (body as Record<string, unknown>).modelKey
      : undefined;
  const modelKey: ModelKey =
    typeof requestedModel === "string" && requestedModel in MODELS
      ? (requestedModel as ModelKey)
      : "best";

  const stream = await openrouter.chat.completions.create({
    model: MODELS[modelKey],
    max_tokens: 1600,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: buildPrompt(parsed.data) },
    ],
    stream: true,
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache, no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
