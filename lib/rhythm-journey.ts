export const RHYTHM_JOURNEY_STORAGE_KEY = "meisoulife_rhythm_journey_progress";

export type RhythmJourneyProgress = {
  currentDay: number;
  completedDays: number[];
  selectedOptions: Record<string, string>;
};

export type RhythmJourneyDay = {
  day: number;
  title: string;
  subtitle: string;
  intro: string;
  practices: string[];
  question: string;
  options?: string[];
  specialNote?: string;
  completion: string;
  freeTextPlaceholder?: string;
};

export const rhythmJourneyDays: RhythmJourneyDay[] = [
  {
    day: 1,
    title: "止まる",
    subtitle: "今の自分に気づく",
    intro:
      "今日は「止まる」。\n\n何かを変えようとしなくて大丈夫です。\nまずは、今の自分に気づいてみましょう。",
    practices: ["1分リセット", "深い呼吸を3回", "今の状態をひとつ選ぶ"],
    question: "今の私は、どう感じている？",
    options: ["疲れている", "不安", "ぼんやり", "焦っている", "眠い", "少し落ち着いている"],
    completion: "少し止まれました。\n\nそれだけで、\nリズムは戻り始めています。"
  },
  {
    day: 2,
    title: "呼吸",
    subtitle: "リズムは呼吸から始まる",
    intro:
      "今日は「呼吸」。\n\n呼吸を整えることは、\n自分の内側に帰ることです。",
    practices: ["1分呼吸", "吐く息を少し長くする", "ゆっくり5分歩く"],
    question: "今日の呼吸は、深いだろうか？",
    completion: "呼吸が戻ると、\n心も少し戻ります。\n\n急がなくて大丈夫です。"
  },
  {
    day: 3,
    title: "身体",
    subtitle: "身体の声を聞く",
    intro:
      "今日は「身体」。\n\n身体はいつも、\nあなたに何かを伝えています。",
    practices: ["首と肩をゆっくり回す", "軽く伸びをする", "水を一杯飲む", "できればスクワット10回"],
    question: "私の身体は、何を求めている？",
    options: ["休みたい", "動きたい", "温まりたい", "眠りたい", "深く呼吸したい"],
    completion:
      "身体は敵ではありません。\n\nあなたを守ろうとしている、\n一番近い味方です。"
  },
  {
    day: 4,
    title: "自然",
    subtitle: "大きなリズムとつながる",
    intro:
      "今日は「自然」。\n\n空を見上げてみましょう。\n風を感じてみましょう。\n\n自然は急ぎません。",
    practices: ["空を見る", "木や植物を見る", "スマホを少し置く", "できれば10分歩く"],
    question: "自然とつながっているだろうか？",
    specialNote: "ここから少しだけ、\n画面を閉じてみましょう。\n\n自然のリズムを感じる時間です。",
    completion:
      "自然の中にいると、\n自分も自然の一部だったことを\n思い出します。"
  },
  {
    day: 5,
    title: "感謝",
    subtitle: "心の向きを変える",
    intro:
      "今日は「感謝」。\n\n大きな感謝でなくて大丈夫です。\n小さな「よかった」を見つけてみましょう。",
    practices: ["今日よかったことを3つ選ぶ", "または自由に書く"],
    question: "今日、感謝できることは？",
    options: ["よく眠れた", "ごはんがおいしかった", "誰かがやさしかった", "空がきれいだった", "少し休めた", "呼吸できた"],
    freeTextPlaceholder: "自由に書いても大丈夫です。",
    completion:
      "感謝は、\n無理に明るくなることではありません。\n\n今あるものに、\nそっと気づくことです。"
  },
  {
    day: 6,
    title: "静けさ",
    subtitle: "思考より深い場所へ",
    intro:
      "今日は「静けさ」。\n\n考えを止めようとしなくて大丈夫です。\nただ、少し静かな場所に戻ってみましょう。",
    practices: ["3分の静かな時間", "目を閉じる", "音を聞く", "呼吸を感じる"],
    question: "静かな私に出会えたか？",
    completion:
      "静けさは、\nどこか遠くにあるものではありません。\n\nあなたの中に、\n最初からありました。"
  },
  {
    day: 7,
    title: "私のリズム",
    subtitle: "これから続けたい小さな習慣",
    intro:
      "今日は「私のリズム」。\n\n7日間で何かを達成したのではなく、\n自分のリズムを思い出し始めました。",
    practices: ["朝：どんな始まりにしたい？", "昼：どんな戻り方が必要？", "夜：どんな終わり方が心地いい？"],
    question: "私が続けたい、小さな習慣は？",
    options: ["☀️ 朝を整えたい", "🌿 昼を整えたい", "🌙 夜を整えたい"],
    completion:
      "7日間、お疲れさまでした。\n\nあなたは変わったのではなく、\n本来のリズムを思い出し始めました。\n\nこれからも、\n小さく整えていきましょう。"
  }
];

export function clampRhythmJourneyDay(day: number) {
  if (!Number.isFinite(day)) {
    return 1;
  }

  return Math.min(Math.max(Math.floor(day), 1), rhythmJourneyDays.length);
}

export function readRhythmJourneyProgress(): RhythmJourneyProgress {
  if (typeof window === "undefined") {
    return {
      currentDay: 1,
      completedDays: [],
      selectedOptions: {}
    };
  }

  const stored = window.localStorage.getItem(RHYTHM_JOURNEY_STORAGE_KEY);

  if (!stored) {
    return {
      currentDay: 1,
      completedDays: [],
      selectedOptions: {}
    };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<RhythmJourneyProgress>;
    const completedDays = Array.isArray(parsed.completedDays)
      ? Array.from(new Set(parsed.completedDays.filter((value) => Number.isInteger(value) && value >= 1 && value <= rhythmJourneyDays.length))).sort((a, b) => a - b)
      : [];

    const selectedOptions =
      parsed.selectedOptions && typeof parsed.selectedOptions === "object" ? Object.fromEntries(
        Object.entries(parsed.selectedOptions).filter((entry): entry is [string, string] => typeof entry[1] === "string")
      ) : {};

    return {
      currentDay: clampRhythmJourneyDay(parsed.currentDay ?? 1),
      completedDays,
      selectedOptions
    };
  } catch (_error) {
    window.localStorage.removeItem(RHYTHM_JOURNEY_STORAGE_KEY);
    return {
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
