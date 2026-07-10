import { getBasicPracticeByRouteType } from "@/lib/basic-rhythm";
import { isActiveMembershipStatus, type MembershipPlanKey } from "@/lib/membership";

export type ProtectedMembershipPlan = Exclude<MembershipPlanKey, "free">;

const PLAN_ACCESS_LEVEL: Record<MembershipPlanKey, number> = {
  free: 0,
  basic: 1,
  growth: 2,
  inner_circle: 3
};

export function hasRequiredMembershipPlan(plan: MembershipPlanKey, requiredPlan: ProtectedMembershipPlan) {
  return PLAN_ACCESS_LEVEL[plan] >= PLAN_ACCESS_LEVEL[requiredPlan];
}

export function hasProtectedMembershipAccess(params: {
  plan: MembershipPlanKey;
  membershipStatus: string | null;
  requiredPlan: ProtectedMembershipPlan;
}) {
  const { plan, membershipStatus, requiredPlan } = params;
  return isActiveMembershipStatus(membershipStatus) && hasRequiredMembershipPlan(plan, requiredPlan);
}

export function resolveMeditationRequiredPlan(params: {
  routeType: string | null;
  meditationType: string | null;
  door: string | null;
  journeyMode: boolean;
}) {
  const { routeType, meditationType, door, journeyMode } = params;

  if (journeyMode) {
    return null;
  }

  if (!routeType || routeType === "default" || routeType === "morning" || routeType === "day" || routeType === "night") {
    return null;
  }

  const basicPractice = getBasicPracticeByRouteType(routeType, "jp");

  if (basicPractice) {
    return "basic" as const;
  }

  if (routeType.startsWith("growth-week-")) {
    return "growth" as const;
  }

  if (routeType.startsWith("inner-module-") || routeType === "inner-today") {
    return "inner_circle" as const;
  }

  const normalizedDoor = door === "relax" ? "rest" : door === "vitality" ? "recharge" : door;

  if (meditationType === "morning" && (normalizedDoor === "affirmation" || normalizedDoor === "energy" || normalizedDoor === "vision")) {
    return "basic" as const;
  }

  if (meditationType === "day" && (normalizedDoor === "focus" || normalizedDoor === "rest" || normalizedDoor === "recharge")) {
    return "basic" as const;
  }

  if (meditationType === "night" && (normalizedDoor === "release" || normalizedDoor === "gratitude" || normalizedDoor === "sleep")) {
    return "basic" as const;
  }

  return null;
}
