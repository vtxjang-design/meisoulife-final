import { NextResponse } from "next/server";
import { resolveCronAuthorization } from "@/lib/cron-authorization";

export async function GET(request: Request) {
  const authorization = resolveCronAuthorization({
    configuredSecret: process.env.CRON_SECRET,
    authorizationHeader: request.headers.get("authorization")
  });

  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.error },
      {
        status: authorization.status,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  return NextResponse.json({
    ok: true,
    job: "weekly-report",
    message: "Weekly admin report workflow triggered."
  });
}
