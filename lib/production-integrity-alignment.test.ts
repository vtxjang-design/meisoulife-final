import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const i18nSource = readFileSync(new URL("../lib/i18n.tsx", import.meta.url), "utf8");
const siteHeaderSource = readFileSync(new URL("../components/site-header.tsx", import.meta.url), "utf8");
const mobileCtaSource = readFileSync(new URL("../components/mobile-cta.tsx", import.meta.url), "utf8");
const checkInSource = readFileSync(new URL("../components/today-rhythm-checkin.tsx", import.meta.url), "utf8");
const lineInviteSource = readFileSync(new URL("../components/line-rhythm-invite.tsx", import.meta.url), "utf8");
const meditationSource = readFileSync(new URL("../app/meditation/page.tsx", import.meta.url), "utf8");
const leaderSource = readFileSync(new URL("../lib/leader.ts", import.meta.url), "utf8");
const fieldKeeperDesignSource = readFileSync(
  new URL("../docs/product/FIELD_KEEPER_TRANSITION_DESIGN.md", import.meta.url),
  "utf8"
);

test("public recovery navigation does not open an unavailable AI Coach entry", () => {
  assert.doesNotMatch(i18nSource, /\/#ai-rhythm-coach/);
  assert.match(siteHeaderSource, /href: "\/#one-minute-experience", label: oneMinuteLabel/);
  assert.doesNotMatch(siteHeaderSource, /href: "\/meditation", label: oneMinuteLabel/);
  assert.doesNotMatch(mobileCtaSource, /#ai-rhythm-coach/);
  assert.doesNotMatch(checkInSource, /#ai-rhythm-coach/);
});

test("public recovery buttons do not enter meditation without a supported experience", () => {
  const activeEntrySources = [
    readFileSync(new URL("../app/program/growth/page.tsx", import.meta.url), "utf8"),
    readFileSync(new URL("../app/brain-education/page.tsx", import.meta.url), "utf8"),
    readFileSync(new URL("../app/welcome/page.tsx", import.meta.url), "utf8"),
    readFileSync(new URL("../components/membership-success-content.tsx", import.meta.url), "utf8"),
    readFileSync(new URL("../components/premium-page-content.tsx", import.meta.url), "utf8"),
    siteHeaderSource
  ].join("\n");

  assert.doesNotMatch(activeEntrySources, /href="\/meditation"/);
  assert.match(activeEntrySources, /\/#one-minute-experience/);
});

test("public Growth pricing does not promise unavailable AI guidance", () => {
  assert.doesNotMatch(i18nSource, /AIガイドと脳教育の実践/);
  assert.doesNotMatch(i18nSource, /AIリズムガイドの深い活用/);
  assert.doesNotMatch(i18nSource, /AI 가이드와 뇌교육 실천/);
  assert.doesNotMatch(i18nSource, /AI 리듬 가이드 깊이 활용/);
  assert.doesNotMatch(i18nSource, /with AI guidance and Brain Education practices/);
  assert.doesNotMatch(i18nSource, /Deeper AI rhythm guidance/);
});

test("opening LINE does not claim or persist a completed connection", () => {
  assert.doesNotMatch(lineInviteSource, /markLineRhythmConnected|return-rhythm/);
  assert.doesNotMatch(i18nSource, /LINEでつながりました|LINE으로 연결되었습니다|You are connected on LINE/);
  assert.match(i18nSource, /LINEを開きました/);
  assert.match(i18nSource, /LINE을 열었습니다/);
  assert.match(i18nSource, /LINE opened/);
  assert.match(i18nSource, /このリズムを、必要なときに共に続ける/);
  assert.match(i18nSource, /이 리듬을, 필요할 때 함께 이어갑니다/);
  assert.match(i18nSource, /Continue this rhythm together, when it feels right/);
  assert.match(i18nSource, /LINE 열기/);
  assert.match(i18nSource, /LINEを開く/);
  assert.match(i18nSource, /Open LINE/);
});

test("an unspecified meditation route returns to the approved recovery entry", () => {
  assert.match(meditationSource, /href="\/#one-minute-experience"/);
  assert.match(meditationSource, /1분 회복부터 시작해 주세요/);
  assert.match(meditationSource, /1分リカバリーから始めてください/);
  assert.match(meditationSource, /Begin with 1-Minute Recovery/);
});

test("Field Keeper remains a design-only transition and leader metrics are unchanged", () => {
  assert.match(fieldKeeperDesignSource, /APPROVED FOR DESIGN — IMPLEMENTATION HOLD/);
  assert.match(fieldKeeperDesignSource, /AI may organize evidence or draft questions, but it may not select, rank, reject, promote, or remove a Field Keeper/);
  assert.match(fieldKeeperDesignSource, /The current numerical leader-candidacy implementation remains unchanged/);
  assert.match(leaderSource, /paidDays:\s*30/);
  assert.match(leaderSource, /checkInCount:\s*10/);
  assert.match(leaderSource, /helpfulComments:\s*3/);
});
