# 瞑想life 배포 가이드

이 프로젝트는 Next.js App Router 기반입니다.

## 1. 로컬 확인

```bash
cd /Users/taeksujang/Documents/Codex/2026-04-18-40-60-1-2-3-4
npm install
npm run dev
```

개발 주소 예시:

```text
http://YOUR_LOCAL_DEV_URL:3000
```

## 2. 빌드 확인

```bash
npm run build
```

## 3. Vercel 배포

```bash
npx vercel login
npx vercel
npx vercel --prod
```

## 4. Vercel 환경변수

아래 값을 Vercel Project Settings > Environment Variables 에 넣습니다.

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_BASIC=
STRIPE_PRICE_LEADER=
STRIPE_PRICE_PREMIUM=

NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

LINE_FREE_INVITE_URL=
LINE_MEMBER_INVITE_URL=
LINE_LEADER_INVITE_URL=

CRON_SECRET=
```

CTA 및 링크 연결:

```text
無料参加            -> /challenge 또는 LINE_FREE_INVITE_URL
メンバーになる      -> /pricing, /signup, LINE_MEMBER_INVITE_URL
今すぐ始める        -> /challenge
リーダー招待リンク  -> LINE_LEADER_INVITE_URL
```

## 5. Stripe 상품

Stripe Test Mode 기준:

```text
Basic        ¥1,000 / month
Growth       ¥3,000 / month
Inner Circle ¥10,000 / month
```

각 Price ID를 아래 환경변수에 연결합니다.

```text
STRIPE_PRICE_BASIC      -> Basic
STRIPE_PRICE_LEADER     -> Growth
STRIPE_PRICE_PREMIUM    -> Inner Circle
```

## 6. Stripe Webhook

Webhook URL:

```text
https://your-project.vercel.app/api/stripe/webhook
```

추천 이벤트:

```text
checkout.session.completed
invoice.payment_failed
invoice.payment_succeeded
customer.subscription.deleted
```

## 7. Supabase 적용 순서

1. 새 Supabase 프로젝트 생성
2. [schema.sql](/Users/taeksujang/Documents/Codex/2026-04-18-40-60-1-2-3-4/supabase/schema.sql) 실행
3. `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 입력
4. Auth Email/Password 활성화
5. 필요 시 RLS 정책 세부 조정

## 8. Vercel Cron

이 프로젝트는 아래 자동화 엔드포인트를 포함합니다.

```text
/api/cron/challenge-reminders
/api/cron/inactive-users
/api/cron/weekly-report
/api/cron/leader-scan
```

스케줄은 [vercel.json](/Users/taeksujang/Documents/Codex/2026-04-18-40-60-1-2-3-4/vercel.json)에 정의되어 있습니다.
