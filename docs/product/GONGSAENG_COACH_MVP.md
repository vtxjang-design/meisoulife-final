# Gongsaeng Coach MVP

**Version:** 0.1

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
