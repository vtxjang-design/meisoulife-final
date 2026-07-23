import { getBasicGateForCurrentTime, type BasicGateKey } from "./basic-rhythm";

export const BASIC_HOME_GATE_FALLBACK: BasicGateKey = "morning";
export const BASIC_HOME_SECTION_ORDER = ["garden", "recommendation", "course"] as const;
export const BASIC_GARDEN_VISIBLE_MARK_CAP = 8;
export const BASIC_GARDEN_MARK_SLOTS = [
  { x: 152, y: 158, radius: 7, color: "teal" },
  { x: 128, y: 144, radius: 6, color: "gold" },
  { x: 178, y: 138, radius: 6, color: "teal" },
  { x: 108, y: 122, radius: 5, color: "gold" },
  { x: 198, y: 118, radius: 5, color: "teal" },
  { x: 142, y: 104, radius: 5, color: "teal" },
  { x: 168, y: 96, radius: 4, color: "gold" },
  { x: 120, y: 86, radius: 4, color: "teal" }
] as const;

export function mapRhythmParamToBasicGateKey(value: string | null | undefined): BasicGateKey | null {
  if (value === "morning") {
    return "morning";
  }

  if (value === "day" || value === "daytime") {
    return "daytime";
  }

  if (value === "night" || value === "evening") {
    return "evening";
  }

  return null;
}

export function mapDefaultRhythmToBasicGateKey(defaultRhythm?: "morning" | "day" | "night"): BasicGateKey | null {
  if (defaultRhythm === "morning") {
    return "morning";
  }

  if (defaultRhythm === "day") {
    return "daytime";
  }

  if (defaultRhythm === "night") {
    return "evening";
  }

  return null;
}

export function getBasicGateShortcutHref(gate: BasicGateKey) {
  return `/program/basic?rhythm=${gate}#gate-${gate}`;
}

export function getAlternativeBasicGateKeys(recommendedGate: BasicGateKey) {
  return (["morning", "daytime", "evening"] as const).filter((gate) => gate !== recommendedGate);
}

export function resolveBasicHomeRecommendedGate(input: {
  highlightedRhythm?: string | null;
  defaultRhythm?: "morning" | "day" | "night";
  localTimeGate?: BasicGateKey | null;
}) {
  const highlightedGate = mapRhythmParamToBasicGateKey(input.highlightedRhythm);

  if (highlightedGate) {
    return {
      gate: highlightedGate,
      source: "query" as const,
      usedFallback: false
    };
  }

  const defaultGate = mapDefaultRhythmToBasicGateKey(input.defaultRhythm);

  if (defaultGate) {
    return {
      gate: defaultGate,
      source: "default-rhythm" as const,
      usedFallback: false
    };
  }

  if (input.localTimeGate) {
    return {
      gate: input.localTimeGate,
      source: "local-time" as const,
      usedFallback: false
    };
  }

  return {
    gate: BASIC_HOME_GATE_FALLBACK,
    source: "fallback" as const,
    usedFallback: true
  };
}

export function getBasicHomeRecommendedGateForDate(date = new Date()) {
  return getBasicGateForCurrentTime(date);
}

export function getBasicGardenVisualModel(checkInCount: number) {
  const recordedCheckIns = Number.isFinite(checkInCount) ? Math.max(0, Math.floor(checkInCount)) : 0;
  const visibleMarkCount = Math.min(recordedCheckIns, BASIC_GARDEN_VISIBLE_MARK_CAP);

  return {
    recordedCheckIns,
    visibleMarkCount,
    hasRecordedRecovery: recordedCheckIns > 0,
    marks: BASIC_GARDEN_MARK_SLOTS.slice(0, visibleMarkCount)
  };
}
