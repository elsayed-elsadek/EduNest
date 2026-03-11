/**
 * Image Optimization Utilities
 * 
 * Provides utilities for generating responsive image srcsets and optimizing image loading.
 */

/**
 * Generate srcset string from base path and size variants
 * @param basePath - Base image path (without extension)
 * @param sizes - Array of width sizes to generate
 * @param extension - Image extension (default: webp)
 * @returns Formatted srcset string
 * 
 * @example
 * generateSrcSet('/images/photo', [400, 800, 1200])
 * // Returns: "/images/photo-400.webp 400w, /images/photo-800.webp 800w, /images/photo-1200.webp 1200w"
 */
export const generateSrcSet = (
  basePath: string,
  sizes: number[] = [400, 800, 1200],
  extension: string = 'webp'
): string => {
  return sizes
    .map((size) => `${basePath}-${size}.${extension} ${size}w`)
    .join(', ');
};

/**
 * Generate sizes attribute for responsive images
 * @param breakpoints - Array of breakpoint configurations
 * @returns Formatted sizes string
 * 
 * @example
 * generateSizes([
 *   { maxWidth: 768, width: '100vw' },
 *   { maxWidth: 1200, width: '50vw' }
 * ])
 * // Returns: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
 */
export const generateSizes = (
  breakpoints: { maxWidth: number; width: string }[] = []
): string => {
  const defaultWidth = '33vw'; // For 3-column layouts
  const parts = breakpoints.map(
    ({ maxWidth, width }) => `(max-width: ${maxWidth}px) ${width}`
  );
  return [...parts, defaultWidth].join(', ');
};

/**
 * Preload configuration for critical images
 * Use this to generate preload links for index.html
 */
export interface PreloadConfig {
  /** Image path relative to public folder */
  path: string;
  /** Image type (e.g., 'image/webp', 'image/jpeg') */
  type: string;
  /** Image sizes for srcset (optional) */
  sizes?: string;
}

/**
 * Generate preload link HTML for critical images
 * @param config - Preload configuration
 * @returns HTML string for preload link
 * 
 * @example
 * generatePreloadLink({ path: '/hero.webp', type: 'image/webp' })
 * // Returns: <link rel="preload" as="image" href="/hero.webp" type="image/webp" />
 */
export const generatePreloadLink = (config: PreloadConfig): string => {
  const { path, type, sizes } = config;
  let link = `<link rel="preload" as="image" href="${path}" type="${type}"`;
  if (sizes) {
    link += ` sizes="${sizes}"`;
  }
  link += ' />';
  return link;
};

/**
 * Image breakpoints for common use cases
 */
export const IMAGE_BREAKPOINTS = {
  /** Mobile-first: 100vw on mobile, 50vw on tablet, 33vw on desktop */
  responsive: [
    { maxWidth: 768, width: '100vw' },
    { maxWidth: 1024, width: '50vw' },
  ],
  /** Hero section: full width on all breakpoints */
  hero: [
    { maxWidth: 768, width: '100vw' },
    { maxWidth: 1200, width: '100vw' },
  ],
  /** Thumbnail grid: square-ish on mobile, wider on desktop */
  thumbnail: [
    { maxWidth: 640, width: '50vw' },
    { maxWidth: 1024, width: '33vw' },
    { maxWidth: 1280, width: '25vw' },
  ],
} as const;

/**
 * Default image sizes for srcset generation
 */
export const IMAGE_SIZES = {
  small: [320, 640],
  medium: [400, 800, 1200],
  large: [600, 900, 1200, 1600],
  hero: [640, 768, 1024, 1280, 1920],
} as const;

