"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { useLanguage } from "@/lib/i18n";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type MemberState = "guest" | "free" | "paid";

const journeyCopy = {
  jp: {
    eyebrow: "脳を整える旅",
    title: "脳を整える旅",
    description:
      "脳教育（Brain Education）の哲学をもとに、自分自身の感覚と意識をゆっくり育てていきます。",
    badge: {
      guest: "Guest",
      free: "Free Member",
      paid: "Brain Owner"
    },
    freeNote: "無料会員は最初の入口を体験できます。すべてのステップは有料メンバー向けに開かれます。",
    cta: {
      open: "体験する",
      upgrade: "アップグレード",
      member: "メンバーで開く"
    },
    steps: [
      {
        title: "脳感覚を目覚めさせる",
        description: "呼吸と身体感覚を通して、情報より先に自分の感覚へ戻ります。"
      },
      {
        title: "脳柔軟化",
        description: "固まった反応をゆるめ、今この瞬間を選び直す余白を育てます。"
      },
      {
        title: "脳浄化",
        description: "疲れた思考を静かに手放し、心と身体の流れを整えていきます。"
      },
      {
        title: "脳統合",
        description: "感情、思考、身体の感覚を分けずにひとつのリズムとして結びます。"
      },
      {
        title: "脳の主人になる",
        description: "AI時代の中でも、自分の中心から選び、共生の方向へ生きる力を育てます。"
      }
    ]
  },
  kr: {
    eyebrow: "뇌를 정돈하는 여정",
    title: "뇌를 정돈하는 여정",
    description:
      "뇌교육(Brain Education)의 철학을 바탕으로, 자신의 감각과 의식을 천천히 길러갑니다.",
    badge: {
      guest: "Guest",
      free: "Free Member",
      paid: "Brain Owner"
    },
    freeNote: "무료 회원은 첫 입구를 체험할 수 있습니다. 모든 단계는 유료 멤버에게 열립니다.",
    cta: {
      open: "체험하기",
      upgrade: "업그레이드",
      member: "멤버로 열기"
    },
    steps: [
      {
        title: "뇌감각 깨우기",
        description: "호흡과 몸의 감각을 통해, 정보보다 먼저 나의 감각으로 돌아옵니다."
      },
      {
        title: "뇌 유연화",
        description: "굳은 반응을 풀고 지금 이 순간을 다시 선택할 여유를 키웁니다."
      },
      {
        title: "뇌 정화",
        description: "지친 생각을 조용히 내려놓고, 마음과 몸의 흐름을 정돈합니다."
      },
      {
        title: "뇌 통합",
        description: "감정과 생각, 몸의 감각을 나누지 않고 하나의 리듬으로 연결합니다."
      },
      {
        title: "뇌의 주인 되기",
        description: "AI 시대에도 자신의 중심에서 선택하고, 공생의 방향으로 살아갈 힘을 키웁니다."
      }
    ]
  },
  en: {
    eyebrow: "Brain Education Journey",
    title: "A Journey to Settle the Brain",
    description:
      "Grounded in the philosophy of Brain Education, this journey helps you gently grow your own sensing, awareness, and inner balance.",
    badge: {
      guest: "Guest",
      free: "Free Member",
      paid: "Brain Owner"
    },
    freeNote: "Free members can open the first doorway. The full journey is available to paid members.",
    cta: {
      open: "Explore",
      upgrade: "Upgrade",
      member: "Open as member"
    },
    steps: [
      {
        title: "Awaken Brain Sense",
        description: "Return to your own sensing body before you are pulled by information."
      },
      {
        title: "Brain Flexibility",
        description: "Loosen fixed reactions and create space to choose the present again."
      },
      {
        title: "Brain Purification",
        description: "Release tired thought patterns and clear the inner flow of mind and body."
      },
      {
        title: "Brain Integration",
        description: "Bring thought, feeling, and body back into one living rhythm."
      },
      {
        title: "Brain Ownership",
        description: "Live from your center and choose coexistence even in the AI era."
      }
    ]
  }
} as const;

const stepRoutes = ["/meditation", "/brain-education", "/premium", "/premium", "/premium"] as const;

export function BrainOwnershipJourney() {
  const { language } = useLanguage();
  const copy = journeyCopy[language];
  const [memberState, setMemberState] = useState<MemberState>("guest");

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
        .select("status")
        .eq("user_id", session.user.id)
        .in("status", ["active", "trialing"])
        .limit(1)
        .maybeSingle();

      if (!active) {
        return;
      }

      setMemberState(membership ? "paid" : "free");
    }

    loadMembership();

    return () => {
      active = false;
    };
  }, []);

  const memberBadge = useMemo(() => copy.badge[memberState], [copy.badge, memberState]);

  return (
    <section className="section-shell mt-24">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-gold/20 bg-gold/[0.08] px-4 py-2 text-sm text-gold/90">{memberBadge}</span>
        <p className="max-w-3xl text-sm leading-7 text-white/62">{copy.freeNote}</p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-5">
        {copy.steps.map((step, index) => {
          const unlocked = memberState === "paid" || index < 2;
          const href = unlocked ? stepRoutes[index] : memberState === "guest" ? "/login" : "/pricing";
          const buttonLabel = unlocked ? copy.cta.open : memberState === "guest" ? copy.cta.member : copy.cta.upgrade;

          return (
            <article
              key={step.title}
              className={`flex h-full flex-col rounded-[28px] border p-5 transition duration-300 ${
                unlocked
                  ? "border-white/10 bg-white/[0.04] hover:-translate-y-0.5 hover:bg-white/[0.06]"
                  : "border-white/8 bg-white/[0.025] text-white/76"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-gold/80">0{index + 1}</p>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/54">
                  {unlocked ? "Open" : copy.badge.free}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
              <p className={`mt-3 text-sm leading-7 ${unlocked ? "text-white/70" : "text-white/56"}`}>{step.description}</p>
              <div className="mt-auto pt-6">
                <Link
                  href={href}
                  className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold transition duration-300 ${
                    unlocked
                      ? "bg-gold text-ink hover:bg-[#e7cd92]"
                      : "border border-white/10 bg-white/[0.03] text-white/82 hover:bg-white/[0.06]"
                  }`}
                >
                  {buttonLabel}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
