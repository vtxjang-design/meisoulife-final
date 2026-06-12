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

    if (membershipState.plan === "basic") {
      redirect("/program/basic");
    }

    if (membershipState.plan === "growth") {
      redirect("/program/growth");
    }

    if (membershipState.plan === "inner_circle") {
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
