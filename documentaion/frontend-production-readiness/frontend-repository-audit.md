# EduNest Frontend — Repository Audit

| Field | Value |
|---|---|
| Audit date | 2026-10-30 |
| Repository root | `C:\Users\shahd\OneDrive\Desktop\EDUNEST\EduNest` |
| Frontend root | Repository root — one application, no monorepo/workspaces |
| Branch / commit | `master` / `7f887ee` |
| Application name | `mentors-app` (package), branded **EduNest** |
| Package manager | npm — `package-lock.json` (lockfileVersion 3) |
| Node used for audit | v24.12.0, npm 11.6.2 |
| Dependencies installed? | **No** — `node_modules` absent; install prohibited in this phase |
| Files inspected | 511 `src/**/*.ts(x)`, 179 component TSX, 139 page TSX, all root configs, docs, Git metadata |

Confidence key: **Verified** = direct file evidence; **Inferred** = strong static signal, not executed; **Unknown** = no evidence.

---

## 1. Application Identification

The repository contains exactly one `package.json` and one Vite entry point (`index.html` → `/src/main.tsx`). There is no `apps/`, `packages/`, `pnpm-workspace.yaml`, `turbo.json`, or Nx configuration. The frontend is therefore the repository root; no scope clarification was required.

The package metadata is stale/template-derived:

- `"name": "mentors-app"`, `"version": "0.0.0"`, `"description": "This template provides a minimal setup..."`, `"main": "eslint.config.js"`.
- `homepage`/`repository` point to `github.com/elsayed-elsadek/mentorHup`.
- No `engines`, no `packageManager`, no `volta`, no `.nvmrc`.

---

## 2. Technology Stack (verified)

| Layer | Technology | Version (manifest) | Notes |
|---|---|---|---|
| UI runtime | React / React DOM | ^19.1.1 | `StrictMode` enabled |
| Language | TypeScript | ^5.9.3 | `strict`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` |
| Build | Vite | ^8.0.0 | `@vitejs/plugin-react` ^5 |
| Routing | react-router-dom | ^7.9.4 | `BrowserRouter`, nested routes |
| Server state | @tanstack/react-query | ^5.90.5 | Used in 25 files |
| Client state | zustand | ^5.0.8 | `persist` middleware |
| HTTP | axios | ^1.13.1 | One shared instance |
| Realtime | @stomp/stompjs + sockjs-client | ^7.3.0 / ^1.6.1 | Notifications and chat |
| Styling | TailwindCSS + PostCSS + Autoprefixer | ^3.3.3 | `darkMode: 'class'` |
| Icons | lucide-react, Fort Awesome | ^0.563.0 / ^7.1.0 | Both used |
| Charts | recharts | ^3.8.1 | 4 files |
| Toasts | react-hot-toast | ^2.6.0 | 58 references |
| Alerts/modals | sweetalert2 (+react-content) | ^11.26.17 | **Unused** |
| Video | @jitsi/react-sdk | ^1.4.4 | **Unused** — `window.open` is used instead |
| Docs/export | mammoth, html2pdf.js | ^1.12.0 / ^0.14.0 | DOCX preview, certificate PDF |
| Validation | zod | ^4.4.3 | **Unused** — manual regex validation |
| Lint | ESLint 9 + typescript-eslint + react-hooks + react-refresh | ^9.36.0 / ^8.45.0 | No `jsx-a11y`, no import rules, no Prettier |

### Actual npm scripts

```json
{
  "dev": "vite",
  "start": "npm run dev",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

**There is no `test`, `typecheck`, `format`, `audit`, or `ci` script.** The checklist's `npm test` command will fail with "Missing script: test".

### TypeScript configuration

- Root `tsconfig.json` is a solution file: `"files": []` with references to `tsconfig.app.json` and `tsconfig.node.json`.
- Consequence: `npx tsc --noEmit` at the root does **not** type-check `src` (the solution file has no files and `--noEmit` is not a build-mode flag). The correct frontend check is `npx tsc -b` or `npx tsc -p tsconfig.app.json --noEmit`.
- `tsconfig.app.json` includes only `src`, `types: ["vite/client"]`, `noEmit: true`.
- No custom `ImportMetaEnv` declarations exist for `VITE_API_BASE_URL` / `VITE_BASE_URL`.

---

## 3. Directory Structure (verified)

```
EduNest/
├── index.html                 # single entry, Google Fonts, preload /img1.webp, ngrok dns-prefetch
├── package.json / package-lock.json
├── vite.config.ts             # manualChunks, image optimizer, dev proxy, esnext target
├── eslint.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── tailwind.config.cjs / postcss.config.cjs
├── public/                    # img1.webp, robots.txt, vite.svg (default favicon)
├── documentaion/              # existing team docs (README, DOCUMENTATION.md, feature docs)
├── TODO.md                    # 2 open refactor items
└── src/
    ├── App.tsx                # route table + lazy imports + chatbot visibility
    ├── main.tsx               # BrowserRouter + Theme/WebSocket/Notifications providers
    ├── components/
    │   ├── admin-components/  # dashboard, payments, issues, settings, shared layout
    │   ├── common/            # Button, Input, EmptyState, ErrorState, FileViewer,
    │   │                      # OptimizedImage, Pagination, ChatbotWidget, toaster
    │   ├── home/              # marketing sections
    │   ├── layout/            # BasicLayout, Dash-layout
    │   ├── mentor-components/ # mentor dashboard/chat/profile/settings/tables
    │   ├── register-com/ forgetPass-com/ resetPass-com/ verify-com/ success-com/
    │   └── student-components/# dashboard, learning, messages, notifications,
    │                          # profile, settings, mentorships
    ├── context/               # ThemeContext, Websocketprovider, NotificationsContext
    ├── hooks/                 # auth forms, data hooks, role-specific hooks, chatbot
    ├── lib/queryClient.ts     # QueryClient defaults + query key factory
    ├── loadingApp/            # GlobalLoadingOverlay (100ms show / 1s hide)
    ├── pages/                 # 139 route-level views grouped by role
    ├── routes/                # ProtectedRoute guard
    ├── services/              # Axios client + 40+ domain service modules
    ├── store/                 # authStore (Zustand persist)
    ├── theme/colors.ts
    ├── types/                 # shared and role-specific types
    └── utils/                 # jwt, imageUrl, fileUrl, formatTimeago, export, constants
```

**Dead/orphan files (verified zero bytes, 14 total):**

`src/components/layout/Navbar.tsx`, `src/hooks/useAuth.ts`, `src/hooks/useTheme.ts`, `src/pages/admin-pages/mentor-pages/mentorSettings/Settings.tsx`, `src/pages/mentor-pages/ProjectDetail.tsx`, `src/pages/mentor-pages/mentorship-quizzes/hooks/useQuizFilters.ts`, `src/services/index.ts`, `src/services/userService.ts`, `src/store/index.ts`, `src/store/useUIStore.ts`, `src/types/index.ts`, `src/types/user.ts`, `src/utils/index.ts`, `src/utils/storage.ts`.

None of these empty modules is imported anywhere (verified by name/path grep), so they are dead code rather than build breakers.

---

## 4. Routing Architecture

`src/main.tsx` mounts `<BrowserRouter>`; `src/App.tsx` defines all routes. Most pages are `React.lazy` with a shared `PageLoader` fallback.

### Route map (verified from `App.tsx`)

| Area | Routes | Guard |
|---|---|---|
| Public | `/`, `/become-mentor`, `/start-Started`, `/mentorships`, `/mentorships/:id` (+ `content`, `reviews`, `leaderboard`), `/mentor-profile/:mentorEmail`, `/know-about` | none |
| Auth | `/login`, `/register`, `/verify`, `/success`, `/forgot-password`, `/check-email`, `/reset-password`, `/reset-success`, `/restore-account`, `/confirm-restore` | none |
| Mentor | `/mentor/dashboard`, `/mentor/mentorships`, `/mentor/mentorships/create`, `/mentor/mentorships/:id`, `.../content`, `.../sessions`, `.../quizzes`, `.../quizzes/:quizId`, `.../quizzes/:quizId/questions`, `.../tasks`, `.../tasks/:taskId`, `.../projects`, `.../projects/:projectId`, `.../edit`, `/mentor/students`, `/mentor/students/:id`, `/mentor/messages`, `/mentor/notifications`, `/mentor/profile`, `/mentor/settings` | `ProtectedRoute allowedRoles={['ROLE_MENTOR']}` |
| Student | `/student/dashboard`, `/explore-mentorships`, `/student/learning`, `/student/learning/:mentorshipId`, `/student/learning/:mentorshipId/overview`, `/mentorships/:mentorshipId/enroll`, `/student/messages`, `/student/profile`, `/student/settings`, `/student/notifications` | `ProtectedRoute allowedRoles={['ROLE_STUDENT']}` |
| Admin | `/admin` → `dashboard`, `payment`, `issues`, `configurations`, `users` | `ProtectedRoute allowedRoles={['ROLE_ADMIN']}` |
| Fallback | `*` → `NotFound` | none |

### Verified routing defects

1. `App.tsx:186` declares a pathless `<Route element={<ProtectedRoute allowedRoles={['ROLE_MENTOR']} />} />` with no children. It is redundant/dead configuration.
2. `App.tsx:235` declares `/admin/dashboard` again inside the admin guard as `<div>Admin Dashboard - Coming Soon</div>`, duplicating the real nested route at `App.tsx:228`. Route ranking makes the real page win, but the placeholder is dead code and a confusing release artifact.
3. `/explore-mentorships` is registered **twice** in intent: once as a public lazy route at `App.tsx:164` (`/mentorships`) and once inside the student guard at `App.tsx:214`. The student guard entry means an unauthenticated visitor who follows a `/explore-mentorships` link is redirected to login, even though the route is conceptually public.
4. `/mentorships/:mentorshipId/enroll` sits inside the **student-only** guard. A mentor or admin opening an enrollment link is redirected to their dashboard rather than seeing an explanatory page.
5. The `*` fallback is declared before auth routes; React Router ranks matches rather than using declaration order, so this is safe today but fragile as a pattern.
6. No route-level error boundary. Any render exception bubbles to the React root and produces a blank page.

### SPA refresh risk

The app uses `BrowserRouter` (HTML5 history). No host rewrite rule exists in the repository (no `netlify.toml`, `vercel.json`, nginx config, `web.config`, or `404.html`). On a static host without a catch-all rewrite, opening `/mentor/dashboard` directly or refreshing returns the host's 404. This is a release blocker for deep links and email links.

---

## 5. State Management & Data Layer

### Providers (verified in `main.tsx` + `App.tsx`)

```
BrowserRouter
└── ThemeProvider            (light/dark, localStorage key "theme")
    └── WebSocketProvider    (connects only when hydrated && token)
        └── NotificationsProvider
            ├── GlobalLoadingOverlay (fixed 1s splash)
            ├── App → QueryClientProvider → Routes
            └── CustomToaster
```

### Server state

- TanStack Query used in 25 files. Defaults: `staleTime` 5 min, `gcTime` 10 min, `retry: 2`, exponential `retryDelay`, `refetchOnWindowFocus: false`, `refetchOnReconnect: false`, `placeholderData: previousData`.
- `mutations.retry: 1` is enabled globally. For non-idempotent POSTs (enrollment, submission, grading, payment) a retry can duplicate side effects. This is a verified configuration risk.
- 27 modules import the shared Axios instance, but several features use raw `fetch` instead (see §7).

### Client state

- `src/store/authStore.ts` is the only Zustand store in use (persisted).
- `src/store/useUIStore.ts`, `src/store/index.ts`, `src/store/useAuthStore.ts` are empty.
- `NotificationsContext` and `ThemeContext` are React context.

### API client (`src/services/api.ts`)

- `export const API_BASE_URL = 'http://localhost:8080';` — **hard-coded**.
- Axios timeout 15,000 ms.
- Sends `ngrok-skip-browser-warning: true` on every request (development tunnel artifact).
- Request interceptor attaches `Authorization: <raw token>` (no `Bearer` prefix) to every non-public request.
- Public-path allowlist covers registration, OTP, contact, login, forgot password, restore.
- Response interceptor logs in dev only, but the **request** interceptor contains an unguarded `console.log` for mentorship overview requests that prints URL, params, and the first 20 characters of the auth header.
- No 401/403 handling, no refresh-token flow, no global error normalization, no request cancellation policy.

---

## 6. Authentication & Session Handling

### Login flow (`src/hooks/useLogin.ts`)

1. Client-side validation: email presence, password ≥ 6 chars (no email regex check on login).
2. `POST login-api` with `{ email, password }`.
3. Extracts `apiResponse.jwt`, decodes it client-side (`src/utils/jwt.ts`) to derive name/role/email.
4. Calls `setAuth({ token, userName, userEmail, userRole })`.
5. For students, fetches profile image and updates avatar.
6. Stores "remember me" email flag.
7. Navigates by role.
8. Deleted/unverified account responses are detected by substring matching on backend error text and redirect to restore/verify.

### Token storage (`src/store/authStore.ts`)

- Zustand `persist` writes the entire auth state under `localStorage["auth-storage"]`.
- The token is additionally written to `localStorage["token"]`.
- `getAuthToken()` reads store → `localStorage.token` → parsed `auth-storage`.
- Token is written **regardless of the "Remember me" checkbox**; only the email flag changes.
- No expiry check (`exp`) before considering the session authenticated.
- `logout()` calls `localStorage.clear()` and `sessionStorage.clear()`, wiping unrelated app state (e.g., theme), then performs a hard redirect.

### Route protection (`src/routes/ProtectedRoute.tsx`)

- Waits for `isHydrated` (set via `setTimeout(..., 0)` after rehydration).
- Redirects unauthenticated users to `/login` with `state.from`.
- Redirects authenticated users whose persisted `userRole` is not in `allowedRoles`.
- **The role is read from client-persisted storage and is not validated against the server on navigation.** A user can edit `auth-storage` and render admin/mentor UI. Actual data protection depends entirely on backend authorization (external dependency).

### Additional auth issues

- `App.tsx:134-146` redirects to a dashboard on every app load when `token && rememberMe && lastEmail`, including when the user intentionally opens a public page.
- `useAuthStore.getState().setAuth` is called directly from hooks rather than through actions/selectors, which makes testing and auditing harder.
- No idle timeout, no cross-tab logout synchronization, no token rotation.
- WebSocket connects with `Authorization: <raw token>` in STOMP headers (`src/services/Websocketservice.ts:36`), while one table sends `Bearer <token>` (`MentorshipStudentsTable.tsx:40`) — the header contract is inconsistent.

---

## 7. Forms & Validation

| Flow | Implementation | Validation | Gaps |
|---|---|---|---|
| Login | `useLogin.ts`, `pages/Login/Login.tsx` | required email, password ≥ 6 | no email format check; no `autoComplete`; label not linked via `htmlFor`/`id` |
| Register | `useRegisterForm.ts`, `pages/register/Register.tsx` | first/last name, email regex, optional phone 10–15 digits, password ≥ 6, confirm match, education level for students, terms checkbox | regex-only; no zod despite dependency; no server-error field mapping beyond generic |
| Verify OTP | `useVerifyForm.ts`, `useVerifyOTPForm.ts` | OTP presence/length (see hooks) | no automated tests; resend cooldown only client-side |
| Forgot password | `useForgetPassForm.ts` | email presence | email format not enforced consistently |
| Reset password | `useResetPassForm.ts` | password + confirm | no strength policy, only length |
| Restore account | `useRestoreForm.ts` | email/OTP | substring-based backend error mapping |
| Mentor forms | `useMentorshipForm.ts`, `EditMentorshipForm.tsx` | manual field checks | large components (28.5 KB edit form) with mixed validation logic |
| Settings/profile | role-specific hooks | manual | inconsistent error display |

**Accessibility of forms (verified counts):** 143 `<input>` elements vs 4 `htmlFor` attributes and only 8 `autoComplete` attributes. Most inputs rely on adjacent visual labels without programmatic association.

---

## 8. Styling, Assets, and Theming

- Tailwind utility-first with 849 responsive-class usages and 211 `dark:` usages.
- Global CSS defines design tokens (`--primary-500`, gradients), dark-mode overrides using `.dark`, and a `*:focus-visible` outline (`src/index.css:101`).
- **Theme bug (verified):** `ThemeContext.tsx:22` adds the class `light` when theme is `dark`, and removes `dark` otherwise. The `.dark` CSS block is therefore never activated by the provider. Toggling the theme does not produce the intended dark palette.
- `index.html` loads Inter from Google Fonts (preconnect + preload + print-media swap + noscript fallback).
- Preloads `/img1.webp` for LCP; `public/img1.webp` exists (29,958 bytes).
- 87 `<img>` tags / 89 `alt` attributes; many images are remote (`images.unsplash.com`, `i.pravatar.cc`, `ui-avatars.com`), which adds third-party dependency and privacy/caching risk.
- `OptimizedImage` exists with lazy/eager, `fetchPriority`, `srcset`, placeholder, and error fallback, but adoption is partial.
- Default `vite.svg` remains the favicon; no app icon set.
- `public/robots.txt` references `https://edunest.com/sitemap.xml`, but no `sitemap.xml` exists.

---

## 9. Build & Performance Configuration

`vite.config.ts`:

- `define.global = globalThis` (SockJS compatibility).
- `ViteImageOptimizer` for jpg/png/gif/tiff/webp/svg/avif, including public assets.
- Dev server binds `0.0.0.0:5173` and proxies `/api` → `http://localhost:8080`.
- Build: `minify: 'esbuild'`, `cssCodeSplit: true`, `sourcemap: false`, `chunkSizeWarningLimit: 500`, `target: 'esnext'`.
- `manualChunks`: react, charts, icons, fontawesome, headlessui, axios/zustand/tanstack, jitsi, sweetalert2, vendor fallback.
- Filenames hashed under `assets/js/` and `assets/[ext]/`.

Verified observations:

- The `vendor-jitsi` chunk is configured but `@jitsi/react-sdk` is never imported, so the chunk is dead configuration; the docs claim it is the largest lazy chunk.
- `vendor-alerts` targets `sweetalert2`, which is unused; toasts are `react-hot-toast` and fall into `vendor`.
- `target: 'esnext'` means no downleveling; browser support is undefined and older Safari/Enterprise browsers may fail on modern syntax.
- `sourcemap: false` plus no error tracking makes production stack traces unactionable.
- `chunkSizeWarningLimit: 500` is a warning threshold, not a performance budget; no CI enforcement.
- Five modules are imported eagerly in `App.tsx` (`AdminDashboard`, `AdminPayment`, `MentorshipOverviewPage`, `AdminUsers`, `ChatbotWidget`) while the rest are lazy. `ChatbotWidget` is rendered on many routes and ships globally.

No bundle measurement exists in the repo; actual chunk sizes are **Unknown** until a build runs.

---

## 10. Testing, CI, and Deployment

| Area | State | Evidence |
|---|---|---|
| Unit tests | **None** | No `*.test.*`/`*.spec.*`; no Vitest/Jest in manifest or lockfile |
| Component tests | **None** | No Testing Library / jest-dom |
| E2E tests | **None** | No Playwright/Cypress config or dependency |
| Coverage | **None** | No coverage tooling |
| CI | **None** | `.github/` absent; no GitLab/Azure/Jenkins config |
| Lint in CI | **None** | `lint` script exists, never automated |
| Deployment config | **None** | No Dockerfile, nginx, Netlify, Vercel, S3/CloudFront, or `base` path config |
| Staging environment | **None documented** | No `.env.staging`, no release runbook |
| Smoke tests | **None** | No scripts or checklists |
| Monitoring | **None** | No Sentry/Datadog/LogRocket/analytics imports |
| Error boundary | **None** | No `componentDidCatch`/`getDerivedStateFromError` |

---

## 11. Environment Variables

- **No `.env`, `.env.local`, `.env.development`, `.env.production`, or `.env.example` exists.** `.gitignore` ignores `.env` and `*.local` (good) but provides no template.
- Two different variable names are used in source:
  - `VITE_API_BASE_URL` — 17 references (dashboard, chat, payments, homepage, websocket, student profile).
  - `VITE_BASE_URL` — 5 references (mentor profile, mentorship details/overview/reviews).
- `src/services/api.ts` uses **neither**; it hard-codes `http://localhost:8080`.
- Every other consumer uses `?? 'http://localhost:8080'`, so a production build with no env file silently points at the developer machine.
- `src/hooks/chatbot/Usechatbot.ts:5` hard-codes `http://127.0.0.1:8000/chat` (separate AI service, no env override).
- No runtime env validation (missing variable → silent fallback instead of a startup error).
- No secrets were found in `VITE_*` because no env files exist; this is the correct direction but must be enforced.

---

## 12. Security Observations (frontend scope)

| Observation | Evidence | Risk |
|---|---|---|
| JWT in `localStorage` (two keys) | `authStore.ts:48,75,95` | Any XSS becomes full account takeover; no HttpOnly protection |
| Role trusted from persisted storage | `ProtectedRoute.tsx:16` | Client-side privilege display bypass; backend must enforce |
| Unescaped HTML injection | `ChatbotWidget.tsx:146,173` | XSS if model output is influenced by user/prompt content |
| DOCX → HTML injection + CDN script | `FileViewer.tsx:128,227` | Third-party script execution + HTML injection from uploaded files |
| Unguarded request logging | `api.ts:41-47` | Auth header prefix, URL, and params in production console |
| `window.open` without `noopener` | `FileViewer.tsx:38`, `GradeModal.tsx:85`, `AssimentDetailsPanel.tsx:152`, `ProjectDetail.tsx:159` | Reverse tabnabbing |
| Dev tunnel artifacts | `api.ts:14` (`ngrok-skip-browser-warning`), `index.html:30` (ngrok DNS prefetch) | Confusing production posture, unnecessary third-party hint |
| No CSP / security headers in repo | `index.html` | Clickjacking/XSS mitigation deferred to host; unverified |
| No dependency audit evidence | no `node_modules`, `npm audit` not run | Unknown vulnerability exposure |

No secret values are reproduced in this report.

---

## 13. Accessibility, Responsive, and Browser Support

- 556 `<button>` elements, 59 `aria-*` occurrences → many icon-only controls lack accessible names.
- 32 `*Modal*.tsx` components, **0** with `role="dialog"`, `aria-modal`, labelled title, or focus trap.
- 143 inputs, 4 `htmlFor`, 1 `tabIndex` → weak programmatic form semantics and keyboard flow.
- Global `:focus-visible` outline exists (positive).
- `html lang="en"` while the UI mixes English and Arabic copy (chatbot welcome, comments, toasts).
- Dates are formatted with hard-coded `'en-US'` locale in multiple mappers (`useMentorships.ts:48`, `Usehomepage.ts`), with no timezone handling.
- Responsive: Tailwind breakpoints used heavily; only one raw `@media` in global CSS. No device/browser matrix or evidence.
- Browser support: not defined; `target: 'esnext'` and no `browserslist` file.
- `robots.txt` disallows `/admin/` but not `/mentor/` or `/student/`, contradicting `documentaion/DOCUMENTATION.md:824`.

---

## 14. Documentation & Team Conventions

- `README.md` and `documentaion/DOCUMENTATION.md` are detailed but partly aspirational:
  - Claim `ProtectedRoute` lives in `components/common/` (actual: `src/routes/`).
  - Claim `vendor-jitsi` is a large lazy chunk (SDK unused).
  - Claim dev proxy sets `secure: false` (not present).
  - Claim robots disallows mentor/student routes (not present).
  - Claim WCAG 2.1 AA alignment via aria-labels (counts contradict).
- `TODO.md` contains 2 open items (refactor `ProjectDetail.tsx`, run build/lint).
- No `CONTRIBUTING.md`, `CODEOWNERS`, PR template, issue template, changelog, or release notes.
- Git history uses free-form commit messages; only `master` exists locally and on `origin`. No documented branch naming, review, or merge policy.
- No Jira/GitHub integration evidence in the repo. Issue IDs in this plan are **proposed placeholders only**.

---

## 15. Findings Register

| ID | Severity | Finding | Evidence | Confidence |
|---|---|---|---|---|
| F-01 | **P0** | Production API base URL hard-coded to `http://localhost:8080` | `src/services/api.ts:4` | Verified |
| F-02 | **P0** | No env contract; two variable names; client ignores env | No `.env*`; `VITE_API_BASE_URL` ×17, `VITE_BASE_URL` ×5; `api.ts:4` | Verified |
| F-03 | **P0** | Raw `fetch` calls use `localhost` and/or omit auth | `StatusToggleModal.tsx:32`, `ProjectSubmissionsTable.tsx:32`, `Usechatbot.ts:5`, `MentorshipStudentsTable.tsx:40` | Verified |
| F-04 | **P0** | Inconsistent Authorization header contract (raw token vs `Bearer`) | `api.ts:59`, `Websocketservice.ts:36`, `MentorshipStudentsTable.tsx:40` | Verified |
| F-05 | **P0** | Zero automated tests; no test runner or script | `package.json`, lockfile scan | Verified |
| F-06 | **P0** | No CI or deployment configuration; no SPA rewrite | Absent `.github/`, hosting configs | Verified |
| F-07 | **P0** | Type-check/lint/build never evidenced; `node_modules` absent | `Test-Path node_modules` = False | Verified |
| F-08 | **P1** | JWT/role in `localStorage`; no expiry/refresh/401 handling; remember-me writes token always | `authStore.ts:33-123` | Verified |
| F-09 | **P1** | Client-only role guard; stray and duplicate route declarations | `ProtectedRoute.tsx`, `App.tsx:186,235` | Verified |
| F-10 | **P1** | XSS via unescaped chatbot output in `dangerouslySetInnerHTML` | `ChatbotWidget.tsx:146,173` | Verified |
| F-11 | **P1** | Runtime CDN script load + HTML injection in file viewer | `FileViewer.tsx:128,227` | Verified |
| F-12 | **P1** | 127 console statements; unguarded auth-header logging | Grep count; `api.ts:41-47` | Verified |
| F-13 | **P1** | 14 zero-byte modules and duplicate/orphan pages | File scan | Verified |
| F-14 | **P1** | 9 unused dependencies inflate install and attack surface | Import scan vs manifest | Verified |
| F-15 | **P1** | No React error boundary → blank screen on render error | No boundary in `src` | Verified |
| F-16 | **P1** | No error tracking/monitoring; sourcemaps disabled | No Sentry/analytics; `vite.config.ts:40` | Verified |
| F-17 | **P1** | Modal/form accessibility gaps | 0/32 dialogs, 4/143 `htmlFor`, 59/556 aria | Verified |
| F-18 | **P1** | Global mutation retry can duplicate non-idempotent actions | `lib/queryClient.ts:33-36` | Verified |
| F-19 | **P2** | Eager imports + heavy global chatbot weaken code splitting | `App.tsx:10-14,239` | Verified (size Unknown) |
| F-20 | **P2** | Partial image optimization; remote images; no srcset adoption | 87 `<img>`, `OptimizedImage` partial | Verified |
| F-21 | **P2** | Mock/demo content on production pages | `StudentDashboard.tsx:17-33`, `utils/constants.ts:100+` | Verified |
| F-22 | **P2** | `window.open` without `noopener` in 4 places | Grep | Verified |
| F-23 | **P2** | Docs contradict code (Jitsi, robots, proxy, aria) | `documentaion/DOCUMENTATION.md` | Verified |
| F-24 | **P2** | Browser support undefined; `target: 'esnext'` | `vite.config.ts:42` | Verified |
| F-25 | **P2** | Hard-coded `en-US` dates and mixed-language UI with `lang="en"` | `useMentorships.ts:48`, `Usehomepage.ts`, `index.html:2` | Verified |
| F-26 | **P3** | Missing sitemap, default Vite favicon, stale package metadata | `public/robots.txt:12`, `index.html:6`, `package.json:2-17` | Verified |
| F-27 | **P2** | Chatbot points at `127.0.0.1:8000`, no env override | `Usechatbot.ts:5` | Verified |
| F-28 | **P1** | No secret scanning/guardrails; dev tunnel references remain | `api.ts:14`, `index.html:30` | Verified |

---

## 16. Unknowns and Evidence Still Required

| Unknown | Why it matters | Needed from |
|---|---|---|
| Actual TypeScript/ESLint error count | Determines `FE-002` size and whether build is currently broken | Frontend (run `FE-001`) |
| Actual bundle sizes and LCP/INP/CLS | Cannot set a performance budget without measurement | Frontend + QA |
| Backend authorization enforcement | Frontend guards are not security boundaries | Backend team |
| Backend CORS allowlist for the production origin | Deployment can fail at first API call | Backend/DevOps |
| Token format expected by backend (`Bearer` vs raw) | Wrong header = 401 across the app | Backend team |
| Hosting target and rewrite capability | Determines SPA deep-link behavior and cache strategy | DevOps |
| Domain/DNS/TLS ownership | Blocks HTTPS verification | DevOps |
| Supported browser matrix | Determines whether `esnext` is acceptable | Product Owner |
| AI chatbot service production URL and auth model | Chatbot is unusable/unsafe in production today | Backend/ML owner |
| Real team capacity and release date | Milestones are relative, not dated | Engineering Manager |
| Jira project/issue-type scheme | Import mapping is proposed, not confirmed | Project Manager |

---

## 17. Audit Evidence Log

Commands and inspections used (read-only):

```text
Get-ChildItem / glob package.json              → single app at root
Read package.json, tsconfig*, vite.config.ts,
     eslint.config.js, postcss/tailwind config,
     index.html, .gitignore, README.md, TODO.md
Get-ChildItem -Recurse src                     → 511 TS/TSX files
Grep console.*                                 → 127 matches
Grep TODO|FIXME|HACK                           → 8 matches
Grep localhost|http://|https://                → hard-coded hosts
Grep import.meta.env|process.env               → env usage
Grep dangerouslySetInnerHTML|innerHTML|eval    → 3 sinks
Grep localStorage|sessionStorage               → 36 matches
Grep <img / alt= / <button / aria- / htmlFor   → a11y ratios
Get-ChildItem Length -eq 0                     → 14 empty modules
Grep test/spec/describe/expect                 → 0 tests
Test-Path node_modules / .github / dist        → all False
git status / git log / git branch              → clean tree, master only
```

No files were modified, no packages installed, no branches created, no Jira or deployment systems touched.
