import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

const releaseCatalogSource = meditationPageSource.slice(
  meditationPageSource.indexOf("const releaseGateNarration"),
  meditationPageSource.indexOf("const gratitudeGateNarration")
);

test("Release Gate keeps Korean and English aligned to the eight-cue Japanese master timeline", () => {
  const expectedTimeline = [12, 30, 52, 76, 98, 120, 144, 162];

  for (const at of expectedTimeline) {
    assert.equal(
      releaseCatalogSource.match(new RegExp(`at: ${at}, key: \\\"release-`, "g"))?.length,
      2,
      `Korean and English should both include the ${at}s cue`
    );
  }

  assert.equal(releaseCatalogSource.match(/key: "release-/g)?.length, 16);
  assert.doesNotMatch(releaseCatalogSource, /release-(?:9|10|11)/);
});

test("Release Gate translations preserve permission, unforced breath, and a quiet ending", () => {
  assert.match(releaseCatalogSource, /무언가를 끝내지 않아도/);
  assert.match(releaseCatalogSource, /호흡은\\n그대로여도\\n괜찮습니다/);
  assert.match(releaseCatalogSource, /nothing else needs\\nto be finished/);
  assert.match(releaseCatalogSource, /Your breath\\ncan remain\\njust as it is/);
  assert.doesNotMatch(releaseCatalogSource, /Gate of Gratitude|Thank you/);
});
