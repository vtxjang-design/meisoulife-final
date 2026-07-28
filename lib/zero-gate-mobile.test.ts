import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homeSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const zeroGateSource = readFileSync(new URL("../components/zero-gate-section.tsx", import.meta.url), "utf8");
const gateCardSource = readFileSync(new URL("../components/gate-card.tsx", import.meta.url), "utf8");

test("mobile ZERO GATE uses one concise localized introduction and preserves the continuation destination", () => {
  assert.match(homeSource, /title: "今の自分に合う入口を。"/);
  assert.match(homeSource, /description: "ひとつ選ぶと、静かな60秒が始まります。"/);
  assert.match(homeSource, /title: "지금의 나에게 맞는 입구를\."/);
  assert.match(homeSource, /description: "하나를 선택하면, 고요한 60초가 시작됩니다\."/);
  assert.match(homeSource, /title: "Choose the entrance that fits you now\."/);
  assert.match(homeSource, /description: "Choose one, and a quiet 60 seconds begins\."/);
  assert.match(homeSource, /onClick=\{\(\) => openChapterJourney\(0\)\}/);
  assert.match(homeSource, /continueJourney/);
});

test("mobile ZERO GATE preserves all six ordered choices with accessible compact cards", () => {
  const keys = ["overload", "anxiety", "low-energy", "distracted", "reset-mood", "sleep"];
  let previousIndex = -1;
  for (const key of keys) {
    const index = zeroGateSource.indexOf(`key: "${key}"`);
    assert.ok(index > previousIndex, `Expected ${key} in order`);
    previousIndex = index;
  }
  assert.match(zeroGateSource, /grid auto-rows-fr grid-cols-2 gap-2\.5/);
  assert.match(zeroGateSource, /Trees,\n  anxiety: TentTree/);
  assert.match(zeroGateSource, /aria-hidden="true"/);
  assert.doesNotMatch(zeroGateSource, /emoji:/);
  assert.match(gateCardSource, /min-h-\[104px\]/);
  assert.match(gateCardSource, /focus-visible:ring-2/);
  assert.match(gateCardSource, /motion-reduce:transition-none/);
});

test("mobile ZERO GATE gives each recovery entrance a quiet natural tone and keeps the continuation action secondary", () => {
  assert.match(zeroGateSource, /const gateTones: Record<ZeroGateDestinationKey, string>/);
  for (const key of ["overload", "anxiety", "low-energy", "distracted", "reset-mood", "sleep"]) {
    const property = key.includes("-") ? `"${key}"` : key;
    assert.ok(zeroGateSource.includes(`${property}: "rgba`), `Expected a natural tone for ${key}`);
  }
  assert.match(gateCardSource, /border-white\/\[0\.14\]/);
  assert.match(gateCardSource, /bg-\[linear-gradient\(135deg,var\(--gate-tone/);
  assert.match(gateCardSource, /text-white\/92/);
  assert.match(gateCardSource, /text-white\/50/);
  assert.match(gateCardSource, /group-focus-visible:text-gold\/82/);
  assert.match(homeSource, /border-t border-white\/\[0\.08\]/);
  assert.match(homeSource, /min-h-\[44px\]/);
});
