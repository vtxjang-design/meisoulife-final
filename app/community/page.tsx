"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { useSiteCopy } from "@/lib/i18n";
import { getBasicMembershipCheckoutUrl, getLeaderFormUrl, getLineInviteLinks } from "@/lib/site";

export default function CommunityPage() {
  const copy = useSiteCopy();
  const community = copy.community;
  const invites = getLineInviteLinks();
  const basicUrl = getBasicMembershipCheckoutUrl();
  const leaderFormUrl = getLeaderFormUrl();

  return (
    <div className="section-shell py-16 sm:py-24">
      <SectionHeading
        eyebrow={community.eyebrow}
        title={community.headline}
        description={community.subcopy}
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">LINE Community</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{community.lineCommunityTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">{community.lineCommunityDescription}</p>
          <Link
            href={invites.free}
            className="mt-6 inline-flex rounded-md bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#e7cd92]"
          >
            {community.lineCommunityCTA}
          </Link>
        </article>
        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Membership</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{community.rhythmTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">{community.rhythmDescription}</p>
          <Link
            href={basicUrl || "/pricing"}
            className="mt-6 inline-flex rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {community.rhythmCTA}
          </Link>
        </article>
        <article className="premium-card rounded-lg p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Leader Vision</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{community.supportTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">{community.supportDescription}</p>
          <Link
            href={leaderFormUrl}
            className="mt-6 inline-flex rounded-md border border-gold/40 px-5 py-3 text-sm font-semibold text-gold transition hover:bg-gold/10"
          >
            {community.supportCTA}
          </Link>
        </article>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold text-white">{community.memberCommunityTitle}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/72">{community.memberCommunityDescription}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {community.channels.map((channel) => (
          <div key={channel} className="premium-card rounded-lg px-4 py-5 text-center text-sm text-white/82">
            {channel}
          </div>
        ))}
      </div>
    </div>
  );
}
