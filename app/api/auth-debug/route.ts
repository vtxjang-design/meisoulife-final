import { getSupabaseConfigStatus } from "@/lib/supabase-config";
import { NextResponse } from "next/server";

export async function GET() {
  const config = getSupabaseConfigStatus();

  return NextResponse.json({
    ...config,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.meisoulife.com"
  });
}
