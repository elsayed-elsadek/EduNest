# إنشاء الـBacklog في Jira — مشروع `EF`

> **الحالة الحالية:** الـ38 عنصر **اتعملوا فعلاً في جيرا**، وكلهم بقوا **Tasks** (`EF-8`…`EF-45`) — حتى الـ7 عناصر اللي كانت Epics اتحوّلوا Tasks عشان يظهروا كصفوف في الـBacklog.
> **إضافة:** خطة توزيع الإصدار بين سيد وشهد اتضافت كـ**18 Task** (`EF-46`…`EF-63`): 16 مهمة شخصية (S-01…S-08 لسيد، H-01…H-08 لشهد) + `SH-01` المهام المشتركة + `REL-01` بوابة الإصدار.
> النتيجة: **63 Task** في المشروع (بالإضافة لـ`EF-1`…`EF-7` القديمة)، بدون Sub-tasks وبدون فجوات في الأرقام.
> خريطة المفاتيح: `jira/jira-created-keys.csv` — البورد: https://mromarmedhat.atlassian.net/jira/software/projects/EF/boards/4/backlog
> الأقسام اللي تحت موصوفة كمرجع تاريخي لطريقة الإنشاء (MCP / API token / CSV).
> الملفات كلها في الفولدر ده: `documentaion/frontend-production-readiness/jira/`

---

## 1. ليه مش قادر أكتب في جيرا؟ (السبب الحقيقي)

اختبرت الاتصال مباشرة، والنتيجة:

| الاختبار | النتيجة | المعنى |
|---|---|---|
| `mromarmedhat.atlassian.net/rest/api/3/myself` | `401` | ✅ الموقع **موجود** ومحتاج تسجيل دخول |
| `shahdwalid64200.atlassian.net/...` | `404` | ❌ الموقع **مش موجود** أصلاً |
| الـMCP grant الحالي | مربوط بـ `shahdwalid64200` | ❌ يعني مربوط بموقع ميت |
| محاولة قراءة مشروع `EF` | `Cloud id 4f26f716-… isn't explicitly granted` | ❌ موقع `mromarmedhat` مش داخل في الموافقة |

**الخلاصة:** التوكن اللي OpenCode شغّال بيه متمنح لموقع تاني (مش موجود). مشكلة موافقة (Consent)، مش مشكلة في المشروع ولا في التوكن بتاعك.

> **تحديث (آخر محاولة):** أدوات Atlassian MCP رجعت متاحة، لكن الـgrant لسه مربوط بـ`shahdwalid64200.atlassian.net` اللي بيرجع `404` — يعني الكتابة في `EF` من الجلسة دي **مقفولة** لحد ما الموافقة تتصلح. عشان كده جهزت مسارين مستقلين تماماً عن الـMCP — الطريقة (ب) والطريقة (ج) تحت — أي واحد فيهم بينشئ الـ38 عنصر بنفس المحتوى بالظبط.

### الإصلاح (دقيقتين) — لو عايز ترجع مسار الـMCP

1. في OpenCode: افتح **Settings → MCP / Connectors → atlassian**.
2. اضغط **Disconnect** ثم **Reconnect**.
3. في شاشة أتلاسيان: سجّل دخول بالحساب اللي بيملك `mromarmedhat`.
4. في خطوة اختيار المواقع (Sites) — **اختار `mromarmedhat.atlassian.net`** بالتحديد. لو الشاشة بتسمح بموقع واحد بس، اختار ده.
5. اتأكد إن `atlassian` رجع في قائمة الأدوات، وبعدها قولّي **"تم"**.

أول ما تتفتح الصلاحية، أنا بشغّل الأمر ده وبعمل الـ38 عنصر وأرجّعلك مفاتيح `EF-xx`:

```powershell
node "documentaion\frontend-production-readiness\jira\sync-jira.mjs"
```

**لو مش عايز تعيد الربط:** الطريقة (ب) — سكربت بتوكن جيرا — بتعمل نفس الحاجة بالظبط من غير MCP خالص.

---

## 2. الملفات

| الملف | إيه ده |
|---|---|
| `sync-jira.mjs` | سكربت واحد بيقرأ ملفات التاسكات وينشئ كل حاجة في جيرا. آمن، idempotent، ومعاه أوضاع offline |
| `jira-import-EF.csv` | نفس الـ38 عنصر في CSV جاهز للاستيراد اليدوي من واجهة جيرا (لو مش عايز تعمل توكن) |
| `jira-created-keys.csv` | بيتولّد بعد الإنشاء: خريطة `FE-001 → EF-12` |

**المصدر:** `../jira-tasks-batch-01.md` + `../jira-tasks-batch-02.md` — أي تعديل هناك يظهر تلقائياً عند إعادة التشغيل.

---

## 3. إيه اللي هيتعمل بالظبط؟

**الترتيب إجباري** (الـEpics الأول، بعدين الـTasks، بعدين الـSub-tasks):

| المرحلة | العدد | التفاصيل |
|---|---|---|
| 1. Epics | 7 | `[FE-EPIC-01]` … `[FE-EPIC-07]` |
| 2. Tasks | 26 | `[FE-001]` … `[FE-026]` — كل واحدة متربوطة بالـEpic بتاعها عن طريق `parent` |
| 3. Sub-tasks | 5 | `FE-006A/B/C` تحت `FE-006` · `FE-012A/B` تحت `FE-012` |

**كل Issue فيه:**

- **Summary** بصيغة `[FE-001] Reproducible build baseline and CI gates` — الـID ظاهر في العنوان عشان التقارير والربط
- **Description** كاملة بنفس شكل المثال اللي بعتّه:
  - User Story (As a… I want… So that…)
  - Description بالمشكلة والدليل (ملف + رقم سطر)
  - Scope (In / Out)
  - Functional Requirements (جدول مرقّم)
  - Acceptance Criteria (Checklist قابلة للقياس)
  - Test Scenarios (ID · Given · When · Then · Type · Blocking) ومربوطة بـ`TC-*` من مصفوفة الـQA
  - Definition of Done
  - Files
  - Evidence to attach
- **Priority**: P0 → `Highest` · P1 → `High` · P2 → `Medium` · P3 → `Low`
- **Labels**: `frontend` `production-readiness` + label الأولوية + label المجال
- **Parent**: الـEpic أو الـTask الأب

**ملاحظة عن الـBacklog:** أي Issue بيتعمل من غير Sprint بيروح **Backlog** تلقائياً على board 4. مفيش حاجة تانية مطلوبة.

---

## 4. الطريقة (ب) — تعملها بنفسك بتوكن جيرا

لو مش عايز تعيد ربط الـMCP، ده بديل مستقل تماماً.

### خطوة 1: اعمل API Token

افتح: <https://id.atlassian.com/manage-profile/security/api-tokens> → **Create API token** → سمّيه `edunest-backlog` → انسخه.

> التوكن بيظهر **مرة واحدة** بس. متحطّهوش في أي ملف ولا تبعته في شات. السكربت بيقراه من environment variable بس.

### خطوة 2: شغّل الأمر (PowerShell)

```powershell
$env:JIRA_BASE_URL  = "https://mromarmedhat.atlassian.net"
$env:JIRA_EMAIL     = "الإيميل-بتاع-حساب-جيرا"
$env:JIRA_API_TOKEN = "التوكن-هنا"

node "documentaion\frontend-production-readiness\jira\sync-jira.mjs" --dry-run
```

`--dry-run` مش بيكلم جيرا خالص — بيطبع الـ38 عنصر عشان تتأكد. لو تمام:

```powershell
node "documentaion\frontend-production-readiness\jira\sync-jira.mjs"
```

### خطوة 3: امسح التوكن من الجلسة

```powershell
Remove-Item Env:JIRA_API_TOKEN
```

---

## 5. الطريقة (ج) — استيراد CSV من واجهة جيرا (بدون توكن)

1. جيرا → **Settings (⚙) → System → Import and Export → External System Import → CSV**.
2. ارفع `jira-import-EF.csv`.
3. راجع الـmapping:
   - `Summary` → Summary
   - `Description` → Description
   - `Issue Type` → Issue Type
   - `Priority` → Priority
   - `Labels` → Labels
   - `Epic Link` → Epic Link *(لو ظهر اسمه "Parent" في النسخة الجديدة، اربطه بالـParent)*
   - `Parent` → Parent *(للـSub-tasks)*
   - `Original Estimate` → Original Estimate
   - `Temporary ID` → **اتركه بدون mapping** (عمود مرجعي بس)
4. اختار المشروع `EF` → **Begin Import**.

> الاستيراد بالـCSV بيحافظ على النص بس مش على التنسيق الغني (Bold/جداول). السكربت بيدي تنسيق أفضل، عشان كده هو المفضل.

---

## 6. الأمان والـIdempotency

- **مفيش تكرار:** السكربت بيقرأ كل الـSummaries الموجودة في `EF` الأول، وأي عنوان موجود بيتخطاه. لو فشل في النص، أعد التشغيل عادي.
- **مفيش حذف:** السكربت **بيعمل create فقط**. مفيش أي `DELETE` ولا `PUT` على Issues موجودة.
- **مفيش أسرار في الكود:** التوكن من env فقط، ومش بيتكتب في أي log.
- **Fallbacks ذكية:** لو المشروع مش فيه `Task` يستخدم `Story`؛ لو `Sub-task` مش مفعّل، الـsub-tasks بتتسجل كـfailure واضح بدل ما تتفشل بصمت؛ لو `priority` أو `labels` أو `Epic Name` مقيّدة، السكربت بيعيد المحاولة بدونها.
- **سجل كامل:** كل عنصر بيتطبع وهو بيتعمل، والنتيجة النهائية في `jira-created-keys.csv` + ملخص `Created / skipped / failed`.

---

## 7. استكشاف الأخطاء

| الرسالة | السبب | الحل |
|---|---|---|
| `Missing JIRA_BASE_URL / JIRA_EMAIL / JIRA_API_TOKEN` | الـenv vars مش متظبطة | ظبطهم في نفس الجلسة (خطوة 2) |
| `401 Unauthorized` | إيميل غلط أو توكن منتهي | اعمل توكن جديد وتأكد من الإيميل |
| `403 Forbidden` | الحساب مش عنده صلاحية Create Issues على `EF` | اطلب من أدمن المشروع صلاحية `Create issues` |
| `404 Project does not exist` | اسم المشروع غلط | تأكد `JIRA_PROJECT=EF` |
| `No Epic issue type in EF` | الـEpics مش مفعّلة في المشروع | فعّلها من Project settings → Issue types |
| `Cloud id … isn't explicitly granted` | مشكلة الـMCP grant | استخدم الطريقة (ب) أو (ج) |
| `parent … was not created; sub-task skipped` | الـTask الأب فشل | صلّح الخطأ الأول وأعد التشغيل |

---

## 8. أوضاع السكربت (مرجع سريع)

```powershell
# اطبع الخطة بدون أي اتصال بجيرا
node sync-jira.mjs --dry-run

# تحقق من صحة بناء الـDescription (Atlassian Document Format)
node sync-jira.mjs --selftest

# ولّد CSV للاستيراد اليدوي
node sync-jira.mjs --csv jira-import-EF.csv

# أنشئ كل حاجة فعلياً (محتاج env vars)
node sync-jira.mjs

# نفس اللي فوق + Original Estimate (لو Time tracking مفعّل)
node sync-jira.mjs --with-estimates
```

---

## 9. بعد الإنشاء — الخطوة اللي بعدها

1. راجع `jira-created-keys.csv` — ده اللي بيربط `FE-001` بـ`EF-xx`.
2. ابعتلي الملف أو المفاتيح، وأنا أضيف عمود `Jira Key` في:
   - `frontend-checklist-traceability.md`
   - `frontend-epics-and-tasks.md`
   - `jira-import.csv` (النسخة القديمة)
3. نبدأ التنفيذ من **FE-001** على branch `chore/FE-001-ci-baseline` حسب `github-workflow-ar.md`.

---

## 10. ملاحظة أخيرة عن الأسرار

- `JIRA_API_TOKEN` **مينفعش** يتكتب في `.env` متتبَّع في git، ولا في `.vscode/settings.json`، ولا في أي سكربت.
- لو التوكن اتكشف بأي شكل: **Revoke** فوراً من نفس صفحة Atlassian واعمل واحد جديد.
- السكربت مش بيطبع التوكن ولا بيحفظه في أي ملف.
