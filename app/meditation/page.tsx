"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage, useSiteCopy } from "@/lib/i18n";
import {
  getNatureSoundPreference,
  pauseAmbientNatureAudio,
  resumeAmbientNatureAudio,
  setNatureSoundPreference,
  startAmbientNatureAudio,
  STRUCTURED_AMBIENT_PENDING_KEY,
  stopAmbientNatureAudio
} from "@/lib/meditation-ambient-audio";
import { handleMeditationComplete as triggerMeditationCompletion, supportsMeditationVibration } from "@/lib/meditation-completion";
import { getRhythmJourneyContent, getRhythmJourneyGuidance, journeyAudioMap } from "@/lib/rhythm-journey";

const CYCLE_SECONDS = 10;
const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const AI_COACH_URL =
  process.env.NEXT_PUBLIC_AI_COACH_URL ||
  "https://chatgpt.com/g/g-69f968bc9a408191a3e5f943912666c0-quiet-rhythm-guide";
const JOURNEY_AUDIO_PENDING_KEY = "meisoulife_journey_audio_pending";
const JOURNEY_AUDIO_DAY_KEY = "meisoulife_journey_day";
const AFFIRMATION_TOTAL_SECONDS = 180;
const AFFIRMATION_AMBIENT_AUDIO_SRC = "/audio/morning/affirmation.mp3";

type BreathPhase = "inhale" | "hold" | "exhale";
type MeditationType = "default" | "morning" | "day" | "night";
type MeditationDoor =
  | "affirmation"
  | "energy"
  | "vision"
  | "focus"
  | "relax"
  | "vitality"
  | "release"
  | "gratitude"
  | "sleep"
  | null;

type StructuredMorningStage =
  | "openingFade"
  | "openingNarration"
  | "breathing"
  | "bodyAwareness"
  | "affirmation"
  | "energy"
  | "vision"
  | "integration"
  | "closing";

type StructuredMorningLine = { at: number; key: string; text: string };

type StructuredMorningCopy = {
  title: string;
  subtitle: string;
  duration: string;
  audioLabel: string;
  pause: string;
  resume: string;
  inhale: string;
  exhale: string;
  completionTitle: string;
  completionMessage: string;
  completionNote: string;
  completionButton: string;
  openingFade: string;
  integration: string;
  openingLines: readonly StructuredMorningLine[];
  closingLines: readonly StructuredMorningLine[];
  affirmationLines?: readonly StructuredMorningLine[];
  awarenessLines?: readonly StructuredMorningLine[];
  energyLines?: readonly StructuredMorningLine[];
  visionLines?: readonly StructuredMorningLine[];
};

const affirmationGateCopy = {
  jp: {
    title: "今日の自分を選ぶ",
    subtitle: "朝を少し明るく始めたいとき",
    duration: "3:00",
    audioLabel: "朝のリチュアル",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "今日の自分を選びました。",
    completionMessage: "この静けさのまま、今日をやさしく始めていきましょう。",
    completionNote: "朝の光に背中をあずけるように、ゆっくりで大丈夫です。",
    completionButton: "朝の扉へ戻る",
    openingFade: "今日の自分を選ぶ",
    integration: "今日の自分を選ぶ",
    openingLines: [
      { at: 15, key: "open-1", text: "それでは、そっと目を閉じてみましょう。" },
      { at: 21, key: "open-2", text: "新しい今日が、静かに始まっています。" },
      { at: 28, key: "open-3", text: "ゆっくり呼吸をしてみましょう。まずは深く息を入れてみましょう。ゆっくり吐いていきます。" }
    ],
    affirmationLines: [
      { at: 80, key: "affirm-1", text: "今日は、目覚めた心で過ごしてみましょう。" },
      { at: 90, key: "affirm-2", text: "今日は、やわらかく前を向いて進んでいきましょう。" },
      { at: 100, key: "affirm-3", text: "今日は、自分の中心を大切にしていきましょう。" },
      { at: 110, key: "affirm-4", text: "今日は、小さな成長を受け取っていきましょう。" },
      { at: 120, key: "affirm-5", text: "今日は、自分を信じて歩いていきましょう。" }
    ],
    closingLines: [
      { at: 160, key: "close-1", text: "いいですね。そのままで大丈夫です。" },
      { at: 168, key: "close-2", text: "今日が、静かに動き始めています。" },
      { at: 176, key: "close-3", text: "あなたらしい今日を、ここから始めていきましょう。" }
    ]
  },
  kr: {
    title: "오늘의 나를 선택하기",
    subtitle: "아침을 조금 더 밝게 시작하고 싶을 때",
    duration: "3:00",
    audioLabel: "아침 리추얼",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "오늘의 나를 선택했습니다.",
    completionMessage: "이 고요함 그대로, 오늘을 부드럽게 시작해 봅시다.",
    completionNote: "아침 빛을 따라가듯 천천히 시작하면 충분합니다.",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "오늘의 나를 선택하기",
    integration: "오늘의 나를 선택하기",
    openingLines: [
      { at: 15, key: "open-1", text: "이제, 눈을 부드럽게 감아볼까요." },
      { at: 21, key: "open-2", text: "새로운 하루가 조용히 시작되고 있습니다." },
      { at: 28, key: "open-3", text: "먼저 천천히 숨을 들이마시고, 편안하게 내쉬어 봅시다." }
    ],
    affirmationLines: [
      { at: 80, key: "affirm-1", text: "오늘은 깨어 있는 마음으로 살아가 봅시다." },
      { at: 90, key: "affirm-2", text: "오늘은 조금 더 밝은 방향으로 나아가 봅시다." },
      { at: 100, key: "affirm-3", text: "오늘은 내 중심을 다정하게 지켜봅시다." },
      { at: 110, key: "affirm-4", text: "오늘은 작은 성장도 기쁘게 받아들여 봅시다." },
      { at: 120, key: "affirm-5", text: "오늘은 나 자신을 믿으며 걸어가 봅시다." }
    ],
    closingLines: [
      { at: 160, key: "close-1", text: "좋아요. 지금 이대로도 충분합니다." },
      { at: 168, key: "close-2", text: "오늘이 조용히 열리고 있습니다." },
      { at: 176, key: "close-3", text: "오늘의 나를, 이 자리에서 함께 선택해 봅시다." }
    ]
  },
  en: {
    title: "Choose Today’s Self",
    subtitle: "When you want to begin the morning a little brighter",
    duration: "3:00",
    audioLabel: "Morning Ritual",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "You have chosen who you are today.",
    completionMessage: "From this quiet place, let the day begin gently.",
    completionNote: "There is no need to rush. You can begin as slowly as morning light.",
    completionButton: "Return to Morning Gate",
    openingFade: "Choose Today’s Self",
    integration: "Choose Today’s Self",
    openingLines: [
      { at: 15, key: "open-1", text: "Let's gently close our eyes." },
      { at: 21, key: "open-2", text: "A new day is quietly beginning." },
      { at: 28, key: "open-3", text: "First, take a slow breath in, and gently let it go." }
    ],
    affirmationLines: [
      { at: 80, key: "affirm-1", text: "Today, let me move through this day with an awake heart." },
      { at: 90, key: "affirm-2", text: "Today, let me keep facing forward with quiet warmth." },
      { at: 100, key: "affirm-3", text: "Today, let me stay close to my own center." },
      { at: 110, key: "affirm-4", text: "Today, let me welcome even a small moment of growth." },
      { at: 120, key: "affirm-5", text: "Today, let me trust myself a little more." }
    ],
    closingLines: [
      { at: 160, key: "close-1", text: "That's enough. You are already here." },
      { at: 168, key: "close-2", text: "Your day is beginning quietly now." },
      { at: 176, key: "close-3", text: "Let's begin the day just as you are." }
    ]
  }
} as const;

const energyGateCopy = {
  jp: {
    title: "脳と身体を目覚めさせる",
    subtitle: "まだ身体が完全に起きていないとき",
    duration: "3:00",
    audioLabel: "朝のエネルギーリチュアル",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "脳と体が目覚めました。",
    completionMessage: "目覚めたエネルギーと一緒に、今日をやさしく始めていきましょう。",
    completionNote: "身体を少しずつひらきながら、無理なく動き出していけば大丈夫です。",
    completionButton: "朝の扉へ戻る",
    openingFade: "脳と身体を目覚めさせる",
    integration: "脳と身体を目覚めさせる",
    openingLines: [
      { at: 15, key: "open-1", text: "それでは、目をやさしく閉じてみましょう。" },
      { at: 23, key: "open-2", text: "まずは、ゆっくり息を吸って、やわらかく吐いてみましょう。" },
      { at: 32, key: "open-3", text: "今の身体の感覚に、そっと意識を向けてみましょう。" },
      { at: 40, key: "open-4", text: "あなたの身体は今、少しずつ目を覚まし始めています。" }
    ],
    awarenessLines: [
      { at: 52, key: "body-1", text: "肩の力を、やさしくほどいていきましょう。" },
      { at: 64, key: "body-2", text: "胸も、ほんの少しひらいてみましょう。" },
      { at: 76, key: "body-3", text: "おへその下あたりに、静かな中心を感じてみましょう。" },
      { at: 88, key: "body-4", text: "そのまま、手の先や足の先まで意識を広げてみましょう。" }
    ],
    energyLines: [
      { at: 102, key: "energy-1", text: "息を吸うたびに、新しいエネルギーが静かに入ってきます。" },
      { at: 116, key: "energy-2", text: "そして吐くたびに、身体がふわりと目覚めていきます。" },
      { at: 132, key: "energy-3", text: "今日は、この生命力と一緒に動いていきましょう。" },
      { at: 140, key: "energy-4", text: "今日は、元気をやさしく育てながら過ごしていきましょう。" },
      { at: 148, key: "energy-5", text: "今日は、身体と心をそろえて目覚めていきましょう。" }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "ありがとうございます。いい流れですね。" },
      { at: 175, key: "close-2", text: "脳と体が、やさしく目覚めてきました。" },
      { at: 179, key: "close-3", text: "今日のエネルギーとともに、ゆっくり歩き始めましょう。" }
    ]
  },
  kr: {
    title: "뇌와 몸을 깨우기",
    subtitle: "아직 몸이 완전히 깨어나지 않았을 때",
    duration: "3:00",
    audioLabel: "아침 에너지 리추얼",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "뇌와 몸이 깨어났습니다.",
    completionMessage: "깨어난 에너지와 함께, 오늘을 부드럽게 시작해 봅시다.",
    completionNote: "몸을 조금씩 열어가며, 무리하지 않고 하루를 열면 충분합니다.",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "뇌와 몸을 깨우기",
    integration: "뇌와 몸을 깨우기",
    openingLines: [
      { at: 15, key: "open-1", text: "이제 눈을 부드럽게 감아볼까요." },
      { at: 23, key: "open-2", text: "먼저 천천히 숨을 들이마시고, 편안하게 내쉬어 봅시다." },
      { at: 32, key: "open-3", text: "지금 몸에서 느껴지는 감각을 가만히 만나봅시다." },
      { at: 40, key: "open-4", text: "당신의 몸은 지금, 조금씩 깨어나기 시작하고 있습니다." }
    ],
    awarenessLines: [
      { at: 52, key: "body-1", text: "어깨에 남아 있던 힘을 부드럽게 풀어볼게요." },
      { at: 64, key: "body-2", text: "가슴도 조금만 가볍게 열어봅시다." },
      { at: 76, key: "body-3", text: "배 아래쪽에 있는 조용한 중심을 느껴봅시다." },
      { at: 88, key: "body-4", text: "그 느낌을 손끝과 발끝까지 천천히 넓혀봅시다." }
    ],
    energyLines: [
      { at: 102, key: "energy-1", text: "숨을 들이쉴 때마다 새로운 에너지가 조용히 들어옵니다." },
      { at: 116, key: "energy-2", text: "그리고 숨을 내쉴 때마다 몸이 한결 가볍게 깨어납니다." },
      { at: 132, key: "energy-3", text: "오늘은 이 생명력과 함께 움직여 봅시다." },
      { at: 140, key: "energy-4", text: "오늘은 내 안의 생기를 천천히 깨워봅시다." },
      { at: 148, key: "energy-5", text: "오늘은 몸과 마음을 함께 깨우며 시작해 봅시다." }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "좋아요. 아주 잘하고 계십니다." },
      { at: 175, key: "close-2", text: "뇌와 몸이 부드럽게 깨어났습니다." },
      { at: 179, key: "close-3", text: "이 에너지와 함께, 오늘을 천천히 시작해 봅시다." }
    ]
  },
  en: {
    title: "Wake Brain and Body",
    subtitle: "When your body has not fully awakened yet",
    duration: "3:00",
    audioLabel: "Morning Energy Ritual",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "Your mind and body are waking up.",
    completionMessage: "Let this gentle energy carry you into the day.",
    completionNote: "You only need to open a little. From here, the day can begin naturally.",
    completionButton: "Return to Morning Gate",
    openingFade: "Wake Brain and Body",
    integration: "Wake Brain and Body",
    openingLines: [
      { at: 15, key: "open-1", text: "Let's gently close our eyes." },
      { at: 23, key: "open-2", text: "Now take a slow breath in, and gently let it go." },
      { at: 32, key: "open-3", text: "Notice what your body is feeling right now." },
      { at: 40, key: "open-4", text: "Little by little, your body is beginning to wake." }
    ],
    awarenessLines: [
      { at: 52, key: "body-1", text: "Let the tension in your shoulders soften a little." },
      { at: 64, key: "body-2", text: "If it feels right, gently open through the chest." },
      { at: 76, key: "body-3", text: "Notice the quiet center below your navel." },
      { at: 88, key: "body-4", text: "And from there, let your awareness reach your fingertips and toes." }
    ],
    energyLines: [
      { at: 102, key: "energy-1", text: "With each inhale, fresh energy can quietly enter." },
      { at: 116, key: "energy-2", text: "And with each exhale, your body can wake a little more lightly." },
      { at: 132, key: "energy-3", text: "Today, let me move with living energy." },
      { at: 140, key: "energy-4", text: "Today, let me welcome a little more warmth and vitality." },
      { at: 148, key: "energy-5", text: "Today, let me wake gently in both body and mind." }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "Thank you. That is enough for now." },
      { at: 175, key: "close-2", text: "Your mind and body are waking a little more." },
      { at: 179, key: "close-3", text: "Let's begin the day with this energy beside us." }
    ]
  }
} as const;

const visionGateCopy = {
  jp: {
    title: "ビジョンスクリーン瞑想",
    subtitle: "今日の一日を、心の中で静かに描く3分。",
    duration: "3:00",
    audioLabel: "朝のビジョンリチュアル",
    pause: "一度止める",
    resume: "続ける",
    inhale: "吸う",
    exhale: "吐く",
    completionTitle: "心に描いた一日が始まります。",
    completionMessage: "心に描いた小さな方向が、やさしく未来へつながっていきます。",
    completionNote: "焦らなくて大丈夫です。胸に浮かんだ景色を大切に、今日を始めていきましょう。",
    completionButton: "朝の扉へ戻る",
    openingFade: "ビジョンスクリーン瞑想",
    integration: "今日の一日を心に描く",
    openingLines: [
      { at: 15, key: "open-1", text: "それでは、目を軽く閉じてみましょう。" },
      { at: 23, key: "open-2", text: "呼吸をゆっくり吸って、ゆっくりほどいていきましょう。" },
      { at: 32, key: "open-3", text: "今この瞬間、新しい今日が静かに始まっています。" },
      { at: 41, key: "open-4", text: "今日は、どんなふうに過ごしていきたいですか。" }
    ],
    visionLines: [
      { at: 56, key: "vision-1", text: "急がなくて大丈夫です。" },
      { at: 64, key: "vision-2", text: "今すぐ答えを見つけようとしなくても大丈夫です。" },
      { at: 74, key: "vision-3", text: "心の中に、いちばん大切なひと場面を、そっと浮かべてみましょう。" },
      { at: 88, key: "vision-4", text: "健やかな自分の姿かもしれません。" },
      { at: 96, key: "vision-5", text: "やわらかく笑っている自分の姿かもしれません。" },
      { at: 106, key: "vision-6", text: "誰かの力になっている姿かもしれません。" },
      { at: 114, key: "vision-7", text: "長く願ってきた生き方の景色かもしれません。" },
      { at: 124, key: "vision-8", text: "その場面を、心のスクリーンにやさしく映してみましょう。" },
      { at: 134, key: "vision-9", text: "もう少しずつ始まっているように、自然に感じてみましょう。" },
      { at: 144, key: "vision-10", text: "その中のあなたは、どんな表情をしていますか。" },
      { at: 152, key: "vision-11", text: "どんな心で生きていて、どんなエネルギーを分かち合っていますか。" }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "未来は遠くではなく、今の小さな選択の中で育っていきます。" },
      { at: 176, key: "close-2", text: "今日は、私らしく歩いていきましょう。" },
      { at: 179, key: "close-3", text: "小さな微笑みとともに、今日の道を始めていきましょう。" }
    ]
  },
  kr: {
    title: "비전 스크린 명상",
    subtitle: "오늘 하루의 방향을 마음속에 조용히 그리는 3분.",
    duration: "3:00",
    audioLabel: "아침 비전 리추얼",
    pause: "잠시 멈추기",
    resume: "이어가기",
    inhale: "들이쉬기",
    exhale: "내쉬기",
    completionTitle: "오늘 마음에 그린 한 장면이 시작됩니다.",
    completionMessage: "오늘 마음에 그린 한 장면이, 조용히 미래로 이어집니다.",
    completionNote: "가슴에 떠오른 방향을 품고, 오늘의 길을 천천히 시작해 봅시다.",
    completionButton: "아침의 문으로 돌아가기",
    openingFade: "비전 스크린 명상",
    integration: "오늘 하루를 마음에 그립니다",
    openingLines: [
      { at: 15, key: "open-1", text: "이제 눈을 가볍게 감아볼까요." },
      { at: 23, key: "open-2", text: "숨을 천천히 들이마시고, 부드럽게 내쉬어 봅시다." },
      { at: 32, key: "open-3", text: "지금 이 순간, 새로운 하루가 조용히 시작되고 있습니다." },
      { at: 41, key: "open-4", text: "오늘은 어떤 하루를 살아가고 싶나요?" }
    ],
    visionLines: [
      { at: 56, key: "vision-1", text: "서두르지 않아도 됩니다." },
      { at: 64, key: "vision-2", text: "지금 바로 정답을 찾으려 하지 않아도 됩니다." },
      { at: 74, key: "vision-3", text: "마음속에 가장 소중한 한 장면을 천천히 떠올려 봅시다." },
      { at: 88, key: "vision-4", text: "건강한 나의 모습일 수도 있고, 밝게 웃고 있는 모습일 수도 있습니다." },
      { at: 102, key: "vision-5", text: "누군가에게 도움이 되는 모습일 수도 있고, 오랫동안 꿈꾸어 온 삶의 모습일 수도 있습니다." },
      { at: 118, key: "vision-6", text: "그 장면을 마음의 스크린에 천천히 비춰봅시다." },
      { at: 128, key: "vision-7", text: "이미 조금씩 이루어지고 있는 것처럼 자연스럽게 느껴봅시다." },
      { at: 138, key: "vision-8", text: "그 모습 속의 나는 어떤 표정을 하고 있나요?" },
      { at: 146, key: "vision-9", text: "어떤 마음으로 살아가고 있나요?" },
      { at: 154, key: "vision-10", text: "어떤 에너지를 나누고 있나요?" }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "미래는 멀리 있는 것이 아니라, 지금의 작은 선택 속에서 만들어집니다." },
      { at: 176, key: "close-2", text: "오늘은 나다운 가능성을 조용히 선택해 봅시다." },
      { at: 179, key: "close-3", text: "가벼운 미소와 함께, 오늘의 길을 시작해 봅시다." }
    ]
  },
  en: {
    title: "Vision Screen Meditation",
    subtitle: "A quiet 3-minute meditation to visualize the direction of your day.",
    duration: "3:00",
    audioLabel: "Morning Vision Ritual",
    pause: "Pause",
    resume: "Continue",
    inhale: "Inhale",
    exhale: "Exhale",
    completionTitle: "The scene in your heart can begin today.",
    completionMessage: "The quiet scene you held today can gently grow into tomorrow.",
    completionNote: "Hold this gentle direction close, and let the day begin softly from here.",
    completionButton: "Return to Morning Gate",
    openingFade: "Vision Screen Meditation",
    integration: "Quietly envision your day",
    openingLines: [
      { at: 15, key: "open-1", text: "Let's gently close our eyes." },
      { at: 23, key: "open-2", text: "Take a slow breath in, and slowly let it go." },
      { at: 32, key: "open-3", text: "In this moment, a new day is quietly beginning." },
      { at: 41, key: "open-4", text: "What kind of day would you like to create today?" }
    ],
    visionLines: [
      { at: 56, key: "vision-1", text: "There is no need to hurry." },
      { at: 64, key: "vision-2", text: "There is no need to force an answer right away." },
      { at: 74, key: "vision-3", text: "Simply let one meaningful scene rise gently in your heart." },
      { at: 88, key: "vision-4", text: "It may be a healthier version of you." },
      { at: 96, key: "vision-5", text: "It may be you smiling with quiet brightness." },
      { at: 106, key: "vision-6", text: "It may be you helping someone with care." },
      { at: 114, key: "vision-7", text: "It may be a life you have long hoped to live." },
      { at: 124, key: "vision-8", text: "Let that scene appear slowly on the screen of your heart." },
      { at: 136, key: "vision-9", text: "See if you can feel it naturally, as though it has already begun." },
      { at: 146, key: "vision-10", text: "What expression is on your face there?" },
      { at: 154, key: "vision-11", text: "What kind of energy are you sharing with the world?" }
    ],
    closingLines: [
      { at: 170, key: "close-1", text: "The future is not far away. It is shaped inside the small choices of this moment." },
      { at: 176, key: "close-2", text: "Today, let me choose what feels most true." },
      { at: 179, key: "close-3", text: "With a small smile, let's begin the day." }
    ]
  }
} as const;

function normalizeDuration(value: string | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 60;
  }

  return parsed;
}

function normalizeMeditationType(value: string | null): MeditationType {
  if (value === "morning" || value === "day" || value === "night") {
    return value;
  }

  return "default";
}

function normalizeDoor(value: string | null): MeditationDoor {
  if (
    value === "affirmation" ||
    value === "energy" ||
    value === "vision" ||
    value === "focus" ||
    value === "relax" ||
    value === "vitality" ||
    value === "release" ||
    value === "gratitude" ||
    value === "sleep"
  ) {
    return value;
  }

  return null;
}

function formatRemainingTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function getBreathPhase(elapsedSeconds: number): BreathPhase {
  const cyclePosition = elapsedSeconds % CYCLE_SECONDS;

  if (cyclePosition < INHALE_SECONDS) {
    return "inhale";
  }

  if (cyclePosition < INHALE_SECONDS + HOLD_SECONDS) {
    return "hold";
  }

  return "exhale";
}

function getDurationVariant(totalSeconds: number) {
  return totalSeconds >= 180 ? "threeMinutes" : "sixty";
}

function getJourneyGuidanceStage(elapsedSeconds: number, totalSeconds: number) {
  if (elapsedSeconds < 8) {
    return "opening";
  }

  if (elapsedSeconds >= Math.max(totalSeconds - 5, 0)) {
    return "closing";
  }

  return "breathing";
}

function getMorningGateStage(door: MeditationDoor, elapsedSeconds: number): StructuredMorningStage {
  if (door === "energy") {
    if (elapsedSeconds < 15) return "openingFade";
    if (elapsedSeconds < 45) return "openingNarration";
    if (elapsedSeconds < 100) return "bodyAwareness";
    if (elapsedSeconds < 150) return "energy";
    if (elapsedSeconds < 170) return "integration";
    return "closing";
  }

  if (door === "vision") {
    if (elapsedSeconds < 15) return "openingFade";
    if (elapsedSeconds < 45) return "openingNarration";
    if (elapsedSeconds < 160) return "vision";
    if (elapsedSeconds < 170) return "integration";
    return "closing";
  }

  if (elapsedSeconds < 15) return "openingFade";
  if (elapsedSeconds < 35) return "openingNarration";
  if (elapsedSeconds < 80) return "breathing";
  if (elapsedSeconds < 130) return "affirmation";
  if (elapsedSeconds < 160) return "integration";
  return "closing";
}

function getStructuredMorningSpeechSettings(language: "jp" | "kr" | "en") {
  if (language === "kr") {
    return {
      lang: "ko-KR",
      rate: 0.84,
      pitch: 1.01,
      volume: 0.94,
      preferredNames: ["Yuna", "Sora", "Google 한국어", "Siri"]
    };
  }

  if (language === "en") {
    return {
      lang: "en-US",
      rate: 0.85,
      pitch: 1,
      volume: 0.94,
      preferredNames: ["Samantha", "Ava", "Victoria", "Google US English", "Siri"]
    };
  }

  return {
    lang: "ja-JP",
    rate: 0.78,
    pitch: 0.98,
    volume: 0.9,
    preferredNames: ["Kyoko", "Otoya", "Google 日本語", "Siri"]
  };
}

function pickStructuredMorningVoice(
  voices: SpeechSynthesisVoice[],
  lang: string,
  preferredNames: string[]
) {
  const matchingVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2))
  );

  for (const preferredName of preferredNames) {
    const matchedVoice = matchingVoices.find((voice) => voice.name.includes(preferredName));

    if (matchedVoice) {
      return matchedVoice;
    }
  }

  const localVoice = matchingVoices.find((voice) => voice.localService);

  if (localVoice) {
    return localVoice;
  }

  return matchingVoices[0];
}

function requiresMobileAudioGesture() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || "";
  const isMobileUserAgent = /iPhone|iPad|iPod|Android|Mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);
  const isTouchViewport = navigator.maxTouchPoints > 0 && window.matchMedia("(max-width: 768px)").matches;

  return isMobileUserAgent || isTouchViewport;
}

export default function MeditationPage() {
  const { language } = useLanguage();
  const copy = useSiteCopy().meditationPage;
  const journeyCopy = useMemo(() => getRhythmJourneyContent(language), [language]);
  const localizedLanguage = language === "kr" || language === "en" || language === "jp" ? language : "jp";
  const affirmationCopy = affirmationGateCopy[localizedLanguage];
  const energyCopy = energyGateCopy[localizedLanguage];
  const visionCopy = visionGateCopy[localizedLanguage];
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [meditationType, setMeditationType] = useState<MeditationType>("default");
  const [meditationDoor, setMeditationDoor] = useState<MeditationDoor>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [vibrationSupported, setVibrationSupported] = useState(false);
  const [hasUserGesture, setHasUserGesture] = useState(false);
  const [ambientVideoFailed, setAmbientVideoFailed] = useState(false);
  const [showAmbientRetry, setShowAmbientRetry] = useState(false);
  const [needsUserStart, setNeedsUserStart] = useState(false);
  const [pendingStructuredAmbientStart, setPendingStructuredAmbientStart] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [requiresExplicitAudioStart, setRequiresExplicitAudioStart] = useState(false);
  const [affirmationMessage, setAffirmationMessage] = useState<string | null>(null);
  const [journeyMode, setJourneyMode] = useState(false);
  const [journeyDay, setJourneyDay] = useState<number | null>(null);
  const [returnToHref, setReturnToHref] = useState("/rhythm-journey");
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const completionHandledRef = useRef(false);
  const spokenAffirmationKeysRef = useRef<Set<string>>(new Set());
  const structuredSpeechTimeoutRef = useRef<number | null>(null);
  const structuredSpeechSequenceRef = useRef(0);
  const isPausedRef = useRef(false);
  const isCompleteRef = useRef(false);
  const elapsedTotalSeconds = totalSeconds - secondsLeft;
  const phase = useMemo(() => getBreathPhase(elapsedTotalSeconds), [elapsedTotalSeconds]);
  const isComplete = secondsLeft <= 0;
  const isAffirmationGate = meditationType === "morning" && meditationDoor === "affirmation";
  const isEnergyGate = meditationType === "morning" && meditationDoor === "energy";
  const isVisionGate = meditationType === "morning" && meditationDoor === "vision";
  const isStructuredMorningGate = isAffirmationGate || isEnergyGate || isVisionGate;
  const morningGateCopy: StructuredMorningCopy = isVisionGate ? visionCopy : isEnergyGate ? energyCopy : affirmationCopy;
  const content = copy.variants[meditationType];
  const hideSoundToggle = meditationType === "morning";
  const durationVariant = getDurationVariant(totalSeconds);
  const durationTextSet = copy.durationTexts?.[durationVariant];
  const journeyAudioSource = journeyDay ? journeyAudioMap[journeyDay] : undefined;
  const journeyGuidance = journeyDay ? getRhythmJourneyGuidance(language, journeyDay) : undefined;
  const ambientAudioSource =
    journeyMode && journeyAudioSource
      ? journeyAudioSource
      : isAffirmationGate
        ? AFFIRMATION_AMBIENT_AUDIO_SRC
        : undefined;
  const ambientAudioVolume = journeyMode ? 0.65 : isAffirmationGate ? 0.2 : isStructuredMorningGate ? 0.22 : undefined;
  const journeyGuidanceStage = getJourneyGuidanceStage(elapsedTotalSeconds, totalSeconds);
  const affirmationStage = isStructuredMorningGate ? getMorningGateStage(meditationDoor, elapsedTotalSeconds) : null;
  const topText = journeyMode
    ? journeyCopy.timerTopText
    : meditationType === "morning" || meditationType === "night"
      ? content.topText
      : durationTextSet?.topText || content.topText;
  const introText = journeyMode ? journeyCopy.timerSubText : content.intro;
  const completionTitle =
    meditationType === "morning" || meditationType === "night"
      ? content.completionTitle
      : durationTextSet?.completionTitle || content.completionTitle;
  const circleScaleClass =
    phase === "inhale" ? "scale-110" : phase === "hold" ? "scale-110" : "scale-90";
  const journeyOverlayMessage =
    journeyMode && journeyGuidance
      ? journeyGuidanceStage === "opening"
        ? journeyGuidance.opening
        : journeyGuidanceStage === "closing"
          ? journeyGuidance.closing
          : null
      : null;
  const affirmationProgress = isStructuredMorningGate ? Math.min(100, (elapsedTotalSeconds / AFFIRMATION_TOTAL_SECONDS) * 100) : 0;

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const nextDuration = normalizeDuration(searchParams.get("duration"));
    const nextType = normalizeMeditationType(searchParams.get("type"));
    const nextDoor = normalizeDoor(searchParams.get("door"));
    const nextJourneyMode = searchParams.get("journey") === "1";
    const nextJourneyDay = Number(searchParams.get("day"));
    const nextReturnTo = searchParams.get("returnTo");
    const pendingJourneyAudio =
      typeof window === "undefined" ? null : window.sessionStorage.getItem(JOURNEY_AUDIO_PENDING_KEY);
    const pendingStructuredAmbientAudio =
      typeof window === "undefined" ? null : window.sessionStorage.getItem(STRUCTURED_AMBIENT_PENDING_KEY);
    const storedJourneyDay =
      typeof window === "undefined" ? null : window.sessionStorage.getItem(JOURNEY_AUDIO_DAY_KEY);
    const resolvedJourneyDay = Number.isInteger(nextJourneyDay) && nextJourneyDay >= 1 && nextJourneyDay <= 7
      ? nextJourneyDay
      : Number(storedJourneyDay);

    const isThreeMinuteMorningDoor =
      nextType === "morning" &&
      (nextDoor === "affirmation" || nextDoor === "energy" || nextDoor === "vision");
    const shouldResumeStructuredAmbient = nextType === "morning" && nextDoor === "affirmation" && pendingStructuredAmbientAudio === "1";
    const mobileNeedsGesture = requiresMobileAudioGesture();
    const isProgramMode = nextJourneyMode || nextType !== "default";

    const resolvedDuration = isThreeMinuteMorningDoor ? AFFIRMATION_TOTAL_SECONDS : nextDuration;
    setTotalSeconds(resolvedDuration);
    setSecondsLeft(resolvedDuration);
    setMeditationType(nextType);
    setMeditationDoor(nextDoor);
    const nextSoundEnabled =
      nextJourneyMode && pendingJourneyAudio
        ? true
        : shouldResumeStructuredAmbient
          ? true
          : getNatureSoundPreference();
    const shouldPromptForAudioStart = mobileNeedsGesture && (isProgramMode || nextSoundEnabled);
    setSoundEnabled(nextSoundEnabled);
    setPendingStructuredAmbientStart(shouldResumeStructuredAmbient);
    setJourneyMode(nextJourneyMode);
    setJourneyDay(Number.isInteger(resolvedJourneyDay) && resolvedJourneyDay >= 1 && resolvedJourneyDay <= 7 ? resolvedJourneyDay : null);
    setReturnToHref(nextReturnTo || "/rhythm-journey");
    setAmbientVideoFailed(false);
    setShowAmbientRetry(false);
    setNeedsUserStart(shouldPromptForAudioStart);
    setRequiresExplicitAudioStart(shouldPromptForAudioStart);
    setHasUserGesture(!shouldPromptForAudioStart);
    setIsPaused(mobileNeedsGesture && isProgramMode);
    setAffirmationMessage(null);
    spokenAffirmationKeysRef.current = new Set();
    completionHandledRef.current = false;
    console.log("[Journey Audio] journeyMode:", nextJourneyMode);
    console.log("[Journey Audio] journeyDay:", resolvedJourneyDay);
    console.log(
      "[Journey Audio] src:",
      Number.isInteger(resolvedJourneyDay) && resolvedJourneyDay >= 1 && resolvedJourneyDay <= 7
        ? journeyAudioMap[resolvedJourneyDay]
        : undefined
    );
    console.log("[Journey Audio] pending:", pendingJourneyAudio);
    console.log("[Journey Audio] audio element:", ambientAudioRef.current);
  }, []);

  async function handleAmbientStartResult(result: { started: boolean; error?: unknown }, manual = false) {
    if (journeyMode && journeyDay) {
      console.log("[Journey Audio] journeyMode:", journeyMode);
      console.log("[Journey Audio] journeyDay:", journeyDay);
      console.log("[Journey Audio] src:", ambientAudioSource);
      console.log(
        "[Journey Audio] pending:",
        typeof window === "undefined" ? null : window.sessionStorage.getItem(JOURNEY_AUDIO_PENDING_KEY)
      );
      console.log("[Journey Audio] audio element:", ambientAudioRef.current);
    }

    if (result.started) {
      if (journeyMode) {
        console.log("[Journey Audio] play started");
      }

      setShowAmbientRetry(false);
      setNeedsUserStart(false);
      setRequiresExplicitAudioStart(false);
      setIsPaused(false);
      setSoundEnabled(true);
      setNatureSoundPreference(true);
      setPendingStructuredAmbientStart(false);

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(JOURNEY_AUDIO_PENDING_KEY);
        window.sessionStorage.removeItem(JOURNEY_AUDIO_DAY_KEY);
        window.sessionStorage.removeItem(STRUCTURED_AMBIENT_PENDING_KEY);
      }

      return;
    }

    if (journeyMode) {
      setSoundEnabled(false);
      setNatureSoundPreference(false);
      setNeedsUserStart(true);
      setIsPaused(true);
      console.warn("[Journey Audio] play failed");
      if (result.error) {
        console.error(`[Journey Audio] ${manual ? "manual start" : "autoplay"} failed:`, result.error);
      }

      if (typeof window !== "undefined") {
        console.warn("[Journey Audio] exact pending state kept for manual retry");
      }
    } else if (isStructuredMorningGate) {
      setSoundEnabled(false);
      setNeedsUserStart(true);
      setIsPaused(true);
      setShowAmbientRetry(false);
      setPendingStructuredAmbientStart(false);
      if (result.error) {
        console.error("[Morning Gate Audio] autoplay failed:", result.error);
      }
    } else {
      setShowAmbientRetry(true);
    }
  }

  async function handleJourneyAudioStart() {
    if (!journeyMode || !ambientAudioSource) {
      return;
    }

    setHasUserGesture(true);
    setRequiresExplicitAudioStart(false);

    if (audioContextRef.current?.state === "suspended") {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn("[journey-audio] failed to resume audio context", error);
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.getVoices();
      } catch (error) {
        console.warn("[journey-audio] speech synthesis unavailable during unlock", error);
      }
    }

    const result = await startAmbientNatureAudio(ambientAudioRef, true, ambientAudioSource, ambientAudioVolume);
    await handleAmbientStartResult(result, true);
  }

  useEffect(() => {
    setVibrationSupported(supportsMeditationVibration());

    const markGesture = () => {
      setHasUserGesture(true);

      if (requiresExplicitAudioStart) {
        return;
      }

      if (!isComplete && soundEnabled && !journeyMode && !isStructuredMorningGate) {
        startAmbientNatureAudio(ambientAudioRef, soundEnabled, ambientAudioSource, ambientAudioVolume).then((result) => {
          void handleAmbientStartResult(result);
        });
      }
    };

    window.addEventListener("pointerdown", markGesture, { once: true });
    window.addEventListener("keydown", markGesture, { once: true });

    return () => {
      window.removeEventListener("pointerdown", markGesture);
      window.removeEventListener("keydown", markGesture);
      stopAmbientNatureAudio(ambientAudioRef);
    };
  }, [ambientAudioSource, ambientAudioVolume, isComplete, isStructuredMorningGate, journeyMode, requiresExplicitAudioStart, soundEnabled]);

  useEffect(() => {
    if (secondsLeft <= 0 || isPaused || needsUserStart) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isPaused, needsUserStart, secondsLeft]);

  useEffect(() => {
    if (!isStructuredMorningGate || !soundEnabled) {
      return;
    }

    if (isPaused) {
      pauseAmbientNatureAudio(ambientAudioRef);
      return;
    }

    if (!hasUserGesture || isComplete) {
      return;
    }

    resumeAmbientNatureAudio(ambientAudioRef, true, ambientAudioVolume).then((result) => {
      if (!result.started && ambientAudioSource) {
        startAmbientNatureAudio(ambientAudioRef, true, ambientAudioSource, ambientAudioVolume).then((startResult) => {
          void handleAmbientStartResult(startResult, true);
        });
      }
    });
  }, [ambientAudioSource, ambientAudioVolume, hasUserGesture, isComplete, isPaused, isStructuredMorningGate, soundEnabled]);

  useEffect(() => {
    if (isComplete || !soundEnabled) {
      stopAmbientNatureAudio(ambientAudioRef);
      return;
    }

    if (!hasUserGesture || journeyMode || isStructuredMorningGate) {
      return;
    }

    startAmbientNatureAudio(ambientAudioRef, soundEnabled, ambientAudioSource, ambientAudioVolume).then((result) => {
      void handleAmbientStartResult(result);
    });

    return () => {
      if (isComplete) {
        stopAmbientNatureAudio(ambientAudioRef);
      }
    };
  }, [ambientAudioSource, ambientAudioVolume, hasUserGesture, isComplete, isStructuredMorningGate, journeyMode, soundEnabled]);

  useEffect(() => {
    if (!pendingStructuredAmbientStart || !isAffirmationGate || !ambientAudioSource || isComplete || requiresExplicitAudioStart) {
      return;
    }

    startAmbientNatureAudio(ambientAudioRef, true, ambientAudioSource, ambientAudioVolume).then((result) => {
      void handleAmbientStartResult(result);
    });
  }, [ambientAudioSource, ambientAudioVolume, isAffirmationGate, isComplete, pendingStructuredAmbientStart, requiresExplicitAudioStart]);

  useEffect(() => {
    if (!journeyMode || !ambientAudioSource || !soundEnabled || isComplete || requiresExplicitAudioStart) {
      return;
    }

    startAmbientNatureAudio(ambientAudioRef, true, ambientAudioSource, ambientAudioVolume).then((result) => {
      void handleAmbientStartResult(result);
    });
  }, [ambientAudioSource, ambientAudioVolume, isComplete, journeyMode, requiresExplicitAudioStart, soundEnabled]);

  useEffect(() => {
    if (!isComplete || completionHandledRef.current) {
      return;
    }

    completionHandledRef.current = true;
    runMeditationComplete();
  }, [isComplete, hasUserGesture, soundEnabled, vibrationEnabled]);

  useEffect(() => {
    if (!isStructuredMorningGate || isComplete || isPaused || typeof window === "undefined") {
      return;
    }

    const allLines = [
      ...morningGateCopy.openingLines,
      ...(morningGateCopy.awarenessLines ?? []),
      ...(morningGateCopy.affirmationLines ?? []),
      ...(morningGateCopy.energyLines ?? []),
      ...(morningGateCopy.visionLines ?? []),
      ...morningGateCopy.closingLines
    ];
    const nextLine = allLines.find(
      (line) => elapsedTotalSeconds >= line.at && !spokenAffirmationKeysRef.current.has(line.key)
    );

    if (!nextLine) {
      return;
    }

    spokenAffirmationKeysRef.current.add(nextLine.key);
    setAffirmationMessage(nextLine.text);

    if ("speechSynthesis" in window) {
      try {
        const settings = getStructuredMorningSpeechSettings(language);
        const synth = window.speechSynthesis;
        structuredSpeechSequenceRef.current += 1;
        const speechSequence = structuredSpeechSequenceRef.current;

        if (structuredSpeechTimeoutRef.current) {
          window.clearTimeout(structuredSpeechTimeoutRef.current);
          structuredSpeechTimeoutRef.current = null;
        }

        const isFirstStructuredLine = spokenAffirmationKeysRef.current.size === 1;
        const speechDelayMs = isFirstStructuredLine ? 360 : 220;

        const queueSpeak = (attempt: number) => {
          if (
            structuredSpeechSequenceRef.current !== speechSequence ||
            isPausedRef.current ||
            isCompleteRef.current
          ) {
            return;
          }

          if (synth.speaking || synth.pending) {
            if (attempt >= 12) {
              synth.cancel();
            } else {
              structuredSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(attempt + 1), 140);
              return;
            }
          }

          const utterance = new SpeechSynthesisUtterance(nextLine.text);
          utterance.lang = settings.lang;
          utterance.rate = settings.rate;
          utterance.pitch = settings.pitch;
          utterance.volume = settings.volume;

          const selectedVoice = pickStructuredMorningVoice(
            synth.getVoices(),
            settings.lang,
            settings.preferredNames
          );

          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }

          utterance.onstart = () => {
            console.log("[structured-meditation][tts] started", language, nextLine.key);
          };
          utterance.onerror = (event) => {
            console.error("[structured-meditation][tts] failed", language, nextLine.key, event.error);
            structuredSpeechTimeoutRef.current = null;
          };
          utterance.onend = () => {
            structuredSpeechTimeoutRef.current = null;
          };

          synth.speak(utterance);
        };

        structuredSpeechTimeoutRef.current = window.setTimeout(() => queueSpeak(0), speechDelayMs);
      } catch (error) {
        console.warn("[affirmation-gate] speech synthesis unavailable", error);
      }
    }
  }, [elapsedTotalSeconds, isComplete, isPaused, isStructuredMorningGate, language, morningGateCopy]);

  useEffect(() => {
    if (!isStructuredMorningGate || typeof window === "undefined") {
      return;
    }

    if (affirmationStage === "openingFade") {
      setAffirmationMessage(morningGateCopy.openingFade);
      return;
    }

    if (affirmationStage === "breathing" || affirmationStage === "bodyAwareness") {
      setAffirmationMessage(phase === "inhale" ? morningGateCopy.inhale : morningGateCopy.exhale);
      return;
    }

    if (affirmationStage === "integration") {
      setAffirmationMessage(morningGateCopy.integration);
    }
  }, [affirmationStage, isStructuredMorningGate, morningGateCopy, phase]);

  useEffect(() => {
    return () => {
      if (structuredSpeechTimeoutRef.current) {
        window.clearTimeout(structuredSpeechTimeoutRef.current);
        structuredSpeechTimeoutRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        structuredSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  async function runMeditationComplete() {
    await stopAmbientNatureAudio(ambientAudioRef);
    await triggerMeditationCompletion({
      hasUserGesture,
      soundEnabled,
      vibrationEnabled,
      audioContextRef
    });
  }

  async function handleSoundToggle() {
    setHasUserGesture(true);
    const next = !soundEnabled;

    if (next) {
      const result = await startAmbientNatureAudio(ambientAudioRef, true, ambientAudioSource, ambientAudioVolume);
      await handleAmbientStartResult(result, true);
    } else {
      setSoundEnabled(false);
      setNatureSoundPreference(false);
      setShowAmbientRetry(false);
      setNeedsUserStart(false);
      stopAmbientNatureAudio(ambientAudioRef);
    }
  }

  function handleVibrationToggle() {
    setHasUserGesture(true);
    setVibrationEnabled((current) => !current);
  }

  async function handleAmbientRetry() {
    setHasUserGesture(true);
    const result = await startAmbientNatureAudio(ambientAudioRef, soundEnabled, ambientAudioSource, ambientAudioVolume);
    await handleAmbientStartResult(result, true);
  }

  async function handleProgramAudioStart() {
    setHasUserGesture(true);
    setRequiresExplicitAudioStart(false);

    if (audioContextRef.current?.state === "suspended") {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn("[meditation] failed to resume audio context", error);
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.getVoices();
      } catch (error) {
        console.warn("[meditation] speech synthesis unavailable during unlock", error);
      }
    }

    if (!soundEnabled) {
      setNeedsUserStart(false);
      setIsPaused(false);
      return;
    }

    const result = await startAmbientNatureAudio(ambientAudioRef, true, ambientAudioSource, ambientAudioVolume);
    await handleAmbientStartResult(result, true);

    if (result.started) {
      setNeedsUserStart(false);
      setIsPaused(false);
      return;
    }

    setNeedsUserStart(true);
  }

  function handlePauseToggle() {
    setHasUserGesture(true);
    setIsPaused((current) => {
      const next = !current;

      if (next && typeof window !== "undefined" && "speechSynthesis" in window) {
        if (structuredSpeechTimeoutRef.current) {
          window.clearTimeout(structuredSpeechTimeoutRef.current);
          structuredSpeechTimeoutRef.current = null;
        }
        structuredSpeechSequenceRef.current += 1;
        window.speechSynthesis.cancel();
      }

      return next;
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(216,191,131,0.12),transparent_20%),linear-gradient(180deg,#07111f_0%,#0d1b2d_45%,#10273a_100%)] px-6 py-10 text-white">
      <div className="relative flex min-h-[480px] w-full max-w-3xl flex-col items-center overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] px-6 py-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:px-8 sm:py-10">
        {!ambientVideoFailed && !isStructuredMorningGate ? (
          <video
            className="absolute inset-0 z-0 h-full w-full object-cover opacity-85"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/images/quiet-meditation.jpg"
            onLoadedData={() => console.log("Meditation video loaded")}
            onError={() => setAmbientVideoFailed(true)}
          >
            <source src="/videos/one-minute-nature-loop.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(216,191,131,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(79,122,101,0.14),transparent_34%),linear-gradient(180deg,rgba(4,10,19,0.76)_0%,rgba(8,18,32,0.88)_100%)]" />
        )}
        {isStructuredMorningGate ? (
          <>
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(244,220,160,0.16),transparent_24%),radial-gradient(circle_at_bottom,rgba(125,162,108,0.12),transparent_34%),linear-gradient(180deg,rgba(34,42,72,0.92)_0%,rgba(18,29,48,0.92)_48%,rgba(12,22,37,0.96)_100%)]" />
            <div className="absolute left-[8%] top-[10%] z-0 h-48 w-48 rounded-full bg-gold/10 blur-[80px]" />
            <div className="absolute right-[10%] top-[14%] z-0 h-44 w-44 rounded-full bg-emerald-200/[0.08] blur-[90px]" />
          </>
        ) : null}
        <div className={`absolute inset-0 z-10 ${isStructuredMorningGate ? "bg-[linear-gradient(180deg,rgba(4,10,19,0.18),rgba(4,10,19,0.36))]" : "bg-black/25"}`} />

        <div className="relative z-20 flex w-full flex-col items-center text-center">
        {!isComplete ? (
          <>
            {isStructuredMorningGate ? (
              <div className="w-full max-w-xl space-y-4">
                <p className="text-xs uppercase tracking-[0.28em] text-gold/74">{morningGateCopy.audioLabel}</p>
                <h1 className="font-serif text-3xl text-white sm:text-4xl">{morningGateCopy.title}</h1>
                <p className="text-sm leading-7 text-white/68">{morningGateCopy.subtitle}</p>
                <div className="mx-auto mt-4 h-[6px] w-full max-w-md overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gold/80 transition-[width] duration-700"
                    style={{ width: `${affirmationProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-center gap-3 text-sm text-white/54">
                  <span>{morningGateCopy.duration}</span>
                  <span className="h-1 w-1 rounded-full bg-white/24" />
                  <button
                    type="button"
                    onClick={handlePauseToggle}
                    className="button-nowrap inline-flex min-h-[34px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/72 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {isPaused ? morningGateCopy.resume : morningGateCopy.pause}
                  </button>
                </div>
              </div>
            ) : journeyMode ? (
              <div className="flex min-h-[112px] w-full items-center justify-center">
                {journeyOverlayMessage ? (
                  <div
                    key={`${journeyDay}-${journeyGuidanceStage}`}
                    className="animate-fade-in space-y-3 transition-opacity duration-300"
                  >
                    <p className="keep-phrase text-xs uppercase tracking-[0.28em] text-gold/72">{topText}</p>
                    <p className="body-measure word-balance keep-phrase mx-auto whitespace-pre-line text-center text-xl leading-[1.9] text-white/92 sm:text-2xl">
                      {journeyOverlayMessage}
                    </p>
                  </div>
                ) : (
                  <div
                    key={`${journeyDay}-${journeyGuidanceStage}`}
                    className="animate-fade-in space-y-3 transition-opacity duration-300"
                  >
                    <p className="keep-phrase text-xs uppercase tracking-[0.28em] text-gold/72">{topText}</p>
                    <p className="body-measure keep-phrase mx-auto text-center text-sm leading-7 text-white/62 sm:text-base">
                      {introText}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="keep-phrase text-sm uppercase tracking-[0.32em] text-gold/80">{topText}</p>
                <p className="body-measure keep-phrase mx-auto text-sm leading-7 text-white/60 sm:text-base">{introText}</p>
              </div>
            )}

            <div className="mt-12 flex min-h-[320px] w-full flex-col items-center justify-center">
              {(journeyMode || meditationType !== "default") && needsUserStart ? (
                <div className="mb-6 w-full max-w-md rounded-[24px] border border-[rgba(212,178,106,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-5 text-center shadow-[0_18px_50px_rgba(4,12,24,0.18)]">
                  <p className="text-sm leading-7 text-white/76">{journeyMode ? journeyCopy.audioPrompt : copy.audioPrompt}</p>
                  <button
                    type="button"
                    onClick={journeyMode ? handleJourneyAudioStart : handleProgramAudioStart}
                    className="button-nowrap mt-4 inline-flex min-h-[44px] items-center justify-center rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold transition hover:bg-gold/15 hover:text-[#f5e4b5]"
                  >
                    {journeyMode ? journeyCopy.audioStart : copy.audioStart}
                  </button>
                </div>
              ) : null}

              <div className="mb-6 flex items-center gap-2">
                {vibrationSupported ? (
                  <button
                    type="button"
                    onClick={handleVibrationToggle}
                    className="button-nowrap inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                    aria-pressed={vibrationEnabled}
                  >
                    {vibrationEnabled ? copy.vibrationOn : copy.vibrationOff}
                  </button>
                ) : null}
                {!hideSoundToggle ? (
                  <button
                    type="button"
                    onClick={handleSoundToggle}
                    className="button-nowrap inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                    aria-pressed={soundEnabled}
                  >
                    {soundEnabled ? `🔊 ${journeyMode ? journeyCopy.audioOn : copy.soundOn}` : `🔊 ${journeyMode ? journeyCopy.audioOff : copy.soundOff}`}
                  </button>
                ) : null}
                {journeyMode && !needsUserStart && showAmbientRetry ? (
                  <button
                    type="button"
                    onClick={handleJourneyAudioStart}
                    className="button-nowrap inline-flex min-h-[36px] items-center justify-center rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold transition hover:bg-gold/15 hover:text-[#f5e4b5]"
                  >
                    {journeyCopy.audioStart}
                  </button>
                ) : null}
                {showAmbientRetry && soundEnabled ? (
                  <button
                    type="button"
                    onClick={handleAmbientRetry}
                    className="button-nowrap inline-flex min-h-[36px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/76 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {copy.natureLabel}
                  </button>
                ) : null}
              </div>
              <p className="text-2xl font-medium text-white/72 transition-all duration-300 ease-out sm:text-3xl">
                {isStructuredMorningGate && (affirmationStage === "breathing" || affirmationStage === "bodyAwareness")
                  ? affirmationMessage
                  : copy.phases[phase]}
              </p>

              <div className="relative mt-10 flex h-56 w-56 items-center justify-center sm:h-72 sm:w-72">
                <div className="absolute inset-0 rounded-full bg-gold/10 blur-3xl" />
                <div
                  className={`absolute inset-6 rounded-full border border-gold/35 bg-gold/10 transition-transform duration-[4000] ease-in-out ${circleScaleClass}`}
                />
                <div
                  className={`absolute inset-0 rounded-full border border-white/10 bg-white/[0.03] transition-transform duration-[4000] ease-in-out ${circleScaleClass}`}
                />
                <div className="relative z-10 text-center">
                  <p className="text-5xl font-serif text-white/88 sm:text-6xl">{formatRemainingTime(secondsLeft)}</p>
                </div>
              </div>

              {isStructuredMorningGate ? (
                <div className="mt-8 min-h-[92px] max-w-xl space-y-3">
                  <p className="mx-auto whitespace-pre-line font-serif text-2xl leading-[1.8] text-white/90 sm:text-[32px] sm:leading-[1.9]">
                    {affirmationMessage}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-8">
              <p className="text-sm font-medium tracking-[0.18em] text-white/68 transition-opacity duration-300 sm:text-base">
                {isStructuredMorningGate
                  ? affirmationStage === "breathing" || affirmationStage === "bodyAwareness"
                    ? phase === "inhale"
                      ? morningGateCopy.inhale
                      : morningGateCopy.exhale
                    : morningGateCopy.title
                  : copy.bottomText[phase]}
              </p>
            </div>
          </>
        ) : (
          <div className="animate-fade-in space-y-8">
            <h1 className="font-serif text-4xl text-white sm:text-5xl">
              {isStructuredMorningGate ? morningGateCopy.completionTitle : completionTitle}
            </h1>
            <p className="mx-auto max-w-xl whitespace-pre-line text-base leading-8 text-white/72">
              {isStructuredMorningGate ? morningGateCopy.completionMessage : copy.completionMessage}
            </p>
            <p className="text-sm leading-7 text-white/54">
              {isStructuredMorningGate ? morningGateCopy.completionNote : copy.completionReturnText}
            </p>
            {!journeyMode && !isStructuredMorningGate ? <p className="mx-auto max-w-2xl text-base leading-8 text-white/68">{copy.completionBody}</p> : null}
            <div className="flex flex-col items-center gap-3">
              <Link
                href={returnToHref}
                className="inline-flex min-h-[56px] min-w-[240px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:scale-[1.02] hover:bg-[#e7cd92]"
              >
                {isStructuredMorningGate ? morningGateCopy.completionButton : journeyMode ? journeyCopy.nextCta : copy.completionPrimary}
              </Link>
              {!journeyMode && !isStructuredMorningGate ? (
                <Link
                  href="/"
                  className="inline-flex min-h-[52px] min-w-[240px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
                >
                  {copy.completionSecondary}
                </Link>
              ) : null}
            </div>
            {!journeyMode && !isStructuredMorningGate ? (
              <div className="mx-auto max-w-2xl border-t border-white/10 pt-8">
                <p className="text-base leading-8 text-white/68">{copy.coachPrompt}</p>
                <div className="mt-5">
                  <a
                    href={AI_COACH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[52px] min-w-[220px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/82 transition duration-300 hover:bg-white/[0.06]"
                  >
                    {copy.coachButton}
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
