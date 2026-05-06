import { MembershipPageContent } from "@/components/membership-page-content";

type MembershipPageProps = {
  searchParams?: Promise<{
    canceled?: string;
  }>;
};

export default async function MembershipPage({ searchParams }: MembershipPageProps) {
  const params = searchParams ? await searchParams : undefined;

  return <MembershipPageContent canceled={params?.canceled === "true"} />;
}
