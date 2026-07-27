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

  return NextResponse.json({
    ok: true,
    matchedBy: result.matchedBy,
    writeAction: result.writeAction,
    challengeDay: result.stats.challengeDay,
    checkInCount: result.stats.checkInCount,
    visitRecorded: result.recordedVisit,
    activityDate: result.activityDate
  });
}
