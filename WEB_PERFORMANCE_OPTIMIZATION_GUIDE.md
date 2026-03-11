# دليل تحسين أداء مواقع الويب الشامل

## خطة تفصيلية للوصول إلى نتيجة أداء 90-100

---

## الملخص التنفيذي

### القيم الحالية للتقرير:

| المقياس     | القيمة الحالية | الهدف      |
| ----------- | -------------- | ---------- |
| FCP         | 1.6s           | < 1.5s     |
| LCP         | 5.2s           | < 2.5s     |
| TBT         | 120ms          | < 150ms    |
| CLS         | 0.127          | < 0.1      |
| Speed Index | 2.7s           | < 2.0s     |
| حجم الشبكة  | 5,972KiB       | < 1,000KiB |

---

## القسم الأول: تحسين تحميل الصور (530KiB)

### المشكلة:

- صور غير محسّنة بحجم 530KiB
- عدم استخدام التنسيقات الحديثة
- عدم تطبيق التحميل الكسول بشكل كامل

### الحلول:

#### 1.1 تحويل الصور إلى WebP/AVIF

```bash
# باستخدام sharp أو أدوات أخرى
npm install sharp --save-dev

# سكريبت تحويل الصور
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = './src/assets';
// تحويل جميع الصور إلى WebP
```

#### 1.2 تطبيق التحميل الكسول (Lazy Loading)

```jsx
// ✓ طريقة صحيحة
<img
  src="image.webp"
  loading="lazy"
  decoding="async"
  width={800}
  height={600}
  alt="Description"
/>

// ✓ صورة-hero يجب أن تحمل مباشرة
<img
  src="hero.webp"
  loading="eager"
  fetchPriority="high"
  width={1920}
  height={1080}
  alt="Hero"
/>
```

#### 1.3 استخدام CDN للصور

```jsx
// تكوين Vite لاستخدام CDN
export default defineConfig({
  base: "https://cdn.yourdomain.com/",
  // أو استخدام image CDN
  images: {
    domains: ["your-image-cdn.com"],
  },
});
```

#### 1.4 تحديد أبعاد الصور بدقة

```jsx
// ✓ تجنب Cumulative Layout Shift
<img
  src="image.webp"
  width={800}
  height={600}
  style={{ aspectRatio: '4/3' }}
/>

// ✓ استخدام srcset للتفاعل مع أحجام الشاشة
<img
  srcset="image-400.webp 400w,
          image-800.webp 800w,
          image-1200.webp 1200w"
  sizes="(max-width: 600px) 400px,
         (max-width: 1200px) 800px,
         1200px"
  src="image-800.webp"
  loading="lazy"
/>
```

---

## القسم الثاني: تحسين LCP (وقت تحميل المحتوى الرئيسي)

### المشكلة:

- LCP = 5.2s (مرتفع جداً) -阻碍 المحتوى الرئيسي

### الحلول:

#### 2.1 تحسين ترتيب تحميل الموارد

```html
<!-- index.html - تحميل مباشر للموارد الحرجة -->
<head>
  <!-- 1. تحميل الخطوط مسبقاً -->
  <link
    rel="preload"
    href="/fonts/main-font.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />

  <!-- 2. تحميل CSS الحرج -->
  <link rel="stylesheet" href="/critical.css" />

  <!-- 3. DNS prefetch للنطاقات الخارجية -->
  <link rel="dns-prefetch" href="https://api.yourdomain.com" />
  <link rel="dns-prefetch" href="https://cdn.yourdomain.com" />
</head>
```

#### 2.2 تأجيل JS غير الحرج

```jsx
// App.tsx - تحميل الكود بشكل كسول
const HeavyComponent = lazy(() => import("./HeavyComponent"));

// تأجيل تحميل المكتبات الثقيلة
useEffect(() => {
  import("heavy-library").then((module) => {
    // استخدام المكتبة
  });
}, []);
```

#### 2.3 تحسين Largest Contentful Paint

```jsx
// Hero Image - تحميل مباشر مع أولوية عالية
const HeroSection = () => (
  <div>
    <img
      src="/hero-image.webp"
      fetchPriority="high" // ← مهم جداً للـ LCP
      loading="eager"
      width={1200}
      height={800}
      alt="Hero"
    />
  </div>
);
```

#### 2.4 إزالة阻塞 التحميل

```jsx
// تأجيل تحليل JS حتى يصبح ضرورياً
<script defer src="analytics.js"></script>
<script async src="non-critical.js"></script>
```

---

## القسم الثالث: تقليل TBT (وقت الحظر الكلي)

### المشكلة:

- TBT = 120ms
- JS غير مضغوط: 1,540KiB + 1,823KiB
- CSS غير مضغوط: 5KiB + 18KiB

### الحلول:

#### 3.1 ضغط الموارد

```typescript
// vite.config.ts
import compression from "vite-plugin-compression";

export default defineConfig({
  build: {
    // ضغط gzip
    gzip: true,
    // ضغط brotli (أفضل من gzip)
    brotliCompress: true,
    minify: "esbuild",
    cssCodeSplit: true,

    rollupOptions: {
      output: {
        manualChunks: {
          // تقسيم الملفات الكبيرة
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["recharts", "d3"],
          "vendor-ui": ["@headlessui/react", "lucide-react"],
          "vendor-utils": ["axios", "zustand", "sweetalert2"],
          "vendor-jitsi": ["@jitsi/react-sdk"],
        },
      },
    },
  },
  plugins: [
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
  ],
});
```

#### 3.2 تحميل JS بطريقة ذكية

```jsx
// تأجيل تحميل المكتبات غير الضرورية
const RechartsLazy = lazy(() => import("recharts"));

// استخدام Intersection Observer للتحميل
import { useIntersectionObserver } from "./hooks/useIntersectionObserver";

const HeavyChart = () => {
  const { isVisible } = useIntersectionObserver({ threshold: 0.1 });

  if (!isVisible) return <Skeleton />;

  return <ActualChart />;
};
```

#### 3.3 إزالة JS غير المستخدم

```typescript
// tree-shaking محسّن
import { cloneDeep, pick } from "lodash";

// بدلاً من استيراد كل lodash
import cloneDeep from "lodash/cloneDeep";
import pick from "lodash/pick";

// أو استخدام lodash-es
import { cloneDeep, pick } from "lodash-es";
```

---

## القسم الرابع: تحسين CLS (استقرار التخطيط)

### المشكلة:

- CLS = 0.127
- عناصر متحركة غير محسوبة على GPU

### الحلول:

#### 4.1 حجز مساحة للصور

```jsx
// ✓ طريقة صحيحة
<div style={{ aspectRatio: '16/9', minHeight: '300px' }}>
  <img
    src="image.webp"
    width={1600}
    height={900}
    loading="lazy"
    alt="Image"
  />
</div>

// ✗ تجنب هذا
<div>
  <img src="image.webp" loading="lazy" /> {/* لا أبعاد */}
</div>
```

#### 4.2 تحسين الخطوط

```css
/* styles.css */
@font-face {
  font-family: "MyFont";
  src: url("/fonts/myfont.woff2") format("woff2");
  font-display: swap; /* مهم للـ CLS */
}

/* احتياطي للخطوط */
body {
  font-family:
    system-ui,
    -apple-system,
    "MyFont",
    sans-serif;
}
```

#### 4.3 تحسين الإعلانات/العناصر المضافة ديناميكياً

```jsx
// حجز مساحة للإعلانات
<div
  className="ad-container"
  style={{
    minHeight: "250px",
    backgroundColor: "#f0f0f0",
  }}
>
  {/* إعلان أو محتوى ديناميكي */}
</div>;

// استخدام skeleton loaders
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-300 rounded"></div>
    <div className="h-4 bg-gray-300 mt-4 rounded"></div>
  </div>
);
```

#### 4.4 تحريك العناصر على GPU

```css
/* ✓ استخدام transform و opacity للرسوم المتحركة */
.element {
  will-change: transform, opacity;
  transform: translateZ(0); /* تفعيل GPU */
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

/* ✗ تجنب تحريك الخصائص التي تؤثر على التخطيط */
.element {
  /* تجنب هذه */
  transition:
    width 0.3s,
    height 0.3s,
    top 0.3s,
    left 0.3s;
  /* لأنها تسبب reflow */
}
```

---

## القسم الخامس: تحسين CSS

### المشكلة:

- CSS غير مضغوط: 5KiB + 18KiB
- CSS غير مستخدم

### الحلول:

#### 5.1 ضغط CSS

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    cssCodeSplit: true,
    minify: "esbuild",
    cssMinifier: "lightningcss", // أو 'esbuild'
  },
});
```

#### 5.2 تحميل CSS بشكل غير حظر

```html
<!-- تحميل CSS بشكل غير حظر -->
<link
  rel="preload"
  href="styles.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript><link rel="stylesheet" href="styles.css" /></noscript>
```

#### 5.3 إزالة CSS غير المستخدم

```typescript
// استخدام PurgeCSS مع Tailwind
// tailwind.config.cjs
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  purge: {
    enabled: true,
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
  },
};
```

#### 5.4 تقسيم CSS حسب المسار

```typescript
// vite.config.ts - كل route يحمّل CSS الخاص به
export default defineConfig({
  build: {
    cssCodeSplit: "strict", // تقسيم صارم
  },
});
```

---

## القسم السادس: تقليل حجم الشبكة الإجمالي

### المشكلة:

- حجم الشبكة الكلي: 5,972KiB
- موارد ضخمة غير محسّنة

### الحلول:

#### 6.1 تحليل حزمة الملفات

```bash
# استخدام rollup-plugin-visualizer
npm install rollup-plugin-visualizer --save-dev

# في package.json
"build:analyze": "vite build -- --report"
```

```typescript
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    visualizer({
      filename: "dist/stats.html",
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

#### 6.2 استبدال Font Awesome بـ Lucide

```jsx
// بدلاً من Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
<FontAwesomeIcon icon={faStar} />;

// ✓ استخدام Lucide (أخف بكثير)
import { Star } from "lucide-react";
<Star className="w-5 h-5" />;
```

**الملفات التي تحتاج تحديث:**

1. `src/components/home/FooterSection.tsx`
2. `src/components/home/ContactUsSection.tsx`
3. `src/components/common/LogoStrip.tsx`
4. `src/components/home/Testimonials.tsx`
5. `src/components/mentor-dash-com/ScheduledSessions/ScheduledSessionCard.tsx`
6. `src/pages/forgetPass/CheckEmail.tsx`
7. `src/pages/forgetPass/ResetSuccess.tsx`
8. `src/pages/mentorNotifications/NotificationsList.tsx`
9. `src/pages/mentorship-sessions/MentorshipSessions.tsx`
10. `src/pages/success-register/success.tsx`
11. `src/pages/verifiy/Verify.tsx`
12. `src/pages/studentspage-mentordash/StudentsList.tsx`
13. `src/pages/mentorship-detail/components/MentorshipContentList.tsx`
14. `src/pages/mentorship-content/components/ContentIcon.tsx`

#### 6.3 حذف Font Awesome من المشروع

```bash
npm uninstall @fortawesome/fontawesome-svg-core \
  @fortawesome/free-brands-svg-icons \
  @fortawesome/free-solid-svg-icons \
  @fortawesome/react-fontawesome
```

#### 6.4 تحميل Jitsi بشكل كسول

```jsx
// تحميل Jitsi عند الحاجة فقط
const JitsiMeeting = lazy(() =>
  import("@jitsi/react-sdk").then((module) => ({
    default: module.JitsiMeeting,
  })),
);

const VideoCall = () => {
  const [showCall, setShowCall] = useState(false);

  return (
    <div>
      <button onClick={() => setShowCall(true)}>Start Call</button>
      {showCall && (
        <Suspense fallback={<Spinner />}>
          <JitsiMeeting />
        </Suspense>
      )}
    </div>
  );
};
```

---

## القسم السابع: تحسين المهام الطويلة على Main Thread

### الحلول:

#### 7.1 استخدام Web Workers

```typescript
// worker.ts
self.onmessage = (e) => {
  // معالجة البيانات في الخلفية
  const result = heavyComputation(e.data);
  self.postMessage(result);
};

// في المكون
const worker = new Worker(new URL("./worker.ts", import.meta.url));

worker.onmessage = (e) => {
  console.log("Result:", e.data);
};

worker.postMessage(data);
```

#### 7.2 تقسيم المهام الكبيرة

```jsx
// استخدام requestIdleCallback
const processLargeArray = (items) => {
  const chunkSize = 100;
  let index = 0;

  const processChunk = () => {
    const chunk = items.slice(index, index + chunkSize);
    // معالجة قطعة
    index += chunkSize;

    if (index < items.length) {
      requestIdleCallback(processChunk);
    }
  };

  requestIdleCallback(processChunk);
};
```

#### 7.3 تحسين إعادة العرض

```jsx
// استخدام useMemo و useCallback
const ExpensiveComponent = ({ data, onUpdate }) => {
  // إعادة الحساب فقط عند تغير data
  const processedData = useMemo(() => {
    return heavyComputation(data);
  }, [data]);

  // إعادة إنشاء الدالة فقط عند تغير onUpdate
  const handleClick = useCallback(() => {
    onUpdate(processedData);
  }, [onUpdate, processedData]);

  return <div onClick={handleClick}>{processedData}</div>;
};

// استخدام React.memo
const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
```

---

## القسم الثامن: تحسين Speed Index

### الحلول:

#### 8.1 تحسين سرعة التحميل الأولية

```html
<!-- تحميل inline للـ CSS الحرج -->
<style>
  /* CSS الضروري للـ above-the-fold */
  .hero {
    min-height: 100vh;
  }
  .header {
    position: fixed;
  }
</style>

<!-- تأجيل الـ CSS غير الضروري -->
<link
  rel="preload"
  href="non-critical.css"
  as="style"
  onload="this.onload=null;this.rel='stylesheet'"
/>
```

#### 8.2 استخدام Skeleton Screens

```jsx
const SkeletonHome = () => (
  <div className="animate-pulse">
    <div className="h-96 bg-gray-300"></div>
    <div className="grid grid-cols-3 gap-4 mt-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 bg-gray-300 rounded"></div>
      ))}
    </div>
  </div>
);
```

#### 8.3 تحسين TTFB (Time To First Byte)

```typescript
// على مستوى الخادم
// إضافة caching Headers
app.use((req, res, next) => {
  res.set("Cache-Control", "public, max-age=3600");
  res.set("ETag", "generated-etag");
  next();
});
```

---

## القسم التاسع: قائمة التحقق النهائية

### قبل النشر:

```bash
# 1. بناء المشروع
npm run build

# 2. فحص حجم الحزمة
npm run build:analyze

# 3. اختبار الأداء
npm run preview

# 4. فحص Lighthouse
# يجب أن تكون جميع القيم خضراء
```

### قائمة التحقق:

- [ ] ضغط جميع الصور (WebP/AVIF)
- [ ] إضافة lazy loading لجميع الصور
- [ ] تحديد أبعاد جميع الصور
- [ ] إزالة Font Awesome
- [ ] ضغط JS و CSS
- [ ] تفعيل Brotli/Gzip
- [ ] تقسيم الكود (Code Splitting)
- [ ] تحسين LCP
- [ ] تحسين CLS
- [ ] تقليل TBT
- [ ] إزالة console.log في الإنتاج
- [ ] استخدام Skeleton Screens
- [ ] تفعيل caching

---

## النتائج المتوقعة

| المقياس           | قبل      | بعد      | الهدف      |
| ----------------- | -------- | -------- | ---------- |
| Performance Score | ~30      | 90-100   | 90+        |
| FCP               | 1.6s     | < 1.2s   | < 1.5s     |
| LCP               | 5.2s     | < 2.0s   | < 2.5s     |
| TBT               | 120ms    | < 100ms  | < 150ms    |
| CLS               | 0.127    | < 0.05   | < 0.1      |
| Speed Index       | 2.7s     | < 1.8s   | < 2.0s     |
| حجم الشبكة        | 5,972KiB | < 800KiB | < 1,000KiB |

---

## الأوامر المساعدة

```bash
# تحليل حجم الحزمة
npm run build:analyze

# تشغيل production build
npm run build && npm run preview

# فحص استخدام CSS
npx tailwindcss -o --purge

# ضغط الصور
npx sharp-cli --input ./src/assets --output ./src/assets --webp
```

---

_آخر تحديث: 2025_
