import { getBasicGardenVisualModel } from "./basic-home-entry";
import { normalizeLookupEmail } from "./membership";

export type BasicGardenProfileRow = {
  id?: string | null;
  auth_user_id?: string | null;
  email?: string | null;
  challenge_day?: number | null;
  check_in_count?: number | null;
};

export type BasicGardenProfileMatch = {
  profile: BasicGardenProfileRow | null;
  matchedBy: "auth_user_id" | "email" | "none";
};

export type BasicGardenStats = {
  currentDay: number;
  cumulativeCheckIns: number;
};

function normalizePositiveInteger(value: number | null | undefined, minimum: number) {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.max(minimum, Math.floor(value as number));
}

export function resolveBasicGardenStats(profile: BasicGardenProfileRow | null | undefined): BasicGardenStats {
  return {
    currentDay: normalizePositiveInteger(profile?.challenge_day, 0),
    cumulativeCheckIns: normalizePositiveInteger(profile?.check_in_count, 0)
  };
}

export function matchBasicGardenProfile(
  profiles: readonly BasicGardenProfileRow[],
  authUserId: string | null | undefined,
  email: string | null | undefined
): BasicGardenProfileMatch {
  if (authUserId) {
    const exactMatch = profiles.find((profile) => profile.auth_user_id === authUserId) ?? null;

    if (exactMatch) {
      return {
        profile: exactMatch,
        matchedBy: "auth_user_id"
      };
    }
  }

  const normalizedEmail = normalizeLookupEmail(email);

  if (normalizedEmail) {
    const emailMatch =
      profiles.find((profile) => normalizeLookupEmail(profile.email) === normalizedEmail) ?? null;

    if (emailMatch) {
      return {
        profile: emailMatch,
        matchedBy: "email"
      };
    }
  }

  return {
    profile: null,
    matchedBy: "none"
  };
}

export function deriveBasicGardenViewModel(profile: BasicGardenProfileRow | null | undefined) {
  const stats = resolveBasicGardenStats(profile);

  return {
    ...stats,
    visual: getBasicGardenVisualModel(stats.cumulativeCheckIns)
  };
}
