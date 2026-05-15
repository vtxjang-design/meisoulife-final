"use client";

import { useEffect } from "react";
import { setMembershipStatus, type StoredMembershipTier } from "@/lib/membership-status";

type SuccessMembershipSyncProps = {
  sessionId: string;
  tier: StoredMembershipTier;
};

export function SuccessMembershipSync({ sessionId, tier }: SuccessMembershipSyncProps) {
  useEffect(() => {
    setMembershipStatus({
      active: true,
      tier,
      activatedAt: new Date().toISOString(),
      stripeSessionId: sessionId
    });
  }, [sessionId, tier]);

  return null;
}
