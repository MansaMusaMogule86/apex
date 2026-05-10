import { NextResponse, type NextRequest } from "next/server";
import { LiveEventSchema } from "@/lib/live/contracts";
import { ingestLiveEvent } from "@/lib/live/event-bus";
import { requireOrgAccess } from "@/lib/live/authz";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LiveEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 422 });
  }

  try {
    const auth = await requireOrgAccess(parsed.data.organizationId);
    const result = await ingestLiveEvent(parsed.data, auth.userId);
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
