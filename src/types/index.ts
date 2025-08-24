// Theme types
export type Theme = 'light' | 'dark';

// Toolbar button configuration
export interface ToolbarButton {
  label: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  action: 'wrap' | 'insert' | 'prefix';
  syntax: string | { start: string; end?: string };
  shortcut?: string;
  title?: string;
}

// Editor state and actions
export interface EditorState {
  content: string;
  cursorPosition: number;
  selectionStart: number;
  selectionEnd: number;
}

export interface EditorActions {
  setContent: (content: string) => void;
  insertText: (text: string, cursorOffset?: number) => void;
  wrapSelection: (before: string, after?: string) => void;
  updateCursor: (position: number) => void;
}

// File operation types
export interface FileOperationResult {
  success: boolean;
  message: string;
  content?: string;
}

// Resizable pane types
export interface ResizeState {
  isResizing: boolean;
  leftWidth: number;
}

// Local storage hook types
export type LocalStorageValue<T> = [T, (value: T | ((val: T) => T)) => void];

// Markdown parsing options
export interface MarkdownOptions {
  breaks: boolean;
  gfm: boolean;
  sanitize: boolean;
  highlight?: (code: string, lang: string) => string;
}

// Component prop types
export interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange?: (position: number, selectionStart: number, selectionEnd: number) => void;
  className?: string;
  placeholder?: string;
}

export interface PreviewProps {
  content: string;
  className?: string;
}

export interface ToolbarProps {
  onAction: (action: string, syntax: string | { start: string; end?: string }) => void;
  className?: string;
}

export interface FileOperationsProps {
  content: string;
  onImport: (content: string) => void;
  className?: string;
}

export interface ThemeToggleProps {
  className?: string;
}

export interface ResizablePaneProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  initialLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
  className?: string;
}