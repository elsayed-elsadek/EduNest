# دليل العمل على GitHub — EduNest

| البند | القيمة |
|---|---|
| المستودع | `https://github.com/elsayed-elsadek/EduNest` |
| الفرع الافتراضي | `master` (الوحيد على الريموت حالياً) |
| حالة المستودع | لا `.github/`، لا `CONTRIBUTING.md`، لا حماية فرع، لا قوالب PR، لا CI |
| آخر commits | `updates` · `Neo` · `mentor-role updates` · `final mentor updates` |
| تاريخ الكتابة | 2026-10-30 |
| الغرض | قواعد عمل واضحة تُطبَّق فعلياً: فرع لكل تغيير، commit مفهوم، PR صغير، مراجعة، دمج نظيف، إصدار قابل للاستعادة |

> هذا المستند **قواعد تشغيل**، وليس اقتراحات. كل قاعدة لها سبب، وكل سبب مرتبط بمشكلة حقيقية في هذا المستودع أو بخطة الجاهزية `frontend-official-plan-ar.md`.
> القاعدة الأولى: **لا أحد يدفع إلى `master` مباشرة.** كل شيء يمر بفرع ثم PR ثم فحص ثم دمج.

---

## فهرس

| # | القسم |
|---:|---|
| 0 | [افهم الدنيا أولاً: 5 مفاهيم فقط](#0-افهم-الدنيا-أولاً-5-مفاهيم-فقط) |
| 1 | [القواعد الذهبية الاثنتا عشرة](#1-القواعد-الذهبية-الاثنتا-عشرة) |
| 2 | [الفروع: فرع لكل شيء](#2-الفروع-فرع-لكل-شيء) |
| 3 | [الكوميتس: كيف تكتب commit محترم](#3-الكوميتس-كيف-تكتب-commit-محترم) |
| 4 | [دورة العمل اليومية (بالأوامر)](#4-دورة-العمل-اليومية-بالأوامر) |
| 5 | [الـPull Request](#5-الـpull-request) |
| 6 | [المراجعة (Code Review)](#6-المراجعة-code-review) |
| 7 | [حماية الفرع على GitHub (الإعدادات الحرفية)](#7-حماية-الفرع-على-github-الإعدادات-الحرفية) |
| 8 | [الدمج والإصدارات والاستعادة](#8-الدمج-والإصدارات-والاستعادة) |
| 9 | [الملفات والأسرار وسطور النهاية](#9-الملفات-والأسرار-وسطور-النهاية) |
| 10 | [تنظيف المستودع الحالي (مهام فورية)](#10-تنظيف-المستودع-الحالي-مهام-فورية) |
| 11 | [خطة التبنّي في 30 يوماً](#11-خطة-التبنّي-في-30-يوماً) |
| 12 | [Cheatsheet: الأوامر التي ستستخدمها 90% من الوقت](#12-cheatsheet-الأوامر-التي-ستستخدمها-90-من-الوقت) |
| 13 | [مشاكل شائعة وحلولها](#13-مشاكل-شائعة-وحلولها) |
| 14 | [قوالب جاهزة للنسخ](#14-قوالب-جاهزة-للنسخ) |
| 15 | [ربط القواعد بخطة الجاهزية](#15-ربط-القواعد-بخطة-الجاهزية) |

---

## 0. افهم الدنيا أولاً: 5 مفاهيم فقط

كل تعقيد GitHub هو تركيب من خمسة أشياء:

| المفهوم | معناه الحقيقي | التشبيه |
|---|---|---|
| **Commit** | صورة (snapshot) كاملة للمشروع في لحظة، لها رقم SHA ورسالة. لا يمكن تعديلها بعد الرفع. | حفظة في لعبة |
| **Branch** | مؤشر متحرك على commit، يسمح لك تبني فوقه دون أن تلمس `master`. | مسودة منفصلة |
| **Remote (`origin`)** | النسخة على GitHub. `push` يرفع، `pull`/`fetch` ينزّل. | السحابة |
| **PR (Pull Request)** | طلب "راجعوا فروعي وادمجوه"، وهو مكان المراجعة والفحص والنقاش — ليس مجرد زر دمج. | طلب مراجعة رسمي |
| **Merge** | إدخال commits الفرع إلى `master`. عندنا: **Squash** = commit واحد نظيف. | اعتماد المسودة |

**الثلاث مناطق** التي يتحرك بينها الكود:

```
Working Directory  --git add-->  Staging (Index)  --git commit-->  Local Repo  --git push-->  origin
     تعديلاتك                     ما اخترته للـcommit                تاريخك                    GitHub
```

**لماذا فرع لكل شيء؟** لأن الفرع يجيب على 4 أسئلة بلا كلام:

1. **مين** عمل هذا التغيير؟ (المالك)
2. **ليه**؟ (رقم المهمة `FE-006` + رسالة commit)
3. **هل هو جاهز؟** (حالة PR + CI + مراجعة)
4. **كيف أرجعه؟** (PR واحد = revert واحد)

على `master` بلا فروع، كل هذه الإجابات تُفقد، وهذا بالضبط سبب أن تاريخ المستودع الحالي فيه `updates` و`Neo` — لا أحد يعرف ما الذي تغيّر ولا لماذا.

**قاعدة عقلية:** `master` ليس "مكان شغلي"، بل **سجلّ ما تم اعتماده**. الشغل في الفروع.

---

## 1. القواعد الذهبية الاثنتا عشرة

| # | القاعدة | السبب |
|---:|---|---|
| 1 | لا دفع مباشر إلى `master` — أبداً، ولا للأدمن | الحماية تقنية لا اجتماعية |
| 2 | فرع واحد لكل مهمة/إصلاح/تغيير إعداد | مراجعة أصغر، رجوع أسهل |
| 3 | اسم الفرع يبدأ بنوعه ويحمل رقم المهمة: `feat/FE-006-env-contract` | يُقرأ في القائمة بلا فتح |
| 4 | فرع عمره ≤ 3 أيام عمل | الفروع الطويلة = تعارضات مؤلمة |
| 5 | commit واحد = تغيير منطقي واحد | `git bisect` و`revert` يصبحان ممكنين |
| 6 | رسالة commit بصيغة `type(scope): subject` بالإنجليزية، والمحتوى يشرح **لماذا** | سجل قابل للقراءة والبحث |
| 7 | PR ≤ ~400 سطر تغيير منطقي (بدون lockfile/مولّد) | مراجعة حقيقية لا سطحية |
| 8 | PR لا يُدمج إلا: CI أخضر + موافقة + تعليقات محلولة | الجودة لا تعتمد على الانتباه |
| 9 | Squash merge + حذف الفرع | تاريخ `master` خطّي ونظيف |
| 10 | لا أسرار ولا `.env` ولا `node_modules` ولا `dist` في Git | تسريب لا يُلغى بـrevert |
| 11 | التراجع عن شيء مرفوع = `git revert` (وليس `reset --hard`) | `reset` يمحو تاريخ الآخرين |
| 12 | كل إصدار = tag + release notes + مالك rollback | الرجوع يحتاج نقطة معروفة |

**الاستثناء الوحيد:** إصلاح حاد في الإنتاج (S1) — يُسمح بمسار hotfix سريع، لكنه **يمر بنفس البوابات** (PR + CI + موافقة) بأسرع وقت، وليس بتجاوزها.

---

## 2. الفروع: فرع لكل شيء

### 2.1 الاستراتيجية: Trunk-based بفروع قصيرة

نستخدم `master` كفرع واحد دائم (trunk)، وفروع قصيرة العمر تُحذف بعد الدمج. **لا نستخدم `develop`.**

| لماذا لا `develop`؟ | لماذا `master` فقط؟ |
|---|---|
| فريق 2–3 مطورين، ولا توجد بيئة staging بعد | فرع دائم إضافي = خطوة دمج إضافية بلا فائدة |
| `develop` يخلق "شبه إنتاج" لا أحد يختبره فعلاً | كل ما في `master` = معتمد ومُختبَر |
| يتضاعف عدد الفروع والدمج | عدد أقل من الفروع = تعارضات أقل |

**الاستثناءات الدائمة المؤقتة:**

| الفرع | متى يُنشأ | العمر | القاعدة |
|---|---|---|---|
| `release/x.y.z` | عند تجميد إصدار كبير يحتاج إصلاحات فقط | أيام | إصلاحات فقط، لا ميزات |
| `hotfix/x.y.z` | عطل S1 في الإنتاج | ساعات | من الـtag، ثم دمج في `master` |
| `spike/<topic>` | تجربة/تحقيق تقني | ≤ 3 أيام | **لا يُدمج**؛ يُحذف بعد استخلاص النتيجة |

### 2.2 جدول أنواع الفروع

| النوع | البادئة | مثال من EduNest | يُدمج؟ | المدة |
|---|---|---|---|---|
| ميزة | `feat/` | `feat/FE-006-env-contract` | نعم | ≤ 3 أيام |
| إصلاح عادي | `fix/` | `fix/FE-003-console-logs` | نعم | ≤ 2 أيام |
| إصلاح عاجل إنتاج | `hotfix/` | `hotfix/1.2.1-auth-loop` | نعم | ≤ 1 يوم |
| صيانة/إعداد | `chore/` | `chore/FE-001-ci-baseline` | نعم | ≤ 2 أيام |
| توثيق فقط | `docs/` | `docs/github-workflow` | نعم | ≤ 1 يوم |
| إعادة هيكلة بلا سلوك جديد | `refactor/` | `refactor/FE-002-dead-modules` | نعم | ≤ 3 أيام |
| اختبارات فقط | `test/` | `test/FE-012-vitest-harness` | نعم | ≤ 2 أيام |
| أداء | `perf/` | `perf/FE-016-lazy-admin` | نعم | ≤ 3 أيام |
| CI/أدوات | `ci/` | `ci/add-typecheck-gate` | نعم | ≤ 1 يوم |
| إصدار | `release/` | `release/1.2.0` | نعم (بـtag) | أيام |
| تجربة | `spike/` | `spike/vite-8-upgrade` | **لا** | ≤ 3 أيام |

### 2.3 قواعد التسمية (تقنية)

- أحرف إنجليزية صغيرة وأرقام وشرطات فقط: `feat/FE-006-env-contract` ✅ · `feat/Env_Contract` ❌ · `شغلي` ❌
- بلا مسافات، بلا `_`، بلا نقاط.
- الطول ≤ 50 حرفاً.
- تحتوي رقم المهمة إن وُجد (`FE-###`) — يربط الفرع بالخطة والتذكرة.
- بلا اسمك: `feat/ahmed-test` ❌ — الاسم موجود في GitHub أصلاً.

### 2.4 "فرع لكل شيء" — جدول القرار

| لو أردت أن… | الفرع |
|---|---|
| تضيف ميزة | `feat/FE-###-short-slug` |
| تصلح bug | `fix/FE-###-short-slug` |
| تغيّر إعداد (ESLint/Vite/env) | `chore/FE-###-short-slug` |
| تكتب/تحدّث توثيقاً | `docs/short-slug` |
| تنقل ملفات أو تعيد تسمية | `refactor/short-slug` |
| تضيف اختبارات فقط | `test/FE-###-short-slug` |
| تحدّث حزمة | `chore/deps-<package>` |
| تجرّب شيئاً قد ترميه | `spike/short-slug` |
| تصلح إنتاجاً الآن | `hotfix/x.y.z-slug` |

**قاعدة صارمة:** لو احتجت أن تشرح في وصف PR كلمة "وأيضاً" مرتين — فأنت تحتاج 3 فروع لا واحداً.

---

## 3. الكوميتس: كيف تكتب commit محترم

### 3.1 الصيغة (Conventional Commits)

```
<type>(<scope>): <subject>

<body: لماذا، لا ماذا>

<footer: Refs/Closes/BREAKING CHANGE>
```

| الجزء | القاعدة |
|---|---|
| `type` | من الجدول أدناه فقط |
| `scope` | اختياري لكن مستحسن: المنطقة المتأثرة |
| `subject` | ≤ 72 حرفاً، بلا نقطة في النهاية، صيغة أمر، إنجليزي |
| `body` | سطر فارغ بعده، يشرح **السبب** والأثر، لا إعادة سرد الكود |
| `footer` | `Refs: FE-006` أو `Closes #12` أو `BREAKING CHANGE: ...` |

### 3.2 الأنواع المسموحة

| type | يستخدم لـ | مثال |
|---|---|---|
| `feat` | سلوك جديد للمستخدم | `feat(mentor): add submission grading panel` |
| `fix` | إصلاح خطأ | `fix(auth): stop redirect loop after token expiry` |
| `refactor` | تغيير كود بلا تغيير سلوك | `refactor(api): extract axios client factory` |
| `perf` | تحسين أداء | `perf(bundle): lazy-load admin dashboard` |
| `test` | اختبارات فقط | `test(auth): cover expired-token path` |
| `docs` | توثيق فقط | `docs: add GitHub workflow rules` |
| `build` | نظام البناء/الحزم | `build: pin node 20 in engines` |
| `ci` | إعداد CI | `ci: add typecheck and lint gates` |
| `chore` | صيانة لا تمس السلوك | `chore: remove nine unused packages` |
| `style` | تنسيق فقط (بلا منطق) | `style: apply prettier to src` |
| `revert` | تراجع عن commit سابق | `revert: feat(chat): add markdown renderer` |

### 3.3 `scope` المقترح لهذا المشروع

`auth` · `api` · `env` · `router` · `ui` · `student` · `mentor` · `admin` · `chat` · `files` · `forms` · `perf` · `a11y` · `i18n` · `deps` · `ci` · `docs` · `release`

### 3.4 من تاريخكم: إعادة صياغة (أمثلة توضيحية)

| الموجود | البديل |
|---|---|
| `updates` | `fix(mentor): correct submission status after grading` |
| `Neo` | `feat(chat): add bot message bubble` |
| `mentor-role updates` | `feat(mentor): add project submissions tab` |
| `final mentor updates` | `fix(mentor): persist draft state on refresh` |
| `edit max-length` | `fix(forms): cap textarea at 500 characters` |
| `Loading component` | `feat(ui): add shared loading spinner` |
| `reviews back-end updates` | `feat(api): align review endpoints with v1 contract` |
| `last commit of v1 of EduNest` | `chore(release): tag v1.0.0 baseline` |

**قاعدة:** لو حذفت الكود، هل تفهم من الرسالة **لماذا** كان موجوداً؟ لو لا، الرسالة ناقصة.

### 3.5 commit ذري (Atomic)

| ❌ خطأ | ✅ صحيح |
|---|---|
| commit فيه: إصلاح bug + ميزة + تنسيق + تحديث lockfile | 4 commits منفصلة، كل واحد يبني على السابق |
| commit فيه 60 ملفاً بلا علاقة | commit لكل نطاق منطقي |
| "wip" و"test" و"fix2" | احذفها قبل الـPR (squash سيحلها، لكن نظّف فروعك) |

**الاختبار:** لو احتجت أن تكتب في الرسالة "and" — قسّم الـcommit.

### 3.6 أوامر مفيدة

```bash
git add -p                     # اختر التغييرات سطراً بسطر (أفضل من add .)
git add src/services/api.ts    # ملف محدد
git commit                     # يفتح المحرر لرسالة متعددة الأسطر
git commit -m "fix(api): read base URL from env" -m "Refs: FE-006"
git commit --amend             # فقط قبل push، وللـcommit الأخير فقط
git log --oneline -10          # راجع قبل الدفع
git show --stat HEAD           # ماذا يحتوي commit الأخير فعلاً
```

**ممنوعات:**

- `git commit --amend` أو `push --force` على فرع **شاركه** أحد.
- commit فيه `.env` أو توكن أو كلمة سر — حتى لو حذفته في commit لاحق، فهو في التاريخ.
- `git add .` أعمى في مشروع فيه ملفات مولدة (`dist`, `coverage`).
- رسالة commit فارغة المعنى (`fix`, `.`, `final`).

---

## 4. دورة العمل اليومية (بالأوامر)

```bash
# 1) حدّث master
git switch master
git pull --ff-only

# 2) أنشئ فرعاً للمهمة
git switch -c feat/FE-006-env-contract

# 3) اشتغل… وكلّما أنجزت جزءاً منطقياً:
git status
git add -p
git commit -m "feat(env): add validated env config module" -m "Refs: FE-006A"

# 4) قبل النوم: ارفع الفرع
git push -u origin feat/FE-006-env-contract

# 5) في الصباح: خُذ آخر master فوق فرعك
git fetch origin
git rebase origin/master

# 6) افتح PR (Draft في البداية إن لم يكتمل)
gh pr create --draft --fill

# 7) لمّا يجهز: علّمه Ready for review
gh pr ready

# 8) راقب الفحوص
gh pr checks --watch

# 9) بعد الموافقة: squash merge + حذف الفرع
gh pr merge --squash --delete-branch

# 10) ارجع نظيفاً
git switch master && git pull --ff-only
git branch -d feat/FE-006-env-contract
```

### قواعد إضافية للدورة

| الموقف | القاعدة |
|---|---|
| الفرع عمره > 3 أيام | قسّمه، أو ادمج جزءاً منه خلف flag |
| `rebase` أم `merge master`؟ | `rebase` للفروع الشخصية فقط. **لو الفرع مشترك بين شخصين: `merge`** (rebase يكتب تاريخ الآخرين) |
| تعارضات | حلّها محلياً، شغّل `typecheck`/`lint`/`test` بعد الحل، ثم `git rebase --continue` |
| نسيت وأنت على `master` وعدّلت | `git switch -c fix/xxx` — التعديلات تنتقل معك بلا فقدان |
| دفعت بالخطأ إلى `master` | لا تعمل `reset`؛ أبلغ TL فوراً وسيُعالج بـ`revert` |
| PR مفتوح منذ أسبوع | إما يُغلق أو يُقسَّم — لا يبقى "معلقاً" |

**نقطة تفتيش يومية (30 ثانية):** `git status` + `git branch --show-current`. لو الاثنان غير متوقعين، توقف.

---

## 5. الـPull Request

### 5.1 القواعد الصلبة

| القاعدة | القيمة |
|---|---|
| الحجم | ≤ 400 سطر تغيير منطقي (يُستثنى `package-lock.json` والملفات المولدة) |
| العمر | ≤ 3 أيام من الفتح للدمج |
| الوصف | لا يُقبل PR بلا وصف (ولو سطرين) |
| نطاق | تغيير واحد. "Feature + refactor" = مرفوض |
| الدليل | لقطات/سجل اختبار/مخرجات أوامر للتغييرات المرئية |
| العنوان | `FE-###: وصف قصير` (نفس اصطلاح الخطة) |
| الحالة | Draft حتى يجهز — لا تطلب مراجعة على شغل ناقص |

### 5.2 عنوان PR

```
FE-006: عقد البيئة ورابط API من متغيرات البيئة
FE-003: إزالة console غير المحمي من طبقة API
docs: قواعد العمل على GitHub
hotfix/1.2.1: منع حلقة التحويل بعد انتهاء التوكن
```

### 5.3 وصف PR — القالب (إلزامي)

```markdown
## ماذا
- وصف مختصر للتغيير (2–4 نقاط)

## لماذا
- المشكلة/الدليل (رابط finding أو بند قائمة أو تذكرة)
- Refs: FE-006

## كيف
- القرار التقني البديل الذي رُفض إن وُجد

## كيف تختبره
1. ...
2. ...

## الدليل
- [ ] لقطات قبل/بعد (لو مرئي)
- [ ] مخرجات `npm run typecheck` / `lint` / `test`
- [ ] تسجيل/لقطة console+network

## المخاطر والرجوع
- الأثر: منخفض/متوسط/عالي
- الرجوع: revert هذا الـPR (لا migrations ولا تغيير عقد)

## Checklist
- [ ] لا أسرار ولا `.env` ولا PII في الكود أو اللوجات
- [ ] لا `console.log` غير محمي
- [ ] الأنواع بلا `any` غير مبرر
- [ ] الحالات: loading / empty / error / success
- [ ] a11y: labels، أسماء أزرار، كيبورد
- [ ] تجاوب 360px + ديسكتوب
- [ ] الاختبارات مضافة/محدثة
- [ ] الوثائق/`.env.example` محدثة عند الحاجة
```

### 5.4 Draft PR

استخدمه عندما:

- تريد مراجعة مبكرة للاتجاه (قبل كتابة 300 سطر).
- تريد أن يعمل CI على فرعك.
- تنتظر قراراً من الـBackend/التصميم.

**لا تطلبه عندما** يكون العمل مكتملاً — عندها اضغط Ready مباشرة.

### 5.5 ممنوعات PR

- PR فيه 40 ملفاً "لأنني نسيت أفرّع".
- PR يخلط تنسيقاً كاملاً للمشروع مع إصلاح bug (يجعل المراجعة مستحيلة).
- PR يغيّر `package-lock.json` بلا تغيير في `package.json` (أو العكس).
- PR بلا وصف: "fix".
- PR يعدّل ملفات شخصية (`.vscode/settings.json`, `.idea`).
- PR يعلّق فيه المالك على نفسه ويوافق على نفسه (إلا في وضع المطور الواحد، مع CI إلزامي + مهلة 24 ساعة).

---

## 6. المراجعة (Code Review)

### 6.1 من يراجع وكم

| حجم الفريق | الموافقات المطلوبة | ملاحظة |
|---|---|---|
| 2–3 مطورين | 1 | لا يوافق أحد على PR نفسه |
| 4+ | 2 (واحد منهم CODEOWNER للمسار) | — |
| مطور واحد فقط | 0 موافقات بشرية، لكن **CI إلزامي** + مهلة 24 ساعة قبل الدمج | استثناء موثق في وصف PR |

**SLA:** P0/أمن/auth — نفس يوم العمل. غيرها — 24 ساعة. لو تجاوزت، صعّد إلى TL.

### 6.2 ماذا يفحص المراجع (بالترتيب)

| # | الفحص | سؤال واحد |
|---:|---|---|
| 1 | الصحة | هل يطابق الوصف والمهمة؟ هل هناك سلوك غير مذكور؟ |
| 2 | الأمان | هل دخل سر/توكن/PII؟ هل `dangerouslySetInnerHTML`/`eval`/`href` غير محقق؟ |
| 3 | الحالات | loading / empty / error / success — كلها موجودة؟ |
| 4 | الأنواع | `any` مبرر؟ حدود API مُنمّطة؟ |
| 5 | a11y | label لكل input؟ اسم لكل زر أيقونة؟ كيبورد؟ |
| 6 | الأداء | import ثقيل جديد؟ إعادة رندر واضحة؟ |
| 7 | الاختبارات | تختبر السلوك لا التنفيذ؟ حالة سلبية؟ |
| 8 | التشغيل | `.env.example` محدث؟ أثر rollback؟ |

### 6.3 آداب التعليقات

| البادئة | المعنى | يمنع الدمج؟ |
|---|---|---|
| `blocking:` | خطأ يجب إصلاحه | نعم |
| `suggestion:` | تحسين مستحسن | لا |
| `nit:` | تفضيل شخصي/تنسيق | لا |
| `question:` | فهم غير واضح | لا (لكن يجب الرد) |
| `praise:` | شيء جيد — قلّه | لا |

**قواعد:** علّق على الكود لا على الشخص. لا "لماذا كتبت هذا؟" بل "لو استخدمنا X، هل نتجنب Y؟". لا موافقة على كود لم تقرأه. لا `LGTM` مع 5 ملاحظات blocking.

### 6.4 حل الخلاف

1. ناقش في الـPR (مكتوب، ليس شفهياً).
2. لو لم يُحل في دورتين → TL يقرر ويكتب السبب.
3. لو القرار معماري → يُسجل في `documentaion/` كقرار (ADR صغير) حتى لا يتكرر النقاش.

---

## 7. حماية الفرع على GitHub (الإعدادات الحرفية)

المكان: `Settings → Branches → Add branch protection rule` (أو `Settings → Rules → New ruleset` في الواجهة الأحدث). الهدف: `master`.

| الإعداد | القيمة | السبب |
|---|---|---|
| Branch name pattern | `master` | الفرع الوحيد الدائم |
| Require a pull request before merging | ✅ | يمنع الدفع المباشر |
| Required approvals | **1** (فريق ≥4: 2) | مراجعة بشرية حقيقية |
| Dismiss stale approvals on new commits | ✅ | موافقة قديمة لا تغطي كوداً جديداً |
| Require review from Code Owners | ✅ (بعد إضافة `CODEOWNERS`) | المسار الصحيح يراجعه صاحبه |
| Require status checks to pass | ✅ | الجودة آلية |
| → Status checks | `typecheck`, `lint`, `test`, `build` | أسماء المهام في CI |
| Require branches to be up to date | ✅ | يمنع "أخضر على كود قديم" |
| Require conversation resolution | ✅ | لا تعليق مفتوح يُتجاهل |
| Require linear history | ✅ | يفرض squash/rebase، تاريخ نظيف |
| Do not allow bypassing the above | ✅ (Include administrators) | الأدمن أيضاً يمر بالبوابات |
| Allow force pushes | ❌ | يمحو التاريخ |
| Allow deletions | ❌ | حماية من الخطأ |
| Require signed commits | اختياري | جيد، لكنه يضيف تعقيد مفاتيح |
| Lock branch | ❌ | يحتاج PRs عادية |

**قواعد إضافية على الـtags:** Ruleset على `v*` يمنع الحذف والتعديل القسري، حتى لا يختفي وسم إصدار.

**ملاحظة واقعية:** حتى تُضاف فحوص CI (المهمة `FE-001`)، ستكون خيارات status checks فارغة. الترتيب الصحيح:

1. أضف workflow CI أولاً (`FE-001`).
2. تأكد أن أسماء المهام ظهرت في PR واحد.
3. فعّل الحماية واختر الأسماء من القائمة.

لا تفعّل "require status checks" قبل وجودها — ستحجب كل الدمج بلا سبب.

**إعدادات المستودع الموصى بها:**

| الإعداد | القيمة |
|---|---|
| Merge button | Squash only (أطفئ Merge commit وRebase merge) |
| Automatically delete head branches | ✅ |
| Allow auto-merge | ✅ (بعد نجاح الفحوص) |
| Default branch | `master` |
| Issues | ✅ (كل مهمة = Issue برقم `FE-###`) |
| Wiki/Projects | اختياري |

---

## 8. الدمج والإصدارات والاستعادة

### 8.1 استراتيجية الدمج

**Squash فقط.** النتيجة: commit واحد على `master` لكل PR، رسالته = عنوان PR.

| الطريقة | النتيجة | الحكم |
|---|---|---|
| Merge commit | تاريخ متشعب + commits "wip" مرئية | ❌ |
| Rebase merge | خطّي لكن يحفظ كل commits صغيرة | ⚠️ مسموح لو commits نظيفة |
| **Squash** | commit واحد نظيف لكل PR | ✅ الافتراضي |

بعد الدمج: احذف الفرع (محلياً وريموتياً). GitHub يفعلها تلقائياً إن فعّلت الخيار.

### 8.2 الإصدارات (Tags + Releases)

```bash
git switch master && git pull --ff-only
git tag -a v1.0.0 -m "EduNest frontend v1.0.0"
git push origin v1.0.0
gh release create v1.0.0 --generate-notes
```

| القاعدة | التفصيل |
|---|---|
| Semantic Versioning | `MAJOR.MINOR.PATCH` — كسر توافق / ميزة / إصلاح |
| الوسم | `v` + الرقم، دائماً على `master` |
| notes | تُولَّد من commits (لهذا Conventional Commits مهم) |
| نقطة الرجوع | آخر tag معروف-جيداً = هدف rollback |
| توقيت | بعد نجاح smoke على staging، لا قبله |

**v1.0.0 الحالي؟** آخر commit اسمه "last commit of v1" لكن لا يوجد tag. أول عمل: وسم خط الأساس بعد التحقق (`chore(release): tag v1.0.0`).

### 8.3 مسار الإصلاح العاجل (Hotfix)

```
master @ v1.2.0 ──► hotfix/1.2.1-auth-loop ──► PR (CI + موافقة سريعة) ──► squash ──► tag v1.2.1 ──► نشر
```

| الخطوة | القاعدة |
|---|---|
| 1 | الفرع من `master` (أو من الـtag لو master تحرّك) |
| 2 | إصلاح واحد فقط، بلا "تحسينات صغيرة" |
| 3 | PR بعنوان `hotfix/1.2.1: ...` + سبب الحادث |
| 4 | نفس البوابات، SLA مضغوط (ساعة) |
| 5 | tag patch + release notes قصيرة |
| 6 | إن كان هناك `release/x.y.z` نشط، ادمج الإصلاح فيه أيضاً |

### 8.4 الاستعادة (Rollback) — الفرق الحاسم

| الأمر | ماذا يفعل | متى |
|---|---|---|
| `git revert <sha>` | ينشئ commit جديداً يعكس التغيير | **التراجع عن شيء مرفوع/مدموج — دائماً** |
| `git reset --hard <sha>` | يحرّك الفرع ويمحو commits | **محلي فقط، على commits لم تُرفع** |
| `git restore <file>` | يرجع ملفاً لحالته السابقة | إلغاء تعديل محلي |
| `git checkout <sha> -- <file>` | يجلب نسخة ملف من commit قديم | استرجاع ملف محدد |

**قصة تحذيرية من مستودعكم:** يوجد ملف متتبَّع اسمه حرفياً `et --hard dcabfc0` (أُضيف في commit `695fcf1`). هذا ناتج عن أمر مكتوب خطأً مثل `git reset --hard dcabfc0 > ملف` أو لصق أمر ناقص — والأسوأ أنه دخل التاريخ. **`reset --hard` لا يُكتب يدوياً بلا تركيز، ولا يُشغَّل على فرع مشترك.**

**الاستعادة في الإنتاج** ليست `git` فقط — هي إجراء تشغيلي: أعِد نشر الأصل السابق، ثم تحقق بـsmoke. التفاصيل في `frontend-official-plan-ar.md` القسم 10.

---

## 9. الملفات والأسرار وسطور النهاية

### 9.1 لا يُرفع أبداً

| ممنوع | لماذا |
|---|---|
| `.env`, `.env.local`, `.env.production` | أسرار |
| `node_modules/` | حجم + ضوضاء |
| `dist/`, `build/` | مولّد، يُبنى في CI |
| `coverage/`, `playwright-report/`, `test-results/` | مولّد |
| `*.log`, `.DS_Store`, `Thumbs.db` | ضوضاء |
| ملفات IDE الشخصية | تفضيلات فردية |
| نسخ احتياطية (`*.bak`, `*.zip`, `copy of ...`) | فوضى |
| سكرين شوتس مؤقتة | استخدم مرفقات PR |

### 9.2 إضافات مطلوبة إلى `.gitignore`

الموجود حالياً جيد لكنه ناقص:

```gitignore
# environment
.env
.env.*
!.env.example

# build & test output
dist
dist-ssr
coverage
*.tsbuildinfo
playwright-report
test-results
.eslintcache

# os / editor
.DS_Store
Thumbs.db
```

> `.env.example` **يُرفع** (قيم وهمية فقط) — هو العقد الذي يوثّق المتغيرات بلا أسرار.

### 9.3 سطور النهاية (Line Endings) — مهم على ويندوز

المستودع على ويندوز + OneDrive، وخطر اختلاف CRLF/LF يظهر كـ"كل الملفات معدّلة".

أضف `.gitattributes`:

```gitattributes
* text=auto eol=lf
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.pdf binary
package-lock.json text eol=lf
```

ثم (في **PR منفصل** لأن كل الملفات ستظهر معدّلة):

```bash
git add --renormalize .
git commit -m "chore: normalize line endings with .gitattributes"
```

### 9.4 الأسرار: ثلاث طبقات

| الطبقة | الأداة | متى |
|---|---|---|
| منع | `.gitignore` + مراجعة PR | دائماً |
| كشف | `gitleaks` في CI (المهمة `FE-011`) | كل PR |
| استجابة | rotation فوري + تنظيف التاريخ | عند التسريب |

**لو رفعت سراً بالخطأ:**

1. اعتبره **مكشوفاً** فوراً — حتى لو حذفته في commit لاحق.
2. أبلغ TL/مالك المفتاح.
3. **دوّر (rotate) المفتاح** — هذا هو الإصلاح الحقيقي.
4. تنظيف التاريخ (`git filter-repo`) يحتاج تنسيقاً لأن كل الفروع تتغير.

### 9.5 ⚠️ تحذير خاص بهذا المستودع: OneDrive

المسار الحالي: `C:\Users\shahd\OneDrive\Desktop\EDUNEST\EduNest`.

**المشكلة:** OneDrive يزامن مجلد `.git` أثناء عمليات git، فينتج:

- ملفات مقفلة / `index.lock` عالق.
- تعارضات نسخ (`EduNest-نسخة-من-الجهاز.git`).
- بطء شديد في `status`/`checkout`.
- في أسوأ الحالات: تلف في `.git`.

**التوصية:**

1. انقل المستودع خارج OneDrive: `C:\dev\EduNest`.
2. أو استثنِ المجلد من المزامنة (OneDrive → Settings → Choose folders).
3. لا تعمل git على مجلد "قيد المزامنة" أثناء نقل ملفات كبيرة.

GitHub هو النسخة الاحتياطية الحقيقية — OneDrive لا يضيف شيئاً لـ`.git` بل يضرّه.

---

## 10. تنظيف المستودع الحالي (مهام فورية)

| # | الملاحظة | الإجراء | الفرع |
|---:|---|---|---|
| 1 | ملف متتبَّع `et --hard dcabfc0` | `git rm "et --hard dcabfc0"` + commit | `chore/remove-stray-file` |
| 2 | `node_modules` موجود محلياً (متجاهل — جيد) | لا تفعل شيئاً؛ تأكد أنه غير متتبع | — |
| 3 | لا `.github/` | إضافة PR template + CODEOWNERS | `chore/add-github-templates` |
| 4 | لا حماية فرع | تفعيلها في Settings (بعد CI) | — (إعداد) |
| 5 | لا tag لأي إصدار | وسم خط الأساس بعد التحقق | `chore/release-tag-baseline` |
| 6 | `TODO.md` و8 علامات TODO/FIXME | فرزها في مهام (`FE-004`) | `chore/FE-004-todo-triage` |
| 7 | تاريخ commits غير مفهوم | لا تُعد كتابة التاريخ؛ ابدأ النظام من الآن | — |
| 8 | `documentaion/` (خطأ إملائي) | إما تثبيته كاسم معتمد أو إعادة تسمية في PR واحد | `refactor/docs-folder-name` |
| 9 | `.env` غير موجود، `.env.example` غير موجود | إنشاؤه في `FE-006A` | `feat/FE-006A-env-contract` |
| 10 | CI غير موجود | `FE-001` | `chore/FE-001-ci-baseline` |

**ترتيب التنفيذ الصحيح:**

```
1. CI (FE-001)            ← بدونها الحماية شكلية
2. حماية master            ← تمنع الفوضى من الغد
3. تنظيف (ملف غريب، .gitignore، .gitattributes)
4. قوالب PR/Issues/CODEOWNERS
5. أول tag + release notes
6. بعدها: ابدأ مهام الجاهزية FE-002 …
```

> **لا تحاول إصلاح التاريخ القديم.** التاريخ الفوضوي لا يضرّ إلا كمرجع؛ إعادة كتابته تكلّف أكثر مما تنفع. المهم أن كل commit جديد من الآن مفهوم.

---

## 11. خطة التبنّي في 30 يوماً

| الأسبوع | الهدف | المخرج الملموس |
|---|---|---|
| 1 | الأساس | CI بسيط (install + typecheck + build) · حماية `master` (PR + فحص) · حذف الملف الغريب · إضافة `.gitattributes` |
| 2 | العادة | كل عمل في فرع · PR template · أسماء فروع صحيحة · squash فقط · حذف الفروع تلقائياً |
| 3 | الجودة | lint + test في CI · CODEOWNERS · أول 3 PRs صغيرة (< 400 سطر) · أول tag |
| 4 | النضج | قوالب Issues (`FE-###`) · release notes مولّدة · مراجعة أسبوعية: كم PR تجاوز 3 أيام؟ كم commit بلا نوع؟ |

**مؤشرات نجاح بعد 30 يوماً:**

- صفر commits مباشرة على `master`.
- متوسط عمر PR < 3 أيام.
- كل PR له وصف ودليل.
- `master` دائماً أخضر.
- يوجد tag واحد على الأقل يمكن الرجوع إليه.

**مؤشرات فشل مبكر (صحّحها فوراً):**

- "سأفتح PR بعد ما أخلص كل حاجة" (فرع عمره أسبوعان).
- حماية معطّلة "مؤقتاً" للأدمن.
- PRs تُدمج بلا مراجعة "لأننا مستعجلون".
- `push --force` على فرع مشترك.

---

## 12. Cheatsheet: الأوامر التي ستستخدمها 90% من الوقت

| الهدف | الأمر |
|---|---|
| حالة المشروع | `git status -sb` |
| الفرع الحالي | `git branch --show-current` |
| تحديث master | `git switch master && git pull --ff-only` |
| فرع جديد | `git switch -c feat/FE-006-env-contract` |
| تبديل فرع | `git switch fix/FE-003-console-logs` |
| مراجعة قبل الإضافة | `git diff` |
| إضافة انتقائية | `git add -p` |
| commit | `git commit -m "type(scope): subject" -m "Refs: FE-###"` |
| رفع أول مرة | `git push -u origin <branch>` |
| رفع التحديثات | `git push` |
| جلب master | `git fetch origin` |
| تحديث فرعي فوق master | `git rebase origin/master` |
| تعارض: إلغاء rebase | `git rebase --abort` |
| تعارض: متابعة | `git add <file> && git rebase --continue` |
| إنشاء PR | `gh pr create --fill` |
| PR مسودة | `gh pr create --draft --fill` |
| فحص حالة CI | `gh pr checks --watch` |
| دمج squash | `gh pr merge --squash --delete-branch` |
| حذف فرع محلي | `git branch -d <branch>` |
| سجل مختصر | `git log --oneline --graph -15` |
| ماذا في commit | `git show --stat <sha>` |
| تراجع عن مدموج | `git revert <sha>` |
| إلغاء تعديل ملف | `git restore <file>` |
| stash سريع | `git stash push -m "wip"` / `git stash pop` |
| tag | `git tag -a v1.0.0 -m "..." && git push origin v1.0.0` |

---

## 13. مشاكل شائعة وحلولها

| المشكلة | الحل |
|---|---|
| عدّلت على `master` بالخطأ | `git switch -c fix/xxx` — التعديلات تنتقل، لا تفقد شيئاً |
| `push` مرفوض: "non-fast-forward" | `git pull --rebase origin <branch>` ثم `git push` |
| `push` مرفوض: "protected branch" | أنت على `master` — أنشئ فرعاً وPR |
| نسيت إنشاء فرع ودفعت | أبلغ TL؛ الحل `revert` ثم إعادة العمل في فرع |
| تعارض في `package-lock.json` | لا تحلّه يدوياً: `git checkout --theirs package-lock.json` ثم `npm install` ثم commit |
| حذفت فرعاً بالخطأ | `git switch -c <branch> <sha>` من `git reflog` |
| `detached HEAD` | `git switch -c fix/xxx` لتحويل الحالة إلى فرع |
| commit برسالة غلط ولم يُرفع | `git commit --amend` |
| commit برسالة غلط ومرفوع | لا تُعد التاريخ؛ اتركه، واكتب commit لاحقاً واضحاً (أو `revert`) |
| دخل `.env` في commit | دوّر الأسرار فوراً + `git rm --cached .env` + `.gitignore` |
| دخل `node_modules` | `git rm -r --cached node_modules` + تأكد من `.gitignore` |
| PR كبير جداً | أغلقه، قسّمه إلى فروع/PRs أصغر |
| CI فاشل ولا أفهم لماذا | شغّل نفس الأمر محلياً: `npm ci && npm run typecheck && npm run lint && npm run build` |
| "كل الملفات معدّلة" بلا سبب | سطور النهاية: أضف `.gitattributes` + `git add --renormalize .` |
| `index.lock` موجود | تأكد أن لا git يعمل، ثم `rm .git/index.lock` (واحدث السبب: OneDrive) |

---

## 14. قوالب جاهزة للنسخ

> لم تُضف إلى المستودع بعد. عند الموافقة تُنشأ كما هي.

### 14.1 `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## ماذا
<!-- 2–4 نقاط -->

## لماذا
<!-- المشكلة/الدليل + Refs: FE-### -->

## كيف تختبره
1.
2.

## الدليل
- [ ] لقطات قبل/بعد
- [ ] مخرجات typecheck/lint/test
- [ ] console/network نظيف

## المخاطر والرجوع
- الأثر:
- الرجوع:

## Checklist
- [ ] لا أسرار / .env / PII
- [ ] لا console غير محمي
- [ ] لا any غير مبرر
- [ ] loading / empty / error / success
- [ ] a11y (labels, names, keyboard)
- [ ] 360px + desktop
- [ ] اختبارات مضافة
- [ ] .env.example / docs محدثة
```

### 14.2 `.github/ISSUE_TEMPLATE/task.md`

```markdown
---
name: Task
about: مهمة من خطة الجاهزية
labels: task
---

## المهمة
`FE-###` — <العنوان>

## المشكلة (دليل)
<ملف:سطر / عدد / ملاحظة>

## معايير القبول
- Given … When … Then …

## الملفات المتوقعة
- `src/...`

## التبعيات
- يحجب / محجوب بـ

## الدليل المطلوب
- [ ] ...
```

### 14.3 `.github/CODEOWNERS`

```
# كل شيء افتراضياً لمالك الفرونت
*                   @<frontend-lead>

# مسارات حساسة تحتاج مراجعة أمنية
/src/services/      @<frontend-lead> @<security>
/src/store/         @<frontend-lead> @<security>
/src/config/        @<frontend-lead>
/.github/           @<frontend-lead>
/package.json       @<frontend-lead>
/package-lock.json  @<frontend-lead>
```

### 14.4 `.gitattributes`

```gitattributes
* text=auto eol=lf
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.pdf binary
package-lock.json text eol=lf
```

### 14.5 `.github/dependabot.yml` (يُفعّل مع `FE-025`)

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
    groups:
      minor-and-patch:
        update-types: ["minor", "patch"]
```

### 14.6 Hook بسيط لرسالة commit (اختياري، لاحقاً مع `FE-001`)

```bash
# .git/hooks/commit-msg  (أو husky + commitlint)
#!/bin/sh
msg=$(head -n1 "$1")
echo "$msg" | grep -Eq '^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?: .{5,72}$' \
  || { echo "❌ رسالة commit غير مطابقة: type(scope): subject"; exit 1; }
```

---

## 15. ربط القواعد بخطة الجاهزية

| القاعدة هنا | تُغلق أي بند في الخطة |
|---|---|
| فرع لكل مهمة + PR | B-06 (كود ميت/مسارات مكررة)، R-02 |
| رسالة commit واضحة | التتبّع بين الكود والمهمة (كل الـ59 بنداً) |
| لا أسرار في Git | S-01، S-02، FE-011 |
| فحص الأسرار في CI | S-01، FE-011 |
| حماية الفرع + فحوص إلزامية | B-01…B-04، REL-01، FE-001 |
| PR template + checklist | U-05، S-06، جودة المراجعة |
| CODEOWNERS | مراجعة أمنية للمسارات الحساسة |
| Tags + release notes | M-06، R-04، FE-026 |
| rollback بـrevert + runbook | M-06، M-07، MON-03 |
| Dependabot | S-07 (جزئياً)، FE-025 |

**المبدأ:** خطة الجاهزية تقول **ماذا يجب أن يتحقق**. هذا المستند يقول **كيف يمر العمل يومياً** دون أن يعود المستودع إلى حالة `updates` و`Neo`.

---

## ملاحظة أخيرة

الشركات لا تعمل بهذه الطريقة لأنها كبيرة، بل لأن هذه الطريقة هي ما يجعلها قادرة على أن تكبر. الفرق بين `master` نظيف و`master` فوضوي ليس الذكاء — هو أن أحداً كتب القاعدة، وآخر فعّلها تقنياً، والثالث التزم بها حتى عندما كان مستعجلاً.

**ابدأ بثلاثة أشياء فقط هذا الأسبوع:**

1. فعّل حماية `master`.
2. لا تدفع إلا من فرع.
3. اكتب commit واحداً مفهوماً اليوم.

الباقي عادة، والعادة تُبنى بالتكرار لا بالنية.
