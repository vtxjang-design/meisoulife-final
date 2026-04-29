# Stripe Test Mode 연결 순서

아래 항목만 직접 하면 됩니다.

## 1. Stripe 테스트 모드 켜기

직접 할 일:

```text
Stripe Dashboard 로그인
Test mode 켜기
```

## 2. 3개 상품 만들기

직접 할 일:

```text
Product name: Basic
Price: ¥1,000
Currency: JPY
Billing: Recurring
Interval: Monthly
```

```text
Product name: Growth
Price: ¥3,000
Currency: JPY
Billing: Recurring
Interval: Monthly
```

```text
Product name: Inner Circle
Price: ¥10,000
Currency: JPY
Billing: Recurring
Interval: Monthly
```

만든 뒤 Price ID 3개를 복사합니다.

```text
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_CARE=price_...
STRIPE_PRICE_MASTER=price_...
```

## 3. Secret Key 복사하기

직접 할 일:

```text
Stripe Dashboard
Developers
API keys
Secret key 복사
```

테스트 모드에서는 아래처럼 시작합니다.

```text
STRIPE_SECRET_KEY=sk_test_...
```

## 4. Vercel에 환경변수 넣기

직접 할 일:

```text
Vercel Dashboard
내 프로젝트 선택
Settings
Environment Variables
```

아래 5개를 추가합니다.

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_CARE=price_...
STRIPE_PRICE_MASTER=price_...
PUBLIC_SITE_URL=https://내프로젝트.vercel.app
```

Webhook까지 쓸 거면 이것도 추가:

```text
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 5. 다시 배포하기

직접 할 일:

```bash
cd /Users/taeksujang/Documents/Codex/2026-04-18-40-60-1-2-3-4
npm install
npx vercel --prod
```

## 6. 테스트 결제하기

직접 할 일:

배포된 사이트에서 결제 섹션으로 갑니다.

```text
https://내프로젝트.vercel.app/index.html#payment
```

테스트 카드:

```text
4242 4242 4242 4242
```

나머지 값:

```text
만료일: 미래 날짜
CVC: 123
우편번호: 아무 숫자
```

## 7. 성공 기준

직접 확인할 것:

```text
Stripe Checkout 결제 화면이 열린다
테스트 카드 결제가 성공한다
결제 후 사이트로 돌아온다
사이트에 결제 완료 안내가 나온다
Stripe Test Mode 연결 상태가 모두 연결 완료로 나온다
```

## 8. 나에게 보내면 되는 값

막히면 아래 값만 보내주세요.

```text
Vercel 배포 주소:

Basic ¥1,000 Price ID:

Growth ¥3,000 Price ID:

Inner Circle ¥10,000 Price ID:

오류 메시지:
```

Secret Key는 채팅으로 보내지 않아도 됩니다.
Secret Key는 Vercel 환경변수에만 넣으세요.
