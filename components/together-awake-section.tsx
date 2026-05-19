"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { useLanguage } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const sectionCopy = {
  jp: {
    eyebrow: "共に整う仲間",
    title: "競争ではなく、共に成長する場所。",
    description:
      "瞑想lifeは、一人で整うだけで終わらないための場です。感謝、共生行動、自然とのつながりを、静かな日常の中で少しずつ育てていきます。",
    prompts: [
      "今日は誰かに感謝を伝えましたか？",
      "今日は自然を1分感じましたか？",
      "今日は情報ではなく、中心を選びましたか？",
      "今日は誰かを励ます一言を持てましたか？"
    ],
    freeLabel: "無料会員",
    freeText: "今日の問いを静かに眺め、自分のリズムに戻る入口として使えます。",
    paidLabel: "有料会員",
    paidText: "Daily Quest や記録を残しながら、共生の実践を生活の中に育てていけます。",
    primary: "Daily Quest を見る",
    secondary: "料金を見る"
  },
  kr: {
    eyebrow: "함께 정돈하는 동료",
    title: "경쟁이 아니라, 함께 성장하는 곳.",
    description:
      "瞑想life는 혼자 정돈하는 데서 끝나지 않도록 돕는 자리입니다. 감사, 공생 행동, 자연과의 연결을 조용한 일상 속에서 조금씩 키워갑니다.",
    prompts: [
      "오늘 누군가에게 감사를 전했나요?",
      "오늘 자연을 1분 느껴보았나요?",
      "오늘 정보보다 중심을 선택했나요?",
      "오늘 누군가를 응원하는 한마디가 있었나요?"
    ],
    freeLabel: "무료 회원",
    freeText: "오늘의 질문을 조용히 바라보며, 나의 리듬으로 돌아오는 입구로 사용할 수 있습니다.",
    paidLabel: "유료 회원",
    paidText: "Daily Quest와 기록을 남기며 공생의 실천을 생활 속에 길러갈 수 있습니다.",
    primary: "Daily Quest 보기",
    secondary: "요금 보기"
  },
  en: {
    eyebrow: "Together in Rhythm",
    title: "A place to grow together, not compete.",
    description:
      "Meisoulife is not only about calming yourself alone. It is a place to grow gratitude, coexistence, and connection with nature in the middle of everyday life.",
    prompts: [
      "Did you share gratitude with someone today?",
      "Did you feel nature for one quiet minute today?",
      "Did you choose your center over the information stream today?",
      "Did you offer encouragement to someone today?"
    ],
    freeLabel: "Free members",
    freeText: "Use today’s questions as a quiet doorway back to yourself.",
    paidLabel: "Paid members",
    paidText: "Keep Daily Quest notes and grow coexistence practice as part of everyday life.",
    primary: "Open Daily Quest",
    secondary: "See pricing"
  }
} as const;

export function TogetherAwakeSection() {
  const { language } = useLanguage();
  const copy = sectionCopy[language];
  const [hasPaidMembership, setHasPaidMembership] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMembership() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        return;
      }

      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (!active || !session?.user) {
        return;
      }

      const { data: membership } = await supabase
        .from("memberships")
        .select("subscription_status")
        .eq("user_id", session.user.id)
        .in("subscription_status", ["active", "trialing"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (active && membership) {
        setHasPaidMembership(true);
      }
    }

    loadMembership();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section-shell mt-24">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {copy.prompts.map((prompt) => (
            <article key={prompt} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm leading-7 text-white/76">{prompt}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4">
          <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/82">{copy.freeLabel}</p>
            <p className="mt-4 text-sm leading-7 text-white/70">{copy.freeText}</p>
          </article>
          <article className="rounded-[28px] border border-gold/20 bg-gold/[0.08] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-gold/82">{copy.paidLabel}</p>
            <p className="mt-4 text-sm leading-7 text-white/78">{copy.paidText}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={hasPaidMembership ? "/premium" : "/pricing"}
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition duration-300 hover:bg-[#e7cd92]"
              >
                {copy.primary}
              </Link>
              <Link
                href="/pricing"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-white/[0.06]"
              >
                {copy.secondary}
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
