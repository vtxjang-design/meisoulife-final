import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homepageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const communitySource = readFileSync(new URL("../app/community/page.tsx", import.meta.url), "utf8");
const pricingSource = readFileSync(new URL("../app/pricing/page.tsx", import.meta.url), "utf8");
const journeySource = readFileSync(new URL("../components/rhythm-journey-page.tsx", import.meta.url), "utf8");
const checkoutSource = readFileSync(new URL("../components/checkout-button.tsx", import.meta.url), "utf8");
const localeSource = readFileSync(new URL("./i18n.tsx", import.meta.url), "utf8");

test("free recovery CTAs describe and preserve the existing 7-Day Recovery destination", () => {
  assert.match(homepageSource, /secondaryCta: "7日間の小さな回復"/);
  assert.match(homepageSource, /secondaryCta: "7일간의 작은 회복"/);
  assert.match(homepageSource, /secondaryCta: "7-Day Recovery"/);
  assert.match(homepageSource, /href="\/rhythm-journey"/);
  assert.match(communitySource, /href="\/rhythm-journey"/);
  assert.match(localeSource, /lineCommunityCTA: "まずは7日間の回復を体験する"/);
  assert.match(localeSource, /lineCommunityCTA: "먼저 7일간의 회복 경험하기"/);
  assert.match(localeSource, /lineCommunityCTA: "Experience the 7-Day Recovery Journey first"/);
  assert.doesNotMatch(communitySource, /getLineInviteLinks|invites\.free/);
});

test("community entry accurately routes new visitors to BASIC pricing", () => {
  assert.match(communitySource, /href="\/pricing#basic"/);
  assert.match(pricingSource, /id=\{plan\.key === "basic" \? "basic" : undefined\}/);
  assert.match(localeSource, /rhythmCTA: "BASIC会員としてコミュニティを始める"/);
  assert.match(localeSource, /rhythmCTA: "BASIC 회원으로 커뮤니티 시작하기"/);
  assert.match(localeSource, /rhythmCTA: "Join BASIC and begin the member community"/);
  assert.match(journeySource, /const BASIC_ENTRY_ROUTE = "\/pricing#basic"/);
  assert.match(journeySource, /href=\{BASIC_ENTRY_ROUTE\}/);
  assert.equal(communitySource.indexOf('href="/pricing#basic"') < communitySource.indexOf('href="/rhythm-journey"'), true);
});

test("BASIC is primary in each locale while checkout implementation remains unchanged", () => {
  assert.equal((localeSource.match(/key: "basic"/g) ?? []).length >= 3, true);
  assert.equal((localeSource.match(/orderClass: "order-1"/g) ?? []).length >= 3, true);
  assert.match(localeSource, /Daily Rhythm & Member Community/);
  assert.match(localeSource, /아침·낮·저녁 리듬/);
  assert.match(localeSource, /朝・昼・夜のリズム/);
  assert.match(pricingSource, /<CheckoutButton\s+plan="basic"/);
  assert.match(checkoutSource, /fetch\("\/api\/stripe\/checkout"/);
  assert.match(checkoutSource, /body: JSON\.stringify\(\{ plan, next:/);
});

test("the public journey has the same product meaning in Japanese, Korean, and English", () => {
  assert.match(homepageSource, /journeyLine: "1分の回復 → 7日間のくり返し → BASICの日々のリズムとメンバーコミュニティ"/);
  assert.match(homepageSource, /journeyLine: "1분 회복 → 7일간의 반복 → BASIC의 일상 리듬과 멤버 커뮤니티"/);
  assert.match(homepageSource, /journeyLine: "1-minute recovery → 7 days of repetition → BASIC daily rhythm and member community"/);
  assert.match(localeSource, /人の価値や優劣を表すものではありません/);
  assert.match(localeSource, /사람의 가치나 우열을 뜻하지 않습니다/);
  assert.match(localeSource, /does not measure human worth or status/);
});
