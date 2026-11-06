/**
 * Helpers for opening links that may come from user-supplied content.
 *
 * `window.open(url, '_blank')` without `noopener` gives the new page a
 * `window.opener` handle, which enables reverse tabnabbing. These helpers
 * enforce both protections:
 *
 *  - only `http:` / `https:` URLs are opened (relative URLs resolve against
 *    the current origin);
 *  - every new tab is opened with `noopener,noreferrer`.
 */

const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * True when `raw` is an http(s) URL (absolute, protocol-relative or relative)
 * and safe to hand to the browser.
 */
export function isSafeExternalUrl(raw: string | null | undefined): boolean {
  if (typeof raw !== 'string') return false;

  const value = raw.trim();
  if (!value) return false;

  // Raw whitespace/control characters can be used to smuggle a scheme past
  // naive checks (e.g. "java\nscript:"). Real URLs encode them.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F\s]/.test(value)) return false;

  try {
    const base = typeof window !== 'undefined' ? window.location.href : 'http://localhost/';
    const parsed = new URL(value, base);
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Opens a validated URL in a new tab with `noopener,noreferrer`.
 *
 * @returns the opened window, or `null` when the URL was rejected.
 */
export function openExternalUrl(raw: string): Window | null {
  if (!isSafeExternalUrl(raw)) return null;
  if (typeof window === 'undefined') return null;

  return window.open(raw.trim(), '_blank', 'noopener,noreferrer');
}
