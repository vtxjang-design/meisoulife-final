import assert from "node:assert/strict";
import test from "node:test";
import {
  createJapaneseEveningVoiceSession,
  getJapaneseEveningSpeechSettings,
  isJapaneseSpeechLocale,
  JAPANESE_EVENING_PREFERRED_NAMES,
  JAPANESE_RELEASE_GATE_NARRATION,
  JAPANESE_GRATITUDE_GATE_NARRATION,
  JAPANESE_SLEEP_GATE_NARRATION,
  pickJapaneseEveningVoice,
  type SpeechSynthesisVoiceLike
} from "./evening-jp-tts.ts";

function createVoice(overrides: Partial<SpeechSynthesisVoiceLike> = {}): SpeechSynthesisVoiceLike {
  return {
    name: "Browser Default Japanese",
    lang: "ja-JP",
    localService: false,
    default: false,
    ...overrides
  };
}

function roundToHundredths(value: number) {
  return Math.round(value * 100) / 100;
}

test("isJapaneseSpeechLocale accepts verified Japanese locales only", () => {
  assert.equal(isJapaneseSpeechLocale("ja-JP"), true);
  assert.equal(isJapaneseSpeechLocale("ja"), true);
  assert.equal(isJapaneseSpeechLocale("JA-jp"), true);
  assert.equal(isJapaneseSpeechLocale("en-US"), false);
  assert.equal(isJapaneseSpeechLocale("ko-KR"), false);
  assert.equal(isJapaneseSpeechLocale(undefined), false);
});

test("pickJapaneseEveningVoice prefers a warmer/lower Japanese candidate over Kyoko", () => {
  const selected = pickJapaneseEveningVoice([
    createVoice({ name: "Kyoko", localService: true }),
    createVoice({ name: "Otoya", localService: true }),
    createVoice({ name: "Google 日本語" })
  ]);

  assert.equal(selected?.name, "Otoya");
});

test("pickJapaneseEveningVoice falls back to another native Japanese voice when preferred names are absent", () => {
  const selected = pickJapaneseEveningVoice([
    createVoice({ name: "Generic Japanese Voice", lang: "ja-JP", localService: true }),
    createVoice({ name: "English Voice", lang: "en-US" })
  ]);

  assert.equal(selected?.name, "Generic Japanese Voice");
});

test("pickJapaneseEveningVoice returns undefined when no Japanese voice exists", () => {
  const selected = pickJapaneseEveningVoice([
    createVoice({ name: "English Voice", lang: "en-US" }),
    createVoice({ name: "Korean Voice", lang: "ko-KR" })
  ]);

  assert.equal(selected, undefined);
});

test("createJapaneseEveningVoiceSession handles async voice availability before lock", () => {
  const session = createJapaneseEveningVoiceSession<SpeechSynthesisVoiceLike>();

  assert.equal(session.prime([]), undefined);
  assert.equal(session.getVoice(), undefined);

  const selected = session.prime([
    createVoice({ name: "Kyoko" }),
    createVoice({ name: "Otoya" })
  ]);

  assert.equal(selected?.name, "Otoya");
  assert.equal(session.getVoice()?.name, "Otoya");
});

test("createJapaneseEveningVoiceSession keeps one stable voice for a session after lock", () => {
  const session = createJapaneseEveningVoiceSession<SpeechSynthesisVoiceLike>();

  const firstSelected = session.lock([
    createVoice({ name: "Otoya" }),
    createVoice({ name: "Kyoko" })
  ]);
  const secondSelected = session.lock([
    createVoice({ name: "Sakura" }),
    createVoice({ name: "Google 日本語" })
  ]);

  assert.equal(firstSelected?.name, "Otoya");
  assert.equal(secondSelected?.name, "Otoya");
  assert.equal(session.isLocked(), true);
});

test("createJapaneseEveningVoiceSession provides a safe fallback when voices are unavailable at lock time", () => {
  const session = createJapaneseEveningVoiceSession<SpeechSynthesisVoiceLike>();

  assert.equal(session.lock([]), undefined);
  assert.equal(session.isLocked(), true);
  assert.equal(session.getVoice(), undefined);
});

test("Japanese evening settings use conservative natural pacing ranges", () => {
  assert.deepEqual(getJapaneseEveningSpeechSettings("release"), {
    lang: "ja-JP",
    rate: 0.77,
    pitch: 0.84,
    volume: 0.78,
    preferredNames: JAPANESE_EVENING_PREFERRED_NAMES
  });
  assert.deepEqual(getJapaneseEveningSpeechSettings("gratitude"), {
    lang: "ja-JP",
    rate: 0.75,
    pitch: 0.86,
    volume: 0.8,
    preferredNames: JAPANESE_EVENING_PREFERRED_NAMES
  });
  assert.deepEqual(getJapaneseEveningSpeechSettings("sleep"), {
    lang: "ja-JP",
    rate: 0.72,
    pitch: 0.77,
    volume: 0.76,
    preferredNames: JAPANESE_EVENING_PREFERRED_NAMES
  });
});

test("Japanese Release narration uses natural premium phrasing while preserving concise captions", () => {
  const openingLine = JAPANESE_RELEASE_GATE_NARRATION.find((line) => line.key === "release-1");
  const permissionLine = JAPANESE_RELEASE_GATE_NARRATION.find((line) => line.key === "release-2");
  const breathLine = JAPANESE_RELEASE_GATE_NARRATION.find((line) => line.key === "release-5");
  const tomorrowLine = JAPANESE_RELEASE_GATE_NARRATION.find((line) => line.key === "release-6");
  const closingLine = JAPANESE_RELEASE_GATE_NARRATION.find((line) => line.key === "release-8");

  assert.equal(JAPANESE_RELEASE_GATE_NARRATION.length, 8);
  assert.equal(openingLine?.text, "今日も一日\nお疲れさまでした");
  assert.equal(openingLine?.speechText, "今日も一日、お疲れさまでした。");
  assert.equal(permissionLine?.speechText, "ここからは、何かを終わらせなくても、大丈夫です。");
  assert.equal(breathLine?.speechText, "呼吸は、そのままで、大丈夫です。");
  assert.equal(tomorrowLine?.speechText, "今日、終わらなかったことは、明日に預けておきましょう。");
  assert.equal(closingLine?.speechText, "今日の重さを、ここに、そっと置いていきます。");
  assert.ok(JAPANESE_RELEASE_GATE_NARRATION.every((line) => line.text.split("\n").length <= 3));
  assert.ok(JAPANESE_RELEASE_GATE_NARRATION.every((line) => !/\.\.\.|\s{2,}/u.test(line.text)));
});

test("Japanese Release narration leaves a longer quiet runway before the 3-minute end", () => {
  const releaseTimeline = Object.fromEntries(
    JAPANESE_RELEASE_GATE_NARRATION.map((line) => [line.key, line.at])
  );
  const finalLine = JAPANESE_RELEASE_GATE_NARRATION.find((line) => line.key === "release-8");
  const gratitudeFinalLine = JAPANESE_GRATITUDE_GATE_NARRATION.at(-1);
  const sleepTimeline = JAPANESE_SLEEP_GATE_NARRATION.map((line) => line.at);

  assert.deepEqual(releaseTimeline, {
    "release-1": 12,
    "release-2": 30,
    "release-3": 52,
    "release-4": 76,
    "release-5": 98,
    "release-6": 120,
    "release-7": 144,
    "release-8": 162
  });
  assert.equal(finalLine?.speechDelayMs, 1180);
  assert.equal(roundToHundredths((finalLine?.at ?? 0) + ((finalLine?.speechDelayMs ?? 0) / 1000)), 163.18);
  assert.equal(roundToHundredths(180 - ((finalLine?.at ?? 0) + ((finalLine?.speechDelayMs ?? 0) / 1000))), 16.82);
  assert.equal(gratitudeFinalLine?.at, 200);
  assert.deepEqual(sleepTimeline, [15, 50, 72]);
});

test("Japanese Gratitude narration keeps display text while providing safer spoken readings", () => {
  const warmthLine = JAPANESE_GRATITUDE_GATE_NARRATION.find((line) => line.key === "gratitude-3");
  const sunlightLine = JAPANESE_GRATITUDE_GATE_NARRATION.find((line) => line.key === "gratitude-5");
  const scentLine = JAPANESE_GRATITUDE_GATE_NARRATION.find((line) => line.key === "gratitude-7");
  const ordinaryLine = JAPANESE_GRATITUDE_GATE_NARRATION.find((line) => line.key === "gratitude-8");
  const friendLine = JAPANESE_GRATITUDE_GATE_NARRATION.find((line) => line.key === "gratitude-11");

  assert.equal(warmthLine?.text, "近すぎて、\n気づかなかった\nあたたかさが\nあったかもしれません");
  assert.equal(warmthLine?.speechText, "ちかすぎて、\n気づかなかった\nあたたかさが、\nあったのかもしれません。");
  assert.equal(sunlightLine?.text, "日差し");
  assert.equal(sunlightLine?.speechText, "ひざし。");
  assert.equal(scentLine?.text, "自然の香り");
  assert.equal(scentLine?.speechText, "しぜんのかおり。");
  assert.equal(ordinaryLine?.text, "今日、\n当たり前すぎて\n見過ごしていたものは\nありませんでしたか");
  assert.equal(ordinaryLine?.speechText, "きょう、\nあたりまえすぎて、\nみすごしていたものは\nありませんでしたか。");
  assert.equal(friendLine?.text, "友人");
  assert.equal(friendLine?.speechText, "ゆうじん。");
});

test("Japanese Sleep narration is reduced to three cues or fewer", () => {
  assert.ok(JAPANESE_SLEEP_GATE_NARRATION.length <= 3);
  assert.deepEqual(
    JAPANESE_SLEEP_GATE_NARRATION.map((line) => line.key),
    ["sleep-1", "sleep-3", "sleep-2"]
  );
});

test("Japanese Sleep narration keeps the quietest pacing and safer spoken readings", () => {
  const breathLine = JAPANESE_SLEEP_GATE_NARRATION.find((line) => line.key === "sleep-3");
  const releaseLine = JAPANESE_SLEEP_GATE_NARRATION.find((line) => line.key === "sleep-2");

  assert.equal(breathLine?.text, "呼吸は...\nそのままで\n大丈夫です");
  assert.equal(breathLine?.speechText, "呼吸は…\nそのままで、\n大丈夫です。");
  assert.equal(releaseLine?.text, "もう...\n何もしなくて\n大丈夫です");
  assert.equal(releaseLine?.speechText, "もう…\nなにもしなくて\nだいじょうぶです。");
});
