import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function isDevBypass(): boolean {
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.APEX_DEV_BYPASS === "true";
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // In dev bypass mode, return a stub client that returns empty data for all queries
  if (isDevBypass() && (!serviceRole || !url)) {
    const stub = {
      from: () => ({
        select: () => stub.from(),
        insert: () => stub.from(),
        update: () => stub.from(),
        delete: () => stub.from(),
        eq: () => stub.from(),
        is: () => stub.from(),
        order: () => stub.from(),
        limit: () => stub.from(),
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
        then: async () => ({ data: [], error: null }),
      }),
    };
    return stub as unknown as ReturnType<typeof createClient>;
  }

  requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url!, serviceRole!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

