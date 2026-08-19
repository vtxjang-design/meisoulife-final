# Meisou Life Product Architecture

**Version:** 1.0
**Purpose:** A product-level map of how Meisou Life delivers recovery, belonging, and responsible membership.

## 1. Product Promise

Meisou Life is a coexistence platform that integrates meditation, rhythm, AI, membership, community, sustainable economics, and Earth Management. It supports repeatable daily practice, community connection, and AI-assisted reflection. The experience is designed around HROS: help a person arrive, regulate, choose, and return to life.

The primary user experience flow is:

`Pause → Awareness → Recovery → Daily Rhythm → Consciousness Sovereignty → Coexistence Practice → Earth Citizenship`

Korean user-facing reference: `멈춤 → 알아차림 → 회복 → 생활 리듬 → 의식 주권 → 공생 실천 → 지구시민`

This is a supportive orientation, not a compulsory path, spiritual hierarchy, score, or membership gate.

### Platform and Gongsaeng AI boundary

- **Meisou Life:** the complete coexistence platform and user experience.
- **Gongsaeng AI:** the coordinated operating system of approved platform, content, coaching, development, economic, automation, and community tools.
- **Gongsaeng Coach:** the user-facing ChatGPT/Gemini coaching module within Gongsaeng AI.

The current seven-tool map is:

| Tool or layer | Platform function |
| --- | --- |
| Vercel | Application delivery and global platform operation |
| YouTube / Instagram / TikTok | Short-form recovery discovery and voluntary entry |
| ChatGPT | Chief-of-staff analysis, alignment, product and operational support, and Gongsaeng Coach |
| Gemini | Complementary analysis and Gongsaeng Coach support |
| Codex | Technical implementation, integration, automation, testing, security, GitHub, and Vercel operations |
| Stripe | Transparent subscription, cancellation, and sustainable-economy infrastructure |
| LINE | User-controlled reminders and community connection |

Tools do not operate as independent growth silos. They must support one voluntary journey from discovery to recovery, daily life, informed membership, and coexistence.

## 2. First Experience: One-Minute Recovery

The first product experience begins with **One-Minute Recovery**. It must be simple, safe, accessible, and useful without philosophical knowledge or account creation pressure.

| Time | Experience |
| --- | --- |
| 10 seconds | Pause. Create a small moment of inner space. |
| 20 seconds | Notice the breath and body. |
| 20 seconds | Observe thoughts and emotions without judgment. |
| 10 seconds | Choose one small conscious action for today. |

Suggested completion message:

> I have paused and returned to my center.
> I will carry this small recovery into the way I live today.

The experience must make stopping, skipping, or choosing another practice easy. It must not promise transformation, assess spiritual condition, reward excessive use, or frame a missed practice as failure.

## 3. Experience Layers

| Layer | Purpose | Examples |
| --- | --- | --- |
| Entry | Make beginning safe and simple | Home, language choice, clear value and access information |
| Practice | Provide small, repeatable recovery experiences | Daily meditation, breathing, themed gates, audio guidance |
| Reflection | Help users notice and choose | Gongsaeng Coach, journaling prompts, progress reflection |
| Belonging | Support respectful shared practice | Community, retreats, member spaces |
| Membership | Sustain reliable access and trust | Pricing, checkout, account, entitlement, support |
| Stewardship | Govern safety and learning | Moderation, analytics, AI review, feedback, incident response |

## 4. Core User States

The product must recognize and clearly serve:

- Guest: can discover Meisou Life and access designated free experiences.
- Registered free user: can retain progress and receive the free-tier experience.
- Paid member: receives entitled member content and community access.
- LSC Facilitator / Field Keeper: supports a voluntary living field within time-bounded, reviewable, non-ranking responsibilities.
- Higher-plan member: receives only the additional experiences transparently defined by their plan; plan level does not create spiritual or community authority.
- Administrator or steward: operates with least-privilege access and auditability.

Authentication is the identity source of truth. Membership state is the entitlement source of truth. Product surfaces must handle loading, error, expired, and changed-plan states clearly without exposing unauthorized content.

## 5. Functional Domains

### Practice domain

Delivers guided experiences with calming pacing, accessible controls, language consistency, clear completion states, and minimal distraction. It must support stopping, pausing, and returning without shame.

### Account and membership domain

Manages sign-up, login, account recovery, billing, subscriptions, and entitlement. It must be transparent about price, renewal, cancellation, and access changes.

### Gongsaeng Coach domain

Provides bounded, disclosed, non-clinical support under the AI Oath. It must use the least personal data necessary and offer escalation where needed.

### Community domain

Connects members to shared practice with clear norms, moderation, reporting, and referral pathways.

### Operations domain

Supports content management, support, analytics, release management, and governance without compromising member privacy or platform reliability.

## 6. Architecture Principles

1. **Calm by default:** Reduce cognitive load, visual noise, and unnecessary prompts.
2. **Trustworthy state:** Auth, billing, and access are explicit and consistent.
3. **Progressive disclosure:** Show only the complexity needed for the present action.
4. **Multilingual integrity:** Japanese, Korean, and English experiences preserve intent, safety meaning, and pricing clarity.
5. **Accessibility:** Design for keyboard access, readable contrast, captions or transcripts where relevant, and varying sensory needs.
6. **Privacy by design:** Limit collection, access, retention, and exposure of personal data.
7. **Resilient operations:** Handle failure visibly, safely, and recoverably.
8. **Safe progression:** Introduce deeper philosophy only with context, choice, and clear non-clinical boundaries.

### Progressive philosophical learning

The entry experience uses simple, universal language. Zero Consciousness, Return to Origin (復本), and Yullyeo must not be centered on the first onboarding screen or required for participation. They are introduced progressively in voluntary deeper-learning paths in this order:

1. Pause
2. Awareness
3. Recovery
4. Life Rhythm
5. Consciousness Sovereignty
6. Coexistence
7. Zero Consciousness
8. Return to Origin (復本)
9. Yullyeo
10. Cheon-Ji-In Spirit
11. Earth Citizenship
12. Earth Management
13. Coexistence Civilization

All such content must distinguish contemplative philosophy from medical and psychological treatment. It must not claim to diagnose, guarantee, or certify an inner experience.

## 7. High-Level System Boundaries

```text
Member experience
  ├─ Practice and content
  ├─ Account and membership UI
  ├─ Gongsaeng Coach and reflection
  └─ Community pathways

Platform services
  ├─ Application and API layer
  ├─ Authentication and membership data
  ├─ Payment processing
  ├─ AI provider integration
  └─ Notifications and support operations

Governance layer
  ├─ HROS and content standards
  ├─ Privacy and security controls
  ├─ AI Executive Council support and Human AI Governance Review
  └─ Earth Management assessment
```

## 8. Product Quality Measures

Measure reliability, accessibility, successful access, completion without pressure, user-reported steadiness, support burden, trust signals, and safety incidents. Engagement and revenue are important operational indicators, but cannot alone define product health.

## 9. Change Control

Changes affecting identity, payment, membership, sensitive data, AI behavior, safety messaging, or access require risk assessment, testing, owner approval, and a rollback plan. Material AI changes also require the appropriate Human AI Governance Review and human approval.
