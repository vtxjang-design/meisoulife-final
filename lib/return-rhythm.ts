export const RETURN_RHYTHM_STORAGE_KEY = "meisoulife-return-rhythm";
export const RETURN_RHYTHM_EVENT = "meisoulife:return-rhythm-updated";

type ReturnRhythmState = {
  lastVisitDate: string | null;
  lastCompletedDate: string | null;
  streakCount: number;
  lineConnectedAt: string | null;
};

export type ReturnRhythmSnapshot = ReturnRhythmState & {
  isReturningToday: boolean;
  isCompletedToday: boolean;
  inactiveDays: number;
  timeAnchor: "morning" | "daytime" | "night";
};

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPreviousDateKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getLocalDateKey(date);
}

function getDateDifference(from: string | null, to: string) {
  if (!from) {
    return 0;
  }

  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  const difference = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

  return Math.max(difference, 0);
}

function getTimeAnchor(date = new Date()): "morning" | "daytime" | "night" {
  const hour = date.getHours();

  if (hour < 11) {
    return "morning";
  }

  if (hour < 18) {
    return "daytime";
  }

  return "night";
}

function dispatchRhythmUpdate(snapshot: ReturnRhythmSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(RETURN_RHYTHM_EVENT, { detail: snapshot }));
}

function createSnapshot(state: ReturnRhythmState, today: string, isReturningToday: boolean, inactiveDays: number): ReturnRhythmSnapshot {
  return {
    ...state,
    isReturningToday,
    isCompletedToday: state.lastCompletedDate === today,
    inactiveDays,
    timeAnchor: getTimeAnchor()
  };
}

export function getReturnRhythmSnapshot(): ReturnRhythmSnapshot {
  const current = readState();
  const today = getLocalDateKey();
  const inactiveDays = Math.max(getDateDifference(current.lastVisitDate, today) - 1, 0);

  return createSnapshot(current, today, false, inactiveDays);
}

function readState(): ReturnRhythmState {
  if (typeof window === "undefined") {
    return { lastVisitDate: null, lastCompletedDate: null, streakCount: 0, lineConnectedAt: null };
  }

  const stored = window.localStorage.getItem(RETURN_RHYTHM_STORAGE_KEY);

  if (!stored) {
    return { lastVisitDate: null, lastCompletedDate: null, streakCount: 0, lineConnectedAt: null };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<ReturnRhythmState>;
    return {
      lastVisitDate: typeof parsed.lastVisitDate === "string" ? parsed.lastVisitDate : null,
      lastCompletedDate: typeof parsed.lastCompletedDate === "string" ? parsed.lastCompletedDate : null,
      streakCount: typeof parsed.streakCount === "number" ? parsed.streakCount : 0,
      lineConnectedAt: typeof parsed.lineConnectedAt === "string" ? parsed.lineConnectedAt : null
    };
  } catch (_error) {
    window.localStorage.removeItem(RETURN_RHYTHM_STORAGE_KEY);
    return { lastVisitDate: null, lastCompletedDate: null, streakCount: 0, lineConnectedAt: null };
  }
}

function writeState(state: ReturnRhythmState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RETURN_RHYTHM_STORAGE_KEY, JSON.stringify(state));
}

export function updateReturnRhythmVisit(): ReturnRhythmSnapshot {
  const current = readState();
  const today = getLocalDateKey();
  const inactiveDays = Math.max(getDateDifference(current.lastVisitDate, today) - 1, 0);

  if (current.lastVisitDate === today) {
    const snapshot = createSnapshot(current, today, false, 0);
    dispatchRhythmUpdate(snapshot);
    return snapshot;
  }

  const nextState: ReturnRhythmState = {
    ...current,
    lastVisitDate: today
  };

  writeState(nextState);

  const snapshot = createSnapshot(nextState, today, inactiveDays === 0 && current.lastVisitDate !== null, inactiveDays);
  dispatchRhythmUpdate(snapshot);

  return snapshot;
}

export function markDailyRhythmCompleted(): ReturnRhythmSnapshot {
  const current = readState();
  const today = getLocalDateKey();
  const yesterday = getPreviousDateKey();

  if (current.lastCompletedDate === today) {
    const snapshot = createSnapshot(current, today, current.lastVisitDate === yesterday, Math.max(getDateDifference(current.lastVisitDate, today) - 1, 0));
    dispatchRhythmUpdate(snapshot);
    return snapshot;
  }

  const nextStreak = current.lastCompletedDate === yesterday ? Math.max(current.streakCount, 1) + 1 : 1;

  const nextState: ReturnRhythmState = {
    ...current,
    lastVisitDate: today,
    lastCompletedDate: today,
    streakCount: nextStreak
  };

  writeState(nextState);

  const snapshot = createSnapshot(nextState, today, current.lastVisitDate === yesterday, 0);
  dispatchRhythmUpdate(snapshot);

  return snapshot;
}

export function markLineRhythmConnected() {
  const current = readState();
  const nextState: ReturnRhythmState = {
    ...current,
    lineConnectedAt: new Date().toISOString()
  };

  writeState(nextState);
  const today = getLocalDateKey();
  const snapshot = createSnapshot(nextState, today, false, Math.max(getDateDifference(nextState.lastVisitDate, today) - 1, 0));
  dispatchRhythmUpdate(snapshot);
  return nextState;
}
