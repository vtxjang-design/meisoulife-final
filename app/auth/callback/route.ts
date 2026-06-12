import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const nextParam = requestUrl.searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : "/dashboard";

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("[auth-callback] Missing Supabase public environment variables");
    return NextResponse.redirect(new URL("/member?debug=1", request.url));
  }

  const response = NextResponse.redirect(new URL(next, request.url));

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  let error: { message: string } | null = null;

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "magiclink" | "recovery" | "invite" | "signup" | "email"
    });
    error = result.error;
  } else {
    console.error("[auth-callback] Missing auth code or token_hash");
    return NextResponse.redirect(new URL("/member?debug=1", request.url));
  }

  if (error) {
    console.error("[auth-callback] Failed to complete auth callback", error.message);
    return NextResponse.redirect(new URL("/member?debug=1", request.url));
  }

  console.log("[auth-callback] Session established");
  return response;
}
