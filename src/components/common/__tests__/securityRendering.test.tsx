
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import FileViewer from '../FileViewer';
import { MessageBubble } from '../ChatbotWidget/ChatbotWidget';

const { convertToHtml } = vi.hoisted(() => ({
  convertToHtml: vi.fn(),
}));

vi.mock('mammoth', () => ({
  default: { convertToHtml },
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('chatbot rendering', () => {
  it('renders malicious AI markup as text, not executable DOM', () => {
    const maliciousResponse = `<img src=x onerror=alert(1)> <script>alert('XSS')</script>`;
    const { container } = render(createElement(MessageBubble, {
      role: 'bot',
      text: maliciousResponse,
      chatbotName: 'EduBot',
    }));

    expect(container.querySelector('img, script, [onerror]')).toBeNull();
    expect(container.textContent).toContain(maliciousResponse);
  });

  it('keeps safe Markdown formatting and links', () => {
    const { container } = render(createElement(MessageBubble, {
      role: 'bot',
      text: '# Heading\n\n**Bold**\n\n- item\n\n[Open](https://example.com)\n\n```ts\nconst safe = true;\n```',
      chatbotName: 'EduBot',
    }));

    expect(container.querySelector('h1')?.textContent).toBe('Heading');
    expect(container.querySelector('strong')?.textContent).toBe('Bold');
    expect(container.querySelector('ul li')?.textContent).toContain('item');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(container.querySelector('pre code')?.textContent).toBe('const safe = true;\n');
  });
});

describe('DOCX preview rendering', () => {
  it('sanitizes Mammoth HTML before rendering while preserving document formatting', async () => {
    convertToHtml.mockResolvedValue({
      value: `<h1>Document title</h1>
        <p onclick="alert(1)">Safe paragraph</p>
        <script>alert('XSS')</script>
        <ul><li>List item</li></ul>
        <table><tbody><tr><td>Table cell</td></tr></tbody></table>
        <a href="javascript:alert(1)">Unsafe link</a>
        <a href="https://example.com">Safe link</a>`,
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      }),
    );

    const { container } = render(<FileViewer url="https://files.example/document.docx" />);

    expect(await screen.findByRole('heading', { name: 'Document title' })).toBeTruthy();
    await waitFor(() => expect(convertToHtml).toHaveBeenCalled());

    expect(container.querySelector('script, [onclick]')).toBeNull();
    expect(container.querySelector('ul li')?.textContent).toBe('List item');
    expect(container.querySelector('table td')?.textContent).toBe('Table cell');
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(container.querySelector('a[href="https://example.com"]')?.textContent).toBe('Safe link');
  });
});
