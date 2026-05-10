import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type AuthContext = {
  userId: string;
  organizationId: string;
};

export async function requireOrgAccess(organizationId: string): Promise<AuthContext> {
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
