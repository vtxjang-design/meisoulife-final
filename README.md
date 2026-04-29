# 瞑想life

Japan-first 명상 멤버십 플랫폼입니다.

기술 스택:

```text
Next.js App Router
TypeScript
Tailwind CSS
Supabase
Stripe
OpenAI API
Vercel
```

주요 라우트:

```text
/            홈
/challenge   무료 7일 챌린지
/coach       AI 명상 코치
/pricing     유료 플랜
/community   LINE 커뮤니티
/dashboard   회원 대시보드
/login       로그인
/signup      회원가입
/retreats    글로벌 리트릿
/admin       관리자 화면
```

## 실행 방법

```bash
cd /Users/taeksujang/Documents/Codex/2026-04-18-40-60-1-2-3-4
npm install
npm run dev
```

브라우저:

```text
http://localhost:3000
```

## 빌드 확인

```bash
npm run build
```

## 환경변수

필수 예시는 [.env.example](/Users/taeksujang/Documents/Codex/2026-04-18-40-60-1-2-3-4/.env.example)에 있습니다.

핵심 항목:

```text
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_SITE_URL
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

추가 연결:

```text
STRIPE_PRICE_BASIC
STRIPE_PRICE_LEADER
STRIPE_PRICE_PREMIUM
NEXT_PUBLIC_STRIPE_BASIC_CHECKOUT_URL
LINE_FREE_INVITE_URL
LINE_MEMBER_INVITE_URL
LINE_LEADER_INVITE_URL
NEXT_PUBLIC_WELCOME_MEMBER_COMMUNITY_URL
NEXT_PUBLIC_WELCOME_MEMBER_MEDITATION_URL
NEXT_PUBLIC_WELCOME_MEMBER_AUDIO_URL
CRON_SECRET
```

플랜 표시 이름 매핑:

```text
Basic        -> STRIPE_PRICE_BASIC
Growth       -> STRIPE_PRICE_LEADER
Inner Circle -> STRIPE_PRICE_PREMIUM
```

LINE 링크 매핑:

```text
LINE_FREE_INVITE_URL    -> 무료 참여 버튼
LINE_MEMBER_INVITE_URL  -> 유료 멤버 초대 링크
LINE_LEADER_INVITE_URL  -> 리더 초대 링크
```

Basic Stripe 링크:

```text
NEXT_PUBLIC_STRIPE_BASIC_CHECKOUT_URL -> メンバーになる / 今すぐ始める / Basic CTA
```

멤버 환영 페이지 링크:

```text
NEXT_PUBLIC_WELCOME_MEMBER_COMMUNITY_URL  -> LINEメンバーコミュニティ参加
NEXT_PUBLIC_WELCOME_MEMBER_MEDITATION_URL -> 1分瞑想スタート
NEXT_PUBLIC_WELCOME_MEMBER_AUDIO_URL      -> 音声ガイドを受け取る
```

## 데이터베이스

Supabase 테이블/정책 초안:

[schema.sql](/Users/taeksujang/Documents/Codex/2026-04-18-40-60-1-2-3-4/supabase/schema.sql)

포함 테이블:

```text
users
subscriptions
challenge_progress
coach_messages
events
community_activity
leader_candidates
```

## 배포

Vercel 배포 순서는 아래 문서를 보면 됩니다.

[DEPLOY.md](/Users/taeksujang/Documents/Codex/2026-04-18-40-60-1-2-3-4/DEPLOY.md)
