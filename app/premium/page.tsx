import { redirect } from "next/navigation";
import { PremiumPageContent } from "@/components/premium-page-content";
import { normalizeMembershipPlan } from "@/lib/membership";
import { resolveMembershipEntitlement } from "@/lib/membership-resolver";
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
    redirect("/login?next=/premium");
  }

  const membership = await resolveMembershipEntitlement({
    supabase,
    userId: user.id,
    email: user.email ?? null,
    logPrefix: "[premium]"
  });

  if (!membership.resolved || !membership.hasActiveSubscription || membership.plan === "free") {
    redirect("/membership");
  }

  const normalizedPlan = normalizeMembershipPlan(membership.plan);
  const premiumPlan = normalizedPlan === "free" ? "basic" : normalizedPlan;

  return <PremiumPageContent plan={premiumPlan} success={params?.success === "true"} />;
}
