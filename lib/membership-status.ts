"use client";

export type StoredMembershipTier = "basic" | "growth" | "inner_circle";

export type MembershipStatus = {
  active: boolean;
  tier: StoredMembershipTier;
  activatedAt: string;
  stripeSessionId: string;
};

const MEMBERSHIP_STATUS_KEY = "meisoulife_membership_status";

export function getMembershipStatus(): MembershipStatus | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(MEMBERSHIP_STATUS_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MembershipStatus>;

    if (
      parsed.active === true &&
      (parsed.tier === "basic" || parsed.tier === "growth" || parsed.tier === "inner_circle") &&
      typeof parsed.activatedAt === "string" &&
      typeof parsed.stripeSessionId === "string"
    ) {
      return {
        active: true,
        tier: parsed.tier,
        activatedAt: parsed.activatedAt,
        stripeSessionId: parsed.stripeSessionId
      };
    }
  } catch (_error) {
    // Ignore malformed local data.
  }

  window.localStorage.removeItem(MEMBERSHIP_STATUS_KEY);
  return null;
}

export function setMembershipStatus(status: MembershipStatus) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MEMBERSHIP_STATUS_KEY, JSON.stringify(status));
}

export function clearMembershipStatus() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(MEMBERSHIP_STATUS_KEY);
}

export function isPaidMember() {
  return getMembershipStatus()?.active === true;
}

export function getMembershipTier() {
  return getMembershipStatus()?.tier ?? null;
}
