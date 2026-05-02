/**
 * Simulated enterprise action execution service
 * Executes actions in SAP, Procore, Salesforce, Primavera (simulated).
 * Returns { success, actionId, system, details, timestamp }.
 * Logs all actions to localStorage via auditLogService.
 * Supports action types: APPROVE, REJECT, ESCALATE, ASSIGN, UPDATE, CREATE.
 * Includes simulateExecution() with realistic delay.
 * @module actionExecutor
 */

import { logAction, ACTION_TYPES } from './auditLogService.js';
import { getCurrentSession } from './authService.js';
import { addActionLog } from './localStorageService.js';
import { getActionTemplates } from '../data/mockData.js';
import { generateId } from '../utils/helpers.js';
import { SYSTEM_SOURCES, ANIMATION_DURATIONS } from '../utils/constants.js';

/**
 * Supported action types for execution
 * @enum {string}
 */
export const EXECUTION_ACTION_TYPES = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  ESCALATE: 'ESCALATE',
  ASSIGN: 'ASSIGN',
  UPDATE: 'UPDATE',
  CREATE: 'CREATE',
};

/**
 * Minimum simulated execution delay in milliseconds
 * @type {number}
 */
const MIN_EXECUTION_DELAY_MS = ANIMATION_DURATIONS.SLOW;

/**
 * Maximum simulated execution delay in milliseconds
 * @type {number}
 */
const MAX_EXECUTION_DELAY_MS = ANIMATION_DURATIONS.LOADING_MIN;

/**
 * Maps system IDs to their display labels
 * @type {Object<string, string>}
 */
const SYSTEM_LABELS = {
  [SYSTEM_SOURCES.SAP.id]: SYSTEM_SOURCES.SAP.label,
  [SYSTEM_SOURCES.PROCORE.id]: SYSTEM_SOURCES.PROCORE.label,
  [SYSTEM_SOURCES.SALESFORCE.id]: SYSTEM_SOURCES.SALESFORCE.label,
  [SYSTEM_SOURCES.PRIMAVERA.id]: SYSTEM_SOURCES.PRIMAVERA.label,
};

/**
 * Default system for actions when no system is specified
 * @type {string}
 */
const DEFAULT_SYSTEM = SYSTEM_SOURCES.SAP.id;

/**
 * Simulates a realistic async execution delay
 * @param {number} [minMs=MIN_EXECUTION_DELAY_MS] - Minimum delay in milliseconds
 * @param {number} [maxMs=MAX_EXECUTION_DELAY_MS] - Maximum delay in milliseconds
 * @returns {Promise<number>} Resolves with the actual delay duration in milliseconds
 */
export function simulateExecution(minMs = MIN_EXECUTION_DELAY_MS, maxMs = MAX_EXECUTION_DELAY_MS) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(delay);
    }, delay);
  });
}

/**
 * Validates an action type string
 * @param {string} actionType - The action type to validate
 * @returns {{ valid: boolean, error: string|null }} Validation result
 */
function validateActionType(actionType) {
  if (!actionType || typeof actionType !== 'string') {
    return { valid: false, error: 'Action type is required and must be a string.' };
  }

  const normalized = actionType.toUpperCase().trim();
  const validTypes = Object.values(EXECUTION_ACTION_TYPES);

  if (!validTypes.includes(normalized)) {
    return {
      valid: false,
      error: `Invalid action type: "${actionType}". Must be one of: ${validTypes.join(', ')}.`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Validates the execution context object
 * @param {Object} context - The context object to validate
 * @returns {{ valid: boolean, error: string|null }} Validation result
 */
function validateContext(context) {
  if (!context || typeof context !== 'object') {
    return { valid: false, error: 'Context is required and must be an object.' };
  }

  return { valid: true, error: null };
}

/**
 * Validates a persona string
 * @param {string} persona - The persona identifier to validate
 * @returns {{ valid: boolean, error: string|null }} Validation result
 */
function validatePersona(persona) {
  if (!persona || typeof persona !== 'string') {
    return { valid: false, error: 'Persona is required and must be a string.' };
  }

  const trimmed = persona.trim().toLowerCase();
  const validPersonas = ['lukas', 'elena', 'sophie', 'james'];

  if (!validPersonas.includes(trimmed)) {
    return {
      valid: false,
      error: `Invalid persona: "${persona}". Must be one of: ${validPersonas.join(', ')}.`,
    };
  }

  return { valid: true, error: null };
}

/**
 * Resolves the target system for an action based on context and action type
 * @param {Object} context - The action context
 * @param {string} actionType - The action type
 * @returns {string} The resolved system ID
 */
function resolveSystem(context, actionType) {
  if (context && context.system && typeof context.system === 'string') {
    const normalizedSystem = context.system.toLowerCase().trim();
    if (SYSTEM_LABELS[normalizedSystem]) {
      return normalizedSystem;
    }
  }

  if (context && context.systemId && typeof context.systemId === 'string') {
    const normalizedSystemId = context.systemId.toLowerCase().trim();
    if (SYSTEM_LABELS[normalizedSystemId]) {
      return normalizedSystemId;
    }
  }

  // Infer system from action type
  const normalizedAction = actionType.toUpperCase().trim();
  switch (normalizedAction) {
    case EXECUTION_ACTION_TYPES.APPROVE:
    case EXECUTION_ACTION_TYPES.REJECT:
      return SYSTEM_SOURCES.SAP.id;
    case EXECUTION_ACTION_TYPES.CREATE:
      return SYSTEM_SOURCES.PROCORE.id;
    case EXECUTION_ACTION_TYPES.UPDATE:
      return SYSTEM_SOURCES.SALESFORCE.id;
    case EXECUTION_ACTION_TYPES.ESCALATE:
    case EXECUTION_ACTION_TYPES.ASSIGN:
      return SYSTEM_SOURCES.PRIMAVERA.id;
    default:
      return DEFAULT_SYSTEM;
  }
}

/**
 * Generates a human-readable success message for an action
 * @param {string} actionType - The action type
 * @param {string} systemId - The target system ID
 * @returns {string} The success message
 */
function generateSuccessMessage(actionType, systemId) {
  const systemLabel = SYSTEM_LABELS[systemId] || systemId;
  const normalizedAction = actionType.toUpperCase().trim();

  const messages = {
    [EXECUTION_ACTION_TYPES.APPROVE]: `Action approved successfully in ${systemLabel}.`,
    [EXECUTION_ACTION_TYPES.REJECT]: `Action rejected successfully in ${systemLabel}.`,
    [EXECUTION_ACTION_TYPES.ESCALATE]: `Action escalated successfully in ${systemLabel}.`,
    [EXECUTION_ACTION_TYPES.ASSIGN]: `Assignment completed successfully in ${systemLabel}.`,
    [EXECUTION_ACTION_TYPES.UPDATE]: `Record updated successfully in ${systemLabel}.`,
    [EXECUTION_ACTION_TYPES.CREATE]: `Record created successfully in ${systemLabel}.`,
  };

  return messages[normalizedAction] || `Action executed successfully in ${systemLabel}.`;
}

/**
 * Builds a successful action result object
 * @param {string} actionType - The action type
 * @param {Object} context - The action context
 * @param {string} systemId - The target system ID
 * @param {number} delayMs - The simulated execution delay
 * @param {string} persona - The persona identifier
 * @returns {Object} The action result object
 */
function buildSuccessResult(actionType, context, systemId, delayMs, persona) {
  const actionId = `action-${generateId(12)}`;
  const timestamp = new Date().toISOString();
  const systemLabel = SYSTEM_LABELS[systemId] || systemId;

  return {
    success: true,
    actionId,
    actionType: actionType.toUpperCase().trim(),
    system: systemId,
    systemLabel,
    details: {
      message: generateSuccessMessage(actionType, systemId),
      context: { ...context },
      persona,
      executionTimeMs: delayMs,
    },
    timestamp,
    timestampMs: Date.now(),
    status: 'success',
  };
}

/**
 * Builds an error action result object
 * @param {string} actionType - The action type
 * @param {Object|null} context - The action context
 * @param {string} errorCode - The error code
 * @param {string} message - The error message
 * @returns {Object} The error result object
 */
function buildErrorResult(actionType, context, errorCode, message) {
  return {
    success: false,
    actionId: null,
    actionType: actionType || null,
    system: null,
    systemLabel: null,
    details: {
      message,
      context: context && typeof context === 'object' ? { ...context } : {},
      persona: null,
      executionTimeMs: 0,
    },
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    status: 'error',
    errorCode,
    message,
  };
}

/**
 * Executes a simulated enterprise action.
 * Validates inputs, simulates execution delay, logs the action,
 * and returns a structured result.
 *
 * @param {string} actionType - The type of action to execute (APPROVE, REJECT, ESCALATE, ASSIGN, UPDATE, CREATE)
 * @param {Object} context - The action context containing relevant data
 * @param {string} [context.system] - Optional target system ID
 * @param {string} [context.systemId] - Optional target system ID (alternative)
 * @param {string} [context.projectId] - Optional project identifier
 * @param {string} [context.title] - Optional action title
 * @param {string} [context.description] - Optional action description
 * @param {number} [context.amount] - Optional monetary amount
 * @param {string} [context.notes] - Optional notes
 * @param {string} persona - The persona identifier (e.g., 'lukas', 'elena', 'sophie', 'james')
 * @returns {Promise<Object>} The action result object containing:
 *   - {boolean} success - Whether the action succeeded
 *   - {string|null} actionId - Unique action identifier
 *   - {string|null} actionType - The executed action type
 *   - {string|null} system - The target system ID
 *   - {string|null} systemLabel - The target system display label
 *   - {Object} details - Action details including message, context, persona, executionTimeMs
 *   - {string} timestamp - ISO timestamp of execution
 *   - {string} status - 'success' or 'error'
 *   - {string} [errorCode] - Error code if status is 'error'
 *   - {string} [message] - Error message if status is 'error'
 */
export async function executeAction(actionType, context, persona) {
  const session = getCurrentSession();
  const userId = session ? session.userId : null;

  // Validate action type
  const actionValidation = validateActionType(actionType);
  if (!actionValidation.valid) {
    const errorResult = buildErrorResult(actionType, context, 'INVALID_ACTION_TYPE', actionValidation.error);

    logAction(ACTION_TYPES.ACTION_EXECUTE_FAIL, userId, {
      actionType,
      context,
      persona,
      reason: actionValidation.error,
    });

    return errorResult;
  }

  // Validate context
  const contextValidation = validateContext(context);
  if (!contextValidation.valid) {
    const errorResult = buildErrorResult(actionType, context, 'INVALID_CONTEXT', contextValidation.error);

    logAction(ACTION_TYPES.ACTION_EXECUTE_FAIL, userId, {
      actionType,
      context,
      persona,
      reason: contextValidation.error,
    });

    return errorResult;
  }

  // Validate persona
  const personaValidation = validatePersona(persona);
  if (!personaValidation.valid) {
    const errorResult = buildErrorResult(actionType, context, 'INVALID_PERSONA', personaValidation.error);

    logAction(ACTION_TYPES.ACTION_EXECUTE_FAIL, userId, {
      actionType,
      context,
      persona,
      reason: personaValidation.error,
    });

    return errorResult;
  }

  const normalizedPersona = persona.trim().toLowerCase();
  const normalizedActionType = actionType.toUpperCase().trim();

  try {
    // Resolve target system
    const systemId = resolveSystem(context, normalizedActionType);

    // Simulate realistic execution delay
    const delayMs = await simulateExecution();

    // Build success result
    const result = buildSuccessResult(normalizedActionType, context, systemId, delayMs, normalizedPersona);

    // Persist action log to localStorage
    const actionLogEntry = {
      id: result.actionId,
      action: normalizedActionType,
      system: systemId,
      systemLabel: result.systemLabel,
      context: context && typeof context === 'object' ? { ...context } : {},
      persona: normalizedPersona,
      timestamp: result.timestamp,
      timestampMs: result.timestampMs,
      executionTimeMs: delayMs,
      status: 'success',
    };

    const stored = addActionLog(actionLogEntry);
    if (!stored) {
      console.warn('actionExecutor: Failed to persist action log to localStorage.');
    }

    // Log the action via audit log service
    logAction(ACTION_TYPES.ACTION_EXECUTE, userId, {
      actionId: result.actionId,
      actionType: normalizedActionType,
      system: systemId,
      systemLabel: result.systemLabel,
      persona: normalizedPersona,
      context: context && typeof context === 'object' ? { ...context } : {},
      executionTimeMs: delayMs,
      status: 'success',
    });

    return result;
  } catch (err) {
    const errorResult = buildErrorResult(
      normalizedActionType,
      context,
      'ACTION_EXECUTION_ERROR',
      'An error occurred while executing the action. Please try again.'
    );

    logAction(ACTION_TYPES.ACTION_EXECUTE_FAIL, userId, {
      actionType: normalizedActionType,
      context,
      persona: normalizedPersona,
      reason: err.message,
    });

    console.error('actionExecutor: Error executing action:', err);

    return errorResult;
  }
}

/**
 * Executes an action from a predefined action template.
 * Looks up the template by ID, validates access for the persona's cluster,
 * and executes the action.
 *
 * @param {string} templateId - The action template ID (e.g., 'action-approve-budget')
 * @param {Object} fieldValues - The field values for the action template
 * @param {string} persona - The persona identifier
 * @returns {Promise<Object>} The action result object
 */
export async function executeActionFromTemplate(templateId, fieldValues, persona) {
  const session = getCurrentSession();
  const userId = session ? session.userId : null;

  if (!templateId || typeof templateId !== 'string') {
    const errorResult = buildErrorResult(null, fieldValues, 'INVALID_TEMPLATE_ID', 'Template ID is required.');

    logAction(ACTION_TYPES.ACTION_EXECUTE_FAIL, userId, {
      templateId,
      persona,
      reason: 'Template ID is required.',
    });

    return errorResult;
  }

  // Validate persona
  const personaValidation = validatePersona(persona);
  if (!personaValidation.valid) {
    const errorResult = buildErrorResult(null, fieldValues, 'INVALID_PERSONA', personaValidation.error);

    logAction(ACTION_TYPES.ACTION_EXECUTE_FAIL, userId, {
      templateId,
      persona,
      reason: personaValidation.error,
    });

    return errorResult;
  }

  const normalizedPersona = persona.trim().toLowerCase();

  // Resolve cluster from session or persona
  const cluster = session ? session.cluster : resolveClusterFromPersona(normalizedPersona);

  if (!cluster) {
    const errorResult = buildErrorResult(null, fieldValues, 'INVALID_CLUSTER', 'Unable to determine user cluster.');

    logAction(ACTION_TYPES.ACTION_EXECUTE_FAIL, userId, {
      templateId,
      persona: normalizedPersona,
      reason: 'Unable to determine user cluster.',
    });

    return errorResult;
  }

  // Get matching templates
  const templates = getActionTemplates(cluster, [templateId]);

  if (!templates || templates.length === 0) {
    const errorResult = buildErrorResult(
      null,
      fieldValues,
      'TEMPLATE_NOT_FOUND',
      `Action template "${templateId}" not found or not authorized for your role.`
    );

    logAction(ACTION_TYPES.ACTION_EXECUTE_FAIL, userId, {
      templateId,
      persona: normalizedPersona,
      cluster,
      reason: 'Template not found or not authorized.',
    });

    return errorResult;
  }

  const template = templates[0];

  // Validate required fields
  if (template.fields && Array.isArray(template.fields)) {
    for (const field of template.fields) {
      if (field.required && (!fieldValues || fieldValues[field.name] === undefined || fieldValues[field.name] === '')) {
        const errorResult = buildErrorResult(
          null,
          fieldValues,
          'MISSING_REQUIRED_FIELD',
          `Required field "${field.label}" is missing.`
        );

        logAction(ACTION_TYPES.ACTION_EXECUTE_FAIL, userId, {
          templateId,
          persona: normalizedPersona,
          reason: `Missing required field: ${field.name}`,
        });

        return errorResult;
      }
    }
  }

  // Determine action type from template name
  const actionType = inferActionTypeFromTemplate(template);

  // Build context from template and field values
  const context = {
    templateId: template.id,
    templateName: template.name,
    system: template.system,
    systemLabel: template.systemLabel,
    ...((fieldValues && typeof fieldValues === 'object') ? fieldValues : {}),
  };

  return executeAction(actionType, context, normalizedPersona);
}

/**
 * Infers an action type from a template object
 * @param {Object} template - The action template
 * @returns {string} The inferred action type
 */
function inferActionTypeFromTemplate(template) {
  if (!template || !template.name || typeof template.name !== 'string') {
    return EXECUTION_ACTION_TYPES.UPDATE;
  }

  const name = template.name.toLowerCase();

  if (name.includes('approve')) {
    return EXECUTION_ACTION_TYPES.APPROVE;
  }
  if (name.includes('reject')) {
    return EXECUTION_ACTION_TYPES.REJECT;
  }
  if (name.includes('create') || name.includes('schedule')) {
    return EXECUTION_ACTION_TYPES.CREATE;
  }
  if (name.includes('assign')) {
    return EXECUTION_ACTION_TYPES.ASSIGN;
  }
  if (name.includes('escalate')) {
    return EXECUTION_ACTION_TYPES.ESCALATE;
  }
  if (name.includes('update') || name.includes('resolve') || name.includes('export')) {
    return EXECUTION_ACTION_TYPES.UPDATE;
  }

  return EXECUTION_ACTION_TYPES.UPDATE;
}

/**
 * Resolves a cluster from a persona identifier
 * @param {string} persona - The persona identifier
 * @returns {string|null} The cluster string or null
 */
function resolveClusterFromPersona(persona) {
  if (!persona || typeof persona !== 'string') {
    return null;
  }

  const clusterMap = {
    lukas: 'operations',
    elena: 'finance',
    sophie: 'engineering',
    james: 'sales',
  };

  return clusterMap[persona.toLowerCase().trim()] || null;
}

/**
 * Gets available action types as an array
 * @returns {Array<string>} Array of valid action type strings
 */
export function getAvailableActionTypes() {
  return Object.values(EXECUTION_ACTION_TYPES);
}

/**
 * Gets available action templates for a persona
 * @param {string} persona - The persona identifier
 * @returns {Array<Object>} Array of action template objects
 */
export function getAvailableActions(persona) {
  if (!persona || typeof persona !== 'string') {
    return [];
  }

  const cluster = resolveClusterFromPersona(persona);
  if (!cluster) {
    return [];
  }

  return getActionTemplates(cluster);
}

/**
 * Gets available action templates for a persona filtered by specific IDs
 * @param {string} persona - The persona identifier
 * @param {Array<string>} actionIds - Array of action template IDs to filter
 * @returns {Array<Object>} Array of matching action template objects
 */
export function getAvailableActionsById(persona, actionIds) {
  if (!persona || typeof persona !== 'string') {
    return [];
  }

  if (!Array.isArray(actionIds) || actionIds.length === 0) {
    return getAvailableActions(persona);
  }

  const cluster = resolveClusterFromPersona(persona);
  if (!cluster) {
    return [];
  }

  return getActionTemplates(cluster, actionIds);
}

/**
 * Checks if an action type is valid
 * @param {string} actionType - The action type to check
 * @returns {boolean} Whether the action type is valid
 */
export function isValidActionType(actionType) {
  if (!actionType || typeof actionType !== 'string') {
    return false;
  }
  return Object.values(EXECUTION_ACTION_TYPES).includes(actionType.toUpperCase().trim());
}

/**
 * Checks if a persona has access to a specific action template
 * @param {string} persona - The persona identifier
 * @param {string} templateId - The action template ID
 * @returns {boolean} Whether the persona has access
 */
export function hasActionAccess(persona, templateId) {
  if (!persona || typeof persona !== 'string') {
    return false;
  }

  if (!templateId || typeof templateId !== 'string') {
    return false;
  }

  const cluster = resolveClusterFromPersona(persona);
  if (!cluster) {
    return false;
  }

  const templates = getActionTemplates(cluster, [templateId]);
  return Array.isArray(templates) && templates.length > 0;
}