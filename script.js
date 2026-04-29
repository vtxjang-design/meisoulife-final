const languageButtons = document.querySelectorAll(".language-button");
const translatableItems = document.querySelectorAll("[data-ko][data-ja][data-en]");
const placeholderItems = document.querySelectorAll("[data-placeholder-ko][data-placeholder-ja][data-placeholder-en]");
const contactForm = document.querySelector("#contactForm");
const formMessage = document.querySelector("#formMessage");
const welcomeBox = document.querySelector("#welcomeBox");
const attendanceEmail = document.querySelector("#attendanceEmail");
const checkinButton = document.querySelector("#checkinButton");
const checkinMessage = document.querySelector("#checkinMessage");
const streakCount = document.querySelector("#streakCount");
const rankingList = document.querySelector("#rankingList");
const seedRankingButton = document.querySelector("#seedRankingButton");
const adminCode = document.querySelector("#adminCode");
const adminButton = document.querySelector("#adminButton");
const adminRecords = document.querySelector("#adminRecords");
const leaderEmail = document.querySelector("#leaderEmail");
const participationScore = document.querySelector("#participationScore");
const referralCount = document.querySelector("#referralCount");
const leaderButton = document.querySelector("#leaderButton");
const leaderMessage = document.querySelector("#leaderMessage");
const leaderGrade = document.querySelector("#leaderGrade");
const attendanceRate = document.querySelector("#attendanceRate");
const participationValue = document.querySelector("#participationValue");
const referralValue = document.querySelector("#referralValue");
const shortsCategory = document.querySelector("#shortsCategory");
const generateTitlesButton = document.querySelector("#generateTitlesButton");
const copyTitlesButton = document.querySelector("#copyTitlesButton");
const shortsMessage = document.querySelector("#shortsMessage");
const titlesOutput = document.querySelector("#titlesOutput");
const titleCount = document.querySelector("#titleCount");
const shortsTitleInput = document.querySelector("#shortsTitleInput");
const generateMetaButton = document.querySelector("#generateMetaButton");
const copyMetaButton = document.querySelector("#copyMetaButton");
const metaMessage = document.querySelector("#metaMessage");
const descriptionOutput = document.querySelector("#descriptionOutput");
const hashtagsOutput = document.querySelector("#hashtagsOutput");
const ctaOutput = document.querySelector("#ctaOutput");
const koreanTitleInput = document.querySelector("#koreanTitleInput");
const translateTitleButton = document.querySelector("#translateTitleButton");
const copyTranslationButton = document.querySelector("#copyTranslationButton");
const translationMessage = document.querySelector("#translationMessage");
const japaneseTitleOutput = document.querySelector("#japaneseTitleOutput");
const englishTitleOutput = document.querySelector("#englishTitleOutput");
const stripeButtons = document.querySelectorAll(".stripe-button");
const stripeStatus = document.querySelector("#stripeStatus");
const stripeChecklistItems = document.querySelector("#stripeChecklistItems");
const retentionTotalDays = document.querySelector("#retentionTotalDays");
const retentionStreak = document.querySelector("#retentionStreak");
const retentionGrade = document.querySelector("#retentionGrade");
const retentionCopy = document.querySelector("#retentionCopy");
const retentionButtons = document.querySelectorAll(".retention-button");
const retentionResult = document.querySelector("#retentionResult");
const dashboardMembers = document.querySelector("#dashboardMembers");
const dashboardNewMembers = document.querySelector("#dashboardNewMembers");
const dashboardChurn = document.querySelector("#dashboardChurn");
const dashboardRevenue = document.querySelector("#dashboardRevenue");
const popularContentList = document.querySelector("#popularContentList");
const dashboardNotes = document.querySelector("#dashboardNotes");
const seedDashboardButton = document.querySelector("#seedDashboardButton");
const refreshDashboardButton = document.querySelector("#refreshDashboardButton");
const emailQueueCount = document.querySelector("#emailQueueCount");
const emailNextSend = document.querySelector("#emailNextSend");
const emailSequenceList = document.querySelector("#emailSequenceList");
const emailPreviewOutput = document.querySelector("#emailPreviewOutput");
const copyEmailButton = document.querySelector("#copyEmailButton");
const markEmailSentButton = document.querySelector("#markEmailSentButton");
const seedEmailButton = document.querySelector("#seedEmailButton");
const emailMessage = document.querySelector("#emailMessage");
const dailySendTime = document.querySelector("#dailySendTime");
const dailyStatus = document.querySelector("#dailyStatus");
const dailyMessagePreview = document.querySelector("#dailyMessagePreview");
const enableDailyButton = document.querySelector("#enableDailyButton");
const sendDailyTestButton = document.querySelector("#sendDailyTestButton");
const copyDailyButton = document.querySelector("#copyDailyButton");
const dailyMessageResult = document.querySelector("#dailyMessageResult");
const hongikSignupForm = document.querySelector("#hongikSignupForm");
const goodDeedForm = document.querySelector("#goodDeedForm");
const donationForm = document.querySelector("#donationForm");
const hongikMeditationEmail = document.querySelector("#hongikMeditationEmail");
const hongikMeditationButton = document.querySelector("#hongikMeditationButton");
const hongikMembersCount = document.querySelector("#hongikMembersCount");
const hongikGoodDeedsCount = document.querySelector("#hongikGoodDeedsCount");
const hongikMeditationCount = document.querySelector("#hongikMeditationCount");
const hongikDonationTotal = document.querySelector("#hongikDonationTotal");
const hongikLeadershipLevel = document.querySelector("#hongikLeadershipLevel");
const hongikGrowthScore = document.querySelector("#hongikGrowthScore");
const hongikNextAction = document.querySelector("#hongikNextAction");
const hongikMessage = document.querySelector("#hongikMessage");

let currentLanguage = "ko";
let adminVisible = false;
let selectedEmailId = "";
let dailyMessageTimer = null;
let stripeConfigStatus = null;
const supportedLanguages = ["ko", "ja", "en"];
const gradeRules = [
  { key: "master", attendance: 90, participation: 85, referrals: 10 },
  { key: "leader", attendance: 70, participation: 60, referrals: 3 },
  { key: "practice", attendance: 50, participation: 30, referrals: 0 },
  { key: "general", attendance: 0, participation: 0, referrals: 0 }
];
const stripePaymentLinks = {
  basic: "",
  care: "",
  master: ""
};
const dailyMeditationMessages = [
  {
    title: {
      ko: "오늘은 숨을 천천히 만나는 아침입니다.",
      ja: "今日は、呼吸とゆっくり出会う朝です。",
      en: "This morning, gently meet your breath."
    },
    body: {
      ko: "눈을 감고 코끝의 숨을 10번만 느껴보세요. 마음이 바빠도 괜찮습니다. 다시 숨으로 돌아오면 됩니다.",
      ja: "目を閉じて、鼻先の呼吸を10回だけ感じてみましょう。心が忙しくても大丈夫です。また呼吸に戻れば十分です。",
      en: "Close your eyes and feel ten breaths at the tip of your nose. If your mind is busy, that is okay. Simply return to breathing."
    }
  },
  {
    title: {
      ko: "몸의 긴장을 1%만 내려놓아도 충분합니다.",
      ja: "体の緊張を1%だけ手放せば十分です。",
      en: "Releasing even one percent of tension is enough."
    },
    body: {
      ko: "어깨와 턱에 힘이 들어가 있는지 살펴보세요. 숨을 내쉬며 아주 조금만 부드럽게 풀어줍니다.",
      ja: "肩とあごに力が入っていないか感じてみましょう。息を吐きながら、ほんの少しだけゆるめます。",
      en: "Notice your shoulders and jaw. As you exhale, let them soften just a little."
    }
  },
  {
    title: {
      ko: "오늘 하루는 천천히 시작해도 괜찮습니다.",
      ja: "今日一日は、ゆっくり始めても大丈夫です。",
      en: "It is okay to begin today slowly."
    },
    body: {
      ko: "해야 할 일을 떠올리기 전에, 지금 앉아 있는 몸의 무게를 느껴보세요. 이미 이 순간에 도착했습니다.",
      ja: "やるべきことを考える前に、今座っている体の重さを感じてみましょう。あなたはもうこの瞬間にいます。",
      en: "Before thinking of what must be done, feel the weight of your body sitting here. You have already arrived in this moment."
    }
  },
  {
    title: {
      ko: "마음을 고치려 하지 말고, 알아차려보세요.",
      ja: "心を直そうとせず、気づいてみましょう。",
      en: "Do not fix the mind. Notice it."
    },
    body: {
      ko: "지금 마음이 복잡하다면 '복잡하구나'라고 조용히 말해보세요. 알아차림만으로도 마음은 조금 정리됩니다.",
      ja: "今、心が複雑なら「複雑なんだね」と静かに言ってみましょう。気づくだけでも心は少し整います。",
      en: "If your mind feels crowded, quietly say, 'This is a busy mind.' Noticing alone can bring a little space."
    }
  },
  {
    title: {
      ko: "오늘의 5분 명상이 하루의 중심이 됩니다.",
      ja: "今日の5分瞑想が、一日の軸になります。",
      en: "Five minutes of meditation can steady your day."
    },
    body: {
      ko: "긴 명상이 아니어도 괜찮습니다. 5분 동안 숨, 몸, 마음을 차례로 느껴보세요.",
      ja: "長い瞑想でなくても大丈夫です。5分間、呼吸、体、心を順番に感じてみましょう。",
      en: "It does not need to be long. For five minutes, notice your breath, your body, and your mind."
    }
  },
  {
    title: {
      ko: "오늘은 나에게 친절한 말을 하나 건네보세요.",
      ja: "今日は自分にやさしい言葉を一つかけてみましょう。",
      en: "Offer yourself one kind sentence today."
    },
    body: {
      ko: "'오늘도 충분히 애쓰고 있어'라고 마음속으로 말해보세요. 친절한 말은 긴장을 낮추는 연습입니다.",
      ja: "「今日も十分がんばっている」と心の中で言ってみましょう。やさしい言葉は緊張をゆるめる練習です。",
      en: "Say inwardly, 'I am doing enough today.' Kind words are a practice of softening tension."
    }
  },
  {
    title: {
      ko: "새로운 아침, 다시 시작할 수 있습니다.",
      ja: "新しい朝、また始められます。",
      en: "A new morning means you can begin again."
    },
    body: {
      ko: "어제 명상을 놓쳤어도 괜찮습니다. 오늘의 한 번이 다시 루틴을 여는 문이 됩니다.",
      ja: "昨日瞑想できなくても大丈夫です。今日の一回が、また習慣を開く扉になります。",
      en: "It is okay if you missed meditation yesterday. One practice today reopens the routine."
    }
  }
];
const emailSequenceTemplates = [
  {
    day: 1,
    title: { ko: "환영", ja: "歓迎", en: "Welcome" },
    subject: {
      ko: "瞑想life에 오신 것을 환영합니다",
      ja: "瞑想lifeへようこそ",
      en: "Welcome to Meisou life"
    },
    body: {
      ko: "안녕하세요.\n\n瞑想life에 함께해주셔서 감사합니다.\n오늘은 아무것도 잘하려고 하지 않아도 괜찮습니다. 조용한 자리에 앉아 3번만 천천히 숨을 쉬어보세요.\n\n오늘의 작은 시작이 마음을 돌보는 첫걸음입니다.\n\n瞑想life 드림",
      ja: "こんにちは。\n\n瞑想lifeに参加してくださりありがとうございます。\n今日は上手にやろうとしなくても大丈夫です。静かな場所に座り、ゆっくり3回だけ呼吸してみましょう。\n\n今日の小さな一歩が、心を整える始まりです。\n\n瞑想lifeより",
      en: "Hello,\n\nThank you for joining Meisou life.\nToday, you do not need to do meditation perfectly. Sit somewhere quiet and take just three slow breaths.\n\nThis small beginning is your first step toward caring for your mind.\n\nMeisou life"
    }
  },
  {
    day: 2,
    title: { ko: "명상 시작", ja: "瞑想の開始", en: "Start Meditation" },
    subject: {
      ko: "오늘은 3분 호흡 명상부터 시작해보세요",
      ja: "今日は3分の呼吸瞑想から始めましょう",
      en: "Start today with a 3-minute breathing meditation"
    },
    body: {
      ko: "안녕하세요.\n\n오늘은 3분만 시간을 내보세요.\n눈을 감고 숨이 들어오고 나가는 느낌을 천천히 따라갑니다. 생각이 떠오르면 다시 호흡으로 돌아오면 됩니다.\n\n명상은 생각을 없애는 일이 아니라, 다시 돌아오는 연습입니다.\n\n오늘도 편안한 하루가 되길 바랍니다.",
      ja: "こんにちは。\n\n今日は3分だけ時間を取ってみましょう。\n目を閉じて、息が入って出ていく感覚をゆっくり感じます。考えが浮かんだら、また呼吸に戻れば大丈夫です。\n\n瞑想は考えを消すことではなく、戻ってくる練習です。",
      en: "Hello,\n\nToday, set aside just three minutes.\nClose your eyes and gently follow the feeling of your breath moving in and out. When thoughts appear, simply return to breathing.\n\nMeditation is not removing thoughts. It is practicing the return."
    }
  },
  {
    day: 3,
    title: { ko: "습관 만들기", ja: "習慣づくり", en: "Build a Habit" },
    subject: {
      ko: "명상 습관은 같은 시간에 앉는 것부터 시작됩니다",
      ja: "瞑想習慣は同じ時間に座ることから始まります",
      en: "A meditation habit begins by sitting at the same time"
    },
    body: {
      ko: "안녕하세요.\n\n3일차에는 시간을 정해보세요. 아침 식사 전, 점심 후, 잠들기 전처럼 이미 있는 일상에 명상을 붙이면 훨씬 오래 이어집니다.\n\n오늘의 목표는 길게 하는 것이 아니라, 같은 시간에 앉아보는 것입니다.",
      ja: "こんにちは。\n\n3日目は時間を決めてみましょう。朝食前、昼食後、眠る前など、すでにある日常に瞑想をつなげると続きやすくなります。\n\n今日の目標は長く行うことではなく、同じ時間に座ることです。",
      en: "Hello,\n\nOn day three, choose a regular time. Meditation lasts longer when it is attached to an existing routine, such as before breakfast, after lunch, or before sleep.\n\nToday's goal is not a long session. It is simply sitting at the same time."
    }
  },
  {
    day: 4,
    title: { ko: "스트레스 내려놓기", ja: "ストレスを手放す", en: "Release Stress" },
    subject: {
      ko: "몸의 긴장을 알아차리면 마음도 조금 풀립니다",
      ja: "体の緊張に気づくと心も少しゆるみます",
      en: "Notice body tension and let the mind soften"
    },
    body: {
      ko: "안녕하세요.\n\n오늘은 어깨, 턱, 배에 힘이 들어가 있는지 살펴보세요. 숨을 내쉴 때마다 그 부분이 1%만 부드러워진다고 상상합니다.\n\n작은 이완이 쌓이면 스트레스를 다루는 힘이 생깁니다.",
      ja: "こんにちは。\n\n今日は肩、あご、お腹に力が入っていないか感じてみましょう。息を吐くたびに、その部分が1%だけやわらぐと想像します。\n\n小さなリラックスが重なると、ストレスと向き合う力になります。",
      en: "Hello,\n\nToday, notice whether your shoulders, jaw, or belly are holding tension. Each time you exhale, imagine that area softening by just one percent.\n\nSmall moments of release build your ability to handle stress."
    }
  },
  {
    day: 5,
    title: { ko: "수면 전 이완", ja: "眠る前のリラックス", en: "Bedtime Relaxation" },
    subject: {
      ko: "잠들기 전 5분, 하루를 조용히 내려놓으세요",
      ja: "眠る前の5分、一日を静かに手放しましょう",
      en: "Take five quiet minutes before sleep"
    },
    body: {
      ko: "안녕하세요.\n\n오늘 밤에는 휴대폰을 내려놓고 5분만 눈을 감아보세요. 오늘 해결하지 않아도 되는 생각은 내일로 보내도 괜찮습니다.\n\n몸이 침대에 닿는 느낌과 숨소리만 천천히 느껴보세요.",
      ja: "こんにちは。\n\n今夜はスマートフォンを置いて、5分だけ目を閉じてみましょう。今日解決しなくてもよい考えは、明日に送っても大丈夫です。\n\n体がベッドに触れる感覚と呼吸だけをゆっくり感じてみてください。",
      en: "Hello,\n\nTonight, put your phone down and close your eyes for five minutes. Thoughts that do not need to be solved today can wait until tomorrow.\n\nFeel your body resting on the bed and listen gently to your breath."
    }
  },
  {
    day: 6,
    title: { ko: "감정정리", ja: "感情整理", en: "Emotional Reset" },
    subject: {
      ko: "오늘의 감정을 한 문장으로 정리해보세요",
      ja: "今日の感情を一文で整理してみましょう",
      en: "Name today's emotion in one sentence"
    },
    body: {
      ko: "안녕하세요.\n\n오늘은 명상 후 한 문장만 적어보세요. '나는 지금 조금 지쳐 있다', '나는 안심하고 싶다'처럼 있는 그대로 쓰면 됩니다.\n\n감정을 정확히 알아차리는 것만으로도 마음은 조금 가벼워집니다.",
      ja: "こんにちは。\n\n今日は瞑想の後に一文だけ書いてみましょう。「今少し疲れている」「安心したい」など、そのままで大丈夫です。\n\n感情に気づくだけでも、心は少し軽くなります。",
      en: "Hello,\n\nAfter today's meditation, write just one sentence: 'I feel a little tired,' or 'I want to feel safe.' Write it as it is.\n\nSimply naming an emotion can make the mind feel lighter."
    }
  },
  {
    day: 7,
    title: { ko: "7일 축하", ja: "7日間達成", en: "Day 7 Celebration" },
    subject: {
      ko: "7일을 함께했습니다. 이제 나만의 루틴으로 이어가세요",
      ja: "7日間続きました。これから自分の習慣へつなげましょう",
      en: "You completed seven days. Keep your calm routine going"
    },
    body: {
      ko: "안녕하세요.\n\n벌써 7일째입니다. 아주 짧았더라도, 마음을 돌보는 시간을 만든 것은 분명한 변화입니다.\n\n앞으로도 주 3회 오디오, 수면 전 이완, 온라인 그룹 명상으로 함께 이어갈 수 있습니다.\n\n오늘도 10분만 나를 위해 앉아보세요.",
      ja: "こんにちは。\n\n今日で7日目です。短い時間でも、心を整える時間を作ったことは大切な変化です。\n\nこれからも週3回の音声、眠る前のリラックス、オンライン瞑想会で一緒に続けられます。\n\n今日も10分だけ自分のために座ってみましょう。",
      en: "Hello,\n\nIt is already day seven. Even if each session was short, making time to care for your mind is a real change.\n\nYou can keep going with weekly audio, bedtime relaxation, and online group meditation.\n\nToday, sit for yourself for just ten minutes."
    }
  }
];

function detectLanguageByRegion() {
  const savedLanguage = localStorage.getItem("meisouLifeLanguage");

  if (supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }

  const browserLanguages = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language || ""];
  const normalizedLanguages = browserLanguages.map(function (language) {
    return language.toLowerCase();
  });
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

  if (normalizedLanguages.some(function (language) {
    return language.startsWith("ko") || language.endsWith("-kr");
  }) || timeZone === "Asia/Seoul") {
    return "ko";
  }

  if (normalizedLanguages.some(function (language) {
    return language.startsWith("ja") || language.endsWith("-jp");
  }) || timeZone === "Asia/Tokyo") {
    return "ja";
  }

  return "en";
}

function changeLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;

  translatableItems.forEach(function (item) {
    item.textContent = item.dataset[language];
  });

  placeholderItems.forEach(function (item) {
    item.placeholder = item.dataset["placeholder" + language.charAt(0).toUpperCase() + language.slice(1)];
  });

  languageButtons.forEach(function (button) {
    button.classList.toggle("active", button.dataset.lang === language);
  });

  formMessage.textContent = "";
  leaderMessage.textContent = "";
  welcomeBox.hidden = true;
  welcomeBox.textContent = "";
  renderAttendance();
  renderLeaderSystem();
  shortsMessage.textContent = "";
  metaMessage.textContent = "";
  translationMessage.textContent = "";
  retentionResult.textContent = "";
  emailMessage.textContent = "";
  dailyMessageResult.textContent = "";
  hongikMessage.textContent = "";
  renderDailyMessage();
  renderHongikMvp();
  renderRetention();
  renderDashboard();
  renderEmailAutomation();
  renderStripeChecklist();
}

languageButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    localStorage.setItem("meisouLifeLanguage", button.dataset.lang);
    changeLanguage(button.dataset.lang);
  });
});

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(contactForm);
  const email = formData.get("email");
  const password = formData.get("password");
  const level = formData.get("level");
  const levelNames = {
    ko: { free: "무료회원", paid: "유료회원" },
    ja: { free: "無料会員", paid: "有料会員" },
    en: { free: "Free Member", paid: "Paid Member" }
  };
  const member = {
    email: email,
    level: level,
    passwordLength: password.length,
    joinedAt: new Date().toISOString()
  };

  localStorage.setItem("meisouLifeMember", JSON.stringify(member));
  saveMemberToList(member);
  createEmailSequence(member);
  attendanceEmail.value = email;
  leaderEmail.value = email;

  if (currentLanguage === "ja") {
    formMessage.textContent = "会員登録が完了しました。";
    welcomeBox.innerHTML = "<strong>ようこそ、瞑想lifeへ。</strong>" + levelNames.ja[level] + "として登録されました。今日の最初の10分瞑想から始めましょう。";
  } else if (currentLanguage === "en") {
    formMessage.textContent = "Your account has been created.";
    welcomeBox.innerHTML = "<strong>Welcome to Meisou life.</strong>You are registered as a " + levelNames.en[level] + ". Start with your first 10-minute meditation today.";
  } else {
    formMessage.textContent = "회원가입이 완료되었습니다.";
    welcomeBox.innerHTML = "<strong>瞑想life에 오신 것을 환영합니다.</strong>" + levelNames.ko[level] + "으로 가입되었습니다. 오늘의 첫 10분 명상부터 시작해보세요.";
  }

  welcomeBox.hidden = false;
  contactForm.reset();
  renderLeaderSystem();
  renderDashboard();
  renderEmailAutomation();
});

function getTodayText() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

function addDays(dateText, amount) {
  const parts = dateText.split("-").map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + amount);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

function getMonthText() {
  return getTodayText().slice(0, 7);
}

function getDailyMessageSettings() {
  const savedSettings = localStorage.getItem("meisouLifeDailyMessageSettings");

  if (!savedSettings) {
    return {
      enabled: false,
      sendHour: 6,
      sendMinute: 0,
      lastSentDate: ""
    };
  }

  return JSON.parse(savedSettings);
}

function saveDailyMessageSettings(settings) {
  localStorage.setItem("meisouLifeDailyMessageSettings", JSON.stringify(settings));
}

function getDailyMessageForDate(dateText) {
  const parts = dateText.split("-").map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);

  return dailyMeditationMessages[dayOfYear % dailyMeditationMessages.length];
}

function getNextDailySendLabel(settings) {
  const now = new Date();
  const todaySend = new Date(now.getFullYear(), now.getMonth(), now.getDate(), settings.sendHour, settings.sendMinute, 0);
  const nextSend = now < todaySend ? todaySend : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, settings.sendHour, settings.sendMinute, 0);
  const year = nextSend.getFullYear();
  const month = String(nextSend.getMonth() + 1).padStart(2, "0");
  const day = String(nextSend.getDate()).padStart(2, "0");
  const hour = String(settings.sendHour).padStart(2, "0");
  const minute = String(settings.sendMinute).padStart(2, "0");

  return year + "-" + month + "-" + day + " " + hour + ":" + minute;
}

function getDailyPreviewText(message) {
  const labels = {
    ko: { title: "오늘의 명상 메시지", body: "메시지" },
    ja: { title: "今日の瞑想メッセージ", body: "メッセージ" },
    en: { title: "Today's Meditation Message", body: "Message" }
  };
  const label = labels[currentLanguage];

  return [
    label.title + ": " + message.title[currentLanguage],
    "",
    label.body,
    message.body[currentLanguage]
  ].join("\n");
}

function renderDailyMessage() {
  const settings = getDailyMessageSettings();
  const message = getDailyMessageForDate(getTodayText());
  const statusText = settings.enabled
    ? currentLanguage === "ja" ? "通知オン · 次回 " + getNextDailySendLabel(settings) : currentLanguage === "en" ? "Enabled · Next " + getNextDailySendLabel(settings) : "알림 켜짐 · 다음 " + getNextDailySendLabel(settings)
    : currentLanguage === "ja" ? "通知はまだオフです。" : currentLanguage === "en" ? "Notifications are off." : "알림이 아직 꺼져 있습니다.";

  dailySendTime.textContent = "06:00";
  dailyStatus.textContent = statusText;
  dailyMessagePreview.innerHTML = "";

  const title = document.createElement("strong");
  const body = document.createElement("p");
  const note = document.createElement("small");

  title.textContent = message.title[currentLanguage];
  body.textContent = message.body[currentLanguage];
  note.textContent = currentLanguage === "ja" ? "毎朝6時に表示されるメッセージです。" : currentLanguage === "en" ? "This is the message prepared for 6 AM today." : "오늘 오전 6시에 보낼 명상 메시지입니다.";
  dailyMessagePreview.append(title, body, note);
}

function sendDailyMeditationMessage(isTest) {
  const settings = getDailyMessageSettings();
  const message = getDailyMessageForDate(getTodayText());
  const title = "瞑想life";
  const body = message.title[currentLanguage] + "\n" + message.body[currentLanguage];

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: body
    });
  }

  if (!isTest) {
    settings.lastSentDate = getTodayText();
    saveDailyMessageSettings(settings);
  }

  dailyMessageResult.textContent = isTest
    ? currentLanguage === "ja" ? "テストメッセージを送信しました。" : currentLanguage === "en" ? "Test message sent." : "테스트 메시지를 발송했습니다."
    : currentLanguage === "ja" ? "今日の瞑想メッセージを送信しました。" : currentLanguage === "en" ? "Today's meditation message was sent." : "오늘의 명상 메시지를 발송했습니다.";
  renderDailyMessage();
}

function checkDailyMessageSchedule() {
  const settings = getDailyMessageSettings();
  const now = new Date();
  const isAfterSendTime = now.getHours() > settings.sendHour || now.getHours() === settings.sendHour && now.getMinutes() >= settings.sendMinute;
  const shouldSend = settings.enabled && isAfterSendTime;

  if (shouldSend && settings.lastSentDate !== getTodayText()) {
    sendDailyMeditationMessage(false);
  }
}

function startDailyMessageTimer() {
  if (dailyMessageTimer) {
    window.clearInterval(dailyMessageTimer);
  }

  checkDailyMessageSchedule();
  dailyMessageTimer = window.setInterval(checkDailyMessageSchedule, 60000);
}

function getAttendanceRecords() {
  const savedRecords = localStorage.getItem("meisouLifeAttendance");

  if (!savedRecords) {
    return {};
  }

  return JSON.parse(savedRecords);
}

function getMemberList() {
  const savedMembers = localStorage.getItem("meisouLifeMembers");

  if (!savedMembers) {
    const member = getSavedMember();
    return member ? [member] : [];
  }

  return JSON.parse(savedMembers);
}

function saveMemberList(members) {
  localStorage.setItem("meisouLifeMembers", JSON.stringify(members));
}

function saveMemberToList(member) {
  const members = getMemberList();
  const existingIndex = members.findIndex(function (savedMember) {
    return savedMember.email.toLowerCase() === member.email.toLowerCase();
  });

  if (existingIndex >= 0) {
    members[existingIndex] = Object.assign({}, members[existingIndex], member);
  } else {
    members.push(member);
  }

  saveMemberList(members);
}

function getLeaderProfiles() {
  const savedProfiles = localStorage.getItem("meisouLifeLeaderProfiles");

  if (!savedProfiles) {
    return {};
  }

  return JSON.parse(savedProfiles);
}

function saveLeaderProfiles(profiles) {
  localStorage.setItem("meisouLifeLeaderProfiles", JSON.stringify(profiles));
}

function saveAttendanceRecords(records) {
  localStorage.setItem("meisouLifeAttendance", JSON.stringify(records));
}

function getSavedMember() {
  const savedMember = localStorage.getItem("meisouLifeMember");

  if (!savedMember) {
    return null;
  }

  return JSON.parse(savedMember);
}

function getHongikData() {
  const savedData = localStorage.getItem("hongikCoexistenceMvp");

  if (!savedData) {
    return {
      members: [],
      goodDeeds: [],
      meditations: [],
      donations: []
    };
  }

  return JSON.parse(savedData);
}

function saveHongikData(data) {
  localStorage.setItem("hongikCoexistenceMvp", JSON.stringify(data));
}

function getHongikActiveEmail(data) {
  if (hongikMeditationEmail.value.trim()) {
    return hongikMeditationEmail.value.trim().toLowerCase();
  }

  const lastMember = data.members[data.members.length - 1];

  if (lastMember) {
    return lastMember.email;
  }

  const member = getSavedMember();

  if (member && member.email) {
    return member.email.toLowerCase();
  }

  return "";
}

function getHongikLeadership(score) {
  const levels = {
    ko: [
      { min: 80, name: "공생 리더" },
      { min: 45, name: "실천 동행자" },
      { min: 15, name: "선행 실천가" },
      { min: 0, name: "공감 씨앗" }
    ],
    ja: [
      { min: 80, name: "共生リーダー" },
      { min: 45, name: "実践パートナー" },
      { min: 15, name: "善行実践者" },
      { min: 0, name: "共感の種" }
    ],
    en: [
      { min: 80, name: "Coexistence Leader" },
      { min: 45, name: "Practice Partner" },
      { min: 15, name: "Good-Deed Practitioner" },
      { min: 0, name: "Empathy Seed" }
    ]
  };

  return levels[currentLanguage].find(function (level) {
    return score >= level.min;
  }).name;
}

function getHongikNextAction(data, email) {
  const goodDeedCount = data.goodDeeds.filter(function (deed) {
    return deed.email === email;
  }).length;
  const meditationCount = data.meditations.filter(function (meditation) {
    return meditation.email === email;
  }).length;
  const donationCount = data.donations.length;

  if (!email) {
    return currentLanguage === "ja" ? "まず共生会員として登録しましょう。" : currentLanguage === "en" ? "Register as a coexistence member first." : "먼저 공생 회원으로 등록하세요.";
  }

  if (goodDeedCount === 0) {
    return currentLanguage === "ja" ? "最初の善行を認証しましょう。" : currentLanguage === "en" ? "Verify your first good deed." : "첫 선행을 인증하세요.";
  }

  if (meditationCount === 0) {
    return currentLanguage === "ja" ? "今日の共同瞑想に参加しましょう。" : currentLanguage === "en" ? "Join today's community meditation." : "오늘 공동 명상에 참여하세요.";
  }

  if (donationCount === 0) {
    return currentLanguage === "ja" ? "小さな支援で共生基金を始めましょう。" : currentLanguage === "en" ? "Start the coexistence fund with a small donation." : "작은 후원으로 공생 기금을 시작하세요.";
  }

  return currentLanguage === "ja" ? "次は地域リーダー候補として育成できます。" : currentLanguage === "en" ? "Next, grow into a regional leader candidate." : "다음 단계는 지역 리더 후보 성장입니다.";
}

function renderHongikMvp() {
  const data = getHongikData();
  const activeEmail = getHongikActiveEmail(data);
  const goodDeedCount = data.goodDeeds.filter(function (deed) {
    return deed.email === activeEmail;
  }).length;
  const meditationCount = data.meditations.filter(function (meditation) {
    return meditation.email === activeEmail;
  }).length;
  const donationTotal = data.donations.reduce(function (sum, donation) {
    return sum + donation.amount;
  }, 0);
  const growthScore = goodDeedCount * 15 + meditationCount * 10 + data.donations.length * 5;

  hongikMembersCount.textContent = data.members.length;
  hongikGoodDeedsCount.textContent = data.goodDeeds.length;
  hongikMeditationCount.textContent = data.meditations.length;
  hongikDonationTotal.textContent = formatYen(donationTotal);
  hongikGrowthScore.textContent = growthScore;
  hongikLeadershipLevel.textContent = getHongikLeadership(growthScore);
  hongikNextAction.textContent = getHongikNextAction(data, activeEmail);
}

function getEmailSequences() {
  const savedSequences = localStorage.getItem("meisouLifeEmailSequences");

  if (!savedSequences) {
    return {};
  }

  return JSON.parse(savedSequences);
}

function saveEmailSequences(sequences) {
  localStorage.setItem("meisouLifeEmailSequences", JSON.stringify(sequences));
}

function createEmailSequence(member) {
  const sequences = getEmailSequences();
  const email = member.email.toLowerCase();
  const startDate = member.joinedAt ? member.joinedAt.slice(0, 10) : getTodayText();

  sequences[email] = emailSequenceTemplates.map(function (template) {
    return {
      id: email + "-day-" + template.day,
      email: email,
      day: template.day,
      sendDate: addDays(startDate, template.day - 1),
      status: "pending",
      sentAt: ""
    };
  });

  selectedEmailId = sequences[email][0].id;
  saveEmailSequences(sequences);
}

function getActiveEmailSequence() {
  const sequences = getEmailSequences();
  const member = getSavedMember();

  if (member && member.email && sequences[member.email.toLowerCase()]) {
    return {
      email: member.email.toLowerCase(),
      items: sequences[member.email.toLowerCase()]
    };
  }

  const firstEmail = Object.keys(sequences)[0];

  if (!firstEmail) {
    return {
      email: "",
      items: []
    };
  }

  return {
    email: firstEmail,
    items: sequences[firstEmail]
  };
}

function getEmailTemplate(day) {
  return emailSequenceTemplates.find(function (template) {
    return template.day === day;
  });
}

function getEmailStatusText(status) {
  if (status === "sent") {
    return currentLanguage === "ja" ? "送信完了" : currentLanguage === "en" ? "Sent" : "발송 완료";
  }

  return currentLanguage === "ja" ? "送信待ち" : currentLanguage === "en" ? "Pending" : "발송 대기";
}

function getEmailPreview(item) {
  const template = getEmailTemplate(item.day);
  const labels = {
    ko: { subject: "제목", date: "발송일", to: "받는 사람", body: "본문" },
    ja: { subject: "件名", date: "送信日", to: "宛先", body: "本文" },
    en: { subject: "Subject", date: "Send Date", to: "To", body: "Body" }
  };
  const label = labels[currentLanguage];

  return [
    label.to + ": " + item.email,
    label.date + ": " + item.sendDate,
    label.subject + ": " + template.subject[currentLanguage],
    "",
    label.body,
    template.body[currentLanguage]
  ].join("\n");
}

function setEmailPreview(item) {
  selectedEmailId = item.id;
  emailPreviewOutput.value = getEmailPreview(item);
  renderEmailAutomation();
}

function renderEmailAutomation() {
  const sequence = getActiveEmailSequence();
  const pendingItems = sequence.items.filter(function (item) {
    return item.status !== "sent";
  });
  const nextItem = pendingItems.slice().sort(function (first, second) {
    return first.sendDate.localeCompare(second.sendDate);
  })[0];

  emailQueueCount.textContent = pendingItems.length;

  if (!sequence.items.length) {
    emailNextSend.textContent = currentLanguage === "ja" ? "予約されたメールはまだありません。" : currentLanguage === "en" ? "No scheduled emails yet." : "아직 예약된 이메일이 없습니다.";
    emailSequenceList.innerHTML = "";
    emailPreviewOutput.value = "";
    return;
  }

  if (nextItem) {
    emailNextSend.textContent = currentLanguage === "ja" ? "次回送信: " + nextItem.sendDate + " / " + sequence.email : currentLanguage === "en" ? "Next send: " + nextItem.sendDate + " / " + sequence.email : "다음 발송: " + nextItem.sendDate + " / " + sequence.email;
  } else {
    emailNextSend.textContent = currentLanguage === "ja" ? "7日間のメール送信が完了しました。" : currentLanguage === "en" ? "All seven emails are marked sent." : "7일 이메일이 모두 발송 완료 처리되었습니다.";
  }
  emailSequenceList.innerHTML = "";

  sequence.items.forEach(function (item) {
    const template = getEmailTemplate(item.day);
    const button = document.createElement("button");
    const day = document.createElement("span");
    const content = document.createElement("span");
    const title = document.createElement("strong");
    const date = document.createElement("small");
    const status = document.createElement("span");

    button.className = "email-item " + item.status;
    if (selectedEmailId === item.id) {
      button.classList.add("active");
    }
    button.type = "button";
    day.className = "email-day";
    day.textContent = item.day;
    title.textContent = template.title[currentLanguage] + " · " + template.subject[currentLanguage];
    date.textContent = item.sendDate + " / " + item.email;
    content.append(title, date);
    status.className = "email-status";
    status.textContent = getEmailStatusText(item.status);

    button.append(day, content, status);
    button.addEventListener("click", function () {
      setEmailPreview(item);
    });
    emailSequenceList.appendChild(button);
  });

  if (!selectedEmailId || !sequence.items.some(function (item) {
    return item.id === selectedEmailId;
  })) {
    selectedEmailId = sequence.items[0].id;
  }

  const selectedItem = sequence.items.find(function (item) {
    return item.id === selectedEmailId;
  });

  if (selectedItem) {
    emailPreviewOutput.value = getEmailPreview(selectedItem);
  }
}

function markSelectedEmailSent() {
  if (!selectedEmailId) {
    emailMessage.textContent = currentLanguage === "ja" ? "先にメールを選択してください。" : currentLanguage === "en" ? "Please select an email first." : "먼저 이메일을 선택해주세요.";
    return;
  }

  const sequences = getEmailSequences();
  let updated = false;

  Object.keys(sequences).forEach(function (email) {
    sequences[email] = sequences[email].map(function (item) {
      if (item.id !== selectedEmailId) {
        return item;
      }

      updated = true;
      return Object.assign({}, item, {
        status: "sent",
        sentAt: new Date().toISOString()
      });
    });
  });

  if (!updated) {
    emailMessage.textContent = currentLanguage === "ja" ? "選択されたメールを見つけられません。" : currentLanguage === "en" ? "Could not find the selected email." : "선택한 이메일을 찾을 수 없습니다.";
    return;
  }

  saveEmailSequences(sequences);
  emailMessage.textContent = currentLanguage === "ja" ? "送信完了として保存しました。" : currentLanguage === "en" ? "Saved as sent." : "발송 완료로 저장했습니다.";
  renderEmailAutomation();
}

function getMemberEmail() {
  const email = attendanceEmail.value.trim().toLowerCase();

  if (email) {
    return email;
  }

  const member = getSavedMember();

  if (member && member.email) {
    attendanceEmail.value = member.email;
    return member.email.toLowerCase();
  }

  return "";
}

function getLeaderEmail() {
  const email = leaderEmail.value.trim().toLowerCase();

  if (email) {
    return email;
  }

  const member = getSavedMember();

  if (member && member.email) {
    leaderEmail.value = member.email;
    return member.email.toLowerCase();
  }

  return "";
}

function getLevelName(level) {
  const names = {
    ko: { free: "무료회원", paid: "유료회원", guest: "방문회원" },
    ja: { free: "無料会員", paid: "有料会員", guest: "ゲスト会員" },
    en: { free: "Free Member", paid: "Paid Member", guest: "Guest" }
  };

  return names[currentLanguage][level] || names[currentLanguage].guest;
}

function calculateStreak(dates) {
  if (!dates || dates.length === 0) {
    return 0;
  }

  const dateSet = new Set(dates);
  let cursor = dateSet.has(getTodayText()) ? getTodayText() : addDays(getTodayText(), -1);
  let count = 0;

  while (dateSet.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }

  return count;
}

function getMonthlyCount(dates) {
  const currentMonth = getMonthText();

  return dates.filter(function (dateText) {
    return dateText.startsWith(currentMonth);
  }).length;
}

function getDaysInCurrentMonth() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function getAttendanceRate(dates) {
  return Math.round((getMonthlyCount(dates || []) / getDaysInCurrentMonth()) * 100);
}

function getGradeName(key) {
  const names = {
    ko: {
      general: "일반회원",
      practice: "실천회원",
      leader: "리더",
      master: "마스터리더"
    },
    ja: {
      general: "一般会員",
      practice: "実践会員",
      leader: "リーダー",
      master: "マスターリーダー"
    },
    en: {
      general: "General Member",
      practice: "Practice Member",
      leader: "Leader",
      master: "Master Leader"
    }
  };

  return names[currentLanguage][key];
}

function calculateLeaderGrade(attendance, participation, referrals) {
  return gradeRules.find(function (rule) {
    return attendance >= rule.attendance && participation >= rule.participation && referrals >= rule.referrals;
  }).key;
}

function getAttendanceMessage(type) {
  const messages = {
    complete: {
      ko: "오늘 명상 출석이 완료되었습니다.",
      ja: "今日の瞑想出席が完了しました。",
      en: "Today's meditation check-in is complete."
    },
    duplicate: {
      ko: "오늘은 이미 출석체크를 완료했습니다.",
      ja: "今日はすでに出席チェック済みです。",
      en: "You have already checked in today."
    },
    email: {
      ko: "출석할 이메일을 입력해주세요.",
      ja: "出席するメールアドレスを入力してください。",
      en: "Please enter an email for check-in."
    },
    adminError: {
      ko: "관리자 코드가 올바르지 않습니다.",
      ja: "管理者コードが正しくありません。",
      en: "The admin code is not correct."
    }
  };

  return messages[type][currentLanguage];
}

function renderRanking(records) {
  const ranking = Object.values(records)
    .map(function (record) {
      return {
        email: record.email,
        level: record.level || "guest",
        count: getMonthlyCount(record.dates || []),
        streak: calculateStreak(record.dates || [])
      };
    })
    .filter(function (record) {
      return record.count > 0;
    })
    .sort(function (first, second) {
      return second.count - first.count || second.streak - first.streak;
    })
    .slice(0, 10);

  rankingList.innerHTML = "";

  if (ranking.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = currentLanguage === "ja" ? "今月の出席記録はまだありません。" : currentLanguage === "en" ? "No check-ins yet this month." : "이번 달 출석 기록이 아직 없습니다.";
    rankingList.appendChild(emptyItem);
    return;
  }

  ranking.forEach(function (record, index) {
    const item = document.createElement("li");
    const rank = document.createElement("span");
    const member = document.createElement("strong");
    const days = document.createElement("span");

    rank.className = "ranking-rank";
    rank.textContent = index + 1;
    member.textContent = record.email + " · " + getLevelName(record.level);
    days.className = "ranking-days";
    days.textContent = record.count + (currentLanguage === "en" ? " days" : "일");

    item.append(rank, member, days);
    rankingList.appendChild(item);
  });
}

function renderAdminRecords(records) {
  adminRecords.innerHTML = "";

  const rows = Object.values(records).sort(function (first, second) {
    return (second.dates || []).length - (first.dates || []).length;
  });

  if (rows.length === 0) {
    adminRecords.textContent = currentLanguage === "ja" ? "確認できる出席記録がありません。" : currentLanguage === "en" ? "No attendance records to review." : "확인할 출석 기록이 없습니다.";
    return;
  }

  rows.forEach(function (record) {
    const row = document.createElement("div");
    const rank = document.createElement("span");
    const member = document.createElement("strong");
    const summary = document.createElement("span");

    row.className = "admin-record-row";
    rank.className = "ranking-rank";
    rank.textContent = getMonthlyCount(record.dates || []);
    member.textContent = record.email + " · " + getLevelName(record.level || "guest") + " · " + getGradeName(record.leaderGrade || "general");
    summary.textContent = (record.dates || []).join(", ");

    row.append(rank, member, summary);
    adminRecords.appendChild(row);
  });
}

function renderAttendance() {
  const records = getAttendanceRecords();
  const email = getMemberEmail();
  const record = records[email];

  streakCount.textContent = record ? calculateStreak(record.dates || []) : 0;
  renderRanking(records);

  if (adminVisible) {
    renderAdminRecords(records);
  }
}

function getRetentionEmail() {
  const member = getSavedMember();

  if (member && member.email) {
    return member.email.toLowerCase();
  }

  return getMemberEmail();
}

function getRetentionCopy(totalDays, streak, gradeName) {
  if (currentLanguage === "ja") {
    return "これまで " + totalDays + "日 出席し、連続 " + streak + "日 の習慣を積み重ねています。現在の等級は「" + gradeName + "」です。解約の前に、休会や割引継続も選べます。";
  }

  if (currentLanguage === "en") {
    return "You have checked in for " + totalDays + " days and built a " + streak + "-day streak. Your current level is " + gradeName + ". Before canceling, you can pause or keep a discount.";
  }

  return "지금까지 " + totalDays + "일 출석했고, 연속 " + streak + "일의 루틴을 만들었습니다. 현재 등급은 '" + gradeName + "'입니다. 해지 전에 휴식 또는 할인 유지 옵션을 선택할 수 있습니다.";
}

function renderRetention() {
  const email = getRetentionEmail();
  const records = getAttendanceRecords();
  const profiles = getLeaderProfiles();
  const record = records[email];
  const dates = record ? record.dates || [] : [];
  const profile = profiles[email] || {};
  const gradeKey = profile.leaderGrade || record && record.leaderGrade || "general";
  const gradeName = getGradeName(gradeKey);
  const totalDays = dates.length;
  const streak = calculateStreak(dates);

  retentionTotalDays.textContent = totalDays;
  retentionStreak.textContent = streak;
  retentionGrade.textContent = gradeName;
  retentionCopy.textContent = getRetentionCopy(totalDays, streak, gradeName);
}

function getLeaderMessage(type) {
  const messages = {
    email: {
      ko: "등급을 확인할 이메일을 입력해주세요.",
      ja: "等級を確認するメールアドレスを入力してください。",
      en: "Please enter an email to check the level."
    },
    saved: {
      ko: "리더 등급이 저장되었습니다.",
      ja: "リーダー等級を保存しました。",
      en: "Leader level has been saved."
    }
  };

  return messages[type][currentLanguage];
}

function renderLeaderSystem() {
  const email = getLeaderEmail();
  const records = getAttendanceRecords();
  const profiles = getLeaderProfiles();
  const attendanceRecord = records[email];
  const profile = profiles[email] || {};
  const participation = Number(profile.participation || participationScore.value || 0);
  const referrals = Number(profile.referrals || referralCount.value || 0);
  const rate = attendanceRecord ? getAttendanceRate(attendanceRecord.dates || []) : 0;
  const grade = calculateLeaderGrade(rate, participation, referrals);

  if (profile.participation !== undefined) {
    participationScore.value = profile.participation;
  }

  if (profile.referrals !== undefined) {
    referralCount.value = profile.referrals;
  }

  attendanceRate.textContent = rate + "%";
  participationValue.textContent = participation;
  referralValue.textContent = referrals;
  leaderGrade.textContent = getGradeName(grade);
}

checkinButton.addEventListener("click", function () {
  const email = getMemberEmail();

  if (!email) {
    checkinMessage.textContent = getAttendanceMessage("email");
    return;
  }

  const records = getAttendanceRecords();
  const member = getSavedMember();
  const today = getTodayText();
  const savedRecord = records[email] || {
    email: email,
    level: member && member.email && member.email.toLowerCase() === email ? member.level : "guest",
    dates: []
  };

  if (savedRecord.dates.includes(today)) {
    checkinMessage.textContent = getAttendanceMessage("duplicate");
  } else {
    savedRecord.dates.push(today);
    savedRecord.dates.sort();
    records[email] = savedRecord;
    saveAttendanceRecords(records);
    checkinMessage.textContent = getAttendanceMessage("complete");
  }

  renderAttendance();
  renderLeaderSystem();
  renderRetention();
});

seedRankingButton.addEventListener("click", function () {
  const records = getAttendanceRecords();
  const today = getTodayText();
  const samples = [
    { email: "hana@example.com", level: "paid", days: 12 },
    { email: "mori@example.com", level: "free", days: 8 },
    { email: "sun@example.com", level: "paid", days: 5 }
  ];

  samples.forEach(function (sample) {
    records[sample.email] = {
      email: sample.email,
      level: sample.level,
      dates: Array.from({ length: sample.days }, function (_, index) {
        return addDays(today, index * -1);
      })
    };
  });

  saveAttendanceRecords(records);
  renderAttendance();
  renderLeaderSystem();
});

adminButton.addEventListener("click", function () {
  if (adminCode.value !== "admin1000") {
    adminRecords.hidden = false;
    adminRecords.textContent = getAttendanceMessage("adminError");
    return;
  }

  adminVisible = true;
  adminRecords.hidden = false;
  renderAdminRecords(getAttendanceRecords());
});

leaderButton.addEventListener("click", function () {
  const email = getLeaderEmail();

  if (!email) {
    leaderMessage.textContent = getLeaderMessage("email");
    return;
  }

  const records = getAttendanceRecords();
  const profiles = getLeaderProfiles();
  const attendanceRecord = records[email];
  const participation = Number(participationScore.value || 0);
  const referrals = Number(referralCount.value || 0);
  const rate = attendanceRecord ? getAttendanceRate(attendanceRecord.dates || []) : 0;
  const grade = calculateLeaderGrade(rate, participation, referrals);

  profiles[email] = {
    email: email,
    participation: participation,
    referrals: referrals,
    leaderGrade: grade,
    updatedAt: new Date().toISOString()
  };
  saveLeaderProfiles(profiles);

  if (records[email]) {
    records[email].leaderGrade = grade;
    records[email].participation = participation;
    records[email].referrals = referrals;
    saveAttendanceRecords(records);
  }

  leaderMessage.textContent = getLeaderMessage("saved");
  renderLeaderSystem();
  renderAttendance();
  renderRetention();
});

const shortsTitleData = {
  stress: {
    topic: "스트레스 해소",
    hooks: ["스트레스가 쌓인 날", "마음이 너무 무거울 때", "퇴근 후 지친 당신에게", "숨이 답답한 순간", "생각이 멈추지 않을 때"],
    outcomes: ["마음이 가벼워지는", "긴장이 풀리는", "호흡이 편안해지는", "머리가 맑아지는", "몸의 힘이 빠지는"],
    actions: ["1분 호흡 명상", "3분 마음 정리", "짧은 이완 루틴", "눈 감고 듣는 명상", "오늘의 스트레스 내려놓기"],
    endings: ["지금 바로 해보세요", "자기 전에 들어보세요", "조용한 곳에서 따라하세요", "하루 끝에 추천", "초보자도 가능합니다"]
  },
  sleep: {
    topic: "수면",
    hooks: ["잠이 오지 않는 밤", "뒤척이는 당신에게", "생각이 많은 밤", "숙면이 필요한 날", "밤마다 긴장되는 분께"],
    outcomes: ["잠들기 쉬워지는", "몸이 천천히 풀리는", "마음이 고요해지는", "호흡이 느려지는", "밤이 편안해지는"],
    actions: ["수면 명상", "잠들기 전 호흡", "3분 숙면 루틴", "불면 완화 명상", "침대에서 듣는 명상"],
    endings: ["이어폰으로 들어보세요", "불을 끄고 시작하세요", "오늘 밤 따라하세요", "천천히 눈을 감아보세요", "잠들기 전 추천"]
  },
  happiness: {
    topic: "행복",
    hooks: ["행복이 멀게 느껴질 때", "하루가 무기력할 때", "작은 기쁨이 필요한 순간", "마음에 햇빛이 필요할 때", "웃음을 잃은 날"],
    outcomes: ["기분이 밝아지는", "감사함이 살아나는", "마음이 따뜻해지는", "작은 행복을 느끼는", "오늘이 부드러워지는"],
    actions: ["감사 명상", "행복 호흡 루틴", "긍정 확언 명상", "아침 마음 열기", "기분 전환 명상"],
    endings: ["아침에 들어보세요", "오늘의 시작에 추천", "가볍게 따라하세요", "마음이 지칠 때 추천", "1분이면 충분합니다"]
  },
  brain: {
    topic: "뇌 건강",
    hooks: ["머리가 무거운 날", "집중이 흐려질 때", "뇌가 피곤한 느낌이라면", "생각이 복잡할 때", "기억력이 걱정될 때"],
    outcomes: ["집중이 살아나는", "머리가 맑아지는", "생각이 정리되는", "뇌 피로가 줄어드는", "주의력이 돌아오는"],
    actions: ["집중 명상", "뇌 휴식 호흡", "마음 정돈 루틴", "1분 집중 회복", "두뇌 리셋 명상"],
    endings: ["일하기 전에 추천", "공부 전 들어보세요", "오후 피로에 추천", "조용히 따라하세요", "짧게 리셋하세요"]
  },
  emotion: {
    topic: "감정정리",
    hooks: ["화가 가라앉지 않을 때", "눈물이 날 것 같은 날", "마음이 복잡한 순간", "감정이 넘칠 때", "상처받은 마음에게"],
    outcomes: ["감정이 정리되는", "마음이 부드러워지는", "속상함이 내려가는", "나를 다독이는", "평온함이 돌아오는"],
    actions: ["감정 정리 명상", "분노 내려놓기 호흡", "마음 다독임 루틴", "불안 완화 명상", "상처 회복 호흡"],
    endings: ["혼자 있고 싶을 때 추천", "조용히 들어보세요", "울고 싶은 날 들어보세요", "마음을 붙잡아줍니다", "오늘의 나에게 선물하세요"]
  },
  japaneseHealing: {
    topic: "癒し系",
    hooks: ["疲れた心に届けたい", "眠る前のやさしい時間", "日本の方におすすめ", "心をふわっと軽くする", "静かな夜に聴きたい"],
    outcomes: ["癒される", "安心できる", "深く眠れる", "心が整う", "やさしい気持ちになる"],
    actions: ["1分瞑想", "おやすみ呼吸", "癒しの誘導瞑想", "心を整える瞑想", "夜のリラックス習慣"],
    endings: ["今夜聴いてください", "そっと目を閉じて", "毎日の癒し時間に", "疲れた日におすすめ", "やさしい声で整える"]
  }
};

function buildShortsTitles(category) {
  const data = shortsTitleData[category];
  const titles = [];

  data.hooks.forEach(function (hook) {
    data.outcomes.forEach(function (outcome) {
      data.actions.forEach(function (action) {
        data.endings.forEach(function (ending) {
          if (titles.length < 200) {
            titles.push((titles.length + 1) + ". [" + data.topic + "] " + hook + ", " + outcome + " " + action + " | " + ending);
          }
        });
      });
    });
  });

  return titles;
}

function getShortsMessage(type) {
  const messages = {
    generated: {
      ko: "제목 200개가 생성되었습니다.",
      ja: "題名200個を生成しました。",
      en: "200 titles have been generated."
    },
    copied: {
      ko: "전체 제목을 복사했습니다.",
      ja: "すべての題名をコピーしました。",
      en: "All titles copied."
    },
    empty: {
      ko: "먼저 제목을 생성해주세요.",
      ja: "先に題名を生成してください。",
      en: "Generate titles first."
    }
  };

  return messages[type][currentLanguage];
}

generateTitlesButton.addEventListener("click", function () {
  const titles = buildShortsTitles(shortsCategory.value);

  titlesOutput.value = titles.join("\n");
  titleCount.textContent = titles.length + " / 200";
  shortsMessage.textContent = getShortsMessage("generated");
});

copyTitlesButton.addEventListener("click", function () {
  if (!titlesOutput.value.trim()) {
    shortsMessage.textContent = getShortsMessage("empty");
    return;
  }

  titlesOutput.select();
  document.execCommand("copy");
  shortsMessage.textContent = getShortsMessage("copied");
});

const metaTemplates = {
  stress: {
    description: "오늘 쌓인 스트레스를 잠시 내려놓고, 호흡에만 집중하는 짧은 명상입니다. 긴장된 몸과 마음을 부드럽게 풀어주고 싶은 순간에 조용히 들어보세요.",
    hashtags: ["#스트레스해소", "#명상", "#호흡명상", "#마음챙김", "#힐링", "#shorts", "#瞑想life"],
    cta: "마음이 조금 편안해졌다면 저장하고, 오늘 밤 다시 들어보세요."
  },
  sleep: {
    description: "잠들기 전 복잡한 생각을 천천히 정리하는 수면 명상입니다. 침대에 누워 눈을 감고, 편안한 호흡을 따라가며 하루의 긴장을 내려놓아보세요.",
    hashtags: ["#수면명상", "#잠잘오는법", "#불면완화", "#밤명상", "#힐링", "#shorts", "#瞑想life"],
    cta: "오늘 밤 편안한 잠을 원한다면 구독하고 매일 함께 명상해요."
  },
  happiness: {
    description: "작은 행복을 다시 느끼고 싶은 분을 위한 짧은 명상입니다. 지금 이 순간의 감사와 따뜻함을 떠올리며 마음을 밝게 열어보세요.",
    hashtags: ["#행복명상", "#감사명상", "#긍정확언", "#마음훈련", "#힐링", "#shorts", "#瞑想life"],
    cta: "오늘의 작은 행복을 댓글로 남기고, 이 영상을 저장해두세요."
  },
  brain: {
    description: "머리가 무겁고 집중이 흐려질 때 듣기 좋은 짧은 명상입니다. 생각을 정리하고 호흡을 차분히 따라가며 뇌의 피로를 잠시 쉬게 해주세요.",
    hashtags: ["#뇌건강", "#집중명상", "#두뇌휴식", "#마음정리", "#명상", "#shorts", "#瞑想life"],
    cta: "집중이 필요할 때 다시 볼 수 있도록 저장해두세요."
  },
  emotion: {
    description: "복잡한 감정을 억누르지 않고 부드럽게 정리하는 명상입니다. 화, 불안, 속상함이 올라오는 날에 자신을 다정하게 바라보는 시간을 가져보세요.",
    hashtags: ["#감정정리", "#불안완화", "#분노조절", "#마음챙김", "#힐링명상", "#shorts", "#瞑想life"],
    cta: "지금 감정이 조금 가벼워졌다면 좋아요로 마음을 표시해주세요."
  },
  japaneseHealing: {
    description: "疲れた心をやさしく整える、短い癒し系の瞑想です。眠る前や一人で静かに過ごしたい時間に、ゆっくり呼吸を感じてみてください。",
    hashtags: ["#癒し", "#瞑想", "#睡眠導入", "#リラックス", "#マインドフルネス", "#shorts", "#瞑想life"],
    cta: "心が少し軽くなったら、保存して今夜もう一度聴いてください。"
  }
};

function detectMetaCategory(title) {
  const lowerTitle = title.toLowerCase();

  if (title.includes("癒") || title.includes("眠る") || title.includes("心が") || title.includes("リラックス")) {
    return "japaneseHealing";
  }

  if (title.includes("잠") || title.includes("수면") || title.includes("불면") || lowerTitle.includes("sleep")) {
    return "sleep";
  }

  if (title.includes("행복") || title.includes("감사") || title.includes("긍정") || lowerTitle.includes("happy")) {
    return "happiness";
  }

  if (title.includes("뇌") || title.includes("집중") || title.includes("두뇌") || lowerTitle.includes("brain")) {
    return "brain";
  }

  if (title.includes("감정") || title.includes("화") || title.includes("불안") || title.includes("상처")) {
    return "emotion";
  }

  return "stress";
}

function getMetaMessage(type) {
  const messages = {
    generated: {
      ko: "설명문, 해시태그, CTA가 생성되었습니다.",
      ja: "説明文、ハッシュタグ、CTAを生成しました。",
      en: "Description, hashtags, and CTA generated."
    },
    copied: {
      ko: "생성 결과를 복사했습니다.",
      ja: "生成結果をコピーしました。",
      en: "Generated result copied."
    },
    empty: {
      ko: "먼저 쇼츠 제목을 입력해주세요.",
      ja: "先にショート題名を入力してください。",
      en: "Please enter a Shorts title first."
    }
  };

  return messages[type][currentLanguage];
}

function generateMetadataFromTitle(title) {
  const category = detectMetaCategory(title);
  const template = metaTemplates[category];

  descriptionOutput.value = title + "\n\n" + template.description;
  hashtagsOutput.value = template.hashtags.join(" ");
  ctaOutput.value = template.cta;
}

generateMetaButton.addEventListener("click", function () {
  const title = shortsTitleInput.value.trim();

  if (!title) {
    metaMessage.textContent = getMetaMessage("empty");
    return;
  }

  generateMetadataFromTitle(title);
  metaMessage.textContent = getMetaMessage("generated");
});

copyMetaButton.addEventListener("click", function () {
  const text = [
    descriptionOutput.value,
    "",
    hashtagsOutput.value,
    "",
    ctaOutput.value
  ].join("\n");

  if (!descriptionOutput.value.trim()) {
    metaMessage.textContent = getMetaMessage("empty");
    return;
  }

  navigator.clipboard.writeText(text).then(function () {
    metaMessage.textContent = getMetaMessage("copied");
  }).catch(function () {
    const temporaryTextarea = document.createElement("textarea");
    temporaryTextarea.value = text;
    document.body.appendChild(temporaryTextarea);
    temporaryTextarea.select();
    document.execCommand("copy");
    temporaryTextarea.remove();
    metaMessage.textContent = getMetaMessage("copied");
  });
});

const titleTranslationPresets = {
  sleep: {
    keywords: ["잠", "수면", "숙면", "불면", "밤", "잠들기"],
    ja: "眠る前に心がふっと落ち着く、やさしい1分瞑想",
    en: "A Gentle 1-Minute Meditation to Calm Your Mind Before Sleep"
  },
  stress: {
    keywords: ["스트레스", "긴장", "지친", "피곤", "퇴근", "쉬는"],
    ja: "疲れた心をゆっくり癒す、ストレスリリース瞑想",
    en: "A Stress-Relief Meditation to Gently Soothe a Tired Mind"
  },
  emotion: {
    keywords: ["감정", "불안", "화", "분노", "상처", "마음정리", "정리"],
    ja: "ざわつく感情をやさしく整える、心のリセット瞑想",
    en: "A Gentle Meditation to Reset and Release Heavy Emotions"
  },
  happiness: {
    keywords: ["행복", "감사", "기쁨", "긍정", "따뜻"],
    ja: "小さな幸せを思い出す、心があたたまる瞑想",
    en: "A Heartwarming Meditation to Remember Small Moments of Happiness"
  },
  brain: {
    keywords: ["뇌", "집중", "머리", "기억", "두뇌", "맑아"],
    ja: "頭をすっきり整える、集中力のための短い瞑想",
    en: "A Short Meditation to Clear Your Mind and Restore Focus"
  },
  basic: {
    keywords: [],
    ja: "心をやさしく整える、はじめての瞑想時間",
    en: "A Gentle Meditation Moment to Calm and Center Your Mind"
  }
};

function detectTranslationPreset(title) {
  return Object.values(titleTranslationPresets).find(function (preset) {
    return preset.keywords.some(function (keyword) {
      return title.includes(keyword);
    });
  }) || titleTranslationPresets.basic;
}

function extractDuration(title) {
  const match = title.match(/(\d+)\s*분/);

  if (!match) {
    return null;
  }

  return {
    ja: match[1] + "分",
    en: match[1] + "-Minute"
  };
}

function translateMeditationTitle(title) {
  const preset = detectTranslationPreset(title);
  const duration = extractDuration(title);
  let japaneseTitle = preset.ja;
  let englishTitle = preset.en;

  if (duration) {
    japaneseTitle = japaneseTitle.replace("1分", duration.ja);
    englishTitle = englishTitle.replace("1-Minute", duration.en);
  }

  if (title.includes("아침")) {
    japaneseTitle = japaneseTitle.replace("眠る前に", "朝の時間に").replace("夜", "朝");
    englishTitle = englishTitle.replace("Before Sleep", "in the Morning").replace("Before Bed", "in the Morning");
  }

  if (title.includes("초보") || title.includes("처음")) {
    japaneseTitle = "初心者でも安心してできる、" + japaneseTitle;
    englishTitle = "Beginner-Friendly: " + englishTitle;
  }

  return {
    ja: japaneseTitle,
    en: englishTitle
  };
}

function getTranslationMessage(type) {
  const messages = {
    empty: {
      ko: "먼저 한국어 제목을 입력해주세요.",
      ja: "先に韓国語タイトルを入力してください。",
      en: "Please enter a Korean title first."
    },
    translated: {
      ko: "명상 콘텐츠 톤으로 번역했습니다.",
      ja: "瞑想コンテンツらしい自然な表現に翻訳しました。",
      en: "Translated with a natural meditation content tone."
    },
    copied: {
      ko: "번역 결과를 복사했습니다.",
      ja: "翻訳結果をコピーしました。",
      en: "Translations copied."
    }
  };

  return messages[type][currentLanguage];
}

translateTitleButton.addEventListener("click", function () {
  const title = koreanTitleInput.value.trim();

  if (!title) {
    translationMessage.textContent = getTranslationMessage("empty");
    return;
  }

  const translated = translateMeditationTitle(title);

  japaneseTitleOutput.value = translated.ja;
  englishTitleOutput.value = translated.en;
  translationMessage.textContent = getTranslationMessage("translated");
});

copyTranslationButton.addEventListener("click", function () {
  if (!japaneseTitleOutput.value.trim() || !englishTitleOutput.value.trim()) {
    translationMessage.textContent = getTranslationMessage("empty");
    return;
  }

  const text = [
    "Japanese:",
    japaneseTitleOutput.value,
    "",
    "English:",
    englishTitleOutput.value
  ].join("\n");

  navigator.clipboard.writeText(text).then(function () {
    translationMessage.textContent = getTranslationMessage("copied");
  }).catch(function () {
    const temporaryTextarea = document.createElement("textarea");
    temporaryTextarea.value = text;
    document.body.appendChild(temporaryTextarea);
    temporaryTextarea.select();
    document.execCommand("copy");
    temporaryTextarea.remove();
    translationMessage.textContent = getTranslationMessage("copied");
  });
});

function getStripeMessage(type, planName) {
  const messages = {
    notReady: {
      ko: planName + " 결제 연결이 아직 준비되지 않았습니다. Vercel 배포 후 Stripe 환경변수를 설정하거나 script.js의 stripePaymentLinks에 Payment Link를 넣어주세요.",
      ja: planName + " の決済連携はまだ準備できていません。Vercelデプロイ後にStripe環境変数を設定するか、script.js の stripePaymentLinks にPayment Linkを入れてください。",
      en: planName + " checkout is not ready yet. After Vercel deployment, set Stripe environment variables or add a Payment Link to stripePaymentLinks in script.js."
    },
    redirect: {
      ko: planName + " Stripe 결제 페이지로 이동합니다.",
      ja: planName + " のStripe決済ページへ移動します。",
      en: "Opening Stripe checkout for " + planName + "."
    },
    loading: {
      ko: planName + " 결제 페이지를 준비하고 있습니다.",
      ja: planName + " の決済ページを準備しています。",
      en: "Preparing checkout for " + planName + "."
    },
    error: {
      ko: "결제 페이지를 열 수 없습니다. Stripe 환경변수와 Vercel 배포 상태를 확인해주세요.",
      ja: "決済ページを開けません。Stripe環境変数とVercelデプロイ状態を確認してください。",
      en: "Could not open checkout. Check Stripe environment variables and Vercel deployment."
    },
    success: {
      ko: planName + " 결제가 완료되었습니다. 유료회원 상태로 저장했습니다.",
      ja: planName + " の決済が完了しました。有料会員として保存しました。",
      en: planName + " payment completed. Saved as a paid member."
    },
    canceled: {
      ko: planName + " 결제가 취소되었습니다. 언제든 다시 결제할 수 있습니다.",
      ja: planName + " の決済がキャンセルされました。いつでも再開できます。",
      en: planName + " payment was canceled. You can try again anytime."
    }
  };

  return messages[type][currentLanguage];
}

function getStripeChecklistLabels() {
  return {
    secretKey: {
      ko: "Stripe Secret Key",
      ja: "Stripe Secret Key",
      en: "Stripe Secret Key"
    },
    basic: {
      ko: "월 1000엔 Price ID",
      ja: "月額1000円 Price ID",
      en: "¥1,000 Price ID"
    },
    care: {
      ko: "월 3000엔 Price ID",
      ja: "月額3000円 Price ID",
      en: "¥3,000 Price ID"
    },
    master: {
      ko: "월 10000엔 Price ID",
      ja: "月額10000円 Price ID",
      en: "¥10,000 Price ID"
    },
    publicSiteUrl: {
      ko: "PUBLIC_SITE_URL",
      ja: "PUBLIC_SITE_URL",
      en: "PUBLIC_SITE_URL"
    },
    fileMode: {
      ko: "`file://` 실행 중입니다. Stripe Test Mode 실제 결제는 Vercel 배포 주소에서 확인됩니다.",
      ja: "`file://`で実行中です。Stripe Test Modeの実決済確認はVercelデプロイURLで行ってください。",
      en: "You are running on `file://`. Real Stripe Test Mode checkout works on the deployed Vercel URL."
    },
    loading: {
      ko: "Stripe 설정 상태를 확인하는 중입니다.",
      ja: "Stripe設定状態を確認しています。",
      en: "Checking Stripe configuration status."
    },
    unavailable: {
      ko: "배포 후 자동 확인됩니다. 지금은 Stripe 상태 API에 연결되지 않았습니다.",
      ja: "デプロイ後に自動確認されます。現在はStripe状態APIに接続されていません。",
      en: "This will be checked automatically after deployment. The Stripe status API is not available yet."
    },
    ready: {
      ko: "연결 완료",
      ja: "接続完了",
      en: "Ready"
    },
    missing: {
      ko: "설정 필요",
      ja: "設定必要",
      en: "Missing"
    }
  };
}

function renderStripeChecklist() {
  const labels = getStripeChecklistLabels();

  stripeChecklistItems.innerHTML = "";

  if (window.location.protocol === "file:") {
    const item = document.createElement("li");
    item.textContent = labels.fileMode[currentLanguage];
    stripeChecklistItems.appendChild(item);
    return;
  }

  if (!stripeConfigStatus) {
    const item = document.createElement("li");
    item.textContent = labels.loading[currentLanguage];
    stripeChecklistItems.appendChild(item);
    return;
  }

  const items = [
    { key: "secretKey", enabled: stripeConfigStatus.secretKey },
    { key: "basic", enabled: stripeConfigStatus.basic },
    { key: "care", enabled: stripeConfigStatus.care },
    { key: "master", enabled: stripeConfigStatus.master },
    { key: "publicSiteUrl", enabled: stripeConfigStatus.publicSiteUrl }
  ];

  items.forEach(function (entry) {
    const item = document.createElement("li");
    item.className = entry.enabled ? "ready" : "missing";
    item.textContent = labels[entry.key][currentLanguage] + " · " + (entry.enabled ? labels.ready[currentLanguage] : labels.missing[currentLanguage]);
    stripeChecklistItems.appendChild(item);
  });
}

async function loadStripeConfigStatus() {
  if (window.location.protocol === "file:") {
    renderStripeChecklist();
    return;
  }

  try {
    const response = await fetch("/api/stripe-config-status");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Stripe config status unavailable");
    }

    stripeConfigStatus = data;
  } catch (error) {
    stripeConfigStatus = {
      secretKey: false,
      basic: false,
      care: false,
      master: false,
      publicSiteUrl: false
    };
  }

  renderStripeChecklist();
}

function getStripePlanName(plan) {
  const names = {
    ko: { basic: "Basic ¥1,000", care: "Growth ¥3,000", master: "Inner Circle ¥10,000" },
    ja: { basic: "Basic ¥1,000", care: "Growth ¥3,000", master: "Inner Circle ¥10,000" },
    en: { basic: "Basic ¥1,000", care: "Growth ¥3,000", master: "Inner Circle ¥10,000" }
  };

  return names[currentLanguage][plan];
}

function getCheckoutEmail() {
  const member = getSavedMember();

  if (member && member.email) {
    return member.email;
  }

  const emailInput = contactForm.querySelector("input[name='email']");

  return emailInput ? emailInput.value.trim() : "";
}

function openFallbackPaymentLink(plan, planName) {
  const link = stripePaymentLinks[plan];

  if (!link) {
    stripeStatus.querySelector("p").textContent = getStripeMessage("notReady", planName);
    return;
  }

  localStorage.setItem("meisouLifeSelectedPlan", plan);
  saveSelectedPlanForMember(plan);
  stripeStatus.querySelector("p").textContent = getStripeMessage("redirect", planName);
  window.location.href = link;
}

function prepareCheckoutMember(plan) {
  const member = getSavedMember();
  const email = getCheckoutEmail();

  if (member) {
    return;
  }

  if (!email) {
    return;
  }

  const checkoutMember = {
    email: email,
    level: "paid",
    plan: plan,
    passwordLength: 0,
    joinedAt: new Date().toISOString()
  };

  localStorage.setItem("meisouLifeMember", JSON.stringify(checkoutMember));
  saveMemberToList(checkoutMember);
  createEmailSequence(checkoutMember);
}

async function startStripeCheckout(plan) {
  const planName = getStripePlanName(plan);

  stripeStatus.querySelector("p").textContent = getStripeMessage("loading", planName);
  prepareCheckoutMember(plan);

  if (window.location.protocol === "file:") {
    openFallbackPaymentLink(plan, planName);
    return;
  }

  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        plan: plan,
        email: getCheckoutEmail(),
        language: currentLanguage
      })
    });
    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || "Checkout session failed");
    }

    localStorage.setItem("meisouLifeSelectedPlan", plan);
    saveSelectedPlanForMember(plan);
    stripeStatus.querySelector("p").textContent = getStripeMessage("redirect", planName);
    window.location.href = data.url;
  } catch (error) {
    stripeStatus.querySelector("p").textContent = getStripeMessage("error", planName);
    openFallbackPaymentLink(plan, planName);
  }
}

stripeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    startStripeCheckout(button.dataset.plan);
  });
});

function handleCheckoutReturn() {
  const params = new URLSearchParams(window.location.search);
  const checkoutStatus = params.get("checkout");
  const plan = params.get("plan") || localStorage.getItem("meisouLifeSelectedPlan") || "basic";
  const planName = getStripePlanName(plan);

  if (checkoutStatus === "success") {
    saveSelectedPlanForMember(plan);
    stripeStatus.querySelector("p").textContent = getStripeMessage("success", planName);
    renderDashboard();
  }

  if (checkoutStatus === "canceled") {
    stripeStatus.querySelector("p").textContent = getStripeMessage("canceled", planName);
  }
}

function saveSelectedPlanForMember(plan) {
  const member = getSavedMember();

  if (!member) {
    return;
  }

  member.plan = plan;
  member.planSelectedAt = new Date().toISOString();
  localStorage.setItem("meisouLifeMember", JSON.stringify(member));
  saveMemberToList(member);
  renderDashboard();
}

function getRetentionMessage(choice) {
  const messages = {
    pause: {
      ko: "1개월 휴식 옵션이 저장되었습니다. 기록과 등급은 유지됩니다.",
      ja: "1ヶ月休会オプションを保存しました。記録と等級は維持されます。",
      en: "Your 1-month pause option has been saved. Your records and level will be kept."
    },
    discount: {
      ko: "할인 유지 옵션이 저장되었습니다. 다음 달 30% 할인 혜택을 적용할 수 있습니다.",
      ja: "割引維持オプションを保存しました。来月30%割引を適用できます。",
      en: "Your discount option has been saved. You can continue next month with 30% off."
    }
  };

  return messages[choice][currentLanguage];
}

retentionButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const choice = button.dataset.choice;

    localStorage.setItem("meisouLifeRetentionChoice", JSON.stringify({
      choice: choice,
      selectedAt: new Date().toISOString()
    }));
    retentionResult.textContent = getRetentionMessage(choice);
    renderDashboard();
  });
});

function getPlanAmount(plan) {
  const amounts = {
    basic: 1000,
    care: 3000,
    master: 10000,
    free: 0,
    paid: 1000
  };

  return amounts[plan] || 0;
}

function formatYen(amount) {
  return "¥" + amount.toLocaleString("ja-JP");
}

function getContentMetrics() {
  const savedMetrics = localStorage.getItem("meisouLifeContentMetrics");

  if (!savedMetrics) {
    return {
      "수면 명상": Number(localStorage.getItem("meisouLifeSleepViews") || 0),
      "출석체크": Object.keys(getAttendanceRecords()).length,
      "쇼츠 제목 생성기": titlesOutput.value ? 1 : 0,
      "리더 등급 시스템": Object.keys(getLeaderProfiles()).length,
      "해지 방지 페이지": localStorage.getItem("meisouLifeRetentionChoice") ? 1 : 0,
      "매일 명상 메시지": getDailyMessageSettings().enabled ? 1 : 0,
      "홍익 공생 MVP": getHongikData().members.length,
      "7일 이메일 자동화": Object.keys(getEmailSequences()).length
    };
  }

  return JSON.parse(savedMetrics);
}

function saveContentMetrics(metrics) {
  localStorage.setItem("meisouLifeContentMetrics", JSON.stringify(metrics));
}

function renderPopularContent() {
  const metrics = getContentMetrics();
  const ranking = Object.entries(metrics).sort(function (first, second) {
    return second[1] - first[1];
  });

  popularContentList.innerHTML = "";

  ranking.slice(0, 5).forEach(function (entry, index) {
    const item = document.createElement("li");
    const rank = document.createElement("span");
    const title = document.createElement("strong");
    const count = document.createElement("span");

    rank.className = "ranking-rank";
    rank.textContent = index + 1;
    title.textContent = entry[0];
    count.className = "ranking-days";
    count.textContent = entry[1] + (currentLanguage === "en" ? " uses" : "회");

    item.append(rank, title, count);
    popularContentList.appendChild(item);
  });
}

function renderDashboardNotes(members, churnRate, revenue) {
  dashboardNotes.innerHTML = "";

  const notes = [
    currentLanguage === "ja" ? "有料化候補: 出席記録がある会員を優先フォロー" : currentLanguage === "en" ? "Upgrade signal: Follow up with members who have check-ins." : "유료 전환 후보: 출석 기록이 있는 회원을 우선 팔로우하세요.",
    currentLanguage === "ja" ? "解約注意: 休会または割引を選んだ会員を確認" : currentLanguage === "en" ? "Churn risk: Review members who selected pause or discount." : "해지 위험: 휴식 또는 할인 옵션 선택 회원을 확인하세요.",
    currentLanguage === "ja" ? "今月売上: " + formatYen(revenue) : currentLanguage === "en" ? "Monthly revenue: " + formatYen(revenue) : "이번 달 매출: " + formatYen(revenue),
    currentLanguage === "ja" ? "登録会員: " + members.length + "名 / 解約率: " + churnRate + "%" : currentLanguage === "en" ? "Members: " + members.length + " / Churn: " + churnRate + "%" : "회원 수: " + members.length + "명 / 해지율: " + churnRate + "%"
  ];

  notes.forEach(function (note, index) {
    const row = document.createElement("div");
    const rank = document.createElement("span");
    const text = document.createElement("strong");

    row.className = "admin-record-row";
    rank.className = "ranking-rank";
    rank.textContent = index + 1;
    text.textContent = note;
    row.append(rank, text, document.createElement("span"));
    dashboardNotes.appendChild(row);
  });
}

function renderDashboard() {
  const members = getMemberList();
  const currentMonth = getMonthText();
  const newMembers = members.filter(function (member) {
    return member.joinedAt && member.joinedAt.startsWith(currentMonth);
  });
  const retentionChoice = localStorage.getItem("meisouLifeRetentionChoice");
  const churnSignals = retentionChoice ? 1 : 0;
  const churnRate = members.length === 0 ? 0 : Math.round((churnSignals / members.length) * 100);
  const revenue = members.reduce(function (sum, member) {
    return sum + getPlanAmount(member.plan || member.level);
  }, 0);

  dashboardMembers.textContent = members.length;
  dashboardNewMembers.textContent = newMembers.length;
  dashboardChurn.textContent = churnRate + "%";
  dashboardRevenue.textContent = formatYen(revenue);

  renderPopularContent();
  renderDashboardNotes(members, churnRate, revenue);
}

seedDashboardButton.addEventListener("click", function () {
  const members = getMemberList();
  const samples = [
    { email: "mika@example.com", level: "paid", plan: "basic", passwordLength: 8, joinedAt: getMonthText() + "-03T09:00:00.000Z" },
    { email: "sora@example.com", level: "paid", plan: "care", passwordLength: 10, joinedAt: getMonthText() + "-08T09:00:00.000Z" },
    { email: "ken@example.com", level: "paid", plan: "master", passwordLength: 12, joinedAt: getMonthText() + "-12T09:00:00.000Z" },
    { email: "yuna@example.com", level: "free", plan: "free", passwordLength: 7, joinedAt: getMonthText() + "-15T09:00:00.000Z" }
  ];
  const mergedMembers = members.concat(samples).filter(function (member, index, list) {
    return list.findIndex(function (item) {
      return item.email === member.email;
    }) === index;
  });
  const metrics = {
    "수면 명상": 48,
    "스트레스 해소 명상": 36,
    "출석체크": 29,
    "쇼츠 제목 생성기": 22,
    "리더 등급 시스템": 15
  };

  saveMemberList(mergedMembers);
  saveContentMetrics(metrics);
  renderDashboard();
});

refreshDashboardButton.addEventListener("click", function () {
  renderDashboard();
});

hongikSignupForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(hongikSignupForm);
  const email = formData.get("email").trim().toLowerCase();
  const data = getHongikData();
  const member = {
    name: formData.get("name").trim(),
    email: email,
    region: formData.get("region"),
    joinedAt: new Date().toISOString()
  };
  const existingIndex = data.members.findIndex(function (savedMember) {
    return savedMember.email === email;
  });

  if (existingIndex >= 0) {
    data.members[existingIndex] = Object.assign({}, data.members[existingIndex], member);
  } else {
    data.members.push(member);
  }

  saveHongikData(data);
  hongikMeditationEmail.value = email;
  hongikMessage.textContent = currentLanguage === "ja" ? "共生会員登録が完了しました。" : currentLanguage === "en" ? "Coexistence member created." : "공생 회원 등록이 완료되었습니다.";
  hongikSignupForm.reset();
  renderHongikMvp();
  renderDashboard();
});

goodDeedForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(goodDeedForm);
  const data = getHongikData();
  const email = formData.get("email").trim().toLowerCase();

  data.goodDeeds.push({
    email: email,
    deed: formData.get("deed").trim(),
    createdAt: new Date().toISOString()
  });

  saveHongikData(data);
  hongikMeditationEmail.value = email;
  hongikMessage.textContent = currentLanguage === "ja" ? "善行認証を保存しました。" : currentLanguage === "en" ? "Good deed proof saved." : "선행 인증이 저장되었습니다.";
  goodDeedForm.reset();
  renderHongikMvp();
  renderDashboard();
});

hongikMeditationButton.addEventListener("click", function () {
  const data = getHongikData();
  const email = getHongikActiveEmail(data);

  if (!email) {
    hongikMessage.textContent = currentLanguage === "ja" ? "先に会員メールを入力してください。" : currentLanguage === "en" ? "Please enter a member email first." : "먼저 회원 이메일을 입력해주세요.";
    return;
  }

  data.meditations.push({
    email: email,
    date: getTodayText(),
    joinedAt: new Date().toISOString()
  });

  saveHongikData(data);
  hongikMessage.textContent = currentLanguage === "ja" ? "今日の瞑想参加を記録しました。" : currentLanguage === "en" ? "Today's meditation participation was recorded." : "오늘 명상 참여가 기록되었습니다.";
  renderHongikMvp();
  renderDashboard();
});

donationForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(donationForm);
  const data = getHongikData();

  data.donations.push({
    amount: Number(formData.get("amount")),
    purpose: formData.get("purpose"),
    donatedAt: new Date().toISOString()
  });

  saveHongikData(data);
  hongikMessage.textContent = currentLanguage === "ja" ? "支援記録を保存しました。" : currentLanguage === "en" ? "Donation record saved." : "후원 기록이 저장되었습니다.";
  donationForm.reset();
  renderHongikMvp();
  renderDashboard();
});

enableDailyButton.addEventListener("click", function () {
  const settings = getDailyMessageSettings();

  settings.enabled = true;
  settings.sendHour = 6;
  settings.sendMinute = 0;
  saveDailyMessageSettings(settings);

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().then(function (permission) {
      dailyMessageResult.textContent = permission === "granted"
        ? currentLanguage === "ja" ? "毎朝6時の通知をオンにしました。" : currentLanguage === "en" ? "Daily 6 AM notifications are enabled." : "매일 오전 6시 알림을 켰습니다."
        : currentLanguage === "ja" ? "通知権限はありませんが、ページ内の予約はオンです。" : currentLanguage === "en" ? "Browser notifications are blocked, but the page schedule is on." : "브라우저 알림 권한은 없지만, 페이지 안의 예약은 켜졌습니다.";
      renderDailyMessage();
      renderDashboard();
      startDailyMessageTimer();
    });
    return;
  }

  dailyMessageResult.textContent = "Notification" in window && Notification.permission === "granted"
    ? currentLanguage === "ja" ? "毎朝6時の通知をオンにしました。" : currentLanguage === "en" ? "Daily 6 AM notifications are enabled." : "매일 오전 6시 알림을 켰습니다."
    : currentLanguage === "ja" ? "ページ内の毎朝6時予約をオンにしました。" : currentLanguage === "en" ? "The daily 6 AM page schedule is enabled." : "페이지 안의 매일 오전 6시 예약을 켰습니다.";
  renderDailyMessage();
  renderDashboard();
  startDailyMessageTimer();
});

sendDailyTestButton.addEventListener("click", function () {
  sendDailyMeditationMessage(true);
});

copyDailyButton.addEventListener("click", function () {
  const text = getDailyPreviewText(getDailyMessageForDate(getTodayText()));

  navigator.clipboard.writeText(text).then(function () {
    dailyMessageResult.textContent = currentLanguage === "ja" ? "今日のメッセージをコピーしました。" : currentLanguage === "en" ? "Today's message copied." : "오늘의 메시지를 복사했습니다.";
  });
});

seedEmailButton.addEventListener("click", function () {
  const member = getSavedMember() || {
    email: "welcome@example.com",
    level: "paid",
    plan: "basic",
    passwordLength: 8,
    joinedAt: new Date().toISOString()
  };

  localStorage.setItem("meisouLifeMember", JSON.stringify(member));
  saveMemberToList(member);
  createEmailSequence(member);
  emailMessage.textContent = currentLanguage === "ja" ? "7日間のメールシーケンスを作成しました。" : currentLanguage === "en" ? "Created a 7-day email sequence." : "7일 이메일 시퀀스를 생성했습니다.";
  renderDashboard();
  renderEmailAutomation();
});

markEmailSentButton.addEventListener("click", function () {
  markSelectedEmailSent();
});

copyEmailButton.addEventListener("click", function () {
  const text = emailPreviewOutput.value.trim();

  if (!text) {
    emailMessage.textContent = currentLanguage === "ja" ? "コピーするメールを先に選択してください。" : currentLanguage === "en" ? "Select an email before copying." : "복사할 이메일을 먼저 선택해주세요.";
    return;
  }

  navigator.clipboard.writeText(text).then(function () {
    emailMessage.textContent = currentLanguage === "ja" ? "メール内容をコピーしました。" : currentLanguage === "en" ? "Email copied." : "이메일 내용을 복사했습니다.";
  });
});

changeLanguage(detectLanguageByRegion());
handleCheckoutReturn();
loadStripeConfigStatus();
startDailyMessageTimer();
