# Performance Optimizations Summary

This document outlines all the performance optimizations implemented to improve Lighthouse score and reduce LCP (Largest Contentful Paint).

---

## 1. OptimizedImage Component

**Location:** `src/components/common/OptimizedImage.tsx`

A reusable React component that handles image optimization with:

- **Lazy loading** for below-fold images (`loading="lazy"`)
- **High priority loading** for hero images (`fetchpriority="high"`)
- **srcset support** for responsive images
- **Placeholder support** while loading
- **Error handling** with fallback UI

### Usage Examples:

```tsx
import OptimizedImage from '@/components/common/OptimizedImage';

// Hero image (above fold) - loads with high priority
<OptimizedImage
  src="/hero-image.jpg"
  alt="Hero"
  priority
  width={800}
  height={600}
  className="rounded-lg"
/>

// Lazy loaded image (below fold)
<OptimizedImage
  src="/thumbnail.jpg"
  srcSet="/thumbnail-400.jpg 400w, /thumbnail-800.jpg 800w"
  sizes="(max-width: 768px) 100vw, 50vw"
  alt="Thumbnail"
  width={400}
  height={300}
/>
```

---

## 2. FontAwesome Tree Shaking

**Location:** `src/icons/fontAwesome.ts`

Centralized icon exports for better tree-shaking. Instead of importing entire libraries, import only the icons you need.

### Usage:

```tsx
// Instead of:
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Use:
import { FontAwesomeIcons, FontAwesomeIcon } from "@/icons/fontAwesome";

<FontAwesomeIcon icon={FontAwesomeIcons.faEnvelope} />;
```

### Available Icons:

- `faEnvelope`, `faCheck`, `faArrowRight`, `faSearch`
- `faFolderOpen`, `faBookOpen`, `faVideo`, `faBell`
- `faChevronDown`, `faChevronUp`
- Brand icons: `faTwitch`, `faInstagram`, `faLinkedin`, `faFacebook`, `faTwitter`, `faYoutube`

---

## 3. Image Optimization Utilities

**Location:** `src/utils/imageUtils.ts`

Utility functions for generating responsive image srcsets and sizes.

```tsx
import {
  generateSrcSet,
  generateSizes,
  IMAGE_SIZES,
  IMAGE_BREAKPOINTS,
} from "@/utils/imageUtils";

// Generate srcset
const srcset = generateSrcSet("/images/photo", [400, 800, 1200]);
// Returns: "/images/photo-400.webp 400w, /images/photo-800.webp 800w, /images/photo-1200.webp 1200w"

// Generate sizes
const sizes = generateSizes([
  { maxWidth: 768, width: "100vw" },
  { maxWidth: 1024, width: "50vw" },
]);
// Returns: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

---

## 4. Critical Path Optimization

### index.html Updates:

- Added **preload** for hero image (`/img1.webp`)
- Added **preconnect** to external origins (fonts, Jitsi)
- Added **dns-prefetch** for external resources

```html
<!-- Preload critical hero image -->
<link rel="preload" as="image" href="/img1.webp" type="image/webp" />
```

### Hero Image Optimization:

The main hero image (`img1`) is now:

1. Preloaded in HTML `<head>`
2. Uses `fetchpriority="high"` attribute
3. Uses `decoding="sync"` for immediate decoding
4. Copied to `/public` folder for direct browser access

---

## 5. Vite Configuration Updates

**Location:** `vite.config.ts`

### Improvements:

1. **Separate chunk for Lucide icons** - `vendor-icons`
2. **Separate chunk for FontAwesome** - `vendor-fontawesome`
3. **Better file naming** with hash for cache busting
4. **Optimized chunk splitting** for faster initial load

```typescript
// Chunk strategy
manualChunks(id) {
  if (id.includes('lucide-react')) {
    return 'vendor-icons';
  }
  if (id.includes('@fortawesome')) {
    return 'vendor-fontawesome';
  }
}
```

---

## Expected Performance Improvements

| Metric                 | Before | Expected After |
| ---------------------- | ------ | -------------- |
| Lighthouse Performance | 60     | 80-90          |
| LCP                    | 7.2s   | 1.5-2.5s       |
| TTI                    | High   | Reduced        |
| Bundle Size            | Large  | 20-40% smaller |

---

## How to Test

1. Run the development server:

   ```bash
   npm run dev
   ```

2. Build for production:

   ```bash
   npm run build
   ```

3. Preview production build:

   ```bash
   npm run preview
   ```

4. Run Lighthouse audit to measure improvements

---

## Additional Recommendations

1. **Replace FontAwesome with Lucide**: Lucide is more tree-shakeable and has better performance
2. **Use WebP/AVIF formats**: Already supported via vite-plugin-image-optimizer
3. **Consider lazy loading routes**: Use `React.lazy()` for routes
4. **Monitor Core Web Vitals**: Track LCP, FID, CLS in production

---

## Files Created/Modified

| File                                       | Action                       |
| ------------------------------------------ | ---------------------------- |
| `src/components/common/OptimizedImage.tsx` | Created                      |
| `src/icons/fontAwesome.ts`                 | Created                      |
| `src/utils/imageUtils.ts`                  | Created                      |
| `vite.config.ts`                           | Modified                     |
| `index.html`                               | Modified                     |
| `public/img1.webp`                         | Created (copied from assets) |
