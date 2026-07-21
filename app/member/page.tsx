import { MemberEntryContent } from "@/components/member-entry-content";
import { resolveSafeInternalNextPath } from "@/lib/auth-next";
import type { MembershipResolutionResult, MembershipSummary } from "@/lib/membership";
import { resolveMembershipEntitlement } from "@/lib/membership-resolver";
import { getSupabaseConfigStatus } from "@/lib/supabase-config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const LINE_URL =
  process.env.NEXT_PUBLIC_LINE_URL ||
  process.env.NEXT_PUBLIC_LINE_FREE_URL ||
  "https://lin.ee/z8Lzvvs";

type MemberPageProps = {
  searchParams?: Promise<{
    debug?: string;
    membershipDebug?: string;
    next?: string;
  }>;
};

function MembershipDebugPanel({ result }: { result: MembershipResolutionResult | null }) {
  const redirectReason = !result?.membershipStatus ? "no_membership_record" : "inactive_membership";

  return (
    <div className="section-shell pt-6">
      <div className="rounded-[24px] border border-gold/22 bg-[#09131d]/84 p-5 text-sm text-white/78">
        <p className="text-xs uppercase tracking-[0.26em] text-gold/78">Membership Debug</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <p>authenticated: {result?.debug?.authenticated ? "yes" : "no"}</p>
          <p>user ID present: {result?.debug?.userIdPresent ? "yes" : "no"}</p>
          <p>normalized login email: {result?.debug?.normalizedLoginEmail ?? "unknown"}</p>
          <p>membership resolve HTTP status: server-rendered</p>
          <p>resolved plan: {result?.plan ?? "unknown"}</p>
          <p>resolved status: {result?.membershipStatus ?? "none"}</p>
          <p>matched by: {result?.debug?.matchedBy ?? "unknown"}</p>
          <p>membership row found: {result?.debug?.membershipRowFound ? "yes" : "no"}</p>
          <p>Stripe customer ID present: {result?.debug?.stripeCustomerIdPresent ? "yes" : "no"}</p>
          <p>subscription/payment state: {result?.debug?.paymentState ?? "none"}</p>
          <p>final guard decision: blocked_to_member</p>
          <p>redirect reason: {redirectReason}</p>
        </div>
      </div>
    </div>
  );
}

export default async function MemberPage({ searchParams }: MemberPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const safeNext = resolveSafeInternalNextPath(params?.next);
  const supabaseConfig = getSupabaseConfigStatus();
  const supabase = await getSupabaseServerClient();
  let initialPlan: "free" | "basic" | "growth" | "inner_circle" = "free";
  let initialEmail = "";
  let membershipDebugResult: MembershipResolutionResult | null = null;
  let membershipSummary: MembershipSummary = {
    currentPlan: "free",
    subscriptionStatus: null,
    nextBillingDate: null,
    canManageMembership: false
  };
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (supabase && user) {
    const entitlement = await resolveMembershipEntitlement({
      supabase,
      userId: user.id,
      email: user.email ?? null,
      logPrefix: "[member]",
      debug: params?.membershipDebug === "1"
    });

    initialPlan = entitlement.plan;
    initialEmail = user.email || "";
    membershipSummary = entitlement.membershipSummary;
    membershipDebugResult = entitlement;

    if (entitlement.hasActiveSubscription && params?.membershipDebug !== "1") {
      redirect(safeNext);
    }
  }

  return (
    <>
      {params?.membershipDebug === "1" ? <MembershipDebugPanel result={membershipDebugResult} /> : null}
      <MemberEntryContent
        lineUrl={LINE_URL}
        debug={params?.debug === "1"}
        hasSupabaseUrl={supabaseConfig.supabaseUrlExists}
        hasSupabaseAnonKey={supabaseConfig.supabaseKeyExists}
        isLoggedInInitially={Boolean(user)}
        initialPlan={initialPlan}
        initialEmail={initialEmail}
        membershipSummary={membershipSummary}
      />
    </>
  );
}
