# EduNest Frontend — Release Approval & Rollback Runbook

| Field | Value |
|---|---|
| Document owner | Release Approver (RA) |
| Applies to | Production promotion of the EduNest SPA |
| Planning date | 2026-10-30 |
| Current decision | **NO-GO — not approvable today** |
| Basis | 0 PASS · 12 PARTIAL · 26 FAIL · 21 NOT VERIFIED across 59 checklist items; no build, test, staging, or deployment evidence exists |

This is the operational gate document. It is intentionally blunt: a box is checked only when the named evidence exists and is linked. **Do not pre-fill, infer, or check a box because a library, config file, or PR exists.** If evidence is missing, the status is `NOT VERIFIED`, which is not a pass.

---

## 1. Current status (as of 2026-10-30)

| Signal | Status |
|---|---|
| Production API configured | ❌ Hard-coded `http://localhost:8080` in `src/services/api.ts` |
| Reproducible build | ❌ `node_modules` absent; no CI; typecheck/lint/build never executed |
| Automated tests | ❌ No test script, runner, or test files |
| Staging environment | ❌ Does not exist |
| Hosting/SPA rewrite/cache config | ❌ Not in repository |
| Auth/session hardening | ❌ JWT in `localStorage`, no expiry/refresh/401 handling |
| Error tracking/monitoring | ❌ Not present |
| Rollback plan | ❌ Not present |
| Secret scan | ⚠️ Working tree clean on targeted scan; history not scanned |
| Dependency audit | ⚠️ Not run |
| Accessibility | ⚠️ 32 modals with no dialog role; 4 `htmlFor` for 143 inputs |
| Performance | ⚠️ No build artifact or Lighthouse evidence |

**Decision: NO-GO.** The application should not be promoted beyond an internal/staging environment until the Tier 1 gate in `frontend-priorities-and-dependencies.md` is closed.

---

## 2. Release identity (complete at release time)

| Field | Value |
|---|---|
| Application | EduNest SPA |
| Version / release name | `<to be assigned>` |
| Release commit SHA | `<40-char SHA>` |
| Artifact identifier / checksum | `<dist archive + SHA-256>` |
| Staging build verified | `<staging URL + build SHA>` |
| Production target | `<host/domain>` |
| Deployment window (UTC) | `<start–end>` |
| Release manager | `<name>` |
| Rollback owner | `<name + contact>` |
| Incident channel | `<channel/link>` |
| Change ticket / PR list | `<links>` |

**Rule:** the artifact promoted to production must be byte-identical to the artifact verified on staging. No rebuild between staging and production.

---

## 3. Go/no-go checklist

Status values: `PASS` (evidence linked) · `FAIL` (verified gap) · `PARTIAL` · `NOT VERIFIED` (no evidence) · `N/A` (justified in notes). Every `PASS` needs a link or command output in the Evidence column.

**Baseline status:** rows already proven defective by the repository audit are marked `FAIL`/`PARTIAL` here; unrun or environment-dependent checks remain `NOT VERIFIED`. This table is re-run at the release review, and a status may only change with linked evidence — never by assertion. The 64 control rows below are a finer-grained restatement of the 59 checklist items; their counts are not directly comparable to the traceability totals.

### 3.1 Build & code quality

| # | Requirement | Owner | Required evidence | Status | Notes/link |
|---|---|---|---|---|---|
| B-01 | Clean install succeeds from lockfile | FD/DO | `npm ci` log from clean container | ☐ NOT VERIFIED | |
| B-02 | Type-check passes | FD | `npm run typecheck` exit 0 + log | ☐ NOT VERIFIED | Root `tsc --noEmit` is invalid; use `tsc -b` |
| B-03 | Lint passes | FD | `npm run lint` exit 0 + log | ☐ NOT VERIFIED | |
| B-04 | Production build succeeds | FD | `npm run build` exit 0 + `dist` manifest | ☐ NOT VERIFIED | |
| B-05 | Build artifact archived and checksummed | DO | Artifact URL + SHA-256 | ☐ NOT VERIFIED | |
| B-06 | No dead modules or duplicate routes | FD | File/route scan report | ❌ FAIL | 14 zero-byte modules; duplicate `/admin/dashboard` |
| B-07 | No unguarded `console.*` or sensitive logs | FD | Grep count = 0 outside dev logger + smoke console capture | ❌ FAIL | 127 occurrences today |
| B-08 | No `localhost`/`127.0.0.1` in production bundle | FD | Bundle grep output | ❌ FAIL | |
| B-09 | Dependency audit triaged | TL | `npm audit --production` report + accepted-risk records | ☐ NOT VERIFIED | |

### 3.2 Security & authentication

| # | Requirement | Owner | Required evidence | Status | Notes/link |
|---|---|---|---|---|---|
| S-01 | No secrets in working tree or history | SEC/FD | gitleaks/trufflehog report; rotation record if any | ⚠️ PARTIAL | Tree scan clean; history unscanned |
| S-02 | `VITE_*` contains public values only | FD | `.env.example` review + bundle grep | ⚠️ PARTIAL | |
| S-03 | Backend authorization/RBAC proven | BE | Per-role endpoint matrix + 401/403 negative tests | ☐ NOT VERIFIED | External; cannot be closed by frontend |
| S-04 | Route guards correct for all roles | FD/QA | TC-ROLE-01…06 results | ⚠️ PARTIAL | Client role is editable `localStorage` |
| S-05 | Token/session strategy approved | TL/SEC | Decision record + TC-AUTH-04…07 results | ❌ FAIL | |
| S-06 | No sensitive data in logs/errors | FD | Console/network capture; error-message review | ❌ FAIL | |
| S-07 | XSS sinks closed or sanitized | FD/SEC | TC-SEC-01/02 results + code review | ❌ FAIL | Chatbot/FileViewer `dangerouslySetInnerHTML` |
| S-08 | Auth header scheme consistent | FD/BE | TC-SEC-03 capture on staging | ❌ FAIL | `Bearer` vs raw token inconsistency |
| S-09 | 401/expiry behavior verified | FD/QA | TC-AUTH-06 result | ❌ FAIL | |
| S-10 | CORS allowlist confirmed | BE/DO | Preflight capture for staging + production origins | ☐ NOT VERIFIED | External |

### 3.3 Testing & QA

| # | Requirement | Owner | Required evidence | Status | Notes/link |
|---|---|---|---|---|---|
| T-01 | Test runner and `npm test` exist | QA/FD | `npm test` log + CI job | ❌ FAIL | No runner today |
| T-02 | Unit/component suite passes | QA | CI test report + coverage | ❌ FAIL | |
| T-03 | Auth E2E passes on staging | QA | TC-AUTH-01…08 report | ❌ FAIL | |
| T-04 | Role/route E2E passes | QA | TC-ROLE-01…06 report | ❌ FAIL | |
| T-05 | Core journeys pass | QA | TC-JRN-01…05 report | ❌ FAIL | |
| T-06 | Failure/offline/timeout states verified | QA | TC-API-01…05 report | ❌ FAIL | |
| T-07 | Forms and validation verified | QA | TC-FORM-01…03 report | ❌ FAIL | |
| T-08 | Zero open S1/S2 defects | QA | Defect log export with severities | ☐ NOT VERIFIED | |
| T-09 | Regression suite green on release commit | QA | CI + staging run for the exact SHA | ❌ FAIL | |

### 3.4 Performance

| # | Requirement | Owner | Required evidence | Status | Notes/link |
|---|---|---|---|---|---|
| P-01 | Lighthouse mobile baseline recorded | FD/TL | JSON/HTML for 5 key routes | ☐ NOT VERIFIED | |
| P-02 | Core Web Vitals within agreed budget | TL | LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms (proposal) | ☐ NOT VERIFIED | Budgets need ratification |
| P-03 | Entry bundle within budget | TL | Analyzer report; ≤ 250 KB gzip (proposal) | ☐ NOT VERIFIED | |
| P-04 | No unused vendor chunks | FD | Chunk graph vs imports | ☐ NOT VERIFIED | jitsi/alerts chunks target unused packages |
| P-05 | Large-list behavior acceptable | QA | TC-PRF-04 measurement | ☐ NOT VERIFIED | |

### 3.5 Production configuration & deployment

| # | Requirement | Owner | Required evidence | Status | Notes/link |
|---|---|---|---|---|---|
| D-01 | Env contract documented and validated | FD | `.env.example` + missing-var failure test | ❌ FAIL | No `.env*` exists |
| D-02 | Production API base URL is env-driven | FD | Staging network capture showing correct host | ❌ FAIL | |
| D-03 | No raw fetch calls bypass the client | FD | Code scan + TC-SEC-03 | ❌ FAIL | |
| D-04 | Hosting config supports SPA rewrite | DO | Config file + TC-DEP-01 matrix | ❌ FAIL | |
| D-05 | Cache policy correct | DO | `curl -I` for HTML and hashed assets | ☐ NOT VERIFIED | |
| D-06 | HTTPS/TLS valid, HSTS present | DO | Certificate chain + header capture | ☐ NOT VERIFIED | External |
| D-07 | Security headers present | DO | Header capture (nosniff, referrer, frame, CSP) | ☐ NOT VERIFIED | |
| D-08 | DNS/domain and redirects correct | DO | DNS lookup + www/apex matrix | ☐ NOT VERIFIED | External |
| D-09 | Staging deployment succeeded | DO | Deploy log + staging URL + build SHA | ❌ FAIL | |
| D-10 | Production artifact is the staging artifact | DO | Matching SHA-256 | ☐ NOT VERIFIED | |

### 3.6 UI/UX, accessibility & compatibility

| # | Requirement | Owner | Required evidence | Status | Notes/link |
|---|---|---|---|---|---|
| U-01 | Responsive at 360/768/1440 | QA | TC-RSP-01/02 captures | ☐ NOT VERIFIED | |
| U-02 | Chrome + Safari/iOS smoke passes | QA | TC-RSP-03 result | ☐ NOT VERIFIED | Full matrix may be deferred |
| U-03 | axe critical/serious = 0 on key routes | QA | axe report | ☐ NOT VERIFIED | |
| U-04 | Keyboard-only auth + dashboard journey passes | QA | TC-A11Y-01 recording | ☐ NOT VERIFIED | |
| U-05 | Dialogs/forms/images have accessible names | FD/QA | TC-A11Y-02…04 results | ❌ FAIL | 32 modals lack `role="dialog"` |
| U-06 | SPA 404 and deep links behave | QA | TC-ROLE-04, TC-DEP-01 | ❌ FAIL | |
| U-07 | Locale/date/timezone behavior documented | FD/PO | Decision note | ☐ NOT VERIFIED | P3; may be documented rather than fixed |

### 3.7 Monitoring, recovery & post-deploy

| # | Requirement | Owner | Required evidence | Status | Notes/link |
|---|---|---|---|---|---|
| M-01 | Error tracking live with release tag | FD/DO | Test event visible in dashboard | ❌ FAIL | |
| M-02 | PII scrubbing configured | SEC/FD | Config review + test event | ❌ FAIL | |
| M-03 | Web Vitals/error-rate dashboard exists | DO/FD | Dashboard link | ❌ FAIL | |
| M-04 | Alert thresholds and on-call owner set | DO | Alert config + owner | ❌ FAIL | |
| M-05 | Smoke pack defined and executable | QA | Smoke script/checklist | ❌ FAIL | |
| M-06 | Rollback runbook written and owned | DO | This document, section 6, with names filled | ❌ FAIL | |
| M-07 | Rollback rehearsed on staging | DO/QA | TC-DEP-05 timing record | ❌ FAIL | |
| M-08 | 24-hour watch plan agreed | RA/DO | Watch schedule + thresholds | ❌ FAIL | |

### 3.8 Release governance

| # | Requirement | Owner | Required evidence | Status | Notes/link |
|---|---|---|---|---|---|
| R-01 | All Tier 1 tasks closed | RA | Board export with links | ❌ FAIL | 18 tasks |
| R-02 | Every checklist item has a status and owner | TL | `frontend-checklist-traceability.md` review | ⚠️ PARTIAL | 59 items |
| R-03 | Waivers recorded with owner + expiry | RA | Waiver log (section 8) | ❌ FAIL | |
| R-04 | Release notes drafted | PO | Release notes link | ❌ FAIL | |
| R-05 | Support/on-call briefed | DO | Briefing record | ❌ FAIL | |
| R-06 | Sign-offs collected | RA | Section 5 completed | ❌ FAIL | |

---

## 4. Hard stops

If any of the following is true, the decision is **NO-GO**. These cannot be converted to a conditional approval.

1. The production build points at `localhost`, `127.0.0.1`, or a developer tunnel.
2. The build cannot be reproduced from a clean install, or typecheck/build fails.
3. A known auth bypass, exposed secret, or unauthenticated privileged action exists.
4. Backend RBAC evidence is missing for admin/mentor/student data boundaries.
5. Auth or role E2E has not run against a staging environment.
6. SPA deep links fail on refresh in the target host.
7. No rollback mechanism or named rollback owner exists.
8. An S1 defect is open.
9. The production artifact differs from the artifact verified on staging.
10. Error tracking is absent, so post-deploy failures would be invisible.

---

## 5. Sign-off block

Complete only at the go/no-go meeting. A signature means the signer has seen the evidence, not that they trust the team.

| Role | Name | Decision | Conditions / comments | Date |
|---|---|---|---|---|
| Release Approver (chair) | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| Product Owner | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| Frontend Tech Lead | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| QA Engineer | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| DevOps / Release Engineer | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| Security Reviewer | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| Backend representative (consulted) | | ☐ Acknowledged | | |

**Quorum:** RA + PO + TL + QA + DO. Security sign-off is mandatory for any release that changes auth, session, or content rendering. Backend acknowledgement is mandatory when the API contract changed.

### Decision record

| Field | Value |
|---|---|
| Decision | `<GO / CONDITIONAL GO / NO-GO>` |
| Date/time (UTC) | |
| Release commit | |
| Rationale | |
| Conditions (if any) | |
| Condition owners + deadlines | |
| Next review date | |
| Rollback owner on standby | |

---

## 6. Rollback runbook

This runbook is host-agnostic. Fill the host-specific commands at `FE-019`; do not leave placeholders in the production copy.

### 6.1 Preconditions

- [ ] Previous known-good artifact is retained and identified by SHA.
- [ ] Rollback owner and backup are named, with contact details.
- [ ] Host supports instant rollback or redeploy of a previous artifact.
- [ ] DNS TTL is known; no DNS change is required for a code rollback.
- [ ] Backend contract for the previous frontend version is still supported.
- [ ] Monitoring and smoke access are available to the rollback owner.
- [ ] Rollback has been rehearsed on staging (`TC-DEP-05`).

### 6.2 Rollback triggers

| Trigger | Threshold | Authority |
|---|---|---|
| S1 defect (auth bypass, data exposure, payment corruption) | Any occurrence | RA immediately; rollback first, investigate after |
| Smoke pack failure | Any blocking case | DO executes; RA informed |
| JavaScript error rate | > 5× baseline for 5 minutes, or > 2% of sessions | DO + RA |
| API 5xx rate attributable to frontend contract | > 2% for 5 minutes | DO + TL |
| Auth/login failure rate | > 10% of attempts for 5 minutes | RA |
| Deep links/asset loading broken | Any confirmed production case | DO |
| Core Web Vitals collapse | LCP p75 > 2× baseline for 15 minutes | TL + RA |
| Cannot fix forward within 15 minutes | — | RA |

### 6.3 Rollback steps

| Step | Action | Owner | Expected |
|---|---|---|---|
| 1 | Declare incident; open incident channel; state "rollback in progress" | RA | Timestamp recorded |
| 2 | Stop further promotions; freeze merges | RA/TL | No new deploy |
| 3 | Identify last known-good artifact SHA and confirm it matches the staging-verified artifact | DO | SHA recorded |
| 4 | Promote/rollback to that artifact using the host mechanism | DO | Deploy log shows previous version |
| 5 | Purge CDN cache for `index.html` and changed assets; do not purge immutable hashed assets unnecessarily | DO | Cache headers re-checked |
| 6 | Verify `index.html` is no-cache and references the previous hashed bundles | DO | `curl -I` + HTML grep |
| 7 | Run the production smoke pack (section 7) | QA/DO | All blocking checks pass |
| 8 | Confirm error rate returns to baseline | DO | Dashboard capture |
| 9 | Communicate status to stakeholders and support | RA | Message sent |
| 10 | Preserve logs, artifacts, and timeline; open a post-incident review | RA | Review scheduled within 5 days |

**Target RTO:** ≤ 15 minutes from decision to previous version serving traffic (proposal; ratify with DevOps).
**Target RPO:** not applicable to a static frontend; user data is backend-owned. Frontend rollback must never be used to "undo" backend data changes.

### 6.4 Rollback cautions

- **Do not roll back blindly if the backend contract changed.** An older frontend may call removed endpoints. Confirm backward compatibility or roll back both sides with the backend owner.
- **Do not purge all CDN assets** unless hashes are missing; immutable hashed assets can stay cached.
- **Do not reuse the same version label** for the rollback; record the actual artifact SHA.
- **A frontend rollback cannot fix** corrupted data, a backend outage, a bad DNS change, or an expired certificate. Escalate to the correct owner.
- **If the host has no instant rollback**, the fallback is redeploying the previous artifact from storage; this must be timed during rehearsal.

### 6.5 Post-rollback

- [ ] Smoke pack green on the restored version.
- [ ] Error rate and auth failure rate back to baseline.
- [ ] Stakeholders and support informed.
- [ ] Incident timeline and root cause documented.
- [ ] Fix-forward ticket created with owner and target release.
- [ ] Release approval invalidated until a new go/no-go is held.

---

## 7. Post-deploy verification

### 7.1 Smoke pack (T+0 to T+15 minutes)

| # | Check | Expected | Owner |
|---|---|---|---|
| 1 | `GET /` | 200, app shell renders, no console error | QA |
| 2 | `GET /login` and login with smoke account | Redirects to correct dashboard | QA |
| 3 | `GET /mentorships` | Listing loads from production API | QA |
| 4 | One protected deep link, hard refresh | 200 + correct route (or login redirect) | QA |
| 5 | One read API on a dashboard | 2xx, correct data shape | QA |
| 6 | One safe mutation (e.g. mark notification read) | 2xx, UI updates once | QA |
| 7 | Logout | Storage cleared, redirect to `/login`, back button safe | QA |
| 8 | Static asset | 200, correct `Cache-Control` | DO |
| 9 | Security headers | HSTS/nosniff/referrer/frame present | DO |
| 10 | Error tracker | Synthetic test event visible with release tag | DO |
| 11 | Console/network | No CORS, 5xx, mixed-content, or unhandled rejection | QA |
| 12 | Mobile spot check | 360 px layout usable | QA |

### 7.2 Watch timeline

| Time | Checks | Owner |
|---|---|---|
| T+5 min | Smoke pack complete; error tracker clean | QA/DO |
| T+30 min | Error rate, API 5xx, auth failures, LCP sample | DO |
| T+2 h | Same + support tickets + enrollment/payment success rate | DO/QA |
| T+24 h | Full metrics review vs baseline; decide continue/monitor/rollback | RA |
| T+72 h | Trend review; close release or open follow-ups | RA/TL |

### 7.3 Metrics and thresholds (proposal)

| Metric | Baseline source | Alert threshold |
|---|---|---|
| JS error rate | First 24 h after release | > 2% of sessions or 5× previous release |
| API 5xx rate | Backend dashboard | > 2% for 5 min |
| Login failure rate | Auth dashboard | > 10% for 5 min |
| LCP p75 | RUM/Lighthouse | > 2.5 s or 2× baseline |
| CLS p75 | RUM | > 0.1 |
| Enrollment/payment failure | Product analytics | > 2× baseline |
| Support tickets (auth/login) | Support queue | Any spike correlated with release |

Thresholds must be ratified before go/no-go; they are not invented during an incident.

---

## 8. Conditional approval rules

A **CONDITIONAL GO** is allowed only when the remaining gaps are Tier 2 (waiver) items and all hard stops are clear.

| Allowed condition | Not allowed |
|---|---|
| A P2 performance optimization deferred with monitoring | Any hard stop in section 4 |
| Full browser matrix deferred after Chrome + Safari smoke passes | Auth/role E2E not executed |
| Locale/timezone behavior documented but not changed | Missing rollback owner or rehearsal |
| Dead-code cleanup scheduled post-launch | Unused dependency with a known critical CVE |
| Full a11y remediation phased, with axe critical = 0 | Keyboard auth journey failing |
| Bundle budget waived with an agreed ceiling | Build not reproducible |
| Image audit deferred with CLS monitored | Production API misconfigured |

**Condition record requirements:** description, owner, deadline (≤ 10 business days unless RA extends), compensating control, evidence required to close, and impact if not closed.

**Expiry:** a conditional approval expires at the earlier of the deadline or 10 business days. If conditions are not closed, the release is re-reviewed and may be rolled back.

**Waiver log**

| ID | Condition | Owner | Deadline | Compensating control | Status | Closed evidence |
|---|---|---|---|---|---|---|
| W-01 | | | | | ☐ Open | |

---

## 9. Communication templates

### 9.1 Release announcement

```
Release: <name> (<commit SHA>)
Window: <UTC start–end>
Changes: <user-visible summary>
Known issues: <list or none>
Rollback owner: <name/contact>
Monitoring: <dashboard link>
Support note: <what to watch / how to report>
```

### 9.2 Rollback notice

```
ROLLBACK IN PROGRESS — <time UTC>
Reason: <trigger>
Impact: <user-facing symptom>
Action: restoring <previous SHA>
Next update: <time>
Incident channel: <link>
```

### 9.3 Post-release summary

```
Release: <name/SHA>
Decision: <GO/CONDITIONAL>
Smoke: <pass/fail>
24h metrics: error rate <x>, 5xx <y>, LCP p75 <z>
Incidents: <none / summary>
Conditions closed: <n>/<total>
Follow-ups: <tickets>
```

---

## 10. Evidence index (attach at release)

| Evidence | Link | Owner | Date |
|---|---|---|---|
| CI run for release commit | | DO | |
| `dist` artifact + SHA-256 | | DO | |
| Typecheck/lint/build logs | | FD | |
| Unit/integration test report | | QA | |
| E2E report (auth/roles/journeys) | | QA | |
| Lighthouse/bundle reports | | TL | |
| axe/keyboard a11y report | | QA | |
| Header/HTTPS captures | | DO | |
| Deep-link matrix | | QA | |
| Backend RBAC/CORS evidence | | BE | |
| Error-tracker test event | | DO | |
| Rollback rehearsal record | | DO | |
| Defect log export | | QA | |
| Signed approval (section 5) | | RA | |

---

## 11. Final note

The most dangerous failure mode for this release is not a missing feature. It is a team convincing itself that a local build, a config file, or a merged PR equals production readiness. The evidence standard in this document exists to prevent that. If a box cannot be checked with a link, it stays unchecked — and the release stays **NO-GO**.
