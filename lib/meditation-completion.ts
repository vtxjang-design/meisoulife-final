"use client";

import type { MutableRefObject } from "react";

const COMPLETION_CHIME_SOURCES = [
  "/audio/ending-chime.mp3",
  "/audio/meditation-complete-chime.mp3"
];

type MeditationCompletionOptions = {
  hasUserGesture: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  audioContextRef: MutableRefObject<AudioContext | null>;
};

function getAudioContext(audioContextRef: MutableRefObject<AudioContext | null>) {
  if (typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) {
    return null;
  }

  if (audioContextRef.current) {
    return audioContextRef.current;
  }

  const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioCtor) {
    return null;
  }

  audioContextRef.current = new AudioCtor();
  return audioContextRef.current;
}

function playFallbackBell(audioContextRef: MutableRefObject<AudioContext | null>) {
  const context = getAudioContext(audioContextRef);

  if (!context) {
    return;
  }

  const now = context.currentTime;
  const gainNode = context.createGain();
  const oscillatorPrimary = context.createOscillator();
  const oscillatorSecondary = context.createOscillator();

  oscillatorPrimary.type = "sine";
  oscillatorPrimary.frequency.setValueAtTime(523.25, now);
  oscillatorSecondary.type = "triangle";
  oscillatorSecondary.frequency.setValueAtTime(783.99, now);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(0.028, now + 0.03);
  gainNode.gain.exponentialRampToValueAtTime(0.012, now + 0.4);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

  oscillatorPrimary.connect(gainNode);
  oscillatorSecondary.connect(gainNode);
  gainNode.connect(context.destination);

  oscillatorPrimary.start(now);
  oscillatorSecondary.start(now);
  oscillatorPrimary.stop(now + 1.9);
  oscillatorSecondary.stop(now + 1.6);
}

async function playCompletionChime(audioContextRef: MutableRefObject<AudioContext | null>) {
  if (typeof window === "undefined" || typeof Audio === "undefined") {
    playFallbackBell(audioContextRef);
    return;
  }

  try {
    for (const src of COMPLETION_CHIME_SOURCES) {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.volume = 0.45;

      try {
        await new Promise<void>((resolve, reject) => {
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => reject(new Error("completion chime failed to load"));
          audio.load();
        });

        await audio.play();
        return;
      } catch {
        continue;
      }
    }

    playFallbackBell(audioContextRef);
  } catch {
    playFallbackBell(audioContextRef);
  }
}

function triggerCompletionVibration(enabled: boolean, hasUserGesture: boolean) {
  if (!enabled || !hasUserGesture || typeof navigator === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  navigator.vibrate([120, 80, 120]);
}

export function supportsMeditationVibration() {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

export async function handleMeditationComplete({
  hasUserGesture,
  soundEnabled,
  vibrationEnabled,
  audioContextRef
}: MeditationCompletionOptions) {
  if (!hasUserGesture) {
    return;
  }

  triggerCompletionVibration(vibrationEnabled, hasUserGesture);

  if (soundEnabled) {
    await playCompletionChime(audioContextRef);
  }
}
