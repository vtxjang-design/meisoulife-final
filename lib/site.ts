import { getSiteUrl } from "@/lib/env";

export function absoluteUrl(path = "/") {
  const base = getSiteUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${normalizedPath}`;
}

export function getLineInviteLinks() {
  return {
    free: process.env.NEXT_PUBLIC_LINE_FREE_URL || process.env.LINE_FREE_INVITE_URL || absoluteUrl("/challenge"),
    member: process.env.LINE_MEMBER_INVITE_URL || absoluteUrl("/community"),
    leader: process.env.NEXT_PUBLIC_LEADER_FORM_URL || process.env.LINE_LEADER_INVITE_URL || absoluteUrl("/leaders")
  };
}

export function getWelcomeMemberLinks() {
  const invites = getLineInviteLinks();

  return {
    community: process.env.NEXT_PUBLIC_WELCOME_MEMBER_COMMUNITY_URL || invites.member,
    meditationStart: process.env.NEXT_PUBLIC_WELCOME_MEMBER_MEDITATION_URL || absoluteUrl("/challenge"),
    audioGuide: process.env.NEXT_PUBLIC_WELCOME_MEMBER_AUDIO_URL || absoluteUrl("/coach")
  };
}

export function getBasicMembershipCheckoutUrl() {
  return (
    process.env.NEXT_PUBLIC_STRIPE_BASIC_URL ||
    process.env.NEXT_PUBLIC_STRIPE_BASIC_CHECKOUT_URL ||
    ""
  );
}

export function getStripeCheckoutUrl(plan: "basic" | "leader" | "premium") {
  if (plan === "basic") {
    return getBasicMembershipCheckoutUrl();
  }

  if (plan === "leader") {
    return process.env.NEXT_PUBLIC_STRIPE_GROWTH_URL || "";
  }

  return process.env.NEXT_PUBLIC_STRIPE_INNER_URL || "";
}

export function getLeaderFormUrl() {
  return process.env.NEXT_PUBLIC_LEADER_FORM_URL || absoluteUrl("/leaders");
}
