/**
 * Natural language query interpretation and mock data retrieval engine
 * Executes queries by matching against predefined patterns in mockData,
 * returns structured output, supports multi-system orchestration,
 * and stores results in localStorage.
 * @module queryEngine
 */

import {
  findQueryResponse,
  getCTABubbles,
  getSourceIndicators,
  DEFAULT_QUERY_RESPONSE,
} from '../data/mockData.js';
import { addQueryResult } from './localStorageService.js';
import { logAction, ACTION_TYPES } from './auditLogService.js';
import { getCurrentSession } from './authService.js';
import { generateId } from '../utils/helpers.js';
import { ANIMATION_DURATIONS } from '../utils/constants.js';

/**
 * Maximum allowed query length
 * @type {number}
 */
const MAX_QUERY_LENGTH = 256;

/**
 * Minimum simulated delay in milliseconds
 * @type {number}
 */
const MIN_DELAY_MS = ANIMATION_DURATIONS.LOADING_MIN;

/**
 * Maximum simulated delay in milliseconds
 * @type {number}
 */
const MAX_DELAY_MS = ANIMATION_DURATIONS.LOADING_MAX;

/**
 * Simulates a realistic async delay between MIN_DELAY_MS and MAX_DELAY_MS
 * @param {number} [minMs=MIN_DELAY_MS] - Minimum delay in milliseconds
 * @param {number} [maxMs=MAX_DELAY_MS] - Maximum delay in milliseconds
 * @returns {Promise<number>} Resolves with the actual delay duration in milliseconds
 */
export function simulateDelay(minMs = MIN_DELAY_MS, maxMs = MAX_DELAY_MS) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(delay);
    }, delay);
  });
}

/**
 * Validates a query string against constraints
 * @param {string} query - The query string to validate
 * @returns {{ valid: boolean, error: string|null }} Validation result
 */
function validateQuery(query) {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query cannot be empty.' };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Query cannot be empty.' };
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return { valid: false, error: `Query must be ${MAX_QUERY_LENGTH} characters or fewer.` };
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
    return { valid: false, error: 'Persona is required.' };
  }

  const trimmed = persona.trim().toLowerCase();

  const validPersonas = ['lukas', 'elena', 'sophie', 'james'];
  if (!validPersonas.includes(trimmed)) {
    return { valid: false, error: `Invalid persona: "${persona}". Must be one of: ${validPersonas.join(', ')}.` };
  }

  return { valid: true, error: null };
}

/**
 * Builds a structured query result object from a mock data response
 * @param {string} query - The original query text
 * @param {string} persona - The persona identifier
 * @param {Object} mockResponse - The matched mock data response
 * @param {number} delayMs - The simulated delay duration
 * @returns {Object} The structured query result
 */
function buildQueryResult(query, persona, mockResponse, delayMs) {
  const sourceIndicators = getSourceIndicators(mockResponse.sources || []);
  const ctaBubbles = getCTABubbles(mockResponse.ctaContext || '');

  return {
    id: generateId(16),
    query: query.trim(),
    persona: persona.trim().toLowerCase(),
    outputType: mockResponse.resultType || 'kpi',
    title: mockResponse.title || 'Query Result',
    summary: mockResponse.summary || '',
    data: mockResponse.data || [],
    sources: sourceIndicators,
    sourceIds: mockResponse.sources || [],
    ctaBubbles: ctaBubbles,
    ctaContext: mockResponse.ctaContext || null,
    actions: mockResponse.actions || [],
    cluster: mockResponse.cluster || null,
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    responseTimeMs: delayMs,
    status: 'success',
  };
}

/**
 * Builds an error result object
 * @param {string} query - The original query text
 * @param {string|null} persona - The persona identifier
 * @param {string} errorCode - The error code
 * @param {string} message - The error message
 * @returns {Object} The error result object
 */
function buildErrorResult(query, persona, errorCode, message) {
  return {
    id: generateId(16),
    query: query || '',
    persona: persona || null,
    outputType: 'error',
    title: 'Query Error',
    summary: message,
    data: [],
    sources: [],
    sourceIds: [],
    ctaBubbles: [],
    ctaContext: null,
    actions: [],
    cluster: null,
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    responseTimeMs: 0,
    status: 'error',
    errorCode,
    message,
  };
}

/**
 * Executes a natural language query against mock data for a given persona.
 * Interprets the query by matching against predefined patterns, simulates
 * a realistic async delay, and returns structured output.
 *
 * @param {string} queryText - The natural language query string
 * @param {string} persona - The persona identifier (e.g., 'lukas', 'elena', 'sophie', 'james')
 * @returns {Promise<Object>} The structured query result object containing:
 *   - {string} outputType - Result type ('table', 'kpi', 'forecast', 'error')
 *   - {Array} data - The result data array
 *   - {Array} sources - Source indicator objects
 *   - {Array} ctaBubbles - Contextual CTA bubble objects
 *   - {string} timestamp - ISO timestamp of the query execution
 *   - {string} status - 'success' or 'error'
 *   - {string} [errorCode] - Error code if status is 'error'
 *   - {string} [message] - Error message if status is 'error'
 */
export async function executeQuery(queryText, persona) {
  const session = getCurrentSession();
  const userId = session ? session.userId : null;

  // Validate query
  const queryValidation = validateQuery(queryText);
  if (!queryValidation.valid) {
    const errorResult = buildErrorResult(queryText, persona, 'INVALID_QUERY', queryValidation.error);

    logAction(ACTION_TYPES.QUERY_FAIL, userId, {
      query: queryText,
      persona,
      reason: queryValidation.error,
    });

    return errorResult;
  }

  // Validate persona
  const personaValidation = validatePersona(persona);
  if (!personaValidation.valid) {
    const errorResult = buildErrorResult(queryText, persona, 'INVALID_PERSONA', personaValidation.error);

    logAction(ACTION_TYPES.QUERY_FAIL, userId, {
      query: queryText,
      persona,
      reason: personaValidation.error,
    });

    return errorResult;
  }

  const normalizedPersona = persona.trim().toLowerCase();

  try {
    // Simulate realistic async delay
    const delayMs = await simulateDelay();

    // Find matching mock response
    const mockResponse = findQueryResponse(queryText, normalizedPersona);

    // Build structured result
    const result = buildQueryResult(queryText, normalizedPersona, mockResponse, delayMs);

    // Persist result to localStorage
    const stored = addQueryResult(result);
    if (!stored) {
      console.warn('queryEngine: Failed to persist query result to localStorage.');
    }

    // Log the query action
    logAction(ACTION_TYPES.QUERY, userId, {
      query: queryText.trim(),
      persona: normalizedPersona,
      resultId: result.id,
      outputType: result.outputType,
      title: result.title,
      sourceCount: result.sources.length,
      ctaCount: result.ctaBubbles.length,
      responseTimeMs: delayMs,
    });

    return result;
  } catch (err) {
    const errorResult = buildErrorResult(
      queryText,
      normalizedPersona,
      'QUERY_EXECUTION_ERROR',
      'An error occurred while processing your query. Please try again.'
    );

    logAction(ACTION_TYPES.QUERY_FAIL, userId, {
      query: queryText,
      persona: normalizedPersona,
      reason: err.message,
    });

    console.error('queryEngine: Error executing query:', err);

    return errorResult;
  }
}

/**
 * Executes a query without simulated delay (for CTA follow-up queries).
 * Useful when the user clicks a CTA bubble and expects a faster response.
 *
 * @param {string} queryText - The natural language query string
 * @param {string} persona - The persona identifier
 * @returns {Promise<Object>} The structured query result object
 */
export async function executeFollowUpQuery(queryText, persona) {
  const session = getCurrentSession();
  const userId = session ? session.userId : null;

  // Validate query
  const queryValidation = validateQuery(queryText);
  if (!queryValidation.valid) {
    const errorResult = buildErrorResult(queryText, persona, 'INVALID_QUERY', queryValidation.error);

    logAction(ACTION_TYPES.QUERY_FAIL, userId, {
      query: queryText,
      persona,
      reason: queryValidation.error,
      isFollowUp: true,
    });

    return errorResult;
  }

  // Validate persona
  const personaValidation = validatePersona(persona);
  if (!personaValidation.valid) {
    const errorResult = buildErrorResult(queryText, persona, 'INVALID_PERSONA', personaValidation.error);

    logAction(ACTION_TYPES.QUERY_FAIL, userId, {
      query: queryText,
      persona,
      reason: personaValidation.error,
      isFollowUp: true,
    });

    return errorResult;
  }

  const normalizedPersona = persona.trim().toLowerCase();

  try {
    // Shorter delay for follow-up queries
    const delayMs = await simulateDelay(
      ANIMATION_DURATIONS.SLOW,
      ANIMATION_DURATIONS.LOADING_MIN
    );

    // Find matching mock response
    const mockResponse = findQueryResponse(queryText, normalizedPersona);

    // Build structured result
    const result = buildQueryResult(queryText, normalizedPersona, mockResponse, delayMs);

    // Persist result to localStorage
    const stored = addQueryResult(result);
    if (!stored) {
      console.warn('queryEngine: Failed to persist follow-up query result to localStorage.');
    }

    // Log the query action
    logAction(ACTION_TYPES.QUERY, userId, {
      query: queryText.trim(),
      persona: normalizedPersona,
      resultId: result.id,
      outputType: result.outputType,
      title: result.title,
      sourceCount: result.sources.length,
      ctaCount: result.ctaBubbles.length,
      responseTimeMs: delayMs,
      isFollowUp: true,
    });

    return result;
  } catch (err) {
    const errorResult = buildErrorResult(
      queryText,
      normalizedPersona,
      'QUERY_EXECUTION_ERROR',
      'An error occurred while processing your follow-up query. Please try again.'
    );

    logAction(ACTION_TYPES.QUERY_FAIL, userId, {
      query: queryText,
      persona: normalizedPersona,
      reason: err.message,
      isFollowUp: true,
    });

    console.error('queryEngine: Error executing follow-up query:', err);

    return errorResult;
  }
}

/**
 * Retrieves the default query response for a persona.
 * Useful for showing initial/fallback data on the dashboard.
 *
 * @param {string} persona - The persona identifier
 * @returns {Object} The default query result object
 */
export function getDefaultResult(persona) {
  const normalizedPersona = persona && typeof persona === 'string'
    ? persona.trim().toLowerCase()
    : null;

  const mockResponse = { ...DEFAULT_QUERY_RESPONSE };
  const sourceIndicators = getSourceIndicators(mockResponse.sources || []);
  const ctaBubbles = getCTABubbles(mockResponse.ctaContext || '');

  return {
    id: generateId(16),
    query: '',
    persona: normalizedPersona,
    outputType: mockResponse.resultType || 'kpi',
    title: mockResponse.title || 'General Analytics Overview',
    summary: mockResponse.summary || '',
    data: mockResponse.data || [],
    sources: sourceIndicators,
    sourceIds: mockResponse.sources || [],
    ctaBubbles: ctaBubbles,
    ctaContext: mockResponse.ctaContext || null,
    actions: mockResponse.actions || [],
    cluster: mockResponse.cluster || null,
    timestamp: new Date().toISOString(),
    timestampMs: Date.now(),
    responseTimeMs: 0,
    status: 'success',
  };
}

/**
 * Checks if a query result indicates an error
 * @param {Object} result - The query result object
 * @returns {boolean} Whether the result is an error
 */
export function isErrorResult(result) {
  if (!result || typeof result !== 'object') {
    return true;
  }
  return result.status === 'error';
}

/**
 * Extracts source system names from a query result
 * @param {Object} result - The query result object
 * @returns {Array<string>} Array of source system names
 */
export function getResultSourceNames(result) {
  if (!result || !Array.isArray(result.sources)) {
    return [];
  }
  return result.sources
    .map((source) => source.system || source.label || '')
    .filter(Boolean);
}

/**
 * Extracts CTA labels from a query result
 * @param {Object} result - The query result object
 * @returns {Array<string>} Array of CTA label strings
 */
export function getResultCTALabels(result) {
  if (!result || !Array.isArray(result.ctaBubbles)) {
    return [];
  }
  return result.ctaBubbles
    .map((cta) => cta.label || '')
    .filter(Boolean);
}