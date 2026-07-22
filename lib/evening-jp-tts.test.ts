import assert from "node:assert/strict";
import test from "node:test";
import {
  createJapaneseEveningVoiceSession,
  getJapaneseEveningSpeechSettings,
  isJapaneseSpeechLocale,
  JAPANESE_EVENING_PREFERRED_NAMES,
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
    rate: 0.8,
    pitch: 0.85,
    volume: 0.84,
    preferredNames: JAPANESE_EVENING_PREFERRED_NAMES
  });
  assert.deepEqual(getJapaneseEveningSpeechSettings("gratitude"), {
    lang: "ja-JP",
    rate: 0.8,
    pitch: 0.87,
    volume: 0.82,
    preferredNames: JAPANESE_EVENING_PREFERRED_NAMES
  });
  assert.deepEqual(getJapaneseEveningSpeechSettings("sleep"), {
    lang: "ja-JP",
    rate: 0.76,
    pitch: 0.82,
    volume: 0.78,
    preferredNames: JAPANESE_EVENING_PREFERRED_NAMES
  });
});

test("Japanese Sleep narration is reduced to three cues or fewer", () => {
  assert.ok(JAPANESE_SLEEP_GATE_NARRATION.length <= 3);
  assert.deepEqual(
    JAPANESE_SLEEP_GATE_NARRATION.map((line) => line.key),
    ["sleep-1", "sleep-3", "sleep-2"]
  );
});
