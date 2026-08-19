import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Gongsaeng Coach is temporarily unavailable." },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
