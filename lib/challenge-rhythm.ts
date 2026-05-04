export const CHALLENGE_RHYTHM_STORAGE_KEY = "meisoulife-challenge-rhythm";
export const CHALLENGE_RHYTHM_EVENT = "meisoulife:challenge-rhythm-updated";

export type ChallengeRhythmProgress = {
  currentDay: number;
  completedDays: number[];
};

const DEFAULT_PROGRESS: ChallengeRhythmProgress = {
  currentDay: 1,
  completedDays: []
};

function normalizeDay(day: number) {
  return Math.min(Math.max(day, 1), 7);
}

function dispatchRhythmUpdate(progress: ChallengeRhythmProgress) {
  window.dispatchEvent(new CustomEvent(CHALLENGE_RHYTHM_EVENT, { detail: progress }));
}

export function getChallengeRhythmProgress(): ChallengeRhythmProgress {
  if (typeof window === "undefined") {
    return DEFAULT_PROGRESS;
  }

  const stored = window.localStorage.getItem(CHALLENGE_RHYTHM_STORAGE_KEY);

  if (!stored) {
    return DEFAULT_PROGRESS;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<ChallengeRhythmProgress>;
    const completedDays = Array.isArray(parsed.completedDays)
      ? parsed.completedDays
          .filter((day): day is number => Number.isInteger(day) && day >= 1 && day <= 7)
          .sort((a, b) => a - b)
      : [];
    const currentDay = normalizeDay(
      typeof parsed.currentDay === "number"
        ? parsed.currentDay
        : Math.min(completedDays.length + 1, 7)
    );

    return {
      currentDay,
      completedDays
    };
  } catch (_error) {
    window.localStorage.removeItem(CHALLENGE_RHYTHM_STORAGE_KEY);
    return DEFAULT_PROGRESS;
  }
}

export function saveChallengeRhythmProgress(progress: ChallengeRhythmProgress) {
  if (typeof window === "undefined") {
    return progress;
  }

  const normalized: ChallengeRhythmProgress = {
    currentDay: normalizeDay(progress.currentDay),
    completedDays: [...new Set(progress.completedDays.map(normalizeDay))].sort((a, b) => a - b)
  };

  window.localStorage.setItem(CHALLENGE_RHYTHM_STORAGE_KEY, JSON.stringify(normalized));
  dispatchRhythmUpdate(normalized);
  return normalized;
}

export function markChallengeDayCompleted(day: number) {
  const progress = getChallengeRhythmProgress();
  const targetDay = normalizeDay(day);
  const completedDays = progress.completedDays.includes(targetDay)
    ? progress.completedDays
    : [...progress.completedDays, targetDay].sort((a, b) => a - b);
  const currentDay = completedDays.length >= 7 ? 7 : Math.min(targetDay + 1, 7);

  return saveChallengeRhythmProgress({ currentDay, completedDays });
}

export function resetChallengeRhythmProgress() {
  if (typeof window === "undefined") {
    return DEFAULT_PROGRESS;
  }

  window.localStorage.removeItem(CHALLENGE_RHYTHM_STORAGE_KEY);
  dispatchRhythmUpdate(DEFAULT_PROGRESS);
  return DEFAULT_PROGRESS;
}
