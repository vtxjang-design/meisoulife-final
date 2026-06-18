"use client";

import type { MutableRefObject } from "react";

const AMBIENT_AUDIO_SRC = "/audio/birds-nature-ambience.mp3";
const SOUND_PREFERENCE_KEY = "meisoulife_nature_sound_enabled";
const TARGET_VOLUME = 0.32;
const FADE_DURATION_MS = 2000;

type AmbientAudioResult = {
  started: boolean;
  error?: unknown;
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
  enabled = true,
  source = AMBIENT_AUDIO_SRC,
  targetVolume = TARGET_VOLUME
): Promise<AmbientAudioResult> {
  if (!enabled || typeof window === "undefined" || typeof Audio === "undefined") {
    return { started: false };
  }

  const existingSource = audioRef.current?.dataset.meisoSrc;

  if (audioRef.current && existingSource !== source) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current = null;
  }

  if (!audioRef.current) {
    // TODO: If member-specific ambience is added later, select the source here
    // from Supabase/member preferences instead of a single shared file.
    const audio = new Audio(source);
    audio.loop = true;
    audio.preload = "auto";
    audio.muted = false;
    audio.volume = targetVolume;
    audio.dataset.meisoSrc = source;
    audioRef.current = audio;
  }

  const audio = audioRef.current;

  try {
    console.log("Starting ambience audio");
    audio.volume = targetVolume;
    audio.muted = false;
    audio.load();
    await audio.play();
    console.log("Ambience audio playing");
    await fadeVolume(audio, 0, targetVolume, FADE_DURATION_MS);
    return { started: true };
  } catch (error) {
    console.error("Audio playback failed:", error);
    console.warn("Ambience audio failed", error);
    return { started: false, error };
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

export function pauseAmbientNatureAudio(audioRef: MutableRefObject<HTMLAudioElement | null>) {
  const audio = audioRef.current;

  if (!audio) {
    return;
  }

  audio.pause();
}

export async function resumeAmbientNatureAudio(
  audioRef: MutableRefObject<HTMLAudioElement | null>,
  enabled = true,
  targetVolume = TARGET_VOLUME
): Promise<AmbientAudioResult> {
  const audio = audioRef.current;

  if (!enabled || !audio || typeof window === "undefined") {
    return { started: false };
  }

  try {
    audio.muted = false;
    audio.volume = targetVolume;
    await audio.play();
    return { started: true };
  } catch (error) {
    console.error("Audio resume failed:", error);
    console.warn("Ambience audio resume failed", error);
    return { started: false, error };
  }
}
