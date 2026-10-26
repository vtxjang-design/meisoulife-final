export const GUIDED_SPEECH_UNLOCK_TEXT = ".";
export const GUIDED_SPEECH_UNLOCK_VOLUME = 0.01;
export const IOS_GUIDED_SPEECH_HANDOFF_MS = 180;
export const GUIDED_SPEECH_START_TIMEOUT_MS = 2500;

export type GuidedSpeechQueueAction = "speak" | "retry" | "cancel-and-retry" | "stop";

export function getGuidedSpeechQueueAction(
  state: { speaking: boolean; pending: boolean },
  attempt: number,
  maxAttempts: number
): GuidedSpeechQueueAction {
  if (!state.speaking && !state.pending) {
    return "speak";
  }

  if (attempt < maxAttempts) {
    return "retry";
  }

  if (attempt === maxAttempts) {
    return "cancel-and-retry";
  }

  return "stop";
}

export function usesIOSSpeechAudioSession(
  userAgent: string,
  platform: string,
  maxTouchPoints: number
) {
  return /iPhone|iPad|iPod/i.test(userAgent) || (platform === "MacIntel" && maxTouchPoints > 1);
}
