export type MorningGateDoor = "affirmation" | "energy" | "vision";
export type MorningGateLanguage = "jp" | "kr" | "en";

const MORNING_GATE_RATE: Record<MorningGateLanguage, Record<MorningGateDoor, number>> = {
  jp: { affirmation: 0.66, energy: 0.68, vision: 0.63 },
  kr: { affirmation: 0.7, energy: 0.72, vision: 0.66 },
  en: { affirmation: 0.71, energy: 0.73, vision: 0.67 }
};

export function getStructuredMorningSpeechSettings(
  language: MorningGateLanguage,
  door: MorningGateDoor
) {
  if (language === "kr") {
    return {
      lang: "ko-KR",
      rate: MORNING_GATE_RATE.kr[door],
      pitch: 0.9,
      volume: 0.9,
      preferredNames: ["InJoon", "MinJoon", "Yuna", "Sora", "Google 한국어", "Siri"] as const
    };
  }

  if (language === "en") {
    return {
      lang: "en-US",
      rate: MORNING_GATE_RATE.en[door],
      pitch: 0.93,
      volume: 0.9,
      preferredNames: ["Daniel", "Alex", "Samantha", "Ava", "Victoria", "Google US English", "Siri"] as const
    };
  }

  return {
    lang: "ja-JP",
    rate: MORNING_GATE_RATE.jp[door],
    pitch: 0.87,
    volume: 0.9,
    preferredNames: ["Otoya", "Kyoko", "Google 日本語", "Siri"] as const
  };
}
