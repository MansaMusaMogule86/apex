import { NextResponse, type NextRequest } from "next/server";
import { analyzeAccessRequest } from "@/lib/access-request/analysis";
import {
  AccessRequestUpdateSchema,
  RequestAccessInputSchema,
} from "@/lib/access-request/schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export const runtime = "nodejs";

type AccessRequestRow = Database["public"]["Tables"]["access_requests"]["Row"];

const REQUEST_SELECT = "*";

function jsonError(message: string, status: number, issues?: unknown) {
  return NextResponse.json({ error: message, issues }, { status });
}

async function readJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    throw new Error("Invalid JSON");
  }
}

async function requireStaffUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: isStaff, error } = await supabase.rpc("fn_is_staff");

  if (error) {
    throw new Error(error.message);
  }

  if (!isStaff) {
    throw new Error("Forbidden");
  }

  return user.id;
}

function toSubmissionInsert(payload: ReturnType<typeof RequestAccessInputSchema.parse>) {
  return {
    full_name: payload.fullName,
    email: payload.email,
    company: payload.company,
    industry: payload.industry,
    website: payload.website ?? null,
    linkedin: payload.linkedin ?? null,
    revenue_range: payload.revenueRange,
    market_focus: payload.marketFocus,
    strategic_objective: payload.strategicObjective,
    why_apex: payload.whyApex,
    status: "processing" as const,
  };
}

async function notifyStaff(admin: ReturnType<typeof createAdminClient>, request: AccessRequestRow) {
  const { data: staff, error } = await admin
    .from("profiles")
    .select("id")
    .in("role", ["super_admin", "admin", "account_manager"]);

  if (error) {
    console.error("Failed to load staff recipients", error);
    return;
  }

  if (!staff?.length) {
    return;
  }

  const { error: notificationError } = await admin.from("notifications").insert(
    staff.map((profile) => ({
      user_id: profile.id,
      type: "ai_insight" as const,
      title: `New access intelligence dossier · ${request.company}`,
      body: `${request.full_name} entered the APEX qualification queue with ${request.priority_level} priority.`,
      href: "/dashboard/leads",
    })),
  );

  if (notificationError) {
    console.error("Failed to create staff notifications", notificationError);
  }
}

async function writeAuditLog(
  admin: ReturnType<typeof createAdminClient>,
  entry: Database["public"]["Tables"]["audit_log"]["Insert"],
) {
  const { error } = await admin.from("audit_log").insert(entry);

  if (error) {
    console.error("Failed to write audit log", error);
  }
}

function statusCodeForMessage(message: string) {
  if (message === "Unauthorized") return 401;
  if (message === "Forbidden") return 403;
  if (message === "Invalid JSON") return 400;
  return 500;
}

export async function GET() {
  try {
    await requireStaffUser();
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("access_requests")
      .select(REQUEST_SELECT)
      .order("created_at", { ascending: false });

    if (error) {
      return jsonError(error.message, 500);
    }

    const requests = data ?? [];

    return NextResponse.json({ requests });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, statusCodeForMessage(message));
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await readJson(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    return jsonError(message, statusCodeForMessage(message));
  }

  const parsed = RequestAccessInputSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request payload", 422, parsed.error.issues);
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin
    .from("access_requests")
    .insert(toSubmissionInsert(parsed.data))
    .select(REQUEST_SELECT)
    .single();

  if (createError || !created) {
    return jsonError(createError?.message ?? "Failed to save access request", 500);
  }

  try {
    const analysis = await analyzeAccessRequest(parsed.data);

    const { data: updated, error: updateError } = await admin
      .from("access_requests")
      .update({
        prestige_score: analysis.prestigeScore,
        authority_score: analysis.authorityScore,
        market_potential_score: analysis.marketPotentialScore,
        luxury_fit_score: analysis.luxuryFitScore,
        priority_level: analysis.priorityLevel,
        ai_summary: analysis.executiveSummary,
        ai_recommendation: analysis.strategicRecommendation,
        status: "executive_review",
      })
      .eq("id", created.id)
      .select(REQUEST_SELECT)
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message ?? "Failed to persist AI analysis");
    }

    await notifyStaff(admin, updated);

    await writeAuditLog(admin, {
      action: "access_request.submitted",
      entity: "access_requests",
      entity_id: updated.id,
      metadata: {
        email: updated.email,
        company: updated.company,
        priority_level: updated.priority_level,
      },
    });

    return NextResponse.json(
      {
        request: updated,
        message:
          "Application received. Your profile is now being processed through the APEX intelligence layer. Executive review window: 24-48 hours.",
      },
      { status: 201 },
    );
  } catch (analysisError) {
    const message = analysisError instanceof Error ? analysisError.message : "AI analysis failed";

    await admin
      .from("access_requests")
      .update({
        status: "submitted",
        ai_summary: "Submission stored. AI qualification analysis queued for manual executive review.",
        ai_recommendation: "Review submission manually and rerun intelligence scoring.",
      })
      .eq("id", created.id);

    return NextResponse.json(
      {
        request: created,
        message:
          "Application received. Your profile is now being processed through the APEX intelligence layer. Executive review window: 24-48 hours.",
        warning: message,
      },
      { status: 202 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  let body: unknown;

  try {
    body = await readJson(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    return jsonError(message, statusCodeForMessage(message));
  }

  const parsed = AccessRequestUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid request payload", 422, parsed.error.issues);
  }

  if (parsed.data.status === undefined && parsed.data.executiveNotes === undefined) {
    return jsonError("No update payload supplied", 422);
  }

  try {
    const userId = await requireStaffUser();
    const admin = createAdminClient();

    const nextStatus = parsed.data.status;
    const reviewStateFields: Database["public"]["Tables"]["access_requests"]["Update"] =
      nextStatus === undefined
        ? {}
        : nextStatus === "submitted" || nextStatus === "processing"
          ? {
              reviewed_at: null,
              reviewed_by: null,
            }
          : {
              reviewed_at: new Date().toISOString(),
              reviewed_by: userId,
            };

    const updatePayload: Database["public"]["Tables"]["access_requests"]["Update"] = {
      ...(nextStatus ? { status: nextStatus } : {}),
      ...(parsed.data.executiveNotes !== undefined
        ? { executive_notes: parsed.data.executiveNotes || null }
        : {}),
      ...reviewStateFields,
    };

    const { data, error } = await admin
      .from("access_requests")
      .update(updatePayload)
      .eq("id", parsed.data.id)
      .select(REQUEST_SELECT)
      .single();

    if (error || !data) {
      return jsonError(error?.message ?? "Failed to update access request", 500);
    }

    await writeAuditLog(admin, {
      actor_id: userId,
      action: "access_request.updated",
      entity: "access_requests",
      entity_id: data.id,
      metadata: {
        status: data.status,
        executive_notes_updated: parsed.data.executiveNotes !== undefined,
      },
    });

    return NextResponse.json({ request: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, statusCodeForMessage(message));
  }
}