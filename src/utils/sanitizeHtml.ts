/**
 * HTML sanitisation for untrusted content.
 *
 * Two profiles exist because the two call sites need very different things:
 *
 *  - `chat`     — AI responses are plain text + a tiny Markdown subset. Raw
 *                 HTML is never expected, so only the tags produced by
 *                 `formatBotText` are allowed.
 *  - `document` — DOCX files converted by Mammoth legitimately contain
 *                 headings, tables, lists, links and images. Those are allowed,
 *                 but every attribute that can execute code is stripped.
 *
 * Both profiles run through DOMPurify with an explicit allowlist; DOMPurify's
 * defaults are secure, but an explicit list keeps the surface small and makes
 * a regression obvious.
 */
import DOMPurify from 'dompurify';

export type SanitizeProfile = 'chat' | 'document';

const CHAT_TAGS = [
  'p', 'br', 'strong', 'em', 'code', 'pre', 'ol', 'ul', 'li', 'span', 'a',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
];
const CHAT_ATTR = ['class', 'href', 'target', 'rel'];

const DOCUMENT_TAGS = [
  'p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'sub', 'sup',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'blockquote', 'pre', 'code', 'hr', 'a', 'img',
];

const DOCUMENT_ATTR = [
  'class', 'href', 'title', 'alt', 'src', 'width', 'height', 'colspan', 'rowspan', 'align',
];

const PROFILE_CONFIG = {
  chat: { ALLOWED_TAGS: CHAT_TAGS, ALLOWED_ATTR: CHAT_ATTR },
  document: { ALLOWED_TAGS: DOCUMENT_TAGS, ALLOWED_ATTR: DOCUMENT_ATTR },
} as const;

/** Protocols that are safe to keep on a link. */
const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function resolveProtocol(value: string): string | null {
  try {
    const base = typeof window !== 'undefined' ? window.location.href : 'http://localhost/';
    return new URL(value, base).protocol;
  } catch {
    return null;
  }
}

function isSafeLinkHref(href: string): boolean {
  const value = href.trim();
  if (!value) return false;
  if (value.startsWith('#')) return true;
  const protocol = resolveProtocol(value);
  return protocol !== null && SAFE_LINK_PROTOCOLS.has(protocol);
}

function isSafeImageSrc(src: string): boolean {
  const value = src.trim();
  if (!value) return false;

  // Mammoth embeds DOCX images as data URIs. Never allow data:text/html or SVG
  // scripts to become a document source.
  if (/^data:image\/(png|jpe?g|gif|webp|bmp);base64,/i.test(value)) return true;

  const protocol = resolveProtocol(value);
  return protocol === 'http:' || protocol === 'https:';
}

let hooksRegistered = false;

/**
 * Adds the link/image hardening shared by every profile. Registered once so
 * repeated sanitisation calls do not stack hooks.
 */
function registerHooks(): void {
  if (hooksRegistered) return;
  hooksRegistered = true;

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.nodeName === 'A') {
      const href = node.getAttribute('href');
      if (!href || !isSafeLinkHref(href)) {
        node.removeAttribute('href');
        return;
      }
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }

    if (node.nodeName === 'IMG') {
      const src = node.getAttribute('src');
      if (!src || !isSafeImageSrc(src)) {
        node.removeAttribute('src');
      }
      node.setAttribute('loading', 'lazy');
    }
  });
}

/**
 * Escapes text so it can be interpolated into HTML without becoming markup.
 *
 * `formatBotText` escapes every user/AI-provided string before adding its own
 * markup, so an AI response can never introduce a tag or attribute.
 */
export function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return value.replace(/[&<>"']/g, (character) => entities[character] ?? character);
}

/**
 * Sanitises untrusted HTML for a specific rendering context.
 *
 * @example
 * sanitizeHtml(aiText, 'chat');          // text + minimal formatting only
 * sanitizeHtml(mammothHtml, 'document'); // rich document markup
 */
export function sanitizeHtml(html: string, profile: SanitizeProfile = 'chat'): string {
  if (!html) return '';

  registerHooks();

  return DOMPurify.sanitize(html, {
    ...PROFILE_CONFIG[profile],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
    KEEP_CONTENT: true,
    FORBID_TAGS: [
      'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button',
      'textarea', 'select', 'option', 'svg', 'math', 'link', 'meta', 'base',
    ],
    FORBID_ATTR: ['style', 'srcset', 'formaction', 'xlink:href'],
  }) as string;
}
