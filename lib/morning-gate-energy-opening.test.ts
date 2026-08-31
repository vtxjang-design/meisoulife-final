import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("Energy Gate opening introduces Dantian tapping in Japanese, Korean, and English", () => {
  assert.match(
    meditationPageSource,
    /at: 10, key: "open-2", text: "今日は\\nエネルギーの中心、下腹部の丹田を\\n軽くたたきながら\\n体と脳を目覚めさせます"/
  );
  assert.match(
    meditationPageSource,
    /at: 10, key: "open-2", text: "오늘은 에너지 중심 아랫배, 단전을\\n가볍게 두드리며 몸과 뇌를 깨웁니다"/
  );
  assert.match(
    meditationPageSource,
    /at: 10, key: "open-2", text: "Today, gently tap your lower abdomen—\\nthe Dantian, your energy center—\\nto awaken your body and brain"/
  );
  assert.doesNotMatch(meditationPageSource, /오늘은 몸과 뇌를 깨웁니다/);
  assert.doesNotMatch(meditationPageSource, /Today\\nwe awaken body and brain/);
});
