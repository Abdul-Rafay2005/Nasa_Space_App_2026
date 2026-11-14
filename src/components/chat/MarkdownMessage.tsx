/**
 * Aegis Health — Markdown Message Renderer
 * Converts raw Gemini markdown into beautiful styled HTML
 * Handles: headings, bold, italic, code, tables, bullets, blockquotes, horizontal rules
 */

import React from 'react';

interface MarkdownProps {
  content: string;
  className?: string;
}

/** Escape HTML special chars to prevent XSS */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Convert inline markdown to HTML */
function parseInline(text: string): string {
  return text
    // Bold + Italic: ***text***
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');
}

/** Full block-level markdown parser */
function parseMarkdown(raw: string): string {
  const lines = raw.split('\n');
  const html: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let inBlockquote = false;
  let inTable = false;
  let tableHeaderDone = false;
  let inCodeBlock = false;
  let codeLang = '';
  let codeLines: string[] = [];

  const flushList = () => {
    if (inList) { html.push('</ul>'); inList = false; }
    if (inOrderedList) { html.push('</ol>'); inOrderedList = false; }
  };
  const flushBlockquote = () => {
    if (inBlockquote) { html.push('</blockquote>'); inBlockquote = false; }
  };
  const flushTable = () => {
    if (inTable) { html.push('</tbody></table>'); inTable = false; tableHeaderDone = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // --- Code block fence ---
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        const escaped = codeLines.map(escapeHtml).join('\n');
        html.push(`<pre class="md-pre"><code class="md-code" data-lang="${codeLang}">${escaped}</code></pre>`);
        inCodeBlock = false;
        codeLang = '';
        codeLines = [];
      } else {
        // Start code block
        flushList(); flushBlockquote(); flushTable();
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim() || 'text';
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // --- Horizontal rule ---
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushList(); flushBlockquote(); flushTable();
      html.push('<hr class="md-hr" />');
      continue;
    }

    // --- Headings ---
    const h4 = trimmed.match(/^#{4}\s+(.+)/);
    const h3 = trimmed.match(/^#{3}\s+(.+)/);
    const h2 = trimmed.match(/^#{2}\s+(.+)/);
    const h1 = trimmed.match(/^#{1}\s+(.+)/);
    if (h4) { flushList(); flushBlockquote(); flushTable(); html.push(`<h4 class="md-h4">${parseInline(h4[1])}</h4>`); continue; }
    if (h3) { flushList(); flushBlockquote(); flushTable(); html.push(`<h3 class="md-h3">${parseInline(h3[1])}</h3>`); continue; }
    if (h2) { flushList(); flushBlockquote(); flushTable(); html.push(`<h2 class="md-h2">${parseInline(h2[1])}</h2>`); continue; }
    if (h1) { flushList(); flushBlockquote(); flushTable(); html.push(`<h1 class="md-h1">${parseInline(h1[1])}</h1>`); continue; }

    // --- Blockquote ---
    if (trimmed.startsWith('>')) {
      flushList(); flushTable();
      const content = trimmed.slice(1).trim();
      if (!inBlockquote) { html.push('<blockquote class="md-blockquote">'); inBlockquote = true; }
      html.push(`<p class="md-bq-p">${parseInline(content)}</p>`);
      continue;
    } else {
      flushBlockquote();
    }

    // --- Table ---
    if (trimmed.includes('|') && trimmed.startsWith('|')) {
      flushList();
      const cols = trimmed.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1);
      if (!inTable) {
        html.push('<div class="md-table-wrap"><table class="md-table"><thead><tr>');
        cols.forEach(col => html.push(`<th class="md-th">${parseInline(col.trim())}</th>`));
        html.push('</tr></thead><tbody>');
        inTable = true;
        tableHeaderDone = false;
        continue;
      }
      // Skip separator row (---|---)
      if (cols.every(c => /^[-:\s]+$/.test(c))) {
        tableHeaderDone = true;
        continue;
      }
      if (tableHeaderDone) {
        html.push('<tr>');
        cols.forEach(col => html.push(`<td class="md-td">${parseInline(col.trim())}</td>`));
        html.push('</tr>');
        continue;
      }
    } else {
      flushTable();
    }

    // --- Unordered list ---
    const ulMatch = trimmed.match(/^[-*+]\s+(.*)/);
    if (ulMatch) {
      flushBlockquote();
      if (inOrderedList) { html.push('</ol>'); inOrderedList = false; }
      if (!inList) { html.push('<ul class="md-ul">'); inList = true; }
      html.push(`<li class="md-li">${parseInline(ulMatch[1])}</li>`);
      continue;
    }

    // --- Ordered list ---
    const olMatch = trimmed.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      flushBlockquote();
      if (inList) { html.push('</ul>'); inList = false; }
      if (!inOrderedList) { html.push('<ol class="md-ol">'); inOrderedList = true; }
      html.push(`<li class="md-li">${parseInline(olMatch[1])}</li>`);
      continue;
    }

    // --- Empty line ---
    if (trimmed === '') {
      flushList(); flushBlockquote(); flushTable();
      html.push('<br/>');
      continue;
    }

    // --- Normal paragraph ---
    flushList(); flushBlockquote(); flushTable();
    html.push(`<p class="md-p">${parseInline(trimmed)}</p>`);
  }

  // Flush any open blocks at end of content
  flushList();
  flushBlockquote();
  flushTable();
  if (inCodeBlock) {
    const escaped = codeLines.map(escapeHtml).join('\n');
    html.push(`<pre class="md-pre"><code class="md-code">${escaped}</code></pre>`);
  }

  return html.join('');
}

export const MarkdownMessage: React.FC<MarkdownProps> = ({ content, className = '' }) => {
  const html = parseMarkdown(content);

  return (
    <div
      className={`md-root ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

