import { z } from "zod";

export const LiveEventPrioritySchema = z.enum(["low", "normal", "high", "critical"]);
export const LiveEventSourceSchema = z.enum([
  "founder-authority",
  "lead-intelligence",
  "influence-network",
  "market-intelligence",
  "competitor-intelligence",
  "sentiment-monitor",
  "conversion-monitor",
  "audience-migration",
  "prestige-volatility",
  "executive-engagement",
  "manual-executive",
]);

export const LiveEventSchema = z.object({
  organizationId: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  source: LiveEventSourceSchema,
  eventType: z.string().min(3).max(120),
  priority: LiveEventPrioritySchema.default("normal"),
  correlationId: z.string().max(120).optional(),
  payload: z.record(z.string(), z.unknown()),
  occurredAt: z.string().datetime().optional(),
});

export const RecommendationScoreSchema = z.object({
  confidence: z.number().min(0).max(100),
  strategicImpact: z.number().min(0).max(100),
  revenueImpact: z.number().min(0).max(100),
  prestigeImpact: z.number().min(0).max(100),
  riskLevel: z.enum(["low", "moderate", "high", "critical"]),
  timeSensitivity: z.number().min(0).max(100),
  executionComplexity: z.number().min(0).max(100),
  outcomeWindow: z.string().min(3).max(80),
  priorityIndex: z.number().min(0).max(100),
});

export const RecommendationInsertSchema = z.object({
  organizationId: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  recommendationType: z.string().min(3).max(80),
  title: z.string().min(8).max(180),
  executiveSummary: z.string().min(20).max(1000),
  aiReasoning: z.string().min(20).max(3000),
  suggestedActions: z.array(z.string().min(5).max(300)).min(1).max(8),
  forecastOutcome: z.string().min(10).max(700),
  supportingEvidence: z.array(z.record(z.string(), z.unknown())).min(1).max(10),
  urgencyLabel: z.string().min(3).max(80),
  escalationState: z.enum(["normal", "watch", "escalated", "urgent"]).default("normal"),
  score: RecommendationScoreSchema,
});

export const RecommendationTriggerSchema = z.object({
  organizationId: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  trigger: z.enum(["event-spike", "schedule", "manual", "confidence-drift", "risk-threshold"]),
  reason: z.string().min(5).max(300),
});

export const ExecutiveActionSchema = z.object({
  organizationId: z.string().uuid(),
  workspaceId: z.string().uuid().optional(),
  recommendationId: z.string().uuid().optional(),
  actionType: z.enum(["approve", "defer", "dismiss", "escalate", "override", "execute"]),
  actionPayload: z.record(z.string(), z.unknown()).default({}),
});

export type LiveEventInput = z.infer<typeof LiveEventSchema>;
export type RecommendationInsertInput = z.infer<typeof RecommendationInsertSchema>;
export type RecommendationTriggerInput = z.infer<typeof RecommendationTriggerSchema>;
export type ExecutiveActionInput = z.infer<typeof ExecutiveActionSchema>;
