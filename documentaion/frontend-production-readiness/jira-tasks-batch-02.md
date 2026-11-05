# Jira Backlog EF — Part 2 (FE-007 … FE-026 + FE-012A/B)

| Field | Value |
|---|---|
| Target | `EF` — mromarmedhat.atlassian.net · board 4 · backlog |
| Language | English |
| ID convention | Every summary is prefixed with its plan ID: `[FE-007] …`. Jira adds its own key (`EF-xx`) on creation |
| Part 1 | `jira-tasks-batch-01.md` — FE-001…FE-006 + FE-006A/B/C (9 issues) |
| Part 2 | this file — FE-007…FE-026 + FE-012A/B (22 issues) |
| Total | **31 issues** — all top-level tasks (no sub-tasks in Jira) |
| Status | **CREATED in Jira** — `EF-24` … `EF-45` (see `jira/jira-created-keys.csv`) |

**Creation order:** Epics → FE-001…FE-026 in numeric order → FE-006A/B/C and FE-012A/B, created as **top-level Tasks** (attached to their epic) so they appear directly in the board backlog.

**Priority mapping:** P0 → Highest · P1 → High · P2 → Medium · P3 → Low.

---

# FE-007 — Remove raw fetch calls and unify the auth header contract

| | |
|---|---|
| **Type** | Task · **Priority** Highest (P0) · **Epic** FE-EPIC-02 · **Estimate** 2–3 d |
| **Labels** | `frontend` `production-readiness` `p0` `security` `api` |
| **Blocked by** | FE-006 · **Blocks** FE-008, FE-013, FE-014 |
| **External** | Backend must confirm the token scheme (`Bearer` vs raw) |

### User Story

As a frontend engineer,
I want every network call to go through one client with one authentication contract,
So that no request silently bypasses auth, points at localhost, or hangs forever.

### Description

Four call sites bypass the shared Axios client, and the codebase contradicts itself on how the token is sent:

- `StatusToggleModal.tsx:32` — `PATCH http://localhost:8080/api/v1/mentorship/:id` with **no Authorization header**.
- `ProjectSubmissionsTable.tsx:32` — builds `http://localhost:8080/uploads/submissions/...` by string concatenation.
- `src/hooks/chatbot/Usechatbot.ts:5` — calls `http://127.0.0.1:8000/chat`.
- `MentorshipStudentsTable.tsx:40` — sends `Bearer <token>`, while `src/services/api.ts:59` sends the **raw** token and `Websocketservice.ts:36` sends it raw as well. One of the two contracts is wrong.
- Raw `fetch` calls have no timeout and no abort handling.

### Scope

**In** — migrate all raw calls to the shared client or a documented wrapper; centralize file URLs; add AbortController/timeout; confirm the header scheme with Backend; integration tests for success/401/timeout.
**Out** — token storage and refresh (FE-008); XSS in chatbot rendering (FE-010); hosting (FE-019).

### Requirements

1. No `fetch(` call remains in `src` except documented streaming cases.
2. Every authenticated request uses one header scheme, confirmed in writing by Backend.
3. Every request has a timeout and cancellation path.
4. File and upload URLs are produced by the shared resolver, never by string concatenation.
5. The chatbot endpoint is env-driven; when unset, the widget is hidden or shows "unavailable".
6. Network errors surface as typed errors the UI can render.

### Acceptance Criteria

- [ ] A mentor toggling a mentorship status sends the request to the configured API host with the confirmed auth header and receives 2xx.
- [ ] `grep -rn "fetch(" src` shows only documented exceptions using env config plus abort/timeout.
- [ ] `grep -rn "127.0.0.1\|localhost" src` returns only the dev fallback in `env.ts`.
- [ ] The token scheme is identical in Axios, WebSocket, and any remaining wrapper.
- [ ] A request that exceeds the timeout fails with a distinguishable timeout error.
- [ ] Backend confirmation comment is linked on the ticket.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-SEC-03 | A logged-in user | Inspect any protected request | Same auth scheme everywhere; no token in query string | Manual | Yes |
| TC-API-02 | A request exceeding the timeout | Wait for it to elapse | Timeout UI, no infinite spinner, retry works | E2E | Yes |
| TC-SEC-04 | Production bundle | Grep for localhost/ngrok | None | Manual | Yes |
| TC-API-06 | Chatbot env variable unset | Open any page | Widget hidden or shows unavailable | Manual | No |

### DoD

Migrations merged · Backend contract comment attached · success/401/timeout tests · staging network capture.

**Files:** `StatusToggleModal.tsx` · `MentorshipStudentsTable.tsx` · `ProjectSubmissionsTable.tsx` · `src/hooks/chatbot/Usechatbot.ts` · `src/services/api.ts` · `src/services/Websocketservice.ts`

---

# FE-008 — Harden authentication session and token lifecycle

| | |
|---|---|
| **Type** | Task · **Priority** Highest (P0) · **Epic** FE-EPIC-02 · **Estimate** 3–5 d |
| **Labels** | `frontend` `production-readiness` `p0` `security` `auth` |
| **Blocked by** | FE-006, FE-007 + Backend refresh contract · **Blocks** FE-009, FE-013 |

### User Story

As a registered user,
I want my session to expire predictably and my logout to be complete,
So that my account is not left open on a shared device and I am never stuck in a redirect loop.

### Description

The JWT is written to `localStorage` twice — inside `auth-storage` and again under a separate `token` key — regardless of whether "remember me" is selected. There is no `exp` check, no refresh flow, and no global 401 handling. `logout()` calls `localStorage.clear()`, which wipes unrelated preferences. Separately, `App.tsx:134-146` redirects to a dashboard on every load when `token && rememberMe && lastEmail` exist, even on public pages.

### Scope

**In** — storage decision record (preferred: access token in memory + refresh in HttpOnly cookie, requires Backend; fallback: short-lived token with explicit accepted risk); `exp` validation on hydration and before requests; single 401 handler that clears the session once and redirects to `/login?reason=expired` without loops; correct remember-me behaviour; logout clears auth keys only; remove the duplicate token key.
**Out** — Backend token issuance; RBAC enforcement (FE-009).

### Requirements

1. One documented session strategy, approved by Tech Lead and Security.
2. Expired or malformed tokens are treated as unauthenticated.
3. Remember-me unchecked → no persistence after the tab closes.
4. Any 401 clears auth state exactly once and redirects with a reason.
5. Logout removes only auth-related keys.
6. No token is logged, placed in a URL, or duplicated across keys.

### Acceptance Criteria

- [ ] An expired JWT in storage is treated as unauthenticated on load; user lands on `/login` with a "session expired" notice.
- [ ] With remember-me unchecked, closing and reopening the browser does not authenticate the user.
- [ ] With remember-me checked, the session survives refresh and restart within the approved window.
- [ ] A 401 from any endpoint clears the session once, with no redirect loop and no 401 storm.
- [ ] After logout, protected routes redirect to login and the back button does not reveal protected content.
- [ ] Theme or other unrelated preferences survive logout.
- [ ] No token value appears in console or network payloads.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-AUTH-04 | Remember-me unchecked | Close tab, reopen | Not authenticated | E2E | Yes |
| TC-AUTH-05 | Remember-me checked | Refresh and restart | Restored once, correct dashboard, no loop | E2E | Yes |
| TC-AUTH-06 | Expired token in storage | Load the app | Session cleared once, `/login` with reason | E2E | Yes |
| TC-AUTH-07 | Logged-in user | Logout then press back | No protected content; storage cleared | E2E | Yes |
| TC-AUTH-09 | Malformed token string | Load the app | Treated as unauthenticated, no crash | Unit | Yes |

### DoD

Written storage decision · tests for expiry/401/remember-me · staging verification · Security sign-off.

**Files:** `src/store/authStore.ts` · `src/services/api.ts` · `src/hooks/useLogin.ts` · `src/App.tsx` · `src/routes/ProtectedRoute.tsx` · `src/utils/jwt.ts`

---

# FE-009 — Harden route guards and the admin surface

| | |
|---|---|
| **Type** | Task · **Priority** Highest (P0) · **Epic** FE-EPIC-02 · **Estimate** 2–3 d |
| **Labels** | `frontend` `production-readiness` `p0` `auth` `routing` |
| **Blocked by** | FE-008 + Backend RBAC evidence · **Blocks** FE-014, FE-020 |

### User Story

As a platform owner,
I want client routing to be consistent and to stop implying that a client-side role check is authorization,
So that users only ever see their own area and privilege is enforced by the API.

### Description

`ProtectedRoute` trusts `userRole` read from local storage, which any user can edit. `App.tsx` contains a route entry with no `path`, a duplicate `/admin/dashboard` placeholder, and `/explore-mentorships` plus `/mentorships/:id/enroll` nested under the student guard only. There are no negative authorization tests, and no documented statement that client guards are UX-only.

### Scope

**In** — clean the route table; centralize `getDashboardPath`; add an `Unauthorized` state; role-matrix tests; a written Backend verification request for RBAC.
**Out** — implementing Backend authorization; permission modelling.

### Requirements

1. Every route appears once with an explicit guard and allowed roles.
2. A tampered local role never grants access to privileged API data (proven with Backend evidence).
3. Unauthenticated deep links preserve the intended destination safely (no open redirect).
4. Documentation states client guards are UX, not security.
5. No placeholder or pathless route remains.

### Acceptance Criteria

- [ ] A guest opening `/admin/users` is redirected to `/login` with `from` preserved.
- [ ] A student opening `/admin/users` is redirected to the student dashboard or `/unauthorized`; no admin layout renders.
- [ ] With `userRole=ROLE_ADMIN` set manually, every admin API returns 401/403 with Backend evidence attached.
- [ ] The route table contains no duplicate path and no placeholder.
- [ ] Hydration gate prevents a flash of protected content.
- [ ] `from` handling rejects external URLs.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-ROLE-01 | Student session | Open a mentor route | Redirect; no mentor shell | E2E | Yes |
| TC-ROLE-02 | Mentor session | Open student/admin route | Redirect; no admin nav | E2E | Yes |
| TC-ROLE-03 | Admin session | Walk the admin routes | Each URL renders once; no placeholder | E2E | Yes |
| TC-ROLE-04 | Any session | Open an unknown URL | App 404 with a home CTA | E2E | Yes |
| TC-ROLE-05 | Tampered role | Call an admin API | 401/403, no data (Backend evidence) | Manual | Yes (Ext) |
| TC-ROLE-06 | Fresh load, protected route | Observe first paint | No protected content before hydration | Manual | No |

### DoD

Approved route table · role tests green · Backend RBAC evidence linked · docs updated.

**Files:** `src/App.tsx` · `src/routes/ProtectedRoute.tsx` · `src/routes/index.tsx` · `src/pages/NotFound.tsx`

---

# FE-010 — Close XSS sinks and unsafe content rendering

| | |
|---|---|
| **Type** | Task · **Priority** High (P1) · **Epic** FE-EPIC-02 · **Estimate** 2–3 d |
| **Labels** | `frontend` `production-readiness` `p1` `security` `xss` |
| **Blocked by** | FE-006 · **Blocks** — |

### User Story

As a user,
I want content from the AI assistant and from uploaded documents to be rendered safely,
So that a malicious message or file cannot execute code in my session.

### Description

`ChatbotWidget.tsx:146,173` injects `formatBotText(text)` through `dangerouslySetInnerHTML`; the formatter escapes nothing, so a model response containing `<img src=x onerror=...>` executes. `FileViewer.tsx:227` injects DOCX-derived HTML from Mammoth without sanitization. `FileViewer.tsx:128` loads `https://unpkg.com/mammoth/...` at runtime when a dynamic import fails. Four `window.open` calls lack `noopener` (`FileViewer.tsx:38`, `GradeModal.tsx:85`, `AssimentDetailsPanel.tsx:152`, `ProjectDetail.tsx:159`).

### Scope

**In** — sanitize or escape all HTML sinks; replace the HTML formatter with a safe renderer or DOMPurify; remove the CDN fallback; add `noopener,noreferrer`; payload tests.
**Out** — chatbot backend prompt safety; file upload validation (Backend).

### Requirements

1. No `dangerouslySetInnerHTML` without a sanitizer.
2. Markdown/HTML from external sources is escaped by default.
3. DOCX preview runs fully from bundled code.
4. External links open with `noopener,noreferrer`.
5. Sanitization has unit tests with known payloads.

### Acceptance Criteria

- [ ] A chat reply containing `<img src=x onerror=alert(1)>` renders as text; no script executes.
- [ ] A DOCX containing an event handler renders with the handler stripped.
- [ ] With the CDN blocked, DOCX preview still works.
- [ ] Every `window.open` includes `noopener,noreferrer`.
- [ ] No `dangerouslySetInnerHTML` exists without a sanitizer call.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-SEC-01 | Chat reply with an XSS payload | Render it | No execution; safe text or sanitized HTML | E2E | Yes |
| TC-SEC-02 | DOCX with embedded script | Preview it | Script/handlers removed; preview works offline | Manual | Yes |
| TC-SEC-07 | A link rendered from user content | Click it | Opens with noopener; protocol restricted | Unit | Yes |

### DoD

Security sign-off · payload tests merged · no unsanitized HTML sink · offline preview verified.

**Files:** `ChatbotWidget.tsx` · `FileViewer.tsx` · `GradeModal.tsx` · `AssimentDetailsPanel.tsx` · `ProjectDetail.tsx`

---

# FE-011 — Secret scanning and environment hygiene

| | |
|---|---|
| **Type** | Task · **Priority** High (P1) · **Epic** FE-EPIC-02 · **Estimate** 1 d |
| **Labels** | `frontend` `production-readiness` `p1` `security` `secrets` |
| **Blocked by** | FE-006 · **Blocks** FE-025 |

### User Story

As a security reviewer,
I want automated detection of secrets and removal of development-tunnel leftovers,
So that no credential enters the repository and no build depends on a temporary tunnel.

### Description

A targeted scan found no live secrets in the working tree, but there is no secret scanner, no history scan, and no `.env.example`. Development tunnel remnants remain: an `ngrok-skip-browser-warning` header in `api.ts:14` and an ngrok DNS prefetch in `index.html:30`.

### Scope

**In** — gitleaks/trufflehog job in CI; full history scan; remove ngrok references; document rotation; confirm `.env*` ignored and `.env.example` contains placeholders only.
**Out** — Backend secret management.

### Requirements

1. CI fails on any detected secret.
2. History is scanned; findings are either zero or recorded as rotated.
3. No `ngrok` reference remains in code or build output.
4. `.env.example` holds placeholders only.

### Acceptance Criteria

- [ ] A commit containing a fake AWS key fails the secret job.
- [ ] Full-history scan report is attached; every finding has a rotation record.
- [ ] `grep -ri ngrok` returns nothing in `src`, `index.html`, or `dist`.
- [ ] `.env.example` reviewed and contains no real values.
- [ ] Rotation procedure documented.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-BLD-05 | A branch with a fake secret | CI runs | Secret job fails and blocks merge | CI | Yes |
| TC-SEC-04 | Production bundle | Grep for ngrok/keys | None | Manual | Yes |
| TC-SEC-08 | Repository history | Run the scanner | Zero or documented-rotated findings | Manual | Yes |

### DoD

Scanner job merged · history report attached · ngrok removed · `.env.example` approved.

**Files:** `.github/workflows/*` · `.gitignore` · `.env.example` · `src/services/api.ts` · `index.html`

---

# FE-012 — Introduce Vitest + React Testing Library harness

| | |
|---|---|
| **Type** | Task (parent of 2 sub-tasks) · **Priority** Highest (P0) · **Epic** FE-EPIC-03 · **Estimate** 2–3 d |
| **Labels** | `frontend` `production-readiness` `p0` `testing` |
| **Blocked by** | FE-001, FE-002 · **Blocks** FE-013, FE-014, FE-015 |

### User Story

As a QA engineer,
I want a fast unit and component test harness wired into CI,
So that regressions are caught before a pull request is merged.

### Description

There is no test runner: no `test` script, no Vitest/Jest/RTL/Playwright in the manifest or lockfile, and `npm test` fails immediately. Every later quality task depends on this harness existing.

### Scope

**In** — FE-012A harness (Vitest + jsdom + setup + scripts); FE-012B smoke tests for shared components, validation, JWT and env helpers; coverage reporting; CI gate.
**Out** — E2E browser tests (FE-013/FE-014).

### Requirements

1. `npm test` runs the suite and exits 0.
2. `npm run test:coverage` produces a coverage report with agreed thresholds.
3. A failing assertion fails the pipeline.
4. At least 10 meaningful tests exist.
5. Testing approach is documented in the README.

### Acceptance Criteria

- [ ] `npm test` succeeds from a clean install.
- [ ] Coverage report shows lines/branches and enforces the agreed floor.
- [ ] `ProtectedRoute` without auth redirects to `/login` (component test).
- [ ] Validation helpers, JWT helpers and env parsing have unit tests.
- [ ] CI fails on a deliberately failing test.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-BLD-06 | Clean install | `npm test` | Suite runs, exit 0 | CI | Yes |
| TC-BLD-07 | A failing assertion | CI runs | Pipeline fails | CI | Yes |
| TC-BLD-08 | Coverage run | Inspect report | Lines/branches reported and threshold enforced | CI | Yes |

### DoD

Harness merged · ≥10 tests · CI gate · README section.

**Files:** `package.json` · `vitest.config.ts` · `src/test/setup.ts` · `src/**/__tests__/*` · CI workflow

## FE-012A — Harness setup

| | |
|---|---|
| **Type** | Task (split from FE-012) · **Priority** Highest · **Estimate** 1 d |

**User Story.** As a frontend engineer, I want a working Vitest + jsdom harness wired into CI, so that every later test task has somewhere to live.

**Requirements**
1. Install Vitest, jsdom, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@vitest/coverage-v8`.
2. Add `vitest.config.ts` with jsdom environment, `src/test/setup.ts`, and path aliases matching `tsconfig`.
3. Add `test` and `test:coverage` scripts to `package.json`.
4. Add a CI job that runs the suite and uploads the coverage report.
5. Exclude `dist`, `node_modules` and generated files from coverage.

**Acceptance Criteria**
- [ ] `npm test` exits 0 from a clean install with zero tests failing.
- [ ] `npm run test:coverage` writes an HTML and a text summary report.
- [ ] A deliberately failing assertion fails the CI job.
- [ ] The CI job appears as a required check on a pull request.
- [ ] No test writes to the real network.

**Test Scenarios**

| ID | Given | When | Then | Type |
|---|---|---|---|---|
| TC-BLD-06 | Clean install | `npm test` | Runner starts, exits 0 | CI |
| TC-BLD-07 | A failing assertion | CI runs | Job fails and blocks merge | CI |
| TC-BLD-08 | Coverage run | Inspect the report | Lines and branches reported | CI |

**Definition of Done.** Config, setup file and scripts merged · CI job green · README testing section added.

**Files:** `package.json` · `vitest.config.ts` (new) · `src/test/setup.ts` (new) · CI workflow

## FE-012B — Shared component and helper smoke tests

| | |
|---|---|
| **Type** | Task (split from FE-012) · **Priority** Highest · **Estimate** 1–2 d |

**User Story.** As a QA engineer, I want the shared building blocks covered by behaviour-level tests, so that a change to a common component cannot silently break every page.

**Requirements**
1. RTL tests for `ErrorState`, `EmptyState`, `LoadingSpinner` and `ProtectedRoute`.
2. Unit tests for auth validation, JWT helpers and environment parsing.
3. At least one negative case per helper.
4. Tests assert behaviour and accessible roles, never implementation details.
5. No real PII, no live API calls.

**Acceptance Criteria**
- [ ] At least 10 meaningful tests exist across components and helpers.
- [ ] `ProtectedRoute` without auth renders a redirect to `/login`.
- [ ] An expired or malformed JWT is rejected by the helper.
- [ ] Env parsing throws on a missing or malformed required variable.
- [ ] The suite is deterministic: three consecutive runs give the same result.

**Test Scenarios**

| ID | Given | When | Then | Type |
|---|---|---|---|---|
| TC-AUTH-09 | A malformed token string | Call the JWT helper | Treated as unauthenticated, no crash | Unit |
| TC-ENV-03 | A malformed env value | Import the config module | Validation error, not a silent fallback | Unit |
| TC-ROLE-06 | No session | Render `ProtectedRoute` | Redirect to `/login` | Component |
| TC-API-04 | An empty collection | Render `EmptyState` | Message plus next action, no spinner | Component |

**Definition of Done.** ≥10 tests merged · coverage floor met · no flaky test · reviewer confirms behaviour-level assertions.

**Files:** `src/components/common/**` · `src/routes/ProtectedRoute.tsx` · `src/utils/**` · `src/config/env.ts` · `src/**/__tests__/*`

---

# FE-013 — Authentication unit and E2E coverage

| | |
|---|---|
| **Type** | Task · **Priority** High (P1) · **Epic** FE-EPIC-03 · **Estimate** 3–5 d |
| **Labels** | `frontend` `production-readiness` `p1` `testing` `auth` |
| **Blocked by** | FE-006, FE-008, FE-012 · **Blocks** FE-014, FE-020 |

### User Story

As a QA engineer,
I want the full authentication lifecycle covered by automated tests,
So that a change to login, verification or password reset cannot silently break access.

### Description

Login, logout, registration, OTP verification, password reset and account restore have no automated coverage. Validation is regex/length based in hooks, and server errors are matched by string comparison.

### Scope

**In** — login (valid, invalid, unverified, deleted), logout, student and mentor registration, OTP resend/verify, forgot/reset password, account restore, remember-me.
**Out** — Backend token issuance; social login.

### Requirements

1. Each auth flow has at least one happy path and one negative path.
2. Tests run against staging with seeded fixtures, not production data.
3. Error messages are asserted for accessibility, not exact wording where copy may change.
4. No real PII is used.

### Acceptance Criteria

- [ ] Valid credentials reach the correct dashboard and the token is stored per FE-008 policy.
- [ ] Invalid credentials show an accessible error and store no token.
- [ ] An unverified account is routed to `/verify` and can resend OTP.
- [ ] Password reset: old password fails, new password works, token is single-use.
- [ ] After logout, protected routes redirect to login.
- [ ] Suite is green in CI and on staging.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-AUTH-01 | Valid student fixture | Log in | Student dashboard; no token in URL/console | E2E | Yes |
| TC-AUTH-02 | Wrong password | Submit | Safe error; stays on `/login`; no token | E2E | Yes |
| TC-AUTH-03 | Empty/invalid fields | Submit | Field errors, focus on first error, no request sent | E2E | Yes |
| TC-AUTH-08 | Deep link before login | Log in | Returns to the intended route, no open redirect | E2E | No |
| TC-AUTH-10 | Unverified account | Log in | Routed to `/verify`; OTP resend works | E2E | Yes |

### DoD

Auth suite merged · green in CI and staging · fixtures documented · no PII.

**Files:** `useLogin.ts` · `useRegisterForm.ts` · `useVerifyForm.ts` · `useVerifyOTPForm.ts` · `useForgetPassForm.ts` · `useResetPassForm.ts` · `useRestoreForm.ts` · auth pages · `e2e/auth/*`

---

# FE-014 — Critical role journeys and failure-mode E2E

| | |
|---|---|
| **Type** | Task · **Priority** High (P1) · **Epic** FE-EPIC-03 · **Estimate** 4–6 d |
| **Labels** | `frontend` `production-readiness` `p1` `testing` `e2e` |
| **Blocked by** | FE-007, FE-009, FE-012, FE-013, FE-015 · **Blocks** FE-020 |

### User Story

As a product owner,
I want the journeys that create learning value and revenue to be proven end to end,
So that a release cannot break enrollment, submission, grading or admin operations unnoticed.

### Description

No E2E coverage exists for explore → enroll, learning content, assignment/project submission, mentor grading, quizzes, mentorship activation, or admin user/payment management. There are also no failure-mode tests for the 15 s timeout or raw `fetch` calls.

### Scope

**In** — student (explore/filter, enroll, learning, submit, quiz, review); mentor (create/edit, activate, students, grade, session); admin (users, badges, payments, issues); failure modes (500, timeout, offline, 401).
**Out** — payment provider settlement; load testing.

### Requirements

1. Every P0 journey has a deterministic E2E test.
2. Failure tests cover 500, timeout, offline and 401.
3. Tests use seeded fixtures and run on staging.
4. Flaky tests are quarantined with an owner, never ignored.

### Acceptance Criteria

- [ ] A student with an active mentorship submits an assignment; the mentor sees the submission.
- [ ] A mentor grades a submission; the student sees the grade.
- [ ] A 500 on a list page shows an error state with retry, not a white screen.
- [ ] Offline use shows an offline/timeout message; the app never hangs.
- [ ] A guest visiting a protected route is redirected to login.
- [ ] Admin user/payment lists paginate and filter correctly.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-JRN-03 | Student fixture | Enroll in a mentorship | Enrollment created once; duplicate blocked | E2E | Yes |
| TC-JRN-04 | Mentor fixture | Create and publish a mentorship | Validation blocks incomplete; published item visible to students | E2E | Yes |
| TC-JRN-05 | Admin fixture | Open users/payments | Rows match seed; pagination/filter reset to page 1 | E2E | Yes |
| TC-API-01 | API returns 500 | Load a list | Error state + retry; single new request; reported to monitoring | E2E | Yes |
| TC-API-03 | Network offline | Perform an action | Offline banner; no unhandled rejection | E2E | Yes |
| TC-FORM-03 | A slow mutation | Double-click submit | One request only; button disabled while pending | E2E | No |

### DoD

P0 journeys green on staging · failure tests deterministic · traces/videos on failure · flake owner assigned.

**Files:** `src/pages/student-pages/**` · `src/pages/mentor-pages/**` · `src/pages/admin-pages/**` · `src/services/**` · `e2e/student` · `e2e/mentor` · `e2e/admin` · `e2e/failure`

---

# FE-015 — Error boundaries, offline/timeout UX and 404 recovery

| | |
|---|---|
| **Type** | Task · **Priority** High (P1) · **Epic** FE-EPIC-07 · **Estimate** 2–3 d |
| **Labels** | `frontend` `production-readiness` `p1` `resilience` `ux` |
| **Blocked by** | FE-012 · **Blocks** FE-014, FE-021 |

### User Story

As a user,
I want a broken page or a dead connection to show a recoverable message instead of a blank screen,
So that I always know what happened and what to do next.

### Description

There is no `ErrorBoundary` or `componentDidCatch` anywhere in `src`; a render error blanks the app. `NotFound` uses `navigate(-1)`, which loops when a deep link is opened directly. Raw `fetch` calls have no timeout, `refetchOnReconnect` is `false`, and there is no offline banner.

### Scope

**In** — route-level error boundary plus a global fallback; offline/timeout banner; 404 with a home CTA; retry affordances; a reporting hook for FE-021.
**Out** — error-tracking vendor selection (FE-021).

### Requirements

1. A render error shows a fallback with Reload and Go home; the shell stays usable.
2. Network failures are distinguishable: offline vs timeout vs server error.
3. 404 always offers a path home without history loops.
4. Boundary errors are reported through one hook.

### Acceptance Criteria

- [ ] A component that throws renders the fallback; the rest of the shell still works.
- [ ] Offline mode shows a banner and a retry path.
- [ ] A request exceeding 15 s shows a timeout message, not a spinner.
- [ ] Opening an unknown URL directly shows the app 404 with a working home CTA.
- [ ] No unhandled promise rejection appears in the console.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-API-01 | A component throws / API 500 | Render | Fallback with retry; shell usable; event reported | E2E | Yes |
| TC-API-02 | Slow API | Wait past timeout | Timeout message; retry works | E2E | Yes |
| TC-API-03 | Offline | Interact | Offline banner; recovers on reconnect | E2E | Yes |
| TC-API-04 | Empty collection | Open the page | Empty state with a next action; no infinite spinner | E2E | No |
| TC-ROLE-04 | Unknown URL | Open directly | App 404, home CTA works | E2E | Yes |

### DoD

Boundary + offline UX merged · tests for throw/timeout/offline · reporting hook wired · screenshots attached.

**Files:** `src/App.tsx` · `src/main.tsx` · `src/pages/NotFound.tsx` · `src/components/common/ErrorState.tsx` · `src/components/common/ErrorBoundary.tsx` (new) · `src/services/api.ts`

---

# FE-016 — Bundle analysis, performance budgets and lazy-loading review

| | |
|---|---|
| **Type** | Task · **Priority** High (P1) · **Epic** FE-EPIC-04 · **Estimate** 3–4 d |
| **Labels** | `frontend` `production-readiness` `p1` `performance` `bundle` |
| **Blocked by** | FE-001, FE-005 · **Blocks** FE-017, FE-018, FE-023 |

### User Story

As a user on a slow connection,
I want to download only the code my page needs,
So that the app becomes interactive quickly instead of waiting for admin and chatbot code.

### Description

No build artifact or bundle report exists. `App.tsx:10-14` eagerly imports `AdminDashboard`, `AdminPayment`, `MentorshipOverviewPage`, `AdminUsers` and `ChatbotWidget`; the chatbot is mounted on 16 routes. `manualChunks` targets `@jitsi` and `sweetalert2`, which are unused. `chunkSizeWarningLimit: 500` is only a warning.

### Scope

**In** — bundle analyzer; lazy-load admin surfaces; bind the chatbot to relevant routes; fix the chunk map; Lighthouse mobile for the five key pages; a CI budget gate.
**Out** — image optimization (FE-018); render performance (FE-017).

### Requirements

1. A bundle report lists every chunk with gzip size.
2. Public pages load no admin or chatbot chunk.
3. CI fails when the entry bundle exceeds the agreed budget.
4. Lighthouse results for five routes are archived.
5. No chunk references an unused package.

### Acceptance Criteria

- [ ] Analyzer report attached with per-chunk gzip sizes.
- [ ] A guest on `/` requests no admin or chatbot chunk.
- [ ] A PR that pushes entry JS above budget fails CI.
- [ ] LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms on the agreed mobile profile (budgets ratified).
- [ ] Budget values are documented and versioned.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-PRF-01 | Throttled mobile profile | Measure five routes | Metrics recorded against budget | Manual | Yes |
| TC-PRF-02 | Production build | Run analyzer | Entry JS within budget; no unused chunks | CI | Yes |
| TC-PRF-03 | Guest on a public page | Inspect network | No admin/chatbot chunks requested | Manual | No |

### DoD

Budget documented · analyzer in CI · eager imports removed · Lighthouse archived.

**Files:** `vite.config.ts` · `src/App.tsx` · `package.json` · `scripts/analyze-bundle.*` · CI

---

# FE-017 — Render performance and large lists

| | |
|---|---|
| **Type** | Task · **Priority** Medium (P2) · **Epic** FE-EPIC-04 · **Estimate** 3–5 d |
| **Labels** | `frontend` `production-readiness` `p2` `performance` |
| **Blocked by** | FE-016 · **Blocks** — · **Gate** Post-launch eligible |

### User Story

As a user with a large dataset,
I want tables and feeds to stay responsive,
So that filtering or paginating a thousand rows does not freeze the page.

### Description

There are 116 `useEffect` and 105 memoization sites with no profiling evidence. Four separate pagination implementations exist. Tables render whole arrays, and chat/notification lists grow unbounded. Theme, WebSocket and notification contexts wrap the entire app.

### Scope

**In** — profiling of dashboards, chat and tables; context splitting; stable selectors; pagination consolidation; virtualization where measured necessary.
**Out** — server-side pagination changes (Backend).

### Requirements

1. Profiling before/after is attached for each optimized screen.
2. One shared pagination component (documented exceptions allowed).
3. A 1000-row table remains interactive.
4. Socket updates re-render only the affected subtree.

### Acceptance Criteria

- [ ] Filtering/paginating 1000 rows completes under 100 ms on the reference device.
- [ ] A socket notification updates only the badge/list (profiler evidence).
- [ ] Pagination implementations consolidated with exceptions documented.
- [ ] No functional regression.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-PRF-04 | 1000-row fixture | Paginate and filter | No freeze; interaction < 100 ms; memory stable | Manual | No |
| TC-PRF-05 | Live socket event | Receive notification | Only the affected component re-renders | Manual | No |

### DoD

Profiles attached · pagination unified · no regression · QA sign-off.

**Files:** `src/context/*` · `src/components/common/Pagination/Pagination.tsx` · role pagination copies · chat/notification/table components

---

# FE-018 — Image and asset optimization review

| | |
|---|---|
| **Type** | Task · **Priority** Medium (P2) · **Epic** FE-EPIC-04 · **Estimate** 2–3 d |
| **Labels** | `frontend` `production-readiness` `p2` `performance` `assets` |
| **Blocked by** | FE-016 · **Blocks** — · **Gate** Post-launch eligible |

### User Story

As a user on mobile data,
I want images sized for my screen and loaded from our own infrastructure,
So that pages do not shift or waste bandwidth on third-party hosts.

### Description

Build-time image optimization is configured, but 87 `<img>` tags include remote Unsplash/pravatar/ui-avatars URLs that bypass it. `OptimizedImage` adoption is partial, dimensions and `srcset` are inconsistent, and the favicon is still `vite.svg`.

### Scope

**In** — audit the top 10 pages; replace remote images; enforce dimensions; `srcset` for hero/cards; brand favicon.
**Out** — CDN image pipeline selection (DevOps).

### Requirements

1. No third-party avatar/image host is requested in production.
2. Every image has explicit width/height.
3. Responsive images use `srcset`/`sizes`.
4. Favicon and app icons match the brand.

### Acceptance Criteria

- [ ] Lighthouse shows image-driven CLS = 0 on audited pages.
- [ ] No request to `i.pravatar.cc` or `ui-avatars.com` in production.
- [ ] Hero serves an appropriately sized variant on a throttled profile.
- [ ] Favicon is the EduNest brand asset.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-PRF-01 | Throttled mobile | Load home | CLS from images = 0; correct variant served | Manual | No |
| TC-PRF-06 | Production build | Inspect network | No third-party image hosts | Manual | No |

### DoD

Audit attached · assets replaced · Lighthouse before/after · favicon updated.

**Files:** `public/*` · `src/assets/**` · `src/components/common/OptimizedImage.tsx` · `src/components/home/**` · `src/utils/constants.ts` · `index.html`

---

# FE-019 — SPA hosting configuration (rewrite, cache, security headers)

| | |
|---|---|
| **Type** | Task · **Priority** Highest (P0) · **Epic** FE-EPIC-05 · **Estimate** 2–3 d |
| **Labels** | `frontend` `production-readiness` `p0` `deployment` `infra` |
| **Blocked by** | FE-006 + host decision · **Blocks** FE-020, FE-021, FE-026 |
| **External** | Hosting target, DNS, TLS ownership |

### User Story

As a release engineer,
I want the SPA served with correct rewrites, cache policy and security headers,
So that deep links work on refresh and assets are cached safely.

### Description

There is no hosting configuration: no `netlify.toml`, `vercel.json`, `Dockerfile`, nginx config, `web.config` or `404.html`. `BrowserRouter` requires a catch-all rewrite. `vite.config.ts` has no `base`, sourcemaps are disabled, and `robots.txt` points to a sitemap that does not exist.

### Scope

**In** — FE-019A host config (rewrite, base path, build/output); FE-019B cache (`index.html` no-store, hashed assets immutable), compression, security headers, sitemap/favicon.
**Out** — DNS provisioning; TLS certificates.

### Requirements

1. Every app route returns 200 with the SPA shell on direct load and refresh.
2. `index.html` is never long-cached; hashed assets are immutable for one year.
3. HTTPS with HSTS; `nosniff`, `Referrer-Policy`, frame restrictions; CSP drafted and tested.
4. Sitemap exists and `robots.txt` points to it.
5. Configuration is committed and reviewable, not click-ops only.

### Acceptance Criteria

- [ ] `/mentor/dashboard` returns 200 and renders (or redirects to login) on direct load.
- [ ] Hashed asset responses carry `Cache-Control: public, max-age=31536000, immutable`.
- [ ] `index.html` is served with no-store/no-cache.
- [ ] HSTS and `X-Content-Type-Options: nosniff` present; no mixed content.
- [ ] CSP does not break the app in report-only, then enforced.
- [ ] Unknown paths return the SPA shell and the app renders its own 404.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-DEP-01 | Deployed host | Open 10 deep links directly and refresh | 200 + correct route | Manual | Yes |
| TC-DEP-02 | Deployed host | `curl -I` HTML and a hashed asset | Correct cache policies | Manual | Yes |
| TC-DEP-03 | Deployed host | Inspect headers/HTTPS | HSTS, nosniff, no mixed content | Manual | Yes |

### DoD

Config merged · `curl -I` evidence · deep-link matrix · runbook updated.

**Files:** host config (new) · `vite.config.ts` · `index.html` · `public/robots.txt` · `public/sitemap.xml`

---

# FE-020 — Staging deployment and post-deploy smoke pack

| | |
|---|---|
| **Type** | Task · **Priority** Highest (P0) · **Epic** FE-EPIC-05 · **Estimate** 2–3 d |
| **Labels** | `frontend` `production-readiness` `p0` `deployment` `qa` |
| **Blocked by** | FE-002, FE-006, FE-007, FE-008, FE-009, FE-013, FE-014, FE-019 · **Blocks** FE-026 |

### User Story

As a release approver,
I want a staging deployment of the exact release artifact with a repeatable smoke pack,
So that the go/no-go decision rests on evidence, not assumption.

### Description

No staging environment, no deployment pipeline and no post-deploy verification exist. The documented path stops at `npm run build`.

### Scope

**In** — deployment pipeline; environment variables; smoke pack (public pages, auth, three dashboards, API health, deep links, console/network); evidence capture.
**Out** — production promotion (FE-026).

### Requirements

1. Staging deploys the same artifact that CI built.
2. Environment variables are injected per environment, never committed.
3. Smoke pack is scripted or checklist-driven and repeatable.
4. Evidence (URL, build SHA, screenshots, HAR) is attached to the ticket.

### Acceptance Criteria

- [ ] The deployed asset hash matches the CI artifact.
- [ ] Every blocking smoke check passes with no unexpected console errors.
- [ ] A deliberately broken API host makes smoke fail with a clear diagnosis (negative control).
- [ ] Staging URL and build SHA are recorded on the ticket.
- [ ] Known issues are listed before the release candidate is frozen.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-DEP-04 | Staging deployed | Run the smoke pack | All P0 checks pass; no CORS/5xx/mixed content | Manual | Yes |
| TC-DEP-06 | Wrong API host | Run smoke | Fails loudly with a diagnosis | Manual | Yes |
| TC-DEP-07 | Release candidate | Compare artifact hashes | Identical to CI artifact | Manual | Yes |

### DoD

Staging live · smoke report attached · known issues documented · RC frozen.

**Files:** CI/CD workflow · `e2e/smoke/*` · `frontend-release-approval.md`

---

# FE-021 — Frontend error tracking and monitoring

| | |
|---|---|
| **Type** | Task · **Priority** High (P1) · **Epic** FE-EPIC-07 · **Estimate** 2–3 d |
| **Labels** | `frontend` `production-readiness` `p1` `observability` |
| **Blocked by** | FE-015, FE-019 · **Blocks** FE-026 |

### User Story

As an on-call engineer,
I want production errors and web vitals reported with release context,
So that I learn about breakage from the dashboard, not from users.

### Description

No Sentry/Datadog/Rollbar/LogRocket integration, no Web Vitals, `sourcemap: false`, and no alert thresholds. Any production failure today is invisible.

### Scope

**In** — vendor selection (Sentry assumed); init with env and release tag; private sourcemap upload; capture boundary and API errors; Web Vitals; alert thresholds; PII policy.
**Out** — Backend APM.

### Requirements

1. Errors carry release, route, browser and a source-mapped stack.
2. No token, email or password is sent in events.
3. Sourcemaps are uploaded privately and not served publicly.
4. Alerts fire to an owned channel with a named on-call.

### Acceptance Criteria

- [ ] A forced staging error appears with release and route context and a readable stack.
- [ ] Event payload inspection shows no PII or token.
- [ ] LCP exceeding the threshold triggers an alert to the on-call channel.
- [ ] Dashboard link and alert configuration are attached to the ticket.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-MON-01 | Staging build | Force an error | Event visible with release/route/browser and source-mapped stack | Manual | Yes |
| TC-MON-02 | A logged-in session | Trigger an error | No token/email in the event payload | Manual | Yes |
| TC-MON-03 | A slow page | Exceed the LCP budget | Alert delivered to the on-call channel | Manual | Yes |

### DoD

Instrumentation live on staging · dashboard shared · alert test recorded · privacy review done.

**Files:** `src/main.tsx` · `src/components/common/ErrorBoundary.tsx` · `src/services/api.ts` · `vite.config.ts` · CI · `.env.example`

---

# FE-022 — Accessibility remediation

| | |
|---|---|
| **Type** | Task · **Priority** High (P1) · **Epic** FE-EPIC-06 · **Estimate** 4–6 d |
| **Labels** | `frontend` `production-readiness` `p1` `a11y` |
| **Blocked by** | FE-002, FE-012 · **Blocks** FE-023 · **Gate** Waiver-eligible with axe critical = 0 |

### User Story

As a user who relies on a keyboard or screen reader,
I want dialogs, forms and navigation to be operable and announced correctly,
So that I can complete the same tasks as everyone else.

### Description

32 modal components contain **zero** `role="dialog"`/`aria-modal`/focus traps. There are 143 inputs but only 4 `htmlFor` associations. 556 buttons carry 59 `aria-*` attributes, and icon-only buttons have no accessible name. Only one `tabIndex` exists. `focus-visible` styling is present, but `html lang="en"` is set while content is partly Arabic.

### Scope

**In** — shared Modal primitive with focus trap/ESC/restore; label association; accessible names for icon buttons; landmarks/headings; skip link; contrast; `lang`/`dir`.
**Out** — full WCAG audit of every page; i18n implementation (FE-024).

### Requirements

1. One accessible modal primitive is used everywhere.
2. Every form control has a programmatic label.
3. Every icon-only control has an accessible name.
4. Keyboard-only operation works for auth and dashboards.
5. axe reports zero critical issues on the ten key routes.

### Acceptance Criteria

- [ ] Opening a modal moves focus inside, traps it, closes on ESC, and restores focus to the trigger.
- [ ] Every input has a label or `aria-label`.
- [ ] Every icon button has an accessible name.
- [ ] axe critical/serious = 0 on ten key routes.
- [ ] A keyboard-only run through login and a dashboard completes without a mouse.
- [ ] `lang`/`dir` match the rendered content.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-A11Y-01 | Any page | Navigate by keyboard only | Logical order, visible focus, no trap, overlays close on ESC | Manual | Yes |
| TC-A11Y-02 | A modal | Open it | `role="dialog"`, `aria-modal`, name, focus trapped and restored | Manual | Yes |
| TC-A11Y-03 | A form | Submit invalid data | Labels associated; `aria-invalid`/`aria-describedby`; focus on first error | Manual | Yes |
| TC-A11Y-04 | Images and icon buttons | Inspect | Meaningful alt or `alt=""`; every icon button named; axe critical = 0 | Manual | Yes |
| TC-A11Y-05 | Text and motion | Inspect contrast and reduced motion | ≥4.5:1 body text; reduced-motion respected | Manual | No |

### DoD

Primitive approved · axe report attached · keyboard recording · lint rule enabled.

**Files:** 32 modal components · `src/components/common/*` · auth/mentor/student/admin forms · `index.html` · `src/index.css`

---

# FE-023 — Responsive and browser support matrix

| | |
|---|---|
| **Type** | Task · **Priority** Medium (P2) · **Epic** FE-EPIC-06 · **Estimate** 2–3 d |
| **Labels** | `frontend` `production-readiness` `p2` `responsive` `browser` |
| **Blocked by** | FE-016, FE-022 · **Blocks** — · **Gate** Post-launch eligible (Chrome + Safari smoke required) |

### User Story

As a user on a phone or a non-Chrome browser,
I want the layout and navigation to work at my screen size,
So that I can use EduNest without horizontal scrolling or broken menus.

### Description

There are 849 responsive utility usages, suggesting intent, but no device evidence. Tables use `min-w-[800px]` with horizontal scrolling, `target: 'esnext'` ships modern syntax with no `browserslist`, and no supported-browser statement exists.

### Scope

**In** — product decision on supported browsers; `browserslist` and build target; fixes for nav, tables and modals; cross-browser smoke.
**Out** — native mobile apps.

### Requirements

1. Supported browsers and viewports are documented.
2. Build target matches the matrix.
3. No unintended horizontal scroll at 360 px.
4. Modals fit tablet viewports and scroll internally.

### Acceptance Criteria

- [ ] At 360×640, every key page has no unintended horizontal scroll and touch targets ≥ 44 px.
- [ ] Smoke passes on Chrome and Safari/iOS at minimum.
- [ ] Tablet and desktop reflow without overlap.
- [ ] No syntax/runtime error on any supported browser.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-RSP-01 | 360×640 viewport | Open each key page | No horizontal scroll; navigation usable; targets ≥44 px | Manual | Yes |
| TC-RSP-02 | Tablet/desktop | Resize | Reflow without overlap; tables scroll or stack | Manual | No |
| TC-RSP-03 | Supported browsers | Run smoke | Same result; no engine-specific error | Manual | Yes |

### DoD

Matrix documented · target aligned · defects fixed or ticketed · evidence attached.

**Files:** `package.json` (`browserslist`) · `vite.config.ts` (`target`) · layout/nav/table components · `frontend-qa-test-matrix.md`

---

# FE-024 — Locale, date and timezone consistency

| | |
|---|---|
| **Type** | Task · **Priority** Low (P3) · **Epic** FE-EPIC-06 · **Estimate** 2–4 d |
| **Labels** | `frontend` `production-readiness` `p3` `i18n` |
| **Blocked by** | Product decision · **Blocks** — · **Gate** Post-launch eligible |

### User Story

As an Arabic-speaking user,
I want dates, times and text direction to match my locale,
So that a session time or deadline is unambiguous.

### Description

`html lang="en"` is set while content mixes Arabic and English. Dates are formatted with hard-coded `'en-US'` in `useMentorships.ts:48` and `Usehomepage.ts`. There is no timezone handling for sessions or deadlines and no i18n layer.

### Scope

**In** — language decision record; shared formatter; timezone handling for sessions/deadlines; `lang`/`dir`; copy audit.
**Out** — full translation of the product.

### Requirements

1. One documented language and direction decision.
2. One shared date/time formatter; no scattered `toLocale*` calls.
3. Session times render in the user's timezone with an explicit label.
4. Formatting is covered by tests, including DST.

### Acceptance Criteria

- [ ] A session at a known UTC time displays the user's local time with a timezone label.
- [ ] Arabic content renders with matching `lang`/`dir` (or the single-language decision is documented).
- [ ] `grep` shows no hard-coded `'en-US'` outside the shared formatter.
- [ ] DST boundary tests pass.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-I18N-01 | User in UTC+3 | View a session | Local time + label matches expectation | Unit | No |
| TC-I18N-02 | Arabic content | Render | `lang`/`dir` correct | Manual | No |
| TC-I18N-03 | DST transition date | Format the date | Correct offset, no off-by-one day | Unit | No |

### DoD

Decision recorded · formatter + tests merged · docs updated.

**Files:** `index.html` · `src/utils/formatTimeago.ts` · `src/hooks/useMentorships.ts` · `src/hooks/student-roleHooks/Usehomepage.ts` · timeline/session components

---

# FE-025 — Dependency vulnerability triage

| | |
|---|---|
| **Type** | Task · **Priority** High (P1) · **Epic** FE-EPIC-02 · **Estimate** 1–3 d |
| **Labels** | `frontend` `production-readiness` `p1` `security` `dependencies` |
| **Blocked by** | FE-001, FE-005, FE-011 · **Blocks** FE-026 |

### User Story

As a security reviewer,
I want to know and reduce our exposure to known vulnerabilities before release,
So that we do not ship a client with an exploitable dependency.

### Description

`npm audit` has never run; there is no audit report, Dependabot or Renovate configuration. The dependency set includes large, rarely used packages and a Vite 8 major.

### Scope

**In** — `npm audit --production`; non-breaking `npm audit fix`; targeted upgrades; safe overrides; Dependabot config.
**Out** — major framework migrations that destabilize the release.

### Requirements

1. Audit runs on the release commit and the report is archived.
2. Zero high/critical, or each one has an accepted-risk record with owner and expiry.
3. CI blocks new high/critical findings.
4. Automated update PRs are enabled.

### Acceptance Criteria

- [ ] `npm audit --production` shows zero high/critical, or a signed accepted-risk record per finding.
- [ ] Remediation PRs are merged with a green build.
- [ ] CI gate on high/critical is active.
- [ ] Dependabot opens a PR when an advisory is published.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-BLD-04 | Release commit | `npm audit --production` | 0 high/critical or documented exceptions | CI | Yes |
| TC-DEP-10 | Dependabot enabled | An advisory is published | A PR is opened automatically | Manual | No |

### DoD

Audit report attached · fixes merged · CI gate live · risk log signed.

**Files:** `package.json` · `package-lock.json` · `.github/dependabot.yml`

---

# FE-026 — Go/no-go, rollback and post-deploy verification

| | |
|---|---|
| **Type** | Task · **Priority** Highest (P0) · **Epic** FE-EPIC-07 · **Estimate** 1–2 d |
| **Labels** | `frontend` `production-readiness` `p0` `release` `rollback` |
| **Blocked by** | All Tier 1 tasks, FE-020, FE-021 · **Blocks** Release |

### User Story

As a release approver,
I want a signed, evidence-backed go/no-go decision with a rehearsed rollback,
So that a bad release can be reversed in minutes instead of hours.

### Description

There is no rollback procedure, no release criteria and no post-deploy verification process. The hosting target is undecided, so artifact retention and rollback mechanics are unknown.

### Scope

**In** — complete `frontend-release-approval.md`; define artifact retention; rehearse rollback on staging; incident roles; post-deploy watch plan.
**Out** — production infrastructure provisioning.

### Requirements

1. Every P0 control row has a linked evidence item and an owner.
2. Rollback is rehearsed and timed on staging.
3. The production artifact is byte-identical to the staging artifact.
4. A 24-hour watch plan has named owners and thresholds.

### Acceptance Criteria

- [ ] A failed smoke check produces a recorded NO-GO with the failing evidence.
- [ ] Rollback restores the previous artifact within the agreed RTO (≤ 15 min) and smoke passes afterwards.
- [ ] Every P0 control row has an evidence link.
- [ ] The approval block is signed by the required quorum.
- [ ] Release notes and support briefing are attached.

### Test Scenarios

| ID | Given | When | Then | Type | Blocking |
|---|---|---|---|---|---|
| TC-DEP-05 | A deployed release | Execute rollback | Previous version serves traffic within RTO; smoke green; timings recorded | Manual | Yes |
| TC-DEP-08 | A failing smoke check | Hold the go/no-go | Decision NO-GO with the failing evidence recorded | Manual | Yes |
| TC-DEP-09 | A signed release | Verify controls | Every P0 row has an evidence link and owner | Manual | Yes |

### DoD

Checklist signed · rollback rehearsal recorded · watch plan assigned · release notes drafted.

**Files:** `frontend-release-approval.md` · CI/CD · runbook section

---

## Full backlog summary (31 issues)

| ID | Summary | Type | Priority | Estimate (d) | Epic |
|---|---|---|---|---|---|
| FE-001 | Reproducible build baseline and CI gates | Task | Highest | 1–2 | 01 |
| FE-002 | TS/ESLint clean + dead code and duplicate routes | Task | Highest | 3–5 | 01 |
| FE-003 | Remove console noise and sensitive logging | Task | Highest | 1–2 | 01 |
| FE-004 | TODO/FIXME triage and incomplete UI | Task | High | 2–4 | 01 |
| FE-005 | Dependency hygiene and package metadata | Task | High | 1–2 | 01 |
| FE-006 | Centralize env config and API base URL | Task | Highest | 2–3 | 02 |
| FE-006A | Environment contract and validation module | Task | Highest | 0.5–1 | 02 |
| FE-006B | Migrate Axios and services | Sub-task | Highest | 1 | 02 |
| FE-006C | Centralize asset/upload URL resolution | Sub-task | Highest | 0.5–1 | 02 |
| FE-007 | Remove raw fetch and unify auth header | Task | Highest | 2–3 | 02 |
| FE-008 | Harden auth session and token lifecycle | Task | Highest | 3–5 | 02 |
| FE-009 | Harden route guards and admin surface | Task | Highest | 2–3 | 02 |
| FE-010 | Close XSS sinks and unsafe rendering | Task | High | 2–3 | 02 |
| FE-011 | Secret scanning and environment hygiene | Task | High | 1 | 02 |
| FE-012 | Introduce Vitest + RTL harness | Task | Highest | 2–3 | 03 |
| FE-012A | Harness setup | Sub-task | Highest | 1 | 03 |
| FE-012B | Shared component and helper smoke tests | Sub-task | Highest | 1–2 | 03 |
| FE-013 | Auth unit and E2E coverage | Task | High | 3–5 | 03 |
| FE-014 | Role journeys and failure-mode E2E | Task | High | 4–6 | 03 |
| FE-015 | Error boundaries, offline/timeout, 404 | Task | High | 2–3 | 07 |
| FE-016 | Bundle analysis and performance budgets | Task | High | 3–4 | 04 |
| FE-017 | Render performance and large lists | Task | Medium | 3–5 | 04 |
| FE-018 | Image and asset optimization | Task | Medium | 2–3 | 04 |
| FE-019 | SPA hosting configuration | Task | Highest | 2–3 | 05 |
| FE-020 | Staging deployment and smoke pack | Task | Highest | 2–3 | 05 |
| FE-021 | Error tracking and monitoring | Task | High | 2–3 | 07 |
| FE-022 | Accessibility remediation | Task | High | 4–6 | 06 |
| FE-023 | Responsive and browser matrix | Task | Medium | 2–3 | 06 |
| FE-024 | Locale, date and timezone | Task | Low | 2–4 | 06 |
| FE-025 | Dependency vulnerability triage | Task | High | 1–3 | 02 |
| FE-026 | Go/no-go, rollback, post-deploy | Task | Highest | 1–2 | 07 |

**Epics to create first (if absent):**

| Epic | Title |
|---|---|
| FE-EPIC-01 | Frontend Code Quality & Build Reliability |
| FE-EPIC-02 | Frontend Security & Auth Integration |
| FE-EPIC-03 | Testing & Quality Assurance |
| FE-EPIC-04 | React Performance & Bundle |
| FE-EPIC-05 | Production Configuration & Deployment |
| FE-EPIC-06 | Responsive, Accessibility & Compatibility |
| FE-EPIC-07 | Error Handling, Monitoring & Release |
