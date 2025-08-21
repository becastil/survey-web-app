/**
 * SSR-safe localStorage utility wrapper
 * Prevents hydration mismatches by checking for window availability
 */

export const safeLocalStorage = {
  /**
   * Get item from localStorage (SSR-safe)
   * Returns null if running on server or if item doesn't exist
   */
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get localStorage item "${key}":`, error);
      return null;
    }
  },

  /**
   * Set item in localStorage (SSR-safe)
   * Silently fails on server or if localStorage is unavailable
   */
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set localStorage item "${key}":`, error);
    }
  },

  /**
   * Remove item from localStorage (SSR-safe)
   */
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove localStorage item "${key}":`, error);
    }
  },

  /**
   * Clear all localStorage (SSR-safe)
   */
  clear: (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  },

  /**
   * Get all localStorage keys (SSR-safe)
   */
  getAllKeys: (): string[] => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.warn('Failed to get localStorage keys:', error);
      return [];
    }
  },

  /**
   * Check if localStorage is available
   */
  isAvailable: (): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * SSR-safe sessionStorage utility wrapper
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get sessionStorage item "${key}":`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set sessionStorage item "${key}":`, error);
    }
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove sessionStorage item "${key}":`, error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }
};