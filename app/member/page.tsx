import { MemberEntryContent } from "@/components/member-entry-content";
import { fetchLatestMembershipPlan } from "@/lib/membership";
import { getSupabaseConfigStatus } from "@/lib/supabase-config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const LINE_URL =
  process.env.NEXT_PUBLIC_LINE_URL ||
  process.env.NEXT_PUBLIC_LINE_FREE_URL ||
  "https://line.me/R/ti/p/@meisoulife";

type MemberPageProps = {
  searchParams?: Promise<{
    debug?: string;
  }>;
};

export default async function MemberPage({ searchParams }: MemberPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const supabaseConfig = getSupabaseConfigStatus();
  const supabase = await getSupabaseServerClient();
  let initialPlan: "free" | "basic" | "growth" | "inner_circle" = "free";
  let initialEmail = "";
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (supabase && user) {
    const membershipState = await fetchLatestMembershipPlan(supabase, user.id, "[member]");
    initialPlan = membershipState.plan;
    initialEmail = user.email || "";

    const { data: profile } = await supabase
      .from("users")
      .select("id, current_plan")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const { data: subscription } = profile?.id
      ? await supabase
          .from("subscriptions")
          .select("plan_key, status")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      : { data: null };

    if (initialPlan === "free") {
      if (profile?.current_plan === "basic" || profile?.current_plan === "growth" || profile?.current_plan === "inner_circle") {
        initialPlan = profile.current_plan;
      } else if (
        (subscription?.status === "active" || subscription?.status === "trialing") &&
        (subscription.plan_key === "basic" || subscription.plan_key === "growth" || subscription.plan_key === "inner_circle")
      ) {
        initialPlan = subscription.plan_key;
      }
    }

    if (initialPlan === "basic") {
      redirect("/program/basic");
    }

    if (initialPlan === "growth") {
      redirect("/program/growth");
    }

    if (initialPlan === "inner_circle") {
      redirect("/program/inner");
    }
  }

  return (
    <MemberEntryContent
      lineUrl={LINE_URL}
      debug={params?.debug === "1"}
      hasSupabaseUrl={supabaseConfig.supabaseUrlExists}
      hasSupabaseAnonKey={supabaseConfig.supabaseKeyExists}
      isLoggedInInitially={Boolean(user)}
      initialPlan={initialPlan}
      initialEmail={initialEmail}
    />
  );
}
