# Meisou Life Baseline Audit — 2026-08-31

## 1. 문서 목적

이 문서는 Meisou Life V2.0 공생 플랫폼의 현재 기준선을 저장소에 기록한다.

목적은 다음과 같다.

- 현재 정상 동작과 이미 승인된 HOLD 경계를 보존한다.
- 발견된 문제를 P0, P1, P2로 분류한다.
- 각 문제의 근거 파일, 최소 수정 범위, 제외 범위와 완료 기준을 고정한다.
- 후속 작업이 하나의 목적과 작은 diff로 수행되도록 한다.
- 이후 변경이 이 기준선에서 무엇을 개선하거나 훼손했는지 추적할 수 있게 한다.

이 문서는 CONSTITUTION.md 또는 AGENTS.md를 대체하지 않는다. CONSTITUTION.md는 WHY, AGENTS.md는 HOW, 이 문서는 현재의 WHAT과 RISK를 기록한다.

## 2. 감사 기준점

| 항목 | 기준 |
| --- | --- |
| Repository | vtxjang-design/meisoulife-final |
| Branch | main |
| Baseline commit | 95fdcee275813888f2293592bb6ac3d529291eef |
| Baseline commit message | fix: preserve completion audio option compatibility |
| Audit date | 2026-08-31 |
| Production URL | https://www.meisoulife.com |
| Open pull requests | 없음 |
| Repository visibility | public |
| Audit mode | 읽기 전용 source 및 public surface 감사 |
| Application code changes | 없음 |
| Database or deployment changes | 없음 |

### 2.1 감사 한계

- 이 감사가 실행된 ChatGPT Work scratch 환경에는 로컬 Git working tree가 탑재되어 있지 않았다.
- GitHub의 현재 main 소스, commit, PR, status와 공개 Production surface를 읽기 전용으로 확인했다.
- 로컬 npm install, 전체 unit test, typecheck, lint, build, Playwright E2E는 직접 실행하지 못했다.
- Supabase Production schema, 실제 RLS policy, Stripe Dashboard, Vercel environment variable 값과 운영 로그는 확인하지 않았다.
- 따라서 Production 데이터 또는 설정에 관한 미확인 사항은 추정하지 않고 UNVERIFIED로 표시한다.

## 3. 현재 시스템 지도

### 3.1 저장소 규모

| 항목 | 확인 수 |
| --- | ---: |
| Git blob files | 286 |
| App Router pages | 31 |
| App API route handlers | 15 |
| Auth page/route entries | 3 |
| Test/spec files including Supabase SQL contract | 35 |
| Supabase migrations | 10 |
| GitHub Actions workflows | 0 |
| Playwright/Jest/Vitest/ESLint configuration files | 0 |
| Public asset size in current tree | 약 295 MB |
| Duplicate public asset bytes by identical Git SHA | 약 72.5 MB |

### 3.2 주요 제품 영역

| 영역 | 현재 구성 |
| --- | --- |
| Public recovery | Homepage, ZERO GATE, 1-Minute Recovery, 7-Day Recovery |
| Daily rhythm | Morning, Daytime, Evening Gate |
| Auth | Login, signup, Magic Link, password update and recovery |
| Membership | Free, Basic, Growth, Inner Circle |
| Billing | Stripe Checkout, Webhook, Customer Portal |
| Member experience | Member center, BASIC Garden, Premium access |
| AI | Gongsaeng Coach isolated |
| Community | Community, Leaders, Retreats |
| Operations | Vercel cron routes, Admin mock page, client error report |
| Database | Supabase Auth, memberships, users, subscriptions, Garden ledgers and RLS-dependent access |

### 3.3 주요 Route Map

Public and product pages include:

- /
- /meditation
- /rhythm-journey
- /brain-education
- /pricing
- /membership
- /community
- /leaders
- /retreats
- /coach
- /login
- /signup
- /reset-password
- /auth/update-password
- /member
- /account/security
- /program/basic
- /program/growth
- /program/inner
- /premium
- /dashboard
- /admin

Important App API routes include:

- /api/send-magic-link
- /api/membership/resolve
- /api/stripe/checkout
- /api/stripe/customer-portal
- /api/stripe/webhook
- /api/coach
- /api/basic/garden-visit
- /api/basic/garden-completion
- /api/challenge
- /api/client-error-report
- /api/cron/challenge-reminders
- /api/cron/inactive-users
- /api/cron/weekly-report
- /api/cron/leader-scan
- /api/auth-debug

Legacy root API files also exist:

- api/create-checkout-session.js
- api/stripe-webhook.js
- api/stripe-config-status.js

## 4. 확인된 완료 및 보존 대상

다음 상태는 후속 변경에서 회귀시키지 않아야 한다.

| ID | 확인된 상태 | 근거 |
| --- | --- | --- |
| DONE-01 | 비밀번호 변경 및 복구가 승인된 direct update-password 경로를 사용하도록 수정됨 | PR #2, PR #3 |
| DONE-02 | Gongsaeng Coach 공개 구현은 HOLD이며 /coach는 unavailable 안내만 표시 | app/coach/page.tsx |
| DONE-03 | POST /api/coach는 body를 처리하지 않고 503 및 Cache-Control: no-store 반환 | app/api/coach/route.ts |
| DONE-04 | 공개 Coach CTA와 지원하지 않는 meditation 진입점은 Recovery Core로 정렬됨 | PR #9 |
| DONE-05 | LINE 참여는 선택사항으로 표현되고 링크 열기를 연결 완료로 기록하지 않음 | PR #9 |
| DONE-06 | Recovery Choice Bridge Phase 0는 deterministic, no-storage, non-generative 상태 | PR #6 |
| DONE-07 | Morning Gate JP/KR/EN 음성, 발음, 간격과 자막 연속성 개선이 main에 반영됨 | PR #11–#16 및 후속 commits |
| DONE-08 | Morning 3 Gate와 Daytime 3 Gate 종료 차임 조건이 구현됨 | lib/meditation-completion.ts |
| DONE-09 | Evening Gate와 unrelated session은 종료 차임 대상에서 제외됨 | lib/meditation-completion.ts |
| DONE-10 | BASIC Garden은 bearer-authenticated RLS client 경계를 별도로 보유 | lib/supabase/server.ts 및 Garden API tests |
| DONE-11 | Latest baseline commit에 연결된 세 Vercel status가 success | commit 95fdcee status |
| DONE-12 | Gongsaeng Coach Phase 1A는 일본 성인 5명, 최대 10명 문서 방향만 승인되고 구현은 HOLD | docs/product/GONGSAENG_COACH_MVP.md |

주의: DONE은 전체 시스템이 안전하다는 의미가 아니다. 확인된 동작 또는 승인 경계를 후속 작업에서 보존해야 한다는 의미다.

## 5. 거버넌스 정합성

### GOV-01 — 사용자 여정 순서 충돌

상태: P0 GOVERNANCE DECISION REQUIRED

현재 세 기준에 순서 차이가 있다.

- CONSTITUTION.md: BASIC Membership 안의 Daily Rhythm 이후 Gongsaeng Coach
- AGENTS.md primary journey: Daily Rhythm 이후 BASIC Membership
- AGENTS.md V2 priority list: BASIC, LSC onboarding 이후 Daily Rhythm
- 새 Work 마스터 방향: Daily Rhythm, Coach, Community 이후 Membership

위험:

- AI 또는 개발자가 서로 다른 문서를 근거로 상충하는 CTA와 접근 권한을 구현할 수 있다.
- Coach가 HOLD 상태인데도 공개 기본 여정으로 재진입할 수 있다.
- Recovery before membership과 BASIC의 유료 Daily Rhythm 경계가 불명확해질 수 있다.

권장 canonical treatment:

- ZERO GATE
- 7-Day Recovery
- 무료 Daily Rhythm introduction
- BASIC의 full Morning, Daytime, Evening Rhythm
- 기록과 변화
- Community or LSC
- Coexistence
- Gongsaeng Coach는 HOLD 조건을 충족하기 전까지 공개 기본 여정에서 제외

결정 전 제외 범위:

- CONSTITUTION.md 변경
- Coach 구현 또는 재활성화
- Membership entitlement 변경
- 공개 CTA 재배치

완료 기준:

- Master Jang의 명시적 결정
- CONSTITUTION.md, AGENTS.md, Work instruction의 동일한 canonical journey
- Free introduction과 paid full rhythm의 경계 명시
- Coach HOLD 경계 유지

### GOV-02 — 공개 Leader Growth와 공생 거버넌스 충돌

상태: P0 GOVERNANCE AND CONTAINMENT REQUIRED

근거:

- app/leaders/page.tsx
- components/leader-growth-page-content.tsx
- lib/leader.ts
- app/api/cron/leader-scan/route.ts
- vercel.json
- Production /leaders
- AGENTS.md의 hierarchy, recruitment competition, growth-based authority 금지

현재 동작:

- 유료회원 일수, 체크인 수, 도움 댓글 수를 후보 조건으로 표시한다.
- leader-scan은 조건 충족 사용자를 candidate_leader로 변경하고 leader_candidates에 upsert한다.
- 공개 navigation과 footer에서 Leader Growth가 노출된다.

위험:

- 참여량과 유료 기간이 지위 또는 권한으로 해석될 수 있다.
- AGENTS.md의 자동 위계 및 성장 기반 권한 금지와 충돌한다.
- 아직 구현 HOLD인 Field Keeper transition과 혼재한다.

권장 최소 조치:

- 자동 leader-scan DB mutation을 중지한다.
- Vercel leader-scan schedule을 HOLD한다.
- 공개 Leader Growth entry를 승인된 HOLD 또는 Field Keeper 안내로 대체한다.
- 기존 사용자 및 후보 데이터는 삭제하지 않는다.

완료 기준:

- 자동 후보 판정 없음
- 수치가 지위 또는 승급을 부여하지 않음
- 공개 문구와 AGENTS.md 정렬
- 데이터 보존 및 롤백 절차 기록
- 인간 검토와 명시적 역할 동의 없이는 어떤 권한도 부여되지 않음

## 6. P0 위험

### P0-01 — Cron authorization fail-open

근거 파일:

- app/api/cron/challenge-reminders/route.ts
- app/api/cron/inactive-users/route.ts
- app/api/cron/weekly-report/route.ts
- app/api/cron/leader-scan/route.ts
- vercel.json

현재 동작:

각 Cron route는 CRON_SECRET이 존재할 때만 Authorization을 검사한다. 환경변수가 없으면 요청이 인증 없이 계속 진행된다.

위험:

- 환경변수 누락 시 외부 호출을 차단하지 못한다.
- leader-scan은 service-role client를 사용해 데이터베이스를 변경할 수 있다.
- 안전한 환경설정 실패가 아니라 fail-open이다.

최소 수정 범위:

- 네 Cron route
- 선택적으로 공통 cron authorization helper
- focused authorization tests

제외 범위:

- 기존 Leader 데이터 삭제
- Stripe 변경
- Recovery UI 변경
- Supabase schema 변경
- 다른 API의 전면 인증 리팩터링

완료 기준:

- CRON_SECRET 미설정: 503
- Authorization 누락 또는 불일치: 401
- 올바른 secret: route 실행 가능
- 인증 실패 시 Supabase admin client 생성 또는 DB query 없음
- focused tests, typecheck, build 통과

롤백:

- 보안 변경 한 commit을 revert
- Production secret 값 자체는 로그 또는 문서에 기록하지 않음

### P0-02 — Stripe webhook idempotency와 부분 실패 처리

근거 파일:

- app/api/stripe/webhook/route.ts
- components/supabase/schema.sql
- supabase migrations
- lib/membership-resolver.ts

현재 동작:

- event 처리 여부를 조회한 뒤 business logic을 실행하고 마지막에 event ID를 insert한다.
- check와 claim이 원자적이지 않다.
- 일부 membership, subscription, user sync 오류는 로그 후 반환되어 상위 POST가 실패를 인지하지 못할 수 있다.
- 처리 기록 insert 실패도 warning 후 2xx로 끝날 수 있다.
- Supabase admin client 부재 시 process-local Set을 fallback으로 사용한다.

위험:

- 동시 중복 event가 두 번 처리될 수 있다.
- membership 동기화가 일부 실패했는데 event가 completed로 간주될 수 있다.
- Stripe가 재시도하지 않아 결제와 entitlement가 불일치할 수 있다.
- serverless process-local memory는 durable idempotency가 아니다.

최소 수정 범위:

- app/api/stripe/webhook/route.ts
- event ledger를 위한 forward-only migration
- webhook focused unit and integration tests
- 필요한 경우 작은 helper

제외 범위:

- Stripe Production webhook endpoint 변경
- 가격 변경
- 기존 membership 삭제 또는 재작성
- Checkout UX redesign
- Customer Portal redesign

완료 기준:

- event ID의 원자적 claim
- processing, completed, failed 상태 또는 동등한 durable contract
- 핵심 entitlement sync 실패 시 event 완료 처리 금지
- 재시도 가능한 non-2xx 응답
- duplicate, concurrent duplicate, partial failure, retry, out-of-order test
- 이메일 notification 실패와 membership sync 성공의 분리
- migration rollback and post-deploy verification documented

## 7. P1 안정화 항목

### P1-01 — 자동 검증 파이프라인 부재

근거:

- package.json의 check는 next build만 실행
- .github/workflows 없음
- independent lint, typecheck, test, integration, E2E scripts 없음
- Playwright configuration 및 dependency 없음

현재 자산:

- TypeScript test files와 Supabase SQL contract를 합쳐 35개 test/spec 파일이 존재한다.
- 과거 PR에서 focused node --test와 build 통과 기록이 존재한다.
- 현재 main 전체 suite를 단일 명령으로 실행한 증거는 이 감사에서 확인하지 못했다.

최소 수정 범위:

- package.json scripts
- 필요한 최소 test runner dependency or Node version contract
- GitHub Actions workflow
- focused documentation update

완료 기준:

- npm run typecheck
- npm run lint
- npm run test
- npm run test:integration
- npm run build
- PR마다 자동 실행
- 실패한 필수 검증이 merge를 차단하도록 repository setting 별도 확인

### P1-02 — Auth, bearer, RLS client 경계

근거:

- middleware.ts
- lib/supabase/server.ts
- app/api/membership/resolve/route.ts
- app/api/stripe/customer-portal/route.ts
- components/auth-provider.tsx
- components/membership-guard.tsx

관찰:

- bearer token으로 user를 검증한 뒤 DB query에는 cookie-backed client가 계속 사용되는 경로가 있다.
- cookie session이 없고 bearer만 유효한 경우 DB RLS identity 전달 여부가 명확하지 않다.
- BASIC Garden에는 별도의 bearer-scoped database client가 이미 존재한다.

최소 수정 전 조사:

- cookie-only, bearer-only, expired cookie plus valid bearer contract tests
- membership resolver와 Customer Portal의 RLS identity 확인
- auth identity, entitlement decision, admin repair 책임 분리

완료 기준:

- auth.users.id를 identity source of truth로 유지
- bearer-only 요청에서도 validated identity와 RLS identity 일치
- authorization read path는 불필요한 service-role repair를 수행하지 않음
- unauthenticated, unavailable, forbidden 상태를 구분

### P1-03 — Database and RLS reproducibility gap

근거:

- components/supabase/schema.sql
- supabase/migrations
- supabase/tests

관찰:

- 주요 초기 schema와 RLS policy가 components/supabase/schema.sql snapshot에 존재한다.
- migration history는 주로 BASIC Garden과 최근 membership alignment를 다룬다.
- Production의 실제 전체 RLS 상태는 저장소만으로 확정할 수 없다.

완료 기준:

- Production schema and policy read-only inventory
- source-controlled migration history와 drift report
- owner-only membership select policy 검증
- service-role 전용 write path와 user RLS read path 구분
- destructive migration 금지 및 forward-only plan

### P1-04 — Legacy billing endpoints

근거:

- api/create-checkout-session.js
- api/stripe-webhook.js
- app/api/stripe/checkout/route.ts
- app/api/stripe/webhook/route.ts

관찰:

- App Router billing implementation 외에 legacy root serverless endpoints가 존재한다.
- plan naming, metadata, success route와 sync behavior가 canonical implementation과 다르다.
- 실제 Production 호출 여부는 UNVERIFIED다.

완료 기준:

- access logs and Stripe endpoint configuration으로 사용 여부 확인
- 사용 중이면 controlled migration
- 미사용이면 route containment 후 별도 removal
- canonical Checkout and Webhook endpoint 문서화

### P1-05 — AGENTS.md technical execution rules 부족

현재 AGENTS.md는 철학과 거버넌스에는 강하지만 다음 기술 규칙이 구체적이지 않다.

- Server versus Client Component 기준
- Supabase SSR cookie and bearer 규칙
- API authorization 책임
- RLS and migration workflow
- Stripe changes and idempotency
- OpenAI API and fallback boundary
- common error handling
- PII and secret logging
- banned patterns
- large refactor limits
- test requirement for auth, payment, membership and safety logic

최소 수정 범위:

- AGENTS.md technical execution section only
- 기존 철학과 권한 정의 보존
- Foundation Pack 의미 변경 없음

## 8. P2 기술 부채

| ID | 항목 | 근거 및 영향 |
| --- | --- | --- |
| P2-01 | 동일 public media 중복 | identical Git SHA 기준 약 72.5 MB |
| P2-02 | 경로 naming 혼재 | spaces, capitalization, morning gate와 morning-gate 동시 존재 |
| P2-03 | legacy static app artifacts | index.html, script.js, styles.css |
| P2-04 | dormant Coach components | coach-console.tsx, ai-rhythm-coach.tsx remain unmounted |
| P2-05 | generated or temporary artifacts | tsconfig.tsbuildinfo, qa-fix-batch-1.patch |
| P2-06 | public mock Admin surface | /admin은 mock metrics이며 실제 admin authorization surface가 아님 |
| P2-07 | duplicated Stripe test documents | STRIPE_TEST_MODE_STEPS.md와 numbered duplicate |

P2 정리는 P0와 P1 안정화 이후 참조 검색, Preview, rollback 가능한 작은 PR로 진행한다.

## 9. 현재 검증 상태

### 9.1 확인됨

- baseline commit은 main의 최신 commit이었다.
- 동일 목적의 open PR은 없었다.
- 세 Vercel deployment status는 success였다.
- latest commit check-run에는 Vercel Preview Comments success가 있었다.
- GitHub Actions workflow는 repository tree에 없었다.
- repository rulesets API는 빈 배열을 반환했다.

### 9.2 미확인

- branch protection 상세은 integration 권한 제한으로 확인하지 못했다.
- 모든 35개 test/spec의 현재 main 전체 통과 여부
- standalone typecheck and lint
- real browser E2E
- Production CRON_SECRET 존재 여부
- Stripe webhook endpoint와 legacy endpoint 사용 여부
- Production Supabase RLS drift
- Production data integrity and historical webhook failures

Vercel success를 전체 test, security, membership integrity 성공과 동일하게 해석하지 않는다.

## 10. 승인된 다음 작업 순서

1. Baseline Audit 문서 승인 및 merge
2. P0-01 Cron fail-closed
3. GOV-02 Leader auto-decision HOLD and containment
4. P0-02 Stripe webhook atomic idempotency
5. P1-05 AGENTS.md technical execution rules
6. P1-01 CI and test commands
7. P1-02 Auth, RLS and authorization audit
8. Membership Golden Path integration and Playwright smoke E2E
9. Recovery Core multilingual regression matrix
10. Gongsaeng Coach HOLD checklist review
11. Rhythm Data
12. Community and Coexistence expansion

Coach fallback은 이미 존재한다. Provider integration 또는 Coach reactivation은 이 목록의 앞 단계가 아니다.

## 11. 후속 작업 계약

각 후속 PR은 다음 형식을 사용한다.

| 필드 | 필수 내용 |
| --- | --- |
| Baseline item | 해결하려는 단일 GOV/P0/P1/P2 ID |
| Purpose | 한 문장의 작업 목적 |
| Evidence | 관련 source, test, log 또는 confirmed configuration |
| Files | 예상 수정 파일 |
| Exclusions | 수정하지 않을 영역 |
| Risk | affected people, security, data and operational risk |
| Validation | focused test, typecheck, lint, build, Preview or post-deploy check |
| Rollback | revert commit, flag, route isolation or migration response |
| Approval | 필요한 human approval |
| Residual risk | 작업 후 남는 위험 |

한 PR에서 여러 P0 또는 서로 다른 제품 목적을 함께 해결하지 않는다.

## 12. 문서 갱신 규칙

항목이 해결되면 삭제하지 않고 다음 정보를 추가한다.

- Status: RESOLVED, PARTIALLY RESOLVED, ACCEPTED, HOLD 또는 SUPERSEDED
- PR number
- Merge commit
- Verification performed
- Production verification date, if performed
- Remaining risk
- Follow-up baseline item

새로운 증거가 없는 한 기존 위험을 자동으로 낮추지 않는다.

## 13. Mandatory Decision Test

| 질문 | 결과 | 이유 |
| --- | --- | --- |
| 사용자의 회복을 돕는가 | PASS | 기능 확장보다 안전성과 신뢰를 우선한다. |
| Brain Ownership과 agency를 강화하는가 | PASS | 자동 권한, 불투명한 AI와 결제 불일치를 먼저 다룬다. |
| 공생을 건강하게 하는가 | PASS | 수치 기반 위계와 자동 후보 판정을 거버넌스 결정 대상으로 명시한다. |
| 개인정보와 동의를 보호하는가 | PASS | Auth, RLS, logging과 provider 경계를 P1 이전에 고정한다. |
| Earth Management 방향에 부합하는가 | PASS | 중복 계산, 데이터와 운영 실패를 줄이는 안정화 계획이다. |
| AI가 최종 권한을 행사하는가 | NO | 철학적 사용자 여정과 Leader transition은 Master Jang의 승인을 요구한다. |
| Production implementation을 승인하는가 | NO | 이 PR은 문서 전용이며 application, DB, payment, deployment 변경을 승인하지 않는다. |

Decision: PASS for baseline documentation only. 모든 P0/P1 코드 변경과 거버넌스 결정은 별도 PR과 필요한 인간 승인을 요구한다.
