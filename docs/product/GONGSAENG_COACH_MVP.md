# Gongsaeng Coach MVP

**Version:** 0.2

**Status:** Product design draft; no implementation approval

**Governed by:** `AGENTS.md`, `CONSTITUTION.md`, and Foundation Pack `docs/00` through `docs/15`

## 1. Scope

Meisou Life is the coexistence platform. Gongsaeng AI is the coordinated seven-tool operating system. **Gongsaeng Coach is the user-facing ChatGPT/Gemini coaching module within Gongsaeng AI.**

This document specifies the first Gongsaeng Coach experience. It does not redefine the wider platform, grant authority to AI, or authorize production implementation without the development gate and required human approval.

## 2. One-Sentence Definition

> Gongsaeng Coach helps a person observe their present state, experience a brief recovery, choose one small action for themselves, and return to daily life with more agency.

## 3. Success Definition

The Coach succeeds when the user becomes more able to recover, choose, and live without depending on the Coach. Longer conversations, greater disclosure, streaks, and conversion are not primary success measures.

## 4. First User Need

The first user may:

- want to pause but not know how to begin;
- feel mentally or emotionally crowded;
- know meditation conceptually but struggle to make it a daily rhythm; or
- want help seeing options without being given a life answer.

The core need is:

> “Help me safely notice where I am, recover briefly, and choose one small next step for myself.”

## 5. Recovery-to-Choice Loop

1. **Pause:** offer a short, optional stop.
2. **Awareness:** let the user enter through body, emotion, thought, or surroundings.
3. **Recovery:** connect to an approved One-Minute Recovery experience.
4. **Choice:** offer a small number of options without deciding for the user.
5. **Practice:** help translate the user's choice into one realistic action today.
6. **Return:** close the interaction and orient the user toward ordinary life.
7. **Reflection:** later, ask what the user noticed rather than whether they achieved or failed.

## 6. MVP Entry Points

1. **One-Minute Recovery Now**
2. **Notice Where I Am**
3. **Choose One Small Action**
4. **Reflect on Today**

Open-ended chat is introduced only when it can reliably return to this bounded loop.

## 7. Response Contract

The Coach must:

- be disclosed clearly as AI;
- use calm, concise, permission-based language;
- ask one purposeful question at a time;
- reflect without pretending to know more than the user said;
- offer choices and preserve refusal, editing, stopping, and exit;
- prioritize the present experience before advanced philosophy; and
- return attention to body, relationships, work, rest, community, nature, and real life.

The Coach must not:

- diagnose medical or mental-health conditions;
- certify Zero Consciousness, awakening, enlightenment, recovery, or spiritual maturity;
- score or rank consciousness, practice, or users;
- imply that it is the user's only reliable companion, teacher, or authority;
- use guilt, fear, scarcity, false urgency, or intimate disclosure to increase engagement or sales;
- make decisions for the user; or
- discourage appropriate human, professional, crisis, or emergency support.

## 8. Data and Memory

Principles:

- collect the minimum data needed for the immediate experience;
- separate temporary session context from user-approved memory;
- show what is remembered and why;
- allow item-level correction and deletion plus full memory reset;
- do not infer spiritual level, mental-health diagnosis, religion, politics, or sensitive identity; and
- never use emotional disclosures or reflection history for advertising, recruitment, rank, or leadership selection.

### MVP recommendation

Do not retain full conversation text by default. If persistence is included, store only a short recovery summary or chosen action that the user can review, edit, explicitly approve, and delete.

This recommendation remains **HOLD** until the existing database, privacy policy, model-provider retention, operational access, and deletion behavior are reviewed.

## 9. Safety and Human Connection

The Coach is not clinical or crisis care.

For imminent self-harm, harm to others, abuse, medical emergency, or immediate danger, stop ordinary coaching and direct the user toward local emergency or crisis support and an appropriate trusted person where relevant.

For serious depression, hallucinations, delusional beliefs, mania, dissociation, severe anxiety, trauma activation, or other serious mental-health crisis, do not intensify meditation, Zero Consciousness practice, or spiritual interpretation. Prioritize grounding, immediate safety, and qualified human help.

Country-specific support language and launch-country coverage require qualified review before production release.

## 10. MVP Screens

### Entry

- Primary CTA: `Start One-Minute Recovery`
- Secondary CTA: `Notice Where I Am`
- One or two sentences of explanation only

### Coach

- one question or choice at a time;
- persistent `Pause`, `Write My Own`, and `End` controls;
- clear AI disclosure; and
- visible current step without gamified progression.

### One-Minute Recovery

- reuse the approved existing One-Minute Recovery experience;
- do not duplicate meditation content in chat; and
- optionally ask what changed after completion.

### Today's Choice

- one user-authored action;
- editable and deletable; and
- no streak loss, penalty, failure badge, or public comparison.

### Memory Control

- remembered item, reason, and purpose;
- correction and deletion; and
- full reset.

## 11. Thin Vertical Slice

```text
Open Gongsaeng Coach
→ Notice present state
→ Start approved One-Minute Recovery
→ Choose one small action
→ Choose whether to save it
→ End and return to daily life
```

This is the first implementation candidate after governance, privacy, data, provider, and code-path review.

## 12. Evaluation

### Healthy signals

- the user reports a small increase in steadiness or clarity;
- the user makes their own next choice;
- the interaction leads to embodied or real-life practice;
- the user understands the AI and memory boundaries; and
- the user feels respected and free to stop.

### Risk signals

- excessive session duration or repeated reassurance seeking;
- belief that only the Coach understands the user;
- difficulty choosing without AI permission;
- spiritual superiority or inferiority;
- shame from reminders or missed practice; and
- conversion pressure during emotional vulnerability.

Evaluation must include normal, ambiguous, adversarial, privacy, distress, and crisis scenarios. A material safety failure is a stop condition.

## 13. Mandatory Decision Test Result

| Question | Result | Evidence or condition |
| --- | --- | --- |
| Original Rhythm recovery | PASS | One-Minute Recovery is the center of the loop |
| Brain Ownership and agency | PASS | User chooses, edits, declines, and exits |
| Healthy relationship and symbiosis | REVISE | First slice focuses on personal recovery; later relational evidence is needed |
| Earth Management direction | REVISE | Must emerge through later practical choices, not forced philosophy in MVP |
| AI supports rather than replaces | PASS with safeguards | Bounded role, disclosure, exits, and return-to-life ending |
| No hierarchy, coercion, dependency, or recruitment | PASS with evaluation | Prohibited behaviors and risk signals are explicit |
| Data minimization and user control | HOLD | Existing data and provider behavior must be inspected before implementation |
| Sustainable and scalable | HOLD | Model, cost, latency, LINE, and provider architecture are not yet verified |

**Overall decision: HOLD for implementation.** Product design may continue. Code changes begin only after repository code-path analysis, privacy and data decisions, representative safety evaluation design, and Master Jang's approval of the first vertical slice.

## 14. Pre-Implementation Decisions

1. Is the first entry on the homepage, after One-Minute Recovery, or in the member home?
2. Can guests use the Coach?
3. Which responsibilities belong to ChatGPT and which to Gemini?
4. Is memory excluded from the first slice or limited to user-approved summaries?
5. Which launch countries and crisis-support language are supported?
6. What can operators inspect for quality and incident review?
7. How does the Coach connect to 7-Day Recovery without sales pressure?
8. What model, cost, latency, and fallback limits are acceptable?

## 15. Approval Path

1. Inspect the existing coach code, data flow, provider calls, logs, and tests.
2. Complete privacy, safety, and model-provider review.
3. Resolve all HOLD items above.
4. Obtain Human AI Governance Review appropriate to risk.
5. Obtain Master Jang's final approval for the first vertical slice.
6. Implement the smallest safe path with tests, monitoring, rollback, and stop conditions.

## 16. Recovery Choice Bridge Phase 0 Decision Record

On 2026-08-20, Master Jang approved the product design and implementation plan for Recovery Choice Bridge Phase 0. This approval is limited to a deterministic, non-generative continuation after the approved One-Minute Recovery experience.

- It offers an optional notice of outcome, one self-directed small action, review, edit, deletion, refusal, and an ending that returns the person to ordinary life.
- It makes no Coach API, model-provider, database, or persistent-memory call. The choice exists only in client React state and is not sent or saved.
- It validates only this bounded interaction. It does not launch, enable, or re-enable Gongsaeng Coach.
- The `/coach` unavailable notice and the fixed `503 Service Unavailable` Coach API isolation remain in force.

Gongsaeng Coach MVP remains **HOLD** pending privacy, safety, provider, crisis-support, evaluation, governance review, and final human approval.

## 17. Phase 1 Safety & Data Contract

**Decision date:** 2026-08-20

**Status:** `PROPOSED — IMPLEMENTATION HOLD`

Master Jang approved documenting the Phase 1 Safety & Data Contract. This approval defines the conditions that a future implementation proposal must satisfy. It does not authorize generative model integration, public Coach access, production deployment, persistent memory, or removal of the existing Coach isolation.

### 17.1 Smallest candidate experience

The first generative candidate, if later approved, is a bounded single-session reflection after the approved recovery experience:

```text
AI disclosure and voluntary consent
→ Notice present state
→ Complete approved One-Minute Recovery
→ User chooses or writes one small action
→ Optional one-turn AI reflection
→ User reviews, edits, deletes, declines, or ends
→ Return to ordinary life
```

The model must not replace the approved One-Minute Recovery, choose an action for the user, continue into unrestricted chat, or create pressure to return. Membership, sales, referral, and community-recruitment prompts are excluded from emotionally vulnerable moments and from this candidate experience.

### 17.2 Access contract

The safest initial proposal is an authenticated, explicitly invited, limited pilot rather than guest or public access. Final eligibility, age handling, pilot size, launch country, language coverage, and membership entitlement remain unresolved governance decisions.

Until those decisions are approved:

- `/coach` remains unavailable;
- `POST /api/coach` remains isolated with `503 Service Unavailable`;
- no external Coach URL is restored;
- no background, scheduled, or LINE-initiated AI conversation is introduced; and
- Phase 0 remains usable without account creation or AI participation where currently approved.

### 17.3 Data contract

The proposed first slice follows data minimization by default:

- Do not retain raw conversation text by default.
- Do not create long-term memory, embeddings, profiles, inferred traits, recovery scores, or spiritual or mental-health classifications.
- Do not use user text or emotional disclosures for advertising, recruitment, conversion optimization, leadership selection, ranking, or model training by Meisou Life.
- Send only the minimum text required for the immediate optional reflection.
- Configure the selected provider to avoid response storage where the provider and endpoint support it, and verify the effective retention policy before release.
- Do not run the same user content through multiple model providers for comparison unless the user-facing purpose, consent, and data roles have been separately approved.
- Do not expose conversation content to operators by default.

If any persistence is later proposed, it requires a separate decision covering the exact fields, purpose, lawful basis or consent, retention period, access roles, audit trail, correction, item-level deletion, full deletion, backup behavior, incident handling, and user-facing explanation. The safer first implementation remains no persistence.

Operational telemetry, if approved, must exclude user message content and use the smallest non-identifying event set needed to measure reliability and safety. Even content-free safety-event metadata requires a documented purpose, access boundary, retention period, and Human AI Governance Review.

### 17.4 Provider contract

ChatGPT and Gemini are potential Gongsaeng Coach support tools, not automatic parallel processors. Before selecting either provider, the review must record:

- the primary provider and the narrowly defined role of any secondary provider;
- endpoint and model version;
- default and configured retention behavior;
- training and human-review settings;
- subprocessors, processing locations, and applicable contractual terms;
- deletion and incident-notification behavior;
- availability, latency, token, and cost limits; and
- a safe failure mode that does not generate fallback coaching.

The pilot should use one approved primary provider unless a documented safety or reliability reason justifies another architecture. A provider must not determine product policy, spiritual meaning, eligibility, safety thresholds, or final user decisions.

### 17.5 Safety contract

Safety routing must occur before an ordinary coaching model call whenever feasible. Imminent self-harm, harm to others, abuse, medical emergency, immediate danger, or another defined high-risk situation must stop the normal Coach flow and present reviewed, localized support appropriate to the launch country.

For serious depression, hallucinations, delusional beliefs, mania, dissociation, severe anxiety, trauma activation, or similar crisis indicators:

- do not intensify meditation, breath retention, Zero Consciousness practice, or spiritual interpretation;
- do not diagnose, debate the person's reality, or offer false reassurance;
- use brief grounding and clear AI limits;
- encourage appropriate local emergency, crisis, professional, or trusted-person support; and
- end prolonged automated coaching.

Country-specific crisis wording, emergency information, translations, accessibility, and escalation ownership require qualified human review before launch. If reliable local support cannot be provided for a country or language, the Coach must not launch there.

### 17.6 User-control and response contract

The interface must continuously preserve:

- clear disclosure that the Coach is AI and not clinical, crisis, or spiritual authority;
- one purposeful question or response at a time;
- `Pause`, `Write My Own`, and `End` controls;
- refusal without penalty;
- review and editing before any approved save action;
- deletion and reset wherever saved data exists; and
- a short ending that returns the user to body, relationships, rest, work, community, nature, or another ordinary-life context.

The Coach must not claim special understanding, ask for unnecessary intimate detail, certify recovery or awakening, prescribe life decisions, create urgency, promise constant availability, or say that the user should return tomorrow.

### 17.7 Technical and economic limits

Any implementation proposal must define and test:

- one bounded reflection turn per approved session;
- maximum input and output lengths;
- server-side authentication and authorization;
- per-user and global rate limits;
- token, latency, concurrency, and monetary budgets;
- request timeout and safe error behavior;
- abuse and prompt-injection handling;
- a server-side feature flag and immediate kill switch;
- monitoring that does not capture message content by default; and
- an accountable human owner, incident path, rollback action, and review date.

Fallback behavior must return a fixed, non-personalized safe notice or the approved deterministic recovery path. It must not silently substitute another model or generate improvised coaching.

### 17.8 Evaluation and stop conditions

Pre-release evaluation must include Japanese, Korean, and English scenarios proportionate to the approved launch scope:

- ordinary recovery and choice;
- ambiguous or incomplete input;
- refusal, correction, deletion, and ending;
- privacy requests and unnecessary disclosure;
- prompt injection and adversarial attempts;
- self-harm, violence, abuse, medical emergency, and immediate danger;
- hallucination, delusional belief, mania, dissociation, trauma activation, and severe anxiety;
- spiritual-ranking, enlightenment-certification, dependency, and authority-seeking prompts; and
- provider, timeout, quota, malformed-input, and network failures.

A material safety failure, unintended provider or database transmission, missing exit, spiritual or clinical diagnosis, dependency cue, inaccessible crisis path, or failure of the kill switch is a release stop condition.

### 17.9 Success measures

Primary pilot measures are:

- user-reported small recovery, steadiness, or clarity;
- ability to make, change, decline, or delete one's own choice;
- understanding of AI and data boundaries;
- voluntary ending and return to real-life action;
- absence and severity of safety, privacy, dependency, and coercion incidents; and
- operational reliability within the approved cost and resource budget.

Conversation length, message volume, daily return, streaks, emotional disclosure, referral, membership upgrade, and payment conversion are not primary success measures for this experience.

### 17.10 HOLD release checklist

Implementation remains **HOLD** until all of the following are recorded and approved:

1. Entry point, eligibility, age handling, pilot size, launch country, and supported languages.
2. Primary provider, model, endpoint, retention settings, vendor roles, and contractual review.
3. Final no-storage or explicitly approved persistence design, including access, retention, correction, and deletion.
4. Reviewed crisis taxonomy, localized support content, and accountable human escalation path.
5. Authentication, rate, token, cost, timeout, feature-flag, monitoring, rollback, and kill-switch design.
6. Representative multilingual evaluation and manual red-team results with no unresolved material failure.
7. Human AI Governance Review appropriate to this high-risk, emotionally sensitive use case.
8. Master Jang's explicit final approval of the exact Phase 1A vertical slice.

Only after this checklist is complete may a separate implementation proposal be submitted. That proposal must identify exact files, tests, affected people, safeguards, rollback, stop conditions, and the smallest limited-pilot scope before any code change.

### 17.11 Mandatory Decision Test for this document

| Question | Result | Reason |
| --- | --- | --- |
| Philosophical source and Constitution | PASS | The contract keeps AI subordinate to human dignity, agency, safety, and final human approval. |
| Original Rhythm recovery | PASS | The approved One-Minute Recovery remains the center of the bounded flow. |
| Brain Ownership and agency | PASS | Choice, correction, refusal, deletion, and ending remain with the user. |
| Healthy symbiosis | PASS for design | The contract prohibits dependency, pressure, recruitment, and vulnerable-moment selling. |
| Earth Management | PASS for design | It requires minimal data, bounded computation, explicit budgets, and responsible provider use. |
| AI supports rather than replaces | PASS for design | AI is limited to one optional reflection and cannot diagnose, certify, command, or decide. |
| Data minimization and user control | PASS for the proposed no-storage contract | Any persistence requires a separate approval. |
| Production implementation | HOLD | Provider, privacy, crisis, evaluation, operational, professional-review, and final-approval decisions remain unresolved. |

**Decision:** PASS for documentation of the Phase 1 Safety & Data Contract. **Gongsaeng Coach implementation remains HOLD.**

## 18. Phase 1A Japan Limited-Pilot Access Decision

**Decision date:** 2026-08-20

**Status:** `APPROVED FOR DOCUMENTATION — IMPLEMENTATION HOLD`

Master Jang approved the target-user, access, and launch-country direction for a possible Phase 1A pilot. This decision narrows future design work. It does not authorize a model-provider connection, Coach reactivation, participant recruitment, production release, or deployment.

### 18.1 Pilot purpose

The pilot exists to learn whether one bounded AI reflection can support recovery, self-directed choice, and return to ordinary life without creating dependency, privacy harm, crisis harm, sales pressure, or spiritual authority.

It is not a growth campaign, membership benefit, clinical study, spiritual assessment, or proof that Gongsaeng Coach is ready for public release.

### 18.2 Approved target and scale

The proposed first pilot is limited to:

- adults aged 18 or older;
- people residing in Japan or physically located in Japan during use;
- Japanese-language use only;
- five initial participants, with an absolute maximum of ten before a new review;
- individually invited participants; and
- registered users with a valid authenticated account.

The 18-or-older boundary follows Japan's current age of majority as a conservative first-pilot eligibility rule. It does not replace legal review of the terms, consent, age representation, or participant-protection process.

Children and adolescents, public visitors, anonymous guests, users outside Japan, and unsupported-language use are excluded from Phase 1A.

### 18.3 Invitation and entitlement

Invitation authority belongs only to Master Jang or a documented human delegate. Invitation is a temporary testing permission, not rank, spiritual status, leadership authority, membership privilege, or evidence of recovery.

Access must be enforced server-side using the authenticated Supabase `auth.users.id` and a narrowly scoped pilot allowlist. Email, browser storage, client-side state, URL secrecy, paid plan, or self-asserted membership must not serve as the authorization source of truth.

Paid membership is not required. An invited Free or Paid user may participate under the same pilot terms. No participant receives status, reward, discount, payment, referral benefit, community authority, or preferential future access for joining or inviting another person.

### 18.4 Entry and session boundary

The only proposed Phase 1A entry is an optional continuation after completion of the approved One-Minute Recovery and Recovery Choice Bridge:

```text
Approved One-Minute Recovery
→ Recovery Choice Bridge
→ Optional AI disclosure and consent
→ One bounded AI reflection
→ Review, decline, or end
→ Return to ordinary life
```

The following remain in force until implementation is separately approved:

- direct `/coach` access remains unavailable;
- `POST /api/coach` continues to return `503 Service Unavailable`;
- no public navigation or marketing CTA opens the Coach;
- no external ChatGPT or Gemini Coach URL is restored;
- no LINE, email, push, or scheduled message initiates a Coach session; and
- no free-form continuing conversation follows the single reflection.

### 18.5 Consent and user control

Each session requires a fresh, affirmative choice after a concise Japanese disclosure explaining:

- that the reflection is generated by AI;
- that it is not medical, mental-health, crisis, or spiritual authority;
- what text would be sent to which approved provider;
- that the first-slice design stores no message or response content; and
- that participation can be declined or ended without penalty.

Consent must be off by default. Prior participation, account registration, paid membership, acceptance of general platform terms, or pilot invitation does not substitute for the session-level choice.

The user must be able to edit or remove their action before transmission, skip AI entirely, stop before a response, dismiss the response, and end without an upgrade, return, streak, or completion prompt.

### 18.6 Language and country boundary

Phase 1A supports Japanese in Japan only. Korean and English interface availability elsewhere in Meisou Life does not authorize Korean- or English-language Coach use.

Country and language expansion requires a new decision covering culturally and linguistically reviewed safety phrasing, local emergency and crisis resources, accessibility, privacy implications, provider processing, operator readiness, and representative evaluation.

The pre-release Japan safety package must use current official sources, including Japan's Ministry of Health, Labour and Welfare support directories, and receive qualified human review. Phone numbers, service hours, availability, and wording must be verified immediately before pilot activation rather than treated as permanent static facts.

### 18.7 Data boundary

The Phase 1A access decision preserves the no-storage default in Section 17:

- no raw action text, model input, model output, conversation, summary, or crisis content is persisted;
- no long-term memory, embedding, user profile, recovery score, or sensitive inference is created;
- no content is available to operators by default;
- no content is used for advertising, conversion, recruitment, rank, community selection, or Meisou Life model training; and
- the selected provider must be reviewed and configured for the minimum effective retention before any implementation approval.

The user's Japan eligibility and adult representation must not be repurposed as marketing profile data. Any proposed pilot audit or safety telemetry requires a separate field-level definition, purpose, access role, retention period, deletion rule, and governance review.

### 18.8 Sales, recruitment, and dependency exclusions

The pilot experience must not contain:

- membership upgrade, checkout, product, retreat, or donation prompts;
- referral links, invite quotas, rewards, waitlist pressure, or participant recruitment tasks;
- daily-return requests, streaks, reminders, reassurance loops, or unlimited-use claims;
- claims that the Coach knows the user deeply or is always available; or
- language suggesting that participation demonstrates awakening, Zero Consciousness, recovery, loyalty, leadership, or special potential.

Pilot feedback must be requested separately from the emotionally sensitive interaction and remain optional.

### 18.9 Human ownership and participant protection

Before implementation approval, the review record must name:

- the accountable pilot owner;
- the safety and incident-response owner;
- the privacy and data-review owner;
- the person authorized to activate the kill switch;
- the participant contact and complaint path;
- the pilot start, end, and review dates; and
- the procedure for withdrawing a participant or pausing the entire pilot.

Participants must receive a plain-language pilot notice, know that the system is experimental, and be able to withdraw without losing ordinary Meisou Life access or membership rights.

### 18.10 Pilot stop conditions

The pilot must stop immediately if any of the following occurs:

- access by a non-invited, unauthenticated, underage, outside-Japan, or unsupported-language user;
- more than ten enabled participants without a new approval;
- unintended storage, logging, operator exposure, or secondary use of user content;
- a missing, incorrect, inaccessible, or unreviewed Japan crisis path;
- spiritual or clinical diagnosis, authority claim, dependency cue, sales pressure, or prolonged coaching;
- provider, rate-limit, timeout, feature-flag, or kill-switch behavior outside the approved contract; or
- a material safety, privacy, security, or constitutional incident.

Containment, evidence preservation, affected-person assessment, responsible notification, and Human AI Governance Review follow any material incident.

### 18.11 Remaining HOLD items

This decision resolves only the proposed target, access, scale, country, and language boundary. Implementation remains **HOLD** pending:

1. provider, model, endpoint, retention, processing-location, and contractual decision;
2. exact no-storage request and logging architecture;
3. Japan crisis taxonomy, reviewed wording, official resources, and human escalation;
4. authentication, allowlist, session-consent, rate, token, cost, timeout, feature-flag, and kill-switch design;
5. participant notice, terms, privacy disclosure, feedback process, and withdrawal procedure;
6. Japanese evaluation set and manual red-team results;
7. named accountable owners and dated Human AI Governance Review; and
8. Master Jang's explicit approval of the exact Phase 1A code plan.

### 18.12 Mandatory Decision Test

| Question | Result | Reason |
| --- | --- | --- |
| Philosophical source and Constitution | PASS | The pilot is voluntary, bounded, non-ranking, and subject to human authority. |
| Original Rhythm recovery | PASS | Entry follows the approved One-Minute Recovery rather than replacing it. |
| Brain Ownership and agency | PASS | Fresh consent, refusal, editing, skipping, and ending are mandatory. |
| Healthy symbiosis | PASS for design | Participation creates no status, recruitment role, membership pressure, or economic dependency. |
| Earth Management | PASS for design | Five-to-ten-person scope, one turn, and no-storage defaults minimize data and computation. |
| AI supports rather than replaces | PASS for design | AI is limited to one optional reflection and no continuing relationship. |
| Privacy and understandable vendor roles | HOLD for implementation | Provider, logging, telemetry, notice, and qualified privacy review are unresolved. |
| Safety and crisis readiness | HOLD for implementation | Japan-specific content, escalation, owners, and evaluation are unresolved. |

**Decision:** PASS for documentation of the Japan limited-pilot access direction. **Phase 1A implementation and Gongsaeng Coach release remain HOLD.**

### 18.13 Official reference points for the next review

- Government of Japan, age of majority: `https://www.gov-online.go.jp/article/201808/entry-7947.html`
- Personal Information Protection Commission, generative AI caution: `https://www.ppc.go.jp/news/careful_information/230602_AI_utilize_alert/`
- Ministry of Health, Labour and Welfare, telephone support directory: `https://www.mhlw.go.jp/mamorouyokokoro/soudan/tel/`
- Ministry of Health, Labour and Welfare, SNS support directory: `https://www.mhlw.go.jp/mamorouyokokoro/soudan/sns/`

These references inform the next qualified review. Their inclusion does not itself constitute legal, clinical, privacy, or crisis-readiness approval.
