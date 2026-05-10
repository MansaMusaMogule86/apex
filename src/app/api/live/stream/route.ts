import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOrgAccess } from "@/lib/live/authz";
import { heartbeatPayload, sseEncode } from "@/lib/live/realtime";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const organizationId = req.nextUrl.searchParams.get("organization_id");
  const workspaceId = req.nextUrl.searchParams.get("workspace_id");

  if (!organizationId) {
    return NextResponse.json({ error: "organization_id is required" }, { status: 400 });
  }

  try {
    await requireOrgAccess(organizationId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }

  const admin = createAdminClient();
  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const push = async () => {
        if (closed) return;

        let query = admin
          .from("recommendations_live")
          .select("id,title,priority_index,confidence_score,escalation_state,created_at")
          .eq("organization_id", organizationId)
          .is("invalidated_at", null)
          .order("created_at", { ascending: false })
          .limit(10);

        if (workspaceId) {
          query = query.eq("workspace_id", workspaceId);
        }

        const { data, error } = await query;
        if (error) {
          controller.enqueue(encoder.encode(sseEncode("error", { message: error.message })));
          return;
        }

        controller.enqueue(
          encoder.encode(
            sseEncode("recommendations.snapshot", {
              ts: new Date().toISOString(),
              recommendations: data ?? [],
            }),
          ),
        );
      };

      void push();

      const snapshotInterval = setInterval(() => {
        void push();
      }, 7000);

      const heartbeatInterval = setInterval(() => {
        controller.enqueue(encoder.encode(sseEncode("heartbeat", heartbeatPayload())));
      }, 15000);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(snapshotInterval);
        clearInterval(heartbeatInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
