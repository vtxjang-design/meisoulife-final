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

const LanguageContext = createContext<LanguageContextValue | null>(null);

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

export const siteCopy = {
  jp: {
    header: {
      brand: "瞑想life",
      login: "ログイン",
      freeJoin: "無料参加",
      nav: [
        { href: "/", label: "ホーム" },
        { href: "/challenge", label: "7日チャレンジ" },
        { href: "/pricing", label: "料金" },
        { href: "/community", label: "コミュニティ" },
        { href: "/leaders", label: "リーダー成長" }
      ]
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
      title: "今この1分で、呼吸を整えましょう",
      endButton: "1分を終える",
      completeTitle: "今日、あなたは自分に戻りました。",
      completeBody: "この小さな1分が、共に目覚めるリズムの始まりです。",
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
      title: "回復を、共に目覚める生活リズムへ",
      description: "瞑想lifeの会員は、瞑想コンテンツを買う人ではありません。毎日、自分に戻るリズムを静かに続けていく仲間です。",
      checkoutNote: "決済後、この画面に戻ると次のステップに進みます",
      badges: ["Appleのように静かで明快", "日本のウェルネスらしい余白", "今すぐ始められる導線"],
      supportText: "有料メンバーシップは、特別な商品ではありません。\n毎日、自分に戻るリズムを途切れさせないための小さな支えです。",
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
          emotionalCopy: "習慣を守るための最小環境",
          description: "ひとりで終わらせず、毎日静けさに戻るための基本会員",
          features: ["毎日の1分瞑想", "夜の3分ガイド", "会員コミュニティの入口", "毎朝の習慣設計"],
          cta: "月1,000円で続ける",
          orderClass: "order-2 lg:order-1",
          accentClass: "border-white/60 bg-white/75"
        },
        {
          key: "leader",
          name: "GROWTH",
          price: "¥3,000",
          dailyCost: "約¥100 / day",
          emotionalCopy: "一人では続かない人へ",
          description: "小さな仲間と実践を深め、共生生活を育てる成長会員",
          features: ["少人数サークル", "共生生活の実践対話", "週次の深い実践ガイド", "実践記録レビュー"],
          cta: "月3,000円で深める",
          orderClass: "order-1 lg:order-2",
          accentClass: "border-emerald-300 bg-gradient-to-b from-white to-emerald-50/70 shadow-[0_24px_60px_rgba(5,150,105,0.12)]"
        },
        {
          key: "premium",
          name: "INNER CIRCLE",
          price: "¥10,000",
          dailyCost: "約¥333 / day",
          emotionalCopy: "人生と共生文化を深めたい人へ",
          description: "共生文化と地球経営のビジョンを共に実現するリーダー会員",
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
      unavailable: "ログイン機能はまもなく準備されます。",
      logout: "ログアウト",
      signupSuccess: "登録確認メールを送信しました。確認後にログインしてください。",
      signupError: "ログイン機能はまもなく準備されます。",
      loading: "処理中...",
      error: "ログインに失敗しました。メールとパスワードを確認してください。"
    },
    meditationPage: {
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
      completionBody: "この静かなリズムを、7日間だけ続けてみませんか？",
      completionPrimary: "7日リズムを始める",
      completionSecondary: "今日はここまで",
      coachPrompt: "この静かな状態を、少しだけ続けてみませんか？",
      coachButton: "AIコーチを開く"
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
      nav: [
        { href: "/", label: "홈" },
        { href: "/challenge", label: "7일 챌린지" },
        { href: "/pricing", label: "요금" },
        { href: "/community", label: "커뮤니티" },
        { href: "/leaders", label: "리더 성장" }
      ]
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
      title: "지금 이 1분 동안 호흡을 정돈해봅시다",
      endButton: "1분을 마칩니다",
      completeTitle: "오늘, 당신은 자신에게 돌아왔습니다.",
      completeBody: "이 작은 1분이 함께 깨어나는 리듬의 시작입니다.",
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
      title: "회복을 함께 깨어나는 생활 리듬으로",
      description: "명상life의 회원은 명상 콘텐츠를 사는 사람이 아닙니다. 매일 자신에게 돌아오는 리듬을 조용히 이어가는 동료입니다.",
      checkoutNote: "결제 후 이 화면으로 돌아오면 다음 단계로 이어집니다",
      badges: ["Apple처럼 조용하고 명확하게", "일본 웰니스다운 여백", "지금 바로 시작할 수 있는 흐름"],
      supportText: "유료 멤버십은 특별한 상품이 아닙니다.\n매일 자신에게 돌아오는 리듬이 끊기지 않도록 돕는 작은 지지입니다.",
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
          emotionalCopy: "습관을 지키기 위한 가장 작은 환경",
          description: "혼자서 끝내지 않고 매일 고요함으로 돌아오기 위한 기본 멤버",
          features: ["매일의 1분 명상", "밤의 3분 가이드", "멤버 커뮤니티 입구", "매일 아침 습관 설계"],
          cta: "월 1,000엔으로 이어가기",
          orderClass: "order-2 lg:order-1",
          accentClass: "border-white/60 bg-white/75"
        },
        {
          key: "leader",
          name: "GROWTH",
          price: "¥3,000",
          dailyCost: "약 ¥100 / day",
          emotionalCopy: "혼자서는 이어가기 어려운 사람에게",
          description: "작은 동료들과 실천을 깊게 하며 공생 생활을 키우는 성장 멤버",
          features: ["소규모 서클", "공생 생활 실천 대화", "주간 심화 가이드", "실천 기록 리뷰"],
          cta: "월 3,000엔으로 깊게",
          orderClass: "order-1 lg:order-2",
          accentClass: "border-emerald-300 bg-gradient-to-b from-white to-emerald-50/70 shadow-[0_24px_60px_rgba(5,150,105,0.12)]"
        },
        {
          key: "premium",
          name: "INNER CIRCLE",
          price: "¥10,000",
          dailyCost: "약 ¥333 / day",
          emotionalCopy: "삶과 공생 문화를 더 깊게 가꾸고 싶은 사람에게",
          description: "공생 문화와 지구경영 비전을 함께 실현하는 리더 멤버",
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
      unavailable: "로그인 기능은 곧 준비됩니다.",
      logout: "로그아웃",
      signupSuccess: "등록 확인 메일을 보냈습니다. 확인 후 로그인해 주세요.",
      signupError: "로그인 기능은 곧 준비됩니다.",
      loading: "처리 중...",
      error: "로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요."
    },
    meditationPage: {
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
      completionBody: "이 조용한 리듬을 7일만 더 이어가 보시겠어요?",
      completionPrimary: "7일 리듬 시작하기",
      completionSecondary: "오늘은 여기까지",
      coachPrompt: "이 조용한 상태를 조금만 더 이어가 볼까요?",
      coachButton: "AI 코치를 열기"
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
      nav: [
        { href: "/", label: "Home" },
        { href: "/challenge", label: "7-Day Challenge" },
        { href: "/pricing", label: "Pricing" },
        { href: "/community", label: "Community" },
        { href: "/leaders", label: "Leader Path" }
      ]
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
      title: "Use this one minute to settle your breath",
      endButton: "End the minute",
      completeTitle: "Today, you returned to yourself.",
      completeBody: "This one quiet minute is the beginning of a shared awakening rhythm.",
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
      title: "Turn recovery into a shared rhythm of living",
      description: "A Meisou Life member is not buying meditation content. They are quietly continuing a rhythm of returning to themselves every day.",
      checkoutNote: "After payment, return to this screen to move to the next step",
      badges: ["Quiet and clear like Apple", "Space that feels true to Japanese wellness", "A path you can begin right now"],
      supportText: "Paid membership is not a special product.\nIt is a small support that keeps your rhythm of returning to yourself from breaking.",
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
          emotionalCopy: "The smallest environment for protecting a habit",
          description: "A basic membership for not ending alone and returning to stillness each day",
          features: ["Daily 1-minute meditation", "Night 3-minute guide", "Member community entry", "Morning rhythm design"],
          cta: "Continue for ¥1,000 / month",
          orderClass: "order-2 lg:order-1",
          accentClass: "border-white/60 bg-white/75"
        },
        {
          key: "leader",
          name: "GROWTH",
          price: "¥3,000",
          dailyCost: "About ¥100 / day",
          emotionalCopy: "For people who cannot keep going alone",
          description: "A growth membership for deepening practice with a small circle and growing coexistence life",
          features: ["Small circle groups", "Coexistence practice dialogue", "Weekly deep practice guide", "Practice record review"],
          cta: "Deepen for ¥3,000 / month",
          orderClass: "order-1 lg:order-2",
          accentClass: "border-emerald-300 bg-gradient-to-b from-white to-emerald-50/70 shadow-[0_24px_60px_rgba(5,150,105,0.12)]"
        },
        {
          key: "premium",
          name: "INNER CIRCLE",
          price: "¥10,000",
          dailyCost: "About ¥333 / day",
          emotionalCopy: "For people who want to deepen life and coexistence culture",
          description: "A leader membership for realizing the vision of coexistence culture and earth stewardship together",
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
      completionBody: "Would you like to continue this quiet rhythm for just seven days?",
      completionPrimary: "Start the 7-day rhythm",
      completionSecondary: "That’s enough for today",
      coachPrompt: "Would you like to stay with this quiet state a little longer?",
      coachButton: "Open the AI coach"
    },
    common: {
      connecting: "Connecting...",
      comingSoon: "Checkout is not configured yet."
    }
  }
} as const;

export function useSiteCopy() {
  const { language } = useLanguage();

  return siteCopy[language];
}
