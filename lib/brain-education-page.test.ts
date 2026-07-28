import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("../app/brain-education/page.tsx", import.meta.url), "utf8");
const copySource = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");

test("Brain Education page presents the progressive HROS experience without generic overview cards", () => {
  assert.doesNotMatch(pageSource, /copy\.sections\.map/);
  assert.match(pageSource, /copy\.whatIs\.ideas\.map/);
  assert.match(pageSource, /copy\.fiveSteps\.items\.map/);
  assert.match(pageSource, /copy\.bos\.items\.map/);
  assert.match(pageSource, /copy\.dailyLife\.areas\.map/);
  assert.match(pageSource, /copy\.productExperience\.items\.map/);
  assert.match(pageSource, /copy\.coexistence\.statement/);
});

test("Brain Education page preserves founder message presentation and existing CTA destinations", () => {
  assert.match(pageSource, /id="founder-message"/);
  assert.match(pageSource, /\{copy\.founderMessageTitle\}/);
  assert.match(pageSource, /\{copy\.founderMessageSubtitle\}/);
  assert.match(pageSource, /\{copy\.founderMessageBody\}/);
  assert.match(pageSource, /href="\/meditation"/);
  assert.match(pageSource, /href="\/"/);
});

test("Brain Education copy is complete in Japanese, Korean, and English with required safeguards", () => {
  assert.match(copySource, /title: "AI時代に、脳の主人として生きるために。"/);
  assert.match(copySource, /title: "AI 시대에, 뇌의 주인으로 살아가기 위해\."/);
  assert.match(copySource, /title: "To live as the owner of your brain in the AI era\."/);
  assert.match(copySource, /Brain Sensitizing/);
  assert.match(copySource, /Brain Versatilizing/);
  assert.match(copySource, /Brain Refreshing/);
  assert.match(copySource, /Brain Integrating/);
  assert.match(copySource, /Brain Mastering/);
  assert.match(copySource, /100% 뇌 활용은 뇌의 일부만 사용한다는 주장이 아닙니다/);
  assert.match(copySource, /“100% brain use” does not claim that people use only part of the brain/);
});
