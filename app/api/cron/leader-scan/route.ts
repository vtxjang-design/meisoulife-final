import { NextResponse } from "next/server";
import { resolveCronAuthorization } from "@/lib/cron-authorization";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isLeaderCandidate } from "@/lib/leader";

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

  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, paid_days, check_in_count, helpful_comments, candidate_leader");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const qualifiedUsers =
      users?.filter((user) =>
        isLeaderCandidate({
          paidDays: user.paid_days || 0,
          checkInCount: user.check_in_count || 0,
          helpfulComments: user.helpful_comments || 0,
          candidateLeader: user.candidate_leader
        })
      ) || [];

    for (const user of qualifiedUsers) {
      await supabase
        .from("users")
        .update({ candidate_leader: true })
        .eq("id", user.id);

      await supabase.from("leader_candidates").upsert(
        {
          user_id: user.id,
          status: "candidate"
        },
        {
          onConflict: "user_id"
        }
      );
    }

    return NextResponse.json({
      ok: true,
      job: "leader-scan",
      qualifiedUsers: qualifiedUsers.length
    });
  }

  return NextResponse.json({
    ok: true,
    job: "leader-scan",
    message: "Monthly leader candidate scan triggered."
  });
}
