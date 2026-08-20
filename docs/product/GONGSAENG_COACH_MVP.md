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
