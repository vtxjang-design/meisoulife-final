"use client";

import type { MutableRefObject } from "react";

const AMBIENT_AUDIO_SRC = "/audio/birds-nature-ambience.mp3";
const SOUND_PREFERENCE_KEY = "meisoulife_nature_sound_enabled";
const TARGET_VOLUME = 0.32;
const FADE_DURATION_MS = 2000;

type AmbientAudioResult = {
  started: boolean;
};

function fadeVolume(
  audio: HTMLAudioElement,
  from: number,
  to: number,
  durationMs: number
) {
  return new Promise<void>((resolve) => {
    const steps = 20;
    const stepDuration = durationMs / steps;
    let currentStep = 0;

    audio.volume = from;

    const interval = window.setInterval(() => {
      currentStep += 1;
      const progress = Math.min(currentStep / steps, 1);
      audio.volume = from + (to - from) * progress;

      if (progress >= 1) {
        window.clearInterval(interval);
        resolve();
      }
    }, stepDuration);
  });
}

export function getNatureSoundPreference() {
  if (typeof window === "undefined") {
    return true;
  }

  const stored = window.localStorage.getItem(SOUND_PREFERENCE_KEY);

  if (stored === null) {
    return true;
  }

  return stored === "true";
}

export function setNatureSoundPreference(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SOUND_PREFERENCE_KEY, String(enabled));
}

export async function startAmbientNatureAudio(
  audioRef: MutableRefObject<HTMLAudioElement | null>,
  enabled = true
): Promise<AmbientAudioResult> {
  if (!enabled || typeof window === "undefined" || typeof Audio === "undefined") {
    return { started: false };
  }

  if (!audioRef.current) {
    // TODO: If member-specific ambience is added later, select the source here
    // from Supabase/member preferences instead of a single shared file.
    const audio = new Audio(AMBIENT_AUDIO_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = TARGET_VOLUME;
    audioRef.current = audio;
  }

  const audio = audioRef.current;

  try {
    console.log("Starting ambience audio");
    audio.volume = TARGET_VOLUME;
    await audio.play();
    console.log("Ambience audio playing");
    await fadeVolume(audio, 0, TARGET_VOLUME, FADE_DURATION_MS);
    return { started: true };
  } catch (error) {
    console.warn("Ambience audio failed", error);
    return { started: false };
  }
}

export async function stopAmbientNatureAudio(audioRef: MutableRefObject<HTMLAudioElement | null>) {
  const audio = audioRef.current;

  if (!audio) {
    return;
  }

  await fadeVolume(audio, audio.volume, 0, FADE_DURATION_MS);
  audio.pause();
  audio.currentTime = 0;
}
