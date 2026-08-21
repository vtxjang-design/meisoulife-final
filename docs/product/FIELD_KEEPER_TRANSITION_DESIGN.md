# Field Keeper Transition Design

**Version:** 0.1

**Decision date:** 2026-08-22

**Status:** `APPROVED FOR DESIGN — IMPLEMENTATION HOLD`

**Governed by:** `AGENTS.md`, `CONSTITUTION.md`, `docs/14_LSC_Charter.md`, and `docs/15_Gongsaeng_Platform_Governance.md`

## 1. Purpose

This document defines the safe product direction for replacing automatic, metric-based leader candidacy with the LSC **Field Keeper** role. It records design only. It does not authorize changes to leader eligibility code, Supabase fields, scheduled jobs, access, invitations, membership, or production behavior.

The Field Keeper protects the health of a voluntary living field. The role is a responsibility, not a rank, spiritual status, reward, membership benefit, or path to organizational power.

## 2. Current Conflict

The current implementation can infer leader candidacy from paid days, check-in count, and helpful-comment count. That structure conflicts with the Constitution and LSC Charter because payment and activity volume can become an automatic path to status.

The following implementation surfaces remain unchanged and on HOLD pending a separate approval:

- `lib/leader.ts`
- `app/leaders/page.tsx`
- `components/leader-growth-page-content.tsx`
- `app/api/cron/leader-scan/route.ts`

No current metric, database field, or automatic result should be treated as a constitutional definition of Field Keeper readiness.

## 3. Role Definition

A Field Keeper helps maintain:

- predictable and voluntary structure;
- consent, inclusion, and accessible participation;
- careful listening without spiritual or personal authority;
- clear boundaries and confidentiality expectations;
- calm response to disagreement, harm, and repair;
- freedom to pause, leave, disagree, or seek outside support; and
- return to ordinary life, relationships, community, nature, and Earth-conscious action.

A Field Keeper does not diagnose, teach from superior status, command personal decisions, recruit for reward, control membership, certify recovery, or determine awakening or spiritual attainment.

## 4. Readiness Evidence

Readiness is considered through qualitative, contextual evidence rather than automatic thresholds. A future human review may consider whether a person:

- practices recovery in daily life without presenting themselves as complete or superior;
- listens with humility and reflects without taking over another person's choices;
- respects refusal, privacy, disagreement, and non-participation;
- serves the field without using recruitment, payment, visibility, or closeness to leadership as leverage;
- can recognize limits and connect people to appropriate human or professional support;
- participates in repair after mistakes or harm; and
- can transfer or release responsibility without loss of identity or status.

Paid duration, attendance, check-ins, comments, referrals, sales, donations, recruitment, and time spent may never automatically grant the role. They may not be combined into a hidden readiness score.

## 5. Human Review Process

A future pilot proposal should use a small, documented human review:

1. The person receives a plain-language role description and may decline without penalty.
2. The person provides only the minimum information needed to discuss readiness and boundaries.
3. At least two accountable humans review the proposed responsibility, including one community-care perspective.
4. The review records strengths, support needs, conflicts of interest, duration, scope, and stop conditions without assigning a spiritual or recovery score.
5. Master Jang or a documented human delegate gives the final role approval.
6. The role begins as a time-bounded, reviewable pilot with a named support and complaint path.
7. Participants can provide protected feedback, and the responsibility may rotate, pause, transfer, or end.

AI may organize evidence or draft questions, but it may not select, rank, reject, promote, or remove a Field Keeper.

## 6. Data Boundary

The first implementation proposal should avoid a readiness score and store only the minimum operational record required for accountable human review. It must define exact fields, purpose, access roles, retention, correction, deletion, auditability, participant notice, and incident handling before code changes.

Personal disclosures, emotional content, Coach data, recovery choices, payment history, and private group conversations must not be used for Field Keeper selection.

## 7. Pilot Boundary and Stop Conditions

The first Field Keeper pilot should be limited to LSC #001 and approximately ten voluntary participants. It must pause if:

- participants experience pressure to attend, disclose, agree, purchase, recruit, or remain;
- payment or activity volume creates status or access;
- the role becomes permanent, personality-centered, or difficult to transfer;
- confidential information is used outside its stated purpose;
- AI or a metric makes a selection or removal decision; or
- the field cannot provide a safe complaint, repair, or exit path.

## 8. Success Measures

Primary evidence of health is whether participants can:

- choose their level of participation freely;
- maintain boundaries and disagree safely;
- experience listening and reciprocal care;
- return to ordinary life with more agency;
- report concerns without retaliation; and
- see the Field Keeper role rotate or end without loss of field stability.

Attendance, membership duration, engagement, recruitment, and growth are not primary success measures.

## 9. Rollback and Change Control

Because this record changes no product behavior, rollback is a Git revert of this document. Any future implementation must identify the exact code and data changes, migration and compatibility plan, tests, affected people, safeguards, rollback, operational owner, review date, and explicit approval.

The current numerical leader-candidacy implementation remains unchanged until that separate approval is recorded.

## 10. Mandatory Decision Test

| Question | Result | Reason |
| --- | --- | --- |
| Philosophical source and Constitution | PASS for design | The role is grounded in service, humility, agency, and accountable human approval. |
| Original Rhythm recovery | PASS for design | The role protects conditions for recovery rather than rewarding performance. |
| Brain Ownership and agency | PASS for design | Participation, refusal, feedback, transfer, and exit remain voluntary. |
| Gongshim and healthy symbiosis | PASS for design | Listening, reciprocity, boundaries, and repair define field health. |
| Earth Management | PASS for design | The design favors sufficient scale, shared responsibility, and non-extractive governance. |
| No dependency, hierarchy, coercion, or recruitment pressure | PASS for design | Automatic status, recruitment privilege, and permanent authority are prohibited. |
| Data minimization and human accountability | PASS for design; HOLD for implementation | Exact fields, access, retention, and review operations require a separate decision. |
| Production implementation | HOLD | Numerical leader code and data behavior require a separately approved transition plan. |

**Decision:** PASS for the Field Keeper transition design. **Implementation remains HOLD.**
