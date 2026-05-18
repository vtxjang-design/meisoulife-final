import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export const SUPABASE_BROWSER_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_BROWSER_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function getSupabaseClient() {
  const url = SUPABASE_BROWSER_URL;
  const anonKey = SUPABASE_BROWSER_ANON_KEY;

  if (process.env.NODE_ENV !== "production") {
    console.log("[supabase-client] browser env", {
      hasUrl: Boolean(url),
      hasAnonKey: Boolean(anonKey)
    });
  }

  if (!url || !anonKey) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  return browserClient;
}
