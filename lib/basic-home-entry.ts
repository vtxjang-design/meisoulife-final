import { getBasicGateForCurrentTime, type BasicGateKey } from "./basic-rhythm";

export type BasicGardenLanguage = "jp" | "kr" | "en";
export const BASIC_HOME_GATE_FALLBACK: BasicGateKey = "morning";
export const BASIC_HOME_SECTION_ORDER = ["garden", "recommendation", "course"] as const;
export const BASIC_GARDEN_VISIBLE_MARK_CAP = 8;
export const BASIC_GARDEN_MARK_SLOTS = [
  { x: 152, y: 158, radius: 7, anchorX: 146, anchorY: 165 },
  { x: 128, y: 144, radius: 6, anchorX: 122, anchorY: 151 },
  { x: 178, y: 138, radius: 6, anchorX: 171, anchorY: 145 },
  { x: 108, y: 122, radius: 5, anchorX: 116, anchorY: 130 },
  { x: 198, y: 118, radius: 5, anchorX: 187, anchorY: 127 },
  { x: 142, y: 104, radius: 5, anchorX: 141, anchorY: 113 },
  { x: 168, y: 96, radius: 4, anchorX: 163, anchorY: 104 },
  { x: 120, y: 86, radius: 4, anchorX: 126, anchorY: 95 }
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

export function getBasicGardenMeaningLine(language: BasicGardenLanguage) {
  if (language === "kr") {
    return "한 번의 회복이, 하나의 빛으로 가든에 남습니다.";
  }

  if (language === "en") {
    return "Each recovery remains in your Garden as a light.";
  }

  return "ひとつの回復が、ひとつの光として庭に残ります。";
}

export function getBasicGardenCountMessage(language: BasicGardenLanguage, checkInCount: number) {
  const count = Number.isFinite(checkInCount) ? Math.max(0, Math.floor(checkInCount)) : 0;

  if (language === "kr") {
    if (count === 0) {
      return "아직 이 가든에 남아 있는 회복은 없습니다.";
    }

    return `${count}번의 회복이 이 가든에 남아 있습니다.`;
  }

  if (language === "en") {
    if (count === 0) {
      return "No recorded recoveries remain in this Garden yet.";
    }

    if (count === 1) {
      return "1 recovery remains in this Garden.";
    }

    return `${count} recoveries remain in this Garden.`;
  }

  if (count === 0) {
    return "まだこの庭に残っている回復はありません。";
  }

  return `${count}回の回復が、この庭に残っています。`;
}
