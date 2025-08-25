'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Editor } from '@/components/Editor';
import { Preview } from '@/components/Preview';
import { Toolbar } from '@/components/Toolbar';
import { FileOperations } from '@/components/FileOperations';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ResizablePane, MobileViewToggle } from '@/components/ResizablePane';
import { useDebouncedLocalStorage } from '@/hooks/useLocalStorage';
import { FileText, Github, Heart } from 'lucide-react';

// Default markdown content to showcase features
const DEFAULT_CONTENT = `# Welcome to Markdown Editor

A powerful, feature-rich markdown editor built with **Next.js** and **TypeScript**.

## Features

- ✅ **Live Preview** - See your markdown rendered in real-time
- ✅ **Syntax Highlighting** - Code blocks with beautiful syntax highlighting  
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Resizable Panes** - Drag to resize editor and preview
- ✅ **File Operations** - Import/export markdown files
- ✅ **Keyboard Shortcuts** - Efficient editing with shortcuts
- ✅ **Auto-save** - Your work is automatically saved to localStorage

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| \`Ctrl+B\` | **Bold** text |
| \`Ctrl+I\` | *Italic* text |
| \`Ctrl+K\` | Insert [link](https://example.com) |
| \`Tab\` | Indent selected lines |
| \`Shift+Tab\` | Unindent selected lines |

## Code Example

Here's a TypeScript React component:

\`\`\`tsx
import React, { useState } from 'react';

interface CounterProps {
  initialValue?: number;
}

export const Counter: React.FC<CounterProps> = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);
  
  return (
    <div className="counter">
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
};
\`\`\`

## Lists and Tasks

### Shopping List
- [x] Milk
- [x] Bread
- [ ] Eggs
- [ ] Butter

### Programming Languages
1. TypeScript
2. Python
3. Rust
4. Go

## Quotes and Links

> "The best way to predict the future is to invent it." - Alan Kay

Check out the [GitHub repository](https://github.com) for more information.

---

**Happy writing!** 🚀
`;

export default function HomePage() {
  // State management
  const [content, setContent] = useDebouncedLocalStorage('markdown-content', DEFAULT_CONTENT, 1000);
  const [cursorPosition, setCursorPosition] = useState({ position: 0, start: 0, end: 0 });
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  
  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, [setContent]);

  // Handle cursor position changes
  const handleCursorChange = useCallback((position: number, start: number, end: number) => {
    setCursorPosition({ position, start, end });
  }, []);

  // Handle toolbar actions
  const handleToolbarAction = useCallback((action: string, syntax: string | { start: string; end?: string }) => {
    if (!editorRef.current) return;

    const textarea = editorRef.current as any;
    const { selectionStart, selectionEnd, value } = textarea;

    if (action === 'wrap' && typeof syntax === 'object') {
      const { start, end = '' } = syntax;
      const selectedText = value.substring(selectionStart, selectionEnd);
      const newText = start + selectedText + end;
      const newValue = value.substring(0, selectionStart) + newText + value.substring(selectionEnd);
      
      setContent(newValue);

      // Set cursor position after update
      setTimeout(() => {
        if (textarea) {
          const newCursorPos = selectedText 
            ? selectionStart + start.length + selectedText.length + end.length
            : selectionStart + start.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }
      }, 0);
    } else if (action === 'insert') {
      const syntaxText = typeof syntax === 'string' ? syntax : syntax.start;
      const newValue = value.substring(0, selectionStart) + syntaxText + value.substring(selectionStart);
      
      setContent(newValue);

      setTimeout(() => {
        if (textarea) {
          const newCursorPos = selectionStart + syntaxText.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          textarea.focus();
        }
      }, 0);
    } else if (action === 'prefix') {
      const syntaxText = typeof syntax === 'string' ? syntax : syntax.start;
      const lines = value.split('\n');
      const startLine = value.substring(0, selectionStart).split('\n').length - 1;
      const endLine = value.substring(0, selectionEnd).split('\n').length - 1;

      const newLines = lines.map((line, index) => {
        if (index >= startLine && index <= endLine) {
          return syntaxText + line;
        }
        return line;
      });

      const newValue = newLines.join('\n');
      setContent(newValue);

      setTimeout(() => {
        if (textarea) {
          const addedChars = (endLine - startLine + 1) * syntaxText.length;
          textarea.setSelectionRange(
            selectionStart + syntaxText.length,
            selectionEnd + addedChars
          );
          textarea.focus();
        }
      }, 0);
    }
  }, [setContent]);

  // Handle file import
  const handleFileImport = useCallback((importedContent: string) => {
    setContent(importedContent);
    
    // Announce to screen readers
    const announcement = document.getElementById('announcements');
    if (announcement) {
      announcement.textContent = 'File imported successfully';
    }
  }, [setContent]);

  // Mobile responsive handlers
  const handleMobileViewChange = useCallback((view: 'editor' | 'preview') => {
    setMobileView(view);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcuts (Ctrl/Cmd + key)
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            // Trigger manual save (already auto-saving)
            const announcement = document.getElementById('announcements');
            if (announcement) {
              announcement.textContent = 'Document saved automatically';
            }
            break;
          case 'o':
            e.preventDefault();
            // Trigger file import
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
              fileInput.click();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Editor and Preview components
  const editorComponent = (
    <div className="flex flex-col h-full">
      <Toolbar onAction={handleToolbarAction} className="no-print" />
      <div className="flex-1 overflow-hidden">
        <Editor
          ref={editorRef}
          content={content}
          onChange={handleContentChange}
          onCursorChange={handleCursorChange}
          className="h-full"
          placeholder="Start typing your markdown here..."
        />
      </div>
    </div>
  );

  const previewComponent = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <Preview content={content} className="h-full" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FileText size={24} className="text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              Markdown Editor
            </h1>
          </div>
          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-muted rounded-md font-mono">
              Next.js + TypeScript
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* File Operations */}
          <FileOperations 
            content={content}
            onImport={handleFileImport}
            className="no-print"
          />
          
          {/* Theme Toggle */}
          <ThemeToggle className="no-print" />
          
          {/* GitHub Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-foreground bg-background border border-border hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition-colors duration-200 no-print"
            title="View on GitHub"
            aria-label="View on GitHub"
          >
            <Github size={16} />
          </a>
        </div>
      </header>

      {/* Mobile View Toggle */}
      <div className="lg:hidden">
        <MobileViewToggle 
          currentView={mobileView}
          onViewChange={handleMobileViewChange}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {/* Desktop: Resizable panes */}
        <div className="hidden lg:block h-full">
          <ResizablePane
            leftContent={editorComponent}
            rightContent={previewComponent}
            initialLeftWidth={50}
            minLeftWidth={25}
            maxLeftWidth={75}
            className="h-full"
          />
        </div>

        {/* Mobile: Single pane with toggle */}
        <div className="lg:hidden h-full">
          <div className="h-full">
            {mobileView === 'editor' ? editorComponent : previewComponent}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-between p-3 border-t border-border bg-muted/30 text-sm text-muted-foreground no-print">
        <div className="flex items-center space-x-4">
          <span>{content.split('\n').length} lines</span>
          <span>{content.length} characters</span>
          <span>Position: {cursorPosition.position}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span>Made with</span>
          <Heart size={14} className="text-red-500" fill="currentColor" />
          <span>using Next.js & TypeScript</span>
        </div>
      </footer>

      {/* Loading states and error boundaries would go here in a production app */}
      
      {/* Accessibility improvements */}
      <div className="sr-only">
        <h2>Editor Statistics</h2>
        <p>
          Document contains {content.split('\n').length} lines and {content.length} characters.
          Current cursor position: {cursorPosition.position}
        </p>
      </div>
    </div>
  );
}