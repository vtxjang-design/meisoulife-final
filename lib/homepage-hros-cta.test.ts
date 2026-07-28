import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homepageSource = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");

test("HROS and Brain Education CTA copy is localized consistently without changing its destination", () => {
  assert.match(homepageSource, /exploreHros: "HROSと脳教育を知る"/);
  assert.match(homepageSource, /libraryCta: "HROSと脳教育を知る →"/);
  assert.match(homepageSource, /exploreHros: "HROS와 뇌교육 알아보기"/);
  assert.match(homepageSource, /libraryCta: "HROS와 뇌교육 알아보기 →"/);
  assert.match(homepageSource, /exploreHros: "Explore HROS and Brain Education"/);
  assert.match(homepageSource, /libraryCta: "Explore HROS and Brain Education →"/);
  assert.doesNotMatch(homepageSource, /HROSをもっと知る|HROS 더 알아보기|Explore HROS(?! and Brain Education)/);
  assert.equal((homepageSource.match(/href="\/brain-education"/g) ?? []).length, 2);
});
