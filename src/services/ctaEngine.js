/**
 * Contextual CTA bubble generation engine
 * Generates 3-4 contextual follow-up queries based on current result context and persona.
 * Each CTA includes { id, label, queryText, actionType, targetScreen }.
 * Supports drill-down CTAs (deeper analysis), action CTAs (trigger execution),
 * and navigation CTAs (move to related screen).
 * @module ctaEngine
 */

import { getCTABubbles, getActionTemplates } from '../data/mockData.js';
import { logAction, ACTION_TYPES } from './auditLogService.js';
import { getCurrentSession } from './authService.js';
import { generateId } from '../utils/helpers.js';
import { SCREEN_IDS, PERSONAS } from '../utils/constants.js';

/**
 * CTA action types
 * @enum {string}
 */
export const CTA_ACTION_TYPES = {
  DRILL_DOWN: 'drill_down',
  ACTION: 'action',
  NAVIGATION: 'navigation',
};

/**
 * Maximum number of CTAs to return
 * @type {number}
 */
const MAX_CTA_COUNT = 4;

/**
 * Maps a CTA action type to a target screen ID
 * @param {string} actionType - The CTA action type
 * @returns {number} The target screen ID
 */
function mapActionTypeToScreen(actionType) {
  switch (actionType) {
    case CTA_ACTION_TYPES.DRILL_DOWN:
      return SCREEN_IDS.RESULT_DETAIL;
    case CTA_ACTION_TYPES.ACTION:
      return SCREEN_IDS.ACTION_CONFIRM;
    case CTA_ACTION_TYPES.NAVIGATION:
      return SCREEN_IDS.QUERY_INPUT;
    default:
      return SCREEN_IDS.QUERY_INPUT;
  }
}

/**
 * Builds a CTA object with all required fields
 * @param {string} label - Display label for the CTA
 * @param {string} queryText - The query text to execute when CTA is clicked
 * @param {string} actionType - The CTA action type (drill_down, action, navigation)
 * @param {string} [icon] - Optional icon identifier
 * @returns {Object} The CTA object
 */
function buildCTA(label, queryText, actionType, icon) {
  return {
    id: `cta-${generateId(8)}`,
    label,
    queryText,
    actionType,
    targetScreen: mapActionTypeToScreen(actionType),
    icon: icon || null,
  };
}

/**
 * Generates drill-down CTAs from the query result's CTA context
 * @param {Object} queryResult - The query result object
 * @returns {Array<Object>} Array of drill-down CTA objects
 */
function generateDrillDownCTAs(queryResult) {
  if (!queryResult || typeof queryResult !== 'object') {
    return [];
  }

  const ctaContext = queryResult.ctaContext || null;
  const ctaBubbles = queryResult.ctaBubbles || [];

  // Use pre-existing CTA bubbles from the query result if available
  if (Array.isArray(ctaBubbles) && ctaBubbles.length > 0) {
    return ctaBubbles.map((bubble) =>
      buildCTA(
        bubble.label,
        bubble.query || bubble.queryText || bubble.label,
        CTA_ACTION_TYPES.DRILL_DOWN,
        bubble.icon || null
      )
    );
  }

  // Fall back to CTA context lookup from mock data
  if (ctaContext && typeof ctaContext === 'string') {
    const contextBubbles = getCTABubbles(ctaContext);
    if (Array.isArray(contextBubbles) && contextBubbles.length > 0) {
      return contextBubbles.map((bubble) =>
        buildCTA(
          bubble.label,
          bubble.query || bubble.label,
          CTA_ACTION_TYPES.DRILL_DOWN,
          bubble.icon || null
        )
      );
    }
  }

  return [];
}

/**
 * Generates action CTAs based on available actions for the result and persona cluster
 * @param {Object} queryResult - The query result object
 * @param {string} cluster - The persona's cluster
 * @returns {Array<Object>} Array of action CTA objects
 */
function generateActionCTAs(queryResult, cluster) {
  if (!queryResult || typeof queryResult !== 'object') {
    return [];
  }

  if (!cluster || typeof cluster !== 'string') {
    return [];
  }

  const actionIds = queryResult.actions || [];
  if (!Array.isArray(actionIds) || actionIds.length === 0) {
    return [];
  }

  const templates = getActionTemplates(cluster, actionIds);
  if (!Array.isArray(templates) || templates.length === 0) {
    return [];
  }

  return templates.map((template) =>
    buildCTA(
      template.name,
      template.description || `Execute: ${template.name}`,
      CTA_ACTION_TYPES.ACTION,
      'action'
    )
  );
}

/**
 * Generates navigation CTAs based on the result's cluster context
 * @param {Object} queryResult - The query result object
 * @param {string} persona - The persona identifier
 * @returns {Array<Object>} Array of navigation CTA objects
 */
function generateNavigationCTAs(queryResult, persona) {
  if (!queryResult || typeof queryResult !== 'object') {
    return [];
  }

  const resultCluster = queryResult.cluster || null;
  const navigationCTAs = [];

  // Suggest navigating to related clusters based on the current result cluster
  const clusterNavigationMap = {
    operations: [
      { label: 'View financial impact', queryText: 'Show me budget status for my projects', icon: 'dollar' },
      { label: 'Check risk exposure', queryText: 'Show me project risks', icon: 'alert' },
    ],
    finance: [
      { label: 'View project schedules', queryText: 'What is the schedule status across my projects?', icon: 'clock' },
      { label: 'Portfolio overview', queryText: 'Give me a portfolio overview', icon: 'chart' },
    ],
    engineering: [
      { label: 'View resource allocation', queryText: 'Show me resource allocation', icon: 'users' },
      { label: 'Check project risks', queryText: 'Show me project risks', icon: 'alert' },
    ],
    sales: [
      { label: 'View revenue forecast', queryText: 'Show me the revenue forecast', icon: 'trending' },
      { label: 'Client engagement', queryText: 'Show me client engagement metrics', icon: 'users' },
    ],
    portfolio: [
      { label: 'Drill into at-risk projects', queryText: 'Which projects in the portfolio are at risk?', icon: 'alert' },
      { label: 'View ROI breakdown', queryText: 'Show me ROI breakdown by project category', icon: 'chart' },
    ],
    risk: [
      { label: 'View mitigation actions', queryText: 'What mitigation actions are available for these risks?', icon: 'shield' },
      { label: 'Portfolio overview', queryText: 'Give me a portfolio overview', icon: 'chart' },
    ],
  };

  const suggestions = resultCluster && clusterNavigationMap[resultCluster]
    ? clusterNavigationMap[resultCluster]
    : [];

  for (const suggestion of suggestions) {
    navigationCTAs.push(
      buildCTA(
        suggestion.label,
        suggestion.queryText,
        CTA_ACTION_TYPES.NAVIGATION,
        suggestion.icon
      )
    );
  }

  return navigationCTAs;
}

/**
 * Resolves the persona cluster from a persona identifier
 * @param {string} persona - The persona identifier
 * @returns {string|null} The cluster string or null
 */
function resolveCluster(persona) {
  if (!persona || typeof persona !== 'string') {
    return null;
  }

  const normalizedPersona = persona.toLowerCase().trim();

  const personaKey = Object.keys(PERSONAS).find(
    (key) => PERSONAS[key].id === normalizedPersona
  );

  if (personaKey) {
    return PERSONAS[personaKey].cluster;
  }

  // Try using the session cluster
  const session = getCurrentSession();
  if (session && session.cluster) {
    return session.cluster;
  }

  return null;
}

/**
 * Generates contextual CTA bubbles based on the current query result and persona.
 * Returns 3-4 CTAs combining drill-down, action, and navigation types.
 *
 * @param {Object} queryResult - The query result object from queryEngine
 * @param {string} persona - The persona identifier (e.g., 'lukas', 'elena', 'sophie', 'james')
 * @returns {Array<Object>} Array of CTA objects, each containing:
 *   - {string} id - Unique CTA identifier
 *   - {string} label - Display label
 *   - {string} queryText - Query text or action description
 *   - {string} actionType - CTA type ('drill_down', 'action', 'navigation')
 *   - {number} targetScreen - Target screen ID
 *   - {string|null} icon - Optional icon identifier
 */
export function getCTAs(queryResult, persona) {
  if (!queryResult || typeof queryResult !== 'object') {
    return [];
  }

  if (!persona || typeof persona !== 'string') {
    return [];
  }

  const normalizedPersona = persona.toLowerCase().trim();
  const cluster = resolveCluster(normalizedPersona);

  // Generate CTAs from each category
  const drillDownCTAs = generateDrillDownCTAs(queryResult);
  const actionCTAs = generateActionCTAs(queryResult, cluster);
  const navigationCTAs = generateNavigationCTAs(queryResult, normalizedPersona);

  // Combine and prioritize: drill-down first, then action, then navigation
  const allCTAs = [];

  // Add up to 2 drill-down CTAs
  const drillDownSlice = drillDownCTAs.slice(0, 2);
  allCTAs.push(...drillDownSlice);

  // Add up to 1 action CTA
  const actionSlice = actionCTAs.slice(0, 1);
  allCTAs.push(...actionSlice);

  // Fill remaining slots with navigation CTAs
  const remainingSlots = MAX_CTA_COUNT - allCTAs.length;
  if (remainingSlots > 0) {
    const navigationSlice = navigationCTAs.slice(0, remainingSlots);
    allCTAs.push(...navigationSlice);
  }

  // If we still have fewer than 3, add more drill-down or navigation CTAs
  if (allCTAs.length < 3) {
    const additionalDrillDown = drillDownCTAs.slice(drillDownSlice.length);
    for (const cta of additionalDrillDown) {
      if (allCTAs.length >= MAX_CTA_COUNT) {
        break;
      }
      allCTAs.push(cta);
    }
  }

  if (allCTAs.length < 3) {
    const additionalNavigation = navigationCTAs.slice(
      Math.min(navigationCTAs.length, MAX_CTA_COUNT - allCTAs.length)
    );
    for (const cta of additionalNavigation) {
      if (allCTAs.length >= MAX_CTA_COUNT) {
        break;
      }
      // Avoid duplicates by label
      const isDuplicate = allCTAs.some((existing) => existing.label === cta.label);
      if (!isDuplicate) {
        allCTAs.push(cta);
      }
    }
  }

  // Trim to max count
  return allCTAs.slice(0, MAX_CTA_COUNT);
}

/**
 * Handles a CTA click event by logging the action and returning the CTA details.
 * This function should be called when a user clicks on a CTA bubble.
 *
 * @param {Object} cta - The CTA object that was clicked
 * @param {Object} queryResult - The current query result context
 * @returns {Object} The CTA click result containing the CTA details and target info
 */
export function handleCTAClick(cta, queryResult) {
  if (!cta || typeof cta !== 'object') {
    return { success: false, error: 'Invalid CTA object.' };
  }

  const session = getCurrentSession();
  const userId = session ? session.userId : null;

  logAction(ACTION_TYPES.CTA_CLICK, userId, {
    ctaId: cta.id || null,
    ctaLabel: cta.label || null,
    ctaActionType: cta.actionType || null,
    ctaQueryText: cta.queryText || null,
    targetScreen: cta.targetScreen || null,
    sourceResultId: queryResult ? queryResult.id : null,
    sourceQuery: queryResult ? queryResult.query : null,
    persona: session ? session.persona : null,
  });

  return {
    success: true,
    cta: { ...cta },
    targetScreen: cta.targetScreen,
    queryText: cta.queryText || null,
    actionType: cta.actionType || null,
  };
}

/**
 * Filters CTAs by action type
 *
 * @param {Array<Object>} ctas - Array of CTA objects
 * @param {string} actionType - The action type to filter by
 * @returns {Array<Object>} Filtered array of CTA objects
 */
export function filterCTAsByType(ctas, actionType) {
  if (!Array.isArray(ctas)) {
    return [];
  }

  if (!actionType || typeof actionType !== 'string') {
    return ctas;
  }

  return ctas.filter((cta) => cta.actionType === actionType);
}

/**
 * Gets only drill-down CTAs from a query result
 *
 * @param {Object} queryResult - The query result object
 * @param {string} persona - The persona identifier
 * @returns {Array<Object>} Array of drill-down CTA objects
 */
export function getDrillDownCTAs(queryResult, persona) {
  const allCTAs = getCTAs(queryResult, persona);
  return filterCTAsByType(allCTAs, CTA_ACTION_TYPES.DRILL_DOWN);
}

/**
 * Gets only action CTAs from a query result
 *
 * @param {Object} queryResult - The query result object
 * @param {string} persona - The persona identifier
 * @returns {Array<Object>} Array of action CTA objects
 */
export function getActionCTAs(queryResult, persona) {
  const allCTAs = getCTAs(queryResult, persona);
  return filterCTAsByType(allCTAs, CTA_ACTION_TYPES.ACTION);
}

/**
 * Gets only navigation CTAs from a query result
 *
 * @param {Object} queryResult - The query result object
 * @param {string} persona - The persona identifier
 * @returns {Array<Object>} Array of navigation CTA objects
 */
export function getNavigationCTAs(queryResult, persona) {
  const allCTAs = getCTAs(queryResult, persona);
  return filterCTAsByType(allCTAs, CTA_ACTION_TYPES.NAVIGATION);
}

/**
 * Checks if a CTA is a drill-down type
 * @param {Object} cta - The CTA object
 * @returns {boolean} Whether the CTA is a drill-down type
 */
export function isDrillDownCTA(cta) {
  if (!cta || typeof cta !== 'object') {
    return false;
  }
  return cta.actionType === CTA_ACTION_TYPES.DRILL_DOWN;
}

/**
 * Checks if a CTA is an action type
 * @param {Object} cta - The CTA object
 * @returns {boolean} Whether the CTA is an action type
 */
export function isActionCTA(cta) {
  if (!cta || typeof cta !== 'object') {
    return false;
  }
  return cta.actionType === CTA_ACTION_TYPES.ACTION;
}

/**
 * Checks if a CTA is a navigation type
 * @param {Object} cta - The CTA object
 * @returns {boolean} Whether the CTA is a navigation type
 */
export function isNavigationCTA(cta) {
  if (!cta || typeof cta !== 'object') {
    return false;
  }
  return cta.actionType === CTA_ACTION_TYPES.NAVIGATION;
}