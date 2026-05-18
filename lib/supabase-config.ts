const FALLBACK_SUPABASE_URL = "https://mkgpzqimfrzpkfdoyflp.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "";

const envSupabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] || process.env["SUPABASE_URL"] || "";
const envSupabaseAnonKey =
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || process.env["SUPABASE_ANON_KEY"] || "";

export const SUPABASE_URL = envSupabaseUrl || FALLBACK_SUPABASE_URL;
export const SUPABASE_ANON_KEY = envSupabaseAnonKey || FALLBACK_SUPABASE_ANON_KEY;

export function getSupabaseConfigSource() {
  if (process.env["NEXT_PUBLIC_SUPABASE_URL"] && process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]) {
    return "env";
  }

  if (process.env["SUPABASE_URL"] && process.env["SUPABASE_ANON_KEY"]) {
    return "server-env";
  }

  if (FALLBACK_SUPABASE_URL && FALLBACK_SUPABASE_ANON_KEY) {
    return "fallback";
  }

  return "missing";
}

export function getSupabaseConfigStatus() {
  return {
    supabaseUrlExists: Boolean(SUPABASE_URL),
    supabaseKeyExists: Boolean(SUPABASE_ANON_KEY),
    source: getSupabaseConfigSource()
  };
}
