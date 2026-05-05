import { getSupabaseClient } from "@/lib/supabase/client";

export function getSupabaseBrowserClient() {
  return getSupabaseClient();
}
