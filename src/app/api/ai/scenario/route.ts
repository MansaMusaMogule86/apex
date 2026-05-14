import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { completeJSON } from "@/lib/openrouter";

export const runtime = "nodejs";

const Schema = z.object({
  controls: z.object({
    founderContent: z.number(),
    luxuryPositioning: z.number(),
    influencerDeployment: z.number(),
    prActivation: z.number(),
    investorMessaging: z.number(),
    geographicExpansion: z.number(),
    pricingChange: z.number(),
    narrativeFraming: z.number(),
    aggression: z.number(),
    riskTolerance: z.number(),
    capitalAllocation: z.number(),
    influenceBudget: z.number(),
    timeline: z.string(),
  }),
  outcomes: z.object({
    revenueProjection: z.number(),
    prestigeVolatility: z.number(),
    hnwiConversion: z.number(),
    investorSentiment: z.number(),
    authorityEvolution: z.number(),
  }),
});

const SYSTEM = `You are the APEX Strategic Intelligence Engine analyzing luxury real estate scenario simulations.
Given slider values (0-100 scale) and projected outcomes, provide concise executive-grade analysis.
Respond ONLY with valid JSON matching this exact structure:
{
  "headline": "One-sentence strategic summary",
  "verdict": "bullish|cautious|bearish",
  "confidence": number 0-100,
  "topRisk": "Single most critical risk",
  "topOpportunity": "Single best opportunity",
  "recommendations": ["action 1", "action 2", "action 3"],
  "executiveSummary": "2-3 sentence executive brief"
}
No markdown. No explanation outside the JSON. Be specific, institutional-grade, luxury-market-aware.`;

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

  const { controls, outcomes } = parsed.data;

  const prompt = `Scenario simulation parameters:
- Founder Content: ${controls.founderContent}/100
- Luxury Positioning: ${controls.luxuryPositioning}/100
- Influencer Deployment: ${controls.influencerDeployment}/100
- PR Activation: ${controls.prActivation}/100
- Investor Messaging: ${controls.investorMessaging}/100
- Geographic Expansion: ${controls.geographicExpansion}/100
- Pricing Change Aggression: ${controls.pricingChange}/100
- Narrative Framing: ${controls.narrativeFraming}/100
- Competitive Aggression: ${controls.aggression}/100
- Risk Tolerance: ${controls.riskTolerance}/100
- Capital Allocation: ${controls.capitalAllocation}/100
- Influence Budget: ${controls.influenceBudget}/100
- Timeline: ${controls.timeline}

Projected outcomes from model:
- Revenue Projection: $${outcomes.revenueProjection.toFixed(1)}M
- Prestige Volatility: ${outcomes.prestigeVolatility.toFixed(1)}
- HNWI Conversion: ${outcomes.hnwiConversion.toFixed(1)}%
- Investor Sentiment: ${outcomes.investorSentiment.toFixed(1)}/100
- Authority Evolution: ${outcomes.authorityEvolution.toFixed(1)}/100

Analyze this scenario and provide your strategic assessment.`;

  try {
    const analysis = await completeJSON<{
      headline: string;
      verdict: "bullish" | "cautious" | "bearish";
      confidence: number;
      topRisk: string;
      topOpportunity: string;
      recommendations: string[];
      executiveSummary: string;
    }>({ prompt, system: SYSTEM, model: "balanced", maxTokens: 600 });

    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
