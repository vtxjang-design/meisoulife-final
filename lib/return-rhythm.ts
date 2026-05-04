export const RETURN_RHYTHM_STORAGE_KEY = "meisoulife-return-rhythm";

type ReturnRhythmState = {
  lastVisitDate: string | null;
  streakCount: number;
  lineConnectedAt: string | null;
};

export type ReturnRhythmSnapshot = ReturnRhythmState & {
  isReturningToday: boolean;
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

function readState(): ReturnRhythmState {
  if (typeof window === "undefined") {
    return { lastVisitDate: null, streakCount: 0, lineConnectedAt: null };
  }

  const stored = window.localStorage.getItem(RETURN_RHYTHM_STORAGE_KEY);

  if (!stored) {
    return { lastVisitDate: null, streakCount: 0, lineConnectedAt: null };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<ReturnRhythmState>;
    return {
      lastVisitDate: typeof parsed.lastVisitDate === "string" ? parsed.lastVisitDate : null,
      streakCount: typeof parsed.streakCount === "number" ? parsed.streakCount : 0,
      lineConnectedAt: typeof parsed.lineConnectedAt === "string" ? parsed.lineConnectedAt : null
    };
  } catch (_error) {
    window.localStorage.removeItem(RETURN_RHYTHM_STORAGE_KEY);
    return { lastVisitDate: null, streakCount: 0, lineConnectedAt: null };
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
  const yesterday = getPreviousDateKey();

  if (current.lastVisitDate === today) {
    return {
      ...current,
      isReturningToday: false
    };
  }

  const nextStreak =
    current.lastVisitDate === yesterday ? Math.max(current.streakCount, 1) + 1 : 1;

  const nextState: ReturnRhythmState = {
    ...current,
    lastVisitDate: today,
    streakCount: nextStreak
  };

  writeState(nextState);

  return {
    ...nextState,
    isReturningToday: current.lastVisitDate === yesterday
  };
}

export function markLineRhythmConnected() {
  const current = readState();
  const nextState: ReturnRhythmState = {
    ...current,
    lineConnectedAt: new Date().toISOString()
  };

  writeState(nextState);

  return nextState;
}
