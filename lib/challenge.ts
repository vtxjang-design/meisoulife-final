import { challengeDays } from "@/lib/content";

export function getChallengeDay(day: number) {
  return challengeDays.find((item) => item.day === day) || challengeDays[0];
}

export function getChallengeProgress(currentDay = 1) {
  return challengeDays.map((item) => ({
    ...item,
    completed: item.day < currentDay,
    active: item.day === currentDay
  }));
}
