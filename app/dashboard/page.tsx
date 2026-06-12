import { redirect } from "next/navigation";

type DashboardPageProps = {
  searchParams: Promise<{
    email?: string;
    challenge?: string;
    gate?: string;
    rhythm?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  if (params.email) {
    query.set("email", params.email);
  }

  if (params.challenge) {
    query.set("challenge", params.challenge);
  }

  if (params.gate) {
    query.set("gate", params.gate);
  }

  if (params.rhythm) {
    query.set("rhythm", params.rhythm);
  }

  redirect(query.size > 0 ? `/program/basic?${query.toString()}` : "/program/basic");
}
