import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import { NavigationProvider } from './NavigationContext.jsx';
import { getItem, setItem, isStorageAvailable } from '../services/localStorageService.js';
import { STORAGE_KEYS } from '../utils/constants.js';

/**
 * @typedef {Object} AppContextValue
 * @property {boolean} isAppLoading - Whether the application is in a global loading state
 * @property {string|null} appError - Global application error message
 * @property {string} theme - Current theme ('dark' by default)
 * @property {Object|null} userPreferences - User preferences object
 * @property {function} setAppLoading - Set the global loading state
 * @property {function} setAppError - Set the global error message
 * @property {function} clearAppError - Clear the global error message
 * @property {function} setTheme - Set the current theme
 * @property {function} updateUserPreferences - Update user preferences
 * @property {boolean} storageAvailable - Whether localStorage is available
 */

const AppContext = createContext(null);

/**
 * Default theme value
 * @type {string}
 */
const DEFAULT_THEME = 'dark';

/**
 * Default user preferences
 * @type {Object}
 */
const DEFAULT_PREFERENCES = {
  animationsEnabled: true,
  compactMode: false,
  notificationsEnabled: true,
};

/**
 * Inner application context provider component.
 * Provides global app state including loading states, error states,
 * and theme preferences. Must be rendered inside AuthProvider and NavigationProvider.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} The provider component
 */
function AppContextProvider({ children }) {
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [appError, setAppErrorState] = useState(null);
  const [theme, setThemeState] = useState(() => {
    const stored = getItem(STORAGE_KEYS.THEME);
    return stored && typeof stored === 'string' ? stored : DEFAULT_THEME;
  });
  const [userPreferences, setUserPreferencesState] = useState(() => {
    const stored = getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      return { ...DEFAULT_PREFERENCES, ...stored };
    }
    return { ...DEFAULT_PREFERENCES };
  });
  const [storageAvailable] = useState(() => isStorageAvailable());

  /**
   * Sets the global loading state
   * @param {boolean} loading - Whether the app is loading
   */
  const setAppLoading = useCallback((loading) => {
    setIsAppLoading(Boolean(loading));
  }, []);

  /**
   * Sets the global error message
   * @param {string|null} error - The error message or null to clear
   */
  const setAppError = useCallback((error) => {
    if (error && typeof error === 'string') {
      setAppErrorState(error);
    } else {
      setAppErrorState(null);
    }
  }, []);

  /**
   * Clears the global error message
   */
  const clearAppError = useCallback(() => {
    setAppErrorState(null);
  }, []);

  /**
   * Sets the current theme and persists to localStorage
   * @param {string} newTheme - The theme to set
   */
  const setTheme = useCallback((newTheme) => {
    if (!newTheme || typeof newTheme !== 'string') {
      return;
    }
    const trimmed = newTheme.trim();
    setThemeState(trimmed);
    setItem(STORAGE_KEYS.THEME, trimmed);
  }, []);

  /**
   * Updates user preferences and persists to localStorage
   * @param {Object} updates - Partial preferences object to merge
   */
  const updateUserPreferences = useCallback((updates) => {
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return;
    }
    setUserPreferencesState((prev) => {
      const merged = { ...prev, ...updates };
      setItem(STORAGE_KEYS.USER_PREFERENCES, merged);
      return merged;
    });
  }, []);

  // Sync theme to localStorage on mount if not already stored
  useEffect(() => {
    const stored = getItem(STORAGE_KEYS.THEME);
    if (!stored) {
      setItem(STORAGE_KEYS.THEME, theme);
    }
  }, [theme]);

  // Sync preferences to localStorage on mount if not already stored
  useEffect(() => {
    const stored = getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (!stored) {
      setItem(STORAGE_KEYS.USER_PREFERENCES, userPreferences);
    }
  }, [userPreferences]);

  const value = useMemo(() => ({
    isAppLoading,
    appError,
    theme,
    userPreferences,
    setAppLoading,
    setAppError,
    clearAppError,
    setTheme,
    updateUserPreferences,
    storageAvailable,
  }), [
    isAppLoading,
    appError,
    theme,
    userPreferences,
    setAppLoading,
    setAppError,
    clearAppError,
    setTheme,
    updateUserPreferences,
    storageAvailable,
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Root application state context provider that composes AuthContext
 * and NavigationContext. Provides global app state including loading states,
 * error states, and theme preferences.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} The composed provider component
 */
export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContextProvider>
          {children}
        </AppContextProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook for consuming the AppContext.
 * Must be used within an AppProvider.
 *
 * @returns {AppContextValue} The application context value
 * @throws {Error} If used outside of an AppProvider
 */
export function useApp() {
  const context = useContext(AppContext);

  if (context === null) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
}

export default AppContext;