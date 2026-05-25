"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "jp" | "kr" | "en";

export const LANGUAGE_STORAGE_KEY = "meisoulife_language";

export const languageButtons: { key: Language; label: string }[] = [
  { key: "jp", label: "JP" },
  { key: "kr", label: "KR" },
  { key: "en", label: "EN" }
];

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

type LocaleRecord<T = unknown> = Partial<Record<Language, T>>;

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeLocaleValue<T>(fallback: T, localized: unknown): T {
  if (localized === undefined) {
    return fallback;
  }

  if (Array.isArray(fallback)) {
    return (Array.isArray(localized) ? localized : fallback) as T;
  }

  if (isPlainObject(fallback) && isPlainObject(localized)) {
    const result: Record<string, unknown> = { ...fallback };

    for (const key of Object.keys(localized)) {
      const localizedValue = localized[key];
      const fallbackValue = result[key];

      if (fallbackValue === undefined) {
        result[key] = localizedValue;
        continue;
      }

      result[key] = mergeLocaleValue(fallbackValue, localizedValue);
    }

    return result as T;
  }

  return localized as T;
}

export function getLocaleCopy<T extends LocaleRecord>(copy: T, language: Language): NonNullable<T["en"] | T["jp"] | T["kr"]> {
  const fallback = (copy.en ?? copy.jp ?? copy.kr) as NonNullable<T["en"] | T["jp"] | T["kr"]>;

  if (!fallback) {
    throw new Error("Locale copy requires at least one language entry.");
  }

  return mergeLocaleValue(fallback, copy[language]) as NonNullable<T["en"] | T["jp"] | T["kr"]>;
}

function getHtmlLanguage(language: Language) {
  if (language === "kr") {
    return "ko";
  }

  if (language === "en") {
    return "en";
  }

  return "ja";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("jp");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;

    if (savedLanguage === "jp" || savedLanguage === "kr" || savedLanguage === "en") {
      setLanguageState(savedLanguage);
      document.documentElement.lang = getHtmlLanguage(savedLanguage);
      return;
    }

    document.documentElement.lang = "ja";
  }, []);

  useEffect(() => {
    const syncLanguage = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY) {
        return;
      }

      const nextLanguage = event.newValue as Language | null;

      if (nextLanguage === "jp" || nextLanguage === "kr" || nextLanguage === "en") {
        setLanguageState(nextLanguage);
        document.documentElement.lang = getHtmlLanguage(nextLanguage);
      }
    };

    window.addEventListener("storage", syncLanguage);

    return () => {
      window.removeEventListener("storage", syncLanguage);
    };
  }, []);

  function setLanguage(language: Language) {
    setLanguageState(language);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = getHtmlLanguage(language);
  }

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}

export function useLocaleCopy<T extends LocaleRecord>(copy: T) {
  const { language } = useLanguage();

  return useMemo(() => getLocaleCopy(copy, language), [copy, language]);
}

export const siteCopy = {
  jp: {
    header: {
      brand: "瞑想life",
      login: "ログイン",
      freeJoin: "無料参加",
      myPage: "マイページ",
      myProgram: "マイプログラム",
      logout: "ログアウト",
      languageSettings: "言語設定",
      customerSupport: "サポート",
      billingMembership: "決済とメンバーシップ",
      menu: "メニュー",
      close: "閉じる",
      mobileGuestTabs: [
        { href: "/", label: "ホーム" },
        { href: "/challenge", label: "7日チャレンジ" },
        { href: "/pricing", label: "料金" },
        { href: "/community", label: "コミュニティ" },
        { href: "/leaders", label: "リーダー成長" }
      ],
      mobileMemberTabs: [
        { href: "/", label: "ホーム" },
        { href: "/program/basic", label: "マイプログラム" },
        { href: "/pricing", label: "料金" },
        { href: "/community", label: "コミュニティ" },
        { href: "/member", label: "マイページ" }
      ],
      mobileGuestMenu: [
        { href: "/", label: "ホーム" },
        { href: "/challenge", label: "7日チャレンジ" },
        { href: "/pricing", label: "料金" },
        { href: "/community", label: "コミュニティ" },
        { href: "/leaders", label: "リーダー成長" }
      ],
      mobileMemberMenu: [
        { href: "/", label: "ホーム" },
        { href: "/pricing", label: "料金" },
        { href: "/community", label: "コミュニティ" }
      ],
      nav: [
        { href: "/", label: "ホーム" },
        { href: "/challenge", label: "7日チャレンジ" },
        { href: "/pricing", label: "料金" },
        { href: "/community", label: "コミュニティ" },
        { href: "/leaders", label: "リーダー成長" }
      ],
      mobileMenu: [
        { href: "/", label: "ホーム" },
        { href: "/#one-minute-experience", label: "1分リカバリー" },
        { href: "/#ai-rhythm-coach", label: "AIコーチ" },
        { href: "/pricing", label: "料金" },
        { href: "/program/basic", label: "プログラム" },
        { href: "/community", label: "コミュニティ" },
        { href: "/challenge", label: "無料で始める" }
      ]
    },
    community: {
      eyebrow: "COMMUNITY",
      headline: "ここは、がんばる場所ではありません。毎日、共に目覚め直す場所です。",
      subcopy:
        "1分の静けさを一人で終わらせず、7日チャレンジとコミュニティのリズムで自然につなげます。",
      lineCommunityTitle: "7日間、共に始める入口",
      lineCommunityDescription:
        "朝のリマインド、夜の声かけ、7日チャレンジ案内が届く無料コミュニティです。",
      lineCommunityCTA: "コミュニティに参加する",
      rhythmTitle: "無料参加から会員リズムへ",
      rhythmDescription:
        "ひとりの回復を習慣に変え、共に生きるリズムへ育てる基本会員の入口です。",
      rhythmCTA: "Basic会員へ進む",
      supportTitle: "共生人材への入口",
      supportDescription:
        "共に目覚めるリズムを支える人へ。リーダー成長の入口につながる案内です。",
      supportCTA: "リーダーフォームを見る",
      memberCommunityTitle: "共に続けるコミュニティの流れ",
      memberCommunityDescription:
        "毎日のチェックイン、今日の小さな前進、質問、イベント、リーダー成長まで、自然に続く導線を整えています。",
      channels: ["Daily Check-in", "Wins Today", "Questions", "Events", "Leaders"]
    },
    leaders: {
      eyebrow: "LEADER GROWTH",
      headline: "実践からリーダー成長へ",
      subcopy:
        "瞑想lifeのリーダー成長は、参加で終わらず、継続、貢献、信頼を通して共に目覚めるリズムを支える人を育てる構造です。",
      stage1Label: "STAGE 1",
      stage1Title: "一般会員",
      stage1Description: "まずは自分の心を整え、毎日の実践を安定させる段階です。",
      stage2Label: "STAGE 2",
      stage2Title: "実践会員",
      stage2Description: "自分のリズムを保ちながら、小さな実践を周りと分かち合い始める段階です。",
      stage3Label: "STAGE 3",
      stage3Title: "共生リーダー",
      stage3Description: "共に目覚める場をつくり、人々の実践と成長を支えるリーダー段階です。",
      ctaTitle: "共に成長するリーダーへ",
      ctaDescription:
        "瞑想lifeは一人で成長する道ではなく、共に目覚める文化をつくる旅です。",
      ctaButton: "リーダー成長を始める",
      promotionRule: "Promotion Rule",
      promotionTitle: "リーダー候補になる条件",
      paidDaysLabel: "有料会員",
      checkInCountLabel: "チェックイン",
      helpfulCommentsLabel: "助け合いコメント",
      currentLabel: "現在",
      daysTargetSuffix: "日以上",
      daysValueSuffix: "日",
      countTargetSuffix: "回以上",
      countValueSuffix: "回",
      invitationLabel: "Invitation",
      invitationReadyTitle: "リーダープログラムに招待されました",
      invitationProgressTitle: "リーダー候補までの進み具合",
      invitationReadyDescription:
        "Supabaseの実データをもとに判定し、条件を満たした状態ではダッシュボードにも自動表示されます。",
      invitationProgressDescription:
        "Supabaseの実データをもとに、あとどこを積み上げればよいかが見えるようにしています。",
      dashboardButton: "ダッシュボードで確認",
      communityButton: "コミュニティ導線を見る",
      leaderFormButton: "リーダーフォームへ",
      visionEyebrow: "2030 Vision",
      visionTitle: "2030年、10万人の共生人材へ",
      visionDescription:
        "瞑想lifeのリーダーとは、人を集める人ではありません。毎日、自分に戻り、周りを明るくし、共に目覚めるリズムを支える人です。一人の実践が、家庭を変え、職場を変え、地域を変え、地球を変える。その静かな流れを、2030年までに10万人へ広げていきます。"
    },
    footer: {
      brand: "瞑想life",
      line1: "回復から共生へ。共生から地球経営へ。",
      line2: "瞑想life — 回復から共生へ。共生から地球経営へ。",
      links: [
        { href: "/challenge", label: "無料参加" },
        { href: "/pricing", label: "料金" },
        { href: "/community", label: "コミュニティ" },
        { href: "/leaders", label: "リーダー成長" },
        { href: "/retreats", label: "リトリート" }
      ]
    },
    lineInvite: {
      title: "このリズムを、ひとりで終わらせない。",
      subtitle: "毎日の小さな実践を、共に続けるためのLINEコミュニティです。",
      morning: "Morning — 1分だけ呼吸に戻る",
      evening: "Evening — 一日を静かに振り返る",
      button: "LINEで共に続ける",
      note: "通知はいつでもオフにできます。静かに参加できます。",
      afterMessage: "明日も、この1分から始めましょう。",
      toast: "LINEでつながりました。明日もここに戻ってきてください。"
    },
    modal: {
      eyebrow: "1分瞑想",
      title: "今ここで、呼吸に戻りましょう",
      endButton: "1分を終える",
      completeTitle: "今日、あなたは自分に戻りました。",
      completionMessage: "おつかれさま。\n今の静けさを、\n少しだけ感じてください。",
      completionReturnText: "また戻ってきてください。",
      completeBody: "この小さな呼吸が、共に目覚めるリズムの始まりです。",
      durationTexts: {
        sixty: {
          title: "今ここで、60秒だけ呼吸に戻りましょう",
          completionBody: "この小さな60秒が、共に目覚めるリズムの始まりです。",
          completionMoments: [
            "今日も、自分に戻る60秒をありがとう。",
            "静けさは、いつもあなたの中にあります。"
          ]
        },
        threeMinutes: {
          title: "今ここで、3分間、ゆっくり呼吸のリズムに戻りましょう",
          completionBody: "この静かな3分が、共に目覚めるリズムの始まりです。",
          completionMoments: [
            "今日も、自分に戻る3分をありがとう。",
            "静けさは、いつもあなたの中にあります。"
          ]
        }
      },
      completionMoments: [
        "今日も、自分に戻る60秒をありがとう。",
        "静けさは、いつもあなたの中にあります。"
      ],
      breatheAgain: "もう一度呼吸する",
      tellAi: "AIに今の状態を伝える",
      soundOn: "自然音 ON",
      soundOff: "自然音 OFF",
      vibrationOn: "振動を入れる",
      vibrationOff: "振動を消す",
      natureLabel: "自然のリズムとともに呼吸する",
      natureMicrocopy: "疲れたら、\nここに戻ってきてください。",
      phaseLabels: {
        inhale: "息を吸って",
        hold: "そのまま",
        exhale: "息を吐いて"
      },
      reflectionQuestion: "今の感じはどうですか？",
      breathingGuides: [
        { text: "吸って… 4秒", duration: 4000 },
        { text: "止めて… 3秒", duration: 3000 },
        { text: "吐いて… 5秒", duration: 5000 }
      ],
      reflections: [
        {
          key: "calm",
          label: "少し落ち着いた",
          message: "その感覚を、明日も少しだけ続けてみましょう。",
          ctaLabel: "明日もここに戻る"
        },
        {
          key: "deepen",
          label: "もう少し深めたい",
          message: "このリズムを、もう少し深く育ててみませんか？",
          ctaLabel: "深めるリズムを見る"
        },
        {
          key: "together",
          label: "ひとりでは続けにくい",
          message: "ひとりで続けるのが難しいとき、共に戻れる場所があります。",
          ctaLabel: "LINEで共に続ける"
        }
      ]
    },
    home: {
      heroEyebrow: "Coexistence Meditation Ecosystem",
      heroTitle: "今、共に目覚めるリズムを始めませんか？",
      heroDescription:
        "瞑想lifeは、ひとりで頑張る場所ではありません。毎日の小さな実践を通して、心・身体・関係・暮らしを整え、共に目覚めて生きるための共生リズム・プラットフォームです。",
      heroPrimary: "60秒リズムを始める",
      heroSecondary: "メンバーになる",
      imageAlt: "静かな朝の瞑想風景",
      rhythmExperience: {
        eyebrow: "今日の共生リズム",
        title: "朝・昼・夜、戻る時間をひとつずつ",
        description: "大きく変えようとしなくて大丈夫です。同じ場所に戻る時間を一日に三つ持つだけで、心と身体の輪郭は静かに整っていきます。",
        cards: [
          {
            key: "morning",
            eyebrow: "Morning 3 min",
            title: "朝の3分",
            description: "起きたばかりの呼吸と身体感覚を整えて、一日の始まりを静かにそろえます。",
            button: "朝のリズムを始める"
          },
          {
            key: "daytime",
            eyebrow: "Daytime 1 min",
            title: "昼の1分",
            description: "忙しさの中で一度だけ立ち止まり、自分の中心に戻る短い時間です。",
            button: "60秒リズムを始める"
          },
          {
            key: "night",
            eyebrow: "Night 3 min",
            title: "夜の3分",
            description: "一日の緊張をほどき、眠りの前に心と身体をやさしく閉じていきます。",
            button: "夜のリズムを始める"
          }
        ]
      },
      todayRhythmEyebrow: "Today's Rhythm",
      todayRhythmNotStarted: "まだ始まっていない方も、今日は1分だけ自分に戻るところから始められます。",
      todayRhythmCompletedTitle: "このリズムを続けています",
      todayRhythmCompletedDescription: "7日間を越えても、静けさは毎日の中でやさしく続いていきます。",
      todayRhythmButton: "今日のリズムを始める",
      returnEyebrow: "戻る場所",
      returnTitle: "毎日同じ場所に戻るだけで、リズムは自然に整います",
      returnReturning: "おかえりなさい。今日も1分だけ整えましょう",
      returnFirst: "慌ただしい日でも、戻る場所がひとつあるだけで呼吸は静かに整っていきます。",
      returnStreak: "{count}日つづいています",
      returnStart: "今日から静かに始められます",
      returnButton: "今日の1分を始める",
      rhythmSignals: {
        completed: "今日のリズムは整いました",
        notCompleted: "今日のリズムはまだ始まっていません",
        streak: "継続 {count}日",
        practicingNow: "今、共に実践中 {count}人",
        waiting: "The rhythm is waiting for you.",
        milestones: ["3日", "7日", "30日"],
        anchors: {
          morning: "今は朝のリズム",
          daytime: "今は昼のリズム",
          night: "今は夜のリズム"
        }
      },
      dailyRhythmEyebrow: "Daily Rhythm",
      dailyRhythmBadge: "Local",
      checkInTitle: "今日の心チェックイン",
      checkInDescription: "今の気分をひとつ選ぶだけで大丈夫です。小さな記録が、毎日のリズムを整えます。",
      checkInReactions: {
        "😀": "いいですね。その明るさを、今日の小さな行動にのせてみましょう。",
        "🙂": "その穏やかさを大切に。今日は無理せず、静かに整えていきましょう。",
        "😐": "何も感じない日もあります。それでも、1分だけ呼吸に戻れば十分です。",
        "😔": "少し疲れているのかもしれません。今日はがんばるより、休むリズムを選びましょう。",
        "😣": "つらさに気づけたことが、もう回復の始まりです。まずは深く吐いてみましょう。"
      },
      liveEyebrow: "Live Together",
      liveBadge: "Live-ready",
      liveTitle: "今、18人が一緒に瞑想中",
      liveDescription: "静かなつながりが、世界のあちこちで同時に育っています。",
      challengeEyebrow: "Challenge",
      challengeTitle: "7日間、共に始める",
      challengeDescription:
        "1分の静けさを7日間重ねると、呼吸、感情、睡眠、感謝、関係、集中、人生の方向性までゆっくり整い始めます。",
      challengeProgress: "Day 1 / 7",
      challengeButton: "7日間、共に始める",
      sevenDay: {
        eyebrow: "7-Day Rhythm",
        title: "7日間、共に目覚めるリズム",
        description: "個人の回復を、共に生きる力へ。1日ごとの小さな変化が、生活の質と周りへの光を育てます。",
        continuationTitle: "このリズムを、ひとりで終わらせない。",
        continuationDescription: "瞑想lifeメンバーとして続ける。"
      },
      cards: [
        {
          eyebrow: "Why now",
          title: "今、心を整えることが共生の土台になる",
          description:
            "情報と刺激が強い時代だからこそ、自分を落ち着かせる力が人との関わり方を変えます。朝3分の静けさは、判断力、睡眠、感情の回復力、そしてやさしい共同体づくりの土台になります。"
        },
        {
          eyebrow: "Challenge",
          title: "7日間で、自分を責めない習慣をつくる",
          description: "毎朝3分の音声、LINEリマインド、簡単な達成記録で、忙しい人でも無理なく始められます。"
        },
        {
          eyebrow: "AI Coach",
          title: "乱れた瞬間に、ひとりにしない",
          description: "疲れた、不安、眠れない。そんな日のために、3分で呼吸と気持ちを整えるAIコーチを用意しました。"
        }
      ],
      founder: {
        eyebrow: "Founder Philosophy",
        title: "静けさは、日常を変える力になる",
        intro: "瞑想lifeの土台には、日常の中で自己認識を育てるための、実践的で現代的なアプローチがあります。",
        founderName: "ILCHI LEE（脳教育創始者）",
        founderDescription:
          "Ilchi Leeは、自己認識と内面のバランスを日常の習慣として育てる方法を長く探究してきた教育者であり実践家です。",
        contributionsTitle: "Brain Education (脳教育)",
        contributions: [
          "Brain Education（脳教育）は、呼吸、身体感覚、意識のつながりを通して、自分の状態に気づき、整え、選び直す力を育てる実践システムです。",
          "Dahn Yogaは、その感覚を身体から日常へ落とし込み、無理なく続けられる生活リズムへとつなぐ実践の流れとして広がってきました。"
        ],
        philosophyTitle: "Why it matters here",
        philosophyDescription:
          "瞑想lifeは、その考え方を現代の生活リズムに合わせて再構成した場です。1分の静けさから始まり、自己認識、習慣、つながり、成長へと自然に続いていく設計にしています。",
        cta: "今すぐ1分瞑想"
      },
      whyMeisoulife: {
        label: "40年以上の実践と研究から生まれた",
        title: "なぜ瞑想lifeなのか？",
        description:
          "瞑想lifeは、\n脳教育（Brain Education）の実践をもとに、\n\n現代人のストレス、\n不安、集中、睡眠、SNS疲れなどの課題に合わせて\n再設計された\n“生活リズムプラットフォーム”です。\n\n私たちは、\n無理なく続く小さな習慣から、\n人が本来の自分へ戻ることを大切にしています。",
        cards: [
          "40年以上の研究と実践",
          "世界100万人以上の実践",
          "脳教育（Brain Education）",
          "40冊以上の著書"
        ],
        founderMessageTitle: "創始者のメッセージ",
        founderMessage:
          "人は誰もが、\n本来のリズムを持っています。\n\nしかし、速すぎる情報と不安の中で、\n私たちは自分の中心を見失うことがあります。\n\nだからこそ今、\n呼吸を整え、身体を目覚めさせ、\nもう一度自分に戻る時間が必要です。\n\n小さな1分が、\n心の状態を変え、\n人生のリズムを変えていきます。\n\nAI時代だからこそ、\n人間の中心が大切です。\n\n瞑想lifeは、\n毎日戻ってこられる静かな場所として、\n共に目覚める生活文化を育てていきます。",
        founderSignature: "— 脳教育創始者",
        button: "もっと深く読む"
      },
      platformConcept: {
        eyebrow: "Platform Concept",
        title: "共生リズム・プラットフォームとは",
        description:
          "これはコンテンツを消費するための場所ではありません。毎日戻るためのリズムが先にあり、その上にAI、支払い、コミュニティが静かに重なっていく構造です。",
        items: [
          "軸にあるのは、毎日戻るためのリズム設計です。",
          "AIは答えを与えるためではなく、リズムを支える補助として使います。",
          "支払いは商品購入ではなく、継続を支える環境づくりのためにあります。",
          "コミュニティは集めるものではなく、リズムの上に自然に生まれるつながりです。"
        ]
      },
      platformFlow: {
        eyebrow: "Platform Flow",
        title: "共生リズム・プラットフォームの流れ",
        description:
          "瞑想lifeは、瞑想を売る場ではありません。毎日、共に目覚める生活リズムを育て、個人の回復から共生文化、地球経営へ進む場です。",
        items: [
          { step: "01", title: "今日の1分瞑想", description: "まずは1分、自分に戻る静けさを体験します。" },
          { step: "02", title: "無料7日チャレンジ", description: "朝の1分、夜の3分を重ねながら、やさしい生活リズムをつくります。" },
          { step: "03", title: "LINEコミュニティ", description: "毎日、共に目覚め直すための声かけとリマインドを受け取ります。" },
          { step: "04", title: "月額メンバーシップ", description: "ひとりの回復を、共に生きる習慣へ育てていきます。" },
          { step: "05", title: "リーダー成長", description: "周りを明るくし、共生文化を支える人へ成長していきます。" }
        ]
      },
      testimonials: {
        eyebrow: "Testimonials",
        title: "続けている人の声",
        description: "今この瞬間も、誰かがこのリズムを続けています。",
        items: [
          { name: "ミカ · 朝のリズム", quote: "朝3分だけなのに、仕事前の呼吸が整って気持ちの荒れが減りました。" },
          { name: "ジス · 心のリセット", quote: "忙しい日でも一度戻る時間があるだけで、心が少し静かになります。" },
          { name: "エマ · 集中回復", quote: "夜に短く整えるだけで、翌朝の集中がやさしく戻ってきます。" }
        ]
      },
      membership: {
        eyebrow: "Membership",
        title: "月額¥1,000から始める会員制度",
        description: "無料チャレンジから自然に有料継続へ移れるよう、価値と導線をシンプルに設計しています。",
        topButton: "メンバーとして続ける",
        plans: [
          {
            key: "free",
            name: "Free",
            price: "¥0",
            description: "まずは7日間、やさしく整える。",
            features: ["7日チャレンジ", "LINE参加リンク", "AIコーチ 1日3回まで"],
            cta: "無料で始める",
            href: "/challenge"
          },
          {
            key: "basic",
            name: "Basic",
            price: "¥1,000/月",
            description: "毎日の心の回復を、無理なく続ける。",
            features: ["AIコーチ無制限", "会員コミュニティ", "ライブ瞑想", "毎朝の習慣設計"],
            cta: "Basicで始める",
            href: "basic",
            featured: true
          },
          {
            key: "leader",
            name: "Growth",
            price: "¥3,000/月",
            description: "実践を深め、日々の安定をしっかり育てる。",
            features: ["少人数サークル", "優先イベント案内", "週次の深い実践ガイド", "実践記録レビュー"],
            cta: "Growthに進む",
            href: "/pricing"
          },
          {
            key: "premium",
            name: "Inner Circle",
            price: "¥10,000/月",
            description: "もっと深く、静かに、自分を整える。",
            features: ["月次プレミアムセッション", "リトリート優先案内", "個別サポート導線", "Inner Circle専用アクセス"],
            cta: "Inner Circleを見る",
            href: "/pricing"
          }
        ]
      },
      retreats: {
        eyebrow: "Global Retreat Network",
        title: "世界につながるリトリート導線",
        description: "日本での日常実践から、世界各地の深い体験へ。瞑想lifeは長期的な成長動線まで設計します。",
        items: [
          { place: "日本 伊勢", title: "浄化と始まり", description: "静かな節目をつくる、日本の再出発リトリート。" },
          { place: "アメリカ セドナ", title: "グローバル覚醒リトリート", description: "大地の広さの中で、視点を解き放つ体験。" },
          { place: "韓国 済州・国学園", title: "哲学とリーダー教育", description: "実践と思想をつなぐ、深い学びの拠点。" },
          { place: "ニュージーランド Earth Village", title: "自然治癒と共生生活", description: "自然と調和しながら、本来のリズムを思い出す。" },
          { place: "ヨーロッパ テネレフェ", title: "欧州リトリート拠点", description: "光と風の中で、静けさを取り戻す滞在型プログラム。" }
        ]
      },
      faq: {
        eyebrow: "FAQ",
        title: "よくある質問",
        items: [
          {
            question: "瞑想が初めてでも大丈夫ですか？",
            answer: "はい。朝3分の音声ガイドから始めるので、経験がなくても無理なく続けられます。"
          },
          {
            question: "LINEに入らなくても参加できますか？",
            answer: "はい。ただし、無料チャレンジのリマインドや仲間とのつながりはLINE参加の方が受け取りやすくなります。"
          },
          {
            question: "有料会員になると何が変わりますか？",
            answer: "AIコーチ利用上限が外れ、会員向けコミュニティ、ライブイベント、回復音声、継続サポートが解放されます。"
          },
          {
            question: "宗教的な内容ですか？",
            answer: "いいえ。瞑想lifeは日常のストレスケアと心の回復に焦点を当てた実践プラットフォームです。"
          }
        ]
      },
      finalCta: {
        eyebrow: "Start now",
        title: "回復から、つながりへ。つながりから、共生へ。",
        description:
          "朝3分の呼吸から、LINEコミュニティ、AIコーチ、月額会員、リーダー育成まで。自分を整えることが、周りと共に生きる力につながる設計です。",
        primary: "今すぐ始める",
        secondary: "7日間、共に始める",
        tertiary: "メンバーとして続ける"
      }
    },
    challengePage: {
      eyebrow: "7-Day Rhythm Challenge",
      title: "7日間で、リズムに戻る",
      description: "1日10分だけ。小さく立ち止まり、呼吸と感覚を整えながら、自分に戻る流れを静かにつくっていきます。",
      rhythmEyebrow: "Just 10 minutes a day",
      progressLabel: "Day",
      notStarted: "今日はひとつだけ。静けさは、ほんの少し戻るところから始まります。",
      inProgress: "{count}日分のリズムが静かに積み重なっています。急がず、今日の10分に戻りましょう。",
      complete: "7日間のリズムが、もうあなたの毎日の中にやさしく根づき始めています。",
      completedBadge: "Rhythm kept",
      openBadge: "Open",
      startButton: "Start",
      todayButton: "Start today",
      guidanceEyebrow: "Today’s guidance",
      guidanceTitle: "今の10分は、何も足さずに戻る時間です。",
      guidanceBody: "ボタンを押したら、まずは1分だけ静かに呼吸へ戻りましょう。そのあとも、急がずこの日のテーマを心に残しておくだけで十分です。",
      bridgeMessage: "ここからは、一人で続けるより、支え合う環境があるとリズムが続きやすくなります。",
      bridgeButton: "メンバーとして続ける",
      coachBridgeMessage: "ここからは、一人で続けるより、サポートがあるとリズムが続きやすくなります",
      coachBridgeButton: "AIコーチと一緒に続ける",
      supportTitle: "続けたい方へ",
      supportDescription: "LINEとAIリズムコーチで、毎日の小さな実践を支えます。",
      lineButton: "LINEに参加する",
      coachButton: "AIリズムコーチを開く",
      endTitle: "このリズムを、これからの日常へ",
      endDescription: "7日間で感じた小さな変化を、毎日の生活の中で続けていきませんか？",
      memberButton: "メンバーとして続ける",
      repeatButton: "無料で続ける",
      days: [
        { day: 1, title: "Pause", focus: "立ち止まり、今ここに戻る感覚を思い出します。" },
        { day: 2, title: "Breath", focus: "呼吸の長さを少し整えて、身体の緊張をほどいていきます。" },
        { day: 3, title: "Distance from thoughts", focus: "考えに巻き込まれすぎず、少し離れて眺める余白をつくります。" },
        { day: 4, title: "Emotional reset", focus: "感情を押さえ込まず、やさしく流し直す感覚を育てます。" },
        { day: 5, title: "Build rhythm", focus: "毎日同じ場所に戻ることで、自然な生活リズムをつくります。" },
        { day: 6, title: "Connection", focus: "自分だけでなく、人や場とのつながりにも静けさを広げていきます。" },
        { day: 7, title: "Integration", focus: "この7日間の感覚を、これからの日常に静かに持ち帰ります。" }
      ]
    },
    challengeForm: {
      name: "お名前",
      namePlaceholder: "山田 花子",
      email: "メールアドレス",
      lineId: "LINE ID（任意）",
      stress: "今のストレス度（1〜10）",
      submit: "LINEで無料参加する",
      submitting: "登録しています...",
      error: "登録に失敗しました。時間をおいてもう一度お試しください。"
    },
    pricingPage: {
      eyebrow: "Membership",
      title: "1分の回復から、生活リズム、脳の主人、共生へ",
      description:
        "瞑想lifeの会員は、瞑想コンテンツを買う人ではありません。1分の回復から始まり、毎日のリズム、脳の主人として生きる力、共生文化へ進んでいく仲間です。",
      checkoutNote: "決済後、この画面に戻ると次のステップに進みます",
      badges: ["Appleのように静かで明快", "日本のウェルネスらしい余白", "今すぐ始められる導線"],
      supportText:
        "Freeは、心の過負荷を1分でやさしく戻す入口です。\nBasicは、毎日戻る生活リズムを育てます。\nGrowthは、AIと共に脳の主人として生きる感覚を深めます。\nInner Circleは、共生文化と文明ビジョンを支えるリーダーの場です。",
      voicesEyebrow: "Voices",
      voicesTitle: "入ってよかった、という声",
      voicesButton: "コミュニティを見る",
      trustBadges: ["クレジットカードで安全決済", "いつでも解約可能", "スマホだけですぐ開始", "日本語サポート対応"],
      plans: [
        {
          key: "basic",
          name: "BASIC",
          price: "¥1,000",
          dailyCost: "約¥33 / day",
          emotionalCopy: "Life Rhythm",
          description: "1分の回復と小さな日々の実践で、安定した生活リズムを育てます。",
          features: ["毎日の1分リカバリー", "夜の3分ガイド", "7日リズム継続", "毎朝の習慣設計"],
          cta: "月1,000円で続ける",
          orderClass: "order-2 lg:order-1",
          accentClass: "border-white/60 bg-white/75"
        },
        {
          key: "leader",
          name: "GROWTH",
          price: "¥3,000",
          dailyCost: "約¥100 / day",
          emotionalCopy: "Brain Owner",
          description: "AIガイドと脳教育の実践を通して、感情・思考・関係のバランスを回復します。",
          features: ["AIリズムガイドの深い活用", "少人数サークル", "共生生活の実践対話", "実践記録レビュー"],
          cta: "月3,000円で深める",
          orderClass: "order-1 lg:order-2",
          accentClass: "border-emerald-300 bg-gradient-to-b from-white to-emerald-50/70 shadow-[0_24px_60px_rgba(5,150,105,0.12)]"
        },
        {
          key: "premium",
          name: "INNER CIRCLE",
          price: "¥10,000",
          dailyCost: "約¥333 / day",
          emotionalCopy: "Coexistence Circle",
          description: "創始者の智慧、コミュニティ、リーダー成長を通して共生を実践していく場です。",
          features: ["月次プレミアムセッション", "リトリート優先案内", "地球経営ビジョン対話", "Inner Circle専用アクセス"],
          cta: "月10,000円で支える",
          orderClass: "order-3 lg:order-3",
          accentClass: "border-amber-200/80 bg-white/75"
        }
      ],
      testimonials: [
        {
          name: "美香さん・49歳",
          quote: "BASICに入ってから、朝の1分だけでも気持ちが整う感覚が毎日わかるようになりました。"
        },
        {
          name: "健一さん・57歳",
          quote: "GROWTHは、ひとりで頑張る感じがなくなって続けやすいです。参加して正解でした。"
        },
        {
          name: "由紀さん・52歳",
          quote: "INNER CIRCLEは静かで上質です。慌ただしい日常の中に、安心して戻れる場所ができました。"
        }
      ]
    },
    welcomeMember: {
      eyebrow: "Welcome back",
      firstTitle: "おかえりなさい。\nここからは、途切れないリズムです。",
      returningTitle: "おかえりなさい。\n今日も1分だけ整えましょう。",
      body: "何かを買ったのではなく、自分に戻る場所へ静かに帰ってきました。",
      primary: "今すぐ1分を始める",
      secondary: "LINEでつながる"
    },
    welcomePage: {
      title: "ようこそ、瞑想lifeへ",
      subtitle: "あなたのリズムは、ここから始まります。",
      memberProgramTitle: "メンバーリズムを始める",
      memberProgramDescription: "決済が完了した方は、ここからBasicリズムプログラムを始められます。",
      memberProgramButton: "Basicリズムプログラムへ進む",
      coachTitle: "AIリズムコーチ",
      coachDescription: "一人で続けるのが難しいとき、静かに戻るサポートをします",
      steps: [
        "LINEでリズム通知を受け取る",
        "AIリズムコーチを開く",
        "今日の1分瞑想を始める"
      ],
      lineButton: "LINEに参加する",
      coachButton: "AIリズムコーチを開く",
      meditationButton: "今日の1分を始める",
      challengeButton: "7日リズムを始める",
      tertiary: "ホームへ戻る",
      fallback: "リンクはまもなく準備されます。"
    },
    programPages: {
      basic: {
        eyebrow: "Basic Program",
        title: "Basic リズムプログラム",
        description: "7日間、毎日3分。自分の中心に静かに戻るための入門プログラムです。",
        intro: "大きく変わろうとしなくても大丈夫です。毎日少しずつ戻ることで、心と身体のリズムは自然に整い始めます。",
        dayLabel: "Day",
        goalLabel: "Goal",
        practiceLabel: "Practice",
        openBadge: "Open",
        completedBadge: "Completed",
        days: [
          { day: 1, title: "止まる", goal: "今ここで一度立ち止まり、呼吸に戻ります。", practice: "3分呼吸", button: "Day 1を始める" },
          { day: 2, title: "呼吸", goal: "呼吸を長くし、心のざわつきを静かにほどきます。", practice: "4-2-4 呼吸 3分", button: "Day 2を始める" },
          { day: 3, title: "身体感覚", goal: "考えから離れ、身体の感覚を通して今ここに戻ります。", practice: "身体スキャン 3分", button: "Day 3を始める" },
          { day: 4, title: "感情リセット", goal: "感情を抑え込まず、やさしく流していきます。", practice: "感情を眺める 3分", button: "Day 4を始める" },
          { day: 5, title: "一日のリズム", goal: "朝・昼・夜に小さく戻るリズムをつくります。", practice: "1分 × 3回", button: "Day 5を始める" },
          { day: 6, title: "つながり", goal: "一人で頑張るのではなく、共に続ける感覚を育てます。", practice: "つながりの瞑想 3分", button: "Day 6を始める" },
          { day: 7, title: "統合", goal: "7日間の変化を、これからの日常に静かに持ち帰ります。", practice: "統合瞑想 3分", button: "Day 7を始める" }
        ],
        bottomTitle: "このリズムを続けるために",
        bottomDescription: "Basicプログラムは、完璧に行うためのものではありません。戻る場所を持つための小さな入口です。",
        bottomPrimary: "今日の1分に戻る",
        bottomSecondary: "7日チャレンジを見る",
        bottomTertiary: "ホームへ戻る"
      },
      growth: {
        eyebrow: "Growth Program",
        title: "Growth リズムプログラム",
        description: "一人で頑張るのではなく、共に続けることでリズムを深めていきます。",
        intro: "Growthは、毎日の小さな実践を続けながら、週ごとのテーマと仲間とのつながりを通して、安定した生活リズムを育てるプログラムです。",
        weekLabel: "Week",
        goalLabel: "Description",
        practiceLabel: "Practice",
        weeks: [
          { week: 1, title: "整える", goal: "朝・昼・夜の基本リズムを安定させます。", practice: "毎日3分 + 週1回の振り返り", button: "Week 1を始める" },
          { week: 2, title: "続ける", goal: "続かない原因を責めず、戻る仕組みをつくります。", practice: "1日1回のリズム記録", button: "Week 2を始める" },
          { week: 3, title: "つながる", goal: "仲間と共に続ける感覚を育てます。", practice: "LINEコミュニティ参加 + 共有", button: "Week 3を始める" },
          { week: 4, title: "育てる", goal: "生活の中で自然に戻れるリズムを育てます。", practice: "週次レビュー + 次の目標設定", button: "Week 4を始める" }
        ],
        communityTitle: "共に続ける場",
        communityDescription: "Growthでは、一人で完璧に続けることよりも、戻れる場を持つことを大切にします。",
        lineButton: "LINEコミュニティへ",
        coachButton: "AIリズムコーチを開く",
        meditationButton: "今日の1分に戻る",
        fallback: "リンクはまもなく準備されます。",
        bottomTitle: "さらに深めたい方へ",
        bottomDescription: "リズムを生活だけでなく、人生と共生文化の実践へ深めたい方はInner Circleへ進めます。",
        bottomButton: "Inner Circleを見る"
      },
      inner: {
        eyebrow: "Inner Circle",
        title: "Inner Circle 共生リーダープログラム",
        description: "自分のリズムを整えるだけでなく、周りと共に目覚めて生きる文化を育てていきます。",
        intro: "Inner Circleは、瞑想・生活リズム・共生文化・地球市民意識を深め、日常の中で静かに場を育てるリーダーのためのプログラムです。",
        moduleLabel: "Module",
        goalLabel: "Description",
        practiceLabel: "Practice",
        modules: [
          { module: 1, title: "自己リズムの確立", goal: "自分の中心に戻る毎日のリズムを安定させます。", practice: "朝・昼・夜のリズム実践", button: "Module 1を始める" },
          { module: 2, title: "共生コミュニケーション", goal: "人を変えようとせず、共に整う関係性を育てます。", practice: "対話と気づきの実践", button: "Module 2を始める" },
          { module: 3, title: "場づくり", goal: "集めるのではなく、自然に人が戻ってくる場を育てます。", practice: "小さなリズム場の設計", button: "Module 3を始める" },
          { module: 4, title: "地球市民・共生文化", goal: "個人の実践を、社会と地球のための共生文化へ広げます。", practice: "地球市民意識と実践計画", button: "Module 4を始める" }
        ],
        supportTitle: "Inner Circle 専用サポート",
        supportDescription: "月次プレミアムセッション、リトリート優先案内、個別サポート導線を通して、リズムを人生と活動に深めていきます。",
        supportCards: [
          { title: "月次プレミアムセッション", description: "月に一度、深いテーマで整える時間を持ちます。" },
          { title: "リトリート優先案内", description: "自然・聖地・パワースポットでの実践機会を優先的に案内します。" },
          { title: "個別サポート導線", description: "必要に応じて、今の状態に合った次の一歩を提案します。" },
          { title: "共生文化プロジェクト", description: "自分だけでなく、周囲と社会に広がる実践を育てます。" }
        ],
        actionTitle: "今日から、静かに場を育てる",
        actionDescription: "Inner Circleは、特別な人になるための場所ではありません。自分に戻り、その静けさから周りを照らすための場です。",
        meditationButton: "今日の3分を始める",
        coachButton: "AIリズムコーチを開く",
        lineButton: "LINEコミュニティへ",
        growthButton: "Growthプログラムを見る",
        fallback: "リンクはまもなく準備されます。"
      }
    },
    loginPage: {
      eyebrow: "Login",
      title: "会員ログイン",
      subtitle: "ログインすると、あなたのリズムが続きます",
      email: "メールアドレス",
      password: "パスワード",
      button: "ログインする",
      signupButton: "新しく登録する",
      checking: "確認しています...",
      unavailable: "現在、接続を確認しています。",
      logout: "ログアウト",
      signupSuccess: "登録確認メールを送信しました。確認後にログインしてください。",
      signupError: "現在、接続を確認しています。",
      loading: "処理中...",
      error: "ログインに失敗しました。メールとパスワードを確認してください。"
    },
    meditationPage: {
      durationTexts: {
        sixty: {
          topText: "今ここで、60秒だけ呼吸に戻りましょう",
          completionTitle: "60秒、今ここに戻りました。"
        },
        threeMinutes: {
          topText: "今ここで、3分間、ゆっくり呼吸のリズムに戻りましょう",
          completionTitle: "3分間、呼吸のリズムに戻りました。"
        }
      },
      variants: {
        default: {
          topText: "今ここで、60秒だけ呼吸に戻りましょう",
          intro: "何かを変えようとしなくて大丈夫です。ただ静かに、呼吸のリズムに戻ります。",
          completionTitle: "60秒、今ここに戻りました。"
        },
        morning: {
          topText: "朝の3分で、今日の輪郭を静かに整えましょう",
          intro: "起きたばかりの心と身体をやさしく目覚めさせながら、今日の始まりを落ち着いて迎えます。",
          completionTitle: "朝のリズムが整いました。今日を静かに始めましょう。"
        },
        day: {
          topText: "今ここで、60秒だけ呼吸に戻りましょう",
          intro: "忙しさの流れを一度ほどいて、自分の中心に短く戻る時間です。",
          completionTitle: "60秒、今ここに戻りました。"
        },
        night: {
          topText: "夜の3分で、今日を静かに手放しましょう",
          intro: "一日の緊張を少しずつ緩めながら、眠りの前に心と身体をやわらかく閉じていきます。",
          completionTitle: "夜のリズムが整いました。今日を静かに手放しましょう。"
        }
      },
      phases: {
        inhale: "吸って",
        hold: "止めて",
        exhale: "吐いて"
      },
      bottomText: {
        inhale: "吸って… 4秒",
        hold: "止めて… 2秒",
        exhale: "吐いて… 4秒"
      },
      completionMessage: "おつかれさま。\n今の静けさを、\n少しだけ感じてください。",
      completionReturnText: "また戻ってきてください。",
      completionBody: "この静かなリズムを、7日間だけ続けてみませんか？",
      completionPrimary: "7日リズムを始める",
      completionSecondary: "今日はここまで",
      coachPrompt: "この静かな状態を、少しだけ続けてみませんか？",
      coachButton: "AIコーチを開く",
      soundOn: "自然音 ON",
      soundOff: "自然音 OFF",
      vibrationOn: "振動を入れる",
      vibrationOff: "振動を消す",
      natureLabel: "自然のリズムとともに呼吸する"
    },
    premiumPage: {
      successBadge: "決済が完了しました",
      title: "プレミアムアクセス",
      subtitle: "あなたのメンバーシップが有効になりました。ここから有料リズムを続けられます。",
      description: "リズムはすでに続いています。今日できる一歩から静かに始めましょう。",
      currentPlan: "現在のプラン",
      planLabels: {
        basic: "Basic",
        growth: "Growth",
        inner_circle: "Inner Circle"
      },
      primary: "プログラムを開く",
      secondary: "今日の瞑想を始める",
      tertiary: "料金ページを見る"
    },
    membershipSuccessPage: {
      badge: "メンバーシップ有効",
      title: "お支払いが完了しました。",
      subtitle: "あなたの瞑想lifeメンバーシップが有効になりました。",
      body: "自分に戻るリズムが、今日からあなたの日常に始まります。",
      emailSentNote: "確認メールをお送りしました。メールをご確認ください。",
      activeTierLabel: "Activated membership",
      planLabels: {
        basic: "Basic",
        growth: "Growth",
        inner_circle: "Inner Circle"
      },
      steps: ["LINEコミュニティに参加する", "AIリズムコーチを開く", "今日の1分リズムを続ける"],
      lineButton: "LINEコミュニティへ",
      coachButton: "AIコーチを開く",
      rhythmButton: "今日のリズムへ戻る",
      programButton: "メンバープログラムを開く",
      dashboardButton: "ダッシュボードへ"
    },
    membershipPage: {
      title: "メンバーシップのご案内",
      subtitle: "有料リズムへ進む準備ができたら、ここから続けられます。",
      canceled: "決済は完了していません。準備ができたら、また静かに戻ってきてください。",
      primary: "料金ページへ進む",
      secondary: "ホームへ戻る"
    },
    brainEducationPage: {
      eyebrow: "Brain Education",
      title: "脳教育について",
      subtitle: "脳教育は、呼吸・身体感覚・意識を通して、自分の状態に気づき、整え、選び直すための実践的なシステムです。",
      intro:
        "瞑想lifeは、この脳教育の考え方を現代の生活リズムに合わせて、より続けやすく、より静かに使える形へ再設計しています。",
      sections: [
        {
          title: "1. What is Brain Education?",
          body: "Brain Educationは、脳を知識の器ではなく、感覚・感情・意識を調和させる主体としてとらえる実践です。"
        },
        {
          title: "2. 5 Brain Education stages",
          body: "感覚に気づくことから始まり、感情の調律、意識の選択、行動の一貫性、そして人との共生へと静かに深まっていきます。"
        },
        {
          title: "3. Modern problems & solutions",
          body: "ストレス、不安、睡眠の乱れ、SNS疲れのような現代的な負荷に対して、まず呼吸と身体感覚から戻る入口をつくります。"
        },
        {
          title: "4. Emotional balance",
          body: "感情を抑え込むのではなく、感じ、整え、流す力を育てることで、日常の安定感を取り戻していきます。"
        },
        {
          title: "5. Human potential",
          body: "脳と心の可能性を目覚めさせることは、特別な能力を得ることではなく、本来の自分に戻ることです。"
        },
        {
          title: "6. Coexistence philosophy",
          body: "脳教育は個人の回復で終わらず、その静けさが関係性や共同体の質を変えていくことを大切にします。"
        },
        {
          title: "7. Founder story",
          body: "ILCHI LEEは、40年以上にわたり人間の内面の可能性と、日常の中で続く実践の形を探究してきました。"
        },
        {
          title: "8. Global impact",
          body: "世界各地での実践と教育活動を通して、多くの人が自分に戻る習慣と共生の感覚を育ててきました。"
        }
      ],
      founderMessageTitle: "創始者の深いメッセージ",
      founderMessageSubtitle: "身体を通して、心と意識を目覚めさせる。",
      founderMessageBody:
        "人の中心は、\n遠くにあるものではありません。\n\n呼吸の中にあり、\n身体の感覚の中にあり、\n今この瞬間の選択の中にあります。\n\n情報が増え、AIが進化する時代だからこそ、\n人間には自分の温度を知り、\n自分の状態を整える力が必要です。\n\n考えすぎたときは、\n身体を冷まし、静けさに戻る。\n\n力が足りないときは、\n身体を動かし、生命力を高める。\n\n身体の状態は、\n心の状態につながっています。\n\nだからこそ、\n1時間に1度でも、\n1分でも、2分でも、\n自分の状態を感じ、\n呼吸し、笑い、身体を動かすことが大切です。\n\n笑顔は、\n心を開く最初の筋肉です。\n\n反応する力、\n応援する力、\n愛を表現する力は、\n日々の小さな実践から育ちます。\n\n共生とは、\n特別な理念ではなく、\n生活の中で互いを生かす選択です。\n\n一人が整えば、\n周りの空気が変わります。\n\n一人が目覚めれば、\n共同体のリズムが変わります。\n\nAI時代に必要なのは、\n単なる知識ではなく、\n人を生かす知性です。\n\nそれが、\n共生知能であり、\n弘益の知性です。\n\n瞑想lifeは、\n小さな1分の実践から、\n人が本来の中心に戻り、\n共に目覚める文化を育てていきます。",
      primary: "今日の1分に戻る",
      secondary: "ホームへ戻る"
    },
    common: {
      connecting: "接続中...",
      comingSoon: "Checkout is not configured yet."
    }
  },
  kr: {
    header: {
      brand: "명상life",
      login: "로그인",
      freeJoin: "무료 참여",
      myPage: "마이페이지",
      myProgram: "나의 프로그램",
      logout: "로그아웃",
      languageSettings: "언어 설정",
      customerSupport: "고객센터",
      billingMembership: "결제 및 멤버십",
      menu: "메뉴",
      close: "닫기",
      mobileGuestTabs: [
        { href: "/", label: "홈" },
        { href: "/challenge", label: "7일 챌린지" },
        { href: "/pricing", label: "요금" },
        { href: "/community", label: "커뮤니티" },
        { href: "/leaders", label: "리더 성장" }
      ],
      mobileMemberTabs: [
        { href: "/", label: "홈" },
        { href: "/program/basic", label: "나의 프로그램" },
        { href: "/pricing", label: "요금" },
        { href: "/community", label: "커뮤니티" },
        { href: "/member", label: "마이페이지" }
      ],
      mobileGuestMenu: [
        { href: "/", label: "홈" },
        { href: "/challenge", label: "7일 챌린지" },
        { href: "/pricing", label: "요금" },
        { href: "/community", label: "커뮤니티" },
        { href: "/leaders", label: "리더 성장" }
      ],
      mobileMemberMenu: [
        { href: "/", label: "홈" },
        { href: "/pricing", label: "요금" },
        { href: "/community", label: "커뮤니티" }
      ],
      nav: [
        { href: "/", label: "홈" },
        { href: "/challenge", label: "7일 챌린지" },
        { href: "/pricing", label: "요금" },
        { href: "/community", label: "커뮤니티" },
        { href: "/leaders", label: "리더 성장" }
      ],
      mobileMenu: [
        { href: "/", label: "홈" },
        { href: "/#one-minute-experience", label: "1분 리커버리" },
        { href: "/#ai-rhythm-coach", label: "AI 코치" },
        { href: "/pricing", label: "요금" },
        { href: "/program/basic", label: "프로그램" },
        { href: "/community", label: "커뮤니티" },
        { href: "/challenge", label: "무료로 시작하기" }
      ]
    },
    community: {
      eyebrow: "COMMUNITY",
      headline: "여기는 버티는 곳이 아닙니다. 매일 함께 깨어나는 곳입니다.",
      subcopy:
        "1분의 고요를 혼자 끝내지 않고, 7일 챌린지와 커뮤니티 리듬을 통해 함께 이어갑니다.",
      lineCommunityTitle: "7일, 함께 시작하는 입구",
      lineCommunityDescription:
        "아침 리마인드, 밤의 돌아보기, 7일 챌린지 안내가 이어지는 무료 커뮤니티입니다.",
      lineCommunityCTA: "커뮤니티 참여하기",
      rhythmTitle: "무료 참여에서 멤버 리듬으로",
      rhythmDescription:
        "혼자의 회복을 습관으로 바꾸고, 함께 살아가는 리듬으로 이어가는 기본 멤버 입구입니다.",
      rhythmCTA: "Basic 멤버로 이동",
      supportTitle: "공생 리더로 이어지는 입구",
      supportDescription:
        "함께 깨어나는 리듬을 지지하는 사람으로 나아가는 리더 성장 안내입니다.",
      supportCTA: "리더 폼 보기",
      memberCommunityTitle: "함께 이어가는 커뮤니티 흐름",
      memberCommunityDescription:
        "매일의 체크인, 오늘의 작은 전진, 질문, 이벤트, 리더 성장까지 자연스럽게 이어지도록 구성했습니다.",
      channels: ["Daily Check-in", "Wins Today", "Questions", "Events", "Leaders"]
    },
    leaders: {
      eyebrow: "LEADER GROWTH",
      headline: "실천에서 리더 성장으로",
      subcopy:
        "명상life의 리더 성장은 참여에서 끝나지 않고, 꾸준한 실천과 신뢰, 공헌을 통해 함께 깨어나는 리듬을 돕는 사람을 키우는 구조입니다.",
      stage1Label: "STAGE 1",
      stage1Title: "일반회원",
      stage1Description: "먼저 자신의 마음을 정리하고, 매일의 실천을 안정시키는 단계입니다.",
      stage2Label: "STAGE 2",
      stage2Title: "실천회원",
      stage2Description: "자신의 리듬을 유지하며, 작은 실천을 주변과 나누기 시작하는 단계입니다.",
      stage3Label: "STAGE 3",
      stage3Title: "공생 리더",
      stage3Description: "함께 깨어나는 장을 만들고, 사람들의 실천과 성장을 돕는 리더 단계입니다.",
      ctaTitle: "함께 성장하는 리더가 되어보세요",
      ctaDescription:
        "명상life는 혼자 성장하는 길이 아니라, 함께 깨어나는 문화를 만드는 여정입니다.",
      ctaButton: "리더 성장 시작하기",
      promotionRule: "Promotion Rule",
      promotionTitle: "리더 후보가 되는 조건",
      paidDaysLabel: "유료 회원",
      checkInCountLabel: "체크인",
      helpfulCommentsLabel: "도움 댓글",
      currentLabel: "현재",
      daysTargetSuffix: "일 이상",
      daysValueSuffix: "일",
      countTargetSuffix: "회 이상",
      countValueSuffix: "회",
      invitationLabel: "Invitation",
      invitationReadyTitle: "리더 프로그램에 초대되었습니다",
      invitationProgressTitle: "리더 후보까지의 진행 상황",
      invitationReadyDescription:
        "Supabase의 실제 데이터를 기준으로 판정하며, 조건을 만족하면 대시보드에도 자동으로 표시됩니다.",
      invitationProgressDescription:
        "Supabase의 실제 데이터를 바탕으로, 앞으로 무엇을 더 쌓아가면 되는지 보이도록 했습니다.",
      dashboardButton: "대시보드에서 확인",
      communityButton: "커뮤니티 흐름 보기",
      leaderFormButton: "리더 폼으로 가기",
      visionEyebrow: "2030 Vision",
      visionTitle: "2030년, 10만 명의 공생 인재로",
      visionDescription:
        "명상life의 리더는 사람을 모으는 사람이 아닙니다. 매일 자신에게 돌아오고, 주변을 밝히며, 함께 깨어나는 리듬을 지키는 사람입니다. 한 사람의 실천이 가정을 바꾸고, 일터를 바꾸고, 지역을 바꾸고, 지구를 바꿉니다. 그 조용한 흐름을 2030년까지 10만 명으로 넓혀갑니다."
    },
    footer: {
      brand: "명상life",
      line1: "회복에서 공생으로. 공생에서 지구경영으로.",
      line2: "명상life — 회복에서 공생으로. 공생에서 지구경영으로.",
      links: [
        { href: "/challenge", label: "무료 참여" },
        { href: "/pricing", label: "요금" },
        { href: "/community", label: "커뮤니티" },
        { href: "/leaders", label: "리더 성장" },
        { href: "/retreats", label: "리트릿" }
      ]
    },
    lineInvite: {
      title: "이 리듬을 혼자서 끝내지 마세요.",
      subtitle: "매일의 작은 실천을 함께 이어가기 위한 LINE 커뮤니티입니다.",
      morning: "Morning — 1분만 호흡으로 돌아오기",
      evening: "Evening — 하루를 조용히 돌아보기",
      button: "LINE으로 함께 이어가기",
      note: "알림은 언제든 끌 수 있습니다. 조용히 참여할 수 있습니다.",
      afterMessage: "내일도 이 1분부터 다시 시작해봅시다.",
      toast: "LINE으로 연결되었습니다. 내일도 이곳으로 돌아와 주세요."
    },
    modal: {
      eyebrow: "1분 명상",
      title: "지금 여기서, 호흡으로 돌아와 봅시다",
      endButton: "1분을 마칩니다",
      completeTitle: "오늘, 당신은 자신에게 돌아왔습니다.",
      completionMessage: "수고했어요.\n지금의 고요함을,\n잠시만 느껴보세요.",
      completionReturnText: "또 돌아와 주세요.",
      completeBody: "이 작은 호흡이 함께 깨어나는 리듬의 시작입니다.",
      durationTexts: {
        sixty: {
          title: "지금 여기서, 60초만 호흡으로 돌아와 봅시다",
          completionBody: "이 작은 60초가 함께 깨어나는 리듬의 시작입니다.",
          completionMoments: [
            "오늘도 자신에게 돌아오는 60초를 고맙게 받았습니다.",
            "고요함은 언제나 당신 안에 있습니다."
          ]
        },
        threeMinutes: {
          title: "지금 여기서, 3분간 천천히 호흡을 따라가 봅시다",
          completionBody: "이 조용한 3분이 함께 깨어나는 리듬의 시작입니다.",
          completionMoments: [
            "오늘도 자신에게 돌아오는 3분을 고맙게 받았습니다.",
            "고요함은 언제나 당신 안에 있습니다."
          ]
        }
      },
      completionMoments: [
        "오늘도 자신에게 돌아오는 60초를 고맙게 받았습니다.",
        "고요함은 언제나 당신 안에 있습니다."
      ],
      breatheAgain: "한 번 더 호흡하기",
      tellAi: "AI에게 지금 상태 전하기",
      soundOn: "자연음 ON",
      soundOff: "자연음 OFF",
      vibrationOn: "진동 켜기",
      vibrationOff: "진동 끄기",
      natureLabel: "자연의 리듬과 함께 호흡합니다",
      natureMicrocopy: "지쳤다면,\n여기로 돌아오세요.",
      phaseLabels: {
        inhale: "숨을 들이쉬고",
        hold: "그대로 머물고",
        exhale: "숨을 내쉽니다"
      },
      reflectionQuestion: "지금 느낌은 어떤가요?",
      breathingGuides: [
        { text: "들이쉬기… 4초", duration: 4000 },
        { text: "멈추기… 3초", duration: 3000 },
        { text: "내쉬기… 5초", duration: 5000 }
      ],
      reflections: [
        {
          key: "calm",
          label: "조금 차분해졌다",
          message: "그 감각을 내일도 조금만 이어가 봅시다.",
          ctaLabel: "내일도 여기로 돌아오기"
        },
        {
          key: "deepen",
          label: "조금 더 깊어지고 싶다",
          message: "이 리듬을 조금 더 깊게 길러보지 않겠어요?",
          ctaLabel: "더 깊은 리듬 보기"
        },
        {
          key: "together",
          label: "혼자서는 이어가기 어렵다",
          message: "혼자 이어가기 어려울 때, 함께 돌아올 수 있는 자리가 있습니다.",
          ctaLabel: "LINE으로 함께 이어가기"
        }
      ]
    },
    home: {
      heroEyebrow: "Coexistence Meditation Ecosystem",
      heroTitle: "지금, 함께 깨어나는 리듬을 시작해볼까요?",
      heroDescription:
        "명상life는 혼자 애써 버티는 곳이 아닙니다. 매일의 작은 실천을 통해 마음, 몸, 관계, 삶을 정돈하고 함께 깨어 살아가기 위한 공생 리듬 플랫폼입니다.",
      heroPrimary: "60초 리듬 시작하기",
      heroSecondary: "멤버 되기",
      imageAlt: "고요한 아침 명상 풍경",
      rhythmExperience: {
        eyebrow: "오늘의 공생 리듬",
        title: "아침 · 낮 · 밤, 돌아오는 시간을 하나씩",
        description: "크게 바꾸려 하지 않아도 괜찮습니다. 하루에 세 번 같은 자리로 돌아오는 것만으로도 마음과 몸의 윤곽은 조용히 정돈됩니다.",
        cards: [
          {
            key: "morning",
            eyebrow: "Morning 3 min",
            title: "아침 3분",
            description: "깨어난 직후의 호흡과 몸 감각을 정돈해 하루의 시작을 조용히 맞춥니다.",
            button: "아침 리듬 시작하기"
          },
          {
            key: "daytime",
            eyebrow: "Daytime 1 min",
            title: "낮의 1분",
            description: "바쁨 속에서 한 번 멈추고, 자신의 중심으로 돌아오는 짧은 시간입니다.",
            button: "60초 리듬 시작하기"
          },
          {
            key: "night",
            eyebrow: "Night 3 min",
            title: "밤의 3분",
            description: "하루의 긴장을 풀고, 잠들기 전에 마음과 몸을 부드럽게 닫아갑니다.",
            button: "밤 리듬 시작하기"
          }
        ]
      },
      todayRhythmEyebrow: "오늘의 리듬",
      todayRhythmNotStarted: "아직 시작하지 않았더라도, 오늘은 1분만 자신에게 돌아오는 것부터 시작할 수 있습니다.",
      todayRhythmCompletedTitle: "이 리듬을 이어가고 있습니다",
      todayRhythmCompletedDescription: "7일이 지나도 고요함은 일상 속에서 부드럽게 이어집니다.",
      todayRhythmButton: "오늘의 리듬 시작하기",
      returnEyebrow: "돌아오는 자리",
      returnTitle: "매일 같은 자리로 돌아오기만 해도 리듬은 자연스럽게 정돈됩니다",
      returnReturning: "다시 오셨네요. 오늘도 1분만 정돈해봅시다.",
      returnFirst: "분주한 날에도 돌아올 자리가 하나 있으면 호흡은 조용히 정돈됩니다.",
      returnStreak: "{count}일 이어지고 있습니다",
      returnStart: "오늘부터 조용히 시작할 수 있습니다",
      returnButton: "오늘의 1분 시작하기",
      rhythmSignals: {
        completed: "오늘의 리듬이 정돈되었습니다",
        notCompleted: "오늘의 리듬은 아직 시작되지 않았습니다",
        streak: "{count}일 리듬을 이어가고 있습니다",
        practicingNow: "지금 함께 실천 중 {count}명",
        waiting: "리듬이 당신을 기다리고 있습니다.",
        milestones: ["3일", "7일", "30일"],
        anchors: {
          morning: "지금은 아침 리듬",
          daytime: "지금은 낮 리듬",
          night: "지금은 밤 리듬"
        }
      },
      dailyRhythmEyebrow: "Daily Rhythm",
      dailyRhythmBadge: "Local",
      checkInTitle: "오늘 마음 체크인",
      checkInDescription: "지금의 기분을 하나만 고르면 됩니다. 작은 기록이 매일의 리듬을 정리해줍니다.",
      checkInReactions: {
        "😀": "좋습니다. 그 밝은 기운을 오늘의 작은 행동에 실어보세요.",
        "🙂": "그 평온함을 소중히 하세요. 오늘은 무리하지 말고 조용히 정돈해봅시다.",
        "😐": "아무 느낌이 없는 날도 있습니다. 그래도 1분만 호흡으로 돌아오면 충분합니다.",
        "😔": "조금 지쳐 있을지도 모릅니다. 오늘은 애쓰기보다 쉬는 리듬을 선택해보세요.",
        "😣": "힘듦을 알아차린 것만으로도 회복은 시작되었습니다. 먼저 깊게 내쉬어보세요."
      },
      liveEyebrow: "Live Together",
      liveBadge: "Live-ready",
      liveTitle: "지금 18명이 함께 명상 중입니다",
      liveDescription: "조용한 연결이 세계 곳곳에서 동시에 자라고 있습니다.",
      challengeEyebrow: "Challenge",
      challengeTitle: "7일 함께 시작하기",
      challengeDescription:
        "1분의 고요함을 7일 동안 쌓아가면, 호흡, 감정, 수면, 감사, 관계, 집중, 삶의 방향까지 천천히 정돈되기 시작합니다.",
      challengeProgress: "Day 1 / 7",
      challengeButton: "7일 함께 시작하기",
      sevenDay: {
        eyebrow: "7-Day Rhythm",
        title: "7일 동안 함께 깨어나는 리듬",
        description: "개인의 회복을 함께 살아가는 힘으로. 하루하루의 작은 변화가 삶의 질과 주변을 향한 빛을 키웁니다.",
        continuationTitle: "이 리듬을 혼자서 끝내지 마세요.",
        continuationDescription: "명상life 멤버로 이어가기."
      },
      cards: [
        {
          eyebrow: "Why now",
          title: "지금 마음을 정돈하는 일이 공생의 토대가 됩니다",
          description:
            "정보와 자극이 강한 시대일수록 스스로를 가라앉히는 힘이 사람과의 관계를 바꿉니다. 아침 3분의 고요함은 판단력, 수면, 감정 회복력, 그리고 따뜻한 공동체의 토대가 됩니다."
        },
        {
          eyebrow: "Challenge",
          title: "7일 동안 자신을 몰아붙이지 않는 습관 만들기",
          description: "매일 아침 3분 음성, LINE 리마인드, 간단한 기록으로 바쁜 사람도 무리 없이 시작할 수 있습니다."
        },
        {
          eyebrow: "AI Coach",
          title: "흔들리는 순간에도 혼자 두지 않습니다",
          description: "피곤함, 불안, 잠들기 어려운 밤을 위해 3분 안에 호흡과 마음을 정리해주는 AI 코치를 준비했습니다."
        }
      ],
      founder: {
        eyebrow: "Founder Philosophy",
        title: "고요함은 일상을 바꾸는 힘이 됩니다",
        intro: "명상life의 바탕에는 일상 속에서 자기인식을 기를 수 있도록 돕는 실천적이고 현대적인 접근이 있습니다.",
        founderName: "ILCHI LEE (뇌교육 창시자)",
        founderDescription:
          "Ilchi Lee는 자기인식과 내면의 균형을 일상의 습관으로 길러가는 방법을 오랫동안 탐구해 온 교육자이자 실천가입니다.",
        contributionsTitle: "Brain Education (뇌교육)",
        contributions: [
          "Brain Education(뇌교육)은 호흡, 신체 감각, 의식의 연결을 통해 자신의 상태를 알아차리고, 정돈하고, 다시 선택하는 힘을 기르는 실천 시스템입니다.",
          "Dahn Yoga는 그 감각을 몸에서 일상으로 자연스럽게 이어가며, 무리 없이 계속할 수 있는 생활 리듬으로 확장해 온 실천 흐름입니다."
        ],
        philosophyTitle: "Why it matters here",
        philosophyDescription:
          "명상life는 그 접근을 오늘의 생활 리듬에 맞게 다시 구성한 공간입니다. 1분의 고요함에서 시작해 자기인식, 습관, 연결, 성장으로 자연스럽게 이어지도록 설계했습니다.",
        cta: "지금 바로 1분 명상"
      },
      whyMeisoulife: {
        label: "40년이 넘는 실천과 연구에서 태어난",
        title: "왜 명상life인가요?",
        description:
          "명상life는\n뇌교육(Brain Education)의 실천을 바탕으로,\n\n현대인의 스트레스,\n불안, 집중, 수면, SNS 피로 같은 문제에 맞게\n다시 설계된\n“생활 리듬 플랫폼”입니다.\n\n우리는\n무리 없이 이어지는 작은 습관을 통해,\n사람이 본래의 자신에게 돌아가는 일을 소중히 여깁니다.",
        cards: [
          "40년이 넘는 연구와 실천",
          "전 세계 100만 명 이상의 실천",
          "뇌교육 (Brain Education)",
          "40권이 넘는 저서"
        ],
        founderMessageTitle: "창시자의 메시지",
        founderMessage:
          "사람은 누구나,\n본래의 리듬을 가지고 있습니다.\n\n하지만 너무 빠른 정보와 불안 속에서,\n우리는 자신의 중심을 놓치곤 합니다.\n\n그래서 지금,\n호흡을 정돈하고 몸을 깨우며,\n다시 자신에게 돌아오는 시간이 필요합니다.\n\n작은 1분이,\n마음의 상태를 바꾸고,\n삶의 리듬을 바꾸기 시작합니다.\n\nAI 시대일수록,\n인간의 중심은 더 중요합니다.\n\n명상life는,\n매일 다시 돌아올 수 있는 조용한 장소로서,\n함께 깨어나는 생활 문화를 길러갑니다.",
        founderSignature: "— 뇌교육 창시자",
        button: "더 깊이 읽기"
      },
      platformConcept: {
        eyebrow: "Platform Concept",
        title: "공생 리듬 플랫폼이란",
        description:
          "이곳은 콘텐츠를 소비하는 플랫폼이 아닙니다. 먼저 매일 돌아오는 리듬이 있고, 그 위에 AI, 결제, 커뮤니티가 조용히 겹쳐지는 구조입니다.",
        items: [
          "중심에는 매일 돌아오기 위한 리듬 설계가 있습니다.",
          "AI는 답을 주기보다 리듬을 지지하는 보조 역할을 합니다.",
          "결제는 상품 구매가 아니라 지속을 가능하게 하는 환경을 지탱합니다.",
          "커뮤니티는 사람을 모으기 위한 장치가 아니라, 리듬 위에서 자연스럽게 생겨나는 연결입니다."
        ]
      },
      platformFlow: {
        eyebrow: "Platform Flow",
        title: "공생 리듬 플랫폼의 흐름",
        description:
          "명상life는 명상을 파는 곳이 아닙니다. 매일 함께 깨어나는 생활 리듬을 키우고, 개인의 회복에서 공생 문화와 지구경영으로 나아가는 자리입니다.",
        items: [
          { step: "01", title: "오늘의 1분 명상", description: "먼저 1분, 자신에게 돌아오는 고요함을 체험합니다." },
          { step: "02", title: "무료 7일 챌린지", description: "아침 1분, 밤 3분을 쌓아가며 부드러운 생활 리듬을 만듭니다." },
          { step: "03", title: "LINE 커뮤니티", description: "매일 함께 깨어나기 위한 리마인드와 따뜻한 연결을 받습니다." },
          { step: "04", title: "월간 멤버십", description: "한 사람의 회복을 함께 살아가는 습관으로 길러갑니다." },
          { step: "05", title: "리더 성장", description: "주변을 밝히고 공생 문화를 지탱하는 사람으로 성장합니다." }
        ]
      },
      testimonials: {
        eyebrow: "Testimonials",
        title: "계속 이어가는 사람들의 이야기",
        description: "지금 이 순간에도, 누군가는 이 리듬을 이어가고 있습니다.",
        items: [
          { name: "미카 · 아침 리듬", quote: "아침 3분만 했는데도 출근 전 호흡이 정리되고 마음의 거칠음이 줄었습니다." },
          { name: "지수 · 마음 정리", quote: "점심에 1분만 돌아와도 하루 전체의 균형이 다시 잡히는 느낌이 듭니다." },
          { name: "엠마 · 집중 회복", quote: "혼자 억지로 버티는 느낌보다, 조용히 이어가는 감각이 생겨서 오래 가게 됩니다." }
        ]
      },
      membership: {
        eyebrow: "Membership",
        title: "월 ¥1,000부터 시작하는 멤버십",
        description: "무료 챌린지에서 자연스럽게 유료 지속으로 이어지도록 가치와 흐름을 단순하게 설계했습니다.",
        topButton: "멤버로 이어가기",
        plans: [
          {
            key: "free",
            name: "Free",
            price: "¥0",
            description: "우선 7일 동안 부드럽게 정리합니다.",
            features: ["7일 챌린지", "LINE 참여 링크", "AI 코치 1일 3회"],
            cta: "무료로 시작하기",
            href: "/challenge"
          },
          {
            key: "basic",
            name: "Basic",
            price: "¥1,000/월",
            description: "매일의 마음 회복을 무리 없이 이어갑니다.",
            features: ["AI 코치 무제한", "멤버 커뮤니티", "라이브 명상", "매일 아침 습관 설계"],
            cta: "Basic 시작하기",
            href: "basic",
            featured: true
          },
          {
            key: "leader",
            name: "Growth",
            price: "¥3,000/월",
            description: "실천을 깊게 하며 하루의 안정감을 더 단단히 키웁니다.",
            features: ["소규모 서클", "우선 이벤트 안내", "주간 심화 가이드", "실천 기록 리뷰"],
            cta: "Growth로 가기",
            href: "/pricing"
          },
          {
            key: "premium",
            name: "Inner Circle",
            price: "¥10,000/월",
            description: "더 깊고 조용하게 자신을 정리합니다.",
            features: ["월간 프리미엄 세션", "리트릿 우선 안내", "개별 지원 흐름", "Inner Circle 전용 접근"],
            cta: "Inner Circle 보기",
            href: "/pricing"
          }
        ]
      },
      retreats: {
        eyebrow: "Global Retreat Network",
        title: "세계로 이어지는 리트릿 흐름",
        description: "일상의 실천에서 시작해 세계 각지의 깊은 체험으로 확장됩니다.",
        items: [
          { place: "일본 이세", title: "정화와 시작", description: "조용한 전환점을 만드는 일본의 재시작 리트릿." },
          { place: "미국 세도나", title: "글로벌 각성 리트릿", description: "대지의 넓음 속에서 시야를 풀어내는 경험." },
          { place: "한국 제주 · 국학원", title: "철학과 리더 교육", description: "실천과 사상을 연결하는 깊은 배움의 거점." },
          { place: "뉴질랜드 Earth Village", title: "자연 치유와 공생 생활", description: "자연과 조화하며 본래의 리듬을 회복합니다." },
          { place: "유럽 테네리페", title: "유럽 리트릿 거점", description: "빛과 바람 속에서 고요함을 되찾는 체류형 프로그램." }
        ]
      },
      faq: {
        eyebrow: "FAQ",
        title: "자주 묻는 질문",
        items: [
          {
            question: "명상이 처음이어도 괜찮나요?",
            answer: "네. 아침 3분 음성 가이드부터 시작하므로 경험이 없어도 무리 없이 이어갈 수 있습니다."
          },
          {
            question: "LINE에 들어가지 않아도 참여할 수 있나요?",
            answer: "네. 다만 무료 챌린지 리마인드와 사람들과의 연결은 LINE 참여 시 더 편하게 받을 수 있습니다."
          },
          {
            question: "유료 회원이 되면 무엇이 달라지나요?",
            answer: "AI 코치 제한이 해제되고, 멤버 커뮤니티, 라이브 이벤트, 회복 음성, 지속 지원이 열립니다."
          },
          {
            question: "종교적인 내용인가요?",
            answer: "아니요. 명상life는 일상 속 스트레스 케어와 마음 회복에 초점을 둔 실천 플랫폼입니다."
          }
        ]
      },
      finalCta: {
        eyebrow: "Start now",
        title: "회복에서 연결로, 연결에서 공생으로.",
        description:
          "아침 3분 호흡에서 LINE 커뮤니티, AI 코치, 월간 멤버십, 리더 성장까지. 자신을 정리하는 일이 함께 살아가는 힘으로 이어집니다.",
        primary: "지금 시작하기",
        secondary: "7일 함께 시작하기",
        tertiary: "멤버로 이어가기"
      }
    },
    challengePage: {
      eyebrow: "7-Day Rhythm Challenge",
      title: "7일 동안 리듬으로 돌아오기",
      description: "하루 10분만. 잠시 멈추고 호흡과 감각을 정돈하면서 자신에게 돌아오는 흐름을 조용히 만들어 갑니다.",
      rhythmEyebrow: "Just 10 minutes a day",
      progressLabel: "Day",
      notStarted: "오늘 하루만 해도 충분합니다. 고요함은 아주 조금 돌아오는 데서 시작됩니다.",
      inProgress: "{count}일의 리듬이 조용히 쌓이고 있습니다. 서두르지 말고 오늘의 10분으로 돌아와 보세요.",
      complete: "7일의 리듬이 이제 당신의 하루 속에 부드럽게 자리 잡기 시작했습니다.",
      completedBadge: "리듬 유지됨",
      openBadge: "열기",
      startButton: "Start",
      todayButton: "Start today",
      guidanceEyebrow: "Today’s guidance",
      guidanceTitle: "지금의 10분은, 무엇을 더하는 시간이 아니라 돌아오는 시간입니다.",
      guidanceBody: "버튼을 누르면 먼저 1분만 조용히 호흡으로 돌아와 보세요. 그 다음에는 오늘의 주제를 마음속에 가볍게 두는 것만으로도 충분합니다.",
      bridgeMessage: "여기서부터는 혼자 계속하기보다, 서로 지지하는 환경이 있으면 리듬이 더 자연스럽게 이어집니다.",
      bridgeButton: "멤버로 이어가기",
      coachBridgeMessage: "여기서부터는 혼자 계속하기보다, 도와주는 흐름이 있으면 리듬이 더 자연스럽게 이어집니다.",
      coachBridgeButton: "AI 코치와 함께 이어가기",
      supportTitle: "계속하고 싶은 분께",
      supportDescription: "LINE과 AI 리듬 코치가 매일의 작은 실천을 도와줍니다.",
      lineButton: "LINE에 참여하기",
      coachButton: "AI 리듬 코치를 열기",
      endTitle: "이 리듬을, 이제 일상으로",
      endDescription: "7일 동안 느낀 작은 변화를 매일의 생활 속에서 계속 이어가 보세요.",
      memberButton: "멤버로 이어가기",
      repeatButton: "무료로 계속하기",
      days: [
        { day: 1, title: "Pause", focus: "잠시 멈추고 지금 여기로 돌아오는 감각을 떠올립니다." },
        { day: 2, title: "Breath", focus: "호흡의 길이를 조금 정돈하며 몸의 긴장을 풀어 줍니다." },
        { day: 3, title: "Distance from thoughts", focus: "생각에 휩쓸리지 않고 조금 떨어져 바라보는 여백을 만듭니다." },
        { day: 4, title: "Emotional reset", focus: "감정을 억누르지 않고 부드럽게 흘려보내는 감각을 기릅니다." },
        { day: 5, title: "Build rhythm", focus: "매일 같은 자리로 돌아오며 자연스러운 생활 리듬을 만듭니다." },
        { day: 6, title: "Connection", focus: "나 자신을 넘어 사람과 공간과의 연결에도 고요함을 넓혀 갑니다." },
        { day: 7, title: "Integration", focus: "이 7일의 감각을 앞으로의 일상 속에 조용히 가져갑니다." }
      ]
    },
    challengeForm: {
      name: "이름",
      namePlaceholder: "홍길동",
      email: "이메일 주소",
      lineId: "LINE ID (선택)",
      stress: "현재 스트레스 정도 (1~10)",
      submit: "LINE으로 무료 참여하기",
      submitting: "등록 중입니다...",
      error: "등록에 실패했습니다. 잠시 후 다시 시도해 주세요."
    },
    pricingPage: {
      eyebrow: "Membership",
      title: "1분 회복에서 일상 리듬, 뇌의 주인, 공생으로",
      description:
        "명상life의 회원은 명상 콘텐츠를 사는 사람이 아닙니다. 1분 회복에서 시작해 일상의 리듬, 뇌의 주인으로 살아가는 힘, 공생 문화로 나아가는 사람들입니다.",
      checkoutNote: "결제 후 이 화면으로 돌아오면 다음 단계로 이어집니다",
      badges: ["Apple처럼 조용하고 명확하게", "일본 웰니스다운 여백", "지금 바로 시작할 수 있는 흐름"],
      supportText:
        "Free는 마음의 과부하를 1분 안에 부드럽게 돌려놓는 입구입니다.\nBasic은 매일 돌아오는 생활 리듬을 만듭니다.\nGrowth는 AI와 함께 뇌의 주인으로 살아가는 감각을 깊게 합니다.\nInner Circle은 공생 문화와 문명 비전을 떠받치는 리더의 장입니다.",
      voicesEyebrow: "Voices",
      voicesTitle: "들어오길 잘했다는 이야기",
      voicesButton: "커뮤니티 보기",
      trustBadges: ["신용카드 안전 결제", "언제든 해지 가능", "모바일만으로 바로 시작", "한국어/일본어 지원"],
      plans: [
        {
          key: "basic",
          name: "BASIC",
          price: "¥1,000",
          dailyCost: "약 ¥33 / day",
          emotionalCopy: "Life Rhythm",
          description: "1분 회복과 작은 일상 실천으로 안정된 생활 리듬을 만들어갑니다.",
          features: ["매일의 1분 리커버리", "밤 3분 가이드", "7일 리듬 지속", "아침 습관 설계"],
          cta: "월 1,000엔으로 이어가기",
          orderClass: "order-2 lg:order-1",
          accentClass: "border-white/60 bg-white/75"
        },
        {
          key: "leader",
          name: "GROWTH",
          price: "¥3,000",
          dailyCost: "약 ¥100 / day",
          emotionalCopy: "Brain Owner",
          description: "AI 가이드와 뇌교육 실천을 통해 감정, 생각, 관계의 균형을 회복합니다.",
          features: ["AI 리듬 가이드 깊이 활용", "소규모 서클", "공생 생활 실천 대화", "실천 기록 리뷰"],
          cta: "월 3,000엔으로 깊게",
          orderClass: "order-1 lg:order-2",
          accentClass: "border-emerald-300 bg-gradient-to-b from-white to-emerald-50/70 shadow-[0_24px_60px_rgba(5,150,105,0.12)]"
        },
        {
          key: "premium",
          name: "INNER CIRCLE",
          price: "¥10,000",
          dailyCost: "약 ¥333 / day",
          emotionalCopy: "Coexistence Circle",
          description: "창립자 지혜, 커뮤니티, 리더 성장 흐름 속에서 공생을 실천해가는 장입니다.",
          features: ["월간 프리미엄 세션", "리트릿 우선 안내", "지구경영 비전 대화", "Inner Circle 전용 접근"],
          cta: "월 10,000엔으로 지지하기",
          orderClass: "order-3 lg:order-3",
          accentClass: "border-amber-200/80 bg-white/75"
        }
      ],
      testimonials: [
        {
          name: "미카 님 · 49세",
          quote: "BASIC에 들어온 뒤부터 아침 1분만으로도 마음이 정리되는 감각을 매일 느끼게 됐습니다."
        },
        {
          name: "켄이치 님 · 57세",
          quote: "GROWTH는 혼자 버틴다는 느낌이 줄어들어 훨씬 꾸준히 이어가기 좋았습니다."
        },
        {
          name: "유키 님 · 52세",
          quote: "INNER CIRCLE은 조용하고 품질이 높아요. 바쁜 일상 속에서도 안심하고 돌아올 자리가 생겼습니다."
        }
      ]
    },
    welcomeMember: {
      eyebrow: "Welcome back",
      firstTitle: "다시 돌아왔습니다.\n여기서부터는 끊기지 않는 리듬입니다.",
      returningTitle: "다시 돌아오셨습니다.\n오늘도 1분만 정돈해봅시다.",
      body: "무언가를 산 것이 아니라, 나에게 돌아오는 자리로 다시 온 것입니다.",
      primary: "지금 1분 시작하기",
      secondary: "LINE으로 함께 이어가기"
    },
    welcomePage: {
      title: "명상life에 오신 것을 환영합니다",
      subtitle: "당신의 리듬은 여기서부터 시작됩니다.",
      memberProgramTitle: "멤버 리듬 시작하기",
      memberProgramDescription: "결제가 완료되었다면, 여기서부터 Basic 리듬 프로그램을 시작할 수 있습니다.",
      memberProgramButton: "Basic 리듬 프로그램으로 이동",
      coachTitle: "AI 리듬 코치",
      coachDescription: "혼자 이어가기 어려운 날에도 조용히 돌아오도록 도와줍니다",
      steps: [
        "LINE으로 리듬 알림 받기",
        "AI 리듬 코치 열기",
        "오늘의 1분 명상 시작하기"
      ],
      lineButton: "LINE에 참여하기",
      coachButton: "AI 리듬 코치를 열기",
      meditationButton: "오늘의 1분을 시작하기",
      challengeButton: "7일 리듬 시작하기",
      tertiary: "홈으로 돌아가기",
      fallback: "링크는 곧 준비됩니다."
    },
    programPages: {
      basic: {
        eyebrow: "Basic Program",
        title: "Basic 리듬 프로그램",
        description: "7일 동안, 매일 3분. 자신의 중심으로 조용히 돌아가기 위한 입문 프로그램입니다.",
        intro: "크게 달라지려 하지 않아도 괜찮습니다. 매일 조금씩 돌아오는 것만으로도 마음과 몸의 리듬은 자연스럽게 정돈되기 시작합니다.",
        dayLabel: "Day",
        goalLabel: "Goal",
        practiceLabel: "Practice",
        openBadge: "열림",
        completedBadge: "완료",
        days: [
          { day: 1, title: "멈추기", goal: "지금 여기에서 한 번 멈추고, 호흡으로 돌아옵니다.", practice: "3분 호흡", button: "Day 1 시작하기" },
          { day: 2, title: "호흡", goal: "호흡을 길게 하며 마음의 잔물결을 조용히 풀어줍니다.", practice: "4-2-4 호흡 3분", button: "Day 2 시작하기" },
          { day: 3, title: "몸 감각", goal: "생각에서 조금 떨어져 몸의 감각을 통해 지금 여기로 돌아옵니다.", practice: "바디 스캔 3분", button: "Day 3 시작하기" },
          { day: 4, title: "감정 리셋", goal: "감정을 억누르지 않고, 부드럽게 흘려보냅니다.", practice: "감정 바라보기 3분", button: "Day 4 시작하기" },
          { day: 5, title: "하루의 리듬", goal: "아침·낮·밤에 작게 돌아오는 리듬을 만듭니다.", practice: "1분 × 3회", button: "Day 5 시작하기" },
          { day: 6, title: "연결", goal: "혼자 애쓰는 것이 아니라 함께 이어가는 감각을 기릅니다.", practice: "연결 명상 3분", button: "Day 6 시작하기" },
          { day: 7, title: "통합", goal: "7일간의 변화를 앞으로의 일상 안으로 조용히 가져옵니다.", practice: "통합 명상 3분", button: "Day 7 시작하기" }
        ],
        bottomTitle: "이 리듬을 계속하기 위해",
        bottomDescription: "Basic 프로그램은 완벽하게 해내기 위한 것이 아닙니다. 다시 돌아올 자리를 만드는 작은 입구입니다.",
        bottomPrimary: "오늘의 1분으로 돌아가기",
        bottomSecondary: "7일 챌린지 보기",
        bottomTertiary: "홈으로 돌아가기"
      },
      growth: {
        eyebrow: "Growth Program",
        title: "Growth 리듬 프로그램",
        description: "혼자 애쓰는 것이 아니라, 함께 이어가며 리듬을 더 깊게 키워갑니다.",
        intro: "Growth는 매일의 작은 실천을 이어가면서, 주간 테마와 동료와의 연결을 통해 더 안정적인 생활 리듬을 기르는 프로그램입니다.",
        weekLabel: "Week",
        goalLabel: "Description",
        practiceLabel: "Practice",
        weeks: [
          { week: 1, title: "정돈하기", goal: "아침·낮·밤의 기본 리듬을 안정시킵니다.", practice: "매일 3분 + 주 1회 돌아보기", button: "Week 1 시작하기" },
          { week: 2, title: "이어가기", goal: "계속되지 않는 이유를 탓하지 않고, 다시 돌아오는 구조를 만듭니다.", practice: "하루 1회 리듬 기록", button: "Week 2 시작하기" },
          { week: 3, title: "연결되기", goal: "동료와 함께 이어가는 감각을 기릅니다.", practice: "LINE 커뮤니티 참여 + 공유", button: "Week 3 시작하기" },
          { week: 4, title: "기르기", goal: "생활 속에서 자연스럽게 돌아올 수 있는 리듬을 기릅니다.", practice: "주간 리뷰 + 다음 목표 설정", button: "Week 4 시작하기" }
        ],
        communityTitle: "함께 이어가는 자리",
        communityDescription: "Growth에서는 혼자 완벽하게 해내는 것보다, 다시 돌아올 수 있는 자리를 가지는 것을 더 소중히 여깁니다.",
        lineButton: "LINE 커뮤니티로",
        coachButton: "AI 리듬 코치 열기",
        meditationButton: "오늘의 1분으로 돌아가기",
        fallback: "링크는 곧 준비됩니다.",
        bottomTitle: "더 깊게 가고 싶다면",
        bottomDescription: "리듬을 생활을 넘어 삶과 공생 문화의 실천으로 더 깊게 키우고 싶다면 Inner Circle로 나아갈 수 있습니다.",
        bottomButton: "Inner Circle 보기"
      },
      inner: {
        eyebrow: "Inner Circle",
        title: "Inner Circle 공생 리더 프로그램",
        description: "자신의 리듬을 정돈하는 것을 넘어, 주변과 함께 깨어 살아가는 문화를 길러갑니다.",
        intro: "Inner Circle은 명상, 생활 리듬, 공생 문화, 지구시민 의식을 깊게 하며 일상 속에서 조용히 장을 길러가는 리더를 위한 프로그램입니다.",
        moduleLabel: "Module",
        goalLabel: "Description",
        practiceLabel: "Practice",
        modules: [
          { module: 1, title: "자기 리듬의 확립", goal: "자신의 중심으로 돌아오는 매일의 리듬을 안정시킵니다.", practice: "아침·낮·밤 리듬 실천", button: "Module 1 시작하기" },
          { module: 2, title: "공생 커뮤니케이션", goal: "사람을 바꾸려 하기보다, 함께 정돈되는 관계를 기릅니다.", practice: "대화와 알아차림의 실천", button: "Module 2 시작하기" },
          { module: 3, title: "장 만들기", goal: "사람을 모으기보다, 자연스럽게 다시 돌아오는 장을 기릅니다.", practice: "작은 리듬 공간 설계", button: "Module 3 시작하기" },
          { module: 4, title: "지구시민 · 공생 문화", goal: "개인의 실천을 사회와 지구를 위한 공생 문화로 넓혀갑니다.", practice: "지구시민 의식과 실천 계획", button: "Module 4 시작하기" }
        ],
        supportTitle: "Inner Circle 전용 지원",
        supportDescription: "월간 프리미엄 세션, 리트릿 우선 안내, 개별 지원 흐름을 통해 리듬을 삶과 활동 안으로 더 깊게 키워갑니다.",
        supportCards: [
          { title: "월간 프리미엄 세션", description: "한 달에 한 번, 깊은 주제로 자신을 정돈하는 시간을 가집니다." },
          { title: "리트릿 우선 안내", description: "자연, 성지, 파워스폿에서의 실천 기회를 우선적으로 안내받습니다." },
          { title: "개별 지원 흐름", description: "필요에 따라 지금 상태에 맞는 다음 한 걸음을 제안합니다." },
          { title: "공생 문화 프로젝트", description: "자신만이 아니라 주변과 사회로 퍼지는 실천을 길러갑니다." }
        ],
        actionTitle: "오늘부터, 조용히 장을 기르기",
        actionDescription: "Inner Circle은 특별한 사람이 되기 위한 곳이 아닙니다. 자신에게 돌아오고, 그 고요함으로 주변을 비추기 위한 자리입니다.",
        meditationButton: "오늘의 3분 시작하기",
        coachButton: "AI 리듬 코치 열기",
        lineButton: "LINE 커뮤니티로",
        growthButton: "Growth 프로그램 보기",
        fallback: "링크는 곧 준비됩니다."
      }
    },
    loginPage: {
      eyebrow: "Login",
      title: "회원 로그인",
      subtitle: "로그인 후 당신의 리듬을 이어갑니다",
      email: "이메일",
      password: "비밀번호",
      button: "로그인하기",
      signupButton: "새로 등록하기",
      checking: "확인하고 있습니다...",
      unavailable: "현재 연결 상태를 확인하고 있습니다.",
      logout: "로그아웃",
      signupSuccess: "등록 확인 메일을 보냈습니다. 확인 후 로그인해 주세요.",
      signupError: "현재 연결 상태를 확인하고 있습니다.",
      loading: "처리 중...",
      error: "로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요."
    },
    meditationPage: {
      durationTexts: {
        sixty: {
          topText: "지금 여기서, 60초만 호흡으로 돌아와 봅시다",
          completionTitle: "60초 동안, 지금 여기로 돌아왔습니다."
        },
        threeMinutes: {
          topText: "지금 여기서, 3분간 천천히 호흡을 따라가 봅시다",
          completionTitle: "3분 동안, 호흡의 리듬으로 돌아왔습니다."
        }
      },
      variants: {
        default: {
          topText: "지금 여기서, 60초만 호흡으로 돌아와 봅시다",
          intro: "무언가를 바꾸려 하지 않아도 됩니다. 조용히, 호흡의 리듬으로 돌아오기만 하면 됩니다.",
          completionTitle: "60초 동안, 지금 여기로 돌아왔습니다."
        },
        morning: {
          topText: "아침 3분으로, 오늘의 결을 조용히 정돈해봅시다",
          intro: "막 깨어난 몸과 마음을 부드럽게 깨우며 오늘의 시작을 차분하게 맞이합니다.",
          completionTitle: "아침의 리듬이 정돈되었습니다. 오늘을 조용히 시작해봅시다."
        },
        day: {
          topText: "지금 여기서, 60초만 호흡으로 돌아와 봅시다",
          intro: "바쁨의 흐름을 잠시 풀고, 자신의 중심으로 짧게 돌아오는 시간입니다.",
          completionTitle: "60초 동안, 지금 여기로 돌아왔습니다."
        },
        night: {
          topText: "밤의 3분으로, 오늘을 조용히 놓아줍시다",
          intro: "하루의 긴장을 조금씩 풀며 잠들기 전 마음과 몸을 부드럽게 닫아갑니다.",
          completionTitle: "밤의 리듬이 정돈되었습니다. 오늘을 조용히 놓아줍시다."
        }
      },
      phases: {
        inhale: "들이쉬기",
        hold: "멈추기",
        exhale: "내쉬기"
      },
      bottomText: {
        inhale: "들이쉬기… 4초",
        hold: "멈추기… 2초",
        exhale: "내쉬기… 4초"
      },
      completionMessage: "수고했어요.\n지금의 고요함을,\n잠시만 느껴보세요.",
      completionReturnText: "또 돌아와 주세요.",
      completionBody: "이 조용한 리듬을 7일만 더 이어가 보시겠어요?",
      completionPrimary: "7일 리듬 시작하기",
      completionSecondary: "오늘은 여기까지",
      coachPrompt: "이 조용한 상태를 조금만 더 이어가 볼까요?",
      coachButton: "AI 코치를 열기",
      soundOn: "자연음 ON",
      soundOff: "자연음 OFF",
      vibrationOn: "진동 켜기",
      vibrationOff: "진동 끄기",
      natureLabel: "자연의 리듬과 함께 호흡하기"
    },
    premiumPage: {
      successBadge: "결제가 완료되었습니다",
      title: "프리미엄 접근",
      subtitle: "멤버십이 활성화되었습니다. 이제 유료 리듬을 이어갈 수 있습니다.",
      description: "리듬은 이미 시작되었습니다. 오늘 가능한 한 걸음부터 조용히 이어가 보세요.",
      currentPlan: "현재 플랜",
      planLabels: {
        basic: "Basic",
        growth: "Growth",
        inner_circle: "Inner Circle"
      },
      primary: "프로그램 열기",
      secondary: "오늘의 명상 시작하기",
      tertiary: "요금 페이지 보기"
    },
    membershipSuccessPage: {
      badge: "멤버십 활성화",
      title: "결제가 완료되었습니다.",
      subtitle: "당신의 명상life 멤버십이 활성화되었습니다.",
      body: "자신에게 돌아오는 리듬이 오늘부터 당신의 일상 안에서 시작됩니다.",
      emailSentNote: "확인 메일을 보내드렸습니다. 메일함을 확인해 주세요.",
      activeTierLabel: "Activated membership",
      planLabels: {
        basic: "Basic",
        growth: "Growth",
        inner_circle: "Inner Circle"
      },
      steps: ["LINE 커뮤니티에 참여하기", "AI 리듬 코치 열기", "오늘의 1분 리듬 이어가기"],
      lineButton: "LINE 커뮤니티로",
      coachButton: "AI 코치 열기",
      rhythmButton: "오늘의 리듬으로 돌아가기",
      programButton: "멤버 프로그램 열기",
      dashboardButton: "대시보드로"
    },
    membershipPage: {
      title: "멤버십 안내",
      subtitle: "유료 리듬을 이어갈 준비가 되면 여기서 다시 시작할 수 있습니다.",
      canceled: "결제가 완료되지 않았습니다. 준비가 되면 다시 조용히 돌아와 주세요.",
      primary: "요금 페이지로",
      secondary: "홈으로 돌아가기"
    },
    brainEducationPage: {
      eyebrow: "Brain Education",
      title: "뇌교육에 대하여",
      subtitle: "뇌교육은 호흡, 신체 감각, 의식을 통해 자신의 상태를 알아차리고 정돈하며 다시 선택할 수 있게 돕는 실천적 시스템입니다.",
      intro:
        "명상life는 이 뇌교육의 관점을 오늘의 생활 리듬에 맞게 다시 설계해, 더 조용하고 더 쉽게 이어갈 수 있는 형태로 풀어내고 있습니다.",
      sections: [
        {
          title: "1. What is Brain Education?",
          body: "뇌교육은 뇌를 단순한 지식 저장소가 아니라, 감각과 감정, 의식을 조율하는 살아 있는 중심으로 보는 실천입니다."
        },
        {
          title: "2. 5 Brain Education stages",
          body: "감각 알아차림에서 시작해 감정 조율, 의식의 선택, 행동의 일관성, 그리고 타인과의 공생으로 조용히 깊어집니다."
        },
        {
          title: "3. Modern problems & solutions",
          body: "스트레스, 불안, 수면 문제, SNS 피로 같은 현대적 과제에 대해 먼저 호흡과 몸감각으로 돌아오는 입구를 만듭니다."
        },
        {
          title: "4. Emotional balance",
          body: "감정을 억누르기보다 느끼고 정돈하며 흘려보내는 힘을 기르면서 일상의 안정감을 회복합니다."
        },
        {
          title: "5. Human potential",
          body: "뇌와 마음의 가능성을 깨운다는 것은 특별해지는 것이 아니라, 본래의 자신에게 더 가까이 돌아가는 일입니다."
        },
        {
          title: "6. Coexistence philosophy",
          body: "뇌교육은 개인의 회복에서 멈추지 않고, 그 고요함이 관계와 공동체의 질을 바꾸는 것을 중요하게 봅니다."
        },
        {
          title: "7. Founder story",
          body: "ILCHI LEE는 40년이 넘는 시간 동안 인간 내면의 가능성과 일상에서 지속되는 실천의 형태를 탐구해 왔습니다."
        },
        {
          title: "8. Global impact",
          body: "세계 여러 지역의 교육과 실천을 통해 많은 사람들이 자신에게 돌아오는 습관과 공생 감각을 길러왔습니다."
        }
      ],
      founderMessageTitle: "창시자의 깊은 메시지",
      founderMessageSubtitle: "몸을 통해, 마음과 의식을 깨워갑니다.",
      founderMessageBody:
        "사람의 중심은,\n멀리 있는 것이 아닙니다.\n\n호흡 안에 있고,\n몸의 감각 안에 있으며,\n지금 이 순간의 선택 안에 있습니다.\n\n정보가 많아지고 AI가 진화하는 시대일수록,\n인간에게는 자기의 온도를 알고,\n자신의 상태를 정돈하는 힘이 필요합니다.\n\n생각이 많아졌을 때는,\n몸을 식히고 고요함으로 돌아갑니다.\n\n힘이 부족할 때는,\n몸을 움직여 생명력을 높입니다.\n\n몸의 상태는,\n마음의 상태와 이어져 있습니다.\n\n그래서,\n한 시간에 한 번이라도,\n1분이라도, 2분이라도,\n자신의 상태를 느끼고,\n호흡하고, 웃고, 몸을 움직이는 일이 중요합니다.\n\n미소는,\n마음을 여는 첫 번째 근육입니다.\n\n반응하는 힘,\n응원하는 힘,\n사랑을 표현하는 힘은,\n매일의 작은 실천에서 자라납니다.\n\n공생은,\n특별한 이념이 아니라,\n생활 속에서 서로를 살리는 선택입니다.\n\n한 사람이 정돈되면,\n주변의 공기가 달라집니다.\n\n한 사람이 깨어나면,\n공동체의 리듬이 달라집니다.\n\nAI 시대에 필요한 것은,\n단순한 지식이 아니라,\n사람을 살리는 지성입니다.\n\n그것이,\n공생지능이며,\n홍익의 지성입니다.\n\n명상life는,\n작은 1분의 실천에서부터,\n사람이 본래의 중심으로 돌아오고,\n함께 깨어나는 문화를 길러갑니다.",
      primary: "오늘의 1분으로 돌아가기",
      secondary: "홈으로 돌아가기"
    },
    common: {
      connecting: "연결 중...",
      comingSoon: "Checkout is not configured yet."
    }
  },
  en: {
    header: {
      brand: "Meisou Life",
      login: "Log In",
      freeJoin: "Free Join",
      myPage: "My Page",
      myProgram: "My Program",
      logout: "Logout",
      languageSettings: "Language",
      customerSupport: "Support",
      billingMembership: "Billing & Membership",
      menu: "Menu",
      close: "Close",
      mobileGuestTabs: [
        { href: "/", label: "Home" },
        { href: "/challenge", label: "Challenge" },
        { href: "/pricing", label: "Pricing" },
        { href: "/community", label: "Community" },
        { href: "/leaders", label: "Leader Growth" }
      ],
      mobileMemberTabs: [
        { href: "/", label: "Home" },
        { href: "/program/basic", label: "My Program" },
        { href: "/pricing", label: "Pricing" },
        { href: "/community", label: "Community" },
        { href: "/member", label: "My Page" }
      ],
      mobileGuestMenu: [
        { href: "/", label: "Home" },
        { href: "/challenge", label: "Challenge" },
        { href: "/pricing", label: "Pricing" },
        { href: "/community", label: "Community" },
        { href: "/leaders", label: "Leader Growth" }
      ],
      mobileMemberMenu: [
        { href: "/", label: "Home" },
        { href: "/pricing", label: "Pricing" },
        { href: "/community", label: "Community" }
      ],
      nav: [
        { href: "/", label: "Home" },
        { href: "/challenge", label: "7-Day Challenge" },
        { href: "/pricing", label: "Pricing" },
        { href: "/community", label: "Community" },
        { href: "/leaders", label: "Leader Path" }
      ],
      mobileMenu: [
        { href: "/", label: "Home" },
        { href: "/#one-minute-experience", label: "1-Minute Recovery" },
        { href: "/#ai-rhythm-coach", label: "AI Coach" },
        { href: "/pricing", label: "Pricing" },
        { href: "/program/basic", label: "Programs" },
        { href: "/community", label: "Community" },
        { href: "/challenge", label: "Start Free" }
      ]
    },
    community: {
      eyebrow: "COMMUNITY",
      headline: "This is not a place to push harder. It is a place to wake up together, every day.",
      subcopy:
        "Don’t let one minute of stillness end alone. Continue through the 7-day challenge and a shared community rhythm.",
      lineCommunityTitle: "A 7-day entrance to begin together",
      lineCommunityDescription:
        "A free community with morning reminders, evening reflection, and 7-day challenge guidance.",
      lineCommunityCTA: "Join the Community",
      rhythmTitle: "From free entry into a member rhythm",
      rhythmDescription:
        "A gentle entry into Basic membership, where personal recovery becomes a daily rhythm you can continue with others.",
      rhythmCTA: "Continue with Basic",
      supportTitle: "A path into shared leadership",
      supportDescription:
        "A calm path for people who want to support the rhythm of awakening together and grow into leadership.",
      supportCTA: "View the leader form",
      memberCommunityTitle: "A community flow that helps you continue",
      memberCommunityDescription:
        "Daily check-ins, small wins, questions, events, and leadership growth are connected in one steady community rhythm.",
      channels: ["Daily Check-in", "Wins Today", "Questions", "Events", "Leaders"]
    },
    leaders: {
      eyebrow: "LEADER GROWTH",
      headline: "From daily practice to conscious leadership",
      subcopy:
        "Leader Growth in Meditation Life is not just about joining. It is a path of consistency, trust, contribution, and supporting others in a shared rhythm of awakening.",
      stage1Label: "STAGE 1",
      stage1Title: "Member",
      stage1Description: "Begin by calming your own mind and stabilizing your daily practice.",
      stage2Label: "STAGE 2",
      stage2Title: "Practice Member",
      stage2Description: "Keep your own rhythm and begin sharing small practices with people around you.",
      stage3Label: "STAGE 3",
      stage3Title: "Coexistence Leader",
      stage3Description: "Create spaces of shared awakening and support the practice and growth of others.",
      ctaTitle: "Grow as a leader together",
      ctaDescription:
        "Meditation Life is not a path of growing alone. It is a journey of creating a culture of awakening together.",
      ctaButton: "Start Leader Growth",
      promotionRule: "Promotion Rule",
      promotionTitle: "Requirements to become a leader candidate",
      paidDaysLabel: "Paid membership",
      checkInCountLabel: "Check-ins",
      helpfulCommentsLabel: "Helpful comments",
      currentLabel: "Current",
      daysTargetSuffix: " days",
      daysValueSuffix: " days",
      countTargetSuffix: "+",
      countValueSuffix: "",
      invitationLabel: "Invitation",
      invitationReadyTitle: "You have been invited to the leader program",
      invitationProgressTitle: "Your progress toward leader candidacy",
      invitationReadyDescription:
        "This is judged from real Supabase data, and once the conditions are met it is shown automatically on the dashboard as well.",
      invitationProgressDescription:
        "Based on real Supabase data, this shows what still needs to be built up next.",
      dashboardButton: "Check in dashboard",
      communityButton: "See the community flow",
      leaderFormButton: "Go to leader form",
      visionEyebrow: "2030 Vision",
      visionTitle: "Toward 100,000 coexistence leaders by 2030",
      visionDescription:
        "A leader in Meditation Life is not someone who gathers people. It is someone who returns to themselves each day, brightens those around them, and supports a rhythm of awakening together. One person’s practice can change a family, a workplace, a community, and the Earth. We will expand that quiet current to 100,000 people by 2030."
    },
    footer: {
      brand: "Meisou Life",
      line1: "From recovery to coexistence. From coexistence to earth stewardship.",
      line2: "Meisou Life — from recovery to coexistence. From coexistence to earth stewardship.",
      links: [
        { href: "/challenge", label: "Free Join" },
        { href: "/pricing", label: "Pricing" },
        { href: "/community", label: "Community" },
        { href: "/leaders", label: "Leader Path" },
        { href: "/retreats", label: "Retreats" }
      ]
    },
    lineInvite: {
      title: "Do not let this rhythm end alone.",
      subtitle: "This LINE community helps you continue small daily practice together.",
      morning: "Morning — Take 1 minute to breathe",
      evening: "Evening — Check your day",
      button: "Continue together on LINE",
      note: "You can turn notifications off anytime. You can join quietly.",
      afterMessage: "Let’s begin again with this one minute tomorrow.",
      toast: "You are connected on LINE. Please come back here tomorrow too."
    },
    modal: {
      eyebrow: "1-Minute Meditation",
      title: "Gently return to your breath",
      endButton: "End the minute",
      completeTitle: "Today, you returned to yourself.",
      completionMessage: "Well done.\nStay with this stillness\nfor just a moment.",
      completionReturnText: "Please come back again.",
      completeBody: "This small breath is the beginning of a shared awakening rhythm.",
      durationTexts: {
        sixty: {
          title: "For the next 60 seconds, gently return to your breath.",
          completionBody: "These quiet 60 seconds are the beginning of a shared awakening rhythm.",
          completionMoments: [
            "Thank you for giving yourself these 60 seconds.",
            "Stillness has always been within you."
          ]
        },
        threeMinutes: {
          title: "For the next 3 minutes, gently follow the rhythm of your breath.",
          completionBody: "These quiet 3 minutes are the beginning of a shared awakening rhythm.",
          completionMoments: [
            "Thank you for giving yourself these 3 minutes.",
            "Stillness has always been within you."
          ]
        }
      },
      completionMoments: [
        "Thank you for giving yourself these 60 seconds.",
        "Stillness has always been within you."
      ],
      breatheAgain: "Breathe once more",
      tellAi: "Tell AI how you feel now",
      soundOn: "Nature ON",
      soundOff: "Nature OFF",
      vibrationOn: "Vibration on",
      vibrationOff: "Vibration off",
      natureLabel: "Breathe with the rhythm of nature",
      natureMicrocopy: "When you feel tired,\ncome back here.",
      phaseLabels: {
        inhale: "Inhale",
        hold: "Stay here",
        exhale: "Exhale"
      },
      reflectionQuestion: "How do you feel right now?",
      breathingGuides: [
        { text: "Inhale... 4s", duration: 4000 },
        { text: "Hold... 3s", duration: 3000 },
        { text: "Exhale... 5s", duration: 5000 }
      ],
      reflections: [
        {
          key: "calm",
          label: "A little calmer",
          message: "Let that feeling continue a little tomorrow too.",
          ctaLabel: "Return here tomorrow"
        },
        {
          key: "deepen",
          label: "I want to go a little deeper",
          message: "Would you like to deepen this rhythm a little more?",
          ctaLabel: "See the deeper rhythm"
        },
        {
          key: "together",
          label: "It is hard to continue alone",
          message: "When it is hard to continue alone, there is a place to return together.",
          ctaLabel: "Continue together on LINE"
        }
      ]
    },
    home: {
      heroEyebrow: "Coexistence Meditation Ecosystem",
      heroTitle: "Would you like to begin a rhythm of awakening together now?",
      heroDescription:
        "Meisou Life is not a place to push through alone. Through small daily practice, it gently helps settle mind, body, relationships, and daily life into a calm coexistence rhythm platform.",
      heroPrimary: "Start the 60-second rhythm",
      heroSecondary: "Become a member",
      imageAlt: "A quiet morning meditation scene",
      rhythmExperience: {
        eyebrow: "Today’s Coexistence Rhythm",
        title: "Morning, daytime, and night — one return point each",
        description: "Nothing dramatic is required. When you return to the same place three times a day, the outline of mind and body begins to settle quietly.",
        cards: [
          {
            key: "morning",
            eyebrow: "Morning 3 min",
            title: "Morning 3 min",
            description: "Settle the breath and body right after waking so the day begins from a quieter place.",
            button: "Start the morning rhythm"
          },
          {
            key: "daytime",
            eyebrow: "Daytime 1 min",
            title: "Daytime 1 min",
            description: "A brief pause in the middle of the day to return to your own center.",
            button: "Start the 60-second rhythm"
          },
          {
            key: "night",
            eyebrow: "Night 3 min",
            title: "Night 3 min",
            description: "Release the tension of the day and soften mind and body before sleep.",
            button: "Start the night rhythm"
          }
        ]
      },
      todayRhythmEyebrow: "Today's Rhythm",
      todayRhythmNotStarted: "Even if you have not started yet, today can begin with just one minute of returning to yourself.",
      todayRhythmCompletedTitle: "You are continuing this rhythm",
      todayRhythmCompletedDescription: "Even beyond seven days, stillness can continue gently in everyday life.",
      todayRhythmButton: "Start today’s rhythm",
      returnEyebrow: "Your place to return",
      returnTitle: "When you return to the same place each day, rhythm settles naturally",
      returnReturning: "Welcome back. Let’s take just one minute today.",
      returnFirst: "Even on busy days, one place to return to helps the breath settle quietly.",
      returnStreak: "{count} days in rhythm",
      returnStart: "You can begin quietly today",
      returnButton: "Start your one minute today",
      rhythmSignals: {
        completed: "Today’s rhythm is complete",
        notCompleted: "Today’s rhythm has not started yet",
        streak: "{count} days in rhythm",
        practicingNow: "Now practicing together: {count} people",
        waiting: "The rhythm is waiting for you.",
        milestones: ["3 days", "7 days", "30 days"],
        anchors: {
          morning: "Morning rhythm",
          daytime: "Daytime rhythm",
          night: "Night rhythm"
        }
      },
      dailyRhythmEyebrow: "Daily Rhythm",
      dailyRhythmBadge: "Local",
      checkInTitle: "Today’s Mind Check-in",
      checkInDescription: "Choose one feeling for today. A small record helps your rhythm settle each day.",
      checkInReactions: {
        "😀": "Good. Let that brightness move into one small action today.",
        "🙂": "Honor that calm. Move through today gently.",
        "😐": "Some days feel neutral. One minute of breathing is enough.",
        "😔": "You may be tired. Today, choose rest over effort.",
        "😣": "Noticing the heaviness is already the beginning of recovery. Start with one deep exhale."
      },
      liveEyebrow: "Live Together",
      liveBadge: "Live-ready",
      liveTitle: "18 people are meditating together right now",
      liveDescription: "A quiet connection is growing across the world in real time.",
      challengeEyebrow: "Challenge",
      challengeTitle: "Begin 7 Days Together",
      challengeDescription:
        "When one minute of stillness is repeated for seven days, breath, emotion, sleep, gratitude, relationships, focus, and direction begin to settle gently.",
      challengeProgress: "Day 1 / 7",
      challengeButton: "Begin 7 Days Together",
      sevenDay: {
        eyebrow: "7-Day Rhythm",
        title: "A 7-day rhythm of awakening together",
        description: "From personal recovery to the power to live together. Small daily shifts change the quality of life and the light you bring to others.",
        continuationTitle: "Do not let this rhythm end alone.",
        continuationDescription: "Continue as a Meisou Life member."
      },
      cards: [
        {
          eyebrow: "Why now",
          title: "A settled mind becomes the foundation of coexistence now",
          description:
            "In an age of constant stimulation, the ability to settle yourself changes how you relate to others. Three quiet minutes in the morning support judgment, sleep, emotional recovery, and a gentler community life."
        },
        {
          eyebrow: "Challenge",
          title: "Build a seven-day habit without attacking yourself",
          description: "A short morning audio, LINE reminders, and simple recording help even busy people begin without strain."
        },
        {
          eyebrow: "AI Coach",
          title: "You are not left alone in the moment you unravel",
          description: "For days of fatigue, anxiety, or restless sleep, an AI coach helps settle breath and feeling in just three minutes."
        }
      ],
      founder: {
        eyebrow: "Founder Philosophy",
        title: "Stillness can become a force that changes daily life",
        intro: "Meisou Life is grounded in a practical, modern approach for building self-awareness in everyday life.",
        founderName: "ILCHI LEE (Founder of Brain Education)",
        founderDescription:
          "Ilchi Lee is an educator and practitioner who has spent decades exploring how self-awareness and inner balance can be cultivated as a daily way of living.",
        contributionsTitle: "Brain Education",
        contributions: [
          "Brain Education is the core system: a practical method for noticing, regulating, and consciously directing one’s internal state through breath, body awareness, and attention.",
          "Dahn Yoga extends that experience into daily life, helping people embody this awareness as a sustainable rhythm rather than a one-time exercise."
        ],
        philosophyTitle: "Why it matters here",
        philosophyDescription:
          "Meisou Life translates that system into a modern rhythm platform. It begins with one minute of stillness and continues naturally into self-awareness, habit, connection, and growth.",
        cta: "Start 1-Min Meditation Now"
      },
      whyMeisoulife: {
        label: "Born from more than 40 years of practice and research",
        title: "Why Meisoulife?",
        description:
          "Meisoulife is a life rhythm platform redesigned from the practice of Brain Education for modern challenges such as stress, anxiety, focus, sleep, and social media fatigue.\n\nWe believe that small habits people can continue without force help them return to who they really are.",
        cards: [
          "40+ years of research and practice",
          "1M+ people worldwide",
          "Brain Education",
          "40+ published books"
        ],
        founderMessageTitle: "A message from the founder",
        founderMessage:
          "Every person carries an original rhythm.\n\nYet in a world of speed, information, and anxiety, we often lose touch with our own center.\n\nThat is why we need time now to settle the breath, awaken the body, and return to ourselves again.\n\nA small one-minute practice can change the state of the mind, and begin to change the rhythm of life.\n\nIn the age of AI, the human center matters even more.\n\nMeisoulife exists as a quiet place people can return to each day, and as a way of growing a culture of awakening together.",
        founderSignature: "— Founder of Brain Education",
        button: "Read more deeply"
      },
      platformConcept: {
        eyebrow: "Platform Concept",
        title: "What is a coexistence rhythm platform?",
        description:
          "This is not a content platform. The rhythm comes first, and AI, payment, and community sit quietly on top of that rhythm to support continuity.",
        items: [
          "The core system is a rhythm people can return to every day.",
          "AI is here to support rhythm, not to replace human inner awareness.",
          "Payment is not about buying content, but about supporting continuity.",
          "Community is not something we force — it emerges naturally from shared rhythm."
        ]
      },
      platformFlow: {
        eyebrow: "Platform Flow",
        title: "The flow of the coexistence rhythm platform",
        description:
          "Meisou Life is not a place that sells meditation. It grows a daily rhythm of awakening together, moving from personal recovery toward coexistence culture and earth stewardship.",
        items: [
          { step: "01", title: "Today’s 1-minute meditation", description: "Begin with one minute of stillness and return to yourself." },
          { step: "02", title: "Free 7-day challenge", description: "Build a gentle daily rhythm through one minute in the morning and three at night." },
          { step: "03", title: "LINE community", description: "Receive reminders and connection to keep awakening together each day." },
          { step: "04", title: "Monthly membership", description: "Grow personal recovery into a shared way of living." },
          { step: "05", title: "Leader growth", description: "Grow into someone who brightens others and supports coexistence culture." }
        ]
      },
      testimonials: {
        eyebrow: "Testimonials",
        title: "Voices from people who kept going",
        description: "Even now, someone is continuing this rhythm.",
        items: [
          { name: "Mika · Morning Rhythm", quote: "Having a quiet rhythm at night softens the noise in my head before sleep." },
          { name: "Jisoo · Mind Reset", quote: "Because others are continuing too, it no longer feels like I am carrying the rhythm alone." },
          { name: "Emma · Focus Reset", quote: "A short return in the middle of the day helps me come back to steady focus without force." }
        ]
      },
      membership: {
        eyebrow: "Membership",
        title: "Membership starting from ¥1,000 a month",
        description: "The path from the free challenge into paid continuation is designed to feel simple and natural.",
        topButton: "Continue as a member",
        plans: [
          {
            key: "free",
            name: "Free",
            price: "¥0",
            description: "Begin gently with seven days of reset.",
            features: ["7-day challenge", "LINE join link", "AI coach up to 3 times a day"],
            cta: "Start free",
            href: "/challenge"
          },
          {
            key: "basic",
            name: "Basic",
            price: "¥1,000 / month",
            description: "Keep daily emotional recovery steady and sustainable.",
            features: ["Unlimited AI coach", "Member community", "Live meditation", "Morning rhythm design"],
            cta: "Start Basic",
            href: "basic",
            featured: true
          },
          {
            key: "leader",
            name: "Growth",
            price: "¥3,000 / month",
            description: "Deepen your practice and strengthen your daily stability.",
            features: ["Small circle groups", "Priority event access", "Weekly deep practice guides", "Practice record review"],
            cta: "See Growth",
            href: "/pricing"
          },
          {
            key: "premium",
            name: "Inner Circle",
            price: "¥10,000 / month",
            description: "Go deeper and quieter with yourself.",
            features: ["Monthly premium sessions", "Retreat priority access", "Personal support flow", "Inner Circle access"],
            cta: "See Inner Circle",
            href: "/pricing"
          }
        ]
      },
      retreats: {
        eyebrow: "Global Retreat Network",
        title: "A retreat path connected to the world",
        description: "From daily practice in Japan to deeper experiences around the world, Meisou Life designs a long-term growth path.",
        items: [
          { place: "Japan · Ise", title: "Purification and beginning", description: "A quiet retreat for meaningful new starts." },
          { place: "USA · Sedona", title: "Global awakening retreat", description: "A wide-open experience that helps release your perspective." },
          { place: "Korea · Jeju · Kookhakwon", title: "Philosophy and leader education", description: "A place for deeper learning that joins practice and thought." },
          { place: "New Zealand · Earth Village", title: "Natural healing and co-living", description: "Restore your original rhythm in harmony with nature." },
          { place: "Europe · Tenerife", title: "European retreat base", description: "A stay-based retreat to recover stillness among light and wind." }
        ]
      },
      faq: {
        eyebrow: "FAQ",
        title: "Frequently asked questions",
        items: [
          {
            question: "Is it okay if I am completely new to meditation?",
            answer: "Yes. You begin with a short morning audio guide, so it is easy to continue even with no prior experience."
          },
          {
            question: "Can I join without entering LINE?",
            answer: "Yes. However, reminders and connection with others are easier to receive if you join through LINE."
          },
          {
            question: "What changes when I become a paid member?",
            answer: "Your AI coach limit is removed, and you unlock the member community, live events, recovery audio, and continuity support."
          },
          {
            question: "Is this religious?",
            answer: "No. Meisou Life is a practical platform focused on daily stress care and emotional recovery."
          }
        ]
      },
      finalCta: {
        eyebrow: "Start now",
        title: "From recovery to connection. From connection to coexistence.",
        description:
          "From three-minute breathing in the morning to the LINE community, AI coach, monthly membership, and leader growth, caring for yourself becomes a way to live more deeply with others.",
        primary: "Start Now",
        secondary: "Begin 7 Days Together",
        tertiary: "Continue as a Member"
      }
    },
    challengePage: {
      eyebrow: "7-Day Rhythm Challenge",
      title: "Return to your rhythm in 7 days",
      description: "Just 10 minutes a day. Pause, breathe, and let each small practice bring you quietly back to yourself.",
      rhythmEyebrow: "Just 10 minutes a day",
      progressLabel: "Day",
      notStarted: "Start with today. A rhythm begins when you return for one quiet moment.",
      inProgress: "{count} days of rhythm are gathering quietly. No rush. Just return for today’s ten minutes.",
      complete: "Seven days of stillness are already beginning to settle into your daily life.",
      completedBadge: "Rhythm kept",
      openBadge: "Open",
      startButton: "Start",
      todayButton: "Start today",
      guidanceEyebrow: "Today’s guidance",
      guidanceTitle: "These 10 minutes are not for adding more, but for returning.",
      guidanceBody: "Press start and begin with one quiet minute of breathing. After that, simply carry today’s theme with you in a light and gentle way.",
      bridgeMessage: "From here, rhythm becomes easier to continue when you have a supportive space instead of carrying it alone.",
      bridgeButton: "Continue with membership",
      coachBridgeMessage: "From here, rhythm becomes easier to continue when support is present beside you.",
      coachBridgeButton: "Continue with the AI coach",
      supportTitle: "If you want to continue",
      supportDescription: "LINE and the AI Rhythm Coach support your small daily practice.",
      lineButton: "Join LINE",
      coachButton: "Open AI Rhythm Coach",
      endTitle: "Carry this rhythm into daily life",
      endDescription: "Would you like to continue the small change you felt over these seven days in everyday life?",
      memberButton: "Continue with membership",
      repeatButton: "Stay with free",
      days: [
        { day: 1, title: "Pause", focus: "Pause and remember what it feels like to come back to the present moment." },
        { day: 2, title: "Breath", focus: "Settle the length of your breath and let some of the body’s tension soften." },
        { day: 3, title: "Distance from thoughts", focus: "Create a little space between you and your thoughts." },
        { day: 4, title: "Emotional reset", focus: "Let emotion move through without force and reset gently." },
        { day: 5, title: "Build rhythm", focus: "Return to the same place each day and let rhythm form naturally." },
        { day: 6, title: "Connection", focus: "Let your quiet attention widen into connection with people and life around you." },
        { day: 7, title: "Integration", focus: "Bring the feeling of these seven days back into daily life." }
      ]
    },
    challengeForm: {
      name: "Name",
      namePlaceholder: "Hanako Yamada",
      email: "Email address",
      lineId: "LINE ID (optional)",
      stress: "Current stress level (1–10)",
      submit: "Join free on LINE",
      submitting: "Submitting...",
      error: "We could not register you. Please try again in a little while."
    },
    pricingPage: {
      eyebrow: "Membership",
      title: "From 1-minute recovery to daily rhythm, brain ownership, and coexistence",
      description:
        "A Meisou Life member is not buying meditation content. They are entering a path that begins with one-minute recovery and grows into daily rhythm, brain ownership, coexistence, and a larger human vision.",
      checkoutNote: "After payment, return to this screen to move to the next step",
      badges: ["Quiet and clear like Apple", "Space that feels true to Japanese wellness", "A path you can begin right now"],
      supportText:
        "Free is the doorway to one-minute recovery when life feels overwhelming.\nBasic builds a daily rhythm you can return to.\nGrowth deepens brain ownership with AI support.\nInner Circle is for leadership in coexistence culture and a wider civilization vision.",
      voicesEyebrow: "Voices",
      voicesTitle: "Why people were glad they stayed",
      voicesButton: "See the community",
      trustBadges: ["Secure card payment", "Cancel anytime", "Start right away from your phone", "Support available"],
      plans: [
        {
          key: "basic",
          name: "BASIC",
          price: "¥1,000",
          dailyCost: "About ¥33 / day",
          emotionalCopy: "Life Rhythm",
          description: "Build a stable daily rhythm with 1-minute recovery and small daily practices.",
          features: ["Daily 1-minute recovery", "Night 3-minute guide", "7-day rhythm continuity", "Morning rhythm design"],
          cta: "Continue for ¥1,000 / month",
          orderClass: "order-2 lg:order-1",
          accentClass: "border-white/60 bg-white/75"
        },
        {
          key: "leader",
          name: "GROWTH",
          price: "¥3,000",
          dailyCost: "About ¥100 / day",
          emotionalCopy: "Brain Owner",
          description: "Recover emotional, mental, and relational balance with AI guidance and Brain Education practices.",
          features: ["Deeper AI rhythm guidance", "Small circle groups", "Coexistence practice dialogue", "Practice record review"],
          cta: "Deepen for ¥3,000 / month",
          orderClass: "order-1 lg:order-2",
          accentClass: "border-emerald-300 bg-gradient-to-b from-white to-emerald-50/70 shadow-[0_24px_60px_rgba(5,150,105,0.12)]"
        },
        {
          key: "premium",
          name: "INNER CIRCLE",
          price: "¥10,000",
          dailyCost: "About ¥333 / day",
          emotionalCopy: "Coexistence Circle",
          description: "Grow with others through coexistence practice, founder wisdom, leadership, and civilization vision.",
          features: ["Monthly premium sessions", "Retreat priority access", "Earth stewardship vision dialogues", "Inner Circle access"],
          cta: "Support for ¥10,000 / month",
          orderClass: "order-3 lg:order-3",
          accentClass: "border-amber-200/80 bg-white/75"
        }
      ],
      testimonials: [
        {
          name: "Mika, 49",
          quote: "Since joining BASIC, I can feel my mind settle every day, even with just one minute in the morning."
        },
        {
          name: "Kenichi, 57",
          quote: "GROWTH took away the feeling of doing this alone. It became much easier to keep going."
        },
        {
          name: "Yuki, 52",
          quote: "INNER CIRCLE is quiet and refined. In busy daily life, it gave me a place I can return to with ease."
        }
      ]
    },
    welcomeMember: {
      eyebrow: "Welcome back",
      firstTitle: "Welcome back.\nFrom here, the rhythm continues.",
      returningTitle: "Welcome back.\nLet’s take just one minute today.",
      body: "You did not buy something. You simply returned to a place that helps you come back to yourself.",
      primary: "Start your 1 minute now",
      secondary: "Continue on LINE"
    },
    welcomePage: {
      title: "Welcome to Meisoulife",
      subtitle: "Your rhythm begins here.",
      memberProgramTitle: "Begin the member rhythm",
      memberProgramDescription: "If your payment is complete, you can begin the Basic rhythm program from here.",
      memberProgramButton: "Go to the Basic rhythm program",
      coachTitle: "AI Rhythm Coach",
      coachDescription: "When it feels hard to continue alone, it quietly helps you return",
      steps: [
        "Receive rhythm reminders on LINE",
        "Open the AI Rhythm Coach",
        "Start today’s 1-minute meditation"
      ],
      lineButton: "Join LINE",
      coachButton: "Open AI Rhythm Coach",
      meditationButton: "Start today’s 1 minute",
      challengeButton: "Start the 7-day rhythm",
      tertiary: "Return home",
      fallback: "The link will be ready soon."
    },
    programPages: {
      basic: {
        eyebrow: "Basic Program",
        title: "Basic Rhythm Program",
        description: "For seven days, just three minutes a day. A gentle introduction to returning quietly to your center.",
        intro: "You do not need to change dramatically. By returning a little each day, the rhythm of mind and body begins to settle naturally.",
        dayLabel: "Day",
        goalLabel: "Goal",
        practiceLabel: "Practice",
        openBadge: "Open",
        completedBadge: "Completed",
        days: [
          { day: 1, title: "Pause", goal: "Pause once here and return to the breath.", practice: "3-minute breathing", button: "Start Day 1" },
          { day: 2, title: "Breath", goal: "Lengthen the breath and gently soften mental noise.", practice: "4-2-4 breath for 3 minutes", button: "Start Day 2" },
          { day: 3, title: "Body awareness", goal: "Step away from thought and return through body sensation.", practice: "3-minute body scan", button: "Start Day 3" },
          { day: 4, title: "Emotional reset", goal: "Do not suppress emotion. Let it move through gently.", practice: "3 minutes of observing emotion", button: "Start Day 4" },
          { day: 5, title: "Daily rhythm", goal: "Create a small rhythm of returning in the morning, daytime, and night.", practice: "1 minute × 3 times", button: "Start Day 5" },
          { day: 6, title: "Connection", goal: "Grow the feeling of continuing together rather than striving alone.", practice: "3-minute connection meditation", button: "Start Day 6" },
          { day: 7, title: "Integration", goal: "Carry the change of these seven days quietly into daily life.", practice: "3-minute integration meditation", button: "Start Day 7" }
        ],
        bottomTitle: "To keep this rhythm going",
        bottomDescription: "The Basic program is not for doing things perfectly. It is a small doorway for having a place to return.",
        bottomPrimary: "Return to today’s one minute",
        bottomSecondary: "See the 7-day challenge",
        bottomTertiary: "Return home"
      },
      growth: {
        eyebrow: "Growth Program",
        title: "Growth Rhythm Program",
        description: "Go deeper into rhythm by continuing together, not by forcing it alone.",
        intro: "Growth is a weekly rhythm program for building a steadier daily life through small daily practice, shared themes, and a sense of community support.",
        weekLabel: "Week",
        goalLabel: "Description",
        practiceLabel: "Practice",
        weeks: [
          { week: 1, title: "Stabilize", goal: "Settle the basic rhythm of morning, daytime, and night.", practice: "3 minutes each day + one weekly reflection", button: "Start Week 1" },
          { week: 2, title: "Continue", goal: "Stop blaming what interrupts you and build a way to return.", practice: "One rhythm note each day", button: "Start Week 2" },
          { week: 3, title: "Connect", goal: "Grow the feeling of continuing together with others.", practice: "Join and share in the LINE community", button: "Start Week 3" },
          { week: 4, title: "Cultivate", goal: "Grow a rhythm that lets you return naturally in ordinary life.", practice: "Weekly review + set the next intention", button: "Start Week 4" }
        ],
        communityTitle: "A place to continue together",
        communityDescription: "In Growth, what matters is not continuing perfectly alone, but having a place you can return to.",
        lineButton: "Go to the LINE community",
        coachButton: "Open the AI rhythm coach",
        meditationButton: "Return to today’s one minute",
        fallback: "The link will be ready soon.",
        bottomTitle: "For those who want to go deeper",
        bottomDescription: "If you want to deepen this rhythm beyond daily life into life vision and coexistence culture, you can move into Inner Circle.",
        bottomButton: "See Inner Circle"
      },
      inner: {
        eyebrow: "Inner Circle",
        title: "Inner Circle Coexistence Leadership Program",
        description: "Go beyond settling your own rhythm and help grow a culture of awakening together with others.",
        intro: "Inner Circle is a program for leaders who deepen meditation, life rhythm, coexistence culture, and earth-citizen awareness, and quietly cultivate space within daily life.",
        moduleLabel: "Module",
        goalLabel: "Description",
        practiceLabel: "Practice",
        modules: [
          { module: 1, title: "Establish your own rhythm", goal: "Stabilize the daily rhythm of returning to your center.", practice: "Morning, daytime, and night rhythm practice", button: "Start Module 1" },
          { module: 2, title: "Coexistence communication", goal: "Build relationships that settle together instead of trying to change people.", practice: "Dialogue and awareness practice", button: "Start Module 2" },
          { module: 3, title: "Space holding", goal: "Cultivate a place people return to naturally rather than trying to gather them.", practice: "Design a small rhythm space", button: "Start Module 3" },
          { module: 4, title: "Earth citizen and coexistence culture", goal: "Extend personal practice into a coexistence culture for society and the planet.", practice: "Earth-citizen awareness and action planning", button: "Start Module 4" }
        ],
        supportTitle: "Inner Circle support",
        supportDescription: "Deepen rhythm into life and work through monthly premium sessions, retreat access, and more personal support paths.",
        supportCards: [
          { title: "Monthly premium sessions", description: "Once each month, spend time settling with a deeper theme." },
          { title: "Retreat priority access", description: "Receive priority invitations for practice opportunities in nature, sacred places, and power spots." },
          { title: "Personal support paths", description: "When needed, receive guidance toward the next step that fits your current state." },
          { title: "Coexistence culture projects", description: "Cultivate practice that expands beyond yourself into community and society." }
        ],
        actionTitle: "From today, quietly cultivate the field",
        actionDescription: "Inner Circle is not a place to become a special person. It is a place to return to yourself and let that stillness illuminate the people around you.",
        meditationButton: "Begin today’s 3 minutes",
        coachButton: "Open the AI rhythm coach",
        lineButton: "Go to the LINE community",
        growthButton: "See the Growth program",
        fallback: "The link will be ready soon."
      }
    },
    loginPage: {
      eyebrow: "Login",
      title: "Member Login",
      subtitle: "Your rhythm continues after logging in",
      email: "Email address",
      password: "Password",
      button: "Login",
      signupButton: "Create account",
      checking: "Checking...",
      unavailable: "Login will be available soon.",
      logout: "Logout",
      signupSuccess: "A confirmation email has been sent. Please verify it, then log in.",
      signupError: "Login will be available soon.",
      loading: "Processing...",
      error: "Login failed. Please check your email and password."
    },
    meditationPage: {
      durationTexts: {
        sixty: {
          topText: "For the next 60 seconds, gently return to your breath.",
          completionTitle: "For 60 seconds, you returned to the present."
        },
        threeMinutes: {
          topText: "For the next 3 minutes, gently follow the rhythm of your breath.",
          completionTitle: "For 3 minutes, you returned to the rhythm of your breath."
        }
      },
      variants: {
        default: {
          topText: "Return to your breath for just 60 seconds",
          intro: "There is nothing to force. Just settle into one calm breathing rhythm.",
          completionTitle: "For 60 seconds, you returned to the present."
        },
        morning: {
          topText: "Use these 3 minutes to settle into the morning",
          intro: "Gently wake the body and mind, and let the day begin from a quieter place.",
          completionTitle: "The morning rhythm is settled. Begin the day quietly."
        },
        day: {
          topText: "Return to your breath for just 60 seconds",
          intro: "Step out of the rush for a moment and return to your own center.",
          completionTitle: "For 60 seconds, you returned to the present."
        },
        night: {
          topText: "Use these 3 minutes to release the day",
          intro: "Let the tension of the day soften so mind and body can close gently before sleep.",
          completionTitle: "The night rhythm is settled. Let the day go quietly."
        }
      },
      phases: {
        inhale: "Inhale",
        hold: "Hold",
        exhale: "Exhale"
      },
      bottomText: {
        inhale: "Inhale... 4s",
        hold: "Hold... 2s",
        exhale: "Exhale... 4s"
      },
      completionMessage: "Well done.\nStay with this stillness\nfor just a moment.",
      completionReturnText: "Please come back again.",
      completionBody: "Would you like to continue this quiet rhythm for just seven days?",
      completionPrimary: "Start the 7-day rhythm",
      completionSecondary: "That’s enough for today",
      coachPrompt: "Would you like to stay with this quiet state a little longer?",
      coachButton: "Open the AI coach",
      soundOn: "Nature ON",
      soundOff: "Nature OFF",
      vibrationOn: "Vibration on",
      vibrationOff: "Vibration off",
      natureLabel: "Breathe with the rhythm of nature"
    },
    premiumPage: {
      successBadge: "Payment completed",
      title: "Premium Access",
      subtitle: "Your membership is now active. From here, you can continue the paid rhythm.",
      description: "The rhythm is already continuing. Begin quietly from the next step that fits today.",
      currentPlan: "Current plan",
      planLabels: {
        basic: "Basic",
        growth: "Growth",
        inner_circle: "Inner Circle"
      },
      primary: "Open the program",
      secondary: "Start today’s meditation",
      tertiary: "View pricing"
    },
    membershipSuccessPage: {
      badge: "Membership active",
      title: "Your payment is complete.",
      subtitle: "Your Meisoulife membership is now active.",
      body: "A rhythm of returning to yourself begins in your daily life from today.",
      emailSentNote: "A confirmation email has been sent to you.",
      activeTierLabel: "Activated membership",
      planLabels: {
        basic: "Basic",
        growth: "Growth",
        inner_circle: "Inner Circle"
      },
      steps: ["Join the LINE community", "Open the AI Rhythm Coach", "Continue today’s one-minute rhythm"],
      lineButton: "Go to the LINE community",
      coachButton: "Open the AI coach",
      rhythmButton: "Return to today’s rhythm",
      programButton: "Open the member program",
      dashboardButton: "Go to dashboard"
    },
    membershipPage: {
      title: "Membership",
      subtitle: "When you are ready to continue with a paid rhythm, you can return here.",
      canceled: "Payment was not completed. You can come back quietly whenever you are ready.",
      primary: "Go to pricing",
      secondary: "Return home"
    },
    brainEducationPage: {
      eyebrow: "Brain Education",
      title: "About Brain Education",
      subtitle: "Brain Education is a practical system that helps people notice, regulate, and consciously redirect their inner state through breath, body awareness, and attention.",
      intro:
        "Meisoulife translates this Brain Education perspective into a modern life rhythm platform that feels quieter, gentler, and easier to continue each day.",
      sections: [
        {
          title: "1. What is Brain Education?",
          body: "Brain Education sees the brain not only as a place for knowledge, but as a living center for sensing, feeling, and choosing."
        },
        {
          title: "2. 5 Brain Education stages",
          body: "It deepens from sensing the present moment into emotional regulation, conscious choice, consistent action, and finally coexistence with others."
        },
        {
          title: "3. Modern problems & solutions",
          body: "For stress, anxiety, sleep disruption, and social media fatigue, it creates a simple entry point: return first through breath and body awareness."
        },
        {
          title: "4. Emotional balance",
          body: "Rather than suppressing emotion, the practice helps people feel, regulate, and move through it with more steadiness."
        },
        {
          title: "5. Human potential",
          body: "Awakening human potential is not about becoming extraordinary. It is about returning more fully to one’s original self."
        },
        {
          title: "6. Coexistence philosophy",
          body: "Brain Education does not stop at personal recovery. It values how inner stillness changes the quality of relationships and community."
        },
        {
          title: "7. Founder story",
          body: "ILCHI LEE has spent more than four decades exploring human potential and the shape of practices that can truly continue in daily life."
        },
        {
          title: "8. Global impact",
          body: "Through education and practice around the world, many people have cultivated daily return habits and a deeper sense of coexistence."
        }
      ],
      founderMessageTitle: "A deeper message from the founder",
      founderMessageSubtitle: "Awaken mind and awareness through the body.",
      founderMessageBody:
        "The human center is not something far away.\n\nIt is in the breath, in the feeling of the body, and in the choices we make in this very moment.\n\nAs information increases and AI grows more powerful, people need the ability to know their own inner temperature and regulate their own state.\n\nWhen you think too much, cool the body and return to stillness.\n\nWhen your energy is low, move the body and raise vitality.\n\nThe condition of the body is deeply connected to the condition of the mind.\n\nThat is why it matters to pause once an hour, or even for one minute or two minutes, to feel your state, breathe, smile, and move the body.\n\nA smile is the first muscle that opens the heart.\n\nThe ability to respond, to encourage, and to express love is cultivated through small daily practice.\n\nCoexistence is not an abstract ideology. It is a choice to let each other live more fully in daily life.\n\nWhen one person settles, the atmosphere around them changes.\n\nWhen one person awakens, the rhythm of the community changes.\n\nWhat the AI age needs is not only knowledge, but intelligence that keeps human beings alive.\n\nThat is coexistence intelligence, and the intelligence of living for the greater good.\n\nFrom a small one-minute practice, Meisoulife seeks to help people return to their true center and cultivate a culture of awakening together.",
      primary: "Return to today’s one minute",
      secondary: "Return home"
    },
    common: {
      connecting: "Connecting...",
      comingSoon: "Checkout is not configured yet."
    }
  }
} as const;

export function useSiteCopy() {
  const { language } = useLanguage();

  return getLocaleCopy(siteCopy, language);
}
