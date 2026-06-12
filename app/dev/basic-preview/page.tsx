import { notFound } from "next/navigation";
import { DevBasicPreview } from "@/components/dev-basic-preview";

export default function BasicPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="section-shell relative min-h-screen overflow-hidden pb-20 pt-6 sm:pb-28 sm:pt-8">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_20%,rgba(115,231,210,0.18),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(89,193,255,0.16),transparent_50%),radial-gradient(circle_at_50%_80%,rgba(70,220,200,0.12),transparent_60%),linear-gradient(180deg,#041221_0%,#082038_42%,#0B2F3D_74%,#103845_100%)]" />
      <div className="pointer-events-none absolute inset-x-[-6%] top-[-4%] -z-10 h-[560px] rounded-full bg-[radial-gradient(circle,rgba(115,231,210,0.26),transparent_68%)] blur-[130px]" />
      <div className="pointer-events-none absolute right-[-14%] top-[8%] -z-10 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(89,193,255,0.22),transparent_70%)] blur-[150px]" />
      <div className="pointer-events-none absolute left-[14%] top-[28%] -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(115,231,210,0.16),transparent_72%)] blur-[144px]" />
      <div className="pointer-events-none absolute inset-x-[8%] bottom-[8%] -z-10 h-[520px] rounded-full bg-[radial-gradient(circle,rgba(70,220,200,0.14),transparent_74%)] blur-[148px]" />
      <DevBasicPreview />
    </main>
  );
}
