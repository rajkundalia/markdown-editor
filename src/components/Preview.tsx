'use client';

import { useMemo, useEffect, useRef } from 'react';
import { parseMarkdown, extractHeadings, countWords, estimateReadingTime } from '@/utils/markdown';
import { PreviewProps } from '@/types';

/**
 * Markdown Preview Component
 * Renders parsed markdown content with syntax highlighting and responsive design
 */
export function Preview({ content, className = '' }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  // Parse markdown content with memoization for performance
  const parsedContent = useMemo(() => {
    return parseMarkdown(content, {
      breaks: true,
      gfm: true,
      sanitize: true,
    });
  }, [content]);

  // Extract metadata for display
  const metadata = useMemo(() => {
    const headings = extractHeadings(content);
    const wordCount = countWords(content);
    const readingTime = estimateReadingTime(wordCount);

    return {
      headings,
      wordCount,
      readingTime,
      hasContent: content.trim().length > 0,
    };
  }, [content]);

  // Scroll to top when content changes significantly
  useEffect(() => {
    if (previewRef.current && metadata.hasContent) {
      // Only scroll if the content structure changed significantly
      const headingCount = metadata.headings.length;
      if (headingCount > 0) {
        // Small delay to ensure rendering is complete
        setTimeout(() => {
          if (previewRef.current) {
            previewRef.current.scrollTop = 0;
          }
        }, 50);
      }
    }
  }, [metadata.headings.length, metadata.hasContent]);

  // Handle internal link clicks for smooth scrolling
  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.getElementById(href.substring(1));
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const baseClasses = [
    'h-full',
    'overflow-auto',
    'p-4',
    'bg-background',
    'text-foreground',
    'prose',
    'prose-sm',
    'max-w-none',
    'prose-headings:text-foreground',
    'prose-p:text-foreground',
    'prose-strong:text-foreground',
    'prose-code:text-foreground',
    'prose-pre:bg-muted',
    'prose-pre:text-foreground',
    'prose-blockquote:text-muted-foreground',
    'prose-blockquote:border-l-border',
    'prose-th:text-foreground',
    'prose-td:text-foreground',
    'prose-a:text-primary',
    'prose-a:no-underline',
    'hover:prose-a:underline',
  ].join(' ');

  return (
    <div className={`${baseClasses} ${className}`}>
      {/* Metadata bar */}
      {metadata.hasContent && (
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4 pb-2 border-b border-border">
          <div className="flex items-center space-x-4">
            <span>{metadata.wordCount} words</span>
            <span>{metadata.readingTime} min read</span>
            {metadata.headings.length > 0 && (
              <span>{metadata.headings.length} headings</span>
            )}
          </div>
        </div>
      )}

      {/* Table of contents for documents with multiple headings */}
      {metadata.headings.length > 2 && (
        <div className="mb-6 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 text-foreground">Table of Contents</h4>
          <nav className="space-y-1">
            {metadata.headings.map((heading, index) => (
              <a
                key={index}
                href={`#${heading.id}`}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <div
        ref={previewRef}
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: parsedContent }}
        onClick={handleLinkClick}
      />

      {/* Custom styles for markdown content */}
      <style jsx>{`
        .markdown-content {
          line-height: 1.7;
        }

        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
          line-height: 1.25;
          scroll-margin-top: 2rem;
        }

        .markdown-content h1 {
          font-size: 2rem;
          border-bottom: 2px solid hsl(var(--border));
          padding-bottom: 0.5rem;
        }

        .markdown-content h2 {
          font-size: 1.5rem;
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.25rem;
        }

        .markdown-content h3 {
          font-size: 1.25rem;
        }

        .markdown-content h4 {
          font-size: 1.1rem;
        }

        .markdown-content p {
          margin-bottom: 1rem;
        }

        .markdown-content .code-block {
          margin: 1rem 0;
          border-radius: 0.5rem;
          overflow: hidden;
          background: hsl(var(--muted));
        }

        .markdown-content .code-header {
          padding: 0.5rem 1rem;
          background: hsl(var(--muted));
          border-bottom: 1px solid hsl(var(--border));
          font-size: 0.75rem;
          font-weight: 500;
          color: hsl(var(--muted-foreground));
        }

        .markdown-content .code-language {
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .markdown-content pre {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
          background: hsl(var(--muted)) !important;
          font-family: 'Fira Code', Monaco, 'Cascadia Code', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .markdown-content .inline-code {
          padding: 0.125rem 0.25rem;
          background: hsl(var(--muted));
          border-radius: 0.25rem;
          font-family: 'Fira Code', Monaco, 'Cascadia Code', 'Ubuntu Mono', monospace;
          font-size: 0.875em;
          font-weight: 500;
        }

        .markdown-content blockquote {
          margin: 1rem 0;
          padding: 0 1rem;
          border-left: 4px solid hsl(var(--primary));
          background: hsl(var(--muted) / 0.3);
          border-radius: 0 0.5rem 0.5rem 0;
        }

        .markdown-content .table-wrapper {
          margin: 1rem 0;
          overflow-x: auto;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--border));
        }

        .markdown-content .markdown-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .markdown-content .markdown-table th,
        .markdown-content .markdown-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid hsl(var(--border));
        }

        .markdown-content .markdown-table th {
          background: hsl(var(--muted));
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .markdown-content .markdown-table tbody tr:hover {
          background: hsl(var(--muted) / 0.5);
        }

        .markdown-content .ordered-list,
        .markdown-content .unordered-list {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .markdown-content .ordered-list li,
        .markdown-content .unordered-list li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        .markdown-content .link {
          color: hsl(var(--primary));
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .markdown-content .link:hover {
          border-bottom-color: hsl(var(--primary));
        }

        .markdown-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .markdown-content hr {
          margin: 2rem 0;
          border: none;
          height: 2px;
          background: linear-gradient(90deg, 
            transparent 0%, 
            hsl(var(--border)) 20%, 
            hsl(var(--border)) 80%, 
            transparent 100%);
        }

        /* Syntax highlighting overrides */
        .markdown-content .token.comment,
        .markdown-content .token.prolog,
        .markdown-content .token.doctype,
        .markdown-content .token.cdata {
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }

        .markdown-content .token.punctuation {
          color: hsl(var(--foreground));
        }

        .markdown-content .token.property,
        .markdown-content .token.tag,
        .markdown-content .token.boolean,
        .markdown-content .token.number,
        .markdown-content .token.constant,
        .markdown-content .token.symbol,
        .markdown-content .token.deleted {
          color: hsl(220 100% 66%);
        }

        .markdown-content .token.selector,
        .markdown-content .token.attr-name,
        .markdown-content .token.string,
        .markdown-content .token.char,
        .markdown-content .token.builtin,
        .markdown-content .token.inserted {
          color: hsl(142 76% 36%);
        }

        .markdown-content .token.operator,
        .markdown-content .token.entity,
        .markdown-content .token.url,
        .markdown-content .language-css .token.string,
        .markdown-content .style .token.string {
          color: hsl(221 87% 60%);
        }

        .markdown-content .token.atrule,
        .markdown-content .token.attr-value,
        .markdown-content .token.keyword {
          color: hsl(301 63% 40%);
        }

        .markdown-content .token.function,
        .markdown-content .token.class-name {
          color: hsl(41 99% 30%);
        }

        .markdown-content .token.regex,
        .markdown-content .token.important,
        .markdown-content .token.variable {
          color: hsl(355 65% 65%);
        }

        /* Dark mode syntax highlighting */
        .dark .markdown-content .token.property,
        .dark .markdown-content .token.tag,
        .dark .markdown-content .token.boolean,
        .dark .markdown-content .token.number,
        .dark .markdown-content .token.constant,
        .dark .markdown-content .token.symbol,
        .dark .markdown-content .token.deleted {
          color: hsl(220 100% 75%);
        }

        .dark .markdown-content .token.selector,
        .dark .markdown-content .token.attr-name,
        .dark .markdown-content .token.string,
        .dark .markdown-content .token.char,
        .dark .markdown-content .token.builtin,
        .dark .markdown-content .token.inserted {
          color: hsl(142 76% 65%);
        }

        .dark .markdown-content .token.atrule,
        .dark .markdown-content .token.attr-value,
        .dark .markdown-content .token.keyword {
          color: hsl(301 63% 70%);
        }

        .dark .markdown-content .token.function,
        .dark .markdown-content .token.class-name {
          color: hsl(41 99% 70%);
        }
      `}</style>
    </div>
  );
}