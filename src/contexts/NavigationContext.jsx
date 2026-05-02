import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  navigateTo as navServiceNavigateTo,
  navigateBack as navServiceNavigateBack,
  navigateToDashboard as navServiceNavigateToDashboard,
  navigateToQueryInput as navServiceNavigateToQueryInput,
  navigateToError as navServiceNavigateToError,
  getCurrentScreen,
  getCurrentView,
  getPersona,
  getPersonaFlow as navServiceGetPersonaFlow,
  getScreenConfig,
  getScreenPath,
  getScreenIdByPath,
  validateNavigation,
  getFullNavigationState,
} from '../services/navigationService.js';
import { useAuth } from './AuthContext.jsx';
import { SCREEN_IDS, VIEW_STATES } from '../utils/constants.js';

/**
 * @typedef {Object} NavigationContextValue
 * @property {number} currentScreen - Current screen ID (0-20)
 * @property {string|null} currentView - Current view state
 * @property {string|null} screenName - Current screen name
 * @property {string|null} screenPath - Current screen path
 * @property {boolean} isNavigating - Whether a navigation is in progress
 * @property {function} navigateTo - Navigate to a specific screen and view
 * @property {function} goBack - Navigate to the previous screen
 * @property {function} goToDashboard - Navigate to the dashboard
 * @property {function} goToQueryInput - Navigate to the query input screen
 * @property {function} goToError - Navigate to the error screen
 * @property {function} getPersonaFlow - Get the screen flow for a persona
 * @property {function} canNavigateTo - Check if navigation to a screen is allowed
 */

const NavigationContext = createContext(null);

/**
 * Resolves the router path for a given screen ID
 * @param {number} screenId - The screen ID
 * @returns {string} The router path
 */
function resolveRouterPath(screenId) {
  const path = getScreenPath(screenId);
  if (path && typeof path === 'string') {
    return path;
  }
  return '/';
}

/**
 * Navigation context provider component.
 * Provides navigation state and methods to all children.
 * Syncs with localStorage via navigationService and react-router.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} The provider component
 */
export function NavigationProvider({ children }) {
  const { isAuthenticated, persona } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentScreenState, setCurrentScreenState] = useState(() => getCurrentScreen());
  const [currentViewState, setCurrentViewState] = useState(() => getCurrentView());
  const [isNavigating, setIsNavigating] = useState(false);

  /**
   * Syncs internal state from localStorage navigation state
   */
  const syncFromStorage = useCallback(() => {
    const screen = getCurrentScreen();
    const view = getCurrentView();
    setCurrentScreenState(screen);
    setCurrentViewState(view);
  }, []);

  // Sync state from localStorage on mount and when location changes
  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage, location.pathname]);

  // Sync screen state when the URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    const screenId = getScreenIdByPath(location.pathname);
    if (screenId !== null && screenId !== currentScreenState) {
      const config = getScreenConfig(screenId);
      if (config) {
        if (config.requiresAuth && !isAuthenticated) {
          return;
        }
        const result = navServiceNavigateTo(screenId, config.defaultView || null);
        if (result.success) {
          setCurrentScreenState(screenId);
          setCurrentViewState(config.defaultView || null);
        }
      }
    }
  }, [location.pathname, isAuthenticated, currentScreenState]);

  /**
   * Navigates to a specified screen and view state.
   * Updates localStorage, internal state, and react-router.
   *
   * @param {number} screenId - The target screen ID (0-20)
   * @param {string|null} [viewState=null] - The target view state
   * @returns {{ success: boolean, error: string|null }} Navigation result
   */
  const navigateTo = useCallback((screenId, viewState = null) => {
    setIsNavigating(true);

    try {
      const result = navServiceNavigateTo(screenId, viewState);

      if (result.success) {
        setCurrentScreenState(screenId);
        setCurrentViewState(viewState || getScreenConfig(screenId)?.defaultView || null);

        const routerPath = resolveRouterPath(screenId);
        if (location.pathname !== routerPath) {
          navigate(routerPath);
        }
      }

      return result;
    } catch (_err) {
      return { success: false, error: 'Navigation failed unexpectedly.' };
    } finally {
      setIsNavigating(false);
    }
  }, [navigate, location.pathname]);

  /**
   * Navigates to the previous screen in the persona flow
   * @returns {{ success: boolean, error: string|null }} Navigation result
   */
  const goBack = useCallback(() => {
    setIsNavigating(true);

    try {
      const result = navServiceNavigateBack();

      if (result.success) {
        syncFromStorage();
        const updatedScreen = getCurrentScreen();
        const routerPath = resolveRouterPath(updatedScreen);
        if (location.pathname !== routerPath) {
          navigate(routerPath);
        }
      }

      return result;
    } catch (_err) {
      return { success: false, error: 'Navigation back failed unexpectedly.' };
    } finally {
      setIsNavigating(false);
    }
  }, [navigate, location.pathname, syncFromStorage]);

  /**
   * Navigates to the dashboard screen
   * @returns {{ success: boolean, error: string|null }} Navigation result
   */
  const goToDashboard = useCallback(() => {
    setIsNavigating(true);

    try {
      const result = navServiceNavigateToDashboard();

      if (result.success) {
        setCurrentScreenState(SCREEN_IDS.DASHBOARD);
        setCurrentViewState(VIEW_STATES.QUERY_INPUT);

        const routerPath = resolveRouterPath(SCREEN_IDS.DASHBOARD);
        if (location.pathname !== routerPath) {
          navigate(routerPath);
        }
      }

      return result;
    } catch (_err) {
      return { success: false, error: 'Navigation to dashboard failed unexpectedly.' };
    } finally {
      setIsNavigating(false);
    }
  }, [navigate, location.pathname]);

  /**
   * Navigates to the query input screen
   * @param {string|null} [viewState=null] - Optional view state override
   * @returns {{ success: boolean, error: string|null }} Navigation result
   */
  const goToQueryInput = useCallback((viewState = null) => {
    setIsNavigating(true);

    try {
      const result = navServiceNavigateToQueryInput(viewState);

      if (result.success) {
        setCurrentScreenState(SCREEN_IDS.QUERY_INPUT);
        setCurrentViewState(viewState || VIEW_STATES.QUERY_INPUT);

        const routerPath = resolveRouterPath(SCREEN_IDS.QUERY_INPUT);
        if (location.pathname !== routerPath) {
          navigate(routerPath);
        }
      }

      return result;
    } catch (_err) {
      return { success: false, error: 'Navigation to query input failed unexpectedly.' };
    } finally {
      setIsNavigating(false);
    }
  }, [navigate, location.pathname]);

  /**
   * Navigates to the error screen
   * @returns {{ success: boolean, error: string|null }} Navigation result
   */
  const goToError = useCallback(() => {
    setIsNavigating(true);

    try {
      const result = navServiceNavigateToError();

      if (result.success) {
        setCurrentScreenState(SCREEN_IDS.ERROR);
        setCurrentViewState(null);

        const routerPath = resolveRouterPath(SCREEN_IDS.ERROR);
        if (location.pathname !== routerPath) {
          navigate(routerPath);
        }
      }

      return result;
    } catch (_err) {
      return { success: false, error: 'Navigation to error screen failed unexpectedly.' };
    } finally {
      setIsNavigating(false);
    }
  }, [navigate, location.pathname]);

  /**
   * Gets the screen flow for a given persona
   * @param {string} [personaId] - The persona ID. Defaults to current persona.
   * @returns {Array<number>} Ordered array of screen IDs
   */
  const getPersonaFlow = useCallback((personaId) => {
    const resolvedPersona = personaId || persona || getPersona();
    return navServiceGetPersonaFlow(resolvedPersona);
  }, [persona]);

  /**
   * Checks if navigation to a given screen is allowed
   * @param {number} screenId - The target screen ID
   * @param {string|null} [personaId=null] - Optional persona to validate against
   * @returns {{ valid: boolean, reason: string|null }} Validation result
   */
  const canNavigateTo = useCallback((screenId, personaId = null) => {
    const resolvedPersona = personaId || persona || getPersona();
    return validateNavigation(screenId, resolvedPersona);
  }, [persona]);

  // Derive screen name and path from current screen
  const screenConfig = useMemo(() => {
    return getScreenConfig(currentScreenState);
  }, [currentScreenState]);

  const screenName = screenConfig ? screenConfig.name : null;
  const screenPath = screenConfig ? screenConfig.path : null;

  const value = useMemo(() => ({
    currentScreen: currentScreenState,
    currentView: currentViewState,
    screenName,
    screenPath,
    isNavigating,
    navigateTo,
    goBack,
    goToDashboard,
    goToQueryInput,
    goToError,
    getPersonaFlow,
    canNavigateTo,
  }), [
    currentScreenState,
    currentViewState,
    screenName,
    screenPath,
    isNavigating,
    navigateTo,
    goBack,
    goToDashboard,
    goToQueryInput,
    goToError,
    getPersonaFlow,
    canNavigateTo,
  ]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

NavigationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook for consuming the NavigationContext.
 * Must be used within a NavigationProvider.
 *
 * @returns {NavigationContextValue} The navigation context value
 * @throws {Error} If used outside of a NavigationProvider
 */
export function useNavigation() {
  const context = useContext(NavigationContext);

  if (context === null) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }

  return context;
}

export default NavigationContext;