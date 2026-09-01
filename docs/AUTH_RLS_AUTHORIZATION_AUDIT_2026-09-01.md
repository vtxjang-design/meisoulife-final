# Auth · RLS · API Authorization Audit — 2026-09-01

## 1. 목적과 범위

이 문서는 Meisou Life의 인증, API authorization, membership entitlement, Supabase RLS, service-role 사용 경계를 현재 저장소에 고정한다.

- Audited repository: `vtxjang-design/meisoulife-final`
- Audited main commit: `eb2d0f143b4a72f7ee2baed68339feb22941c5dd`
- 기준 문서: `CONSTITUTION.md`, `AGENTS.md`, `docs/BASELINE_AUDIT_2026-08-31.md`
- Baseline item: `P1-02 Auth, bearer, RLS client 경계` 및 `P1-03 Database and RLS reproducibility gap`
- 감사 방식: source-only, read-only
- Production DB, Supabase Dashboard, Auth logs, Vercel request logs는 이 감사 범위에서 읽지 않았다.
- application code, DB schema, Vercel setting, Supabase data, Stripe setting은 변경하지 않았다.

이 문서는 보안 완료 선언이 아니다. 확인된 경계, 미확인 상태, 최소 수정 순서를 기록한다.

## 2. 적용한 원칙

- Consent and privacy by default
- Human agency before automation
- 최소 권한과 명확한 책임 분리
- 인증된 identity와 RLS identity의 일치
- authorization read와 service-role repair의 분리
- 오류 시 fail closed
- 작은 diff, focused tests, reversible PR
- 비밀값, access token, 전체 email, Stripe 식별자를 로그 또는 문서에 기록하지 않음

## 3. 현재 Identity와 권한 구조

| 계층 | 현재 source of truth | 관찰된 구현 |
| --- | --- | --- |
| 로그인 identity | Supabase Auth `auth.users.id` | cookie session 또는 검증된 bearer token의 `auth.getUser()` |
| cookie RLS identity | Supabase SSR cookie-backed client | `getSupabaseServerClient()` |
| bearer RLS identity | access token을 Authorization header로 갖는 anon-key client | `getSupabaseBearerServerClient()` |
| membership identity | `memberships.user_id = auth.users.id` | owner-select RLS policy 존재 |
| legacy profile identity | `users.auth_user_id = auth.users.id` | 일부 billing fallback과 Garden sync에서 사용 |
| elevated write | Supabase service-role client | webhook, Garden sync, membership repair, Leader scan |
| UI membership gate | client `MembershipGuard` | BASIC program 중심 |
| server membership gate | Server Component redirect | `/premium` |

권장 canonical contract:

1. `auth.getUser()`가 request identity를 검증한다.
2. 동일 identity를 가진 cookie 또는 bearer RLS client만 authorization read를 수행한다.
3. read-only authorization은 service role을 생성하거나 데이터를 repair하지 않는다.
4. webhook 또는 명시적 maintenance/reconciliation 경로만 elevated write를 수행한다.
5. UI guard는 UX 보조 장치이며 민감 데이터나 유료 entitlement의 유일한 보안 경계가 아니다.

## 4. 보존해야 할 확인된 안전장치

### SAFE-01 — Middleware session refresh

`middleware.ts`는 지정 경로에서 Supabase SSR client를 만들고 `auth.getUser()`를 호출해 세션 갱신 cookie를 response에 반영한다.

주의: middleware는 현재 authorization decision을 수행하지 않는다. session refresh와 route authorization을 동일한 것으로 해석하지 않는다.

### SAFE-02 — BASIC Garden bearer RLS boundary

다음 API는 bearer-only 요청에서 검증된 token으로 별도 RLS client를 생성한다.

- `app/api/basic/garden-completion/route.ts`
- `app/api/basic/garden-visit/route.ts`
- `lib/supabase/server.ts`

인증 및 entitlement 판정 이후에만 service-role write client를 사용한다. 관련 focused tests가 존재한다. 후속 공통화에서 이 동작을 약화시키지 않는다.

### SAFE-03 — Membership owner-only select policy

`supabase/migrations/20260824090000_allow_membership_owner_select.sql`은 authenticated user가 `auth.uid() = memberships.user_id`인 행만 select하도록 한다. write permission은 부여하지 않는다.

### SAFE-04 — Read-only resolver가 이미 존재

`resolveMembershipEntitlementReadOnly()`는 admin repair를 수행하지 않는 별도 경계를 제공하며, `/member` Server Component가 사용한다. 테스트는 database/RLS failure를 unresolved로 반환하고 service-role을 만들지 않는 계약을 확인한다.

### SAFE-05 — Premium server gate

`app/premium/page.tsx`는 Server Component에서 cookie user와 membership을 확인한 뒤 미인증 또는 비활성 membership을 redirect한다.

잔여 위험: 현재 reconciling resolver를 사용하므로 read 중 repair 가능성은 별도 해결이 필요하다.

## 5. 우선순위별 발견사항

### P0

현재 저장소 증거만으로 즉시 타인의 계정, 결제정보 또는 service-role 권한을 획득할 수 있는 P0 exploit은 확인하지 못했다.

이는 P0가 없다는 영구 보장이 아니다. Production RLS drift, 실제 환경 설정, access logs, Supabase Auth 설정은 미확인이다.

### P1-AUTH-01 — bearer identity와 DB RLS identity 불일치

상태: CONFIRMED

근거:

- `app/api/membership/resolve/route.ts`
- `app/api/stripe/customer-portal/route.ts`
- `lib/supabase/server.ts`
- BASIC Garden의 별도 bearer client 구현

현재 동작:

- cookie client로 `auth.getUser()`를 먼저 호출한다.
- cookie user가 없으면 같은 client에서 bearer token을 `auth.getUser(token)`으로 검증한다.
- bearer user가 확인되어도 DB query에는 cookie-backed client를 계속 사용한다.
- bearer-only request에서 DB role은 bearer user와 동일하다고 보장되지 않는다.

영향:

- 유효한 bearer-only 사용자가 membership RLS read에서 anonymous 또는 잘못된 identity로 처리될 수 있다.
- Customer Portal의 local customer lookup이 실패하고 Stripe email fallback에 불필요하게 의존할 수 있다.
- 인증 성공과 authorization read 실패가 혼합되어 401, 403, 503 구분이 불명확해진다.

최소 수정:

- request auth helper가 `user`, `source`, `rlsClient`를 함께 반환
- bearer user이면 `getSupabaseBearerServerClient(token)`을 DB read에 사용
- cookie-only, bearer-only, expired cookie + valid bearer, invalid bearer tests
- cookie와 bearer가 동시에 있으나 identity가 다를 때의 canonical policy를 문서화하고 테스트

제외:

- Supabase Auth provider 변경
- membership schema 변경
- service-role key 변경
- 전 API 대규모 refactor

### P1-AUTH-02 — authorization read와 service-role repair 혼합

상태: CONFIRMED

근거:

- `app/api/membership/resolve/route.ts`
- `app/premium/page.tsx`
- `lib/membership-resolver.ts`
- `lib/membership-resolver-read-only.test.ts`

현재 동작:

- `/api/membership/resolve`와 `/premium`이 reconciling resolver를 사용한다.
- reconciling resolver는 Stripe 결과에 따라 service-role client로 membership, users, subscriptions를 repair할 수 있다.
- 동일 파일에 read-only resolver가 이미 존재한다.

영향:

- GET 또는 page render가 elevated DB mutation을 유발할 수 있다.
- RLS read failure와 실제 membership absence가 repair 로직 안에서 혼합될 수 있다.
- 재시도, 동시 요청, 부분 실패의 책임이 webhook과 read path에 분산된다.

최소 수정:

- 일반 entitlement read와 page guard는 read-only resolver 사용
- repair는 webhook 또는 명시적 authenticated maintenance endpoint/job로 한정
- read path에서 admin client 생성과 insert/update가 없음을 contract test로 고정
- Stripe fallback을 유지할 경우 read-only 결과와 durable sync 상태를 분리

### P1-AUTH-03 — BASIC 유료 경험이 client-only UI gate에 의존

상태: CONFIRMED, PRODUCT DECISION REQUIRED

근거:

- `app/program/basic/page.tsx`
- `components/membership-guard.tsx`
- `components/program-access-guard.tsx`
- `public/basic/**`
- `public/one-minute-reset/basic/**`

현재 동작:

- BASIC main page는 Client Component이며 `MembershipGuard`가 render/redirect를 결정한다.
- middleware는 session refresh만 수행한다.
- Garden write API는 server authorization을 수행하지만, BASIC UI code와 public media는 별도 server entitlement boundary가 아니다.
- `public/**` media URL은 원칙적으로 정적 공개 자산이다.

영향:

- UI navigation은 차단되지만 유료 콘텐츠 자체의 접근 통제와 동일하지 않다.
- JS bundle 또는 직접 media URL 접근을 entitlement 보호로 간주할 수 없다.

결정 필요:

- BASIC을 “유료 UX와 기록 기능”으로 보호하고 media 자체는 공개 가능하게 둘지,
- media 자체도 private storage, signed URL, authorized proxy 등으로 보호할지 Master Jang의 명시적 제품 결정을 요구한다.

최소 코드 방향:

- page-level server gate를 우선 추가
- client guard는 background refresh와 UX용으로 유지
- media protection이 필요하면 별도 architecture PR과 성능·비용·캐시 설계 수행
- 기존 media를 즉시 이동하거나 삭제하지 않음

### P1-RLS-01 — 저장소만으로 전체 RLS를 재현할 수 없음

상태: CONFIRMED REPOSITORY GAP, PRODUCTION STATE UNVERIFIED

근거:

- `components/supabase/schema.sql`
- `supabase/migrations/**`
- `supabase/tests/**`

관찰:

- 초기 tables와 여러 RLS policy가 snapshot SQL에 존재한다.
- migration history는 주로 BASIC Garden과 최근 membership alignment부터 시작한다.
- 전체 초기 schema, policy, grants의 forward-only migration chain이 없다.
- Production policy가 snapshot 또는 migrations와 동일한지 저장소만으로 확정할 수 없다.

위험:

- 새 환경 재구축과 disaster recovery가 재현되지 않는다.
- source와 Production drift를 code review가 발견할 수 없다.
- application fix가 Production RLS 상태에 따라 다르게 동작할 수 있다.

최소 다음 작업:

- Production Supabase에서 read-only schema/policy/grant inventory 추출
- repository snapshot과 migration chain 비교
- destructive SQL 없이 forward-only reconciliation 계획 작성
- 적용 전 backup, rollback, post-deploy verification 정의

### P1-RLS-02 — legacy foreign key와 `auth.uid()` policy identity 혼재

상태: SOURCE CONFIRMED, PRODUCTION EFFECT UNVERIFIED

근거:

- `components/supabase/schema.sql`

관찰:

- `memberships.user_id`는 `auth.users.id`를 참조하며 owner-select policy와 정렬된다.
- `challenge_progress.user_id`와 `coach_messages.user_id`는 `public.users.id`를 참조한다.
- snapshot의 select policy는 두 table에서도 `auth.uid() = user_id`를 사용한다.
- `auth.users.id`와 `public.users.id`는 서로 다른 identity domain이다.

영향:

- 정책이 snapshot과 동일하게 적용되어 있다면 정상 사용자의 own-row read가 차단될 수 있다.
- Coach는 HOLD이므로 재활성화 전에 반드시 해결해야 한다.
- challenge history의 user linkage가 email, public profile ID, auth ID 사이에서 혼재될 수 있다.

최소 수정 전 조사:

- Production column types, foreign keys, 실제 policy definition inventory
- challenge signup 후 auth account linking 절차 확인
- owner identity를 `auth_user_id` join 또는 auth ID FK 중 하나로 canonicalize
- 기존 데이터 삭제 또는 destructive type change 금지

### P1-RLS-03 — subscriptions owner read contract 부재

상태: SOURCE CONFIRMED, PRODUCTION STATE UNVERIFIED

근거:

- `components/supabase/schema.sql`
- `lib/membership-resolver.ts`

관찰:

- `subscriptions`에는 RLS가 enable되어 있다.
- snapshot에는 authenticated owner select policy가 없다.
- resolver는 RLS client로 legacy subscription fallback read를 시도한다.
- `subscriptions.user_id`는 `public.users.id`를 참조한다.

영향:

- membership row가 없을 때 subscription fallback이 permission error가 될 수 있다.
- Stripe fallback 또는 repair가 RLS 설계 결함을 가릴 수 있다.

다음 작업:

- Production policy inventory 후 필요한 owner-read contract를 명시
- direct owner policy가 필요하면 `users.auth_user_id = auth.uid()` 관계를 안전하게 사용
- billing write는 service-role/webhook에만 유지

### P1-PRIV-01 — 인증·결제 로그에 개인정보와 식별자 기록

상태: CONFIRMED

근거:

- `app/api/membership/resolve/route.ts`
- `app/api/stripe/customer-portal/route.ts`
- `app/api/stripe/checkout/route.ts`
- `lib/membership-resolver.ts`
- `components/auth-provider.tsx`

관찰:

- user ID와 email이 production server log에 기록될 수 있다.
- Customer Portal은 profile email, subscription ID, billing dates 등을 기록한다.
- Checkout은 전체 metadata와 email을 기록한다.
- 일부 Stripe customer ID만 mask helper를 사용하며 일관되지 않다.

위험:

- privacy-by-default 원칙 위반
- 운영 로그 접근 범위와 retention에 따라 개인정보 노출 증가
- support screenshot 또는 log export를 통한 2차 노출 가능

최소 수정:

- production log allowlist: request ID, category, status, boolean presence
- email, user ID, access token, session, raw metadata, Stripe subscription/customer ID 제거 또는 비가역 mask
- debug detail은 local development 또는 explicit server-side flag로 제한
- log hygiene contract tests 추가

### P1-AUTH-04 — 공개 인증 보조 endpoint hardening 부족

상태: CONFIRMED

근거:

- `app/api/send-magic-link/route.ts`
- `app/api/auth-debug/route.ts`
- `app/api/client-error-report/route.ts`

관찰:

- Magic Link route는 환경 상태와 raw provider error를 response에 포함한다.
- public auth-debug route는 Supabase config status를 반환한다.
- Magic Link와 client-error-report에는 durable rate limit이 없다.
- client-error-report는 user-provided stack, search query와 user agent를 server log에 기록한다.

영향:

- email delivery abuse, provider/config fingerprinting, log spam과 PII 유입 가능
- serverless process-local dedupe는 durable abuse control이 아니다.

최소 수정:

- Magic Link response를 generic success/failure contract로 축소
- public response에서 environment diagnostics 제거
- `auth-debug`를 production에서 제거, 404 또는 privileged diagnostic으로 제한
- privacy-preserving rate limit 또는 provider-side protection 검토
- error report의 query string, stack, user agent redaction과 rate limit 설계

### P2-AUTH-01 — production membership debug surface

상태: CONFIRMED

근거:

- `app/program/basic/page.tsx`
- `app/member/page.tsx`
- `?membershipDebug=1`

Debug panel은 사용자의 normalized email과 내부 resolution evidence를 화면에 표시할 수 있다. 타 사용자 데이터 접근 증거는 없지만 production diagnostics로서 불필요한 내부 정보와 개인정보 노출을 늘린다.

권장: local/non-production 또는 explicit privileged diagnostics로 제한한다.

### P2-AUTH-02 — Admin route naming 오해 가능성

상태: CONFIRMED

`/admin`은 mock data를 표시하며 실제 admin authorization surface가 아니다. 그러나 route 이름과 설명은 운영 dashboard로 오해될 수 있다. 실제 admin 기능 추가 전 별도 server authorization, role source of truth, audit log가 필요하다.

## 6. API Authorization Map

| Route | Authentication | Authorization/RLS | Elevated write | 판정 |
| --- | --- | --- | --- | --- |
| `GET /api/membership/resolve` | cookie 우선, bearer fallback | bearer-only RLS identity 불일치 | resolver repair 가능 | P1 fix |
| `POST /api/stripe/customer-portal` | cookie 우선, bearer fallback | bearer-only local RLS 불일치, Stripe email fallback | Stripe portal session 생성 | P1 fix |
| `POST /api/stripe/checkout` | cookie optional | guest checkout 가능, entitlement 아님 | Stripe Checkout 생성 | 정책 문서화 + log fix |
| `POST /api/basic/garden-visit` | cookie 또는 bearer | bearer-scoped RLS entitlement | auth 후 service-role sync | preserve |
| `POST /api/basic/garden-completion` | cookie 또는 bearer | bearer-scoped RLS entitlement | auth 후 service-role sync | preserve |
| `POST /api/challenge` | public | anon insert policy snapshot | user/progress upsert | RLS/error contract 검증 |
| `POST /api/send-magic-link` | public | Supabase Auth provider | OTP send | harden |
| `POST /api/client-error-report` | public | 없음 | server log | harden |
| `GET /api/auth-debug` | public | 없음 | 없음 | production contain |
| `POST /api/stripe/webhook` | Stripe signature | service-role business sync | yes | P0-02 별도 작업 |
| `GET /api/cron/**` | exact Vercel bearer | route-specific | 일부 yes | P0-01 resolved by PR #18 |
| `/api/coach` | unavailable | HOLD | no | preserve HOLD |

## 7. Required Contract Tests

첫 Auth/RLS 수정 PR은 최소 다음 matrix를 고정해야 한다.

| Scenario | Expected identity | Expected DB client | Expected result |
| --- | --- | --- | --- |
| valid cookie, no bearer | cookie user | cookie RLS client | own rows only |
| no cookie, valid bearer | bearer user | bearer RLS client | own rows only |
| expired/invalid cookie, valid bearer | bearer user | bearer RLS client | own rows only |
| no cookie, malformed bearer | none | no DB authorization read | 401 |
| no cookie, invalid bearer | none | no DB authorization read | 401 |
| cookie and same-user bearer | documented canonical source | matching RLS client | deterministic |
| cookie and different-user bearer | documented conflict policy | no mixed identity | reject or explicit cookie-only policy |
| Supabase unavailable | none | none | 503 |
| RLS permission failure | authenticated user | matching RLS client | unresolved/503, no repair |
| inactive membership | authenticated user | matching RLS client | 403 or inactive result |
| read-only endpoint | authenticated user | RLS client | zero service-role calls and writes |

## 8. 승인된 최소 작업 순서

### PR A — Request auth + bearer RLS identity alignment

Purpose: validated identity와 DB RLS identity를 일치시킨다.

예상 파일:

- `lib/supabase/server.ts`
- 새 small request-auth helper와 focused tests
- `app/api/membership/resolve/route.ts`
- `app/api/stripe/customer-portal/route.ts`
- 필요한 route contract tests

필수 조건:

- BASIC Garden의 확인된 bearer behavior 보존
- secret, token, email logging 금지
- DB 또는 migration 변경 없음
- read path service-role repair 문제는 같은 PR에서 helper 적용에 반드시 필요한 최소 변경만 포함

### PR B — Read-only authorization boundary

Purpose: membership read와 service-role reconciliation을 분리한다.

예상 파일:

- `app/api/membership/resolve/route.ts`
- `app/premium/page.tsx`
- `lib/membership-resolver*.test.ts`
- 필요 시 explicit reconciliation entrypoint 문서

필수 조건:

- 일반 GET/page render에서 admin client call과 DB write 0
- Stripe webhook 책임과 충돌하지 않음
- membership availability UX 보존

### PR C — PII-safe auth and billing logs

Purpose: production log에서 email과 stable identifiers를 제거한다.

예상 파일:

- membership resolve
- Customer Portal
- Checkout
- membership resolver
- auth provider diagnostics
- focused source/contract tests

### DB Read-only Inventory — 코드 PR 전 운영 확인

Purpose: Production RLS와 repository source의 drift를 확인한다.

필요 증거:

- tables, columns, foreign keys
- RLS enabled state
- policies and roles
- grants
- relevant functions and security definer/search_path
- migration history

비밀값과 row data는 수집하지 않는다.

### 후속 PR — RLS forward-only reconciliation

Production inventory 이후에만 작성한다. destructive migration, 기존 membership/history 삭제, 임의 policy drop을 금지한다.

### 별도 제품 결정 — BASIC media entitlement

Master Jang이 media 자체를 private entitlement로 보호할지 결정한 뒤 별도 architecture 작업으로 진행한다.

## 9. 완료 기준

P1-02를 RESOLVED로 변경하려면:

- cookie와 bearer identity contract가 하나의 helper와 tests로 고정됨
- bearer-only request에서 validated user와 RLS identity가 일치함
- authorization read path에서 service-role repair 없음
- unauthenticated 401, forbidden/inactive 403 또는 명시적 inactive result, unavailable 503 구분
- production PII log 제거
- BASIC server gate와 media entitlement 결정 기록
- focused tests, typecheck, lint, build, Preview 통과
- Production smoke verification과 rollback 기록

P1-03을 RESOLVED로 변경하려면:

- Production read-only RLS inventory 완료
- repository migration history와 drift report 완료
- owner read policy가 canonical identity에 정렬됨
- forward-only migrations와 post-deploy verification 존재
- destructive data change 없음

## 10. Rollback과 변경 제한

- 각 코드 PR은 독립 commit으로 revert 가능해야 한다.
- Auth/RLS 공통 helper 도입과 DB migration을 한 PR에 섞지 않는다.
- service-role key, JWT, access token, cookie, email, Stripe ID를 PR, log, screenshot, chat에 기록하지 않는다.
- 기존 membership, subscription, profile, challenge, Coach, Leader data를 삭제하지 않는다.
- Coach HOLD, Cron fail-closed, BASIC Garden bearer boundary를 약화시키지 않는다.

## 11. Mandatory Decision Test

| 질문 | 결과 | 이유 |
| --- | --- | --- |
| 사용자의 회복과 신뢰를 돕는가 | PASS | 로그인·멤버십 오판과 불필요한 장애를 줄인다. |
| agency와 선택권을 보존하는가 | PASS | 사용자 identity와 entitlement 판정을 투명하게 분리한다. |
| 개인정보와 동의를 보호하는가 | PASS | PII log와 public diagnostics를 최소화한다. |
| 복잡성보다 가치가 큰가 | PASS | 기존 BASIC Garden pattern과 read-only resolver를 재사용한다. |
| AI가 철학 또는 제품 결정을 확정하는가 | NO | BASIC media entitlement는 Master Jang의 결정을 요구한다. |
| 이 문서가 Production 변경을 승인하는가 | NO | 코드, DB, provider 설정 변경은 별도 PR과 검증을 요구한다. |

Decision: PASS for audit documentation only.
