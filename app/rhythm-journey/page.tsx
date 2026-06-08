import type { Metadata } from "next";
import { RhythmJourneyPage } from "@/components/rhythm-journey-page";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "7日間の小さな回復",
  description: "自分のリズムを取り戻すための、やさしい7日間の旅。",
  alternates: {
    canonical: absoluteUrl("/rhythm-journey")
  }
};

export default function Page() {
  return <RhythmJourneyPage />;
}
