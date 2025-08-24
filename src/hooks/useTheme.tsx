import { useEffect, useContext, createContext, ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Theme } from '@/types';

// Theme context interface
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

/**
 * Theme provider component that manages theme state and persistence
 */
export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'markdown-editor-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage<Theme>(storageKey, defaultTheme);

  // Apply theme to document root
  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Only auto-switch if user hasn't explicitly set a theme
      const storedTheme = localStorage.getItem(storageKey);
      if (!storedTheme) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme, storageKey]);

  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 * @returns Theme context value
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Hook to detect system theme preference
 * @returns 'light' | 'dark' based on system preference
 */
export function useSystemTheme(): Theme {
  const [systemTheme, setSystemTheme] = useLocalStorage<Theme>(
    'system-theme-preference',
    'light'
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateSystemTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    // Set initial value
    updateSystemTheme();

    // Listen for changes
    mediaQuery.addEventListener('change', updateSystemTheme);
    return () => mediaQuery.removeEventListener('change', updateSystemTheme);
  }, [setSystemTheme]);

  return systemTheme;
}

/**
 * Hook for managing theme with additional utilities
 * @returns Extended theme management utilities
 */
export function useThemeUtils() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const systemTheme = useSystemTheme();

  const isDark = theme === 'dark';
  const isLight = theme === 'light';
  
  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');
  
  // Get effective theme (resolves 'system' to actual theme)
  const effectiveTheme = theme === 'light' || theme === 'dark' ? theme : systemTheme;

  return {
    theme,
    effectiveTheme,
    isDark,
    isLight,
    setTheme,
    setLightTheme,
    setDarkTheme,
    toggleTheme,
    systemTheme,
  };
}