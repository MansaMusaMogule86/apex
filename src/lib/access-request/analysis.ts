import { completeJSON } from "@/lib/openrouter";
import {
  AccessRequestAnalysisSchema,
  type AccessRequestAnalysis,
  type RequestAccessInput,
} from "@/lib/access-request/schema";

const SYSTEM_PROMPT = [
  "You are the APEX Request Access Intelligence System.",
  "You evaluate elite operators, founders, developers, investors, and luxury ecosystem principals for a private AI intelligence platform.",
  "Your tone is institutional, selective, strategic, and concise.",
  "Score skeptically. Reward proven authority, strong market position, high-value sectors, and clear strategic intent.",
  "Penalize vague positioning, unclear value capture, and weak luxury adjacency.",
  "Return only valid JSON matching the requested schema.",
].join(" ");

export async function analyzeAccessRequest(input: RequestAccessInput): Promise<AccessRequestAnalysis> {
  const prompt = [
    "Evaluate this operator for APEX private intelligence onboarding.",
    "",
    `Full name: ${input.fullName}`,
    `Email: ${input.email}`,
    `Company / Portfolio: ${input.company}`,
    `Industry: ${input.industry}`,
    `Website: ${input.website ?? "Not provided"}`,
    `LinkedIn: ${input.linkedin ?? "Not provided"}`,
    `Revenue range: ${input.revenueRange}`,
    `Market focus: ${input.marketFocus}`,
    `Strategic objective: ${input.strategicObjective}`,
    `Why APEX: ${input.whyApex}`,
    "",
    "Return JSON with these keys exactly:",
    "prestigeScore: integer 0-100",
    "authorityScore: integer 0-100",
    "marketPotentialScore: integer 0-100",
    "luxuryFitScore: integer 0-100",
    'priorityLevel: one of "critical", "high", "medium", "watch"',
    "executiveSummary: 1-2 sentence institutional summary",
    "strategicRecommendation: concise recommendation for executive handling",
  ].join("\n");

  const response = await completeJSON<AccessRequestAnalysis>({
    system: SYSTEM_PROMPT,
    prompt,
    model: "best",
    maxTokens: 900,
  });

  return AccessRequestAnalysisSchema.parse(response);
}