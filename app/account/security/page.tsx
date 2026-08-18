import { redirect } from "next/navigation";
import { AccountSecurityCard } from "@/components/account-security-card";
import { ACCOUNT_SECURITY_PATH } from "@/lib/account-security";
import { buildLoginHref } from "@/lib/auth-next";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AccountSecurityPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error
  } = supabase ? await supabase.auth.getUser() : { data: { user: null }, error: null };

  if (error || !user) {
    redirect(buildLoginHref(ACCOUNT_SECURITY_PATH));
  }

  return (
    <div className="section-shell py-16 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <AccountSecurityCard email={user.email ?? null} />
      </div>
    </div>
  );
}
