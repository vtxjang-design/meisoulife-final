import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.meisoulife.com";

export async function POST(request: NextRequest) {
  const env = {
    supabaseUrlExists: Boolean(supabaseUrl),
    supabaseKeyExists: Boolean(supabaseAnonKey)
  };

  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!supabaseUrl) {
      console.error("[send-magic-link] Missing NEXT_PUBLIC_SUPABASE_URL");
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

    if (!supabaseAnonKey) {
      console.error("[send-magic-link] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
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

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/member`
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
