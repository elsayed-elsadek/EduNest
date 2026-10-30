# EduNest Frontend — Priorities, Dependencies & Delivery Sequence

| Field | Value |
|---|---|
| Planning date | 2026-10-30 |
| Scope | Frontend production readiness (FE-EPIC-01 … FE-EPIC-07) |
| Task set | 26 tasks, 5 subtasks (FE-006A/B/C, FE-012A/B) |
| Total effort | **55–89 person-days** (one experienced frontend engineer; excludes review latency) |
| Release-critical effort | **36–58 person-days** (Tier 1 below) |
| Verdict dependency | No production release until Tier 1 is closed with evidence |

This document explains **what to do first, what can run in parallel, what blocks what, and what must be true before a go/no-go decision**. It is the scheduling companion to `frontend-epics-and-tasks.md` and the policy companion to `frontend-release-approval.md`.

---

## 1. Priority model

Priority answers **how severe is the gap**. The release gate answers **can we ship without it**. They are related but not identical: a P1 security or verification gap can still be a hard release gate.

| Priority | Definition | Handling |
|---|---|---|
| **P0** | Release blocker. Shipping without it produces a broken, unverifiable, or unsafe production build. | Must close before go/no-go; no waiver except a signed RA + PO exception for a non-security item |
| **P1** | High. Materially affects security, quality confidence, or core journeys. | Required before production unless a written, owned, dated waiver is approved |
| **P2** | Important. Performance/UX debt with a workaround or low immediate blast radius. | May ship after launch with a ticket and monitoring |
| **P3** | Optional / product-decision dependent. | Post-launch; not a release input |

| Release gate | Meaning |
|---|---|
| **Hard** | Must be closed with evidence; no waiver for security/auth/build items |
| **Waiver** | Required, but a documented exception with owner and remediation date is possible |
| **Post-launch** | Explicitly deferred; must not affect Tier 1 safety |

---

## 2. Priority summary

| Priority | Tasks | Count | Effort (pd) |
|---|---|---:|---:|
| P0 | FE-001, FE-002, FE-003, FE-006, FE-007, FE-008, FE-009, FE-012, FE-019, FE-020, FE-026 | 11 | 21–34 |
| P1 | FE-004, FE-005, FE-010, FE-011, FE-013, FE-014, FE-015, FE-016, FE-021, FE-022, FE-025 | 11 | 25–40 |
| P2 | FE-017, FE-018, FE-023 | 3 | 7–11 |
| P3 | FE-024 | 1 | 2–4 |
| **Total** | | **26** | **55–89** |

**Tier 1 (hard release gate) — 18 tasks, 36–58 pd:** all P0 plus FE-010, FE-011, FE-013, FE-014, FE-015, FE-021, FE-025.

Rationale: the P1 additions are not optional polish. They close XSS sinks, prevent secret leakage, provide the auth/role/journey safety net, make failures visible, and prove dependency safety. Shipping without them would make the P0 work unverifiable in production.

**Tier 2 (waiver required) — 4 tasks, 10–16 pd:** FE-004 (TODO/dead UI), FE-005 (dependency hygiene), FE-016 (bundle budgets), FE-022 (full a11y remediation).

Waiver conditions: no S1/S2 impact; axe critical issues = 0; no unused dependency with a known CVE; bundle within an agreed ceiling. Otherwise they become hard gates.

**Tier 3 (post-launch) — 4 tasks, 9–15 pd:** FE-017 (render/list optimization), FE-018 (image audit), FE-023 (full browser matrix), FE-024 (locale/timezone). At minimum, a two-browser smoke (Chrome + Safari/iOS) must pass before launch even if the full FE-023 matrix is deferred.

---

## 3. Master task table

`Depends on` = cannot start/finish without. `Blocks` = downstream work that cannot close first.

| ID | Task | Epic | Priority | Gate | Effort | Depends on | Blocks | Track | Milestone |
|---|---|---|---|---|---:|---|---|---|---|
| FE-001 | Reproducible verification baseline + CI | 01 | P0 | Hard | 1–2 | — | 002, 012, 019, 020, 026 | A | M0–M1 |
| FE-002 | Fix TS/ESLint, remove dead modules | 01 | P0 | Hard | 3–5 | 001 | 004, 012, 020, 022 | A | M1 |
| FE-003 | Remove console noise / sensitive logs | 01 | P0 | Hard | 1–2 | 001 | — (feeds SEC-06 evidence) | A | M1 |
| FE-004 | Resolve TODO/FIXME and dead UI | 01 | P1 | Waiver | 2–4 | 002 | — | A | M3 |
| FE-005 | Dependency hygiene and metadata | 01 | P1 | Waiver | 1–2 | 001, 002 | 016, 025 | A | M1–M2 |
| FE-006 | Env contract + API base URL | 02 | P0 | Hard | 2–3 | 001 | 007, 008, 010, 011, 013, 019, 020 | B | M2 |
| FE-007 | Remove raw fetch/localhost; unify auth header | 02 | P0 | Hard | 2–3 | 006 | 008, 013, 014 | B | M2 |
| FE-008 | Session and token lifecycle hardening | 02 | P0 | Hard | 3–5 | 006, 007; backend contract | 009, 013 | B | M2 |
| FE-009 | Route guard and admin surface hardening | 02 | P0 | Hard | 2–3 | 008; backend RBAC evidence | 014, 020 | B | M2–M3 |
| FE-010 | Close XSS / unsafe render sinks | 02 | P1 | Hard | 2–3 | 006 | — (feeds SEC-06) | B | M3 |
| FE-011 | Secrets and env hygiene guardrails | 02 | P1 | Hard | 1 | 006 | 025 | B | M2 |
| FE-025 | Dependency vulnerability triage | 02 | P1 | Hard | 1–3 | 001, 005 | 026 | B | M2 |
| FE-012 | Vitest + RTL harness | 03 | P0 | Hard | 2–3 | 001, 002 | 013, 014, 015 | C | M1–M2 |
| FE-013 | Auth journey unit + E2E coverage | 03 | P1 | Hard | 3–5 | 006, 008, 012 | 014, 020 | C | M3 |
| FE-014 | Critical role journeys + failure E2E | 03 | P1 | Hard | 4–6 | 007, 009, 012, 013, 015 | 020 | C | M3–M4 |
| FE-015 | Error boundaries, offline/timeout, 404 | 07 | P1 | Hard | 2–3 | 012 | 014, 021 | C/E | M3 |
| FE-021 | Error tracking and frontend monitoring | 07 | P1 | Hard | 2–3 | 015, 019 | 026 | E | M4 |
| FE-019 | SPA hosting config (rewrite/cache/headers) | 05 | P0 | Hard | 2–3 | 001, 006; host decision | 020, 021, 026 | E | M3–M4 |
| FE-020 | Staging deployment + smoke pack | 05/07 | P0 | Hard | 2–3 | 002, 006–009, 013–015, 019 | 026 | E | M4 |
| FE-026 | Go/no-go, rollback, post-deploy verification | 07 | P0 | Hard | 1–2 | All Tier 1; 020, 021 | Release | E | M5 |
| FE-016 | Bundle budgets + lazy-loading audit | 04 | P1 | Waiver | 3–4 | 001, 005 | 017, 018, 023 | D | M4 |
| FE-017 | Render/list optimization | 04 | P2 | Post-launch | 3–5 | 016 | — | D | Post |
| FE-018 | Image/asset optimization audit | 04 | P2 | Post-launch | 2–3 | 016 | — | D | Post |
| FE-022 | Accessibility remediation | 06 | P1 | Waiver | 4–6 | 002, 012 | 023 | D | M4 |
| FE-023 | Responsive + browser matrix | 06 | P2 | Post-launch | 2–3 | 016, 022 | — | D | Post |
| FE-024 | Locale/date/timezone consistency | 06 | P3 | Post-launch | 2–4 | Product decision | — | D | Post |

**Subtasks:** FE-006A (env contract, 1 pd), FE-006B (client/service migration, 1 pd), FE-006C (asset URL resolver, 0.5–1 pd); FE-012A (harness, 1 pd), FE-012B (smoke tests, 1–2 pd). FE-019A/B are workstreams inside FE-019, not separate issues.

---

## 4. Critical path

```
FE-001 → FE-002 → FE-006 → FE-007 → FE-008 → FE-009 → FE-013 → FE-014 → FE-020 → FE-026
                                   ↘ FE-012 ↗                         ↗
FE-019 ─────────────────────────────────────────────────────────────┘
```

| Path segment | Why it is critical | Cannot be compressed by |
|---|---|---|
| FE-001 → FE-002 | Nothing can be verified until install/typecheck/build works | Parallel headcount helps only after baseline exists |
| FE-002 → FE-006 | Config refactor touches the same service files; doing it on a broken tree creates conflicts | Sequential merge recommended |
| FE-006 → FE-007 → FE-008 | Each depends on the previous contract: base URL → request layer → session behavior | Backend contract latency |
| FE-008 → FE-009 | Guards depend on trustworthy session/role state | Security review |
| FE-013 → FE-014 | Journey E2E builds on auth fixtures/helpers | Staging availability |
| FE-019 → FE-020 | Staging cannot validate deep links/cache without host config | Host decision, DNS/TLS |
| FE-020 → FE-026 | Go/no-go requires staging smoke evidence | QA capacity |

**Critical-path effort:** 25–40 pd. With two frontend engineers and normal review latency, this is roughly **6–9 calendar weeks** under the assumptions in section 7. The estimate is dominated by external contract latency, not coding volume.

**Near-critical paths to watch:**
- FE-012 → FE-013 → FE-014 (test safety net) — a one-week slip here delays staging validation.
- FE-019 external host/DNS/TLS — start the request in week 1 even though implementation lands later.
- FE-021 → FE-026 (monitoring must exist before post-deploy verification).

---

## 5. Parallel execution plan

### 5.1 Tracks

| Track | Theme | Tasks | Can start |
|---|---|---|---|
| **A** | Build & code quality | FE-001, FE-002, FE-003, FE-004, FE-005 | Immediately |
| **B** | Security & configuration | FE-006, FE-007, FE-008, FE-009, FE-010, FE-011, FE-025 | After FE-001 (design can start earlier) |
| **C** | Testing & QA | FE-012, FE-013, FE-014, FE-015 | FE-012 after FE-002; test design earlier |
| **D** | Performance, a11y, compatibility | FE-016, FE-017, FE-018, FE-022, FE-023, FE-024 | FE-016/022 after baseline; rest post-launch |
| **E** | Hosting, monitoring, release | FE-019, FE-020, FE-021, FE-026 | Host/contract requests immediately; implementation after FE-006 |

### 5.2 Two-engineer plan (recommended minimum)

| Week | Engineer 1 | Engineer 2 | QA / DevOps |
|---|---|---|---|
| 1 | FE-001 baseline + CI | FE-006 design, env contract, host/backend requests | QA matrix review; host decision; branch protection |
| 2 | FE-002 TS/lint/dead code | FE-003 logs; FE-006A/B | FE-012 harness scaffolding |
| 3 | FE-006C + FE-007 | FE-008 session design/implementation | FE-012B tests; backend contract validation |
| 4 | FE-008 completion | FE-009 guards; FE-010 XSS | FE-013 auth E2E |
| 5 | FE-011, FE-025 | FE-015 error UX; FE-019 host config | FE-014 journeys; staging setup |
| 6 | FE-020 staging + smoke | FE-021 monitoring; FE-022 a11y | Full regression; a11y audit |
| 7 | FE-022 completion; FE-016 budgets | FE-019/020 fixes; defect burn-down | Perf + responsive; evidence bundle |
| 8 | Defects; FE-026 runbook | Defects; release candidate hardening | Go/no-go; production verification |

### 5.3 Three-engineer plan

Add a third frontend engineer from week 2 to own Track D (FE-016, FE-022, FE-023) and the staging/defect stream. Expected compression: **1–2 weeks**, not 33%, because the critical path is contract-bound. Do not add a third engineer to FE-006/007/008 concurrently — the merge conflict cost exceeds the gain.

### 5.4 One-engineer plan

Sequence strictly by critical path; defer all Tier 2/3 work. Expected duration: **10–13 weeks**. This is a legitimate choice only if the release date is flexible; otherwise the release is capacity-blocked, not engineering-blocked.

### 5.5 What must not be parallelized

- FE-006 and FE-007 edits to `src/services/api.ts` and raw-fetch call sites (same files).
- FE-008 and FE-009 auth-state semantics (guards read what session writes).
- FE-019 host config and FE-020 staging validation (config must land first).
- Multiple engineers editing `App.tsx` route table during FE-002/FE-009.

---

## 6. Milestones

Milestones are **relative** and assume the section 7 conditions. They are planning checkpoints, not commitments.

| Milestone | Target | Exit criteria | Decision |
|---|---|---|---|
| **M0 — Decisions & baseline** | End of week 1 | FE-001 started; host target named; backend contract request sent; branch protection on; QA matrix accepted | Continue / re-plan |
| **M1 — Reproducible build** | End of week 2 | Clean install, typecheck, lint, build, audit all run in CI; FE-002/003 merged; FE-012 harness exists | Is the codebase stabilizable? |
| **M2 — Production config & security** | End of week 4 | FE-006/007/008/009/010/011/025 closed or in final review; no `localhost` in source; session behavior documented | Security checkpoint |
| **M3 — Test safety net** | End of week 5–6 | FE-013/014/015 green on staging; auth/role/journey E2E in CI | Quality checkpoint |
| **M4 — Staging release candidate** | End of week 7 | FE-019/020/021/022/016 complete; full QA matrix executed; evidence bundle assembled | Release candidate declared |
| **M5 — Go/no-go & production** | End of week 8 | FE-026 complete; approval signed; production smoke + 24h watch | GO / NO-GO |

**Re-baseline points:** after M1 (actual TS error volume known) and after M2 (backend/host latency known). A missed M2 by more than five working days should trigger an RA review, not silent schedule pressure.

---

## 7. Planning assumptions and confidence

| Assumption | Impact if false | Confidence |
|---|---|---|
| Two frontend engineers available full-time | 1 engineer → 10–13 weeks; 3 → 6–7 weeks | Medium |
| One QA engineer at ~80% | QA bottleneck delays M3/M4 | Medium |
| One DevOps engineer at ~40% | Hosting/DNS/TLS delays M4 | Low |
| Hosting target chosen by end of week 1 | FE-019 cannot start; M4 slips | Low |
| Backend responds to contract requests within 2 business days | FE-007/008/009 slip; critical path extends | Low |
| TypeScript error volume is manageable (≤ ~100 errors) | FE-002 expands beyond 5 pd; M1 slips | Low (never run) |
| Staging environment and seeded accounts available by week 5 | FE-014/020 cannot execute | Low |
| No major scope additions during the release window | Timeline invalid | Medium |
| Review capacity of one Tech Lead | PR queue becomes the bottleneck | Medium |

**Calendar confidence: Low.** The effort estimate is medium-confidence; the calendar is low-confidence because three of the eight assumptions are external and currently unconfirmed. Do not present week 8 as a committed date until M0 closes.

---

## 8. External dependency register

These are **not frontend implementation tasks**. Each has an internal chaser and a required-by milestone. If an item is late, the dependent frontend task is blocked, not silently descoped.

| ID | Dependency | Needed by | Blocks | Owner (external) | Internal chaser | Status |
|---|---|---|---|---|---|---|
| EXT-01 | Auth header scheme (`Bearer` vs raw) + example request | M2 / week 3 | FE-007, FE-008 | Backend | TL | Open |
| EXT-02 | Refresh/expiry/401 contract | M2 / week 3 | FE-008 | Backend | TL | Open |
| EXT-03 | Server-side RBAC matrix + negative-test evidence | M3 / week 5 | FE-009 closure, go/no-go | Backend + Security | TL | Open |
| EXT-04 | CORS allowlist for staging and production origins | M4 / week 6 | FE-019, FE-020 | Backend/DevOps | DO | Open |
| EXT-05 | Hosting target and deployment mechanism | M0 / week 1 | FE-019, FE-020 | DevOps | DO | Open |
| EXT-06 | Domain/DNS records + TLS certificate ownership | M4 / week 6 | FE-019, FE-020 | DevOps | DO | Open |
| EXT-07 | Staging environment + secret injection method | M3 / week 5 | FE-020 | DevOps | DO | Open |
| EXT-08 | Error-tracking project + DSN + retention/PII policy | M3 / week 5 | FE-021 | DevOps/Security | TL | Open |
| EXT-09 | Seeded student/mentor/admin accounts + `list.1000` | M3 / week 5 | FE-014, QA matrix | Backend/QA | QA | Open |
| EXT-10 | AI chatbot production URL, timeout, rate limits | M2 / week 4 | FE-007, FE-010 | Backend/Platform | FD | Open |
| EXT-11 | Payment provider sandbox/test cards | M3 / week 5 | Enrollment journey | Backend | QA | Open |
| EXT-12 | Browser/device lab (Safari, iOS) | M4 / week 7 | FE-023 smoke | DevOps | QA | Open |
| EXT-13 | Git history access for secret scan | M2 / week 4 | FE-011 | Repo admin | FD | Open |
| EXT-14 | Production smoke account (least privilege) | M5 / week 8 | FE-020 post-deploy | PO/Backend | QA | Open |

**Escalation rule:** if an external item is more than two working days late, the internal chaser posts the exact ask, impact, and needed-by date in the release channel and notifies the RA. The dependent task stays blocked; it is not marked done with a local mock.

---

## 9. Risk register

| ID | Risk | Prob. | Impact | Mitigation | Owner | Linked task |
|---|---|---|---|---|---|---|
| R-01 | Hosting target remains undecided | High | High | Force decision at M0; default to a static host with SPA rewrite support; document trade-off | DO/PO | FE-019 |
| R-02 | Backend auth/CORS contract arrives late | High | High | Send contract template week 1; agree interim scheme in writing; feature-flag if needed | TL/BE | FE-007, FE-008 |
| R-03 | TypeScript/lint error volume exceeds estimate | Medium | High | Timebox discovery to 2 days; split FE-002 into file-area tickets; do not suppress errors | TL | FE-002 |
| R-04 | Test harness is added but not adopted | Medium | Medium | CI gate from day one; start with 10 high-value tests; review test quality in PRs | QA/TL | FE-012–014 |
| R-05 | Staging uses real or insufficient data | Medium | High | Seed scripts only; no production PII; documented fixtures | QA/BE | FE-014, FE-020 |
| R-06 | Accessibility scope expands indefinitely | Medium | Medium | Gate on axe critical = 0 + keyboard auth/dashboard flows; phase the rest | TL/QA | FE-022 |
| R-07 | Performance regressions after fixes | Medium | Medium | Bundle budget in CI; Lighthouse baseline at M4; compare before/after | TL | FE-016 |
| R-08 | Single reviewer becomes bottleneck | Medium | Medium | Name a secondary reviewer; P0 review SLA same day; small PRs | TL | All |
| R-09 | Scope creep during release window | High | Medium | Freeze after RC; PO change control; new work goes to backlog | PO | FE-026 |
| R-10 | Third-party CDN/script conflicts with CSP | Medium | High | Self-host or pin the dependency; CSP report-only first; verify FileViewer | FD/SEC | FE-010, FE-019 |
| R-11 | `npm audit` reveals critical CVEs with no easy upgrade | Medium | High | Timebox remediation; use overrides; document residual risk with SEC sign-off | TL/SEC | FE-025 |
| R-12 | Rollback is documented but never rehearsed | Low | High | Mandatory staging rehearsal in FE-026/TC-DEP-05 | DO | FE-026 |
| R-13 | Auth hardening breaks existing sessions | Medium | Medium | Migration/expiry plan; test remember-me and deep links; staged rollout | FD | FE-008 |
| R-14 | QA capacity insufficient for 53-case matrix | Medium | Medium | Prioritize blocking cases; automate auth/role pack early; split manual a11y/browser work | QA | FE-014 |

---

## 10. Deferral and scope rules

### 10.1 May be deferred without approval (Tier 3)

- FE-017 render/list optimization — if the 1,000-row test remains responsive.
- FE-018 image audit — if no image-driven CLS/LCP failure is observed.
- FE-024 locale/timezone — product decision; document current behavior.
- Full FE-023 browser matrix — only after Chrome + Safari/iOS smoke passes.

### 10.2 Requires PO + RA waiver (Tier 2)

- FE-004 dead UI/TODO cleanup — only if no user-visible dead route remains.
- FE-005 unused dependencies — only if none has a known high/critical CVE.
- FE-016 bundle budgets — only with an agreed ceiling and monitoring.
- FE-022 full a11y remediation — only with axe critical = 0 and a dated plan.

### 10.3 Cannot be deferred or waived

- FE-001, FE-002, FE-003, FE-006, FE-007, FE-008, FE-009, FE-012, FE-019, FE-020, FE-026.
- FE-010, FE-011, FE-013, FE-014, FE-015, FE-021, FE-025 (security, verification, or observability).
- Any known auth bypass, exposed secret, missing production API configuration, or non-reproducible build.

### 10.4 Change control

1. New requests enter the backlog; they do not enter an active sprint silently.
2. A new P0 preempts current work only with TL + PO agreement; the displaced task is re-planned, not dropped.
3. Any change to Tier 1 scope requires RA sign-off and a re-baseline of M4/M5.
4. Defects found during QA are prioritized by severity, not by who found them.
5. Estimates are revised at M1 and M2; after M2, only scope changes move the date.

---

## 11. Go/no-go dependency summary

A **GO** decision requires all of the following to be simultaneously true:

| # | Condition | Evidence source |
|---|---|---|
| 1 | All Tier 1 tasks closed | Task board + PR links |
| 2 | CI green on the release commit from a clean install | CI run URL |
| 3 | No `localhost`/`127.0.0.1` in the production bundle | TC-BLD-05, TC-SEC-04 |
| 4 | Auth, role, and core journey E2E pass on staging | TC-AUTH, TC-ROLE, TC-JRN |
| 5 | Deep-link refresh and cache/security headers verified | TC-DEP-01…03 |
| 6 | Error tracking receives a test event from staging/production | TC-DEP-04, FE-021 |
| 7 | Backend RBAC and CORS evidence attached | EXT-03, EXT-04 |
| 8 | Rollback rehearsed or formally owned with RTO | TC-DEP-05, FE-026 |
| 9 | Zero open S1/S2 defects; P1s have owner + workaround | Defect log |
| 10 | Approval block signed by RA with PO/TL/QA/DO input | `frontend-release-approval.md` |

If any condition is false, the outcome is **NO-GO** or **CONDITIONAL GO** with a named owner and deadline. A conditional GO cannot include conditions 2, 3, 4, or 8 — those are never conditional.

---

## 12. Open questions

| # | Question | Needed by | Owner |
|---|---|---|---|
| Q-01 | Which hosting provider and deployment mechanism? | M0 | DO/PO |
| Q-02 | Does the backend issue refresh tokens, or only access tokens? | M2 | BE |
| Q-03 | Is the auth header `Bearer <token>` or raw token? | M2 | BE |
| Q-04 | What does "Remember me" mean for this product (persistent vs session)? | M2 | PO/TL |
| Q-05 | Which browsers/devices are officially supported? | M3 | PO |
| Q-06 | Is WCAG 2.1 AA the accessibility target? | M3 | PO |
| Q-07 | Which error-tracking vendor is approved, and what is the PII policy? | M3 | DO/SEC |
| Q-08 | Are performance budgets (LCP ≤ 2.5 s, entry JS ≤ 250 KB gzip) acceptable? | M4 | TL/PO |
| Q-09 | Who owns staging seed data and production smoke accounts? | M3 | QA/BE |
| Q-10 | Is a subpath deployment (`/app/`) required, or root domain only? | M2 | DO |

Unanswered questions are tracked as blockers for the dependent task, not as assumptions baked into code.
