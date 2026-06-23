export type BasicLanguage = "jp" | "kr" | "en";
export type BasicGateKey = "morning" | "daytime" | "evening";
export type BasicDoorKey =
  | "affirmation"
  | "energy"
  | "vision"
  | "focus"
  | "rest"
  | "recharge"
  | "release"
  | "gratitude"
  | "sleep";
export type SessionTypeKey = "default" | "morning" | "day" | "night";

export type BasicPracticeDefinition = {
  key: BasicDoorKey;
  gate: BasicGateKey;
  routeType: string;
  meditationType: Exclude<SessionTypeKey, "default">;
  meditationDoor: BasicDoorKey;
  durationSeconds: number;
  emoji: string;
  title: string;
  purpose: string;
  state: string;
  description: string;
  sessionTitle: string;
  sessionSubtitle: string;
  sessionGuidance: string;
  entryLabel: string;
  completionTitle: string;
  href: string;
};

type LocalizedDoor = {
  emoji: string;
  routeType: string;
  meditationType: Exclude<SessionTypeKey, "default">;
  durationSeconds: number;
  title: string;
  purpose: string;
  state: string;
  description: string;
  sessionTitle: string;
  sessionSubtitle: string;
  sessionGuidance: string;
  entryLabel: string;
  completionTitle: string;
};

type LocalizedGate = {
  title: string;
  eyebrow: string;
  question: string;
  atmosphere: string;
  doors: Record<BasicDoorKey, LocalizedDoor>;
};

const rhythmCatalog = {
  jp: {
    morning: {
      title: "Morning Gate",
      eyebrow: "朝",
      question: "今朝のあなたは\nどんな状態ですか",
      atmosphere: "朝は\n今日の自分を選ぶ時間です",
      doors: {
        affirmation: {
          emoji: "✨",
          routeType: "morning-affirmation",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Affirmation Gate",
          purpose: "今日の自分を選ぶ",
          state: "今日は\nもう少し明確に始めたい",
          description: "今日の自分を静かに選ぶ",
          sessionTitle: "今日の自分を選ぶ",
          sessionSubtitle: "朝は\n今日の自分を選ぶ時間です",
          sessionGuidance: "今の自分に合う方法で\n静かに戻ります",
          entryLabel: "今の自分に合う方法で戻る",
          completionTitle: "今日、また戻ることができました"
        },
        energy: {
          emoji: "☀️",
          routeType: "morning-energy",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Energy Gate",
          purpose: "身体と脳を目覚めさせる",
          state: "まだ身体が重たい",
          description: "身体と脳をやさしく起こす",
          sessionTitle: "脳と身体を目覚めさせる",
          sessionSubtitle: "中心から\n静かに目覚める朝に",
          sessionGuidance: "今の自分に合う方法で\n静かに戻ります",
          entryLabel: "今の自分に合う方法で戻る",
          completionTitle: "少しずつ、早く戻れるようになっています"
        },
        vision: {
          emoji: "🌄",
          routeType: "morning-vision",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Vision Gate",
          purpose: "方向と未来を思い出す",
          state: "今日はどこへ向かうのか\n思い出したい",
          description: "今日の方向を思い出す",
          sessionTitle: "方向を思い出す",
          sessionSubtitle: "向かう先を\n静かに思い出したいとき",
          sessionGuidance: "今の自分に合う方法で\n静かに戻ります",
          entryLabel: "今の自分に合う方法で戻る",
          completionTitle: "リズムを思い出す力が育っています"
        },
        focus: {} as LocalizedDoor,
        rest: {} as LocalizedDoor,
        recharge: {} as LocalizedDoor,
        release: {} as LocalizedDoor,
        gratitude: {} as LocalizedDoor,
        sleep: {} as LocalizedDoor
      }
    },
    daytime: {
      title: "Daytime Gate",
      eyebrow: "昼",
      question: "今のあなたに必要なのは何ですか？",
      atmosphere: "崩れる前に、小さく戻る時間です。",
      doors: {
        affirmation: {} as LocalizedDoor,
        energy: {} as LocalizedDoor,
        vision: {} as LocalizedDoor,
        focus: {
          emoji: "🎯",
          routeType: "daytime-focus",
          meditationType: "day",
          durationSeconds: 60,
          title: "Focus Gate",
          purpose: "集中を取り戻す",
          state: "注意が散っている。",
          description: "集中へ戻る。",
          sessionTitle: "Focus Gate",
          sessionSubtitle: "集中を取り戻したいとき",
          sessionGuidance: "今の自分に合う方法で、注意をここへ戻します。",
          entryLabel: "今の自分に合う方法で戻る",
          completionTitle: "今日、また戻ることができました"
        },
        rest: {
          emoji: "🌿",
          routeType: "daytime-rest",
          meditationType: "day",
          durationSeconds: 60,
          title: "Rest Gate",
          purpose: "緊張をほどく",
          state: "張りつめている、抱えすぎている。",
          description: "緊張をゆるめる。",
          sessionTitle: "Rest Gate",
          sessionSubtitle: "緊張を静かに手放したいとき",
          sessionGuidance: "今の自分に合う方法で、少しずつ戻ります。",
          entryLabel: "今の自分に合う方法で戻る",
          completionTitle: "少しずつ、早く戻れるようになっています"
        },
        recharge: {
          emoji: "⚡",
          routeType: "daytime-recharge",
          meditationType: "day",
          durationSeconds: 60,
          title: "Recharge Gate",
          purpose: "エネルギーを回復する",
          state: "エネルギーが下がっている。",
          description: "エネルギーを戻す。",
          sessionTitle: "Recharge Gate",
          sessionSubtitle: "エネルギーを戻したいとき",
          sessionGuidance: "今の自分に合う方法で、呼吸から戻ります。",
          entryLabel: "今の自分に合う方法で戻る",
          completionTitle: "戻る方法を、体が思い出しています"
        },
        release: {} as LocalizedDoor,
        gratitude: {} as LocalizedDoor,
        sleep: {} as LocalizedDoor
      }
    },
    evening: {
      title: "Evening Gate",
      eyebrow: "夜",
      question: "今日は、どんなふうに閉じたいですか？",
      atmosphere: "今日を持ち越さず、置いていく時間です。",
      doors: {
        affirmation: {} as LocalizedDoor,
        energy: {} as LocalizedDoor,
        vision: {} as LocalizedDoor,
        focus: {} as LocalizedDoor,
        rest: {} as LocalizedDoor,
        recharge: {} as LocalizedDoor,
        release: {
          emoji: "🍂",
          routeType: "evening-release",
          meditationType: "night",
          durationSeconds: 180,
          title: "Release Gate",
          purpose: "今日の重さを手放す",
          state: "今日はもう、置いておきたい。",
          description: "今日の重さを下ろす。",
          sessionTitle: "Release Gate",
          sessionSubtitle: "今日を下ろして休みたいとき",
          sessionGuidance: "今の自分に合う方法で、夜の静けさへ戻ります。",
          entryLabel: "今の自分に合う方法で戻る",
          completionTitle: "今日、また戻ることができました"
        },
        gratitude: {
          emoji: "🙏",
          routeType: "evening-gratitude",
          meditationType: "night",
          durationSeconds: 180,
          title: "Gratitude Gate",
          purpose: "感謝で一日を閉じる",
          state: "今日よかったものを思い出したい。",
          description: "今日のよさを思い出す。",
          sessionTitle: "Gratitude Gate",
          sessionSubtitle: "今日のよさを思い出したいとき",
          sessionGuidance: "今の自分に合う方法で、静かな温かさへ戻ります。",
          entryLabel: "今の自分に合う方法で戻る",
          completionTitle: "リズムを思い出す力が育っています"
        },
        sleep: {
          emoji: "🌙",
          routeType: "evening-sleep",
          meditationType: "night",
          durationSeconds: 300,
          title: "Sleep Gate",
          purpose: "深い眠りの準備をする",
          state: "安心して眠りたい。",
          description: "眠りを準備する。",
          sessionTitle: "Sleep Gate",
          sessionSubtitle: "深く静かに眠りたいとき",
          sessionGuidance: "今の自分に合う方法で、眠りの静けさへ戻ります。",
          entryLabel: "今の自分に合う方法で戻る",
          completionTitle: "回復は少しずつ、馴染みのある道になっています"
        }
      }
    }
  },
  kr: {
    morning: {
      title: "Morning Gate",
      eyebrow: "아침",
      question: "오늘 아침\n당신의 상태는 어떤가요",
      atmosphere: "아침은\n오늘의 나를 조용히 선택하는 시간입니다",
      doors: {
        affirmation: {
          emoji: "✨",
          routeType: "morning-affirmation",
          meditationType: "morning",
          durationSeconds: 180,
          title: "오늘의 나를 선택하기",
          purpose: "오늘의 나를 선택하기",
          state: "오늘을\n조금 더 분명하게 시작하고 싶다",
          description: "오늘의 나를 조용히 고른다",
          sessionTitle: "오늘의 나를 선택하기",
          sessionSubtitle: "오늘의 나를\n조용히 선택하고 싶을 때",
          sessionGuidance: "지금의 나에게 맞는 방식으로\n조용히 돌아갑니다",
          entryLabel: "지금의 나에게 맞는 방식으로 돌아가기",
          completionTitle: "오늘, 다시 돌아올 수 있었습니다"
        },
        energy: {
          emoji: "☀️",
          routeType: "morning-energy",
          meditationType: "morning",
          durationSeconds: 180,
          title: "몸과 뇌를 깨우기",
          purpose: "몸과 뇌를 깨우기",
          state: "아직 몸이 무겁다",
          description: "몸과 뇌를 부드럽게 깨운다",
          sessionTitle: "뇌와 몸을 깨우기",
          sessionSubtitle: "중심에서\n조용히 깨어나고 싶을 때",
          sessionGuidance: "지금의 나에게 맞는 방식으로\n조용히 돌아갑니다",
          entryLabel: "지금의 나에게 맞는 방식으로 돌아가기",
          completionTitle: "조금 더 빨리 자신에게 돌아오고 있습니다"
        },
        vision: {
          emoji: "🌄",
          routeType: "morning-vision",
          meditationType: "morning",
          durationSeconds: 180,
          title: "방향을 기억하기",
          purpose: "방향을 기억하기",
          state: "어디로 가는지\n다시 떠올리고 싶다",
          description: "오늘의 방향을 다시 떠올린다",
          sessionTitle: "방향을 기억하기",
          sessionSubtitle: "오늘의 방향을\n조용히 떠올리고 싶을 때",
          sessionGuidance: "지금의 나에게 맞는 방식으로\n조용히 돌아갑니다",
          entryLabel: "지금의 나에게 맞는 방식으로 돌아가기",
          completionTitle: "리듬을 기억하는 힘이 자라고 있습니다"
        },
        focus: {} as LocalizedDoor,
        rest: {} as LocalizedDoor,
        recharge: {} as LocalizedDoor,
        release: {} as LocalizedDoor,
        gratitude: {} as LocalizedDoor,
        sleep: {} as LocalizedDoor
      }
    },
    daytime: {
      title: "Daytime Gate",
      eyebrow: "낮",
      question: "지금 당신에게 필요한 것은 무엇인가요?",
      atmosphere: "낮은 무너지기 전에 작게 돌아오는 시간입니다.",
      doors: {
        affirmation: {} as LocalizedDoor,
        energy: {} as LocalizedDoor,
        vision: {} as LocalizedDoor,
        focus: {
          emoji: "🎯",
          routeType: "daytime-focus",
          meditationType: "day",
          durationSeconds: 60,
          title: "집중으로 돌아가기",
          purpose: "집중으로 돌아가기",
          state: "주의가 흩어져 있다.",
          description: "집중으로 돌아간다.",
          sessionTitle: "집중으로 돌아가기",
          sessionSubtitle: "집중을 되찾고 싶을 때",
          sessionGuidance: "지금의 나에게 맞는 방식으로, 주의를 여기로 데려옵니다.",
          entryLabel: "지금의 나에게 맞는 방식으로 돌아가기",
          completionTitle: "오늘, 다시 돌아올 수 있었습니다"
        },
        rest: {
          emoji: "🌿",
          routeType: "daytime-rest",
          meditationType: "day",
          durationSeconds: 60,
          title: "긴장을 풀기",
          purpose: "긴장을 풀기",
          state: "긴장되거나 과부하 상태다.",
          description: "긴장을 내려놓는다.",
          sessionTitle: "긴장을 풀기",
          sessionSubtitle: "긴장을 내려놓고 싶을 때",
          sessionGuidance: "지금의 나에게 맞는 방식으로, 조금씩 돌아갑니다.",
          entryLabel: "지금의 나에게 맞는 방식으로 돌아가기",
          completionTitle: "조금 더 빨리 자신에게 돌아오고 있습니다"
        },
        recharge: {
          emoji: "⚡",
          routeType: "daytime-recharge",
          meditationType: "day",
          durationSeconds: 60,
          title: "에너지를 회복하기",
          purpose: "에너지를 회복하기",
          state: "에너지가 낮다.",
          description: "에너지를 다시 채운다.",
          sessionTitle: "에너지를 회복하기",
          sessionSubtitle: "에너지를 회복하고 싶을 때",
          sessionGuidance: "지금의 나에게 맞는 방식으로, 호흡에서 다시 시작합니다.",
          entryLabel: "지금의 나에게 맞는 방식으로 돌아가기",
          completionTitle: "리듬을 기억하는 힘이 자라고 있습니다"
        },
        release: {} as LocalizedDoor,
        gratitude: {} as LocalizedDoor,
        sleep: {} as LocalizedDoor
      }
    },
    evening: {
      title: "Evening Gate",
      eyebrow: "저녁",
      question: "오늘을 어떻게 닫고 싶나요?",
      atmosphere: "저녁은 오늘을 들고 가지 않고 조용히 내려놓는 시간입니다.",
      doors: {
        affirmation: {} as LocalizedDoor,
        energy: {} as LocalizedDoor,
        vision: {} as LocalizedDoor,
        focus: {} as LocalizedDoor,
        rest: {} as LocalizedDoor,
        recharge: {} as LocalizedDoor,
        release: {
          emoji: "🍂",
          routeType: "evening-release",
          meditationType: "night",
          durationSeconds: 180,
          title: "오늘의 무게 내려놓기",
          purpose: "오늘의 무게 내려놓기",
          state: "이제 내려놓고 싶다.",
          description: "오늘의 무게를 내려놓는다.",
          sessionTitle: "오늘의 무게 내려놓기",
          sessionSubtitle: "오늘을 내려놓고 쉬고 싶을 때",
          sessionGuidance: "지금의 나에게 맞는 방식으로, 밤의 고요로 돌아갑니다.",
          entryLabel: "지금의 나에게 맞는 방식으로 돌아가기",
          completionTitle: "오늘, 다시 돌아올 수 있었습니다"
        },
        gratitude: {
          emoji: "🙏",
          routeType: "evening-gratitude",
          meditationType: "night",
          durationSeconds: 180,
          title: "감사로 닫기",
          purpose: "감사로 닫기",
          state: "오늘 좋았던 것을 떠올리고 싶다.",
          description: "좋았던 것을 떠올린다.",
          sessionTitle: "감사로 닫기",
          sessionSubtitle: "오늘의 좋은 것을 떠올리고 싶을 때",
          sessionGuidance: "지금의 나에게 맞는 방식으로, 남아 있는 따뜻함으로 돌아갑니다.",
          entryLabel: "지금의 나에게 맞는 방식으로 돌아가기",
          completionTitle: "리듬을 기억하는 힘이 자라고 있습니다"
        },
        sleep: {
          emoji: "🌙",
          routeType: "evening-sleep",
          meditationType: "night",
          durationSeconds: 300,
          title: "잠을 준비하기",
          purpose: "잠을 준비하기",
          state: "평화롭게 잠들고 싶다.",
          description: "잠을 준비한다.",
          sessionTitle: "잠을 준비하기",
          sessionSubtitle: "깊고 고요하게 잠들고 싶을 때",
          sessionGuidance: "지금의 나에게 맞는 방식으로, 잠의 고요로 돌아갑니다.",
          entryLabel: "지금의 나에게 맞는 방식으로 돌아가기",
          completionTitle: "회복은 우연이 아니라 익숙한 길이 되고 있습니다"
        }
      }
    }
  },
  en: {
    morning: {
      title: "Morning Gate",
      eyebrow: "Morning",
      question: "What is your state\nthis morning",
      atmosphere: "A quiet time\nto choose who you are today",
      doors: {
        affirmation: {
          emoji: "✨",
          routeType: "morning-affirmation",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Affirmation Gate",
          purpose: "Choose today’s self",
          state: "I want to begin today\nwith clarity",
          description: "Choose today’s self",
          sessionTitle: "Choose Today’s Self",
          sessionSubtitle: "When you want to\nchoose today’s self",
          sessionGuidance: "Return in the way\nthat fits you today",
          entryLabel: "Return in the way that fits you today",
          completionTitle: "Today, you returned again"
        },
        energy: {
          emoji: "☀️",
          routeType: "morning-energy",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Energy Gate",
          purpose: "Wake the body and brain",
          state: "My body still feels heavy",
          description: "Wake the body and brain",
          sessionTitle: "Wake Body and Brain",
          sessionSubtitle: "When you want to\nwake from your center",
          sessionGuidance: "Return in the way\nthat fits you today",
          entryLabel: "Return in the way that fits you today",
          completionTitle: "You are learning to return more easily"
        },
        vision: {
          emoji: "🌄",
          routeType: "morning-vision",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Vision Gate",
          purpose: "Reconnect with direction and future",
          state: "I want to remember\nwhere I am going",
          description: "Remember your direction",
          sessionTitle: "Remember Your Direction",
          sessionSubtitle: "When you want to\nremember your direction",
          sessionGuidance: "Return in the way\nthat fits you today",
          entryLabel: "Return in the way that fits you today",
          completionTitle: "Your rhythm is remembering itself"
        },
        focus: {} as LocalizedDoor,
        rest: {} as LocalizedDoor,
        recharge: {} as LocalizedDoor,
        release: {} as LocalizedDoor,
        gratitude: {} as LocalizedDoor,
        sleep: {} as LocalizedDoor
      }
    },
    daytime: {
      title: "Daytime Gate",
      eyebrow: "Daytime",
      question: "What do you need right now?",
      atmosphere: "Return before you collapse.",
      doors: {
        affirmation: {} as LocalizedDoor,
        energy: {} as LocalizedDoor,
        vision: {} as LocalizedDoor,
        focus: {
          emoji: "🎯",
          routeType: "daytime-focus",
          meditationType: "day",
          durationSeconds: 60,
          title: "Focus Gate",
          purpose: "Return to concentration",
          state: "My attention is scattered.",
          description: "Return to concentration.",
          sessionTitle: "Focus Gate",
          sessionSubtitle: "When your attention feels scattered",
          sessionGuidance: "Return in the way that fits you today and gather your attention again.",
          entryLabel: "Return in the way that fits you today",
          completionTitle: "Today, you returned again"
        },
        rest: {
          emoji: "🌿",
          routeType: "daytime-rest",
          meditationType: "day",
          durationSeconds: 60,
          title: "Rest Gate",
          purpose: "Release tension",
          state: "I feel tense or overloaded.",
          description: "Release tension.",
          sessionTitle: "Rest Gate",
          sessionSubtitle: "When you feel tense or overloaded",
          sessionGuidance: "Return in the way that fits you today and let the pressure soften.",
          entryLabel: "Return in the way that fits you today",
          completionTitle: "You are learning to return more easily"
        },
        recharge: {
          emoji: "⚡",
          routeType: "daytime-recharge",
          meditationType: "day",
          durationSeconds: 60,
          title: "Recharge Gate",
          purpose: "Recover energy",
          state: "My energy is low.",
          description: "Recover energy.",
          sessionTitle: "Recharge Gate",
          sessionSubtitle: "When your energy is low",
          sessionGuidance: "Return in the way that fits you today and let one small rhythm refill you.",
          entryLabel: "Return in the way that fits you today",
          completionTitle: "Your rhythm is remembering itself"
        },
        release: {} as LocalizedDoor,
        gratitude: {} as LocalizedDoor,
        sleep: {} as LocalizedDoor
      }
    },
    evening: {
      title: "Evening Gate",
      eyebrow: "Evening",
      question: "How do you want to close today?",
      atmosphere: "Set today down before sleep.",
      doors: {
        affirmation: {} as LocalizedDoor,
        energy: {} as LocalizedDoor,
        vision: {} as LocalizedDoor,
        focus: {} as LocalizedDoor,
        rest: {} as LocalizedDoor,
        recharge: {} as LocalizedDoor,
        release: {
          emoji: "🍂",
          routeType: "evening-release",
          meditationType: "night",
          durationSeconds: 180,
          title: "Release Gate",
          purpose: "Let go of stress",
          state: "I want to put today down.",
          description: "Let go of stress.",
          sessionTitle: "Release Gate",
          sessionSubtitle: "When you want to put today down",
          sessionGuidance: "Return in the way that fits you today and let the night receive you.",
          entryLabel: "Return in the way that fits you today",
          completionTitle: "Today, you returned again"
        },
        gratitude: {
          emoji: "🙏",
          routeType: "evening-gratitude",
          meditationType: "night",
          durationSeconds: 180,
          title: "Gratitude Gate",
          purpose: "End the day with appreciation",
          state: "I want to remember what was good.",
          description: "End with appreciation.",
          sessionTitle: "Gratitude Gate",
          sessionSubtitle: "When you want to remember what was good",
          sessionGuidance: "Return in the way that fits you today and let one warm thing come closer.",
          entryLabel: "Return in the way that fits you today",
          completionTitle: "Your rhythm is remembering itself"
        },
        sleep: {
          emoji: "🌙",
          routeType: "evening-sleep",
          meditationType: "night",
          durationSeconds: 300,
          title: "Sleep Gate",
          purpose: "Prepare for deep sleep",
          state: "I want to sleep peacefully.",
          description: "Prepare for deep sleep.",
          sessionTitle: "Sleep Gate",
          sessionSubtitle: "When you want to sleep peacefully",
          sessionGuidance: "Return in the way that fits you today until sleep feels safe again.",
          entryLabel: "Return in the way that fits you today",
          completionTitle: "Recovery is becoming familiar"
        }
      }
    }
  }
} as const;

function resolveLanguage(language: string): BasicLanguage {
  if (language === "kr" || language === "en" || language === "jp") {
    return language;
  }

  return "jp";
}

function toHref(gate: BasicGateKey, door: LocalizedDoor) {
  return `/meditation?duration=${door.durationSeconds}&type=${door.routeType}&returnTo=${encodeURIComponent(`/program/basic?rhythm=${gate}`)}`;
}

const orderedGates: BasicGateKey[] = ["morning", "daytime", "evening"];
const orderedDoorsByGate: Record<BasicGateKey, BasicDoorKey[]> = {
  morning: ["affirmation", "energy", "vision"],
  daytime: ["focus", "rest", "recharge"],
  evening: ["release", "gratitude", "sleep"]
};

export function getBasicRhythmGates(language: string) {
  const localized = rhythmCatalog[resolveLanguage(language)];

  return orderedGates.map((gateKey) => {
    const gate = localized[gateKey];
    const doors = orderedDoorsByGate[gateKey].map((doorKey) => {
      const door = gate.doors[doorKey];

      return {
        key: doorKey,
        gate: gateKey,
        routeType: door.routeType,
        meditationType: door.meditationType,
        meditationDoor: doorKey,
        durationSeconds: door.durationSeconds,
        emoji: door.emoji,
        title: door.title,
        purpose: door.purpose,
        state: door.state,
        description: door.description,
        sessionTitle: door.sessionTitle,
        sessionSubtitle: door.sessionSubtitle,
        sessionGuidance: door.sessionGuidance,
        entryLabel: door.entryLabel,
        completionTitle: door.completionTitle,
        href: toHref(gateKey, door)
      } satisfies BasicPracticeDefinition;
    });

    return {
      key: gateKey,
      title: gate.title,
      eyebrow: gate.eyebrow,
      question: gate.question,
      atmosphere: gate.atmosphere,
      doors
    };
  });
}

export function getBasicPracticeByRouteType(routeType: string | null, language: string) {
  if (!routeType) {
    return null;
  }

  const gates = getBasicRhythmGates(language);

  for (const gate of gates) {
    const match = gate.doors.find((door) => door.routeType === routeType);
    if (match) {
      return match;
    }
  }

  return null;
}

export function getBasicPracticeBySession(
  meditationType: SessionTypeKey,
  meditationDoor: string | null,
  language: string
) {
  if (!meditationDoor) {
    return null;
  }

  const normalizedDoor =
    meditationDoor === "relax" ? "rest" : meditationDoor === "vitality" ? "recharge" : meditationDoor;

  const gates = getBasicRhythmGates(language);

  for (const gate of gates) {
    const match = gate.doors.find(
      (door) => door.meditationType === meditationType && door.meditationDoor === normalizedDoor
    );

    if (match) {
      return match;
    }
  }

  return null;
}

export function getBasicGateForCurrentTime(date = new Date()): BasicGateKey {
  const hour = date.getHours();

  if (hour >= 5 && hour <= 11) {
    return "morning";
  }

  if (hour >= 12 && hour <= 17) {
    return "daytime";
  }

  return "evening";
}
