import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { completeJSON } from "@/lib/openrouter";

export const runtime = "nodejs";

const Schema = z.object({
  brand: z.string().min(2).max(120),
  asset: z.object({
    type: z.enum(["caption", "script", "post", "ad_copy"]),
    text: z.string().min(1).max(8000),
  }),
  audience: z.string().max(240).optional(),
  region: z.string().max(80).optional(),
});

type Severity = "calm" | "watch" | "act";

interface BrandSafetyFlag {
  category: string;
  severity: Severity;
  excerpt: string;
  reason: string;
  suggestion: string;
}

interface BrandSafetyResult {
  verdict: "approved" | "review" | "reject";
  risk_score: number;
  summary: string;
  flags: BrandSafetyFlag[];
  rewrite: string | null;
}

const SYSTEM = `You are APEX — a brand-safety reviewer for luxury houses.
Be measured. Flag genuine issues only (cultural insensitivity, ambiguity, regulatory, off-brand tone, IP risk, factual claims).
Return strict JSON:
{
  "verdict": "approved" | "review" | "reject",
  "risk_score": <0-100>,
  "summary": "<one paragraph>",
  "flags": [ { "category", "severity": "calm"|"watch"|"act", "excerpt", "reason", "suggestion" } ],
  "rewrite": "<full revised asset>" | null
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
  const { brand, asset, audience, region } = parsed.data;
  const prompt = [
    `Brand: ${brand}`,
    `Asset type: ${asset.type}`,
    audience && `Audience: ${audience}`,
    region && `Region: ${region}`,
    "Asset:",
    asset.text,
    "",
    "Review the asset.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await completeJSON<BrandSafetyResult>({
      prompt,
      system: SYSTEM,
      model: "smart",
      maxTokens: 1800,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
