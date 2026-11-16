export type MorningGateKey = "awakening" | "energy" | "vision";
export type MorningGateLanguage = "jp" | "kr" | "en";

export type MorningGateCaptionLine = {
  at: number;
  key: string;
  text: string;
};

const MORNING_GATE_MASTER_SOURCES: Record<
  MorningGateKey,
  Record<MorningGateLanguage, string>
> = {
  awakening: {
    jp: "/audio/morning-gate/awakening-jp.m4a",
    kr: "/audio/morning-gate/awakening-kr.m4a",
    en: "/audio/morning-gate/awakening-en.m4a"
  },
  energy: {
    jp: "/audio/morning-gate/energy-jp.m4a",
    kr: "/audio/morning-gate/energy-kr.m4a",
    en: "/audio/morning-gate/energy-en.m4a"
  },
  vision: {
    jp: "/audio/morning-gate/vision-jp.m4a",
    kr: "/audio/morning-gate/vision-kr.m4a",
    en: "/audio/morning-gate/vision-en.m4a"
  }
};

export function resolveMorningGateMasterSource(
  gate: MorningGateKey,
  language: MorningGateLanguage
) {
  return MORNING_GATE_MASTER_SOURCES[gate][language];
}

export function resolveMorningGateCaption(
  lines: readonly MorningGateCaptionLine[],
  currentTime: number
) {
  let active: MorningGateCaptionLine | null = null;

  for (const line of lines) {
    if (line.at > currentTime) {
      break;
    }

    active = line;
  }

  return active;
}

export function getMorningGateRemainingSeconds(currentTime: number, duration = 180) {
  return Math.max(0, duration - Math.min(Math.max(currentTime, 0), duration));
}

export function formatMorningGateRemainingTime(currentTime: number, duration = 180) {
  const remainingSeconds = Math.floor(getMorningGateRemainingSeconds(currentTime, duration));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
