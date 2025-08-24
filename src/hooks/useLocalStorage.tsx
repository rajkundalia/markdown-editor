import { useState, useEffect, useCallback } from 'react';
import { LocalStorageValue } from '@/types';

/**
 * Custom hook for managing localStorage with TypeScript support
 * @param key - The localStorage key
 * @param initialValue - The initial value if no stored value exists
 * @returns Tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(key: string, initialValue: T): LocalStorageValue<T> {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize value from localStorage on mount
  useEffect(() => {
    try {
      // Only run on client side
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsedValue = JSON.parse(item);
          setStoredValue(parsedValue);
        }
        setIsInitialized(true);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      setIsInitialized(true);
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Return the value only after initialization to avoid hydration mismatches
  return [isInitialized ? storedValue : initialValue, setValue];
}

/**
 * Hook for managing multiple localStorage values with a single namespace
 * Useful for storing related application state
 */
export function useLocalStorageState<T extends Record<string, unknown>>(
  namespace: string,
  initialState: T
): [T, (updates: Partial<T>) => void, () => void] {
  const [state, setState] = useLocalStorage<T>(namespace, initialState);

  const updateState = useCallback((updates: Partial<T>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, [setState]);

  const resetState = useCallback(() => {
    setState(initialState);
  }, [setState, initialState]);

  return [state, updateState, resetState];
}

/**
 * Hook for managing localStorage with automatic debouncing
 * Useful for frequently updated values like editor content
 */
export function useDebouncedLocalStorage<T>(
  key: string,
  initialValue: T,
  delay: number = 500
): LocalStorageValue<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item) {
          const parsedValue = JSON.parse(item);
          setValue(parsedValue);
          setDebouncedValue(parsedValue);
        }
        setIsInitialized(true);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      setIsInitialized(true);
    }
  }, [key]);

  // Debounce the value
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  // Save debounced value to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(debouncedValue));
        }
      } catch (error) {
        console.warn(`Error saving to localStorage key "${key}":`, error);
      }
    }
  }, [key, debouncedValue, isInitialized]);

  const setValueWrapper = useCallback((newValue: T | ((val: T) => T)) => {
    setValue(newValue instanceof Function ? newValue(value) : newValue);
  }, [value]);

  return [isInitialized ? value : initialValue, setValueWrapper];
}