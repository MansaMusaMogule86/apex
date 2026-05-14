import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { completeJSON } from "@/lib/openrouter";

export const runtime = "nodejs";

const Schema = z.object({
  domain: z.enum(["market", "lead", "founder", "influence", "home"]).default("home"),
  context: z.string().max(500).optional(),
});

const SYSTEM = `You are the APEX Intelligence Engine generating live strategic recommendations for luxury real estate operators.
Generate exactly 4 high-signal intelligence recommendations in valid JSON format.
Each recommendation must be specific, actionable, and luxury-market-aware.
Respond ONLY with valid JSON — an array of 4 objects matching this structure:
[
  {
    "id": "unique-id",
    "title": "Short action-oriented title (max 8 words)",
    "summary": "2-sentence strategic rationale. Be specific and data-driven.",
    "riskLevel": "low|medium|high",
    "expectedUplift": "+X% metric or specific outcome",
    "confidence": number 60-97,
    "timeline": "X days/weeks",
    "actionOwner": "Founder|Marketing|Sales|Strategy|PR Team",
    "suggestedAction": "Specific action to take immediately (1 sentence)"
  }
]
No markdown. No explanation. Just the JSON array.`;

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

  const { domain, context } = parsed.data;

  const domainContext = {
    market: "Dubai luxury real estate market intelligence, price movements, competitor activity",
    lead: "High-net-worth individual lead intelligence, buyer intent signals, conversion optimization",
    founder: "Founder authority positioning, thought leadership, narrative intelligence",
    influence: "Influencer network strategy, partnership opportunities, content amplification",
    home: "Executive command center — cross-domain strategic priorities for luxury brand operators",
  }[domain];

  const prompt = `Generate 4 strategic intelligence recommendations for: ${domainContext}.
${context ? `Additional context: ${context}` : ""}
Focus on high-impact, time-sensitive actions with measurable outcomes.
Reference real luxury market dynamics: Palm Jumeirah, DIFC, Jumeirah Bay, HNWI audience, prestige positioning.`;

  try {
    const recommendations = await completeJSON<
      Array<{
        id: string;
        title: string;
        summary: string;
        riskLevel: "low" | "medium" | "high";
        expectedUplift: string;
        confidence: number;
        timeline: string;
        actionOwner: string;
        suggestedAction: string;
      }>
    >({ prompt, system: SYSTEM, model: "balanced", maxTokens: 1200 });

    // Ensure IDs are unique
    const withIds = recommendations.map((rec, i) => ({
      ...rec,
      id: rec.id ?? `ai-rec-${Date.now()}-${i}`,
    }));

    return NextResponse.json({ recommendations: withIds });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
