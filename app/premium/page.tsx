import { redirect } from "next/navigation";
import { PremiumPageContent } from "@/components/premium-page-content";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type PremiumPageProps = {
  searchParams?: Promise<{
    success?: string;
  }>;
};

export default async function PremiumPage({ searchParams }: PremiumPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    redirect("/pricing");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("plan, status")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/membership");
  }

  const normalizedPlan =
    membership.plan === "growth" || membership.plan === "inner_circle" || membership.plan === "basic"
      ? membership.plan
      : "basic";

  return <PremiumPageContent plan={normalizedPlan} success={params?.success === "true"} />;
}
