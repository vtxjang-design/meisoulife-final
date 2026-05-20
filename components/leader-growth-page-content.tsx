"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { leaderThresholds } from "@/lib/leader";
import { useSiteCopy } from "@/lib/i18n";

type LeaderProgress = {
  paidDays: {
    current: number;
    target: number;
    complete: boolean;
  };
  checkInCount: {
    current: number;
    target: number;
    complete: boolean;
  };
  helpfulComments: {
    current: number;
    target: number;
    complete: boolean;
  };
};

type Props = {
  leaderFormUrl: string;
  candidateLeader: boolean;
  progress: LeaderProgress;
};

export function LeaderGrowthPageContent({ leaderFormUrl, candidateLeader, progress }: Props) {
  const copy = useSiteCopy();
  const leaders = copy.leaders;

  const leaderStages = [
    {
      label: leaders.stage1Label,
      title: leaders.stage1Title,
      description: leaders.stage1Description
    },
    {
      label: leaders.stage2Label,
      title: leaders.stage2Title,
      description: leaders.stage2Description
    },
    {
      label: leaders.stage3Label,
      title: leaders.stage3Title,
      description: leaders.stage3Description
    }
  ];

  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading eyebrow={leaders.eyebrow} title={leaders.headline} description={leaders.subcopy} />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4">
          {leaderStages.map((stage) => (
            <article key={stage.title} className="premium-card rounded-lg p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">{stage.label}</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">{stage.title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/72">{stage.description}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-6">
          <div className="premium-card rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">{leaders.promotionRule}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{leaders.promotionTitle}</h2>
            <div className="mt-5 grid gap-3 text-sm text-white/82">
              <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
                {leaders.paidDaysLabel} {leaderThresholds.paidDays}
                {leaders.daysTargetSuffix} · {leaders.currentLabel} {progress.paidDays.current}
                {leaders.daysValueSuffix}
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
                {leaders.checkInCountLabel} {leaderThresholds.checkInCount}
                {leaders.countTargetSuffix} · {leaders.currentLabel} {progress.checkInCount.current}
                {leaders.countValueSuffix}
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3">
                {leaders.helpfulCommentsLabel} {leaderThresholds.helpfulComments}
                {leaders.countTargetSuffix} · {leaders.currentLabel} {progress.helpfulComments.current}
                {leaders.countValueSuffix}
              </div>
            </div>
          </div>

          <div className="premium-card rounded-lg p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gold">{leaders.invitationLabel}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {candidateLeader ? leaders.invitationReadyTitle : leaders.invitationProgressTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/72">
              {candidateLeader ? leaders.invitationReadyDescription : leaders.invitationProgressDescription}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
              >
                {leaders.dashboardButton}
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {leaders.communityButton}
              </Link>
              <Link
                href={leaderFormUrl}
                className="inline-flex items-center justify-center rounded-md border border-gold/30 px-5 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10"
              >
                {leaders.leaderFormButton}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-[28px] border border-gold/20 bg-gold/10 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">{leaders.ctaTitle}</p>
        <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">{leaders.visionTitle}</h2>
        <p className="mt-4 max-w-4xl text-base leading-8 text-white/78">{leaders.ctaDescription}</p>
        <Link
          href={leaderFormUrl}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
        >
          {leaders.ctaButton}
        </Link>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">{leaders.visionEyebrow}</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{leaders.visionTitle}</h3>
          <p className="mt-4 text-sm leading-7 text-white/72">{leaders.visionDescription}</p>
        </div>
      </div>
    </div>
  );
}
