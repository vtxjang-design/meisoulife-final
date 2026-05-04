export const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/challenge", label: "7日チャレンジ" },
  { href: "/coach", label: "AIコーチ" },
  { href: "/pricing", label: "料金" },
  { href: "/community", label: "コミュニティ" },
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/leaders", label: "リーダー成長" },
  { href: "/retreats", label: "リトリート" }
] as const;

export const testimonials = [
  {
    name: "美香さん・49歳",
    quote: "朝3分だけなのに、仕事前の呼吸が整って気持ちの荒れが減りました。"
  },
  {
    name: "健一さん・57歳",
    quote: "眠る前の音声があるだけで、頭の中の騒がしさがやわらぎます。"
  },
  {
    name: "由紀さん・52歳",
    quote: "LINEで仲間がいるので、ひとりで頑張る感じがなく続けやすいです。"
  }
] as const;

export const faqItems = [
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
] as const;

export const challengeDays = [
  { day: 1, title: "呼吸を整える", focus: "身体が軽くなる" },
  { day: 2, title: "感情を整える", focus: "反応する前に止まれる" },
  { day: 3, title: "睡眠を回復する", focus: "夜の頭が静かになる" },
  { day: 4, title: "感謝を開く", focus: "人との関係がやわらぐ" },
  { day: 5, title: "関係を癒す", focus: "心の傷がほどける" },
  { day: 6, title: "集中を取り戻す", focus: "一日の中心ができる" },
  { day: 7, title: "人生の方向性", focus: "自分の道が見え始める" }
] as const;

export const planCards = [
  {
    key: "free",
    name: "Free",
    price: "¥0",
    description: "まずは7日間、やさしく整える。",
    features: ["7日チャレンジ", "LINE参加リンク", "AIコーチ 1日3回まで"],
    cta: "無料で始める"
  },
  {
    key: "basic",
    name: "Basic",
    price: "¥1,000/月",
    description: "毎日の心の回復を、無理なく続ける。",
    features: ["AIコーチ無制限", "会員コミュニティ", "ライブ瞑想", "毎朝の習慣設計"],
    cta: "Basicで始める"
  },
  {
    key: "leader",
    name: "Growth",
    price: "¥3,000/月",
    description: "実践を深め、日々の安定をしっかり育てる。",
    features: ["少人数サークル", "優先イベント案内", "週次の深い実践ガイド", "実践記録レビュー"],
    cta: "Growthに進む"
  },
  {
    key: "premium",
    name: "Inner Circle",
    price: "¥10,000/月",
    description: "もっと深く、静かに、自分を整える。",
    features: ["月次プレミアムセッション", "リトリート優先案内", "個別サポート導線", "Inner Circle専用アクセス"],
    cta: "Inner Circleを見る"
  }
] as const;

export const retreatLocations = [
  { place: "日本 伊勢", title: "浄化と始まり", description: "静かな節目をつくる、日本の再出発リトリート。" },
  { place: "アメリカ セドナ", title: "グローバル覚醒リトリート", description: "大地の広さの中で、視点を解き放つ体験。" },
  { place: "韓国 済州・国学園", title: "哲学とリーダー教育", description: "実践と思想をつなぐ、深い学びの拠点。" },
  { place: "ニュージーランド Earth Village", title: "自然治癒と共生生活", description: "自然と調和しながら、本来のリズムを思い出す。" },
  { place: "ヨーロッパ テネレフェ", title: "欧州リトリート拠点", description: "光と風の中で、静けさを取り戻す滞在型プログラム。" }
] as const;

export const communityChannels = [
  "Daily Check-in",
  "Wins Today",
  "Questions",
  "Events",
  "Leaders"
] as const;

export const serviceFlow = [
  {
    step: "01",
    title: "無料7日チャレンジ",
    description: "朝3分の音声ガイドで、まず心が落ち着く感覚を取り戻します。",
    href: "/challenge"
  },
  {
    step: "02",
    title: "AIコーチと毎日つながる",
    description: "疲れ、不安、眠れなさをその日のうちに言葉にして整えます。",
    href: "/coach"
  },
  {
    step: "03",
    title: "コミュニティで続ける",
    description: "LINEと会員導線で、ひとりで頑張らない習慣に変えていきます。",
    href: "/community"
  },
  {
    step: "04",
    title: "有料会員として深める",
    description: "Basic、Growth、Inner Circleの3段階で無理なく実践を深めます。",
    href: "/pricing"
  },
  {
    step: "05",
    title: "リーダーへ成長する",
    description: "継続、参加、貢献が積み上がると、共同体を支える役割へ進めます。",
    href: "/leaders"
  }
] as const;
