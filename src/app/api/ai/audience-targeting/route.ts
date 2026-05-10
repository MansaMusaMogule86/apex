import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { completeJSON } from "@/lib/openrouter";

export const runtime = "nodejs";

const Schema = z.object({
  brand: z.string().min(2).max(120),
  category: z.string().min(2).max(80),
  positioning: z.string().max(600).optional(),
  region: z.string().max(80).optional(),
  budget_usd: z.number().int().positive().max(50_000_000).optional(),
});

interface AudienceSegment {
  name: string;
  description: string;
  size_estimate: string;
  affinity_score: number;
  channels: string[];
  ideal_creators: string[];
  rationale: string;
}

interface AudienceResult {
  primary: AudienceSegment;
  secondary: AudienceSegment[];
  excluded: { name: string; reason: string }[];
}

const SYSTEM = `You are APEX — a senior audience strategist for luxury houses.
Compose a quiet, precise targeting brief. No emoji, no exclamation marks.
Return strict JSON:
{
  "primary": { "name", "description", "size_estimate", "affinity_score" (0-100), "channels": [], "ideal_creators": [], "rationale" },
  "secondary": [ ... 2-3 segments ... ],
  "excluded": [ { "name", "reason" } ... 2-4 entries ]
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
  const { brand, category, positioning, region, budget_usd } = parsed.data;
  const prompt = [
    `Brand: ${brand}`,
    `Category: ${category}`,
    region && `Region: ${region}`,
    positioning && `Positioning: ${positioning}`,
    budget_usd && `Budget: $${budget_usd.toLocaleString("en-US")}`,
    "",
    "Compose the targeting brief.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await completeJSON<AudienceResult>({
      prompt,
      system: SYSTEM,
      model: "smart",
      maxTokens: 1400,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
