export type LandingLanguage = "jp" | "kr" | "en";

export type LandingCopy = {
  hero: {
    eyebrow: string;
    title: string;
    supporting: string;
    subtitle: string;
    primary: string;
    secondary: string;
    proof: string[];
  };
  todaysRhythmCard: {
    eyebrow: string;
    title: string;
    messages: string[];
    support: string;
    activeNow: string;
    actionLabel: string;
    actions: string[];
    cta: string;
  };
  checkIn: {
    eyebrow: string;
    title: string;
    description: string;
    support: string;
    returnLine: string;
    recommendationEyebrow: string;
    recommendationTitle: string;
    wordLabel: string;
    breathLabel: string;
    meditationLabel: string;
    supportLabel: string;
    secondaryCta: string;
    options: Array<{
      key: string;
      emoji: string;
      label: string;
      recommendation: {
        type: string;
        word: string;
        breath: string;
        meditation: string;
        support: string;
        cta: string;
      };
    }>;
  };
  instant: {
    eyebrow: string;
    title: string;
    description: string;
    start: string;
    pause: string;
    fullscreen: string;
    inhale: string;
    hold: string;
    exhale: string;
    sensory: string;
  };
  coach: {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    openCoach: string;
    note: string;
    copyPrompt: string;
    copiedPrompt: string;
    promptLabel: string;
    guidanceLabel: string;
    rhythmLabel: string;
    states: Array<{
      key: string;
      label: string;
      previewMessage: string;
      prompt: string;
    }>;
  };
  garden: {
    eyebrow: string;
    title: string;
    description: string;
    weekTitle: string;
    message: string;
    streakLabel: string;
    returning: string;
    dayUnit: string;
    yesterday: string;
    today: string;
    thisWeek: string;
    uneasy: string;
    softer: string;
    steady: string;
  };
  live: {
    eyebrow: string;
    title: string;
    description: string;
    metrics: Array<{
      key: string;
      label: string;
      value: string;
      subtext: string;
    }>;
  };
  dailyRhythmLayer: {
    eyebrow: string;
    title: string;
    description: string;
    cards: Array<{
      key: string;
      emoji: string;
      title: string;
      description: string;
      cta: string;
      href: string;
    }>;
    messageTitle: string;
    messages: string[];
  };
  mission: {
    eyebrow: string;
    title: string;
    why: string;
    whyNow: string;
    mission: string;
    testimonials: Array<{
      quote: string;
      name: string;
    }>;
  };
  membership: {
    eyebrow: string;
    title: string;
    description: string;
    freeLabel: string;
    freeTitle: string;
    freeFeatures: string[];
    freeCta: string;
    plans: Array<{
      key: "basic" | "leader" | "premium";
      name: string;
      price: string;
      identity: string;
      description: string;
      lifeChange: string;
      features: string[];
      cta: string;
      featured?: boolean;
    }>;
    comparisonTitle: string;
    comparisonRows: Array<{
      label: string;
      free: string;
      growth: string;
      inner: string;
    }>;
  };
  mobile: {
    meditate: string;
    askAi: string;
  };
};

export const landingCopy: Record<LandingLanguage, LandingCopy> = {
  jp: {
    hero: {
      eyebrow: "Quiet Daily Rhythm",
      title: "1日1分から。\n自分に戻る静かな習慣。",
      supporting: "一人じゃない。\n共に目覚める毎日へ。",
      subtitle:
        "忙しい毎日の中でも、静かに呼吸を整え、自分の中心に戻れる場所を。瞑想lifeは、世界のどこかの誰かとやわらかくつながりながら続ける、新しい日常のリズムです。",
      primary: "無料で7日間はじめる",
      secondary: "1分瞑想を体験する",
      proof: ["1日1分から", "静かに戻れる", "世界とやわらかくつながる"]
    },
    todaysRhythmCard: {
      eyebrow: "今日の小さなリズム",
      title: "今日の1分リズム",
      messages: ["考えすぎた日は、\nまず呼吸から戻りましょう。"],
      support: "今日もここから、\n小さく整える。",
      activeNow: "今日も124人が、それぞれの場所で整っています。",
      actionLabel: "今日の小さなアクション",
      actions: ["30秒、笑顔をつくる。"],
      cta: "今日の1分を始める"
    },
    checkIn: {
      eyebrow: "Today Rhythm Check-in",
      title: "今日の状態は？",
      description: "今のあなたに合う\n小さなリズムを見つけましょう。",
      support: "無理をしなくて大丈夫。",
      returnLine: "今日も戻ってきました。",
      recommendationEyebrow: "Today Rhythm Recommendation",
      recommendationTitle: "小さなリズムの提案",
      wordLabel: "今日の言葉",
      breathLabel: "呼吸リズム",
      meditationLabel: "1分瞑想",
      supportLabel: "静かなサポート",
      secondaryCta: "AIコーチを見る",
      options: [
        {
          key: "heavy",
          emoji: "😔",
          label: "心が少し重い",
          recommendation: {
            type: "heavy",
            word: "今日は、少し軽くなることだけで十分です。",
            breath: "4秒吸って、6秒吐く",
            meditation: "気持ちをほどく1分リズム",
            support: "まずは今の重さをそのまま受け止めましょう。",
            cta: "静かな1分を始める"
          }
        },
        {
          key: "anxious",
          emoji: "😟",
          label: "不安がある",
          recommendation: {
            type: "anxious",
            word: "今は答えを急がなくて大丈夫。",
            breath: "4秒吸って、4秒吐く",
            meditation: "不安を落ち着かせる1分リズム",
            support: "息の出入りだけを感じれば十分です。",
            cta: "静かな1分を始める"
          }
        },
        {
          key: "unfocused",
          emoji: "😵",
          label: "集中できない",
          recommendation: {
            type: "unfocused",
            word: "ひとつに戻るだけで流れは変わります。",
            breath: "4秒吸って、2秒止めて、4秒吐く",
            meditation: "中心を取り戻す1分リズム",
            support: "考えを整えるより、呼吸をそろえてみましょう。",
            cta: "リズムを整える"
          }
        },
        {
          key: "tired",
          emoji: "😴",
          label: "少し疲れている",
          recommendation: {
            type: "tired",
            word: "今日は少しゆっくりでもいい。",
            breath: "自然に吸って、少し長く吐く",
            meditation: "回復のための呼吸",
            support: "休むことも、今日の大切な実践です。",
            cta: "リズムを整える"
          }
        },
        {
          key: "calm",
          emoji: "😌",
          label: "落ち着いている",
          recommendation: {
            type: "calm",
            word: "その静けさを、今日の土台にしましょう。",
            breath: "4秒吸って、4秒吐く",
            meditation: "静けさを広げる1分リズム",
            support: "今の穏やかさを、少し長く保ってみましょう。",
            cta: "このまま呼吸する"
          }
        },
        {
          key: "grateful",
          emoji: "🙏",
          label: "感謝している",
          recommendation: {
            type: "grateful",
            word: "そのやわらかさは、周りにも静かに広がります。",
            breath: "4秒吸って、6秒吐く",
            meditation: "感謝を深める1分リズム",
            support: "ひとつの感謝を胸の中に置いて呼吸してみましょう。",
            cta: "やさしい1分を始める"
          }
        }
      ]
    },
    instant: {
      eyebrow: "Instant Calm",
      title: "1分リセット体験",
      description:
        "たった1分。がんばらなくていい呼吸から、今ここへ静かに戻ってみましょう。",
      start: "1分リセットを始める",
      pause: "一度止める",
      fullscreen: "全画面で開く",
      inhale: "吸って",
      hold: "止めて",
      exhale: "吐いて",
      sensory: "読むより先に、まず呼吸へ。目を閉じたままでも、動きと振動でリズムを感じられます。"
    },
    coach: {
      eyebrow: "Quiet Rhythm Guide",
      title: "今のあなたに、\n静かな1分のガイドを。",
      description:
        "不安、疲れ、集中できない時に。\nQuiet Rhythm Guide が、\nあなたの今の状態に合わせて\nやさしく言葉を返し、\n1分のリズムへ案内します。",
      cta: "Quiet Rhythm Guide GPTを開く",
      openCoach: "Quiet Rhythm Guide GPTを開く",
      note: "※ ChatGPTにログインすると無料で利用できます。利用回数には制限がある場合があります。",
      copyPrompt: "プロンプトをコピー",
      copiedPrompt: "コピーしました",
      promptLabel: "GPTに伝えるひとこと",
      guidanceLabel: "小さなプレビュー",
      rhythmLabel: "1分の入り口",
      states: [
        {
          key: "anxiety",
          label: "不安",
          previewMessage:
            "大丈夫。\nまずは呼吸を少しだけゆっくりにしましょう。\n今は、答えを急がなくても大丈夫です。",
          prompt: "今、不安があります。1分で落ち着けるように、やさしくガイドしてください。"
        },
        {
          key: "tired",
          label: "疲れ",
          previewMessage:
            "よくここまで来ました。\n身体が少し休みたがっているかもしれません。\n1分だけ、自分に戻りましょう。",
          prompt: "少し疲れています。無理なく回復できる1分のリズムを案内してください。"
        },
        {
          key: "focus",
          label: "集中したい",
          previewMessage:
            "今は、全部をやろうとしなくて大丈夫です。\nまず一つだけ。\n呼吸と視線を整えましょう。",
          prompt: "集中したいです。今やることを一つに戻す1分ガイドをください。"
        },
        {
          key: "sleep",
          label: "眠りたい",
          previewMessage:
            "今日のことを、少しずつ手放しましょう。\n身体の重さを感じながら、\n静かに眠る準備をします。",
          prompt: "眠る前に心を静かにしたいです。1分の睡眠前ガイドをお願いします。"
        }
      ]
    },
    garden: {
      eyebrow: "My Rhythm Garden",
      title: "わたしのリズムを育てる",
      description:
        "毎日の気分と呼吸の時間が、光の種として静かに積み重なっていきます。これは記録ではなく、内側の変化が育っていく庭です。",
      weekTitle: "7日間の光の軌跡",
      message: "小さな変化も、毎日戻ることで確かな形になります。",
      streakLabel: "現在のリズム",
      returning: "昨日より少しやわらかい輪郭が見えています。",
      dayUnit: "日",
      yesterday: "昨日",
      today: "今日",
      thisWeek: "今週",
      uneasy: "少し不安",
      softer: "少し平穏",
      steady: "より安定"
    },
    live: {
      eyebrow: "共に整うリズム",
      title: "今日も、どこかで誰かが呼吸を整えています。",
      description: "一人でがんばらなくても大丈夫。小さな1分が集まり、共に目覚める毎日をつくっています。",
      metrics: [
        {
          key: "minutes",
          label: "今日、共に呼吸した時間",
          value: "3,420分",
          subtext: "静かな1分が積み重なっています"
        },
        {
          key: "people",
          label: "今、一緒に整っている人",
          value: "124人",
          subtext: "ゆるやかにつながる仲間"
        },
        {
          key: "habit",
          label: "続いている小さな習慣",
          value: "7日間チャレンジ",
          subtext: "無理なく、また戻れるリズム"
        }
      ]
    },
    dailyRhythmLayer: {
      eyebrow: "毎日の小さなリズム",
      title: "今日のあなたに、\nちょうどいい1分を。",
      description: "忙しくても大丈夫。\n今の状態に合わせて、\n小さく整える時間を。",
      cards: [
        {
          key: "morning",
          emoji: "☀️",
          title: "朝のひと呼吸",
          description: "今日を軽やかに始める1分",
          cta: "始める",
          href: "/meditation?duration=60&type=morning"
        },
        {
          key: "afternoon",
          emoji: "🌿",
          title: "疲れた時の30秒",
          description: "SNS疲れや気持ちの乱れに",
          cta: "整える",
          href: "/meditation?duration=30&type=day"
        },
        {
          key: "night",
          emoji: "🌙",
          title: "おやすみ前の静かな1分",
          description: "眠る前に心をゆるめる",
          cta: "眠る準備",
          href: "/meditation?duration=60&type=night"
        }
      ],
      messageTitle: "今日のあなたへ",
      messages: [
        "考えすぎた日は、\nまず呼吸から。",
        "急がなくて大丈夫。\n小さく整えればいい。",
        "心が疲れた日は、\n自然に戻ろう。"
      ]
    },
    mission: {
      eyebrow: "Why Meisoulife",
      title: "静けさを失った時代に、戻れる場所をつくる",
      why: "現代人は、静けさを失っています。",
      whyNow: "AI時代だからこそ、人間らしいリズムが必要です。",
      mission: "一人ひとりが自分に戻り、共に目覚めて生きる文化を育てる。",
      testimonials: [
        { quote: "眠れるようになった", name: "Mika · Tokyo" },
        { quote: "毎日が軽くなった", name: "Jisoo · Seoul" },
        { quote: "一人じゃないと感じた", name: "Emma · London" },
        { quote: "1分だから続けられた", name: "Daniel · Sydney" },
        { quote: "AIの一言で心が戻った", name: "Kenji · Kyoto" }
      ]
    },
    membership: {
      eyebrow: "Membership",
      title: "まずは無料で。\n続けたくなったら、メンバーへ。",
      description:
        "瞑想lifeのメンバーシップは、コンテンツを買うことではありません。自分に戻る日常を、やさしく続けるための参加です。",
      freeLabel: "Free",
      freeTitle: "まずは無料で7日間",
      freeFeatures: ["1分瞑想体験", "AIコーチサンプル", "7日リズムトライアル"],
      freeCta: "無料で7日間はじめる",
      plans: [
        {
          key: "basic",
          name: "Basic",
          price: "¥1,000 / month",
          identity: "毎日の戻る力を守る",
          description: "1分の戻り方を、静かに続けるために",
          lifeChange: "一日が崩れきる前に、自分の中心へ戻れるようになります。",
          features: ["1分リズム", "AIの静かな伴走", "リズムガーデン", "週ごとのふり返り"],
          cta: "毎日のリズムを続ける",
          featured: true
        },
        {
          key: "leader",
          name: "Growth",
          price: "¥3,000 / month",
          identity: "一人では続かない人へ",
          description: "戻れない日があっても、また続けられるように",
          lifeChange: "続かなさを責めずに、戻れる仕組みそのものが生活に根づきます。",
          features: ["毎日のAI伴走", "週ごとのリズム設計", "共生フィールド", "集中できる実践環境"],
          cta: "深い実践へ進む"
        },
        {
          key: "premium",
          name: "Inner Circle",
          price: "¥10,000 / month",
          identity: "世界10,000人の共生リーダーのための特別な場",
          description: "自分を整え、周りにも静けさを広げていくために",
          lifeChange: "自分を整える実践が、周囲と世界に静かに広がる役割へ変わります。",
          features: [
            "深いリズムコーチング",
            "リーダーシップセッション",
            "リトリート優先案内",
            "共生プロジェクト"
          ],
          cta: "共生リーダーとして参加する"
        }
      ],
      comparisonTitle: "何が受け取れて、何が変わるのか",
      comparisonRows: [
        { label: "毎日の戻り方", free: "1分体験", growth: "毎日のAI伴走", inner: "毎日 + 深い実践導線" },
        { label: "リズムの可視化", free: "7日分", growth: "わたしのリズムガーデン", inner: "より深いレポート" },
        { label: "つながり方", free: "静かな世界接続", growth: "共生フィールド", inner: "特別なInner Circle" },
        { label: "暮らしの変化", free: "まず calm を知る", growth: "日常のリズムを守る", inner: "共生文化を広げる" }
      ]
    },
    mobile: {
      meditate: "1分体験",
      askAi: "AIに聞く"
    }
  },
  kr: {
    hero: {
      eyebrow: "Quiet Daily Rhythm",
      title: "하루 1분부터.\n자신에게 돌아오는 고요한 습관.",
      supporting: "혼자가 아닙니다.\n함께 깨어나는 일상으로.",
      subtitle:
        "바쁜 일상 속에서도 조용히 호흡을 정돈하고 자신의 중심으로 돌아올 수 있는 자리. 명상life는 세계 어딘가의 누군가와 부드럽게 연결된 채 이어가는 새로운 일상의 리듬입니다.",
      primary: "무료로 7일 시작하기",
      secondary: "1분 명상 체험하기",
      proof: ["하루 1분부터", "조용히 돌아오기", "세계와 부드럽게 연결"]
    },
    todaysRhythmCard: {
      eyebrow: "오늘의 작은 리듬",
      title: "오늘의 1분 리듬",
      messages: ["생각이 많아진 날에는,\n먼저 호흡으로 돌아가요."],
      support: "오늘도 여기서부터,\n작게 정돈합니다.",
      activeNow: "오늘도 124명이 각자의 자리에서 조용히 정돈하고 있습니다.",
      actionLabel: "오늘의 작은 액션",
      actions: ["30초, 미소를 지어봅니다."],
      cta: "오늘의 1분 시작하기"
    },
    checkIn: {
      eyebrow: "Today Rhythm Check-in",
      title: "오늘의 상태는 어떤가요?",
      description: "지금의 당신에게 맞는\n작은 리듬을 찾아봅시다.",
      support: "무리하지 않아도 괜찮습니다.",
      returnLine: "오늘도 다시 돌아왔습니다.",
      recommendationEyebrow: "Today Rhythm Recommendation",
      recommendationTitle: "작은 리듬의 제안",
      wordLabel: "오늘의 말",
      breathLabel: "호흡 리듬",
      meditationLabel: "1분 명상",
      supportLabel: "조용한 지원",
      secondaryCta: "AI 코치 보기",
      options: [
        {
          key: "heavy",
          emoji: "😔",
          label: "마음이 조금 무겁다",
          recommendation: {
            type: "heavy",
            word: "오늘은 조금 가벼워지는 것만으로도 충분합니다.",
            breath: "4초 들이쉬고, 6초 내쉬기",
            meditation: "마음을 풀어주는 1분 리듬",
            support: "먼저 지금의 무게를 그대로 받아들여 봅시다.",
            cta: "조용한 1분 시작하기"
          }
        },
        {
          key: "anxious",
          emoji: "😟",
          label: "불안이 있다",
          recommendation: {
            type: "anxious",
            word: "지금은 답을 서두르지 않아도 괜찮습니다.",
            breath: "4초 들이쉬고, 4초 내쉬기",
            meditation: "불안을 가라앉히는 1분 리듬",
            support: "숨이 드나드는 감각만 느껴도 충분합니다.",
            cta: "조용한 1분 시작하기"
          }
        },
        {
          key: "unfocused",
          emoji: "😵",
          label: "집중이 안 된다",
          recommendation: {
            type: "unfocused",
            word: "하나로 돌아오는 것만으로 흐름은 달라집니다.",
            breath: "4초 들이쉬고, 2초 멈추고, 4초 내쉬기",
            meditation: "중심을 되찾는 1분 리듬",
            support: "생각을 정리하기보다 호흡을 먼저 맞춰보세요.",
            cta: "리듬을 정돈하기"
          }
        },
        {
          key: "tired",
          emoji: "😴",
          label: "조금 피곤하다",
          recommendation: {
            type: "tired",
            word: "오늘은 조금 천천히 가도 좋습니다.",
            breath: "자연스럽게 들이쉬고, 조금 길게 내쉬기",
            meditation: "회복을 위한 호흡",
            support: "쉬는 것도 오늘의 소중한 실천입니다.",
            cta: "리듬을 정돈하기"
          }
        },
        {
          key: "calm",
          emoji: "😌",
          label: "차분하다",
          recommendation: {
            type: "calm",
            word: "그 고요함을 오늘의 바탕으로 삼아봅시다.",
            breath: "4초 들이쉬고, 4초 내쉬기",
            meditation: "고요함을 넓히는 1분 리듬",
            support: "지금의 평온함을 조금 더 길게 머물게 해보세요.",
            cta: "이대로 호흡하기"
          }
        },
        {
          key: "grateful",
          emoji: "🙏",
          label: "감사하고 있다",
          recommendation: {
            type: "grateful",
            word: "그 부드러움은 주변에도 조용히 퍼집니다.",
            breath: "4초 들이쉬고, 6초 내쉬기",
            meditation: "감사를 깊게 하는 1분 리듬",
            support: "감사한 하나를 가슴 안에 두고 호흡해보세요.",
            cta: "부드러운 1분 시작하기"
          }
        }
      ]
    },
    instant: {
      eyebrow: "Instant Calm",
      title: "1분 리셋 체험",
      description: "단 1분. 애쓰지 않는 호흡부터 시작해 지금 여기로 조용히 돌아와 보세요.",
      start: "1분 리셋 시작하기",
      pause: "잠시 멈추기",
      fullscreen: "전체 화면으로 열기",
      inhale: "들이쉬기",
      hold: "멈추기",
      exhale: "내쉬기",
      sensory: "읽기보다 먼저 호흡으로. 눈을 감은 채로도 움직임과 진동으로 리듬을 느낄 수 있습니다."
    },
    coach: {
      eyebrow: "Quiet Rhythm Guide",
      title: "지금 당신에게,\n조용한 1분의 가이드를.",
      description:
        "불안하거나 지치고, 집중이 흐려질 때.\nQuiet Rhythm Guide가\n지금의 상태에 맞춰\n부드러운 말과 함께\n1분의 리듬으로 안내합니다.",
      cta: "Quiet Rhythm Guide GPT 열기",
      openCoach: "Quiet Rhythm Guide GPT 열기",
      note: "※ ChatGPT에 로그인하면 무료로 이용할 수 있습니다. 사용 횟수에는 제한이 있을 수 있습니다.",
      copyPrompt: "프롬프트 복사",
      copiedPrompt: "복사되었습니다",
      promptLabel: "GPT에 이렇게 전해보세요",
      guidanceLabel: "작은 프리뷰",
      rhythmLabel: "1분의 시작",
      states: [
        {
          key: "anxiety",
          label: "불안",
          previewMessage:
            "괜찮습니다.\n먼저 호흡을 조금만 천천히 해봅시다.\n지금은 답을 서두르지 않아도 됩니다.",
          prompt: "지금 불안이 있습니다. 1분 안에 진정할 수 있도록 부드럽게 안내해 주세요."
        },
        {
          key: "tired",
          label: "피곤함",
          previewMessage:
            "여기까지 온 것만으로도 충분합니다.\n몸이 조금 쉬고 싶어할지도 모릅니다.\n1분만 자신에게 돌아와 봅시다.",
          prompt: "조금 피곤합니다. 무리 없이 회복할 수 있는 1분 리듬을 안내해 주세요."
        },
        {
          key: "focus",
          label: "집중하고 싶다",
          previewMessage:
            "지금은 모든 걸 다 하려 하지 않아도 됩니다.\n먼저 하나만.\n호흡과 시선을 정돈해 봅시다.",
          prompt: "집중하고 싶습니다. 지금 해야 할 한 가지로 돌아가는 1분 가이드를 주세요."
        },
        {
          key: "sleep",
          label: "잠들고 싶다",
          previewMessage:
            "오늘의 일들을 조금씩 내려놓아 봅시다.\n몸의 무게를 느끼면서,\n조용히 잠들 준비를 합니다.",
          prompt: "잠들기 전에 마음을 조용히 하고 싶습니다. 1분짜리 수면 전 가이드를 부탁합니다."
        }
      ]
    },
    garden: {
      eyebrow: "My Rhythm Garden",
      title: "나의 리듬을 기르기",
      description:
        "매일의 감정과 호흡 시간이 빛의 씨앗처럼 조용히 쌓여갑니다. 이것은 기록이 아니라, 안쪽의 변화가 자라는 정원입니다.",
      weekTitle: "7일간의 빛의 궤적",
      message: "작은 변화도 매일 돌아오면 분명한 형태를 갖기 시작합니다.",
      streakLabel: "현재 리듬",
      returning: "어제보다 조금 부드러운 윤곽이 보이고 있습니다.",
      dayUnit: "일",
      yesterday: "어제",
      today: "오늘",
      thisWeek: "이번 주",
      uneasy: "조금 불안",
      softer: "조금 평온",
      steady: "더 안정적"
    },
    live: {
      eyebrow: "함께 정돈되는 리듬",
      title: "오늘도, 어디선가 누군가가 호흡을 정돈하고 있습니다.",
      description: "혼자 애쓰지 않아도 괜찮습니다. 작은 1분들이 모여 함께 깨어나는 일상을 만듭니다.",
      metrics: [
        {
          key: "minutes",
          label: "오늘 함께 호흡한 시간",
          value: "3,420분",
          subtext: "조용한 1분이 쌓이고 있습니다"
        },
        {
          key: "people",
          label: "지금 함께 정돈 중인 사람",
          value: "124명",
          subtext: "느슨하게 연결된 동료들"
        },
        {
          key: "habit",
          label: "이어지고 있는 작은 습관",
          value: "7일 챌린지",
          subtext: "무리 없이, 다시 돌아올 수 있는 리듬"
        }
      ]
    },
    dailyRhythmLayer: {
      eyebrow: "매일의 작은 리듬",
      title: "오늘의 당신에게,\n딱 맞는 1분을.",
      description: "바빠도 괜찮습니다.\n지금 상태에 맞춰,\n작게 정돈하는 시간을.",
      cards: [
        {
          key: "morning",
          emoji: "☀️",
          title: "아침의 한 호흡",
          description: "오늘을 가볍게 시작하는 1분",
          cta: "시작하기",
          href: "/meditation?duration=60&type=morning"
        },
        {
          key: "afternoon",
          emoji: "🌿",
          title: "지쳤을 때의 30초",
          description: "SNS 피로와 흐트러진 마음에",
          cta: "정돈하기",
          href: "/meditation?duration=30&type=day"
        },
        {
          key: "night",
          emoji: "🌙",
          title: "잠들기 전의 조용한 1분",
          description: "잠들기 전 마음을 부드럽게 풀어줍니다",
          cta: "잠들 준비",
          href: "/meditation?duration=60&type=night"
        }
      ],
      messageTitle: "오늘의 당신에게",
      messages: [
        "생각이 많아진 날엔,\n먼저 호흡부터.",
        "서두르지 않아도 괜찮아요.\n작게 정돈하면 됩니다.",
        "마음이 지친 날엔,\n자연으로 돌아가요."
      ]
    },
    mission: {
      eyebrow: "Why Meisoulife",
      title: "고요함을 잃은 시대에, 다시 돌아올 자리를 만든다",
      why: "현대인은 고요함을 잃고 있습니다.",
      whyNow: "AI 시대일수록 인간다운 리듬이 필요합니다.",
      mission: "한 사람 한 사람이 자신에게 돌아오고, 함께 깨어 살아가는 문화를 기릅니다.",
      testimonials: [
        { quote: "잠을 잘 수 있게 됐다", name: "Mika · Tokyo" },
        { quote: "하루가 가벼워졌다", name: "Jisoo · Seoul" },
        { quote: "혼자가 아니라고 느꼈다", name: "Emma · London" },
        { quote: "1분이라서 계속할 수 있었다", name: "Daniel · Sydney" },
        { quote: "AI의 한마디로 마음이 돌아왔다", name: "Kenji · Kyoto" }
      ]
    },
    membership: {
      eyebrow: "Membership",
      title: "먼저는 무료로.\n이어가고 싶다면, 멤버십으로.",
      description:
        "명상life 멤버십은 콘텐츠 구매가 아닙니다. 자신에게 돌아오는 일상을 부드럽게 이어가기 위한 참여입니다.",
      freeLabel: "Free",
      freeTitle: "먼저 무료로 7일",
      freeFeatures: ["1분 명상 체험", "AI 코치 샘플", "7일 리듬 체험"],
      freeCta: "무료로 7일 시작하기",
      plans: [
        {
          key: "basic",
          name: "Basic",
          price: "¥1,000 / month",
          identity: "매일 돌아오는 힘을 지키기",
          description: "1분의 돌아옴을 조용히 이어가기 위해",
          lifeChange: "하루가 완전히 무너지기 전에 자신의 중심으로 돌아올 수 있게 됩니다.",
          features: ["1분 리듬", "AI의 조용한 동행", "리듬 가든", "주간 돌아보기"],
          cta: "매일의 리듬을 계속하기",
          featured: true
        },
        {
          key: "leader",
          name: "Growth",
          price: "¥3,000 / month",
          identity: "혼자서는 계속하기 어려운 사람에게",
          description: "돌아오지 못한 날이 있어도 다시 이어가기 위해",
          lifeChange: "계속되지 않는 자신을 탓하지 않고, 돌아올 구조가 생활에 자리잡습니다.",
          features: ["매일의 AI 동행", "주간 리듬 설계", "공생 필드", "집중 실천 환경"],
          cta: "깊은 실천으로 가기"
        },
        {
          key: "premium",
          name: "Inner Circle",
          price: "¥10,000 / month",
          identity: "세계 10,000명의 공생 리더를 위한 특별한 장",
          description: "자신을 정돈하고 주변에도 고요함을 넓혀가기 위해",
          lifeChange: "자신을 정돈하는 실천이 주변과 세계를 밝히는 역할로 깊어집니다.",
          features: ["깊은 리듬 코칭", "리더십 세션", "리트릿 우선 안내", "공생 프로젝트"],
          cta: "공생 리더로 참여하기"
        }
      ],
      comparisonTitle: "무엇을 받고, 삶이 어떻게 달라지는가",
      comparisonRows: [
        { label: "매일 돌아오는 방식", free: "1분 체험", growth: "매일 AI 동행", inner: "매일 + 깊은 실천 흐름" },
        { label: "리듬 시각화", free: "7일 보기", growth: "나의 리듬 가든", inner: "더 깊은 리포트" },
        { label: "연결감", free: "조용한 세계 연결", growth: "공생 필드", inner: "특별한 Inner Circle" },
        { label: "삶의 변화", free: "먼저 calm을 안다", growth: "일상의 리듬을 지킨다", inner: "공생 문화를 넓힌다" }
      ]
    },
    mobile: {
      meditate: "1분 체험",
      askAi: "AI에게 묻기"
    }
  },
  en: {
    hero: {
      eyebrow: "Quiet Daily Rhythm",
      title: "From one minute a day.\nA quiet habit of returning to yourself.",
      supporting: "You are not alone.\nToward days of awakening together.",
      subtitle:
        "A place to settle your breath and return to your center, even in the middle of a busy day. Meisoulife is a new daily rhythm you continue while feeling softly connected to someone, somewhere in the world.",
      primary: "Start free for 7 days",
      secondary: "Try the 1-minute meditation",
      proof: ["From one minute a day", "A quiet place to return", "Softly connected to the world"]
    },
    todaysRhythmCard: {
      eyebrow: "Today’s small rhythm",
      title: "Today’s 1-minute rhythm",
      messages: ["On days when you think too much,\nbegin by returning to breath."],
      support: "Begin again here today,\nin one small quiet way.",
      activeNow: "Today, 124 people are settling in their own quiet places.",
      actionLabel: "Today’s small action",
      actions: ["Spend 30 seconds making a soft smile."],
      cta: "Begin today’s one minute"
    },
    checkIn: {
      eyebrow: "Today Rhythm Check-in",
      title: "How are you today?",
      description: "Let’s find a small rhythm\nthat fits who you are right now.",
      support: "You do not have to force anything.",
      returnLine: "You came back again today.",
      recommendationEyebrow: "Today Rhythm Recommendation",
      recommendationTitle: "A small rhythm for today",
      wordLabel: "Today’s words",
      breathLabel: "Breathing rhythm",
      meditationLabel: "1-minute meditation",
      supportLabel: "Quiet support",
      secondaryCta: "See the AI coach",
      options: [
        {
          key: "heavy",
          emoji: "😔",
          label: "My heart feels a little heavy",
          recommendation: {
            type: "heavy",
            word: "For today, becoming a little lighter is enough.",
            breath: "Inhale for 4, exhale for 6",
            meditation: "A one-minute rhythm to soften heaviness",
            support: "Begin by allowing the weight to be here as it is.",
            cta: "Begin a quiet minute"
          }
        },
        {
          key: "anxious",
          emoji: "😟",
          label: "I feel anxious",
          recommendation: {
            type: "anxious",
            word: "You do not have to rush for an answer right now.",
            breath: "Inhale for 4, exhale for 4",
            meditation: "A one-minute rhythm to settle anxiety",
            support: "It is enough to feel the breath going in and out.",
            cta: "Begin a quiet minute"
          }
        },
        {
          key: "unfocused",
          emoji: "😵",
          label: "I cannot focus",
          recommendation: {
            type: "unfocused",
            word: "The flow changes when you return to one thing.",
            breath: "Inhale for 4, hold for 2, exhale for 4",
            meditation: "A one-minute rhythm to return to center",
            support: "Try settling the breath before trying to fix the mind.",
            cta: "Settle the rhythm"
          }
        },
        {
          key: "tired",
          emoji: "😴",
          label: "I feel a little tired",
          recommendation: {
            type: "tired",
            word: "It is okay to move a little more slowly today.",
            breath: "Breathe naturally and exhale a little longer",
            meditation: "Breathing for recovery",
            support: "Rest is also part of today’s practice.",
            cta: "Settle the rhythm"
          }
        },
        {
          key: "calm",
          emoji: "😌",
          label: "I feel calm",
          recommendation: {
            type: "calm",
            word: "Let that calmness become the ground of your day.",
            breath: "Inhale for 4, exhale for 4",
            meditation: "A one-minute rhythm to widen calm",
            support: "Let this steadiness stay with you a little longer.",
            cta: "Keep breathing"
          }
        },
        {
          key: "grateful",
          emoji: "🙏",
          label: "I feel grateful",
          recommendation: {
            type: "grateful",
            word: "That softness can quietly spread to others too.",
            breath: "Inhale for 4, exhale for 6",
            meditation: "A one-minute rhythm to deepen gratitude",
            support: "Hold one small gratitude close while you breathe.",
            cta: "Begin a gentle minute"
          }
        }
      ]
    },
    instant: {
      eyebrow: "Instant Calm",
      title: "1-minute reset",
      description: "Just one minute. Begin with an effortless breath and quietly return to yourself.",
      start: "Begin the 1-minute reset",
      pause: "Pause",
      fullscreen: "Open full screen",
      inhale: "Inhale",
      hold: "Hold",
      exhale: "Exhale",
      sensory: "Before reading, return to breath. The rhythm can be felt through motion and vibration, even with your eyes closed."
    },
    coach: {
      eyebrow: "Quiet Rhythm Guide",
      title: "A quiet one-minute guide,\nfor how you feel right now.",
      description:
        "For anxiety, tiredness, restlessness, or trouble focusing.\nQuiet Rhythm Guide responds gently to your current state\nand leads you into a simple one-minute rhythm.",
      cta: "Open Quiet Rhythm Guide GPT",
      openCoach: "Open Quiet Rhythm Guide GPT",
      note: "ChatGPT login is required to use it for free. Usage limits may apply.",
      copyPrompt: "Copy prompt",
      copiedPrompt: "Copied",
      promptLabel: "A simple prompt to start with",
      guidanceLabel: "Preview",
      rhythmLabel: "One-minute entry",
      states: [
        {
          key: "anxiety",
          label: "Anxiety",
          previewMessage:
            "It's okay.\nLet's slow the breath just a little.\nYou do not have to rush the answer right now.",
          prompt: "I feel anxious right now. Please guide me gently into a one-minute rhythm that helps me settle."
        },
        {
          key: "tired",
          label: "Tired",
          previewMessage:
            "You've already carried a lot.\nYour body may be asking for a little rest.\nLet's return to yourself for one minute.",
          prompt: "I'm a little tired. Please guide me into a gentle one-minute rhythm for recovery."
        },
        {
          key: "focus",
          label: "Need focus",
          previewMessage:
            "You do not need to do everything at once.\nJust one thing first.\nLet's steady your breath and your gaze.",
          prompt: "I want to focus. Please give me a one-minute guide that helps me return to one thing."
        },
        {
          key: "sleep",
          label: "Want to sleep",
          previewMessage:
            "Let's release today a little at a time.\nFeel the weight of your body,\nand prepare for sleep quietly.",
          prompt: "I want to quiet my mind before sleep. Please guide me through a one-minute bedtime rhythm."
        }
      ]
    },
    garden: {
      eyebrow: "My Rhythm Garden",
      title: "Grow my rhythm",
      description:
        "Each day’s feeling and breath becomes a seed of light. This is not just tracking. It is a quiet garden where inner change accumulates.",
      weekTitle: "A seven-day trail of light",
      message: "Even subtle change becomes visible when you keep returning.",
      streakLabel: "Current rhythm",
      returning: "There is already a softer outline than yesterday.",
      dayUnit: "days",
      yesterday: "Yesterday",
      today: "Today",
      thisWeek: "This week",
      uneasy: "uneasy",
      softer: "softer",
      steady: "more steady"
    },
    live: {
      eyebrow: "Rhythm Together",
      title: "Even today, someone somewhere is settling into breath.",
      description: "You do not have to push through alone. Small quiet minutes gather into days of awakening together.",
      metrics: [
        {
          key: "minutes",
          label: "Minutes breathed together today",
          value: "3,420 min",
          subtext: "Quiet one-minute returns are accumulating"
        },
        {
          key: "people",
          label: "People settling together now",
          value: "124",
          subtext: "Companions gently connected"
        },
        {
          key: "habit",
          label: "A small habit continuing",
          value: "7-day challenge",
          subtext: "A rhythm you can return to without pressure"
        }
      ]
    },
    dailyRhythmLayer: {
      eyebrow: "A small daily rhythm",
      title: "A minute that fits\nwho you are today.",
      description: "Even when life is busy,\nyou can still make space\nfor a small return.",
      cards: [
        {
          key: "morning",
          emoji: "☀️",
          title: "One breath for the morning",
          description: "A light one-minute beginning for the day",
          cta: "Begin",
          href: "/meditation?duration=60&type=morning"
        },
        {
          key: "afternoon",
          emoji: "🌿",
          title: "30 seconds for tired moments",
          description: "For social fatigue and scattered feelings",
          cta: "Settle",
          href: "/meditation?duration=30&type=day"
        },
        {
          key: "night",
          emoji: "🌙",
          title: "A quiet minute before sleep",
          description: "Soften the mind before the day ends",
          cta: "Prepare for rest",
          href: "/meditation?duration=60&type=night"
        }
      ],
      messageTitle: "For you today",
      messages: [
        "On days when you think too much,\nbegin with breath.",
        "You do not need to rush.\nSettle one small thing at a time.",
        "When the heart feels tired,\nreturn to nature."
      ]
    },
    mission: {
      eyebrow: "Why Meisoulife",
      title: "Create a place to return in an age that lost stillness",
      why: "Modern people are losing stillness.",
      whyNow: "In the age of AI, human rhythm matters even more.",
      mission: "Help each person return to themselves and cultivate a culture of awakening together.",
      testimonials: [
        { quote: "I started sleeping again", name: "Mika · Tokyo" },
        { quote: "My days feel lighter", name: "Jisoo · Seoul" },
        { quote: "I no longer feel alone", name: "Emma · London" },
        { quote: "I could continue because it was only one minute", name: "Daniel · Sydney" },
        { quote: "One AI sentence brought me back", name: "Kenji · Kyoto" }
      ]
    },
    membership: {
      eyebrow: "Membership",
      title: "Start free.\nJoin membership when you want to keep going.",
      description:
        "Meisoulife membership is not about buying content. It is a way to keep returning to yourself with quiet support.",
      freeLabel: "Free",
      freeTitle: "Start with 7 days free",
      freeFeatures: ["1-minute meditation", "AI coach sample", "7-day rhythm trial"],
      freeCta: "Start 7 days free",
      plans: [
        {
          key: "basic",
          name: "Basic",
          price: "¥1,000 / month",
          identity: "Protect your daily return",
          description: "To quietly continue your daily return",
          lifeChange: "You begin returning to your center before the day fully unravels.",
          features: ["1-minute rhythm", "quiet AI support", "Rhythm Garden", "weekly reflection"],
          cta: "Keep the daily rhythm",
          featured: true
        },
        {
          key: "leader",
          name: "Growth",
          price: "¥3,000 / month",
          identity: "For people who cannot keep going alone",
          description: "To keep going, even after days when you drift away",
          lifeChange: "Instead of blaming yourself for inconsistency, you gain a structure that helps you return.",
          features: ["daily AI support", "weekly rhythm loop", "coexistence field", "focused practice space"],
          cta: "Move into deeper practice"
        },
        {
          key: "premium",
          name: "Inner Circle",
          price: "¥10,000 / month",
          identity: "A special place for 10,000 coexistence leaders",
          description: "To deepen your own rhythm and extend calm into the world",
          lifeChange: "Your personal practice grows into a role that quietly illuminates others and the world.",
          features: ["advanced rhythm coaching", "leadership sessions", "retreat priority", "coexistence projects"],
          cta: "Join as a coexistence leader"
        }
      ],
      comparisonTitle: "What you receive, and what changes",
      comparisonRows: [
        { label: "daily return", free: "1-minute experience", growth: "daily AI support", inner: "daily + deeper practice" },
        { label: "rhythm tracking", free: "7-day preview", growth: "My Rhythm Garden", inner: "deeper reports" },
        { label: "connection", free: "quiet world connection", growth: "coexistence field", inner: "special Inner Circle" },
        { label: "life change", free: "experience calm", growth: "protect daily rhythm", inner: "expand coexistence culture" }
      ]
    },
    mobile: {
      meditate: "1-minute trial",
      askAi: "Ask AI"
    }
  }
};
