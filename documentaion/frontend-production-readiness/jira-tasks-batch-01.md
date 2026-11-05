# Jira Backlog — Batch 01 (FE-001 … FE-006 + FE-006A/B/C)

| Field | Value |
|---|---|
| Target project | `EF` — https://mromarmedhat.atlassian.net/jira/software/projects/EF/boards/4/backlog |
| Source plan | `frontend-epics-and-tasks.md` + `frontend-official-plan-ar.md` |
| Batch | Epic 01 (كامل) + أول مهمة في Epic 02 |
| Issues | **9 tasks** — all top-level (FE-006A/B/C are created as Tasks, not sub-tasks) |
| Format | مطابق للمثال المرجعي: User Story · Description · Requirements · Acceptance Criteria · Test Scenarios |
| Status | **CREATED in Jira** — `EF-15` … `EF-23` (see `jira/jira-created-keys.csv`) |

> هذا الملف هو المصدر النصي الذي سيُدفع إلى Jira حرفياً عند فتح الصلاحية. أي تعديل هنا = تعديل في Jira.

---

## حالة الاتصال بـ Jira (2026-11-02)

| المحاولة | النتيجة |
|---|---|
| `getAccessibleAtlassianResources` | ✅ متصل بحساب `712020:ef424c2d-…` — لكن الموقع الوحيد الممنوح هو `shahdwalid64200.atlassian.net` |
| `mromarmedhat.atlassian.net` → مشروع `EF` | ❌ `Cloud id 4f26f716-… isn't explicitly granted by the user` |
| `shahdwalid64200.atlassian.net` → أي قراءة Jira | ❌ `Site temporarily unavailable` (404) |

**الخلاصة:** التوكن الحالي لا يشمل موقع `mromarmedhat`. الحل: إعادة ربط Atlassian MCP واختيار الحساب/الموقع الذي يملك مشروع `EF` أثناء شاشة الموافقة (Consent)، ثم منحي إشارة لأبدأ الكتابة.

---

## خريطة الحقول (تُطبَّق على كل الـ9)

| حقل Jira | القيمة |
|---|---|
| Project | `EF` |
| Issue type (parent) | `Task` — أو `Story` لو المشروع لا يسمح بـTask. المهام التقنية تفضل `Task` |
| Issue type (sub-task) | `Sub-task` مع parent = `FE-006` |
| Epic | `FE-EPIC-01 — Frontend Code Quality & Build Reliability` (FE-001…FE-005) · `FE-EPIC-02 — Frontend Security & Auth Integration` (FE-006) |
| Priority | Highest = P0 · High = P1 · Medium = P2 · Low = P3 |
| Labels | `frontend`, `production-readiness`, `p0`/`p1`, + label Epic |
| Estimate | Original estimate بالأيام (المدى الأدنى) |
| Components | `frontend` (إن وُجد) |
| Reporter | حسابك |
| Assignee | يُترك فارغاً أو يُسند لمالك المهمة |

**ملاحظة Epic:** لو `FE-EPIC-*` غير موجودة في المشروع، تُنشأ أولاً كـEpic بنفس العنوان، وإلا ستظهر المهام كـTasks عائمة بلا تجميع.

---

# FE-001 — Reproducible build baseline and CI gates

| | |
|---|---|
| **Type** | Task (enablement) |
| **Priority** | Highest (P0) |
| **Epic** | FE-EPIC-01 — Frontend Code Quality & Build Reliability |
| **Estimate** | 1–2 person-days |
| **Owner / Reviewer / QA** | Frontend Dev / Tech Lead / QA Engineer |
| **Labels** | `frontend` `production-readiness` `p0` `ci` `build` |
| **Blocks** | FE-002, FE-012, FE-019, FE-020, FE-026 |
| **Blocked by** | — |

### User Story

As a frontend engineer,
I want a single reproducible pipeline that installs, type-checks, lints, tests and builds the app from a clean checkout,
So that every commit is provably shippable and no release depends on "it works on my machine".

### Description

The repository has **no reproducible verification path**. `package.json` exposes only `dev`, `start`, `build`, `lint`, `preview`. `node_modules` and `dist` are absent, and there is no CI configuration anywhere in the repository, so no check has ever been enforced on a commit.

There is also a trap in the TypeScript setup: the root `tsconfig.json` is a solution-style file with `"files": []`, so the common command `npx tsc --noEmit` checks **zero files** and exits 0. The project must be checked with `tsc -b` (or `tsc -p tsconfig.app.json --noEmit`).

This task creates the baseline: correct scripts, a CI workflow, archived artifacts, and a recorded baseline report that later tasks (FE-002, FE-012, FE-019, FE-020, FE-026) build on.

### Context & Evidence

- `package.json` → scripts: `dev`, `start`, `build` (`tsc -b && vite build`), `lint`, `preview` — no `typecheck`, no `test`, no `ci`.
- `tsconfig.json` → `"files": []` (solution file) — `tsc --noEmit` at root is a no-op.
- No `.github/` directory, no workflow, no pipeline config.
- `node_modules` absent at audit time; `dist/` absent.
- No Node version pin (`.nvmrc`, `engines`, `packageManager`).

### Scope

**In scope**
- Add `typecheck` (`tsc -b`), `verify`, `ci` scripts.
- Add a GitHub Actions workflow running on `pull_request` and on push to `master`.
- Pin Node version and enable dependency caching by lockfile hash.
- Upload `dist/` as a build artifact named with the commit SHA.
- Record and attach the baseline report (exit codes, durations, bundle output).

**Out of scope**
- Fixing the TypeScript or ESLint errors themselves (FE-002).
- Adding tests (FE-012).
- Deployment, hosting, or environment configuration (FE-006, FE-019).

### Functional Requirements

| # | Requirement |
|---|---|
| 1 | `npm run typecheck` runs `tsc -b` and returns a non-zero exit code on any type error. |
| 2 | `npm run verify` runs typecheck → lint → build in that order and stops at the first failure. |
| 3 | `npm run ci` runs install-independent verification suitable for CI (no `npm install` inside). |
| 4 | CI workflow triggers on every pull request targeting `master` and on every push to `master`. |
| 5 | CI uses `npm ci` (never `npm install`), a pinned Node version, and caches npm by `package-lock.json` hash. |
| 6 | CI uploads the `dist/` folder as an artifact whose name contains the commit SHA, retained 90 days. |
| 7 | CI publishes the raw logs of each step (typecheck, lint, build) so they can be attached to a release ticket. |
| 8 | The workflow must not print environment variables or secrets. |
| 9 | `README.md` documents the local commands and what each one proves. |

### Acceptance Criteria

- [ ] From a clean clone, `npm ci && npm run typecheck && npm run lint && npm run build` all exit `0`.
- [ ] Injecting a deliberate type error (e.g. `const x: number = "a"`) makes `npm run typecheck` fail.
- [ ] Injecting an unused variable makes `npm run lint` fail.
- [ ] `npm run build` produces `dist/index.html` plus hashed assets.
- [ ] A pull request shows the CI workflow running and reports the four checks (install, typecheck, lint, build).
- [ ] A red check on a pull request prevents merge once branch protection is enabled.
- [ ] The build artifact is downloadable and its name contains the commit SHA.
- [ ] The baseline report is attached to this ticket: date, commit SHA, command, exit code, duration.
- [ ] No secret or environment variable value appears in CI logs.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-BLD-01 | A clean clone with no `node_modules` | `npm ci && npm run typecheck` | Both exit 0; log captured with SHA | CI | Yes |
| TC-BLD-02 | A branch with an unused variable | CI runs | Lint step fails and blocks merge | CI | Yes |
| TC-BLD-03 | A clean branch | `npm run build` | Exit 0; `dist` contains HTML + hashed assets; `npm run preview` serves it | CI | Yes |
| TC-BLD-04 | A branch with an injected type error | `npm run typecheck` | Non-zero exit; error names the file and line | CI | Yes |
| TC-BLD-05 | A successful build | CI finishes | Artifact named with SHA is downloadable and matches `dist` | Manual | Yes |

### Definition of Done

- Scripts merged and documented in `README.md`.
- Workflow merged and green on `master`.
- Baseline report attached to the ticket.
- Branch protection can reference real check names (hand-off note for the repo admin).
- No application logic changed.

### Files

`package.json` · `tsconfig*.json` · `.github/workflows/ci.yml` (new) · `.nvmrc` (new) · `README.md`

### Evidence to attach

CI run URL · raw logs · artifact link + SHA-256 · baseline table.

---

# FE-002 — Fix TypeScript/ESLint errors and remove dead code and duplicate routes

| | |
|---|---|
| **Type** | Task |
| **Priority** | Highest (P0) |
| **Epic** | FE-EPIC-01 |
| **Estimate** | 3–5 person-days |
| **Owner / Reviewer / QA** | Frontend Dev / Tech Lead / QA Engineer |
| **Labels** | `frontend` `production-readiness` `p0` `code-quality` |
| **Blocked by** | FE-001 |
| **Blocks** | FE-004, FE-012, FE-020, FE-022 |

### User Story

As a frontend engineer,
I want the codebase to type-check and lint cleanly with no dead modules or duplicate routes,
So that I can change code without guessing which files are real and which are abandoned.

### Description

`strict` mode and `noUnusedLocals` are enabled and `build` already runs `tsc -b`, but the check has never been executed. The repository also carries abandoned code that makes navigation and review ambiguous:

- **14 zero-byte modules** that are never imported (e.g. `src/hooks/useAuth.ts`, `src/utils/storage.ts`, `src/store/useUIStore.ts`).
- A **duplicate `ProjectDetail`** component under two mentor page paths.
- A **route entry with no `path`** in `src/App.tsx`.
- A **duplicate `/admin/dashboard`** route rendering an "Admin Dashboard — Coming Soon" placeholder.
- `@types/react-router-dom` at v5 alongside React Router v7.
- ESLint 9 flat config covering TS/TSX only, with no accessibility or import rules.

This task makes the static checks green and removes the abandoned surface. It must not change user-visible behaviour except where dead or placeholder routes are removed.

### Context & Evidence

- `tsconfig.app.json` → `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`.
- 14 files with size 0 bytes under `src/`.
- `src/pages/mentor-pages/ProjectDetail.tsx` duplicated in `src/pages/mentor-pages/mentorship-projects/`.
- `src/App.tsx` → pathless route entry; duplicate `/admin/dashboard`.
- `eslint.config.js` → TS/TSX only; no `eslint-plugin-jsx-a11y`, no import rules.

### Scope

**In scope**
- Fix every TypeScript and ESLint error surfaced by FE-001.
- Delete the 14 zero-byte modules and the duplicate `ProjectDetail`.
- Remove the pathless route and the duplicate admin placeholder route.
- Add `eslint-plugin-jsx-a11y` configuration (rules only; violations handled in FE-022).
- Resolve the React Router types mismatch.
- Produce a reviewed route table (path → component → guard → role).

**Out of scope**
- Any refactor that changes behaviour.
- Accessibility remediation (FE-022).
- Removing unused npm packages (FE-005).

### Functional Requirements

| # | Requirement |
|---|---|
| 1 | `npm run typecheck` exits 0 with zero errors. |
| 2 | `npm run lint` exits 0 with zero errors. |
| 3 | No zero-byte module remains under `src/`. |
| 4 | Each route path appears exactly once in the route table. |
| 5 | No "Coming Soon" placeholder is reachable in the admin area. |
| 6 | `@types/react-router-dom` matches the installed React Router major. |
| 7 | ESLint config includes `jsx-a11y` so later a11y violations are machine-detectable. |
| 8 | No runtime dependency is removed in this task (that is FE-005). |

### Acceptance Criteria

- [ ] `npm run typecheck` → exit 0, zero errors, log attached.
- [ ] `npm run lint` → exit 0, zero errors, log attached.
- [ ] Repository search for zero-byte files under `src/` returns nothing.
- [ ] Route table reviewed and approved; every path unique; every protected route has a guard.
- [ ] Navigating to `/admin/dashboard` shows the real dashboard, not a placeholder.
- [ ] `npm run build` still succeeds and the app boots.
- [ ] Reviewer confirms the diff contains no behaviour change beyond removed dead/placeholder routes.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-BLD-01 | FE-001 merged | `npm run typecheck` | Exit 0, zero errors | CI | Yes |
| TC-BLD-02 | Same commit | `npm run lint` | Exit 0, zero errors | CI | Yes |
| TC-CQ-01 | The cleaned tree | Search `src` for 0-byte files | No results | Manual | Yes |
| TC-CQ-02 | A student account | Visit `/admin/dashboard` | Redirected to student dashboard or `/unauthorized`; no placeholder | E2E | Yes |
| TC-CQ-03 | An admin account | Visit `/admin/dashboard` | Real dashboard renders once, no duplicate mount | E2E | Yes |
| TC-CQ-04 | Any role | Navigate the full route table | No blank screen, no pathless match, no 404 for a defined route | Manual | Yes |

### Definition of Done

- Typecheck and lint green in CI.
- Dead files deleted (list attached with paths).
- Route table approved by Tech Lead.
- Build green; app smoke-tested.
- No functional regression reported by QA.

### Files

All `src/**/*.ts(x)` with errors · `src/App.tsx` · `src/pages/mentor-pages/ProjectDetail.tsx` · `src/pages/mentor-pages/mentorship-projects/**` · `src/pages/admin-pages/**` · `eslint.config.js` · `package.json`

### Evidence to attach

PR link · before/after error counts · deleted-file list · approved route table.

---

# FE-003 — Remove console noise and sensitive logging

| | |
|---|---|
| **Type** | Task |
| **Priority** | Highest (P0) |
| **Epic** | FE-EPIC-01 |
| **Estimate** | 1–2 person-days |
| **Owner / Reviewer / QA** | Frontend Dev / Security Reviewer / QA Engineer |
| **Labels** | `frontend` `production-readiness` `p0` `security` `logging` |
| **Blocked by** | FE-001 |
| **Blocks** | — (runs in parallel with FE-006, FE-008) |

### User Story

As a security-conscious team,
I want production builds to emit no application logs and never print credentials,
So that tokens, emails and internal URLs cannot leak through the browser console or a screen-share.

### Description

The codebase contains **127 `console.*` calls**. The most serious is in the shared API client, which prints the request URL, the query parameters, and **the first 20 characters of the `Authorization` header** with no environment guard, under a "🔍 DEBUG LOG" label. The login flow additionally logs the user's email and the post-login redirect role.

This is a credential-leak and noise problem: it exposes partial bearer tokens to anyone with DevTools access (including support sessions and recordings), and it makes real errors impossible to spot.

The fix introduces one development-only logger, removes sensitive and noisy calls, and enforces the rule with lint.

### Context & Evidence

- `src/services/api.ts:41-47` — logs URL, params, and a slice of the auth header; unguarded.
- `src/hooks/useLogin.ts:123,130` — logs email and redirect role.
- `src/services/Websocketservice.ts` — logs the full connection lifecycle.
- `src/utils/jwt.ts` — debug logs around token handling.
- 127 `console.*` occurrences across `src`.

### Scope

**In scope**
- Add `src/utils/logger.ts` exposing `log`, `warn`, `error`, all no-ops in production (`import.meta.env.DEV` guard).
- Replace or delete all application `console.*` calls.
- Remove "DEBUG" comments and temporary instrumentation.
- Enable ESLint `no-console` with an allowlist for `src/utils/logger.ts` only.
- Keep error reporting available for FE-021 through the logger/error boundary, not `console`.

**Out of scope**
- Error tracking integration (FE-021).
- Backend logging.

### Functional Requirements

| # | Requirement |
|---|---|
| 1 | A single logger module is the only place allowed to call `console.*`. |
| 2 | The logger is a no-op in production builds. |
| 3 | No log statement contains a token, auth header, password, email, or full URL with query parameters. |
| 4 | ESLint fails on any new `console.*` outside the logger. |
| 5 | Errors still surface to the user through UI states, not console. |

### Acceptance Criteria

- [ ] `grep -rn "console\." src` returns only `src/utils/logger.ts` (plus documented exceptions).
- [ ] A production build emits no `console.log/info/debug` from application code while browsing key pages.
- [ ] DevTools shows no `Authorization` value for any protected request.
- [ ] Adding `console.log("x")` in a component fails lint.
- [ ] Login flow no longer logs the user's email or redirect role.
- [ ] Staging console capture is clean (no unexpected errors/warnings).

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-BLD-05 | Production build | Browse home, login, dashboard | No application console output | Manual | Yes |
| TC-SEC-04 | Logged-in user | Trigger any protected API call | No token value appears in console or network log payloads | Manual | Yes |
| TC-SEC-05 | A developer adds `console.log` | `npm run lint` | Fails with `no-console` | CI | Yes |
| TC-SEC-06 | Login with wrong password | Submit | Error shown in UI only; no console output | E2E | Yes |

### Definition of Done

- Logger merged and documented.
- Grep evidence attached.
- Lint rule enabled and proven by a failing branch.
- Staging console screenshot attached.
- Security reviewer sign-off.

### Files

`src/services/api.ts` · `src/hooks/useLogin.ts` · `src/services/Websocketservice.ts` · `src/utils/jwt.ts` · `src/utils/logger.ts` (new) · `eslint.config.js` · ~120 additional call sites

### Evidence to attach

PR link · grep output before/after · failing-lint branch · staging console capture.

---

# FE-004 — Triage TODO/FIXME markers and incomplete UI

| | |
|---|---|
| **Type** | Task |
| **Priority** | High (P1) |
| **Epic** | FE-EPIC-01 |
| **Estimate** | 2–4 person-days |
| **Owner / Reviewer / QA** | Frontend Dev / Tech Lead / QA Engineer |
| **Labels** | `frontend` `production-readiness` `p1` `tech-debt` |
| **Blocked by** | FE-002 |
| **Blocks** | — |
| **Gate** | Waiver-eligible (Tier 2) — needs PO + RA sign-off if deferred |

### User Story

As a product owner,
I want every unfinished marker and placeholder either fixed, ticketed with an owner, or deleted,
So that nothing half-built silently reaches production.

### Description

The repository carries unfinished work in four forms: a `TODO.md` with two open items, **8 `TODO`/`FIXME`/`HACK` markers** in source, a duplicated `ProjectDetail` implementation, and user-visible placeholder/demo content (an admin route showing "Coming Soon", and demo testimonials rendered as if they were real user content).

Each marker must become a decision: **fix now**, **open a ticket with an owner**, or **delete**. No marker may remain in `src/` at the end.

### Context & Evidence

- `TODO.md` — two open items (ProjectDetail refactor, run build/lint).
- 8 `TODO`/`FIXME`/`HACK` markers in `src`.
- `src/App.tsx` — `/admin/dashboard` renders "Admin Dashboard — Coming Soon".
- `src/pages/student-pages/StudentDashboard/StudentDashboard.tsx:17-33` — demo testimonial data.
- `src/utils/constants.ts:100+` — demo/placeholder content used in production paths.

### Scope

**In scope**
- Inventory every marker and placeholder.
- Resolve duplicate `ProjectDetail` (complete or delete one).
- Remove the admin placeholder in favour of the real page.
- Replace demo content with API data, or label it clearly as sample content.
- Produce a triage table: marker → decision → ticket/PR.

**Out of scope**
- New features implied by a TODO.
- Backend data provisioning.

### Functional Requirements

| # | Requirement |
|---|---|
| 1 | Zero `TODO`/`FIXME`/`HACK` markers remain under `src/`. |
| 2 | Every removed marker has a recorded decision (fixed / ticketed / deleted). |
| 3 | `/admin/dashboard` renders the real dashboard. |
| 4 | No demo/testimonial content is presented as real user data in production. |
| 5 | `TODO.md` is either emptied with links to tickets or removed. |

### Acceptance Criteria

- [ ] `grep -rnE "TODO|FIXME|HACK" src` returns zero results.
- [ ] Triage table attached with one row per marker and a decision.
- [ ] Admin dashboard placeholder no longer reachable.
- [ ] Demo content replaced by API data or visibly labelled as sample.
- [ ] QA confirms no user-visible regression.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-CQ-05 | Clean tree | Grep markers in `src` | Zero results | CI | Yes |
| TC-CQ-06 | Admin account | Open `/admin/dashboard` | Real dashboard, no placeholder | E2E | Yes |
| TC-CQ-07 | Student account | Open student dashboard | No demo testimonial presented as real user content | Manual | Yes |
| TC-CQ-08 | Any page using `constants.ts` | Load it | Content is real or clearly marked as sample | Manual | No |

### Definition of Done

- Triage table approved by Tech Lead.
- Markers resolved, tickets opened for deferred items with owners.
- Placeholder/demo content handled.
- QA sign-off.

### Files

`TODO.md` · `src/App.tsx` · `src/pages/mentor-pages/ProjectDetail.tsx` · `src/pages/mentor-pages/mentorship-projects/**` · `src/pages/student-pages/StudentDashboard/StudentDashboard.tsx` · `src/utils/constants.ts`

### Evidence to attach

PR link · triage table · grep output · screenshots.

---

# FE-005 — Dependency hygiene and package metadata

| | |
|---|---|
| **Type** | Task |
| **Priority** | High (P1) |
| **Epic** | FE-EPIC-01 |
| **Estimate** | 1–2 person-days |
| **Owner / Reviewer / QA** | Frontend Dev / Tech Lead / QA Engineer |
| **Labels** | `frontend` `production-readiness` `p1` `dependencies` |
| **Blocked by** | FE-001, FE-002 |
| **Blocks** | FE-016, FE-025 |
| **Gate** | Waiver-eligible (Tier 2) |

### User Story

As a maintainer,
I want the dependency list to contain only packages the app actually uses and the package metadata to describe EduNest,
So that install time, attack surface and bundle weight stop growing for no reason.

### Description

Nine declared packages have **zero imports** in the codebase, yet they inflate install time, the lockfile, the audit surface, and — for two of them — the Vite `manualChunks` configuration. The package metadata is still Vite template boilerplate (`"main": "eslint.config.js"`, template description, version `0.0.0`, no `engines`, no `packageManager`).

This task removes the unused packages, fixes the types mismatch, and makes the manifest describe the real application.

### Context & Evidence

Packages with zero imports: `@jitsi/react-sdk`, `aos`, `html2pdf`, `react-is`, `react-player`, `sweetalert2`, `sweetalert2-react-content`, `zod`, `@tanstack/react-query-devtools`.

Also:
- `@types/react-router-dom` v5 with React Router v7.
- `package.json` → `"name": "mentors-app"`, template description, `"main": "eslint.config.js"`, no `engines`, no `packageManager`.
- `vite.config.ts` → `vendor-jitsi` and `vendor-alerts` chunks target unused packages.

### Scope

**In scope**
- Remove the nine unused packages (keep `zod` only if FE-013 adopts it — decision recorded).
- Fix the React Router types mismatch.
- Correct `name`, `description`, `version`, `homepage`, `private`.
- Add `engines` and `packageManager`.
- Remove the dead `manualChunks` entries (coordinate with FE-016).
- Record bundle/install deltas.

**Out of scope**
- Vulnerability remediation (FE-025).
- Major upgrades of used packages.

### Functional Requirements

| # | Requirement |
|---|---|
| 1 | Every runtime dependency has at least one import, or a written justification in the PR. |
| 2 | `npm ci` completes with an unchanged, consistent lockfile. |
| 3 | `npm run build` succeeds after removal. |
| 4 | Package metadata reflects EduNest, not the Vite template. |
| 5 | `engines` and `packageManager` pin the supported toolchain. |
| 6 | No `manualChunks` entry references a removed package. |

### Acceptance Criteria

- [ ] `npm ls --depth=0` matches the approved dependency list.
- [ ] Grep for each removed package returns zero imports.
- [ ] `npm ci` produces no peer-dependency warnings beyond the recorded baseline.
- [ ] Build output size delta is recorded (before/after).
- [ ] `package.json` metadata reviewed and correct.
- [ ] No runtime behaviour change.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-DEP-06 | Updated manifest | `npm ci` from clean clone | Succeeds; lockfile unchanged after install | CI | Yes |
| TC-DEP-07 | Updated manifest | `npm run build` | Exit 0; no chunk for a removed package | CI | Yes |
| TC-DEP-08 | The codebase | Grep removed package names | Zero imports | Manual | Yes |
| TC-DEP-09 | Built bundle | Inspect chunk list | No `vendor-jitsi` / `vendor-alerts` | Manual | Yes |

### Definition of Done

- Packages removed, lockfile committed with the manifest in the same PR.
- Bundle and install deltas attached.
- Tech Lead review of the justification table.
- Build green.

### Files

`package.json` · `package-lock.json` · `vite.config.ts` · `README.md`

### Evidence to attach

PR link · `npm ls` output · grep output · size delta table.

---

# FE-006 — Centralize environment configuration and API base URL

| | |
|---|---|
| **Type** | Task (parent of 3 sub-tasks) |
| **Priority** | Highest (P0) |
| **Epic** | FE-EPIC-02 — Frontend Security & Auth Integration |
| **Estimate** | 2–3 person-days |
| **Owner / Reviewer / QA** | Frontend Dev / Tech Lead / QA Engineer |
| **Labels** | `frontend` `production-readiness` `p0` `config` `env` |
| **Blocked by** | FE-001 |
| **Blocks** | FE-007, FE-008, FE-010, FE-011, FE-013, FE-019, FE-020 |
| **External dependency** | Backend: confirm production API host + allowed CORS origin |

### User Story

As a release engineer,
I want every network and asset URL to come from one validated environment contract,
So that the same build can be pointed at staging or production without editing code, and a missing variable fails loudly instead of silently calling localhost.

### Description

The production API base URL is **hard-coded** to `http://localhost:8080` in the shared Axios client. There are **no `.env*` files and no `.env.example`**, and the codebase contains two competing variable names — `VITE_API_BASE_URL` (17 usages) and `VITE_BASE_URL` (5 usages) — each falling back silently to `http://localhost:8080` via `??`.

Consequences: any build produced today is non-functional on any host; the failure mode is a silent fallback rather than a build error; and there is no documented contract for the next engineer.

This task introduces one typed, validated config module and migrates every consumer.

### Context & Evidence

- `src/services/api.ts:4` → `export const API_BASE_URL = 'http://localhost:8080'`.
- No `.env`, `.env.example`, or `src/vite-env.d.ts`.
- `VITE_API_BASE_URL` used 17 times; `VITE_BASE_URL` used 5 times; both with localhost fallbacks.
- Asset URLs built by string concatenation with the hard-coded host.

### Scope

**In scope**
- `.env.example` with public, non-secret placeholders.
- `src/config/env.ts` with runtime validation and typed exports.
- `src/vite-env.d.ts` typing `ImportMetaEnv`.
- Migration of every consumer to the config module.
- One helper for resolving asset/file URLs against the API host.
- Documented contract in `README.md`.

**Out of scope**
- Replacing raw `fetch` calls and unifying the auth header (FE-007).
- Session/token handling (FE-008).
- Hosting configuration (FE-019).

### Functional Requirements

| # | Requirement |
|---|---|
| 1 | Exactly one environment variable name defines the API base URL. |
| 2 | The config module validates the value (absolute URL, no trailing slash, no localhost in production). |
| 3 | A missing or invalid variable in a production build fails the build with a clear message. |
| 4 | Development may fall back to `http://localhost:8080`, but only inside the config module. |
| 5 | No `VITE_*` variable contains a secret. |
| 6 | Asset and upload URLs resolve against the configured API host. |
| 7 | `.env.example` documents every variable with a placeholder value. |

### Acceptance Criteria

- [ ] With `VITE_API_BASE_URL=https://api.staging.example.com`, all API and asset requests target that host.
- [ ] Building for production without the variable fails with an explicit error naming the variable.
- [ ] `grep -rn "localhost" src` returns only the development fallback inside `src/config/env.ts`.
- [ ] An uploaded asset path such as `/uploads/x.png` resolves to `<API host>/uploads/x.png`.
- [ ] `.env.example` exists, is committed, and contains no real values.
- [ ] README documents the contract and the failure behaviour.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-ENV-01 | `VITE_API_BASE_URL` set to a staging host | Build and load the app | All API calls go to that host | E2E | Yes |
| TC-ENV-02 | Variable missing in a production build | `npm run build` | Build fails with a clear message | CI | Yes |
| TC-ENV-03 | Variable set to a malformed value (`staging.example.com`) | App starts | Validation error, not a silent fallback | Unit | Yes |
| TC-ENV-04 | Variable set with a trailing slash | App starts | Normalized URL, no double slashes | Unit | Yes |
| TC-ENV-05 | An image stored at `/uploads/x.png` | Render the component | Request URL uses the configured host | E2E | Yes |
| TC-ENV-06 | Production bundle | Grep for `localhost` / `127.0.0.1` | None | Manual | Yes |

### Definition of Done

- Config module and `.env.example` merged.
- All consumers migrated; no hard-coded host remains.
- Staging build verified with a real host.
- Backend confirmation of the production host and CORS origin attached.
- README updated.

### Files

`.env.example` (new) · `src/config/env.ts` (new) · `src/vite-env.d.ts` (new) · `src/services/api.ts` · `src/services/student-roleService/**` · `src/hooks/**` · `src/utils/imageUtils.ts` · `src/components/**` · `README.md`

### Evidence to attach

PR links · staging network capture · failing-build log · grep output.

---

## FE-006A — Environment contract and validation module

| | |
|---|---|
| **Type** | Task (split from FE-006) |
| **Priority** | Highest |
| **Estimate** | 0.5–1 day |

**User Story.** As a frontend engineer, I want a typed, validated config module, so that misconfiguration fails at build time with a readable error.

**Requirements**
1. `.env.example` lists every variable with placeholders.
2. `src/config/env.ts` validates presence, absolute URL format, and trailing slashes.
3. `src/vite-env.d.ts` types `ImportMetaEnv`.
4. Development-only fallback to `http://localhost:8080`.
5. Production build fails when a required variable is missing.

**Acceptance Criteria**
- [ ] Missing variable → build error naming the variable.
- [ ] Malformed value → validation error.
- [ ] Trailing slash normalized.
- [ ] Unit tests cover the three cases above.
- [ ] No secret is read from `VITE_*`.

**Test Scenarios**

| ID | Given | When | Then | Type |
|---|---|---|---|---|
| TC-ENV-02 | No variable | Production build | Fails with explicit message | CI |
| TC-ENV-03 | Malformed value | Import config | Throws validation error | Unit |
| TC-ENV-04 | Trailing slash | Import config | Normalized | Unit |

---

## FE-006B — Migrate Axios client and services to the config module

| | |
|---|---|
| **Type** | Task (split from FE-006) |
| **Priority** | Highest |
| **Estimate** | 1 day |

**User Story.** As a frontend engineer, I want every service to read the base URL from the config module, so that no host is hard-coded.

**Requirements**
1. `src/services/api.ts` imports the base URL from `src/config/env.ts`.
2. All consumers of `VITE_API_BASE_URL` / `VITE_BASE_URL` are migrated.
3. Literal hosts removed from services and hooks.

**Acceptance Criteria**
- [ ] `grep -rn "localhost" src` shows only the dev fallback in `env.ts`.
- [ ] Staging network capture shows every request on the configured host.
- [ ] No behavioural change to request payloads.

**Test Scenarios**

| ID | Given | When | Then | Type |
|---|---|---|---|---|
| TC-ENV-01 | Staging host configured | Use the app | All requests target it | E2E |
| TC-ENV-06 | Production bundle | Grep for localhost | None | Manual |

---

## FE-006C — Centralize asset and upload URL resolution

| | |
|---|---|
| **Type** | Task (split from FE-006) |
| **Priority** | Highest |
| **Estimate** | 0.5–1 day |

**User Story.** As a user, I want images and uploaded files to load from the API host, so that content is not broken after deployment.

**Requirements**
1. One helper resolves relative asset paths against the configured API host.
2. All string-concatenated host + path constructions are replaced.
3. Helper handles absolute URLs and already-prefixed paths idempotently.

**Acceptance Criteria**
- [ ] `/uploads/x.png` resolves to `<API host>/uploads/x.png`.
- [ ] Absolute URLs pass through unchanged.
- [ ] No double slashes for any input shape.
- [ ] Images render on staging.

**Test Scenarios**

| ID | Given | When | Then | Type |
|---|---|---|---|---|
| TC-ENV-05 | Relative upload path | Render | Correct host, no double slash | E2E |
| TC-ENV-07 | Absolute URL | Render | Unchanged | Unit |

---

## Batch summary

| ID | Title | Type | Priority | Estimate | Blocked by |
|---|---|---|---|---|---|
| FE-001 | Reproducible build baseline and CI gates | Task | Highest | 1–2 d | — |
| FE-002 | TS/ESLint clean + dead code and duplicate routes | Task | Highest | 3–5 d | FE-001 |
| FE-003 | Remove console noise and sensitive logging | Task | Highest | 1–2 d | FE-001 |
| FE-004 | TODO/FIXME triage and incomplete UI | Task | High | 2–4 d | FE-002 |
| FE-005 | Dependency hygiene and package metadata | Task | High | 1–2 d | FE-001, FE-002 |
| FE-006 | Centralize env config and API base URL | Task | Highest | 2–3 d | FE-001 |
| FE-006A | Environment contract and validation module | Task | Highest | 0.5–1 d | FE-006 |
| FE-006B | Migrate Axios and services | Task | Highest | 1 d | FE-006 |
| FE-006C | Centralize asset/upload URL resolution | Task | Highest | 0.5–1 d | FE-006 |

**Batch 02 (next):** FE-007, FE-008, FE-009, FE-010, FE-011, FE-025 · **Batch 03:** FE-012 (+A/B), FE-013, FE-014, FE-015, FE-021 · **Batch 04:** FE-016, FE-017, FE-018, FE-019 (+A/B workstreams), FE-020, FE-022, FE-023, FE-024, FE-026.
