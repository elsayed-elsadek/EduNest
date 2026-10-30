# EduNest Frontend — Epics & Task Backlog

Proposed backlog for frontend production readiness. **No real Jira keys are used.** `FE-###` and `FE-EPIC-##` are temporary planning identifiers; the import mapping is at the end of this document and in `jira-import-notes.md`.

- **Total:** 7 epics, 26 tasks, 5 subtasks.
- **Estimate unit:** person-days (pd) for one experienced frontend engineer, excluding review latency.
- **Priority:** P0 = release blocker, P1 = high, P2 = important, P3 = optional.
- **Branch convention (proposed, because none exists today):** `feat/FE-###-short-slug`, `fix/FE-###-short-slug`, `chore/FE-###-short-slug`; PR title `FE-###: <summary>`; squash merge to `master`.
- **Evidence rule:** a task is not Done until its verification evidence is attached to the ticket/PR.

---

## Epic Overview

| Epic | Title | Goal | Tasks | Exit condition |
|---|---|---|---|---|
| FE-EPIC-01 | Frontend Code Quality & Build Reliability | Make install → typecheck → lint → build reproducible and clean | FE-001…FE-005 | CI pipeline green from clean install; zero dead modules; zero unguarded logs |
| FE-EPIC-02 | Frontend Security & Authentication Integration | Remove production-host hazards, harden session/route behavior, eliminate XSS sinks | FE-006…FE-011, FE-025 | No localhost, no secrets, safe token handling, XSS sinks closed, audit triaged |
| FE-EPIC-03 | Frontend Automated Testing & QA | Create a test pyramid and cover critical journeys | FE-012…FE-014 | Unit/integration/E2E suites run in CI and pass on staging |
| FE-EPIC-04 | React Performance & Bundle Optimization | Measure and control bundle, render, asset, and list performance | FE-016…FE-018 | Budgets enforced; measured improvements recorded |
| FE-EPIC-05 | Frontend Production Configuration & Deployment | Make the SPA deployable and cache-correct on a real host | FE-019 | Staging and production configs exist; deep links and headers verified |
| FE-EPIC-06 | Responsive UI, Accessibility & Browser Compatibility | Meet agreed browser/device/a11y baseline | FE-022…FE-024 | Matrix executed; axe critical = 0; keyboard flows pass |
| FE-EPIC-07 | Frontend Error Handling, Monitoring & Release Validation | Detect, communicate, and recover from failures | FE-015, FE-020, FE-021, FE-026 | Error boundary + tracking live; staging smoke + rollback proven |

---

## Dependency Graph (task level)

```
FE-001 ──► FE-002 ──► FE-003
   │          │
   │          └────► FE-005
   ├────► FE-006 ──► FE-007 ──► FE-013 ──► FE-014 ──► FE-020 ──► FE-026
   │         │          │                                  ▲
   │         │          └────► FE-008 ──► FE-009 ─────────┘
   │         └────► FE-011
   ├────► FE-012 ──► FE-013
   ├────► FE-016 ──► FE-018
   ├────► FE-019 ─────────────────────────────────────────┘
   └────► FE-021
FE-004, FE-010, FE-015, FE-017, FE-022, FE-023, FE-024, FE-025 run in parallel where noted.
```

**Critical path:** `FE-001 → FE-002 → FE-006 → FE-007 → FE-008 → FE-009 → FE-013 → FE-014 → FE-019 → FE-020 → FE-026`.

**Parallel tracks:**
- Track A (build): FE-001, FE-002, FE-003, FE-005.
- Track B (security/config): FE-006, FE-007, FE-008, FE-009, FE-010, FE-011.
- Track C (quality): FE-012, FE-013, FE-014, FE-022.
- Track D (performance): FE-016, FE-017, FE-018, FE-023.
- Track E (release): FE-019, FE-020, FE-021, FE-026.

---

# FE-EPIC-01 — Frontend Code Quality & Build Reliability

**Problem:** The repository has no reproducible verification path. `node_modules` is absent, there is no `test`/`typecheck` script, no CI, and 127 console statements, 14 dead modules, and 9 unused dependencies. A release cannot be approved on "it worked locally".

**Outcome:** A clean clone can install, type-check, lint, build, and produce an auditable artifact in one command, with zero dead code and zero unguarded logging.

**Checklist coverage:** CQ-01…CQ-06, CMD-01, CMD-02, CMD-05, REL-01, REL-04.

---

## FE-001 — Establish reproducible frontend verification baseline

| Field | Value |
|---|---|
| Type | Task (enablement) |
| Epic | FE-EPIC-01 |
| Priority | **P0** |
| Checklist | CQ-01, CQ-02, CQ-03, CMD-01, CMD-02, CMD-05, REL-01, REL-04 |
| Estimate | 1–2 pd · Confidence: High |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** `package.json` exposes only `dev`, `start`, `build`, `lint`, `preview`. `node_modules` and `dist` do not exist. Root `tsconfig.json` is a solution file (`"files": []`), so the checklist command `npx tsc --noEmit` silently checks nothing. There is no CI workflow, so no check has ever been enforced on a commit.

**Objective.** Produce a clean, archived baseline of install, type-check, lint, build, and dependency audit results, and encode the correct commands in scripts + CI.

**User impact.** Prevents shipping a build that cannot compile; gives the team a trustworthy release signal.

**Expected outcome.** One documented command sequence produces green/red evidence; CI runs it on every PR.

**In scope.**
- Add `typecheck` script: `tsc -b` (or `tsc -p tsconfig.app.json --noEmit`).
- Add `ci` script chaining typecheck, lint, test (after FE-012), build.
- Add a CI workflow (GitHub Actions assumed; confirm host) with `npm ci`, Node version pinned, artifact upload of `dist` + logs.
- Capture baseline logs in the ticket.

**Out of scope.** Fixing the errors found (that is FE-002); deployment (FE-019).

**Files.** `package.json`, `tsconfig*.json`, `.github/workflows/*` (new), `README.md` (commands section).

**Approach.**
1. Add `.nvmrc`/`engines` for Node 22 LTS (or the version the team standardizes on).
2. Run `npm ci` in a clean environment; record Node/npm versions.
3. Run `npx tsc -b`, `npm run lint`, `npm run build`, `npm audit --production`; save raw output.
4. Create CI workflow with cache for npm, `npm ci`, typecheck, lint, build, artifact upload.
5. Document commands and known failures in the ticket.

**Acceptance criteria.**
- **Given** a clean clone with Node pinned, **When** `npm ci && npm run typecheck && npm run lint && npm run build` runs, **Then** each command's exit code and duration are recorded.
- **Given** a pull request with a TypeScript error, **When** CI runs, **Then** the pipeline fails at the typecheck step.
- **Given** a successful build, **When** the workflow completes, **Then** `dist/` is uploaded as a downloadable artifact with a commit SHA in its name.

**Definition of Done.** Scripts exist; CI workflow merged; baseline report attached; README updated; no application logic changed.

**Tests.**
- Positive: clean install + all commands exit 0 (after FE-002) — expected green pipeline.
- Negative: introduce a deliberate type error in a scratch branch — CI fails at typecheck.
- Boundary: Node version mismatch — CI uses pinned version and warns on `engines`.
- Failure: registry/network failure — workflow retries once and surfaces a clear error.
- Regression: `npm run dev` and `npm run preview` still work.

**Test setup / steps / expected.** Local: delete `node_modules`, `npm ci`, run each script, compare against CI logs. Expected: identical results; no "works on my machine" divergence.

**Dependencies / blockers.** None. Blocks FE-002, FE-012, FE-019, FE-020, FE-026. Parallel with FE-006 design.

**Deliverables / evidence.** CI run URL, raw logs, `dist` artifact, updated README.

**Branch / PR.** `chore/FE-001-verification-baseline`.

**Rollback.** Revert workflow/scripts; no runtime impact.

---

## FE-002 — Fix TypeScript/ESLint findings and remove dead modules

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-01 |
| Priority | **P0** |
| Checklist | CQ-01, CQ-02, CQ-03 |
| Estimate | 3–5 pd · Confidence: Medium (error count unknown until FE-001) |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** Strict TS (`strict`, `noUnusedLocals`, `noUnusedParameters`) is enabled, and `build` runs `tsc -b` before Vite. 14 modules are zero bytes and unreferenced, including `src/hooks/useAuth.ts`, `src/utils/storage.ts`, `src/store/useUIStore.ts`, and a duplicate `src/pages/mentor-pages/ProjectDetail.tsx`. `App.tsx` contains a redundant pathless guard route and a duplicate `/admin/dashboard` "Coming Soon" route. ESLint has no accessibility plugin. Actual error counts are unknown because checks were never run.

**Objective.** Achieve a clean typecheck/lint/build and remove dead or duplicate code paths.

**User impact.** Eliminates broken screens caused by dead imports and reduces confusion for QA and future developers.

**Expected outcome.** `tsc -b` and `eslint .` exit 0; no zero-byte modules; one canonical implementation per page.

**In scope.** Fix all TS/ESLint errors; delete the 14 empty modules; delete duplicate `ProjectDetail` and dead admin placeholder; remove the pathless route; add `eslint-plugin-jsx-a11y` (config only); resolve `@types/react-router-dom` v5 mismatch.

**Out of scope.** Refactoring business logic or UI redesign; TODO feature completion (FE-004).

**Files.** All `src/**/*.ts(x)` with errors; `src/App.tsx`; `src/pages/mentor-pages/ProjectDetail.tsx`; `src/pages/admin-pages/mentor-pages/**`; `eslint.config.js`; `package.json`.

**Approach.** Fix errors in dependency order (types → services → hooks → components → pages); prefer deleting dead code over suppressing; replace `any` with narrow types where safe; keep behavior identical.

**Acceptance criteria.**
- **Given** the FE-001 baseline, **When** `npm run typecheck` runs, **Then** exit code 0 with zero errors.
- **Given** the same commit, **When** `npm run lint` runs, **Then** exit code 0 with zero errors (warnings triaged).
- **Given** a search for zero-byte files under `src`, **When** the task is complete, **Then** the result is empty.
- **Given** the route table, **When** reviewed, **Then** each path appears exactly once and no "Coming Soon" placeholder exists.

**Definition of Done.** All checks green; dead files removed; route table reviewed; no behavior change beyond removing dead paths; PR reviewed by Tech Lead.

**Tests.**
- Positive: full build + manual smoke of top routes.
- Negative: importing a deleted module fails at compile time (expected).
- Boundary: deep link to removed duplicate route still resolves to the real page.
- Failure: strict null checks around API responses — verify no runtime crash on empty payload.
- Regression: login → dashboard → logout still works.

**Test setup / steps / expected.** `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run preview`, click through public/auth/dashboard routes. Expected: all green, no blank screens.

**Dependencies.** FE-001. Blocks FE-012 (clean baseline), FE-020.

**Deliverables.** PR with green CI, list of removed files, before/after error counts.

**Branch / PR.** `fix/FE-002-ts-eslint-dead-code`.

**Rollback.** Revert commit; deleted files are unreferenced, so no runtime rollback risk.

---

## FE-003 — Remove production console noise and sensitive logging

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-01 |
| Priority | **P0** |
| Checklist | CQ-04, SEC-06, UX-03 |
| Estimate | 1–2 pd · Confidence: High |
| Owner / Reviewer / QA | Frontend Developer / Security-minded Reviewer / QA Engineer |

**Problem statement (evidence).** 127 `console.*` calls exist. `src/services/api.ts:41-47` logs the request URL, query params, and the first 20 characters of the `Authorization` header **without a development guard**, labeled "🔍 DEBUG LOG". `useLogin.ts:123,130` logs the user's email and redirect role. `Websocketservice.ts` logs connection lifecycle.

**Objective.** Ensure production consoles contain no PII, token fragments, or debug noise, while retaining opt-in developer diagnostics.

**User impact.** Prevents credential/PII leakage to anyone with DevTools and makes real errors visible.

**Expected outcome.** Zero unguarded `console.*` in `src`; a single dev-only logger utility; lint rule prevents regression.

**In scope.** Replace/remove logs; add `src/utils/logger.ts` gated by `import.meta.env.DEV`; add ESLint `no-console` with allowlist for the logger; remove "DEBUG" comments.

**Out of scope.** Server logging; analytics (FE-021).

**Files.** `src/services/api.ts`, `src/hooks/useLogin.ts`, `src/services/Websocketservice.ts`, `src/utils/jwt.ts`, plus 120+ occurrences across services/pages.

**Approach.** Mechanical sweep with per-file review; never log tokens, emails, passwords, OTPs, or full URLs with query strings; keep user-facing toasts unchanged.

**Acceptance criteria.**
- **Given** a production build, **When** any page is exercised, **Then** the console contains no `console.log/debug/info` output from app code.
- **Given** a request to a protected endpoint, **When** inspected in DevTools, **Then** no Authorization value appears in any log.
- **Given** a lint run, **When** a developer adds `console.log`, **Then** ESLint fails.

**Definition of Done.** Grep for `console.` returns only the logger module (and approved exceptions); lint rule active; production smoke confirms clean console.

**Tests.**
- Positive: dev mode logger still prints when `DEV=true`.
- Negative: production build suppresses logs.
- Boundary: error objects containing request config are redacted.
- Failure: logger must not throw if `console` is unavailable.
- Regression: toast/error UX unchanged.

**Dependencies.** FE-001. Parallel with FE-006/FE-008. Feeds UX-03 evidence.

**Deliverables.** PR, grep output, production console screenshot from staging.

**Branch / PR.** `chore/FE-003-console-cleanup`.

**Rollback.** Revert; no data impact.

---

## FE-004 — Resolve TODO/FIXME debt and incomplete UI artifacts

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-01 |
| Priority | P1 |
| Checklist | CQ-05, UX-05 |
| Estimate | 2–4 pd · Confidence: Medium |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** `TODO.md` has two open items (finish `ProjectDetail` refactor, run build/lint). Eight TODO/FIXME/HACK markers remain in source. A duplicate `ProjectDetail.tsx` exists at two paths. `App.tsx:235` ships an "Admin Dashboard - Coming Soon" placeholder. Some pages contain demo content (see FE-004 scope and audit F-21).

**Objective.** Convert every incomplete marker into a decision: fix now, ticket with owner, or delete.

**User impact.** Removes placeholder/demo surfaces that look unfinished to users and prevents divergent implementations.

**Expected outcome.** Zero TODO/FIXME in `src`; `TODO.md` closed; each remaining item has an external ticket.

**In scope.** Triage markers; complete or delete the `ProjectDetail` duplication; remove the "Coming Soon" route; replace or label demo testimonials/blogs.

**Out of scope.** New feature development beyond completing an in-progress refactor.

**Files.** `TODO.md`, `src/pages/mentor-pages/ProjectDetail.tsx`, `src/pages/mentor-pages/mentorship-projects/**`, `src/App.tsx`, `src/pages/student-pages/StudentDashboard/StudentDashboard.tsx`, `src/utils/constants.ts`.

**Approach.** Inventory → classify (fix/delete/defer) → execute; if deferred, create a ticket reference in the PR description (not a code TODO).

**Acceptance criteria.**
- **Given** a repository search, **When** searching `TODO|FIXME|HACK` in `src`, **Then** zero results.
- **Given** the admin route table, **When** navigating to `/admin/dashboard`, **Then** the real dashboard renders (no placeholder).
- **Given** the student dashboard, **When** rendered in production, **Then** no hard-coded demo testimonial is presented as real user content.

**Definition of Done.** Markers resolved; dead duplicate deleted; demo content replaced with API data or explicitly gated; QA sign-off on affected pages.

**Tests.**
- Positive: `/admin/dashboard` renders real widgets.
- Negative: removed duplicate import produces compile error if reintroduced.
- Boundary: empty API data on student dashboard shows empty state, not demo data.
- Regression: mentor project detail flows (list → detail → grade) unchanged.

**Dependencies.** FE-002 (route cleanup overlap). Parallel with FE-012.

**Deliverables.** PR + triage table (marker → decision → ticket).

**Branch / PR.** `chore/FE-004-todo-debt`.

**Rollback.** Revert; low risk.

---

## FE-005 — Dependency hygiene and package metadata

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-01 |
| Priority | P1 |
| Checklist | CQ-06 |
| Estimate | 1–2 pd · Confidence: High |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** Import scans show 0 usages for `@jitsi/react-sdk`, `aos`, `html2pdf`, `react-is`, `react-player`, `sweetalert2`, `sweetalert2-react-content`, `zod`, and `@tanstack/react-query-devtools`. `@types/react-router-dom` is v5 while the runtime router is v7. `package.json` still describes a Vite template, uses `"main": "eslint.config.js"`, and has no `engines`/`packageManager`.

**Objective.** Reduce install/build surface and make metadata accurate.

**User impact.** Smaller dependency graph lowers supply-chain risk and install time; no direct UX change.

**Expected outcome.** Only used dependencies remain; metadata matches the product; lockfile consistent.

**In scope.** Remove unused packages; keep `zod` only if FE-013 adopts it (coordinate); fix `@types/react-router-dom`; correct name/description/version/homepage; add `engines`/`packageManager`.

**Out of scope.** Major framework upgrades; replacing libraries.

**Files.** `package.json`, `package-lock.json`, `vite.config.ts` (remove dead `vendor-jitsi`/`vendor-alerts` rules only if FE-016 agrees).

**Approach.** Remove one package at a time, run install + typecheck + lint + build; record bundle delta; update chunk map accordingly.

**Acceptance criteria.**
- **Given** the dependency list, **When** compared with imports, **Then** every declared runtime dependency has at least one import (or a documented justification).
- **Given** `npm ci`, **When** it completes, **Then** the lockfile is unchanged and no peer warnings are introduced.
- **Given** package metadata, **When** read, **Then** name/description/version/engines reflect EduNest.

**Definition of Done.** Removals merged; build green; bundle delta documented; no dead chunk rules.

**Tests.**
- Positive: install/build/typecheck/lint green.
- Negative: removing a package still imported fails the build (guard).
- Boundary: `npm ls` shows no extraneous/missing.
- Regression: certificate PDF export (`html2pdf.js`) and DOCX preview (`mammoth`) still work.

**Dependencies.** FE-001, FE-002. Informs FE-016.

**Deliverables.** PR, `npm ls` output, bundle size delta.

**Branch / PR.** `chore/FE-005-dependency-hygiene`.

**Rollback.** Re-add removed package; lockfile revert.

---

# FE-EPIC-02 — Frontend Security & Authentication Integration

**Problem:** The client hard-codes `localhost`, stores JWTs in `localStorage`, trusts a persisted role, renders unescaped HTML from a model/file, logs auth-header fragments, and has never had a dependency audit.

**Outcome:** A production-safe client configuration, a defensible session model, closed XSS sinks, and an evidence-backed audit — with backend authorization explicitly verified by the backend team, not assumed.

**Checklist coverage:** SEC-01…SEC-07, DEP-01…DEP-03, REL-02.

---

## FE-006 — Centralize environment configuration and API base URL

| Field | Value |
|---|---|
| Type | Task (parent of 3 subtasks) |
| Epic | FE-EPIC-02 |
| Priority | **P0** |
| Checklist | SEC-02, DEP-01, DEP-02, DEP-03 |
| Estimate | 2–3 pd · Confidence: High |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** `src/services/api.ts:4` exports `API_BASE_URL = 'http://localhost:8080'`. There is no `.env*` file or `.env.example`. Source uses two competing names: `VITE_API_BASE_URL` (17 refs) and `VITE_BASE_URL` (5 refs), each with a `?? 'http://localhost:8080'` fallback. There is no runtime validation.

**Objective.** One documented, validated environment contract used by every network/asset URL.

**User impact.** Without this, the deployed app cannot reach the API at all.

**Expected outcome.** Production build reads `VITE_API_BASE_URL`; missing config fails the build fast; no silent localhost fallback.

**In scope.**
- `FE-006A`: add `.env.example`, `src/config/env.ts` with validation, Vite env typing.
- `FE-006B`: refactor `api.ts` + all service modules to import the config.
- `FE-006C`: replace asset/image base URL construction with a shared helper.

**Out of scope.** Backend CORS (external), hosting (FE-019).

**Files.** `.env.example` (new), `src/config/env.ts` (new), `src/vite-env.d.ts` (new), `src/services/api.ts`, `src/services/student-roleService/*`, `src/hooks/**`, `src/utils/imageUtils.ts`, `src/components/**`.

**Approach.**
1. Define `VITE_API_BASE_URL` as the single canonical variable; deprecate `VITE_BASE_URL`.
2. Validate in `env.ts`: must be an absolute `http(s)` URL; throw at module load in production if missing.
3. Keep `import.meta.env.DEV` fallback only for local dev.
4. Replace all literal hosts and `?? 'http://localhost:8080'` fallbacks.
5. Document per-environment values in `.env.example` (placeholders only, no secrets).

**Acceptance criteria.**
- **Given** `VITE_API_BASE_URL=https://api.staging.example.com`, **When** the app builds, **Then** all API and asset requests target that host.
- **Given** no `VITE_API_BASE_URL` in a production build, **When** the build starts, **Then** it fails with a clear message (or the app throws at startup with an error screen).
- **Given** `grep -r "localhost" src`, **When** run after the task, **Then** only the dev fallback in `env.ts` matches.
- **Given** an image path `/uploads/x.png`, **When** resolved, **Then** it becomes `<API host>/uploads/x.png`.

**Definition of Done.** Env contract documented; all consumers migrated; staging build verified; no secret values in any `VITE_*`.

**Tests.**
- Positive: staging build + network tab shows only staging host.
- Negative: missing var → build/startup failure with actionable message.
- Boundary: trailing slash in base URL does not produce `//`.
- Failure: invalid URL (e.g., `localhost`) rejected in production mode.
- Regression: dev proxy still works with `npm run dev`.

**Test setup / steps / expected.** Build with three env variants (dev, staging, production-like); run `grep`; inspect `dist/assets/*.js` for the host string. Expected: only the intended host, no `localhost` in production output.

**Dependencies.** FE-001. Blocks FE-007, FE-008, FE-013, FE-019, FE-020. **Backend must confirm the production API host and CORS origin.**

**Deliverables.** `.env.example`, config module, migration PR(s), grep evidence, staging network capture.

**Branch / PR.** `feat/FE-006-env-config` (+ `feat/FE-006A-*`, `feat/FE-006B-*`, `feat/FE-006C-*`).

**Rollback.** Keep the old constant behind a single commit revert; env files are not committed.

---

### FE-006A — Environment contract and validation module

Add `.env.example`, `src/config/env.ts`, `src/vite-env.d.ts`; validate URL, export typed config; unit-test validation (missing, malformed, trailing slash). **Estimate 0.5–1 pd.** Evidence: tests + failing-build demo.

### FE-006B — Migrate Axios client and services to the config module

Refactor `api.ts` and every `VITE_API_BASE_URL`/`VITE_BASE_URL` consumer; remove literal hosts. **Estimate 1 pd.** Evidence: grep + network capture.

### FE-006C — Centralize asset/image URL resolution

Replace per-component `BASE_URL` constants and `http://localhost:8080${path}` concatenation with one helper. **Estimate 0.5–1 pd.** Evidence: image URLs render on staging; grep clean.

---

## FE-007 — Remove direct fetch/localhost calls and unify the auth header contract

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-02 |
| Priority | **P0** |
| Checklist | DEP-02, DEP-03, SEC-03 (integration), QA-07 |
| Estimate | 2–3 pd · Confidence: High |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).**
- `StatusToggleModal.tsx:32` PATCHes `http://localhost:8080/api/v1/mentorship/:id` with **no Authorization header**.
- `ProjectSubmissionsTable.tsx:32` builds `http://localhost:8080/uploads/submissions/...`.
- `Usechatbot.ts:5` calls `http://127.0.0.1:8000/chat`.
- `MentorshipStudentsTable.tsx:40` sends `Authorization: Bearer <token>`, while `api.ts:59` sends the raw token and `Websocketservice.ts:36` sends the raw token. One contract must be wrong.
- Several `fetch` calls have no timeout or abort handling.

**Objective.** Route all network traffic through the shared client (or a documented wrapper), with one confirmed auth scheme and consistent timeout/error handling.

**User impact.** Mentor activation, submissions, chat, and student tables currently fail in production or return 401.

**Expected outcome.** No raw `fetch` to a hard-coded host; every authenticated request uses the same header format; failures surface a toast/error state.

**In scope.** Replace raw fetches; centralize file URLs; add AbortController/timeout; confirm header format with backend; add integration tests.

**Out of scope.** Backend endpoint changes; chatbot model quality.

**Files.** `src/pages/mentor-pages/mentorship-detail/components/StatusToggleModal.tsx`, `MentorshipStudentsTable.tsx`, `src/pages/mentor-pages/mentorship-projects/components/ProjectSubmissionsTable.tsx`, `src/hooks/chatbot/Usechatbot.ts`, `src/services/api.ts`, `src/services/Websocketservice.ts`.

**Approach.**
1. Ask backend to confirm: `Authorization: <jwt>` or `Bearer <jwt>` (record answer in ticket).
2. Add `authHeaders()` helper and use it everywhere, including STOMP.
3. Replace fetches with `api.patch/post/get`; keep `signal` support.
4. Move chatbot URL to `VITE_CHATBOT_API_URL` with a feature flag; disable the widget if unset.
5. Add error mapping + toast.

**Acceptance criteria.**
- **Given** a mentor activates a mentorship, **When** the request is sent, **Then** it goes to the configured API host with the confirmed auth header and returns 2xx.
- **Given** a student list request, **When** inspected, **Then** the header format matches `api.ts` exactly.
- **Given** `grep -rn "fetch(" src`, **When** reviewed, **Then** remaining calls are justified (file streaming) and use env-derived URLs with abort/timeout.
- **Given** the chatbot env var is absent, **When** the app runs, **Then** the widget is hidden or shows "unavailable" rather than calling localhost.

**Definition of Done.** All calls migrated; backend contract recorded; tests cover success/401/timeout; staging verified.

**Tests.**
- Positive: activate/deactivate mentorship on staging.
- Negative: expired token → 401 → user sees session-expired message (with FE-008).
- Boundary: upload path with spaces/unicode resolves correctly.
- Failure: API down → actionable error, no infinite spinner.
- Regression: student table pagination and submission download still work.

**Dependencies.** FE-006. Overlaps FE-008 (401 handling) and FE-010 (chatbot XSS). **Blocked by backend header confirmation.**

**Deliverables.** PR(s), backend confirmation comment, staging network capture, test results.

**Branch / PR.** `fix/FE-007-network-client-unification`.

**Rollback.** Revert per-endpoint commits; feature-flag chatbot if needed.

---

## FE-008 — Harden authentication session and token lifecycle

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-02 |
| Priority | **P0** |
| Checklist | SEC-05, SEC-06, REL-02 |
| Estimate | 3–5 pd · Confidence: Medium (depends on backend refresh support) |
| Owner / Reviewer / QA | Frontend Tech Lead / Security Reviewer / QA Engineer |

**Problem statement (evidence).** `authStore.ts` persists the JWT in `auth-storage` **and** a separate `token` key in `localStorage`; the token is written regardless of "Remember me"; there is no `exp` check, no refresh call, and no 401 interceptor. `logout()` calls `localStorage.clear()`, wiping unrelated state. `App.tsx:134-146` redirects to a dashboard on load whenever `token && rememberMe && lastEmail`, even on public pages.

**Objective.** A defensible, predictable session model with clear expiry and failure behavior.

**User impact.** Reduces account-takeover blast radius, prevents stale-session confusion, and stops unexpected redirects.

**Expected outcome.** Token storage decision documented; expired/invalid sessions redirect to login with a message; "Remember me" controls persistence; logout clears only auth data.

**In scope.**
- Decide storage: preferred in-memory access token + HttpOnly refresh cookie (requires backend); fallback short-lived token with explicit risk acceptance.
- Add `exp` validation on hydration and before requests.
- Add response interceptor: 401 → clear auth + redirect to `/login?reason=expired` (avoid loops for login endpoints).
- Fix remember-me: persist token only when checked; otherwise session-scoped.
- Scope logout to auth keys; keep theme/preferences.
- Remove duplicate token key or make it the single source.

**Out of scope.** Backend token issuance/refresh endpoint implementation (external), MFA.

**Files.** `src/store/authStore.ts`, `src/services/api.ts`, `src/hooks/useLogin.ts`, `src/App.tsx`, `src/routes/ProtectedRoute.tsx`, `src/utils/jwt.ts`.

**Approach.** Write a short decision record in the PR; implement storage adapter; add tests with fake timers for expiry; coordinate with backend on refresh endpoint/cookie flags (`HttpOnly`, `Secure`, `SameSite`).

**Acceptance criteria.**
- **Given** an expired JWT in storage, **When** the app loads, **Then** the user is treated as unauthenticated and sent to `/login` with an "session expired" notice.
- **Given** "Remember me" is unchecked, **When** the browser tab is closed and reopened, **Then** the user is not automatically authenticated.
- **Given** any API returns 401, **When** the interceptor handles it, **Then** auth state is cleared once and the user is redirected without a redirect loop.
- **Given** logout, **When** it completes, **Then** only auth keys are removed and the theme preference survives.

**Definition of Done.** Decision record approved; tests for expiry/401/remember-me; staging verification; security reviewer sign-off.

**Tests.**
- Positive: valid token → protected route renders.
- Negative: tampered/expired token → redirect.
- Boundary: token expiring during a request → single refresh or clean logout.
- Failure: refresh endpoint 500 → logout, no loop.
- Regression: student profile avatar fetch after login still works.

**Dependencies.** FE-006, FE-007; backend refresh contract. Blocks FE-009, FE-013.

**Deliverables.** Decision record, PR, test report, backend contract link.

**Branch / PR.** `feat/FE-008-session-hardening`.

**Rollback.** Feature-flag new interceptor; revert to previous store shape with a migration note.

---

## FE-009 — Route guard and admin surface hardening

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-02 |
| Priority | **P0** |
| Checklist | SEC-03 (verification), SEC-04, QA-06, REL-02 |
| Estimate | 2–3 pd · Confidence: High |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer + Backend |

**Problem statement (evidence).** `ProtectedRoute` trusts `userRole` from persisted client storage. `App.tsx` has a pathless guard route, a duplicate `/admin/dashboard` placeholder, and places `/explore-mentorships` and `/mentorships/:id/enroll` under student-only guards. No negative tests exist.

**Objective.** Make client routing coherent and explicitly document that it is UX, not authorization.

**User impact.** Legitimate users stop getting bounced; unauthorized users get a clear denial instead of a rendered admin shell.

**Expected outcome.** One canonical route table; deterministic role redirects; tampered role cannot reach backend data; backend authorization verified separately.

**In scope.** Clean routes; centralize dashboard path helper (duplicated in `App.tsx` and `ProtectedRoute.tsx`); add `Unauthorized` state; add role-matrix tests; write backend verification request.

**Out of scope.** Backend authorization implementation.

**Files.** `src/App.tsx`, `src/routes/ProtectedRoute.tsx`, `src/routes/index.tsx`, `src/pages/NotFound.tsx`.

**Approach.** Extract `getDashboardPath` to `src/utils/roles.ts`; remove duplicates; decide public vs protected for explore/enroll with Product Owner; add `<Route path="/unauthorized">`.

**Acceptance criteria.**
- **Given** a guest opening `/admin/users`, **When** the route resolves, **Then** they are redirected to `/login` with `from` preserved.
- **Given** a student opening `/admin/users`, **When** the route resolves, **Then** they are redirected to the student dashboard (or `/unauthorized`), never rendered the admin layout.
- **Given** a tampered `userRole=ROLE_ADMIN` in localStorage, **When** an admin API is called, **Then** the backend returns 403 (verified by backend evidence).
- **Given** the route table, **When** reviewed, **Then** no path is declared twice and no placeholder route exists.

**Definition of Done.** Route table approved; tests pass; backend authorization evidence attached; docs updated to say guards are UX-only.

**Tests.**
- Positive: each role reaches its dashboard.
- Negative: guest/student/admin cross-access attempts.
- Boundary: unknown role string → `/login`.
- Failure: backend 403 on tampered role → error state, no data.
- Regression: deep links to mentor/student sub-routes still work after login.

**Dependencies.** FE-008 (session state). **External:** backend authorization report.

**Deliverables.** PR, role matrix test report, backend evidence link.

**Branch / PR.** `fix/FE-009-route-guards`.

**Rollback.** Revert route changes; no data migration.

---

## FE-010 — Close XSS and unsafe content-rendering sinks

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-02 |
| Priority | P1 |
| Checklist | SEC-06, REL-02 |
| Estimate | 2–3 pd · Confidence: High |
| Owner / Reviewer / QA | Frontend Developer / Security Reviewer / QA Engineer |

**Problem statement (evidence).**
- `ChatbotWidget.tsx:146,173` injects `formatBotText(text)` via `dangerouslySetInnerHTML`; the formatter escapes nothing, so model output containing `<img onerror=...>` executes.
- `FileViewer.tsx:227` injects `convertedHtml` from Mammoth (DOCX) without sanitization.
- `FileViewer.tsx:128` loads `https://unpkg.com/mammoth/...` at runtime when the dynamic import fails.
- Four `window.open` calls omit `noopener` (`FileViewer.tsx:38`, `GradeModal.tsx:85`, `AssimentDetailsPanel.tsx:152`, `ProjectDetail.tsx:159`).

**Objective.** Ensure no untrusted string is rendered as HTML and no third-party script loads at runtime.

**User impact.** Prevents session/token theft via stored or prompt-injected content.

**Expected outcome.** Chatbot renders safe markdown/plain text; DOCX preview sanitized; mammoth bundled; all new windows use `noopener,noreferrer`.

**In scope.** Escape/sanitize; replace HTML formatter with a safe renderer or DOMPurify; remove CDN fallback; fix `window.open` features.

**Out of scope.** Server-side content moderation.

**Files.** `src/components/common/ChatbotWidget/ChatbotWidget.tsx`, `src/components/common/FileViewer.tsx`, `src/pages/mentor-pages/mentorship-projects/components/GradeModal.tsx`, `src/pages/student-pages/studentLearning/assimentSubmission/AssimentDetailsPanel.tsx`, `src/pages/mentor-pages/mentorship-projects/ProjectDetail.tsx`.

**Approach.** Prefer React elements over HTML strings; if HTML is required, sanitize with an allowlist (DOMPurify) and strip event handlers/URLs; add a CSP-compatible policy note for DevOps.

**Acceptance criteria.**
- **Given** a chatbot response containing `<img src=x onerror=alert(1)>`, **When** rendered, **Then** it appears as text and no script executes.
- **Given** a DOCX containing a script/event handler, **When** previewed, **Then** the handler is stripped.
- **Given** the app runs offline/CDN blocked, **When** opening a DOCX, **Then** preview still works (mammoth bundled).
- **Given** any `window.open`, **When** inspected, **Then** it includes `noopener,noreferrer`.

**Definition of Done.** Security review sign-off; payload tests in the QA matrix; no `dangerouslySetInnerHTML` without sanitizer.

**Tests.**
- Positive: normal markdown renders correctly.
- Negative: XSS payloads (`<script>`, `onerror`, `javascript:`) are neutralized.
- Boundary: nested lists/code blocks still render.
- Failure: sanitizer throws → fall back to plain text, never raw HTML.
- Regression: DOCX/PDF preview and certificate export still work.

**Dependencies.** FE-006 (chatbot env). Parallel with FE-008.

**Deliverables.** PR, payload test evidence, security review note.

**Branch / PR.** `fix/FE-010-xss-hardening`.

**Rollback.** Revert; monitor error tracking for preview failures.

---

## FE-011 — Secrets and environment hygiene guardrails

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-02 |
| Priority | P1 |
| Checklist | SEC-01, SEC-02, DEP-03, REL-02 |
| Estimate | 1 pd · Confidence: High |
| Owner / Reviewer / QA | Frontend Developer / Security Reviewer / DevOps |

**Problem statement (evidence).** No live secrets were found in the working tree, but there is no secret scanning, no `.env.example`, and development tunnel artifacts remain (`ngrok-skip-browser-warning` header in `api.ts:14`, ngrok DNS prefetch in `index.html:30`). Git history was not scanned.

**Objective.** Prevent secrets from entering the repo and remove dev-tunnel coupling.

**User impact.** Reduces credential-leak and supply-chain risk.

**Expected outcome.** Secret scanning in CI; clean history or rotated credentials; no ngrok references in production code.

**In scope.** Add gitleaks/trufflehog CI job; scan history; remove ngrok header/prefetch; document rotation; ensure `.env*` ignored and `.env.example` contains placeholders only.

**Out of scope.** Rotating backend credentials (backend/DevOps).

**Files.** `.github/workflows/*`, `.gitignore`, `.env.example`, `src/services/api.ts`, `index.html`.

**Approach.** Run scanner locally on full history; triage findings with owners; add pre-commit hook optional; remove tunnel-specific code.

**Acceptance criteria.**
- **Given** a commit containing a fake AWS key, **When** CI runs, **Then** the secret job fails.
- **Given** the full Git history, **When** scanned, **Then** findings are zero or documented as rotated/revoked.
- **Given** a production build, **When** inspected, **Then** no `ngrok` string is present.

**Definition of Done.** Scanner green; history report attached; ngrok removed; `.env.example` reviewed.

**Tests.**
- Positive: clean repo passes.
- Negative: seeded fake secret fails.
- Boundary: base64-looking strings are not false-positive blockers (allowlist documented).
- Regression: API still works after header removal (backend must not require it in prod).

**Dependencies.** FE-006. Parallel with FE-025.

**Deliverables.** CI job, scan report, removal PR.

**Branch / PR.** `chore/FE-011-secret-hygiene`.

**Rollback.** Remove scanner job if it blocks unrelated work, but keep history report.

---

## FE-025 — Dependency vulnerability triage and remediation

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-02 |
| Priority | P1 |
| Checklist | SEC-07, CMD-03, REL-02 |
| Estimate | 1–3 pd (depends on findings) · Confidence: Low until audit runs |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / Security Reviewer |

**Problem statement (evidence).** `npm audit` has never run; there is no audit report, Dependabot, or Renovate config. The dependency set includes large/rarely-used packages and a Vite 8 major.

**Objective.** Know and reduce vulnerability exposure before release.

**User impact.** Prevents exploitation of known CVEs in shipped client code.

**Expected outcome.** Audit report with zero high/critical, or accepted risks with owner and expiry.

**In scope.** `npm audit --production`, `npm audit fix` (non-breaking), targeted upgrades, overrides where safe, Dependabot config.

**Out of scope.** Major framework migrations that destabilize the release.

**Files.** `package.json`, `package-lock.json`, `.github/dependabot.yml`.

**Approach.** Triage by severity + reachability (is the vulnerable module in the client bundle?); prefer patch/minor; document breaking upgrades as follow-up tickets.

**Acceptance criteria.**
- **Given** `npm audit --production`, **When** run on the release commit, **Then** high/critical = 0 or each has an accepted-risk record with owner/date.
- **Given** Dependabot is enabled, **When** a security advisory is published, **Then** a PR is opened automatically.

**Definition of Done.** Audit report attached; fixes merged; CI gate for high/critical; accepted risks signed off.

**Tests.**
- Positive: build + smoke after upgrades.
- Negative: vulnerable package detection in CI.
- Regression: certificate export, DOCX preview, charts, and chat still work.

**Dependencies.** FE-001 (install), FE-005 (removals reduce surface).

**Deliverables.** Audit JSON, remediation PR, risk register.

**Branch / PR.** `chore/FE-025-dependency-audit`.

**Rollback.** Revert upgrades; lockfile restore.

---

# FE-EPIC-03 — Frontend Automated Testing & QA

**Problem:** There are zero tests and no runner. Auth, enrollment, grading, and payment-adjacent flows have no regression protection.

**Outcome:** A test pyramid that runs in CI and on staging, covering auth, role access, critical journeys, and failure states.

**Checklist coverage:** QA-01…QA-07, CMD-04, REL-03.

---

## FE-012 — Introduce Vitest + React Testing Library harness

| Field | Value |
|---|---|
| Type | Task (parent of 2 subtasks) |
| Epic | FE-EPIC-03 |
| Priority | **P0** |
| Checklist | QA-01, CMD-04, REL-03 |
| Estimate | 2–3 pd · Confidence: High |
| Owner / Reviewer / QA | QA Engineer + Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** `package.json` has no `test` script; the lockfile contains no Vitest/Jest/RTL/Playwright. `npm test` fails immediately.

**Objective.** A fast unit/component harness with coverage reporting and CI integration.

**User impact.** Enables safe change; prevents regressions in validation, guards, and formatting.

**Expected outcome.** `npm test` runs Vitest + RTL + jsdom, with coverage and a CI gate.

**In scope.**
- `FE-012A`: Vitest + jsdom + setup file + `test`/`test:coverage` scripts.
- `FE-012B`: RTL smoke tests for shared components and hooks (ErrorState, EmptyState, ProtectedRoute, auth validation, JWT utils, env validation).

**Out of scope.** Full page coverage; E2E (FE-013).

**Files.** `package.json`, `vite.config.ts` or `vitest.config.ts` (new), `src/test/setup.ts` (new), `src/**/__tests__/*` (new), `.github/workflows/*`.

**Approach.** Use `vitest` with `environment: 'jsdom'`, `@testing-library/jest-dom`, and a `renderWithProviders` helper (QueryClient + Router). Mock Axios with `msw` or `vi.mock`. Set initial coverage thresholds modest (e.g., 30% lines) and ratchet.

**Acceptance criteria.**
- **Given** a clean install, **When** `npm test` runs, **Then** suites execute and exit 0.
- **Given** a failing assertion, **When** CI runs, **Then** the pipeline fails.
- **Given** coverage output, **When** generated, **Then** it reports lines/branches and enforces the agreed threshold.
- **Given** a component test, **When** it renders `ProtectedRoute` with no auth, **Then** it asserts a redirect to `/login`.

**Definition of Done.** Harness merged; ≥10 meaningful tests; CI gate; README testing section.

**Tests.**
- Positive: all suites pass.
- Negative: broken component test fails.
- Boundary: async query states (loading/error) handled with `findBy`.
- Regression: harness does not slow build or leak into production bundle.

**Dependencies.** FE-001, FE-002. Blocks FE-013, FE-014.

**Deliverables.** Config, setup, sample suites, CI log, coverage report.

**Branch / PR.** `chore/FE-012-test-harness` (+ `FE-012A`, `FE-012B`).

**Rollback.** Remove test job; no runtime impact.

---

## FE-013 — Auth journey unit + E2E coverage

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-03 |
| Priority | P1 |
| Checklist | QA-02, QA-05, REL-03 |
| Estimate | 3–5 pd · Confidence: Medium |
| Owner / Reviewer / QA | QA Engineer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** Login, logout, registration, OTP verification, password reset, and account restore have no automated tests. Validation is regex/length-based in hooks; server errors are mapped by substring matching.

**Objective.** Prove the full auth lifecycle and its negative paths.

**User impact.** Auth regressions lock users out or create duplicate/insecure accounts.

**Expected outcome.** Unit tests for hooks/validation + Playwright E2E for happy and failure paths.

**In scope.** Login (valid/invalid/unverified/deleted), logout, register student/mentor, OTP resend/verify, forgot/reset password, restore account, remember-me behavior.

**Out of scope.** Backend email delivery correctness (external), MFA.

**Files.** `src/hooks/useLogin.ts`, `useRegisterForm.ts`, `useVerifyForm.ts`, `useVerifyOTPForm.ts`, `useForgetPassForm.ts`, `useResetPassForm.ts`, `useRestoreForm.ts`; pages under `src/pages/Login`, `register`, `verifiy`, `forgetPass`, `accountRestore`; new `e2e/auth/*`.

**Approach.** Use a seeded test account on staging; intercept email/OTP via backend test endpoint or mailbox fixture (coordinate); avoid real emails.

**Acceptance criteria.**
- **Given** valid credentials, **When** the user logs in, **Then** they land on the correct dashboard and the token is stored per the FE-008 policy.
- **Given** invalid credentials, **When** submitted, **Then** an accessible error message appears and no token is stored.
- **Given** an unverified account, **When** login fails with the unverified signal, **Then** the user is routed to `/verify` and can resend OTP.
- **Given** a password reset request, **When** the OTP is verified, **Then** the new password works and the old one fails.
- **Given** logout, **When** completed, **Then** protected routes redirect to login.

**Definition of Done.** All auth cases automated; green in CI and staging; test data documented; no real PII in fixtures.

**Tests.** Positive, negative, boundary (password length 5/6, OTP wrong/expired), failure (API 500/timeout), regression (remember-me off/on).

**Dependencies.** FE-006, FE-008, FE-012. Blocks FE-020.

**Deliverables.** Unit + E2E suites, CI report, staging run.

**Branch / PR.** `test/FE-013-auth-journeys`.

**Rollback.** Tests only; no runtime impact.

---

## FE-014 — Critical role journeys and failure-state E2E

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-03 |
| Priority | P1 |
| Checklist | QA-03, QA-04, QA-06, QA-07, REL-03 |
| Estimate | 4–6 pd · Confidence: Medium |
| Owner / Reviewer / QA | QA Engineer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** No E2E coverage for explore → enroll, learning content, assignment/project submission, mentor grading, quiz flow, mentorship activation, admin users/payments. Raw fetch calls and 15s timeouts have no failure-state tests.

**Objective.** Automate the revenue- and learning-critical journeys plus failure modes.

**User impact.** These are the flows that, if broken, make the product unusable.

**Expected outcome.** A Playwright suite per role, including loading/empty/error/offline/timeout states.

**In scope.** Student: explore/filter, enroll, open learning, submit assignment/project, take quiz, review. Mentor: create/edit mentorship, activate, view students, grade, schedule session. Admin: users list, badges, payments, issues. Failure: 500, timeout, offline, 401.

**Out of scope.** Payment gateway internals (external), live Jitsi media quality.

**Files.** `src/pages/student-pages/**`, `src/pages/mentor-pages/**`, `src/pages/admin-pages/**`, `src/services/**`; new `e2e/student`, `e2e/mentor`, `e2e/admin`, `e2e/failure`.

**Approach.** Seed deterministic data via API fixtures; use `page.route` to simulate failures; assert on user-visible outcomes and network calls.

**Acceptance criteria.**
- **Given** a student with an active mentorship, **When** they submit an assignment, **Then** the status updates and the mentor sees the submission.
- **Given** a mentor opens a project, **When** they grade a submission, **Then** the student sees the grade.
- **Given** the API returns 500, **When** a list loads, **Then** an error state with retry appears (no blank screen).
- **Given** the network is offline, **When** the user acts, **Then** an offline/timeout message appears and the app does not hang.
- **Given** a guest, **When** visiting a protected route, **Then** they are redirected to login.

**Definition of Done.** P0 journeys green on staging; failure tests deterministic; flaky tests quarantined with owner.

**Tests.** Positive journeys; negative permissions; boundary empty lists/pagination edges; failure 401/403/500/timeout/offline; regression re-run on release candidate.

**Dependencies.** FE-007, FE-009, FE-012, FE-013, FE-015 (error states). Blocks FE-020.

**Deliverables.** E2E suites, trace/video on failure, staging report.

**Branch / PR.** `test/FE-014-critical-journeys`.

**Rollback.** Tests only.

---

# FE-EPIC-04 — React Performance & Bundle Optimization

**Problem:** Bundle size has never been measured; heavy libraries are eagerly loaded; remote images bypass optimization; list performance is unproven.

**Outcome:** Measured budgets, route-scoped loading, optimized assets, and responsive large lists.

**Checklist coverage:** PERF-01…PERF-07.

---

## FE-016 — Bundle analysis, performance budgets, and lazy-loading audit

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-04 |
| Priority | P1 |
| Checklist | PERF-01, PERF-02, PERF-05, PERF-07 |
| Estimate | 3–4 pd · Confidence: Medium |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** No build artifact or bundle report exists. `App.tsx:10-14` eagerly imports `AdminDashboard`, `AdminPayment`, `MentorshipOverviewPage`, `AdminUsers`, and `ChatbotWidget`; the chatbot renders on 16 routes. `manualChunks` targets unused `@jitsi` and `sweetalert2`. `chunkSizeWarningLimit: 500` is not enforced.

**Objective.** Measure the real bundle, remove eager weight, and enforce budgets in CI.

**User impact.** Faster first load on mobile/slow networks; less memory on low-end devices.

**Expected outcome.** A documented budget (e.g., initial JS ≤ 250 KB gzip), analyzer report, and CI failure on regression.

**In scope.** `rollup-plugin-visualizer`; lazy-load admin pages; route-scope chatbot; fix chunk map; Lighthouse mobile baseline for top 5 pages.

**Out of scope.** Framework migration; CDN strategy (DevOps).

**Files.** `vite.config.ts`, `src/App.tsx`, `package.json`, new `scripts/analyze-bundle.*`, CI workflow.

**Approach.** Build → analyze → set budget from measured baseline minus agreed target; convert eager imports to `lazy`; gate chatbot by route/feature flag; verify no layout regression.

**Acceptance criteria.**
- **Given** a production build, **When** the analyzer runs, **Then** every chunk and its gzip size is reported.
- **Given** the public landing page, **When** loaded as a guest, **Then** no admin or chatbot chunk is requested.
- **Given** a PR that increases initial JS beyond budget, **When** CI runs, **Then** the performance job fails.
- **Given** a throttled mobile profile, **When** measuring the top 5 pages, **Then** LCP/INP/CLS are recorded against targets.

**Definition of Done.** Budget documented; analyzer in CI; eager imports removed; Lighthouse report archived.

**Tests.**
- Positive: initial bundle under budget.
- Negative: artificially large import fails the budget check.
- Boundary: slow 3G profile still renders a usable first screen.
- Regression: admin pages and chatbot still function when navigated to.

**Dependencies.** FE-001, FE-005. Feeds FE-018, FE-023.

**Deliverables.** Analyzer report, budget config, Lighthouse JSON, before/after table.

**Branch / PR.** `perf/FE-016-bundle-budget`.

**Rollback.** Remove CI budget gate; keep analyzer.

---

## FE-017 — Render performance and large-list optimization

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-04 |
| Priority | P2 |
| Checklist | PERF-03, PERF-06 |
| Estimate | 3–5 pd · Confidence: Medium |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** 116 `useEffect` hooks and 105 memoization calls; no profiling evidence. Four separate `Pagination.tsx` implementations. Several tables render full arrays; chat and notification lists grow unbounded. Global context providers wrap the entire app.

**Objective.** Reduce unnecessary renders and keep large lists responsive.

**User impact.** Smoother dashboards/chat on mid-range devices.

**Expected outcome.** Profiled hotspots fixed; one pagination component; virtualization where lists are unbounded.

**In scope.** React DevTools profiling of dashboard/chat/tables; split contexts; stabilize selectors; consolidate pagination; add virtualization for chat/notifications if needed.

**Out of scope.** Visual redesign.

**Files.** `src/context/*`, `src/components/common/Pagination/Pagination.tsx`, role-specific `Pagination.tsx`, chat/notification/table components.

**Approach.** Measure → fix → re-measure; prefer composition over global context; memoize row components; use `useDeferredValue` for filters.

**Acceptance criteria.**
- **Given** a 1,000-row table, **When** paginating/filtering, **Then** interaction stays under 100 ms on the reference device.
- **Given** a socket notification, **When** it arrives, **Then** only the notification badge/list re-renders (profiler evidence).
- **Given** the codebase, **When** searching for pagination implementations, **Then** one shared component is used (or documented exceptions).

**Definition of Done.** Before/after profiles attached; no functional regressions; pagination consolidated.

**Tests.** Positive: list interactions; negative: empty/single-page; boundary: page 1/last page; regression: filters + URL state preserved.

**Dependencies.** FE-016. Parallel with FE-018.

**Deliverables.** Profiler captures, PR, consolidated component.

**Branch / PR.** `perf/FE-017-render-lists`.

**Rollback.** Revert per-component; no data impact.

---

## FE-018 — Image and asset optimization audit

| Field | Value |
| --- | --- |
| Type | Task |
| Epic | FE-EPIC-04 |
| Priority | P2 |
| Checklist | PERF-04 |
| Estimate | 2–3 pd · Confidence: High |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** Build-time image optimization is configured, but 87 `<img>` tags include remote Unsplash/pravatar/ui-avatars URLs that bypass it; `OptimizedImage` is only partially adopted; dimensions/srcset are inconsistent; the favicon is still `vite.svg`.

**Objective.** Serve appropriately sized, self-hosted, dimensioned images.

**User impact.** Faster LCP, less layout shift, fewer third-party dependencies.

**Expected outcome.** Top pages use local optimized assets with width/height/srcset; no external avatar dependency in production.

**In scope.** Audit top 10 pages; replace remote demo images; enforce dimensions; add srcset for hero/cards; replace favicon with brand asset.

**Out of scope.** Full CDN image pipeline (DevOps).

**Files.** `public/*`, `src/assets/**`, `src/components/common/OptimizedImage.tsx`, `src/components/home/**`, `src/utils/constants.ts`, `index.html`.

**Approach.** Use the existing optimizer; generate 1x/2x variants; prefer WebP/AVIF with fallbacks; keep alt text meaningful.

**Acceptance criteria.**
- **Given** the landing page, **When** audited in Lighthouse, **Then** no image lacks explicit dimensions and CLS from images is 0.
- **Given** a 3G profile, **When** loading the hero, **Then** the appropriately sized variant is served.
- **Given** a production build, **When** inspecting network requests, **Then** no `i.pravatar.cc`/`ui-avatars.com` request is made.

**Definition of Done.** Top pages audited; assets replaced; report attached; favicon/branding corrected.

**Tests.** Positive: images render at 1x/2x; negative: broken image shows fallback; boundary: very wide viewport selects large variant; regression: alt text preserved.

**Dependencies.** FE-016 (budget). Parallel with FE-017, FE-023.

**Deliverables.** Before/after Lighthouse, asset list, PR.

**Branch / PR.** `perf/FE-018-image-audit`.

**Rollback.** Revert assets; keep originals in Git history.

---

# FE-EPIC-05 — Frontend Production Configuration & Deployment

**Problem:** The repository contains no hosting configuration. `BrowserRouter` deep links will 404 on a static host, and cache/security headers are undefined.

**Outcome:** A reproducible staging and production deployment with SPA rewrite, immutable asset caching, HTTPS, and verified deep links.

**Checklist coverage:** DEP-01…DEP-08, UX-04.

---

## FE-019 — SPA hosting configuration (rewrite, cache, security headers)

| Field | Value |
|---|---|
| Type | Task (two internal workstreams: FE-019A host config, FE-019B cache/headers) |
| Epic | FE-EPIC-05 |
| Priority | **P0** |
| Checklist | DEP-05, DEP-06, DEP-07, UX-04, REL-05 |
| Estimate | 2–3 pd · Confidence: Medium (host unknown) |
| Owner / Reviewer / QA | DevOps/Release Engineer + Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** No `netlify.toml`, `vercel.json`, `Dockerfile`, nginx config, `web.config`, or `404.html`. `BrowserRouter` requires a catch-all rewrite. `vite.config.ts` has no `base` setting. `sourcemap: false`. `robots.txt` references a missing sitemap.

**Objective.** Provide host-ready configuration for staging and production.

**User impact.** Without rewrite, every deep link/refresh fails; without cache policy, users may run stale bundles.

**Expected outcome.** Staging and production deploy configs in-repo, with rewrite, cache, compression, and security headers.

**In scope.**
- `FE-019A`: host config (rewrite `/* → /index.html`, `base` path if subpath, build/output settings).
- `FE-019B`: cache policy (`index.html` no-store/no-cache; hashed assets `immutable, max-age=31536000`), gzip/brotli, security headers (CSP draft, HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors), sitemap/favicon fixes.

**Out of scope.** DNS purchase, certificate issuance (DevOps), backend CORS.

**Files.** New hosting config file(s), `vite.config.ts` (`base`), `index.html`, `public/robots.txt`, `public/sitemap.xml` (new or remove reference).

**Approach.** Confirm host with DevOps; implement its native config; document environment variables; test preview server + staging.

**Acceptance criteria.**
- **Given** a direct request to `/mentor/dashboard`, **When** the host serves it, **Then** HTTP 200 returns the SPA shell and the route renders (or redirects to login).
- **Given** a hashed asset, **When** requested, **Then** `Cache-Control: public, max-age=31536000, immutable`.
- **Given** `index.html`, **When** requested, **Then** it is not cached long-term.
- **Given** a production response, **When** headers are inspected, **Then** HSTS and `X-Content-Type-Options: nosniff` are present and no mixed content exists.

**Definition of Done.** Config merged; staging verified with `curl -I`; deep-link matrix passed; runbook updated.

**Tests.**
- Positive: 10 deep routes direct-load + refresh.
- Negative: unknown path renders 404 page (not host error).
- Boundary: subpath deployment (`/app/`) works if `base` is set.
- Failure: API host unreachable → app shell still loads with error state.
- Regression: asset URLs resolve after deploy.

**Dependencies.** FE-006 (env). **External:** host choice, DNS, TLS.

**Deliverables.** Host config, header captures, deep-link test results, runbook.

**Branch / PR.** `chore/FE-019-spa-hosting` (+ `FE-019A`, `FE-019B`).

**Rollback.** Revert host config; previous deployment remains.

---

## FE-020 — Staging deployment and post-deploy smoke pack

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-05 (release validation in FE-EPIC-07) |
| Priority | **P0** |
| Checklist | DEP-08, MON-04, MON-05, UX-03, REL-05 |
| Estimate | 2–3 pd · Confidence: Medium |
| Owner / Reviewer / QA | QA Engineer + DevOps / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** No staging environment, pipeline, smoke scripts, or post-deploy evidence exists. The only documented workflow ends at `npm run build`.

**Objective.** Deploy the release candidate to staging and prove the smoke pack.

**User impact.** Catches environment-specific failures before users do.

**Expected outcome.** A staging URL running the exact release artifact, with a repeatable smoke suite.

**In scope.** Deploy pipeline; environment variables; smoke suite (public, auth, 3 dashboards, API health, deep links, console/network assertions); evidence capture.

**Out of scope.** Production promotion (release approval), load testing.

**Files.** CI/CD workflow, `e2e/smoke/*`, `documentaion/frontend-production-readiness/frontend-release-approval.md`.

**Approach.** Build once, promote the same artifact; run Playwright smoke + `curl` checks; capture screenshots, console logs, and HAR.

**Acceptance criteria.**
- **Given** the release commit, **When** staging deploys, **Then** the deployed asset hash matches the CI artifact.
- **Given** the smoke pack, **When** executed, **Then** all P0 checks pass and zero unexpected console errors occur.
- **Given** a broken API host, **When** smoke runs, **Then** it fails with a clear diagnostic (negative control).

**Definition of Done.** Staging URL + smoke report attached; known issues listed; release candidate frozen.

**Tests.** Public pages; login each role; dashboard data; deep-link refresh; API 200s; 404 page; console/network clean; mobile viewport smoke.

**Dependencies.** FE-002, FE-006, FE-007, FE-008, FE-009, FE-013, FE-014, FE-019. Blocks FE-026.

**Deliverables.** Staging URL, smoke report, screenshots, HAR.

**Branch / PR.** `chore/FE-020-staging-smoke`.

**Rollback.** Redeploy previous staging artifact.

---

# FE-EPIC-06 — Responsive UI, Accessibility & Browser Compatibility

**Problem:** No device/browser evidence; 32 modals lack dialog semantics; forms lack label association; UI mixes Arabic/English with `lang="en"` and `en-US` dates.

**Outcome:** A tested responsive/a11y baseline and a documented browser support matrix.

**Checklist coverage:** UX-01, UX-02, UX-05, UX-06, UX-07.

---

## FE-022 — Accessibility remediation (dialogs, forms, names, keyboard)

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-06 |
| Priority | P1 |
| Checklist | UX-06 |
| Estimate | 4–6 pd · Confidence: Medium |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** 32 modal components, **0** with `role="dialog"`/`aria-modal`/focus trap. 143 inputs vs 4 `htmlFor`. 556 buttons vs 59 `aria-*`. Only 1 `tabIndex`. Global focus-visible outline exists. `html lang="en"` with Arabic copy.

**Objective.** Meet a practical WCAG 2.1 AA baseline for keyboard and screen-reader use.

**User impact.** Keyboard/screen-reader users currently cannot reliably operate modals or forms.

**Expected outcome.** Accessible dialog primitive; labelled inputs; named icon buttons; logical focus order; axe critical = 0 on top pages.

**In scope.** Shared `Modal` with focus trap/ESC/restore; form label association; icon-button names; landmarks/headings; skip link; contrast fixes; `lang`/`dir` per content.

**Out of scope.** Full WCAG certification audit; screen-reader testing on every page (sample only).

**Files.** 32 modal components; `src/components/common/*`; auth/mentor/student/admin forms; `index.html`; `src/index.css`.

**Approach.** Build one accessible modal primitive and migrate incrementally; add `eslint-plugin-jsx-a11y`; run axe in Playwright; fix by severity.

**Acceptance criteria.**
- **Given** a modal opens, **When** using keyboard only, **Then** focus moves inside, is trapped, ESC closes, and focus returns to the trigger.
- **Given** any form input, **When** inspected, **Then** it has an associated label or `aria-label`.
- **Given** an icon-only button, **When** inspected, **Then** it has an accessible name.
- **Given** the top 10 pages, **When** scanned with axe, **Then** zero critical violations remain.

**Definition of Done.** Primitive adopted; axe report attached; keyboard walkthrough recorded; lint rule active.

**Tests.** Positive keyboard flows; negative missing label (lint/test); boundary long dialog content scroll; failure focus target removed; regression mouse behavior.

**Dependencies.** FE-002 (lint), FE-012 (test harness). Parallel with FE-023.

**Deliverables.** PR(s), axe report, keyboard test script/results.

**Branch / PR.** `fix/FE-022-accessibility`.

**Rollback.** Revert per-component; primitive can be feature-flagged.

---

## FE-023 — Responsive and browser compatibility matrix

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-06 |
| Priority | P2 |
| Checklist | UX-01, UX-02, UX-03 |
| Estimate | 2–3 pd · Confidence: Medium |
| Owner / Reviewer / QA | QA Engineer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** 849 responsive utility usages but no device evidence; wide tables use `min-w-[800px]`; `target: 'esnext'`; no `browserslist`; no supported-browser statement.

**Objective.** Define and verify the supported matrix.

**User impact.** Prevents unusable layouts/navigation on phones and tablets, and syntax failures on older browsers.

**Expected outcome.** Documented matrix (e.g., last 2 Chrome/Edge/Firefox/Safari + iOS Safari + Android Chrome), executed with evidence.

**In scope.** Product decision on browsers; `browserslist` + build target; responsive fixes for nav/tables/modals; cross-browser smoke.

**Out of scope.** IE11; native apps.

**Files.** `package.json` (`browserslist`), `vite.config.ts` (`target`), layout/nav/table components, `documentaion/frontend-production-readiness/frontend-qa-test-matrix.md`.

**Approach.** Agree matrix with Product Owner; run Playwright projects for Chromium/WebKit/Firefox; manual iOS/Android spot check.

**Acceptance criteria.**
- **Given** 360 px width, **When** viewing each top page, **Then** no horizontal overflow except intentional table scroll, and navigation is reachable.
- **Given** the supported browser list, **When** smoke runs on each, **Then** no syntax/runtime errors occur.
- **Given** a tablet viewport, **When** opening a modal, **Then** it fits and scrolls internally.

**Definition of Done.** Matrix documented; build target aligned; defects fixed or ticketed; evidence attached.

**Tests.** Viewports 360/768/1024/1440; browsers per matrix; orientation change; zoom 200%.

**Dependencies.** FE-016 (perf context), FE-022 (modal primitive). Parallel with FE-018.

**Deliverables.** Matrix doc, screenshots, Playwright projects.

**Branch / PR.** `test/FE-023-responsive-matrix`.

**Rollback.** Revert target change if it breaks builds.

---

## FE-024 — Language, locale, date, and timezone consistency

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-06 |
| Priority | P3 |
| Checklist | UX-07 |
| Estimate | 2–4 pd · Confidence: Low (product decision needed) |
| Owner / Reviewer / QA | Frontend Developer / Product Owner / QA Engineer |

**Problem statement (evidence).** `html lang="en"`; mixed Arabic/English copy; `toLocaleDateString('en-US', ...)` in `useMentorships.ts:48`; `toLocaleTimeString('en-US', ...)` in `Usehomepage.ts`; no timezone conversion for deadlines/sessions.

**Objective.** Make language/locale behavior deliberate and correct.

**User impact.** Arabic users see inconsistent language; deadlines can display in the wrong local time.

**Expected outcome.** Product decision recorded (single-language vs bilingual); dates formatted with user locale/timezone; `lang`/`dir` correct.

**In scope.** Locale decision; shared date/time formatter; timezone handling for session/deadline displays; `lang`/`dir` attributes; string audit.

**Out of scope.** Full translation management system unless product requires it.

**Files.** `index.html`, `src/utils/formatTimeago.ts`, `src/hooks/useMentorships.ts`, `src/hooks/student-roleHooks/Usehomepage.ts`, timeline/session components.

**Approach.** Introduce `Intl.DateTimeFormat` wrapper with explicit locale/timezone; centralize; add tests with fixed clock/timezone.

**Acceptance criteria.**
- **Given** a user in UTC+3, **When** a session time is displayed, **Then** it matches the user's local time and is labelled.
- **Given** Arabic content, **When** rendered, **Then** the document `lang`/`dir` matches the content (or a documented single-language decision exists).
- **Given** a date string, **When** formatted, **Then** it uses the shared formatter, not ad-hoc `toLocale*` calls.

**Definition of Done.** Decision recorded; formatter adopted; tests for DST/timezone boundaries; docs updated.

**Tests.** Positive: known timestamps; boundary: DST transition, midnight; failure: invalid date → placeholder; regression: relative time labels.

**Dependencies.** Product decision. Parallel with FE-022/023.

**Deliverables.** Decision note, formatter + tests, PR.

**Branch / PR.** `feat/FE-024-locale-timezone`.

**Rollback.** Revert formatter; keep old strings.

---

# FE-EPIC-07 — Frontend Error Handling, Monitoring & Release Validation

**Problem:** There is no error boundary, no error tracking, no smoke pack, and no rollback plan. A production failure would be invisible and unrecoverable by process.

**Outcome:** Failures are contained, reported, communicated, and recoverable.

**Checklist coverage:** MON-01…MON-06, REL-01…REL-06, QA-04, QA-07.

---

## FE-015 — Error boundaries, offline/timeout UX, and 404 recovery

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-07 |
| Priority | P1 |
| Checklist | QA-04, QA-07, UX-05 |
| Estimate | 2–3 pd · Confidence: High |
| Owner / Reviewer / QA | Frontend Developer / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** No `ErrorBoundary`/`componentDidCatch` exists. A render error blanks the app. `NotFound` uses `navigate(-1)`, which can loop when opened directly. Raw fetches have no timeout; `refetchOnReconnect: false`; no offline banner.

**Objective.** Contain render errors, communicate network failures, and provide a reliable recovery path.

**User impact.** Users see actionable messages instead of blank screens and can recover.

**Expected outcome.** Route-level error boundary + global fallback; offline/timeout banner; 404 with home link.

**In scope.** Error boundary component; route wrapper; offline detector; timeout mapping; 404 CTA; retry affordances.

**Out of scope.** Server-side incident management (FE-021/DevOps).

**Files.** `src/App.tsx`, `src/main.tsx`, `src/pages/NotFound.tsx`, `src/components/common/ErrorState.tsx`, `src/services/api.ts`, new `src/components/common/ErrorBoundary.tsx`.

**Approach.** Class boundary with `getDerivedStateFromError`; report to FE-021 when available; wrap each lazy route; detect `navigator.onLine`.

**Acceptance criteria.**
- **Given** a component throws, **When** rendered, **Then** the boundary shows a fallback with "Reload" and "Go home", and the rest of the shell remains usable.
- **Given** the browser goes offline, **When** a request fails, **Then** an offline message appears and retry is offered.
- **Given** a request exceeds 15s, **When** it aborts, **Then** the UI shows a timeout message, not a spinner.
- **Given** a direct visit to an unknown URL, **When** 404 renders, **Then** "Go home" navigates to `/` (no history loop).

**Definition of Done.** Boundary + offline UX merged; tests for throw/timeout/offline; error reporting hook wired.

**Tests.** Positive: normal render unaffected; negative: forced throw; boundary: offline then online; failure: boundary itself errors → static fallback; regression: 404 links.

**Dependencies.** FE-012 (tests). Blocks FE-014 (failure-state tests), FE-021 (reporting sink).

**Deliverables.** PR, test evidence, screenshots.

**Branch / PR.** `feat/FE-015-error-handling`.

**Rollback.** Remove boundary wrapper; no data impact.

---

## FE-021 — Error tracking and frontend monitoring

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-07 |
| Priority | P1 |
| Checklist | MON-01, MON-02, MON-06 |
| Estimate | 2–3 pd · Confidence: Medium |
| Owner / Reviewer / QA | Frontend Developer + DevOps / Frontend Tech Lead / QA Engineer |

**Problem statement (evidence).** No Sentry/Datadog/Rollbar/LogRocket dependency or init; no Web Vitals instrumentation; `sourcemap: false`; no alert thresholds.

**Objective.** Detect and diagnose production errors and performance regressions.

**User impact.** Faster recovery; fewer repeated user-reported failures.

**Expected outcome.** Errors tagged by release/env with PII scrubbing; Web Vitals captured; dashboards and alerts defined.

**In scope.** Choose tool (Sentry assumed); init with env/release; upload sourcemaps privately; capture boundary + API errors; Web Vitals; alert thresholds; PII policy.

**Out of scope.** Infrastructure APM, backend tracing.

**Files.** `src/main.tsx`, `src/components/common/ErrorBoundary.tsx`, `src/services/api.ts`, `vite.config.ts`, CI workflow, `.env.example`.

**Approach.** Init only in production/staging; sample rates; `beforeSend` scrub tokens/emails; sourcemap upload in CI with auth token stored as secret.

**Acceptance criteria.**
- **Given** a forced error on staging, **When** it occurs, **Then** an event appears with release, route, browser, and stack trace mapped to source.
- **Given** an event payload, **When** inspected, **Then** no token/email/password is present.
- **Given** LCP exceeds the threshold, **When** monitored, **Then** an alert fires to the on-call channel.

**Definition of Done.** Instrumentation live on staging; dashboard link shared; alert test recorded; privacy review done.

**Tests.** Positive: event captured; negative: PII scrubbed; boundary: offline errors queued/dropped safely; failure: SDK unavailable does not break app.

**Dependencies.** FE-015, FE-019. Feeds FE-026.

**Deliverables.** Dashboard, alert config, sourcemap upload proof, privacy note.

**Branch / PR.** `feat/FE-021-monitoring`.

**Rollback.** Disable SDK via env flag; app continues.

---

## FE-026 — Release go/no-go, rollback runbook, and post-deploy verification

| Field | Value |
|---|---|
| Type | Task |
| Epic | FE-EPIC-07 |
| Priority | **P0** |
| Checklist | MON-03, MON-06, REL-01…REL-06 |
| Estimate | 1–2 pd · Confidence: High |
| Owner / Reviewer / QA | Frontend Tech Lead + DevOps / Release Approver / QA Engineer |

**Problem statement (evidence).** No rollback plan, release criteria, or post-deploy verification process exists. Hosting target is undefined, so artifact retention and rollback mechanics are unknown.

**Objective.** Make the release decision evidence-based and recoverable.

**User impact.** Reduces outage duration and prevents shipping known-broken builds.

**Expected outcome.** Signed go/no-go checklist, rehearsed rollback, and a 24-hour post-release watch plan.

**In scope.** Populate `frontend-release-approval.md`; define artifact retention; rehearse rollback on staging; define incident roles; post-deploy watch.

**Out of scope.** Production deployment execution (release manager/DevOps).

**Files.** `frontend-release-approval.md`, CI/CD workflow, runbook section.

**Approach.** Tabletop + staging rehearsal; record timings; define abort criteria.

**Acceptance criteria.**
- **Given** a failed smoke check, **When** the release meeting occurs, **Then** the decision is NO-GO and the checklist records the failing evidence.
- **Given** a bad release, **When** rollback is triggered, **Then** the previous artifact is live within the agreed RTO and verified by smoke.
- **Given** release approval, **When** signed, **Then** every P0 item has an evidence link and an owner.

**Definition of Done.** Checklist signed; rollback rehearsal recorded; watch plan assigned; release notes drafted.

**Tests.** Rollback rehearsal; smoke after rollback; alert verification; decision dry-run.

**Dependencies.** All P0 tasks; FE-020, FE-021.

**Deliverables.** Signed approval, rollback log, watch roster.

**Branch / PR.** `chore/FE-026-release-runbook`.

**Rollback.** The runbook itself is the rollback asset.

---

## Jira Import Field Mapping

The CSV uses these columns:

| CSV column | Jira field | Notes |
|---|---|---|
| `Issue Type` | Issue Type | `Epic`, `Task`, `Sub-task` |
| `Summary` | Summary | ≤ 255 chars, prefixed with temporary ID |
| `Description` | Description | Plain text; includes problem, scope, acceptance summary, evidence |
| `Priority` | Priority | `Highest` (P0), `High` (P1), `Medium` (P2), `Low` (P3) |
| `Labels` | Labels | `frontend`, `production-readiness`, plus epic/task theme labels (no spaces) |
| `Parent` | Parent (team-managed) / Epic Link (company-managed) | Contains temporary epic/task ID pre-import |
| `Temporary ID` | Custom field or label | Not a Jira key; used for mapping |

**Post-import steps (required):**
1. Import the 7 Epics first.
2. Replace `Parent` values `FE-EPIC-0x` with the real epic keys.
3. Import Tasks, then Sub-tasks with `Parent` set to the real task key.
4. Create the "Frontend Release Readiness" board/filter and the release milestone.
5. Link dependencies (`blocks`/`is blocked by`) manually using the dependency graph above.
6. Add components (Routing, Auth, API, Build, Testing, Deployment, A11y, Monitoring) if the project uses them.
7. Verify no duplicate issues were created on re-import (use `Temporary ID` as the external key).

Detailed field mapping, three-pass import order, and validation checks are in `jira-import-notes.md`. FE-019A/FE-019B are workstreams inside FE-019 and are not imported as separate sub-tasks.

**No Jira integration is connected in this repository, and no real issue keys are claimed.**
