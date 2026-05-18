import { getSupabaseClient } from "@/lib/supabase/client";

type SupabaseBrowserConfig = {
  url?: string;
  anonKey?: string;
};

export function getSupabaseBrowserClient(config?: SupabaseBrowserConfig) {
  return getSupabaseClient(config);
}
