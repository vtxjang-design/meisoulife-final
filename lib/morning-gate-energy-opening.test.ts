import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("Energy Gate opening introduces Dahnjeon tapping in Japanese, Korean, and English", () => {
  assert.match(
    meditationPageSource,
    /at: 10, key: "open-2", text: "今日は丹田を軽くたたきながら\\n体と脳を目覚めさせます"/
  );
  assert.match(
    meditationPageSource,
    /at: 10, key: "open-2", text: "오늘은 단전을 가볍게 두드리며\\n몸과 뇌를 깨웁니다"/
  );
  assert.match(
    meditationPageSource,
    /at: 10, key: "open-2", text: "Today, gently tap your Dahnjeon\\nto awaken your body and brain"/
  );
  assert.doesNotMatch(meditationPageSource, /\b(?:Dantian|Danjeon)\b/);
  assert.doesNotMatch(meditationPageSource, /오늘은 몸과 뇌를 깨웁니다/);
  assert.doesNotMatch(meditationPageSource, /Today\\nwe awaken body and brain/);
});
