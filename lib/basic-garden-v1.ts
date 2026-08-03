import { getBasicGardenVisualModel } from "./basic-home-entry";

export const BASIC_GARDEN_GROWTH_MOMENT_KEY = "meisoulife_basic_garden_growth_moment";

export type BasicGardenGrowthMoment = {
  activityDate: string;
  checkInCount: number;
};

export function resolveTodayGardenState(distinctGateCount: number | null | undefined) {
  const completedGateCount = Number.isFinite(distinctGateCount)
    ? Math.min(3, Math.max(0, Math.floor(distinctGateCount as number)))
    : 0;

  return {
    completedGateCount,
    isComplete: completedGateCount === 3
  };
}

export function getNextBasicGardenChange(checkInCount: number) {
  const current = getBasicGardenVisualModel(checkInCount);
  const distantFuture = getBasicGardenVisualModel(current.recordedCheckIns + 1000);

  if (current.milestoneStage === distantFuture.milestoneStage) {
    return null;
  }

  let nextCount = current.recordedCheckIns + 1;

  while (getBasicGardenVisualModel(nextCount).milestoneStage === current.milestoneStage) {
    nextCount += 1;
  }

  return {
    checkInCount: nextCount,
    remainingCount: nextCount - current.recordedCheckIns,
    milestoneStage: getBasicGardenVisualModel(nextCount).milestoneStage
  };
}

export function readBasicGardenGrowthMoment(value: string | null): BasicGardenGrowthMoment | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<BasicGardenGrowthMoment>;

    if (
      typeof parsed.activityDate !== "string" ||
      !Number.isFinite(parsed.checkInCount) ||
      (parsed.checkInCount as number) < 1
    ) {
      return null;
    }

    return {
      activityDate: parsed.activityDate,
      checkInCount: Math.floor(parsed.checkInCount as number)
    };
  } catch {
    return null;
  }
}
