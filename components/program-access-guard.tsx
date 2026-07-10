"use client";

import { MembershipGuard } from "@/components/membership-guard";
import type { ProtectedMembershipPlan } from "@/lib/membership-access";

type ProgramAccessGuardProps = {
  children: React.ReactNode;
  requiredPlan?: ProtectedMembershipPlan;
};

export function ProgramAccessGuard({ children, requiredPlan = "basic" }: ProgramAccessGuardProps) {
  return (
    <MembershipGuard requiredPlan={requiredPlan}>
      {children}
    </MembershipGuard>
  );
}
