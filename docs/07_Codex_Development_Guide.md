# Codex Development Guide

## 1. Purpose

This guide defines how contributors use Codex and AI-assisted development to build Meisou Life responsibly. It supplements repository instructions and never overrides production safeguards, security requirements, or the Operating Constitution.

## 2. Development Ethic

Use Codex to improve clarity, safety, and delivery—not to bypass understanding or accountability. The human contributor remains responsible for requirements, review, testing, data handling, and the consequences of changes.

## 3. Before Making Changes

1. Read `AGENTS.md`, `CONSTITUTION.md`, and the relevant Foundation Pack and product documents.
2. Apply and record the Mandatory Decision Test before implementation.
3. Flag philosophical or governance conflicts before changing code; pause if they remain unresolved.
4. Inspect the affected code path and current tests before proposing a change.
5. Identify user impact, especially for authentication, payments, membership, AI, privacy, and community safety.
6. State the smallest safe scope and the validation plan.
7. Preserve unrelated user changes in the working tree.

Korean development gate:

- 구현을 시작하기 전에 `AGENTS.md`, `CONSTITUTION.md`, 관련 Foundation Pack 문서를 먼저 읽는다.
- 구현 전에 Mandatory Decision Test(필수 의사결정 검증)를 적용하고 결과를 기록한다.
- 코드를 변경하기 전에 철학적 또는 거버넌스상의 충돌을 식별하고 명확히 보고한다.

## 4. Protected Product Areas

Treat the following as high-risk infrastructure:

- Supabase authentication and account identity.
- Stripe checkout, webhook handling, and subscription state.
- Membership access and entitlement logic.
- Personal data, secrets, logging, and analytics.
- AI prompts, safety boundaries, and escalation behavior.
- Localization that changes legal, pricing, or safety meaning.

For these areas, prefer small backward-compatible changes, explicit review, and production-like verification. Do not introduce parallel sources of truth.

## 5. Codex Workflow

### Understand

Ask Codex to locate relevant files, trace data flow, summarize existing behavior, and identify risks. Treat summaries as leads to verify, not final truth.

### Plan

Write an implementation plan that names files, behavior changes, rollback strategy, and tests. For material AI or user-safety changes, route through Human AI Governance Review and the required human approval.

### Implement

Keep edits narrow. Follow project conventions. Use secure defaults, explicit types, accessible UI, and calm user-facing language. Do not place secrets in source, documentation, logs, or prompts.

Codex serves the delegated CTO function for technical implementation, integration, automation, testing, security, GitHub, and Vercel operations. It is not the philosophical founder, Civilization Architect, spiritual authority, or final decision-maker. Material philosophical, constitutional, platform, product, economic, and community-architecture decisions require Master Jang's final human approval.

### Verify

Run the relevant lint, type, unit, integration, and build checks available in the project. Review diffs for accidental scope expansion. Verify key user paths manually when risk warrants it.

### Document

Record user-visible changes, assumptions, migrations, operational steps, and known limitations. Update the relevant Foundation Pack document when governance or architecture changes.

## 6. Prompting Standard

Good development prompts provide the goal, constraints, existing context, acceptance criteria, and prohibited changes. Example constraints include: “do not modify payment logic,” “preserve current API behavior,” “write tests,” and “return a diff summary.”

Never include production secrets, full sensitive user records, or unnecessary personal data in a prompt.

## 7. Code Quality Requirements

- Prefer understandable code over cleverness.
- Validate inputs at trust boundaries.
- Handle errors explicitly and avoid leaking internal detail to users.
- Maintain accessibility, localization, and responsive behavior.
- Add or update tests for behavior changes where practical.
- Avoid unrelated refactors in production fixes.
- Review generated code for dependency, license, security, and maintenance implications.

## 8. AI-Specific Development Requirements

For user-facing AI features, follow the AI Oath and Gongsaeng AI Guide. Prompts must define role limits, prohibited claims, safety escalation, truthful disclosure, and privacy boundaries. They must not diagnose or score Zero Consciousness, recovery, awakening, enlightenment, or spiritual maturity. Evaluate representative normal, ambiguous, adversarial, and distress scenarios before release.

## 9. Definition of Done

A change is done when it meets acceptance criteria, relevant checks pass, the diff has been reviewed, risks are documented, rollback is understood, and any required governance review is complete. A completed code generation is not a completed engineering task.

## 10. Escalation

Pause and seek human review when requirements are unclear; user safety, privacy, payments, or access may be affected; a change needs new authority; tests reveal unexpected behavior; or the requested work conflicts with the Foundation Pack.
