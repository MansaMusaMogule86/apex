import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { completeJSON } from "@/lib/openrouter";

export const runtime = "nodejs";

const Schema = z.object({
  handle: z.string().min(1).max(60),
  platform: z.enum(["instagram", "tiktok", "youtube", "substack"]).default("instagram"),
  followers: z.number().int().min(0),
  engagementRate: z.number().min(0).max(1).optional(),
  niche: z.string().max(120).optional(),
  recentCaptions: z.array(z.string().max(560)).max(8).optional(),
  brand: z.object({
    name: z.string(),
    voice: z.string().max(280).optional(),
    audience: z.string().max(280).optional(),
  }),
});

interface ScoreResult {
  score: number;
  alignment: "low" | "fair" | "strong" | "exceptional";
  rationale: string;
  signals: { label: string; weight: "low" | "medium" | "high" }[];
  risks: string[];
}

const SYSTEM = `You are APEX — a discreet talent partner for luxury brands.
Score how well a creator fits a house. Be honest, restrained, never effusive.
Return strict JSON only:
{
  "score": <integer 0-100>,
  "alignment": "low" | "fair" | "strong" | "exceptional",
  "rationale": "<2 sentences, plain prose>",
  "signals": [{ "label": "<short>", "weight": "low" | "medium" | "high" }],
  "risks": ["<short>", ...]
}
Provide 2-4 signals and 1-3 risks.`;

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

  const { handle, platform, followers, engagementRate, niche, recentCaptions, brand } = parsed.data;

  const prompt = [
    `Creator: @${handle} on ${platform}`,
    `Followers: ${followers.toLocaleString("en-US")}`,
    engagementRate !== undefined && `Engagement: ${(engagementRate * 100).toFixed(2)}%`,
    niche && `Niche: ${niche}`,
    "",
    `Brand: ${brand.name}`,
    brand.voice && `Voice: ${brand.voice}`,
    brand.audience && `Audience: ${brand.audience}`,
    recentCaptions?.length && "",
    recentCaptions?.length && "Recent captions:",
    ...(recentCaptions ?? []).map((c, i) => `${i + 1}. ${c}`),
    "",
    "Score the fit.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const result = await completeJSON<ScoreResult>({
      prompt,
      system: SYSTEM,
      model: "smart",
      maxTokens: 800,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scoring failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
