import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const meditationPageSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");

test("Japanese Calm Gate reads 一日 as いちにち while preserving the caption", () => {
  assert.match(
    meditationPageSource,
    /key: "calm-8", text: "このやわらかさとともに\\n一日へ戻ります", speechText: "このやわらかさとともに、\\nいちにちへ戻ります"/
  );
  assert.doesNotMatch(
    meditationPageSource,
    /key: "calm-8"[^\n]*speechText: "このやわらかさとともに、\\n一日へ戻ります"/
  );
});
