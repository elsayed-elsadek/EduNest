import { isSafeExternalUrl } from './safeExternalUrl';
import { escapeHtml, sanitizeHtml } from './sanitizeHtml';

export function formatBotText(raw: string): string {
  const codeBlocks: string[] = [];
  const text = raw.trim().replace(/\r\n?/g, '\n').replace(/```[^\n]*\n([\s\S]*?)```/g, (_match, code: string) => {
    const index = codeBlocks.push(code) - 1;
    return `\n\n\uE000${index}\uE001\n\n`;
  });
  const blocks = text.split(/\n{2,}/);
  const numberedPattern = /^(\d+)\.\s+(.+)/;
  const bulletPattern = /^[-•*]\s+(.+)/;

  const renderedBlocks = blocks.map(block => {
    const codeBlock = block.match(/^\uE000(\d+)\uE001$/);
    if (codeBlock) {
      return `<pre><code>${escapeHtml(codeBlocks[Number(codeBlock[1])] ?? '')}</code></pre>`;
    }

    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
    if (!lines.length) return '';

    if (lines.every(line => numberedPattern.test(line))) {
      const items = lines.map(line => {
        const match = line.match(numberedPattern)!;
        return `<li><span class="list-num">${match[1]}.</span><span class="list-text">${inlineFormat(match[2])}</span></li>`;
      });
      return `<ol class="bot-list">${items.join('')}</ol>`;
    }

    if (lines.every(line => bulletPattern.test(line))) {
      const items = lines.map(line => {
        const match = line.match(bulletPattern)!;
        return `<li><span class="list-text">${inlineFormat(match[1])}</span></li>`;
      });
      return `<ul class="bot-list">${items.join('')}</ul>`;
    }

    const hasList = lines.some(line => numberedPattern.test(line) || bulletPattern.test(line));
    if (hasList) {
      const result: string[] = [];
      let listItems: string[] = [];
      let listType: 'ol' | 'ul' | null = null;
      const flushList = () => {
        if (listItems.length) {
          result.push(`<${listType} class="bot-list">${listItems.join('')}</${listType}>`);
          listItems = [];
          listType = null;
        }
      };
      lines.forEach(line => {
        const numberedMatch = line.match(numberedPattern);
        const bulletMatch = line.match(bulletPattern);
        if (numberedMatch) {
          if (listType === 'ul') flushList();
          listType = 'ol';
          listItems.push(`<li><span class="list-num">${numberedMatch[1]}.</span><span class="list-text">${inlineFormat(numberedMatch[2])}</span></li>`);
        } else if (bulletMatch) {
          if (listType === 'ol') flushList();
          listType = 'ul';
          listItems.push(`<li><span class="list-text">${inlineFormat(bulletMatch[1])}</span></li>`);
        } else {
          flushList();
          result.push(`<p>${inlineFormat(line)}</p>`);
        }
      });
      flushList();
      return result.join('');
    }

    return lines.map(line => {
      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        return `<h${level}>${inlineFormat(heading[2])}</h${level}>`;
      }
      return `<p>${inlineFormat(line)}</p>`;
    }).join('');
  });

  return sanitizeHtml(renderedBlocks.filter(Boolean).join(''), 'chat');
}

function inlineFormat(value: string): string {
  const links: string[] = [];
  const withLinkPlaceholders = value.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, url: string) => {
    if (!isSafeExternalUrl(url)) return match;
    const index = links.push(
      `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${formatInlineStyles(escapeHtml(label))}</a>`,
    ) - 1;
    return `\uE100${index}\uE101`;
  });

  return formatInlineStyles(escapeHtml(withLinkPlaceholders))
    .replace(/\uE100(\d+)\uE101/g, (_match, index: string) => links[Number(index)] ?? '');
}

function formatInlineStyles(escaped: string): string {
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\*{1,3}/g, '')
    .trim();
}
