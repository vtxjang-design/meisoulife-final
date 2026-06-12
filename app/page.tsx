"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AIRhythmCoach } from "@/components/ai-rhythm-coach";
import { useAuthState } from "@/components/auth-provider";
import { BrainOwnershipJourney } from "@/components/brain-ownership-journey";
import { CheckoutButton } from "@/components/checkout-button";
import { DailyRhythmCheck } from "@/components/daily-rhythm-check";
import { DailyRhythmLayer } from "@/components/daily-rhythm-layer";
import { FounderVisionSection } from "@/components/founder-vision-section";
import { InstantMeditationSection } from "@/components/instant-meditation-section";
import { LiveTogether } from "@/components/live-together";
import { RhythmGarden } from "@/components/rhythm-garden";
import { SectionHeading } from "@/components/section-heading";
import { TogetherAwakeSection } from "@/components/together-awake-section";
import { ZeroGateSection } from "@/components/zero-gate-section";
import { getChallengeRhythmProgress, type ChallengeRhythmProgress } from "@/lib/challenge-rhythm";
import { useLanguage, languageButtons, useLocaleCopy, useSiteCopy } from "@/lib/i18n";
import { landingCopy } from "@/lib/landing-copy";
import { getReturnRhythmSnapshot, updateReturnRhythmVisit, type ReturnRhythmSnapshot } from "@/lib/return-rhythm";

const MEDITATION_MOOD_STORAGE_KEY = "meisoulife_instant_meditation_mood";
const AI_COACH_URL =
  process.env.NEXT_PUBLIC_AI_COACH_URL ||
  "https://chatgpt.com/g/g-69f968bc9a408191a3e5f943912666c0-quiet-rhythm-guide";

const heroCopy = {
  jp: {
    eyebrow: "AI時代の人間回復",
    title: "AIと情報に疲れた、\n心と脳が静かに戻る場所。",
    supporting:
      "少し立ち止まり、\n自分のリズムへ戻る。\n急がなくても大丈夫です。",
    subtitle: "無料・60秒・登録不要",
    primary: "今日のリセットを選ぶ",
    secondary: "7日間の小さな回復",
    ctaSupport: "あなたのリズムを取り戻す、小さな7日間。",
    tertiaryGuest: "無料で始める",
    tertiaryFree: "今日のチェックイン",
    tertiaryPaid: "自分のリズムへ戻る",
    trust: "無料・60秒・登録不要",
    note: "人生を今日変えなくても大丈夫です。ただ静かな1分だけ。",
    scrollHint: "この先に、小さな回復へ続く静かな道があります",
    proof: ["情報過多に", "疲れた心に", "考えすぎに"],
    visualCopy: "情報に引かれるのではなく、\n自分へ戻るための静かな入口。",
    visualLabel: "Quiet Forest Entry",
    visualAlt: "Forest light and stillness"
  },
  kr: {
    eyebrow: "AI 시대의 인간 회복",
    title: "AI와 정보에 지친 하루,\n마음과 뇌가\n잠시 쉬어가는 곳.",
    supporting:
      "잠시 멈추고,\n내 리듬으로 돌아오는\n조용한 1분.",
    subtitle: "무료 · 60초 · 가입 불필요",
    primary: "오늘의 리셋 고르기",
    secondary: "7일간의 작은 회복",
    ctaSupport: "나의 리듬을 되찾는 작은 7일.",
    tertiaryGuest: "무료로 시작하기",
    tertiaryFree: "오늘의 체크인",
    tertiaryPaid: "나의 리듬으로 돌아가기",
    trust: "무료 · 60초 · 가입 불필요",
    note: "서두르지 않아도 괜찮습니다.",
    scrollHint: "이 아래에 작은 회복으로 이어지는 조용한 길이 있습니다",
    proof: ["과부하일 때", "지쳤을 때", "생각이 많을 때"],
    visualCopy: "정보의 흐름보다,\n나 자신에게 돌아오는 숨의 입구.",
    visualLabel: "Quiet Forest Entry",
    visualAlt: "Forest light and stillness"
  },
  en: {
    eyebrow: "Human Recovery in the AI Age",
    title: "AI and information overload,\nan exhausting day,\nwhere your mind and brain\ncan briefly rest.",
    supporting:
      "Pause.\nBreathe.\nReturn to your rhythm.\n\nThere is no need to rush.",
    subtitle: "Free · 60 seconds · No signup",
    primary: "Choose Today’s Reset",
    secondary: "7 Days of Small Recovery",
    ctaSupport: "A small 7-day journey to return to your rhythm.",
    tertiaryGuest: "Start Free",
    tertiaryFree: "Today's Check-In",
    tertiaryPaid: "Return to My Rhythm",
    trust: "Free · 60 seconds · No signup",
    note: "You do not need to fix your life today. Just take one quiet minute.",
    scrollHint: "A quiet path into small recovery begins just below",
    proof: ["for stress", "for overload", "for overthinking"],
    visualCopy: "A quiet forest entrance for returning\nto breath instead of noise.",
    visualLabel: "Quiet Forest Entry",
    visualAlt: "Forest light and stillness"
  }
} as const;

const returnLoopCopy = {
  jp: {
    eyebrow: "RETURN LOOP",
    title: "静かな1分が、\nまた戻ってこられるリズムになる。",
    description:
      "瞑想lifeは、一度きりの気分転換ではなく、また明日も戻ってこられる静かな回復の流れを育てます。",
    steps: [
      { label: "今日", title: "1分リセット", description: "今の状態に合う入口をひとつ選んで、静かに整えます。" },
      { label: "7日", title: "リズムをつくる", description: "短くても、毎日の小さな回復が戻る力を育てます。" },
      { label: "30日", title: "自分の軸が育つ", description: "少しずつ、情報に飲まれにくい自分の感覚が育っていきます。" }
    ],
    note: "大切なのは、深く頑張ることではなく、また戻ってくることです。",
    primary: "7日間の小さな回復",
    secondary: "まず1分から整える"
  },
  kr: {
    eyebrow: "RETURN LOOP",
    title: "조용한 1분이,\n다시 돌아오게 하는 리듬이 됩니다.",
    description:
      "명상life는 한 번의 기분 전환보다, 내일도 다시 돌아올 수 있는 조용한 회복의 흐름을 만드는 데 더 집중합니다.",
    steps: [
      { label: "오늘", title: "1분 리셋", description: "지금 상태에 맞는 입구 하나를 고르고, 조용히 몸과 마음을 정돈합니다." },
      { label: "7일", title: "리듬 만들기", description: "짧아도 괜찮아요. 매일의 작은 회복이 다시 돌아오는 힘이 됩니다." },
      { label: "30일", title: "내 중심이 자라기", description: "조금씩, 정보에 덜 휩쓸리는 자기 감각과 선택의 힘이 자라납니다." }
    ],
    note: "중요한 것은 깊게 애쓰는 것이 아니라, 다시 돌아오는 것입니다.",
    primary: "7일간의 작은 회복",
    secondary: "먼저 1분 리셋하기"
  },
  en: {
    eyebrow: "RETURN LOOP",
    title: "One quiet minute can become\na rhythm you return to tomorrow.",
    description:
      "MeisoLife is not only for one good moment. It is a calm recovery loop you can come back to again tomorrow.",
    steps: [
      { label: "Today", title: "1-minute reset", description: "Choose one gate that fits your state and settle quietly." },
      { label: "7 days", title: "Build a rhythm", description: "Even short daily returns begin to strengthen your inner reset pattern." },
      { label: "30 days", title: "Grow inner stability", description: "Little by little, your attention becomes less capturable and more your own." }
    ],
    note: "The point is not to push harder. It is to come back again.",
    primary: "7 Days of Small Recovery",
    secondary: "Begin with 1 minute"
  }
} as const;

const nationalParkCopy = {
  jp: {
    eyebrow: "DIGITAL NATIONAL PARK",
    title: "毎日戻りたくなる、\n静かな場所。",
    description:
      "瞑想lifeは、情報過多から少し離れ、感情のバランスを整え、人とのつながりを思い出すためのデジタル・ナショナルパークです。",
    spaces: [
      { key: "visitor", title: "Visitor Center", description: "1分リカバリーから始める入口" },
      { key: "trail", title: "Healing Trails", description: "7日リズムで少しずつ戻る道" },
      { key: "deck", title: "Observation Deck", description: "脳の主人として自分を見る視点" },
      { key: "campfire", title: "Quiet Campfire", description: "静かに共に整う場" },
      { key: "ranger", title: "AI Ranger", description: "自分に戻るためのやさしい案内役" }
    ],
    note: "依存ではなく、回復のために戻ってくる場所です。"
  },
  kr: {
    eyebrow: "DIGITAL NATIONAL PARK",
    title: "매일 다시 오고 싶은,\n조용한 장소.",
    description:
      "명상life는 정보 과부하에서 잠시 벗어나고, 감정의 균형을 회복하고, 자신과 사람들을 다시 느끼기 위한 디지털 내셔널 파크입니다.",
    spaces: [
      { key: "visitor", title: "Visitor Center", description: "1분 리커버리로 시작하는 입구" },
      { key: "trail", title: "Healing Trails", description: "7일 리듬으로 조금씩 돌아오는 길" },
      { key: "deck", title: "Observation Deck", description: "뇌의 주인으로 자신을 바라보는 자리" },
      { key: "campfire", title: "Quiet Campfire", description: "조용히 함께 정돈되는 공간" },
      { key: "ranger", title: "AI Ranger", description: "자신에게 돌아오게 돕는 부드러운 안내자" }
    ],
    note: "중독을 만드는 곳이 아니라, 회복을 위해 들르는 장소입니다."
  },
  en: {
    eyebrow: "DIGITAL NATIONAL PARK",
    title: "A place to return to,\nevery day.",
    description:
      "MeisoLife is a digital national park where people step away from information overload, restore emotional balance, and reconnect with themselves and others.",
    spaces: [
      { key: "visitor", title: "Visitor Center", description: "An easy entrance through 1-minute recovery" },
      { key: "trail", title: "Healing Trails", description: "A 7-day path back into a calmer rhythm" },
      { key: "deck", title: "Observation Deck", description: "A clearer view of the mind you are learning to own" },
      { key: "campfire", title: "Quiet Campfire", description: "A soft place for shared recovery" },
      { key: "ranger", title: "AI Ranger", description: "A gentle guide that helps you return to yourself" }
    ],
    note: "A place to recover, not another place to get hooked."
  }
} as const;

const heroPanelCopy = {
  jp: {
    intro: "自分へ戻る、\n静かな入口。",
    pace: "今日も、あなたのペースで。",
    footer: "AIと共に生きる時代、心の回復力は、新しい力になる。",
    cards: [
      {
        label: "◐",
        accent: "☾",
        prefix: "今は",
        suffix: "のリズム",
        note: ""
      },
      {
        label: "◐",
        accent: "◌",
        note: ""
      },
      {
        label: "◐",
        accent: "↺",
        main: "1分",
        note: ""
      }
    ]
  },
  kr: {
    intro: "나 자신에게 돌아오는,\n조용한 입구.",
    pace: "오늘도, 당신의 속도로.",
    footer: "AI와 함께 살아가는 시대, 마음의 회복력은 새로운 힘이 됩니다.",
    cards: [
      {
        label: "◐",
        accent: "☾",
        prefix: "지금은 ",
        suffix: " 리듬",
        note: ""
      },
      {
        label: "◐",
        accent: "◌",
        note: ""
      },
      {
        label: "◐",
        accent: "↺",
        main: "1분",
        note: ""
      }
    ]
  },
  en: {
    intro: "A quiet entrance,\nback to yourself.",
    pace: "Today as well, at your own pace.",
    footer: "In the age of living with AI, the power to recover your mind becomes a new kind of strength.",
    cards: [
      {
        label: "◐",
        accent: "☾",
        prefix: "It is ",
        suffix: " rhythm",
        note: ""
      },
      {
        label: "◐",
        accent: "◌",
        note: ""
      },
      {
        label: "◐",
        accent: "↺",
        main: "1 min",
        note: ""
      }
    ]
  }
} as const;

const whyReturnCopy = {
  jp: {
    eyebrow: "WHY PEOPLE RETURN",
    title: "また戻ってきたくなる理由",
    cards: [
      { title: "誰かが待っている", description: "同じように整えようとしている誰かの気配があります。" },
      { title: "今日のチェックイン", description: "今の状態をひとつ選ぶだけで、始められます。" },
      { title: "小さな達成感", description: "1分でも十分。小さな回復が残ります。" },
      { title: "静かな励まし", description: "無理しなくていいという空気がここにあります。" },
      { title: "意味のあるつながり", description: "競争ではなく、静かな共生の感覚があります。" },
      { title: "生活の変化", description: "少しずつ、現実の一日が整っていきます。" }
    ]
  },
  kr: {
    eyebrow: "WHY PEOPLE RETURN",
    title: "사람들이 다시 돌아오는 이유",
    cards: [
      { title: "누군가 함께하고 있다", description: "어딘가에서 같은 마음으로 자신을 돌보는 사람이 있습니다." },
      { title: "오늘의 체크인", description: "지금 상태를 하나 고르는 것만으로 시작할 수 있습니다." },
      { title: "작은 성취감", description: "1분이면 충분해요. 작은 회복이 남습니다." },
      { title: "조용한 격려", description: "무리하지 않아도 된다는 분위기가 여기에 있습니다." },
      { title: "의미 있는 연결", description: "경쟁이 아니라, 공생의 따뜻한 감각이 있습니다." },
      { title: "생활의 변화", description: "조금씩, 실제 하루가 달라지기 시작합니다." }
    ]
  },
  en: {
    eyebrow: "WHY PEOPLE RETURN",
    title: "Why people keep coming back",
    cards: [
      { title: "Someone is here too", description: "You can feel the presence of others quietly returning as well." },
      { title: "Daily check-in", description: "Choose one state and begin without friction." },
      { title: "Small achievements", description: "One minute is enough. A small recovery still counts." },
      { title: "Quiet encouragement", description: "The atmosphere says you do not have to force anything." },
      { title: "Meaningful connection", description: "It feels less like social media and more like shared recovery." },
      { title: "Real life change", description: "Little by little, everyday life begins to feel different." }
    ]
  }
} as const;

const finalCtaCopy = {
  jp: {
    eyebrow: "COME BACK TOMORROW",
    title: "また、静かな1分のために。",
    description: "日常が騒がしいほど、戻れる場所は大切になります。",
    primary: "1分リカバリーを始める",
    secondary: "7日間の小さな回復",
    tertiary: "メンバーシップを見る"
  },
  kr: {
    eyebrow: "COME BACK TOMORROW",
    title: "다시,\n조용한 1분을 위해.",
    description: "일상이 시끄러울수록, 돌아올 수 있는 장소가 더 중요해집니다.",
    primary: "1분 리커버리 시작",
    secondary: "7일간의 작은 회복",
    tertiary: "멤버십 보기"
  },
  en: {
    eyebrow: "COME BACK TOMORROW",
    title: "Come back for\none quiet minute.",
    description: "The louder life gets, the more a return place matters.",
    primary: "Start 1-Minute Recovery",
    secondary: "7 Days of Small Recovery",
    tertiary: "Explore Membership"
  }
} as const;

const returnEntryCopy = {
  jp: {
    eyebrow: "WELCOME BACK",
    title: "今日も、少し戻るだけで大丈夫です。",
    guestDescription:
      "ここは、急がなくていい場所です。人生を変えなくても大丈夫。ただ静かな1分から始められます。",
    memberDescription:
      "ここは、あなたのリズムを続ける場所です。昨日の小さな回復も、今日の静かな1分につながっています。",
    guestPrimary: "1分リカバリーを始める",
    memberPrimary: "今日の1分を続ける",
    secondary: "記録を見る",
    cards: {
      recovery: "今日の1分リカバリー",
      checkIn: "昨日の状態",
      progress: "静かな進み方",
      memory: "この場所はあなたのリズムを覚えています"
    },
    status: {
      returning: "また戻ってきてくれて、ありがとうございます。",
      first: "今日はここから始めましょう。",
      completed: "昨日の静かな1分が、今日にもつながっています。",
      waiting: "ここには、あなたの戻る場所があります。"
    },
    progress: {
      streak: "静かな歩み",
      challenge: "7日トレイル",
      state: "昨日の気配",
      firstDay: "今日で1日目"
    },
    memory: {
      calm: "昨日は少し落ち着きを選びました。",
      return: "今日はどんな1分が必要ですか？",
      alone: "どこかで、誰かも静かに戻ろうとしています。"
    }
  },
  kr: {
    eyebrow: "WELCOME BACK",
    title: "오늘도, 조금만 돌아오면 충분합니다.",
    guestDescription:
      "여기는 서두르지 않아도 되는 곳입니다. 삶을 바꾸지 않아도 괜찮아요. 그저 조용한 1분부터 시작하면 됩니다.",
    memberDescription:
      "이곳은 당신의 리듬을 이어가는 자리입니다. 어제의 작은 회복도 오늘의 조용한 1분으로 이어집니다.",
    guestPrimary: "1분 리커버리 시작",
    memberPrimary: "오늘의 1분 이어가기",
    secondary: "기록 보기",
    cards: {
      recovery: "오늘의 1분 리커버리",
      checkIn: "어제의 상태",
      progress: "조용한 진행",
      memory: "이곳은 당신의 리듬을 기억합니다"
    },
    status: {
      returning: "다시 와주셔서 반가워요.",
      first: "오늘은 여기서부터 시작해봐요.",
      completed: "어제의 조용한 1분이 오늘까지 이어지고 있어요.",
      waiting: "여기에는 당신이 돌아올 자리가 있습니다."
    },
    progress: {
      streak: "조용한 걸음",
      challenge: "7일 트레일",
      state: "어제의 기분",
      firstDay: "오늘이 첫 걸음"
    },
    memory: {
      calm: "어제는 조금 차분함을 선택했어요.",
      return: "오늘은 어떤 1분이 필요할까요?",
      alone: "어딘가에서 누군가도 조용히 자신에게 돌아오고 있습니다."
    }
  },
  en: {
    eyebrow: "WELCOME BACK",
    title: "Today too, a small return is enough.",
    guestDescription:
      "This is a place where you do not have to hurry. You do not have to fix your life today. Just begin with one quiet minute.",
    memberDescription:
      "This is a place to continue your rhythm. Yesterday’s small recovery can carry into today’s quiet minute.",
    guestPrimary: "Start 1-Minute Recovery",
    memberPrimary: "Continue Today’s Quiet Minute",
    secondary: "View My Record",
    cards: {
      recovery: "Today’s 1-minute recovery",
      checkIn: "Yesterday’s state",
      progress: "Quiet progress",
      memory: "This space remembers your rhythm"
    },
    status: {
      returning: "You came back. That matters.",
      first: "We can begin from here today.",
      completed: "Yesterday’s quiet minute is still with you today.",
      waiting: "Your quiet place is here."
    },
    progress: {
      streak: "Quiet steps",
      challenge: "7-day trail",
      state: "Yesterday’s feeling",
      firstDay: "Today is day one"
    },
    memory: {
      calm: "Yesterday you chose a little calm.",
      return: "Ready for another quiet minute?",
      alone: "Somewhere else, someone is quietly returning too."
    }
  }
} as const;

const quietGardenCopy = {
  jp: {
    eyebrow: "QUIET RETURN GARDEN",
    title: "今日も誰かが、\n静かに戻っています。",
    description: "ここは競争の場ではなく、静かな回復が集まる場所です。",
    cities: [
      { city: "Tokyo", count: "128" },
      { city: "Seoul", count: "93" },
      { city: "New York", count: "42" }
    ],
    note: "あなたは一人ではありません。"
  },
  kr: {
    eyebrow: "QUIET RETURN GARDEN",
    title: "오늘도 누군가는,\n조용히 돌아오고 있습니다.",
    description: "여기는 경쟁하는 공간이 아니라, 조용한 회복이 모이는 장소입니다.",
    cities: [
      { city: "Tokyo", count: "128" },
      { city: "Seoul", count: "93" },
      { city: "New York", count: "42" }
    ],
    note: "당신 혼자가 아닙니다."
  },
  en: {
    eyebrow: "QUIET RETURN GARDEN",
    title: "Even today,\nsomeone is quietly returning.",
    description: "This is not a competitive space. It is a place where quiet recovery gathers.",
    cities: [
      { city: "Tokyo", count: "128" },
      { city: "Seoul", count: "93" },
      { city: "New York", count: "42" }
    ],
    note: "You are not alone."
  }
} as const;

const founderHopeCopy = {
  jp: {
    eyebrow: "45 Years of Human Possibility",
    title: "回復は、\nいつからでも始められます。",
    description:
      "45年にわたるBrain Educationの歩みは、特別な人のためではなく、疲れた人がもう一度自分を立て直せると信じる実践の積み重ねでした。",
    points: [
      "人は、少しずつ回復できます。",
      "身体から心を支えることができます。",
      "小さな習慣が人生の流れを変えます。",
      "AI時代だからこそ、人のぬくもりが大切です."
    ],
    founderLabel: "創設者からの希望",
    founderMessage:
      "どんなに疲れていても、人の中にはまた明るくなれる力があります。瞑想lifeは、その力を毎日の生活の中で少しずつ取り戻していくための場です。",
    deeperLabel: "より深い背景",
    deeperMessage:
      "その土台には、弘益の精神、Cheonbugyeongの視点、共生文明、そして地球経営のビジョンがあります。けれど最初は、ただ呼吸と身体を整えるところからで十分です。"
  },
  kr: {
    eyebrow: "45 Years of Human Possibility",
    title: "회복은,\n언제든 다시 시작할 수 있습니다.",
    description:
      "45년의 Brain Education 여정은 특별한 사람만을 위한 것이 아니라, 지친 사람이 다시 자신을 세울 수 있다는 믿음을 실천으로 쌓아온 시간입니다.",
    points: [
      "사람은 조금씩 회복할 수 있습니다.",
      "몸을 통해 마음을 다시 세울 수 있습니다.",
      "작은 습관이 삶의 흐름을 바꿉니다.",
      "AI 시대일수록 사람의 온기가 더 중요합니다."
    ],
    founderLabel: "창립자가 전하는 희망",
    founderMessage:
      "아무리 지쳐 있어도 사람 안에는 다시 밝아질 수 있는 힘이 있습니다. 명상life는 그 힘을 일상 속에서 조금씩 되찾도록 돕는 자리입니다.",
    deeperLabel: "더 깊은 뿌리",
    deeperMessage:
      "그 바탕에는 홍익 정신, 천부경의 시선, 공생 문명, 그리고 지구경영의 비전이 있습니다. 하지만 처음에는 그저 호흡과 몸을 정돈하는 것만으로도 충분합니다."
  },
  en: {
    eyebrow: "45 Years of Human Possibility",
    title: "Recovery can begin again,\nfrom right here.",
    description:
      "The 45-year path of Brain Education was not built for special people. It grew from the belief that tired people can rebuild themselves, little by little, through practice.",
    points: [
      "People can recover, step by step.",
      "The body can help the mind reset.",
      "Small daily actions change the direction of life.",
      "In the AI era, human warmth matters even more."
    ],
    founderLabel: "A message of hope from the founder",
    founderMessage:
      "No matter how tired you feel, there is still a power in you that can brighten again. Meisoulife is a place to recover that power gently within everyday life.",
    deeperLabel: "Deeper roots",
    deeperMessage:
      "Behind this path are Hongik philosophy, the perspective of Cheonbugyeong, a vision of coexistence, and stewardship of the Earth. But at the beginning, it is enough simply to breathe and settle your body."
  }
} as const;

const laughResetCopy = {
  jp: {
    eyebrow: "1-Minute Laugh Reset",
    title: "顔と身体から、\n気分を少し持ち上げる。",
    description:
      "表情筋や小さな動きは、気分の切り替えを助けることがあります。がんばる前に、まず身体から少し明るさをつくってみましょう。",
    steps: [
      "「笑っちゃおう」と声に出す",
      "口角と頬をゆっくり動かす",
      "肩と胸を軽く開く",
      "今日の小さな意図をひとつ決める"
    ],
    note: "多くの人が、身体を先に動かすことで気分が少し軽くなると感じます。"
  },
  kr: {
    eyebrow: "1-Minute Laugh Reset",
    title: "얼굴과 몸에서,\n기분을 조금 끌어올리기.",
    description:
      "표정 근육과 작은 움직임은 기분 전환을 도울 수 있습니다. 애쓰기 전에, 먼저 몸으로 작은 밝음을 만들어 보세요.",
    steps: [
      "“웃쟈! 웃쟈! 웃쟈!” 하고 외치기",
      "입꼬리와 볼 근육을 천천히 움직이기",
      "어깨와 가슴을 가볍게 펴기",
      "오늘의 작은 의도를 하나 정하기"
    ],
    note: "많은 사람들이 몸을 먼저 움직일 때 마음이 조금 가벼워진다고 느낍니다."
  },
  en: {
    eyebrow: "1-Minute Laugh Reset",
    title: "Lift your state\na little through the body.",
    description:
      "Facial muscles and small movements may help shift emotional state. Before pushing harder, create a little brightness through the body first.",
    steps: [
      "Say it out loud: “Let’s smile.”",
      "Move the cheeks and mouth gently",
      "Open the shoulders and chest a little",
      "Set one tiny intention for today"
    ],
    note: "Many people feel lighter when they begin with the body before trying to think their way out."
  }
} as const;

const stateResetCopy = {
  jp: {
    eyebrow: "Check your state. Change your state.",
    title: "心が乱れるときは、\nまず身体の状態を見る。",
    description:
      "感情が重いとき、考えだけで解決しようとしなくて大丈夫です。温度、呼吸、姿勢、光、動きが、心の明るさを支えることがあります。",
    overload: ["冷たい水で顔を洗う", "1分だけ歩く", "肩を回す", "呼吸をゆっくり吐く"],
    lowEnergy: ["日光を浴びる", "背伸びする", "その場で小さく動く", "一口の水を飲む"],
    overloadLabel: "When overwhelmed",
    lowEnergyLabel: "When low-energy"
  },
  kr: {
    eyebrow: "Check your state. Change your state.",
    title: "마음이 흐려질 때는,\n먼저 몸의 상태를 살펴보세요.",
    description:
      "감정이 무거울 때, 생각만으로 해결하려 하지 않아도 됩니다. 온도, 호흡, 자세, 빛, 움직임이 마음의 선명함을 도와줄 수 있습니다.",
    overload: ["찬물로 얼굴 씻기", "1분만 걷기", "어깨 돌리기", "숨을 천천히 내쉬기"],
    lowEnergy: ["햇빛 받기", "기지개 켜기", "제자리에서 작게 움직이기", "물 한 모금 마시기"],
    overloadLabel: "When overwhelmed",
    lowEnergyLabel: "When low-energy"
  },
  en: {
    eyebrow: "Check your state. Change your state.",
    title: "When the mind feels stuck,\ncheck the body first.",
    description:
      "When you feel overwhelmed, you do not have to solve everything through thought. Temperature, breath, posture, light, and movement can support emotional clarity.",
    overload: ["Splash cool water on your face", "Take a 1-minute walk", "Roll your shoulders", "Slowly lengthen your exhale"],
    lowEnergy: ["Get a little sunlight", "Stretch upward", "Move lightly in place", "Drink a sip of water"],
    overloadLabel: "When overwhelmed",
    lowEnergyLabel: "When low-energy"
  }
} as const;

const healingCopy = {
  jp: {
    eyebrow: "自然の休息",
    title: "森の近くで深呼吸するように。",
    description: "鳥の声、静かな光、少しひんやりした空気。瞑想lifeは、忙しい頭を自然のリズムへ戻す小さな休息の場です。",
    points: ["森の静けさ", "やわらかな呼吸", "情報から少し離れる"]
  },
  kr: {
    eyebrow: "자연의 휴식",
    title: "숲 가까이에서 숨을 고르듯이.",
    description: "새소리, 잔잔한 빛, 조금 서늘한 공기. 명상life는 바쁜 머리를 자연의 리듬으로 되돌리는 작은 쉼의 자리입니다.",
    points: ["숲의 고요함", "부드러운 호흡", "정보에서 잠시 멀어지기"]
  },
  en: {
    eyebrow: "Nature Reset",
    title: "Like taking a deep breath near the forest.",
    description: "Birdsong, quiet light, and cool air. Meisoulife is a small resting place that returns a busy mind to the rhythm of nature.",
    points: ["Forest stillness", "Gentle breath", "A small step away from information"]
  }
} as const;

const testimonialCopy = {
  jp: {
    eyebrow: "小さな回復",
    title: "小さな変化は、静かに残ります。",
    items: [
      "1分だけでも、頭のざわつきが少し静かになりました。",
      "SNSを見続けたあとに戻る場所ができました。",
      "頑張れない日でも、ここなら続けられそうです。"
    ]
  },
  kr: {
    eyebrow: "작은 회복",
    title: "작은 변화는 조용히 남습니다.",
    items: [
      "1분만으로도 머리의 소음이 조금 잦아들었어요.",
      "SNS를 오래 본 뒤에 돌아올 곳이 생겼습니다.",
      "애쓰기 어려운 날에도 여기라면 이어갈 수 있을 것 같아요."
    ]
  },
  en: {
    eyebrow: "Small Relief",
    title: "Small changes stay quietly with you.",
    items: [
      "Even one minute softened the noise in my head.",
      "I found a place to return after too much social media.",
      "Even on hard days, this feels possible to continue."
    ]
  }
} as const;

const reassuranceCopy = {
  jp: {
    eyebrow: "安心して続ける",
    title: "無理なく、静かに続けられます。",
    items: ["いつでもやめられる", "無理なく続けられる", "ひとりじゃない"]
  },
  kr: {
    eyebrow: "안심하고 이어가기",
    title: "무리 없이, 조용히 이어갈 수 있습니다.",
    items: ["언제든 멈출 수 있어요", "무리 없이 이어갈 수 있어요", "혼자가 아니에요"]
  },
  en: {
    eyebrow: "A Safe Rhythm",
    title: "You can continue gently, without pressure.",
    items: ["You can stop anytime", "You can continue without force", "You are not alone"]
  }
} as const;

const sanctuaryCopy = {
  jp: {
    eyebrow: "静かな場所",
    title: "ひとりで耐える人生から、\n共に目覚める人生へ。",
    description: "自分を少し手放すとき、\n私たちはつながり、\n自由になっていく。",
    deep: "深く静けさに入るとき、\n生と死さえ、\nひとつの流れであることに気づく。",
    cta: "静かに感じてみる"
  },
  kr: {
    eyebrow: "고요한 장소",
    title: "혼자 버티는 삶에서,\n함께 깨어나는 삶으로.",
    description: "자신을 조금 내려놓을 때,\n우리는 연결되고,\n조금 더 자유로워집니다.",
    deep: "깊은 고요함에 들어갈 때,\n삶과 죽음마저\n하나의 흐름임을 느끼게 됩니다.",
    cta: "조용히 느껴보기"
  },
  en: {
    eyebrow: "Quiet Sanctuary",
    title: "From enduring alone,\ninto awakening together.",
    description: "When we loosen our grip on the self,\nwe begin to connect,\nand become a little more free.",
    deep: "When we enter deeper stillness,\neven life and death\ncan be felt as one flow.",
    cta: "Feel it quietly"
  }
} as const;

const aiAgeCopy = {
  jp: {
    eyebrow: "人間らしさを育てる",
    title: "AI時代だからこそ、\n人間らしさを。",
    description: "注意、感情、関係性、そして気づき。\nこれから大切になるものを、1分のリズムから育てていきます。",
    memberButton: "瞑想lifeメンバーになる",
    labels: ["現在の時間帯", "7日リズム", "戻る力"],
    tableShift: "変化"
  },
  kr: {
    eyebrow: "인간다움을 기르는 리듬",
    title: "AI 시대일수록,\n인간다움이 더 중요합니다.",
    description: "주의, 감정, 관계, 그리고 알아차림.\n앞으로 더 중요해질 것을 1분의 리듬에서부터 길러갑니다.",
    memberButton: "명상life 멤버 되기",
    labels: ["지금의 시간대", "7일 리듬", "돌아오는 힘"],
    tableShift: "변화"
  },
  en: {
    eyebrow: "Human OS Upgrade",
    title: "In the AI age,\nhumanity matters more.",
    description: "Attention, emotion, relationships, and awareness.\nGrow what matters most through a gentle one-minute rhythm.",
    memberButton: "Become a Meisoulife member",
    labels: ["time anchor", "7-day rhythm", "return"],
    tableShift: "Shift"
  }
} as const;

const giftCopy = {
  jp: {
    banner: "あなたに、1分の休息が届きました。",
    eyebrow: "Share a Quiet Minute",
    title: "大切な人に、1分の休息を贈る。",
    description: "言葉で励ますのが難しい日も、\n静かな1分なら届けられます。",
    button: "1分の休息を贈る",
    shareMessage: "最近少し疲れていませんか？\nこの1分、よかったら一緒にやってみませんか。\nhttps://www.meisoulife.com/?gift=1min",
    copied: "リンクをコピーしました。大切な人に届けてください。"
  },
  kr: {
    banner: "당신에게 1분의 휴식이 도착했습니다.",
    eyebrow: "조용한 1분 나누기",
    title: "소중한 사람에게, 1분의 휴식을 건네보세요.",
    description: "말로 위로하기 어려운 날에도,\n조용한 1분은 전할 수 있습니다.",
    button: "1분의 휴식 선물하기",
    shareMessage: "요즘 조금 지치지 않았나요?\n괜찮다면 이 1분을 함께 해보세요.\nhttps://www.meisoulife.com/?gift=1min",
    copied: "링크를 복사했습니다. 소중한 사람에게 전해주세요."
  },
  en: {
    banner: "A one-minute rest has been sent to you.",
    eyebrow: "Share a Quiet Minute",
    title: "Offer a minute of rest to someone you care about.",
    description: "Even on days when words feel hard,\na quiet minute can still be shared.",
    button: "Share a one-minute rest",
    shareMessage: "Have you been feeling a little tired lately?\nIf you'd like, try this quiet minute with me.\nhttps://www.meisoulife.com/?gift=1min",
    copied: "Link copied. Send it to someone you care about."
  }
} as const;

function MembershipCard({
  plan,
  className
}: {
  plan: ReturnType<typeof useLandingMembership>[number];
  className?: string;
}) {
  return (
    <article className={`flex h-full flex-col rounded-[28px] border p-6 ${className || "border-white/10 bg-white/[0.04]"}`}>
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.28em] text-gold">{plan.name}</p>
        <p className="text-3xl font-semibold text-white">{plan.price}</p>
        <p className="text-base text-white/84">{plan.identity}</p>
        <p className="text-sm uppercase tracking-[0.2em] text-white/42">{plan.description}</p>
        <p className="text-sm leading-7 text-white/68">{plan.lifeChange}</p>
      </div>
      <ul className="mt-6 grid gap-3 text-sm text-white/74">
        {plan.features.map((feature) => (
          <li key={feature} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {plan.key === "basic" ? (
          <CheckoutButton
            plan="basic"
            label={plan.cta}
            className="relative z-50 inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            messageClassName="mt-2 text-sm text-white/52"
          />
        ) : null}
        {plan.key === "leader" ? (
          <CheckoutButton
            plan="growth"
            label={plan.cta}
            className="relative z-50 inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-white/90"
            messageClassName="mt-2 text-sm text-white/52"
          />
        ) : null}
        {plan.key === "premium" ? (
          <CheckoutButton
            plan="inner-circle"
            label={plan.cta}
            className="relative z-50 inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-full border border-gold/35 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/15"
            messageClassName="mt-2 text-sm text-white/52"
          />
        ) : null}
      </div>
    </article>
  );
}

function useLandingMembership() {
  const landing = useLocaleCopy(landingCopy);
  return landing.membership.plans;
}

export default function HomePage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { authResolved, isLoggedIn, memberState } = useAuthState();
  const site = useSiteCopy();
  const landing = useLocaleCopy(landingCopy);
  const hero = useLocaleCopy(heroCopy);
  const nationalPark = useLocaleCopy(nationalParkCopy);
  const returnEntry = useLocaleCopy(returnEntryCopy);
  const returnLoop = useLocaleCopy(returnLoopCopy);
  const quietGarden = useLocaleCopy(quietGardenCopy);
  const whyReturn = useLocaleCopy(whyReturnCopy);
  const finalCta = useLocaleCopy(finalCtaCopy);
  const heroPanel = useLocaleCopy(heroPanelCopy);
  const healing = useLocaleCopy(healingCopy);
  const testimonials = useLocaleCopy(testimonialCopy);
  const reassurance = useLocaleCopy(reassuranceCopy);
  const sanctuary = useLocaleCopy(sanctuaryCopy);
  const aiAge = useLocaleCopy(aiAgeCopy);
  const gift = useLocaleCopy(giftCopy);
  const founderHope = useLocaleCopy(founderHopeCopy);
  const laughReset = useLocaleCopy(laughResetCopy);
  const stateReset = useLocaleCopy(stateResetCopy);
  const membershipPlans = useLandingMembership();
  const [challengeProgress, setChallengeProgress] = useState<ChallengeRhythmProgress>({
    currentDay: 1,
    completedDays: []
  });
  const [returnRhythm, setReturnRhythm] = useState<ReturnRhythmSnapshot>({
    lastVisitDate: null,
    lastCompletedDate: null,
    streakCount: 0,
    lineConnectedAt: null,
    isReturningToday: false,
    isCompletedToday: false,
    inactiveDays: 0,
    timeAnchor: "daytime"
  });
  const [giftDelivered, setGiftDelivered] = useState(false);
  const [giftToast, setGiftToast] = useState("");
  const [lastMoodLabel, setLastMoodLabel] = useState("");

  useEffect(() => {
    setChallengeProgress(getChallengeRhythmProgress());
    setReturnRhythm(updateReturnRhythmVisit());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    setGiftDelivered(url.searchParams.get("gift") === "1min");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const stored = window.localStorage.getItem(MEDITATION_MOOD_STORAGE_KEY);

      if (!stored) {
        setLastMoodLabel("");
        return;
      }

      const parsed = JSON.parse(stored) as { moodKey?: string };
      const moodLabel = landing.instant.moods.find((item) => item.key === parsed.moodKey)?.label ?? "";
      setLastMoodLabel(moodLabel);
    } catch (error) {
      console.error("[home] failed to read last meditation mood", error);
      setLastMoodLabel("");
    }
  }, [landing.instant.moods]);

  useEffect(() => {
    if (!giftToast) {
      return;
    }

    const timer = window.setTimeout(() => setGiftToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [giftToast]);

  const gardenMood = returnRhythm.isCompletedToday ? "🙂" : returnRhythm.inactiveDays >= 2 ? "😔" : "😀";
  const returnActionLabel = authResolved
    ? !isLoggedIn
      ? hero.tertiaryGuest
      : memberState === "free"
        ? hero.tertiaryFree
        : hero.tertiaryPaid
    : hero.tertiaryGuest;
  const returnStatusMessage = !returnRhythm.lastVisitDate
    ? returnEntry.status.first
    : returnRhythm.isCompletedToday
      ? returnEntry.status.completed
      : returnRhythm.isReturningToday
        ? returnEntry.status.returning
        : returnEntry.status.waiting;
  const returnMemoryLine = lastMoodLabel
    ? `${returnEntry.memory.calm} ${lastMoodLabel}`
    : returnEntry.memory.return;
  const heroTitleLines = hero.title.split("\n");
  const heroAccentLine = language === "jp" ? heroTitleLines[0] : null;
  const heroMainLines = language === "jp" ? heroTitleLines.slice(1) : heroTitleLines;
  const heroPanelCards = [
    {
      label: heroPanel.cards[0].label,
      accent: heroPanel.cards[0].accent,
      main: `${heroPanel.cards[0].prefix}${site.home.rhythmSignals.anchors[returnRhythm.timeAnchor]}\n${heroPanel.cards[0].suffix}`,
      note: heroPanel.cards[0].note
    },
    {
      label: heroPanel.cards[1].label,
      accent: heroPanel.cards[1].accent,
      main: `${challengeProgress.completedDays.length}/7`,
      note: heroPanel.cards[1].note
    },
    {
      label: heroPanel.cards[2].label,
      accent: heroPanel.cards[2].accent,
      main: heroPanel.cards[2].main,
      note: heroPanel.cards[2].note
    }
  ];

  function scrollToOneMinute() {
    if (typeof window === "undefined") {
      return;
    }

    document.querySelector("#one-minute-experience")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function scrollToZeroGate() {
    if (typeof window === "undefined") {
      return;
    }

    document.querySelector("#zero-gate")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function handleZeroGateEnter(gateKey: string) {
    if (typeof window !== "undefined") {
      const payload = {
        gateKey,
        enteredAt: new Date().toISOString()
      };

      window.localStorage.setItem("meisoulife_zero_gate", JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent("meisoulife:zero-gate-change", { detail: payload }));
    }

    scrollToOneMinute();
  }

  function scrollToRhythmChallenge() {
    router.push("/rhythm-journey");
  }

  function scrollToStateCheck() {
    if (typeof window === "undefined") {
      return;
    }

    document.querySelector("#daily-rhythm-check")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function handleReturnAction() {
    if (!authResolved || !isLoggedIn) {
      router.push("/signup");
      return;
    }

    router.push("/program/basic");
  }

  async function handleGiftShare() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      await navigator.clipboard.writeText(gift.shareMessage);
      setGiftToast(gift.copied);
    } catch (error) {
      console.error("[gift-share] failed to copy invite", error);
    }
  }

  return (
    <div className="pb-28">
      {giftDelivered ? (
        <section className="section-shell pt-6">
          <div className="rounded-[24px] border border-gold/20 bg-gold/[0.08] px-5 py-4 text-center text-sm font-medium text-gold">
            {gift.banner}
          </div>
        </section>
      ) : null}

      <section className="section-shell relative overflow-hidden pt-3 sm:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[470px] sm:hidden">
          <div className="absolute left-[3%] top-7 h-32 w-32 rounded-full bg-gold/[0.13] blur-[84px] animate-meditation-ambient-breathe motion-reduce:animate-none" />
          <div className="absolute right-[1%] top-14 h-56 w-56 rounded-full bg-emerald-200/[0.11] blur-[102px] animate-meditation-fog motion-reduce:animate-none" />
          <div className="absolute right-[-16%] top-[-2%] h-[248px] w-[46%] overflow-hidden opacity-[0.18] mix-blend-screen">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"
              alt=""
              aria-hidden="true"
              className="h-full w-full scale-[1.12] object-cover blur-[4px] animate-meditation-video-breathe motion-reduce:animate-none [mask-image:radial-gradient(ellipse_at_24%_42%,rgba(0,0,0,0.98)_0%,rgba(0,0,0,0.88)_26%,rgba(0,0,0,0.46)_58%,transparent_86%)] [-webkit-mask-image:radial-gradient(ellipse_at_24%_42%,rgba(0,0,0,0.98)_0%,rgba(0,0,0,0.88)_26%,rgba(0,0,0,0.46)_58%,transparent_86%)]"
            />
          </div>
          <div className="absolute right-[4%] top-10 h-32 w-24 rounded-full bg-white/[0.025] blur-[72px] animate-meditation-float motion-reduce:animate-none" />
          <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.12),transparent_34%),linear-gradient(180deg,rgba(7,16,28,0.04),rgba(7,16,28,0.02)_28%,rgba(7,16,28,0))]" />
          <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_78%_20%,rgba(126,162,171,0.16),transparent_18%),radial-gradient(circle_at_80%_32%,rgba(255,246,214,0.06),transparent_14%),linear-gradient(90deg,rgba(5,18,24,0.03)_0%,rgba(5,18,24,0.04)_32%,rgba(5,18,24,0.08)_52%,rgba(5,18,24,0.18)_70%,rgba(5,18,24,0.34)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-full bg-[linear-gradient(90deg,rgba(5,16,24,0.02)_0%,rgba(5,16,24,0.03)_28%,rgba(5,16,24,0.06)_48%,rgba(5,16,24,0.14)_64%,rgba(5,16,24,0.34)_100%),linear-gradient(180deg,rgba(5,18,24,0.02),rgba(5,18,24,0.08)_38%,rgba(5,18,24,0.3)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_56%,rgba(8,28,36,0.16),transparent_22%),linear-gradient(180deg,transparent_0%,rgba(3,10,18,0.04)_34%,rgba(3,10,18,0.2)_78%,rgba(3,10,18,0.34)_100%)]" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.24fr_0.76fr] lg:items-center lg:gap-16 xl:gap-20">
          <div className="space-y-5 sm:space-y-8 lg:space-y-9">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm uppercase tracking-[0.34em] text-gold/85">{hero.eyebrow}</p>
              <div className="hidden w-fit rounded-full border border-white/10 bg-white/[0.03] p-1 md:inline-flex lg:hidden">
                {languageButtons.map((button) => (
                  <button
                    key={button.key}
                    type="button"
                    onClick={() => setLanguage(button.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.2em] transition ${
                      button.key === language ? "bg-white text-ink" : "text-white/68 hover:text-white"
                    }`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-5 sm:space-y-6 lg:space-y-4.5">
              {heroAccentLine ? (
                <p className="max-w-[12ch] font-serif text-[20px] leading-[1.3] text-gold/84 sm:max-w-none sm:text-[28px] sm:leading-[1.45] lg:text-[30px]">
                  {heroAccentLine}
                </p>
              ) : null}
              <h1 className={`whitespace-pre-line text-balance font-serif text-[40px] leading-[1.2] tracking-[-0.03em] text-white sm:max-w-[11.5ch] sm:text-[56px] sm:leading-[1.18] lg:max-w-[620px] lg:text-[64px] lg:leading-[1.1] lg:tracking-[-0.015em] xl:text-[68px] ${
                language === "kr" ? "max-w-[12.2ch]" : language === "en" ? "max-w-[13.6ch]" : "max-w-[12.4ch]"
              }`}>
                {heroMainLines.join("\n")}
              </h1>
              <p className={`whitespace-pre-line text-[14px] leading-[1.82] text-white/68 sm:max-w-[32ch] sm:text-[18px] sm:leading-[1.82] lg:max-w-[420px] lg:text-[17px] lg:leading-[1.78] lg:text-white/82 ${
                language === "kr" ? "max-w-[16.5ch]" : "max-w-[19ch]"
              }`}>
                {hero.supporting}
              </p>
              <p className="max-w-[22ch] pt-1 text-[11px] leading-5 text-white/48 sm:max-w-none sm:text-xl sm:leading-9 lg:text-[13px] lg:leading-7 lg:text-white/56">
                {hero.subtitle}
              </p>
            </div>

            <div className="relative z-20 flex flex-col gap-3 pt-2.5 sm:flex-row sm:flex-wrap lg:gap-5 lg:pt-2.5">
              <button
                type="button"
                onClick={scrollToZeroGate}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold/90 px-4.5 py-3 text-[14px] font-semibold leading-none text-ink shadow-[0_14px_30px_rgba(212,186,117,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#e7cd92] lg:min-h-[60px] lg:px-9 lg:text-[17px] lg:shadow-[0_18px_36px_rgba(212,186,117,0.18)]"
              >
                {hero.primary}
              </button>
              <button
                type="button"
                onClick={scrollToRhythmChallenge}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[13px] font-medium leading-none text-white/68 transition duration-300 hover:bg-white/[0.07] hover:text-white lg:min-h-[60px] lg:px-10 lg:text-[16px] lg:text-white/78"
              >
                {hero.secondary}
              </button>
            </div>

            <p className="max-w-[26ch] text-[12px] leading-6 text-white/56 sm:max-w-[34ch] sm:text-[14px] sm:leading-7 lg:max-w-[420px] lg:text-[14px] lg:leading-7 lg:text-white/58">
              {hero.ctaSupport}
            </p>

            <p className="hidden max-w-[28ch] text-[12px] leading-6 text-white/50 sm:max-w-none lg:block lg:pt-0.5 lg:text-[13px] lg:leading-7 lg:text-white/54">
              {hero.note}
            </p>

            <button
              type="button"
              onClick={scrollToRhythmChallenge}
              className="inline-flex w-fit items-center gap-2 pt-1 text-[12px] font-medium text-white/46 transition hover:text-white/72"
            >
              <span className="h-1 w-1 rounded-full bg-gold/72" />
              {hero.scrollHint}
            </button>

            <div className="hidden flex-wrap gap-2 pt-0.5 sm:flex">
              {hero.proof.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/56">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative hidden overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.012))] p-5 shadow-[0_22px_72px_rgba(3,10,18,0.14)] lg:block lg:rounded-[36px] lg:p-6 xl:p-7">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=80"
              alt={hero.visualAlt}
              className="relative z-0 h-[420px] w-full rounded-[26px] object-cover object-center opacity-[0.9] lg:h-[500px]"
            />
            <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(4,12,22,0.24),rgba(4,12,22,0.78))]" />
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_78%_14%,rgba(236,206,132,0.16),transparent_17%),radial-gradient(circle_at_70%_24%,rgba(176,203,184,0.08),transparent_22%),linear-gradient(90deg,rgba(5,11,20,0.92)_0%,rgba(5,11,20,0.58)_34%,rgba(5,11,20,0.18)_68%,rgba(5,11,20,0.02)_100%)]" />
            <div className="pointer-events-none absolute inset-x-8 top-8 z-10 rounded-[24px] bg-[#07111a]/22 px-6 py-5 backdrop-blur-[16px]">
              <p className="max-w-[22ch] whitespace-pre-line text-[15px] leading-8 text-white/86">
                {heroPanel.intro}
              </p>
              <p className="mt-3 text-sm text-gold/74">{heroPanel.pace}</p>
            </div>
            <div className="pointer-events-none absolute inset-x-8 bottom-8 z-10 rounded-[26px] bg-[#06111d]/42 px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.14)] backdrop-blur-[18px]">
              <div className="flex flex-wrap gap-3">
                {heroPanelCards.map((card, index) => (
                  <div
                    key={index}
                    className="rounded-full bg-white/[0.045] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[12px] text-gold/76">{card.label}</span>
                      <span className="text-[12px] text-white/90 whitespace-pre-line">{card.main}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 max-w-[30ch] text-sm leading-7 text-white/58">{heroPanel.footer}</p>
            </div>
          </div>
        </div>
      </section>

      <ZeroGateSection onEnterGate={handleZeroGateEnter} />

      <section className="section-shell mt-10 sm:mt-14">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_20px_72px_rgba(7,17,31,0.18)] sm:px-8 sm:py-8">
          <SectionHeading eyebrow={returnLoop.eyebrow} title={returnLoop.title} description={returnLoop.description} />
          <div className="mt-6 grid gap-3 lg:grid-cols-3 lg:gap-4">
            {returnLoop.steps.map((step) => (
              <article key={step.label} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{step.label}</p>
                <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/66">{step.description}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm leading-7 text-white/56">{returnLoop.note}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={scrollToRhythmChallenge}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {returnLoop.primary}
            </button>
            <button
              type="button"
              onClick={scrollToOneMinute}
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              {returnLoop.secondary}
            </button>
          </div>
        </div>
      </section>

      <section className="section-shell mt-10 sm:mt-14">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_20px_72px_rgba(7,17,31,0.18)] sm:px-8 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gold/84">{returnEntry.eyebrow}</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">{returnEntry.title}</h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/68">
                {isLoggedIn ? returnEntry.memberDescription : returnEntry.guestDescription}
              </p>
              <p className="mt-4 text-sm leading-7 text-gold/82">{returnStatusMessage}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={isLoggedIn ? handleReturnAction : scrollToOneMinute}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
                >
                  {isLoggedIn ? returnActionLabel : returnEntry.guestPrimary}
                </button>
                <button
                  type="button"
                  onClick={isLoggedIn ? handleReturnAction : scrollToRhythmChallenge}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
                >
                  {returnEntry.secondary}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/46">{returnEntry.cards.recovery}</p>
                <p className="mt-3 text-sm leading-7 text-white/72">{landing.instant.title}</p>
              </article>
              <article className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/46">{returnEntry.cards.checkIn}</p>
                <p className="mt-3 text-sm leading-7 text-white/72">{lastMoodLabel || returnEntry.progress.state}</p>
              </article>
              <article className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/46">{returnEntry.progress.streak}</p>
                <p className="mt-3 text-lg text-white/84">
                  {Math.max(returnRhythm.streakCount, 1) <= 1
                    ? returnEntry.progress.firstDay
                    : `${Math.max(returnRhythm.streakCount, 1)} ${landing.garden.dayUnit}`}
                </p>
                <p className="mt-1 text-sm leading-7 text-white/58">
                  {returnEntry.progress.challenge} · {challengeProgress.completedDays.length}/7
                </p>
              </article>
              <article className="rounded-[24px] border border-gold/18 bg-gold/[0.08] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gold/82">{returnEntry.cards.memory}</p>
                <p className="mt-3 text-sm leading-7 text-white/82">
                  {returnMemoryLine}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/56">{returnEntry.memory.alone}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-10 sm:mt-14">
        <div className="rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.08),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-6 shadow-[0_20px_72px_rgba(7,17,31,0.16)] sm:px-7 sm:py-8">
          <p className="text-xs uppercase tracking-[0.28em] text-gold/82">{quietGarden.eyebrow}</p>
          <h2 className="mt-4 whitespace-pre-line font-serif text-2xl leading-tight text-white sm:text-3xl">{quietGarden.title}</h2>
          <p className="mt-4 text-sm leading-7 text-white/64">{quietGarden.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {quietGarden.cities.map((item) => (
              <article key={item.city} className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/42">{item.city}</p>
                <p className="mt-2 font-serif text-2xl text-white">{item.count}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-gold/84">{quietGarden.note}</p>
        </div>
      </section>

      <section className="section-shell mt-16 sm:mt-20">
        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.18)] sm:px-8 sm:py-9">
          <SectionHeading eyebrow={nationalPark.eyebrow} title={nationalPark.title} description={nationalPark.description} />
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {nationalPark.spaces.map((space) => (
              <article key={space.key} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-gold/82">{space.title}</p>
                <p className="mt-3 text-sm leading-7 text-white/70">{space.description}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm leading-7 text-white/54">{nationalPark.note}</p>
        </div>
      </section>

      <DailyRhythmCheck copy={landing.dailyRhythmCheck} />

      <InstantMeditationSection copy={landing.instant} />

      <DailyRhythmLayer copy={landing.dailyRhythmLayer} />

      <section className="section-shell mt-16 sm:mt-20">
        <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_22%),linear-gradient(180deg,#0b1520_0%,#0d1824_52%,#09111a_100%)] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.2)] sm:px-8 sm:py-9">
          <SectionHeading eyebrow={founderHope.eyebrow} title={founderHope.title} description={founderHope.description} />
          <div className="mt-7 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-3">
              {founderHope.points.map((point) => (
                <div key={point} className="rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white/76">
                  {point}
                </div>
              ))}
            </div>
            <div className="grid gap-4">
              <article className="rounded-[28px] border border-gold/20 bg-gold/[0.08] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/84">{founderHope.founderLabel}</p>
                <p className="mt-4 text-sm leading-8 text-white/82">{founderHope.founderMessage}</p>
              </article>
              <article className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-white/46">{founderHope.deeperLabel}</p>
                <p className="mt-4 text-sm leading-8 text-white/66">{founderHope.deeperMessage}</p>
              </article>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-gold/82">{laughReset.eyebrow}</p>
              <h3 className="mt-4 font-serif text-2xl leading-tight text-white">{laughReset.title}</h3>
              <p className="mt-4 text-sm leading-8 text-white/68">{laughReset.description}</p>
              <ul className="mt-5 grid gap-3 text-sm text-white/74">
                {laughReset.steps.map((step) => (
                  <li key={step} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    {step}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-7 text-white/54">{laughReset.note}</p>
            </article>

            <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-gold/82">{stateReset.eyebrow}</p>
              <h3 className="mt-4 font-serif text-2xl leading-tight text-white">{stateReset.title}</h3>
              <p className="mt-4 text-sm leading-8 text-white/68">{stateReset.description}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/46">{stateReset.overloadLabel}</p>
                  <ul className="mt-3 grid gap-2 text-sm text-white/74">
                    {stateReset.overload.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/46">{stateReset.lowEnergyLabel}</p>
                  <ul className="mt-3 grid gap-2 text-sm text-white/74">
                    {stateReset.lowEnergy.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <BrainOwnershipJourney />

      <FounderVisionSection />

      <AIRhythmCoach copy={landing.coach} coachUrl={AI_COACH_URL} />

      <section className="section-shell mt-16 sm:mt-20">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.10),transparent_24%),linear-gradient(180deg,#0a1716_0%,#0d1824_54%,#08131d_100%)] p-5 shadow-[0_24px_80px_rgba(7,17,31,0.22)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="space-y-3.5">
              <p className="text-sm uppercase tracking-[0.3em] text-gold/84">{healing.eyebrow}</p>
              <h2 className="font-serif text-3xl leading-tight text-white sm:text-4xl">{healing.title}</h2>
              <p className="text-[15px] leading-7 text-white/66 sm:text-lg">{healing.description}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {healing.points.map((point) => (
                  <span key={point} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/62">
                    {point}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[28px] border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80"
                alt={healing.title}
                className="h-[260px] w-full object-cover sm:h-[320px]"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,16,0.06),rgba(4,12,16,0.44))]" />
            </div>
          </div>
        </div>
      </section>

      <LiveTogether copy={landing.live} />

      <section className="section-shell mt-16 sm:mt-20">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.18)] sm:px-7 sm:py-9">
          <SectionHeading eyebrow={whyReturn.eyebrow} title={whyReturn.title} align="center" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {whyReturn.cards.map((card) => (
              <article key={card.title} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <h3 className="text-base font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <TogetherAwakeSection />

      <section className="section-shell mt-16 sm:mt-20">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.18)] sm:px-7 sm:py-9">
          <SectionHeading eyebrow={testimonials.eyebrow} title={testimonials.title} align="center" />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {testimonials.items.map((item) => (
              <article key={item} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm leading-7 text-white/74">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell mt-16 sm:mt-20">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-7 shadow-[0_24px_80px_rgba(7,17,31,0.18)] sm:px-7 sm:py-9">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gold/84">{gift.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">{gift.title}</h2>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-white/66 sm:text-lg">{gift.description}</p>
            <button
              type="button"
              onClick={handleGiftShare}
              className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-6 py-4 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
            >
              {gift.button}
            </button>
            {giftToast ? <p className="mt-3 text-sm leading-7 text-white/58">{giftToast}</p> : null}
          </div>
        </div>
      </section>

      <RhythmGarden
        copy={landing.garden}
        streakCount={Math.max(returnRhythm.streakCount, challengeProgress.completedDays.length, 1)}
        completedToday={returnRhythm.isCompletedToday}
        mood={gardenMood}
      />

      <section id="membership" className="section-shell mt-24">
        <SectionHeading
          eyebrow={landing.membership.eyebrow}
          title={landing.membership.title}
          description={landing.membership.description}
        />
        <div className="mt-8 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <article className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.28em] text-gold/80">{landing.membership.freeLabel}</p>
            <h3 className="mt-4 font-serif text-3xl text-white">{landing.membership.freeTitle}</h3>
            <ul className="mt-6 grid gap-3 text-sm text-white/72">
              {landing.membership.freeFeatures.map((feature) => (
                <li key={feature} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  {feature}
                </li>
              ))}
            </ul>
            <div className="relative z-20 mt-6">
              <Link
                href="/rhythm-journey"
                className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
              >
                {landing.membership.freeCta}
              </Link>
            </div>
          </article>

          <div className="grid gap-5 lg:grid-cols-3">
            {membershipPlans.map((plan) => (
              <MembershipCard
                key={plan.key}
                plan={plan}
                className={
                  plan.featured
                    ? "border-gold/40 bg-[linear-gradient(180deg,rgba(212,186,117,0.14),rgba(255,255,255,0.04))]"
                    : plan.key === "premium"
                      ? "border-amber-200/20 bg-[linear-gradient(180deg,rgba(255,224,180,0.10),rgba(255,255,255,0.03))]"
                      : "border-white/10 bg-white/[0.04]"
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 px-6 py-5">
            <h3 className="text-2xl font-semibold text-white">{landing.membership.comparisonTitle}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-white/72">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-[0.22em] text-white/46">
                <tr>
                  <th className="px-6 py-4">
                    {aiAge.tableShift}
                  </th>
                  <th className="px-6 py-4">{landing.membership.freeLabel}</th>
                  <th className="px-6 py-4">{membershipPlans[1].name}</th>
                  <th className="px-6 py-4">{membershipPlans[2].name}</th>
                </tr>
              </thead>
              <tbody>
                {landing.membership.comparisonRows.map((row) => (
                  <tr key={row.label} className="border-t border-white/10">
                    <td className="px-6 py-4 text-white/88">{row.label}</td>
                    <td className="px-6 py-4">{row.free}</td>
                    <td className="px-6 py-4">{row.growth}</td>
                    <td className="px-6 py-4">{row.inner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-shell mt-24">
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-8 sm:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-gold/84">{reassurance.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-white sm:text-4xl">{reassurance.title}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {reassurance.items.map((item) => (
                <div key={item} className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm font-medium text-white/78">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-24">
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.12),transparent_24%),linear-gradient(180deg,#0a1716_0%,#0d1824_54%,#08131d_100%)] px-6 py-12 sm:px-10 sm:py-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-[12%] top-8 h-32 rounded-full bg-gold/10 blur-3xl animate-meditation-fog" />
            <div className="absolute -left-8 top-16 h-40 w-40 rounded-full bg-emerald-200/8 blur-3xl animate-meditation-ambient-breathe" />
            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-sky-200/8 blur-3xl animate-meditation-fog" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,12,16,0.12),rgba(4,12,16,0.34))]" />
          </div>

          <div className="relative z-20 mx-auto max-w-4xl text-center animate-meditation-fade-up">
            <p className="text-sm uppercase tracking-[0.32em] text-gold/82">{sanctuary.eyebrow}</p>
            <h2 className="mt-6 whitespace-pre-line font-serif text-3xl leading-[1.4] text-white sm:text-4xl sm:leading-[1.45] lg:text-5xl">
              {sanctuary.title}
            </h2>
            <p className="mt-6 whitespace-pre-line text-base leading-8 text-white/72 sm:text-lg sm:leading-9">
              {sanctuary.description}
            </p>

            <div className="mx-auto mt-8 max-w-2xl rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-5 backdrop-blur">
              <p className="whitespace-pre-line text-sm leading-8 text-white/56 sm:text-base">
                {sanctuary.deep}
              </p>
            </div>

            <div className="relative z-20 mt-8">
              <Link
                href="#one-minute-experience"
                className="inline-flex min-h-[54px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-6 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12] hover:text-[#f1dfaf]"
              >
                {sanctuary.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell mt-24">
        <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-6 py-10 text-center sm:px-10">
          <p className="text-sm uppercase tracking-[0.3em] text-gold/84">{finalCta.eyebrow}</p>
          <h2 className="mt-4 whitespace-pre-line font-serif text-3xl text-white sm:text-4xl">{finalCta.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl whitespace-pre-line text-base leading-8 text-white/68">{finalCta.description}</p>
          <div className="relative z-20 mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={scrollToOneMinute}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
            >
              {finalCta.primary}
            </button>
            <button
              type="button"
              onClick={scrollToRhythmChallenge}
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
            >
              {finalCta.secondary}
            </button>
            <Link
              href="/pricing"
              className="inline-flex min-h-[56px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-6 py-4 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
            >
              {finalCta.tertiary}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
