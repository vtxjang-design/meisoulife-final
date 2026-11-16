import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("Japanese Morning Gate narration keeps approved display copy and render readings together", () => {
  assert.match(meditationPageSource, /text: "息とともに\\n体が少しずつ\\n目覚めていきます"/);
  assert.match(meditationPageSource, /speechText: "いきとともに、\\nからだがすこしずつ、\\nめざめていきます。"/);
  assert.doesNotMatch(meditationPageSource, /呼吸とともに|こきゅー/);
  assert.match(meditationPageSource, /text: "生命力を感じます", speechText: "せいめいりょくを、\\nかんじます。"/);
  assert.match(meditationPageSource, /text: "丹田", speechText: "たんでん。"/);
});

test("Japanese Morning Gate cues keep connected phrases and approved breath timing", () => {
  assert.match(meditationPageSource, /speechText: "きょうといういちにちが、\\nいま、ここからはじまります。"/);
  assert.match(meditationPageSource, /at: 54, key: "open-4"[\s\S]*?at: 64, key: "open-5"/);
  assert.match(meditationPageSource, /at: 80, key: "open-6"[\s\S]*?at: 90, key: "open-7"/);
  assert.match(meditationPageSource, /at: 60, key: "vision-1"[\s\S]*?at: 66\.5, key: "vision-2"/);
});

test("Awakening and Energy use the approved final production schedule", () => {
  const awakeningSource = meditationPageSource.slice(meditationPageSource.indexOf("const affirmationGateCopy"), meditationPageSource.indexOf("const energyGateCopy"));
  const energySource = meditationPageSource.slice(meditationPageSource.indexOf("const energyGateCopy"), meditationPageSource.indexOf("const visionGateCopy"));
  const latestCueAt = (source: string) => Math.max(...Array.from(source.matchAll(/\bat: (\d+(?:\.\d+)?),/g), (match) => Number(match[1])));

  assert.equal(latestCueAt(awakeningSource), 175.25);
  assert.equal(latestCueAt(energySource), 173);
  assert.match(awakeningSource, /at: 175\.25, key: "close-3"/);
  assert.match(energySource, /at: 173, key: "close-1"/);
  assert.match(meditationPageSource, /const AFFIRMATION_TOTAL_SECONDS = 180;/);
  assert.doesNotMatch(meditationPageSource, /unlockStructuredMorningSpeech|MORNING_NARRATION_END_SECONDS/);
});

test("Korean and English Vision Gate cues use the approved safety-margin onsets", () => {
  assert.match(meditationPageSource, /at: 62, key: "vision-1", text: "오늘은\\n멀리 내다보기보다"[\s\S]*?at: 69\.75, key: "vision-2", text: "조용히\\n방향을 떠올립니다"/);
  assert.match(meditationPageSource, /at: 62, key: "vision-1", text: "Today\\nyou do not need\\nto look too far ahead"[\s\S]*?at: 69\.75, key: "vision-2", text: "Just remember\\nyour direction"/);
});

test("Japanese Energy Gate avoids back-to-back Dahnjeon wording", () => {
  assert.match(meditationPageSource, /text: "おへその下へ"/);
  assert.match(meditationPageSource, /text: "そこにある丹田に\\n意識を向けます"/);
  assert.doesNotMatch(meditationPageSource, /おへその下にある\\n丹田へ/);
});

test("Japanese Morning Gate copy avoids the previous translated phrasing", () => {
  assert.match(meditationPageSource, /今日、大切にしたい方向を\\n静かに確かめる時間です/);
  assert.match(meditationPageSource, /大切にしたい方向を\\n静かに確かめます/);
  assert.match(meditationPageSource, /進む道は\\n静かに続いています/);
  assert.doesNotMatch(meditationPageSource, /静かに\\n方向を思い出します|今日という 一日/);
});

test("Morning Gate captions follow the persistent audio timeline", () => {
  const captionEffectSource = meditationPageSource.slice(meditationPageSource.indexOf("const activeLine = resolveMorningGateCaption"), meditationPageSource.indexOf("}, [elapsedTotalSeconds, isStructuredMorningGate, morningGateCopy]);"));
  assert.match(captionEffectSource, /setAffirmationMessage\(activeLine\?\.text \?\? null\)/);
  assert.match(meditationPageSource, /onTimeUpdate=\{\(event\) => \{[\s\S]*getMorningGateRemainingSeconds\(event\.currentTarget\.currentTime\)/);
});
