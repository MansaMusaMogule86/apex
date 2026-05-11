import { redirect } from "next/navigation";
import LeadIntelligenceScreen from "@/components/command-center/lead/LeadIntelligenceScreen";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function LeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: isStaff, error: staffError } = await supabase.rpc("fn_is_staff");

  if (staffError || !isStaff) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return <LeadIntelligenceScreen initialRequests={data ?? []} loadError={error?.message ?? null} />;
}