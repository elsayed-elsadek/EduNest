// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { isSafeExternalUrl, openExternalUrl } from '../safeExternalUrl';
import { sanitizeHtml } from '../sanitizeHtml';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('sanitizeHtml', () => {
  it('removes executable elements and event handlers from document HTML', () => {
    const clean = sanitizeHtml(
      `<img src="x" onerror="alert(1)">
       <script>alert('XSS')</script>
       <a href="javascript:alert(1)" onclick="alert(2)">Click me</a>`,
      'document',
    );
    const container = document.createElement('div');
    container.innerHTML = clean;

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('[onerror], [onclick]')).toBeNull();
    expect(container.querySelector('a')?.hasAttribute('href')).toBe(false);
  });

  it('preserves safe document formatting and only keeps safe link protocols', () => {
    const clean = sanitizeHtml(
      `<h1>Heading</h1><p><strong>Paragraph</strong></p>
       <ul><li>List item</li></ul>
       <table><tbody><tr><td>Cell</td></tr></tbody></table>
       <a href="https://example.com">Safe link</a>`,
      'document',
    );
    const container = document.createElement('div');
    container.innerHTML = clean;

    expect(container.querySelector('h1')?.textContent).toBe('Heading');
    expect(container.querySelector('p strong')?.textContent).toBe('Paragraph');
    expect(container.querySelector('ul li')?.textContent).toBe('List item');
    expect(container.querySelector('table td')?.textContent).toBe('Cell');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(container.querySelector('a')?.getAttribute('rel')).toContain('noopener');
  });
});

describe('external URL validation', () => {
  it('accepts HTTP and HTTPS URLs', () => {
    expect(isSafeExternalUrl('https://example.com/resource')).toBe(true);
    expect(isSafeExternalUrl('http://example.com/resource')).toBe(true);
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'not a valid url with spaces',
  ])('rejects unsafe or malformed URL %s', (url) => {
    expect(isSafeExternalUrl(url)).toBe(false);
  });

  it('opens only validated URLs with noopener and noreferrer', () => {
    const openedWindow = {} as Window;
    const open = vi.spyOn(window, 'open').mockReturnValue(openedWindow);

    expect(openExternalUrl('https://example.com')).toBe(openedWindow);
    expect(open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');

    expect(openExternalUrl('javascript:alert(1)')).toBeNull();
    expect(open).toHaveBeenCalledTimes(1);
  });
});
