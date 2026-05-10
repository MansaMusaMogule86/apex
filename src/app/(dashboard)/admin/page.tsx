import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminConsole from "./AdminConsole";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: isAdmin, error } = await supabase.rpc("fn_is_admin");

  if (error || !isAdmin) redirect("/dashboard");

  return <AdminConsole />;
}
