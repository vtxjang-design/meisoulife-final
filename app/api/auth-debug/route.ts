import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabaseUrlExists: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseKeyExists: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.meisoulife.com"
  });
}
