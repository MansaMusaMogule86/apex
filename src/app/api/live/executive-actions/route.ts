import { NextResponse, type NextRequest } from "next/server";
import { ExecutiveActionSchema } from "@/lib/live/contracts";
import { requireOrgAccess } from "@/lib/live/authz";
import { createAdminClient } from "@/lib/supabase/admin";
import { publish } from "@/lib/live/upstash";
import { alertChannel } from "@/lib/live/realtime";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ExecutiveActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 422 });
  }

  try {
    const auth = await requireOrgAccess(parsed.data.organizationId);
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("executive_actions")
      .insert({
        organization_id: parsed.data.organizationId,
        workspace_id: parsed.data.workspaceId ?? null,
        actor_id: auth.userId,
        recommendation_id: parsed.data.recommendationId ?? null,
        action_type: parsed.data.actionType,
        action_payload: parsed.data.actionPayload,
      })
      .select("id,action_type,created_at")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Failed to create action" }, { status: 500 });
    }

    await admin.from("audit_log").insert({
      actor_id: auth.userId,
      action: `executive_action.${parsed.data.actionType}`,
      entity: "executive_actions",
      entity_id: data.id,
      metadata: {
        organization_id: parsed.data.organizationId,
        workspace_id: parsed.data.workspaceId ?? null,
        recommendation_id: parsed.data.recommendationId ?? null,
      },
    });

    await publish(alertChannel(parsed.data.organizationId), {
      type: "executive.action",
      actionId: data.id,
      actionType: parsed.data.actionType,
      ts: data.created_at,
    });

    return NextResponse.json({ action: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
