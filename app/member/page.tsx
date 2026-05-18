import { MemberEntryContent } from "@/components/member-entry-content";

const LINE_URL =
  process.env.NEXT_PUBLIC_LINE_URL ||
  process.env.NEXT_PUBLIC_LINE_FREE_URL ||
  "https://line.me/R/ti/p/@meisoulife";

export default function MemberPage() {
  return <MemberEntryContent lineUrl={LINE_URL} />;
}
