import { MemberEntryContent } from "@/components/member-entry-content";
import { getSupabaseConfigStatus } from "@/lib/supabase-config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <MemberEntryContent
      lineUrl={LINE_URL}
      debug={params?.debug === "1"}
      hasSupabaseUrl={supabaseConfig.supabaseUrlExists}
      hasSupabaseAnonKey={supabaseConfig.supabaseKeyExists}
      isLoggedInInitially={Boolean(user)}
    />
  );
}
