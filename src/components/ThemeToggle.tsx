'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeUtils } from '@/hooks/useTheme';
import { ThemeToggleProps } from '@/types';

/**
 * Theme Toggle Component
 * Provides a button to switch between light and dark themes
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { toggleTheme, isDark } = useThemeUtils();

  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'w-9',
    'h-9',
    'rounded-md',
    'text-foreground',
    'bg-background',
    'border',
    'border-border',
    'hover:bg-muted',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary',
    'focus:ring-offset-1',
    'transition-all',
    'duration-200',
    'transform',
    'active:scale-95',
  ].join(' ');

  return (
    <button
      onClick={toggleTheme}
      className={`${baseClasses} ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
    >
      <div className="relative w-5 h-5">
        {/* Sun icon */}
        <Sun
          size={20}
          className={[
            'absolute',
            'inset-0',
            'transition-all',
            'duration-300',
            'transform',
            isDark 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
          ].join(' ')}
        />
        
        {/* Moon icon */}
        <Moon
          size={20}
          className={[
            'absolute',
            'inset-0',
            'transition-all',
            'duration-300',
            'transform',
            isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
          ].join(' ')}
        />
      </div>
      
      {/* Screen reader text */}
      <span className="sr-only">
        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
    </button>
  );
}