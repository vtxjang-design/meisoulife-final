"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getChallengeRhythmProgress } from "@/lib/challenge-rhythm";
import { getLocaleCopy, useLanguage } from "@/lib/i18n";
import { getNatureSoundPreference, STRUCTURED_AMBIENT_PENDING_KEY } from "@/lib/meditation-ambient-audio";
import { getTodayRhythmCheckIn } from "@/lib/today-rhythm-checkin";
import { getReturnRhythmSnapshot } from "@/lib/return-rhythm";
import { RHYTHM_JOURNEY_STORAGE_KEY } from "@/lib/rhythm-journey";

type RhythmPhase = "morning" | "day" | "night";
type SmallDoor = {
  key: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  guidance: string;
  openingTitle: string;
  openingBreath: string;
};
type PlanKey = "free" | "basic" | "growth" | "inner_circle";
type MarkerSleep = "good" | "normal" | "low";
type MarkerStress = "low" | "normal" | "high";
type MarkerMood = "calm" | "tired" | "sleepy" | "energy" | "thoughts" | "unknown";

type MarkerStoneState = {
  date: string;
  sleep: MarkerSleep;
  stress: MarkerStress;
  lastGate: RhythmPhase;
};

type BasicHomeProps = {
  currentDay?: number;
  streakCount?: number;
  planKey?: PlanKey;
  membershipResolved?: boolean;
  defaultRhythm?: RhythmPhase;
};

const MARKER_STONE_STORAGE_KEY = "meisoulife_marker_stone_v1";
const LAST_GATE_STORAGE_KEY = "meisoulife_last_rhythm_gate";
const TODAY_REFLECTION_STORAGE_KEY = "meisoulife_basic_daily_reflection_v1";

const basicHomeCopy = {
  jp: {
    hero: {
      title: "本来の自分へ",
      subtitle: "朝・昼・夜\n\n静かに戻る場所",
      support: "小さなリズムが、\n毎日を静かに整えていきます。",
      primaryCta: "今日のリズムを始める"
    },
    memberBadge: "Basicメンバー空間",
    routineSection: {
      title: "今日のリズム",
      description: "朝・昼・夜の3つの扉から、\n今の自分に合うものを選びましょう。",
      ready: "準備完了",
      completed: "完了",
      action: "始める"
    },
    sanctuaryEyebrow: "EXPLORER SANCTUARY",
    continueJourney: "今日のリズムに会う",
    summaryCards: {
      currentGate: "今日のリズム",
      progress: "旅の日",
      returnedDays: "戻ってきた日々",
      insight: "今日の気づき",
      progressValue: "Day {day} / 7",
      insightBody: "小さなリズムは、大きな変化になっていきます。"
    },
    gatesTitle: "今日のリズムゲート",
    todayGateTitle: "今日、開いている扉",
    todayGateItems: {
      rhythm: "今日のリズム",
      openGate: "今日の扉",
      day: "旅の日",
      streak: "歩いてきた日々",
      insight: "次の一歩は、すでにここで待っています。"
    },
    openGate: {
      title: "今日開いている扉",
      practice: "今日は\n少し立ち止まっても大丈夫です。",
      cta: "扉を開く",
      viewAll: "旅全体を見る"
    },
    todayJourney: {
      title: "今日の旅",
      description: "いまこの瞬間、静かに立ち止まり、自分に戻ります。",
      cta: "今日の扉をひらく"
    },
    aiGuide: {
      title: "今日の静かな一文",
      eyebrow: "QUIET MESSAGE",
      body: "今日は昨日よりも\n少し静かなリズムで大丈夫です。",
      availability: ""
    },
    question: {
      title: "今日の問い",
      prompts: [
        "今日、\n何を手放したいですか？",
        "今日、\n誰に感謝していますか？",
        "今日、\n体は何を求めていますか？",
        "今日、\n何を明日に回せますか？"
      ],
      placeholder: "一行だけでも大丈夫です。",
      saved: "今日の記録が静かに残りました。"
    },
    companions: {
      title: "ともに歩く人たち",
      body: "今日この静かな場所に、ともに歩く人たちがいます。",
      walked: "今日は12人がリズムを実践しました。",
      present: "今週は47人がともに歩んでいます。",
      live: "今この瞬間、誰かが朝の扉を開いています。",
      cta: "仲間たちの場所へ"
    },
    todayMessageTitle: "今日の静かな一文",
    todayMessages: [
      "今日は昨日よりも\n少し静かなリズムで大丈夫です。",
      "急がずに戻ることも、\n今日の大切な実践です。",
      "今の呼吸だけで、\n十分に整い始めています。"
    ],
    markerStone: {
      title: "Today's Marker Stone",
      subtitle: "今、どんなリズムの上にいますか。",
      support: "小さな立ち止まりが、一日の向きを変えてくれます。",
      bodyTitle: "立ち止まる庭",
      note: "立ち止まっても大丈夫です。\n\nあなたのリズムは消えたのではなく\n少し休んでいただけです。",
      heroNote: "今日は少し急がなくても大丈夫です。\n\n呼吸があなたを待っています。",
      mood: "今の気分",
      sleep: "睡眠",
      stress: "ストレス",
      lastGate: "最後にくぐった扉",
      sleepOptions: {
        good: "良い",
        normal: "普通",
        low: "不足"
      },
      stressOptions: {
        low: "低い",
        normal: "普通",
        high: "高い"
      },
      moods: {
        calm: "穏やか",
        tired: "少し疲れた",
        sleepy: "眠い",
        energy: "エネルギーが必要",
        thoughts: "考えが多い",
        unknown: "まだ選んでいません"
      },
      guideEyebrow: "RHYTHM GUIDE",
      guideTitle: "AI Rhythm Guide 準備中",
      guideBody: "今は重いAI接続を使わず、静かな文脈だけを整えています。次の段階で、この標石をAIリズムガイドへ自然につなげます。"
    },
    checkIn: {
      title: "今の私の状態",
      stateOptions: [
        { value: "calm", label: "😀 穏やか" },
        { value: "tired", label: "😌 少し疲れた" },
        { value: "sleepy", label: "😴 眠い" },
        { value: "energy", label: "⚡ エネルギーが必要" },
        { value: "thoughts", label: "💭 考えが多い" }
      ],
      saved: "今日の状態を記録しました。"
    },
    rhythmCardsTitle: "今のあなたに合う扉を、ひとつ選びましょう。",
    rhythmCards: [
      {
        key: "morning",
        emoji: "☀️",
        title: "☀️ 朝",
        description: "今日を始める3分",
        detail: "",
        programs: ["肯定のアファメーション", "脳と筋力を目覚めさせる", "ビジョンスクリーン瞑想"],
        purpose: "一日の方向を整える",
        button: "入る",
        layerTitle: "今日を整える3分",
        layerDescription: "今日の始まりはここから。\n今の自分に合う小さな扉を選びましょう。",
        layerResult: ["✨ 目覚め", "✨ 活力", "✨ 方向性"],
        smallDoors: [
          {
            key: "affirmation",
            emoji: "✨",
            title: "今日の自分を選ぶ",
            subtitle: "今日の自分を選ぶ",
            description: "静かに一日を選びなおす、朝の3分。",
            guidance: "朝を前向きに始めたいとき",
            openingTitle: "今日の自分を選びます",
            openingBreath: "深く息を吸ってください"
          },
          {
            key: "energy",
            emoji: "🔥",
            title: "脳と身体を目覚めさせる",
            subtitle: "脳と身体を目覚めさせる",
            description: "身体の感覚をやさしく目覚めさせる、朝の3分。",
            guidance: "まだ身体が起きていないとき",
            openingTitle: "眠っていた力を起こします",
            openingBreath: "ゆっくり呼吸を整えてください"
          },
          {
            key: "vision",
            emoji: "🌄",
            title: "ビジョンスクリーン瞑想",
            subtitle: "ビジョンスクリーン瞑想",
            description: "今日の一日を、心の中で静かに描く3分。",
            guidance: "今日の方向を静かに選びたいとき",
            openingTitle: "今日の一日を心に描きます",
            openingBreath: "呼吸をゆっくり整えてください"
          }
        ]
      },
      {
        key: "day",
        emoji: "🌿",
        title: "🌿 昼",
        description: "中心へ戻る1分",
        detail: "",
        programs: ["1分筋力", "脳リラックス", "気力チャージ"],
        purpose: "中心に戻る",
        button: "入る",
        layerTitle: "中心に戻る1分",
        layerDescription: "忙しさから少し離れて、\nいま必要な整え方を選びましょう。",
        layerResult: ["✨ 集中", "✨ 安定", "✨ 回復"],
        smallDoors: [
          {
            key: "focus",
            emoji: "🎯",
            title: "Focus Gate",
            subtitle: "集中を取り戻す",
            description: "Focus reset",
            guidance: "気持ちが散っているとき",
            openingTitle: "集中を静かに呼び戻します",
            openingBreath: "ひと呼吸して中心へ戻りましょう"
          },
          {
            key: "relax",
            emoji: "🌿",
            title: "Relax Gate",
            subtitle: "脳を休ませる",
            description: "Brain relaxation",
            guidance: "頭を少し休ませたいとき",
            openingTitle: "考えをやわらかくほどきます",
            openingBreath: "肩の力をそっと抜いてください"
          },
          {
            key: "vitality",
            emoji: "⚡",
            title: "Vitality Gate",
            subtitle: "気力を充電する",
            description: "Energy recharge",
            guidance: "もう少し力を満たしたいとき",
            openingTitle: "静かに気力を満たします",
            openingBreath: "胸の奥まで息を届けてください"
          }
        ]
      },
      {
        key: "night",
        emoji: "🌙",
        title: "🌙 夜",
        description: "手放して眠る3分",
        detail: "",
        programs: ["手放す時間", "睡眠の準備", "感謝の瞑想"],
        purpose: "深い回復と休息",
        button: "入る",
        layerTitle: "静かに眠る3分",
        layerDescription: "今日をやさしく整えて、\n眠りへ向かう小さな扉を選びましょう。",
        layerResult: ["✨ 手放し", "✨ 静けさ", "✨ 睡眠"],
        smallDoors: [
          {
            key: "release",
            emoji: "🍂",
            title: "Release Gate",
            subtitle: "手放しの時間",
            description: "Letting go",
            guidance: "今日の重さを下ろしたいとき",
            openingTitle: "一日の重さをほどきます",
            openingBreath: "吐く息を少し長くしてみてください"
          },
          {
            key: "gratitude",
            emoji: "🙏",
            title: "Gratitude Gate",
            subtitle: "感謝の時間",
            description: "Gratitude meditation",
            guidance: "心をやさしく整えたいとき",
            openingTitle: "小さな感謝に触れていきます",
            openingBreath: "静かに胸へ意識を向けてください"
          },
          {
            key: "sleep",
            emoji: "🌙",
            title: "Sleep Gate",
            subtitle: "深い眠りへの準備",
            description: "Sleep preparation",
            guidance: "深く休む準備をしたいとき",
            openingTitle: "眠りのための静けさを整えます",
            openingBreath: "まぶたの奥をゆるめてください"
          }
        ]
      }
    ],
    doorLayer: {
      eyebrow: "SMALL DOOR SELECTION",
      choose: "今のあなたに合う小さな扉を選びましょう。",
      resultLabel: "静かに開いていくもの",
      recommendLabel: "おすすめ",
      recommendText: "今日は {title} がおすすめです。",
      progressLabel: "今日のリズム",
      progressMorning: "朝",
      progressDay: "昼",
      progressNight: "夜",
      enter: "この扉へ入る",
      close: "閉じる",
      stateOpened: "静かに開きました",
      stateToday: "今日の入口です",
      stateWaiting: "静かに待っています"
    },
    journeyPath: {
      title: "本来の自分に戻る道",
      description: "今日はひとつの入口だけで十分です。静かな道を、自分の歩幅で進みましょう。",
      active: "今日",
      completed: "歩いている道",
      next: "次の道",
      locked: "先の道",
      enter: "静かに入る"
    },
    records: {
      title: "リズムの記録",
      morning: "朝",
      day: "昼",
      night: "夜",
      todayScore: "今日のリズム",
      weekScore: "今週のリズム",
      streak: "続いている日々"
    },
    sessions: {
      title: "次のリズム",
      first: "明日の朝の扉が\n静かに待っています。",
      second: "小さな一歩で、\nまた本来の自分へ戻れます。",
      cta: "明日のリズムを見る"
    },
    stateRecoveryTitle: "今の状態から選ぶ",
    stateRecoveryItems: [
      { key: "sleep", emoji: "😴", title: "睡眠回復" },
      { key: "stress", emoji: "🌿", title: "ストレスリセット" },
      { key: "energy", emoji: "⚡", title: "エネルギーチャージ" },
      { key: "mind", emoji: "😌", title: "心の整理" },
      { key: "gratitude", emoji: "💛", title: "感謝と幸福" },
      { key: "focus", emoji: "🎯", title: "集中と没入" }
    ],
    stateRecoveryCta: "静かに整える",
    journey: {
      title: "7日間の小さな回復",
      body: "いつでも、また戻ってこられます。",
      cta: "もう一度たどる"
    },
    upgrade: {
      title: "Basicで開く静かなリズム",
      body: "この場所では、朝・昼・夜のリズムを静かに続けていきます。",
      cta: "プランを見る"
    }
  },
  kr: {
    hero: {
      title: "본래의 나에게",
      subtitle: "아침 · 낮 · 밤\n\n조용히 돌아오는 곳",
      support: "작은 리듬이,\n하루를 조용히 바꿔갑니다.",
      primaryCta: "오늘의 리듬 시작하기"
    },
    memberBadge: "Basic 멤버 공간",
    routineSection: {
      title: "오늘의 리듬",
      description: "아침 · 낮 · 밤의 세 문 중,\n지금 필요한 리듬을 고릅니다.",
      ready: "준비됨",
      completed: "완료",
      action: "시작하기"
    },
    sanctuaryEyebrow: "EXPLORER SANCTUARY",
    continueJourney: "오늘의 리듬 만나기",
    summaryCards: {
      currentGate: "Today's Rhythm",
      progress: "여정의 날",
      returnedDays: "돌아온 날들",
      insight: "오늘의 통찰",
      progressValue: "Day {day} / 7",
      insightBody: "작은 리듬은 큰 변화로 이어집니다."
    },
    gatesTitle: "오늘의 리듬 게이트",
    todayGateTitle: "오늘 열려 있는 문",
    todayGateItems: {
      rhythm: "오늘의 리듬",
      openGate: "오늘의 문",
      day: "여정의 날",
      streak: "이어온 날들",
      insight: "당신의 다음 걸음은 이미 여기에서 기다리고 있습니다."
    },
    openGate: {
      title: "오늘 열린 문",
      practice: "오늘은\n잠시 멈춰도 괜찮습니다.",
      cta: "문 열기",
      viewAll: "전체 여정 보기"
    },
    todayJourney: {
      title: "오늘의 여정",
      description: "지금 이 순간, 잠시 멈추어 나에게 돌아옵니다.",
      cta: "오늘의 문 열기"
    },
    aiGuide: {
      title: "오늘의 조용한 문장",
      eyebrow: "QUIET MESSAGE",
      body: "오늘은 어제보다\n조금 천천히 가도 괜찮습니다.",
      availability: ""
    },
    question: {
      title: "오늘의 질문",
      prompts: [
        "오늘 무엇을\n내려놓고 싶나요?",
        "오늘 누구에게\n감사하고 있나요?",
        "오늘 몸은\n무엇을 원하나요?",
        "오늘 무엇을\n내일로 미뤄도 될까요?"
      ],
      placeholder: "한 줄만 적어도 괜찮습니다.",
      saved: "오늘의 기록이 조용히 남았습니다."
    },
    companions: {
      title: "함께 걷는 사람들",
      body: "오늘 이 조용한 공간에 함께 걷는 사람들이 있습니다.",
      walked: "오늘 12명이 리듬을 실천했습니다.",
      present: "이번 주 47명이 함께 걷고 있습니다.",
      live: "지금 이 순간, 누군가가 아침의 문을 열고 있습니다.",
      cta: "함께 걷는 사람들로"
    },
    todayMessageTitle: "오늘의 조용한 문장",
    todayMessages: [
      "오늘은 어제보다\n조금 천천히 가도 괜찮습니다.",
      "서두르지 않고 돌아오는 것도\n좋은 리듬입니다.",
      "지금의 호흡만으로도\n이미 충분히 시작되고 있습니다."
    ],
    markerStone: {
      title: "오늘의 Marker Stone",
      subtitle: "지금 당신은 어떤 리듬 위에 있습니까?",
      support: "작은 멈춤이 하루의 방향을 바꿉니다.",
      bodyTitle: "멈춤의 정원",
      note: "멈추어도 괜찮습니다.\n\n당신의 리듬은 사라진 것이 아니라\n잠시 쉬고 있었을 뿐입니다.",
      heroNote: "오늘은 잠시 서두르지 않아도 됩니다.\n\n호흡이 당신을 기다리고 있습니다.",
      mood: "지금의 기분",
      sleep: "수면",
      stress: "스트레스",
      lastGate: "마지막으로 지난 문",
      sleepOptions: {
        good: "좋음",
        normal: "보통",
        low: "부족"
      },
      stressOptions: {
        low: "낮음",
        normal: "보통",
        high: "높음"
      },
      moods: {
        calm: "편안함",
        tired: "조금 지침",
        sleepy: "피곤함",
        energy: "에너지 필요",
        thoughts: "생각이 많음",
        unknown: "아직 선택하지 않음"
      },
      guideEyebrow: "RHYTHM GUIDE",
      guideTitle: "AI 리듬 가이드를 준비하고 있습니다",
      guideBody: "지금은 무거운 AI 연결 없이 조용한 맥락만 정리합니다. 다음 단계에서 이 표지석을 AI 리듬 가이드와 자연스럽게 잇게 됩니다."
    },
    checkIn: {
      title: "지금 내 상태",
      stateOptions: [
        { value: "calm", label: "😀 편안함" },
        { value: "tired", label: "😌 조금 지침" },
        { value: "sleepy", label: "😴 피곤함" },
        { value: "energy", label: "⚡ 에너지 필요" },
        { value: "thoughts", label: "💭 생각이 많음" }
      ],
      saved: "오늘의 상태를 기록했습니다."
    },
    rhythmCardsTitle: "지금 필요한 문을 하나 고르세요.",
    rhythmCards: [
      {
        key: "morning",
        emoji: "☀️",
        title: "☀️ 아침",
        description: "오늘 하루를 시작하는 3분",
        detail: "",
        programs: ["긍정 확언", "뇌와 근력 깨우기", "비전 스크린 명상"],
        purpose: "하루의 방향 설정",
        button: "들어가기",
        layerTitle: "오늘을 정돈하는 3분",
        layerDescription: "오늘의 시작은 여기입니다.\n지금 필요한 작은 문을 골라보세요.",
        layerResult: ["✨ 깨어남", "✨ 활력", "✨ 방향"],
        smallDoors: [
          {
            key: "affirmation",
            emoji: "✨",
            title: "오늘의 나를 선택하기",
            subtitle: "오늘의 나를 선택하기",
            description: "조용히 오늘의 나를 선택하는 아침 3분.",
            guidance: "아침을 조금 더 밝게 시작하고 싶을 때",
            openingTitle: "오늘의 나를 선택합니다",
            openingBreath: "깊게 숨을 들이쉬어 보세요"
          },
          {
            key: "energy",
            emoji: "🔥",
            title: "뇌와 몸을 깨우기",
            subtitle: "뇌와 몸을 깨우기",
            description: "몸의 감각을 부드럽게 깨우는 아침 3분.",
            guidance: "아직 몸이 완전히 깨어나지 않았을 때",
            openingTitle: "잠든 힘을 깨웁니다",
            openingBreath: "천천히 호흡을 고르게 해보세요"
          },
          {
            key: "vision",
            emoji: "🌄",
            title: "비전 스크린 명상",
            subtitle: "비전 스크린 명상",
            description: "오늘 하루의 방향을 마음속에 조용히 그리는 3분.",
            guidance: "오늘의 방향을 조용히 그리고 싶을 때",
            openingTitle: "오늘의 하루를 마음에 그립니다",
            openingBreath: "호흡을 천천히 고르게 해보세요"
          }
        ]
      },
      {
        key: "day",
        emoji: "🌿",
        title: "🌿 낮",
        description: "중심으로 돌아오는 1분",
        detail: "",
        programs: ["1분 근력", "뇌 릴렉스", "기운 충전"],
        purpose: "중심으로 돌아가기",
        button: "들어가기",
        layerTitle: "중심으로 돌아오는 1분",
        layerDescription: "분주함에서 잠시 벗어나,\n지금 필요한 정돈의 문을 골라보세요.",
        layerResult: ["✨ 집중", "✨ 안정", "✨ 회복"],
        smallDoors: [
          {
            key: "focus",
            emoji: "🎯",
            title: "Focus Gate",
            subtitle: "집중을 되찾기",
            description: "Focus reset",
            guidance: "마음이 흩어져 있을 때",
            openingTitle: "집중을 조용히 되찾습니다",
            openingBreath: "한 번 숨을 고르고 중심으로 돌아오세요"
          },
          {
            key: "relax",
            emoji: "🌿",
            title: "Relax Gate",
            subtitle: "뇌를 쉬게 하기",
            description: "Brain relaxation",
            guidance: "머리를 잠시 쉬게 하고 싶을 때",
            openingTitle: "생각의 결을 부드럽게 풉니다",
            openingBreath: "어깨 힘을 살짝 놓아보세요"
          },
          {
            key: "vitality",
            emoji: "⚡",
            title: "Vitality Gate",
            subtitle: "기운 충전하기",
            description: "Energy recharge",
            guidance: "조금 더 힘을 채우고 싶을 때",
            openingTitle: "조용히 기운을 채웁니다",
            openingBreath: "가슴 깊이 숨을 보내보세요"
          }
        ]
      },
      {
        key: "night",
        emoji: "🌙",
        title: "🌙 밤",
        description: "내려놓고 잠드는 3분",
        detail: "",
        programs: ["내려놓기", "수면 준비", "감사 명상"],
        purpose: "깊은 회복과 휴식",
        button: "들어가기",
        layerTitle: "조용히 잠드는 3분",
        layerDescription: "오늘을 부드럽게 가라앉히고,\n잠으로 가는 작은 문을 골라보세요.",
        layerResult: ["✨ 내려놓기", "✨ 고요", "✨ 잠"],
        smallDoors: [
          {
            key: "release",
            emoji: "🍂",
            title: "Release Gate",
            subtitle: "내려놓는 시간",
            description: "Letting go",
            guidance: "오늘의 무게를 내려놓고 싶을 때",
            openingTitle: "하루의 무게를 풀어냅니다",
            openingBreath: "내쉬는 숨을 조금 길게 해보세요"
          },
          {
            key: "gratitude",
            emoji: "🙏",
            title: "Gratitude Gate",
            subtitle: "감사의 시간",
            description: "Gratitude meditation",
            guidance: "마음을 부드럽게 정돈하고 싶을 때",
            openingTitle: "작은 감사와 만납니다",
            openingBreath: "가슴 쪽으로 조용히 주의를 모아보세요"
          },
          {
            key: "sleep",
            emoji: "🌙",
            title: "Sleep Gate",
            subtitle: "깊은 잠을 준비하기",
            description: "Sleep preparation",
            guidance: "깊게 쉬기 위한 준비가 필요할 때",
            openingTitle: "잠을 위한 고요를 정돈합니다",
            openingBreath: "눈가의 힘을 천천히 풀어주세요"
          }
        ]
      }
    ],
    doorLayer: {
      eyebrow: "SMALL DOOR SELECTION",
      choose: "지금의 나에게 맞는 작은 문을 골라보세요.",
      resultLabel: "조용히 열리는 흐름",
      recommendLabel: "추천",
      recommendText: "오늘은 {title} 가 잘 어울립니다.",
      progressLabel: "오늘의 리듬",
      progressMorning: "아침",
      progressDay: "낮",
      progressNight: "밤",
      enter: "이 문으로 들어가기",
      close: "닫기",
      stateOpened: "조용히 열렸습니다",
      stateToday: "오늘의 입구입니다",
      stateWaiting: "조용히 기다리고 있습니다"
    },
    journeyPath: {
      title: "본래의 나로 돌아가는 길",
      description: "오늘은 하나의 입구면 충분합니다. 조용한 길을 내 속도로 이어가세요.",
      active: "오늘",
      completed: "걷는 길",
      next: "다음 길",
      locked: "앞의 길",
      enter: "조용히 들어가기"
    },
    records: {
      title: "리듬 기록",
      morning: "아침",
      day: "낮",
      night: "밤",
      todayScore: "오늘의 리듬",
      weekScore: "이번 주 리듬",
      streak: "이어온 날들"
    },
    sessions: {
      title: "다음 리듬",
      first: "내일 아침의 문이\n조용히 기다리고 있습니다.",
      second: "작은 한 걸음으로\n다시 본래의 나에게 돌아옵니다.",
      cta: "내일의 리듬 보기"
    },
    stateRecoveryTitle: "지금 상태에서 선택하기",
    stateRecoveryItems: [
      { key: "sleep", emoji: "😴", title: "수면 회복" },
      { key: "stress", emoji: "🌿", title: "스트레스 리셋" },
      { key: "energy", emoji: "⚡", title: "에너지 충전" },
      { key: "mind", emoji: "😌", title: "마음 정리" },
      { key: "gratitude", emoji: "💛", title: "감사와 행복" },
      { key: "focus", emoji: "🎯", title: "집중과 몰입" }
    ],
    stateRecoveryCta: "조용히 정돈하기",
    journey: {
      title: "7일간의 작은 회복",
      body: "언제든 다시 돌아올 수 있습니다.",
      cta: "다시 이어가기"
    },
    upgrade: {
      title: "Basic에서 시작되는 조용한 리듬",
      body: "이곳에서는 아침 · 낮 · 밤의 리듬을 조용히 이어갑니다.",
      cta: "플랜 보기"
    }
  },
  en: {
    hero: {
      title: "Back to Yourself",
      subtitle: "Morning · Day · Night\n\nA Quiet Place to Return",
      support: "Small rhythms\nquietly shape the day.",
      primaryCta: "Begin Today’s Rhythm"
    },
    memberBadge: "Basic Member Space",
    routineSection: {
      title: "Today’s Rhythm",
      description: "Choose the one gate\nthat fits you now.",
      ready: "Ready",
      completed: "Completed",
      action: "Begin"
    },
    sanctuaryEyebrow: "EXPLORER SANCTUARY",
    continueJourney: "Meet Today’s Rhythm",
    summaryCards: {
      currentGate: "Today's Rhythm",
      progress: "Journey Day",
      returnedDays: "Days Returned",
      insight: "Today's Insight",
      progressValue: "Day {day} / 7",
      insightBody: "Small rhythms become great transformations."
    },
    gatesTitle: "Today’s Rhythm Gates",
    todayGateTitle: "Today's Open Gate",
    todayGateItems: {
      rhythm: "Today's Rhythm",
      openGate: "Open Gate",
      day: "Current Day",
      streak: "Days of Practice",
      insight: "Your next step is already waiting."
    },
    openGate: {
      title: "Today’s Open Gate",
      practice: "Today,\nit is okay to pause.",
      cta: "Open the Door",
      viewAll: "View Full Journey"
    },
    todayJourney: {
      title: "Today’s Journey",
      description: "Pause for a moment and return to yourself.",
      cta: "Open Today’s Gate"
    },
    aiGuide: {
      title: "Today's Quiet Message",
      eyebrow: "QUIET MESSAGE",
      body: "Today,\na slower rhythm is enough.",
      availability: ""
    },
    question: {
      title: "Today’s Question",
      prompts: [
        "What would you like\nto release today?",
        "Who are you grateful for today?",
        "What does your body need today?",
        "What can wait until tomorrow?"
      ],
      placeholder: "One line is enough.",
      saved: "Today’s reflection has been quietly saved."
    },
    companions: {
      title: "Walking Together",
      body: "There are people walking through this quiet space with you today.",
      walked: "12 people practiced their rhythm today.",
      present: "47 people are walking together this week.",
      live: "Someone is opening the Morning Door right now.",
      cta: "Enter the Community"
    },
    todayMessageTitle: "Today's Quiet Message",
    todayMessages: [
      "Today,\na slower rhythm is enough.",
      "Returning gently\nis enough for today.",
      "This breath alone\ncan begin the return."
    ],
    markerStone: {
      title: "Today’s Marker Stone",
      subtitle: "What rhythm are you standing on right now?",
      support: "A small pause can change the direction of a day.",
      bodyTitle: "Garden of Stillness",
      note: "It is okay to pause.\n\nYour rhythm has not disappeared.\nIt has only been resting for a while.",
      heroNote: "Today, you do not need to hurry.\n\nYour breath is waiting for you.",
      mood: "Mood",
      sleep: "Sleep",
      stress: "Stress",
      lastGate: "Last gate",
      sleepOptions: {
        good: "Good",
        normal: "Normal",
        low: "Low"
      },
      stressOptions: {
        low: "Low",
        normal: "Normal",
        high: "High"
      },
      moods: {
        calm: "Calm",
        tired: "A little tired",
        sleepy: "Sleepy",
        energy: "Need energy",
        thoughts: "Many thoughts",
        unknown: "Not chosen yet"
      },
      guideEyebrow: "RHYTHM GUIDE",
      guideTitle: "AI Rhythm Guide is being prepared",
      guideBody: "For now, we are keeping this light and steady. The structure is ready for a future AI rhythm guide without adding noise to today."
    },
    checkIn: {
      title: "My State Now",
      stateOptions: [
        { value: "calm", label: "😀 Calm" },
        { value: "tired", label: "😌 A little tired" },
        { value: "sleepy", label: "😴 Sleepy" },
        { value: "energy", label: "⚡ Need energy" },
        { value: "thoughts", label: "💭 Many thoughts" }
      ],
      saved: "Your state has been recorded for today."
    },
    rhythmCardsTitle: "Choose one gate for now.",
    rhythmCards: [
      {
        key: "morning",
        emoji: "☀️",
        title: "☀️ Morning",
        description: "3 minutes to begin",
        detail: "",
        programs: ["Positive Affirmation", "Brain & Strength Activation", "Vision Screen Meditation"],
        purpose: "Set direction for the day",
        button: "Enter",
        layerTitle: "3 minutes to shape today",
        layerDescription: "Today begins here.\nChoose the small door you need.",
        layerResult: ["✨ Awakening", "✨ Energy", "✨ Direction"],
        smallDoors: [
          {
            key: "affirmation",
            emoji: "✨",
            title: "Choose Today’s Self",
            subtitle: "Choose who you are today",
            description: "A quiet 3-minute morning ritual to choose how you begin.",
            guidance: "When you want to begin the day with a brighter heart",
            openingTitle: "You are choosing who you are today",
            openingBreath: "Take one deep breath"
          },
          {
            key: "energy",
            emoji: "🔥",
            title: "Wake Brain and Body",
            subtitle: "Wake brain and body",
            description: "A gentle 3-minute ritual to awaken the body and attention.",
            guidance: "When your energy has not fully awakened yet",
            openingTitle: "You are waking your inner energy",
            openingBreath: "Let your breath become steady"
          },
          {
            key: "vision",
            emoji: "🌄",
            title: "Vision Screen Meditation",
            subtitle: "Vision Screen Meditation",
            description: "A quiet 3-minute meditation to visualize the direction of your day.",
            guidance: "When you want to choose the direction of the day quietly",
            openingTitle: "You are visualizing the shape of today",
            openingBreath: "Let your breath become soft and steady"
          }
        ]
      },
      {
        key: "day",
        emoji: "🌿",
        title: "🌿 Noon",
        description: "1 minute to return",
        detail: "",
        programs: ["1-Minute Strength", "Brain Relaxation", "Energy Recharge"],
        purpose: "Return to center",
        button: "Enter",
        layerTitle: "1 minute to return to center",
        layerDescription: "Reconnect with your center.\nChoose the small door you need now.",
        layerResult: ["✨ Focus", "✨ Steadiness", "✨ Recovery"],
        smallDoors: [
          {
            key: "focus",
            emoji: "🎯",
            title: "Focus Gate",
            subtitle: "Recover focus",
            description: "Focus reset",
            guidance: "When your attention feels scattered",
            openingTitle: "You are gathering your focus",
            openingBreath: "Take one breath back to center"
          },
          {
            key: "relax",
            emoji: "🌿",
            title: "Relax Gate",
            subtitle: "Let the brain rest",
            description: "Brain relaxation",
            guidance: "When your mind needs a softer place to rest",
            openingTitle: "You are letting thought soften",
            openingBreath: "Relax your shoulders gently"
          },
          {
            key: "vitality",
            emoji: "⚡",
            title: "Vitality Gate",
            subtitle: "Recharge your energy",
            description: "Energy recharge",
            guidance: "When you want to refill your energy a little",
            openingTitle: "You are welcoming energy back",
            openingBreath: "Send your breath deep into the chest"
          }
        ]
      },
      {
        key: "night",
        emoji: "🌙",
        title: "🌙 Night",
        description: "3 minutes to release",
        detail: "",
        programs: ["Letting Go", "Sleep Preparation", "Gratitude Meditation"],
        purpose: "Deep recovery and rest",
        button: "Enter",
        layerTitle: "3 minutes to sleep in quiet",
        layerDescription: "Let today settle peacefully.\nChoose the small door you need.",
        layerResult: ["✨ Release", "✨ Stillness", "✨ Sleep"],
        smallDoors: [
          {
            key: "release",
            emoji: "🍂",
            title: "Release Gate",
            subtitle: "A moment to let go",
            description: "Letting go",
            guidance: "When you want to set down the weight of today",
            openingTitle: "You are letting the day fall away",
            openingBreath: "Make the exhale a little longer"
          },
          {
            key: "gratitude",
            emoji: "🙏",
            title: "Gratitude Gate",
            subtitle: "A moment of gratitude",
            description: "Gratitude meditation",
            guidance: "When you want to settle the heart gently",
            openingTitle: "You are meeting a small gratitude",
            openingBreath: "Bring your attention softly to the heart"
          },
          {
            key: "sleep",
            emoji: "🌙",
            title: "Sleep Gate",
            subtitle: "Prepare for deep sleep",
            description: "Sleep preparation",
            guidance: "When you want to prepare for deeper rest",
            openingTitle: "You are preparing for quiet sleep",
            openingBreath: "Let the eyes soften from within"
          }
        ]
      }
    ],
    doorLayer: {
      eyebrow: "SMALL DOOR SELECTION",
      choose: "Choose the smaller door that fits you now.",
      resultLabel: "What quietly opens here",
      recommendLabel: "Recommended",
      recommendText: "{title} may fit today best.",
      progressLabel: "Today's Rhythm",
      progressMorning: "Morning",
      progressDay: "Day",
      progressNight: "Night",
      enter: "Enter this door",
      close: "Close",
      stateOpened: "Opened gently",
      stateToday: "Today's entrance",
      stateWaiting: "Waiting quietly"
    },
    journeyPath: {
      title: "The Path Back to Your True Self",
      description: "One entrance is enough for today. Walk the quiet trail at your own pace.",
      active: "Today",
      completed: "Walking",
      next: "Next",
      locked: "Ahead",
      enter: "Enter Gently"
    },
    records: {
      title: "Rhythm Record",
      morning: "Morning",
      day: "Noon",
      night: "Night",
      todayScore: "Today’s Rhythm",
      weekScore: "Weekly Rhythm",
      streak: "Returning Days"
    },
    sessions: {
      title: "Next Rhythm",
      first: "Tomorrow’s morning door\nis quietly waiting.",
      second: "One small step\nbrings you back to yourself.",
      cta: "See Tomorrow’s Rhythm"
    },
    stateRecoveryTitle: "Choose From Your Current State",
    stateRecoveryItems: [
      { key: "sleep", emoji: "😴", title: "Sleep Recovery" },
      { key: "stress", emoji: "🌿", title: "Stress Reset" },
      { key: "energy", emoji: "⚡", title: "Energy Charge" },
      { key: "mind", emoji: "😌", title: "Mind Clearing" },
      { key: "gratitude", emoji: "💛", title: "Gratitude & Happiness" },
      { key: "focus", emoji: "🎯", title: "Focus & Flow" }
    ],
    stateRecoveryCta: "Settle Gently",
    journey: {
      title: "7-Day Small Recovery",
      body: "You can return to this journey anytime.",
      cta: "Return to the Journey"
    },
    upgrade: {
      title: "A quiet rhythm opens in Basic",
      body: "This place is for gently returning through morning, day, and night.",
      cta: "View Plans"
    }
  }
} as const;

function getLocalRhythmPhase(): RhythmPhase {
  const hour = new Date().getHours();

  if (hour >= 5 && hour <= 11) {
    return "morning";
  }

  if (hour >= 12 && hour <= 17) {
    return "day";
  }

  return "night";
}

function getDailyMessage(messages: readonly string[]) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return messages[dayOfYear % messages.length] ?? messages[0] ?? "";
}

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readMarkerStoneState(): MarkerStoneState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(MARKER_STONE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MarkerStoneState>;

    if (
      typeof parsed.date === "string" &&
      (parsed.sleep === "good" || parsed.sleep === "normal" || parsed.sleep === "low") &&
      (parsed.stress === "low" || parsed.stress === "normal" || parsed.stress === "high") &&
      (parsed.lastGate === "morning" || parsed.lastGate === "day" || parsed.lastGate === "night")
    ) {
      return parsed as MarkerStoneState;
    }
  } catch (_error) {
    window.localStorage.removeItem(MARKER_STONE_STORAGE_KEY);
  }

  return null;
}

function saveMarkerStoneState(next: MarkerStoneState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MARKER_STONE_STORAGE_KEY, JSON.stringify(next));
}

function readLastGate() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LAST_GATE_STORAGE_KEY);

  if (raw === "morning" || raw === "day" || raw === "night") {
    return raw;
  }

  return null;
}

function readTodayMood(): MarkerMood {
  const stored = getTodayRhythmCheckIn();

  if (!stored || stored.date !== getTodayKey()) {
    return "unknown";
  }

  switch (stored.moodKey) {
    case "calm":
    case "tired":
    case "sleepy":
    case "energy":
    case "thoughts":
      return stored.moodKey;
    default:
      return "unknown";
  }
}

function buildMarkerMessage(
  language: "jp" | "kr" | "en",
  options: {
    currentDay: number;
    rhythmPhase: RhythmPhase;
    mood: MarkerMood;
    sleep: MarkerSleep;
    stress: MarkerStress;
    lastGate: RhythmPhase;
  }
) {
  const { currentDay, rhythmPhase, mood, sleep, stress, lastGate } = options;

  if (language === "jp") {
    if (sleep === "low") {
      return `第${currentDay}の扉に立つ今日は、\n休みの余白を少し多めに残してみましょう。\n\n最後に通った${lastGate === "night" ? "夜" : lastGate === "day" ? "昼" : "朝"}の扉の静けさが、\n今のあなたを支えてくれます。`;
    }

    if (stress === "high" || mood === "thoughts") {
      return `今は、考えを進めるより\n中心に戻るほうが合いそうです。\n\n${rhythmPhase === "night" ? "夜" : rhythmPhase === "day" ? "昼" : "朝"}のリズムで、\nひと呼吸ずつ整えていきましょう。`;
    }

    if (mood === "energy") {
      return `今日は少し光を足す日にしてみましょう。\n\n第${currentDay}の扉を急がずにくぐりながら、\n体の奥に残る力を呼び戻してみてください。`;
    }

    return `今日のあなたには、\n静かに続ける流れが似合っています。\n\n第${currentDay}の扉と${rhythmPhase === "night" ? "夜" : rhythmPhase === "day" ? "昼" : "朝"}のリズムを重ねて、\n小さく戻ってきましょう。`;
  }

  if (language === "kr") {
    if (sleep === "low") {
      return `오늘은 제${currentDay}의 문 앞에서\n쉬어갈 여백을 조금 더 남겨두면 좋겠습니다.\n\n마지막으로 지나온 ${lastGate === "night" ? "밤" : lastGate === "day" ? "낮" : "아침"}의 문이,\n지금의 당신을 조용히 받쳐줄 것입니다.`;
    }

    if (stress === "high" || mood === "thoughts") {
      return `지금은 더 밀어가기보다\n중심으로 돌아오는 편이 잘 어울립니다.\n\n${rhythmPhase === "night" ? "밤" : rhythmPhase === "day" ? "낮" : "아침"}의 리듬에서,\n숨 하나씩 다시 정돈해 봅시다.`;
    }

    if (mood === "energy") {
      return `오늘은 몸 안의 빛을\n조금 더 깨워도 좋겠습니다.\n\n제${currentDay}의 문을 서두르지 않고 지나며,\n남아 있는 힘을 다시 불러와 보세요.`;
    }

    return `오늘의 당신에게는\n조용히 이어가는 흐름이 어울립니다.\n\n제${currentDay}의 문과 ${rhythmPhase === "night" ? "밤" : rhythmPhase === "day" ? "낮" : "아침"}의 리듬을 겹쳐,\n작게 돌아와 보세요.`;
  }

  if (sleep === "low") {
    return `At Gate ${currentDay},\nleave a little more room for rest today.\n\nThe calm of the ${lastGate} gate you last passed through\ncan keep holding you now.`;
  }

  if (stress === "high" || mood === "thoughts") {
    return `Today may be better for returning to center\nthan for pushing forward.\n\nLet the ${rhythmPhase} rhythm\nsettle you one breath at a time.`;
  }

  if (mood === "energy") {
    return `Today can be a day\nfor gently waking your inner light.\n\nAs you pass Gate ${currentDay},\ncall back the strength that is still with you.`;
  }

  return `A quiet, steady rhythm\nmay be enough for today.\n\nLet Gate ${currentDay} and the ${rhythmPhase} rhythm\nbring you back in a small, kind way.`;
}

function readTodayReflection() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const raw = window.localStorage.getItem(TODAY_REFLECTION_STORAGE_KEY);

    if (!raw) {
      return "";
    }

    const parsed = JSON.parse(raw) as { date?: string; text?: string; entries?: Record<string, string> };

    if (parsed && typeof parsed.entries === "object" && parsed.entries !== null) {
      return typeof parsed.entries[getTodayKey()] === "string" ? parsed.entries[getTodayKey()] : "";
    }

    return parsed?.date === getTodayKey() && typeof parsed.text === "string" ? parsed.text : "";
  } catch (_error) {
    window.localStorage.removeItem(TODAY_REFLECTION_STORAGE_KEY);
    return "";
  }
}

function saveTodayReflection(text: string) {
  if (typeof window === "undefined") {
    return;
  }

  let entries: Record<string, string> = {};

  try {
    const raw = window.localStorage.getItem(TODAY_REFLECTION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { entries?: Record<string, string>; date?: string; text?: string };
      if (parsed && typeof parsed.entries === "object" && parsed.entries !== null) {
        entries = parsed.entries;
      } else if (parsed?.date && typeof parsed.text === "string") {
        entries = { [parsed.date]: parsed.text };
      }
    }
  } catch (_error) {
    entries = {};
  }

  entries[getTodayKey()] = text;

  window.localStorage.setItem(
    TODAY_REFLECTION_STORAGE_KEY,
    JSON.stringify({
      date: getTodayKey(),
      text,
      entries
    })
  );
}

function buildRhythmMeditationHref(rhythm: RhythmPhase, smallDoorKey?: string) {
  // Existing safe Daily Rhythm flow currently enters through meditation.
  const duration = rhythm === "day" ? 60 : 180;
  const params = new URLSearchParams({
    duration: String(duration),
    type: rhythm,
    returnTo: `/program/basic?rhythm=${rhythm}`
  });

  if (smallDoorKey) {
    params.set("door", smallDoorKey);
  }

  return `/meditation?${params.toString()}`;
}

function getGateSurfaceClasses(rhythm: RhythmPhase) {
  if (rhythm === "morning") {
    return "bg-[radial-gradient(circle_at_top,rgba(240,211,138,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(194,139,72,0.18),transparent_36%),linear-gradient(180deg,rgba(46,56,86,0.88),rgba(20,26,42,0.92))] shadow-[0_22px_60px_rgba(232,190,111,0.14)]";
  }

  if (rhythm === "day") {
    return "bg-[radial-gradient(circle_at_top,rgba(120,174,138,0.20),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(53,101,87,0.24),transparent_40%),linear-gradient(180deg,rgba(23,54,58,0.90),rgba(12,26,30,0.94))] shadow-[0_22px_60px_rgba(73,126,103,0.16)]";
  }

  return "bg-[radial-gradient(circle_at_top,rgba(110,138,208,0.22),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(58,90,148,0.18),transparent_42%),linear-gradient(180deg,rgba(20,35,61,0.92),rgba(9,18,34,0.96))] shadow-[0_22px_60px_rgba(79,111,178,0.16)]";
}

function getJourneyGateLabel(language: "jp" | "kr" | "en", day: number) {
  if (language === "jp") {
    return `第${day}の扉`;
  }

  if (language === "kr") {
    return `제${day}의 문`;
  }

  const ordinals = ["One", "Two", "Three", "Four", "Five", "Six", "Seven"];
  return `Gate ${ordinals[day - 1] ?? day}`;
}

function getSanctuaryJourneyTitle(language: "jp" | "kr" | "en", day: number) {
  const titles = {
    jp: [
      "🌱 Day 1 立ち止まる庭",
      "🌿 Day 2 呼吸の道",
      "🌲 Day 3 身体の森",
      "🌊 Day 4 感情の湖",
      "⛰ Day 5 思考の丘",
      "🌌 Day 6 静けさの空",
      "✨ Day 7 私のリズム"
    ],
    kr: [
      "🌱 Day 1 멈추는 정원",
      "🌿 Day 2 호흡의 길",
      "🌲 Day 3 몸의 숲",
      "🌊 Day 4 감정의 호수",
      "⛰ Day 5 생각의 언덕",
      "🌌 Day 6 고요의 하늘",
      "✨ Day 7 나의 리듬"
    ],
    en: [
      "🌱 Day 1 Garden of Pause",
      "🌿 Day 2 Path of Breath",
      "🌲 Day 3 Forest of Body",
      "🌊 Day 4 Lake of Emotion",
      "⛰ Day 5 Hill of Thought",
      "🌌 Day 6 Sky of Stillness",
      "✨ Day 7 My Rhythm"
    ]
  } as const;

  return titles[language][day - 1] ?? titles[language][0];
}

function getMarkerStoneCtaLabel(language: "jp" | "kr" | "en", rhythmPhase: RhythmPhase) {
  if (language === "jp") {
    if (rhythmPhase === "morning") return "朝の扉を開く";
    if (rhythmPhase === "day") return "昼の扉を開く";
    return "夜の扉を開く";
  }

  if (language === "kr") {
    if (rhythmPhase === "morning") return "아침의 문 열기";
    if (rhythmPhase === "day") return "낮의 문 열기";
    return "밤의 문 열기";
  }

  if (rhythmPhase === "morning") return "Open Morning Gate";
  if (rhythmPhase === "day") return "Open Day Gate";
  return "Open Night Gate";
}

function replaceDayToken(template: string, day: number) {
  return template.replace("{day}", String(day));
}

function getStreakReward(language: "jp" | "kr" | "en", streakDays: number) {
  if (language === "jp") {
    return `小さな回復が続いて\n${streakDays}日目\n種が静かに根を下ろしています。`;
  }

  if (language === "kr") {
    return `작은 회복이 이어진 지\n${streakDays}일째\n씨앗이 뿌리를 내리고 있습니다.`;
  }

  return `Your small recovery has continued for\n${streakDays} days\nA seed is quietly taking root.`;
}

export function BasicHome({
  currentDay = 1,
  streakCount = 3,
  planKey = "basic",
  membershipResolved = true,
  defaultRhythm
}: BasicHomeProps) {
  const { language } = useLanguage();
  const copy = useMemo(() => getLocaleCopy(basicHomeCopy, language), [language]);
  const searchParams = useSearchParams();
  const highlightedRhythm = (searchParams.get("rhythm") ?? searchParams.get("gate")) as RhythmPhase | null;
  const rhythmPhase =
    highlightedRhythm === "morning" || highlightedRhythm === "day" || highlightedRhythm === "night"
      ? highlightedRhythm
      : defaultRhythm ?? getLocalRhythmPhase();
  const todayQuestion = useMemo(() => getDailyMessage(copy.question.prompts), [copy.question.prompts]);
  const [journeyDay, setJourneyDay] = useState(currentDay);
  const [streakDays, setStreakDays] = useState(streakCount);
  const [selectedMood, setSelectedMood] = useState<MarkerMood>("unknown");
  const [sleepStatus, setSleepStatus] = useState<MarkerSleep>("normal");
  const [stressStatus, setStressStatus] = useState<MarkerStress>("normal");
  const [lastGate, setLastGate] = useState<RhythmPhase>(rhythmPhase);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [completedToday, setCompletedToday] = useState(false);
  const [activeDoorLayer, setActiveDoorLayer] = useState<RhythmPhase | null>(null);
  const [transitionDoor, setTransitionDoor] = useState<{
    phase: RhythmPhase;
    door: SmallDoor;
  } | null>(null);

  useEffect(() => {
    try {
      const journeyRaw = window.localStorage.getItem(RHYTHM_JOURNEY_STORAGE_KEY);
      const streakRaw = window.localStorage.getItem("meisoulife_basic_rhythm_check_streak");
      const markerState = readMarkerStoneState();
      const savedLastGate = readLastGate();
      const challengeProgress = getChallengeRhythmProgress();
      const returnRhythm = getReturnRhythmSnapshot();
      const parsedStreak = Number.parseInt(streakRaw || "", 10);
      const parsedJourney = journeyRaw ? (JSON.parse(journeyRaw) as { currentDay?: number }) : null;

      setCompletedDays(challengeProgress.completedDays);
      setCompletedToday(returnRhythm.isCompletedToday);

      if (typeof parsedJourney?.currentDay === "number" && parsedJourney.currentDay >= 1 && parsedJourney.currentDay <= 7) {
        setJourneyDay(parsedJourney.currentDay);
      } else {
        setJourneyDay(challengeProgress.currentDay);
      }

      if (Number.isFinite(parsedStreak) && parsedStreak > 0) {
        setStreakDays(parsedStreak);
      }

      if (markerState?.date === getTodayKey()) {
        setSleepStatus(markerState.sleep);
        setStressStatus(markerState.stress);
        setLastGate(markerState.lastGate);
      } else if (savedLastGate) {
        setLastGate(savedLastGate);
      }

      setSelectedMood(readTodayMood());
      setReflectionText(readTodayReflection());
    } catch (error) {
      console.warn("[basic-home] failed to read local sanctuary state", error);
    }
  }, []);

  useEffect(() => {
    setJourneyDay(currentDay);
  }, [currentDay]);

  useEffect(() => {
    setStreakDays(streakCount);
  }, [streakCount]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    if (activeDoorLayer) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeDoorLayer]);

  function persistMarkerState(next: Partial<Pick<MarkerStoneState, "sleep" | "stress" | "lastGate">>) {
    const payload: MarkerStoneState = {
      date: getTodayKey(),
      sleep: next.sleep ?? sleepStatus,
      stress: next.stress ?? stressStatus,
      lastGate: next.lastGate ?? lastGate
    };

    saveMarkerStoneState(payload);
  }

  function handleSelectGate(gate: RhythmPhase) {
    setLastGate(gate);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LAST_GATE_STORAGE_KEY, gate);
    }

    persistMarkerState({ lastGate: gate });
  }

  function openDoorLayer(gate: RhythmPhase) {
    handleSelectGate(gate);
    setActiveDoorLayer(gate);
  }

  function closeDoorLayer() {
    setActiveDoorLayer(null);
  }

  function getRecommendedDoor(phase: RhythmPhase): string {
    if (phase === "morning") {
      if (selectedMood === "sleepy" || sleepStatus === "low") return "energy";
      if (selectedMood === "thoughts") return "vision";
      return "affirmation";
    }

    if (phase === "day") {
      if (stressStatus === "high" || selectedMood === "thoughts") return "relax";
      if (selectedMood === "energy") return "vitality";
      return "focus";
    }

    if (stressStatus === "high" || selectedMood === "thoughts") return "release";
    if (sleepStatus === "low" || selectedMood === "sleepy") return "sleep";
    return "gratitude";
  }

  function handleEnterSmallDoor(phase: RhythmPhase, door: SmallDoor) {
    setTransitionDoor({ phase, door });

    window.setTimeout(() => {
      if (phase === "morning" && door.key === "affirmation") {
        if (getNatureSoundPreference()) {
          window.sessionStorage.setItem(STRUCTURED_AMBIENT_PENDING_KEY, "1");
        } else {
          window.sessionStorage.removeItem(STRUCTURED_AMBIENT_PENDING_KEY);
        }
      }

      window.location.href = buildRhythmMeditationHref(phase, door.key);
    }, 950);
  }

  const markerMessage = useMemo(
    () =>
      buildMarkerMessage(language, {
        currentDay: journeyDay,
        rhythmPhase,
        mood: selectedMood,
        sleep: sleepStatus,
        stress: stressStatus,
        lastGate
      }),
    [journeyDay, language, lastGate, rhythmPhase, selectedMood, sleepStatus, stressStatus]
  );
  const isBasicMember = membershipResolved ? planKey !== "free" : true;
  const todayRhythmScore = Math.min(
    100,
    (selectedMood !== "unknown" ? 28 : 12) +
      (completedToday ? 32 : 14) +
      (sleepStatus === "good" ? 22 : sleepStatus === "normal" ? 16 : 8) +
      (stressStatus === "low" ? 18 : stressStatus === "normal" ? 12 : 6)
  );
  const weeklyRhythmScore = Math.min(100, Math.round(((completedDays.length + (completedToday ? 1 : 0)) / 7) * 100));
  const activeDoorCard = activeDoorLayer ? copy.rhythmCards.find((card) => card.key === activeDoorLayer) : null;
  const activeDoorPhase = activeDoorCard ? (activeDoorCard.key as RhythmPhase) : null;
  const recommendedDoorKey = activeDoorPhase ? getRecommendedDoor(activeDoorPhase) : null;
  const recommendedDoor =
    activeDoorCard && recommendedDoorKey
      ? activeDoorCard.smallDoors.find((door) => door.key === recommendedDoorKey) ?? activeDoorCard.smallDoors[0]
      : null;

  function getGateRecordState(gate: RhythmPhase) {
    if (completedToday && lastGate === gate) {
      return copy.doorLayer.stateOpened;
    }

    if (rhythmPhase === gate) {
      return copy.doorLayer.stateToday;
    }

    return copy.doorLayer.stateWaiting;
  }

  function handleReflectionChange(next: string) {
    setReflectionText(next);
    setReflectionSaved(false);

    try {
      saveTodayReflection(next);
      setReflectionSaved(true);
    } catch (error) {
      console.warn("[basic-home] failed to save today reflection", error);
    }
  }

  const sanctuarySectionClass =
    "relative overflow-hidden rounded-[34px] border border-[rgba(115,231,210,0.14)] bg-[radial-gradient(circle_at_top_left,rgba(115,231,210,0.14),transparent_42%),radial-gradient(circle_at_top_right,rgba(89,193,255,0.14),transparent_46%),linear-gradient(135deg,rgba(115,231,210,0.08),rgba(89,193,255,0.04)),linear-gradient(180deg,rgba(8,26,46,0.66),rgba(8,32,48,0.70)_55%,rgba(10,42,52,0.72)_100%)] px-6 py-8 shadow-[0_28px_110px_rgba(4,12,24,0.28)] backdrop-blur-[24px] sm:px-8";

  return (
    <div className="space-y-10 sm:space-y-12">
      <section
        id="marker-stone"
        className="relative overflow-hidden rounded-[38px] border border-[rgba(115,231,210,0.20)] bg-[radial-gradient(circle_at_top_left,rgba(115,231,210,0.30),transparent_52%),radial-gradient(circle_at_top_right,rgba(89,193,255,0.26),transparent_58%),linear-gradient(180deg,#041221_0%,#082038_40%,#0B2F3D_70%,#103845_100%)] px-6 py-8 shadow-[0_42px_128px_rgba(3,10,20,0.5)] sm:px-8 sm:py-10"
      >
        <div id="sanctuary-home" className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(241,222,170,0.14),transparent_58%)]" />
          <div className="absolute left-[12%] top-[16%] h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(64,189,165,0.26),transparent_72%)] blur-[88px] animate-meditation-fog" />
          <div className="absolute right-[2%] top-[6%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(89,193,255,0.24),transparent_74%)] blur-[96px] animate-meditation-fog" />
          <div className="absolute inset-x-[18%] bottom-[8%] h-40 rounded-full bg-[radial-gradient(circle,rgba(65,159,147,0.20),transparent_74%)] blur-[88px]" />
        </div>

        <div className="relative">
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.36em] text-gold/82">{copy.sanctuaryEyebrow}</p>
            <p className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/68">
              {copy.memberBadge}
            </p>
            <div className="mt-8 space-y-4">
              <p className="text-sm uppercase tracking-[0.24em] text-white/48">{copy.routineSection.title}</p>
            <h1 className="hero-measure word-balance keep-phrase max-w-[11ch] whitespace-pre-line font-serif text-[clamp(2.25rem,9vw,4.5rem)] leading-[1.14] text-white sm:max-w-[14ch]">
              {copy.hero.title}
            </h1>
            <p className="hero-measure word-balance keep-phrase max-w-[14ch] whitespace-pre-line font-serif text-[clamp(1.3rem,5vw,2.2rem)] leading-[1.4] text-white/88 sm:max-w-[18ch] sm:leading-[1.48]">
              {copy.hero.subtitle}
            </p>
          </div>
            <p className="body-measure keep-phrase mt-6 max-w-[22ch] text-base leading-[1.75] text-white/66 sm:max-w-2xl sm:text-lg sm:leading-[1.95]">
              {copy.hero.support}
            </p>
            <Link
              href="#today-rhythm-gates"
              className="button-nowrap mt-8 inline-flex min-h-[50px] items-center justify-center rounded-full border border-[rgba(115,231,210,0.22)] bg-white/[0.08] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
            >
              {copy.hero.primaryCta}
            </Link>
          </div>

          <div id="today-rhythm-gates" className="mt-10">
            <p className="body-measure keep-phrase mb-4 max-w-[20ch] text-sm leading-[1.7] text-white/62 sm:max-w-[30ch] sm:leading-7">
              {copy.rhythmCardsTitle}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {copy.rhythmCards.map((card) => {
              const rhythm = card.key as RhythmPhase;

              return (
                <article
                  key={card.key}
                  className={`group relative overflow-hidden rounded-[32px] border px-5 py-6 transition duration-300 hover:-translate-y-1 ${
                    rhythmPhase === rhythm ? "border-[rgba(115,231,210,0.28)] ring-1 ring-[rgba(115,231,210,0.18)] shadow-[0_20px_60px_rgba(64,189,165,0.12)]" : "border-white/10"
                  } ${getGateSurfaceClasses(rhythm)}`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_26%,rgba(6,10,20,0.24)_100%)] opacity-90" />
                  <div className="absolute -right-8 top-6 h-24 w-24 rounded-full bg-white/8 blur-2xl transition duration-500 group-hover:scale-125" />
                  <div className="absolute inset-x-[18%] top-0 h-14 rounded-full bg-white/8 blur-2xl opacity-70" />
                  <div className="relative">
                    <p className="keep-phrase text-base font-semibold tracking-[0.04em] text-gold/90">{card.title}</p>
                    <p className="word-balance keep-phrase mt-4 min-h-[48px] max-w-[16ch] text-base leading-[1.6] text-white/88 sm:max-w-none sm:leading-7">
                      {card.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => openDoorLayer(rhythm)}
                      className="button-nowrap mt-6 inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/14 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white transition duration-300 group-hover:bg-white/[0.12]"
                    >
                      {card.button}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {activeDoorCard && activeDoorPhase ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[rgba(3,8,18,0.56)] px-4 pb-4 pt-20 backdrop-blur-[10px] sm:items-center sm:px-6">
          <div className="absolute inset-0" onClick={closeDoorLayer} aria-hidden="true" />
          <section
            aria-modal="true"
            role="dialog"
            className={`relative z-[71] w-full max-w-3xl overflow-hidden rounded-[34px] border border-[rgba(115,231,210,0.18)] px-5 py-6 shadow-[0_32px_120px_rgba(4,12,24,0.42)] backdrop-blur-[24px] sm:px-7 sm:py-7 ${getGateSurfaceClasses(activeDoorPhase)}`}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_24%,rgba(4,8,18,0.34)_100%)]" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gold/76">{copy.doorLayer.eyebrow}</p>
                  <p className="mt-4 keep-phrase text-base font-semibold tracking-[0.04em] text-gold/90">
                    {activeDoorCard.title}
                  </p>
                  <h2 className="mt-3 max-w-[14ch] whitespace-pre-line font-serif text-[26px] leading-[1.35] text-white sm:max-w-none sm:text-[32px] sm:leading-[1.42]">
                    {activeDoorCard.layerTitle}
                  </h2>
                  <p className="mt-4 max-w-[24ch] whitespace-pre-line text-sm leading-7 text-white/74 sm:max-w-2xl">
                    {activeDoorCard.layerDescription}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDoorLayer}
                  className="button-nowrap inline-flex min-h-[40px] items-center justify-center rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/74 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {copy.doorLayer.close}
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                {activeDoorCard.smallDoors.map((smallDoor: SmallDoor) => (
                  <button
                    key={smallDoor.key}
                    type="button"
                    onClick={() => handleEnterSmallDoor(activeDoorPhase, smallDoor)}
                    className="group w-full rounded-[24px] border border-white/10 bg-white/[0.05] px-4 py-4 text-left transition hover:bg-white/[0.08]"
                  >
                    <div className="flex items-start gap-4">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[18px] text-white/84">
                        {smallDoor.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="keep-phrase text-base font-semibold text-white">{smallDoor.title}</p>
                          <span className="text-sm text-white/56">{copy.doorLayer.enter}</span>
                        </div>
                        <p className="mt-2 keep-phrase text-sm text-gold/82">{smallDoor.subtitle}</p>
                        <p className="mt-2 text-sm leading-7 text-white/74">{smallDoor.guidance}</p>
                        <p className="mt-2 text-sm leading-7 text-white/62">{smallDoor.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {recommendedDoor ? (
                <div className="mt-6 rounded-[24px] border border-[rgba(212,178,106,0.16)] bg-gold/[0.06] px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-gold/74">{copy.doorLayer.recommendLabel}</p>
                  <p className="mt-3 text-base font-semibold text-white">{recommendedDoor.title}</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    {copy.doorLayer.recommendText.replace("{title}", recommendedDoor.title)}
                  </p>
                </div>
              ) : null}

              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-gold/74">{copy.doorLayer.resultLabel}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">{copy.doorLayer.progressLabel}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeDoorCard.layerResult.map((result) => (
                    <span
                      key={result}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70"
                    >
                      {result}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-white/62">
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                    {copy.doorLayer.progressMorning} {lastGate === "morning" ? "✓" : "○"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                    {copy.doorLayer.progressDay} {lastGate === "day" ? "✓" : "○"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
                    {copy.doorLayer.progressNight} {lastGate === "night" ? "✓" : "○"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {transitionDoor ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(3,8,18,0.72)] px-6 backdrop-blur-[12px]">
          <div className="w-full max-w-md rounded-[30px] border border-[rgba(212,178,106,0.18)] bg-[radial-gradient(circle_at_top,rgba(241,222,170,0.12),transparent_40%),linear-gradient(180deg,rgba(18,28,44,0.86),rgba(8,18,30,0.9))] px-6 py-8 text-center shadow-[0_32px_120px_rgba(4,12,24,0.42)]">
            <p className="text-3xl">{transitionDoor.door.emoji}</p>
            <p className="mt-4 text-lg font-semibold text-white">{transitionDoor.door.title}</p>
            <p className="mt-3 text-sm text-gold/82">{transitionDoor.door.openingTitle}</p>
            <p className="mt-5 text-sm leading-7 text-white/68">{transitionDoor.door.openingBreath}</p>
          </div>
        </div>
      ) : null}

      {!isBasicMember ? (
        <section className={sanctuarySectionClass}>
          <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.hero.title}</p>
          <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{copy.upgrade.title}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/72">{copy.upgrade.body}</p>
          <Link
            href="/pricing"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full border border-gold/30 bg-gold/[0.12] px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold/[0.18]"
          >
            {copy.upgrade.cta}
          </Link>
        </section>
      ) : null}

      <section className="relative overflow-hidden rounded-[34px] border border-[rgba(212,178,106,0.16)] bg-[radial-gradient(circle_at_top,rgba(241,222,170,0.14),transparent_48%),radial-gradient(circle_at_top_left,rgba(115,231,210,0.10),transparent_36%),linear-gradient(180deg,rgba(24,28,41,0.88),rgba(17,27,41,0.92),rgba(22,34,46,0.96))] px-6 py-8 shadow-[0_28px_90px_rgba(4,12,24,0.24)] backdrop-blur-[24px] sm:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(241,222,170,0.14),transparent_68%)]" />
        <p className="relative text-xs uppercase tracking-[0.28em] text-gold/78">{copy.aiGuide.title}</p>
        <div className="relative mt-5 rounded-[28px] border border-[rgba(212,178,106,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-6 shadow-[0_18px_50px_rgba(4,12,24,0.18)]">
          <p className="text-xs uppercase tracking-[0.24em] text-gold/62">{copy.aiGuide.eyebrow}</p>
          <p className="mt-4 max-w-[16ch] whitespace-pre-line font-serif text-[22px] leading-[1.7] text-white/90 sm:max-w-none sm:text-[28px] sm:leading-[1.8]">
            {copy.aiGuide.body}
          </p>
        </div>
      </section>

      <section id="rhythm-room" className={`${sanctuarySectionClass} bg-[radial-gradient(circle_at_18%_20%,rgba(115,231,210,0.14),transparent_34%),radial-gradient(circle_at_82%_14%,rgba(89,193,255,0.16),transparent_36%),linear-gradient(180deg,rgba(10,24,42,0.66),rgba(7,24,36,0.76),rgba(9,38,46,0.78))]`}>
        <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <article className="rounded-[30px] border border-[rgba(212,178,106,0.20)] bg-[radial-gradient(circle_at_top,rgba(241,222,170,0.12),transparent_42%),linear-gradient(180deg,rgba(34,30,38,0.88),rgba(18,27,39,0.92),rgba(16,32,42,0.96))] px-6 py-6 shadow-[0_24px_72px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/76">🌱 {copy.openGate.title}</p>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-white/52">{getJourneyGateLabel(language, journeyDay)}</p>
            <p className="word-balance keep-phrase mt-3 max-w-[15ch] text-[26px] font-semibold leading-[1.28] text-white sm:max-w-none sm:text-[30px]">
              {getSanctuaryJourneyTitle(language, journeyDay)}
            </p>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/70">{copy.openGate.practice}</p>
            <Link
              href={`/rhythm-journey?day=${journeyDay}`}
              className="button-nowrap mt-6 inline-flex min-h-[46px] items-center justify-center rounded-full border border-[rgba(212,178,106,0.24)] bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
            >
              {copy.openGate.cta}
            </Link>
          </article>
          <article className={`relative overflow-hidden rounded-[30px] border border-[rgba(115,231,210,0.20)] px-6 py-6 shadow-[0_24px_72px_rgba(0,0,0,0.28)] ${getGateSurfaceClasses(rhythmPhase)}`}>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_28%,rgba(4,8,18,0.28)_100%)]" />
            <div className="absolute inset-x-[12%] top-0 h-24 rounded-full bg-[rgba(115,231,210,0.12)] blur-3xl" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.24em] text-gold/78">{copy.markerStone.title}</p>
              <p className="mt-4 text-sm uppercase tracking-[0.24em] text-white/58">{copy.markerStone.bodyTitle}</p>
              <p className="word-balance keep-phrase mt-3 max-w-[14ch] whitespace-pre-line text-[24px] font-semibold leading-[1.5] text-white sm:max-w-none sm:text-[30px] sm:leading-[1.6]">
                {copy.markerStone.heroNote}
              </p>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/68">{markerMessage}</p>
            </div>
          </article>
        </div>
      </section>

      <section id="journey-path" className={`${sanctuarySectionClass} bg-[radial-gradient(circle_at_top_left,rgba(115,231,210,0.12),transparent_38%),linear-gradient(135deg,rgba(115,231,210,0.08),rgba(89,193,255,0.04)),linear-gradient(180deg,rgba(10,24,42,0.64),rgba(8,28,42,0.74),rgba(9,36,44,0.78))]`}>
        <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.journeyPath.title}</p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/56">{copy.journeyPath.description}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 7 }, (_, index) => {
            const day = index + 1;
            const completed = completedDays.includes(day);
            const active = !completed && day === journeyDay;
            const locked = !completed && day > journeyDay;
            const statusLabel = completed
              ? copy.journeyPath.completed
              : active
                ? copy.journeyPath.active
                : day === journeyDay + 1
                  ? copy.journeyPath.next
                  : copy.journeyPath.locked;

            return (
              <article
                key={day}
                className={`rounded-[28px] border px-5 py-5 transition ${
                  active
                    ? "border-gold/60 bg-gold/10 text-white shadow-[0_18px_40px_rgba(212,186,117,0.10)]"
                    : completed
                      ? "border-moss/28 bg-moss/[0.08] text-white/88"
                      : locked
                        ? "border-white/8 bg-white/[0.03] text-white/60"
                        : "border-white/10 bg-white/[0.04] text-white/72"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-gold shadow-[0_0_18px_rgba(212,178,106,0.8)]" : completed ? "bg-[rgba(115,231,210,0.85)]" : "bg-white/18"}`} />
                  <p className="text-xs uppercase tracking-[0.24em] text-gold/78">
                    {statusLabel}
                  </p>
                </div>
                <p className="word-balance keep-phrase mt-4 text-lg font-semibold leading-[1.45] text-white">{getSanctuaryJourneyTitle(language, day)}</p>
                {locked ? (
                  <span className="button-nowrap mt-5 inline-flex min-h-[42px] items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/42">
                    {copy.journeyPath.locked}
                  </span>
                ) : (
                  <Link
                    href={`/rhythm-journey?day=${day}`}
                    className="button-nowrap mt-5 inline-flex min-h-[42px] items-center justify-center rounded-full border border-white/14 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
                  >
                    {copy.journeyPath.enter}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className={`${sanctuarySectionClass} bg-[radial-gradient(circle_at_top_right,rgba(89,193,255,0.12),transparent_38%),linear-gradient(135deg,rgba(115,231,210,0.08),rgba(89,193,255,0.04)),linear-gradient(180deg,rgba(10,24,42,0.64),rgba(8,28,42,0.74),rgba(9,36,44,0.78))]`}>
        <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.question.title}</p>
        <p className="mt-5 max-w-[15ch] whitespace-pre-line font-serif text-[22px] leading-[1.6] text-white/88 sm:max-w-none sm:text-[30px] sm:leading-[1.75]">
          {todayQuestion}
        </p>
        <div className="mt-5">
          <textarea
            value={reflectionText}
            onChange={(event) => handleReflectionChange(event.target.value)}
            placeholder={copy.question.placeholder}
            className="min-h-[132px] w-full rounded-[24px] border border-[rgba(115,231,210,0.14)] bg-white/[0.03] px-5 py-4 text-base leading-7 text-white placeholder:text-white/32 outline-none transition focus:border-[rgba(115,231,210,0.34)]"
          />
          {reflectionSaved ? <p className="mt-3 text-sm text-gold/74">{copy.question.saved}</p> : null}
        </div>
      </section>

      <section id="companions" className={`${sanctuarySectionClass} bg-[radial-gradient(circle_at_top_left,rgba(89,193,255,0.12),transparent_40%),linear-gradient(135deg,rgba(115,231,210,0.08),rgba(89,193,255,0.04)),linear-gradient(180deg,rgba(10,24,42,0.62),rgba(8,28,42,0.72),rgba(9,36,44,0.76))]`}>
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.companions.title}</p>
            <p className="mt-4 text-base leading-8 text-white/74">{copy.companions.body}</p>
            <div className="mt-6 flex items-center gap-3">
              {["emerald", "aqua", "gold"].map((tone, index) => (
                <span
                  key={tone}
                  className={`h-11 w-11 rounded-full border border-white/12 ${index === 0 ? "bg-[radial-gradient(circle,rgba(115,231,210,0.65),rgba(115,231,210,0.12))]" : index === 1 ? "bg-[radial-gradient(circle,rgba(89,193,255,0.58),rgba(89,193,255,0.10))]" : "bg-[radial-gradient(circle,rgba(212,178,106,0.62),rgba(212,178,106,0.12))]"} ${index > 0 ? "-ml-3" : ""}`}
                />
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-[rgba(115,231,210,0.12)] bg-white/[0.03] px-4 py-4 text-sm text-white/74">{copy.companions.walked}</div>
              <div className="rounded-[22px] border border-[rgba(89,193,255,0.12)] bg-white/[0.03] px-4 py-4 text-sm text-white/74">{copy.companions.present}</div>
              <div className="rounded-[22px] border border-[rgba(212,178,106,0.14)] bg-white/[0.03] px-4 py-4 text-sm text-white/74">{copy.companions.live}</div>
            </div>
          </div>
          <div className="flex items-end">
            <Link
              href="/community"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              {copy.companions.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className={`${sanctuarySectionClass} bg-[radial-gradient(circle_at_top_left,rgba(115,231,210,0.12),transparent_38%),linear-gradient(135deg,rgba(115,231,210,0.08),rgba(89,193,255,0.04)),linear-gradient(180deg,rgba(10,24,42,0.62),rgba(8,28,42,0.72),rgba(9,36,44,0.76))]`}>
        <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.sessions.title}</p>
        <div className="mt-5 rounded-[26px] border border-[rgba(115,231,210,0.14)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-5 py-6">
          <p className="whitespace-pre-line text-base leading-8 text-white/84">{copy.sessions.first}</p>
          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/66">{copy.sessions.second}</p>
          <Link
            href="#today-rhythm-gates"
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
          >
            {copy.sessions.cta}
          </Link>
        </div>
      </section>

      <section id="quiet-records" className={`${sanctuarySectionClass} bg-[radial-gradient(circle_at_top_right,rgba(89,193,255,0.12),transparent_38%),linear-gradient(135deg,rgba(115,231,210,0.08),rgba(89,193,255,0.04)),linear-gradient(180deg,rgba(10,24,42,0.64),rgba(8,28,42,0.74),rgba(9,36,44,0.78))]`}>
        <p className="text-xs uppercase tracking-[0.28em] text-gold/78">{copy.records.title}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-5">
            <p className="text-sm text-white/56">{copy.records.morning}</p>
            <p className="mt-3 text-sm leading-7 text-white/82">{getGateRecordState("morning")}</p>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-5">
            <p className="text-sm text-white/56">{copy.records.day}</p>
            <p className="mt-3 text-sm leading-7 text-white/82">{getGateRecordState("day")}</p>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-5">
            <p className="text-sm text-white/56">{copy.records.night}</p>
            <p className="mt-3 text-sm leading-7 text-white/82">{getGateRecordState("night")}</p>
          </article>
          <article className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/56">{copy.records.todayScore}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{todayRhythmScore}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/56">{copy.records.weekScore}</p>
                <p className="mt-3 text-xl font-semibold text-white/86">{weeklyRhythmScore}</p>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/70">{getStreakReward(language, streakDays)}</p>
          </article>
        </div>
      </section>
    </div>
  );
}
