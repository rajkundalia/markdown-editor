import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Prism from 'prismjs';

// Import core languages first
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

// Import languages that depend on others
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';

// Import PHP last as it has complex dependencies
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';

import { MarkdownOptions } from '@/types';

/**
 * Custom syntax highlighter using Prism.js
 * @param code - The code string to highlight
 * @param lang - The language identifier
 * @returns Highlighted HTML string
 */
const highlightCode = (code: string, lang: string): string => {
  // Normalize language identifiers
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'sh': 'bash',
    'shell': 'bash',
    'yml': 'yaml',
    'md': 'markdown',
    'cs': 'csharp',
  };

  const normalizedLang = languageMap[lang] || lang;

  try {
    // Check if language is supported and properly loaded
    if (Prism.languages[normalizedLang]) {
      // Additional safety check for the language object
      const language = Prism.languages[normalizedLang];
      if (typeof language === 'object' && language !== null) {
        return Prism.highlight(code, language, normalizedLang);
      }
    }
  } catch (error) {
    console.warn(`Failed to highlight code with language "${normalizedLang}":`, error);
  }

  // Fallback to plain text with HTML escaping
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Check if we're in a browser environment
 */
const isBrowser = () => typeof window !== 'undefined';

/**
 * Get current origin safely
 */
const getCurrentOrigin = (): string => {
  if (isBrowser() && window.location) {
    return window.location.origin;
  }
  return '';
};

/**
 * Configure marked with custom renderer and options
 */
const configureMarked = (options: MarkdownOptions = {
  breaks: true,
  gfm: true,
  sanitize: true,
}) => {
  // Create custom renderer
  const renderer = new marked.Renderer();

  // Custom heading renderer with id attributes for linking
  renderer.heading = (text: string, level: number) => {
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `<h${level} id="${id}" class="heading-${level}">${text}</h${level}>`;
  };

  // Custom code block renderer with syntax highlighting
  renderer.code = (code: string, language?: string) => {
    const lang = language || 'text';
    let highlighted: string;
    
    try {
      highlighted = options.highlight ? options.highlight(code, lang) : highlightCode(code, lang);
    } catch (error) {
      console.warn(`Code highlighting failed for language "${lang}":`, error);
      // Fallback to escaped plain text
      highlighted = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    
    return `
      <div class="code-block">
        <div class="code-header">
          <span class="code-language">${lang}</span>
        </div>
        <pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>
      </div>
    `;
  };

  // Custom inline code renderer
  renderer.codespan = (code: string) => {
    return `<code class="inline-code">${code}</code>`;
  };

  // Custom link renderer with security - FIXED for SSR
  renderer.link = (href: string, title: string | null, text: string) => {
    const titleAttr = title ? ` title="${title}"` : '';
    const currentOrigin = getCurrentOrigin();
    const isExternal = href.startsWith('http') && currentOrigin && !href.startsWith(currentOrigin);
    const relAttr = isExternal ? ' rel="noopener noreferrer"' : '';
    const targetAttr = isExternal ? ' target="_blank"' : '';
    
    return `<a href="${href}"${titleAttr}${relAttr}${targetAttr} class="link">${text}</a>`;
  };

  // Custom table renderer
  renderer.table = (header: string, body: string) => {
    return `
      <div class="table-wrapper">
        <table class="markdown-table">
          <thead>${header}</thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    `;
  };

  // Custom blockquote renderer
  renderer.blockquote = (quote: string) => {
    return `<blockquote class="blockquote">${quote}</blockquote>`;
  };

  // Custom list renderer
  renderer.list = (body: string, ordered: boolean) => {
    const tag = ordered ? 'ol' : 'ul';
    const className = ordered ? 'ordered-list' : 'unordered-list';
    return `<${tag} class="${className}">${body}</${tag}>`;
  };

  // Configure marked options
  marked.setOptions({
    renderer,
    breaks: options.breaks,
    gfm: options.gfm
  });

  return marked;
};

/**
 * Parse markdown string to HTML
 * @param markdown - The markdown string to parse
 * @param options - Parsing options
 * @returns Sanitized HTML string
 */
export const parseMarkdown = (markdown: string, options?: MarkdownOptions): string => {
  if (!markdown.trim()) {
    return '<p class="text-muted-foreground italic">Start typing to see preview...</p>';
  }

  try {
    // Configure marked with options
    const markedInstance = configureMarked({
      breaks: options?.breaks ?? true,
      gfm: options?.gfm ?? true,
      sanitize: options?.sanitize ?? true,
      highlight: highlightCode,
    });

    // Parse markdown to HTML
    const html = markedInstance.parse(markdown) as string;

    // Sanitize HTML if requested (default: true) - Only in browser
    if (options?.sanitize !== false && isBrowser() && typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
          'ul', 'ol', 'li', 'dl', 'dt', 'dd',
          'blockquote', 'q', 'cite',
          'code', 'pre', 'kbd', 'samp', 'var',
          'a', 'img', 'figure', 'figcaption',
          'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
          'div', 'span', 'section', 'article', 'aside', 'nav', 'header', 'footer',
          'hr', 'details', 'summary',
        ],
        ALLOWED_ATTR: [
          'href', 'title', 'alt', 'src', 'width', 'height',
          'class', 'id', 'lang', 'dir',
          'target', 'rel', 'type', 'start', 'reversed',
          'open', 'colspan', 'rowspan', 'scope',
        ],
        KEEP_CONTENT: true,
      });
    }

    return html;
  } catch (error) {
    console.error('Failed to parse markdown:', error);
    return `<p class="text-red-500">Error parsing markdown: ${error instanceof Error ? error.message : 'Unknown error'}</p>`;
  }
};

/**
 * Extract headings from markdown for table of contents
 * @param markdown - The markdown string
 * @returns Array of heading objects
 */
export const extractHeadings = (markdown: string): Array<{
  level: number;
  text: string;
  id: string;
}> => {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    
    headings.push({ level, text, id });
  }

  return headings;
};

/**
 * Count words in markdown text (excluding markup)
 * @param markdown - The markdown string
 * @returns Word count
 */
export const countWords = (markdown: string): number => {
  // Remove markdown syntax and count words
  const plainText = markdown
    .replace(/#{1,6}\s+/g, '') // Remove headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
    .replace(/!\[.*?\]\(.+?\)/g, '') // Remove images
    .replace(/>\s+/g, '') // Remove blockquotes
    .replace(/[-*+]\s+/g, '') // Remove list markers
    .replace(/\d+\.\s+/g, '') // Remove ordered list markers
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .trim();

  return plainText ? plainText.split(/\s+/).length : 0;
};

/**
 * Estimate reading time based on word count
 * @param wordCount - Number of words
 * @param wpm - Words per minute (default: 200)
 * @returns Reading time in minutes
 */
export const estimateReadingTime = (wordCount: number, wpm: number = 200): number => {
  return Math.ceil(wordCount / wpm);
};