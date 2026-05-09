export const TODAY_RHYTHM_CHECKIN_STORAGE_KEY = "meisoulife_today_rhythm_checkin";

export type TodayRhythmCheckIn = {
  date: string;
  moodKey: string;
  recommendationType: string;
};

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayRhythmCheckIn() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(TODAY_RHYTHM_CHECKIN_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<TodayRhythmCheckIn>;

    if (
      typeof parsed.date === "string" &&
      typeof parsed.moodKey === "string" &&
      typeof parsed.recommendationType === "string"
    ) {
      return parsed as TodayRhythmCheckIn;
    }
  } catch (_error) {
    window.localStorage.removeItem(TODAY_RHYTHM_CHECKIN_STORAGE_KEY);
  }

  return null;
}

export function setTodayRhythmCheckIn(next: Omit<TodayRhythmCheckIn, "date">) {
  if (typeof window === "undefined") {
    return null;
  }

  const payload: TodayRhythmCheckIn = {
    date: getLocalDateKey(),
    moodKey: next.moodKey,
    recommendationType: next.recommendationType
  };

  window.localStorage.setItem(TODAY_RHYTHM_CHECKIN_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function hasTodayRhythmCheckIn() {
  const stored = getTodayRhythmCheckIn();
  return stored?.date === getLocalDateKey();
}
