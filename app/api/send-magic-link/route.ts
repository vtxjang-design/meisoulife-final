import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.meisoulife.com";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!supabaseUrl) {
      console.error("[send-magic-link] Missing NEXT_PUBLIC_SUPABASE_URL");
      return NextResponse.json({ success: false, error: "Supabase URL is not configured." }, { status: 500 });
    }

    if (!supabaseAnonKey) {
      console.error("[send-magic-link] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
      return NextResponse.json({ success: false, error: "Supabase anon key is not configured." }, { status: 500 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, error: "Invalid email address." }, { status: 400 });
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
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[send-magic-link] Unexpected error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error."
      },
      { status: 500 }
    );
  }
}
