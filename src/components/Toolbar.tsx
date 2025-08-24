'use client';

import { 
  Bold, 
  Italic, 
  Code, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Image,
  Minus,
  Table,
  CheckSquare
} from 'lucide-react';
import { ToolbarProps, ToolbarButton } from '@/types';

/**
 * Markdown Toolbar Component
 * Provides quick formatting buttons for common markdown syntax
 */
export function Toolbar({ onAction, className = '' }: ToolbarProps) {
  
  // Define toolbar buttons configuration
  const toolbarButtons: ToolbarButton[] = [
    {
      label: 'Bold',
      icon: Bold,
      action: 'wrap',
      syntax: { start: '**', end: '**' },
      shortcut: 'Ctrl+B',
      title: 'Bold (Ctrl+B)',
    },
    {
      label: 'Italic',
      icon: Italic,
      action: 'wrap',
      syntax: { start: '*', end: '*' },
      shortcut: 'Ctrl+I',
      title: 'Italic (Ctrl+I)',
    },
    {
      label: 'Code',
      icon: Code,
      action: 'wrap',
      syntax: { start: '`', end: '`' },
      shortcut: 'Ctrl+`',
      title: 'Inline code (Ctrl+`)',
    },
    // Separator
    { label: 'separator', icon: Minus, action: 'insert', syntax: '' },
    {
      label: 'Heading 1',
      icon: Heading1,
      action: 'prefix',
      syntax: '# ',
      title: 'Heading 1',
    },
    {
      label: 'Heading 2',
      icon: Heading2,
      action: 'prefix',
      syntax: '## ',
      title: 'Heading 2',
    },
    {
      label: 'Heading 3',
      icon: Heading3,
      action: 'prefix',
      syntax: '### ',
      title: 'Heading 3',
    },
    // Separator
    { label: 'separator', icon: Minus, action: 'insert', syntax: '' },
    {
      label: 'Link',
      icon: Link,
      action: 'wrap',
      syntax: { start: '[', end: '](url)' },
      shortcut: 'Ctrl+K',
      title: 'Link (Ctrl+K)',
    },
    {
      label: 'Image',
      icon: Image,
      action: 'insert',
      syntax: '![alt text](image-url)',
      title: 'Image',
    },
    // Separator
    { label: 'separator', icon: Minus, action: 'insert', syntax: '' },
    {
      label: 'Unordered List',
      icon: List,
      action: 'prefix',
      syntax: '- ',
      title: 'Bullet list',
    },
    {
      label: 'Ordered List',
      icon: ListOrdered,
      action: 'prefix',
      syntax: '1. ',
      title: 'Numbered list',
    },
    {
      label: 'Task List',
      icon: CheckSquare,
      action: 'prefix',
      syntax: '- [ ] ',
      title: 'Task list',
    },
    // Separator
    { label: 'separator', icon: Minus, action: 'insert', syntax: '' },
    {
      label: 'Quote',
      icon: Quote,
      action: 'prefix',
      syntax: '> ',
      title: 'Blockquote',
    },
    {
      label: 'Table',
      icon: Table,
      action: 'insert',
      syntax: '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |',
      title: 'Table',
    },
  ];

  // Handle button click
  const handleButtonClick = (button: ToolbarButton) => {
    if (button.label === 'separator') return;
    
    onAction(button.action, button.syntax);
  };

  const baseClasses = [
    'flex',
    'flex-wrap',
    'items-center',
    'gap-1',
    'p-2',
    'bg-muted/30',
    'border-b',
    'border-border',
  ].join(' ');

  return (
    <div className={`${baseClasses} ${className}`}>
      {toolbarButtons.map((button, index) => {
        // Render separator
        if (button.label === 'separator') {
          return (
            <div
              key={`separator-${index}`}
              className="w-px h-6 bg-border mx-1"
              aria-hidden="true"
            />
          );
        }

        const Icon = button.icon;
        
        return (
          <button
            key={button.label}
            onClick={() => handleButtonClick(button)}
            className={[
              'p-2',
              'rounded',
              'text-muted-foreground',
              'hover:text-foreground',
              'hover:bg-muted',
              'transition-colors',
              'duration-200',
              'focus:outline-none',
              'focus:ring-2',
              'focus:ring-primary',
              'focus:ring-offset-1',
              'active:scale-95',
              'transform',
              'transition-transform',
            ].join(' ')}
            title={button.title || button.label}
            aria-label={button.label}
            type="button"
          >
            <Icon size={16} />
          </button>
        );
      })}
      
      {/* Code block button */}
      <button
        onClick={() => onAction('insert', '\n```\ncode here\n```\n')}
        className={[
          'p-2',
          'rounded',
          'text-muted-foreground',
          'hover:text-foreground',
          'hover:bg-muted',
          'transition-colors',
          'duration-200',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-primary',
          'focus:ring-offset-1',
          'active:scale-95',
          'transform',
          'transition-transform',
        ].join(' ')}
        title="Code block"
        aria-label="Code block"
        type="button"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <span className="text-xs font-mono font-bold">{'{}'}</span>
        </div>
      </button>

      {/* Horizontal rule button */}
      <button
        onClick={() => onAction('insert', '\n\n---\n\n')}
        className={[
          'p-2',
          'rounded',
          'text-muted-foreground',
          'hover:text-foreground',
          'hover:bg-muted',
          'transition-colors',
          'duration-200',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-primary',
          'focus:ring-offset-1',
          'active:scale-95',
          'transform',
          'transition-transform',
        ].join(' ')}
        title="Horizontal rule"
        aria-label="Horizontal rule"
        type="button"
      >
        <Minus size={16} />
      </button>

      {/* Keyboard shortcuts info */}
      <div className="hidden lg:flex items-center ml-auto text-xs text-muted-foreground">
        <span className="mr-2">Shortcuts:</span>
        <div className="flex items-center space-x-2">
          <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs font-mono">
            Ctrl+B
          </kbd>
          <span>Bold</span>
          <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs font-mono">
            Ctrl+I
          </kbd>
          <span>Italic</span>
          <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-xs font-mono">
            Tab
          </kbd>
          <span>Indent</span>
        </div>
      </div>
    </div>
  );
}