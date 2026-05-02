/**
 * Centralized audit logging service
 * Captures 100% of user actions with timestamped entries to localStorage.
 * Supports filtering, clearing, and automatic log rotation.
 * @module auditLogService
 */

import { getItem, setItem, removeItem, isStorageAvailable } from './localStorageService.js';
import { generateId } from '../utils/helpers.js';

/**
 * localStorage key for audit logs
 * @type {string}
 */
const AUDIT_LOG_KEY = 'ask_dreeso_audit_log';

/**
 * Maximum number of audit log entries to retain before rotation
 * @type {number}
 */
const MAX_AUDIT_ENTRIES = 1000;

/**
 * Supported action types for audit logging
 * @enum {string}
 */
export const ACTION_TYPES = {
  LOGIN: 'LOGIN',
  LOGIN_FAIL: 'LOGIN_FAIL',
  LOGOUT: 'LOGOUT',
  SIGNUP: 'SIGNUP',
  SIGNUP_FAIL: 'SIGNUP_FAIL',
  NAVIGATE: 'NAVIGATE',
  NAVIGATE_FAIL: 'NAVIGATE_FAIL',
  QUERY: 'QUERY',
  QUERY_FAIL: 'QUERY_FAIL',
  ACTION_EXECUTE: 'ACTION_EXECUTE',
  ACTION_EXECUTE_FAIL: 'ACTION_EXECUTE_FAIL',
  CTA_CLICK: 'CTA_CLICK',
  PERSONA_SELECT: 'PERSONA_SELECT',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  DATA_EXPORT: 'DATA_EXPORT',
  SETTINGS_CHANGE: 'SETTINGS_CHANGE',
};

/**
 * Retrieves all audit log entries from localStorage
 * @returns {Array<Object>} Array of audit log entry objects
 */
export function getAuditLogEntries() {
  const logs = getItem(AUDIT_LOG_KEY);
  if (!Array.isArray(logs)) {
    return [];
  }
  return logs;
}

/**
 * Writes audit log entries to localStorage
 * @param {Array<Object>} entries - Array of audit log entry objects
 * @returns {boolean} Whether the operation succeeded
 */
function setAuditLogEntries(entries) {
  if (!Array.isArray(entries)) {
    return false;
  }
  return setItem(AUDIT_LOG_KEY, entries);
}

/**
 * Performs automatic log rotation, keeping only the most recent entries
 * @param {Array<Object>} entries - Current audit log entries
 * @returns {Array<Object>} Rotated entries array
 */
function rotateEntries(entries) {
  if (!Array.isArray(entries)) {
    return [];
  }
  if (entries.length > MAX_AUDIT_ENTRIES) {
    return entries.slice(entries.length - MAX_AUDIT_ENTRIES);
  }
  return entries;
}

/**
 * Logs a user action to the audit trail
 * Creates a timestamped entry and persists it to localStorage.
 * Automatically rotates logs when the maximum entry count is exceeded.
 *
 * @param {string} actionType - The type of action (use ACTION_TYPES enum)
 * @param {string|null} userId - The ID of the user performing the action, or null for anonymous actions
 * @param {Object} [details={}] - Additional details about the action
 * @returns {Object|null} The created audit log entry, or null on failure
 */
export function logAction(actionType, userId, details = {}) {
  if (!actionType || typeof actionType !== 'string') {
    console.error('auditLogService: actionType is required and must be a string.');
    return null;
  }

  if (!isStorageAvailable()) {
    console.error('auditLogService: localStorage is not available.');
    return null;
  }

  const entry = {
    id: generateId(12),
    actionType,
    userId: userId || null,
    details: details && typeof details === 'object' ? details : {},
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
  };

  try {
    const existing = getAuditLogEntries();
    existing.push(entry);
    const rotated = rotateEntries(existing);
    const success = setAuditLogEntries(rotated);

    if (!success) {
      console.error('auditLogService: Failed to persist audit log entry.');
      return null;
    }

    return entry;
  } catch (err) {
    console.error('auditLogService: Error logging action:', err);
    return null;
  }
}

/**
 * Retrieves audit log entries with optional filtering
 *
 * @param {Object} [filters={}] - Filter criteria
 * @param {string} [filters.actionType] - Filter by action type
 * @param {string} [filters.userId] - Filter by user ID
 * @param {string} [filters.startDate] - ISO date string for start of date range (inclusive)
 * @param {string} [filters.endDate] - ISO date string for end of date range (inclusive)
 * @param {number} [filters.limit] - Maximum number of entries to return
 * @param {string} [filters.sortOrder='desc'] - Sort order: 'asc' or 'desc' by timestamp
 * @returns {Array<Object>} Filtered array of audit log entry objects
 */
export function getAuditLogs(filters = {}) {
  let entries = getAuditLogEntries();

  if (!entries.length) {
    return [];
  }

  const {
    actionType,
    userId,
    startDate,
    endDate,
    limit,
    sortOrder = 'desc',
  } = filters;

  if (actionType && typeof actionType === 'string') {
    entries = entries.filter((entry) => entry.actionType === actionType);
  }

  if (userId && typeof userId === 'string') {
    entries = entries.filter((entry) => entry.userId === userId);
  }

  if (startDate && typeof startDate === 'string') {
    const startMs = new Date(startDate).getTime();
    if (!isNaN(startMs)) {
      entries = entries.filter((entry) => {
        const entryMs = entry.timestampMs || new Date(entry.timestamp).getTime();
        return entryMs >= startMs;
      });
    }
  }

  if (endDate && typeof endDate === 'string') {
    const endMs = new Date(endDate).getTime();
    if (!isNaN(endMs)) {
      entries = entries.filter((entry) => {
        const entryMs = entry.timestampMs || new Date(entry.timestamp).getTime();
        return entryMs <= endMs;
      });
    }
  }

  if (sortOrder === 'asc') {
    entries.sort((a, b) => {
      const aMs = a.timestampMs || new Date(a.timestamp).getTime();
      const bMs = b.timestampMs || new Date(b.timestamp).getTime();
      return aMs - bMs;
    });
  } else {
    entries.sort((a, b) => {
      const aMs = a.timestampMs || new Date(a.timestamp).getTime();
      const bMs = b.timestampMs || new Date(b.timestamp).getTime();
      return bMs - aMs;
    });
  }

  if (typeof limit === 'number' && limit > 0) {
    entries = entries.slice(0, limit);
  }

  return entries;
}

/**
 * Clears all audit log entries from localStorage
 * @returns {boolean} Whether the operation succeeded
 */
export function clearAuditLogs() {
  try {
    return removeItem(AUDIT_LOG_KEY);
  } catch (err) {
    console.error('auditLogService: Failed to clear audit logs:', err);
    return false;
  }
}

/**
 * Returns the total count of audit log entries
 * @returns {number} The number of stored audit log entries
 */
export function getAuditLogCount() {
  const entries = getAuditLogEntries();
  return entries.length;
}

/**
 * Retrieves the most recent audit log entries
 * @param {number} [count=10] - Number of recent entries to retrieve
 * @returns {Array<Object>} Array of the most recent audit log entries
 */
export function getRecentLogs(count = 10) {
  return getAuditLogs({ limit: count, sortOrder: 'desc' });
}

/**
 * Retrieves all audit log entries for a specific user
 * @param {string} userId - The user ID to filter by
 * @returns {Array<Object>} Array of audit log entries for the user
 */
export function getLogsByUser(userId) {
  if (!userId || typeof userId !== 'string') {
    return [];
  }
  return getAuditLogs({ userId, sortOrder: 'desc' });
}

/**
 * Retrieves all audit log entries of a specific action type
 * @param {string} actionType - The action type to filter by
 * @returns {Array<Object>} Array of audit log entries matching the action type
 */
export function getLogsByActionType(actionType) {
  if (!actionType || typeof actionType !== 'string') {
    return [];
  }
  return getAuditLogs({ actionType, sortOrder: 'desc' });
}

/**
 * Exports all audit log entries as a serializable object
 * Useful for data export functionality
 * @returns {Object} Export object containing metadata and log entries
 */
export function exportAuditLogs() {
  const entries = getAuditLogEntries();
  return {
    exportedAt: new Date().toISOString(),
    totalEntries: entries.length,
    entries,
  };
}

/**
 * Forces log rotation, trimming entries to the maximum allowed count
 * @returns {boolean} Whether the operation succeeded
 */
export function forceRotation() {
  try {
    const entries = getAuditLogEntries();
    const rotated = rotateEntries(entries);
    return setAuditLogEntries(rotated);
  } catch (err) {
    console.error('auditLogService: Failed to force rotation:', err);
    return false;
  }
}