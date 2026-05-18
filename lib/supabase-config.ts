const envSupabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"] || process.env["SUPABASE_URL"] || "";
const envSupabaseAnonKey =
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] || process.env["SUPABASE_ANON_KEY"] || "";

export const SUPABASE_URL = envSupabaseUrl;
export const SUPABASE_ANON_KEY = envSupabaseAnonKey;

export function getSupabaseConfigSource() {
  if (process.env["NEXT_PUBLIC_SUPABASE_URL"] && process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]) {
    return "env";
  }

  if (process.env["SUPABASE_URL"] && process.env["SUPABASE_ANON_KEY"]) {
    return "server-env";
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
