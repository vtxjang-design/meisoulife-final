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
    guidanceLabel: string;
    rhythmLabel: string;
    states: Array<{
      key: string;
      label: string;
      acknowledgment: string;
      guidance: string;
      rhythm: string;
      meditation: string;
      reflection: string;
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
    sharedMinutes: string;
    breathingNow: string;
    countries: string;
    weekly: string;
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
      title: "5秒で始まる、今日の1分リズム",
      description:
        "読む前に、まず呼吸へ。サインアップなしで、今ここに戻る体験から始められます。",
      start: "1分を始める",
      pause: "一度止める",
      fullscreen: "全画面で開く",
      inhale: "吸って",
      hold: "止めて",
      exhale: "吐いて",
      sensory: "目を閉じたままでも使えるように、動きと振動でリズムを感じられます。"
    },
    coach: {
      eyebrow: "AI Rhythm Coach",
      title: "今のあなたの状態は？",
      description: "気分をひとつ選ぶと、AIが今日の戻り方を短く静かに案内します。",
      cta: "このリズムを続ける",
      openCoach: "AIコーチを開く",
      guidanceLabel: "Guidance",
      rhythmLabel: "Rhythm",
      states: [
        {
          key: "stress",
          label: "ストレス",
          acknowledgment: "がんばりすぎた心は、まずほどくことから整います。",
          guidance: "肩の力を抜いて、呼吸の長さだけを少し広げてみましょう。",
          rhythm: "4-2-4 呼吸を3分",
          meditation: "おすすめ: 夜の3分リズム",
          reflection: "今日は整えるだけで十分です。"
        },
        {
          key: "anxiety",
          label: "不安",
          acknowledgment: "不安は、戻る場所が見えないときに大きくなります。",
          guidance: "足の裏と息の出入りを感じて、今ここに輪郭をつくりましょう。",
          rhythm: "4-2-4 呼吸を1分",
          meditation: "おすすめ: 60秒リズム",
          reflection: "次の一歩だけを見れば大丈夫です。"
        },
        {
          key: "focus",
          label: "集中したい",
          acknowledgment: "集中は、力を入れるより、散ったものを戻すと生まれます。",
          guidance: "目線を少し落として、息をまっすぐ通す感覚を持ちましょう。",
          rhythm: "4-2-4 呼吸を1分",
          meditation: "おすすめ: 昼の1分リズム",
          reflection: "ひとつに戻るだけで流れは変わります。"
        },
        {
          key: "sleep",
          label: "眠れない",
          acknowledgment: "眠れない夜は、静けさより先に安心が必要です。",
          guidance: "吐く息を長めにして、身体にもう大丈夫だと知らせましょう。",
          rhythm: "4-2-6 呼吸を3分",
          meditation: "おすすめ: 夜の3分リズム",
          reflection: "眠ろうとしなくても、緩むだけで十分です。"
        },
        {
          key: "tired",
          label: "疲れている",
          acknowledgment: "疲れた日は、前に進むより、少し戻るほうが深く回復します。",
          guidance: "息を整える前に、身体の重さをそのまま受け止めてみましょう。",
          rhythm: "自然呼吸を1分",
          meditation: "おすすめ: 朝の3分リズム",
          reflection: "今日は休むリズムも大切な実践です。"
        },
        {
          key: "calm",
          label: "心を落ち着けたい",
          acknowledgment: "落ち着きたい気持ちそのものが、もう戻る準備になっています。",
          guidance: "吸う息より、吐く息を丁寧に感じてみてください。",
          rhythm: "4-2-4 呼吸を3分",
          meditation: "おすすめ: 朝の3分リズム",
          reflection: "静けさは、少しずつ広がっていきます。"
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
      eyebrow: "Live Together",
      title: "今この瞬間、世界のどこかで誰かが一緒に呼吸しています。",
      description: "にぎやかなSNSではなく、静けさが重なっていく共生フィールドです。",
      sharedMinutes: "今日、3,842分の静かな時間が共有されています。",
      breathingNow: "今、一緒に呼吸している人",
      countries: "今日つながった国",
      weekly: "今週の共生リズム"
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
      title: "機能ではなく、続けられる自分に入っていく",
      description:
        "瞑想lifeのメンバーシップは、瞑想コンテンツを買うことではありません。自分に戻る日常を、AIと仲間と一緒に続けるための参加です。",
      freeLabel: "Free",
      freeTitle: "まずは無料で7日間",
      freeFeatures: ["1分瞑想体験", "AIコーチサンプル", "7日リズムトライアル"],
      freeCta: "無料で7日間はじめる",
      plans: [
        {
          key: "basic",
          name: "Basic",
          price: "¥1,000 / month",
          identity: "毎日の戻る力を守る人",
          description: "daily AI rhythm coach / 1-minute return / quiet continuity",
          lifeChange: "一日が崩れきる前に、自分の中心へ戻れるようになります。",
          features: ["daily AI rhythm coach", "personal rhythm tracker", "audio guidance", "weekly reflection"],
          cta: "リズムを続ける",
          featured: true
        },
        {
          key: "leader",
          name: "Growth",
          price: "¥3,000 / month",
          identity: "一人では続かない人へ",
          description: "support / weekly loop / community rhythm",
          lifeChange: "続かなさを責めずに、戻れる仕組みそのものが生活に根づきます。",
          features: ["daily AI rhythm coach", "weekly rhythm loop", "focused environment", "community rhythm field"],
          cta: "リズムを続ける"
        },
        {
          key: "premium",
          name: "Inner Circle",
          price: "¥10,000 / month",
          identity: "世界10,000人の共生リーダーのための特別な場",
          description: "leadership / retreat / coexistence culture / global projects",
          lifeChange: "自分を整える実践が、周囲と世界に静かに広がる役割へ変わります。",
          features: [
            "advanced rhythm coaching",
            "leadership sessions",
            "retreat priority",
            "global coexistence projects"
          ],
          cta: "リズムを続ける"
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
      title: "5초 안에 시작되는 오늘의 1분 리듬",
      description: "읽기 전에 먼저 호흡으로. 회원가입 없이 지금 여기로 돌아오는 체험부터 시작할 수 있습니다.",
      start: "1분 시작하기",
      pause: "잠시 멈추기",
      fullscreen: "전체 화면으로 열기",
      inhale: "들이쉬기",
      hold: "멈추기",
      exhale: "내쉬기",
      sensory: "눈을 감은 채로도 리듬을 느낄 수 있도록 움직임과 진동으로 설계했습니다."
    },
    coach: {
      eyebrow: "AI Rhythm Coach",
      title: "지금 당신의 상태는 어떤가요?",
      description: "기분 하나를 고르면 AI가 오늘 돌아오는 방법을 짧고 조용하게 안내합니다.",
      cta: "이 리듬을 이어가기",
      openCoach: "AI 코치 열기",
      guidanceLabel: "가이드",
      rhythmLabel: "리듬",
      states: [
        {
          key: "stress",
          label: "스트레스",
          acknowledgment: "애써 온 마음은 먼저 풀어줄 때 정돈되기 시작합니다.",
          guidance: "어깨 힘을 빼고, 호흡의 길이만 조금 넓혀보세요.",
          rhythm: "4-2-4 호흡 3분",
          meditation: "추천: 밤의 3분 리듬",
          reflection: "오늘은 정돈하는 것만으로 충분합니다."
        },
        {
          key: "anxiety",
          label: "불안",
          acknowledgment: "불안은 돌아올 자리가 보이지 않을 때 더 커집니다.",
          guidance: "발바닥과 숨의 드나듦을 느끼며 지금 여기에 윤곽을 만들어보세요.",
          rhythm: "4-2-4 호흡 1분",
          meditation: "추천: 60초 리듬",
          reflection: "다음 한 걸음만 봐도 괜찮습니다."
        },
        {
          key: "focus",
          label: "집중하고 싶다",
          acknowledgment: "집중은 힘으로 만드는 것보다 흩어진 것을 돌아오게 할 때 생깁니다.",
          guidance: "시선을 조금 낮추고, 숨이 곧게 지나가는 감각을 느껴보세요.",
          rhythm: "4-2-4 호흡 1분",
          meditation: "추천: 낮의 1분 리듬",
          reflection: "하나로 돌아오는 것만으로 흐름이 바뀝니다."
        },
        {
          key: "sleep",
          label: "잠이 오지 않는다",
          acknowledgment: "잠들지 못하는 밤에는 고요함보다 먼저 안심이 필요합니다.",
          guidance: "내쉬는 숨을 조금 길게 해서 몸에 이제 괜찮다고 알려주세요.",
          rhythm: "4-2-6 호흡 3분",
          meditation: "추천: 밤의 3분 리듬",
          reflection: "잠들려 하지 않아도, 풀어지는 것만으로 충분합니다."
        },
        {
          key: "tired",
          label: "지쳐 있다",
          acknowledgment: "지친 날에는 앞으로 가는 것보다 조금 돌아오는 것이 더 깊은 회복이 됩니다.",
          guidance: "호흡을 고치기 전에 몸의 무게를 그대로 받아들여 보세요.",
          rhythm: "자연 호흡 1분",
          meditation: "추천: 아침의 3분 리듬",
          reflection: "오늘은 쉬는 리듬도 중요한 실천입니다."
        },
        {
          key: "calm",
          label: "마음을 가라앉히고 싶다",
          acknowledgment: "가라앉고 싶은 마음 자체가 이미 돌아올 준비가 되어 있다는 뜻입니다.",
          guidance: "들이쉬는 숨보다 내쉬는 숨을 더 또렷하게 느껴보세요.",
          rhythm: "4-2-4 호흡 3분",
          meditation: "추천: 아침의 3분 리듬",
          reflection: "고요함은 조금씩 넓어집니다."
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
      eyebrow: "Live Together",
      title: "지금 이 순간, 세계 어딘가에서 누군가가 함께 호흡하고 있습니다.",
      description: "시끄러운 소셜 피드가 아니라, 고요함이 겹쳐지는 공생의 장입니다.",
      sharedMinutes: "오늘 3,842분의 고요한 시간이 함께 쌓였습니다.",
      breathingNow: "지금 함께 호흡 중인 사람",
      countries: "오늘 연결된 나라",
      weekly: "이번 주의 공생 리듬"
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
      title: "기능이 아니라, 계속할 수 있는 나에게 들어가는 것",
      description:
        "명상life 멤버십은 콘텐츠 구매가 아닙니다. 자신에게 돌아오는 일상을 AI와 사람들과 함께 이어가기 위한 참여입니다.",
      freeLabel: "Free",
      freeTitle: "먼저 무료로 7일",
      freeFeatures: ["1분 명상 체험", "AI 코치 샘플", "7일 리듬 체험"],
      freeCta: "무료로 7일 시작하기",
      plans: [
        {
          key: "basic",
          name: "Basic",
          price: "¥1,000 / month",
          identity: "매일 돌아오는 힘을 지키는 사람",
          description: "daily AI rhythm coach / 1-minute return / quiet continuity",
          lifeChange: "하루가 완전히 무너지기 전에 자신의 중심으로 돌아올 수 있게 됩니다.",
          features: ["daily AI rhythm coach", "personal rhythm tracker", "audio guidance", "weekly reflection"],
          cta: "리듬을 계속하기",
          featured: true
        },
        {
          key: "leader",
          name: "Growth",
          price: "¥3,000 / month",
          identity: "혼자서는 계속하기 어려운 사람에게",
          description: "support / weekly loop / community rhythm",
          lifeChange: "계속되지 않는 자신을 탓하지 않고, 돌아올 구조가 생활에 자리잡습니다.",
          features: ["daily AI rhythm coach", "weekly rhythm loop", "focused environment", "community rhythm field"],
          cta: "리듬을 계속하기"
        },
        {
          key: "premium",
          name: "Inner Circle",
          price: "¥10,000 / month",
          identity: "세계 10,000명의 공생 리더를 위한 특별한 장",
          description: "leadership / retreat / coexistence culture / global projects",
          lifeChange: "자신을 정돈하는 실천이 주변과 세계를 밝히는 역할로 깊어집니다.",
          features: [
            "advanced rhythm coaching",
            "leadership sessions",
            "retreat priority",
            "global coexistence projects"
          ],
          cta: "리듬을 계속하기"
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
      title: "Today’s one-minute rhythm begins within five seconds",
      description: "Before reading, return to breath. No signup is needed to feel the platform first.",
      start: "Start 1 minute",
      pause: "Pause",
      fullscreen: "Open full screen",
      inhale: "Inhale",
      hold: "Hold",
      exhale: "Exhale",
      sensory: "The rhythm is designed to be felt through motion and vibration, even with your eyes closed."
    },
    coach: {
      eyebrow: "AI Rhythm Coach",
      title: "How are you right now?",
      description: "Choose one state and the AI offers a quiet way to return today.",
      cta: "Continue this rhythm",
      openCoach: "Open AI coach",
      guidanceLabel: "Guidance",
      rhythmLabel: "Rhythm",
      states: [
        {
          key: "stress",
          label: "Stress",
          acknowledgment: "An overworked mind settles by softening first.",
          guidance: "Release your shoulders and widen only the length of your breath.",
          rhythm: "4-2-4 breathing for 3 minutes",
          meditation: "Recommended: 3-minute night rhythm",
          reflection: "Settling is enough for today."
        },
        {
          key: "anxiety",
          label: "Anxiety",
          acknowledgment: "Anxiety grows when there is no clear place to return.",
          guidance: "Feel the soles of your feet and the path of your breath to redraw the present moment.",
          rhythm: "4-2-4 breathing for 1 minute",
          meditation: "Recommended: 60-second rhythm",
          reflection: "Only the next step needs to be clear."
        },
        {
          key: "focus",
          label: "Need focus",
          acknowledgment: "Focus arrives when scattered attention is gently brought back.",
          guidance: "Lower your gaze a little and feel the breath move in one straight line.",
          rhythm: "4-2-4 breathing for 1 minute",
          meditation: "Recommended: daytime 1-minute rhythm",
          reflection: "Returning to one thing shifts the whole flow."
        },
        {
          key: "sleep",
          label: "Can’t sleep",
          acknowledgment: "A sleepless night needs reassurance before stillness.",
          guidance: "Lengthen the exhale so the body can hear that it is safe to rest.",
          rhythm: "4-2-6 breathing for 3 minutes",
          meditation: "Recommended: 3-minute night rhythm",
          reflection: "You do not need to force sleep. Softening is enough."
        },
        {
          key: "tired",
          label: "Tired",
          acknowledgment: "On tired days, returning is more restorative than pushing forward.",
          guidance: "Before fixing the breath, allow the weight in the body to be there.",
          rhythm: "Natural breathing for 1 minute",
          meditation: "Recommended: 3-minute morning rhythm",
          reflection: "Rest is also a valid rhythm."
        },
        {
          key: "calm",
          label: "Need calm",
          acknowledgment: "The wish to settle is already the beginning of returning.",
          guidance: "Notice the exhale more clearly than the inhale.",
          rhythm: "4-2-4 breathing for 3 minutes",
          meditation: "Recommended: 3-minute morning rhythm",
          reflection: "Stillness widens little by little."
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
      eyebrow: "Live Together",
      title: "At this moment, someone somewhere in the world is breathing with you.",
      description: "Not a noisy social feed, but a coexistence field where stillness gathers.",
      sharedMinutes: "3,842 quiet minutes have been shared today.",
      breathingNow: "Breathing together now",
      countries: "Countries connected today",
      weekly: "Global rhythm this week"
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
      title: "Not just features, but a self you can keep returning with",
      description:
        "Meisoulife membership is not about buying content. It is participation in a daily life of returning, continued with AI and quiet companions.",
      freeLabel: "Free",
      freeTitle: "Start with 7 days free",
      freeFeatures: ["1-minute meditation", "AI coach sample", "7-day rhythm trial"],
      freeCta: "Start 7 days free",
      plans: [
        {
          key: "basic",
          name: "Basic",
          price: "¥1,000 / month",
          identity: "For protecting your daily return",
          description: "daily AI rhythm coach / 1-minute return / quiet continuity",
          lifeChange: "You begin returning to your center before the day fully unravels.",
          features: ["daily AI rhythm coach", "personal rhythm tracker", "audio guidance", "weekly reflection"],
          cta: "Continue the rhythm",
          featured: true
        },
        {
          key: "leader",
          name: "Growth",
          price: "¥3,000 / month",
          identity: "For people who cannot keep going alone",
          description: "support / weekly loop / community rhythm",
          lifeChange: "Instead of blaming yourself for inconsistency, you gain a structure that helps you return.",
          features: ["daily AI rhythm coach", "weekly rhythm loop", "focused environment", "community rhythm field"],
          cta: "Continue the rhythm"
        },
        {
          key: "premium",
          name: "Inner Circle",
          price: "¥10,000 / month",
          identity: "A special place for 10,000 coexistence leaders",
          description: "leadership / retreat / coexistence culture / global projects",
          lifeChange: "Your personal practice grows into a role that quietly illuminates others and the world.",
          features: [
            "advanced rhythm coaching",
            "leadership sessions",
            "retreat priority",
            "global coexistence projects"
          ],
          cta: "Continue the rhythm"
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
