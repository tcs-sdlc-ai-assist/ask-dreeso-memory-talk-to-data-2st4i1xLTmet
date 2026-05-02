/**
 * Source transparency service
 * Provides data provenance and source system indicators for query results.
 * Each source includes systemName, status (live/cached), lastUpdated, confidence.
 * Maps mock data origins to SAP, Procore, Salesforce, Primavera with green dot indicators.
 * @module sourceTransparencyService
 */

import { getSourceIndicators, SOURCE_INDICATORS } from '../data/mockData.js';
import { SYSTEM_SOURCES } from '../utils/constants.js';

/**
 * Source status types
 * @enum {string}
 */
export const SOURCE_STATUS = {
  LIVE: 'live',
  CACHED: 'cached',
  OFFLINE: 'offline',
};

/**
 * Confidence level thresholds
 * @enum {number}
 */
export const CONFIDENCE_LEVELS = {
  HIGH: 0.95,
  MEDIUM: 0.80,
  LOW: 0.60,
};

/**
 * Maps a system ID to its full system metadata
 * @type {Object<string, Object>}
 */
const SYSTEM_METADATA = {
  [SYSTEM_SOURCES.SAP.id]: {
    systemId: SYSTEM_SOURCES.SAP.id,
    systemName: SYSTEM_SOURCES.SAP.name,
    systemLabel: SYSTEM_SOURCES.SAP.label,
    color: SYSTEM_SOURCES.SAP.color,
    defaultConfidence: 0.97,
  },
  [SYSTEM_SOURCES.PROCORE.id]: {
    systemId: SYSTEM_SOURCES.PROCORE.id,
    systemName: SYSTEM_SOURCES.PROCORE.name,
    systemLabel: SYSTEM_SOURCES.PROCORE.label,
    color: SYSTEM_SOURCES.PROCORE.color,
    defaultConfidence: 0.95,
  },
  [SYSTEM_SOURCES.SALESFORCE.id]: {
    systemId: SYSTEM_SOURCES.SALESFORCE.id,
    systemName: SYSTEM_SOURCES.SALESFORCE.name,
    systemLabel: SYSTEM_SOURCES.SALESFORCE.label,
    color: SYSTEM_SOURCES.SALESFORCE.color,
    defaultConfidence: 0.93,
  },
  [SYSTEM_SOURCES.PRIMAVERA.id]: {
    systemId: SYSTEM_SOURCES.PRIMAVERA.id,
    systemName: SYSTEM_SOURCES.PRIMAVERA.name,
    systemLabel: SYSTEM_SOURCES.PRIMAVERA.label,
    color: SYSTEM_SOURCES.PRIMAVERA.color,
    defaultConfidence: 0.91,
  },
};

/**
 * Resolves the status of a source system based on its indicator data
 * @param {Object} indicator - The source indicator object from mock data
 * @returns {string} The resolved status ('live', 'cached', or 'offline')
 */
function resolveSourceStatus(indicator) {
  if (!indicator || typeof indicator !== 'object') {
    return SOURCE_STATUS.OFFLINE;
  }

  if (indicator.live === true) {
    return SOURCE_STATUS.LIVE;
  }

  if (indicator.lastSync && typeof indicator.lastSync === 'string') {
    const lastSyncMs = new Date(indicator.lastSync).getTime();
    if (!isNaN(lastSyncMs)) {
      return SOURCE_STATUS.CACHED;
    }
  }

  return SOURCE_STATUS.OFFLINE;
}

/**
 * Resolves the confidence level for a source system
 * @param {Object} indicator - The source indicator object from mock data
 * @param {Object} metadata - The system metadata object
 * @returns {number} The confidence value between 0 and 1
 */
function resolveConfidence(indicator, metadata) {
  if (!indicator || typeof indicator !== 'object') {
    return CONFIDENCE_LEVELS.LOW;
  }

  // If the source is live, use high confidence based on latency
  if (indicator.live === true) {
    if (indicator.latency && typeof indicator.latency === 'string') {
      const latencyMs = parseInt(indicator.latency, 10);
      if (!isNaN(latencyMs)) {
        if (latencyMs <= 100) {
          return 0.98;
        }
        if (latencyMs <= 200) {
          return 0.95;
        }
        if (latencyMs <= 500) {
          return 0.90;
        }
        return 0.85;
      }
    }

    return metadata && metadata.defaultConfidence ? metadata.defaultConfidence : CONFIDENCE_LEVELS.HIGH;
  }

  // Cached sources get medium confidence
  return CONFIDENCE_LEVELS.MEDIUM;
}

/**
 * Resolves the lastUpdated timestamp for a source system
 * @param {Object} indicator - The source indicator object from mock data
 * @returns {string} ISO timestamp string of the last update
 */
function resolveLastUpdated(indicator) {
  if (!indicator || typeof indicator !== 'object') {
    return new Date().toISOString();
  }

  if (indicator.lastSync && typeof indicator.lastSync === 'string') {
    const parsed = new Date(indicator.lastSync);
    if (!isNaN(parsed.getTime())) {
      return indicator.lastSync;
    }
  }

  return new Date().toISOString();
}

/**
 * Builds a source transparency object for a single source system
 * @param {string} sourceId - The source system ID
 * @param {Object|null} indicator - The source indicator from mock data
 * @returns {Object} The source transparency object
 */
function buildSourceTransparencyObject(sourceId, indicator) {
  const metadata = SYSTEM_METADATA[sourceId] || null;

  const systemName = metadata ? metadata.systemName : sourceId;
  const systemLabel = metadata ? metadata.systemLabel : sourceId;
  const color = metadata ? metadata.color : '#6B7280';
  const status = resolveSourceStatus(indicator);
  const confidence = resolveConfidence(indicator, metadata);
  const lastUpdated = resolveLastUpdated(indicator);
  const latency = indicator && indicator.latency ? indicator.latency : null;

  return {
    systemId: sourceId,
    systemName,
    systemLabel,
    color,
    status,
    isLive: status === SOURCE_STATUS.LIVE,
    lastUpdated,
    confidence,
    confidenceLabel: getConfidenceLabel(confidence),
    latency,
    indicatorColor: status === SOURCE_STATUS.LIVE ? '#10B981' : status === SOURCE_STATUS.CACHED ? '#F59E0B' : '#EF4444',
  };
}

/**
 * Returns a human-readable confidence label
 * @param {number} confidence - The confidence value between 0 and 1
 * @returns {string} The confidence label ('High', 'Medium', or 'Low')
 */
function getConfidenceLabel(confidence) {
  if (typeof confidence !== 'number' || isNaN(confidence)) {
    return 'Low';
  }

  if (confidence >= CONFIDENCE_LEVELS.HIGH) {
    return 'High';
  }

  if (confidence >= CONFIDENCE_LEVELS.MEDIUM) {
    return 'Medium';
  }

  return 'Low';
}

/**
 * Extracts and returns source system indicators for a given query result.
 * Each source includes systemName, status (live/cached), lastUpdated, confidence.
 * Maps mock data origins to SAP, Procore, Salesforce, Primavera with green dot indicators.
 *
 * @param {Object} queryResult - The query result object from queryEngine
 * @returns {Array<Object>} Array of source transparency objects, each containing:
 *   - {string} systemId - The source system ID
 *   - {string} systemName - The source system name
 *   - {string} systemLabel - The source system display label
 *   - {string} color - The source system brand color
 *   - {string} status - Source status ('live', 'cached', 'offline')
 *   - {boolean} isLive - Whether the source is live
 *   - {string} lastUpdated - ISO timestamp of last update
 *   - {number} confidence - Confidence value between 0 and 1
 *   - {string} confidenceLabel - Human-readable confidence label
 *   - {string|null} latency - Latency string (e.g., '120ms') or null
 *   - {string} indicatorColor - Hex color for the status indicator dot
 */
export function getSources(queryResult) {
  if (!queryResult || typeof queryResult !== 'object') {
    return [];
  }

  // Extract source IDs from the query result
  const sourceIds = queryResult.sourceIds || [];
  const sources = queryResult.sources || [];

  // If we have sourceIds, use them to look up indicators
  if (Array.isArray(sourceIds) && sourceIds.length > 0) {
    return sourceIds.map((sourceId) => {
      const indicator = SOURCE_INDICATORS[sourceId] || null;
      return buildSourceTransparencyObject(sourceId, indicator);
    });
  }

  // If we have source objects (from getSourceIndicators), extract system info
  if (Array.isArray(sources) && sources.length > 0) {
    return sources.map((source) => {
      if (!source || typeof source !== 'object') {
        return null;
      }

      const sourceId = source.system ? source.system.toLowerCase() : null;
      if (!sourceId) {
        return null;
      }

      const indicator = SOURCE_INDICATORS[sourceId] || source;
      return buildSourceTransparencyObject(sourceId, indicator);
    }).filter(Boolean);
  }

  return [];
}

/**
 * Gets source transparency data for a specific system ID
 *
 * @param {string} systemId - The system ID to look up
 * @returns {Object|null} The source transparency object, or null if not found
 */
export function getSourceById(systemId) {
  if (!systemId || typeof systemId !== 'string') {
    return null;
  }

  const normalizedId = systemId.toLowerCase().trim();
  const indicator = SOURCE_INDICATORS[normalizedId] || null;

  if (!indicator && !SYSTEM_METADATA[normalizedId]) {
    return null;
  }

  return buildSourceTransparencyObject(normalizedId, indicator);
}

/**
 * Gets all available source systems with their transparency data
 *
 * @returns {Array<Object>} Array of all source transparency objects
 */
export function getAllSources() {
  const allSystemIds = Object.keys(SYSTEM_METADATA);

  return allSystemIds.map((systemId) => {
    const indicator = SOURCE_INDICATORS[systemId] || null;
    return buildSourceTransparencyObject(systemId, indicator);
  });
}

/**
 * Filters sources by status
 *
 * @param {Array<Object>} sources - Array of source transparency objects
 * @param {string} status - The status to filter by ('live', 'cached', 'offline')
 * @returns {Array<Object>} Filtered array of source transparency objects
 */
export function filterSourcesByStatus(sources, status) {
  if (!Array.isArray(sources)) {
    return [];
  }

  if (!status || typeof status !== 'string') {
    return sources;
  }

  const normalizedStatus = status.toLowerCase().trim();
  return sources.filter((source) => source.status === normalizedStatus);
}

/**
 * Gets only live sources from a query result
 *
 * @param {Object} queryResult - The query result object
 * @returns {Array<Object>} Array of live source transparency objects
 */
export function getLiveSources(queryResult) {
  const allSources = getSources(queryResult);
  return filterSourcesByStatus(allSources, SOURCE_STATUS.LIVE);
}

/**
 * Calculates the overall confidence for a set of sources
 *
 * @param {Array<Object>} sources - Array of source transparency objects
 * @returns {number} The average confidence value between 0 and 1
 */
export function calculateOverallConfidence(sources) {
  if (!Array.isArray(sources) || sources.length === 0) {
    return 0;
  }

  const validSources = sources.filter(
    (source) => source && typeof source.confidence === 'number' && !isNaN(source.confidence)
  );

  if (validSources.length === 0) {
    return 0;
  }

  const totalConfidence = validSources.reduce((sum, source) => sum + source.confidence, 0);
  return Math.round((totalConfidence / validSources.length) * 100) / 100;
}

/**
 * Gets the overall confidence label for a set of sources
 *
 * @param {Array<Object>} sources - Array of source transparency objects
 * @returns {string} The overall confidence label ('High', 'Medium', or 'Low')
 */
export function getOverallConfidenceLabel(sources) {
  const confidence = calculateOverallConfidence(sources);
  return getConfidenceLabel(confidence);
}

/**
 * Checks if all sources in a query result are live
 *
 * @param {Object} queryResult - The query result object
 * @returns {boolean} Whether all sources are live
 */
export function areAllSourcesLive(queryResult) {
  const sources = getSources(queryResult);

  if (sources.length === 0) {
    return false;
  }

  return sources.every((source) => source.status === SOURCE_STATUS.LIVE);
}

/**
 * Gets a summary of source transparency for a query result
 *
 * @param {Object} queryResult - The query result object
 * @returns {Object} Summary object containing:
 *   - {number} totalSources - Total number of sources
 *   - {number} liveSources - Number of live sources
 *   - {number} cachedSources - Number of cached sources
 *   - {number} offlineSources - Number of offline sources
 *   - {number} overallConfidence - Average confidence value
 *   - {string} overallConfidenceLabel - Human-readable confidence label
 *   - {boolean} allLive - Whether all sources are live
 *   - {Array<Object>} sources - Full array of source transparency objects
 */
export function getSourceSummary(queryResult) {
  const sources = getSources(queryResult);

  const liveSources = sources.filter((s) => s.status === SOURCE_STATUS.LIVE);
  const cachedSources = sources.filter((s) => s.status === SOURCE_STATUS.CACHED);
  const offlineSources = sources.filter((s) => s.status === SOURCE_STATUS.OFFLINE);
  const overallConfidence = calculateOverallConfidence(sources);

  return {
    totalSources: sources.length,
    liveSources: liveSources.length,
    cachedSources: cachedSources.length,
    offlineSources: offlineSources.length,
    overallConfidence,
    overallConfidenceLabel: getConfidenceLabel(overallConfidence),
    allLive: sources.length > 0 && liveSources.length === sources.length,
    sources,
  };
}

/**
 * Gets the system metadata for a given system ID
 *
 * @param {string} systemId - The system ID
 * @returns {Object|null} The system metadata object, or null if not found
 */
export function getSystemMetadata(systemId) {
  if (!systemId || typeof systemId !== 'string') {
    return null;
  }

  const normalizedId = systemId.toLowerCase().trim();
  const metadata = SYSTEM_METADATA[normalizedId];

  if (!metadata) {
    return null;
  }

  return { ...metadata };
}

/**
 * Gets source system names from a query result
 *
 * @param {Object} queryResult - The query result object
 * @returns {Array<string>} Array of source system names
 */
export function getSourceNames(queryResult) {
  const sources = getSources(queryResult);
  return sources.map((source) => source.systemName).filter(Boolean);
}

/**
 * Gets source system labels from a query result
 *
 * @param {Object} queryResult - The query result object
 * @returns {Array<string>} Array of source system labels
 */
export function getSourceLabels(queryResult) {
  const sources = getSources(queryResult);
  return sources.map((source) => source.systemLabel).filter(Boolean);
}