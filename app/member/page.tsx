import { MemberEntryContent } from "@/components/member-entry-content";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const LINE_URL =
  process.env.NEXT_PUBLIC_LINE_URL ||
  process.env.NEXT_PUBLIC_LINE_FREE_URL ||
  "https://line.me/R/ti/p/@meisoulife";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

type MemberPageProps = {
  searchParams?: Promise<{
    debug?: string;
  }>;
};

export default async function MemberPage({ searchParams }: MemberPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const supabase = await getSupabaseServerClient();
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <MemberEntryContent
      lineUrl={LINE_URL}
      debug={params?.debug === "1"}
      hasSupabaseUrl={Boolean(SUPABASE_URL)}
      hasSupabaseAnonKey={Boolean(SUPABASE_ANON_KEY)}
      isLoggedInInitially={Boolean(user)}
    />
  );
}
