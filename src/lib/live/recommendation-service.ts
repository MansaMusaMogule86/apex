import { createAdminClient } from "@/lib/supabase/admin";
import type { RecommendationInsertInput, RecommendationTriggerInput } from "@/lib/live/contracts";
import { publish } from "@/lib/live/upstash";
import { recommendationChannel } from "@/lib/live/realtime";

function riskFromScore(score: number) {
  if (score >= 90) return "critical";
  if (score >= 80) return "high";
  if (score >= 60) return "moderate";
  return "low";
}

export async function recalculateRecommendations(trigger: RecommendationTriggerInput, actorId: string) {
  const admin = createAdminClient();

  const { data: signals, error: signalError } = await admin
    .from("signal_snapshots")
    .select("signal_key, signal_value, confidence, anomaly_score")
    .eq("organization_id", trigger.organizationId)
    .order("captured_at", { ascending: false })
    .limit(12);

  if (signalError) {
    throw new Error(`Failed to load signals: ${signalError.message}`);
  }

  const confidence = signals && signals.length > 0
    ? signals.reduce((sum, row) => sum + Number(row.confidence ?? 0), 0) / signals.length
    : 62;

  const impact = signals && signals.length > 0
    ? signals.reduce((sum, row) => sum + Number(row.signal_value ?? 0), 0) / signals.length
    : 58;

  const anomaly = signals && signals.length > 0
    ? signals.reduce((sum, row) => sum + Number(row.anomaly_score ?? 0), 0) / signals.length
    : 35;

  const priorityIndex = Math.max(1, Math.min(99, confidence * 0.35 + impact * 0.35 + anomaly * 0.3));

  const { data: run, error: runError } = await admin
    .from("recommendation_runs")
    .insert({
      organization_id: trigger.organizationId,
      workspace_id: trigger.workspaceId ?? null,
      triggered_by: trigger.trigger,
      trigger_reason: trigger.reason,
      actor_id: actorId,
      model_route: "adaptive-core-router",
      confidence_model_version: "v1",
      priority_index: Number(priorityIndex.toFixed(1)),
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(`Failed to create recommendation run: ${runError?.message ?? "unknown"}`);
  }

  const recommendation = {
    run_id: run.id,
    organization_id: trigger.organizationId,
    workspace_id: trigger.workspaceId ?? null,
    recommendation_type: "strategic-timing",
    title: "Reinforce prestige narrative before competitor resonance peak",
    executive_summary:
      "Signal convergence indicates a narrow confidence window to reinforce founder-led positioning and neutralize competitor scarcity narratives.",
    ai_reasoning:
      "Anomaly and confidence models suggest elevated downside if timing is missed. Controlled proactive messaging is expected to lower prestige volatility while preserving conversion momentum.",
    suggested_actions: [
      "Release founder strategic brief in next 6 hours",
      "Synchronize influence partners in two high-trust clusters",
      "Apply prestige protection language in all outbound channels",
    ],
    forecast_outcome: "Projected +8.4 confidence stability and -11.2 volatility in 72h",
    supporting_evidence: signals ?? [],
    urgency_label: "6h action window",
    escalation_state: priorityIndex > 85 ? "urgent" : "watch",
    confidence_score: Number(confidence.toFixed(1)),
    strategic_impact_score: Number(impact.toFixed(1)),
    revenue_impact_estimate: Number((impact * 0.92).toFixed(1)),
    prestige_impact_estimate: Number((Math.max(30, 100 - anomaly) * 0.95).toFixed(1)),
    risk_level: riskFromScore(priorityIndex),
    time_sensitivity_score: Number((70 + anomaly * 0.25).toFixed(1)),
    execution_complexity_score: Number((45 + (100 - confidence) * 0.2).toFixed(1)),
    expected_outcome_window: "24-72 hours",
    priority_index: Number(priorityIndex.toFixed(1)),
    contradiction_state: "resolved",
    invalidated_at: null,
  };

  const { data: created, error: recError } = await admin
    .from("recommendations_live")
    .insert(recommendation)
    .select("id, title, priority_index, confidence_score, escalation_state")
    .single();

  if (recError || !created) {
    throw new Error(`Failed to persist recommendation: ${recError?.message ?? "unknown"}`);
  }

  await publish(recommendationChannel(trigger.organizationId, trigger.workspaceId), {
    type: "recommendation.created",
    recommendation: created,
    runId: run.id,
  });

  return { runId: run.id, recommendation: created };
}

export async function insertRecommendation(input: RecommendationInsertInput) {
  const admin = createAdminClient();

  const { data: run, error: runError } = await admin
    .from("recommendation_runs")
    .insert({
      organization_id: input.organizationId,
      workspace_id: input.workspaceId ?? null,
      triggered_by: "manual",
      trigger_reason: "manual recommendation insert",
      model_route: "manual",
      confidence_model_version: "v1",
      priority_index: input.score.priorityIndex,
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(`Failed to create recommendation run: ${runError?.message ?? "unknown"}`);
  }

  const payload = {
    run_id: run.id,
    organization_id: input.organizationId,
    workspace_id: input.workspaceId ?? null,
    recommendation_type: input.recommendationType,
    title: input.title,
    executive_summary: input.executiveSummary,
    ai_reasoning: input.aiReasoning,
    suggested_actions: input.suggestedActions,
    forecast_outcome: input.forecastOutcome,
    supporting_evidence: input.supportingEvidence,
    urgency_label: input.urgencyLabel,
    escalation_state: input.escalationState,
    confidence_score: input.score.confidence,
    strategic_impact_score: input.score.strategicImpact,
    revenue_impact_estimate: input.score.revenueImpact,
    prestige_impact_estimate: input.score.prestigeImpact,
    risk_level: input.score.riskLevel,
    time_sensitivity_score: input.score.timeSensitivity,
    execution_complexity_score: input.score.executionComplexity,
    expected_outcome_window: input.score.outcomeWindow,
    priority_index: input.score.priorityIndex,
    contradiction_state: "resolved",
    invalidated_at: null,
  };

  const { data, error } = await admin
    .from("recommendations_live")
    .insert(payload)
    .select("id, title, priority_index, confidence_score, escalation_state")
    .single();

  if (error || !data) {
    throw new Error(`Failed to insert recommendation: ${error?.message ?? "unknown"}`);
  }

  await publish(recommendationChannel(input.organizationId, input.workspaceId), {
    type: "recommendation.created",
    recommendation: data,
    runId: run.id,
  });

  return data;
}
