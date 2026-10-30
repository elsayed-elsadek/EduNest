# EduNest Frontend — الخطة الرسمية لجاهزية النشر (نسخة عربية)

| البند | القيمة |
|---|---|
| تاريخ التدقيق والتخطيط | 2026-10-30 |
| المستودع | `C:\Users\shahd\OneDrive\Desktop\EDUNEST\EduNest` |
| جذر الفرونت | جذر المستودع — تطبيق واحد، لا يوجد monorepo |
| التطبيق | EduNest (اسم الحزمة `mentors-app`، الإصدار `0.0.0`) |
| التقنيات | React 19.1.1 · TypeScript 5.9.3 · Vite 8 · TailwindCSS 3.3.3 · React Router 7.9.4 · Zustand 5 · TanStack Query 5 · Axios |
| مدير الحزم | npm — ملف `package-lock.json` واحد (lockfile v3) |
| الفرع المفحوص | `master` @ `7f887ee` |
| نوع العمل | تدقيق للقراءة فقط + تخطيط. لم يتم تغيير كود، ولا تثبيت حزم، ولا إنشاء فرع/commit، ولا Jira، ولا نشر. |
| قرار الإصدار | **NOT READY — NO-GO (غير جاهز للنشر)** |

> هذا الملف هو النسخة العربية من الخطة الرسمية: نفس المعرّفات، نفس الحالات، نفس الأدلة، نفس معايير القبول. الملفات الإنجليزية هي المصدر الرسمي عند أي تعارض. لم يُنفَّذ أي كود أو اختبار أثناء التخطيط.

---

## فهرس المحتويات

| # | القسم | ماذا تجد فيه |
|---:|---|---|
| 1 | [الملخص التنفيذي](#1-الملخص-التنفيذي) | القرار، سبب الحجب، المسار الأسرع للخروج |
| 2 | [بطاقة الجاهزية](#2-بطاقة-الجاهزية) | توزيع 59 بنداً + نقاط القوة المؤكدة |
| 3 | [الأدلة F-01…F-28](#3-الأدلة-سجل-الملاحظات-f-01--f-28) | كل ملاحظة بخطورتها ودليلها وثقتها |
| 4 | [تتبّع الـ59 بنداً](#4-تتبّع-الـ59-بنداً) | حالة كل بند + الفجوة + المهمة + الحاجب |
| 5 | [الـEpics والمهام](#5-الـepics-والمهام-الرسمية) | 7 Epics، 26 مهمة، 5 فرعية، AC/DoD |
| 6 | [مصفوفة اختبار QA](#6-مصفوفة-اختبار-qa--53-حالة) | 53 حالة، بيئات، fixtures |
| 7 | [الأدوار وسير العمل](#7-الأدوار-ومسؤوليات-التسليم) | RACI، البوابات، DoR/DoD، CI |
| 8 | [الأولويات والتبعيات](#8-الأولويات-والتبعيات-والتسلسل) | المسار الحرج، المعالم، 14 تبعية، 14 خطراً |
| 9 | [اعتماد الإصدار](#9-اعتماد-الإصدار--64-بند-تحكم) | 64 بند تحكم، 10 توقفات صلبة، توقيع |
| 10 | [Runbook الاستعادة](#10-runbook-الاستعادة-rollback) | محفّزات، خطوات، RTO، تحذيرات |
| 11 | [التحقق بعد النشر](#11-التحقق-بعد-النشر) | smoke 12 فحصاً + جدول مراقبة + حدود |
| 12 | [الاعتماد المشروط](#12-الاعتماد-المشروط) | المسموح/غير المسموح + سجل waivers |
| 13 | [الأدلة الناقصة](#13-الأدلة-الناقصة-حالياً-12) | 12 دليلاً ناقصاً وكيف يُغلق |
| 14 | [حدود الخطة](#14-حدود-هذه-الخطة) | ما لا تثبته هذه الخطة |
| 15 | [فهرس الملفات](#15-فهرس-الملفات) | كل ملف ومحتواه وجمهوره |
| 16 | [ملاحظة ختامية](#16-ملاحظة-ختامية) | القاعدة النهائية |

**كيف تقرأ هذا الملف حسب دورك:**

- **Product Owner / Release Approver:** الأقسام 1، 2، 8، 9، 12، 16.
- **Tech Lead:** 3، 4، 5، 7، 8، 9.
- **Frontend Developer:** 3، 4، 5 (تفاصيل المهام والملفات)، 14.
- **QA:** 6، 9 (T-01…T-09)، 11.
- **DevOps:** 9 (D-01…D-10، M-01…M-08)، 10، 11.

---

## 1. الملخص التنفيذي

EduNest تطبيق React 19 بصفحة واحدة، بأربع مناطق: التسويق العام والمصادقة، مساحة الطالب، مساحة المرشد، ولوحة الإدارة. مبني على Vite مع `React.lazy` على مستوى المسارات، وTanStack Query لحالة السيرفر، وZustand للمصادقة، وواجهة خلفية Spring Boot عبر Axios.

المشكلة ليست نقص الميزات. المشكلة أن الفرونت **غني بالميزات لكنه غير قابل للتحقق منه ولا للنشر**:

- 511 ملف TypeScript/TSX، و139 مكوّن صفحة، و179 مكوّن مشترك/ميزة.
- **صفر اختبارات آلية، صفر CI، صفر إعداد نشر، ولا عقد لملفات البيئة.**
- رابط API الإنتاجي مثبّت داخل الكود على `http://localhost:8080`، فأي بناء اليوم سيكون غير عامل على أي استضافة.

من بين 59 بنداً في قائمة التحقق: **0 ناجح، 12 جزئي، 26 فاشل، 21 غير قابل للتحقق** لأن الاعتماديات غير مثبتة والتطبيق لم يُبنَ في مساحة العمل هذه.

**الاستنتاج:** الإصدار محجوب بعدد صغير من الفجوات الهندسية عالية التأثير، وليس بميزات ناقصة. أسرع مسار موثوق لقرار go/no-go:

1. استعادة بيئة بناء قابلة للتكرار وتشغيل typecheck وlint وbuild وaudit (`FE-001`).
2. إصلاح عقد البيئة ورابط API وإزالة كل اعتماد على `localhost` (`FE-006`، `FE-007`).
3. إضافة حد أدنى من شبكة الأمان الآلية: test harness + E2E لمسار المصادقة (`FE-012`، `FE-013`).
4. تحصين الجلسة/التوكن وحماية المسارات (`FE-008`، `FE-009`).
5. تحديد الاستضافة وSPA rewrite وcache headers وstaging وrollback (`FE-019`، `FE-020`، `FE-026`).

هذه المسارات الخمسة قابلة للتوازي بين 2–3 مطورين فرونت + مهندس QA + مهندس DevOps/Release.

---

## 2. بطاقة الجاهزية

| الحالة | العدد | المعنى |
|---|---:|---|
| PASS | 0 | مطابق ومُثبت بدليل |
| PARTIAL | 12 | يوجد تنفيذ جزئي، لكن الفجوة باقية |
| FAIL | 26 | الشرط غير متحقق، أو هناك دليل مؤكد يخالفه |
| NOT VERIFIED | 21 | لا يمكن إثباته في هذا التدقيق (لا تثبيت/بناء، أو مالك خارجي، أو بيئة غير متاحة) |
| NOT APPLICABLE | 0 | — |
| **الإجمالي** | **59** | كل بنود القائمة مربوطة بمهام |

### التوزيع حسب أقسام القائمة

| القسم | البنود | PASS | PARTIAL | FAIL | NOT VERIFIED |
|---|---:|---:|---:|---:|---:|
| 1. جودة الكود والبناء | 6 | 0 | 0 | 3 | 3 |
| 2. الأمان | 7 | 0 | 3 | 2 | 2 |
| 3. الاختبارات والجودة | 7 | 0 | 2 | 5 | 0 |
| 4. الأداء | 7 | 0 | 5 | 0 | 2 |
| 5. إعداد الإنتاج والنشر | 8 | 0 | 0 | 4 | 4 |
| 6. الواجهة/التجربة/المتصفحات | 7 | 0 | 2 | 2 | 3 |
| 7. المراقبة والاستعادة | 6 | 0 | 0 | 4 | 2 |
| 8. أوامر ما قبل النشر | 5 | 0 | 0 | 1 | 4 |
| 9. اعتماد الإصدار | 6 | 0 | 0 | 5 | 1 |

### ما هو جيد فعلاً (نقاط قوة مؤكدة)

- **تقسيم الكود على مستوى المسار** منفّذ فعلاً بـ `React.lazy` + `Suspense` لمعظم الصفحات (`src/App.tsx:19-80`).
- **تقسيم vendor وتسمية الأصول بالـ hash** مُعدّ لـ long-term caching (`vite.config.ts:45-90`).
- **تحسين الصور وقت البناء** عبر `vite-plugin-image-optimizer` (`vite.config.ts:13-25`).
- **نسخة Axios مشتركة** بمهلة 15 ثانية وinterceptors مركزية (`src/services/api.ts`).
- **إعدادات React Query مدروسة**: `staleTime`، `gcTime`، retry أسّي، بلا refetch-on-focus (`src/lib/queryClient.ts`).
- **توجيه واعٍ بالأدوار** مع بوابة hydration قبل التحويل (`src/routes/ProtectedRoute.tsx`).
- **مكوّنات حالة قابلة لإعادة الاستخدام**: `ErrorState`، `EmptyState`، `LoadingSpinner`، `OptimizedImage`، `Pagination`.
- **focus-visible عام** (`src/index.css:101-103`).
- **لا أسرار حيّة** في شجرة العمل أثناء الفحص الموجّه.

هذه أساسات نبني عليها، وليست دليلاً على الجاهزية.

---

## 3. الأدلة: سجل الملاحظات F-01 … F-28

مفتاح الثقة: **Verified** = دليل ملف مباشر · **Inferred** = إشارة قوية من الكود لكن لم تُنفَّذ · **Unknown** = لا دليل.

| ID | الخطورة | الملاحظة | الدليل | الثقة |
|---|---|---|---|---|
| F-01 | P0 | رابط API الإنتاجي مثبّت على `http://localhost:8080` | `src/services/api.ts:4` | Verified |
| F-02 | P0 | لا عقد بيئة؛ اسمان متضاربان؛ العميل يتجاهل env | لا `.env*`؛ `VITE_API_BASE_URL` ×17 و`VITE_BASE_URL` ×5؛ `api.ts:4` | Verified |
| F-03 | P0 | استدعاءات `fetch` مباشرة تستخدم localhost و/أو بلا auth | `StatusToggleModal.tsx:32`، `ProjectSubmissionsTable.tsx:32`، `Usechatbot.ts:5`، `MentorshipStudentsTable.tsx:40` | Verified |
| F-04 | P0 | عقد هيدر Authorization غير متسق (token خام مقابل `Bearer`) | `api.ts:59`، `Websocketservice.ts:36`، `MentorshipStudentsTable.tsx:40` | Verified |
| F-05 | P0 | صفر اختبارات آلية؛ لا runner ولا script | `package.json`، فحص lockfile | Verified |
| F-06 | P0 | لا CI ولا إعداد نشر؛ لا SPA rewrite | غياب `.github/` وملفات الاستضافة | Verified |
| F-07 | P0 | typecheck/lint/build لم تُثبت أبداً؛ `node_modules` غائب | `Test-Path node_modules` = False | Verified |
| F-08 | P1 | JWT/الدور في `localStorage`؛ لا انتهاء/refresh/401؛ remember-me يكتب التوكن دائماً | `authStore.ts:33-123` | Verified |
| F-09 | P1 | حماية بالدور من العميل فقط؛ مسارات مكررة/معلّقة | `ProtectedRoute.tsx`، `App.tsx:186,235` | Verified |
| F-10 | P1 | XSS عبر مخرجات الشات بوت غير المهرّبة في `dangerouslySetInnerHTML` | `ChatbotWidget.tsx:146,173` | Verified |
| F-11 | P1 | تحميل سكريبت CDN وقت التشغيل + حقن HTML في عارض الملفات | `FileViewer.tsx:128,227` | Verified |
| F-12 | P1 | 127 استدعاء `console`؛ تسجيل هيدر auth بلا حماية | عدّ grep؛ `api.ts:41-47` | Verified |
| F-13 | P1 | 14 موديول صفر بايت وصفحات مكررة/يتيمة | فحص الملفات | Verified |
| F-14 | P1 | 9 مكتبات غير مستخدمة تزيد التثبيت وسطح الهجوم | مقارنة الاستيرادات بالـ manifest | Verified |
| F-15 | P1 | لا Error Boundary → شاشة بيضاء عند خطأ render | لا boundary في `src` | Verified |
| F-16 | P1 | لا تتبّع أخطاء/مراقبة؛ sourcemaps معطلة | لا Sentry/analytics؛ `vite.config.ts:40` | Verified |
| F-17 | P1 | فجوات accessibility في المودالات والنماذج | 0/32 dialog، 4/143 `htmlFor`، 59/556 aria | Verified |
| F-18 | P1 | retry عام للـ mutations قد يكرر عمليات غير idempotent | `lib/queryClient.ts:33-36` | Verified |
| F-19 | P2 | استيرادات eager + شات بوت عالمي يضعفان code splitting | `App.tsx:10-14,239` | Verified (الحجم Unknown) |
| F-20 | P2 | تحسين صور جزئي؛ صور بعيدة؛ تبنّي srcset جزئي | 87 `<img>`، `OptimizedImage` جزئي | Verified |
| F-21 | P2 | محتوى تجريبي/demo على صفحات الإنتاج | `StudentDashboard.tsx:17-33`، `utils/constants.ts:100+` | Verified |
| F-22 | P2 | `window.open` بدون `noopener` في 4 مواضع | grep | Verified |
| F-23 | P2 | التوثيق يخالف الكود (Jitsi، robots، proxy، aria) | `documentaion/DOCUMENTATION.md` | Verified |
| F-24 | P2 | دعم المتصفحات غير محدد؛ `target: 'esnext'` | `vite.config.ts:42` | Verified |
| F-25 | P2 | تواريخ `en-US` ثابتة وواجهة مختلطة مع `lang="en"` | `useMentorships.ts:48`، `Usehomepage.ts`، `index.html:2` | Verified |
| F-26 | P3 | sitemap ناقص، favicon افتراضي، metadata قديمة | `public/robots.txt:12`، `index.html:6`، `package.json:2-17` | Verified |
| F-27 | P2 | الشات بوت يشير إلى `127.0.0.1:8000` بلا env | `Usechatbot.ts:5` | Verified |
| F-28 | P1 | لا فحص أسرار/حواجز؛ بقايا نفق تطوير | `api.ts:14`، `index.html:30` | Verified |

---

## 4. تتبّع الـ59 بنداً

مفتاح الحالة: **PASS** مطابق بدليل · **PARTIAL** جزئي · **FAIL** فاشل · **NV** غير قابل للتحقق · **N/A** لا ينطبق.
مفتاح الحاجب: **YES** حاجب إصدار P0 · **NO** مطلوب لكن ليس حاجباً صلباً · **EXT** مالك خارجي.

### 4.1 جودة الكود والبناء

| ID | البند | الحالة | الدليل/الفجوة | المهمة | الحاجب |
|---|---|---|---|---|---|
| CQ-01 | فحص TypeScript والتأكد من خلوه من الأخطاء | NV | `strict` و`noUnusedLocals` مفعّلان، لكن `node_modules` غائب و`tsc` لم يُشغَّل. `tsconfig.json` فيه `"files": []` فـ`npx tsc --noEmit` يفحص صفر ملفات؛ الصحيح `tsc -b`. | FE-001, FE-002 | YES |
| CQ-02 | تشغيل ESLint ومعالجة الأخطاء المهمة | NV | ESLint 9 flat config لـ TS/TSX فقط؛ لا `jsx-a11y` ولا import rules؛ لم يُشغَّل. | FE-001, FE-002, FE-022 | YES |
| CQ-03 | نجاح بناء Production | NV | `build = tsc -b && vite build`؛ لا `dist/` ولا log ولا CI. | FE-001, FE-002 | YES |
| CQ-04 | إزالة الأكواد التجريبية و`console.log` غير الضرورية | FAIL | 127 استدعاء `console.*`؛ `api.ts:41-47` يطبع URL وparams وأول 20 حرفاً من auth header بلا حماية. | FE-003 | YES |
| CQ-05 | مراجعة TODO/FIXME والأجزاء غير المكتملة | FAIL | `TODO.md` فيه بندان؛ 8 علامات TODO/FIXME/HACK؛ 14 موديول صفر بايت؛ `ProjectDetail` مكرر؛ مسار "Coming Soon". | FE-004 | NO |
| CQ-06 | مراجعة Dependencies وإزالة غير المستخدم | FAIL | 9 حزم بصفر استيراد: `@jitsi/react-sdk`، `aos`، `html2pdf`، `react-is`، `react-player`، `sweetalert2`، `sweetalert2-react-content`، `zod`، `@tanstack/react-query-devtools`. `@types/react-router-dom` v5 مع router v7. | FE-005 | NO |

### 4.2 الأمان

| ID | البند | الحالة | الدليل/الفجوة | المهمة | الحاجب |
|---|---|---|---|---|---|
| SEC-01 | خلو الكود وGit من المفاتيح/الأسرار | PARTIAL | فحص موجّه لم يجد أسراراً حيّة. تاريخ Git لم يُفحص؛ لا أداة فحص. `.gitignore` يتجاهل `.env`/`*.local`. | FE-011 | YES |
| SEC-02 | مراجعة Environment Variables وعدم وضع أسرار في `VITE_*` | PARTIAL | لا ملفات env، فلا أسرار `VITE_*` ملتزمة. لكن لا `.env.example` ولا تحقق، واسمان متضاربان، و`api.ts` يتجاهل env. | FE-006, FE-011 | YES |
| SEC-03 | التحقق من Authorization/Permissions على الـBackend | NV | الفرونت لا يستطيع إثبات تفويض السيرفر. حماية العميل تقرأ دوراً محفوظاً فقط. | FE-009 (طلب تحقق) | EXT |
| SEC-04 | حماية Admin Pages والـProtected Routes | PARTIAL | الحماية موجودة وتفحص hydration والدور، لكن الدور من `localStorage` قابل للتعديل؛ مسار حارس بلا path؛ `/admin/dashboard` مكرر؛ `/explore-mentorships` خلف حارس الطالب. | FE-009 | YES |
| SEC-05 | مراجعة تخزين Access Tokens وبيانات الدخول | FAIL | JWT في `localStorage["auth-storage"]` و`localStorage["token"]`؛ لا فحص `exp`، لا refresh، لا 401؛ التوكن يُكتب حتى مع إلغاء remember-me؛ logout يمسح كل localStorage. | FE-008 | YES |
| SEC-06 | عدم ظهور بيانات حساسة في Logs/الأخطاء | FAIL | تسجيل auth header/URL/params بلا حماية؛ تسجيل email ودور التحويل؛ رسائل backend الخام تظهر في toasts. | FE-003, FE-008 | YES |
| SEC-07 | فحص ثغرات Dependencies بـ`npm audit` | NV | لا يمكن تشغيل audit بلا تثبيت؛ لا تقرير؛ لا Dependabot/Renovate. | FE-025 | YES |

### 4.3 الاختبارات والجودة

| ID | البند | الحالة | الدليل/الفجوة | المهمة | الحاجب |
|---|---|---|---|---|---|
| QA-01 | تشغيل اختبارات Unit وIntegration | FAIL | صفر `*.test.*`/`*.spec.*`؛ لا Vitest/Jest/RTL؛ لا `test` script. | FE-012 | YES |
| QA-02 | اختبار Login/Logout/Registration/Password Recovery | FAIL | لا تغطية آلية؛ منطق تحقق يدوي فقط؛ لا دليل يدوي موثق. | FE-013 | YES |
| QA-03 | اختبار أهم مسارات المستخدم E2E | FAIL | لا E2E framework ولا journey tests. | FE-014 | YES |
| QA-04 | اختبار حالات Loading/Empty/Error | PARTIAL | مكوّنات موجودة وExplore Mentorships يعالج الحالات، لكن التغطية غير متسقة على 139 صفحة؛ لا اختبارات ولا دليل بصري. | FE-014, FE-015 | NO |
| QA-05 | اختبار النماذج والتحقق ورسائل الخطأ | PARTIAL | تحقق regex/length يدوي؛ `zod` مثبت وغير مستخدم؛ لا ربط أخطاء الحقول من السيرفر؛ labels غير مرتبطة برمجياً. | FE-013, FE-022 | NO |
| QA-06 | اختبار صلاحيات المستخدمين والأدوار | FAIL | لا اختبارات أدوار؛ حماية العميل فقط؛ الدور محفوظ في localStorage. | FE-009, FE-014 | YES |
| QA-07 | اختبار فشل API/انقطاع الاتصال/المهلة | FAIL | Axios مهلة 15s، لكن `fetch` المباشر بلا مهلة؛ لا offline UI ولا 401 عام؛ `refetchOnReconnect: false`. | FE-014, FE-015 | NO |

### 4.4 الأداء

| ID | البند | الحالة | الدليل/الفجوة | المهمة | الحاجب |
|---|---|---|---|---|---|
| PERF-01 | مراجعة أحجام ملفات JS الناتجة | NV | لا build ولا تقرير حزم؛ `chunkSizeWarningLimit: 500` تحذير فقط. | FE-016 | YES |
| PERF-02 | Lazy Loading للصفحات والمكونات | PARTIAL | معظم المسارات lazy، لكن `AdminDashboard`، `AdminPayment`، `MentorshipOverviewPage`، `AdminUsers`، `ChatbotWidget` eager؛ الشات عالمي. | FE-016 | NO |
| PERF-03 | مراجعة إعادة التصيير غير الضرورية | PARTIAL | 116 `useEffect` و105 memoization؛ لا profiling؛ contexts عالمية (Theme/WebSocket/Notifications). | FE-017 | NO |
| PERF-04 | تحسين أحجام/صيغ الصور | PARTIAL | optimizer وقت البناء مفعّل، لكن صور Unsplash/pravatar بعيدة تتجاوزه؛ srcset جزئي؛ أبعاد غير متسقة. | FE-018 | NO |
| PERF-05 | تفعيل Code Splitting عند الحاجة | PARTIAL | `manualChunks` موجود، لكن `vendor-jitsi`/`vendor-alerts` لحزم غير مستخدمة؛ eager imports تضعفه. | FE-016 | NO |
| PERF-06 | Pagination/Virtualization للقوائم الكبيرة | PARTIAL | Pagination موجودة ومستخدمة، لكن بلا virtualization؛ بعض القوائم ترندر المصفوفة كاملة؛ 4 نسخ pagination. | FE-017 | NO |
| PERF-07 | اختبار الأداء على الموبايل والشبكات البطيئة | NV | لا Lighthouse/WebPageTest؛ لا دليل جهاز أو throttling. | FE-016, FE-023 | YES |

### 4.5 إعداد الإنتاج والنشر

| ID | البند | الحالة | الدليل/الفجوة | المهمة | الحاجب |
|---|---|---|---|---|---|
| DEP-01 | إعداد متغيرات بيئة Production | FAIL | لا تعريفات بيئة؛ اسمان؛ لا تحقق؛ fallback صامت إلى localhost. | FE-006 | YES |
| DEP-02 | عنوان API الصحيح لبيئة Production | FAIL | `API_BASE_URL = 'http://localhost:8080'` مثبّت. | FE-006 | YES |
| DEP-03 | خلو المشروع من الاعتماد على localhost | FAIL | `localhost:8080` في API والشات والدفع والتسليمات والصور؛ `127.0.0.1:8000` في الشات؛ ngrok prefetch في HTML. | FE-007, FE-006 | YES |
| DEP-04 | إعداد CORS على الـBackend | NV | لا إعداد backend في المستودع؛ dev proxy موجود؛ أصل الإنتاج غير معروف. | طلب تحقق ضمن FE-019 | EXT |
| DEP-05 | تفعيل HTTPS وصلاحية الشهادة | NV | لا إعداد استضافة/TLS؛ الدومين غير معروف. | FE-019 (DevOps) | EXT |
| DEP-06 | مراجعة Cache Headers للملفات الثابتة | NV | أسماء hash موجودة، لكن لا سياسة cache لـ`index.html` مقابل الأصول. | FE-019 | EXT |
| DEP-07 | إعداد Domain وDNS | NV | `robots.txt` يشير إلى `edunest.com`؛ لا توثيق DNS. | FE-019 | EXT |
| DEP-08 | اختبار Deployment على Staging | FAIL | لا staging ولا pipeline ولا دليل. | FE-020 | YES |

### 4.6 الواجهة/التجربة/المتصفحات

| ID | البند | الحالة | الدليل/الفجوة | المهمة | الحاجب |
|---|---|---|---|---|---|
| UX-01 | Responsive على الموبايل/التابلت/الديسكتوب | NV | 849 استخدام responsive يوحي بالنية، لكن لا دليل أجهزة؛ جداول `min-w-[800px]` وتمرير أفقي. | FE-023 | NO |
| UX-02 | اختبار المتصفحات الأساسية | NV | لا تعريف متصفحات مدعومة؛ لا دليل cross-browser؛ `esnext`. | FE-023 | NO |
| UX-03 | مراجعة Console/Network من الأخطاء | NV | التطبيق لا يعمل؛ 127 console واستدعاءات localhost تضمن أخطاء في نسخة مستضافة. | FE-003, FE-020 | YES |
| UX-04 | فتح الصفحات الداخلية مباشرة وRefresh | FAIL | لا SPA rewrite؛ الاستضافة الثابتة ترجع 404 عند refresh لمسار عميق. | FE-019 | YES |
| UX-05 | مراجعة 404 والروابط الداخلية | PARTIAL | `NotFound` موجود ومربوط بـ`*`، لكنه يستخدم `navigate(-1)` وقد يلوّب عند الفتح المباشر؛ sitemap ناقص؛ مسار إداري مكرر. | FE-015, FE-004 | NO |
| UX-06 | أساسيات Accessibility والتنقل بالكيبورد | PARTIAL | focus-visible موجود وبعض aria. لكن 0/32 مودال فيها `role="dialog"`/focus trap؛ 4/143 `htmlFor`؛ أزرار أيقونات بلا أسماء؛ `lang="en"` مع محتوى عربي. | FE-022 | NO |
| UX-07 | الترجمة والتواريخ والمناطق الزمنية | FAIL | واجهة مختلطة عربي/إنجليزي؛ `lang="en"`؛ تواريخ `en-US`؛ لا تحويل timezone؛ لا i18n. | FE-024 | NO |

### 4.7 المراقبة والاستعادة

| ID | البند | الحالة | الدليل/الفجوة | المهمة | الحاجب |
|---|---|---|---|---|---|
| MON-01 | إعداد Error Tracking مثل Sentry | FAIL | لا Sentry/Datadog/Rollbar/LogRocket؛ لا error boundary يبلّغ. | FE-021 | YES |
| MON-02 | أدوات Monitoring للأداء والأخطاء | FAIL | لا RUM/analytics/web-vitals. | FE-021 | NO |
| MON-03 | جاهزية خطة Rollback | FAIL | لا توثيق rollback؛ هدف الاستضافة غير معروف؛ لا artifacts بنسخ. | FE-026 | YES |
| MON-04 | تجهيز Smoke Tests بعد النشر | FAIL | لا scripts ولا checklist. | FE-020 | YES |
| MON-05 | اختبار أهم الصفحات/APIs بعد Deployment | NV | لم يُنفَّذ نشر ولم يُفحص. | FE-020 | YES |
| MON-06 | مراقبة Error Rates/Performance بعد الإطلاق | NV | لا dashboards ولا حدود تنبيه. | FE-021, FE-026 | NO |

### 4.8 أوامر ما قبل النشر

| ID | البند | الحالة | الدليل/الفجوة | المهمة | الحاجب |
|---|---|---|---|---|---|
| CMD-01 | `npx tsc --noEmit` | NV | لم يُنفَّذ. في الجذر يفحص صفر ملفات لأن `tsconfig.json` فيه `"files": []`. | FE-001 | YES |
| CMD-02 | `npx eslint .` | NV | لم يُنفَّذ؛ الإعداد يغطي TS/TSX فقط؛ لا a11y plugin. | FE-001, FE-002 | YES |
| CMD-03 | `npm audit` | NV | لم يُنفَّذ؛ لا تثبيت. | FE-025 | YES |
| CMD-04 | `npm test` | FAIL | لا `test` script ولا runner؛ الأمر يفشل فوراً. | FE-012 | YES |
| CMD-05 | `npm run build` | NV | لم يُنفَّذ؛ لا `dist/`. | FE-001 | YES |

### 4.9 اعتماد الإصدار

| ID | البند | الحالة | الدليل/الفجوة | المهمة | الحاجب |
|---|---|---|---|---|---|
| REL-01 | اجتياز جميع الفحوصات الأساسية | FAIL | لا CI ولا نتائج أوامر مسجلة؛ 0 PASS في هذا التدقيق. | FE-026 | YES |
| REL-02 | لا مشكلات أمنية حرجة/غير معالجة | FAIL | مفتوح: JWT في localStorage، logging بلا حماية، XSS sinks، CVEs غير معروفة، حماية دور من العميل. | FE-008, FE-010, FE-011, FE-025 | YES |
| REL-03 | نجاح الاختبارات الأساسية | FAIL | لا اختبارات. | FE-012, FE-013, FE-014 | YES |
| REL-04 | نجاح Production Build | NV | لم يُنفَّذ. | FE-001 | YES |
| REL-05 | اختبار الإصدار على Staging | FAIL | لا staging ولا دليل. | FE-020 | YES |
| REL-06 | جاهزية خطة Rollback | FAIL | لا خطة. | FE-026 | YES |

### تغطية القائمة

| القسم | البنود | المهام المغطية |
|---|---:|---|
| جودة الكود والبناء | 6 | FE-001…FE-005 |
| الأمان | 7 | FE-003, FE-006, FE-008…FE-011, FE-025 |
| الاختبارات | 7 | FE-009, FE-012…FE-015, FE-022 |
| الأداء | 7 | FE-016…FE-018, FE-023 |
| إعداد الإنتاج | 8 | FE-006, FE-007, FE-019, FE-020 |
| الواجهة/التوافق | 7 | FE-003, FE-004, FE-015, FE-019, FE-022…FE-024 |
| المراقبة/الاستعادة | 6 | FE-020, FE-021, FE-026 |
| الأوامر | 5 | FE-001, FE-012, FE-025 |
| اعتماد الإصدار | 6 | FE-008, FE-010…FE-014, FE-020, FE-025, FE-026 |
| **الإجمالي** | **59** | **كلها مربوطة، لا بند يتيم** |

طلبات التحقق الخارجية (ليست مهام فرونت): `SEC-03`، `DEP-04`، `DEP-05`، `DEP-06`، `DEP-07`، وتأكيد شكل هيدر المصادقة لـ`FE-007`، واستضافة خدمة الشات لـ`FE-007`/`FE-010`.

---

## 5. الـEpics والمهام الرسمية

**الإجمالي:** 7 Epics، 26 مهمة، 5 مهام فرعية.
**وحدة التقدير:** شخص-يوم (pd) لمهندس فرونت خبير، بدون وقت المراجعة.
**الأولوية:** P0 حاجب إصدار · P1 عالي · P2 مهم · P3 اختياري.
**قاعدة الدليل:** المهمة لا تُغلق إلا بدليل التحقق مرفقاً بالتذكرة/PR.

### نظرة عامة على الـEpics

| Epic | العنوان | الهدف | المهام | شرط الخروج |
|---|---|---|---|---|
| FE-EPIC-01 | جودة كود الفرونت وموثوقية البناء | جعل install → typecheck → lint → build قابلاً للتكرار ونظيفاً | FE-001…FE-005 | CI أخضر من تثبيت نظيف؛ صفر موديولات ميتة؛ صفر logs غير محمية |
| FE-EPIC-02 | أمان الفرونت وتكامل المصادقة | إزالة مخاطر الإنتاج، تحصين الجلسة/المسارات، إغلاق XSS | FE-006…FE-011, FE-025 | لا localhost، لا أسرار، تعامل آمن مع التوكن، إغلاق XSS، audit مُفرَّز |
| FE-EPIC-03 | الاختبارات الآلية وضمان الجودة | بناء هرم اختبار وتغطية الرحلات الحرجة | FE-012…FE-014 | Unit/Integration/E2E تعمل في CI وتنجح على staging |
| FE-EPIC-04 | أداء React والحزمة | قياس وضبط الحزمة والرندر والأصول والقوائم | FE-016…FE-018 | ميزانيات مفروضة؛ تحسينات مقاسة |
| FE-EPIC-05 | إعداد الإنتاج والنشر | جعل SPA قابلاً للنشر وcache صحيحاً | FE-019 | إعداد staging/production موجود؛ deep links والهيدرز متحققة |
| FE-EPIC-06 | الواجهة المتجاوبة وa11y والمتصفحات | تحقيق خط أساس متفق عليه | FE-022…FE-024 | مصفوفة منفذة؛ axe critical = 0؛ الكيبورد يعمل |
| FE-EPIC-07 | معالجة الأخطاء والمراقبة واعتماد الإصدار | اكتشاف الأعطال والإبلاغ والاستعادة | FE-015, FE-020, FE-021, FE-026 | Error boundary + تتبع حي؛ smoke + rollback مثبت |

### رسم التبعيات

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
FE-004, FE-010, FE-015, FE-017, FE-022, FE-023, FE-024, FE-025 بالتوازي حيث يناسب.
```

**المسار الحرج:** `FE-001 → FE-002 → FE-006 → FE-007 → FE-008 → FE-009 → FE-013 → FE-014 → FE-019 → FE-020 → FE-026`.

**المسارات المتوازية:**
- A (البناء): FE-001، FE-002، FE-003، FE-005.
- B (الأمان/الإعداد): FE-006…FE-011.
- C (الجودة): FE-012، FE-013، FE-014، FE-022.
- D (الأداء): FE-016، FE-017، FE-018، FE-023.
- E (الإصدار): FE-019، FE-020، FE-021، FE-026.

---

## FE-EPIC-01 — جودة كود الفرونت وموثوقية البناء

**المشكلة:** لا يوجد مسار تحقق قابل للتكرار. `node_modules` غائب، لا `test`/`typecheck` script، لا CI، 127 console، 14 موديول ميت، 9 حزم غير مستخدمة. لا يمكن اعتماد إصدار بـ"اشتغل عندي".

**النتيجة:** نسخة نظيفة تستطيع install وtypecheck وlint وbuild وإنتاج artifact قابل للتدقيق بأمر واحد، بصفر كود ميت وصفر logging غير محمي.

**تغطية القائمة:** CQ-01…CQ-06، CMD-01، CMD-02، CMD-05، REL-01، REL-04.

### FE-001 — خط أساس قابل للتكرار للتحقق

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task (enablement) / FE-EPIC-01 |
| الأولوية / الجهد | **P0** / 1–2 pd · ثقة عالية |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA |
| تغطية القائمة | CQ-01, CQ-02, CQ-03, CMD-01, CMD-02, CMD-05, REL-01, REL-04 |

**المشكلة (دليل).** `package.json` فيه فقط `dev,start,build,lint,preview`. `node_modules` و`dist` غير موجودين. `tsconfig.json` الجذري solution file (`"files": []`)، فـ`npx tsc --noEmit` يفحص صفر ملفات. لا CI، فلا فحص فُرض على أي commit.

**الهدف.** إنتاج baseline نظيف ومؤرشف لـ install/typecheck/lint/build/audit، وتثبيت الأوامر الصحيحة في scripts وCI.

**النطاق.** إضافة `typecheck: tsc -b`، و`ci` يجمع typecheck/lint/test/build، وworkflow CI (GitHub Actions بافتراض التأكيد) مع `npm ci` وNode مثبت ورفع `dist` واللوجات، وتسجيل baseline في التذكرة.

**الملفات.** `package.json`، `tsconfig*.json`، `.github/workflows/*` (جديد)، `README.md`.

**معايير القبول.**
- **Given** نسخة نظيفة وNode مثبت، **When** يُشغَّل `npm ci && npm run typecheck && npm run lint && npm run build`، **Then** يُسجَّل exit code والمدة لكل أمر.
- **Given** PR فيه خطأ TypeScript، **When** يعمل CI، **Then** يفشل عند خطوة typecheck.
- **Given** بناء ناجح، **When** ينتهي الـworkflow، **Then** يُرفع `dist/` كـartifact باسم يحتوي commit SHA.

**DoD.** scripts موجودة؛ workflow مدموج؛ تقرير baseline مرفق؛ README محدث؛ لا تغيير في منطق التطبيق.

**التبعيات.** لا شيء. يحجب FE-002، FE-012، FE-019، FE-020، FE-026.

**الدليل.** رابط CI، لوجات خام، artifact `dist`، README محدث.

### FE-002 — إصلاح TypeScript/ESLint وحذف الموديولات الميتة

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-01 |
| الأولوية / الجهد | **P0** / 3–5 pd · ثقة متوسطة (عدد الأخطاء غير معروف حتى FE-001) |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA |

**المشكلة.** strict TS مفعّل و`build` يشغّل `tsc -b`، لكن الفحص لم يُنفَّذ. 14 موديول صفر بايت وغير مستورد، منها `src/hooks/useAuth.ts`، `src/utils/storage.ts`، `src/store/useUIStore.ts`، و`ProjectDetail.tsx` مكرر. `App.tsx` فيه route بلا path و`/admin/dashboard` مكرر "Coming Soon". ESLint بلا a11y plugin.

**الهدف.** typecheck/lint/build نظيفة، وحذف المسارات الميتة/المكررة.

**النطاق.** إصلاح كل أخطاء TS/ESLint؛ حذف 14 موديول؛ حذف `ProjectDetail` المكرر وplaceholder الإداري؛ إزالة route بلا path؛ إضافة `eslint-plugin-jsx-a11y` (إعداد فقط)؛ حل تعارض `@types/react-router-dom` v5.

**الملفات.** كل `src/**/*.ts(x)` بأخطاء؛ `src/App.tsx`؛ `src/pages/mentor-pages/ProjectDetail.tsx`؛ `src/pages/admin-pages/mentor-pages/**`؛ `eslint.config.js`؛ `package.json`.

**معايير القبول.**
- **Given** baseline FE-001، **When** `npm run typecheck`، **Then** exit 0 وصفر أخطاء.
- **Given** نفس الـcommit، **When** `npm run lint`، **Then** exit 0 وصفر أخطاء.
- **Given** بحث عن ملفات صفر بايت في `src`، **When** تكتمل المهمة، **Then** النتيجة فارغة.
- **Given** جدول المسارات، **When** يُراجع، **Then** كل path يظهر مرة واحدة ولا placeholder.

**DoD.** كل الفحوص خضراء؛ الملفات الميتة محذوفة؛ جدول المسارات مُراجع؛ لا تغيير سلوك غير إزالة المسارات الميتة؛ مراجعة Tech Lead.

**التبعيات.** FE-001. يحجب FE-012 وFE-020.

**الدليل.** PR بـCI أخضر، قائمة الملفات المحذوفة، عدد الأخطاء قبل/بعد.

### FE-003 — إزالة ضجيج console واللوجات الحساسة

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-01 |
| الأولوية / الجهد | **P0** / 1–2 pd · ثقة عالية |
| المالك / المراجع / QA | Frontend Dev / Security Reviewer / QA |

**المشكلة.** 127 استدعاء `console.*`. `api.ts:41-47` يطبع URL وparams وأول 20 حرفاً من `Authorization` بلا حماية، بعنوان "🔍 DEBUG LOG". `useLogin.ts:123,130` يطبع email ودور التحويل. `Websocketservice.ts` يطبع دورة الاتصال.

**الهدف.** console الإنتاج بلا PII أو أجزاء توكن أو ضجيج، مع إبقاء تشخيص تطوير اختياري.

**النطاق.** استبدال/إزالة اللوجات؛ إضافة `src/utils/logger.ts` محمي بـ`import.meta.env.DEV`؛ قاعدة `no-console` مع allowlist للـlogger؛ إزالة تعليقات DEBUG.

**الملفات.** `src/services/api.ts`، `src/hooks/useLogin.ts`، `src/services/Websocketservice.ts`، `src/utils/jwt.ts`، وأكثر من 120 موضعاً.

**معايير القبول.**
- **Given** بناء إنتاج، **When** تُستخدم أي صفحة، **Then** لا `console.log/debug/info` من كود التطبيق.
- **Given** طلب endpoint محمي، **When** يُفحص في DevTools، **Then** لا تظهر قيمة Authorization في أي log.
- **Given** تشغيل lint، **When** يضيف مطور `console.log`، **Then** يفشل ESLint.

**DoD.** grep `console.` يرجع logger فقط (والاستثناءات المعتمدة)؛ قاعدة lint مفعلة؛ smoke إنتاج يؤكد console نظيف.

**التبعيات.** FE-001. بالتوازي مع FE-006/FE-008.

**الدليل.** PR، مخرجات grep، لقطة console من staging.

### FE-004 — معالجة TODO/FIXME والواجهات غير المكتملة

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-01 |
| الأولوية / الجهد | P1 / 2–4 pd · ثقة متوسطة |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA |

**المشكلة.** `TODO.md` فيه بندان (إكمال refactor `ProjectDetail`، تشغيل build/lint). 8 علامات TODO/FIXME/HACK. `ProjectDetail.tsx` مكرر في مسارين. `App.tsx:235` يعرض "Admin Dashboard - Coming Soon". بعض الصفحات فيها محتوى demo (F-21).

**الهدف.** تحويل كل علامة إلى قرار: إصلاح الآن، تذكرة بمالك، أو حذف.

**النطاق.** فرز العلامات؛ إكمال/حذف تكرار `ProjectDetail`؛ إزالة "Coming Soon"؛ استبدال/وسم محتوى demo.

**الملفات.** `TODO.md`، `src/pages/mentor-pages/ProjectDetail.tsx`، `src/pages/mentor-pages/mentorship-projects/**`، `src/App.tsx`، `src/pages/student-pages/StudentDashboard/StudentDashboard.tsx`، `src/utils/constants.ts`.

**معايير القبول.**
- **Given** بحث في المستودع، **When** البحث عن `TODO|FIXME|HACK` في `src`، **Then** صفر نتائج.
- **Given** جدول مسارات الإدارة، **When** الانتقال إلى `/admin/dashboard`، **Then** تظهر اللوحة الحقيقية لا placeholder.
- **Given** لوحة الطالب، **When** تُعرض في الإنتاج، **Then** لا يظهر testimonial demo كأنه محتوى مستخدم حقيقي.

**DoD.** العلامات محلولة؛ التكرار محذوف؛ محتوى demo مستبدل ببيانات API أو مُقيّد بوضوح؛ موافقة QA.

**التبعيات.** FE-002 (تداخل تنظيف المسارات). بالتوازي مع FE-012.

**الدليل.** PR + جدول فرز (علامة → قرار → تذكرة).

### FE-005 — نظافة الاعتماديات وmetadata الحزمة

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-01 |
| الأولوية / الجهد | P1 / 1–2 pd · ثقة عالية |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA |

**المشكلة.** صفر استيراد لـ`@jitsi/react-sdk`، `aos`، `html2pdf`، `react-is`، `react-player`، `sweetalert2`، `sweetalert2-react-content`، `zod`، `@tanstack/react-query-devtools`. `@types/react-router-dom` v5 مع router v7. `package.json` ما زال وصف قالب Vite و`"main": "eslint.config.js"` وبلا `engines`/`packageManager`.

**الهدف.** تقليل سطح التثبيت/البناء وجعل metadata دقيقة.

**النطاق.** حذف الحزم غير المستخدمة؛ إبقاء `zod` فقط لو تبنّته FE-013؛ إصلاح types؛ تصحيح name/description/version/homepage؛ إضافة engines/packageManager.

**الملفات.** `package.json`، `package-lock.json`، `vite.config.ts` (إزالة قواعد chunks الميتة بالتنسيق مع FE-016).

**معايير القبول.**
- **Given** قائمة الاعتماديات، **When** تُقارن بالاستيرادات، **Then** كل dependency وقت تشغيل لها استيراد واحد على الأقل أو تبرير موثق.
- **Given** `npm ci`، **When** يكتمل، **Then** lockfile بلا تغيير ولا تحذيرات peer جديدة.
- **Given** metadata، **When** تُقرأ، **Then** تعكس EduNest.

**DoD.** الحذف مدموج؛ build أخضر؛ فرق الحزمة موثق؛ لا قواعد chunks ميتة.

**التبعيات.** FE-001، FE-002. يغذي FE-016 وFE-025.

**الدليل.** PR، مخرجات `npm ls`، فرق حجم الحزمة.

---

## FE-EPIC-02 — أمان الفرونت وتكامل المصادقة

**المشكلة:** العميل يثبّت localhost، يخزن JWT في localStorage، يثق بدور محفوظ، يعرض HTML غير مهرّب من البوت/الملفات، يطبع أجزاء auth header، ولم يُجرِ audit للاعتماديات.

**النتيجة:** إعداد إنتاج آمن، نموذج جلسة قابل للدفاع، إغلاق XSS، وaudit مبني على دليل — مع تحقق صريح من تفويض الـBackend.

**تغطية القائمة:** SEC-01…SEC-07، DEP-01…DEP-03، REL-02.

### FE-006 — مركزة إعداد البيئة ورابط API

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task (أب لـ3 مهام فرعية) / FE-EPIC-02 |
| الأولوية / الجهد | **P0** / 2–3 pd · ثقة عالية |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA |

**المشكلة.** `api.ts:4` يصدّر `API_BASE_URL = 'http://localhost:8080'`. لا `.env*` ولا `.env.example`. اسمان متضاربان: `VITE_API_BASE_URL` (17) و`VITE_BASE_URL` (5)، كلاهما مع `?? 'http://localhost:8080'`. لا تحقق وقت التشغيل.

**الهدف.** عقد بيئة واحد موثق ومُتحقق يستخدمه كل URL شبكة/أصل.

**النطاق.** `FE-006A`: `.env.example` + `src/config/env.ts` + typing. `FE-006B`: ترحيل `api.ts` وكل الخدمات. `FE-006C`: دالة موحدة لروابط الأصول/الصور.

**الملفات.** `.env.example` (جديد)، `src/config/env.ts` (جديد)، `src/vite-env.d.ts` (جديد)، `src/services/api.ts`، `src/services/student-roleService/*`، `src/hooks/**`، `src/utils/imageUtils.ts`، `src/components/**`.

**معايير القبول.**
- **Given** `VITE_API_BASE_URL=https://api.staging.example.com`، **When** يُبنى التطبيق، **Then** كل طلبات API والأصول تستهدف هذا الـhost.
- **Given** غياب المتغير في بناء production، **When** يبدأ البناء، **Then** يفشل برسالة واضحة (أو throw عند بدء التطبيق).
- **Given** `grep -r "localhost" src`، **When** بعد المهمة، **Then** يتبقى فقط fallback التطوير في `env.ts`.
- **Given** مسار صورة `/uploads/x.png`، **When** يُحل، **Then** يصبح `<API host>/uploads/x.png`.

**DoD.** عقد البيئة موثق؛ كل المستهلكين مرحّلون؛ بناء staging متحقق؛ لا أسرار في أي `VITE_*`.

**التبعيات.** FE-001. يحجب FE-007، FE-008، FE-013، FE-019، FE-020. **يجب تأكيد host الإنتاج وأصل CORS من الـBackend.**

**الدليل.** `.env.example`، config module، PRs الترحيل، grep، لقطة شبكة staging.

#### FE-006A — عقد البيئة وموديول التحقق
`.env.example` + `src/config/env.ts` + `src/vite-env.d.ts`؛ تحقق من URL وتصدير config مُنمّط؛ اختبارات (ناقص، مشوه، trailing slash). **0.5–1 pd.** الدليل: اختبارات + عرض فشل البناء.

#### FE-006B — ترحيل Axios والخدمات
ترحيل `api.ts` وكل مستهلكي `VITE_API_BASE_URL`/`VITE_BASE_URL`؛ إزالة الـhosts الحرفية. **1 pd.** الدليل: grep + لقطة شبكة.

#### FE-006C — مركزة روابط الأصول/الصور
استبدال ثوابت `BASE_URL` و`http://localhost:8080${path}` بدالة واحدة. **0.5–1 pd.** الدليل: صور تعمل على staging + grep نظيف.

### FE-007 — إزالة fetch/localhost وتوحيد عقد auth header

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-02 |
| الأولوية / الجهد | **P0** / 2–3 pd · ثقة عالية |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA |

**المشكلة.**
- `StatusToggleModal.tsx:32` يعمل PATCH إلى `http://localhost:8080/api/v1/mentorship/:id` **بلا Authorization**.
- `ProjectSubmissionsTable.tsx:32` يبني `http://localhost:8080/uploads/submissions/...`.
- `Usechatbot.ts:5` يستدعي `http://127.0.0.1:8000/chat`.
- `MentorshipStudentsTable.tsx:40` يرسل `Bearer <token>`، بينما `api.ts:59` يرسل token خاماً و`Websocketservice.ts:36` خاماً. أحد العقدين خاطئ.
- عدة `fetch` بلا timeout/abort.

**الهدف.** تمرير كل حركة الشبكة عبر العميل المشترك (أو wrapper موثق)، بعقد auth واحد مؤكد ومعالجة timeout/error متسقة.

**النطاق.** استبدال fetch؛ مركزة روابط الملفات؛ AbortController/timeout؛ تأكيد الهيدر مع Backend؛ اختبارات تكامل.

**الملفات.** `StatusToggleModal.tsx`، `MentorshipStudentsTable.tsx`، `ProjectSubmissionsTable.tsx`، `src/hooks/chatbot/Usechatbot.ts`، `src/services/api.ts`، `src/services/Websocketservice.ts`.

**معايير القبول.**
- **Given** مرشد يفعّل mentorship، **When** يُرسل الطلب، **Then** يذهب إلى host API المُعد بهيدر auth المؤكد ويعيد 2xx.
- **Given** طلب قائمة طلاب، **When** يُفحص، **Then** شكل الهيدر يطابق `api.ts` تماماً.
- **Given** `grep -rn "fetch(" src`، **When** يُراجع، **Then** المتبقي مبرر (streaming) ويستخدم env مع abort/timeout.
- **Given** غياب env الشات، **When** يعمل التطبيق، **Then** يُخفى الودجت أو يظهر "unavailable" بدل localhost.

**DoD.** كل الاستدعاءات مرحّلة؛ عقد الـBackend مسجل؛ اختبارات success/401/timeout؛ staging متحقق.

**التبعيات.** FE-006. يتداخل مع FE-008 (401) وFE-010 (XSS الشات). **محجوب بتأكيد هيدر الـBackend.**

**الدليل.** PRs، تعليق تأكيد الـBackend، لقطة شبكة staging، نتائج اختبارات.

### FE-008 — تحصين جلسة المصادقة ودورة حياة التوكن

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-02 |
| الأولوية / الجهد | **P0** / 3–5 pd · ثقة متوسطة (تعتمد على refresh من الـBackend) |
| المالك / المراجع / QA | Tech Lead / Security Reviewer / QA |

**المشكلة.** `authStore.ts` يحفظ JWT في `auth-storage` **و**مفتاح `token` منفصل في `localStorage`؛ يُكتب بغض النظر عن remember-me؛ لا فحص `exp`، لا refresh، لا 401 interceptor. `logout()` ينفذ `localStorage.clear()` فيمسح حالة غير متعلقة. `App.tsx:134-146` يحوّل للوحة عند كل تحميل إذا `token && rememberMe && lastEmail` حتى في الصفحات العامة.

**الهدف.** نموذج جلسة متوقع وقابل للدفاع بسلوك انتهاء وفشل واضح.

**النطاق.** قرار التخزين (المفضل: access token في الذاكرة + refresh في HttpOnly cookie، ويحتاج Backend؛ البديل توكن قصير العمر مع قبول خطر صريح)؛ فحص `exp` عند hydration وقبل الطلبات؛ interceptor 401 → مسح الجلسة مرة واحدة وتحويل إلى `/login?reason=expired` مع تجنب الحلقات؛ إصلاح remember-me؛ logout يمسح مفاتيح auth فقط؛ إزالة المفتاح المكرر أو جعله مصدراً واحداً.

**الملفات.** `src/store/authStore.ts`، `src/services/api.ts`، `src/hooks/useLogin.ts`، `src/App.tsx`، `src/routes/ProtectedRoute.tsx`، `src/utils/jwt.ts`.

**معايير القبول.**
- **Given** JWT منتهي في التخزين، **When** يحمّل التطبيق، **Then** يُعامل كغير مصادق ويُحوَّل إلى `/login` مع إشعار "session expired".
- **Given** remember-me غير محدد، **When** يُغلق التاب ويُفتح، **Then** لا تتم مصادقة تلقائية.
- **Given** أي API يعيد 401، **When** يعالجه interceptor، **Then** تُمسح حالة auth مرة واحدة ويُحوَّل المستخدم بلا حلقة.
- **Given** logout، **When** يكتمل، **Then** تُحذف مفاتيح auth فقط ويبقى تفضيل الثيم.

**DoD.** قرار التخزين معتمد؛ اختبارات expiry/401/remember-me؛ تحقق staging؛ موافقة Security.

**التبعيات.** FE-006، FE-007؛ عقد refresh من الـBackend. يحجب FE-009 وFE-013.

**الدليل.** قرار مكتوب، PR، تقرير اختبارات، رابط عقد الـBackend.

### FE-009 — تحصين حماية المسارات وواجهة الإدارة

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-02 |
| الأولوية / الجهد | **P0** / 2–3 pd · ثقة عالية |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA + Backend |

**المشكلة.** `ProtectedRoute` يثق بـ`userRole` من التخزين المحلي. `App.tsx` فيه route حارس بلا path، و`/admin/dashboard` placeholder مكرر، و`/explore-mentorships` و`/mentorships/:id/enroll` تحت حارس الطالب فقط. لا اختبارات سلبية.

**الهدف.** جعل التوجيه متسقاً وتوثيق أنه UX وليس تفويضاً.

**النطاق.** تنظيف المسارات؛ مركزة `getDashboardPath`؛ إضافة حالة `Unauthorized`؛ اختبارات مصفوفة الأدوار؛ كتابة طلب تحقق للـBackend.

**الملفات.** `src/App.tsx`، `src/routes/ProtectedRoute.tsx`، `src/routes/index.tsx`، `src/pages/NotFound.tsx`.

**معايير القبول.**
- **Given** زائر يفتح `/admin/users`، **When** يُحل المسار، **Then** يُحوَّل إلى `/login` مع حفظ `from`.
- **Given** طالب يفتح `/admin/users`، **When** يُحل، **Then** يُحوَّل إلى لوحة الطالب أو `/unauthorized`، ولا يُعرض layout الإدارة.
- **Given** `userRole=ROLE_ADMIN` معدّل يدوياً، **When** يُستدعى API إداري، **Then** الـBackend يعيد 403 (بدليل من الـBackend).
- **Given** جدول المسارات، **When** يُراجع، **Then** لا path مكرر ولا placeholder.

**DoD.** جدول المسارات معتمد؛ الاختبارات تمر؛ دليل تفويض الـBackend مرفق؛ التوثيق يوضح أن الحماية UX فقط.

**التبعيات.** FE-008. **خارجي:** تقرير تفويض الـBackend.

**الدليل.** PR، تقرير مصفوفة الأدوار، رابط دليل الـBackend.

### FE-010 — إغلاق XSS و sinks عرض المحتوى غير الآمن

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-02 |
| الأولوية / الجهد | P1 / 2–3 pd · ثقة عالية |
| المالك / المراجع / QA | Frontend Dev / Security Reviewer / QA |

**المشكلة.**
- `ChatbotWidget.tsx:146,173` يحقن `formatBotText(text)` عبر `dangerouslySetInnerHTML`؛ المنسّق لا يهرّب شيئاً، فمخرجات النموذج التي تحتوي `<img onerror=...>` تُنفَّذ.
- `FileViewer.tsx:227` يحقن `convertedHtml` من Mammoth (DOCX) بلا تعقيم.
- `FileViewer.tsx:128` يحمّل `https://unpkg.com/mammoth/...` وقت التشغيل عند فشل dynamic import.
- 4 استدعاءات `window.open` بلا `noopener` (`FileViewer.tsx:38`، `GradeModal.tsx:85`، `AssimentDetailsPanel.tsx:152`، `ProjectDetail.tsx:159`).

**الهدف.** لا نص غير موثوق يُعرض كHTML، ولا سكريبت طرف ثالث وقت التشغيل.

**النطاق.** تعقيم/تهريب؛ استبدال منسّق HTML بعارض آمن أو DOMPurify؛ إزالة CDN fallback؛ إصلاح `window.open`.

**الملفات.** `ChatbotWidget.tsx`، `FileViewer.tsx`، `GradeModal.tsx`، `AssimentDetailsPanel.tsx`، `ProjectDetail.tsx`.

**معايير القبول.**
- **Given** رد شات يحتوي `<img src=x onerror=alert(1)>`، **When** يُعرض، **Then** يظهر كنص ولا يُنفَّذ سكريبت.
- **Given** DOCX يحتوي سكريبت/event handler، **When** يُعاين، **Then** يُزال handler.
- **Given** التطبيق offline/CDN محجوب، **When** يُفتح DOCX، **Then** المعاينة تعمل (mammoth مضمّن).
- **Given** أي `window.open`، **When** يُفحص، **Then** يحتوي `noopener,noreferrer`.

**DoD.** موافقة Security؛ اختبارات payload في QA matrix؛ لا `dangerouslySetInnerHTML` بلا sanitizer.

**التبعيات.** FE-006 (env الشات). بالتوازي مع FE-008.

**الدليل.** PR، دليل اختبار payload، مذكرة مراجعة أمنية.

### FE-011 — حواجز الأسرار ونظافة البيئة

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-02 |
| الأولوية / الجهد | P1 / 1 pd · ثقة عالية |
| المالك / المراجع / QA | Frontend Dev / Security Reviewer / DevOps |

**المشكلة.** لا أسرار حيّة في شجرة العمل، لكن لا فحص أسرار، لا `.env.example`، وبقايا نفق تطوير (`ngrok-skip-browser-warning` في `api.ts:14`، ngrok DNS prefetch في `index.html:30`). تاريخ Git لم يُفحص.

**الهدف.** منع دخول الأسرار وإزالة ارتباط نفق التطوير.

**النطاق.** gitleaks/trufflehog في CI؛ فحص التاريخ؛ إزالة ngrok؛ توثيق rotation؛ التأكد من تجاهل `.env*` واحتواء `.env.example` على placeholders فقط.

**الملفات.** `.github/workflows/*`، `.gitignore`، `.env.example`، `src/services/api.ts`، `index.html`.

**معايير القبول.**
- **Given** commit فيه مفتاح AWS وهمي، **When** يعمل CI، **Then** تفشل مهمة الأسرار.
- **Given** تاريخ Git الكامل، **When** يُفحص، **Then** النتائج صفر أو موثقة كـrotated/revoked.
- **Given** بناء إنتاج، **When** يُفحص، **Then** لا يوجد نص `ngrok`.

**DoD.** scanner أخضر؛ تقرير التاريخ مرفق؛ ngrok محذوف؛ `.env.example` مُراجع.

**التبعيات.** FE-006. بالتوازي مع FE-025.

**الدليل.** مهمة CI، تقرير الفحص، PR الحذف.

### FE-025 — فرز ثغرات الاعتماديات ومعالجتها

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-02 |
| الأولوية / الجهد | P1 / 1–3 pd (حسب النتائج) · ثقة منخفضة حتى يعمل audit |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / Security Reviewer |

**المشكلة.** `npm audit` لم يعمل؛ لا تقرير ولا Dependabot/Renovate. الحزم تشمل حزماً كبيرة/نادرة وVite 8 major.

**الهدف.** معرفة وتقليل تعرض الثغرات قبل الإصدار.

**النطاق.** `npm audit --production`؛ `npm audit fix` غير الكاسر؛ ترقيات موجهة؛ overrides آمنة؛ إعداد Dependabot.

**الملفات.** `package.json`، `package-lock.json`، `.github/dependabot.yml`.

**معايير القبول.**
- **Given** `npm audit --production` على commit الإصدار، **When** يُشغَّل، **Then** high/critical = 0 أو لكل واحدة سجل accepted risk بمالك/تاريخ.
- **Given** Dependabot مفعّل، **When** يُنشر advisory أمني، **Then** يُفتح PR تلقائياً.

**DoD.** تقرير audit مرفق؛ الإصلاحات مدموجة؛ بوابة CI لـhigh/critical؛ قبول المخاطر موقّع.

**التبعيات.** FE-001 (تثبيت)، FE-005 (تقليل السطح).

**الدليل.** JSON audit، PR المعالجة، سجل المخاطر.

---

## FE-EPIC-03 — الاختبارات الآلية وضمان الجودة

**المشكلة:** صفر اختبارات ولا runner. مسارات المصادقة والتسجيل والتقييم والدفع بلا حماية من الانحدار.

**النتيجة:** هرم اختبار يعمل في CI وعلى staging، يغطي auth والأدوار والرحلات الحرجة وحالات الفشل.

**تغطية القائمة:** QA-01…QA-07، CMD-04، REL-03.

### FE-012 — إدخال Vitest + React Testing Library

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task (أب لمهمتين فرعيتين) / FE-EPIC-03 |
| الأولوية / الجهد | **P0** / 2–3 pd · ثقة عالية |
| المالك / المراجع / QA | QA + Frontend Dev / Tech Lead / QA |

**المشكلة.** لا `test` script؛ لا Vitest/Jest/RTL/Playwright في lockfile؛ `npm test` يفشل فوراً.

**الهدف.** harness سريع للوحدة/المكوّنات مع تقرير تغطية وتكامل CI.

**النطاق.** `FE-012A`: Vitest + jsdom + setup + scripts. `FE-012B`: اختبارات RTL للمكونات/الhooks المشتركة (ErrorState، EmptyState، ProtectedRoute، تحقق auth، JWT، env).

**الملفات.** `package.json`، `vite.config.ts` أو `vitest.config.ts` (جديد)، `src/test/setup.ts` (جديد)، `src/**/__tests__/*` (جديد)، CI.

**معايير القبول.**
- **Given** تثبيت نظيف، **When** `npm test`، **Then** تعمل المجموعات وتخرج 0.
- **Given** assertion فاشل، **When** يعمل CI، **Then** يفشل pipeline.
- **Given** تقرير تغطية، **When** يُنشأ، **Then** يعرض lines/branches ويفرض الحد المتفق.
- **Given** اختبار مكوّن، **When** يرندر `ProtectedRoute` بلا auth، **Then** يؤكد التحويل إلى `/login`.

**DoD.** harness مدموج؛ ≥10 اختبارات مفيدة؛ بوابة CI؛ قسم testing في README.

**التبعيات.** FE-001، FE-002. يحجب FE-013 وFE-014.

**الدليل.** config، setup، مجموعات نموذجية، log CI، تقرير تغطية.

#### FE-012A — Harness
Vitest + jsdom + setup + scripts `test`/`test:coverage`. **1 pd.**

#### FE-012B — اختبارات smoke
RTL للمكونات المشتركة والتحقق وJWT/env. **1–2 pd.**

### FE-013 — تغطية مسار المصادقة Unit + E2E

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-03 |
| الأولوية / الجهد | P1 / 3–5 pd · ثقة متوسطة |
| المالك / المراجع / QA | QA / Tech Lead / QA |

**المشكلة.** Login/Logout/Register/OTP/Reset/Restore بلا اختبارات آلية. التحقق regex/length في hooks؛ أخطاء السيرفر تُطابق بالنص.

**الهدف.** إثبات دورة المصادقة الكاملة والمسارات السلبية.

**النطاق.** Login (صحيح/خطأ/غير مفعّل/محذوف)، Logout، Register طالب/مرشد، OTP resend/verify، forgot/reset، restore، remember-me.

**الملفات.** `useLogin.ts`، `useRegisterForm.ts`، `useVerifyForm.ts`، `useVerifyOTPForm.ts`، `useForgetPassForm.ts`، `useResetPassForm.ts`، `useRestoreForm.ts`؛ صفحات Login/register/verifiy/forgetPass/accountRestore؛ `e2e/auth/*` جديد.

**معايير القبول.**
- **Given** بيانات صحيحة، **When** يسجل الدخول، **Then** يصل للوحة الصحيحة والتوكن يُخزَّن حسب سياسة FE-008.
- **Given** بيانات خاطئة، **When** تُرسل، **Then** رسالة خطأ accessible ولا يُخزَّن توكن.
- **Given** حساب غير مفعّل، **When** يفشل الدخول بإشارة unverified، **Then** يُوجَّه إلى `/verify` ويستطيع إعادة OTP.
- **Given** طلب reset، **When** يُتحقق OTP، **Then** كلمة المرور الجديدة تعمل والقديمة تفشل.
- **Given** logout، **When** يكتمل، **Then** المسارات المحمية تحوّل لتسجيل الدخول.

**DoD.** كل حالات auth آلية؛ خضراء في CI وstaging؛ بيانات الاختبار موثقة؛ لا PII حقيقية.

**التبعيات.** FE-006، FE-008، FE-012. يحجب FE-020.

**الدليل.** مجموعات Unit + E2E، تقرير CI، تشغيل staging.

### FE-014 — رحلات الأدوار الحرجة وحالات الفشل E2E

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-03 |
| الأولوية / الجهد | P1 / 4–6 pd · ثقة متوسطة |
| المالك / المراجع / QA | QA / Tech Lead / QA |

**المشكلة.** لا E2E لـ explore → enroll، محتوى التعلم، تسليم assignment/project، تقييم المرشد، quiz، تفعيل mentorship، إدارة users/payments. لا اختبارات فشل للـfetch والـ15s timeout.

**الهدف.** أتمتة الرحلات الحرجة للتعلم/الإيراد وحالات الفشل.

**النطاق.** الطالب: explore/filter، enroll، learning، submit، quiz، review. المرشد: create/edit، activate، students، grade، session. الإدارة: users، badges، payments، issues. الفشل: 500، timeout، offline، 401.

**الملفات.** `src/pages/student-pages/**`، `src/pages/mentor-pages/**`، `src/pages/admin-pages/**`، `src/services/**`؛ `e2e/student`، `e2e/mentor`، `e2e/admin`، `e2e/failure`.

**معايير القبول.**
- **Given** طالب لديه mentorship نشط، **When** يسلّم assignment، **Then** تتحدث الحالة ويرى المرشد التسليم.
- **Given** مرشد يفتح project، **When** يقيّم تسليماً، **Then** يرى الطالب الدرجة.
- **Given** API يعيد 500، **When** تُحمّل قائمة، **Then** تظهر حالة خطأ مع retry (لا شاشة بيضاء).
- **Given** الشبكة offline، **When** يتصرف المستخدم، **Then** تظهر رسالة offline/timeout ولا يتعلّق التطبيق.
- **Given** زائر، **When** يزور مساراً محمياً، **Then** يُحوَّل لتسجيل الدخول.

**DoD.** رحلات P0 خضراء على staging؛ اختبارات الفشل حتمية؛ الاختبارات الهشة معزولة بمالك.

**التبعيات.** FE-007، FE-009، FE-012، FE-013، FE-015. يحجب FE-020.

**الدليل.** مجموعات E2E، trace/video عند الفشل، تقرير staging.

---

## FE-EPIC-04 — أداء React والحزمة

**المشكلة:** حجم الحزمة لم يُقس؛ مكتبات ثقيلة eager؛ صور بعيدة تتجاوز التحسين؛ أداء القوائم غير مثبت.

**النتيجة:** ميزانيات مقاسة، تحميل مربوط بالمسار، أصول محسّنة، قوائم متجاوبة.

**تغطية القائمة:** PERF-01…PERF-07.

### FE-016 — تحليل الحزمة وميزانيات الأداء ومراجعة lazy-loading

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-04 |
| الأولوية / الجهد | P1 / 3–4 pd · ثقة متوسطة |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA |

**المشكلة.** لا artifact ولا تقرير حزمة. `App.tsx:10-14` يستورد eager: `AdminDashboard`، `AdminPayment`، `MentorshipOverviewPage`، `AdminUsers`، `ChatbotWidget`؛ الشات في 16 مساراً. `manualChunks` يستهدف `@jitsi` و`sweetalert2` غير المستخدمين. `chunkSizeWarningLimit: 500` غير مفروض.

**الهدف.** قياس الحزمة الحقيقية، إزالة الوزن eager، وفرض الميزانية في CI.

**النطاق.** `rollup-plugin-visualizer`؛ lazy للوحات الإدارة؛ ربط الشات بالمسار؛ إصلاح chunk map؛ Lighthouse mobile لأهم 5 صفحات.

**الملفات.** `vite.config.ts`، `src/App.tsx`، `package.json`، `scripts/analyze-bundle.*`، CI.

**معايير القبول.**
- **Given** بناء production، **When** يعمل analyzer، **Then** كل chunk وحجم gzip مبلغ.
- **Given** الصفحة العامة، **When** تُحمّل كزائر، **Then** لا يُطلب chunk إداري أو شات.
- **Given** PR يزيد JS الأولي فوق الميزانية، **When** يعمل CI، **Then** تفشل مهمة الأداء.
- **Given** ملف mobile مُقيّد، **When** تُقاس أهم 5 صفحات، **Then** تُسجل LCP/INP/CLS مقابل الأهداف.

**DoD.** الميزانية موثقة؛ analyzer في CI؛ eager imports محذوفة؛ تقرير Lighthouse مؤرشف.

**التبعيات.** FE-001، FE-005. يغذي FE-018 وFE-023.

**الدليل.** تقرير analyzer، config الميزانية، Lighthouse JSON، جدول قبل/بعد.

### FE-017 — أداء الرندر والقوائم الكبيرة

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-04 |
| الأولوية / الجهد | P2 / 3–5 pd · ثقة متوسطة |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA |

**المشكلة.** 116 `useEffect` و105 memoization؛ لا profiling. 4 تطبيقات `Pagination`. جداول ترندر المصفوفة كاملة؛ قوائم الشات/الإشعارات تنمو بلا حد. Contexts عالمية تغلف التطبيق.

**الهدف.** تقليل الرندر غير الضروري وإبقاء القوائم الكبيرة متجاوبة.

**النطاق.** React DevTools profiling للوحات/الشات/الجداول؛ تقسيم contexts؛ تثبيت selectors؛ توحيد pagination؛ virtualization عند الحاجة.

**الملفات.** `src/context/*`، `src/components/common/Pagination/Pagination.tsx`، نسخ pagination بالأدوار، مكونات chat/notification/table.

**معايير القبول.**
- **Given** جدول 1000 صف، **When** paginate/filter، **Then** التفاعل <100ms على الجهاز المرجعي.
- **Given** إشعار socket، **When** يصل، **Then** يتحدث badge/القائمة فقط (دليل profiler).
- **Given** الكود، **When** البحث عن pagination، **Then** مكوّن واحد مشترك (أو استثناءات موثقة).

**DoD.** profiles قبل/بعد مرفقة؛ لا انحدار وظيفي؛ pagination موحدة.

**التبعيات.** FE-016. بالتوازي مع FE-018.

**الدليل.** لقطات profiler، PR، المكوّن الموحد.

### FE-018 — مراجعة تحسين الصور والأصول

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-04 |
| الأولوية / الجهد | P2 / 2–3 pd · ثقة عالية |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA |

**المشكلة.** تحسين وقت البناء مُعد، لكن 87 `<img>` تشمل روابط Unsplash/pravatar/ui-avatars بعيدة تتجاوزه؛ `OptimizedImage` تبنّيه جزئي؛ الأبعاد/srcset غير متسقة؛ favicon ما زال `vite.svg`.

**الهدف.** تقديم صور محلية بحجم مناسب وأبعاد محددة.

**النطاق.** مراجعة أهم 10 صفحات؛ استبدال الصور البعيدة؛ فرض الأبعاد؛ srcset للـhero/cards؛ favicon بهوية العلامة.

**الملفات.** `public/*`، `src/assets/**`، `src/components/common/OptimizedImage.tsx`، `src/components/home/**`، `src/utils/constants.ts`، `index.html`.

**معايير القبول.**
- **Given** الصفحة الرئيسية، **When** تُدقق في Lighthouse، **Then** لا صورة بلا أبعاد وCLS من الصور = 0.
- **Given** ملف 3G، **When** يُحمّل hero، **Then** يُقدَّم المتغير المناسب.
- **Given** بناء production، **When** تُفحص الشبكة، **Then** لا طلب إلى `i.pravatar.cc`/`ui-avatars.com`.

**DoD.** الصفحات مدققة؛ الأصول مستبدلة؛ التقرير مرفق؛ favicon/العلامة مصححة.

**التبعيات.** FE-016. بالتوازي مع FE-017 وFE-023.

**الدليل.** Lighthouse قبل/بعد، قائمة الأصول، PR.

---

## FE-EPIC-05 — إعداد الإنتاج والنشر

**المشكلة:** لا إعداد استضافة. `BrowserRouter` deep links سترجع 404 على استضافة ثابتة، وسياسة cache/security headers غير معرّفة.

**النتيجة:** نشر staging/production قابل للتكرار مع SPA rewrite وimmutable caching وHTTPS وdeep links متحققة.

**تغطية القائمة:** DEP-01…DEP-08، UX-04.

### FE-019 — إعداد استضافة SPA (rewrite/cache/security headers)

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task (مسارات عمل داخلية: FE-019A host config، FE-019B cache/headers) / FE-EPIC-05 |
| الأولوية / الجهد | **P0** / 2–3 pd · ثقة متوسطة (المضيف غير معروف) |
| المالك / المراجع / QA | DevOps + Frontend Dev / Tech Lead / QA |

**المشكلة.** لا `netlify.toml`، `vercel.json`، `Dockerfile`، nginx، `web.config`، أو `404.html`. `BrowserRouter` يحتاج catch-all rewrite. `vite.config.ts` بلا `base`. `sourcemap: false`. `robots.txt` يشير إلى sitemap غير موجود.

**الهدف.** إعداد جاهز للمضيف لـstaging وproduction.

**النطاق.**
- `FE-019A`: host config (rewrite `/* → /index.html`، `base` لو subpath، build/output).
- `FE-019B`: cache (`index.html` no-store/no-cache؛ الأصول ذات hash `immutable, max-age=31536000`)، gzip/brotli، security headers (CSP draft، HSTS، `X-Content-Type-Options`، `Referrer-Policy`، frame-ancestors)، sitemap/favicon.

**الملفات.** ملف/ملفات الاستضافة الجديدة، `vite.config.ts` (`base`)، `index.html`، `public/robots.txt`، `public/sitemap.xml`.

**معايير القبول.**
- **Given** طلب مباشر إلى `/mentor/dashboard`، **When** يخدمه المضيف، **Then** HTTP 200 ويعيد SPA shell ويُرندر المسار (أو يحوّل لتسجيل الدخول).
- **Given** أصل ذو hash، **When** يُطلب، **Then** `Cache-Control: public, max-age=31536000, immutable`.
- **Given** `index.html`، **When** يُطلب، **Then** لا يُخزَّن طويلاً.
- **Given** استجابة production، **When** تُفحص الهيدرز، **Then** HSTS و`nosniff` موجودان ولا mixed content.

**DoD.** config مدموج؛ staging متحقق بـ`curl -I`؛ مصفوفة deep links ناجحة؛ runbook محدث.

**التبعيات.** FE-006. **خارجي:** اختيار المضيف، DNS، TLS.

**الدليل.** host config، لقطات الهيدرز، نتائج deep links، runbook.

### FE-020 — نشر staging وحزمة smoke بعد النشر

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-05 (تحقق الإصدار في FE-EPIC-07) |
| الأولوية / الجهد | **P0** / 2–3 pd · ثقة متوسطة |
| المالك / المراجع / QA | QA + DevOps / Tech Lead / QA |

**المشكلة.** لا staging ولا pipeline ولا smoke ولا دليل post-deploy. المسار الموثق ينتهي عند `npm run build`.

**الهدف.** نشر release candidate على staging وإثبات smoke pack.

**النطاق.** pipeline نشر؛ متغيرات بيئة؛ smoke (public، auth، 3 لوحات، API health، deep links، console/network)؛ التقاط الأدلة.

**الملفات.** CI/CD workflow، `e2e/smoke/*`، `frontend-release-approval.md`.

**معايير القبول.**
- **Given** commit الإصدار، **When** يُنشر staging، **Then** hash الأصل المنشور يطابق artifact CI.
- **Given** smoke pack، **When** يُنفَّذ، **Then** كل فحوص P0 تمر وصفر أخطاء console غير متوقعة.
- **Given** API host معطوب، **When** يعمل smoke، **Then** يفشل بتشخيص واضح (negative control).

**DoD.** رابط staging + تقرير smoke مرفق؛ المشاكل المعروفة مسرودة؛ release candidate مجمّد.

**التبعيات.** FE-002، FE-006، FE-007، FE-008، FE-009، FE-013، FE-014، FE-019. يحجب FE-026.

**الدليل.** رابط staging، تقرير smoke، لقطات، HAR.

---

## FE-EPIC-06 — الواجهة المتجاوبة وa11y والمتصفحات

**المشكلة:** لا دليل أجهزة/متصفحات؛ 32 مودالاً بلا dialog semantics؛ النماذج بلا ربط labels؛ واجهة مختلطة مع `lang="en"` وتواريخ `en-US`.

**النتيجة:** خط أساس متجاوب/a11y مُختبر ومصفوفة متصفحات موثقة.

**تغطية القائمة:** UX-01، UX-02، UX-05، UX-06، UX-07.

### FE-022 — معالجة Accessibility (dialogs/forms/names/keyboard)

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-06 |
| الأولوية / الجهد | P1 / 4–6 pd · ثقة متوسطة |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA |

**المشكلة.** 32 مكوّن مودال، **0** فيها `role="dialog"`/`aria-modal`/focus trap. 143 input مقابل 4 `htmlFor`. 556 button مقابل 59 `aria-*`. `tabIndex` واحد فقط. focus-visible عام موجود. `html lang="en"` مع نصوص عربية.

**الهدف.** تحقيق حد WCAG 2.1 AA عملي للكيبورد وقارئ الشاشة.

**النطاق.** `Modal` مشترك بـfocus trap/ESC/restore؛ ربط labels؛ أسماء أزرار الأيقونات؛ landmarks/headings؛ skip link؛ contrast؛ `lang`/`dir`.

**الملفات.** 32 مكوّن مودال؛ `src/components/common/*`؛ نماذج auth/mentor/student/admin؛ `index.html`؛ `src/index.css`.

**معايير القبول.**
- **Given** مودال مفتوح، **When** استخدام الكيبورد فقط، **Then** ينتقل التركيز للداخل ويُحبس، ESC يغلق، والتركيز يعود للزر.
- **Given** أي input، **When** يُفحص، **Then** له label مرتبط أو `aria-label`.
- **Given** زر أيقونة فقط، **When** يُفحص، **Then** له اسم accessible.
- **Given** أهم 10 صفحات، **When** تُفحص بـaxe، **Then** صفر critical.

**DoD.** primitive معتمد؛ تقرير axe مرفق؛ تسجيل walkthrough بالكيبورد؛ قاعدة lint مفعلة.

**التبعيات.** FE-002 (lint)، FE-012 (harness). بالتوازي مع FE-023.

**الدليل.** PRs، تقرير axe، سكريبت/نتائج الكيبورد.

### FE-023 — مصفوفة التجاوب والمتصفحات

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-06 |
| الأولوية / الجهد | P2 / 2–3 pd · ثقة متوسطة |
| المالك / المراجع / QA | QA / Tech Lead / QA |

**المشكلة.** 849 استخدام responsive لكن لا دليل أجهزة؛ جداول `min-w-[800px]`؛ `target: 'esnext'`؛ لا `browserslist`؛ لا بيان متصفحات مدعومة.

**الهدف.** تعريف وتحقق المصفوفة المدعومة.

**النطاق.** قرار منتج بالمتصفحات؛ `browserslist` + target؛ إصلاحات nav/tables/modals؛ smoke cross-browser.

**الملفات.** `package.json` (`browserslist`)، `vite.config.ts` (`target`)، مكونات layout/nav/table، `frontend-qa-test-matrix.md`.

**معايير القبول.**
- **Given** عرض 360px، **When** عرض كل صفحة رئيسية، **Then** لا تمرير أفقي إلا لجدول مقصود، والتنقل متاح.
- **Given** قائمة المتصفحات المدعومة، **When** يعمل smoke على كل منها، **Then** لا أخطاء syntax/runtime.
- **Given** viewport تابلت، **When** يُفتح مودال، **Then** يتسع ويمرر داخلياً.

**DoD.** المصفوفة موثقة؛ target متوافق؛ العيوب مصلحة أو بتذاكر؛ الدليل مرفق.

**التبعيات.** FE-016، FE-022. بالتوازي مع FE-018.

**الدليل.** مستند المصفوفة، لقطات، Playwright projects.

### FE-024 — اتساق اللغة واللوكال والتاريخ والمنطقة الزمنية

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-06 |
| الأولوية / الجهد | P3 / 2–4 pd · ثقة منخفضة (قرار منتج) |
| المالك / المراجع / QA | Frontend Dev / Product Owner / QA |

**المشكلة.** `html lang="en"`؛ نصوص عربية/إنجليزية مختلطة؛ `toLocaleDateString('en-US')` في `useMentorships.ts:48`؛ `toLocaleTimeString('en-US')` في `Usehomepage.ts`؛ لا تحويل timezone للمواعيد/المواعيد النهائية.

**الهدف.** جعل سلوك اللغة/اللوكال متعمداً وصحيحاً.

**النطاق.** قرار اللغة؛ formatter مشترك؛ timezone للمواعيد/المواعيد النهائية؛ `lang`/`dir`؛ تدقيق النصوص.

**الملفات.** `index.html`، `src/utils/formatTimeago.ts`، `src/hooks/useMentorships.ts`، `src/hooks/student-roleHooks/Usehomepage.ts`، مكونات timeline/session.

**معايير القبول.**
- **Given** مستخدم في UTC+3، **When** يُعرض موعد جلسة، **Then** يطابق وقته المحلي ومُوسم.
- **Given** محتوى عربي، **When** يُعرض، **Then** `lang`/`dir` يطابقان المحتوى (أو قرار لغة واحدة موثق).
- **Given** نص تاريخ، **When** يُنسَّق، **Then** يستخدم formatter المشترك لا `toLocale*` متفرقة.

**DoD.** القرار مسجل؛ formatter معتمد؛ اختبارات DST/timezone؛ التوثيق محدث.

**التبعيات.** قرار منتج. بالتوازي مع FE-022/023.

**الدليل.** مذكرة قرار، formatter + اختبارات، PR.

---

## FE-EPIC-07 — معالجة الأخطاء والمراقبة واعتماد الإصدار

**المشكلة:** لا error boundary، لا تتبع أخطاء، لا smoke pack، لا rollback. أي فشل إنتاج سيكون غير مرئي وغير قابل للاستعادة إجرائياً.

**النتيجة:** الأعطال محتواة ومبلّغة ومتواصلة وقابلة للاستعادة.

**تغطية القائمة:** MON-01…MON-06، REL-01…REL-06، QA-04، QA-07.

### FE-015 — Error boundaries وUX offline/timeout واستعادة 404

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-07 |
| الأولوية / الجهد | P1 / 2–3 pd · ثقة عالية |
| المالك / المراجع / QA | Frontend Dev / Tech Lead / QA |

**المشكلة.** لا `ErrorBoundary`/`componentDidCatch`. خطأ render يفرّغ التطبيق. `NotFound` يستخدم `navigate(-1)` وقد يلوّب عند الفتح المباشر. `fetch` المباشر بلا timeout؛ `refetchOnReconnect: false`؛ لا offline banner.

**الهدف.** احتواء أخطاء الرندر، توصيل فشل الشبكة، ومسار استعادة موثوق.

**النطاق.** Error boundary على مستوى المسار + fallback عام؛ offline/timeout banner؛ 404 بـCTA للرئيسية؛ retry؛ ربط الإبلاغ بـFE-021.

**الملفات.** `src/App.tsx`، `src/main.tsx`، `src/pages/NotFound.tsx`، `src/components/common/ErrorState.tsx`، `src/services/api.ts`، `src/components/common/ErrorBoundary.tsx` (جديد).

**معايير القبول.**
- **Given** مكوّن يرمي خطأ، **When** يُرندر، **Then** يعرض fallback فيه "Reload" و"Go home" ويبقى shell قابلاً للاستخدام.
- **Given** المتصفح offline، **When** يفشل طلب، **Then** تظهر رسالة offline مع retry.
- **Given** طلب يتجاوز 15s، **When** يُلغى، **Then** تظهر رسالة timeout لا spinner.
- **Given** زيارة URL غير معروف، **When** يُعرض 404، **Then** "Go home" يذهب إلى `/` بلا حلقة history.

**DoD.** boundary + offline UX مدموجان؛ اختبارات throw/timeout/offline؛ hook الإبلاغ موصول.

**التبعيات.** FE-012. يحجب FE-014 (اختبارات الفشل) وFE-021 (مصب الإبلاغ).

**الدليل.** PR، دليل اختبارات، لقطات.

### FE-021 — تتبع الأخطاء ومراقبة الفرونت

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-07 |
| الأولوية / الجهد | P1 / 2–3 pd · ثقة متوسطة |
| المالك / المراجع / QA | Frontend Dev + DevOps / Tech Lead / QA |

**المشكلة.** لا Sentry/Datadog/Rollbar/LogRocket؛ لا Web Vitals؛ `sourcemap: false`؛ لا حدود تنبيه.

**الهدف.** اكتشاف وتشخيص أخطاء الإنتاج وانحدارات الأداء.

**النطاق.** اختيار أداة (Sentry بافتراض)؛ init بـenv/release؛ رفع sourcemaps بشكل خاص؛ التقاط boundary وأخطاء API؛ Web Vitals؛ حدود تنبيه؛ سياسة PII.

**الملفات.** `src/main.tsx`، `src/components/common/ErrorBoundary.tsx`، `src/services/api.ts`، `vite.config.ts`، CI، `.env.example`.

**معايير القبول.**
- **Given** خطأ قسري على staging، **When** يحدث، **Then** يظهر event فيه release/route/browser/stack مربوط بالمصدر.
- **Given** payload حدث، **When** يُفحص، **Then** لا token/email/password.
- **Given** LCP يتجاوز الحد، **When** يُراقب، **Then** ينطلق تنبيه لقناة on-call.

**DoD.** instrumentation حي على staging؛ رابط dashboard مشترك؛ اختبار تنبيه مسجل؛ مراجعة خصوصية.

**التبعيات.** FE-015، FE-019. يغذي FE-026.

**الدليل.** Dashboard، إعداد التنبيه، إثبات رفع sourcemap، مذكرة خصوصية.

### FE-026 — Go/No-Go وrollback والتحقق بعد النشر

| الحقل | القيمة |
|---|---|
| النوع / Epic | Task / FE-EPIC-07 |
| الأولوية / الجهد | **P0** / 1–2 pd · ثقة عالية |
| المالك / المراجع / QA | Tech Lead + DevOps / Release Approver / QA |

**المشكلة.** لا rollback ولا معايير إصدار ولا عملية تحقق post-deploy. هدف الاستضافة غير محدد، فآلية الاحتفاظ بالـartifact والrollback غير معروفة.

**الهدف.** جعل قرار الإصدار مبنياً على دليل وقابلاً للاستعادة.

**النطاق.** تعبئة `frontend-release-approval.md`؛ تحديد artifact retention؛ تمرين rollback على staging؛ أدوار الحادث؛ مراقبة ما بعد النشر.

**الملفات.** `frontend-release-approval.md`، CI/CD، قسم runbook.

**معايير القبول.**
- **Given** فشل فحص smoke، **When** يُعقد اجتماع الإصدار، **Then** القرار NO-GO ويسجل checklist الدليل الفاشل.
- **Given** إصدار سيئ، **When** يُفعَّل rollback، **Then** يعود الـartifact السابق للعمل خلال RTO المتفق ويُتحقق بـsmoke.
- **Given** اعتماد الإصدار، **When** يُوقَّع، **Then** كل بند P0 له رابط دليل ومالك.

**DoD.** checklist موقّع؛ تمرين rollback مسجل؛ خطة المراقبة مسندة؛ release notes مسودة.

**التبعيات.** كل مهام P0؛ FE-020، FE-021.

**الدليل.** اعتماد موقّع، سجل rollback، جدول المناوبة.

---

## 6. مصفوفة اختبار QA — 53 حالة

المصفوفة هي التعريف القابل للتنفيذ لكلمة "مُتحقق". البند لا يصبح PASS حتى تُنفَّذ الحالة في البيئة المحددة ويُرفق دليلها. **لا توجد حالة منفذة اليوم** — هذه تعريفات، وليست نتائج.

**البيئات:** `LOCAL` تطوير · `CI` حاوية نظيفة · `STG` staging · `PRD` إنتاج.
**الاختصارات:** V Vitest · R RTL · P Playwright · C CI/script · M يدوي.
**الحاجب:** Yes حاجب إصدار · No مطلوب غير صلب · Ext دليل خارجي.

### بيانات الاختبار المطلوبة

| Fixture | الغرض |
|---|---|
| `student.active` | طالب موثّق لديه enrollment وإشعار |
| `student.empty` | طالب بلا enrollments (empty states) |
| `mentor.active` | مرشد لديه mentorship وطالب وتسليم |
| `admin.active` | أدمن لديه users/payments/issues/configurations |
| `user.unverified` | حساب مسجل وغير موثّق بالبريد |
| `token.expired` | JWT صالح البنية و`exp` في الماضي |
| `token.malformed` | نص غير JWT في `localStorage.token` |
| `role.tampered` | توكن طالب مع `userRole=ROLE_ADMIN` يدوياً |
| `list.1000` | 1000 صف لاختبار الجداول |
| `api.down` / `api.slow` | API متوقف / متأخر فوق 15s |

### أ. البناء والتحقق الساكن (5)

| ID | السيناريو | المتوقع | المهمة | الحاجب |
|---|---|---|---|---|
| TC-BLD-01 | تثبيت نظيف وtypecheck | `npm ci` و`npm run typecheck` يخرجان 0؛ صفر أخطاء TS؛ log بالـSHA | FE-001, FE-002 | Yes |
| TC-BLD-02 | بوابة lint | فرع نظيف 0 أخطاء؛ فرع فيه متغير غير مستخدم يفشل | FE-001, FE-002 | Yes |
| TC-BLD-03 | بناء production وartifact | build 0؛ `dist` فيه HTML وأصول hash؛ preview يعمل بلا console errors؛ checksum مسجل | FE-001, FE-002 | Yes |
| TC-BLD-04 | بوابة ثغرات الاعتماديات | high/critical = 0 أو سجل accepted risk بمالك/تاريخ | FE-025 | Yes |
| TC-BLD-05 | فحص الأسرار وآثار التطوير | لا أسرار؛ لا localhost في `dist`؛ لا console غير محمي | FE-003, FE-011 | Yes |

### ب. المصادقة والجلسة (8)

| ID | السيناريو | المتوقع | المهمة | الحاجب |
|---|---|---|---|---|
| TC-AUTH-01 | دخول طالب ناجح | تحويل للوحة الطالب؛ الاسم/الصورة؛ لا توكن في URL/console | FE-008, FE-013 | Yes |
| TC-AUTH-02 | بيانات خاطئة | رسالة آمنة؛ يبقى على `/login`؛ لا توكن | FE-008, FE-013 | Yes |
| TC-AUTH-03 | تحقق نموذج الدخول | رسائل حقول؛ focus لأول خطأ؛ لا طلب شبكة؛ ربط برمجي | FE-013, FE-022 | Yes |
| TC-AUTH-04 | Remember-me مغلق | الجلسة لا تستمر بعد إغلاق التاب؛ تحويل لتسجيل الدخول | FE-008 | Yes |
| TC-AUTH-05 | Remember-me مفتوح | استعادة مرة واحدة؛ اللوحة الصحيحة؛ تحويل واحد بلا حلقة | FE-008 | Yes |
| TC-AUTH-06 | توكن منتهي | مسح الجلسة مرة واحدة؛ `/login` برسالة انتهاء؛ لا 401 storm | FE-008 | Yes |
| TC-AUTH-07 | Logout وعزل زر الرجوع | التخزين يمسح؛ الرجوع لا يعرض محتوى؛ الزيارة المباشرة تحوّل | FE-008, FE-009 | Yes |
| TC-AUTH-08 | حفظ deep link بعد الدخول | العودة للمسار المطلوب أو افتراضي آمن؛ لا open redirect | FE-009, FE-013 | No |

### ج. الأدوار والتوجيه (6)

| ID | السيناريو | المتوقع | المهمة | الحاجب |
|---|---|---|---|---|
| TC-ROLE-01 | طالب لا يدخل منطقة المرشد | تحويل للوحة الطالب؛ لا shell/بيانات مرشد | FE-009 | Yes |
| TC-ROLE-02 | مرشد لا يدخل طالب/إدارة | تحويل للوحة المرشد؛ لا تنقل إداري | FE-009 | Yes |
| TC-ROLE-03 | مسارات الإدارة | كل URL يعرض صفحة واحدة؛ لا "Coming Soon"؛ sidebar صحيح | FE-009 | Yes |
| TC-ROLE-04 | مسار غير معروف → 404 التطبيق | صفحة NotFound برابط رئيسية؛ لا شاشة بيضاء | FE-009, FE-019 | Yes |
| TC-ROLE-05 | الدور المعدّل UX فقط | قد يظهر shell، لكن كل API إداري 401/403 ولا بيانات | FE-009 + Backend | Yes (Ext) |
| TC-ROLE-06 | بوابة hydration | لا وميض محتوى محمي قبل hydration؛ تحويل واحد | FE-009 | No |

### د. الرحلات الأساسية (5)

| ID | السيناريو | المتوقع | المهمة | الحاجب |
|---|---|---|---|---|
| TC-JRN-01 | تسجيل → تحقق بريد → دخول | حساب ينشأ؛ التحقق ينجح؛ الدخول للوحة؛ التكرار خطأ آمن | FE-014 | Yes |
| TC-JRN-02 | نسيت/إعادة تعيين كلمة المرور | تأكيد؛ القديمة تفشل؛ الجديدة تعمل؛ التوكن مرة واحدة وينتهي | FE-014 | Yes |
| TC-JRN-03 | تصفح والتسجيل في mentorship | البيانات مطابقة؛ enrollment مرة واحدة؛ التكرار ممنوع؛ الرصيد يتحدث | FE-014 | Yes |
| TC-JRN-04 | مرشد ينشئ وينشر mentorship | التحقق يمنع الناقص؛ المسودة تحفظ؛ المنشور يظهر للطالب؛ التعديل يحفظ | FE-014 | Yes |
| TC-JRN-05 | شاشات users/payment للإدارة | الصفوف تطابق seed؛ pagination؛ الفلتر يعيد للصفحة 1؛ الإجمالي متسق | FE-014, FE-017 | Yes |

### هـ. فشل API/offline/timeout (5)

| ID | السيناريو | المتوقع | المهمة | الحاجب |
|---|---|---|---|---|
| TC-API-01 | 5xx على صفحة رئيسية | حالة خطأ مع retry؛ لا شاشة بيضاء؛ طلب واحد جديد؛ لا حلقة؛ يبلّغ للمراقبة | FE-015, FE-021 | Yes |
| TC-API-02 | انتهاء المهلة | timeout مميز عن خطأ السيرفر؛ UI متفاعل؛ retry ينجح؛ لا mutation مكررة | FE-015 | Yes |
| TC-API-03 | Offline ثم reconnect | banner/حالة offline؛ لا unhandled rejection؛ عند العودة refetch أو refresh واضح | FE-015 | Yes |
| TC-API-04 | مجموعة فارغة | empty state محدد مع إجراء تالٍ؛ لا spinner دائم؛ لا "undefined" | FE-015, FE-014 | No |
| TC-API-05 | فشل mutation لا يفسد UI | rollback أو لا تطبيق متفائل؛ toast آمن؛ الزر يعود؛ لا صف مكرر | FE-015, FE-014 | Yes |

### و. النماذج والتحقق (3)

| ID | السيناريو | المتوقع | المهمة | الحاجب |
|---|---|---|---|---|
| TC-FORM-01 | حقول مطلوبة وصيغ | رسالة لكل حقل؛ الإرسال ممنوع؛ تختفي عند التصحيح؛ ترتيب focus منطقي | FE-022, FE-014 | Yes |
| TC-FORM-02 | قيود رفع الملفات | نوع/حجم غير مدعوم مرفوض برسالة؛ الصالح يعاين؛ تقدم/فشل ظاهر | FE-014 | No |
| TC-FORM-03 | منع الإرسال المزدوج | mutation واحدة؛ الزر معطل أثناء الانتظار؛ سلوك مغادرة متسق | FE-014, FE-015 | No |

### ز. Accessibility (5)

| ID | السيناريو | المتوقع | المهمة | الحاجب |
|---|---|---|---|---|
| TC-A11Y-01 | رحلة بالكيبورد فقط | كل عنصر reachable بترتيب منطقي؛ focus ظاهر؛ لا trap؛ overlays تغلق بـESC | FE-022 | Yes |
| TC-A11Y-02 | دلالات المودال | `role="dialog"` + `aria-modal` + اسم؛ focus داخلي محبوس؛ يعود للزر | FE-022 | Yes |
| TC-A11Y-03 | Labels وأخطاء النماذج | label برمجي لكل input؛ `aria-describedby`/`aria-invalid`؛ required معلن | FE-022 | Yes |
| TC-A11Y-04 | بدائل الصور والأيقونات | alt ذو معنى؛ زخرفي `alt=""`؛ أزرار الأيقونات بأسماء؛ axe critical/serious = 0 | FE-022 | Yes |
| TC-A11Y-05 | التباين وتقليل الحركة | نص ≥4.5:1؛ كبير ≥3:1؛ reduced-motion محترم؛ focus ظاهر | FE-022 | No |

### ح. التجاوب والمتصفحات (3)

| ID | السيناريو | المتوقع | المهمة | الحاجب |
|---|---|---|---|---|
| TC-RSP-01 | موبايل 360×640 | لا تمرير أفقي؛ لا قص؛ أهداف لمس ≥44px؛ تنقل متاح | FE-023 | Yes |
| TC-RSP-02 | تابلت/ديسكتوب | إعادة تدفق بلا تداخل؛ جداول تمرر/تتكدس؛ sidebars صحيحة | FE-023 | No |
| TC-RSP-03 | Smoke متعدد المتصفحات | نفس النتيجة في Chrome/Edge/Firefox/Safari؛ لا أخطاء خاصة بمحرك | FE-023 | Yes |

### ط. الأداء (4)

| ID | السيناريو | المتوقع | المهمة | الحاجب |
|---|---|---|---|---|
| TC-PRF-01 | Lighthouse mobile | تسجيل النتائج لـ5 مسارات؛ LCP ≤2.5s، CLS ≤0.1، INP ≤200ms (اقتراح) | FE-016 | Yes |
| TC-PRF-02 | ميزانية الحزمة | JS أولي ≤250KB gzip (اقتراح)؛ لا chunk لمكتبة غير مستوردة | FE-016 | Yes |
| TC-PRF-03 | تقسيم المسارات | لا تحميل admin/chatbot على الصفحة العامة؛ chunk عند التنقل | FE-016 | No |
| TC-PRF-04 | جدول 1000 صف | لا تجمّد؛ تفاعل <100ms؛ pagination تحد الصفوف؛ ذاكرة مستقرة | FE-017 | No |

### ي. المحتوى وأمان العميل (4)

| ID | السيناريو | المتوقع | المهمة | الحاجب |
|---|---|---|---|---|
| TC-SEC-01 | XSS الشات | لا تنفيذ سكريبت؛ HTML خطر معقّم أو نص؛ روابط محدودة البروتوكول | FE-010 | Yes |
| TC-SEC-02 | محتوى عارض الملفات | لا سكريبت طرف ثالث غير مثبت؛ sandbox؛ أسماء ملفات مهرّبة؛ CSP بلا unsafe-eval | FE-010, FE-019 | Yes |
| TC-SEC-03 | اتساق auth header | نفس scheme في كل الطلبات المحمية؛ لا طلب بلا auth؛ لا توكن في query | FE-007 | Yes |
| TC-SEC-04 | حزمة الإنتاج بلا أسرار/hosts تطوير | لا localhost/ngrok/مفاتيح؛ sourcemaps غائبة أو محمية؛ `VITE_*` عامة فقط | FE-006, FE-011 | Yes |

### ك. النشر والإصدار (5)

| ID | السيناريو | المتوقع | المهمة | الحاجب |
|---|---|---|---|---|
| TC-DEP-01 | مصفوفة deep links | 10 مسارات direct load + refresh ترجع 200 وتعرض shell؛ غير المعروف 404 التطبيق | FE-019 | Yes |
| TC-DEP-02 | Cache headers | `index.html` no-cache؛ الأصول immutable سنة؛ نشر جديد يخدم HTML جديد | FE-019 | Yes |
| TC-DEP-03 | Security headers وHTTPS | HTTPS بشهادة صالحة؛ HSTS؛ nosniff؛ لا mixed content؛ CSP لا يكسر التطبيق | FE-019 | Yes |
| TC-DEP-04 | Smoke إنتاج | كل الصفحات؛ دخول؛ قراءة وكتابة آمنة؛ لا CORS/5xx؛ حدث اختباري للمراقبة | FE-020, FE-021 | Yes |
| TC-DEP-05 | تمرين rollback | العودة للنسخة السابقة خلال RTO ≤15 دقيقة (اقتراح)؛ smoke ينجح؛ التوقيتات مسجلة | FE-026 | Yes |

---

## 7. الأدوار ومسؤوليات التسليم

| الكود | الدور | المسؤولية | التخصيص |
|---|---|---|---|
| PO | Product Owner | الأولوية، النطاق، أثر المستخدم، قبول المخاطر، مدخل go/no-go | 10–15% |
| FD | Frontend Developer | التنفيذ، الاختبارات، الأدلة، إصلاح العيوب | 2–3 بدوام كامل |
| TL | Tech Lead / Reviewer | المعمارية، المراجعة، التوقيع التقني، المعايير | 1 بنسبة 50% |
| QA | QA Engineer | تصميم/تنفيذ الاختبارات، الانحدار، حزمة الأدلة، فرز العيوب | 1 بنسبة 80% |
| DO | DevOps / Release Engineer | CI/CD، الاستضافة، DNS/TLS، الهيدرز، البيئات، rollback | 1 بنسبة 40% |
| BE | Backend Engineer (خارجي) | عقد API، auth، CORS، دليل التفويض، refresh | حسب الطلب |
| SEC | Security Reviewer | مراجعة التوكن/XSS/الاعتماديات/الأسرار | حسب الطلب |
| RA | Release Approver | رئاسة go/no-go، توقيع القرار، التصعيد | 1 |

### حقوق القرار

| القرار | يقرر | يُستشار | يُبلَّغ |
|---|---|---|---|
| نطاق/أولوية الإصدار | PO | TL, QA, DO | الكل |
| النهج التقني والمعايير | TL | FD, DO | PO |
| كفاية تغطية الاختبار | QA | TL | PO |
| هدف الاستضافة وآلية rollback | DO | TL, PO | الكل |
| قبول المخاطر الأمنية | SEC + PO | TL | RA |
| Go/no-go | RA | PO, TL, QA, DO, SEC | الكل |
| تغيير عقد الـBackend | BE | FD, TL | PO |

لا يجوز لشخص واحد أن ينفّذ ويعتمد تغيير P0. لو الفريق أقل من 3 مهندسين، يجب أن يكون RA خارج ثنائي التنفيذ، ويُسجل ذلك في تذكرة الإصدار.

### RACI حسب مسار العمل

| المسار | PO | FD | TL | QA | DO | BE | SEC | RA |
|---|---|---|---|---|---|---|---|---|
| EPIC-01 جودة/بناء | I | R | A | C | C | I | I | I |
| EPIC-02 أمان/auth | I | R | A | C | C | C | C | I |
| EPIC-03 اختبارات | I | R | C | A | I | I | I | I |
| EPIC-04 أداء | I | R | A | C | I | I | I | I |
| EPIC-05 نشر | I | C | C | C | A/R | C | I | I |
| EPIC-06 واجهة/a11y | I | R | A | C | I | I | I | I |
| EPIC-07 أخطاء/مراقبة/إصدار | I | R | C | C | C | I | I | A |
| عقد البيئة FE-006 | I | R | A | C | C | C | C | I |
| جلسة FE-008 | I | R | A | C | I | C | C | I |
| حماية المسارات FE-009 | I | R | A | C | I | C | C | I |
| استضافة FE-019 | I | C | C | C | A/R | I | I | I |
| staging/smoke FE-020 | I | C | C | R | A | C | I | I |
| مراقبة FE-021 | I | R | C | C | C | I | I | I |
| go/no-go FE-026 | C | C | C | C | C | I | C | A/R |
| RBAC خارجي SEC-03 | I | C | C | C | I | A/R | C | I |
| CORS خارجي DEP-04 | I | C | I | I | C | A/R | I | I |
| DNS/TLS DEP-05/07 | I | I | I | I | A/R | I | I | I |

**قاعدة:** كل بند خارجي له مالك داخلي يتابعه (FD لعقد auth، DO للاستضافة/DNS، TL للمعمارية). لا تُسند مهام تنفيذ فرونت للفرق الخارجية.

### مراحل سير العمل وبواباتها

```
Backlog → Ready → In Progress → Code Review → CI/Merge → QA على Staging → اعتماد الإصدار → تحقق الإنتاج → Done
```

| البوابة | المالك | شرط الخروج | الدليل |
|---|---|---|---|
| 0 Backlog | PO/TL | تذكرة بنوع/epic/أولوية/مشكلة/دليل | حقول مكتملة + ربط finding/checklist |
| 1 Ready (DoR) | TL | مشكلة بدليل، هدف، نطاق، AC بصيغة Given/When/Then، خطة اختبار، تبعيات، أولوية، تقدير، مالك/مراجع/QA، rollback | تذكرة جاهزة |
| 2 In Progress | FD | فرع من `master`، commits صغيرة، اختبارات مع التغيير، لا أسرار، لا دفع مباشر | PR مفتوح |
| 3 Code Review | TL | PR فيه ما/لماذا، رابط المهمة، لقطات، دليل اختبار، مخاطر/rollback؛ موافقة واحدة | مراجعة معتمدة |
| 4 CI/Merge | FD/DO/TL | كل الفحوص خضراء؛ squash merge | رابط pipeline + checksum |
| 5 QA على Staging | QA | كل الحالات الحاجبة تمر أو استثناء معتمد؛ حزمة أدلة | تقرير + لقطات + SHA |
| 6 اعتماد الإصدار | RA | checklist مكتمل؛ مالك rollback؛ نافذة نشر؛ smoke account؛ مراقبة حية | اعتماد موقّع |
| 7 تحقق الإنتاج | DO/QA | نشر → smoke → هيدرز → حدث مراقبة → مراقبة 24h | deploy log + نتائج |
| 8 Done | TL/RA | AC بدليل، مدموج، اختبارات، QA، توثيق، لا P0/P1 يتيم، rollback موثق | حزمة الأدلة |

### Definition of Ready (DoR)

- [ ] المشكلة تستشهد بدليل متحقق (مسار/سطر/عدد/ملاحظة بيئة).
- [ ] الهدف وأثر المستخدم مذكوران.
- [ ] النطاق وخارج النطاق صريحان.
- [ ] AC بصيغة Given/When/Then وقابلة للاختبار.
- [ ] خطة الاختبار محددة ومربوطة بمعرّفات QA matrix.
- [ ] التبعيات (مهام/Backend/DevOps) مرتبطة؛ لا حجب مخفي.
- [ ] الأولوية P0–P3 متسقة مع ملف الأولويات.
- [ ] التقدير والثقة مسجلان.
- [ ] المالك والمراجع وQA محددون.
- [ ] نهج rollback/feature flag مذكور للتغييرات وقت التشغيل.

### Definition of Done (DoD)

- [ ] AC متحققة بدليل.
- [ ] الكود مدموج في `master`.
- [ ] اختبارات مضافة/محدثة وتنجح في CI.
- [ ] تحقق QA مسجل (أو ملاحظة "غير مرئي للمستخدم، دليل ساكن").
- [ ] التوثيق/runbook محدث عند تغير السلوك أو التشغيل.
- [ ] لا عيب P0/P1 جديد بلا تذكرة.
- [ ] مسار rollback موثق للتغييرات وقت التشغيل.

### قائمة مراجعة PR (مختصرة)

**الصحة:** يطابق التذكرة وAC؛ لا scope creep؛ حالات loading/empty/error/success؛ تنظيف async؛ تأثيرات المسار والحماية.
**الأمان:** لا سر/توكن/email/PII؛ لا `dangerouslySetInnerHTML`/`eval`/`href` غير محقق؛ auth عبر العميل المشترك؛ تهريب مدخلات المستخدم؛ لا ادعاء أن فحص العميل تفويض.
**الجودة:** أنواع ضيقة؛ لا `any` بلا تبرير؛ لا console غير محمي؛ تسمية متسقة؛ a11y (labels/roles/keyboard/focus)؛ تجاوب 360px وديسكتوب.
**الاختبار:** يختبر السلوك لا التنفيذ؛ حالات سلبية/حدية؛ معرّفات QA matrix؛ لا skip بلا تذكرة.
**التشغيل:** env في `.env.example`؛ أثر الحزمة؛ rollback/flag؛ تحديث docs.

### بوابات CI المستهدفة (13)

| # | البوابة | الأمر/الفحص | تمنع الدمج | تمنع الإصدار | المالك |
|---|---|---|---|---|---|
| 1 | تثبيت قابل للتكرار | `npm ci` | نعم | نعم | DO |
| 2 | Type-check | `npm run typecheck` | نعم | نعم | FD |
| 3 | Lint | `npm run lint` | نعم | نعم | FD |
| 4 | Unit/Component | `npm test -- --run` | نعم | نعم | QA |
| 5 | Coverage | `npm run test:coverage` | نعم (ratchet) | نعم | QA |
| 6 | Build | `npm run build` | نعم | نعم | FD |
| 7 | ميزانية الحزمة | size-limit/analyzer | نعم | نعم | TL |
| 8 | فحص الأسرار | gitleaks/trufflehog | نعم | نعم | SEC |
| 9 | Audit | `npm audit --production` high/critical | نعم | نعم | TL |
| 10 | Preview deploy | رابط preview لكل PR | لا | لا | DO |
| 11 | E2E smoke (staging) | Playwright auth+roles | لا على PR | نعم | QA |
| 12 | فحص a11y | axe على المسارات الرئيسية | لا | نعم (critical=0) | QA |
| 13 | الاحتفاظ بالـartifact | رفع `dist` + تقارير 90 يوماً | — | نعم | DO |

**قواعد pipeline:** Node مثبت عبر `.nvmrc`/`engines`؛ cache بـlockfile hash؛ fail fast بالترتيب؛ نشر JUnit/coverage؛ عدم طبع env؛ عدم بناء PRs من forks بأسرار إنتاج؛ artifact الإصدار هو نفسه الذي نجح على staging.

### التسليمات بين الفرق

- **Frontend → QA:** Task ID، PR، merge SHA، staging build ID، ما تغير وما لم يتغير، المسارات/المكونات، حسابات/بيانات، قيود، معرّفات QA matrix، rollback/flag.
- **Backend → Frontend:** روابط API لكل بيئة؛ شكل auth header؛ refresh/expiry؛ شكل أخطاء 401/403/409/422/5xx؛ CORS؛ مصفوفة RBAC وأدلتها؛ rate limits/pagination. **التأكيد الشفهي ليس دليلاً.**
- **DevOps → Frontend:** هدف الاستضافة وآلية النشر؛ حقن env (build/runtime)؛ دعم rewrite/cache؛ DNS/TLS؛ رابط staging؛ rollback/retention/RTO.
- **QA → RA:** النطاق؛ ملخص الاختبارات حسب البيئة؛ العيوب المفتوحة؛ الأداء/a11y مقابل الميزانية؛ المخاطر/الاستثناءات؛ التوصية.
- **Release → Support:** release notes؛ روابط المراقبة والحدود؛ runbook وon-call؛ قناة الحادث والتصعيد.

### الإيقاع والاحتفاظ بالأدلة

- Grooming أسبوعي؛ stand-up يومي 15 دقيقة؛ فرز عيوب يومي أثناء الإصدار؛ مراجعة staging لكل RC؛ go/no-go لكل إصدار؛ مراجعة ما بعد الإصدار خلال 5 أيام.
- تجميد الإصدار: لا دمج غير P0 بعد قطع RC إلا بموافقة RA+TL (اقتراح: 24 ساعة قبل النشر).
- الاحتفاظ: CI/test 90 يوماً؛ `dist` سنة أو 3 إصدارات؛ حزمة QA سنة؛ go/no-go وwaivers سنة؛ الحوادث/rollback سنتان؛ Lighthouse 6 أشهر.
- الأدلة قابلة للربط من التذكرة؛ اللقطات بلا PII حقيقية.

---

## 8. الأولويات والتبعيات والتسلسل

| الأولوية | التعريف | المعالجة |
|---|---|---|
| **P0** | حاجب إصدار. النشر بدونه ينتج بناءً معطوباً أو غير قابل للتحقق أو غير آمن. | يجب الإغلاق قبل go/no-go؛ لا waiver إلا باستثناء موقّع RA+PO لبند غير أمني |
| **P1** | عالي. يؤثر مادياً على الأمان أو الثقة أو الرحلات الأساسية. | مطلوب قبل الإنتاج إلا waiver مكتوب بمالك وتاريخ |
| **P2** | مهم. دين أداء/UX له workaround أو أثر منخفض. | يمكن النشر بعده بتذكرة ومراقبة |
| **P3** | اختياري/يعتمد على قرار منتج. | بعد الإطلاق؛ ليس مدخلاً للإصدار |

| بوابة الإصدار | المعنى |
|---|---|
| **Hard** | يجب الإغلاق بدليل؛ لا waiver للأمان/auth/البناء |
| **Waiver** | مطلوب، لكن استثناء موثق بمالك وتاريخ معالجة ممكن |
| **Post-launch** | مؤجل صراحة؛ يجب ألا يؤثر على سلامة Tier 1 |

### ملخص الأولويات

| الأولوية | المهام | العدد | الجهد (pd) |
|---|---|---:|---:|
| P0 | FE-001, FE-002, FE-003, FE-006, FE-007, FE-008, FE-009, FE-012, FE-019, FE-020, FE-026 | 11 | 21–34 |
| P1 | FE-004, FE-005, FE-010, FE-011, FE-013, FE-014, FE-015, FE-016, FE-021, FE-022, FE-025 | 11 | 25–40 |
| P2 | FE-017, FE-018, FE-023 | 3 | 7–11 |
| P3 | FE-024 | 1 | 2–4 |
| **الإجمالي** | | **26** | **55–89** |

**Tier 1 (حاجب صلب) — 18 مهمة، 36–58 pd:** كل P0 + FE-010، FE-011، FE-013، FE-014، FE-015، FE-021، FE-025.
**Tier 2 (waiver) — 4 مهام، 10–16 pd:** FE-004، FE-005، FE-016، FE-022.
**Tier 3 (بعد الإطلاق) — 4 مهام، 9–15 pd:** FE-017، FE-018، FE-023، FE-024. الحد الأدنى: smoke على Chrome + Safari/iOS قبل الإطلاق حتى لو تأجلت المصفوفة الكاملة.

### جدول المهام الرئيسي

| ID | المهمة | Epic | الأولوية | البوابة | الجهد | يعتمد على | يحجب | المسار | المعلم |
|---|---|---|---|---|---|---|---:|---|---|---|---|
| FE-001 | Baseline + CI | 01 | P0 | Hard | 1–2 | — | 002,012,019,020,026 | A | M0–M1 |
| FE-002 | TS/ESLint + كود ميت | 01 | P0 | Hard | 3–5 | 001 | 004,012,020,022 | A | M1 |
| FE-003 | إزالة console/لوجات | 01 | P0 | Hard | 1–2 | 001 | — | A | M1 |
| FE-004 | TODO/FIXME وUI ميت | 01 | P1 | Waiver | 2–4 | 002 | — | A | M3 |
| FE-005 | نظافة الاعتماديات | 01 | P1 | Waiver | 1–2 | 001,002 | 016,025 | A | M1–M2 |
| FE-006 | عقد env + API URL | 02 | P0 | Hard | 2–3 | 001 | 007,008,010,011,013,019,020 | B | M2 |
| FE-007 | إزالة fetch/localhost + auth | 02 | P0 | Hard | 2–3 | 006 | 008,013,014 | B | M2 |
| FE-008 | تحصين الجلسة/التوكن | 02 | P0 | Hard | 3–5 | 006,007 + Backend | 009,013 | B | M2 |
| FE-009 | حماية المسارات/الإدارة | 02 | P0 | Hard | 2–3 | 008 + RBAC | 014,020 | B | M2–M3 |
| FE-010 | إغلاق XSS | 02 | P1 | Hard | 2–3 | 006 | — | B | M3 |
| FE-011 | حواجز الأسرار | 02 | P1 | Hard | 1 | 006 | 025 | B | M2 |
| FE-025 | فرز الثغرات | 02 | P1 | Hard | 1–3 | 001,005 | 026 | B | M2 |
| FE-012 | Vitest + RTL | 03 | P0 | Hard | 2–3 | 001,002 | 013,014,015 | C | M1–M2 |
| FE-013 | Auth Unit + E2E | 03 | P1 | Hard | 3–5 | 006,008,012 | 014,020 | C | M3 |
| FE-014 | رحلات الأدوار + فشل | 03 | P1 | Hard | 4–6 | 007,009,012,013,015 | 020 | C | M3–M4 |
| FE-015 | Error boundary/offline/404 | 07 | P1 | Hard | 2–3 | 012 | 014,021 | C/E | M3 |
| FE-021 | تتبع الأخطاء/المراقبة | 07 | P1 | Hard | 2–3 | 015,019 | 026 | E | M4 |
| FE-019 | استضافة SPA | 05 | P0 | Hard | 2–3 | 001,006 + host | 020,021,026 | E | M3–M4 |
| FE-020 | staging + smoke | 05/07 | P0 | Hard | 2–3 | 002,006–009,013–015,019 | 026 | E | M4 |
| FE-026 | go/no-go + rollback | 07 | P0 | Hard | 1–2 | Tier 1 + 020,021 | Release | E | M5 |
| FE-016 | ميزانية الحزمة | 04 | P1 | Waiver | 3–4 | 001,005 | 017,018,023 | D | M4 |
| FE-017 | رندر/قوائم | 04 | P2 | Post | 3–5 | 016 | — | D | Post |
| FE-018 | صور/أصول | 04 | P2 | Post | 2–3 | 016 | — | D | Post |
| FE-022 | a11y | 06 | P1 | Waiver | 4–6 | 002,012 | 023 | D | M4 |
| FE-023 | تجاوب/متصفحات | 06 | P2 | Post | 2–3 | 016,022 | — | D | Post |
| FE-024 | لغة/توقيت | 06 | P3 | Post | 2–4 | قرار منتج | — | D | Post |

**المهام الفرعية:** FE-006A (1 pd)، FE-006B (1 pd)، FE-006C (0.5–1 pd)؛ FE-012A (1 pd)، FE-012B (1–2 pd). FE-019A/B مسارا عمل داخل FE-019 وليسا تذكرتين.

### المسار الحرج

```
FE-001 → FE-002 → FE-006 → FE-007 → FE-008 → FE-009 → FE-013 → FE-014 → FE-020 → FE-026
                                   ↘ FE-012 ↗                         ↗
FE-019 ─────────────────────────────────────────────────────────────┘
```

| المقطع | لماذا حرج | لا يُضغط بـ |
|---|---|---|
| FE-001 → FE-002 | لا شيء قابل للتحقق قبل install/typecheck/build | زيادة الأفراد قبل وجود baseline |
| FE-002 → FE-006 | refactor الإعداد يمس نفس ملفات الخدمات؛ على شجرة مكسورة = تعارضات | الدمج المتسلسل |
| FE-006 → FE-007 → FE-008 | كل واحدة تعتمد على عقد السابقة: base URL → طبقة الطلب → الجلسة | زمن عقد الـBackend |
| FE-008 → FE-009 | الحماية تعتمد على حالة جلسة/دور موثوقة | مراجعة الأمان |
| FE-013 → FE-014 | E2E الرحلات يبني على fixtures auth | توفر staging |
| FE-019 → FE-020 | staging لا يتحقق من deep links/cache بلا host config | قرار المضيف، DNS/TLS |
| FE-020 → FE-026 | go/no-go يحتاج دليل smoke | سعة QA |

**جهد المسار الحرج:** 25–40 pd. بمهندسين اثنين وزمن مراجعة طبيعي ≈ **6–9 أسابيع** وفق افتراضات القسم التالي. التقدير محكوم بزمن العقود الخارجية أكثر من حجم الكود.

### خطط التنفيذ

**مخططان (الحد الأدنى الموصى به):**

| الأسبوع | Engineer 1 | Engineer 2 | QA / DevOps |
|---|---|---|---|
| 1 | FE-001 + CI | تصميم FE-006، عقد env، طلبات host/Backend | مراجعة QA matrix؛ قرار host؛ branch protection |
| 2 | FE-002 TS/lint/كود ميت | FE-003 logs؛ FE-006A/B | تجهيز FE-012 |
| 3 | FE-006C + FE-007 | تصميم/تنفيذ FE-008 | اختبارات FE-012B؛ تأكيد عقد Backend |
| 4 | إكمال FE-008 | FE-009؛ FE-010 | FE-013 auth E2E |
| 5 | FE-011، FE-025 | FE-015؛ FE-019 | FE-014؛ تجهيز staging |
| 6 | FE-020 staging + smoke | FE-021؛ FE-022 | انحدار كامل؛ a11y |
| 7 | إكمال FE-022؛ FE-016 | إصلاحات FE-019/020؛ burn-down | أداء + تجاوب؛ حزمة أدلة |
| 8 | عيوب؛ FE-026 | عيوب؛ تقوية RC | go/no-go؛ تحقق الإنتاج |

**ثلاثة مهندسين:** أضف الثالث من الأسبوع 2 ليملك Track D (FE-016/022/023) وstaging/العيوب. الضغط المتوقع **1–2 أسبوع** لا 33% لأن المسار الحرج مرتبط بالعقود. لا تضف مهندساً ثالثاً على FE-006/007/008 بالتوازي — تكلفة التعارض أكبر من المكسب.

**مهندس واحد:** اتبع المسار الحرج؛ أجّل Tier 2/3. المدة **10–13 أسبوعاً**. مقبول فقط لو تاريخ الإصدار مرن؛ وإلا فالإصدار محجوب بالسعة لا بالهندسة.

**ما لا يجب توازيه:** FE-006 وFE-007 على `api.ts` ومواضع fetch؛ FE-008 وFE-009 على دلالات auth؛ FE-019 وFE-020 (config أولاً)؛ عدة مهندسين على `App.tsx` أثناء FE-002/FE-009.

### المعالم

| المعلم | الهدف | شرط الخروج | القرار |
|---|---|---|---|
| **M0 — قرارات وأساس** | نهاية أسبوع 1 | FE-001 بدأ؛ host محدد؛ طلب عقد Backend مرسل؛ branch protection؛ QA matrix معتمدة | متابعة/إعادة تخطيط |
| **M1 — بناء قابل للتكرار** | نهاية أسبوع 2 | install/typecheck/lint/build/audit في CI؛ FE-002/003 مدموجان؛ harness FE-012 موجود | هل الكود قابل للتثبيت؟ |
| **M2 — إعداد وأمان** | نهاية أسبوع 4 | FE-006/007/008/009/010/011/025 مغلقة أو مراجعة نهائية؛ لا localhost؛ سلوك الجلسة موثق | نقطة أمان |
| **M3 — شبكة اختبار** | نهاية أسبوع 5–6 | FE-013/014/015 خضراء على staging؛ E2E في CI | نقطة جودة |
| **M4 — RC على staging** | نهاية أسبوع 7 | FE-019/020/021/022/016 مكتملة؛ QA matrix منفذة؛ حزمة أدلة | إعلان RC |
| **M5 — go/no-go وإنتاج** | نهاية أسبوع 8 | FE-026 مكتمل؛ اعتماد موقّع؛ smoke إنتاج + مراقبة 24h | GO / NO-GO |

**نقاط إعادة baseline:** بعد M1 (حجم أخطاء TS الفعلي) وبعد M2 (زمن Backend/host). تجاوز M2 بأكثر من 5 أيام عمل يستدعي مراجعة RA لا ضغطاً صامتاً.

### الافتراضات والثقة

| الافتراض | لو خاب | الثقة |
|---|---|---|
| مهندسا فرونت بدوام كامل | 1 → 10–13 أسبوعاً؛ 3 → 6–7 | متوسطة |
| QA بنسبة ~80% | عنق زجاجة يؤخر M3/M4 | متوسطة |
| DevOps بنسبة ~40% | تأخر hosting/DNS/TLS يؤخر M4 | منخفضة |
| اختيار host بنهاية أسبوع 1 | FE-019 لا يبدأ؛ M4 يتأخر | منخفضة |
| رد Backend خلال يومي عمل | FE-007/008/009 تتأخر؛ المسار الحرج يمتد | منخفضة |
| أخطاء TS ≤ ~100 | FE-002 يتضخم فوق 5 pd؛ M1 يتأخر | منخفضة (لم يُشغَّل) |
| staging وحسابات seed بأسبوع 5 | FE-014/020 لا تُنفَّذ | منخفضة |
| لا إضافات نطاق أثناء النافذة | الجدول باطل | متوسطة |
| سعة مراجعة Tech Lead واحد | طابور PR يصبح عنق الزجاجة | متوسطة |

**ثقة التقويم: منخفضة.** تقدير الجهد متوسط الثقة؛ التقويم منخفض لأن 3 من 8 افتراضات خارجية وغير مؤكدة. لا تقدّم الأسبوع 8 كتاريخ ملزم قبل إغلاق M0.

### سجل التبعيات الخارجية (14)

| ID | التبعية | مطلوبة بحلول | تحجب | المالك الخارجي | المتابع الداخلي | الحالة |
|---|---|---|---|---|---|---|
| EXT-01 | شكل auth header (`Bearer` أم خام) + مثال | M2 / أسبوع 3 | FE-007, FE-008 | Backend | TL | Open |
| EXT-02 | عقد refresh/expiry/401 | M2 / أسبوع 3 | FE-008 | Backend | TL | Open |
| EXT-03 | مصفوفة RBAC + أدلة اختبارات سلبية | M3 / أسبوع 5 | FE-009، go/no-go | Backend + Security | TL | Open |
| EXT-04 | CORS allowlist لـstaging/production | M4 / أسبوع 6 | FE-019, FE-020 | Backend/DevOps | DO | Open |
| EXT-05 | هدف الاستضافة وآلية النشر | M0 / أسبوع 1 | FE-019, FE-020 | DevOps | DO | Open |
| EXT-06 | DNS/Domain + ملكية TLS | M4 / أسبوع 6 | FE-019, FE-020 | DevOps | DO | Open |
| EXT-07 | بيئة staging + طريقة حقن الأسرار | M3 / أسبوع 5 | FE-020 | DevOps | DO | Open |
| EXT-08 | مشروع تتبع أخطاء + DSN + سياسة PII | M3 / أسبوع 5 | FE-021 | DevOps/Security | TL | Open |
| EXT-09 | حسابات student/mentor/admin + `list.1000` | M3 / أسبوع 5 | FE-014، QA matrix | Backend/QA | QA | Open |
| EXT-10 | رابط الشات الإنتاجي + timeout/rate limits | M2 / أسبوع 4 | FE-007, FE-010 | Backend/Platform | FD | Open |
| EXT-11 | sandbox الدفع/بطاقات اختبار | M3 / أسبوع 5 | رحلة enrollment | Backend | QA | Open |
| EXT-12 | مختبر متصفحات/أجهزة (Safari/iOS) | M4 / أسبوع 7 | FE-023 smoke | DevOps | QA | Open |
| EXT-13 | صلاحية الوصول لتاريخ Git لفحص الأسرار | M2 / أسبوع 4 | FE-011 | Repo admin | FD | Open |
| EXT-14 | حساب smoke إنتاج (أقل صلاحية) | M5 / أسبوع 8 | FE-020 post-deploy | PO/Backend | QA | Open |

**قاعدة التصعيد:** لو تأخر بند خارجي > يومي عمل، ينشر المتابع الطلب بالضبط وأثره وتاريخ الحاجة في قناة الإصدار وينبّه RA. المهمة التابعة تبقى محجوبة؛ لا تُعلن Done بـmock محلي.

### سجل المخاطر (14)

| ID | الخطر | الاحتمال | الأثر | التخفيف | المالك | المهمة |
|---|---|---|---|---|---|---|
| R-01 | هدف الاستضافة غير محدد | عالي | عالي | قرار إجباري في M0؛ افتراضي static host يدعم SPA rewrite؛ توثيق المقايضة | DO/PO | FE-019 |
| R-02 | عقد auth/CORS يتأخر | عالي | عالي | إرسال قالب العقد أسبوع 1؛ اتفاق مؤقت مكتوب؛ feature flag | TL/BE | FE-007, FE-008 |
| R-03 | حجم أخطاء TS يتجاوز التقدير | متوسط | عالي | timebox اكتشاف يومين؛ تقسيم FE-002 بحسب الملفات؛ لا كتم أخطاء | TL | FE-002 |
| R-04 | harness يُضاف ولا يُتبنى | متوسط | متوسط | بوابة CI من اليوم الأول؛ 10 اختبارات عالية القيمة؛ مراجعة جودة الاختبارات | QA/TL | FE-012–014 |
| R-05 | staging ببيانات حقيقية/غير كافية | متوسط | عالي | seed scripts فقط؛ لا PII إنتاج؛ fixtures موثقة | QA/BE | FE-014, FE-020 |
| R-06 | نطاق a11y يتوسع بلا حد | متوسط | متوسط | البوابة: axe critical=0 + كيبورد auth/dashboard؛ الباقي مراحل | TL/QA | FE-022 |
| R-07 | انحدار أداء بعد الإصلاحات | متوسط | متوسط | ميزانية في CI؛ Lighthouse في M4؛ قبل/بعد | TL | FE-016 |
| R-08 | مراجع واحد عنق زجاجة | متوسط | متوسط | مراجع ثانٍ؛ SLA مراجعة P0 نفس اليوم؛ PRs صغيرة | TL | الكل |
| R-09 | scope creep أثناء الإصدار | عالي | متوسط | تجميد بعد RC؛ change control من PO؛ الجديد للـbacklog | PO | FE-026 |
| R-10 | CDN/سكريبت طرف ثالث يتعارض مع CSP | متوسط | عالي | self-host أو تثبيت الإصدار؛ CSP report-only أولاً؛ التحقق من FileViewer | FD/SEC | FE-010, FE-019 |
| R-11 | audit يكشف CVEs حرجة بلا ترقية سهلة | متوسط | عالي | timebox؛ overrides؛ توثيق المخاطر المتبقية بموافقة SEC | TL/SEC | FE-025 |
| R-12 | rollback موثق بلا تمرين | منخفض | عالي | تمرين إلزامي على staging في FE-026/TC-DEP-05 | DO | FE-026 |
| R-13 | تحصين auth يكسر جلسات قائمة | متوسط | متوسط | خطة migration/expiry؛ اختبار remember-me/deep links؛ طرح مرحلي | FD | FE-008 |
| R-14 | سعة QA لا تكفي 53 حالة | متوسط | متوسط | أولوية للحالات الحاجبة؛ أتمتة auth/roles مبكراً؛ تقسيم a11y/browser اليدوي | QA | FE-014 |

### قواعد التأجيل وتغيير النطاق

**يُؤجل بلا موافقة (Tier 3):** FE-017 إذا بقي جدول 1000 صف متجاوباً؛ FE-018 إذا لم يظهر CLS/LCP من الصور؛ FE-024 قرار منتج مع توثيق السلوك؛ مصفوفة FE-023 الكاملة فقط بعد نجاح Chrome + Safari/iOS smoke.

**يحتاج waiver من PO+RA (Tier 2):** FE-004 إذا لم يبق مسار ميت مرئي؛ FE-005 إذا لم توجد حزمة غير مستخدمة بـCVE عالي/حرج؛ FE-016 بسقف متفق ومراقبة؛ FE-022 مع axe critical=0 وخطة مؤرخة.

**لا يُؤجل ولا يُعفى:** FE-001، FE-002، FE-003، FE-006، FE-007، FE-008، FE-009، FE-012، FE-019، FE-020، FE-026، FE-010، FE-011، FE-013، FE-014، FE-015، FE-021، FE-025. وأي auth bypass معروف، سر مكشوف، غياب إعداد API إنتاجي، أو بناء غير قابل للتكرار.

**تغيير النطاق:** الطلبات الجديدة تدخل backlog ولا تدخل sprint نشطاً بصمت؛ P0 جديد يسبق العمل بموافقة TL+PO والمهمة المُزاحة تُعاد جدولتها لا تُسقط؛ أي تغيير في Tier 1 يحتاج توقيع RA وإعادة baseline لـM4/M5؛ العيوب تُرتّب بالخطورة لا بمكتشفها؛ التقديرات تُراجع في M1/M2 وبعد M2 لا يحرك التاريخ إلا تغيير النطاق.

### شروط GO العشرة

1. كل مهام Tier 1 مغلقة.
2. CI أخضر على commit الإصدار من تثبيت نظيف.
3. لا `localhost`/`127.0.0.1` في حزمة الإنتاج.
4. Auth/roles/journeys E2E تمر على staging.
5. Deep-link refresh وcache/security headers متحققة.
6. تتبع الأخطاء يستقبل حدثاً اختبارياً من staging/production.
7. دليل RBAC وCORS من الـBackend مرفق.
8. Rollback مُتمرَّن أو مملوك رسمياً بـRTO.
9. صفر عيوب S1/S2 مفتوحة؛ P1 لها مالك وworkaround.
10. كتلة الاعتماد موقعة من RA بمدخلات PO/TL/QA/DO.

لو أي شرط غير صحيح → **NO-GO** أو **CONDITIONAL GO** بمالك وموعد. Conditional GO لا يشمل الشروط 2 أو 3 أو 4 أو 8 — هذه غير قابلة للشرطية.

---

## 9. اعتماد الإصدار — 64 بند تحكم

هذا هو مستند البوابة التشغيلية. **لا تُعلَّم خانة إلا إذا كان الدليل المذكور موجوداً ومربوطاً.** لا تعبئة مسبقة، ولا استنتاج، ولا تعليم بسبب وجود مكتبة أو ملف إعداد أو PR. غياب الدليل = `NOT VERIFIED`، وهي ليست نجاحاً.

> ملاحظة: الـ64 بنداً هي إعادة صياغة أدق للـ59 بنداً، فلا تُقارن أعدادها مباشرة بإجمالي التتبّع. الحالات أدناه هي **خط الأساس** في 2026-10-30، وتُعاد في اجتماع الإصدار؛ ولا تتغير إلا بدليل مربوط.

### 9.1 هوية الإصدار (تُكمل وقت الإصدار)

| الحقل | القيمة |
|---|---|
| التطبيق | EduNest SPA |
| الإصدار / الاسم | `<يُحدَّد>` |
| commit الإصدار | `<SHA 40 حرفاً>` |
| معرّف الأصل / checksum | `<أرشيف dist + SHA-256>` |
| بناء staging المُتحقق | `<رابط staging + SHA>` |
| هدف الإنتاج | `<host/domain>` |
| نافذة النشر (UTC) | `<من–إلى>` |
| مدير الإصدار | `<اسم>` |
| مالك rollback | `<اسم + تواصل>` |
| قناة الحادث | `<رابط>` |
| تذاكر التغيير / PRs | `<روابط>` |

**قاعدة:** الأصل المُرقّى للإنتاج يجب أن يكون **مطابقاً بايت ببايت** للأصل المُتحقق على staging. لا إعادة بناء بين staging والإنتاج.

### 9.2 الحالة الحالية

| المؤشر | الحالة |
|---|---|
| API الإنتاج مُعد | ❌ `http://localhost:8080` مثبّت في `src/services/api.ts` |
| بناء قابل للتكرار | ❌ `node_modules` غائب؛ لا CI؛ لم يُنفَّذ typecheck/lint/build |
| اختبارات آلية | ❌ لا script ولا runner ولا ملفات اختبار |
| بيئة staging | ❌ غير موجودة |
| استضافة / SPA rewrite / cache | ❌ غير موجودة في المستودع |
| تحصين الجلسة/auth | ❌ JWT في `localStorage`، لا انتهاء/refresh/401 |
| تتبع أخطاء/مراقبة | ❌ غير موجود |
| خطة rollback | ❌ غير موجودة |
| فحص أسرار | ⚠️ شجرة العمل نظيفة في فحص موجّه؛ التاريخ لم يُفحص |
| audit الاعتماديات | ⚠️ لم يُشغَّل |
| Accessibility | ⚠️ 32 مودالاً بلا dialog role؛ 4 `htmlFor` مقابل 143 input |
| الأداء | ⚠️ لا artifact ولا دليل Lighthouse |

**القرار الحالي: NO-GO.** لا يُرقّى التطبيق خارج بيئة داخلية/staging حتى إغلاق بوابة Tier 1 في `frontend-priorities-and-dependencies.md`.

### 9.3 البناء وجودة الكود

| # | الشرط | المالك | الدليل المطلوب | الحالة | ملاحظات |
|---|---|---|---|---|---|
| B-01 | تثبيت نظيف ينجح من lockfile | FD/DO | log `npm ci` من حاوية نظيفة | ☐ NOT VERIFIED | |
| B-02 | Type-check ينجح | FD | `npm run typecheck` exit 0 + log | ☐ NOT VERIFIED | `tsc --noEmit` في الجذر غير صالح؛ استخدم `tsc -b` |
| B-03 | Lint ينجح | FD | `npm run lint` exit 0 + log | ☐ NOT VERIFIED | |
| B-04 | بناء production ينجح | FD | `npm run build` exit 0 + بيان `dist` | ☐ NOT VERIFIED | |
| B-05 | الأصل مؤرشف ومُوقَّع checksum | DO | رابط الأصل + SHA-256 | ☐ NOT VERIFIED | |
| B-06 | لا موديولات ميتة أو مسارات مكررة | FD | تقرير فحص ملفات/مسارات | ❌ FAIL | 14 موديول صفر بايت؛ `/admin/dashboard` مكرر |
| B-07 | لا `console.*` غير محمي أو لوجات حساسة | FD | عدّ grep = 0 خارج logger التطوير + لقطة console | ❌ FAIL | 127 موضعاً اليوم |
| B-08 | لا `localhost`/`127.0.0.1` في حزمة الإنتاج | FD | مخرجات grep على الحزمة | ❌ FAIL | |
| B-09 | audit الاعتماديات مُفرَّز | TL | تقرير `npm audit --production` + سجل المخاطر المقبولة | ☐ NOT VERIFIED | |

### 9.4 الأمان والمصادقة

| # | الشرط | المالك | الدليل المطلوب | الحالة | ملاحظات |
|---|---|---|---|---|---|
| S-01 | لا أسرار في الشجرة أو التاريخ | SEC/FD | تقرير gitleaks/trufflehog؛ سجل rotation إن وجد | ⚠️ PARTIAL | الشجرة نظيفة؛ التاريخ لم يُفحص |
| S-02 | `VITE_*` قيم عامة فقط | FD | مراجعة `.env.example` + grep الحزمة | ⚠️ PARTIAL | |
| S-03 | تفويض/RBAC الـBackend مُثبت | BE | مصفوفة endpoints لكل دور + اختبارات 401/403 سلبية | ☐ NOT VERIFIED | خارجي؛ لا يُغلق من الفرونت |
| S-04 | حماية المسارات صحيحة لكل دور | FD/QA | نتائج TC-ROLE-01…06 | ⚠️ PARTIAL | الدور في `localStorage` قابل للتعديل |
| S-05 | استراتيجية التوكن/الجلسة معتمدة | TL/SEC | قرار مكتوب + نتائج TC-AUTH-04…07 | ❌ FAIL | |
| S-06 | لا بيانات حساسة في اللوجات/الأخطاء | FD | لقطة console/network + مراجعة رسائل الخطأ | ❌ FAIL | |
| S-07 | XSS sinks مغلقة أو معقّمة | FD/SEC | نتائج TC-SEC-01/02 + مراجعة كود | ❌ FAIL | `dangerouslySetInnerHTML` في الشات/العارض |
| S-08 | شكل auth header متسق | FD/BE | لقطة TC-SEC-03 على staging | ❌ FAIL | `Bearer` مقابل token خام |
| S-09 | سلوك 401/الانتهاء مُتحقق | FD/QA | نتيجة TC-AUTH-06 | ❌ FAIL | |
| S-10 | CORS allowlist مؤكد | BE/DO | لقطة preflight لأصول staging والإنتاج | ☐ NOT VERIFIED | خارجي |

### 9.5 الاختبارات وضمان الجودة

| # | الشرط | المالك | الدليل المطلوب | الحالة | ملاحظات |
|---|---|---|---|---|---|
| T-01 | runner و`npm test` موجودان | QA/FD | log `npm test` + مهمة CI | ❌ FAIL | لا runner اليوم |
| T-02 | مجموعة Unit/Component تنجح | QA | تقرير CI + تغطية | ❌ FAIL | |
| T-03 | Auth E2E ينجح على staging | QA | تقرير TC-AUTH-01…08 | ❌ FAIL | |
| T-04 | Role/Route E2E ينجح | QA | تقرير TC-ROLE-01…06 | ❌ FAIL | |
| T-05 | الرحلات الأساسية تنجح | QA | تقرير TC-JRN-01…05 | ❌ FAIL | |
| T-06 | حالات الفشل/offline/timeout مُتحققة | QA | تقرير TC-API-01…05 | ❌ FAIL | |
| T-07 | النماذج والتحقق مُتحققة | QA | تقرير TC-FORM-01…03 | ❌ FAIL | |
| T-08 | صفر عيوب S1/S2 مفتوحة | QA | تصدير سجل العيوب بالخطورة | ☐ NOT VERIFIED | |
| T-09 | انحدار أخضر على commit الإصدار | QA | CI + تشغيل staging لنفس SHA | ❌ FAIL | |

### 9.6 الأداء

| # | الشرط | المالك | الدليل المطلوب | الحالة | ملاحظات |
|---|---|---|---|---|---|
| P-01 | خط أساس Lighthouse للموبايل مسجّل | FD/TL | JSON/HTML لـ5 مسارات رئيسية | ☐ NOT VERIFIED | |
| P-02 | Core Web Vitals داخل الميزانية | TL | LCP ≤ 2.5s، CLS ≤ 0.1، INP ≤ 200ms (اقتراح) | ☐ NOT VERIFIED | الميزانيات تحتاج اعتماداً |
| P-03 | حزمة الدخول داخل الميزانية | TL | تقرير analyzer؛ ≤ 250KB gzip (اقتراح) | ☐ NOT VERIFIED | |
| P-04 | لا vendor chunks غير مستخدمة | FD | chunk graph مقابل الاستيرادات | ☐ NOT VERIFIED | chunks لـjitsi/alerts تستهدف حزماً غير مستخدمة |
| P-05 | سلوك القوائم الكبيرة مقبول | QA | قياس TC-PRF-04 | ☐ NOT VERIFIED | |

### 9.7 إعداد الإنتاج والنشر

| # | الشرط | المالك | الدليل المطلوب | الحالة | ملاحظات |
|---|---|---|---|---|---|
| D-01 | عقد البيئة موثق ومُتحقق | FD | `.env.example` + اختبار فشل متغير ناقص | ❌ FAIL | لا `.env*` |
| D-02 | رابط API الإنتاجي من env | FD | لقطة شبكة staging تُظهر host الصحيح | ❌ FAIL | |
| D-03 | لا fetch خام يتجاوز العميل | FD | فحص كود + TC-SEC-03 | ❌ FAIL | |
| D-04 | إعداد الاستضافة يدعم SPA rewrite | DO | ملف إعداد + مصفوفة TC-DEP-01 | ❌ FAIL | |
| D-05 | سياسة cache صحيحة | DO | `curl -I` لـHTML والأصول ذات hash | ☐ NOT VERIFIED | |
| D-06 | HTTPS/TLS صالح وHSTS موجود | DO | سلسلة الشهادة + لقطة الهيدرز | ☐ NOT VERIFIED | خارجي |
| D-07 | security headers موجودة | DO | لقطة (nosniff، referrer، frame، CSP) | ☐ NOT VERIFIED | |
| D-08 | DNS/الدومين وإعادة التوجيه صحيحة | DO | استعلام DNS + مصفوفة www/apex | ☐ NOT VERIFIED | خارجي |
| D-09 | نشر staging نجح | DO | deploy log + رابط staging + build SHA | ❌ FAIL | |
| D-10 | أصل الإنتاج هو أصل staging | DO | تطابق SHA-256 | ☐ NOT VERIFIED | |

### 9.8 الواجهة/التجربة/a11y/التوافق

| # | الشرط | المالك | الدليل المطلوب | الحالة | ملاحظات |
|---|---|---|---|---|---|
| U-01 | تجاوب عند 360/768/1440 | QA | لقطات TC-RSP-01/02 | ☐ NOT VERIFIED | |
| U-02 | Smoke على Chrome + Safari/iOS ينجح | QA | نتيجة TC-RSP-03 | ☐ NOT VERIFIED | المصفوفة الكاملة قد تُؤجل |
| U-03 | axe critical/serious = 0 على المسارات الرئيسية | QA | تقرير axe | ☐ NOT VERIFIED | |
| U-04 | رحلة الكيبورد (auth + dashboard) تنجح | QA | تسجيل TC-A11Y-01 | ☐ NOT VERIFIED | |
| U-05 | للمودالات/النماذج/الصور أسماء accessible | FD/QA | نتائج TC-A11Y-02…04 | ❌ FAIL | 32 مودالاً بلا `role="dialog"` |
| U-06 | 404 والمسارات العميقة تعمل | QA | TC-ROLE-04، TC-DEP-01 | ❌ FAIL | |
| U-07 | سلوك اللغة/التاريخ/المنطقة موثق | FD/PO | مذكرة قرار | ☐ NOT VERIFIED | P3؛ قد يُوثَّق بلا إصلاح |

### 9.9 المراقبة والاستعادة وما بعد النشر

| # | الشرط | المالك | الدليل المطلوب | الحالة | ملاحظات |
|---|---|---|---|---|---|
| M-01 | تتبع الأخطاء حي بوسم release | FD/DO | حدث اختباري ظاهر في dashboard | ❌ FAIL | |
| M-02 | تنقية PII مُعدة | SEC/FD | مراجعة إعداد + حدث اختباري | ❌ FAIL | |
| M-03 | dashboard لـWeb Vitals/معدل الأخطاء | DO/FD | رابط dashboard | ❌ FAIL | |
| M-04 | حدود التنبيه ومالك on-call | DO | إعداد التنبيه + المالك | ❌ FAIL | |
| M-05 | smoke pack معرّف وقابل للتنفيذ | QA | script/checklist | ❌ FAIL | |
| M-06 | runbook rollback مكتوب وله مالك | DO | هذا المستند، القسم 10، بأسماء معبأة | ❌ FAIL | |
| M-07 | rollback مُتمرَّن على staging | DO/QA | سجل توقيت TC-DEP-05 | ❌ FAIL | |
| M-08 | خطة مراقبة 24 ساعة متفق عليها | RA/DO | جدول مناوبة + حدود | ❌ FAIL | |

### 9.10 حوكمة الإصدار

| # | الشرط | المالك | الدليل المطلوب | الحالة | ملاحظات |
|---|---|---|---|---|---|
| R-01 | كل مهام Tier 1 مغلقة | RA | تصدير اللوحة بالروابط | ❌ FAIL | 18 مهمة |
| R-02 | كل بند له حالة ومالك | TL | مراجعة `frontend-checklist-traceability.md` | ⚠️ PARTIAL | 59 بنداً |
| R-03 | waivers مسجلة بمالك وتاريخ | RA | سجل waivers (12.3) | ❌ FAIL | |
| R-04 | release notes مسودة | PO | رابط الملاحظات | ❌ FAIL | |
| R-05 | الدعم/on-call مُبلَّغ | DO | سجل إحاطة | ❌ FAIL | |
| R-06 | التوقيعات مجموعة | RA | القسم 9.12 مكتمل | ❌ FAIL | |

### 9.11 التوقفات الصلبة (10)

لو تحقق أي منها، القرار **NO-GO**، ولا يُحوَّل إلى اعتماد مشروط:

1. حزمة الإنتاج تشير إلى `localhost` أو `127.0.0.1` أو نفق مطور.
2. البناء لا يتكرر من تثبيت نظيف، أو typecheck/build يفشل.
3. يوجد auth bypass معروف، أو سر مكشوف، أو عملية مميزة بلا مصادقة.
4. دليل RBAC من الـBackend غائب لحدود بيانات admin/mentor/student.
5. Auth أو Role E2E لم يُنفَّذ على بيئة staging.
6. المسارات العميقة تفشل عند التحديث على المضيف الهدف.
7. لا آلية rollback ولا مالك rollback مسمّى.
8. عيب S1 مفتوح.
9. أصل الإنتاج يختلف عن الأصل المُتحقق على staging.
10. تتبع الأخطاء غائب، فأعطال ما بعد النشر ستكون غير مرئية.

### 9.12 كتلة التوقيع

تُكمل في اجتماع go/no-go فقط. التوقيع يعني أن الموقّع رأى الدليل، لا أنه يثق بالفريق.

| الدور | الاسم | القرار | شروط/ملاحظات | التاريخ |
|---|---|---|---|---|
| Release Approver (رئيس) | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| Product Owner | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| Frontend Tech Lead | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| QA Engineer | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| DevOps / Release Engineer | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| Security Reviewer | | ☐ GO ☐ CONDITIONAL ☐ NO-GO | | |
| ممثل الـBackend (استشاري) | | ☐ Acknowledged | | |

**النصاب:** RA + PO + TL + QA + DO. توقيع الأمان إلزامي لأي إصدار يغيّر auth أو الجلسة أو عرض المحتوى. إقرار الـBackend إلزامي عند تغير عقد الـAPI.

**سجل القرار**

| الحقل | القيمة |
|---|---|
| القرار | `<GO / CONDITIONAL GO / NO-GO>` |
| التاريخ/الوقت (UTC) | |
| commit الإصدار | |
| المبرر | |
| الشروط (إن وجدت) | |
| مالكو الشروط والمواعيد | |
| تاريخ المراجعة التالي | |
| مالك rollback على الاستعداد | |

---

## 10. Runbook الاستعادة (Rollback)

هذا الـrunbook مستقل عن المضيف. أوامر المضيف تُملأ في `FE-019`؛ **لا تُترك placeholders في نسخة الإنتاج**.

### 10.1 الشروط المسبقة

- [ ] الأصل السابق المعروف-جيداً محتفظ به ومحدد بـSHA.
- [ ] مالك rollback وبديله مسمّيان مع بيانات التواصل.
- [ ] المضيف يدعم rollback فورياً أو إعادة نشر أصل سابق.
- [ ] TTL الـDNS معروف؛ لا تغيير DNS مطلوب لـrollback كود.
- [ ] عقد الـBackend للنسخة السابقة ما زال مدعوماً.
- [ ] المراقبة وصلاحية smoke متاحة لمالك rollback.
- [ ] الـrollback مُتمرَّن على staging (`TC-DEP-05`).

### 10.2 محفّزات الاستعادة

| المحفّز | الحد | الجهة |
|---|---|---|
| عيب S1 (auth bypass، كشف بيانات، فساد دفع) | أي occurrence | RA فوراً؛ rollback أولاً والتحقيق بعده |
| فشل smoke pack | أي حالة حاجبة | DO ينفّذ؛ RA يُبلَّغ |
| معدل أخطاء JS | > 5× الأساس لمدة 5 دقائق، أو > 2% من الجلسات | DO + RA |
| معدل 5xx من الـAPI بسبب عقد الفرونت | > 2% لمدة 5 دقائق | DO + TL |
| معدل فشل الدخول | > 10% من المحاولات لمدة 5 دقائق | RA |
| كسر المسارات العميقة/تحميل الأصول | أي حالة إنتاج مؤكدة | DO |
| انهيار Core Web Vitals | LCP p75 > 2× الأساس لمدة 15 دقيقة | TL + RA |
| تعذّر الإصلاح الأمامي خلال 15 دقيقة | — | RA |

### 10.3 خطوات الاستعادة

| الخطوة | الإجراء | المالك | المتوقع |
|---|---|---|---|
| 1 | إعلان الحادث؛ فتح القناة؛ كتابة "rollback in progress" | RA | تسجيل التوقيت |
| 2 | إيقاف أي ترقية إضافية؛ تجميد الدمج | RA/TL | لا نشر جديد |
| 3 | تحديد SHA للأصل السابق المعروف-جيداً والتأكد من مطابقته لأصل staging | DO | SHA مسجل |
| 4 | الترقية/الاستعادة لذلك الأصل بآلية المضيف | DO | deploy log يُظهر النسخة السابقة |
| 5 | تطهير CDN لـ`index.html` والأصول المتغيرة؛ لا تطهير الأصول immutable بلا داعٍ | DO | إعادة فحص الهيدرز |
| 6 | التحقق أن `index.html` no-cache ويشير لحزم hash السابقة | DO | `curl -I` + grep على HTML |
| 7 | تشغيل smoke pack الإنتاج (11.1) | QA/DO | كل الفحوص الحاجبة تنجح |
| 8 | تأكيد عودة معدل الأخطاء للأساس | DO | لقطة dashboard |
| 9 | إبلاغ أصحاب المصلحة والدعم | RA | رسالة مرسلة |
| 10 | حفظ اللوجات والأصول والجدول الزمني؛ فتح مراجعة ما بعد الحادث | RA | مراجعة خلال 5 أيام |

**RTO المستهدف:** ≤ 15 دقيقة من القرار حتى خدمة النسخة السابقة (اقتراح؛ يُعتمد مع DevOps).
**RPO:** لا ينطبق على فرونت ثابت؛ بيانات المستخدم مملوكة للـBackend. **rollback الفرونت لا يُستخدم أبداً "للتراجع" عن تغييرات بيانات في الـBackend.**

### 10.4 تحذيرات

- **لا rollback أعمى إذا تغيّر عقد الـBackend.** نسخة فرونت أقدم قد تستدعي endpoints محذوفة. أكّد التوافق الخلفي أو استعد الجانبين مع مالك الـBackend.
- **لا تطهّر كل أصول CDN** إلا لو غابت الـhashes؛ الأصول immutable يمكن أن تبقى مخزنة.
- **لا تُعد استخدام نفس وسم الإصدار** للاستعادة؛ سجّل SHA الفعلي.
- **rollback الفرونت لا يصلح**: بيانات تالفة، انقطاع Backend، تغيير DNS سيئ، أو شهادة منتهية. صعّد للمالك الصحيح.
- **لو لا يوجد rollback فوري في المضيف**، البديل إعادة نشر الأصل السابق من التخزين؛ ويجب توقيت ذلك في التمرين.

### 10.5 بعد الاستعادة

- [ ] smoke pack أخضر على النسخة المستعادة.
- [ ] معدل الأخطاء وفشل الدخول عاد للأساس.
- [ ] أصحاب المصلحة والدعم أُبلغوا.
- [ ] الجدول الزمني والسبب الجذري موثقان.
- [ ] تذكرة إصلاح أمامي بـمالك وإصدار مستهدف.
- [ ] اعتماد الإصدار مُبطَل حتى go/no-go جديد.

---

## 11. التحقق بعد النشر

### 11.1 حزمة smoke (T+0 إلى T+15 دقيقة)

| # | الفحص | المتوقع | المالك |
|---|---|---|---|
| 1 | `GET /` | 200، shell يُرندر، لا خطأ console | QA |
| 2 | `GET /login` والدخول بحساب smoke | تحويل للوحة الصحيحة | QA |
| 3 | `GET /mentorships` | القائمة تُحمَّل من API الإنتاج | QA |
| 4 | مسار محمي واحد + تحديث كامل | 200 + المسار الصحيح (أو تحويل لتسجيل الدخول) | QA |
| 5 | قراءة API واحدة في لوحة | 2xx وشكل بيانات صحيح | QA |
| 6 | mutation آمنة واحدة (مثل تعليم إشعار كمقروء) | 2xx وتحديث UI مرة واحدة | QA |
| 7 | Logout | التخزين يمسح، تحويل لـ`/login`، زر الرجوع آمن | QA |
| 8 | أصل ثابت | 200 و`Cache-Control` صحيح | DO |
| 9 | security headers | HSTS/nosniff/referrer/frame موجودة | DO |
| 10 | متتبع الأخطاء | حدث اختباري ظاهر بوسم release | DO |
| 11 | Console/Network | لا CORS ولا 5xx ولا mixed-content ولا unhandled rejection | QA |
| 12 | فحص موبايل | تخطيط 360px قابل للاستخدام | QA |

### 11.2 جدول المراقبة

| الوقت | الفحوص | المالك |
|---|---|---|
| T+5 د | اكتمال smoke؛ متتبع الأخطاء نظيف | QA/DO |
| T+30 د | معدل الأخطاء، 5xx، فشل الدخول، عينة LCP | DO |
| T+2 س | نفسه + تذاكر الدعم + نجاح enrollment/الدفع | DO/QA |
| T+24 س | مراجعة كاملة مقابل الأساس؛ قرار استمرار/مراقبة/rollback | RA |
| T+72 س | مراجعة اتجاه؛ إغلاق الإصدار أو فتح متابعات | RA/TL |

### 11.3 المقاييس والحدود (اقتراح)

| المقياس | مصدر الأساس | حد التنبيه |
|---|---|---|
| معدل أخطاء JS | أول 24 ساعة بعد الإصدار | > 2% من الجلسات أو 5× الإصدار السابق |
| معدل 5xx | dashboard الـBackend | > 2% لمدة 5 دقائق |
| فشل الدخول | dashboard الـauth | > 10% لمدة 5 دقائق |
| LCP p75 | RUM/Lighthouse | > 2.5s أو 2× الأساس |
| CLS p75 | RUM | > 0.1 |
| فشل enrollment/الدفع | تحليلات المنتج | > 2× الأساس |
| تذاكر الدعم (auth/login) | قائمة الدعم | أي ارتفاع مرتبط بالإصدار |

**الحدود تُعتمد قبل go/no-go؛ لا تُخترع أثناء الحادث.**

---

## 12. الاعتماد المشروط

**CONDITIONAL GO** مسموح فقط عندما تكون الفجوات المتبقية من Tier 2 (waiver) وكل التوقفات الصلبة خالية.

### 12.1 المسموح وغير المسموح

| مسموح | غير مسموح |
|---|---|
| تحسين أداء P2 مؤجل مع مراقبة | أي توقف صلب في 9.11 |
| تأجيل مصفوفة المتصفحات بعد نجاح Chrome + Safari | Auth/Role E2E غير منفذ |
| توثيق سلوك اللغة/المنطقة بلا تغيير | غياب مالك rollback أو التمرين |
| تنظيف كود ميت مجدول بعد الإطلاق | حزمة غير مستخدمة فيها CVE حرج معروف |
| معالجة a11y على مراحل مع axe critical = 0 | فشل رحلة الكيبورد في auth |
| waiver لميزانية الحزمة بسقف متفق | بناء غير قابل للتكرار |
| تأجيل تدقيق الصور مع مراقبة CLS | API الإنتاج مُعد خطأً |

### 12.2 متطلبات سجل الشرط

الوصف، المالك، الموعد (≤ 10 أيام عمل إلا بتمديد RA)، الضابط التعويضي، الدليل المطلوب للإغلاق، والأثر لو لم يُغلق.

**الانتهاء:** الاعتماد المشروط ينتهي عند الأقرب من الموعد أو 10 أيام عمل. لو لم تُغلق الشروط، يُعاد مراجعة الإصدار وقد يُستعاد.

### 12.3 سجل waivers

| ID | الشرط | المالك | الموعد | الضابط التعويضي | الحالة | دليل الإغلاق |
|---|---|---|---|---|---|---|
| W-01 | | | | | ☐ Open | |

---

## 13. الأدلة الناقصة حالياً (12)

كل بند هنا يجعل حالته `NOT VERIFIED`؛ ولا يجوز تعليم أي منها PASS بالتخمين.

| # | الدليل الناقص | لماذا ناقص | كيف يُغلق | المهمة |
|---:|---|---|---|---|
| 1 | log `npm ci` من حاوية نظيفة | `node_modules` غائب والتثبيت ممنوع في هذه المرحلة | تشغيل في CI وتخزين اللوج | FE-001 |
| 2 | مخرجات typecheck/lint/build | لم تُشغَّل؛ والجذر `"files": []` يجعل الأمر الشائع بلا أثر | `npm run typecheck/lint/build` في CI | FE-001, FE-002 |
| 3 | تقرير `npm audit --production` | لا تثبيت ولا تقرير ولا Dependabot | تشغيل audit وأرشفة JSON | FE-025 |
| 4 | تقرير فحص الأسرار وتاريخ Git | التاريخ غير مفحوص؛ لا أداة في CI | gitleaks/trufflehog على التاريخ الكامل | FE-011 |
| 5 | مصفوفة RBAC واختبارات 403 من الـBackend | ملكية خارجية؛ لا كود backend في المستودع | تقرير من فريق الـBackend | SEC-03 / EXT-03 |
| 6 | تأكيد شكل auth header وrefresh/401 | عقد غير موثق؛ الكود متضارب | تعليق مؤكد من الـBackend + اختبارات | FE-007, FE-008 / EXT-01, EXT-02 |
| 7 | لقطة CORS preflight | لا بيئة staging ولا أصل إنتاج معروف | لقطة preflight بعد تحديد المضيف | FE-019 / EXT-04 |
| 8 | رابط staging + SHA البناء | لا staging ولا pipeline | نشر RC وتوثيق الرابط وSHA | FE-019, FE-020 |
| 9 | نتائج E2E (auth/roles/journeys) | لا runner ولا بيئة | تنفيذ TC-AUTH/ROLE/JRN على staging | FE-012…FE-014 |
| 10 | تقرير Lighthouse/الحزمة | لا build ولا artifact | تحليل الحزمة وLighthouse على RC | FE-016 |
| 11 | تقرير axe/الكيبورد | لا تشغيل a11y | axe على 10 مسارات + تسجيل كيبورد | FE-022 |
| 12 | سجل تمرين rollback | لا خطة ولا مضيف | تمرين TC-DEP-05 وتسجيل التوقيت | FE-026 |

**أدلة إضافية مطلوبة لكنها ليست "ناقصة" بل "غير منفذة":** نتائج smoke الإنتاج، حدث متتبع الأخطاء، لقطات الهيدرز/deep links. كلها تُنشأ في M4–M5.

---

## 14. حدود هذه الخطة

1. **لا شيء نُفِّذ.** كل الحالات من فحص ساكن للقراءة فقط. لا بناء، لا اختبار، لا نشر، لا تثبيت.
2. **الأعداد مؤكدة، والتأثير المقاس غير مؤكد.** عدد ملفات/console/img/aria مأخوذ من grep وفحص ملفات. أحجام الحزمة وCore Web Vitals غير معروفة.
3. **تاريخ Git لم يُفحص.** فحص الأسرار يغطي شجرة العمل فقط.
4. **الـBackend خارج النطاق.** كل ما يتعلق بالتفويض الحقيقي، CORS، refresh، وعقد الهيدر هو طلب تحقق خارجي، وليس مهة فرونت.
5. **قرارات المنتج مفتوحة.** اللغة/اللوكال، الميزانيات (حجم/أداء)، ومصفوفة المتصفحات تحتاج اعتماداً.
6. **المضيف غير محدد.** لذلك `FE-019` و`FE-026` وكل أوامر rollback محددة المبدأ لا الأمر.
7. **التقديرات شخص-يوم لمهندس خبير**، وتستثني زمن المراجعة وانتظار العقود الخارجية.
8. **الجدول الزمني منخفض الثقة.** 3 من 8 افتراضات خارجية غير مؤكدة.
9. **المعرّفات `FE-###` مؤقتة.** لا تُدَّعى مفاتيح Jira حقيقية؛ الربط في `jira-import-notes.md`.
10. **هذه الخطة لا تُغني عن مراجعة بشرية.** هي إطار أدلة، وليست شهادة جاهزية.

---

## 15. فهرس الملفات

| الملف | المحتوى | الجمهور |
|---|---|---|
| `frontend-official-plan-ar.md` | **هذا الملف** — الخطة الرسمية الكاملة بالعربية (ملخص، أدلة، 59 بنداً، 26 مهمة، 53 حالة QA، أدوار، أولويات، اعتماد، rollback) | الفريق كله، الإدارة |
| `frontend-tasks-guide-ar.md` | دليل عربي عملي مختصر: ماذا تفعل، كيف، وأين الملفات | المطورون الجدد |
| `github-workflow-ar.md` | قواعد العمل على GitHub: الفروع، الكوميتس، PR، المراجعة، حماية الفرع، الإصدارات، rollback | الفريق كله |
| `frontend-release-summary.md` | القرار، بطاقة الجاهزية، الحواجب، فهرس، مراجعة جودة، الأدلة الناقصة | PO/RA |
| `frontend-repository-audit.md` | الأدلة الخام F-01…F-28 والمجهولات | TL/FD |
| `frontend-checklist-traceability.md` | 59 بنداً بحالتها ودليلها ومهمتها وحاجبها | TL/QA |
| `frontend-epics-and-tasks.md` | 7 Epics، 26 مهمة، 5 مهام فرعية، AC/DoD/rollback | FD/TL/PO |
| `frontend-qa-test-matrix.md` | 53 حالة اختبار، بيئات، fixtures، ترتيب تنفيذ | QA |
| `frontend-roles-and-workflow.md` | RACI، بوابات المراحل، بوابات CI، التسليمات | الكل |
| `frontend-priorities-and-dependencies.md` | الأولويات، المسار الحرج، المعالم، 14 تبعية خارجية، 14 خطراً | PO/TL/DO |
| `frontend-release-approval.md` | 64 بند تحكم، توقفات صلبة، توقيع، rollback، smoke | RA/DO/QA |
| `jira-import.csv` | 38 صفاً جاهزاً للاستيراد | TL |
| `jira-import-notes.md` | كيفية الربط والتحقق بعد الاستيراد | TL |

**ترتيب القراءة المقترح:** هذا الملف (1–4) → `frontend-priorities-and-dependencies.md` → `frontend-epics-and-tasks.md` → `frontend-qa-test-matrix.md` → `frontend-release-approval.md`.

---

## 16. ملاحظة ختامية

أخطر نمط فشل لهذا الإصدار ليس ميزة ناقصة. هو أن يقنع الفريق نفسه أن بناءً محلياً أو ملف إعداد أو PR مدموجاً يساوي جاهزية إنتاجية. معيار الأدلة في هذا المستند موجود لمنع ذلك.

**القاعدة النهائية:** إذا لم تُعلَّم الخانة برابط أو مخرج أمر، تبقى غير معلّمة — ويبقى الإصدار **NO-GO**.

| الخلاصة | القيمة |
|---|---|
| قرار اليوم | **NOT READY — NO-GO** |
| بنود القائمة | 59 (0 PASS · 12 PARTIAL · 26 FAIL · 21 NOT VERIFIED) |
| مهام الإصدار الصلبة | 18 مهمة · 36–58 شخص-يوم |
| الإجمالي | 26 مهمة + 5 فرعية · 55–89 شخص-يوم |
| أقرب مسار للخروج | FE-001 → FE-002 → FE-006 → FE-007 → FE-008 → FE-009 → FE-013 → FE-014 → FE-019 → FE-020 → FE-026 |
| ما لا يمكن التنازل عنه | بناء قابل للتكرار · لا localhost · auth/roles مُختبَرة · rollback مملوك |
