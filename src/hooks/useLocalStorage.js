// ============================================================
// useLocalStorage.js  –  Custom hook for localStorage persistence
// ============================================================
import { useState, useEffect } from 'react';

/**
 * Works just like useState, but persists the value in localStorage.
 * @param {string} key   - localStorage key
 * @param {*}      initial - default value (used when key is absent)
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota errors
    }
  }, [key, value]);

  return [value, setValue];
}
