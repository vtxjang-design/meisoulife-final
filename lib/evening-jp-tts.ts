export type EveningGateKind = "release" | "gratitude" | "sleep";

export type JapaneseEveningNarrationLine = {
  at: number;
  key: string;
  text: string;
  speechText?: string;
  speechDelayMs?: number;
};

export type SpeechSynthesisVoiceLike = Pick<
  SpeechSynthesisVoice,
  "name" | "lang" | "localService" | "default"
>;

export type JapaneseEveningSpeechSettings = {
  lang: "ja-JP";
  rate: number;
  pitch: number;
  volume: number;
  preferredNames: readonly string[];
};

const WARMER_JAPANESE_PREFERRED_NAMES = [
  "Otoya",
  "Sakura",
  "Google 日本語",
  "Siri"
] as const;

export const JAPANESE_EVENING_PREFERRED_NAMES = [
  ...WARMER_JAPANESE_PREFERRED_NAMES,
  "Kyoko"
] as const;

export const JAPANESE_RELEASE_GATE_NARRATION: JapaneseEveningNarrationLine[] = [
  {
    at: 10,
    key: "release-1",
    text: "今日も…\nお疲れさまでした",
    speechText: "今日も…\nお疲れさまでした。",
    speechDelayMs: 880
  },
  {
    at: 24,
    key: "release-2",
    text: "今は、\n少し休んでも\n大丈夫です",
    speechText: "いまは、\n少し休んでも\n大丈夫です。",
    speechDelayMs: 920
  },
  {
    at: 40,
    key: "release-3",
    text: "今日という 一日は、\nいろいろな時間が\nあったことでしょう",
    speechText: "きょうという いちにちは、\nいろいろな時間が\nあったことでしょう。",
    speechDelayMs: 940
  },
  {
    at: 58,
    key: "release-4",
    text: "今は、\nそのすべてを\nそっと置いてみましょう",
    speechText: "いまは、\nそのすべてを、\nそっと置いてみましょう。",
    speechDelayMs: 960
  },
  {
    at: 74,
    key: "release-5",
    text: "体の力を、\n少しゆるめます",
    speechText: "体の力を、\n少しゆるめます。",
    speechDelayMs: 940
  },
  {
    at: 98,
    key: "release-6",
    text: "心も、\n静かに休ませます",
    speechText: "心も、\n静かに休ませます。",
    speechDelayMs: 1000
  },
  {
    at: 122,
    key: "release-7",
    text: "今日終わらなかったことは、\n明日のあなたに\n任せても大丈夫です",
    speechText: "きょう終わらなかったことは、\n明日のあなたに、\n任せても大丈夫です。",
    speechDelayMs: 1020
  },
  {
    at: 136,
    key: "release-8",
    text: "何も\n頑張らなくて\n大丈夫です",
    speechText: "何も、\n頑張らなくて\n大丈夫です。",
    speechDelayMs: 1020
  },
  {
    at: 148,
    key: "release-9",
    text: "ただ、\nここに\n静かにいてみましょう",
    speechText: "ただ、\nここに、\n静かにいてみましょう。",
    speechDelayMs: 1080
  },
  {
    at: 155,
    key: "release-10",
    text: "今日も…\n十分でした",
    speechText: "今日も…\n十分でした。",
    speechDelayMs: 1120
  },
  {
    at: 170,
    key: "release-11",
    text: "今日の重さを…\nゆっくり下ろします",
    speechText: "今日の重さを…\nゆっくり下ろします。",
    speechDelayMs: 1120
  }
];

export const JAPANESE_GRATITUDE_GATE_NARRATION: JapaneseEveningNarrationLine[] = [
  {
    at: 12,
    key: "gratitude-1",
    text: "今日も...\nありがとうございます",
    speechText: "今日も…\nありがとうございます。",
    speechDelayMs: 980
  },
  {
    at: 26,
    key: "gratitude-2",
    text: "今日は、\n少しだけ\n一日を\n思い返してみます",
    speechText: "きょうは、\n少しだけ、\nいちにちを\n思い返してみます。",
    speechDelayMs: 980
  },
  {
    at: 44,
    key: "gratitude-3",
    text: "近すぎて、\n気づかなかった\nあたたかさが\nあったかもしれません",
    speechText: "近すぎて、\n気づかなかった\nあたたかさが、\nあったかもしれません。",
    speechDelayMs: 1020
  },
  { at: 60, key: "gratitude-4", text: "空気", speechText: "空気。", speechDelayMs: 1060 },
  { at: 68, key: "gratitude-5", text: "陽ざし", speechText: "陽ざし。", speechDelayMs: 1060 },
  { at: 76, key: "gratitude-6", text: "風", speechText: "風。", speechDelayMs: 1060 },
  { at: 84, key: "gratitude-7", text: "自然の香り", speechText: "自然の香り。", speechDelayMs: 1080 },
  {
    at: 100,
    key: "gratitude-8",
    text: "今日、\n当たり前すぎて\n見過ごしていたものは\nありませんでしたか",
    speechText: "きょう、\n当たり前すぎて、\n見過ごしていたものは\nありませんでしたか。",
    speechDelayMs: 1040
  },
  {
    at: 118,
    key: "gratitude-9",
    text: "いつも\nそばにいてくれた\n大切な人たち",
    speechText: "いつも、\nそばにいてくれた\n大切な人たち。",
    speechDelayMs: 1040
  },
  { at: 132, key: "gratitude-10", text: "家族", speechText: "家族。", speechDelayMs: 1080 },
  { at: 139, key: "gratitude-11", text: "友人", speechText: "友人。", speechDelayMs: 1080 },
  { at: 146, key: "gratitude-12", text: "仲間", speechText: "仲間。", speechDelayMs: 1080 },
  {
    at: 156,
    key: "gratitude-13",
    text: "今日も\n頑張ってくれた\n自分自身",
    speechText: "きょうも、\n頑張ってくれた\n自分自身。",
    speechDelayMs: 1180
  },
  {
    at: 170,
    key: "gratitude-14",
    text: "今日も...\nたくさんの贈りものの中で\n生きていました",
    speechText: "今日も…\nたくさんの贈りものの中で\n生きていました。",
    speechDelayMs: 1080
  },
  {
    at: 184,
    key: "gratitude-15",
    text: "その温もりを\n静かに\n心にしまいます",
    speechText: "その温もりを、\n静かに、\n心にしまいます。",
    speechDelayMs: 1120
  },
  {
    at: 200,
    key: "gratitude-16",
    text: "今日も...\nありがとうございます",
    speechText: "今日も…\nありがとうございます。",
    speechDelayMs: 1120
  }
];

export const JAPANESE_SLEEP_GATE_NARRATION: JapaneseEveningNarrationLine[] = [
  {
    at: 15,
    key: "sleep-1",
    text: "今日も...\nお疲れさまでした",
    speechText: "今日も…\nお疲れさまでした。",
    speechDelayMs: 1040
  },
  {
    at: 50,
    key: "sleep-3",
    text: "呼吸は...\nそのままで\n大丈夫です",
    speechText: "呼吸は…\nそのままで\n大丈夫です。",
    speechDelayMs: 1080
  },
  {
    at: 72,
    key: "sleep-2",
    text: "もう...\n何もしなくて\n大丈夫です",
    speechText: "もう…\n何もしなくて\n大丈夫です。",
    speechDelayMs: 1100
  }
];

export function isJapaneseSpeechLocale(locale: string | null | undefined) {
  if (!locale) {
    return false;
  }

  const normalizedLocale = locale.trim().toLowerCase();
  return normalizedLocale === "ja" || normalizedLocale.startsWith("ja-");
}

function scoreJapaneseEveningVoice(voice: SpeechSynthesisVoiceLike) {
  const normalizedName = voice.name.trim().toLowerCase();
  let score = 0;

  if (voice.lang.toLowerCase() === "ja-jp") {
    score += 50;
  } else if (isJapaneseSpeechLocale(voice.lang)) {
    score += 35;
  }

  if (normalizedName.includes("otoya")) {
    score += 120;
  } else if (normalizedName.includes("sakura")) {
    score += 105;
  } else if (normalizedName.includes("google 日本語".toLowerCase())) {
    score += 95;
  } else if (normalizedName.includes("siri")) {
    score += 90;
  } else if (normalizedName.includes("kyoko")) {
    score += 10;
  } else {
    score += 55;
  }

  if (voice.localService) {
    score += 12;
  }

  if (voice.default) {
    score += 4;
  }

  if (normalizedName.includes("kyoko")) {
    score -= 40;
  }

  return score;
}

export function pickJapaneseEveningVoice<T extends SpeechSynthesisVoiceLike>(voices: readonly T[]) {
  const japaneseVoices = voices.filter((voice) => isJapaneseSpeechLocale(voice.lang));

  if (japaneseVoices.length === 0) {
    return undefined;
  }

  return [...japaneseVoices].sort((left, right) => scoreJapaneseEveningVoice(right) - scoreJapaneseEveningVoice(left))[0];
}

export function getJapaneseEveningSpeechSettings(gate: EveningGateKind): JapaneseEveningSpeechSettings {
  switch (gate) {
    case "release":
      return {
        lang: "ja-JP",
        rate: 0.8,
        pitch: 0.88,
        volume: 0.84,
        preferredNames: JAPANESE_EVENING_PREFERRED_NAMES
      };
    case "gratitude":
      return {
        lang: "ja-JP",
        rate: 0.8,
        pitch: 0.9,
        volume: 0.82,
        preferredNames: JAPANESE_EVENING_PREFERRED_NAMES
      };
    case "sleep":
      return {
        lang: "ja-JP",
        rate: 0.76,
        pitch: 0.84,
        volume: 0.78,
        preferredNames: JAPANESE_EVENING_PREFERRED_NAMES
      };
  }
}

export function createJapaneseEveningVoiceSession<T extends SpeechSynthesisVoiceLike>() {
  let locked = false;
  let selectedVoice: T | null | undefined;

  return {
    prime(voices: readonly T[]) {
      if (locked || voices.length === 0) {
        return selectedVoice ?? undefined;
      }

      selectedVoice = pickJapaneseEveningVoice(voices) ?? null;
      return selectedVoice ?? undefined;
    },
    lock(voices: readonly T[]) {
      if (!locked) {
        if (voices.length > 0) {
          selectedVoice = pickJapaneseEveningVoice(voices) ?? null;
        } else if (selectedVoice === undefined) {
          selectedVoice = null;
        }
        locked = true;
      }

      return selectedVoice ?? undefined;
    },
    getVoice() {
      return selectedVoice ?? undefined;
    },
    isLocked() {
      return locked;
    },
    reset() {
      locked = false;
      selectedVoice = undefined;
    }
  };
}
