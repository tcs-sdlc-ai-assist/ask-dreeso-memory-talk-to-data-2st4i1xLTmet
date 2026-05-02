/**
 * localStorage abstraction service layer
 * Provides safe, JSON-serialized access to all localStorage operations
 * with error handling for quota exceeded scenarios.
 * @module localStorageService
 */

import { STORAGE_KEYS } from '../utils/constants.js';

/**
 * Current data schema version for migration support
 * @type {string}
 */
const DATA_VERSION = '1.0.0';

/**
 * localStorage key for data version tracking
 * @type {string}
 */
const DATA_VERSION_KEY = 'ask_dreeso_data_version';

/**
 * localStorage key for query results
 * @type {string}
 */
const QUERY_RESULTS_KEY = 'ask_dreeso_query_results';

/**
 * localStorage key for action logs
 * @type {string}
 */
const ACTION_LOGS_KEY = 'ask_dreeso_action_logs';

/**
 * localStorage key for navigation state
 * @type {string}
 */
const NAVIGATION_STATE_KEY = 'ask_dreeso_navigation_state';

/**
 * localStorage key for user session
 * @type {string}
 */
const USER_SESSION_KEY = 'ask_dreeso_user_session';

/**
 * Maximum number of query results to retain
 * @type {number}
 */
const MAX_QUERY_RESULTS = 100;

/**
 * Maximum number of action log entries to retain
 * @type {number}
 */
const MAX_ACTION_LOGS = 1000;

/**
 * Checks if localStorage is available and functional
 * @returns {boolean} Whether localStorage is available
 */
export function isStorageAvailable() {
  try {
    const testKey = '__ask_dreeso_storage_test__';
    localStorage.setItem(testKey, 'test');
    const result = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return result === 'test';
  } catch (_err) {
    return false;
  }
}

/**
 * Retrieves an item from localStorage and parses it as JSON
 * @param {string} key - The localStorage key
 * @returns {*} The parsed value, or null if not found or on error
 */
export function getItem(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw);
  } catch (_err) {
    return null;
  }
}

/**
 * Stores a value in localStorage as a JSON string
 * @param {string} key - The localStorage key
 * @param {*} value - The value to store (will be JSON-serialized)
 * @returns {boolean} Whether the operation succeeded
 */
export function setItem(key, value) {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      console.error('localStorage quota exceeded. Attempting to free space.');
      pruneOldLogs();
      pruneQueryResults();
      try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
        return true;
      } catch (_retryErr) {
        console.error('localStorage quota exceeded even after pruning.');
        return false;
      }
    }
    console.error('Failed to set localStorage item:', err);
    return false;
  }
}

/**
 * Removes an item from localStorage
 * @param {string} key - The localStorage key to remove
 * @returns {boolean} Whether the operation succeeded
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error('Failed to remove localStorage item:', err);
    return false;
  }
}

/**
 * Retrieves the current user session from localStorage
 * @returns {Object|null} The session object or null if not found
 */
export function getSession() {
  return getItem(USER_SESSION_KEY);
}

/**
 * Stores the user session in localStorage
 * @param {Object} session - The session object to store
 * @returns {boolean} Whether the operation succeeded
 */
export function setSession(session) {
  if (!session || typeof session !== 'object') {
    return false;
  }
  return setItem(USER_SESSION_KEY, session);
}

/**
 * Clears the user session from localStorage
 * @returns {boolean} Whether the operation succeeded
 */
export function clearSession() {
  return removeItem(USER_SESSION_KEY);
}

/**
 * Retrieves the current navigation state from localStorage
 * @returns {Object|null} The navigation state object or null
 */
export function getNavigationState() {
  return getItem(NAVIGATION_STATE_KEY);
}

/**
 * Stores the navigation state in localStorage
 * @param {Object} state - The navigation state object
 * @param {number} [state.currentScreen] - Current screen index (0-20)
 * @param {string} [state.currentView] - Current view name
 * @returns {boolean} Whether the operation succeeded
 */
export function setNavigationState(state) {
  if (!state || typeof state !== 'object') {
    return false;
  }
  return setItem(NAVIGATION_STATE_KEY, state);
}

/**
 * Retrieves all stored query results from localStorage
 * @returns {Array<Object>} Array of query result objects
 */
export function getQueryResults() {
  const results = getItem(QUERY_RESULTS_KEY);
  if (!Array.isArray(results)) {
    return [];
  }
  return results;
}

/**
 * Stores query results in localStorage, replacing the existing array
 * @param {Array<Object>} results - Array of query result objects
 * @returns {boolean} Whether the operation succeeded
 */
export function setQueryResults(results) {
  if (!Array.isArray(results)) {
    return false;
  }
  const trimmed = results.length > MAX_QUERY_RESULTS
    ? results.slice(results.length - MAX_QUERY_RESULTS)
    : results;
  return setItem(QUERY_RESULTS_KEY, trimmed);
}

/**
 * Appends a single query result to the stored results array
 * @param {Object} result - The query result object to append
 * @returns {boolean} Whether the operation succeeded
 */
export function addQueryResult(result) {
  if (!result || typeof result !== 'object') {
    return false;
  }
  const existing = getQueryResults();
  existing.push(result);
  return setQueryResults(existing);
}

/**
 * Prunes query results to keep only the last MAX_QUERY_RESULTS entries
 * @returns {boolean} Whether the operation succeeded
 */
export function pruneQueryResults() {
  try {
    const results = getQueryResults();
    if (results.length > MAX_QUERY_RESULTS) {
      const pruned = results.slice(results.length - MAX_QUERY_RESULTS);
      return setItem(QUERY_RESULTS_KEY, pruned);
    }
    return true;
  } catch (err) {
    console.error('Failed to prune query results:', err);
    return false;
  }
}

/**
 * Retrieves all stored action logs from localStorage
 * @returns {Array<Object>} Array of action log entry objects
 */
export function getActionLogs() {
  const logs = getItem(ACTION_LOGS_KEY);
  if (!Array.isArray(logs)) {
    return [];
  }
  return logs;
}

/**
 * Appends a single action log entry to the stored logs array
 * Automatically prunes if the array exceeds MAX_ACTION_LOGS
 * @param {Object} logEntry - The action log entry to append
 * @param {string} logEntry.action - The action name
 * @param {*} [logEntry.context] - The action context
 * @param {string} logEntry.timestamp - ISO timestamp string
 * @param {string} logEntry.status - The action status
 * @returns {boolean} Whether the operation succeeded
 */
export function addActionLog(logEntry) {
  if (!logEntry || typeof logEntry !== 'object') {
    return false;
  }
  const existing = getActionLogs();
  existing.push(logEntry);
  const trimmed = existing.length > MAX_ACTION_LOGS
    ? existing.slice(existing.length - MAX_ACTION_LOGS)
    : existing;
  return setItem(ACTION_LOGS_KEY, trimmed);
}

/**
 * Prunes action logs to keep only the last MAX_ACTION_LOGS entries
 * @returns {boolean} Whether the operation succeeded
 */
export function pruneOldLogs() {
  try {
    const logs = getActionLogs();
    if (logs.length > MAX_ACTION_LOGS) {
      const pruned = logs.slice(logs.length - MAX_ACTION_LOGS);
      return setItem(ACTION_LOGS_KEY, pruned);
    }
    return true;
  } catch (err) {
    console.error('Failed to prune action logs:', err);
    return false;
  }
}

/**
 * Retrieves all application data from localStorage for export
 * @returns {Object} An object containing all stored application data
 */
export function getAllData() {
  return {
    dataVersion: getItem(DATA_VERSION_KEY) || DATA_VERSION,
    session: getSession(),
    navigationState: getNavigationState(),
    queryResults: getQueryResults(),
    actionLogs: getActionLogs(),
    selectedPersona: getItem(STORAGE_KEYS.SELECTED_PERSONA),
    queryHistory: getItem(STORAGE_KEYS.QUERY_HISTORY),
    userPreferences: getItem(STORAGE_KEYS.USER_PREFERENCES),
    theme: getItem(STORAGE_KEYS.THEME),
    lastSession: getItem(STORAGE_KEYS.LAST_SESSION),
    onboardingComplete: getItem(STORAGE_KEYS.ONBOARDING_COMPLETE),
  };
}

/**
 * Clears all application data from localStorage
 * @returns {boolean} Whether the operation succeeded
 */
export function clearAllData() {
  try {
    removeItem(USER_SESSION_KEY);
    removeItem(NAVIGATION_STATE_KEY);
    removeItem(QUERY_RESULTS_KEY);
    removeItem(ACTION_LOGS_KEY);
    removeItem(DATA_VERSION_KEY);
    removeItem(STORAGE_KEYS.SELECTED_PERSONA);
    removeItem(STORAGE_KEYS.QUERY_HISTORY);
    removeItem(STORAGE_KEYS.USER_PREFERENCES);
    removeItem(STORAGE_KEYS.THEME);
    removeItem(STORAGE_KEYS.LAST_SESSION);
    removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return true;
  } catch (err) {
    console.error('Failed to clear all data:', err);
    return false;
  }
}

/**
 * Performs data migration if the stored version does not match the current version
 * @param {string} [targetVersion] - The target version to migrate to (defaults to DATA_VERSION)
 * @returns {boolean} Whether the migration succeeded or was not needed
 */
export function migrateData(targetVersion) {
  try {
    const version = targetVersion || DATA_VERSION;
    const storedVersion = getItem(DATA_VERSION_KEY);

    if (storedVersion === version) {
      return true;
    }

    if (storedVersion === null) {
      setItem(DATA_VERSION_KEY, version);
      return true;
    }

    // Future migrations can be added here based on version comparisons
    // For now, set the version to current
    setItem(DATA_VERSION_KEY, version);
    return true;
  } catch (err) {
    console.error('Failed to migrate data:', err);
    return false;
  }
}

/**
 * Initializes the localStorage service, checking availability and running migrations
 * @returns {boolean} Whether initialization succeeded
 */
export function initialize() {
  if (!isStorageAvailable()) {
    console.error('localStorage is not available.');
    return false;
  }
  return migrateData();
}