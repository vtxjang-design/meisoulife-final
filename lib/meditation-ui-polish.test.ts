import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");
const rhythmJourneyPageSource = readFileSync(new URL("../components/rhythm-journey-page.tsx", import.meta.url), "utf8");
const instantMeditationSource = readFileSync(new URL("../components/instant-meditation-section.tsx", import.meta.url), "utf8");
const landingCopySource = readFileSync(new URL("../lib/landing-copy.ts", import.meta.url), "utf8");

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

test("ZERO GATE completion offers an optional localized reflection without persistence", () => {
  assert.match(instantMeditationSource, /showReflectionBridge/);
  assert.match(instantMeditationSource, /showCompletionState && isZeroGateKey\(selectedGate\) && showReflectionBridge/);
  assert.match(instantMeditationSource, /aria-pressed=\{selected\}/);
  assert.match(instantMeditationSource, /setShowReflectionBridge\(false\)/);
  assert.doesNotMatch(instantMeditationSource, /MEDITATION_MOOD_STORAGE_KEY/);
  assert.doesNotMatch(instantMeditationSource, /meisoulife_instant_meditation_mood/);
  assert.match(landingCopySource, /少しだけ、楽になった感じはありますか？/);
  assert.match(landingCopySource, /조금 더 편안해진 느낌이 있나요\?/);
  assert.match(landingCopySource, /Do you feel a little more at ease\?/);
});

test("ZERO GATE completion exits fullscreen before scrolling the reflection bridge once", () => {
  assert.match(instantMeditationSource, /reflectionBridgeRef/);
  assert.match(instantMeditationSource, /document\.addEventListener\("fullscreenchange", handleStandardFullscreenChange\)/);
  assert.match(instantMeditationSource, /document\.addEventListener\("webkitfullscreenchange", handleStandardFullscreenChange\)/);
  assert.match(instantMeditationSource, /video\?\.addEventListener\("webkitendfullscreen", handleNativeVideoFullscreenEnd\)/);
  assert.match(instantMeditationSource, /void document\.exitFullscreen\(\)\.catch\(\(\) => undefined\)/);
  assert.match(instantMeditationSource, /video\.webkitExitFullscreen\?\.\(\)/);
  assert.match(instantMeditationSource, /reflectionScrollRequestedRef\.current/);
  assert.match(instantMeditationSource, /behavior: prefersReducedMotion \? "auto" : "smooth"/);
  assert.match(instantMeditationSource, /block: "start"/);
  assert.match(instantMeditationSource, /window\.requestAnimationFrame\(\(\) => \{\s*secondLayoutFrame = window\.requestAnimationFrame/s);
});

test("ZERO GATE selection scrolls the mounted experience once without retaining selection-only constraints", () => {
  const homeSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(homeSource, /zeroGateExperienceActive/);
  assert.match(homeSource, /\? "overflow-visible"\s*:\s*"max-h-\[calc\(100dvh-var\(--header-offset,0px\)\)\] overflow-y-auto overscroll-contain"/);
  assert.match(homeSource, /onExperienceActiveChange=\{setZeroGateExperienceActive\}/);
  assert.doesNotMatch(homeSource, /scrollToOneMinute/);
  assert.match(instantMeditationSource, /experienceContainerRef/);
  assert.match(instantMeditationSource, /experienceScrollRequestedRef/);
  assert.match(instantMeditationSource, /id="one-minute-experience" ref=\{experienceContainerRef\}/);
  assert.match(instantMeditationSource, /behavior: prefersReducedMotion \? "auto" : "smooth"/);
  assert.match(instantMeditationSource, /window\.requestAnimationFrame\(\(\) => \{\s*experienceContainerRef\.current\?\.scrollIntoView/);
  assert.doesNotMatch(instantMeditationSource, /scrollPlayerIntoView/);
});
