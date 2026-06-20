"use client";

import type { MutableRefObject } from "react";

const AMBIENT_AUDIO_SRC = "/audio/birds-nature-ambience.mp3";
const SOUND_PREFERENCE_KEY = "meisoulife_nature_sound_enabled";
export const STRUCTURED_AMBIENT_PENDING_KEY = "meisoulife_structured_ambient_pending";
const TARGET_VOLUME = 0.32;
const DEFAULT_FADE_IN_MS = 2400;
const DEFAULT_FADE_OUT_MS = 2400;

type AmbientAudioResult = {
  started: boolean;
  error?: unknown;
};

type AmbientAudioOptions = {
  fadeInMs?: number;
  fadeOutMs?: number;
};

type FadeState = {
  token: number;
};

const fadeStateMap = new WeakMap<HTMLAudioElement, FadeState>();

function fadeVolume(
  audio: HTMLAudioElement,
  from: number,
  to: number,
  durationMs: number
) {
  return new Promise<void>((resolve) => {
    const state = fadeStateMap.get(audio) ?? { token: 0 };
    state.token += 1;
    fadeStateMap.set(audio, state);
    const currentToken = state.token;
    const startedAt = performance.now();

    audio.volume = from;

    const tick = (now: number) => {
      if ((fadeStateMap.get(audio)?.token ?? 0) !== currentToken) {
        resolve();
        return;
      }

      const progress = Math.min((now - startedAt) / durationMs, 1);
      audio.volume = from + (to - from) * progress;

      if (progress >= 1) {
        resolve();
        return;
      }

      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
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
  targetVolume = TARGET_VOLUME,
  options: AmbientAudioOptions = {}
): Promise<AmbientAudioResult> {
  if (!enabled || typeof window === "undefined" || typeof Audio === "undefined") {
    return { started: false };
  }

  const fadeInMs = options.fadeInMs ?? DEFAULT_FADE_IN_MS;

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
    if (!audio.paused && audio.currentSrc.includes(source)) {
      audio.muted = false;
      if (Math.abs(audio.volume - targetVolume) > 0.01) {
        await fadeVolume(audio, audio.volume, targetVolume, 700);
      } else {
        audio.volume = targetVolume;
      }
      return { started: true };
    }

    console.log("Starting ambience audio");
    audio.volume = 0;
    audio.muted = false;
    await audio.play();
    console.log("Ambience audio playing");
    await fadeVolume(audio, 0, targetVolume, fadeInMs);
    return { started: true };
  } catch (error) {
    console.error("Audio playback failed:", error);
    console.warn("Ambience audio failed", error);
    return { started: false, error };
  }
}

export async function stopAmbientNatureAudio(
  audioRef: MutableRefObject<HTMLAudioElement | null>,
  fadeOutMs = DEFAULT_FADE_OUT_MS
) {
  const audio = audioRef.current;

  if (!audio) {
    return;
  }

  await fadeVolume(audio, audio.volume, 0, fadeOutMs);
  audio.pause();
  audio.currentTime = 0;
}

export function pauseAmbientNatureAudio(audioRef: MutableRefObject<HTMLAudioElement | null>) {
  const audio = audioRef.current;

  if (!audio) {
    return;
  }

  const state = fadeStateMap.get(audio);
  if (state) {
    state.token += 1;
  }
  audio.pause();
}

export async function resumeAmbientNatureAudio(
  audioRef: MutableRefObject<HTMLAudioElement | null>,
  enabled = true,
  targetVolume = TARGET_VOLUME,
  options: AmbientAudioOptions = {}
): Promise<AmbientAudioResult> {
  const audio = audioRef.current;

  if (!enabled || !audio || typeof window === "undefined") {
    return { started: false };
  }

  const fadeInMs = options.fadeInMs ?? 900;

  try {
    audio.muted = false;
    await audio.play();
    if (Math.abs(audio.volume - targetVolume) > 0.01) {
      await fadeVolume(audio, audio.volume, targetVolume, fadeInMs);
    } else {
      audio.volume = targetVolume;
    }
    return { started: true };
  } catch (error) {
    console.error("Audio resume failed:", error);
    console.warn("Ambience audio resume failed", error);
    return { started: false, error };
  }
}

export async function setAmbientNatureAudioVolume(
  audioRef: MutableRefObject<HTMLAudioElement | null>,
  targetVolume: number,
  durationMs = 350
) {
  const audio = audioRef.current;

  if (!audio || typeof window === "undefined") {
    return;
  }

  const safeTargetVolume = Math.max(0, Math.min(1, targetVolume));

  if (Math.abs(audio.volume - safeTargetVolume) <= 0.01) {
    audio.volume = safeTargetVolume;
    return;
  }

  await fadeVolume(audio, audio.volume, safeTargetVolume, durationMs);
}
