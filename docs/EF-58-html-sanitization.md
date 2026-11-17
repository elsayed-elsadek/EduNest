# EF-58 — [H-04] HTML Sanitisation

Security note for the HTML rendering sinks that handle untrusted content
(chatbot answers and DOCX conversion). The sanitisation itself shipped with
EF-27 ([FE-010] Close XSS sinks); this document completes the EF-58
acceptance criteria: *sanitisation library/allowlist documented*, *both paths
covered*, *unsafe payloads tested*.

## Library

- **DOMPurify** `^3.4.17` (`src/utils/sanitizeHtml.ts`) — the single
  sanitisation entry point. Nothing may reach `dangerouslySetInnerHTML`
  without passing through it.

## Profiles and allowlists

`sanitizeHtml(html, profile)` enforces an explicit allowlist per rendering
context (DOMPurify's defaults are already secure; the explicit list keeps the
surface small and makes regressions obvious):

| | `chat` — AI answers | `document` — Mammoth DOCX output |
|---|---|---|
| **Tags** | `p br strong em code pre ol ul li span a h1-h6` | rich document set: headings, lists, tables, `blockquote pre code hr a img`, … |
| **Attributes** | `class href target rel` | `class href title alt src width height colspan rowspan align` |
| **Always forbidden** | `script style iframe object embed form input button textarea select option svg math link meta base` — same for both profiles; attributes `style srcset formaction xlink:href` and all `data-*` / `aria-*` are stripped | |
| **Link hardening** (hook) | `href` must resolve to `http:` / `https:` / `mailto:` / `tel:` (or a same-page `#fragment`) — otherwise removed; surviving links get `target="_blank" rel="noopener noreferrer"` | |
| **Image hardening** (hook) | `src` must be `http(s)` or an embedded `data:image/png|jpeg|gif|webp|bmp;base64` — `data:text/html`, SVG and any other scheme are removed; `loading="lazy"` is added | |

## Where it is applied

| Sink (untrusted source) | Path |
|---|---|
| `ChatbotWidget.tsx` — bot bubbles (`dangerouslySetInnerHTML`) | `formatBotText(text)`: every AI string is `escapeHtml`-ed *before* the formatter adds its own Markdown markup, links only render for `isSafeExternalUrl` URLs, and the final HTML passes `sanitizeHtml(…, 'chat')` |
| `FileViewer.tsx` — DOCX preview (`dangerouslySetInnerHTML`) | Mammoth `convertToHtml` output passes `sanitizeHtml(…, 'document')` before `setState`; a mammoth/conversion failure falls back to the Google Docs Viewer iframe, never raw HTML |

No other `dangerouslySetInnerHTML` sinks exist in the codebase (verified by
search at the time of writing).

## Failure policy

If the sanitizer itself ever throws, `sanitizeHtml` degrades to **escaped
plain text** (`escapeHtml`) — untrusted content is never rendered raw
(production-readiness plan: "sanitizer throws → fall back to plain text,
never raw HTML").

## Test mapping (automated equivalents of TC-H04-01..04)

| Scenario | Test |
|---|---|
| TC-H04-01 — chatbot answer containing `<script>` | `securityRendering.test.tsx` → *"renders malicious AI markup as text, not executable DOM"* |
| TC-H04-02 — DOCX content with an `onerror` handler | `securityRendering.test.tsx` → *"sanitizes Mammoth HTML before rendering…"* (covers `onclick`, `<script>` and `javascript:` hrefs) |
| TC-H04-03 — `javascript:` link | `securityRendering.test.tsx` → *"TC-H04-03: a javascript: markdown link never becomes an executable href"* |
| TC-H04-04 — normal formatted content | `securityRendering.test.tsx` → *"keeps safe Markdown formatting and links"* + `security.test.ts` → *"preserves safe document formatting…"* |
| Sanitizer failure fallback | `security.test.ts` → *"falls back to escaped plain text when the sanitizer itself throws"* |
| Scripted `data:` image source | `security.test.ts` → *"strips a data:text/html image source…"* |

## Manual QA (post-merge spot check)

1. Ask the chatbot a question that returns headings/lists/code → formatting renders correctly.
2. Inspect a bot bubble in DevTools → no `script`/`on*` attributes; links open in a new tab with `rel="noopener noreferrer"`.
3. Preview a DOCX with tables/headings/images → document renders; DevTools shows no inline handlers and no non-image `data:` sources.
