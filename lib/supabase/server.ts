import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase-config";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export async function getSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as never);
          });
        } catch (_error) {
          // Server Components can safely ignore cookie writes during render.
        }
      }
    }
  });
}

/**
 * Creates an RLS-scoped client for an access token that has already been
 * validated by Supabase Auth. This is deliberately separate from the
 * cookie-backed client so bearer-authenticated API calls preserve the caller's
 * database identity without using elevated credentials.
 */
export function getSupabaseBearerServerClient(accessToken: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !accessToken.trim()) {
    return null;
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}
