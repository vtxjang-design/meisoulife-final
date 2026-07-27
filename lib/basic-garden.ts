export const BASIC_GARDEN_TIMEZONE = "Asia/Tokyo";

export const BASIC_GARDEN_ELIGIBLE_GATE_KEYS = [
  "affirmation",
  "energy",
  "vision",
  "focus",
  "rest",
  "recharge",
  "release",
  "gratitude",
  "sleep"
] as const;

export type BasicGardenEligibleGateKey = (typeof BASIC_GARDEN_ELIGIBLE_GATE_KEYS)[number];

export function isEligibleBasicGardenGateKey(value: unknown): value is BasicGardenEligibleGateKey {
  return typeof value === "string" && BASIC_GARDEN_ELIGIBLE_GATE_KEYS.includes(value as BasicGardenEligibleGateKey);
}
