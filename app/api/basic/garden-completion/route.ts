import { NextResponse } from "next/server";
import { syncBasicGardenCompletion } from "@/lib/basic-garden-sync";
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
        errorMessage: "Garden sync service is unavailable"
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
    console.warn("[api-basic-garden-completion] auth lookup failed", {
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
      console.warn("[api-basic-garden-completion] bearer session lookup failed", {
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

  if (!user?.id || !user.email) {
    return NextResponse.json(
      {
        ok: false,
        errorMessage: "Authenticated user is required"
      },
      { status: 401 }
    );
  }

  const result = await syncBasicGardenCompletion({
    client: admin as never,
    authUserId: user.id,
    email: user.email
  });

  if (!result.ok) {
    console.warn("[api-basic-garden-completion] sync failed", {
      userAuthenticated: true,
      matchedBy: result.matchedBy,
      writeAction: result.writeAction,
      error: result.errorMessage
    });

    return NextResponse.json(
      {
        ok: false,
        errorMessage: result.errorMessage ?? "Garden completion sync failed"
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    matchedBy: result.matchedBy,
    writeAction: result.writeAction,
    checkInCount: result.stats.checkInCount,
    challengeDay: result.stats.challengeDay
  });
}
