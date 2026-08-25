import { resolveSafeReturnPath } from "@/lib/auth-next";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

function isSameOriginPost(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return false;
  }

  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);

    return requestUrl.host === host && originUrl.host === host && originUrl.protocol === requestUrl.protocol;
  } catch {
    return false;
  }
}

function loginFailureRedirect(request: NextRequest, next: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", next);
  loginUrl.searchParams.set("auth_error", "invalid_credentials");
  return NextResponse.redirect(loginUrl, { status: 303 });
}

export async function POST(request: NextRequest) {
  if (!isSameOriginPost(request)) {
    return NextResponse.json({ error: "invalid_request" }, { status: 403 });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "authentication_unavailable" }, { status: 503 });
  }

  const formData = await request.formData();
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const nextValue = formData.get("next");
  const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const next = resolveSafeReturnPath(typeof nextValue === "string" ? nextValue : null);

  if (!email || !password) {
    return loginFailureRedirect(request, next);
  }

  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as never);
        });
      }
    }
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return loginFailureRedirect(request, next);
  }

  return response;
}
