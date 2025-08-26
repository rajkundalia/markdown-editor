'use client';

import { useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { EditorProps } from '@/types';

/**
 * Markdown Editor Component
 * A textarea-based markdown editor with proper TypeScript event handling and ref forwarding
 */
export const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({
  content,
  onChange,
  onCursorChange,
  className = '',
  placeholder = 'Start typing your markdown...',
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Forward the ref to the textarea
  useImperativeHandle(ref, () => textareaRef.current!, []);

  // Handle content changes with proper typing
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onChange(newContent);

    // Notify cursor position changes if callback provided
    if (onCursorChange) {
      const { selectionStart, selectionEnd } = e.target;
      onCursorChange(selectionStart, selectionStart, selectionEnd);
    }
  }, [onChange, onCursorChange]);

  // Handle cursor position changes
  const handleSelectionChange = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (onCursorChange) {
      const target = e.target as HTMLTextAreaElement;
      const { selectionStart, selectionEnd } = target;
      onCursorChange(selectionStart, selectionStart, selectionEnd);
    }
  }, [onCursorChange]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;

    // Tab key handling for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const { selectionStart, selectionEnd, value } = target;
      const isShiftTab = e.shiftKey;

      if (isShiftTab) {
        // Handle shift+tab (dedent)
        const lines = value.split('\n');
        const startLine = value.substring(0, selectionStart).split('\n').length - 1;
        const endLine = value.substring(0, selectionEnd).split('\n').length - 1;

        let newContent = '';
        let newSelectionStart = selectionStart;
        let newSelectionEnd = selectionEnd;

        lines.forEach((line: string, index: number) => {
          if (index >= startLine && index <= endLine) {
            if (line.startsWith('  ')) {
              newContent += line.substring(2);
              if (index === startLine) newSelectionStart = Math.max(0, selectionStart - 2);
              if (index <= endLine) newSelectionEnd = Math.max(0, newSelectionEnd - 2);
            } else if (line.startsWith('\t')) {
              newContent += line.substring(1);
              if (index === startLine) newSelectionStart = Math.max(0, selectionStart - 1);
              if (index <= endLine) newSelectionEnd = Math.max(0, newSelectionEnd - 1);
            } else {
              newContent += line;
            }
          } else {
            newContent += line;
          }
          if (index < lines.length - 1) newContent += '\n';
        });

        onChange(newContent);
        
        // Restore selection after state update
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.setSelectionRange(newSelectionStart, newSelectionEnd);
          }
        }, 0);
      } else {
        // Handle tab (indent)
        if (selectionStart === selectionEnd) {
          // Single cursor - insert tab
          const newValue = value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
          onChange(newValue);
          
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.setSelectionRange(selectionStart + 2, selectionStart + 2);
            }
          }, 0);
        } else {
          // Selection - indent all selected lines
          const lines = value.split('\n');
          const startLine = value.substring(0, selectionStart).split('\n').length - 1;
          const endLine = value.substring(0, selectionEnd).split('\n').length - 1;

          const newLines = lines.map((line: string, index: number) => {
            if (index >= startLine && index <= endLine) {
              return '  ' + line;
            }
            return line;
          });

          const newContent = newLines.join('\n');
          onChange(newContent);

          setTimeout(() => {
            if (textareaRef.current) {
              const addedChars = (endLine - startLine + 1) * 2;
              textareaRef.current.setSelectionRange(
                selectionStart + 2,
                selectionEnd + addedChars
              );
            }
          }, 0);
        }
      }
    }

    // Common markdown shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('*', '*');
          break;
        case 'k':
          e.preventDefault();
          insertMarkdown('[', '](url)');
          break;
        case '`':
          e.preventDefault();
          insertMarkdown('`', '`');
          break;
      }
    }
  }, [onChange]);

  // Utility function to insert markdown syntax
  const insertMarkdown = useCallback((before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const { selectionStart, selectionEnd, value } = textareaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);
    const newText = before + selectedText + after;
    const newValue = value.substring(0, selectionStart) + newText + value.substring(selectionEnd);
    
    onChange(newValue);

    // Set cursor position after the inserted text
    const newCursorPos = selectionStart + before.length + selectedText.length + after.length;
    setTimeout(() => {
      if (textareaRef.current) {
        if (selectedText) {
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        } else {
          textareaRef.current.setSelectionRange(
            selectionStart + before.length,
            selectionStart + before.length
          );
        }
        textareaRef.current.focus();
      }
    }, 0);
  }, [onChange]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, 200)}px`;
  }, []);

  // Auto-resize on content change
  useEffect(() => {
    autoResize();
  }, [content, autoResize]);

  // Expose methods for parent components
  const insertText = useCallback((text: string, cursorOffset: number = 0) => {
    if (!textareaRef.current) return;

    const { selectionStart, value } = textareaRef.current;
    const newValue = value.substring(0, selectionStart) + text + value.substring(selectionStart);
    
    onChange(newValue);

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = selectionStart + text.length + cursorOffset;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();
      }
    }, 0);
  }, [onChange]);

  const wrapSelection = useCallback((before: string, after: string = '') => {
    insertMarkdown(before, after);
  }, [insertMarkdown]);

  // Expose methods via ref
  useEffect(() => {
    if (textareaRef.current) {
      (textareaRef.current as any).insertText = insertText;
      (textareaRef.current as any).wrapSelection = wrapSelection;
    }
  }, [insertText, wrapSelection]);

  const baseClasses = [
    'w-full',
    'min-h-[400px]',
    'p-4',
    'border',
    'rounded-lg',
    'resize-none',
    'font-mono',
    'text-sm',
    'leading-relaxed',
    'bg-background',
    'text-foreground',
    'border-border',
    'placeholder:text-muted-foreground',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary',
    'focus:border-transparent',
    'transition-colors',
    'duration-200',
  ].join(' ');

  return (
    <div className="relative h-full">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onSelect={handleSelectionChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${baseClasses} ${className}`}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        style={{ 
          resize: 'none',
          minHeight: '400px',
          height: 'auto',
        }}
        aria-label="Markdown editor"
        data-testid="markdown-editor"
      />
      
      {/* Line and character count */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        {content.split('\n').length} lines • {content.length} chars
      </div>
    </div>
  );
});

Editor.displayName = 'Editor';