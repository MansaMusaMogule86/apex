import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOrgAccess } from "@/lib/live/authz";

export const runtime = "nodejs";

const KPI_KEYS = [
  "prestige_index",
  "market_velocity",
  "revenue_projection",
  "influence_yield",
  "lead_purity",
  "founder_gravity",
];

export async function GET(req: NextRequest) {
  const organizationId = req.nextUrl.searchParams.get("organization_id");

  if (!organizationId) {
    return NextResponse.json({ error: "organization_id is required" }, { status: 400 });
  }

  try {
    await requireOrgAccess(organizationId);

    const admin = createAdminClient();
    
    // Fetch the latest snapshot for each key
    const { data, error } = await admin
      .from("signal_snapshots")
      .select("signal_key, signal_value, confidence, anomaly_score, trend, captured_at")
      .eq("organization_id", organizationId)
      .in("signal_key", KPI_KEYS)
      .order("captured_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by key and take the latest one
    const latestSnapshots = (data ?? []).reduce((acc: any, curr) => {
      if (!acc[curr.signal_key]) {
        acc[curr.signal_key] = curr;
      }
      return acc;
    }, {});

    return NextResponse.json({ snapshots: latestSnapshots });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
