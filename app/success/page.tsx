import { redirect } from "next/navigation";

type SuccessPageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const sessionId = params?.session_id;

  if (sessionId) {
    redirect(`/membership/success?session_id=${encodeURIComponent(sessionId)}`);
  }

  redirect("/membership/success");
}
