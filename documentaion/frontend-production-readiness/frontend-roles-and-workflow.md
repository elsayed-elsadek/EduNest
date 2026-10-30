# EduNest Frontend — Roles, Responsibilities & Delivery Workflow

| Field | Value |
|---|---|
| Planning date | 2026-10-30 |
| Scope | Frontend production-readiness delivery only |
| Applies to | FE-EPIC-01 … FE-EPIC-07, tasks FE-001 … FE-026, subtasks FE-006A/B/C, FE-012A/B |
| Status | **Proposed operating model.** No workflow, CI pipeline, or release process exists in the repository today. |

This document defines who does what, how work moves from idea to production, what evidence each gate requires, and how frontend work hands off to backend, DevOps, QA, and the release approver. It is deliberately host-agnostic because the hosting target is not yet chosen (`FE-019`).

**Operating principle:** no task is "done" because code was written. A task is done when its acceptance criteria are demonstrated by evidence attached to the ticket and the release gate is green.

---

## 1. Roles

| Code | Role | Accountability in this plan | Typical allocation |
|---|---|---|---|
| **PO** | Product Owner | Priority, scope, user impact, accepted-risk decisions, final business go/no-go input | 10–15% during release |
| **FD** | Frontend Developer | Implements tasks, writes tests, attaches evidence, fixes defects | 2–3 people full-time |
| **TL** | Frontend Tech Lead / Code Reviewer | Architecture, review, technical sign-off, budget/standards, unblocks decisions | 1 person, 50% |
| **QA** | QA Engineer | Test design, execution, regression, release evidence bundle, defect triage | 1 person, 80% |
| **DO** | DevOps / Release Engineer | CI/CD, hosting, DNS/TLS, cache/security headers, environments, rollback execution | 1 person, 40% |
| **BE** | Backend Engineer (external) | API contract, auth scheme, CORS, server-side authorization evidence, refresh-token support | As requested |
| **SEC** | Security Reviewer (external or part-time) | Threat review of token handling, XSS sinks, dependency risk, secret hygiene | As requested |
| **RA** | Release Approver (Engineering Manager or delegate) | Chairs go/no-go, signs the release decision, owns escalation | 1 person |

**Decision rights**

| Decision | Decides | Consulted | Informed |
|---|---|---|---|
| Release scope and priority changes | PO | TL, QA, DO | All |
| Technical approach and standards | TL | FD, DO | PO |
| Test coverage sufficiency | QA | TL | PO |
| Hosting target and rollback mechanics | DO | TL, PO | All |
| Security risk acceptance | SEC + PO | TL | RA |
| Go/no-go | RA | PO, TL, QA, DO, SEC | All |
| Backend contract changes | BE | FD, TL | PO |

No single person may both implement and approve a P0 change. If the team is smaller than three engineers, the RA must be someone outside the implementation pair, and this must be recorded in the release ticket.

---

## 2. RACI by workstream

**R** = Responsible (does the work) · **A** = Accountable (owns the outcome) · **C** = Consulted · **I** = Informed.

| Workstream | PO | FD | TL | QA | DO | BE | SEC | RA |
|---|---|---|---|---|---|---|---|---|
| FE-EPIC-01 Code quality & build | I | R | A | C | C | I | I | I |
| FE-EPIC-02 Security & auth integration | I | R | A | C | C | C | C | I |
| FE-EPIC-03 Testing & QA | I | R | C | A | I | I | I | I |
| FE-EPIC-04 Performance & bundle | I | R | A | C | I | I | I | I |
| FE-EPIC-05 Production config & deployment | I | C | C | C | A/R | C | I | I |
| FE-EPIC-06 Responsive, a11y & compatibility | I | R | A | C | I | I | I | I |
| FE-EPIC-07 Error handling, monitoring & release | I | R | C | C | C | I | I | A |
| Environment contract (`FE-006`) | I | R | A | C | C | C | C | I |
| Auth/session hardening (`FE-008`) | I | R | A | C | I | C | C | I |
| Route guards (`FE-009`) | I | R | A | C | I | C | C | I |
| Hosting/rewrite/cache (`FE-019`) | I | C | C | C | A/R | I | I | I |
| Staging deploy & smoke (`FE-020`) | I | C | C | R | A | C | I | I |
| Monitoring (`FE-021`) | I | R | C | C | C | I | I | I |
| Go/no-go & rollback (`FE-026`) | C | C | C | C | C | I | C | A/R |
| Backend RBAC evidence (`SEC-03`) | I | C | C | C | I | A/R | C | I |
| CORS allowlist (`DEP-04`) | I | C | I | I | C | A/R | I | I |
| DNS/TLS (`DEP-05`, `DEP-07`) | I | I | I | I | A/R | I | I | I |

**Rule:** every external item has an internal owner who chases it (FD for auth contract, DO for hosting/DNS, TL for architecture). External teams are never assigned frontend implementation work.

---

## 3. Workflow and stage gates

```
Backlog ──► Ready ──► In Progress ──► Code Review ──► CI / Merge ──► QA on Staging ──► Release Approval ──► Production Verification ──► Done
             │             │                │               │                │                    │                        │
          DoR met      branch + WIP     review + AC     all checks      test matrix        signed decision          smoke + 24h watch
```

### Gate 0 — Backlog

| Item | Detail |
|---|---|
| Owner | PO (priority), TL (technical shape) |
| Entry | Issue exists with type, epic, priority, problem statement, evidence |
| Exit | Enough information to estimate; dependency identified |
| Evidence | Ticket fields populated; linked finding/checklist ID |
| SLA | Groomed within one planning cycle |

### Gate 1 — Ready (Definition of Ready)

A task may enter **Ready** only when all of the following are true:

- [ ] Problem statement cites verified evidence (file path/line, count, or environment observation).
- [ ] Objective and user impact are stated.
- [ ] In-scope and out-of-scope are explicit.
- [ ] Acceptance criteria are written as Given/When/Then and are testable.
- [ ] Test approach is named (unit/integration/E2E/manual) and mapped to `frontend-qa-test-matrix.md` IDs.
- [ ] Dependencies (tasks, backend, DevOps) are linked; blockers are not hidden.
- [ ] Priority is P0–P3 and consistent with `frontend-priorities-and-dependencies.md`.
- [ ] Estimate and confidence are recorded.
- [ ] Owner, reviewer, and QA are named.
- [ ] Rollback/feature-flag approach is stated for runtime-affecting work.

**Exit:** TL marks Ready; no "we'll figure it out in the PR" items.

### Gate 2 — In Progress

| Item | Detail |
|---|---|
| Owner | FD |
| Entry | Ready criteria met; branch created from `master` |
| Required practices | Small commits; tests written with the change; no unrelated refactors; no secrets; no direct pushes to `master` |
| WIP limit | One active task per developer; P0 may preempt with TL approval |
| Status hygiene | Ticket moves to In Progress; blocker raised within 1 working day of discovery |
| Exit | Code complete, self-review done, tests pass locally, PR opened |

**Branch naming:** `feat/FE-###-short-slug`, `fix/FE-###-short-slug`, `chore/FE-###-short-slug`, `test/FE-###-short-slug`, `docs/FE-###-short-slug`.

**Commit style:** imperative subject, reference the task, e.g. `FE-006: read API base URL from validated env config`.

### Gate 3 — Code Review

| Item | Detail |
|---|---|
| Owner | TL (or a delegated senior FD who did not write the code) |
| Entry | PR description contains: what/why, task link, screenshots or recordings for UI changes, test evidence, risk/rollback note |
| Review SLA | P0: same working day · P1: ≤ 1 working day · P2/P3: ≤ 2 working days |
| Review checklist | See section 4 |
| Exit | At least one approval; all comments resolved or explicitly deferred with a ticket; no unresolved "request changes" |
| Evidence | PR review state, linked comments, approval |

### Gate 4 — CI / Merge

| Item | Detail |
|---|---|
| Owner | FD (fixes), DO (pipeline), TL (merge) |
| Entry | Review approved; branch up to date with `master` |
| Required checks | See section 5; all must be green |
| Merge strategy | Squash merge to `master`; PR title becomes commit subject |
| Exit | Merge commit on `master`; CI run URL recorded on the ticket |
| Evidence | Green pipeline URL, artifact checksum, coverage report |

**No bypassing checks.** An emergency bypass requires RA + TL approval, a follow-up ticket, and a note in the release record. A bypass is never allowed for security, auth, or build checks.

### Gate 5 — QA on Staging

| Item | Detail |
|---|---|
| Owner | QA (execution), FD (fixes), DO (deployment) |
| Entry | Release candidate deployed to staging from the release commit; env vars and backend CORS confirmed; seeded fixtures available; build/version identifier visible |
| Test scope | Applicable cases in `frontend-qa-test-matrix.md`; full regression for P0 areas; exploratory pass on changed surfaces |
| Defect handling | S1/S2 block the release; S3/S4 triaged with PO |
| Exit | All blocking cases pass or have an approved, documented exception; defect list closed or accepted; evidence bundle assembled |
| Evidence | Test run report, screenshots/video for failures, console/network captures, staging build SHA, signed QA summary |

### Gate 6 — Release Approval (Go/No-Go)

| Item | Detail |
|---|---|
| Owner | RA, with PO/TL/QA/DO/SEC input |
| Entry | QA exit met; `frontend-release-approval.md` completed; rollback owner and window confirmed; production smoke account ready; monitoring live |
| Meeting | 30 minutes max; decisions recorded, not inferred |
| Outcomes | **GO**, **CONDITIONAL GO** (named conditions + owner + deadline), or **NO-GO** |
| Exit | Signed approval block in the release ticket; deployment window scheduled |
| Evidence | Completed approval checklist, attendee list, decision, conditions |

### Gate 7 — Production Verification

| Item | Detail |
|---|---|
| Owner | DO (deploy/rollback), QA (smoke), FD (hotfix), RA (decision to roll back) |
| Entry | Approval signed; artifact immutable and identified by SHA |
| Steps | Deploy → smoke pack (`TC-DEP-04`) → header/HTTPS checks → error-tracker test event → 24-hour watch |
| Rollback triggers | S1 defect; error rate above agreed threshold; auth or payment failure; deep links broken; smoke failure not fixable within 15 minutes |
| Exit | Smoke green; no S1/S2; watch log complete; release notes published |
| Evidence | Deploy log, smoke results, dashboard captures, incident/rollback record if any |

### Gate 8 — Done

A task is **Done** only when:

- [ ] Acceptance criteria demonstrated with evidence.
- [ ] Code merged to `master`.
- [ ] Tests added/updated and passing in CI.
- [ ] QA verification recorded (or explicit "not user-facing, static evidence" note).
- [ ] Documentation/runbook updated where behavior or operations changed.
- [ ] No new P0/P1 defect left untracked.
- [ ] Rollback path documented for runtime changes.

---

## 4. PR review checklist

Reviewers must be able to answer "yes" to each applicable item.

**Correctness**
- [ ] Change matches the ticket and acceptance criteria; no scope creep.
- [ ] Loading, empty, error, and success states are handled.
- [ ] Async effects clean up; no state update after unmount; no obvious race.
- [ ] Route changes include guard and deep-link implications.

**Security**
- [ ] No secret, token, email, or PII in code, logs, fixtures, or screenshots.
- [ ] No new `dangerouslySetInnerHTML`, `eval`, or unvalidated `href`/`src`.
- [ ] Auth header uses the shared client and agreed scheme.
- [ ] User-controlled values are escaped; file/URL inputs validated.
- [ ] Client-side checks are not presented as authorization.

**Quality**
- [ ] Types are narrow; no new `any` without justification.
- [ ] No unguarded `console.*`; no commented-out dead code.
- [ ] Naming and structure match surrounding code.
- [ ] Accessibility: labels, roles, keyboard path, focus management for new UI.
- [ ] Responsive behavior checked at 360 px and desktop.

**Testing**
- [ ] Tests cover the behavior, not the implementation.
- [ ] Negative and boundary cases included where risk warrants.
- [ ] Test IDs from the QA matrix referenced.
- [ ] No test skipped/disabled without a linked ticket.

**Operations**
- [ ] Env/config changes documented in `.env.example`.
- [ ] Bundle impact considered (no accidental heavy import).
- [ ] Rollback or feature-flag plan stated for risky changes.
- [ ] Docs updated (`README`, runbook, release notes).

---

## 5. CI and PR gates

The pipeline does not exist yet; `FE-001` creates it. Target gate set:

| # | Gate | Command / check | Blocks merge | Blocks release | Owner |
|---|---|---|---|---|---|
| 1 | Install reproducibility | `npm ci` from lockfile | Yes | Yes | DO |
| 2 | Type-check | `npm run typecheck` (`tsc -b`) | Yes | Yes | FD |
| 3 | Lint | `npm run lint` | Yes | Yes | FD |
| 4 | Unit/component tests | `npm test -- --run` | Yes | Yes | QA |
| 5 | Coverage threshold | `npm run test:coverage` | Yes (ratchet) | Yes | QA |
| 6 | Production build | `npm run build` | Yes | Yes | FD |
| 7 | Bundle budget | size-limit or analyzer threshold | Yes | Yes | TL |
| 8 | Secret scan | gitleaks/trufflehog | Yes | Yes | SEC |
| 9 | Dependency audit | `npm audit --production` (high/critical) | Yes | Yes | TL |
| 10 | Preview deploy | host preview URL per PR | No | No | DO |
| 11 | E2E smoke (staging) | Playwright auth + role pack | No on PR | Yes | QA |
| 12 | Accessibility scan | axe on key routes | No | Yes (critical = 0) | QA |
| 13 | Artifact retention | upload `dist` + reports, 90 days | — | Yes | DO |

**Pipeline rules**
- Pin Node via `.nvmrc`/`engines`; cache npm by lockfile hash.
- Fail fast: install → typecheck → lint → tests → build → scans.
- Publish JUnit and coverage artifacts for every run.
- Never echo env values; mask secrets; do not build PRs from forks with production secrets.
- The release artifact must be the exact artifact that passed staging — no rebuild between staging and production.

---

## 6. Handoffs

### 6.1 Frontend → QA

Triggered when a PR is merged and deployed to staging.

Handoff package:
- Task ID, PR link, merge commit SHA, staging build identifier.
- What changed and what did not.
- Routes/components affected; test accounts and seed data needed.
- Known limitations and areas of risk.
- QA matrix IDs to execute.
- Rollback/flag instructions if relevant.

QA acknowledges within one working day or raises missing information as a blocker.

### 6.2 Backend → Frontend (contract handoff)

Required before FE-006/FE-007/FE-008 can close:
- Base URLs per environment.
- Auth header scheme (`Bearer` vs raw) and refresh/expiry behavior.
- Error response shape and status codes for 401/403/409/422/5xx.
- CORS allowlist for staging and production origins.
- Server-side role/permission matrix and evidence of enforcement.
- Rate limits and pagination contract.

Format: a short contract note linked from the task, plus one working example request/response per critical endpoint. Verbal confirmation is not sufficient evidence.

### 6.3 DevOps → Frontend

Required before FE-019/FE-020 can close:
- Hosting target and deployment mechanism.
- Environment variable injection method (build-time vs runtime).
- SPA rewrite support and cache-header capability.
- Domain/DNS records and TLS ownership.
- Preview/staging URL and access method.
- Rollback mechanism, artifact retention, and RTO.

### 6.4 QA → Release Approver

Release evidence bundle:
- Scope: included PRs/tasks, excluded items.
- Test summary: cases run/passed/failed/skipped, by environment.
- Open defects by severity with owner and workaround.
- Performance and accessibility results against budgets.
- Known risks and accepted exceptions.
- Recommendation: GO / CONDITIONAL / NO-GO.

### 6.5 Release → Support/Operations

After production verification:
- Release notes (user-visible changes, known issues).
- Monitoring dashboard links and alert thresholds.
- Rollback runbook and on-call owner.
- Incident communication channel and escalation path.

---

## 7. Ceremonies and cadence

| Ceremony | Frequency | Participants | Output |
|---|---|---|---|
| Readiness grooming | Weekly | PO, TL, FD, QA | Tasks moved to Ready; DoR gaps listed |
| Daily blocker stand-up | Daily, 15 min | FD, TL, QA, DO | Blockers and external dependencies surfaced |
| Defect triage | Daily during release window | QA, TL, PO | Severity, owner, release impact |
| Staging review | Per release candidate | QA, TL, FD, PO | Pass/fail per blocking case |
| Go/no-go | Per release | RA + leads | Signed decision |
| Post-release review | Within 5 days of release | All | What worked, defects escaped, process changes |

**Release freeze:** no non-P0 merges after the release candidate is cut unless approved by RA + TL. Freeze window proposal: 24 hours before deployment.

---

## 8. Escalation and exceptions

| Situation | First action | Escalate to | Timebox |
|---|---|---|---|
| Task blocked by backend/DevOps | Comment on ticket with exact ask and impact; notify TL | TL → RA | 1 working day |
| P0 defect found on staging | Stop release candidate promotion; open S1 bug | TL + QA + RA | Immediately |
| CI flaky or unavailable | Record failure, re-run once, notify DO | DO → RA | 2 hours |
| Security finding in review | Block merge; do not merge with a waiver | SEC + TL | Immediately |
| Scope change requested mid-release | PO decides; TL assesses risk | RA if it affects the gate | Before RC cut |
| Rollback needed in production | DO executes runbook; RA informed | RA + PO | Immediately |

**Exception/waiver process**

A release blocker may be waived only if all are true:
1. The risk is written down with user/business impact.
2. A compensating control or workaround exists.
3. An owner and a dated remediation ticket exist.
4. PO and RA both sign; SEC signs for security items.
5. The waiver is recorded in `frontend-release-approval.md` and the release ticket.

Waivers are not allowed for: known auth bypass, exposed secrets, missing production API configuration, or a build that cannot be reproduced.

---

## 9. Evidence retention

| Artifact | Retention | Location |
|---|---|---|
| CI logs and test reports | 90 days | CI provider |
| Release artifact (`dist`) | 1 year or 3 releases | Artifact storage |
| QA evidence bundle | 1 year | Release ticket / shared drive |
| Go/no-go record and waivers | 1 year | Release ticket |
| Incident and rollback records | 2 years | Incident log |
| Performance/Lighthouse reports | 6 months | Release ticket |

Evidence must be linkable from the task. Screenshots must not contain real user PII; use seeded accounts.

---

## 10. Current-state gaps in this workflow

| Gap | Consequence | Task |
|---|---|---|
| No CI pipeline | No gate is enforced; "green" is unverifiable | FE-001 |
| No test runner | Unit/component gates cannot run | FE-012 |
| No staging environment | QA gate cannot be executed | FE-019, FE-020 |
| No release checklist in use | Approval is informal | FE-026 |
| No monitoring | Production verification has no signal | FE-021 |
| No named owners | Accountability is implicit | This document + ticket assignment |
| No branch protection | Direct pushes and force-push possible | FE-001 (repo settings) |
| No dependency/secret automation | Regressions enter silently | FE-011, FE-025 |

Until these are closed, the workflow above is a target operating model, not a description of current practice.
