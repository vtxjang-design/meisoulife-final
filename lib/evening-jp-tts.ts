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
    speechText: "きょうも…\nお疲れさまでした。",
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
    speechText: "きょうという、\nいちにちは\nいろいろな時間が\nあったことでしょう。",
    speechDelayMs: 940
  },
  {
    at: 58,
    key: "release-4",
    text: "今は、\nそのすべてを\nそっと置いてみましょう",
    speechText: "いまは、\nそのすべてを\nそっと置いてみましょう。",
    speechDelayMs: 960
  },
  {
    at: 74,
    key: "release-5",
    text: "体の力を、\n少しゆるめます",
    speechText: "体の力を\n少しゆるめます。",
    speechDelayMs: 940
  },
  {
    at: 98,
    key: "release-6",
    text: "心も、\n静かに休ませます",
    speechText: "心も\n静かに休ませます。",
    speechDelayMs: 1000
  },
  {
    at: 122,
    key: "release-7",
    text: "今日終わらなかったことは、\n明日のあなたに\n任せても大丈夫です",
    speechText: "きょう終わらなかったことは、\nあしたのあなたに\n任せても大丈夫です。",
    speechDelayMs: 1020
  },
  {
    at: 134,
    key: "release-8",
    text: "何も\n頑張らなくて\n大丈夫です",
    speechText: "なにも\nがんばらなくて\nだいじょうぶです。",
    speechDelayMs: 1020
  },
  {
    at: 145,
    key: "release-9",
    text: "ただ、\nここに\n静かにいてみましょう",
    speechText: "ただ、\nここに\n静かにいてみましょう。",
    speechDelayMs: 1080
  },
  {
    at: 153,
    key: "release-10",
    text: "今日も…\n十分でした",
    speechText: "きょうも…\n十分でした。",
    speechDelayMs: 1120
  },
  {
    at: 162,
    key: "release-11",
    text: "今日の重さを…\nゆっくり下ろします",
    speechText: "きょうの重さを…\nゆっくり下ろします。",
    speechDelayMs: 1120
  }
];

export const JAPANESE_GRATITUDE_GATE_NARRATION: JapaneseEveningNarrationLine[] = [
  {
    at: 12,
    key: "gratitude-1",
    text: "今日も、\nここまでよく歩いてきました",
    speechText: "きょうも、\nここまで、よく歩いてきました。",
    speechDelayMs: 980
  },
  {
    at: 28,
    key: "gratitude-2",
    text: "少しだけ、\n今日を振り返ってみましょう",
    speechText: "すこしだけ、\nきょうを振り返ってみましょう。",
    speechDelayMs: 980
  },
  {
    at: 45,
    key: "gratitude-3",
    text: "うれしかった時も、\n心が重かった時も、\nすべて今日の一部でした",
    speechText: "うれしかったときも、\n心が重かったときも、\nすべて、きょうの一部でした。",
    speechDelayMs: 1020
  },
  {
    at: 64,
    key: "gratitude-4",
    text: "その一日の中で、\n自分を支えてくれた\n小さなぬくもりを\nひとつ思い出してみます",
    speechText: "そのいちにちのなかで、\n自分を支えてくれた、\n小さなぬくもりを、\nひとつ思い出してみます。",
    speechDelayMs: 1060
  },
  {
    at: 84,
    key: "gratitude-5",
    text: "そばにいてくれた人、\nふと触れた優しさ、\nひとすじの日差しでも\nかまいません",
    speechText: "そばにいてくれた人。\nふと触れた優しさ。\nひとすじの日差しでも、\nかまいません。",
    speechDelayMs: 1080
  },
  {
    at: 105,
    key: "gratitude-6",
    text: "何も浮かばないなら、\n今ここで息をしている自分、\nそれだけで十分です",
    speechText: "なにも浮かばないなら、\nいまここで、息をしている自分。\nそれだけで、十分です。",
    speechDelayMs: 1100
  },
  {
    at: 121,
    key: "gratitude-7",
    text: "今日を生きた自分に、\nそっと声をかけてみます",
    speechText: "きょうを生きた自分に、\nそっと、声をかけてみます。",
    speechDelayMs: 1120
  },
  {
    at: 135,
    key: "gratitude-8",
    text: "よく頑張ったね。\n本当にありがとう。\n完璧でなくても、\n今日のあなたは十分でした",
    speechText: "よく頑張ったね。\n本当に、ありがとう。\n完璧でなくても、\nきょうのあなたは、十分でした。",
    speechDelayMs: 1140
  },
  {
    at: 154,
    key: "gratitude-9",
    text: "そのぬくもりを心に抱き、\n今日を静かに手放します。\n今日も、ありがとう。\n今夜は、ゆっくり休みましょう",
    speechText: "そのぬくもりを、心に抱き、\nきょうを静かに、手放します。\nきょうも、ありがとう。\n今夜は、ゆっくり休みましょう。",
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
        rate: 0.74,
        pitch: 0.84,
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
        rate: 0.7,
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
