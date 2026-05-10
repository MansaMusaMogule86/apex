import { createAdminClient } from "@/lib/supabase/admin";
import type { LiveEventInput } from "@/lib/live/contracts";
import { addRetry, enqueue, publish } from "@/lib/live/upstash";
import { alertChannel, recommendationChannel } from "@/lib/live/realtime";

const PRIORITY_WEIGHT: Record<LiveEventInput["priority"], number> = {
  low: 10,
  normal: 30,
  high: 70,
  critical: 95,
};

function queueNameForPriority(priority: LiveEventInput["priority"]) {
  if (priority === "critical") return "apex:events:critical";
  if (priority === "high") return "apex:events:high";
  if (priority === "normal") return "apex:events:normal";
  return "apex:events:low";
}

function retryDelaySeconds(retryCount: number) {
  return Math.min(300, 2 ** retryCount);
}

export async function ingestLiveEvent(input: LiveEventInput, actorId: string) {
  const admin = createAdminClient();

  const insertPayload = {
    organization_id: input.organizationId,
    workspace_id: input.workspaceId ?? null,
    source: input.source,
    event_type: input.eventType,
    event_priority: input.priority,
    correlation_id: input.correlationId ?? null,
    payload: input.payload,
    occurred_at: input.occurredAt ?? new Date().toISOString(),
    received_at: new Date().toISOString(),
    actor_id: actorId,
    processing_status: "queued",
  };

  const { data, error } = await admin
    .from("event_bus_events")
    .insert(insertPayload)
    .select("id, organization_id, workspace_id, event_type, event_priority")
    .single();

  if (error || !data) {
    throw new Error(`Failed to persist event: ${error?.message ?? "unknown"}`);
  }

  const queue = queueNameForPriority(input.priority);
  const envelope = {
    eventId: data.id,
    organizationId: input.organizationId,
    workspaceId: input.workspaceId ?? null,
    priorityWeight: PRIORITY_WEIGHT[input.priority],
    eventType: input.eventType,
  };

  try {
    await enqueue(queue, envelope);
    await publish(recommendationChannel(input.organizationId, input.workspaceId), {
      type: "event.received",
      eventId: data.id,
      queue,
    });

    if (input.priority === "critical") {
      await publish(alertChannel(input.organizationId), {
        type: "event.critical",
        eventId: data.id,
        source: input.source,
        eventType: input.eventType,
      });
    }
  } catch (queueError) {
    await addRetry("apex:events", envelope, retryDelaySeconds(1));

    const err = queueError instanceof Error ? queueError.message : "unknown queue error";
    await admin.from("event_bus_failures").insert({
      organization_id: input.organizationId,
      workspace_id: input.workspaceId ?? null,
      event_id: data.id,
      failure_stage: "queue_push",
      error_message: err,
      retry_count: 1,
      next_retry_at: new Date(Date.now() + retryDelaySeconds(1) * 1000).toISOString(),
      payload: envelope,
    });
  }

  return {
    eventId: data.id,
    queue,
    status: "accepted" as const,
  };
}
