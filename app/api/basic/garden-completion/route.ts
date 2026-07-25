import { NextResponse } from "next/server";
import { syncBasicGardenCompletion } from "@/lib/basic-garden-sync";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
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
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    console.warn("[api-basic-garden-completion] auth lookup failed", {
      message: userError.message
    });
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
      userId: user.id,
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
