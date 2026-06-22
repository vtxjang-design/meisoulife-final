"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLocaleCopy } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type MemberEntryContentProps = {
  lineUrl: string;
  debug?: boolean;
  hasSupabaseUrl: boolean;
  hasSupabaseAnonKey: boolean;
  isLoggedInInitially: boolean;
  initialPlan: "free" | "basic" | "growth" | "inner_circle";
  initialEmail: string;
  membershipSummary: {
    currentPlan: "free" | "basic" | "growth" | "inner_circle";
    subscriptionStatus: string | null;
    nextBillingDate: string | null;
    canManageMembership: boolean;
  };
};

type AuthState = "idle" | "sending" | "sent" | "error" | "unavailable";

type MagicLinkApiResult = {
  success: boolean;
  message?: string;
  error?: string;
  env?: {
    supabaseUrlExists: boolean;
    supabaseKeyExists: boolean;
  };
};

type AuthDebugResult = {
  supabaseUrlExists: boolean;
  supabaseKeyExists: boolean;
  siteUrl: string;
};

type CustomerPortalApiResult = {
  ok?: boolean;
  url?: string;
  error?: string;
};

type RecoveryForestKey =
  | "meditation"
  | "breathing"
  | "brainWave"
  | "strength"
  | "pause"
  | "belly"
  | "sleep"
  | "smile"
  | "temperature";

const memberEntryCopy = {
  jp: {
    badge: "Member Entrance",
    title: "おかえりなさい。今日の1分から始めましょう。",
    description:
      "ここは、決済後も無理なく戻ってこられる静かな入口です。今日の1分、7日リズム、LINEサポートから、今の自分に合う一歩を選べます。",
    actions: {
      minute: "今日の1分を始める",
      rhythm: "7日リズムを見る",
      line: "LINEでサポートを受ける",
      login: "ログインする",
      dashboard: "メンバーの続きへ進む",
      myProgram: "私のプログラムへ",
      community: "共に続ける場を見る"
    },
    lineNote: "決済済みの方も、まずはLINEから静かにサポートを受けられます。",
    fallback:
      "ログイン機能を調整中です。決済済みの方はLINEからサポートを受けられます。",
    supportCta: "決済済みです。LINEで確認する",
    loginTitle: "メールでログインリンクを受け取る",
    loginDescription:
      "登録したメールアドレスに、メンバーページへ戻るためのマジックリンクをお送りします。",
    emailPlaceholder: "you@example.com",
    emailLabel: "メールアドレス",
    submit: "ログインリンクを送る",
    submitLoading: "送信中...",
    sentMessage: "ログインリンクを送信しました。メールをご確認ください。",
    errorMessage:
      "ログインリンクを送れませんでした。しばらくしてからもう一度お試しください。",
    unavailableMessage:
      "今はログインを開けませんが、LINEからサポートを受ければ次の案内につながれます。",
    loggedIn: "ログイン済みです。続きから静かに始められます。",
    inboxHelp:
      "メールが届かない場合は、迷惑メールをご確認ください。解決しない場合はLINEでサポートします。",
    invalidEmail: "有効なメールアドレスを入力してください。",
    sentBox:
      "ログインリンクを送信しました。メールをご確認ください。迷惑メールもご確認ください。",
    loggedInBox: "ログインできました。今日の1分から始めましょう。",
    planLabel: "現在の段階",
    planLabels: {
      free: "Free",
      basic: "Basic / Life Rhythm",
      growth: "Growth / Brain Owner",
      inner_circle: "Inner Circle / Coexistence Circle"
    },
    membershipPanel: {
      eyebrow: "決済とメンバーシップ",
      title: "現在のメンバーシップ",
      currentPlan: "現在のプラン",
      subscriptionStatus: "購読ステータス",
      nextBillingDate: "次回決済日",
      manage: "メンバーシップを管理する",
      loading: "開いています...",
      unavailable: "現在、セルフサービス管理を準備中です",
      error: "Stripe Customer Portal を開けませんでした。しばらくしてからもう一度お試しください。",
      noBillingDate: "未定",
      noStatus: "未確認"
    },
    dashboard: {
      eyebrow: "Daily Life OS",
      title: "おかえりなさい。今日も、ここで少し呼吸できます。",
      description:
        "もし今日が少し重くても、1分で十分です。ここは、回復から毎日のリズム、脳の主人として生きる感覚、共生の実践へ静かにつながる場所です。",
      planFocus: {
        free: "今日の回復プラクティス",
        basic: "今日の Life Rhythm プラクティス",
        growth: "今日の Brain Owner プラクティス",
        inner_circle: "今日の Coexistence Circle プラクティス"
      },
      journeyTitle: "今日の小さな道のり",
      journeySteps: ["1分の回復", "毎日のリズム", "脳の主人", "共生", "文明"],
      stateTitle: "Welcome Space",
      stateDescription: "今いちばん近い感覚をひとつ選ぶだけで大丈夫です。ひとつタップすれば、そのまま1分の回復へ入れます。",
      stateTapHint: "ひとつタップして、すぐ始める",
      states: [
        {
          key: "overwhelmed",
          label: "😰 いっぱいいっぱい",
          support: "まずは1分の呼吸リセットで、内側の速度を少し落としてみましょう。"
        },
        {
          key: "exhausted",
          label: "😴 かなり疲れている",
          support: "身体をゆるく起こす Body Activation から入る方が、今はやさしいかもしれません。"
        },
        {
          key: "unstable",
          label: "🌊 感情が揺れている",
          support: "感情を抑えるより、短いリフレクションで今の波を見つめるのがおすすめです。"
        },
        {
          key: "stressed",
          label: "🔥 ストレスが強い",
          support: "温度リセットや短い動きで、身体から状態を切り替えてみましょう。"
        },
        {
          key: "okay",
          label: "🙂 まずまず大丈夫",
          support: "静かな1分と小さな感謝で、今日のリズムをやさしく整えていきましょう。"
        },
        {
          key: "energized",
          label: "✨ いい流れがある",
          support: "この良い流れを、自分だけで終わらせず周りへ広げる日にしてみましょう。"
        }
      ],
      recoveryTitle: "今日の1分リカバリー",
      recoveryDescription: "今日の状態に合わせて、最もやさしい入口から始めます。",
      recoveryCta: "1分リカバリーを始める",
      recoveryOptions: {
        overwhelmed: "1分呼吸リセット",
        exhausted: "Body Activation",
        unstable: "短い感情リフレクション",
        stressed: "1分 温度リセット",
        okay: "1分の感謝リズム",
        energized: "Smile Muscle Activation"
      },
      rhythmTitle: "Rhythm Garden",
      rhythmDescription: "完璧さではなく、今日どれだけ自分に戻れたかを静かに見る指標です。",
      rhythmScoreLabel: "今日のスコア",
      rhythmItems: [
        "☀ 身体を軽く起こす",
        "🙂 Smile Muscle",
        "🧠 Mind Ownership",
        "❤️ 感謝をひとつ見つける",
        "🌿 自然を1分感じる"
      ],
      bosTitle: "Reflection Bench",
      bosDescription: "Brain Operating System の問いで、今日は何が自分を動かしたかを見つめます。",
      bosQuestions: [
        "今日、私の脳を動かしていたのは何でしたか？",
        "私は何を選び直せますか？",
        "今、自分の主人として戻れているでしょうか？"
      ],
      bosPlaceholder: "今日の気づきを一言だけでも残してみましょう。",
      coexistenceTitle: "Human Connection",
      coexistenceDescription:
        "回復は一人で終わりません。小さな優しさやつながりが、共生文化の始まりになります。",
      coexistenceAction: "誰かに、短くても温かい一言を送る",
      coexistenceDone: "今日の小さな共生アクションを心に留めました。",
      communityPulse: "今日も、12人がここで静かに呼吸しました。",
      founderTitle: "Wisdom Tree",
      founderDescription:
        "45年の実践が伝えてきたのは、人はいつでも再び回復し、目覚め直せるという希望です。",
      founderWisdoms: [
        "小さな実践は、人生のリズムを変える力になります。",
        "AI時代だからこそ、人間の温かさが未来を決めます。",
        "共に目覚める文化は、一人の静かな実践から始まります。"
      ],
      readDeeper: "Deep Forest をひらく"
    },
    forest: {
      eyebrow: "1-Minute Recovery Forest",
      title: "もし今日が重ければ、1分で十分です。",
      description:
        "ここは、ひとつずつ静かに試せる小さな回復の道です。コンテンツではなく、今日の自分に戻るための小さな儀式として使ってください。",
      startLabel: "はじめる",
      soundOn: "自然音 ON",
      soundOff: "自然音 OFF",
      openDeepForest: "静かな深みへ",
      completionTitle: "戻ってきてくれて、ありがとうございます。",
      completionBody: "1分でも、あなたが戻ってきたことには意味があります。",
      completionQuestion: "今、どんな感じですか？",
      done: "完了",
      seeTomorrow: "また明日、戻ってきてください。",
      completionMessages: [
        "1分は、小さくても確かな回復です。",
        "あなたは今、自分の場所に戻ってきました。",
        "急がなくても、この1分はちゃんと残ります。"
      ],
      cards: [
        { key: "meditation", emoji: "🌿", title: "1分瞑想", description: "呼吸と静けさにやさしく戻る", instruction: "背中をゆるめて、息が出ていく感じをただ見守りましょう。" },
        { key: "breathing", emoji: "💨", title: "1分呼吸", description: "長く吐いて神経を整える", instruction: "吸うよりも、吐く息を少しだけ長くしてみてください。" },
        { key: "brainWave", emoji: "🧠", title: "1分 脳波振動", description: "内側のリズムを細かくゆらす", instruction: "眉間と頭の奥がやわらぐイメージで、小さくリズムを感じます。" },
        { key: "strength", emoji: "💪", title: "1分 体力活性", description: "身体を軽く起こして戻る", instruction: "肩と胸を少し開いて、身体が起きてくる感覚を待ちましょう。" },
        { key: "pause", emoji: "🛑", title: "1分 停止", description: "何もしない勇気を持つ", instruction: "今は変えようとせず、そのままの自分をひと呼吸だけ許してみます。" },
        { key: "belly", emoji: "☀️", title: "1分 腸ヒーリング", description: "お腹をゆるめて安心感を戻す", instruction: "お腹に手を当てて、ぬくもりが広がる感じを味わってみてください。" },
        { key: "sleep", emoji: "🌙", title: "1分 睡眠準備", description: "眠る前の緊張をほどく", instruction: "顎と肩の力を抜いて、今日はもう休んでいいと身体に伝えます。" },
        { key: "smile", emoji: "🙂", title: "1分 スマイル活性", description: "表情筋から気分を整える", instruction: "口角をほんの少し上げて、表情から気分を迎えにいきましょう。" },
        { key: "temperature", emoji: "💧", title: "1分 温度リセット", description: "温度感覚で状態を切り替える", instruction: "水や空気の感覚を思い出しながら、身体の状態が変わる余地をつくります。" }
      ]
    },
    debug: {
      title: "接続確認",
      supabaseUrl: "Supabase URL",
      anonKey: "Anon key",
      serverApi: "Server API result",
      authDebug: "Auth debug API",
      origin: "Current origin",
      lastError: "Last error",
      yes: "yes",
      no: "no",
      none: "none"
    }
  },
  kr: {
    badge: "Member Entrance",
    title: "다시 오신 것을 환영합니다. 오늘의 1분부터 시작해볼까요?",
    description:
      "이곳은 결제 후에도 부담 없이 다시 돌아올 수 있는 조용한 입구입니다. 오늘의 1분, 7일 리듬, LINE 지원 중 지금의 나에게 맞는 한 걸음을 고를 수 있습니다.",
    actions: {
      minute: "오늘의 1분 시작하기",
      rhythm: "7일 리듬 보기",
      line: "LINE으로 지원받기",
      login: "로그인하기",
      dashboard: "멤버 이어서 보기",
      myProgram: "나의 프로그램 가기",
      community: "함께 이어가는 곳 보기"
    },
    lineNote: "결제하신 분도 먼저 LINE에서 조용히 안내를 받을 수 있습니다.",
    fallback:
      "로그인 기능을 조정중입니다. 결제하신 분은 LINE에서 지원을 받을 수 있습니다.",
    supportCta: "결제 완료했습니다. LINE으로 확인하기",
    loginTitle: "이메일로 로그인 링크 받기",
    loginDescription:
      "등록한 이메일 주소로 멤버 페이지로 돌아오는 매직 링크를 보내드립니다.",
    emailPlaceholder: "you@example.com",
    emailLabel: "이메일 주소",
    submit: "로그인 링크 보내기",
    submitLoading: "보내는 중...",
    sentMessage: "로그인 링크를 보냈습니다. 이메일을 확인해주세요.",
    errorMessage:
      "로그인 링크를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
    unavailableMessage:
      "지금은 로그인 연결이 원활하지 않지만, LINE 지원으로 다음 안내를 받으실 수 있습니다.",
    loggedIn: "이미 로그인되어 있습니다. 이어서 조용히 시작하실 수 있습니다.",
    inboxHelp:
      "메일이 보이지 않으면 스팸함을 확인해주세요. 그래도 해결되지 않으면 LINE으로 도와드리겠습니다.",
    invalidEmail: "올바른 이메일 주소를 입력해주세요.",
    sentBox:
      "로그인 링크를 보냈습니다. 이메일을 확인해주세요. 스팸함도 함께 확인해주세요.",
    loggedInBox: "로그인되었습니다. 오늘의 1분부터 시작해볼까요?",
    planLabel: "현재 단계",
    planLabels: {
      free: "Free",
      basic: "Basic / Life Rhythm",
      growth: "Growth / Brain Owner",
      inner_circle: "Inner Circle / Coexistence Circle"
    },
    membershipPanel: {
      eyebrow: "결제 및 멤버십",
      title: "현재 멤버십",
      currentPlan: "현재 플랜",
      subscriptionStatus: "구독 상태",
      nextBillingDate: "다음 결제일",
      manage: "멤버십 관리하기",
      loading: "여는 중...",
      unavailable: "현재 셀프서비스 멤버십 관리를 준비 중입니다",
      error: "Stripe Customer Portal을 열지 못했습니다. 잠시 후 다시 시도해 주세요.",
      noBillingDate: "미정",
      noStatus: "확인 중"
    },
    dashboard: {
      eyebrow: "Daily Life OS",
      title: "다시 오셨어요. 오늘도 여기서 조금 숨을 돌릴 수 있습니다.",
      description:
        "오늘이 조금 무거워도 괜찮습니다. 1분이면 충분합니다. 이곳은 회복에서 일상의 리듬, 뇌의 주인으로 살아가는 감각, 공생의 실천까지 조용히 이어지는 자리입니다.",
      planFocus: {
        free: "오늘의 회복 실천",
        basic: "오늘의 Life Rhythm 실천",
        growth: "오늘의 Brain Owner 실천",
        inner_circle: "오늘의 Coexistence Circle 실천"
      },
      journeyTitle: "오늘의 작은 여정",
      journeySteps: ["1분 회복", "일상 리듬", "뇌의 주인", "공생", "문명"],
      stateTitle: "Welcome Space",
      stateDescription: "지금 가장 가까운 감각 하나만 골라도 충분합니다. 한 번 탭하면 바로 1분 회복으로 들어갑니다.",
      stateTapHint: "한 번 탭하고 바로 시작하기",
      states: [
        {
          key: "overwhelmed",
          label: "😰 벅차요",
          support: "먼저 1분 호흡 리셋으로 마음의 속도를 조금 낮춰보세요."
        },
        {
          key: "exhausted",
          label: "😴 너무 지쳐요",
          support: "지금은 Body Activation처럼 몸을 가볍게 깨우는 쪽이 더 부드러운 시작일 수 있습니다."
        },
        {
          key: "unstable",
          label: "🌊 감정이 흔들려요",
          support: "감정을 누르기보다 짧은 리플렉션으로 지금의 상태를 바라보는 것이 좋습니다."
        },
        {
          key: "stressed",
          label: "🔥 스트레스가 커요",
          support: "온도 리셋이나 짧은 움직임으로 몸에서부터 상태를 바꿔보세요."
        },
        {
          key: "okay",
          label: "🙂 괜찮은 편이에요",
          support: "조용한 1분과 작은 감사 하나로 오늘의 리듬을 안정시켜보세요."
        },
        {
          key: "energized",
          label: "✨ 흐름이 좋아요",
          support: "좋은 흐름을 나만의 것이 아니라 주변으로 넓히는 하루로 만들어보세요."
        }
      ],
      recoveryTitle: "오늘의 1분 리커버리",
      recoveryDescription: "지금 상태에 맞는 가장 부드러운 시작점부터 안내합니다.",
      recoveryCta: "1분 리커버리 시작",
      recoveryOptions: {
        overwhelmed: "1분 호흡 리셋",
        exhausted: "Body Activation",
        unstable: "짧은 감정 리플렉션",
        stressed: "1분 온도 리셋",
        okay: "1분 감사 리듬",
        energized: "Smile Muscle Activation"
      },
      rhythmTitle: "Rhythm Garden",
      rhythmDescription: "완벽함보다 오늘 얼마나 나에게 다시 돌아왔는지를 조용히 보는 지표입니다.",
      rhythmScoreLabel: "오늘의 점수",
      rhythmItems: [
        "☀ 몸을 가볍게 깨우기",
        "🙂 Smile Muscle",
        "🧠 Mind Ownership",
        "❤️ 감사 한 가지 찾기",
        "🌿 자연을 1분 느끼기"
      ],
      bosTitle: "Reflection Bench",
      bosDescription: "Brain Operating System 질문으로 오늘 무엇이 나를 움직였는지 돌아봅니다.",
      bosQuestions: [
        "오늘 내 뇌를 움직이고 있던 것은 무엇이었나요?",
        "나는 무엇을 다시 선택할 수 있나요?",
        "지금 나는 나의 주인으로 돌아와 있나요?"
      ],
      bosPlaceholder: "한 문장만 적어도 충분합니다.",
      coexistenceTitle: "Human Connection",
      coexistenceDescription:
        "회복은 혼자 끝나지 않습니다. 작은 친절과 연결이 공생 문화의 시작이 됩니다.",
      coexistenceAction: "누군가에게 짧아도 따뜻한 한마디를 전하기",
      coexistenceDone: "오늘의 작은 공생 액션을 기억해두었습니다.",
      communityPulse: "오늘도, 12명이 여기서 함께 숨을 돌렸습니다.",
      founderTitle: "Wisdom Tree",
      founderDescription:
        "45년의 실천이 전하는 핵심은, 사람은 언제든 다시 회복하고 깨어날 수 있다는 희망입니다.",
      founderWisdoms: [
        "작은 실천이 삶의 리듬을 바꾸는 힘이 됩니다.",
        "AI 시대일수록 인간의 따뜻함이 미래를 결정합니다.",
        "함께 깨어나는 문화는 한 사람의 조용한 실천에서 시작됩니다."
      ],
      readDeeper: "Deep Forest 열기"
    },
    forest: {
      eyebrow: "1-Minute Recovery Forest",
      title: "오늘이 무겁다면, 1분이면 충분합니다.",
      description:
        "이곳은 하나씩 조용히 시도할 수 있는 작은 회복의 길입니다. 콘텐츠가 아니라 오늘의 나에게 돌아오기 위한 짧은 의식처럼 사용해보세요.",
      startLabel: "시작하기",
      soundOn: "자연음 ON",
      soundOff: "자연음 OFF",
      openDeepForest: "조용한 깊이로",
      completionTitle: "다시 돌아와줘서 고맙습니다.",
      completionBody: "1분이라도, 다시 돌아온 것에는 분명한 의미가 있습니다.",
      completionQuestion: "지금은 어떤가요?",
      done: "완료",
      seeTomorrow: "내일도 다시 돌아오세요.",
      completionMessages: [
        "1분은 작아 보여도 분명한 회복입니다.",
        "지금 당신은 다시 자신의 자리로 돌아왔습니다.",
        "서두르지 않아도, 이 1분은 몸에 남습니다."
      ],
      cards: [
        { key: "meditation", emoji: "🌿", title: "1분 명상", description: "호흡과 고요로 부드럽게 돌아오기", instruction: "등을 편안히 두고, 숨이 나가는 느낌만 조용히 따라가 보세요." },
        { key: "breathing", emoji: "💨", title: "1분 호흡", description: "길게 내쉬며 신경을 정돈하기", instruction: "들이쉬는 것보다 내쉬는 숨을 조금 더 길게 해보세요." },
        { key: "brainWave", emoji: "🧠", title: "1분 뇌파 진동", description: "안쪽 리듬을 가볍게 흔들기", instruction: "이마와 머리 안쪽이 부드럽게 풀리는 이미지를 그려보세요." },
        { key: "strength", emoji: "💪", title: "1분 체력 깨우기", description: "몸을 살짝 깨워 다시 서기", instruction: "가슴과 어깨를 가볍게 열며 몸이 깨어나는 감각을 느껴보세요." },
        { key: "pause", emoji: "🛑", title: "1분 멈춤", description: "아무것도 하지 않는 힘 가지기", instruction: "지금은 바꾸려 하지 않고, 이 상태 그대로를 한 호흡만 허용해봅니다." },
        { key: "belly", emoji: "☀️", title: "1분 배 힐링", description: "배를 풀어 안정을 되찾기", instruction: "배 위에 손을 올리고, 따뜻함이 천천히 퍼지는 느낌을 상상해보세요." },
        { key: "sleep", emoji: "🌙", title: "1분 수면 준비", description: "잠들기 전 긴장을 풀기", instruction: "턱과 어깨 힘을 풀고, 이제 쉬어도 된다고 몸에 말해보세요." },
        { key: "smile", emoji: "🙂", title: "1분 스마일 활성", description: "표정 근육으로 기분을 회복하기", instruction: "입꼬리를 아주 조금 올리며 표정으로부터 마음을 맞이해봅니다." },
        { key: "temperature", emoji: "💧", title: "1분 온도 리셋", description: "온도 감각으로 상태 전환하기", instruction: "물이나 공기의 감각을 떠올리며 몸이 바뀔 여지를 만들어보세요." }
      ]
    },
    debug: {
      title: "연결 확인",
      supabaseUrl: "Supabase URL",
      anonKey: "Anon key",
      serverApi: "Server API result",
      authDebug: "Auth debug API",
      origin: "Current origin",
      lastError: "Last error",
      yes: "yes",
      no: "no",
      none: "none"
    }
  },
  en: {
    badge: "Member Entrance",
    title: "Welcome back. Let’s begin with today’s one minute.",
    description:
      "This is a calm doorway you can return to after payment without pressure. Choose the next step that fits today: one minute, the 7-day rhythm, or LINE support.",
    actions: {
      minute: "Start today's minute",
      rhythm: "See the 7-day rhythm",
      line: "Get support on LINE",
      login: "Log in",
      dashboard: "Continue as a member",
      myProgram: "Open my program",
      community: "See the shared path"
    },
    lineNote: "Paid members can always receive gentle support through LINE first.",
    fallback:
      "We are still tuning the login flow. If you have already paid, you can receive support through LINE.",
    supportCta: "I already paid. Check on LINE",
    loginTitle: "Receive a magic login link by email",
    loginDescription:
      "We will send a magic link to the email address you used so you can return to your member page.",
    emailPlaceholder: "you@example.com",
    emailLabel: "Email address",
    submit: "Send login link",
    submitLoading: "Sending...",
    sentMessage: "Login link sent. Please check your email.",
    errorMessage:
      "We could not send the login link. Please try again in a moment.",
    unavailableMessage:
      "Login is not available right now, but LINE support can guide you to your next step.",
    loggedIn: "You are already logged in. You can quietly continue from here.",
    inboxHelp:
      "If the email does not arrive, please check your spam folder. If it still does not appear, LINE support can help.",
    invalidEmail: "Please enter a valid email address.",
    sentBox:
      "Login link sent. Please check your email. Please also check your spam folder.",
    loggedInBox: "You are logged in. Start with today’s one minute.",
    planLabel: "Current layer",
    planLabels: {
      free: "Free",
      basic: "Basic / Life Rhythm",
      growth: "Growth / Brain Owner",
      inner_circle: "Inner Circle / Coexistence Circle"
    },
    membershipPanel: {
      eyebrow: "Billing & Membership",
      title: "Current membership",
      currentPlan: "Current plan",
      subscriptionStatus: "Subscription status",
      nextBillingDate: "Next billing date",
      manage: "Manage Membership",
      loading: "Opening...",
      unavailable: "Self-service membership management is being prepared",
      error: "We could not open the Stripe Customer Portal. Please try again in a moment.",
      noBillingDate: "Not scheduled",
      noStatus: "Unknown"
    },
    dashboard: {
      eyebrow: "Daily Life OS",
      title: "Welcome back. You can breathe here again today.",
      description:
        "Even if today feels heavy, one minute is enough. This is a quiet place where recovery can become daily rhythm, brain ownership, and gentle coexistence.",
      planFocus: {
        free: "Today’s recovery practice",
        basic: "Today’s Life Rhythm practice",
        growth: "Today’s Brain Owner practice",
        inner_circle: "Today’s Coexistence Circle practice"
      },
      journeyTitle: "Today’s small path",
      journeySteps: ["1-minute recovery", "daily rhythm", "brain ownership", "coexistence", "civilization"],
      stateTitle: "Welcome Space",
      stateDescription: "Choose the state that feels closest right now. One tap can take you straight into a one-minute ritual.",
      stateTapHint: "Tap once and begin",
      states: [
        {
          key: "overwhelmed",
          label: "😰 Overwhelmed",
          support: "Start with a one-minute breathing reset and let the inner speed slow down a little."
        },
        {
          key: "exhausted",
          label: "😴 Exhausted",
          support: "A light body activation may be a kinder starting point than trying harder right now."
        },
        {
          key: "unstable",
          label: "🌊 Emotionally unstable",
          support: "Instead of suppressing the wave, try a short reflection and let the feeling be seen."
        },
        {
          key: "stressed",
          label: "🔥 Stressed",
          support: "A temperature reset or a brief movement break may help shift your state from the body outward."
        },
        {
          key: "okay",
          label: "🙂 Okay",
          support: "A quiet minute and one gratitude can help steady today’s rhythm."
        },
        {
          key: "energized",
          label: "✨ Energized",
          support: "Let this good energy spread beyond you through a small act of warmth."
        }
      ],
      recoveryTitle: "Today’s 1-minute recovery",
      recoveryDescription: "Start with the gentlest recovery point for your current state.",
      recoveryCta: "Start 1-minute recovery",
      recoveryOptions: {
        overwhelmed: "1-minute breathing reset",
        exhausted: "Body activation",
        unstable: "Short emotional reflection",
        stressed: "Temperature reset",
        okay: "1-minute gratitude rhythm",
        energized: "Smile Muscle Activation"
      },
      rhythmTitle: "Rhythm Garden",
      rhythmDescription:
        "Not a measure of perfection, but a quiet way to see how often you returned to yourself today.",
      rhythmScoreLabel: "Today’s score",
      rhythmItems: [
        "☀ Wake up the body",
        "🙂 Smile Muscle",
        "🧠 Mind Ownership",
        "❤️ Find one gratitude",
        "🌿 Feel nature for one minute"
      ],
      bosTitle: "Reflection Bench",
      bosDescription:
        "Use the Brain Operating System questions to notice what guided your mind today.",
      bosQuestions: [
        "What was controlling my brain today?",
        "What can I choose again now?",
        "Am I returning as the owner of my mind?"
      ],
      bosPlaceholder: "Even one short sentence is enough.",
      coexistenceTitle: "Human Connection",
      coexistenceDescription:
        "Recovery does not end with the self. A small act of warmth can begin coexistence.",
      coexistenceAction: "Send one short but warm message to someone today",
      coexistenceDone: "Today’s small coexistence action is now in motion.",
      communityPulse: "Today, 12 people breathed here too.",
      founderTitle: "Wisdom Tree",
      founderDescription:
        "Forty-five years of practice point to one hopeful truth: people can recover, awaken, and begin again.",
      founderWisdoms: [
        "Small daily actions can change the rhythm of a life.",
        "In the AI era, human warmth will matter even more.",
        "A culture of awakening together begins with one quiet practice."
      ],
      readDeeper: "Open Deep Forest"
    },
    forest: {
      eyebrow: "1-Minute Recovery Forest",
      title: "If today feels heavy, one minute is enough.",
      description:
        "These are small recovery paths you can enter quietly. Treat them not as content, but as tiny rituals for coming back to yourself today.",
      startLabel: "Start",
      soundOn: "Nature sound ON",
      soundOff: "Nature sound OFF",
      openDeepForest: "Toward deeper quiet",
      completionTitle: "Thank you for coming back.",
      completionBody: "Even one minute matters. Coming back matters.",
      completionQuestion: "How do you feel now?",
      done: "Done",
      seeTomorrow: "See you tomorrow.",
      completionMessages: [
        "One minute can still be real recovery.",
        "You came back to yourself just now.",
        "This minute stays with you, even if the day is still unfinished."
      ],
      cards: [
        { key: "meditation", emoji: "🌿", title: "1-Minute Meditation", description: "Return gently to breath and stillness", instruction: "Let your shoulders soften and simply notice the breath leaving your body." },
        { key: "breathing", emoji: "💨", title: "1-Minute Breathing", description: "Long exhales to settle the system", instruction: "Let the exhale be just a little longer than the inhale." },
        { key: "brainWave", emoji: "🧠", title: "1-Minute Brain Wave Vibration", description: "Lightly awaken the inner rhythm", instruction: "Imagine a subtle vibration of clarity spreading behind the forehead." },
        { key: "strength", emoji: "💪", title: "1-Minute Strength Activation", description: "Wake the body and stand up again", instruction: "Open the chest slightly and feel the body waking up from the inside." },
        { key: "pause", emoji: "🛑", title: "1-Minute Pause", description: "Practice the courage to stop", instruction: "For this minute, allow yourself not to fix anything." },
        { key: "belly", emoji: "☀️", title: "1-Minute Belly Healing", description: "Soften the belly and restore ease", instruction: "Rest a hand on the belly and imagine warmth gathering there." },
        { key: "sleep", emoji: "🌙", title: "1-Minute Sleep Preparation", description: "Release tension before rest", instruction: "Relax the jaw and shoulders and let the body know it can rest." },
        { key: "smile", emoji: "🙂", title: "Smile Activation", description: "Use facial warmth to shift the mood", instruction: "Lift the corners of the mouth slightly and let the face lead the feeling." },
        { key: "temperature", emoji: "💧", title: "Temperature Reset", description: "Change your state through sensation", instruction: "Remember the feel of cool water or fresh air and let the body respond." }
      ]
    },
    debug: {
      title: "Connection check",
      supabaseUrl: "Supabase URL",
      anonKey: "Anon key",
      serverApi: "Server API result",
      authDebug: "Auth debug API",
      origin: "Current origin",
      lastError: "Last error",
      yes: "yes",
      no: "no",
      none: "none"
    }
  }
} as const;

export function MemberEntryContent({
  lineUrl,
  debug = false,
  hasSupabaseUrl,
  hasSupabaseAnonKey,
  isLoggedInInitially,
  initialPlan,
  initialEmail,
  membershipSummary
}: MemberEntryContentProps) {
  const copy = useLocaleCopy(memberEntryCopy);
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [email, setEmail] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn] = useState(isLoggedInInitially);
  const [selectedStateKey, setSelectedStateKey] = useState("overwhelmed");
  const [reflectionText, setReflectionText] = useState("");
  const [coexistenceChecked, setCoexistenceChecked] = useState(false);
  const [completedRhythmItems, setCompletedRhythmItems] = useState<number[]>([0, 2]);
  const [activeForestKey, setActiveForestKey] = useState<RecoveryForestKey | null>(null);
  const [forestSecondsLeft, setForestSecondsLeft] = useState(60);
  const [forestRunning, setForestRunning] = useState(false);
  const [forestFinished, setForestFinished] = useState(false);
  const [forestSoundEnabled, setForestSoundEnabled] = useState(false);
  const [lastError, setLastError] = useState("");
  const [lastApiResult, setLastApiResult] = useState("");
  const [apiResponse, setApiResponse] = useState<MagicLinkApiResult | null>(null);
  const [authDebugResponse, setAuthDebugResponse] = useState<AuthDebugResult | null>(null);
  const [currentOrigin, setCurrentOrigin] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");
  const debugEnabled = process.env.NODE_ENV !== "production" || debug;
  const recommendedProgramHref =
    initialPlan === "growth"
      ? "/program/growth"
      : initialPlan === "inner_circle"
        ? "/program/inner"
        : "/program/basic";
  const stateForestMap: Record<string, RecoveryForestKey> = {
    overwhelmed: "breathing",
    exhausted: "strength",
    unstable: "meditation",
    stressed: "temperature",
    okay: "meditation",
    energized: "smile"
  };
  const founderWisdom = copy.dashboard.founderWisdoms[new Date().getDay() % copy.dashboard.founderWisdoms.length];
  const selectedState =
    copy.dashboard.states.find((state) => state.key === selectedStateKey) ?? copy.dashboard.states[0];
  const rhythmScore = Math.round((completedRhythmItems.length / copy.dashboard.rhythmItems.length) * 100);
  const recommendedRecovery = copy.dashboard.recoveryOptions[selectedState.key as keyof typeof copy.dashboard.recoveryOptions];
  const todaysPlanFocus = copy.dashboard.planFocus[initialPlan];
  const activeForestCard = activeForestKey
    ? copy.forest.cards.find((card) => card.key === activeForestKey) ?? null
    : null;
  const completionMessage =
    copy.forest.completionMessages[new Date().getDay() % copy.forest.completionMessages.length];
  const membershipNextBillingDate = membershipSummary.nextBillingDate
    ? new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      }).format(new Date(membershipSummary.nextBillingDate))
    : copy.membershipPanel.noBillingDate;
  const membershipStatusLabel = membershipSummary.subscriptionStatus ?? copy.membershipPanel.noStatus;

  async function handleManageMembership() {
    setPortalLoading(true);
    setPortalError("");

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { session }
      } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
      const accessToken = session?.access_token;
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
        credentials: "include",
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`
            }
          : undefined
      });
      const data = (await response.json()) as CustomerPortalApiResult;

      if (!response.ok || !data.url) {
        setPortalError(data.error || copy.membershipPanel.error);
        setPortalLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Customer portal launch failed", error);
      setPortalError(copy.membershipPanel.error);
      setPortalLoading(false);
    }
  }

  function toggleRhythmItem(index: number) {
    setCompletedRhythmItems((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    );
  }

  function openForestExperience(key: RecoveryForestKey) {
    setActiveForestKey(key);
    setForestSecondsLeft(60);
    setForestRunning(false);
    setForestFinished(false);
  }

  function closeForestExperience() {
    setActiveForestKey(null);
    setForestRunning(false);
    setForestFinished(false);
    setForestSecondsLeft(60);
  }

  useEffect(() => {
    if (!activeForestKey || !forestRunning || forestFinished) {
      return;
    }

    const timer = window.setInterval(() => {
      setForestSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setForestRunning(false);
          setForestFinished(true);

          if (forestSoundEnabled && typeof window !== "undefined") {
            const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

            if (AudioContextClass) {
              const context = new AudioContextClass();
              const oscillator = context.createOscillator();
              const gain = context.createGain();

              oscillator.type = "sine";
              oscillator.frequency.value = 528;
              gain.gain.value = 0.03;

              oscillator.connect(gain);
              gain.connect(context.destination);
              oscillator.start();
              oscillator.stop(context.currentTime + 0.5);
            }
          }

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [activeForestKey, forestFinished, forestRunning, forestSoundEnabled]);

  useEffect(() => {
    setCurrentOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!debugEnabled) {
      return;
    }

    let active = true;

    async function loadAuthDebug() {
      try {
        const response = await fetch("/api/auth-debug");
        const data = (await response.json()) as AuthDebugResult;

        if (!active) {
          return;
        }

        setAuthDebugResponse(data);
      } catch (error) {
        if (!active) {
          return;
        }

        setLastError(error instanceof Error ? error.message : "Unknown error");
      }
    }

    loadAuthDebug();

    return () => {
      active = false;
    };
  }, [debugEnabled]);

  const statusMessage = useMemo(() => {
    if (isLoggedIn) {
      return copy.loggedIn;
    }

    if (authState === "sent") {
      return copy.sentMessage;
    }

    if (authState === "error") {
      return lastError ? `${copy.errorMessage} (${lastError})` : copy.errorMessage;
    }

    if (authState === "unavailable") {
      return copy.unavailableMessage;
    }

    return copy.fallback;
  }, [authState, copy, isLoggedIn, lastError]);

  async function handleMagicLinkSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setLastError(copy.invalidEmail);
      setAuthState("error");
      return;
    }

    if (!hasSupabaseUrl || !hasSupabaseAnonKey) {
      setLastError("Supabase server env unavailable");
      setAuthState("unavailable");
      return;
    }

    setAuthState("sending");
    setLastError("");
    setLastApiResult("");
    setApiResponse(null);

    try {
      const response = await fetch("/api/send-magic-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: normalizedEmail })
      });

      const data = (await response.json()) as MagicLinkApiResult;

      setLastApiResult(data.success ? "success" : "error");
      setApiResponse(data);

      if (!response.ok || !data.success) {
        setLastError(data.error || "Unknown error");
        setAuthState("error");
        return;
      }

      setAuthState("sent");
    } catch (error) {
      console.error("Unexpected magic link error:", error);
      setLastError(error instanceof Error ? error.message : "Unknown error");
      setAuthState("error");
    }
  }

  return (
    <div className="section-shell py-12 sm:py-16">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_22%),linear-gradient(180deg,#0a1716_0%,#0d1824_54%,#08131d_100%)] px-5 py-8 shadow-[0_28px_90px_rgba(7,17,31,0.28)] sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full border border-gold/20 bg-gold/[0.08] px-4 py-2 text-sm font-medium text-gold">
            {copy.badge}
          </div>
          <h1 className="mt-5 font-serif text-3xl leading-tight text-white sm:text-4xl">{copy.title}</h1>
          <p className="mt-4 text-sm leading-8 text-white/74 sm:text-base">{copy.description}</p>
        </div>

        {isLoggedIn ? (
          <div className="mx-auto mt-8 max-w-5xl space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-gold/80">{copy.dashboard.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{copy.dashboard.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">{copy.dashboard.description}</p>
                  <p className="mt-4 text-sm font-medium text-gold/90">{todaysPlanFocus}</p>
                </div>
                <div className="rounded-[24px] border border-gold/20 bg-gold/[0.08] px-4 py-4 text-left">
                  <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.planLabel}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{copy.planLabels[initialPlan]}</p>
                  <p className="mt-2 text-sm text-white/62">{initialEmail || copy.loggedInBox}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/52">{copy.dashboard.communityPulse}</p>
            </div>

            <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.membershipPanel.eyebrow}</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{copy.membershipPanel.title}</h3>
                </div>
                <div className="grid gap-3 text-left sm:grid-cols-3">
                  <div className="rounded-[20px] border border-white/10 bg-[#0a141d] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gold/80">{copy.membershipPanel.currentPlan}</p>
                    <p className="mt-2 text-sm font-medium text-white">{copy.planLabels[membershipSummary.currentPlan]}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-[#0a141d] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gold/80">{copy.membershipPanel.subscriptionStatus}</p>
                    <p className="mt-2 text-sm font-medium text-white">{membershipStatusLabel}</p>
                  </div>
                  <div className="rounded-[20px] border border-white/10 bg-[#0a141d] px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-gold/80">{copy.membershipPanel.nextBillingDate}</p>
                    <p className="mt-2 text-sm font-medium text-white">{membershipNextBillingDate}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleManageMembership}
                  disabled={!membershipSummary.canManageMembership || portalLoading}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-white/38"
                >
                  {portalLoading ? copy.membershipPanel.loading : copy.membershipPanel.manage}
                </button>
                {!membershipSummary.canManageMembership ? (
                  <p className="text-sm text-white/56">{copy.membershipPanel.unavailable}</p>
                ) : null}
              </div>
              {portalError ? <p className="mt-3 text-sm text-[#f3c7b8]">{portalError}</p> : null}
            </section>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.journeyTitle}</p>
                </div>
                <span className="text-xs text-white/48">Life OS</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-5">
                {copy.dashboard.journeySteps.map((step, index) => (
                  <div
                    key={step}
                    className="rounded-[20px] border border-white/10 bg-[#0b1520] px-4 py-3 text-sm text-white/74"
                  >
                    <span className="mr-2 text-gold/80">0{index + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(110,168,120,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.forest.eyebrow}</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">{copy.forest.title}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/68">{copy.forest.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {copy.forest.cards.map((card) => (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => openForestExperience(card.key as RecoveryForestKey)}
                    className="rounded-[24px] border border-white/10 bg-[#0c1720] px-4 py-4 text-left transition duration-300 hover:border-gold/25 hover:bg-white/[0.05]"
                  >
                    <p className="text-lg text-white">{card.emoji}</p>
                    <p className="mt-3 text-base font-semibold text-white">{card.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/60">{card.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <h3 className="text-xl font-semibold text-white">{copy.dashboard.stateTitle}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">{copy.dashboard.stateDescription}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {copy.dashboard.states.map((state) => {
                    const active = selectedState.key === state.key;

                    return (
                      <button
                        key={state.key}
                        type="button"
                        onClick={() => {
                          setSelectedStateKey(state.key);
                          openForestExperience(stateForestMap[state.key]);
                        }}
                        className={`rounded-[22px] border px-4 py-4 text-left text-sm transition duration-300 ${
                          active
                            ? "border-gold/40 bg-gold/[0.10] text-white shadow-[0_14px_30px_rgba(212,186,117,0.08)]"
                            : "border-white/10 bg-[#09131d] text-white/74 hover:bg-white/[0.05]"
                        }`}
                      >
                        <p className="font-medium">{state.label}</p>
                        <p className="mt-2 leading-6 text-white/58">{state.support}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-gold/80">
                          {copy.dashboard.stateTapHint}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[28px] border border-gold/20 bg-[linear-gradient(180deg,rgba(212,186,117,0.12),rgba(255,255,255,0.02))] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.recoveryTitle}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{recommendedRecovery}</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{copy.dashboard.recoveryDescription}</p>
                <p className="mt-4 rounded-[22px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white/78">
                  {selectedState.support}
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <Link
                    href="/#one-minute-meditation"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
                  >
                    {copy.dashboard.recoveryCta}
                  </Link>
                  <Link
                    href={recommendedProgramHref}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
                  >
                    {copy.actions.myProgram}
                  </Link>
                </div>
              </section>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.rhythmTitle}</p>
                    <p className="mt-3 text-sm leading-7 text-white/68">{copy.dashboard.rhythmDescription}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/48">{copy.dashboard.rhythmScoreLabel}</p>
                    <p className="mt-1 text-3xl font-semibold text-white">{rhythmScore}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {copy.dashboard.rhythmItems.map((item, index) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleRhythmItem(index)}
                      className={`rounded-[18px] border px-4 py-3 text-left text-sm transition duration-300 ${
                        completedRhythmItems.includes(index)
                          ? "border-gold/30 bg-gold/[0.10] text-white"
                          : "border-white/10 bg-[#0a141d] text-white/74 hover:bg-white/[0.05]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.bosTitle}</p>
                <p className="mt-3 text-sm leading-7 text-white/68">{copy.dashboard.bosDescription}</p>
                <div className="mt-5 space-y-3">
                  {copy.dashboard.bosQuestions.map((question) => (
                    <div key={question} className="rounded-[18px] border border-white/10 bg-[#0a141d] px-4 py-4 text-sm leading-7 text-white/78">
                      {question}
                    </div>
                  ))}
                </div>
                <textarea
                  value={reflectionText}
                  onChange={(event) => setReflectionText(event.target.value)}
                  placeholder={copy.dashboard.bosPlaceholder}
                  className="mt-4 min-h-[116px] w-full rounded-[22px] border border-white/10 bg-[#09131d] px-4 py-4 text-sm leading-7 text-white outline-none transition duration-300 placeholder:text-white/28 focus:border-gold/40"
                />
              </section>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.coexistenceTitle}</p>
                <p className="mt-3 text-sm leading-7 text-white/68">{copy.dashboard.coexistenceDescription}</p>
                <div className="mt-5 rounded-[22px] border border-gold/20 bg-gold/[0.08] px-4 py-4 text-sm leading-7 text-white/86">
                  {copy.dashboard.coexistenceAction}
                </div>
                {coexistenceChecked ? (
                  <p className="mt-3 text-sm text-gold/90">{copy.dashboard.coexistenceDone}</p>
                ) : null}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setCoexistenceChecked(true)}
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
                  >
                    {copy.dashboard.coexistenceAction}
                  </button>
                  <Link
                    href="/community"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
                  >
                    {copy.actions.community}
                  </Link>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(212,186,117,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.dashboard.founderTitle}</p>
                <p className="mt-3 text-sm leading-7 text-white/68">{copy.dashboard.founderDescription}</p>
                <blockquote className="mt-5 rounded-[22px] border border-white/10 bg-black/15 px-4 py-4 text-base leading-8 text-white/86">
                  {founderWisdom}
                </blockquote>
                <Link
                  href="/brain-education"
                  className="mt-5 inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
                >
                  {copy.dashboard.readDeeper}
                </Link>
              </section>
            </div>
          </div>
        ) : null}

        <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
          <Link
            href="/#one-minute-meditation"
            className="relative z-20 inline-flex min-h-[60px] items-center justify-center rounded-[24px] bg-gold px-5 py-4 text-center text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
          >
            {copy.actions.minute}
          </Link>
          <Link
            href="/#rhythm-challenge"
            className="relative z-20 inline-flex min-h-[60px] items-center justify-center rounded-[24px] border border-white/12 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
          >
            {copy.actions.rhythm}
          </Link>
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-20 inline-flex min-h-[60px] items-center justify-center rounded-[24px] border border-gold/20 bg-gold/[0.08] px-5 py-4 text-center text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
          >
            {copy.actions.line}
          </a>
          {isLoggedIn ? (
            <Link
              href={recommendedProgramHref}
              className="relative z-20 inline-flex min-h-[60px] items-center justify-center rounded-[24px] border border-white/12 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
            >
              {copy.actions.dashboard}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogin((current) => !current)}
              className="relative z-20 inline-flex min-h-[60px] cursor-pointer items-center justify-center rounded-[24px] border border-white/12 bg-white/[0.04] px-5 py-4 text-center text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
            >
              {copy.actions.login}
            </button>
          )}
        </div>

        <div className="mx-auto mt-4 max-w-4xl rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm leading-7 text-white/78">{statusMessage}</p>
          <p className="mt-2 text-sm leading-7 text-white/60">{copy.lineNote}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-gold/20 bg-gold/[0.08] px-5 py-3 text-sm font-semibold text-gold transition duration-300 hover:bg-gold/[0.12]"
            >
              {copy.supportCta}
            </a>
            {isLoggedIn ? (
              <Link
                href={recommendedProgramHref}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
              >
                {copy.actions.dashboard}
              </Link>
            ) : null}
          </div>
        </div>

        {!isLoggedIn && showLogin ? (
          <div className="mx-auto mt-5 max-w-4xl rounded-[24px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-white">{copy.loginTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{copy.loginDescription}</p>
            <form onSubmit={handleMagicLinkSubmit} className="mt-5">
              <label className="block">
                <span className="text-sm font-medium text-white/78">{copy.emailLabel}</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="mt-2 min-h-[52px] w-full rounded-2xl border border-white/12 bg-[#09131d] px-4 py-3 text-base text-white outline-none transition duration-300 placeholder:text-white/28 focus:border-gold/40"
                />
              </label>
              {authState === "sent" ? (
                <div className="mt-4 rounded-2xl border border-emerald-300/18 bg-emerald-400/[0.08] px-4 py-4 text-sm leading-7 text-emerald-100">
                  {copy.sentBox}
                </div>
              ) : null}
              {authState === "error" ? (
                <div className="mt-4 rounded-2xl border border-rose-300/18 bg-rose-400/[0.08] px-4 py-4 text-sm leading-7 text-rose-100">
                  {lastError || copy.errorMessage}
                </div>
              ) : null}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={authState === "sending"}
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {authState === "sending" ? copy.submitLoading : copy.submit}
                </button>
                <a
                  href={lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
                >
                  {copy.supportCta}
                </a>
              </div>
            </form>
            {apiResponse ? (
              <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-[#07111a] p-3 text-xs leading-6 text-white/72">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            ) : null}
            <p className="mt-4 text-sm leading-7 text-white/56">{copy.inboxHelp}</p>
            {debugEnabled ? (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4 text-left text-sm text-white/66">
                <p className="font-semibold text-white/84">{copy.debug.title}</p>
                <dl className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.supabaseUrl}</dt>
                    <dd>{hasSupabaseUrl ? copy.debug.yes : copy.debug.no}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.anonKey}</dt>
                    <dd>{hasSupabaseAnonKey ? copy.debug.yes : copy.debug.no}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.serverApi}</dt>
                    <dd>{lastApiResult || copy.debug.none}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.origin}</dt>
                    <dd className="max-w-[60%] truncate text-right">{currentOrigin || copy.debug.none}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.authDebug}</dt>
                    <dd className="max-w-[60%] truncate text-right">
                      {authDebugResponse ? JSON.stringify(authDebugResponse) : copy.debug.none}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt>{copy.debug.lastError}</dt>
                    <dd className="max-w-[60%] truncate text-right">{lastError || copy.debug.none}</dd>
                  </div>
                </dl>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {activeForestKey ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071018]/80 px-4 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(120,168,134,0.18),transparent_26%),linear-gradient(180deg,#0a1716_0%,#0d1824_58%,#09131d_100%)] p-6 shadow-[0_28px_90px_rgba(7,17,31,0.4)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">{copy.forest.eyebrow}</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {copy.forest.cards.find((card) => card.key === activeForestKey)?.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForestExperience}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/[0.08]"
                aria-label={copy.forest.done}
              >
                ×
              </button>
            </div>

              <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(140,180,150,0.16),rgba(8,17,26,0.18))] px-5 py-8 text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-gold/20 bg-black/15 text-4xl font-semibold text-white">
                  {forestSecondsLeft}
                </div>
                <p className="mt-5 text-sm leading-7 text-white/72">
                  {activeForestCard?.description}
                </p>
                <p className="mt-3 rounded-[20px] border border-white/10 bg-black/10 px-4 py-4 text-sm leading-7 text-white/78">
                  {activeForestCard?.instruction}
                </p>
              </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  if (forestFinished) {
                    setForestFinished(false);
                    setForestSecondsLeft(60);
                  }
                  setForestRunning((current) => !current);
                }}
                className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
              >
                {forestFinished ? copy.forest.startLabel : forestRunning ? copy.forest.done : copy.forest.startLabel}
              </button>
              <button
                type="button"
                onClick={() => setForestSoundEnabled((current) => !current)}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.08]"
              >
                {forestSoundEnabled ? copy.forest.soundOn : copy.forest.soundOff}
              </button>
            </div>

            {forestFinished ? (
              <div className="mt-5 rounded-[24px] border border-gold/20 bg-gold/[0.08] px-5 py-5">
                <p className="text-lg font-semibold text-white">{copy.forest.completionTitle}</p>
                <p className="mt-3 text-sm leading-7 text-white/74">{copy.forest.completionBody}</p>
                <p className="mt-3 text-sm leading-7 text-white/70">{completionMessage}</p>
                <p className="mt-3 text-sm text-gold/90">{copy.forest.completionQuestion}</p>
                <p className="mt-2 text-sm text-white/56">{copy.forest.seeTomorrow}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
