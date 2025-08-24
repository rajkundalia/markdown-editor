import { useState, useCallback, useEffect, useRef } from 'react';
import { ResizeState } from '@/types';

/**
 * Hook for managing resizable pane functionality
 * @param initialWidth - Initial width percentage (0-100)
 * @param minWidth - Minimum width percentage (0-100)
 * @param maxWidth - Maximum width percentage (0-100)
 * @returns Resize state and handlers
 */
export function useResizable(
  initialWidth: number = 50,
  minWidth: number = 20,
  maxWidth: number = 80
) {
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    leftWidth: initialWidth,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Start resizing
  const startResize = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    startXRef.current = e.clientX;
    startWidthRef.current = resizeState.leftWidth;
    
    setResizeState(prev => ({ ...prev, isResizing: true }));
    
    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [resizeState.leftWidth]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - startXRef.current;
    const deltaPercent = (deltaX / containerRect.width) * 100;
    const newWidth = Math.max(
      minWidth,
      Math.min(maxWidth, startWidthRef.current + deltaPercent)
    );
    
    setResizeState(prev => ({ ...prev, leftWidth: newWidth }));
  }, [minWidth, maxWidth]);

  // Handle mouse up (end resize)
  const handleMouseUp = useCallback(() => {
    setResizeState(prev => ({ ...prev, isResizing: false }));
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [handleMouseMove, handleMouseUp]);

  // Reset to default width
  const resetWidth = useCallback(() => {
    setResizeState(prev => ({ ...prev, leftWidth: initialWidth }));
  }, [initialWidth]);

  // Set specific width
  const setWidth = useCallback((width: number) => {
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, width));
    setResizeState(prev => ({ ...prev, leftWidth: clampedWidth }));
  }, [minWidth, maxWidth]);

  return {
    containerRef,
    leftWidth: resizeState.leftWidth,
    rightWidth: 100 - resizeState.leftWidth,
    isResizing: resizeState.isResizing,
    startResize,
    resetWidth,
    setWidth,
  };
}

/**
 * Hook for managing keyboard shortcuts during resize
 * @param resizeHook - The resizable hook instance
 */
export function useResizeKeyboardShortcuts(resizeHook: ReturnType<typeof useResizable>) {
  const { setWidth, leftWidth } = resizeHook;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when Ctrl/Cmd is pressed
      if (!(e.ctrlKey || e.metaKey)) return;

      switch (e.key) {
        case '1':
          e.preventDefault();
          setWidth(25); // Quarter width
          break;
        case '2':
          e.preventDefault();
          setWidth(50); // Half width
          break;
        case '3':
          e.preventDefault();
          setWidth(75); // Three quarters width
          break;
        case '0':
          e.preventDefault();
          setWidth(50); // Reset to default
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setWidth(Math.max(20, leftWidth - 5)); // Decrease by 5%
          break;
        case 'ArrowRight':
          e.preventDefault();
          setWidth(Math.min(80, leftWidth + 5)); // Increase by 5%
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setWidth, leftWidth]);
}

/**
 * Hook for touch-based resizing on mobile devices
 * @param resizeHook - The resizable hook instance
 */
export function useTouchResize(resizeHook: ReturnType<typeof useResizable>) {
  const { containerRef, leftWidth, setWidth } = resizeHook;
  const [isTouchResizing, setIsTouchResizing] = useState(false);
  const touchStartXRef = useRef<number>(0);
  const touchStartWidthRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length !== 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartWidthRef.current = leftWidth;
    setIsTouchResizing(true);
  }, [leftWidth, containerRef]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTouchResizing || !containerRef.current || e.touches.length !== 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const containerRect = containerRef.current.getBoundingClientRect();
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaPercent = (deltaX / containerRect.width) * 100;
    const newWidth = Math.max(20, Math.min(80, touchStartWidthRef.current + deltaPercent));
    
    setWidth(newWidth);
  }, [isTouchResizing, setWidth, containerRef]);

  const handleTouchEnd = useCallback(() => {
    setIsTouchResizing(false);
  }, []);

  useEffect(() => {
    if (isTouchResizing) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isTouchResizing, handleTouchMove, handleTouchEnd]);

  return {
    isTouchResizing,
    handleTouchStart,
  };
}