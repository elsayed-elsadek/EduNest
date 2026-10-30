# دليل عربي: إيه المهام، إزاي تنفذها، وفين مكانها

| البند | التفاصيل |
|---|---|
| المشروع | EduNest — واجهة React + TypeScript + Vite |
| مكان المشروع | جذر المستودع `C:\Users\shahd\OneDrive\Desktop\EDUNEST\EduNest` |
| تاريخ التخطيط | 2026-10-30 |
| حالة النشر | **NO-GO — مش جاهز للنشر** |
| نوع الملف | دليل شرح وتنفيذ مبني على خطة جاهزية النشر |

> **ملاحظة مهمة:** الملف ده شرح مبسّط لمهام الجاهزية. التفاصيل الكاملة والقبول والمعايير موجودة في الملفات الإنجليزية داخل نفس المجلد. **مفيش كود اتغير، ومفيش مكتبات اتثبتت، ومفيش حاجة اترفعت على Jira أو اتنشرت.**

---

## 1. الخلاصة في 10 سطور

1. المشكلة الأساسية مش نقص صفحات، المشكلة إن المشروع **مش قابل للتحقق منه ولا للنشر**.
2. `src/services/api.ts` فيه رابط API ثابت على `http://localhost:8080`، يعني أي نسخة منشورة هتكلّم جهاز المستخدم نفسه.
3. مفيش ملفات `.env` ولا `.env.example`، ومفيش تحقق من متغيرات البيئة.
4. مفيش اختبارات ولا CI، و`npm test` مش موجود أصلاً.
5. الـ JWT متخزن في `localStorage`، ومفيش تعامل مع انتهاء الجلسة أو 401.
6. حماية المسارات في الفرونت بتعتمد على `userRole` من `localStorage`، وده سهل التعديل.
7. مفيش إعداد استضافة، ولا SPA rewrite، ولا cache headers، ولا security headers.
8. مفيش monitoring، ولا error tracking، ولا خطة rollback.
9. المطلوب **18 مهمة إجبارية** (11 P0 + 7 P1 حرجة) قبل أي go/no-go.
10. ابدأ بـ **FE-001**: ثبت الاعتماديات، شغّل typecheck/lint/build، وسجّل النتائج.

---

## 2. إيه المشاكل اللي بتخلي المشروع مش جاهز؟

| المشكلة | الدليل في الكود | تأثيرها |
|---|---|---|
| رابط API ثابت | `src/services/api.ts` — `API_BASE_URL = 'http://localhost:8080'` | الموقع المنشور مش هيشتغل |
| مفيش بيئة | مفيش `.env` / `.env.example` | مفيش طريقة آمنة لتغيير رابط API بين staging والإنتاج |
| استدعاءات `fetch` مباشرة | `StatusToggleModal.tsx`، `ProjectSubmissionsTable.tsx`، `MentorshipStudentsTable.tsx` | بتتجاوز الـ Axios والـ auth header |
| شات بوت على localhost | `src/hooks/chatbot/Usechatbot.ts` — `127.0.0.1:8000` | الشات مش هيشتغل في الإنتاج |
| JWT في localStorage | `src/store/authStore.ts` | أي XSS = سيطرة على الحساب |
| مفيش 401/refresh | مفيش interceptor للـ 401 | المستخدم يفضل عالق بجلسة منتهية |
| حماية بالدور من العميل | `src/routes/ProtectedRoute.tsx` | تعديل `localStorage` يظهر واجهات مش من حقه |
| XSS sinks | `ChatbotWidget.tsx` و`FileViewer.tsx` — `dangerouslySetInnerHTML` | تنفيذ HTML/سكريبت غير موثوق |
| مفيش tests | مفيش Vitest/Jest/RTL/Playwright | أي تعديل ممكن يكسر حاجة من غير ما نعرف |
| مفيش CI | مفيش `.github/` | مفيش بوابة جودة على الـ PR |
| مفيش استضافة | مفيش `netlify.toml` / `vercel.json` / `Dockerfile` / nginx | deep links هتضرب 404 |
| مفيش monitoring | مفيش Sentry/RUM | الأعطال هتبان من شكاوى المستخدمين |
| مفيش rollback | مفيش runbook | أي مشكلة في الإنتاج هتطول |
| 127 console | موزعة على الخدمات والصفحات | تسريب معلومات وتشويش |
| 14 ملف فاضي | موديولات zero-byte | كود ميت ولبس |
| 9 مكتبات مش مستخدمة | `package.json` | حجم أكبر وسطح هجوم أوسع |
| 32 مودال بدون `role="dialog"` | مكونات المودالات | مشكلة accessibility |
| 4 `htmlFor` مقابل 143 input | النماذج | labels مش مرتبطة برمجياً |

---

## 3. فين المكان؟ خريطة الملفات والمجلدات

### 3.1 ملفات الجذر

| المسار | فيه إيه | هتعدل فيه إيه | المهمة |
|---|---|---|---|
| `package.json` | السكربتات والاعتماديات | تضيف `typecheck` و`test` و`ci`، وتشيل مكتبات مش مستخدمة | FE-001, FE-005, FE-012 |
| `package-lock.json` | قفل الاعتماديات | يتحدث بعد `npm install/uninstall` | FE-005, FE-025 |
| `tsconfig.json` | Solution file | `"files": []` — متستخدمهوش لوحده للفحص | FE-001, FE-002 |
| `tsconfig.app.json` | إعدادات TS للتطبيق | إصلاح أخطاء الأنواع هنا | FE-002 |
| `vite.config.ts` | بناء Vite والتقسيم | إصلاح `manualChunks`، إضافة `base` لو لازم، وضبط الـ build | FE-016, FE-019 |
| `eslint.config.js` | قواعد ESLint | إضافة `jsx-a11y` و`no-console` | FE-002, FE-003, FE-022 |
| `index.html` | نقطة دخول HTML | إزالة ngrok prefetch، ضبط favicon/lang | FE-007, FE-019, FE-022 |
| `public/robots.txt` | robots | إصلاح رابط sitemap الناقص | FE-019 |
| `.gitignore` | تجاهل Git | التأكد إن `.env` و`*.local` متجاهلين | FE-011 |

### 3.2 أهم ملفات `src`

| المسار | وظيفته | المشكلة/المهمة |
|---|---|---|
| `src/services/api.ts` | Axios client + interceptors | رابط localhost + logging حساس → FE-003, FE-006, FE-007, FE-008 |
| `src/store/authStore.ts` | حالة المصادقة وZustand persist | JWT في localStorage + remember-me → FE-008 |
| `src/routes/ProtectedRoute.tsx` | حماية المسارات بالأدوار | يعتمد على دور قابل للتعديل → FE-009 |
| `src/App.tsx` | جدول المسارات | Route بدون path + تكرار `/admin/dashboard` → FE-002, FE-009 |
| `src/lib/queryClient.ts` | إعدادات TanStack Query | `refetchOnReconnect: false` وretry عام → FE-015 |
| `src/hooks/chatbot/Usechatbot.ts` | اتصال الشات بوت | `127.0.0.1:8000` → FE-007 |
| `src/components/common/ChatbotWidget/ChatbotWidget.tsx` | عرض ردود الشات | `dangerouslySetInnerHTML` → FE-010 |
| `src/components/common/FileViewer.tsx` | عارض الملفات | سكريبت CDN + HTML غير آمن → FE-010 |
| `src/pages/mentor-pages/mentorship-detail/components/StatusToggleModal.tsx` | تغيير حالة الـ mentorship | `fetch` مباشر بدون auth → FE-007 |
| `src/pages/mentor-pages/mentorship-detail/components/MentorshipStudentsTable.tsx` | جدول الطلاب | `Bearer` غير متسق → FE-007 |
| `src/utils/jwt.ts` | فك/فحص الـ JWT | مفيش فحص انتهاء → FE-008 |
| `src/index.css` | ستايلات عامة | focus-visible موجود؛ ينقص دعم a11y → FE-022 |

### 3.3 ملفات ومجلدات جديدة هتنشئها

| المسار الجديد | الغرض | المهمة |
|---|---|---|
| `.env.example` | توثيق متغيرات البيئة العامة فقط | FE-006 |
| `src/config/env.ts` | قراءة والتحقق من `import.meta.env` | FE-006 |
| `.github/workflows/frontend-ci.yml` | CI: install → typecheck → lint → test → build | FE-001, FE-012 |
| `vitest.config.ts` | إعداد Vitest + jsdom | FE-012 |
| `src/test/setup.ts` | إعداد jest-dom والـ mocks | FE-012 |
| `src/test/utils.tsx` | `renderWithProviders` (Router + QueryClient) | FE-012 |
| `e2e/` | اختبارات Playwright | FE-013, FE-014 |
| `playwright.config.ts` | إعداد المتصفحات وbaseURL | FE-013 |
| `netlify.toml` أو `vercel.json` أو `nginx.conf` | إعداد الاستضافة والـ rewrite | FE-019 |
| `public/sitemap.xml` | sitemap بدل الرابط الناقص | FE-019 |
| `docs/runbook.md` | rollback وsmoke | FE-026 |

> **مهم:** اختيار ملف الاستضافة بيعتمد على **مين هيستضيف المشروع**. لحد ما DevOps يقرر، متعملش أكتر من ملف واحد وتخلي الباقي.

---

## 4. الترتيب: تبدأ إزاي وتخلص إمتى؟

| المرحلة | الأسابيع | المهام | الناتج |
|---|---|---|---|
| **M0 — قرارات وأساس** | 1 | FE-001 يبدأ + قرار الاستضافة + طلب عقد الـ Backend | بيئة قابلة للتشغيل وقرارات مكتوبة |
| **M1 — بناء ثابت** | 2 | FE-001, FE-002, FE-003, FE-012 | CI أخضر + typecheck/lint/build ناجح |
| **M2 — أمان وبيئة** | 3–4 | FE-006, FE-007, FE-008, FE-009, FE-010, FE-011, FE-025 | مفيش localhost + جلسة آمنة + حماية مسارات |
| **M3 — شبكة أمان** | 5–6 | FE-013, FE-014, FE-015 | اختبارات auth/roles/journeys على staging |
| **M4 — Release Candidate** | 7 | FE-019, FE-020, FE-021, FE-022, FE-016 | staging كامل + smoke + monitoring |
| **M5 — قرار النشر** | 8 | FE-026 | go/no-go + rollback + إنتاج |

**بافتراض:** 2 مطورين فرونت بدوام كامل، QA بنسبة 80%، DevOps بنسبة 40%، وردّ الـ Backend خلال يومين عمل. لو مطور واحد، المدة تقريباً 10–13 أسبوع.

---

## 5. المهام الإجبارية واحدة واحدة

### المرحلة 1: البناء والتشغيل

#### FE-001 — اعمل baseline قابل للتكرار

**ليه؟** مفيش طريقة نعرف بيها إن الكود بيتبني فعلاً. `node_modules` مش موجود، ومفيش CI، و`npx tsc --noEmit` في الجذر بيفحص صفر ملفات لأن `tsconfig.json` فيه `"files": []`.

**فين؟** `package.json`، `tsconfig*.json`، `.github/workflows/` (جديد)، `README.md`.

**إزاي؟**
1. اعمل فرع: `chore/FE-001-verification-baseline`.
2. شغّل `npm ci` وسجّل نسخة Node/npm.
3. ضيف في `package.json`:
   - `"typecheck": "tsc -b"`
   - `"ci": "npm run typecheck && npm run lint && npm run build"`
4. شغّل `npx tsc -b` و`npm run lint` و`npm run build` وسجّل الـ exit code والوقت.
5. اعمل workflow فيه: checkout → setup-node → `npm ci` → typecheck → lint → build → upload `dist`.
6. ارفع اللوجات والـ artifact على التذكرة.

**تتأكد إزاي؟** PR فيه خطأ TypeScript متعمد يفشل عند خطوة typecheck. بناء ناجح يطلع artifact فيه commit SHA.

**ملاحظات:** لو المشروع مش على GitHub، استخدم نفس الخطوات على GitLab CI/Azure DevOps. متعملش bypass للـ CI.

---

#### FE-002 — صلّح TypeScript/ESLint وامسح الكود الميت

**ليه؟** strict TS مفعّل بس متشغّلش، وفي 14 ملف صفر بايت، وRoute بدون path، وتكرار `/admin/dashboard`.

**فين؟** `src/**/*.ts(x)`، `src/App.tsx`، `eslint.config.js`، `package.json`.

**إزاي؟**
1. شغّل `npx tsc -b` واكتب كل الأخطاء.
2. ابدأ بالإصلاح من النوع → الخدمة → الـ hook → المكوّن → الصفحة.
3. امسح الملفات الفاضية (zero-byte) بدل ما تسيبها.
4. امسح `ProjectDetail` المكرر والـ route الميت.
5. شيل الـ Route اللي بدون `path` وخلّي جدول المسارات نظيف.
6. ضيف `eslint-plugin-jsx-a11y` في الإعداد.

**تتأكد إزاي؟** `npm run typecheck` و`npm run lint` يخرجوا 0. البحث عن ملفات 0 بايت يرجع فاضي. كل مسار ظاهر مرة واحدة.

**ملاحظات:** متستخدمش `// @ts-ignore` عشان تسكت الخطأ. لو حاجة مش مستخدمة، امسحها.

---

#### FE-003 — شيل الـ console واللوجات الحساسة

**ليه؟** 127 استدعاء `console.*`، والـ API interceptor بيطبع الـ URL والـ params وأول 20 حرف من الـ auth header.

**فين؟** `src/services/api.ts`، `useLogin.ts`، `Websocketservice.ts`، `src/utils/jwt.ts`، `eslint.config.js`.

**إزاي؟**
1. اعمل logger صغير يشتغل في التطوير فقط.
2. امسح أو احمي كل `console.log/debug/info` خلف `import.meta.env.DEV`.
3. امسح طباعة الـ token/email/params نهائياً.
4. ضيف قاعدة `no-console` في ESLint.
5. سيب `console.error` الآمن فقط لو لازم.

**تتأكد إزاي؟** `grep` عن `console.` في `src` يرجع 0 خارج الـ logger. في production console مفيش token/email/URL params.

---

#### FE-012 — اعمل بيئة اختبار Vitest + RTL

**ليه؟** مفيش `test` script ولا runner ولا أي اختبار.

**فين؟** `package.json`، `vitest.config.ts` (جديد)، `src/test/setup.ts` (جديد)، `src/**/__tests__/*`، CI.

**إزاي؟**
1. ثبّت `vitest`، `jsdom`، `@testing-library/react`، `@testing-library/jest-dom`، `@testing-library/user-event`.
2. ضيف `"test": "vitest"` و`"test:coverage": "vitest run --coverage"`.
3. اعمل `setup.ts` فيه `jest-dom` وتنظيف بعد كل اختبار.
4. اعمل `renderWithProviders` فيه Router + QueryClient.
5. اكتب 10 اختبارات مفيدة: `ProtectedRoute` بدون auth، `ErrorState`، `EmptyState`، validation، JWT expiry، env validation.
6. ضيف الخطوة في CI.

**تتأكد إزاي؟** `npm test` بيشتغل ويخرج 0. اختبار فاشل عمداً بيفشل الـ CI. تقرير coverage موجود.

---

### المرحلة 2: الأمان والبيئة

#### FE-006 — وحّد إعدادات البيئة ورابط الـ API

**ليه؟** الرابط ثابت على localhost، وفيه اسمين متضاربين: `VITE_API_BASE_URL` و`VITE_BASE_URL`، ومفيش تحقق.

**فين؟** `.env.example` (جديد)، `src/config/env.ts` (جديد)، `src/services/api.ts`، `vite.config.ts`، أي ملف فيه `VITE_BASE_URL`.

**إزاي؟**
1. اعمل `.env.example`:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   VITE_ASSET_BASE_URL=http://localhost:8080
   ```
   (القيم دي للتطوير فقط، ومفيش أي سر فيها.)
2. اعمل `src/config/env.ts` يقرأ `import.meta.env.VITE_API_BASE_URL` ويرمي error واضح لو ناقص.
3. عدّل `api.ts` يستخدم `env.apiBaseUrl` بدل الثابت.
4. وحّد كل استخدامات `VITE_BASE_URL` على الاسم الجديد.
5. اعمل resolver موحّد لروابط الصور/الملفات.
6. وثّق قيم staging/production في التذكرة (من غير أسرار).

**تتأكد إزاي؟** بناء بدون المتغير المطلوب يفشل برسالة واضحة. Network tab على staging مفيش فيه غير host الـ API الصحيح.

---

#### FE-007 — شيل `fetch` المباشر ووحّد auth header

**ليه؟** 4 أماكن بتتجاوز الـ Axios، وبعضها بيبعت `Bearer` وبعضها token خام.

**فين؟** `StatusToggleModal.tsx`، `ProjectSubmissionsTable.tsx`، `MentorshipStudentsTable.tsx`، `Usechatbot.ts`، `index.html`.

**إزاي؟**
1. اسأل الـ Backend: الهيدر الصح `Authorization: Bearer <token>` ولا token خام؟ **متخمنش.**
2. استبدل كل `fetch` مباشر بالـ Axios client أو wrapper موحّد.
3. خلي الـ interceptor يضيف الهيدر مرة واحدة.
4. غيّر رابط الشات بوت لمتغير بيئة.
5. شيل ngrok prefetch من `index.html`.

**تتأكد إزاي؟** البحث عن `localhost` و`127.0.0.1` في `src` يرجع بس إعدادات التطوير الموثقة. كل request محمي فيه نفس الهيدر.

---

#### FE-008 — أمّن الجلسة والـ token

**ليه؟** الـ JWT في `localStorage` مرتين، مفيش فحص انتهاء، مفيش refresh، مفيش 401، و"Remember me" مش شغال صح.

**فين؟** `src/store/authStore.ts`، `src/services/api.ts`، `src/utils/jwt.ts`، `ProtectedRoute.tsx`.

**إزاي؟**
1. اكتب قرار قصير: التخزين المفضل access token في الذاكرة + refresh token في HttpOnly cookie. لو مش ممكن، استخدم `sessionStorage` للـ access token.
2. افحص `exp` عند الـ hydration واطرد المستخدم لو منتهي.
3. ضيف interceptor للـ 401: يمسح الجلسة مرة واحدة ويحوّل لـ `/login` مع رسالة آمنة.
4. صلّح "Remember me": لو مقفول، متخزنش الجلسة بعد إغلاق المتصفح.
5. `logout` يمسح مفاتيح المصادقة فقط، مش كل `localStorage`.

**تتأكد إزاي؟** اختبارات TC-AUTH-04…07: token منتهي → redirect مرة واحدة؛ remember-me off → مفيش استمرار؛ logout → مفيش رجوع بالـ Back.

---

#### FE-009 — نظّف حماية المسارات

**ليه؟** الحماية بتقرأ دور من `localStorage` قابل للتعديل، وفيه Route مكرر وRoute بدون path.

**فين؟** `src/App.tsx`، `src/routes/ProtectedRoute.tsx`، `src/store/authStore.ts`.

**إزاي؟**
1. اعمل جدول مسارات واحد: public / student / mentor / admin.
2. امسح الـ Route اللي بدون `path` والـ `/admin/dashboard` المكرر.
3. قرر `/explore-mentorships` تكون public ولا student، وطبّق القرار.
4. ضيف اختبارات لكل دور: student لا يدخل mentor، mentor لا يدخل admin، إلخ.
5. وثّق بوضوح: **الحماية في الفرونت للـ UX فقط، والـ Backend هو اللي يفرض الصلاحيات**.

**تتأكد إزاي؟** TC-ROLE-01…06. تعديل الدور في `localStorage` ميظهرش بيانات؛ API يرجّع 401/403.

---

#### FE-010 — اقفل ثغرات XSS

**ليه؟** `ChatbotWidget` بيعرض ردود البوت بـ `dangerouslySetInnerHTML`، و`FileViewer` بيحمّل سكريبت من unpkg.

**فين؟** `ChatbotWidget.tsx`، `FileViewer.tsx`، أي مكان فيه `dangerouslySetInnerHTML`.

**إزاي؟**
1. استخدم مكتبة sanitization موثوقة (مثلاً DOMPurify) أو اعرض النص كـ text.
2. اسمح بروابط `http/https` فقط، وامنع `javascript:`.
3. خلي عارض الملفات يستخدم مصدر موثوق/مثبت، وsandbox للـ iframe.
4. اربط الـ CSP في FE-019.

**تتأكد إزاي؟** إدخال `<img src=x onerror=alert(1)>` لا ينفذ سكريبت. رابط `javascript:` ممنوع. مفيش sink HTML غير آمن.

---

#### FE-011 — حماية الأسرار

**ليه؟** الشجرة الحالية نضيفة من الأسرار، بس تاريخ Git مااتفحصش، ومفيش أداة تمنع تسريب مستقبلي.

**فين؟** `.github/workflows/`، `.gitignore`، `.env.example`، `SECURITY.md` (اختياري).

**إزاي؟**
1. شغّل gitleaks أو trufflehog على الشجرة والتاريخ.
2. ضيف الفحص في CI.
3. وثّق: أي `VITE_*` بيظهر للمستخدم، ممنوع فيه أسرار.
4. لو لقيت سر، اعمله rotate فوراً.

**تتأكد إزاي؟** CI secret job أخضر. تقرير التاريخ نضيف أو فيه findings اتعالجت.

---

#### FE-025 — راجع ثغرات المكتبات

**ليه؟** `npm audit` مااتشغّلش، ومفيش Dependabot/Renovate.

**فين؟** `package.json`، `package-lock.json`، `.github/dependabot.yml`.

**إزاي؟**
1. شغّل `npm audit --production`.
2. رتّب النتائج: critical/high أولاً.
3. ارفع النسخة أو استخدم override أو استبدل المكتبة.
4. ضيف Dependabot أسبوعي.
5. أي خطر متقبل يتكتب باسم صاحبه وتاريخ انتهاء.

**تتأكد إزاي؟** 0 high/critical أو سجل accepted risk موقّع. `npm audit` بيشتغل في CI.

---

### المرحلة 3: الاختبارات

#### FE-013 — اختبارات مسار المصادقة

**فين؟** `e2e/auth/`، `playwright.config.ts`، اختبارات الوحدة في `src/**/__tests__/auth*`.

**إزاي؟**
1. جهّز Playwright وbaseURL للـ staging.
2. اكتب: login ناجح، بيانات غلط، remember-me on/off، token منتهي، 401، logout، deep link بعد login.
3. استخدم حسابات اختبار ثابتة (student/mentor/admin).
4. شغّلها في CI على staging.

**تتأكد إزاي؟** كل حالات TC-AUTH الحرجة تمر، ومع الفشل يطلع trace/video.

---

#### FE-014 — اختبارات الرحلات الحرجة والفشل

**فين؟** `e2e/**`، `fixtures/**`.

**إزاي؟**
1. سجّل طالب جديد + تحقق الإيميل + دخول.
2. Forgot/reset password.
3. تصفح mentorship + enroll.
4. منشئ mentorship: create → publish → يظهر للطالب.
5. أدمن: users + payment + filters + pagination.
6. حالات الفشل: 500، timeout، offline، empty state، فشل mutation.

**تتأكد إزاي؟** TC-JRN وTC-API وTC-FORM الحرجة تمر على staging. مفيش retry بيخفي flakiness.

---

#### FE-015 — Error boundaries وحالات الفشل

**فين؟** `src/components/errors/` (جديد)، `src/lib/queryClient.ts`، `src/App.tsx`.

**إزاي؟**
1. ضيف Error Boundary على مستوى المسار.
2. ضيف offline banner.
3. ميّز timeout (15 ثانية) عن 5xx.
4. ضيف زرار retry ورسالة آمنة.
5. راجع `mutations.retry` و`refetchOnReconnect`.
6. ضيف صفحة 404 برابط رجوع.

**تتأكد إزاي؟** خطأ render → شاشة استرجاع + تقرير للـ monitoring. timeout مختلف عن 5xx. مفيش retry لا نهائي.

---

### المرحلة 4: النشر والمراقبة

#### FE-019 — إعداد الاستضافة والـ SPA rewrite

**ليه؟** أي deep link على استضافة ثابتة هيرجع 404 من غير rewrite.

**فين؟** ملف الاستضافة (حسب المزود)، `vite.config.ts`، `index.html`، `public/robots.txt`، `public/sitemap.xml`.

**إزاي؟**
1. DevOps يختار المزود.
2. ضيف rewrite: `/* → /index.html` مع استثناء الأصول الثابتة.
3. `index.html`: `Cache-Control: no-cache`.
4. الأصول ذات الـ hash: `public, max-age=31536000, immutable`.
5. ضيف HSTS، `X-Content-Type-Options: nosniff`، `Referrer-Policy`، وframe protection.
6. لو النشر على subpath، اضبط `base` في Vite.
7. صلّح sitemap/favicon.

**تتأكد إزاي؟** 10 مسارات direct load + refresh ترجع 200. `curl -I` يوضح الهيدرز. مسار غير معروف يعرض 404 بتاع التطبيق.

---

#### FE-020 — staging + smoke pack

**فين؟** إعداد النشر، `docs/smoke.md`، `scripts/smoke.*`.

**إزاي؟**
1. جهّز متغيرات staging.
2. انشر من نفس commit المرشح.
3. جهّز حسابات اختبار وبيانات seed.
4. نفّذ smoke: `/`، `/login`، `/mentorships`، dashboard، deep link، API read، mutation آمنة، logout، headers.
5. سجّل النتائج.

**تتأكد إزاي؟** staging بيخدم نفس SHA. كل smoke الحرجة تمر. مفيش CORS/5xx.

---

#### FE-021 — Error tracking ومراقبة

**فين؟** `src/lib/monitoring.ts` (جديد)، `src/main.tsx`، `vite.config.ts`، `docs/monitoring.md`.

**إزاي؟**
1. اختار أداة معتمدة (Sentry مثلاً).
2. هيّئها بـ environment + release tag.
3. فعّل PII scrubbing.
4. ضيف Web Vitals (LCP/INP/CLS).
5. اعمل dashboard + alert thresholds + on-call owner.
6. ارفع source maps بطريقة آمنة.

**تتأكد إزاي؟** خطأ تجريبي يظهر في الـ dashboard بالـ release الصح. مفيش PII في الحدث.

---

#### FE-026 — go/no-go وrollback

**فين؟** `documentaion/frontend-production-readiness/frontend-release-approval.md`، `docs/runbook.md`.

**إزاي؟**
1. املا checklist القبول بالدليل.
2. اكتب rollback: triggers، خطوات، RTO، مالك.
3. اتمرّن على rollback في staging.
4. اعمل go/no-go meeting.
5. بعد النشر: smoke + مراقبة 24 ساعة.

**تتأكد إزاي؟** قرار موقّع. rollback رجع النسخة السابقة في الوقت المتفق عليه. smoke الإنتاج نجح.

---

## 6. المهام المؤجلة أو اللي محتاجة waiver

| المهمة | نوعها | متى تتأجل؟ |
|---|---|---|
| FE-004 — TODO/FIXME وكود ميت | تحسين | لو مفيش Route ميت ظاهر للمستخدم |
| FE-005 — تنظيف المكتبات | تحسين | لو مفيش مكتبة غير مستخدمة فيها CVE حرج |
| FE-016 — ميزانية الحزمة | تحسين | لو فيه سقف متفق عليه ومراقبة |
| FE-022 — إصلاح accessibility الكامل | تحسين | لو axe critical = 0 ولو فيه خطة مؤرخة |
| FE-017 — تحسين الرندر/القوائم | P2 | بعد النشر لو 1000 صف سريع |
| FE-018 — تحسين الصور | P2 | بعد النشر لو مفيش CLS |
| FE-023 — مصفوفة المتصفحات | P2 | بعد smoke على Chrome + Safari |
| FE-024 — اللغة/التوقيت | P3 | قرار منتج |

> **ممنوع تأجيل:** FE-001, 002, 003, 006, 007, 008, 009, 010, 011, 012, 013, 014, 015, 019, 020, 021, 025, 026.

---

## 7. الأوامر اللي هتشتغل بيها

| الأمر | بيعمل إيه | الناتج المتوقع | ملاحظة |
|---|---|---|---|
| `npm ci` | تثبيت نظيف من lockfile | `node_modules` | لازم يكون فيه `package-lock.json` ونت |
| `npx tsc -b` | فحص TypeScript الصحيح | exit 0 | `npx tsc --noEmit` في الجذر بيفحص 0 ملفات |
| `npm run lint` | ESLint | exit 0 | بعد إصلاح FE-002 |
| `npm run build` | build إنتاج | `dist/` | بيعمل `tsc -b` قبل Vite |
| `npm run preview` | معاينة `dist` | سيرفر محلي | مش بديل عن staging |
| `npm test` | Vitest | تقرير اختبارات | بعد FE-012 |
| `npm run test:coverage` | تغطية | تقرير coverage | بعد FE-012 |
| `npm audit --production` | فحص الثغرات | تقرير | بعد FE-001 |
| `npx playwright test` | E2E | تقرير | بعد FE-013 |

**أول تشغيل (بالترتيب):**

```bash
npm ci
npx tsc -b
npm run lint
npm run build
```

لو `npm ci` فشل، متكملش. سجّل الخطأ (نسخة Node، الشبكة، الرسالة) وارفعه على FE-001.

**أوامر بحث مفيدة:**

```bash
# كل localhost / 127.0.0.1
grep -rn "localhost\|127\.0\.0\.1" src index.html

# كل console
grep -rn "console\." src

# كل fetch مباشر
grep -rn "fetch(" src

# كل dangerouslySetInnerHTML
grep -rn "dangerouslySetInnerHTML" src

# ملفات صفر بايت
find src -type f -size 0
```

> على Windows PowerShell استخدم `Select-String` أو Git Bash. الأوامر فوق مكتوبة لـ bash.

---

## 8. إزاي تعرف إن المهمة خلصت؟ (Evidence)

المهمة مش "خلصت" لأن الكود اتكتب. لازم دليل مرفق:

| الدليل | فين تحطه |
|---|---|
| رابط PR | التذكرة + وصف الـ PR |
| رابط CI run | التذكرة |
| لوج typecheck/lint/build | مرفق أو رابط |
| تقرير اختبارات + coverage | CI artifact |
| Screenshot/Recording للتغييرات UI | الـ PR |
| `curl -I` للهيدرز | تذكرة FE-019 |
| تقرير Lighthouse/axe | تذكرة FE-016/FE-022 |
| تأكيد Backend للـ RBAC/CORS | تذكرة FE-009/FE-019 |
| قرار go/no-go | `frontend-release-approval.md` |

**Definition of Done لأي مهمة:**
- [ ] الـ Acceptance Criteria متحققة بدليل.
- [ ] الكود اترفع على `master` بعد review.
- [ ] اختبارات جديدة/محدثة وبتعدي في CI.
- [ ] QA سجّل النتيجة (أو استثناء واضح).
- [ ] التوثيق/الـ runbook اتحدث.
- [ ] مفيش P0/P1 جديد من غير تذكرة.
- [ ] rollback موثق لو التغيير بيأثر على الإنتاج.

---

## 9. اللي مش شغلك: Backend وDevOps

دي حاجات **مينفعش** الفرونت يقفلها لوحده. لازم تطلبها وتوثق الرد:

| # | المطلوب | من مين | بيأثر على |
|---|---|---|---|
| 1 | شكل auth header (`Bearer` ولا raw) | Backend | FE-007, FE-008 |
| 2 | عقد refresh/expiry/401 | Backend | FE-008 |
| 3 | مصفوفة RBAC واختبارات 401/403 | Backend + Security | FE-009, go/no-go |
| 4 | CORS allowlist لـ staging/production | Backend/DevOps | FE-019, FE-020 |
| 5 | اختيار الاستضافة وآلية النشر | DevOps | FE-019, FE-020 |
| 6 | الدومين + DNS + TLS | DevOps | FE-019 |
| 7 | بيئة staging + حقن المتغيرات | DevOps | FE-020 |
| 8 | حساب error tracking + DSN + سياسة PII | DevOps/Security | FE-021 |
| 9 | حسابات اختبار وبيانات seed | Backend/QA | FE-014 |
| 10 | رابط الشات بوت في الإنتاج + rate limits | Backend/Platform | FE-007, FE-010 |
| 11 | sandbox الدفع | Backend | رحلة enrollment |
| 12 | جهاز/متصفح Safari | DevOps | FE-023 |
| 13 | صلاحية الوصول لتاريخ Git | Repo admin | FE-011 |
| 14 | حساب smoke في الإنتاج | PO/Backend | FE-020 |

**قاعدة:** لو طلب خارجي اتأخر أكتر من يومين، اكتب في تذكرة: الطلب بالظبط، تأثيره، وتاريخ الحاجة. المهمة تفضل blocked، ومتعلنهاش Done بمock محلي.

---

## 10. خطة 8 أسابيع مبسطة

| الأسبوع | مطور 1 | مطور 2 | QA / DevOps |
|---|---|---|---|
| 1 | FE-001 + CI | تصميم FE-006 + طلبات Backend/الاستضافة | مراجعة مصفوفة الاختبار + branch protection |
| 2 | FE-002 | FE-003 + FE-006A/B | تجهيز FE-012 |
| 3 | FE-006C + FE-007 | FE-008 | اختبارات FE-012B + تأكيد العقد |
| 4 | FE-008 | FE-009 + FE-010 | FE-013 |
| 5 | FE-011 + FE-025 | FE-015 + FE-019 | FE-014 + staging |
| 6 | FE-020 + smoke | FE-021 + FE-022 | regression + a11y |
| 7 | FE-022 + FE-016 | إصلاحات + defect burn-down | أداء + متصفحات + evidence |
| 8 | إصلاحات + FE-026 | إصلاحات + release candidate | go/no-go + إنتاج |

---

## 11. أول 5 خطوات تعملها النهاردة

1. **اعمل فرع:** `chore/FE-001-verification-baseline`.
2. **اتأكد من Node/npm:** `node -v` و`npm -v` (المشروع اتفحص على Node 24 / npm 11).
3. **ثبّت:** `npm ci` — لو فشل، سجّل الرسالة.
4. **افحص:** `npx tsc -b` ثم `npm run lint` ثم `npm run build` — سجّل exit code والوقت.
5. **افتح تذكرة FE-001** وارفع اللوجات + نسخة Node + أي أخطاء.
6. بعد كده: ابدأ FE-002 (إصلاح الأخطاء) بالتوازي مع تجهيز `.env.example` (FE-006A).
7. اطلب من الـ Backend **فوراً**: شكل الهيدر، refresh/401، RBAC، CORS.
8. اطلب من DevOps **فوراً**: قرار الاستضافة + staging + الدومين.

---

## 12. مصطلحات سريعة

| المصطلح | معناه |
|---|---|
| **P0** | مانع نشر؛ مينفعش تنشر من غيره |
| **P1** | مهم جداً؛ يتأجل بس بـ waiver موقّع |
| **P2/P3** | تحسينات مؤجلة |
| **Tier 1** | الـ 18 مهمة الإجبارية |
| **Staging** | بيئة اختبار شبه الإنتاج |
| **SPA rewrite** | تحويل أي مسار لـ `index.html` عشان refresh يشتغل |
| **CORS** | سماح الـ Backend لدومين الفرونت |
| **RBAC** | صلاحيات حسب الدور |
| **JWT** | token الدخول |
| **401/403** | غير مصادق / غير مصرح |
| **CI** | فحص تلقائي على كل PR |
| **Smoke test** | اختبار سريع بعد النشر |
| **Rollback** | الرجوع لنسخة سابقة |
| **RTO** | أقصى وقت مقبول للرجوع |
| **LCP/CLS/INP** | مقاييس أداء المتصفح |
| **axe** | أداة فحص accessibility |
| **Lighthouse** | أداة أداء/جودة |
| **Waiver** | استثناء موثق بمخاطرة مقبولة |

---

## 13. تحذيرات مهمة

- **متخزنش أسرار في `VITE_*`:** أي قيمة `VITE_*` بتظهر في المتصفح.
- **متستخدمش `localhost` في كود الإنتاج:** استخدم env.
- **متعملش `git commit` لـ `.env`:** تأكد إنه في `.gitignore`.
- **متعملش bypass لفحص الأمان أو الـ auth.**
- **متعلنش مهمة Done من غير دليل:** الـ CI الأخضر أو تقرير الاختبار هو الدليل.
- **متعدلش الدور في الفرونت وتعتبره حماية:** الحماية الحقيقية في الـ Backend.
- **متبدأش FE-019 قبل قرار الاستضافة:** كل مزود له إعداد مختلف.
- **متعملش rollback للفرونت لو الـ Backend اتغير:** ممكن تكسر العقد؛ نسّق مع الـ Backend.
- **المشروع حالياً NO-GO:** أي نشر قبل الـ 18 مهمة هو مخاطرة غير مقبولة.

---

## 14. الملفات التفصيلية (لو حبيت تغوص أكتر)

كلها في `documentaion/frontend-production-readiness/`:

| الملف | فيه إيه |
|---|---|
| `frontend-release-summary.md` | الملخص والقرار |
| `frontend-repository-audit.md` | الأدلة والملاحظات F-01…F-28 |
| `frontend-checklist-traceability.md` | الـ 59 بند وحالتهم |
| `frontend-epics-and-tasks.md` | الـ 7 Epics والـ 26 مهمة بالتفصيل |
| `frontend-qa-test-matrix.md` | 53 حالة اختبار |
| `frontend-roles-and-workflow.md` | الأدوار ومراحل التسليم |
| `frontend-priorities-and-dependencies.md` | الأولويات والمسار الحرج |
| `frontend-release-approval.md` | checklist القبول وrollback |
| `jira-import.csv` | 38 صف للاستيراد |
| `jira-import-notes.md` | خطوات الاستيراد |
