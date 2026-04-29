# Stripe Test Mode 연결 순서

## 1. 상품 3개 만들기

```text
Basic        ¥1,000 / month
Growth       ¥3,000 / month
Inner Circle ¥10,000 / month
```

## 2. Price ID 복사

```text
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_LEADER=price_...      # Growth
STRIPE_PRICE_PREMIUM=price_...     # Inner Circle
```

## 3. Secret Key 복사

```text
STRIPE_SECRET_KEY=sk_test_...
```

## 4. Vercel 환경변수 입력

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_BASIC
STRIPE_PRICE_LEADER
STRIPE_PRICE_PREMIUM
NEXT_PUBLIC_SITE_URL
```

## 5. 재배포

```bash
cd /Users/taeksujang/Documents/Codex/2026-04-18-40-60-1-2-3-4
npx vercel --prod
```

## 6. 테스트 결제 위치

```text
https://내프로젝트.vercel.app/pricing
```
