import { NextResponse, type NextRequest } from "next/server";
import { RecommendationInsertSchema, RecommendationTriggerSchema } from "@/lib/live/contracts";
import { insertRecommendation, recalculateRecommendations } from "@/lib/live/recommendation-service";
import { requireOrgAccess } from "@/lib/live/authz";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const organizationId = req.nextUrl.searchParams.get("organization_id");
  const workspaceId = req.nextUrl.searchParams.get("workspace_id");
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");

  if (!organizationId) {
    return NextResponse.json({ error: "organization_id is required" }, { status: 400 });
  }

  try {
    await requireOrgAccess(organizationId);

    const admin = createAdminClient();
    let query = admin
      .from("recommendations_live")
      .select("id,title,executive_summary,escalation_state,priority_index,confidence_score,risk_level,created_at")
      .eq("organization_id", organizationId)
      .is("invalidated_at", null)
      .order("priority_index", { ascending: false })
      .limit(Math.min(100, Math.max(1, limit)));

    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recommendations: data ?? [] });
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

export async function POST(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode") ?? "trigger";

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (mode === "manual") {
      const parsed = RecommendationInsertSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 422 });
      }

      await requireOrgAccess(parsed.data.organizationId);
      const recommendation = await insertRecommendation(parsed.data);
      return NextResponse.json({ recommendation }, { status: 201 });
    }

    const parsed = RecommendationTriggerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 422 });
    }

    const auth = await requireOrgAccess(parsed.data.organizationId);
    const result = await recalculateRecommendations(parsed.data, auth.userId);
    return NextResponse.json(result, { status: 202 });
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
