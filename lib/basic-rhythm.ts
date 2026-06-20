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
      question: "今朝のあなたは、どんな状態ですか？",
      atmosphere: "朝は、今日の自分を静かに選び直す時間です。",
      doors: {
        affirmation: {
          emoji: "✨",
          routeType: "morning-affirmation",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Affirmation Gate",
          purpose: "今日の自分を選ぶ",
          state: "今日は、もう少し明確に始めたい。",
          description: "今日の輪郭を静かに整える3分。",
          sessionTitle: "今日の自分を選ぶ",
          sessionSubtitle: "朝を明確に始めたいとき",
          sessionGuidance: "今日どんな自分でいたいかを、呼吸の中で静かに選びます。",
          entryLabel: "Affirmation Gateに入る",
          completionTitle: "今日の自分を、静かに選びました。"
        },
        energy: {
          emoji: "☀️",
          routeType: "morning-energy",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Energy Gate",
          purpose: "身体と脳を目覚めさせる",
          state: "まだ身体が重たい。",
          description: "眠っていた感覚をやさしく起こす3分。",
          sessionTitle: "脳と身体を目覚めさせる",
          sessionSubtitle: "まだ身体が重い朝に",
          sessionGuidance: "呼吸と感覚をつなぎながら、身体の中に朝の光を入れていきます。",
          entryLabel: "Energy Gateに入る",
          completionTitle: "身体と脳が、静かに目覚め始めました。"
        },
        vision: {
          emoji: "🌄",
          routeType: "morning-vision",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Vision Gate",
          purpose: "方向と未来を思い出す",
          state: "今日はどこへ向かうのか、思い出したい。",
          description: "今日の向かう先を心に映す3分。",
          sessionTitle: "Vision Gate",
          sessionSubtitle: "方向と未来を思い出したいとき",
          sessionGuidance: "急がずに、今日向かいたい景色を心の中に映していきます。",
          entryLabel: "Vision Gateに入る",
          completionTitle: "今日向かう景色を、心に取り戻しました。"
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
      atmosphere: "昼は、崩れる前に小さく戻る時間です。",
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
          description: "散った意識を静かに集める1分。",
          sessionTitle: "Focus Gate",
          sessionSubtitle: "集中を取り戻したいとき",
          sessionGuidance: "慌ただしさから一歩離れ、注意をいまここへ戻します。",
          entryLabel: "Focus Gateに入る",
          completionTitle: "集中が、静かに戻ってきました。"
        },
        rest: {
          emoji: "🌿",
          routeType: "daytime-rest",
          meditationType: "day",
          durationSeconds: 60,
          title: "Rest Gate",
          purpose: "緊張をほどく",
          state: "張りつめている、抱えすぎている。",
          description: "身体と頭のこわばりをゆるめる1分。",
          sessionTitle: "Rest Gate",
          sessionSubtitle: "緊張を静かに手放したいとき",
          sessionGuidance: "抱え込んでいた力を少しだけほどき、呼吸に居場所をつくります。",
          entryLabel: "Rest Gateに入る",
          completionTitle: "緊張が、少しほどけました。"
        },
        recharge: {
          emoji: "⚡",
          routeType: "daytime-recharge",
          meditationType: "day",
          durationSeconds: 60,
          title: "Recharge Gate",
          purpose: "エネルギーを回復する",
          state: "エネルギーが下がっている。",
          description: "消耗した内側をやさしく満たし直す1分。",
          sessionTitle: "Recharge Gate",
          sessionSubtitle: "エネルギーを戻したいとき",
          sessionGuidance: "足りないものを責めずに、呼吸から小さく満たしていきます。",
          entryLabel: "Recharge Gateに入る",
          completionTitle: "エネルギーが、少し戻ってきました。"
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
      atmosphere: "夜は、今日を持ち越さずに静かに置いていく時間です。",
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
          description: "一日の緊張と重さを下ろす3分。",
          sessionTitle: "Release Gate",
          sessionSubtitle: "今日を下ろして休みたいとき",
          sessionGuidance: "抱えていた力をひとつずつ下ろし、夜の静けさに戻っていきます。",
          entryLabel: "Release Gateに入る",
          completionTitle: "今日の重さを、静かに下ろしました。"
        },
        gratitude: {
          emoji: "🙏",
          routeType: "evening-gratitude",
          meditationType: "night",
          durationSeconds: 180,
          title: "Gratitude Gate",
          purpose: "感謝で一日を閉じる",
          state: "今日よかったものを思い出したい。",
          description: "小さなよさに触れながら終える3分。",
          sessionTitle: "Gratitude Gate",
          sessionSubtitle: "今日のよさを思い出したいとき",
          sessionGuidance: "うまくいかなかったことより、静かに残っている温かさに触れていきます。",
          entryLabel: "Gratitude Gateに入る",
          completionTitle: "今日の小さな恵みを思い出しました。"
        },
        sleep: {
          emoji: "🌙",
          routeType: "evening-sleep",
          meditationType: "night",
          durationSeconds: 300,
          title: "Sleep Gate",
          purpose: "深い眠りの準備をする",
          state: "安心して眠りたい。",
          description: "眠りに向かう準備を整える5分。",
          sessionTitle: "Sleep Gate",
          sessionSubtitle: "深く静かに眠りたいとき",
          sessionGuidance: "身体の速度をゆっくり落としながら、眠りへ向かう静かな地面をつくります。",
          entryLabel: "Sleep Gateに入る",
          completionTitle: "眠りへ向かう静けさが整いました。"
        }
      }
    }
  },
  kr: {
    morning: {
      title: "Morning Gate",
      eyebrow: "아침",
      question: "오늘 아침, 당신의 상태는 어떤가요?",
      atmosphere: "아침은 오늘의 나를 조용히 선택하는 시간입니다.",
      doors: {
        affirmation: {
          emoji: "✨",
          routeType: "morning-affirmation",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Affirmation Gate",
          purpose: "오늘의 나를 선택하기",
          state: "오늘을 조금 더 분명하게 시작하고 싶다.",
          description: "오늘의 결을 조용히 정돈하는 3분.",
          sessionTitle: "오늘의 나를 선택하기",
          sessionSubtitle: "오늘을 분명하게 시작하고 싶을 때",
          sessionGuidance: "오늘 어떤 나로 살아가고 싶은지, 호흡 안에서 조용히 선택합니다.",
          entryLabel: "Affirmation Gate 시작",
          completionTitle: "오늘의 나를, 조용히 선택했습니다."
        },
        energy: {
          emoji: "☀️",
          routeType: "morning-energy",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Energy Gate",
          purpose: "몸과 뇌를 깨우기",
          state: "아직 몸이 무겁다.",
          description: "잠들어 있던 감각을 부드럽게 깨우는 3분.",
          sessionTitle: "뇌와 몸을 깨우기",
          sessionSubtitle: "아직 몸이 무거운 아침에",
          sessionGuidance: "호흡과 감각을 연결하며 몸 안으로 아침의 빛을 천천히 들입니다.",
          entryLabel: "Energy Gate 시작",
          completionTitle: "몸과 뇌가, 조용히 깨어나기 시작했습니다."
        },
        vision: {
          emoji: "🌄",
          routeType: "morning-vision",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Vision Gate",
          purpose: "방향과 미래를 기억하기",
          state: "내가 어디로 가는지 다시 떠올리고 싶다.",
          description: "오늘 향할 방향을 마음에 비추는 3분.",
          sessionTitle: "Vision Gate",
          sessionSubtitle: "방향과 미래를 떠올리고 싶을 때",
          sessionGuidance: "서두르지 않고, 오늘 향하고 싶은 장면을 마음속에 그려봅니다.",
          entryLabel: "Vision Gate 시작",
          completionTitle: "오늘 향할 방향을 다시 떠올렸습니다."
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
          title: "Focus Gate",
          purpose: "집중으로 돌아가기",
          state: "주의가 흩어져 있다.",
          description: "흩어진 주의를 조용히 모으는 1분.",
          sessionTitle: "Focus Gate",
          sessionSubtitle: "집중을 되찾고 싶을 때",
          sessionGuidance: "분주함에서 한 걸음 물러나, 주의를 지금 여기로 데려옵니다.",
          entryLabel: "Focus Gate 시작",
          completionTitle: "집중이, 조용히 돌아왔습니다."
        },
        rest: {
          emoji: "🌿",
          routeType: "daytime-rest",
          meditationType: "day",
          durationSeconds: 60,
          title: "Rest Gate",
          purpose: "긴장을 풀기",
          state: "긴장되거나 과부하 상태다.",
          description: "몸과 머리의 긴장을 풀어주는 1분.",
          sessionTitle: "Rest Gate",
          sessionSubtitle: "긴장을 내려놓고 싶을 때",
          sessionGuidance: "붙잡고 있던 힘을 조금 풀고, 호흡이 머물 공간을 만듭니다.",
          entryLabel: "Rest Gate 시작",
          completionTitle: "긴장이, 조금 풀렸습니다."
        },
        recharge: {
          emoji: "⚡",
          routeType: "daytime-recharge",
          meditationType: "day",
          durationSeconds: 60,
          title: "Recharge Gate",
          purpose: "에너지를 회복하기",
          state: "에너지가 낮다.",
          description: "소모된 안쪽을 부드럽게 채우는 1분.",
          sessionTitle: "Recharge Gate",
          sessionSubtitle: "에너지를 회복하고 싶을 때",
          sessionGuidance: "부족함을 밀어붙이지 않고, 호흡으로 작은 충전을 시작합니다.",
          entryLabel: "Recharge Gate 시작",
          completionTitle: "에너지가, 조금 돌아왔습니다."
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
          purpose: "오늘의 무게를 내려놓기",
          state: "오늘을 이제 내려놓고 싶다.",
          description: "하루의 긴장과 무게를 푸는 3분.",
          sessionTitle: "Release Gate",
          sessionSubtitle: "오늘을 내려놓고 쉬고 싶을 때",
          sessionGuidance: "붙잡고 있던 힘을 하나씩 내려놓으며 밤의 고요로 돌아갑니다.",
          entryLabel: "Release Gate 시작",
          completionTitle: "오늘의 무게를, 조용히 내려놓았습니다."
        },
        gratitude: {
          emoji: "🙏",
          routeType: "evening-gratitude",
          meditationType: "night",
          durationSeconds: 180,
          title: "Gratitude Gate",
          purpose: "감사로 하루를 닫기",
          state: "오늘 좋았던 것을 떠올리고 싶다.",
          description: "작은 좋은 것을 느끼며 닫는 3분.",
          sessionTitle: "Gratitude Gate",
          sessionSubtitle: "오늘의 좋은 것을 떠올리고 싶을 때",
          sessionGuidance: "아쉬움보다 남아 있는 따뜻함을 천천히 다시 만납니다.",
          entryLabel: "Gratitude Gate 시작",
          completionTitle: "오늘의 작은 고마움을 다시 만났습니다."
        },
        sleep: {
          emoji: "🌙",
          routeType: "evening-sleep",
          meditationType: "night",
          durationSeconds: 300,
          title: "Sleep Gate",
          purpose: "깊은 잠을 준비하기",
          state: "평화롭게 잠들고 싶다.",
          description: "잠으로 가는 준비를 정돈하는 5분.",
          sessionTitle: "Sleep Gate",
          sessionSubtitle: "깊고 고요하게 잠들고 싶을 때",
          sessionGuidance: "몸의 속도를 천천히 낮추며 잠으로 가는 조용한 바닥을 만듭니다.",
          entryLabel: "Sleep Gate 시작",
          completionTitle: "잠으로 향하는 고요가 정돈되었습니다."
        }
      }
    }
  },
  en: {
    morning: {
      title: "Morning Gate",
      eyebrow: "Morning",
      question: "What is your state this morning?",
      atmosphere: "Morning is where you quietly choose who you are today.",
      doors: {
        affirmation: {
          emoji: "✨",
          routeType: "morning-affirmation",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Affirmation Gate",
          purpose: "Choose today’s self",
          state: "I want to begin today with clarity.",
          description: "3 quiet minutes to shape the tone of today.",
          sessionTitle: "Choose Today’s Self",
          sessionSubtitle: "When you want to begin the day with clarity",
          sessionGuidance: "In this small pause, choose the version of yourself you want to live from today.",
          entryLabel: "Enter Affirmation Gate",
          completionTitle: "You quietly chose who you are today."
        },
        energy: {
          emoji: "☀️",
          routeType: "morning-energy",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Energy Gate",
          purpose: "Wake the body and brain",
          state: "My body still feels heavy.",
          description: "3 gentle minutes to wake what is still slow.",
          sessionTitle: "Wake Body and Brain",
          sessionSubtitle: "When your body still feels heavy",
          sessionGuidance: "Let breath and body reconnect so the morning can enter you more fully.",
          entryLabel: "Enter Energy Gate",
          completionTitle: "Your body and brain have started to wake."
        },
        vision: {
          emoji: "🌄",
          routeType: "morning-vision",
          meditationType: "morning",
          durationSeconds: 180,
          title: "Vision Gate",
          purpose: "Reconnect with direction and future",
          state: "I want to remember where I am going.",
          description: "3 minutes to remember the direction of your day.",
          sessionTitle: "Vision Gate",
          sessionSubtitle: "When you want to remember where you are going",
          sessionGuidance: "Without pushing, let the direction of today come back into view.",
          entryLabel: "Enter Vision Gate",
          completionTitle: "The direction of today returned to view."
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
      atmosphere: "Daytime is where you return before collapse, not after.",
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
          description: "1 minute to gather your attention again.",
          sessionTitle: "Focus Gate",
          sessionSubtitle: "When your attention feels scattered",
          sessionGuidance: "Step out of the rush and let your attention gather in one place again.",
          entryLabel: "Enter Focus Gate",
          completionTitle: "Your concentration quietly returned."
        },
        rest: {
          emoji: "🌿",
          routeType: "daytime-rest",
          meditationType: "day",
          durationSeconds: 60,
          title: "Rest Gate",
          purpose: "Release tension",
          state: "I feel tense or overloaded.",
          description: "1 minute to soften the tension you are carrying.",
          sessionTitle: "Rest Gate",
          sessionSubtitle: "When you feel tense or overloaded",
          sessionGuidance: "Let the pressure drop a little so your breath has room again.",
          entryLabel: "Enter Rest Gate",
          completionTitle: "The tension softened a little."
        },
        recharge: {
          emoji: "⚡",
          routeType: "daytime-recharge",
          meditationType: "day",
          durationSeconds: 60,
          title: "Recharge Gate",
          purpose: "Recover energy",
          state: "My energy is low.",
          description: "1 minute to refill what has been drained.",
          sessionTitle: "Recharge Gate",
          sessionSubtitle: "When your energy is low",
          sessionGuidance: "Without forcing yourself, let one small rhythm refill your energy.",
          entryLabel: "Enter Recharge Gate",
          completionTitle: "A little energy returned."
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
      atmosphere: "Evening is where you set today down before sleep.",
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
          description: "3 minutes to set down the weight of the day.",
          sessionTitle: "Release Gate",
          sessionSubtitle: "When you want to put today down",
          sessionGuidance: "Let the day leave your body a little so the night can receive you.",
          entryLabel: "Enter Release Gate",
          completionTitle: "You quietly set today down."
        },
        gratitude: {
          emoji: "🙏",
          routeType: "evening-gratitude",
          meditationType: "night",
          durationSeconds: 180,
          title: "Gratitude Gate",
          purpose: "End the day with appreciation",
          state: "I want to remember what was good.",
          description: "3 minutes to close the day with warmth.",
          sessionTitle: "Gratitude Gate",
          sessionSubtitle: "When you want to remember what was good",
          sessionGuidance: "Let one good thing come closer so the day does not end only in fatigue.",
          entryLabel: "Enter Gratitude Gate",
          completionTitle: "You remembered what was still good."
        },
        sleep: {
          emoji: "🌙",
          routeType: "evening-sleep",
          meditationType: "night",
          durationSeconds: 300,
          title: "Sleep Gate",
          purpose: "Prepare for deep sleep",
          state: "I want to sleep peacefully.",
          description: "5 minutes to prepare for deep rest.",
          sessionTitle: "Sleep Gate",
          sessionSubtitle: "When you want to sleep peacefully",
          sessionGuidance: "Let the pace of the body slow down until sleep feels safe to enter.",
          entryLabel: "Enter Sleep Gate",
          completionTitle: "The ground for restful sleep is ready."
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
