"use client";

export type RhythmChallengeState = {
  currentDay: number;
  completedDays: number[];
  lastCompletedDate: string | null;
};

const STORAGE_KEY = "meisoulife_rhythm_challenge_v1";

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function dayDiff(from: string, to: string) {
  const fromDate = toDate(from);
  const toDateValue = toDate(to);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((toDateValue.getTime() - fromDate.getTime()) / msPerDay);
}

function normalizeState(value: Partial<RhythmChallengeState> | null | undefined): RhythmChallengeState {
  const completedDays = Array.isArray(value?.completedDays)
    ? value!.completedDays.filter((day): day is number => Number.isInteger(day) && day >= 1 && day <= 7)
    : [];

  return {
    currentDay:
      typeof value?.currentDay === "number" && Number.isInteger(value.currentDay) && value.currentDay >= 1 && value.currentDay <= 7
        ? value.currentDay
        : 1,
    completedDays: Array.from(new Set(completedDays)).sort((a, b) => a - b),
    lastCompletedDate: typeof value?.lastCompletedDate === "string" ? value.lastCompletedDate : null
  };
}

export function getRhythmChallengeState() {
  if (typeof window === "undefined") {
    return normalizeState(null);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return normalizeState(null);
  }

  try {
    return normalizeState(JSON.parse(raw) as Partial<RhythmChallengeState>);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return normalizeState(null);
  }
}

export function saveRhythmChallengeState(state: RhythmChallengeState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function syncRhythmChallengeState() {
  const state = getRhythmChallengeState();
  const today = getTodayKey();

  if (
    state.lastCompletedDate &&
    state.completedDays.includes(state.currentDay) &&
    state.currentDay < 7 &&
    dayDiff(state.lastCompletedDate, today) >= 1
  ) {
    const nextState = {
      ...state,
      currentDay: state.currentDay + 1
    };

    saveRhythmChallengeState(nextState);
    return nextState;
  }

  return state;
}

export function completeRhythmChallengeDay(day: number) {
  const state = getRhythmChallengeState();
  const nextState: RhythmChallengeState = {
    ...state,
    completedDays: state.completedDays.includes(day) ? state.completedDays : [...state.completedDays, day].sort((a, b) => a - b),
    lastCompletedDate: getTodayKey()
  };

  saveRhythmChallengeState(nextState);
  return nextState;
}
