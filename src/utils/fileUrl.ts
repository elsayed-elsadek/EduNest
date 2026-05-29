import { API_BASE_URL } from '../services/api';

/**
 * Build a full absolute URL from a candidate path or URL returned by backend.
 * Handles null/undefined, absolute http(s) URLs, leading slashes and `app/` prefixes.
 */
export function buildFullFileUrl(candidate?: string | null): string {
  if (!candidate) return '';
  const trimmed = candidate.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

  let clean = trimmed.startsWith('/') ? trimmed.substring(1) : trimmed;
  if (clean.startsWith('app/')) clean = clean.substring(4);

  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : API_BASE_URL + '/';
  return `${base}${clean}`;
}

/**
 * Given multiple possible candidate fields (in priority order), return the first resolvable full URL.
 */
export function resolveFirstFileUrl(...candidates: Array<string | null | undefined>): string {
  for (const c of candidates) {
    if (c && String(c).trim()) return buildFullFileUrl(String(c));
  }
  return '';
}

export default buildFullFileUrl;
