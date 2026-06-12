import type { Language } from "@/lib/i18n";

export const RHYTHM_JOURNEY_STORAGE_KEY = "meisoulife_rhythm_journey_progress";

export const journeyAudioMap: Record<number, string> = {
  1: "/audio/7day-recovery/day01-stop.mp3",
  2: "/audio/7day-recovery/day02-breath.mp3",
  3: "/audio/7day-recovery/day03-body.mp3",
  4: "/audio/7day-recovery/day04-nature.mp3",
  5: "/audio/7day-recovery/day05-gratitude.mp3",
  6: "/audio/7day-recovery/day06-stillness.mp3",
  7: "/audio/7day-recovery/day07-my-rhythm.mp3"
};

export type RhythmJourneyProgress = {
  journeyStarted: boolean;
  currentDay: number;
  completedDays: number[];
  selectedOptions: Record<string, string>;
};

export type RhythmJourneyOption = {
  value: string;
  label: string;
};

export type RhythmJourneyChoice = RhythmJourneyOption & {
  followUp: string;
  cta: string;
};

export type RhythmJourneyGuidance = {
  opening: string;
  closing: string;
};

export type RhythmJourneyDay = {
  day: number;
  title: string;
  subtitle: string;
  intro: string;
  practices: string[];
  question: string;
  options?: RhythmJourneyOption[];
  specialNote?: string;
  completion: string;
  freeTextPlaceholder?: string;
  guidance: RhythmJourneyGuidance;
};

export type RhythmJourneyLocaleContent = {
  title: string;
  subtitle: string;
  entryEyebrow: string;
  entryBody: string;
  startCta: string;
  approxMinute: string;
  preparing: string;
  todayEyebrow: string;
  practicesLabel: string;
  reflectionLabel: string;
  enoughEyebrow: string;
  finishDayCta: string;
  recoveryCta: string;
  natureLeaveCta: string;
  naturePauseMessage: string;
  nextCta: string;
  returnHomeCta: string;
  timerTopText: string;
  timerSubText: string;
  audioStart: string;
  audioOn: string;
  audioOff: string;
  day7Title: string;
  day7Body: string;
  day7Transition: string;
  dailyRhythmCta: string;
  rhythmChoices: RhythmJourneyChoice[];
  days: RhythmJourneyDay[];
};

const rhythmJourneyContent: Record<Language, RhythmJourneyLocaleContent> = {
  jp: {
    title: "7日間の\n小さな回復",
    subtitle: "一日ひとつ\n\n自分を整える",
    entryEyebrow: "毎日の小さなリズム",
    entryBody: "頑張らなくて大丈夫です。\n\n今日は、\nひとつだけ整えてみましょう。",
    startCta: "始める",
    approxMinute: "約1分",
    preparing: "静かに準備しています。",
    todayEyebrow: "今日の小さな回復",
    practicesLabel: "今日の小さな実践",
    reflectionLabel: "感じてみる",
    enoughEyebrow: "今日の分だけで十分です",
    finishDayCta: "今日の小さな回復を終える",
    recoveryCta: "60秒の回復へ",
    natureLeaveCta: "画面を閉じる",
    naturePauseMessage: "今日は、\nスマホを少し休ませましょう。\n\n10分後に\n戻ってきてください。",
    nextCta: "次へ",
    returnHomeCta: "戻ってきましょう",
    timerTopText: "今ここで、\n60秒だけ呼吸に戻りましょう。",
    timerSubText: "急がなくて大丈夫です。",
    audioStart: "自然音をはじめる",
    audioOn: "自然音 ON",
    audioOff: "自然音 OFF",
    day7Title: "7日間、\nお疲れさまでした。",
    day7Body:
      "あなたは、\n新しい自分になったのではありません。\n\nもともと持っていたリズムを、\n少しずつ思い出し始めたのです。\n\n回復は、\n特別なことではありません。\n\n一日の小さな呼吸から、\nまた始めることができます。",
    day7Transition: "明日からは、\nあなたの一日のリズムを\n小さく整えていきましょう。",
    dailyRhythmCta: "私のDaily Rhythmへ",
    rhythmChoices: [
      { value: "morning", label: "☀️ 朝のリズム", followUp: "朝のリズムを\n育てていきましょう。", cta: "Morning Rhythmへ" },
      { value: "day", label: "🌿 昼のリズム", followUp: "昼のリズムを\n育てていきましょう。", cta: "Day Rhythmへ" },
      { value: "night", label: "🌙 夜のリズム", followUp: "夜のリズムを\n育てていきましょう。", cta: "Night Rhythmへ" }
    ],
    days: [
      {
        day: 1,
        title: "止まる",
        subtitle: "今の自分に気づく",
        intro: "今日は「止まる」。\n\n何かを変えようとしなくて大丈夫です。\nまずは、今の自分に気づいてみましょう。",
        practices: ["1分リセット", "深い呼吸を3回", "今の状態をひとつ選ぶ"],
        question: "今の私は、どう感じている？",
        options: [
          { value: "tired", label: "疲れている" },
          { value: "anxious", label: "不安" },
          { value: "foggy", label: "ぼんやり" },
          { value: "rushed", label: "焦っている" },
          { value: "sleepy", label: "眠い" },
          { value: "calm", label: "少し落ち着いている" }
        ],
        completion: "少し止まれました。\n\nそれだけで、\nリズムは戻り始めています。",
        guidance: {
          opening: "何かを変えなくて大丈夫です。\n\n今日は、\n少し止まってみましょう。",
          closing: "少し止まれました。\n\nそれだけで十分です。"
        }
      },
      {
        day: 2,
        title: "呼吸",
        subtitle: "リズムは呼吸から始まる",
        intro: "今日は「呼吸」。\n\n呼吸を整えることは、\n自分の内側に帰ることです。",
        practices: ["1分呼吸", "吐く息を少し長くする", "ゆっくり5分歩く"],
        question: "今日の呼吸は、深いだろうか？",
        completion: "呼吸が戻ると、\n心も少し戻ります。\n\n急がなくて大丈夫です。",
        guidance: {
          opening: "呼吸は、\nいつもここにあります。\n\nそのリズムに\n戻ってみましょう。",
          closing: "呼吸は、\nあなたを支えています。"
        }
      },
      {
        day: 3,
        title: "身体",
        subtitle: "身体の声を聞く",
        intro: "今日は「身体」。\n\n身体はいつも、\nあなたに何かを伝えています。",
        practices: ["首と肩をゆっくり回す", "軽く伸びをする", "水を一杯飲む", "できればスクワット10回"],
        question: "私の身体は、何を求めている？",
        options: [
          { value: "rest", label: "休みたい" },
          { value: "move", label: "動きたい" },
          { value: "warm", label: "温まりたい" },
          { value: "sleep", label: "眠りたい" },
          { value: "deep-breath", label: "深く呼吸したい" }
        ],
        completion: "身体は敵ではありません。\n\nあなたを守ろうとしている、\n一番近い味方です。",
        guidance: {
          opening: "考える前に、\n\n身体の声を\n聞いてみましょう。",
          closing: "身体は、\n\nいつも答えを\n知っています。"
        }
      },
      {
        day: 4,
        title: "自然",
        subtitle: "大きなリズムとつながる",
        intro: "今日は「自然」。\n\n空を見上げてみましょう。\n風を感じてみましょう。\n\n自然は急ぎません。",
        practices: ["空を見る", "木や植物を見る", "スマホを少し置く", "できれば10分歩く"],
        question: "自然とつながっているだろうか？",
        specialNote: "ここから少しだけ、\n画面を閉じてみましょう。\n\n自然のリズムを感じる時間です。",
        completion: "自然の中にいると、\n自分も自然の一部だったことを\n思い出します。",
        guidance: {
          opening: "自然は急ぎません。\n\nあなたも、\n急がなくて大丈夫です。",
          closing: "自然とのつながりを\n\n思い出しました。"
        }
      },
      {
        day: 5,
        title: "感謝",
        subtitle: "心の向きを変える",
        intro: "今日は「感謝」。\n\n大きな感謝でなくて大丈夫です。\n小さな「よかった」を見つけてみましょう。",
        practices: ["今日よかったことを3つ選ぶ", "または自由に書く"],
        question: "今日、感謝できることは？",
        options: [
          { value: "slept-well", label: "よく眠れた" },
          { value: "meal", label: "ごはんがおいしかった" },
          { value: "kindness", label: "誰かがやさしかった" },
          { value: "sky", label: "空がきれいだった" },
          { value: "rested", label: "少し休めた" },
          { value: "breathed", label: "呼吸できた" }
        ],
        freeTextPlaceholder: "自由に書いても大丈夫です。",
        completion: "感謝は、\n無理に明るくなることではありません。\n\n今あるものに、\nそっと気づくことです。",
        guidance: {
          opening: "小さなことで\n大丈夫です。\n\n今日の恵みに\n気づいてみましょう。",
          closing: "感謝は、\n\n心をやさしく\n整えてくれます。"
        }
      },
      {
        day: 6,
        title: "静けさ",
        subtitle: "思考より深い場所へ",
        intro: "今日は「静けさ」。\n\n考えを止めようとしなくて大丈夫です。\nただ、少し静かな場所に戻ってみましょう。",
        practices: ["3分の静かな時間", "目を閉じる", "音を聞く", "呼吸を感じる"],
        question: "静かな私に出会えたか？",
        completion: "静けさは、\nどこか遠くにあるものではありません。\n\nあなたの中に、\n最初からありました。",
        guidance: {
          opening: "静けさは\n\n遠くではなく、\n\nすでにここにあります。",
          closing: "静かな自分に\n\n少し出会えました。"
        }
      },
      {
        day: 7,
        title: "私のリズム",
        subtitle: "これから続けたい小さな習慣",
        intro: "今日は「私のリズム」。\n\n7日間で何かを達成したのではなく、\n自分のリズムを思い出し始めました。",
        practices: ["朝：どんな始まりにしたい？", "昼：どんな戻り方が必要？", "夜：どんな終わり方が心地いい？"],
        question: "私が続けたい、小さな習慣は？",
        options: [
          { value: "morning", label: "☀️ 朝を整えたい" },
          { value: "day", label: "🌿 昼を整えたい" },
          { value: "night", label: "🌙 夜を整えたい" }
        ],
        completion: "7日間、お疲れさまでした。\n\nあなたは変わったのではなく、\n本来のリズムを思い出し始めました。\n\nこれからも、\n小さく整えていきましょう。",
        guidance: {
          opening: "正しいリズムではなく、\n\nあなた自身のリズムを\n\n感じてみましょう。",
          closing: "あなたのリズムを\n\n大切に育ててください。"
        }
      }
    ]
  },
  kr: {
    title: "7일간의\n작은 회복",
    subtitle: "하루 하나씩\n\n나를 회복하는 시간",
    entryEyebrow: "매일의 작은 리듬",
    entryBody: "애쓰지 않아도 괜찮습니다.\n\n오늘은,\n하나만 가볍게 정돈해 봅니다.",
    startCta: "시작하기",
    approxMinute: "약 1분",
    preparing: "조용히 준비하고 있습니다.",
    todayEyebrow: "오늘의 작은 회복",
    practicesLabel: "오늘의 작은 실천",
    reflectionLabel: "가만히 느끼기",
    enoughEyebrow: "오늘은 이만으로도 충분합니다",
    finishDayCta: "오늘의 작은 회복을 마무리하기",
    recoveryCta: "60초 회복으로",
    natureLeaveCta: "화면을 닫기",
    naturePauseMessage: "오늘은,\n스마트폰도 잠시 쉬게 해 주세요.\n\n10분 뒤에\n다시 돌아오면 됩니다.",
    nextCta: "다음",
    returnHomeCta: "다시 돌아오기",
    timerTopText: "지금 여기에서,\n60초만 호흡으로 돌아가 봅니다.",
    timerSubText: "서두르지 않아도 괜찮습니다.",
    audioStart: "자연음을 시작하기",
    audioOn: "자연음 ON",
    audioOff: "자연음 OFF",
    day7Title: "7일간,\n수고 많으셨습니다.",
    day7Body:
      "당신은\n새로운 사람이 된 것이 아닙니다.\n\n원래 가지고 있던 리듬을\n조금씩 기억하기 시작한 것입니다.\n\n회복은\n특별한 일이 아닙니다.\n\n하루의 작은 숨에서\n다시 시작할 수 있습니다.",
    day7Transition: "내일부터는\n당신의 하루 리듬을\n작게 정리해가세요.",
    dailyRhythmCta: "나의 Daily Rhythm으로",
    rhythmChoices: [
      { value: "morning", label: "☀️ 아침 리듬", followUp: "아침의 리듬을\n천천히 키워가 봅시다.", cta: "Morning Rhythm으로" },
      { value: "day", label: "🌿 낮 리듬", followUp: "낮의 리듬을\n천천히 키워가 봅시다.", cta: "Day Rhythm으로" },
      { value: "night", label: "🌙 밤 리듬", followUp: "밤의 리듬을\n천천히 키워가 봅시다.", cta: "Night Rhythm으로" }
    ],
    days: [
      {
        day: 1,
        title: "멈춤",
        subtitle: "지금의 나를 알아차리기",
        intro: "오늘은 '멈춤'입니다.\n\n무언가를 바꾸려 하지 않아도 괜찮습니다.\n먼저 지금의 나를 가만히 알아차려 봅니다.",
        practices: ["1분 리셋", "깊은 호흡 3번", "지금 상태 하나 고르기"],
        question: "지금의 나는 어떤가요?",
        options: [
          { value: "tired", label: "지쳐 있어요" },
          { value: "anxious", label: "불안해요" },
          { value: "foggy", label: "멍해요" },
          { value: "rushed", label: "조급해요" },
          { value: "sleepy", label: "졸려요" },
          { value: "calm", label: "조금 차분해요" }
        ],
        completion: "조금 멈출 수 있었습니다.\n\n그것만으로도,\n리듬은 돌아오기 시작합니다.",
        guidance: {
          opening: "무언가를 바꾸지 않아도 괜찮습니다.\n\n오늘은,\n잠시 멈춰 봅시다.",
          closing: "조금 멈출 수 있었습니다.\n\n그것만으로 충분합니다."
        }
      },
      {
        day: 2,
        title: "호흡",
        subtitle: "리듬은 호흡에서 시작됩니다",
        intro: "오늘은 '호흡'입니다.\n\n호흡을 고른다는 것은,\n내 안쪽으로 돌아오는 일입니다.",
        practices: ["1분 호흡", "내쉬는 숨을 조금 더 길게", "천천히 5분 걷기"],
        question: "오늘의 호흡은 충분히 깊은가요?",
        completion: "호흡이 돌아오면,\n마음도 조금씩 돌아옵니다.\n\n서두르지 않아도 괜찮습니다.",
        guidance: {
          opening: "호흡은,\n언제나 여기 있습니다.\n\n그 리듬으로\n다시 돌아가 봅시다.",
          closing: "호흡은,\n당신을 지탱해 주고 있습니다."
        }
      },
      {
        day: 3,
        title: "몸",
        subtitle: "몸의 목소리를 듣기",
        intro: "오늘은 '몸'입니다.\n\n몸은 언제나,\n당신에게 무언가를 전하고 있습니다.",
        practices: ["목과 어깨를 천천히 돌리기", "가볍게 기지개 켜기", "물 한 잔 마시기", "가능하면 스쿼트 10번"],
        question: "내 몸은 지금 무엇을 원하나요?",
        options: [
          { value: "rest", label: "쉬고 싶어요" },
          { value: "move", label: "움직이고 싶어요" },
          { value: "warm", label: "따뜻해지고 싶어요" },
          { value: "sleep", label: "잠들고 싶어요" },
          { value: "deep-breath", label: "깊게 숨 쉬고 싶어요" }
        ],
        completion: "몸은 적이 아닙니다.\n\n당신을 지키려는,\n가장 가까운 편입니다.",
        guidance: {
          opening: "생각하기 전에,\n\n몸의 목소리를\n들어 봅시다.",
          closing: "몸은,\n\n언제나 답을\n알고 있습니다."
        }
      },
      {
        day: 4,
        title: "자연",
        subtitle: "더 큰 리듬과 연결되기",
        intro: "오늘은 '자연'입니다.\n\n하늘을 올려다보고,\n바람을 느껴 봅시다.\n\n자연은 서두르지 않습니다.",
        practices: ["하늘 보기", "나무나 식물 보기", "잠시 스마트폰 내려놓기", "가능하면 10분 걷기"],
        question: "나는 자연과 연결되어 있나요?",
        specialNote: "여기서 잠깐,\n화면을 닫아 보세요.\n\n자연의 리듬을 느끼는 시간입니다.",
        completion: "자연 속에 있을 때,\n나도 자연의 일부였다는 것을\n다시 떠올리게 됩니다.",
        guidance: {
          opening: "자연은 서두르지 않습니다.\n\n당신도,\n서두르지 않아도 괜찮습니다.",
          closing: "자연과의 연결을\n\n조금 떠올렸습니다."
        }
      },
      {
        day: 5,
        title: "감사",
        subtitle: "마음의 방향을 바꾸기",
        intro: "오늘은 '감사'입니다.\n\n큰 감사가 아니어도 괜찮습니다.\n작은 '좋았던 것'을 찾아봅시다.",
        practices: ["오늘 좋았던 것 3가지 고르기", "또는 자유롭게 적기"],
        question: "오늘 감사할 수 있는 것은 무엇인가요?",
        options: [
          { value: "slept-well", label: "잘 잘 수 있었어요" },
          { value: "meal", label: "식사가 맛있었어요" },
          { value: "kindness", label: "누군가가 다정했어요" },
          { value: "sky", label: "하늘이 아름다웠어요" },
          { value: "rested", label: "조금 쉴 수 있었어요" },
          { value: "breathed", label: "숨을 쉴 수 있었어요" }
        ],
        freeTextPlaceholder: "자유롭게 적어도 괜찮습니다.",
        completion: "감사는,\n억지로 밝아지는 일이 아닙니다.\n\n지금 이미 있는 것을,\n살며시 알아차리는 일입니다.",
        guidance: {
          opening: "작은 것으로도\n괜찮습니다.\n\n오늘의 선물을\n가만히 알아차려 봅시다.",
          closing: "감사는,\n\n마음을 부드럽게\n정돈해 줍니다."
        }
      },
      {
        day: 6,
        title: "고요",
        subtitle: "생각보다 깊은 곳으로",
        intro: "오늘은 '고요'입니다.\n\n생각을 멈추려 애쓰지 않아도 괜찮습니다.\n그저 조금 더 조용한 자리로 돌아가 봅시다.",
        practices: ["3분의 조용한 시간", "눈 감기", "소리 듣기", "호흡 느끼기"],
        question: "조용한 나를 조금 만났나요?",
        completion: "고요함은,\n어딘가 먼 곳에 있는 것이 아닙니다.\n\n당신 안에,\n처음부터 있었습니다.",
        guidance: {
          opening: "고요함은\n\n멀리 있지 않고,\n\n이미 여기 있습니다.",
          closing: "조용한 나를\n\n조금 만났습니다."
        }
      },
      {
        day: 7,
        title: "나의 리듬",
        subtitle: "이제 이어가고 싶은 작은 습관",
        intro: "오늘은 '나의 리듬'입니다.\n\n7일 동안 무언가를 달성한 것이 아니라,\n내 리듬을 다시 떠올리기 시작했습니다.",
        practices: ["아침: 어떤 시작이 좋을까요?", "낮: 어떤 회복이 필요할까요?", "밤: 어떤 마무리가 편안할까요?"],
        question: "내가 이어가고 싶은 작은 습관은 무엇인가요?",
        options: [
          { value: "morning", label: "☀️ 아침을 정돈하고 싶어요" },
          { value: "day", label: "🌿 낮을 정돈하고 싶어요" },
          { value: "night", label: "🌙 밤을 정돈하고 싶어요" }
        ],
        completion: "7일 동안 수고 많으셨습니다.\n\n당신은 달라진 것이 아니라,\n본래의 리듬을 다시 떠올리기 시작했습니다.\n\n앞으로도,\n작게 정돈해 갑시다.",
        guidance: {
          opening: "정답 같은 리듬이 아니라,\n\n당신 자신의 리듬을\n\n느껴 봅시다.",
          closing: "당신의 리듬을\n\n소중히 길러 주세요."
        }
      }
    ]
  },
  en: {
    title: "7 Days\nof Recovery",
    subtitle: "One day at a time\n\nReturn to yourself",
    entryEyebrow: "A small rhythm for each day",
    entryBody: "You do not need to try hard.\n\nToday,\nlet us gently restore just one thing.",
    startCta: "Begin",
    approxMinute: "About 1 minute",
    preparing: "Preparing quietly.",
    todayEyebrow: "Today’s small recovery",
    practicesLabel: "A small practice for today",
    reflectionLabel: "Notice gently",
    enoughEyebrow: "This is enough for today",
    finishDayCta: "Complete today’s small recovery",
    recoveryCta: "Start 60-second recovery",
    natureLeaveCta: "Close the screen",
    naturePauseMessage: "Today,\nlet your phone rest a little too.\n\nCome back\nin about 10 minutes.",
    nextCta: "Next",
    returnHomeCta: "Return gently",
    timerTopText: "Right here,\nlet us return to the breath for 60 seconds.",
    timerSubText: "There is no need to rush.",
    audioStart: "Start nature sound",
    audioOn: "Nature sound ON",
    audioOff: "Nature sound OFF",
    day7Title: "Thank you\nfor these 7 days.",
    day7Body:
      "You have not become someone new.\n\nYou have simply begun to remember\nthe rhythm you already had within you.\n\nRecovery is not something special.\n\nIt can begin again\nwith one small breath in your day.",
    day7Transition: "From tomorrow,\nbegin gently caring for\nthe rhythm of your day.",
    dailyRhythmCta: "Go to My Daily Rhythm",
    rhythmChoices: [
      { value: "morning", label: "☀️ Morning Rhythm", followUp: "Let us gently grow\nyour morning rhythm.", cta: "Morning Rhythm" },
      { value: "day", label: "🌿 Day Rhythm", followUp: "Let us gently grow\nyour daytime rhythm.", cta: "Day Rhythm" },
      { value: "night", label: "🌙 Night Rhythm", followUp: "Let us gently grow\nyour night rhythm.", cta: "Night Rhythm" }
    ],
    days: [
      {
        day: 1,
        title: "Pause",
        subtitle: "Notice yourself as you are",
        intro: "Today is “Pause.”\n\nYou do not need to change anything.\nLet us first notice how you are right now.",
        practices: ["1-minute reset", "Take 3 deep breaths", "Choose one word for your current state"],
        question: "How do I feel right now?",
        options: [
          { value: "tired", label: "Tired" },
          { value: "anxious", label: "Anxious" },
          { value: "foggy", label: "Foggy" },
          { value: "rushed", label: "Rushed" },
          { value: "sleepy", label: "Sleepy" },
          { value: "calm", label: "A little calm" }
        ],
        completion: "You paused a little.\n\nThat alone is enough.\nYour rhythm has already begun to return.",
        guidance: {
          opening: "You do not need to change anything.\n\nToday,\nlet us simply pause.",
          closing: "You paused a little.\n\nThat alone is enough."
        }
      },
      {
        day: 2,
        title: "Breath",
        subtitle: "Rhythm begins with the breath",
        intro: "Today is “Breath.”\n\nTo steady your breath\nis to return to yourself.",
        practices: ["1 minute of breathing", "Make the exhale a little longer", "Walk slowly for 5 minutes"],
        question: "Does my breath feel deep today?",
        completion: "When the breath returns,\npart of the heart returns too.\n\nThere is no need to rush.",
        guidance: {
          opening: "The breath\nis always here.\n\nLet us return\nto that rhythm.",
          closing: "The breath\nis supporting you."
        }
      },
      {
        day: 3,
        title: "Body",
        subtitle: "Listen to the voice of the body",
        intro: "Today is “Body.”\n\nYour body is always\ntrying to tell you something.",
        practices: ["Roll your neck and shoulders slowly", "Stretch gently", "Drink a glass of water", "If you can, do 10 squats"],
        question: "What is my body asking for?",
        options: [
          { value: "rest", label: "Rest" },
          { value: "move", label: "Movement" },
          { value: "warm", label: "Warmth" },
          { value: "sleep", label: "Sleep" },
          { value: "deep-breath", label: "A deeper breath" }
        ],
        completion: "The body is not your enemy.\n\nIt is your closest ally,\ntrying to protect you.",
        guidance: {
          opening: "Before thinking,\n\nlet us listen\nto the body.",
          closing: "The body\n\nalready knows\nthe answer."
        }
      },
      {
        day: 4,
        title: "Nature",
        subtitle: "Reconnect with a larger rhythm",
        intro: "Today is “Nature.”\n\nLook up at the sky.\nFeel the wind.\n\nNature does not rush.",
        practices: ["Look at the sky", "Look at a tree or plant", "Put your phone down for a moment", "If you can, walk for 10 minutes"],
        question: "Am I still connected to nature?",
        specialNote: "From here,\nlet us close the screen for a while.\n\nThis is time to feel the rhythm of nature.",
        completion: "When we are with nature,\nwe remember that we, too,\nare part of it.",
        guidance: {
          opening: "Nature does not rush.\n\nYou do not need\nto rush either.",
          closing: "You remembered\nyour connection with nature."
        }
      },
      {
        day: 5,
        title: "Gratitude",
        subtitle: "Gently shift the direction of the heart",
        intro: "Today is “Gratitude.”\n\nIt does not need to be something big.\nLet us notice one small good thing.",
        practices: ["Choose 3 good things from today", "Or write freely"],
        question: "What can I be grateful for today?",
        options: [
          { value: "slept-well", label: "I slept well" },
          { value: "meal", label: "My food tasted good" },
          { value: "kindness", label: "Someone was kind" },
          { value: "sky", label: "The sky was beautiful" },
          { value: "rested", label: "I could rest a little" },
          { value: "breathed", label: "I could breathe" }
        ],
        freeTextPlaceholder: "You may also write freely.",
        completion: "Gratitude is not about forcing brightness.\n\nIt is about gently noticing\nwhat is already here.",
        guidance: {
          opening: "Small things are enough.\n\nLet us notice\ntoday’s gift.",
          closing: "Gratitude\n\ngently steadies\nthe heart."
        }
      },
      {
        day: 6,
        title: "Stillness",
        subtitle: "Return to a place deeper than thought",
        intro: "Today is “Stillness.”\n\nYou do not need to stop your thoughts.\nJust return to a quieter place for a moment.",
        practices: ["3 minutes of quiet time", "Close your eyes", "Listen to sound", "Feel the breath"],
        question: "Did I meet a quieter part of myself?",
        completion: "Stillness is not far away.\n\nIt has been within you\nfrom the beginning.",
        guidance: {
          opening: "Stillness\n\nis not far away.\n\nIt is already here.",
          closing: "You met\na quieter self,\nif only a little."
        }
      },
      {
        day: 7,
        title: "My Rhythm",
        subtitle: "A small habit I want to continue",
        intro: "Today is “My Rhythm.”\n\nThese 7 days were not about achieving something.\nThey were about beginning to remember your rhythm.",
        practices: ["Morning: what kind of beginning do I want?", "Daytime: how do I want to return?", "Night: what kind of ending feels gentle?"],
        question: "What small habit would I like to keep?",
        options: [
          { value: "morning", label: "☀️ I want to steady my morning" },
          { value: "day", label: "🌿 I want to steady my daytime" },
          { value: "night", label: "🌙 I want to steady my night" }
        ],
        completion: "Thank you for these 7 days.\n\nYou did not become someone else.\nYou began to remember your natural rhythm.\n\nLet us keep tending it gently.",
        guidance: {
          opening: "Not the right rhythm,\n\nbut your own rhythm.\n\nLet us feel that.",
          closing: "Please keep\ngrowing your rhythm\nwith care."
        }
      }
    ]
  }
};

export const RHYTHM_JOURNEY_DAY_COUNT = rhythmJourneyContent.jp.days.length;
export const rhythmJourneyDays = rhythmJourneyContent.jp.days;
export const journeyGuidanceMap = Object.fromEntries(
  rhythmJourneyContent.jp.days.map((day) => [day.day, { openingMessage: day.guidance.opening, closingMessage: day.guidance.closing }])
) as Record<number, { openingMessage: string; closingMessage: string }>;

export function getRhythmJourneyContent(language: Language): RhythmJourneyLocaleContent {
  return rhythmJourneyContent[language] ?? rhythmJourneyContent.jp;
}

export function getRhythmJourneyDay(language: Language, day: number) {
  const content = getRhythmJourneyContent(language);

  return content.days.find((item) => item.day === clampRhythmJourneyDay(day)) ?? content.days[0];
}

export function getRhythmJourneyGuidance(language: Language, day: number) {
  return getRhythmJourneyDay(language, day).guidance;
}

export function resolveJourneyOptionValue(day: number, rawValue: string) {
  if (!rawValue) {
    return "";
  }

  const dayIndex = clampRhythmJourneyDay(day) - 1;

  for (const locale of Object.values(rhythmJourneyContent)) {
    const options = locale.days[dayIndex]?.options ?? [];
    const match = options.find((option) => option.value === rawValue || option.label === rawValue);

    if (match) {
      return match.value;
    }
  }

  return rawValue;
}

export function getRhythmJourneyChoice(language: Language, value: string) {
  const content = getRhythmJourneyContent(language);

  return content.rhythmChoices.find((item) => item.value === value);
}

export function clampRhythmJourneyDay(day: number) {
  if (!Number.isFinite(day)) {
    return 1;
  }

  return Math.min(Math.max(Math.floor(day), 1), RHYTHM_JOURNEY_DAY_COUNT);
}

export function readRhythmJourneyProgress(): RhythmJourneyProgress {
  if (typeof window === "undefined") {
    return {
      journeyStarted: false,
      currentDay: 1,
      completedDays: [],
      selectedOptions: {}
    };
  }

  const stored = window.localStorage.getItem(RHYTHM_JOURNEY_STORAGE_KEY);

  if (!stored) {
    return {
      journeyStarted: false,
      currentDay: 1,
      completedDays: [],
      selectedOptions: {}
    };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<RhythmJourneyProgress>;
    const completedDays = Array.isArray(parsed.completedDays)
      ? Array.from(new Set(parsed.completedDays.filter((value) => Number.isInteger(value) && value >= 1 && value <= RHYTHM_JOURNEY_DAY_COUNT))).sort((a, b) => a - b)
      : [];

    const selectedOptions =
      parsed.selectedOptions && typeof parsed.selectedOptions === "object"
        ? Object.fromEntries(Object.entries(parsed.selectedOptions).filter((entry): entry is [string, string] => typeof entry[1] === "string"))
        : {};

    return {
      journeyStarted: Boolean(parsed.journeyStarted),
      currentDay: clampRhythmJourneyDay(parsed.currentDay ?? 1),
      completedDays,
      selectedOptions
    };
  } catch (_error) {
    window.localStorage.removeItem(RHYTHM_JOURNEY_STORAGE_KEY);
    return {
      journeyStarted: false,
      currentDay: 1,
      completedDays: [],
      selectedOptions: {}
    };
  }
}

export function writeRhythmJourneyProgress(progress: RhythmJourneyProgress) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(RHYTHM_JOURNEY_STORAGE_KEY, JSON.stringify(progress));
}
