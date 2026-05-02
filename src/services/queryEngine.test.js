import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  executeQuery,
  executeFollowUpQuery,
  getDefaultResult,
  isErrorResult,
  getResultSourceNames,
  getResultCTALabels,
  simulateDelay,
} from './queryEngine.js';

vi.mock('./localStorageService.js', () => ({
  addQueryResult: vi.fn(() => true),
  getItem: vi.fn(() => null),
  setItem: vi.fn(() => true),
  isStorageAvailable: vi.fn(() => true),
}));

vi.mock('./auditLogService.js', () => ({
  logAction: vi.fn(() => ({ id: 'test-log' })),
  ACTION_TYPES: {
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
  },
}));

vi.mock('./authService.js', () => ({
  getCurrentSession: vi.fn(() => ({
    userId: 'user-lukas-001',
    persona: 'lukas',
    role: 'Project Manager',
    cluster: 'operations',
    token: 'test-token',
    expiresAt: Date.now() + 7200000,
  })),
}));

import { addQueryResult } from './localStorageService.js';
import { logAction, ACTION_TYPES } from './auditLogService.js';
import { getCurrentSession } from './authService.js';

describe('queryEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('simulateDelay', () => {
    it('resolves with a delay value within the specified range', async () => {
      const minMs = 10;
      const maxMs = 50;
      const delay = await simulateDelay(minMs, maxMs);

      expect(typeof delay).toBe('number');
      expect(delay).toBeGreaterThanOrEqual(minMs);
      expect(delay).toBeLessThanOrEqual(maxMs);
    });

    it('resolves with a delay when called with default parameters', async () => {
      const delay = await simulateDelay(1, 10);

      expect(typeof delay).toBe('number');
      expect(delay).toBeGreaterThanOrEqual(1);
    });
  });

  describe('executeQuery', () => {
    it('returns a successful result for a valid query and persona (lukas - project risks)', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.query).toBe('Show me project risks');
      expect(result.persona).toBe('lukas');
      expect(result.id).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.timestampMs).toBeDefined();
      expect(typeof result.responseTimeMs).toBe('number');
      expect(result.responseTimeMs).toBeGreaterThan(0);
    });

    it('returns table output type for project risk query (lukas)', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      expect(result.outputType).toBe('table');
      expect(result.title).toBe('Project Risk Assessment');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('returns table output type for schedule status query (lukas)', async () => {
      const result = await executeQuery('What is the schedule status across my projects?', 'lukas');

      expect(result.status).toBe('success');
      expect(result.outputType).toBe('table');
      expect(result.title).toBe('Schedule Status Overview');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('returns kpi output type for portfolio overview query (lukas)', async () => {
      const result = await executeQuery('Give me a portfolio overview', 'lukas');

      expect(result.status).toBe('success');
      expect(result.outputType).toBe('kpi');
      expect(result.title).toBe('Portfolio Performance Dashboard');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('returns kpi output type for revenue analysis query (elena)', async () => {
      const result = await executeQuery('Show me revenue analysis', 'elena');

      expect(result.status).toBe('success');
      expect(result.outputType).toBe('kpi');
      expect(result.title).toBe('Revenue Analysis - Q2 2024');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('returns forecast output type for cash flow query (elena)', async () => {
      const result = await executeQuery('Show me cash flow analysis', 'elena');

      expect(result.status).toBe('success');
      expect(result.outputType).toBe('forecast');
      expect(result.title).toBe('Cash Flow Forecast');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('returns table output type for open RFIs query (sophie)', async () => {
      const result = await executeQuery('Show me open RFIs', 'sophie');

      expect(result.status).toBe('success');
      expect(result.outputType).toBe('table');
      expect(result.title).toBe('Open RFI Status');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('returns kpi output type for quality metrics query (sophie)', async () => {
      const result = await executeQuery('Show me quality metrics', 'sophie');

      expect(result.status).toBe('success');
      expect(result.outputType).toBe('kpi');
      expect(result.title).toBe('Quality Performance Dashboard');
    });

    it('returns table output type for sales pipeline query (james)', async () => {
      const result = await executeQuery('Show me the sales pipeline', 'james');

      expect(result.status).toBe('success');
      expect(result.outputType).toBe('table');
      expect(result.title).toBe('Sales Pipeline Overview');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('returns forecast output type for revenue forecast query (james)', async () => {
      const result = await executeQuery('Show me the revenue forecast', 'james');

      expect(result.status).toBe('success');
      expect(result.outputType).toBe('forecast');
      expect(result.title).toBe('Revenue Forecast - H2 2024');
    });

    it('returns kpi output type for win rate query (james)', async () => {
      const result = await executeQuery('What is our win rate this quarter?', 'james');

      expect(result.status).toBe('success');
      expect(result.outputType).toBe('kpi');
      expect(result.title).toBe('Win Rate Analysis - Q2 2024');
    });

    it('returns default response for unmatched query', async () => {
      const result = await executeQuery('some random unmatched query text xyz', 'lukas');

      expect(result.status).toBe('success');
      expect(result.outputType).toBe('kpi');
      expect(result.title).toBe('General Analytics Overview');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('includes source IDs in the result', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      expect(Array.isArray(result.sourceIds)).toBe(true);
      expect(result.sourceIds.length).toBeGreaterThan(0);
    });

    it('includes source transparency objects in the result', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      expect(Array.isArray(result.sources)).toBe(true);
    });

    it('includes CTA bubbles in the result', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      expect(Array.isArray(result.ctaBubbles)).toBe(true);
    });

    it('includes CTA context in the result', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      expect(result.ctaContext).toBe('project_risks');
    });

    it('includes actions in the result', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      expect(Array.isArray(result.actions)).toBe(true);
      expect(result.actions.length).toBeGreaterThan(0);
    });

    it('includes cluster in the result', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      expect(typeof result.cluster).toBe('string');
    });

    it('includes summary text in the result', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      expect(typeof result.summary).toBe('string');
      expect(result.summary.length).toBeGreaterThan(0);
    });

    it('returns error for empty query', async () => {
      const result = await executeQuery('', 'lukas');

      expect(result.status).toBe('error');
      expect(result.outputType).toBe('error');
      expect(result.message).toBe('Query cannot be empty.');
      expect(result.errorCode).toBe('INVALID_QUERY');
    });

    it('returns error for null query', async () => {
      const result = await executeQuery(null, 'lukas');

      expect(result.status).toBe('error');
      expect(result.outputType).toBe('error');
      expect(result.message).toBe('Query cannot be empty.');
    });

    it('returns error for undefined query', async () => {
      const result = await executeQuery(undefined, 'lukas');

      expect(result.status).toBe('error');
      expect(result.outputType).toBe('error');
    });

    it('returns error for whitespace-only query', async () => {
      const result = await executeQuery('   ', 'lukas');

      expect(result.status).toBe('error');
      expect(result.message).toBe('Query cannot be empty.');
    });

    it('returns error for query exceeding max length', async () => {
      const longQuery = 'a'.repeat(257);
      const result = await executeQuery(longQuery, 'lukas');

      expect(result.status).toBe('error');
      expect(result.errorCode).toBe('INVALID_QUERY');
      expect(result.message).toContain('256 characters');
    });

    it('returns error for empty persona', async () => {
      const result = await executeQuery('Show me project risks', '');

      expect(result.status).toBe('error');
      expect(result.errorCode).toBe('INVALID_PERSONA');
      expect(result.message).toContain('Persona is required');
    });

    it('returns error for null persona', async () => {
      const result = await executeQuery('Show me project risks', null);

      expect(result.status).toBe('error');
      expect(result.errorCode).toBe('INVALID_PERSONA');
    });

    it('returns error for invalid persona name', async () => {
      const result = await executeQuery('Show me project risks', 'unknown_persona');

      expect(result.status).toBe('error');
      expect(result.errorCode).toBe('INVALID_PERSONA');
      expect(result.message).toContain('Invalid persona');
    });

    it('handles case-insensitive persona names', async () => {
      const result = await executeQuery('Show me project risks', 'LUKAS');

      expect(result.status).toBe('success');
      expect(result.persona).toBe('lukas');
    });

    it('handles persona names with whitespace', async () => {
      const result = await executeQuery('Show me project risks', '  lukas  ');

      expect(result.status).toBe('success');
      expect(result.persona).toBe('lukas');
    });

    it('persists query result to localStorage', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      expect(addQueryResult).toHaveBeenCalledTimes(1);
      expect(addQueryResult).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'Show me project risks',
          persona: 'lukas',
          status: 'success',
        })
      );
    });

    it('logs warning when localStorage persistence fails', async () => {
      addQueryResult.mockReturnValueOnce(false);
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to persist query result')
      );

      warnSpy.mockRestore();
    });

    it('logs QUERY action on successful query', async () => {
      await executeQuery('Show me project risks', 'lukas');

      const queryCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.QUERY
      );
      expect(queryCalls.length).toBe(1);
      expect(queryCalls[0][1]).toBe('user-lukas-001');
      expect(queryCalls[0][2]).toEqual(
        expect.objectContaining({
          query: 'Show me project risks',
          persona: 'lukas',
          outputType: expect.any(String),
          responseTimeMs: expect.any(Number),
        })
      );
    });

    it('logs QUERY_FAIL action on invalid query', async () => {
      await executeQuery('', 'lukas');

      const failCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.QUERY_FAIL
      );
      expect(failCalls.length).toBe(1);
      expect(failCalls[0][2]).toEqual(
        expect.objectContaining({
          reason: 'Query cannot be empty.',
        })
      );
    });

    it('logs QUERY_FAIL action on invalid persona', async () => {
      await executeQuery('Show me project risks', 'invalid');

      const failCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.QUERY_FAIL
      );
      expect(failCalls.length).toBe(1);
      expect(failCalls[0][2]).toEqual(
        expect.objectContaining({
          reason: expect.stringContaining('Invalid persona'),
        })
      );
    });

    it('uses userId from current session for audit logging', async () => {
      await executeQuery('Show me project risks', 'lukas');

      const queryCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.QUERY
      );
      expect(queryCalls[0][1]).toBe('user-lukas-001');
    });

    it('handles null session gracefully', async () => {
      getCurrentSession.mockReturnValueOnce(null);

      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      const queryCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.QUERY
      );
      expect(queryCalls[0][1]).toBeNull();
    });
  });

  describe('executeQuery - multi-system orchestration', () => {
    it('returns multiple source IDs for cross-system queries (lukas - project risks)', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result.status).toBe('success');
      expect(result.sourceIds.length).toBeGreaterThanOrEqual(2);
      expect(result.sourceIds).toContain('procore');
      expect(result.sourceIds).toContain('primavera');
    });

    it('returns SAP source for budget queries (lukas)', async () => {
      const result = await executeQuery('Show me budget status for my projects', 'lukas');

      expect(result.status).toBe('success');
      expect(result.sourceIds).toContain('sap');
    });

    it('returns multiple sources for portfolio overview (lukas)', async () => {
      const result = await executeQuery('Give me a portfolio overview', 'lukas');

      expect(result.status).toBe('success');
      expect(result.sourceIds.length).toBeGreaterThanOrEqual(2);
    });

    it('returns Salesforce source for pipeline queries (james)', async () => {
      const result = await executeQuery('Show me the sales pipeline', 'james');

      expect(result.status).toBe('success');
      expect(result.sourceIds).toContain('salesforce');
    });

    it('returns multiple sources for revenue forecast (james)', async () => {
      const result = await executeQuery('Show me the revenue forecast', 'james');

      expect(result.status).toBe('success');
      expect(result.sourceIds.length).toBeGreaterThanOrEqual(1);
    });

    it('returns Procore source for RFI queries (sophie)', async () => {
      const result = await executeQuery('Show me open RFIs', 'sophie');

      expect(result.status).toBe('success');
      expect(result.sourceIds).toContain('procore');
    });

    it('returns SAP source for revenue queries (elena)', async () => {
      const result = await executeQuery('Show me revenue analysis', 'elena');

      expect(result.status).toBe('success');
      expect(result.sourceIds).toContain('sap');
    });

    it('returns multiple sources for budget variance queries (elena)', async () => {
      const result = await executeQuery('What are the budget variances across projects?', 'elena');

      expect(result.status).toBe('success');
      expect(result.sourceIds.length).toBeGreaterThanOrEqual(2);
      expect(result.sourceIds).toContain('sap');
      expect(result.sourceIds).toContain('procore');
    });
  });

  describe('executeFollowUpQuery', () => {
    it('returns a successful result for a valid follow-up query', async () => {
      const result = await executeFollowUpQuery('Show me project risks', 'lukas');

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.query).toBe('Show me project risks');
      expect(result.persona).toBe('lukas');
      expect(result.id).toBeDefined();
      expect(typeof result.responseTimeMs).toBe('number');
    });

    it('returns error for empty follow-up query', async () => {
      const result = await executeFollowUpQuery('', 'lukas');

      expect(result.status).toBe('error');
      expect(result.errorCode).toBe('INVALID_QUERY');
    });

    it('returns error for invalid persona in follow-up query', async () => {
      const result = await executeFollowUpQuery('Show me risks', 'invalid');

      expect(result.status).toBe('error');
      expect(result.errorCode).toBe('INVALID_PERSONA');
    });

    it('persists follow-up query result to localStorage', async () => {
      await executeFollowUpQuery('Show me project risks', 'lukas');

      expect(addQueryResult).toHaveBeenCalledTimes(1);
      expect(addQueryResult).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
        })
      );
    });

    it('logs QUERY action with isFollowUp flag', async () => {
      await executeFollowUpQuery('Show me project risks', 'lukas');

      const queryCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.QUERY
      );
      expect(queryCalls.length).toBe(1);
      expect(queryCalls[0][2]).toEqual(
        expect.objectContaining({
          isFollowUp: true,
        })
      );
    });

    it('logs QUERY_FAIL with isFollowUp flag on error', async () => {
      await executeFollowUpQuery('', 'lukas');

      const failCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.QUERY_FAIL
      );
      expect(failCalls.length).toBe(1);
      expect(failCalls[0][2]).toEqual(
        expect.objectContaining({
          isFollowUp: true,
        })
      );
    });

    it('matches the same query response as executeQuery', async () => {
      const regularResult = await executeQuery('Show me project risks', 'lukas');
      const followUpResult = await executeFollowUpQuery('Show me project risks', 'lukas');

      expect(regularResult.outputType).toBe(followUpResult.outputType);
      expect(regularResult.title).toBe(followUpResult.title);
      expect(regularResult.data.length).toBe(followUpResult.data.length);
    });
  });

  describe('getDefaultResult', () => {
    it('returns a default result object for a valid persona', () => {
      const result = getDefaultResult('lukas');

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.outputType).toBe('kpi');
      expect(result.title).toBe('General Analytics Overview');
      expect(result.persona).toBe('lukas');
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.responseTimeMs).toBe(0);
    });

    it('returns a default result for null persona', () => {
      const result = getDefaultResult(null);

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.persona).toBeNull();
      expect(result.outputType).toBe('kpi');
    });

    it('returns a default result for undefined persona', () => {
      const result = getDefaultResult(undefined);

      expect(result).toBeDefined();
      expect(result.status).toBe('success');
      expect(result.persona).toBeNull();
    });

    it('includes source IDs in the default result', () => {
      const result = getDefaultResult('lukas');

      expect(Array.isArray(result.sourceIds)).toBe(true);
      expect(result.sourceIds.length).toBeGreaterThan(0);
    });

    it('includes CTA context in the default result', () => {
      const result = getDefaultResult('lukas');

      expect(result.ctaContext).toBe('portfolio_overview');
    });

    it('includes actions in the default result', () => {
      const result = getDefaultResult('lukas');

      expect(Array.isArray(result.actions)).toBe(true);
      expect(result.actions.length).toBeGreaterThan(0);
    });

    it('includes a unique ID', () => {
      const result1 = getDefaultResult('lukas');
      const result2 = getDefaultResult('lukas');

      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      expect(result1.id).not.toBe(result2.id);
    });

    it('includes timestamp', () => {
      const result = getDefaultResult('lukas');

      expect(result.timestamp).toBeDefined();
      expect(result.timestampMs).toBeDefined();
      expect(typeof result.timestampMs).toBe('number');
    });
  });

  describe('isErrorResult', () => {
    it('returns true for a result with error status', () => {
      expect(isErrorResult({ status: 'error' })).toBe(true);
    });

    it('returns true for null result', () => {
      expect(isErrorResult(null)).toBe(true);
    });

    it('returns true for undefined result', () => {
      expect(isErrorResult(undefined)).toBe(true);
    });

    it('returns true for non-object result', () => {
      expect(isErrorResult('string')).toBe(true);
    });

    it('returns false for a result with success status', () => {
      expect(isErrorResult({ status: 'success' })).toBe(false);
    });

    it('returns false for a result without status field', () => {
      expect(isErrorResult({ data: [] })).toBe(false);
    });
  });

  describe('getResultSourceNames', () => {
    it('returns source names from a result with sources', () => {
      const result = {
        sources: [
          { system: 'SAP', label: 'SAP ERP' },
          { system: 'Procore', label: 'Procore' },
        ],
      };

      const names = getResultSourceNames(result);

      expect(names).toEqual(['SAP', 'Procore']);
    });

    it('returns empty array for null result', () => {
      expect(getResultSourceNames(null)).toEqual([]);
    });

    it('returns empty array for result without sources', () => {
      expect(getResultSourceNames({ data: [] })).toEqual([]);
    });

    it('returns empty array for result with empty sources array', () => {
      expect(getResultSourceNames({ sources: [] })).toEqual([]);
    });

    it('filters out empty source names', () => {
      const result = {
        sources: [
          { system: 'SAP' },
          { system: '' },
          { label: 'Procore' },
        ],
      };

      const names = getResultSourceNames(result);

      expect(names).toEqual(['SAP', 'Procore']);
    });
  });

  describe('getResultCTALabels', () => {
    it('returns CTA labels from a result with ctaBubbles', () => {
      const result = {
        ctaBubbles: [
          { label: 'Show mitigation actions', query: 'test' },
          { label: 'Drill into cost drivers', query: 'test2' },
        ],
      };

      const labels = getResultCTALabels(result);

      expect(labels).toEqual(['Show mitigation actions', 'Drill into cost drivers']);
    });

    it('returns empty array for null result', () => {
      expect(getResultCTALabels(null)).toEqual([]);
    });

    it('returns empty array for result without ctaBubbles', () => {
      expect(getResultCTALabels({ data: [] })).toEqual([]);
    });

    it('returns empty array for result with empty ctaBubbles array', () => {
      expect(getResultCTALabels({ ctaBubbles: [] })).toEqual([]);
    });

    it('filters out empty labels', () => {
      const result = {
        ctaBubbles: [
          { label: 'Valid label' },
          { label: '' },
          { query: 'no label' },
        ],
      };

      const labels = getResultCTALabels(result);

      expect(labels).toEqual(['Valid label']);
    });
  });

  describe('executeQuery - result structure completeness', () => {
    it('returns all required fields in the result object', async () => {
      const result = await executeQuery('Show me project risks', 'lukas');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('persona');
      expect(result).toHaveProperty('outputType');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('sources');
      expect(result).toHaveProperty('sourceIds');
      expect(result).toHaveProperty('ctaBubbles');
      expect(result).toHaveProperty('ctaContext');
      expect(result).toHaveProperty('actions');
      expect(result).toHaveProperty('cluster');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('timestampMs');
      expect(result).toHaveProperty('responseTimeMs');
      expect(result).toHaveProperty('status');
    });

    it('returns all required fields in the error result object', async () => {
      const result = await executeQuery('', 'lukas');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('persona');
      expect(result).toHaveProperty('outputType');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('sources');
      expect(result).toHaveProperty('sourceIds');
      expect(result).toHaveProperty('ctaBubbles');
      expect(result).toHaveProperty('ctaContext');
      expect(result).toHaveProperty('actions');
      expect(result).toHaveProperty('cluster');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('timestampMs');
      expect(result).toHaveProperty('responseTimeMs');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('errorCode');
      expect(result).toHaveProperty('message');
    });

    it('generates unique IDs for each query execution', async () => {
      const result1 = await executeQuery('Show me project risks', 'lukas');
      const result2 = await executeQuery('Show me project risks', 'lukas');

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('executeQuery - all personas', () => {
    it('returns valid results for elena persona', async () => {
      const result = await executeQuery('Show me QS analytics', 'elena');

      expect(result.status).toBe('success');
      expect(result.persona).toBe('elena');
      expect(result.outputType).toBe('table');
    });

    it('returns valid results for sophie persona', async () => {
      const result = await executeQuery('Show me safety compliance report', 'sophie');

      expect(result.status).toBe('success');
      expect(result.persona).toBe('sophie');
      expect(result.outputType).toBe('table');
    });

    it('returns valid results for james persona', async () => {
      const result = await executeQuery('Show me client engagement metrics', 'james');

      expect(result.status).toBe('success');
      expect(result.persona).toBe('james');
      expect(result.outputType).toBe('table');
    });
  });
});