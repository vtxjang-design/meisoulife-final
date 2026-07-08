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
  headline?: string;
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
  headline?: string;
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
      atmosphere: "朝は\n静かに目覚めていく時間です",
      doors: {
        affirmation: {
          emoji: "✨",
          routeType: "morning-affirmation",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Awakening Gate",
          purpose: "目覚めの扉",
          state: "今日は\nもう少し明確に始めたい",
          description: "静かに目覚めていく",
          sessionTitle: "Awakening Gate",
          sessionSubtitle: "目覚めの扉",
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
      title: "🌞 Daytime Gate",
      eyebrow: "昼",
      question: "今のあなたに必要なリズムを選んでください。",
      atmosphere: "",
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
          headline: "散漫から 明晰へ",
          purpose: "Refocus",
          state: "思考が散っている",
          description: "散った思考を ひとつの点へ戻します",
          sessionTitle: "Focus Gate",
          sessionSubtitle: "散った思考を\nひとつへ戻す1分",
          sessionGuidance: "いま必要なのは 明確さです\n注意をひとつの点へ戻します",
          entryLabel: "Refocus",
          completionTitle: "🧠 Brain Rhythm Restored"
        },
        rest: {
          emoji: "🌿",
          routeType: "daytime-rest",
          meditationType: "day",
          durationSeconds: 60,
          title: "Calm Gate",
          headline: "緊張から 平穏へ",
          purpose: "Heart Rhythm を取り戻す",
          state: "張りつめている\n抱えすぎている",
          description: "身体と心の緊張を やさしくほどきます",
          sessionTitle: "Calm Gate",
          sessionSubtitle: "緊張をゆるめて\n安らぎへ戻る1分",
          sessionGuidance: "いま必要なのは やわらかさです\n長い吐息で 圧を手放します",
          entryLabel: "Relax",
          completionTitle: "❤️ Heart Rhythm Restored"
        },
        recharge: {
          emoji: "⚡",
          routeType: "daytime-recharge",
          meditationType: "day",
          durationSeconds: 60,
          title: "Recharge Gate",
          headline: "疲れから 活力へ",
          purpose: "Body Rhythm を取り戻す",
          state: "エネルギーが下がっている",
          description: "身体を充電し 本来の活力を呼び戻します",
          sessionTitle: "Recharge Gate",
          sessionSubtitle: "身体を満たして\n活力を戻す1分",
          sessionGuidance: "いま必要なのは 活力です\n深い吸気で 体の目覚めを促します",
          entryLabel: "Recharge",
          completionTitle: "⚡ Body Rhythm Restored"
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
          purpose: "今日を静かに下ろす",
          state: "今日はもう、静かに休みたい。",
          description: "今日の重さを静かに下ろします。",
          sessionTitle: "Release Gate",
          sessionSubtitle: "今日を静かに下ろしたいとき",
          sessionGuidance: "声よりも 音楽よりも 静けさに身をゆだねる夜です。",
          entryLabel: "静かな夜へ戻る",
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
      atmosphere: "아침은\n조용히 깨어나는 시간입니다",
      doors: {
        affirmation: {
          emoji: "✨",
          routeType: "morning-affirmation",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Awakening Gate",
          purpose: "깨어남의 문",
          state: "오늘을\n조금 더 분명하게 시작하고 싶다",
          description: "조용히 깨어남으로 들어간다",
          sessionTitle: "Awakening Gate",
          sessionSubtitle: "깨어남의 문",
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
      title: "🌞 Daytime Gate",
      eyebrow: "낮",
      question: "지금 나에게 필요한 리듬을 선택하세요.",
      atmosphere: "",
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
          headline: "산만함에서 선명함으로",
          purpose: "다시 집중하기",
          state: "주의가 흩어져 있다",
          description: "흩어진 생각을 하나의 점으로 다시 모읍니다",
          sessionTitle: "Focus Gate",
          sessionSubtitle: "흩어진 주의를\n하나로 되돌리는 1분",
          sessionGuidance: "지금 필요한 것은 선명함입니다\n흩어진 주의를 한곳으로 모읍니다",
          entryLabel: "Refocus",
          completionTitle: "🧠 Brain Rhythm Restored"
        },
        rest: {
          emoji: "🌿",
          routeType: "daytime-rest",
          meditationType: "day",
          durationSeconds: 60,
          title: "Calm Gate",
          headline: "긴장에서 평온함으로",
          purpose: "Heart Rhythm 회복",
          state: "긴장되거나 과부하 상태다",
          description: "몸과 마음의 긴장을 부드럽게 내려놓습니다",
          sessionTitle: "Calm Gate",
          sessionSubtitle: "긴장을 풀고\n평온함으로 돌아가는 1분",
          sessionGuidance: "지금 필요한 것은 이완입니다\n긴 호흡으로 압력을 내려놓습니다",
          entryLabel: "Relax",
          completionTitle: "❤️ Heart Rhythm Restored"
        },
        recharge: {
          emoji: "⚡",
          routeType: "daytime-recharge",
          meditationType: "day",
          durationSeconds: 60,
          title: "Recharge Gate",
          headline: "무기력에서 활력으로",
          purpose: "Body Rhythm 회복",
          state: "에너지가 낮다",
          description: "몸을 다시 채우고 본래의 활력을 깨웁니다",
          sessionTitle: "Recharge Gate",
          sessionSubtitle: "몸을 충전하고\n활력을 되찾는 1분",
          sessionGuidance: "지금 필요한 것은 활력입니다\n깊은 들숨으로 몸의 리듬을 깨웁니다",
          entryLabel: "Recharge",
          completionTitle: "⚡ Body Rhythm Restored"
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
          title: "Release Gate",
          purpose: "오늘을 조용히 내려놓기",
          state: "오늘은 이제, 조용히 쉬고 싶다.",
          description: "오늘의 무게를 조용히 내려놓습니다.",
          sessionTitle: "Release Gate",
          sessionSubtitle: "오늘을 조용히 내려놓고 싶을 때",
          sessionGuidance: "목소리보다 음악보다 고요함에 머무는 밤입니다.",
          entryLabel: "고요한 밤으로 돌아가기",
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
      atmosphere: "A quiet time\nto awaken into your day",
      doors: {
        affirmation: {
          emoji: "✨",
          routeType: "morning-affirmation",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Awakening Gate",
          purpose: "Awakening awareness",
          state: "I want to begin today\nwith clarity",
          description: "Awaken gently into the day",
          sessionTitle: "Awakening Gate",
          sessionSubtitle: "When you want to\nawaken into your day",
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
      title: "🌞 Daytime Gate",
      eyebrow: "Daytime",
      question: "Choose the gate you need right now.",
      atmosphere: "",
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
          headline: "From Distraction to Clarity",
          purpose: "Refocus",
          state: "My attention is scattered",
          description: "Bring scattered thoughts back into one point",
          sessionTitle: "Focus Gate",
          sessionSubtitle: "A one-minute return\nfrom distraction to clarity",
          sessionGuidance: "Return to one clear point\nand let attention gather again",
          entryLabel: "Refocus",
          completionTitle: "🧠 Brain Rhythm Restored"
        },
        rest: {
          emoji: "🌿",
          routeType: "daytime-rest",
          meditationType: "day",
          durationSeconds: 60,
          title: "Calm Gate",
          headline: "From Tension to Ease",
          purpose: "Restore Heart Rhythm",
          state: "I feel tense or overloaded",
          description: "Release physical and mental tension",
          sessionTitle: "Calm Gate",
          sessionSubtitle: "A one-minute return\nfrom tension to ease",
          sessionGuidance: "Let the exhale grow longer\nand allow the pressure to soften",
          entryLabel: "Relax",
          completionTitle: "❤️ Heart Rhythm Restored"
        },
        recharge: {
          emoji: "⚡",
          routeType: "daytime-recharge",
          meditationType: "day",
          durationSeconds: 60,
          title: "Recharge Gate",
          headline: "From Fatigue to Vitality",
          purpose: "Restore Body Rhythm",
          state: "My energy is low",
          description: "Recharge your body and awaken your natural vitality",
          sessionTitle: "Recharge Gate",
          sessionSubtitle: "A one-minute return\nfrom fatigue to vitality",
          sessionGuidance: "Take a deeper inhale\nand let your body wake back up",
          entryLabel: "Recharge",
          completionTitle: "⚡ Body Rhythm Restored"
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
          purpose: "Set today down quietly",
          state: "I want to let today rest.",
          description: "Set the weight of today down quietly.",
          sessionTitle: "Release Gate",
          sessionSubtitle: "When you want to set today down gently",
          sessionGuidance: "Tonight is for resting inside silence more than words.",
          entryLabel: "Return to a quiet night",
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
        headline: "headline" in door ? door.headline : door.title,
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
