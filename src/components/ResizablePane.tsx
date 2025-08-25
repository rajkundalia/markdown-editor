'use client';

import { useResizable, useResizeKeyboardShortcuts, useTouchResize } from '@/hooks/useResizable';
import { ResizablePaneProps } from '@/types';
import { GripVertical } from 'lucide-react';

/**
 * Resizable Pane Component
 * Provides a two-pane layout with draggable resize functionality
 */
export function ResizablePane({
  leftContent,
  rightContent,
  initialLeftWidth = 50,
  minLeftWidth = 25,
  maxLeftWidth = 75,
  className = '',
}: ResizablePaneProps) {
  const resizeHook = useResizable(initialLeftWidth, minLeftWidth, maxLeftWidth);
  const { 
    containerRef, 
    leftWidth, 
    rightWidth, 
    isResizing, 
    startResize 
  } = resizeHook;

  // Enable keyboard shortcuts for resizing
  useResizeKeyboardShortcuts(resizeHook);
  
  // Enable touch support for mobile
  const { isTouchResizing, handleTouchStart } = useTouchResize(resizeHook);

  const baseClasses = [
    'flex',
    'h-full',
    'overflow-hidden',
    'bg-background',
  ].join(' ');

  const leftPaneClasses = [
    'flex',
    'flex-col',
    'border-r',
    'border-border',
    'bg-background',
    'overflow-hidden',
  ].join(' ');

  const rightPaneClasses = [
    'flex',
    'flex-col',
    'bg-background',
    'overflow-hidden',
  ].join(' ');

  const resizerClasses = [
    'relative',
    'w-1',
    'bg-border',
    'cursor-col-resize',
    'hover:bg-primary/50',
    'transition-colors',
    'duration-200',
    'flex',
    'items-center',
    'justify-center',
    'group',
    'select-none',
    isResizing || isTouchResizing ? 'bg-primary' : '',
  ].join(' ');

  return (
    <div 
      ref={containerRef} 
      className={`${baseClasses} ${className}`}
      style={{ cursor: isResizing ? 'col-resize' : 'default' }}
    >
      {/* Left pane */}
      <div
        className={leftPaneClasses}
        style={{ width: `${leftWidth}%` }}
      >
        {leftContent}
      </div>

      {/* Resizer */}
      <div
        className={resizerClasses}
        onMouseDown={startResize}
        onTouchStart={handleTouchStart}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panes"
        tabIndex={0}
        onKeyDown={(e) => {
          // Allow keyboard navigation
          if (e.key === 'ArrowLeft' && leftWidth > minLeftWidth) {
            resizeHook.setWidth(leftWidth - 5);
            e.preventDefault();
          } else if (e.key === 'ArrowRight' && leftWidth < maxLeftWidth) {
            resizeHook.setWidth(leftWidth + 5);
            e.preventDefault();
          } else if (e.key === 'Enter' || e.key === ' ') {
            resizeHook.resetWidth();
            e.preventDefault();
          }
        }}
      >
        {/* Visual grip indicator */}
        <div
          className={[
            'absolute',
            'inset-y-0',
            'w-4',
            'flex',
            'items-center',
            'justify-center',
            'opacity-0',
            'group-hover:opacity-100',
            'transition-opacity',
            'duration-200',
            'bg-background/80',
            'rounded-full',
            'shadow-sm',
            '-translate-x-1/2',
            'left-1/2',
          ].join(' ')}
        >
          <GripVertical 
            size={12} 
            className="text-muted-foreground group-hover:text-foreground transition-colors duration-200" 
          />
        </div>
        
        {/* Hover area for better UX */}
        <div className="absolute inset-0 w-4 -translate-x-1/2 left-1/2" />
      </div>

      {/* Right pane */}
      <div
        className={rightPaneClasses}
        style={{ width: `${rightWidth}%` }}
      >
        {rightContent}
      </div>

      {/* Mobile responsive message */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-muted/90 backdrop-blur-sm p-3 rounded-lg text-sm text-muted-foreground text-center">
        <p>On mobile? Swipe the divider to resize panes, or use the toggle button to switch views.</p>
      </div>

      {/* Resize shortcuts tooltip */}
      {isResizing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-foreground text-background px-3 py-2 rounded-md text-sm font-medium shadow-lg z-50">
          <div className="flex items-center space-x-4">
            <span>Dragging to resize</span>
            <div className="flex items-center space-x-2 text-xs opacity-75">
              <kbd className="px-1 py-0.5 bg-background/20 rounded">Esc</kbd>
              <span>Reset</span>
            </div>
          </div>
        </div>
      )}

      {/* Global escape key listener */}
      {isResizing && (
        <div
          className="fixed inset-0 z-40"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              resizeHook.resetWidth();
            }
          }}
          tabIndex={-1}
        />
      )}
    </div>
  );
}

/**
 * Mobile-friendly toggle component for switching between panes
 */
export function MobileViewToggle({ 
  currentView, 
  onViewChange 
}: {
  currentView: 'editor' | 'preview';
  onViewChange: (view: 'editor' | 'preview') => void;
}) {
  return (
    <div className="lg:hidden flex items-center justify-center p-2 bg-muted/30 border-b border-border">
      <div className="flex items-center bg-background border border-border rounded-lg p-1">
        <button
          onClick={() => onViewChange('editor')}
          className={[
            'px-3',
            'py-1.5',
            'text-sm',
            'font-medium',
            'rounded-md',
            'transition-colors',
            'duration-200',
            currentView === 'editor'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          ].join(' ')}
        >
          Editor
        </button>
        <button
          onClick={() => onViewChange('preview')}
          className={[
            'px-3',
            'py-1.5',
            'text-sm',
            'font-medium',
            'rounded-md',
            'transition-colors',
            'duration-200',
            currentView === 'preview'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          ].join(' ')}
        >
          Preview
        </button>
      </div>
    </div>
  );
}