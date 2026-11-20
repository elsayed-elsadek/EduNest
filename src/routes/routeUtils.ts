import type { Location } from 'react-router-dom';

const DASHBOARD_PATHS: Record<string, string> = {
  ROLE_MENTOR: '/mentor/dashboard',
  ROLE_STUDENT: '/student/dashboard',
  ROLE_ADMIN: '/admin/dashboard',
};

/** Returns the canonical landing page for a recognized role. */
export function getDashboardPath(role: string): string | null {
  return DASHBOARD_PATHS[role] ?? null;
}

/**
 * Extracts a safe same-origin return path from React Router's `state.from`.
 * Malformed state, protocol-relative paths and external URLs are rejected.
 */
export function getSafeRedirectPath(from: unknown): string | null {
  if (!from || typeof from !== 'object') return null;
  if (typeof window === 'undefined') return null;

  const location = from as Partial<Location>;
  const { pathname, search = '', hash = '' } = location;
  if (
    typeof pathname !== 'string' ||
    !pathname.startsWith('/') ||
    pathname.startsWith('//') ||
    pathname.includes('\\') ||
    [...pathname].some((character) => character.charCodeAt(0) < 0x20)
  ) {
    return null;
  }

  if (typeof search !== 'string' || (search && !search.startsWith('?'))) return null;
  if (typeof hash !== 'string' || (hash && !hash.startsWith('#'))) return null;

  try {
    const target = new URL(`${pathname}${search}${hash}`, window.location.origin);
    if (target.origin !== window.location.origin) return null;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return null;
  }
}
