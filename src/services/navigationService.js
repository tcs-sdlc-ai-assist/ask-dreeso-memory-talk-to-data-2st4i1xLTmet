/**
 * Navigation state management service
 * Manages screen/view navigation, persona context, role-based access,
 * and screen configuration. All navigation events are audit-logged.
 * @module navigationService
 */

import { getNavigationState, setNavigationState, getItem } from './localStorageService.js';
import { logAction, ACTION_TYPES } from './auditLogService.js';
import { getCurrentSession } from './authService.js';
import { SCREEN_IDS, VIEW_STATES, STORAGE_KEYS, PERSONAS } from '../utils/constants.js';

/**
 * Screen configuration metadata for all 21 screens
 * @type {Object<number, Object>}
 */
const SCREEN_CONFIG = {
  [SCREEN_IDS.SPLASH]: {
    id: SCREEN_IDS.SPLASH,
    name: 'Splash',
    path: '/',
    requiresAuth: false,
    allowedClusters: null,
    defaultView: null,
    description: 'Application splash/loading screen',
  },
  [SCREEN_IDS.PERSONA_SELECT]: {
    id: SCREEN_IDS.PERSONA_SELECT,
    name: 'Persona Select',
    path: '/persona',
    requiresAuth: false,
    allowedClusters: null,
    defaultView: null,
    description: 'Persona selection and quick login screen',
  },
  [SCREEN_IDS.DASHBOARD]: {
    id: SCREEN_IDS.DASHBOARD,
    name: 'Dashboard',
    path: '/dashboard',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: VIEW_STATES.QUERY_INPUT,
    description: 'Main dashboard with KPIs and quick stats',
  },
  [SCREEN_IDS.QUERY_INPUT]: {
    id: SCREEN_IDS.QUERY_INPUT,
    name: 'Query Input',
    path: '/query',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: VIEW_STATES.QUERY_INPUT,
    description: 'Natural language query input screen',
  },
  [SCREEN_IDS.LOADING]: {
    id: SCREEN_IDS.LOADING,
    name: 'Loading',
    path: '/loading',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: VIEW_STATES.LOADING,
    description: 'Query processing loading screen',
  },
  [SCREEN_IDS.RESULT_OVERVIEW]: {
    id: SCREEN_IDS.RESULT_OVERVIEW,
    name: 'Result Overview',
    path: '/results',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: VIEW_STATES.RESULT,
    description: 'Query result overview with summary and data',
  },
  [SCREEN_IDS.RESULT_DETAIL]: {
    id: SCREEN_IDS.RESULT_DETAIL,
    name: 'Result Detail',
    path: '/results/detail',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: VIEW_STATES.RESULT,
    description: 'Detailed result view with drill-down data',
  },
  [SCREEN_IDS.CTA_PRIMARY]: {
    id: SCREEN_IDS.CTA_PRIMARY,
    name: 'CTA Primary',
    path: '/cta',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: VIEW_STATES.CTA_INTERACTION,
    description: 'Primary call-to-action interaction screen',
  },
  [SCREEN_IDS.CTA_SECONDARY]: {
    id: SCREEN_IDS.CTA_SECONDARY,
    name: 'CTA Secondary',
    path: '/cta/secondary',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: VIEW_STATES.CTA_INTERACTION,
    description: 'Secondary call-to-action interaction screen',
  },
  [SCREEN_IDS.ACTION_CONFIRM]: {
    id: SCREEN_IDS.ACTION_CONFIRM,
    name: 'Action Confirm',
    path: '/action/confirm',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: VIEW_STATES.ACTION_EXECUTION,
    description: 'Action confirmation dialog screen',
  },
  [SCREEN_IDS.ACTION_EXECUTE]: {
    id: SCREEN_IDS.ACTION_EXECUTE,
    name: 'Action Execute',
    path: '/action/execute',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: VIEW_STATES.ACTION_EXECUTION,
    description: 'Action execution processing screen',
  },
  [SCREEN_IDS.CONFIRMATION]: {
    id: SCREEN_IDS.CONFIRMATION,
    name: 'Confirmation',
    path: '/confirmation',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: VIEW_STATES.CONFIRMATION,
    description: 'Action completion confirmation screen',
  },
  [SCREEN_IDS.HISTORY]: {
    id: SCREEN_IDS.HISTORY,
    name: 'History',
    path: '/history',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: null,
    description: 'Query and action history screen',
  },
  [SCREEN_IDS.SETTINGS]: {
    id: SCREEN_IDS.SETTINGS,
    name: 'Settings',
    path: '/settings',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: null,
    description: 'User settings and preferences screen',
  },
  [SCREEN_IDS.HELP]: {
    id: SCREEN_IDS.HELP,
    name: 'Help',
    path: '/help',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: null,
    description: 'Help and documentation screen',
  },
  [SCREEN_IDS.NOTIFICATIONS]: {
    id: SCREEN_IDS.NOTIFICATIONS,
    name: 'Notifications',
    path: '/notifications',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: null,
    description: 'Notifications center screen',
  },
  [SCREEN_IDS.PROFILE]: {
    id: SCREEN_IDS.PROFILE,
    name: 'Profile',
    path: '/profile',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: null,
    description: 'User profile screen',
  },
  [SCREEN_IDS.DATA_SOURCE]: {
    id: SCREEN_IDS.DATA_SOURCE,
    name: 'Data Source',
    path: '/data-source',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: null,
    description: 'Data source details and status screen',
  },
  [SCREEN_IDS.EXPORT]: {
    id: SCREEN_IDS.EXPORT,
    name: 'Export',
    path: '/export',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: null,
    description: 'Data export screen',
  },
  [SCREEN_IDS.FEEDBACK]: {
    id: SCREEN_IDS.FEEDBACK,
    name: 'Feedback',
    path: '/feedback',
    requiresAuth: true,
    allowedClusters: ['operations', 'finance', 'engineering', 'sales'],
    defaultView: null,
    description: 'User feedback submission screen',
  },
  [SCREEN_IDS.ERROR]: {
    id: SCREEN_IDS.ERROR,
    name: 'Error',
    path: '/error',
    requiresAuth: false,
    allowedClusters: null,
    defaultView: null,
    description: 'Error display screen',
  },
};

/**
 * Persona-specific screen flow definitions
 * Defines the ordered list of accessible screens per persona cluster
 * @type {Object<string, Array<number>>}
 */
const PERSONA_FLOWS = {
  operations: [
    SCREEN_IDS.SPLASH,
    SCREEN_IDS.PERSONA_SELECT,
    SCREEN_IDS.DASHBOARD,
    SCREEN_IDS.QUERY_INPUT,
    SCREEN_IDS.LOADING,
    SCREEN_IDS.RESULT_OVERVIEW,
    SCREEN_IDS.RESULT_DETAIL,
    SCREEN_IDS.CTA_PRIMARY,
    SCREEN_IDS.CTA_SECONDARY,
    SCREEN_IDS.ACTION_CONFIRM,
    SCREEN_IDS.ACTION_EXECUTE,
    SCREEN_IDS.CONFIRMATION,
    SCREEN_IDS.HISTORY,
    SCREEN_IDS.SETTINGS,
    SCREEN_IDS.HELP,
    SCREEN_IDS.NOTIFICATIONS,
    SCREEN_IDS.PROFILE,
    SCREEN_IDS.DATA_SOURCE,
    SCREEN_IDS.EXPORT,
    SCREEN_IDS.FEEDBACK,
    SCREEN_IDS.ERROR,
  ],
  finance: [
    SCREEN_IDS.SPLASH,
    SCREEN_IDS.PERSONA_SELECT,
    SCREEN_IDS.DASHBOARD,
    SCREEN_IDS.QUERY_INPUT,
    SCREEN_IDS.LOADING,
    SCREEN_IDS.RESULT_OVERVIEW,
    SCREEN_IDS.RESULT_DETAIL,
    SCREEN_IDS.CTA_PRIMARY,
    SCREEN_IDS.CTA_SECONDARY,
    SCREEN_IDS.ACTION_CONFIRM,
    SCREEN_IDS.ACTION_EXECUTE,
    SCREEN_IDS.CONFIRMATION,
    SCREEN_IDS.HISTORY,
    SCREEN_IDS.SETTINGS,
    SCREEN_IDS.HELP,
    SCREEN_IDS.NOTIFICATIONS,
    SCREEN_IDS.PROFILE,
    SCREEN_IDS.DATA_SOURCE,
    SCREEN_IDS.EXPORT,
    SCREEN_IDS.FEEDBACK,
    SCREEN_IDS.ERROR,
  ],
  engineering: [
    SCREEN_IDS.SPLASH,
    SCREEN_IDS.PERSONA_SELECT,
    SCREEN_IDS.DASHBOARD,
    SCREEN_IDS.QUERY_INPUT,
    SCREEN_IDS.LOADING,
    SCREEN_IDS.RESULT_OVERVIEW,
    SCREEN_IDS.RESULT_DETAIL,
    SCREEN_IDS.CTA_PRIMARY,
    SCREEN_IDS.CTA_SECONDARY,
    SCREEN_IDS.ACTION_CONFIRM,
    SCREEN_IDS.ACTION_EXECUTE,
    SCREEN_IDS.CONFIRMATION,
    SCREEN_IDS.HISTORY,
    SCREEN_IDS.SETTINGS,
    SCREEN_IDS.HELP,
    SCREEN_IDS.NOTIFICATIONS,
    SCREEN_IDS.PROFILE,
    SCREEN_IDS.DATA_SOURCE,
    SCREEN_IDS.EXPORT,
    SCREEN_IDS.FEEDBACK,
    SCREEN_IDS.ERROR,
  ],
  sales: [
    SCREEN_IDS.SPLASH,
    SCREEN_IDS.PERSONA_SELECT,
    SCREEN_IDS.DASHBOARD,
    SCREEN_IDS.QUERY_INPUT,
    SCREEN_IDS.LOADING,
    SCREEN_IDS.RESULT_OVERVIEW,
    SCREEN_IDS.RESULT_DETAIL,
    SCREEN_IDS.CTA_PRIMARY,
    SCREEN_IDS.CTA_SECONDARY,
    SCREEN_IDS.ACTION_CONFIRM,
    SCREEN_IDS.ACTION_EXECUTE,
    SCREEN_IDS.CONFIRMATION,
    SCREEN_IDS.HISTORY,
    SCREEN_IDS.SETTINGS,
    SCREEN_IDS.HELP,
    SCREEN_IDS.NOTIFICATIONS,
    SCREEN_IDS.PROFILE,
    SCREEN_IDS.DATA_SOURCE,
    SCREEN_IDS.EXPORT,
    SCREEN_IDS.FEEDBACK,
    SCREEN_IDS.ERROR,
  ],
};

/**
 * Valid screen ID range
 * @type {{ min: number, max: number }}
 */
const SCREEN_RANGE = { min: 0, max: 20 };

/**
 * Checks if a screen ID is within the valid range
 * @param {number} screenId - The screen ID to validate
 * @returns {boolean} Whether the screen ID is valid
 */
function isValidScreenId(screenId) {
  return (
    typeof screenId === 'number' &&
    Number.isInteger(screenId) &&
    screenId >= SCREEN_RANGE.min &&
    screenId <= SCREEN_RANGE.max
  );
}

/**
 * Checks if a view state string is valid
 * @param {string|null} viewState - The view state to validate
 * @returns {boolean} Whether the view state is valid
 */
function isValidViewState(viewState) {
  if (viewState === null || viewState === undefined) {
    return true;
  }
  if (typeof viewState !== 'string') {
    return false;
  }
  const validViews = Object.values(VIEW_STATES);
  return validViews.includes(viewState);
}

/**
 * Navigates to a specified screen and view state.
 * Updates the navigation state in localStorage and logs the action.
 *
 * @param {number} screenId - The target screen ID (0-20)
 * @param {string|null} [viewState=null] - The target view state, or null for default
 * @returns {{ success: boolean, error: string|null }} Navigation result
 */
export function navigateTo(screenId, viewState = null) {
  const session = getCurrentSession();
  const userId = session ? session.userId : null;
  const persona = session ? session.persona : null;
  const cluster = session ? session.cluster : null;

  if (!isValidScreenId(screenId)) {
    logAction(ACTION_TYPES.NAVIGATE_FAIL, userId, {
      screenId,
      viewState,
      reason: 'Invalid screen ID',
    });
    return { success: false, error: 'Invalid screen ID. Must be an integer between 0 and 20.' };
  }

  if (!isValidViewState(viewState)) {
    logAction(ACTION_TYPES.NAVIGATE_FAIL, userId, {
      screenId,
      viewState,
      reason: 'Invalid view state',
    });
    return { success: false, error: 'Invalid view state.' };
  }

  const screenConfig = SCREEN_CONFIG[screenId];

  if (!screenConfig) {
    logAction(ACTION_TYPES.NAVIGATE_FAIL, userId, {
      screenId,
      viewState,
      reason: 'Screen configuration not found',
    });
    return { success: false, error: 'Screen configuration not found.' };
  }

  // Check authentication requirement
  if (screenConfig.requiresAuth && !session) {
    logAction(ACTION_TYPES.NAVIGATE_FAIL, userId, {
      screenId,
      viewState,
      reason: 'Authentication required',
    });
    return { success: false, error: 'Authentication required to access this screen.' };
  }

  // Check role-based access
  if (screenConfig.requiresAuth && screenConfig.allowedClusters) {
    if (!cluster || !screenConfig.allowedClusters.includes(cluster)) {
      logAction(ACTION_TYPES.NAVIGATE_FAIL, userId, {
        screenId,
        viewState,
        cluster,
        reason: 'Access denied for cluster',
      });
      return { success: false, error: 'Access denied. Your role does not have permission to access this screen.' };
    }
  }

  // Resolve the effective view state
  const effectiveView = viewState || screenConfig.defaultView || null;

  // Get previous navigation state for logging
  const previousState = getNavigationState();

  const navigationState = {
    currentScreen: screenId,
    currentView: effectiveView,
    persona: persona || null,
    cluster: cluster || null,
    screenName: screenConfig.name,
    path: screenConfig.path,
    timestamp: new Date().toISOString(),
  };

  const stored = setNavigationState(navigationState);

  if (!stored) {
    logAction(ACTION_TYPES.NAVIGATE_FAIL, userId, {
      screenId,
      viewState: effectiveView,
      reason: 'Failed to persist navigation state',
    });
    return { success: false, error: 'Failed to update navigation state.' };
  }

  logAction(ACTION_TYPES.NAVIGATE, userId, {
    from: previousState ? {
      screen: previousState.currentScreen,
      view: previousState.currentView,
      screenName: previousState.screenName,
    } : null,
    to: {
      screen: screenId,
      view: effectiveView,
      screenName: screenConfig.name,
      path: screenConfig.path,
    },
    persona,
    cluster,
  });

  return { success: true, error: null };
}

/**
 * Retrieves the current screen ID from navigation state.
 *
 * @returns {number} The current screen ID, or SCREEN_IDS.SPLASH (0) if not set
 */
export function getCurrentScreen() {
  const state = getNavigationState();
  if (!state || typeof state.currentScreen !== 'number') {
    return SCREEN_IDS.SPLASH;
  }
  return state.currentScreen;
}

/**
 * Retrieves the current view state from navigation state.
 *
 * @returns {string|null} The current view state, or null if not set
 */
export function getCurrentView() {
  const state = getNavigationState();
  if (!state || !state.currentView) {
    return null;
  }
  return state.currentView;
}

/**
 * Retrieves the active persona from the session or localStorage.
 *
 * @returns {string|null} The active persona ID, or null if not set
 */
export function getPersona() {
  const session = getCurrentSession();
  if (session && session.persona) {
    return session.persona;
  }

  const storedPersona = getItem(STORAGE_KEYS.SELECTED_PERSONA);
  if (storedPersona && typeof storedPersona === 'string') {
    return storedPersona;
  }

  const navState = getNavigationState();
  if (navState && navState.persona) {
    return navState.persona;
  }

  return null;
}

/**
 * Retrieves the screen configuration metadata for a given screen ID.
 *
 * @param {number} screenId - The screen ID to look up
 * @returns {Object|null} The screen configuration object, or null if not found
 */
export function getScreenConfig(screenId) {
  if (!isValidScreenId(screenId)) {
    return null;
  }
  const config = SCREEN_CONFIG[screenId];
  if (!config) {
    return null;
  }
  return { ...config };
}

/**
 * Validates whether a navigation to a given screen is allowed for a persona.
 * Checks authentication requirements and role-based access.
 *
 * @param {number} screenId - The target screen ID
 * @param {string|null} [persona=null] - The persona ID to validate against. If null, uses current session.
 * @returns {{ valid: boolean, reason: string|null }} Validation result
 */
export function validateNavigation(screenId, persona = null) {
  if (!isValidScreenId(screenId)) {
    return { valid: false, reason: 'Invalid screen ID. Must be an integer between 0 and 20.' };
  }

  const screenConfig = SCREEN_CONFIG[screenId];
  if (!screenConfig) {
    return { valid: false, reason: 'Screen configuration not found.' };
  }

  // Non-auth screens are always accessible
  if (!screenConfig.requiresAuth) {
    return { valid: true, reason: null };
  }

  // Resolve the persona and cluster
  let resolvedCluster = null;

  if (persona && typeof persona === 'string') {
    // Look up the persona in PERSONAS to get the cluster
    const personaKey = Object.keys(PERSONAS).find(
      (key) => PERSONAS[key].id === persona.toLowerCase().trim()
    );
    if (personaKey) {
      resolvedCluster = PERSONAS[personaKey].cluster;
    } else {
      // If persona is not a known persona ID, try to use it as a cluster directly
      resolvedCluster = persona.toLowerCase().trim();
    }
  } else {
    // Use current session
    const session = getCurrentSession();
    if (!session) {
      return { valid: false, reason: 'Authentication required to access this screen.' };
    }
    resolvedCluster = session.cluster;
  }

  if (!resolvedCluster) {
    return { valid: false, reason: 'Unable to determine user cluster for access validation.' };
  }

  if (screenConfig.allowedClusters && !screenConfig.allowedClusters.includes(resolvedCluster)) {
    return { valid: false, reason: 'Access denied. Your role does not have permission to access this screen.' };
  }

  return { valid: true, reason: null };
}

/**
 * Returns the ordered screen flow for a given persona.
 * The flow defines which screens are accessible and in what order.
 *
 * @param {string} persona - The persona ID (e.g., 'lukas', 'elena', 'sophie', 'james')
 * @returns {Array<number>} Ordered array of screen IDs for the persona's flow
 */
export function getPersonaFlow(persona) {
  if (!persona || typeof persona !== 'string') {
    // Return all screens as default flow
    return Object.keys(SCREEN_CONFIG).map(Number).sort((a, b) => a - b);
  }

  const normalizedPersona = persona.toLowerCase().trim();

  // Look up the persona to get the cluster
  const personaKey = Object.keys(PERSONAS).find(
    (key) => PERSONAS[key].id === normalizedPersona
  );

  let cluster = null;
  if (personaKey) {
    cluster = PERSONAS[personaKey].cluster;
  } else {
    // Try using the persona string as a cluster directly
    if (PERSONA_FLOWS[normalizedPersona]) {
      cluster = normalizedPersona;
    }
  }

  if (cluster && PERSONA_FLOWS[cluster]) {
    return [...PERSONA_FLOWS[cluster]];
  }

  // Default: return all screens
  return Object.keys(SCREEN_CONFIG).map(Number).sort((a, b) => a - b);
}

/**
 * Retrieves all screen configurations as an array.
 *
 * @returns {Array<Object>} Array of all screen configuration objects
 */
export function getAllScreenConfigs() {
  return Object.values(SCREEN_CONFIG).map((config) => ({ ...config }));
}

/**
 * Retrieves the full current navigation state from localStorage.
 *
 * @returns {Object|null} The full navigation state object, or null if not set
 */
export function getFullNavigationState() {
  return getNavigationState();
}

/**
 * Gets the screen configuration for the current screen.
 *
 * @returns {Object|null} The current screen's configuration, or null if not set
 */
export function getCurrentScreenConfig() {
  const currentScreen = getCurrentScreen();
  return getScreenConfig(currentScreen);
}

/**
 * Checks if the current screen requires authentication.
 *
 * @returns {boolean} Whether the current screen requires authentication
 */
export function currentScreenRequiresAuth() {
  const config = getCurrentScreenConfig();
  if (!config) {
    return false;
  }
  return config.requiresAuth === true;
}

/**
 * Gets the path for a given screen ID.
 *
 * @param {number} screenId - The screen ID
 * @returns {string|null} The screen path, or null if not found
 */
export function getScreenPath(screenId) {
  const config = getScreenConfig(screenId);
  if (!config) {
    return null;
  }
  return config.path;
}

/**
 * Finds a screen ID by its path.
 *
 * @param {string} path - The path to search for
 * @returns {number|null} The screen ID, or null if not found
 */
export function getScreenIdByPath(path) {
  if (!path || typeof path !== 'string') {
    return null;
  }

  const normalizedPath = path.toLowerCase().trim();

  for (const [id, config] of Object.entries(SCREEN_CONFIG)) {
    if (config.path === normalizedPath) {
      return Number(id);
    }
  }

  return null;
}

/**
 * Navigates back to the previous logical screen based on the current screen.
 * Uses a simple heuristic: go to the previous screen in the persona flow.
 *
 * @returns {{ success: boolean, error: string|null }} Navigation result
 */
export function navigateBack() {
  const currentScreen = getCurrentScreen();
  const persona = getPersona();
  const flow = getPersonaFlow(persona);

  const currentIndex = flow.indexOf(currentScreen);

  if (currentIndex <= 0) {
    // Already at the first screen or not found in flow
    return navigateTo(SCREEN_IDS.DASHBOARD);
  }

  const previousScreen = flow[currentIndex - 1];

  // Skip non-auth screens if user is authenticated
  const session = getCurrentSession();
  if (session && (previousScreen === SCREEN_IDS.SPLASH || previousScreen === SCREEN_IDS.PERSONA_SELECT)) {
    return navigateTo(SCREEN_IDS.DASHBOARD);
  }

  return navigateTo(previousScreen);
}

/**
 * Navigates to the dashboard screen.
 *
 * @returns {{ success: boolean, error: string|null }} Navigation result
 */
export function navigateToDashboard() {
  return navigateTo(SCREEN_IDS.DASHBOARD);
}

/**
 * Navigates to the query input screen.
 *
 * @param {string|null} [viewState=null] - Optional view state override
 * @returns {{ success: boolean, error: string|null }} Navigation result
 */
export function navigateToQueryInput(viewState = null) {
  return navigateTo(SCREEN_IDS.QUERY_INPUT, viewState || VIEW_STATES.QUERY_INPUT);
}

/**
 * Navigates to the error screen.
 *
 * @returns {{ success: boolean, error: string|null }} Navigation result
 */
export function navigateToError() {
  return navigateTo(SCREEN_IDS.ERROR);
}