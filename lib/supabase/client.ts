import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
let browserClientKey = "";

export const SUPABASE_BROWSER_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_BROWSER_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

type SupabaseBrowserConfig = {
  url?: string;
  anonKey?: string;
};

export function getSupabaseClient(config?: SupabaseBrowserConfig) {
  const url = config?.url ?? SUPABASE_BROWSER_URL;
  const anonKey = config?.anonKey ?? SUPABASE_BROWSER_ANON_KEY;
  const nextClientKey = `${url}::${anonKey}`;

  if (process.env.NODE_ENV !== "production") {
    console.log("[supabase-client] browser env", {
      hasUrl: Boolean(url),
      hasAnonKey: Boolean(anonKey)
    });
  }

  if (!url || !anonKey) {
    return null;
  }

  if (!browserClient || browserClientKey !== nextClientKey) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    browserClientKey = nextClientKey;
  }

  return browserClient;
}
