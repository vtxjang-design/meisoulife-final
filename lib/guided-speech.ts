export const GUIDED_SPEECH_UNLOCK_TEXT = ".";
export const GUIDED_SPEECH_UNLOCK_VOLUME = 0.01;

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
