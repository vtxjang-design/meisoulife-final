import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");
const rhythmJourneyPageSource = readFileSync(new URL("../components/rhythm-journey-page.tsx", import.meta.url), "utf8");
const instantMeditationSource = readFileSync(new URL("../components/instant-meditation-section.tsx", import.meta.url), "utf8");

test("recharge gate titles avoid awkward mobile wrapping while preserving desktop sizing", () => {
  assert.match(meditationPageSource, /localizedLanguage === "kr"/);
  assert.match(meditationPageSource, /max-w-\[16ch\]/);
  assert.match(meditationPageSource, /\[word-break:keep-all\]/);
  assert.match(meditationPageSource, /max-w-\[15ch\]/);
  assert.match(meditationPageSource, /\[overflow-wrap:normal\]/);
  assert.match(meditationPageSource, /whitespace-nowrap break-keep text-\[13px\]/);
});

test("recharge gate option labels preserve phrase-level wrapping across languages", () => {
  assert.match(meditationPageSource, /localizedLanguage === "jp"/);
  assert.match(meditationPageSource, /break-keep \[word-break:keep-all\]/);
  assert.match(meditationPageSource, /localizedLanguage === "kr"/);
  assert.match(meditationPageSource, /\[word-break:normal\]/);
});

test("rhythm journey selected practice option has a stronger but calm visual state", () => {
  assert.match(rhythmJourneyPageSource, /aria-pressed=\{selected\}/);
  assert.match(rhythmJourneyPageSource, /focus-visible:ring-\[#f0d79c\]\/55/);
  assert.match(rhythmJourneyPageSource, /border-\[#f0d79c\]\/52/);
  assert.match(rhythmJourneyPageSource, /bg-\[linear-gradient\(180deg,rgba\(243,224,175,0.2\),rgba\(243,224,175,0.1\)\)\]/);
  assert.match(rhythmJourneyPageSource, /shadow-\[0_12px_28px_rgba\(212,178,106,0.16\)\]/);
  assert.match(rhythmJourneyPageSource, /text-\[#fffaf0\]/);
  assert.match(rhythmJourneyPageSource, /text-\[11px\] font-medium tracking-\[0.18em\] text-\[#f6e7bb\]\/78\">ON/);
});

test("60-second reset audio fade begins before completion and does not overlap replays", () => {
  assert.match(instantMeditationSource, /const ENDING_AUDIO_FADE_TRIGGER_SECONDS = 3;/);
  assert.match(instantMeditationSource, /const ENDING_AUDIO_FADE_MS = 3000;/);
  assert.match(instantMeditationSource, /endingFadeStartedRef/);
  assert.match(instantMeditationSource, /secondsLeft > ENDING_AUDIO_FADE_TRIGGER_SECONDS \|\| secondsLeft <= 0/);
  assert.match(instantMeditationSource, /void fadeOutVideoAudio\(currentVideo, ENDING_AUDIO_FADE_MS\)/);
  assert.match(instantMeditationSource, /cancelVideoFade\(\);/);
});

test("60-second reset replay and cleanup restore the intended audio start state", () => {
  assert.match(instantMeditationSource, /endingFadeStartedRef\.current = false;/);
  assert.match(instantMeditationSource, /video\.volume = nextSoundEnabled \? 0\.28 : 0;/);
  assert.match(instantMeditationSource, /video\.muted = !nextSoundEnabled;/);
  assert.match(instantMeditationSource, /window\.cancelAnimationFrame\(videoFadeRafRef\.current\)/);
});
