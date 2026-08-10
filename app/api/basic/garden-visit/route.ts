import { NextResponse } from "next/server";
import { syncBasicGardenVisit } from "@/lib/basic-garden-sync";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function resolveBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return {
      token: "",
      malformed: false
    };
  }

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return {
      token: "",
      malformed: true
    };
  }

  const token = authorization.slice(7).trim();

  return {
    token,
    malformed: token.length === 0
  };
}

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json(
      {
        ok: false,
        errorMessage: "Garden visit service is unavailable"
      },
      { status: 503 }
    );
  }

  const {
    data: { user: cookieUser },
    error: userError
  } = await supabase.auth.getUser();
  let user = cookieUser;

  if (userError) {
    console.warn("[api-basic-garden-visit] auth lookup failed", {
      message: userError.message
    });
  }

  const bearer = resolveBearerToken(request);

  if (!user && bearer.malformed) {
    return NextResponse.json(
      {
        ok: false,
        errorMessage: "Malformed bearer token"
      },
      { status: 401 }
    );
  }

  if (!user && bearer.token) {
    const {
      data: { user: bearerUser },
      error: bearerUserError
    } = await supabase.auth.getUser(bearer.token);

    if (bearerUserError) {
      console.warn("[api-basic-garden-visit] bearer session lookup failed", {
        message: bearerUserError.message
      });
    }

    if (bearerUser) {
      user = bearerUser;
    } else {
      return NextResponse.json(
        {
          ok: false,
          errorMessage: "Authenticated user is required"
        },
        { status: 401 }
      );
    }
  }

  if (!user?.id) {
    return NextResponse.json(
      {
        ok: false,
        errorMessage: "Authenticated user is required"
      },
      { status: 401 }
    );
  }

  const result = await syncBasicGardenVisit({
    client: admin as never,
    authUserId: user.id
  });

  if (!result.ok) {
    console.warn("[api-basic-garden-visit] sync failed", {
      userAuthenticated: true,
      matchedBy: result.matchedBy,
      writeAction: result.writeAction,
      error: result.errorMessage
    });

    return NextResponse.json(
      {
        ok: false,
        errorMessage: result.errorMessage ?? "Garden visit sync failed"
      },
      { status: 500 }
    );
  }

  const progressResult = await (admin as unknown as {
    rpc: (fn: string, params: Record<string, unknown>) => Promise<{
      data: unknown;
      error: { message: string } | null;
    }>;
  }).rpc("get_basic_garden_progress", {
    p_auth_user_id: user.id
  });
  const progress = Array.isArray(progressResult.data) ? progressResult.data[0] : progressResult.data;

  if (
    progressResult.error ||
    !progress ||
    typeof progress !== "object" ||
    !Number.isInteger((progress as { today_distinct_gate_count?: unknown }).today_distinct_gate_count)
  ) {
    console.warn("[api-basic-garden-visit] progress read failed", {
      userAuthenticated: true,
      error: progressResult.error?.message ?? "invalid_progress_response"
    });

    return NextResponse.json(
      {
        ok: false,
        errorMessage: "Garden progress could not be loaded"
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    matchedBy: result.matchedBy,
    writeAction: result.writeAction,
    challengeDay: result.stats.challengeDay,
    checkInCount: result.stats.checkInCount,
    cumulativeVisitDays: result.stats.cumulativeVisitDays,
    cumulativeRecoveryRecords: result.stats.cumulativeRecoveryRecords,
    todayDistinctGateCount: (progress as { today_distinct_gate_count: number }).today_distinct_gate_count,
    visitRecorded: result.recordedVisit,
    activityDate: result.activityDate
  });
}
