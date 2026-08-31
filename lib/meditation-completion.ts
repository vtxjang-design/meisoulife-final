"use client";

import type { MutableRefObject } from "react";

type MeditationCompletionOptions = {
  hasUserGesture: boolean;
  vibrationEnabled: boolean;
  audioContextRef: MutableRefObject<AudioContext | null>;
  playSoundOnComplete?: boolean;
};

export function shouldPlayMeditationCompletionChime(input: {
  meditationType: string | null | undefined;
  meditationDoor: string | null | undefined;
  playSoundOnComplete?: boolean;
}) {
  if (input.playSoundOnComplete === false) {
    return false;
  }

  if (input.meditationType === "morning") {
    return (
      input.meditationDoor === "affirmation" ||
      input.meditationDoor === "energy" ||
      input.meditationDoor === "vision"
    );
  }

  if (input.meditationType === "day") {
    return (
      input.meditationDoor === "focus" ||
      input.meditationDoor === "relax" ||
      input.meditationDoor === "rest" ||
      input.meditationDoor === "vitality" ||
      input.meditationDoor === "recharge"
    );
  }

  return false;
}

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

async function playCompletionChime(audioContextRef: MutableRefObject<AudioContext | null>) {
  const context = getAudioContext(audioContextRef);

  if (!context) {
    return;
  }

  if (context.state !== "running") {
    try {
      await context.resume();
    } catch {
      return;
    }
  }

  const now = context.currentTime;
  const masterGain = context.createGain();
  masterGain.gain.setValueAtTime(0.0001, now);
  masterGain.gain.exponentialRampToValueAtTime(0.036, now + 0.025);
  masterGain.gain.exponentialRampToValueAtTime(0.014, now + 0.48);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.35);
  masterGain.connect(context.destination);

  const tones = [
    { frequency: 523.25, type: "sine" as OscillatorType, start: 0, stop: 2.4 },
    { frequency: 783.99, type: "sine" as OscillatorType, start: 0.07, stop: 2.1 },
    { frequency: 1046.5, type: "sine" as OscillatorType, start: 0.16, stop: 1.7 }
  ];

  for (const tone of tones) {
    const oscillator = context.createOscillator();
    const toneGain = context.createGain();
    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.frequency, now + tone.start);
    toneGain.gain.setValueAtTime(tone.frequency === 523.25 ? 1 : 0.42, now + tone.start);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + tone.stop);
    oscillator.connect(toneGain);
    toneGain.connect(masterGain);
    oscillator.start(now + tone.start);
    oscillator.stop(now + tone.stop);
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
  vibrationEnabled,
  audioContextRef,
  playSoundOnComplete = true
}: MeditationCompletionOptions) {
  if (!hasUserGesture) {
    return;
  }

  triggerCompletionVibration(vibrationEnabled, hasUserGesture);

  if (!playSoundOnComplete) {
    return;
  }

  await playCompletionChime(audioContextRef);
}
