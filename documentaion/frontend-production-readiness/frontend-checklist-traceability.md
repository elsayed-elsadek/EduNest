# EduNest Frontend — Checklist Traceability

Audit date: 2026-10-30 · Checklist: "React + TypeScript — Pre-Deployment Checklist" · Scope: frontend only.

**Status legend:** PASS (verified compliant) · PARTIAL (some implementation, gap remains) · FAIL (requirement not met or contradicted by verified evidence) · NOT VERIFIED (cannot be proven in this audit) · N/A (not applicable).

**Blocking legend:** **YES** = frontend release blocker (P0) · **NO** = required but not a hard blocker · **EXT** = external owner; frontend cannot close alone.

Every item maps to at least one task in `frontend-epics-and-tasks.md`. No item is marked PASS on the basis of a library or config file alone.

---

## 1. Code Quality & Build

| ID | Original checklist item | Relevant files / components | Status | Evidence & identified gap | User impact / technical risk | Recommended action → Task | Verification method | Blocker |
|---|---|---|---|---|---|---|---|---|
| CQ-01 | إجراء فحص TypeScript والتأكد من خلوه من الأخطاء | `tsconfig.json`, `tsconfig.app.json`, all `src/**/*.ts(x)` | NOT VERIFIED | `strict`, `noUnusedLocals`, `noUnusedParameters` enabled. `node_modules` absent; `tsc` never executed. Root `tsconfig.json` has `"files": []`, so `npx tsc --noEmit` checks nothing; correct command is `tsc -b` or `tsc -p tsconfig.app.json --noEmit`. | Unknown compile errors can block deployment or ship broken screens. | Run `tsc -b`, capture errors, fix and add `typecheck` script → `FE-001`, `FE-002` | Clean install → `npx tsc -b` exits 0; log attached to task | **YES** |
| CQ-02 | تشغيل ESLint ومعالجة الأخطاء المهمة | `eslint.config.js`, all `src/**/*.ts(x)` | NOT VERIFIED | ESLint 9 flat config exists for TS/TSX only, ignores `dist`. No `jsx-a11y`, import, or formatting rules. Never executed in this workspace. | Style/quality regressions and hook misuse can reach production; a11y issues undetected. | Run `npm run lint`, fix errors, add `jsx-a11y` + CI gate → `FE-001`, `FE-002`, `FE-022` | `npm run lint` exits 0; CI job fails on new errors | **YES** |
| CQ-03 | التأكد من نجاح عملية بناء إصدار Production | `package.json` (`build`), `vite.config.ts` | NOT VERIFIED | Build script is `tsc -b && vite build`. No `dist/` present, no build log, no CI. `node_modules` absent. | A build failure discovered on release day blocks launch with no fallback. | Execute build from clean install, fix failures, archive output and chunk report → `FE-001`, `FE-002` | `npm run build` exits 0; `dist/` manifest and chunk sizes archived | **YES** |
| CQ-04 | إزالة الأكواد التجريبية وعبارات `console.log` غير الضرورية | 127 occurrences across services/hooks/pages; `src/services/api.ts:41-47` | FAIL | 127 `console.*` calls. The API request interceptor logs URL, params, and first 20 chars of the auth header **without a dev guard**. Debug comments ("🔍 DEBUG LOG") remain. | Leaks request metadata to any user with DevTools; noisy production console; undermines incident response. | Remove/guard logs, add `no-console` lint rule, keep a dev-only logger → `FE-003` | Grep returns 0 unguarded `console.*`; production console clean in smoke test | **YES** |
| CQ-05 | مراجعة `TODO` و`FIXME` والأجزاء غير المكتملة | `TODO.md`, 8 TODO/FIXME markers, 14 empty modules, `App.tsx:235` "Coming Soon" | FAIL | `TODO.md` has 2 open items (finish `ProjectDetail` refactor, run build/lint). 8 TODO/FIXME/HACK markers in source. 14 zero-byte modules. Duplicate dead `ProjectDetail` page and admin "Coming Soon" route. | Incomplete refactors create divergent implementations; dead routes confuse QA and users. | Triage each marker into a ticket or delete; remove dead modules/routes → `FE-004` | `TODO.md` closed; zero TODO/FIXME; no zero-byte modules; route table reviewed | NO |
| CQ-06 | مراجعة Dependencies وإزالة المكتبات غير المستخدمة بعد التأكد من عدم الحاجة إليها | `package.json`, `package-lock.json`, import scan | FAIL | Unused (0 imports): `@jitsi/react-sdk`, `aos`, `html2pdf`, `react-is`, `react-player`, `sweetalert2`, `sweetalert2-react-content`, `zod`, `@tanstack/react-query-devtools`. Stale `@types/react-router-dom` v5 alongside router v7. | Larger install/build, unnecessary attack surface, false confidence in validation/telemetry libraries. | Remove or justify each; align types; update package metadata → `FE-005` | `npm ls` clean; build/lint pass after removal; bundle delta recorded | NO |

---

## 2. Security

| ID | Original checklist item | Relevant files / components | Status | Evidence & identified gap | User impact / technical risk | Recommended action → Task | Verification method | Blocker |
|---|---|---|---|---|---|---|---|---|
| SEC-01 | التأكد من خلو الكود ومستودعات Git من مفاتيح API أو الأسرار | Whole working tree; `.gitignore` | PARTIAL | Targeted scan for key patterns (`sk-`, `AKIA`, `AIza`, `ghp_`, PEM, `api_key`, JWT-shaped strings) found **no live secrets**. Git history not scanned; no secret-scanning tooling. `.gitignore` ignores `.env`/`*.local`. | A historical or future committed secret could compromise backend/AI services. | Add secret scanning (gitleaks/trufflehog) locally + CI; scan history once; document rotation path → `FE-011` | Scan of full history returns clean or findings rotated; CI secret job green | **YES** (guardrail) |
| SEC-02 | مراجعة ملفات Environment Variables والتأكد من عدم تضمين أسرار ضمن متغيرات `VITE_*` | No `.env*`; 17 × `VITE_API_BASE_URL`, 5 × `VITE_BASE_URL` | PARTIAL | No env files exist, so no `VITE_*` secret is committed. But there is no `.env.example`, no validation, two competing names, and `api.ts` ignores env entirely. Any future `VITE_*` value is public by design. | A developer may place a private key in `VITE_*` and ship it to every browser; missing env causes silent localhost fallback. | Define public-only env contract, `.env.example`, startup validation, CI check that no secret-like values exist in `VITE_*` → `FE-006`, `FE-011` | `.env.example` reviewed; build fails on missing required var; no secret patterns in `VITE_*` | **YES** |
| SEC-03 | التحقق من تطبيق Authorization وPermissions على الـ Backend | External (Spring Boot API) | NOT VERIFIED | Frontend cannot prove server-side authorization. Client guards read persisted role only. | If backend trusts client role or lacks per-resource checks, any user can read/modify others' data. | Request backend evidence: role matrix, endpoint authorization tests, IDOR checks → `FE-009` (verification request, not FE implementation) | Backend provides test report per role/endpoint; negative tests return 401/403 | **EXT** |
| SEC-04 | مراجعة حماية Admin Pages والـ Protected Routes | `src/routes/ProtectedRoute.tsx`, `src/App.tsx:186-236`, `src/store/authStore.ts` | PARTIAL | Guards exist and check hydration + role. But role comes from editable `localStorage`; a stray pathless guard route and duplicate `/admin/dashboard` placeholder exist; `/explore-mentorships` is behind the student guard. | Unauthorized users can render admin/mentor shells (data still depends on backend); confusing redirects for legitimate users. | Clean route table, remove dead routes, add negative tests, document client guard as UX-only → `FE-009` | Unit tests for each role; manual tamper test shows redirect; backend 403 verified | **YES** |
| SEC-05 | مراجعة آلية تخزين Access Tokens وبيانات تسجيل الدخول | `src/store/authStore.ts`, `src/utils/jwt.ts` | FAIL | JWT stored in `localStorage["auth-storage"]` **and** `localStorage["token"]`; no expiry check; no refresh; no 401 handling; token written even when "Remember me" is off; `logout` clears all localStorage. | Any XSS = persistent account takeover; stale/expired sessions cause confusing failures; shared devices retain sessions unexpectedly. | Decide storage strategy (in-memory + refresh cookie preferred), enforce expiry, add 401 interceptor, fix remember-me semantics, scope logout → `FE-008` | Security review sign-off; expired token redirects to login; remember-me off clears token on tab close | **YES** |
| SEC-06 | التحقق من عدم ظهور بيانات حساسة في Logs أو رسائل الأخطاء | `src/services/api.ts`, `useLogin.ts`, `Websocketservice.ts`, `utils/jwt.ts` | FAIL | Unguarded log of auth-header prefix/URL/params; login logs email and redirect role; WS logs connection state; JWT decode logs errors. Error toasts surface raw backend messages. | PII/credential fragments in console; error text can reveal internals. | Remove sensitive fields, centralize safe error mapping, add log redaction → `FE-003`, `FE-008` | Production console contains no token/email/URL params; error UI uses mapped messages | **YES** |
| SEC-07 | مراجعة ثغرات Dependencies باستخدام `npm audit` ومعالجة الثغرات ذات الأولوية | `package-lock.json` | NOT VERIFIED | `npm audit` cannot run without installing dependencies; no audit report in repo; no Dependabot/Renovate config. | Known critical CVEs may ship unnoticed. | Run `npm audit --production`, triage by severity/exploitability, upgrade/override → `FE-025` | `npm audit` high/critical = 0 or documented accepted risk with owner | **YES** (evidence) |

---

## 3. Testing & Quality Assurance

| ID | Original checklist item | Relevant files / components | Status | Evidence & identified gap | User impact / technical risk | Recommended action → Task | Verification method | Blocker |
|---|---|---|---|---|---|---|---|---|
| QA-01 | تشغيل اختبارات Unit وIntegration | No test files, no runner | FAIL | Zero `*.test.*`/`*.spec.*`; no Vitest/Jest/RTL in manifest or lockfile; no `test` script. | Every change is unverified; regressions reach staging/production. | Introduce Vitest + RTL + jsdom, coverage thresholds, sample suites → `FE-012` | `npm test` runs; coverage report generated; CI gate green | **YES** |
| QA-02 | اختبار Login وLogout وRegistration وPassword Recovery | `useLogin.ts`, `useRegisterForm.ts`, `useVerifyForm.ts`, `useForgetPassForm.ts`, `useResetPassForm.ts`, `useRestoreForm.ts` | FAIL | No automated coverage; only manual validation logic in hooks. No documented manual evidence. | Auth regressions lock users out or create duplicate accounts. | Add unit + E2E coverage for all auth journeys → `FE-013` | Happy/negative paths pass in CI and on staging | **YES** |
| QA-03 | اختبار أهم مسارات المستخدم من البداية إلى النهاية | Mentor/student/admin routes in `App.tsx` | FAIL | No E2E framework or journey tests. | Critical flows (enroll, submit, grade, activate mentorship) can break silently. | Add Playwright role-based journey suites → `FE-014` | All P0 journeys pass against staging | **YES** |
| QA-04 | اختبار حالات Loading وEmpty وError | `ErrorState.tsx`, `EmptyState.tsx`, `LoadingSpinner.tsx`, `ExploreMentorships.tsx`, dashboards | PARTIAL | Reusable components exist and Explore Mentorships handles loading/error/empty. Coverage is inconsistent across ~139 pages; no tests or visual evidence. | Users see blank screens or infinite spinners on slow/failed requests. | Standardize state handling and test each critical page → `FE-014`, `FE-015` | Each critical page has loading/empty/error test + screenshot | NO |
| QA-05 | اختبار النماذج والتحقق من صحة البيانات ورسائل الخطأ | Auth forms, mentorship forms, settings, submissions | PARTIAL | Manual regex/length validation exists (email, phone, password ≥ 6, confirm match, terms). `zod` is installed but unused. No field-level server error mapping; no tests; labels not programmatically linked. | Inconsistent validation and unclear errors increase support load and failed signups. | Add schema validation + tests + accessible error linking → `FE-013`, `FE-022` | Boundary/negative cases pass; errors announced to screen readers | NO |
| QA-06 | اختبار صلاحيات المستخدمين والأدوار المختلفة | `ProtectedRoute.tsx`, role dashboards | FAIL | No role/permission tests. Client guard only; role persisted in localStorage. | Wrong-role access or redirect loops; false sense of security. | Add role matrix tests (mentor/student/admin/guest) + backend verification → `FE-009`, `FE-014` | Matrix passes; tampered role cannot reach data without backend 403 | **YES** |
| QA-07 | اختبار حالات فشل الـ API وانقطاع الاتصال وانتهاء المهلة | `api.ts` (15s timeout), `queryClient.ts`, raw fetch calls | FAIL | Axios has a 15s timeout, but raw `fetch` calls have none. No offline UI, no global 401/timeout messaging, no tests. `refetchOnReconnect: false`. | Users see frozen UI or generic errors; duplicate submissions on retry. | Add timeout/abort/offline handling, map errors, test failure modes → `FE-014`, `FE-015` | Network-offline/timeout/500 tests produce actionable UI | NO |

---

## 4. Performance Optimization

| ID | Original checklist item | Relevant files / components | Status | Evidence & identified gap | User impact / technical risk | Recommended action → Task | Verification method | Blocker |
|---|---|---|---|---|---|---|---|---|
| PERF-01 | مراجعة أحجام ملفات JavaScript الناتجة عن عملية الـ Build | `vite.config.ts`, no `dist/` | NOT VERIFIED | No build artifact or bundle report. `chunkSizeWarningLimit: 500` only warns. | Oversized bundles slow first load, especially on mobile networks. | Build with `--mode production`, capture chunk sizes, set budget → `FE-016` | Report lists every chunk; budget enforced in CI | **YES** (evidence) |
| PERF-02 | تطبيق Lazy Loading للصفحات والمكونات المناسبة | `App.tsx:19-80`, eager imports at `10-14` | PARTIAL | Most routes use `React.lazy`. `AdminDashboard`, `AdminPayment`, `MentorshipOverviewPage`, `AdminUsers`, `ChatbotWidget` are eagerly imported; chatbot is global on many routes. | Admin/chat code downloaded by all users; slower LCP on public pages. | Lazy-load admin pages; isolate chatbot by route; audit heavy modals → `FE-016` | Initial JS reduced; network waterfall shows route-only chunks | NO |
| PERF-03 | مراجعة عمليات إعادة التصيير غير الضرورية في React | 116 `useEffect`, 105 `useMemo`/`useCallback`/`memo`; contexts | PARTIAL | Memoization exists but no profiling evidence. Context providers (`Theme`, `WebSocket`, `Notifications`) wrap the whole app; auth store selectors vary. | Excess renders in dashboards/tables on socket events. | Profile with React DevTools, split contexts, stabilize selectors → `FE-017` | Before/after render counts on dashboard/chat | NO |
| PERF-04 | تحسين أحجام الصور وصيغها | `vite.config.ts:13-25`, 87 `<img>`, `OptimizedImage.tsx` | PARTIAL | Build-time optimizer configured; many assets are WebP. But remote Unsplash/pravatar images bypass optimization; `srcset` adoption is partial; no dimension attributes everywhere. | Layout shift and slow LCP on marketing/dashboard pages. | Self-host/optimize remote images, enforce dimensions + srcset, audit top pages → `FE-018` | Lighthouse image audit; no CLS from images | NO |
| PERF-05 | التأكد من تفعيل Code Splitting عند الحاجة | `vite.config.ts:45-90`, `App.tsx` | PARTIAL | `manualChunks` and lazy routes exist. `vendor-jitsi`/`vendor-alerts` target unused packages; eager imports weaken splitting. | Ineffective caching; unused vendor code shipped. | Fix chunk map to real imports; verify with bundle analyzer → `FE-016` | Chunk graph matches actual imports; no empty/unused chunks | NO |
| PERF-06 | مراجعة Pagination أو Virtualization للقوائم الكبيرة | Tables/lists in admin, mentor, student areas; `Pagination.tsx` (4 variants) | PARTIAL | Pagination components exist and are used in several tables (users, payments, submissions, mentorships). No virtualization; some lists render full arrays; four duplicate pagination implementations. | Large classes/ledgers may lag or freeze on low-end devices. | Standardize pagination; add virtualization where row counts are unbounded → `FE-017` | 1,000-row test stays responsive (<100ms interaction) | NO |
| PERF-07 | اختبار الأداء على الموبايل والشبكات البطيئة | None | NOT VERIFIED | No Lighthouse/WebPageTest artifacts; no device or throttling evidence. | Real users on 3G/mid-range phones may abandon the app. | Run Lighthouse mobile (throttled) on top 5 pages; set budgets → `FE-016`, `FE-023` | Scores and traces archived; budgets met | **YES** (evidence) |

---

## 5. Production Configuration & Deployment

| ID | Original checklist item | Relevant files / components | Status | Evidence & identified gap | User impact / technical risk | Recommended action → Task | Verification method | Blocker |
|---|---|---|---|---|---|---|---|---|
| DEP-01 | إعداد متغيرات البيئة الخاصة بـ Production | No `.env*`, no `.env.example` | FAIL | No environment definitions at all; two variable names; no validation; silent localhost fallbacks. | Production build cannot be configured reliably; wrong environment can ship. | Create env contract + `.env.example` + validation + CI wiring → `FE-006` | Production build fails fast if var missing; values documented per environment | **YES** |
| DEP-02 | التحقق من استخدام عنوان API الصحيح لبيئة Production | `src/services/api.ts:4` | FAIL | `API_BASE_URL = 'http://localhost:8080'` hard-coded. Every deployed request would target the user's own machine. | The application is non-functional in production. | Refactor to `import.meta.env.VITE_API_BASE_URL` with validation → `FE-006` | Staging build network tab shows the staging API host only | **YES** |
| DEP-03 | مراجعة إعدادات المشروع والتأكد من خلوها من أي اعتماد على `localhost` | 15+ files; `index.html:30`; `Usechatbot.ts:5` | FAIL | `localhost:8080` appears in API client, chat components, payments, submissions, image URLs, status toggle; `127.0.0.1:8000` in chatbot; ngrok DNS prefetch in HTML. | Broken media/actions in production; dev tunnel dependency leaks. | Replace all with env-derived URLs; centralize asset URL builder → `FE-007`, `FE-006` | `grep -r localhost src index.html` returns only documented dev-only config | **YES** |
| DEP-04 | مراجعة إعدادات CORS على الـ Backend | External | NOT VERIFIED | No backend config in repo. Dev proxy exists; production origin unknown. | First API call from the deployed origin may be blocked. | Backend/DevOps provide allowlist for staging/production origins → verification request under `FE-019` | Preflight `OPTIONS` returns correct `Access-Control-Allow-Origin` | **EXT** |
| DEP-05 | تفعيل HTTPS والتأكد من صلاحية SSL Certificate | Hosting layer | NOT VERIFIED | No hosting/TLS config in repo; domain unknown. | Insecure transport, mixed-content failures, browser warnings. | DevOps enables HTTPS + HSTS, validates certificate chain → `FE-019` | `https://` loads with valid cert; no mixed content | **EXT** |
| DEP-06 | مراجعة Cache Headers للملفات الثابتة | `vite.config.ts` hashed filenames; no host config | NOT VERIFIED | Content hashes are present (`[name]-[hash].js`). No cache-control config exists for `index.html` vs hashed assets. | Stale app shells or unnecessary re-downloads after deploy. | Configure `index.html` no-cache, hashed assets immutable 1y → `FE-019` | Response headers verified with `curl -I` | **EXT** |
| DEP-07 | التأكد من إعداد Domain وDNS بصورة صحيحة | None | NOT VERIFIED | `robots.txt` references `edunest.com`; no DNS/domain documentation. | Users may hit wrong host, redirect loops, or broken links. | DevOps documents domain, DNS records, redirects (www/apex) → `FE-019` | DNS lookup + redirect matrix verified | **EXT** |
| DEP-08 | اختبار عملية Deployment على Staging قبل النشر على Production | None | FAIL | No staging environment, pipeline, or evidence. | First real deployment becomes the test. | Create staging deploy + smoke run → `FE-020` | Staging URL passes full smoke pack; release approved | **YES** |

---

## 6. UI/UX & Browser Compatibility

| ID | Original checklist item | Relevant files / components | Status | Evidence & identified gap | User impact / technical risk | Recommended action → Task | Verification method | Blocker |
|---|---|---|---|---|---|---|---|---|
| UX-01 | اختبار Responsive Design على الموبايل والتابلت والديسكتوب | Tailwind classes across 179 components | NOT VERIFIED | 849 responsive utility usages suggest intent, but no device testing evidence. Complex tables use `min-w-[800px]` and horizontal scroll. | Broken layouts on tablets/phones; unusable data tables. | Execute responsive matrix and fix overflow/navigation issues → `FE-023` | Screenshots at 360/768/1024/1440 for top 10 pages | NO |
| UX-02 | اختبار المتصفحات الأساسية التي يدعمها المشروع | `vite.config.ts:42` (`esnext`), no browserslist | NOT VERIFIED | No supported-browser definition; no cross-browser evidence; `esnext` output. | Older Safari/Edge/enterprise browsers may throw syntax errors. | Define browser matrix, add browserslist/target, run cross-browser smoke → `FE-023` | Matrix executed; no console errors on supported browsers | NO |
| UX-03 | مراجعة Console وNetwork للتحقق من خلوهما من الأخطاء المؤثرة | Runtime | NOT VERIFIED | App not running; 127 console statements and known localhost calls guarantee errors in a hosted build. | Noisy console masks real errors; failed requests confuse QA. | Re-test after `FE-003`/`FE-006`; add smoke assertion for console/network → `FE-003`, `FE-020` | Zero unexpected console errors and failed requests on smoke routes | **YES** (evidence) |
| UX-04 | اختبار فتح الصفحات الداخلية مباشرة وعمل Refresh | `BrowserRouter`, no host rewrite | FAIL | No SPA rewrite configuration; static hosts return 404 on deep-link refresh. | Email/bookmark links and refresh break for protected pages. | Add host rewrite (`/* → /index.html`) and test deep links → `FE-019` | Direct load + refresh of 10 deep routes returns 200 and renders | **YES** |
| UX-05 | مراجعة 404 Page والروابط الداخلية | `pages/NotFound.tsx`, `App.tsx:172`, `public/robots.txt` | PARTIAL | `NotFound` exists and is wired to `*`; it uses `navigate(-1)` which can loop if opened directly. Sitemap URL in robots.txt is missing. Duplicate dead admin route exists. | Poor recovery from bad links; SEO inconsistency. | Add home fallback, link audit, sitemap or remove reference → `FE-015`, `FE-004` | 404 page tested from direct URL; all internal links resolve | NO |
| UX-06 | اختبار أساسيات Accessibility والتنقل باستخدام لوحة المفاتيح | 32 modals, 143 inputs, 556 buttons, `index.css:101` | PARTIAL | Focus-visible outline exists; some aria labels. But 0/32 modals have `role="dialog"`/focus trap; 4/143 inputs have `htmlFor`; many icon buttons lack names; `lang="en"` with Arabic content. | Keyboard/screen-reader users cannot operate dialogs or forms; legal/accessibility risk. | Modal focus management, labels, names, landmarks, contrast audit → `FE-022` | axe scan = 0 critical; keyboard-only walkthrough passes | NO |
| UX-07 | مراجعة الترجمة والتواريخ والمناطق الزمنية عند الحاجة | `useMentorships.ts:48`, `Usehomepage.ts`, `index.html:2` | FAIL | Mixed Arabic/English UI; `lang="en"`; dates hard-coded to `en-US`; no timezone conversion; no i18n framework. | Confusing UX for Arabic users; wrong deadlines/times across timezones. | Decide i18n scope; centralize date/time formatting with locale + timezone → `FE-024` | Date/time cases across 2 timezones; `lang`/dir correct | NO |

---

## 7. Monitoring, Recovery & Post-Deployment

| ID | Original checklist item | Relevant files / components | Status | Evidence & identified gap | User impact / technical risk | Recommended action → Task | Verification method | Blocker |
|---|---|---|---|---|---|---|---|---|
| MON-01 | إعداد Error Tracking مثل Sentry أو بديل مناسب | None | FAIL | No Sentry/Datadog/Rollbar/LogRocket dependency or initialization; no error boundary to report from. | Production failures are invisible; MTTR depends on user reports. | Integrate error tracking with release/env tags and PII scrubbing → `FE-021` | Test error appears in dashboard with correct release | **YES** |
| MON-02 | إعداد أدوات Monitoring لمتابعة الأداء والأخطاء | None | FAIL | No RUM/analytics/web-vitals instrumentation. | Cannot detect performance regressions or regional failures. | Add Web Vitals + error-rate dashboards (frontend instrumentation + DevOps dashboards) → `FE-021` | Dashboard shows LCP/INP/CLS and error rate per release | NO |
| MON-03 | التأكد من جاهزية خطة Rollback للعودة إلى الإصدار السابق | None | FAIL | No rollback documentation; hosting target unknown; no versioned artifacts. | Extended outage if release is faulty. | Write rollback runbook, define artifact retention and owner → `FE-026` | Rollback rehearsed on staging within target RTO | **YES** |
| MON-04 | تجهيز اختبارات Smoke Tests لإجرائها بعد النشر | None | FAIL | No smoke scripts or checklist. | Post-deploy validation is ad hoc; regressions found by users. | Create smoke pack (auth, dashboards, API health, deep links) → `FE-020` | Smoke suite passes on staging and production | **YES** |
| MON-05 | اختبار أهم الصفحات والـ APIs بعد Deployment | None | NOT VERIFIED | No deployment executed or accessed. | Silent 5xx/CORS failures after release. | Execute post-deploy verification checklist → `FE-020` | All smoke routes 200; key APIs 2xx; no CORS errors | **YES** (evidence) |
| MON-06 | مراقبة Error Rates وPerformance بعد الإطلاق | None | NOT VERIFIED | No dashboards or alert thresholds defined. | Slow detection of user-impacting incidents. | Define alert thresholds, on-call owner, 24h watch plan → `FE-021`, `FE-026` | Alerts fire in a controlled test; watch log completed | NO |

---

## 8. Pre-Deployment Commands

| ID | Original checklist item | Relevant files / components | Status | Evidence & identified gap | User impact / technical risk | Recommended action → Task | Verification method | Blocker |
|---|---|---|---|---|---|---|---|---|
| CMD-01 | `npx tsc --noEmit` | `tsconfig*.json` | NOT VERIFIED | Not executed (no dependencies). Note: at repo root this command checks no files because `tsconfig.json` has `"files": []`. | False green check; real type errors missed. | Use `npx tsc -b` (or `tsc -p tsconfig.app.json --noEmit`) and add `typecheck` script → `FE-001` | Command exits 0 in CI from clean install | **YES** |
| CMD-02 | `npx eslint .` | `eslint.config.js` | NOT VERIFIED | Not executed. Config covers only TS/TSX; no a11y plugin. | Lint debt unknown. | Run and fix; add CI gate → `FE-001`, `FE-002` | Exit 0 with zero errors | **YES** |
| CMD-03 | `npm audit` | `package-lock.json` | NOT VERIFIED | Not executed; no install. | Vulnerability exposure unknown. | Run `npm audit --production`, triage → `FE-025` | 0 high/critical or accepted-risk record | **YES** |
| CMD-04 | `npm test` | `package.json` | FAIL | **No `test` script and no runner.** Command fails immediately. | No automated regression safety net. | Add Vitest + script + CI → `FE-012` | `npm test` executes suites and exits 0 | **YES** |
| CMD-05 | `npm run build` | `package.json`, `vite.config.ts` | NOT VERIFIED | Not executed; no `dist/`. | Release artifact unproven. | Execute from clean install and archive logs → `FE-001` | Build exits 0; artifact checksum stored | **YES** |

---

## 9. Release Approval

| ID | Original checklist item | Relevant files / components | Status | Evidence & identified gap | User impact / technical risk | Recommended action → Task | Verification method | Blocker |
|---|---|---|---|---|---|---|---|---|
| REL-01 | اجتياز جميع الفحوصات الأساسية | CI / release checklist | FAIL | No CI, no recorded command results, 0 PASS items in this audit. | Approval would be based on assumption, not evidence. | Establish CI + release gate → `FE-026` | CI green on release commit; evidence bundle attached | **YES** |
| REL-02 | عدم وجود مشكلات أمنية حرجة أو غير معالجة | Security findings F-08..F-12, F-28 | FAIL | Open: localStorage JWT, unguarded logging, XSS sinks, unknown dependency CVEs, client-only role guard. | Account takeover / data exposure risk. | Close P0/P1 security tasks or record accepted risk with owner → `FE-008`, `FE-010`, `FE-011`, `FE-025` | Security sign-off with findings closed/accepted | **YES** |
| REL-03 | نجاح الاختبارات الأساسية | None | FAIL | No tests exist. | No confidence in auth/enrollment/payment flows. | Implement and pass critical suites → `FE-012`, `FE-013`, `FE-014` | CI test report green; staging E2E green | **YES** |
| REL-04 | نجاح Production Build | None | NOT VERIFIED | Build never executed. | Release artifact may not exist. | Run and archive build → `FE-001` | `npm run build` exit 0 + artifact | **YES** |
| REL-05 | اختبار الإصدار على Staging | None | FAIL | No staging environment or evidence. | Production becomes the first integration test. | Deploy staging + smoke → `FE-020` | Staging sign-off checklist complete | **YES** |
| REL-06 | جاهزية خطة Rollback | None | FAIL | No rollback plan. | Extended outage on bad release. | Write and rehearse rollback → `FE-026` | Rollback completed on staging; owner named | **YES** |

---

## Coverage Summary

| Section | Items | Mapped to tasks |
|---|---:|---|
| Code Quality & Build | 6 | FE-001, FE-002, FE-003, FE-004, FE-005 |
| Security | 7 | FE-003, FE-006, FE-008, FE-009, FE-010, FE-011, FE-025 |
| Testing & QA | 7 | FE-009, FE-012, FE-013, FE-014, FE-015, FE-022 |
| Performance | 7 | FE-016, FE-017, FE-018, FE-023 |
| Production Config | 8 | FE-006, FE-007, FE-019, FE-020 |
| UI/UX & Compatibility | 7 | FE-003, FE-004, FE-015, FE-019, FE-022, FE-023, FE-024 |
| Monitoring & Recovery | 6 | FE-020, FE-021, FE-026 |
| Commands | 5 | FE-001, FE-012, FE-025 |
| Release Approval | 6 | FE-008, FE-010, FE-011, FE-012, FE-013, FE-014, FE-020, FE-025, FE-026 |
| **Total** | **59** | **All mapped; no orphan requirement** |

External verification requests (not frontend implementation tasks): `SEC-03`, `DEP-04`, `DEP-05`, `DEP-06`, `DEP-07`, plus backend token-format confirmation for `FE-007` and AI-service hosting for `FE-007`/`FE-027` in the audit.
