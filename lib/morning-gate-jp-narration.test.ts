import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("Japanese Morning Gate narration keeps display copy and TTS readings separate", () => {
  assert.match(meditationPageSource, /text: "呼吸とともに\\n身体が少しずつ\\n目覚めていきます"/);
  assert.match(meditationPageSource, /speechText: "こきゅう、とともに、\\nからだがすこしずつ、\\nめざめていきます。"/);
  assert.doesNotMatch(meditationPageSource, /こきゅー/);
  assert.match(meditationPageSource, /text: "生命力を感じます", speechText: "せいめいりょくを、\\nかんじます。"/);
  assert.match(meditationPageSource, /text: "丹田", speechText: "たんでん。"/);
});

test("Japanese Morning Gate cues keep connected phrases and comfortable breath timing", () => {
  assert.match(meditationPageSource, /speechText: "きょうといういちにちが、\\nいま、ここからはじまります。"/);
  assert.match(meditationPageSource, /at: 54, key: "open-4"[\s\S]*?at: 64, key: "open-5"/);
  assert.match(meditationPageSource, /at: 80, key: "open-6"[\s\S]*?at: 90, key: "open-7"/);
  assert.match(meditationPageSource, /at: 60, key: "vision-1"[\s\S]*?at: 66, key: "vision-2"/);
});

test("Korean and English Vision Gate cues keep a four-second connection", () => {
  assert.match(
    meditationPageSource,
    /at: 62, key: "vision-1", text: "오늘은\\n멀리 내다보기보다"[\s\S]*?at: 66, key: "vision-2", text: "조용히\\n방향을 떠올립니다"/
  );
  assert.match(
    meditationPageSource,
    /at: 62, key: "vision-1", text: "Today\\nyou do not need\\nto look too far ahead"[\s\S]*?at: 66, key: "vision-2", text: "Just remember\\nyour direction"/
  );
});

test("Japanese Energy Gate avoids back-to-back Danjeon wording", () => {
  assert.match(meditationPageSource, /text: "おへその下へ"/);
  assert.match(meditationPageSource, /text: "そこにある丹田に\\n意識を向けます"/);
  assert.doesNotMatch(meditationPageSource, /おへその下にある\\n丹田へ/);
});

test("Japanese Morning Gate copy avoids the previous translated phrasing", () => {
  assert.match(meditationPageSource, /今日、大切にしたい方向を\\n静かに確かめる時間です/);
  assert.match(meditationPageSource, /大切にしたい方向を\\n静かに確かめます/);
  assert.match(meditationPageSource, /進む道は\\n静かに続いています/);
  assert.doesNotMatch(meditationPageSource, /静かに\\n方向を思い出します/);
  assert.doesNotMatch(meditationPageSource, /今日という 一日/);
});

test("Morning Gate captions remain visible between scheduled cues", () => {
  const captionEffectSource = meditationPageSource.slice(
    meditationPageSource.indexOf('if (affirmationStage === "openingFade")'),
    meditationPageSource.indexOf('}, [affirmationStage, isStructuredMorningGate, morningGateCopy]);')
  );

  assert.doesNotMatch(captionEffectSource, /setAffirmationMessage\(null\)/);
  assert.match(
    captionEffectSource,
    /affirmationStage === "integration" && morningGateCopy\.integration/
  );
});
