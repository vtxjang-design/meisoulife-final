import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rhythmSource = readFileSync(new URL("./basic-rhythm.ts", import.meta.url), "utf8");
const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("Evening Gate uses one concise session line in Japanese, Korean, and English", () => {
  const approvedLines = [
    "今日の重さを手放す時間",
    "今日のぬくもりを見つめる時間",
    "深い休息へ向かう時間",
    "오늘의 무게를 내려놓는 시간",
    "오늘의 온기를 돌아보는 시간",
    "깊은 쉼으로 향하는 시간",
    "A moment to release the day",
    "A moment to remember today’s warmth",
    "A passage into deep rest"
  ];

  for (const line of approvedLines) {
    assert.match(rhythmSource, new RegExp(line));
  }
});

test("Evening Gate session cards omit the repeated quoted state", () => {
  assert.match(
    meditationPageSource,
    /!isGuidedEveningGate \? \(\s*<p[^>]*>“\{basicPracticeCopy\.state\}”<\/p>\s*\) : null/
  );
});
