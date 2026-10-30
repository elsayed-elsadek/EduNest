# EduNest Frontend — QA Test Matrix

| Field | Value |
|---|---|
| Audit / planning date | 2026-10-30 |
| Application | EduNest SPA (React 19 + TypeScript + Vite) |
| Scope | Frontend only: browser behavior, client routing, UI states, frontend build/deploy artifacts |
| Out of scope | Backend authorization correctness, payment-provider settlement, email deliverability, load/penetration testing |
| Companion documents | `frontend-checklist-traceability.md`, `frontend-epics-and-tasks.md`, `frontend-release-approval.md` |

This matrix is the executable definition of "verified" for the frontend release. A checklist item is not PASS until the corresponding test case has been run in the stated environment and its evidence is attached to the release ticket. Cases marked **Blocking = Yes** must pass on staging before go/no-go.

**Important:** the repository currently has no test runner, no CI, and no staging environment. Every case below is therefore **not yet executed**. This document defines what must be executed; it does not claim any case has passed.

---

## 1. How to read this matrix

### 1.1 Columns

| Column | Meaning |
|---|---|
| **ID** | Stable test-case identifier; use it in PR descriptions, CI job names, and bug reports |
| **Scenario** | One-line behavior under test |
| **Preconditions** | Required state, account, data, or environment |
| **Steps** | Ordered actions; `<br>` separates steps |
| **Expected result** | Observable, binary outcome (URL, status, text, header, count) |
| **Task** | Backlog item that must make the case pass |
| **Checklist** | Traceability ID(s) from `frontend-checklist-traceability.md` |
| **Type** | `Static`, `Unit`, `Integration`, `E2E`, `Manual`, `Non-functional` |
| **Automation** | `V` Vitest · `R` React Testing Library · `P` Playwright · `C` CI/script · `M` manual only |
| **Blocking** | `Yes` = release blocker · `No` = required but not a hard gate · `Ext` = external evidence |

### 1.2 Environments

| Code | Environment | Purpose | Data |
|---|---|---|---|
| `LOCAL` | Developer machine, `npm run dev` | Fast feedback | Mocked API or local backend |
| `CI` | Clean container, `npm ci` | Deterministic build/test gate | Fixtures, MSW mocks |
| `STG` | Staging SPA + staging API | Release-candidate validation | Seeded student/mentor/admin accounts |
| `PRD` | Production | Post-deploy verification only | Real accounts, read-only where possible |

### 1.3 Required test identities and fixtures

| Fixture | Purpose |
|---|---|
| `student.active` | Verified student with ≥1 enrollment, ≥1 notification |
| `student.empty` | Verified student with no enrollments (empty states) |
| `mentor.active` | Verified mentor with ≥1 mentorship, ≥1 student, ≥1 submission |
| `admin.active` | Admin with access to users, payments, issues, configurations |
| `user.unverified` | Registered but email-unverified account |
| `token.expired` | Structurally valid JWT with `exp` in the past |
| `token.malformed` | Non-JWT string in `localStorage.token` |
| `role.tampered` | Student token with `userRole` manually changed to `ROLE_ADMIN` |
| `list.1000` | Seeded list of 1,000 rows for table/pagination performance |
| `api.down` | Staging API stopped or blocked via proxy |
| `api.slow` | API delayed beyond the 15 s Axios timeout |

Fixtures must be created by backend/QA seed scripts, never by editing production data.

---

## 2. Coverage map

| Suite | Cases | Primary tasks | Checklist coverage |
|---|---:|---|---|
| A. Build & static verification | 5 | FE-001, FE-002, FE-003, FE-011, FE-025 | CQ-01…CQ-06, SEC-01, SEC-07, CMD-01…CMD-05 |
| B. Authentication & session | 8 | FE-008, FE-013 | SEC-05, SEC-06, QA-02, QA-05, REL-02, REL-03 |
| C. Roles & routing | 6 | FE-009, FE-014 | SEC-03, SEC-04, QA-06, REL-02 |
| D. Core user journeys | 5 | FE-014 | QA-02, QA-03, QA-05, REL-03 |
| E. API failure, offline & timeout | 5 | FE-015, FE-014 | QA-04, QA-07, UX-05 |
| F. Forms & validation | 3 | FE-014 | QA-05, UX-05 |
| G. Accessibility | 5 | FE-022 | UX-06 |
| H. Responsive & browser compatibility | 3 | FE-023 | UX-01, UX-02, UX-03 |
| I. Performance | 4 | FE-016, FE-017, FE-018 | PERF-01…PERF-07 |
| J. Content & client security | 4 | FE-010, FE-011, FE-007 | SEC-02, SEC-06, REL-02 |
| K. Deployment & release | 5 | FE-019, FE-020, FE-021, FE-026 | DEP-02…DEP-08, MON-03…MON-06, REL-05, REL-06 |
| **Total** | **53** | | |

Not every checklist item needs a dedicated browser case. Evidence-only items (dependency inventory, secret scan of history, DNS ownership, TLS issuance, backend RBAC) are covered by scripts or external attestations in section 5.

---

## 3. Test cases

### A. Build & static verification

| ID | Scenario | Preconditions | Steps | Expected result | Task | Checklist | Type | Automation | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| TC-BLD-01 | Clean install and type-check | Fresh clone; Node version pinned; no `node_modules` | 1. `npm ci`<br>2. `npm run typecheck` (or `npx tsc -b`)<br>3. Record exit code and duration | Both commands exit 0; zero TypeScript errors; log archived with commit SHA | FE-001, FE-002 | CQ-01, CMD-01 | Static | C | Yes |
| TC-BLD-02 | Lint gate | Dependencies installed | 1. `npm run lint`<br>2. Introduce one unused variable on a scratch branch and re-run | Clean branch exits 0 with zero errors; scratch branch fails the lint step | FE-001, FE-002 | CQ-02, CMD-02 | Static | C | Yes |
| TC-BLD-03 | Production build and artifact | Dependencies installed; env vars supplied | 1. `npm run build`<br>2. Inspect `dist/`<br>3. Serve `dist/` with `npm run preview` | Build exits 0; `dist/index.html` plus hashed assets exist; preview loads `/` without console errors; artifact checksum recorded | FE-001, FE-002 | CQ-03, CMD-05, REL-04 | Static | C | Yes |
| TC-BLD-04 | Dependency vulnerability gate | `package-lock.json` committed | 1. `npm audit --production --json`<br>2. Triage high/critical findings<br>3. Re-run after upgrades | Zero high/critical, or each accepted risk has owner, rationale, expiry date in the ticket | FE-025 | SEC-07, CMD-03, CQ-06 | Static | C | Yes |
| TC-BLD-05 | Secret and debug-artifact scan | Full git history available | 1. Run gitleaks/trufflehog over working tree and history<br>2. Grep `dist/` for `localhost`, `127.0.0.1`, `sk-`, `AKIA`, `BEGIN PRIVATE KEY`<br>3. Grep source for unguarded `console.*` | No live secrets; no private hostnames in production bundle; no unguarded console calls outside a dev logger | FE-003, FE-011 | SEC-01, SEC-06, CQ-04 | Static | C | Yes |

### B. Authentication & session

| ID | Scenario | Preconditions | Steps | Expected result | Task | Checklist | Type | Automation | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| TC-AUTH-01 | Student login happy path | `student.active`; STG API up | 1. Open `/login`<br>2. Enter valid email/password<br>3. Submit | Redirect to `/student/dashboard`; name/avatar render; exactly one authenticated API call pattern; no token in URL or console | FE-008, FE-013 | SEC-05, QA-02 | E2E | P | Yes |
| TC-AUTH-02 | Invalid credentials | `student.active` | 1. Open `/login`<br>2. Enter valid email + wrong password<br>3. Submit | Inline or toast error with a safe mapped message; stays on `/login`; no token stored; no raw backend stack/message | FE-008, FE-013 | SEC-06, QA-02, QA-05 | E2E | P | Yes |
| TC-AUTH-03 | Login form validation | None | 1. Submit empty form<br>2. Enter `not-an-email`<br>3. Enter 1-character password | Field-level messages appear; focus moves to first invalid field; no network request fired; messages are programmatically associated with inputs | FE-013, FE-022 | QA-05, UX-06 | Integration | R | Yes |
| TC-AUTH-04 | Remember-me off | `student.active`; clean storage | 1. Log in with "Remember me" unchecked<br>2. Confirm storage contents<br>3. Close tab, open new tab to `/student/dashboard` | Session does not persist across a new browser session (token cleared or session-scoped); no `lastEmail` prefill beyond documented behavior; app redirects to `/login` | FE-008 | SEC-05, QA-02 | E2E | P | Yes |
| TC-AUTH-05 | Remember-me on | `student.active`; clean storage | 1. Log in with "Remember me" checked<br>2. Close and reopen browser<br>3. Navigate to `/login` | Session restores once, user lands on the correct role dashboard; email prefilled; exactly one redirect (no loop) | FE-008 | SEC-05, QA-02 | E2E | P | Yes |
| TC-AUTH-06 | Expired token handling | `token.expired` injected; any protected route | 1. Open `/student/dashboard`<br>2. Trigger any API call<br>3. Observe redirect and storage | On 401/expiry, session is cleared once and user is sent to `/login` with a safe "session expired" message; no redirect loop; no repeated 401 storm | FE-008 | SEC-05, QA-04, REL-02 | E2E | P | Yes |
| TC-AUTH-07 | Logout and back-button isolation | Logged-in student | 1. Click logout<br>2. Press browser Back<br>3. Navigate directly to `/student/dashboard` | Storage cleared; back button does not render authenticated content; direct visit redirects to `/login`; no cached PII visible | FE-008, FE-009 | SEC-05, QA-06 | E2E | P | Yes |
| TC-AUTH-08 | Deep-link preservation after login | `student.active`; logged out | 1. Open `/student/learning` directly<br>2. Log in | After login, user returns to `/student/learning` (or documented safe default), not an unrelated dashboard; no open-redirect to an external URL | FE-009, FE-013 | SEC-04, QA-02 | E2E | P | No |

### C. Roles & routing

| ID | Scenario | Preconditions | Steps | Expected result | Task | Checklist | Type | Automation | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| TC-ROLE-01 | Student cannot enter mentor area | `student.active` | 1. Log in<br>2. Navigate to `/mentor/dashboard`<br>3. Repeat for `/mentor/students` | Redirected to `/student/dashboard`; no mentor shell or mentor API data rendered; no 403 loop | FE-009 | SEC-04, QA-06 | E2E | P | Yes |
| TC-ROLE-02 | Mentor cannot enter student/admin area | `mentor.active` | 1. Log in<br>2. Navigate to `/student/dashboard` and `/admin/dashboard` | Redirected to `/mentor/dashboard`; no admin navigation visible | FE-009 | SEC-04, QA-06 | E2E | P | Yes |
| TC-ROLE-03 | Admin route resolution | `admin.active` | 1. Log in<br>2. Open `/admin/dashboard`<br>3. Open `/admin/users`, `/admin/payment`, `/admin/issues`, `/admin/configurations` | Each URL renders exactly one admin page; no "Coming Soon" placeholder; sidebar active state matches route | FE-009 | SEC-04, QA-06 | E2E | P | Yes |
| TC-ROLE-04 | Unknown route renders SPA 404 | Any role | 1. Open `/this-route-does-not-exist`<br>2. Refresh the page | App-level NotFound page renders with a link home; HTTP status is 200 from the host (SPA) but UI clearly signals not-found; no blank screen | FE-009, FE-019 | UX-04, QA-06 | E2E | P | Yes |
| TC-ROLE-05 | Tampered client role is UX-only | `role.tampered` in `localStorage` | 1. Set `userRole` to `ROLE_ADMIN` with a student token<br>2. Open `/admin/users`<br>3. Observe network responses | Client may render the shell (documented limitation), but every admin API call returns 401/403 and the UI shows an access-denied state; no admin data is displayed | FE-009 + backend request | SEC-03, SEC-04, REL-02 | E2E + Ext | P + M | Yes (Ext evidence) |
| TC-ROLE-06 | Hydration gate prevents flash of protected UI | Persisted session; throttled CPU | 1. Reload a protected route with DevTools CPU throttling 6×<br>2. Record screen | No protected content or redirect flash before hydration; loader or blank shell shown; exactly one final navigation | FE-009 | SEC-04, QA-06 | Manual | M | No |

### D. Core user journeys

| ID | Scenario | Preconditions | Steps | Expected result | Task | Checklist | Type | Automation | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| TC-JRN-01 | Registration → email verification → login | Unique email; STG email capture | 1. Register as student<br>2. Open verification link<br>3. Log in | Account created; verification succeeds; login lands on `/student/dashboard`; duplicate registration shows a safe error | FE-014 | QA-02, QA-05 | E2E | P | Yes |
| TC-JRN-02 | Forgot / reset password | `student.active`; mailbox access | 1. Request reset<br>2. Open link<br>3. Set new password<br>4. Log in with old, then new password | Reset confirmation shown; old password rejected; new password accepted; token is single-use and expires | FE-014 | QA-02, QA-05 | E2E | P | Yes |
| TC-JRN-03 | Browse and enroll in a mentorship | `student.active`; seeded published mentorship | 1. Open `/mentorships`<br>2. Filter/search<br>3. Open detail and enroll | Listing and detail match seeded data; enrollment succeeds once; duplicate enroll is blocked; balance/payment state updates correctly | FE-014 | QA-02, QA-03 | E2E | P | Yes |
| TC-JRN-04 | Mentor creates and publishes a mentorship | `mentor.active` | 1. Open `/mentor/mentorships/create`<br>2. Complete required fields<br>3. Save and publish | Validation blocks incomplete save; draft persists; published mentorship appears in student listing after refresh; edit round-trip preserves data | FE-014 | QA-03, QA-05 | E2E | P | Yes |
| TC-JRN-05 | Admin user and payment views | `admin.active`; seeded rows | 1. Open `/admin/users`<br>2. Search and paginate<br>3. Open `/admin/payment` and filter | Rows match seed counts; pagination controls work; filters reset page to 1; totals reconcile with API response; empty filter shows empty state | FE-014, FE-017 | QA-03, PERF-06 | E2E | P | Yes |

### E. API failure, offline & timeout

| ID | Scenario | Preconditions | Steps | Expected result | Task | Checklist | Type | Automation | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| TC-API-01 | 5xx on a primary page | STG API forced to return 500 for one endpoint | 1. Open the affected page<br>2. Observe UI<br>3. Click retry | Page shows an error state with retry, not a blank screen; retry issues one new request; no infinite retry loop; error is reported to monitoring | FE-015, FE-021 | QA-04, MON-01 | E2E | P | Yes |
| TC-API-02 | Request timeout | API delayed > 15 s | 1. Open a data-heavy page<br>2. Wait for timeout<br>3. Click retry after restoring API | Timeout error is distinguishable from server error; UI remains interactive; retry succeeds after recovery; no duplicate mutation | FE-015 | QA-04, QA-07 | E2E | P | Yes |
| TC-API-03 | Offline and reconnect | Page loaded; DevTools offline | 1. Go offline<br>2. Navigate between cached routes<br>3. Restore network | Offline banner/state appears; no unhandled promise rejection; on reconnect, stale data refetches or shows a clear manual refresh path | FE-015 | QA-04, QA-07 | E2E | P | Yes |
| TC-API-04 | Empty collection state | `student.empty` | 1. Open learning, notifications, messages | Each empty list shows a specific empty state with next action; no spinner forever; no "undefined" text | FE-015, FE-014 | QA-04, UX-05 | Integration | R | No |
| TC-API-05 | Mutation failure does not corrupt UI | Seeded student; API rejects enrollment | 1. Submit enrollment that returns 409/500<br>2. Observe list and toast | Optimistic UI rolls back or never applies; error toast is safe; button re-enables; no duplicate row | FE-015, FE-014 | QA-04, QA-07 | E2E | P | Yes |

### F. Forms & validation

| ID | Scenario | Preconditions | Steps | Expected result | Task | Checklist | Type | Automation | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| TC-FORM-01 | Required-field and format validation | Logged-in mentor | 1. Submit create-mentorship with empty required fields<br>2. Enter invalid URL/price/date<br>3. Correct one field at a time | Each invalid field has an associated message; submission blocked; messages clear when corrected; focus order is logical | FE-022, FE-014 | QA-05, UX-06 | Integration | R | Yes |
| TC-FORM-02 | File upload constraints | Create/edit mentorship | 1. Upload unsupported type<br>2. Upload oversized file<br>3. Upload valid file | Unsupported/oversized files rejected client-side with size/type guidance; valid file previews; upload progress and failure states visible | FE-014 | QA-05, UX-05 | E2E | P | No |
| TC-FORM-03 | Double submit and navigation guard | Any create/edit form | 1. Double-click Save<br>2. Navigate away with unsaved changes | Exactly one mutation is sent; button disabled while pending; unsaved-changes prompt appears or documented behavior is consistent | FE-014, FE-015 | QA-05, QA-07 | E2E | P | No |

### G. Accessibility

| ID | Scenario | Preconditions | Steps | Expected result | Task | Checklist | Type | Automation | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| TC-A11Y-01 | Keyboard-only primary journey | None | 1. Tab from page top through nav, form, and primary action<br>2. Activate with Enter/Space<br>3. Escape from any overlay | All interactive elements reachable in logical order; visible focus ring at every stop; no keyboard trap; overlays close with Escape | FE-022 | UX-06 | Manual + E2E | M + P | Yes |
| TC-A11Y-02 | Modal/dialog semantics | Any page with a modal | 1. Open modal via keyboard<br>2. Inspect role/name<br>3. Tab through<br>4. Close | `role="dialog"` + `aria-modal="true"` + accessible name; focus moves inside and is trapped; focus returns to trigger on close | FE-022 | UX-06 | Integration | R | Yes |
| TC-A11Y-03 | Form labels and errors | Login, register, create mentorship | 1. Inspect every input<br>2. Trigger validation<br>3. Use screen reader | Every input has a programmatic label; errors use `aria-describedby`/`aria-invalid`; required state announced; no placeholder-only labels | FE-022 | UX-06 | Integration | R | Yes |
| TC-A11Y-04 | Images and icons have alternatives | Home, dashboards, cards | 1. Run axe<br>2. Inspect decorative vs informative images<br>3. Check icon-only buttons | Informative images have meaningful `alt`; decorative images `alt=""`; icon-only buttons have accessible names; axe critical/serious = 0 | FE-022 | UX-06 | Integration | R | Yes |
| TC-A11Y-05 | Contrast and reduced motion | Home, dashboards | 1. Check text/background pairs against WCAG AA<br>2. Enable `prefers-reduced-motion`<br>3. Reload | Body text ≥ 4.5:1, large text ≥ 3:1; animations respect reduced-motion; focus indicator remains visible | FE-022 | UX-06 | Manual | M | No |

### H. Responsive & browser compatibility

| ID | Scenario | Preconditions | Steps | Expected result | Task | Checklist | Type | Automation | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| TC-RSP-01 | Mobile 360×640 | STG build | 1. Open home, login, student dashboard, mentorship detail<br>2. Scroll horizontally<br>3. Use nav and primary CTA | No horizontal scroll; no clipped text/buttons; tap targets ≥ 44×44 px; nav usable; sticky elements do not cover content | FE-023 | UX-01, UX-03 | Manual | M | Yes |
| TC-RSP-02 | Tablet and desktop layouts | STG build | 1. Check 768×1024 and 1440×900<br>2. Resize across breakpoints | Layout reflows without overlap; tables scroll or stack intentionally; sidebars collapse correctly; no content jump on resize | FE-023 | UX-01, UX-02 | Manual | M | No |
| TC-RSP-03 | Cross-browser smoke | STG build | 1. Run login + dashboard + one form in Chrome, Edge, Firefox, Safari (or iOS Safari) | Same functional result in all four; no console errors specific to one engine; date/number formatting consistent | FE-023 | UX-02, UX-03 | Manual | M | Yes |

### I. Performance

| ID | Scenario | Preconditions | Steps | Expected result | Task | Checklist | Type | Automation | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| TC-PRF-01 | Lighthouse mobile baseline | Production build on STG | 1. Run Lighthouse mobile (throttled) on `/`, `/mentorships`, `/login`, `/student/dashboard`, `/mentor/dashboard`<br>2. Archive JSON/HTML | Scores and Core Web Vitals recorded per page; agreed budgets met (e.g. LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms); regressions tracked | FE-016 | PERF-01, PERF-07 | Non-functional | C + M | Yes |
| TC-PRF-02 | Bundle budget and chunk graph | Production build | 1. Generate bundle analyzer report<br>2. Compare entry/vendor chunks to budget<br>3. Check unused vendor chunks | Entry JS within agreed budget (proposal: ≤ 250 KB gzip); no chunk for unimported libraries; every chunk maps to a real import | FE-016 | PERF-01, PERF-02, PERF-05 | Static | C | Yes |
| TC-PRF-03 | Route-level code splitting | Production build | 1. Load `/` with cache disabled<br>2. Navigate to `/admin/users`<br>3. Inspect network | Admin/chatbot code is not downloaded on the public page; route chunk loads on navigation; no waterfall of duplicate vendor chunks | FE-016 | PERF-02, PERF-05 | E2E | P | No |
| TC-PRF-04 | Large list responsiveness | `list.1000` seeded | 1. Open the 1,000-row admin/mentor table<br>2. Sort, filter, paginate<br>3. Measure interaction latency | No freeze; interaction response < 100 ms on a mid-range device; pagination limits rendered rows; memory stable after 20 interactions | FE-017 | PERF-03, PERF-06 | Non-functional | M + P | No |

### J. Content & client security

| ID | Scenario | Preconditions | Steps | Expected result | Task | Checklist | Type | Automation | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| TC-SEC-01 | Chatbot markdown/XSS | Chatbot enabled route | 1. Send `<img src=x onerror=alert(1)>`<br>2. Send a markdown link with `javascript:`<br>3. Inspect DOM | No script execution; dangerous HTML is sanitized or rendered as text; links are protocol-restricted; no `dangerouslySetInnerHTML` sink with raw model output | FE-010 | SEC-06, REL-02 | E2E | P | Yes |
| TC-SEC-02 | File viewer external content | Any file-preview flow | 1. Open a document preview<br>2. Inspect network and iframe/script sources<br>3. Attempt a malicious file name/URL | No unpinned third-party script execution; content is sandboxed; file names escaped; CSP does not allow arbitrary `unsafe-eval` | FE-010, FE-019 | SEC-06, DEP-06 | Manual + E2E | M + P | Yes |
| TC-SEC-03 | Auth header consistency | STG API with contract logging | 1. Call a protected endpoint through the shared client<br>2. Call one previously raw-fetch endpoint<br>3. Compare headers | Every protected request sends the same scheme agreed with backend (`Bearer <token>` or documented alternative); no request omits auth; no token in query string | FE-007 | SEC-03, DEP-03, QA-07 | Integration | P | Yes |
| TC-SEC-04 | Production bundle contains no secrets or dev hosts | `dist/` artifact | 1. Grep bundle for `localhost`, `127.0.0.1`, ngrok, key patterns<br>2. Inspect source maps policy | No private hosts, tokens, or keys in shipped assets; source maps absent or access-controlled; `VITE_*` values are public-safe | FE-006, FE-011 | SEC-01, SEC-02, DEP-02, DEP-03 | Static | C | Yes |

### K. Deployment & release

| ID | Scenario | Preconditions | Steps | Expected result | Task | Checklist | Type | Automation | Blocking |
|---|---|---|---|---|---|---|---|---|---|
| TC-DEP-01 | SPA deep-link refresh matrix | STG host | 1. Direct-load and hard-refresh 10 routes (public, student, mentor, admin, nested detail, unknown)<br>2. Record status + final URL | Every valid route returns 200 and renders the correct shell; auth redirects work; unknown path renders app 404; no host-level 404 | FE-019 | DEP-05, DEP-06, UX-04, REL-05 | E2E | P | Yes |
| TC-DEP-02 | Cache headers | STG host | 1. `curl -I` on `/`, `/index.html`, one hashed JS, one image<br>2. Redeploy and re-check | `index.html` is `no-cache`/`no-store`; hashed assets `public, max-age=31536000, immutable`; images cached appropriately; new deploy serves new HTML | FE-019 | DEP-06 | Non-functional | C | Yes |
| TC-DEP-03 | Security headers and HTTPS | STG + PRD hosts | 1. Check HSTS, `X-Content-Type-Options`, `Referrer-Policy`, frame protection, CSP draft<br>2. Check certificate chain and mixed content | HTTPS only with valid cert; HSTS present; `nosniff` present; no mixed-content warnings; CSP does not break app (report-only first if needed) | FE-019 | DEP-05, DEP-07, REL-05 | Non-functional | C | Yes |
| TC-DEP-04 | Production smoke pack | PRD after deploy | 1. Open `/`, `/login`, `/mentorships`<br>2. Log in with a release-test account<br>3. Open one dashboard, one detail page, one mutation<br>4. Check API 2xx and console | All pages load; auth works; one read and one safe write succeed; no CORS/5xx errors; no console errors; error tracker receives a synthetic test event | FE-020, FE-021 | DEP-08, MON-01, MON-04, MON-05 | E2E | P + M | Yes |
| TC-DEP-05 | Rollback rehearsal | STG with previous artifact retained | 1. Note current version<br>2. Deploy candidate<br>3. Execute rollback runbook<br>4. Re-run smoke pack | Previous version restored within agreed RTO (proposal: ≤ 15 min); smoke pack passes; rollback steps and timings recorded | FE-026 | MON-03, REL-06 | Manual | M | Yes |

---

## 4. Execution plan

### 4.1 Order

1. **Static suite (A)** on the first green CI run — establishes whether anything else is testable.
2. **Unit/integration (B3, B7, D4, F1, G2–G4)** as soon as FE-012 lands; these are fast and catch regressions.
3. **E2E auth/roles (B1, B2, B4–B8, C1–C4)** against staging once FE-006/FE-007/FE-008/FE-009 are merged.
4. **Journeys and failure states (D, E, F2–F3)** once staging data is seeded.
5. **Accessibility, responsive, performance (G, H, I)** on the release candidate.
6. **Security and deployment (J, K)** on the exact artifact proposed for production.
7. **Production smoke (K4)** immediately after deploy, followed by the 24-hour watch.

### 4.2 Entry criteria per environment

| Environment | Entry criteria |
|---|---|
| `CI` | Clean install succeeds; test harness exists; CI workflow merged |
| `STG` | Staging URL reachable; env vars configured; seeded accounts exist; backend CORS allows staging origin; build artifact from the release commit deployed |
| `PRD` | Go/no-go signed; rollback owner on standby; production smoke account available; monitoring live |

### 4.3 Exit criteria for the release candidate

- All **Blocking = Yes** cases pass on `STG`, except those explicitly marked `Ext` and covered by a signed external attestation.
- Zero open P0 defects; P1 defects have an owner, workaround, and accepted-risk record.
- Every failure has a linked bug with reproduction steps, environment, expected vs actual, screenshot/video, and console/network capture.
- Evidence bundle attached to `FE-026`: CI run URL, test reports, Lighthouse JSON, header captures, deep-link matrix, smoke log, rollback timing.
- No test case is marked PASS from a local-only run when the risk is environment-specific.

### 4.4 Defect severity for this matrix

| Severity | Definition | Release effect |
|---|---|---|
| S1 | Auth bypass, data exposure, production-down, payment corruption | Stop release; fix and re-run full affected suite |
| S2 | Blocking journey broken, deep link fails, major a11y barrier | Stop release unless documented workaround approved by Product + Tech Lead |
| S3 | Non-blocking functional defect or degraded UX | May ship with owner and target date |
| S4 | Cosmetic or minor copy issue | Ship; batch into next release |

---

## 5. Evidence-only verification (no browser case)

These items cannot be proven by a frontend test case and must be evidenced by scripts or external owners. They remain **NOT VERIFIED** until the evidence is attached.

| Item | Checklist | Evidence required | Owner | Where recorded |
|---|---|---|---|---|
| Dependency inventory matches imports | CQ-06 | `npm ls --all` + import scan report; unused packages removed or justified | Frontend | FE-005 |
| Git history secret scan | SEC-01 | gitleaks/trufflehog report over full history; rotation record for any hit | Frontend + Security | FE-011 |
| Environment contract completeness | SEC-02, DEP-01 | `.env.example`, validation tests, CI failure on missing var | Frontend | FE-006 |
| Backend authorization/RBAC | SEC-03 | Per-role endpoint matrix; negative tests returning 401/403; IDOR checks | Backend | External request under FE-009 |
| Backend CORS allowlist | DEP-04 | Preflight `OPTIONS` capture for staging and production origins | Backend/DevOps | External request under FE-019 |
| DNS and domain ownership | DEP-07 | DNS record table, www/apex redirect matrix | DevOps | FE-019 |
| TLS certificate issuance/renewal | DEP-05 | Certificate chain capture, renewal owner and date | DevOps | FE-019 |
| Error-rate and performance dashboards | MON-02, MON-06 | Dashboard links, alert thresholds, on-call owner | DevOps/SRE + Frontend | FE-021, FE-026 |
| Payment/email/AI provider availability | — | Provider status page + fallback behavior confirmation | Backend/Platform | External dependency register |

---

## 6. Known coverage gaps and assumptions

1. **No test has been executed.** `node_modules` is absent and installing dependencies was outside this planning phase. Every case is a definition, not a result.
2. **No staging environment exists.** Environment-specific cases (CORS, headers, deep links, HTTPS) cannot pass until FE-019/FE-020 are complete.
3. **Backend contract is unconfirmed.** TC-SEC-03 and TC-ROLE-05 depend on the backend's actual authorization and header scheme; the frontend cannot close them alone.
4. **No performance baseline.** Budgets in TC-PRF-01/02 are proposals and must be ratified by the Tech Lead and Product Owner before they become gates.
5. **No screen-reader lab.** TC-A11Y cases require at least NVDA or VoiceOver; automated axe checks alone are insufficient.
6. **Browser matrix is a proposal.** Safari coverage depends on available hardware/cloud device service; this must be confirmed before the release gate.
7. **Load, penetration, and chaos testing are out of scope** for this frontend plan; they are separate security/performance workstreams.
