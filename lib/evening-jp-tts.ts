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
    at: 12,
    key: "release-1",
    text: "今日も一日\nお疲れさまでした",
    speechText: "今日も一日、お疲れさまでした。",
    speechDelayMs: 980
  },
  {
    at: 30,
    key: "release-2",
    text: "ここからは\n何かを終わらせなくても\n大丈夫です",
    speechText: "ここからは、何かを終わらせなくても、大丈夫です。",
    speechDelayMs: 1040
  },
  {
    at: 52,
    key: "release-3",
    text: "今日あったことを\nひとつずつ片づけなくていい\nそんな時間です",
    speechText: "今日あったことを、ひとつずつ片づけなくていい。そんな時間です。",
    speechDelayMs: 1080
  },
  {
    at: 76,
    key: "release-4",
    text: "肩の力がゆるむのを\nただ\n感じてみます",
    speechText: "肩の力がゆるむのを、ただ、感じてみます。",
    speechDelayMs: 1100
  },
  {
    at: 98,
    key: "release-5",
    text: "呼吸は\nそのままで\n大丈夫です",
    speechText: "呼吸は、そのままで、大丈夫です。",
    speechDelayMs: 1120
  },
  {
    at: 120,
    key: "release-6",
    text: "今日終わらなかったことは\n明日に\n預けておきましょう",
    speechText: "今日、終わらなかったことは、明日に預けておきましょう。",
    speechDelayMs: 1140
  },
  {
    at: 144,
    key: "release-7",
    text: "今は\nただ静かに\nここにいます",
    speechText: "今は、ただ静かに、ここにいます。",
    speechDelayMs: 1160
  },
  {
    at: 162,
    key: "release-8",
    text: "今日の重さを\nここに\nそっと置いていきます",
    speechText: "今日の重さを、ここに、そっと置いていきます。",
    speechDelayMs: 1180
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
    speechText: "ちかすぎて、\n気づかなかった\nあたたかさが、\nあったのかもしれません。",
    speechDelayMs: 1020
  },
  { at: 60, key: "gratitude-4", text: "空気", speechText: "空気。", speechDelayMs: 1060 },
  { at: 68, key: "gratitude-5", text: "日差し", speechText: "ひざし。", speechDelayMs: 1060 },
  { at: 76, key: "gratitude-6", text: "風", speechText: "風。", speechDelayMs: 1060 },
  { at: 84, key: "gratitude-7", text: "自然の香り", speechText: "しぜんのかおり。", speechDelayMs: 1080 },
  {
    at: 100,
    key: "gratitude-8",
    text: "今日、\n当たり前すぎて\n見過ごしていたものは\nありませんでしたか",
    speechText: "きょう、\nあたりまえすぎて、\nみすごしていたものは\nありませんでしたか。",
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
  { at: 139, key: "gratitude-11", text: "友人", speechText: "ゆうじん。", speechDelayMs: 1080 },
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
    speechText: "今日も…\nたくさんの贈りものの中で、\n生きていました。",
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
    speechText: "呼吸は…\nそのままで、\n大丈夫です。",
    speechDelayMs: 1080
  },
  {
    at: 72,
    key: "sleep-2",
    text: "もう...\n何もしなくて\n大丈夫です",
    speechText: "もう…\nなにもしなくて\nだいじょうぶです。",
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
        rate: 0.77,
        pitch: 0.8,
        volume: 0.78,
        preferredNames: JAPANESE_EVENING_PREFERRED_NAMES
      };
    case "gratitude":
      return {
        lang: "ja-JP",
        rate: 0.75,
        pitch: 0.86,
        volume: 0.8,
        preferredNames: JAPANESE_EVENING_PREFERRED_NAMES
      };
    case "sleep":
      return {
        lang: "ja-JP",
        rate: 0.72,
        pitch: 0.77,
        volume: 0.76,
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
