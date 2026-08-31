import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("Daytime sessions show the gate name once and use a shared eyebrow", () => {
  assert.match(meditationPageSource, /const sessionEyebrow = isSixtySecondGate \? "DAYTIME" : basicPracticeCopy\?\.title;/);
  assert.match(
    meditationPageSource,
    /\{sessionEyebrow\} · \{Math\.floor\(totalSeconds \/ 60\)\} min/
  );
  assert.match(
    meditationPageSource,
    /\{!isSixtySecondGate \? \([\s\S]*?\{topText\}[\s\S]*?\) : null\}/
  );
});
