import { SUPABASE_ANON_KEY, SUPABASE_URL, getSupabaseConfigStatus } from "@/lib/supabase-config";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.meisoulife.com";

export async function POST(request: NextRequest) {
  const env = getSupabaseConfigStatus();

  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!SUPABASE_URL) {
      console.error("[send-magic-link] Missing Supabase URL");
      return NextResponse.json(
        {
          success: false,
          message: "Server env vars missing in Vercel.",
          error: "Supabase URL is not configured.",
          env
        },
        { status: 500 }
      );
    }

    if (!SUPABASE_ANON_KEY) {
      console.error("[send-magic-link] Missing Supabase anon key");
      return NextResponse.json(
        {
          success: false,
          message: "Server env vars missing in Vercel.",
          error: "Supabase anon key is not configured.",
          env
        },
        { status: 500 }
      );
    }

    if (!email || !email.includes("@")) {
      console.error("[send-magic-link] Invalid email");
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email address.",
          error: "Invalid email address.",
          env
        },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/program/basic`
      }
    });

    if (error) {
      console.error("[send-magic-link] Failed to send magic link", error.message);
      return NextResponse.json(
        {
          success: false,
          message: "Supabase magic link request failed.",
          error: error.message,
          env
        },
        { status: 400 }
      );
    }

    console.log("[send-magic-link] Magic link request accepted");
    return NextResponse.json({
      success: true,
      message: "Magic link sent successfully.",
      error: "",
      env
    });
  } catch (error) {
    console.error("[send-magic-link] Unexpected error", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected server error.",
        error: error instanceof Error ? error.message : "Unknown error.",
        env
      },
      { status: 500 }
    );
  }
}
