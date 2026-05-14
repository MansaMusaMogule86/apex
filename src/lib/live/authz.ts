import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthContext = {
  userId: string;
  organizationId: string;
};

const DEV_AUTH: AuthContext = {
  userId: "00000000-0000-4000-8000-000000000002",
  organizationId: "00000000-0000-4000-8000-000000000001",
};

/**
 * Returns true when APEX_DEV_BYPASS=true is set.
 * Never allow in production (VERCEL_ENV or NODE_ENV guard).
 */
function isDevBypass(): boolean {
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.APEX_DEV_BYPASS === "true";
}

export async function requireOrgAccess(organizationId: string): Promise<AuthContext> {
  // ─── Dev bypass ───────────────────────────────────────────────────
  if (isDevBypass()) {
    return { ...DEV_AUTH, organizationId };
  }

  // ─── Production: require Supabase auth + org membership ──────────
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  const admin = createAdminClient();
  const { data: membership, error: membershipError } = await admin
    .from("organization_memberships")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("membership_status", "active")
    .maybeSingle();

  if (membershipError) {
    throw new Error(`Membership lookup failed: ${membershipError.message}`);
  }

  if (!membership) {
    throw new Error("Forbidden");
  }

  return {
    userId: user.id,
    organizationId,
  };
}
