import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization");

  if (process.env.CRON_SECRET && secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    job: "inactive-users",
    message: "Inactive users encouragement workflow triggered."
  });
}
