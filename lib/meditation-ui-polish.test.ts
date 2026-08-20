import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");
const rhythmJourneyPageSource = readFileSync(new URL("../components/rhythm-journey-page.tsx", import.meta.url), "utf8");
const instantMeditationSource = readFileSync(new URL("../components/instant-meditation-section.tsx", import.meta.url), "utf8");
const recoveryChoiceBridgeSource = readFileSync(new URL("../components/recovery-choice-bridge.tsx", import.meta.url), "utf8");
const landingCopySource = readFileSync(new URL("../lib/landing-copy.ts", import.meta.url), "utf8");
const coachPageSource = readFileSync(new URL("../app/coach/page.tsx", import.meta.url), "utf8");
const coachApiSource = readFileSync(new URL("../app/api/coach/route.ts", import.meta.url), "utf8");

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

test("ZERO GATE completion offers the optional local Recovery Choice Bridge without an upgrade", () => {
  assert.match(instantMeditationSource, /showReflectionBridge/);
  assert.match(instantMeditationSource, /showCompletionState && isZeroGateKey\(selectedGate\) && showReflectionBridge/);
  assert.match(instantMeditationSource, /<RecoveryChoiceBridge copy=\{copy\.recoveryChoiceBridge\} supportChoices=\{copy\.supportChoices\} \/>/);
  assert.doesNotMatch(instantMeditationSource, /\/program\/basic/);
  assert.match(landingCopySource, /今、ほんの少しでも変わったことはありますか？/);
  assert.match(landingCopySource, /지금, 아주 조금이라도 달라진 것이 있나요\?/);
  assert.match(landingCopySource, /Does anything feel even slightly different right now\?/);
});

test("Recovery Choice Bridge is optional, localized, editable, and client-only", () => {
  assert.match(recoveryChoiceBridgeSource, /MAX_CUSTOM_CHOICE_LENGTH = 120/);
  assert.match(recoveryChoiceBridgeSource, /maxLength=\{MAX_CUSTOM_CHOICE_LENGTH\}/);
  assert.match(recoveryChoiceBridgeSource, /aria-pressed=\{selected\}/);
  assert.match(recoveryChoiceBridgeSource, /aria-pressed=\{selectedChoice === choice\.label\}/);
  assert.match(recoveryChoiceBridgeSource, /copy\.skipOutcome/);
  assert.match(recoveryChoiceBridgeSource, /copy\.noChoice/);
  assert.match(recoveryChoiceBridgeSource, /copy\.changeChoice/);
  assert.match(recoveryChoiceBridgeSource, /copy\.deleteChoice/);
  assert.match(recoveryChoiceBridgeSource, /copy\.endForToday/);
  assert.doesNotMatch(recoveryChoiceBridgeSource, /\b(fetch|localStorage|sessionStorage|cookies|supabase|openai|gemini|analytics)\b/i);
  assert.doesNotMatch(recoveryChoiceBridgeSource, /AI Coach|Gongsaeng Coach|chatbot/i);
  assert.match(landingCopySource, /この案内では生成AIを使用していません。あなたの選択は送信・保存されません。/);
  assert.match(landingCopySource, /이 안내에서는 생성형 AI를 사용하지 않습니다. 당신의 선택은 전송되거나 저장되지 않습니다\./);
  assert.match(landingCopySource, /This guided step does not use generative AI\. Your choice is not sent or saved\./);
});

test("Coach emergency isolation remains independent from the Recovery Choice Bridge", () => {
  assert.match(coachPageSource, /useLanguage/);
  assert.match(coachPageSource, /isolationCopy/);
  assert.match(coachPageSource, /\/#one-minute-experience/);
  assert.doesNotMatch(coachPageSource, /CoachConsole|textarea|input/);
  assert.match(coachApiSource, /status:\s*503/);
  assert.match(coachApiSource, /"Cache-Control":\s*"no-store"/);
  assert.doesNotMatch(coachApiSource, /request\.(json|text|arrayBuffer|formData)/);
  assert.doesNotMatch(coachApiSource, /openai|supabase|fallback|prompt/i);
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
