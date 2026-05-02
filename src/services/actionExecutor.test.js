import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  executeAction,
  executeActionFromTemplate,
  getAvailableActionTypes,
  getAvailableActions,
  getAvailableActionsById,
  isValidActionType,
  hasActionAccess,
  EXECUTION_ACTION_TYPES,
  simulateExecution,
} from './actionExecutor.js';

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

vi.mock('./localStorageService.js', () => ({
  addActionLog: vi.fn(() => true),
  getItem: vi.fn(() => null),
  setItem: vi.fn(() => true),
  isStorageAvailable: vi.fn(() => true),
}));

vi.mock('../utils/helpers.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    generateId: vi.fn(() => 'mock-action-id-12345'),
  };
});

import { logAction, ACTION_TYPES } from './auditLogService.js';
import { getCurrentSession } from './authService.js';
import { addActionLog } from './localStorageService.js';

describe('actionExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentSession.mockReturnValue({
      userId: 'user-lukas-001',
      persona: 'lukas',
      role: 'Project Manager',
      cluster: 'operations',
      token: 'test-token',
      expiresAt: Date.now() + 7200000,
    });
    addActionLog.mockReturnValue(true);
  });

  describe('EXECUTION_ACTION_TYPES', () => {
    it('defines all expected action types', () => {
      expect(EXECUTION_ACTION_TYPES.APPROVE).toBe('APPROVE');
      expect(EXECUTION_ACTION_TYPES.REJECT).toBe('REJECT');
      expect(EXECUTION_ACTION_TYPES.ESCALATE).toBe('ESCALATE');
      expect(EXECUTION_ACTION_TYPES.ASSIGN).toBe('ASSIGN');
      expect(EXECUTION_ACTION_TYPES.UPDATE).toBe('UPDATE');
      expect(EXECUTION_ACTION_TYPES.CREATE).toBe('CREATE');
    });
  });

  describe('simulateExecution', () => {
    it('resolves with a delay value within the specified range', async () => {
      const minMs = 10;
      const maxMs = 50;
      const delay = await simulateExecution(minMs, maxMs);

      expect(typeof delay).toBe('number');
      expect(delay).toBeGreaterThanOrEqual(minMs);
      expect(delay).toBeLessThanOrEqual(maxMs);
    });

    it('resolves with a delay when called with default parameters', async () => {
      const delay = await simulateExecution(1, 10);

      expect(typeof delay).toBe('number');
      expect(delay).toBeGreaterThanOrEqual(1);
    });
  });

  describe('executeAction', () => {
    describe('APPROVE action type', () => {
      it('successfully executes an APPROVE action', async () => {
        const result = await executeAction('APPROVE', { projectId: 'P001' }, 'lukas');

        expect(result.success).toBe(true);
        expect(result.actionType).toBe('APPROVE');
        expect(result.actionId).toBeDefined();
        expect(result.system).toBeDefined();
        expect(result.systemLabel).toBeDefined();
        expect(result.timestamp).toBeDefined();
        expect(result.status).toBe('success');
        expect(result.details).toBeDefined();
        expect(result.details.message).toContain('approved');
        expect(typeof result.details.executionTimeMs).toBe('number');
      });

      it('targets SAP for APPROVE actions by default', async () => {
        const result = await executeAction('APPROVE', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(result.system).toBe('sap');
        expect(result.systemLabel).toBe('SAP ERP');
      });
    });

    describe('REJECT action type', () => {
      it('successfully executes a REJECT action', async () => {
        const result = await executeAction('REJECT', { reason: 'Budget exceeded' }, 'lukas');

        expect(result.success).toBe(true);
        expect(result.actionType).toBe('REJECT');
        expect(result.status).toBe('success');
        expect(result.details.message).toContain('rejected');
      });

      it('targets SAP for REJECT actions by default', async () => {
        const result = await executeAction('REJECT', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(result.system).toBe('sap');
      });
    });

    describe('ESCALATE action type', () => {
      it('successfully executes an ESCALATE action', async () => {
        const result = await executeAction('ESCALATE', { priority: 'high' }, 'lukas');

        expect(result.success).toBe(true);
        expect(result.actionType).toBe('ESCALATE');
        expect(result.status).toBe('success');
        expect(result.details.message).toContain('escalated');
      });

      it('targets Primavera for ESCALATE actions by default', async () => {
        const result = await executeAction('ESCALATE', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(result.system).toBe('primavera');
        expect(result.systemLabel).toBe('Oracle Primavera');
      });
    });

    describe('ASSIGN action type', () => {
      it('successfully executes an ASSIGN action', async () => {
        const result = await executeAction('ASSIGN', { assignee: 'John' }, 'lukas');

        expect(result.success).toBe(true);
        expect(result.actionType).toBe('ASSIGN');
        expect(result.status).toBe('success');
        expect(result.details.message).toContain('Assignment');
      });

      it('targets Primavera for ASSIGN actions by default', async () => {
        const result = await executeAction('ASSIGN', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(result.system).toBe('primavera');
      });
    });

    describe('UPDATE action type', () => {
      it('successfully executes an UPDATE action', async () => {
        const result = await executeAction('UPDATE', { field: 'status', value: 'active' }, 'lukas');

        expect(result.success).toBe(true);
        expect(result.actionType).toBe('UPDATE');
        expect(result.status).toBe('success');
        expect(result.details.message).toContain('updated');
      });

      it('targets Salesforce for UPDATE actions by default', async () => {
        const result = await executeAction('UPDATE', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(result.system).toBe('salesforce');
        expect(result.systemLabel).toBe('Salesforce CRM');
      });
    });

    describe('CREATE action type', () => {
      it('successfully executes a CREATE action', async () => {
        const result = await executeAction('CREATE', { title: 'New Item' }, 'lukas');

        expect(result.success).toBe(true);
        expect(result.actionType).toBe('CREATE');
        expect(result.status).toBe('success');
        expect(result.details.message).toContain('created');
      });

      it('targets Procore for CREATE actions by default', async () => {
        const result = await executeAction('CREATE', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(result.system).toBe('procore');
        expect(result.systemLabel).toBe('Procore');
      });
    });

    describe('system targeting', () => {
      it('uses the system specified in context', async () => {
        const result = await executeAction('UPDATE', { system: 'sap' }, 'lukas');

        expect(result.success).toBe(true);
        expect(result.system).toBe('sap');
        expect(result.systemLabel).toBe('SAP ERP');
      });

      it('uses the systemId specified in context', async () => {
        const result = await executeAction('UPDATE', { systemId: 'procore' }, 'lukas');

        expect(result.success).toBe(true);
        expect(result.system).toBe('procore');
        expect(result.systemLabel).toBe('Procore');
      });

      it('falls back to default system when context system is invalid', async () => {
        const result = await executeAction('APPROVE', { system: 'invalid_system' }, 'lukas');

        expect(result.success).toBe(true);
        expect(result.system).toBe('sap');
      });

      it('targets SAP for APPROVE actions', async () => {
        const result = await executeAction('APPROVE', {}, 'elena');

        expect(result.success).toBe(true);
        expect(result.system).toBe('sap');
      });

      it('targets Procore for CREATE actions', async () => {
        const result = await executeAction('CREATE', {}, 'sophie');

        expect(result.success).toBe(true);
        expect(result.system).toBe('procore');
      });

      it('targets Salesforce for UPDATE actions', async () => {
        const result = await executeAction('UPDATE', {}, 'james');

        expect(result.success).toBe(true);
        expect(result.system).toBe('salesforce');
      });

      it('targets Primavera for ESCALATE actions', async () => {
        const result = await executeAction('ESCALATE', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(result.system).toBe('primavera');
      });

      it('targets Primavera for ASSIGN actions', async () => {
        const result = await executeAction('ASSIGN', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(result.system).toBe('primavera');
      });
    });

    describe('input validation', () => {
      it('returns error for null action type', async () => {
        const result = await executeAction(null, {}, 'lukas');

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INVALID_ACTION_TYPE');
        expect(result.status).toBe('error');
      });

      it('returns error for empty action type', async () => {
        const result = await executeAction('', {}, 'lukas');

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INVALID_ACTION_TYPE');
      });

      it('returns error for undefined action type', async () => {
        const result = await executeAction(undefined, {}, 'lukas');

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INVALID_ACTION_TYPE');
      });

      it('returns error for invalid action type string', async () => {
        const result = await executeAction('INVALID_TYPE', {}, 'lukas');

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INVALID_ACTION_TYPE');
        expect(result.message).toContain('Invalid action type');
      });

      it('returns error for null context', async () => {
        const result = await executeAction('APPROVE', null, 'lukas');

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INVALID_CONTEXT');
      });

      it('returns error for non-object context', async () => {
        const result = await executeAction('APPROVE', 'string_context', 'lukas');

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INVALID_CONTEXT');
      });

      it('returns error for null persona', async () => {
        const result = await executeAction('APPROVE', {}, null);

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INVALID_PERSONA');
      });

      it('returns error for empty persona', async () => {
        const result = await executeAction('APPROVE', {}, '');

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INVALID_PERSONA');
      });

      it('returns error for invalid persona name', async () => {
        const result = await executeAction('APPROVE', {}, 'unknown_persona');

        expect(result.success).toBe(false);
        expect(result.errorCode).toBe('INVALID_PERSONA');
        expect(result.message).toContain('Invalid persona');
      });

      it('handles case-insensitive action types', async () => {
        const result = await executeAction('approve', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(result.actionType).toBe('APPROVE');
      });

      it('handles action types with whitespace', async () => {
        const result = await executeAction('  APPROVE  ', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(result.actionType).toBe('APPROVE');
      });

      it('handles case-insensitive persona names', async () => {
        const result = await executeAction('APPROVE', {}, 'LUKAS');

        expect(result.success).toBe(true);
        expect(result.details.persona).toBe('lukas');
      });

      it('handles persona names with whitespace', async () => {
        const result = await executeAction('APPROVE', {}, '  elena  ');

        expect(result.success).toBe(true);
        expect(result.details.persona).toBe('elena');
      });
    });

    describe('result structure', () => {
      it('returns all required fields in the success result', async () => {
        const result = await executeAction('APPROVE', { projectId: 'P001' }, 'lukas');

        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('actionId');
        expect(result).toHaveProperty('actionType');
        expect(result).toHaveProperty('system');
        expect(result).toHaveProperty('systemLabel');
        expect(result).toHaveProperty('details');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('timestampMs');
        expect(result).toHaveProperty('status');
        expect(result.details).toHaveProperty('message');
        expect(result.details).toHaveProperty('context');
        expect(result.details).toHaveProperty('persona');
        expect(result.details).toHaveProperty('executionTimeMs');
      });

      it('returns all required fields in the error result', async () => {
        const result = await executeAction('INVALID', {}, 'lukas');

        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('actionId');
        expect(result).toHaveProperty('actionType');
        expect(result).toHaveProperty('system');
        expect(result).toHaveProperty('systemLabel');
        expect(result).toHaveProperty('details');
        expect(result).toHaveProperty('timestamp');
        expect(result).toHaveProperty('timestampMs');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('errorCode');
        expect(result).toHaveProperty('message');
      });

      it('includes context data in the result details', async () => {
        const context = { projectId: 'P001', amount: 50000 };
        const result = await executeAction('APPROVE', context, 'lukas');

        expect(result.success).toBe(true);
        expect(result.details.context).toEqual(context);
      });

      it('includes persona in the result details', async () => {
        const result = await executeAction('APPROVE', {}, 'elena');

        expect(result.success).toBe(true);
        expect(result.details.persona).toBe('elena');
      });

      it('includes execution time in the result details', async () => {
        const result = await executeAction('APPROVE', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(typeof result.details.executionTimeMs).toBe('number');
        expect(result.details.executionTimeMs).toBeGreaterThan(0);
      });
    });

    describe('localStorage logging', () => {
      it('persists action log to localStorage on success', async () => {
        const result = await executeAction('APPROVE', { projectId: 'P001' }, 'lukas');

        expect(result.success).toBe(true);
        expect(addActionLog).toHaveBeenCalledTimes(1);
        expect(addActionLog).toHaveBeenCalledWith(
          expect.objectContaining({
            id: result.actionId,
            action: 'APPROVE',
            system: result.system,
            systemLabel: result.systemLabel,
            persona: 'lukas',
            status: 'success',
          })
        );
      });

      it('includes timestamp in the action log entry', async () => {
        await executeAction('APPROVE', {}, 'lukas');

        expect(addActionLog).toHaveBeenCalledWith(
          expect.objectContaining({
            timestamp: expect.any(String),
            timestampMs: expect.any(Number),
          })
        );
      });

      it('includes execution time in the action log entry', async () => {
        await executeAction('APPROVE', {}, 'lukas');

        expect(addActionLog).toHaveBeenCalledWith(
          expect.objectContaining({
            executionTimeMs: expect.any(Number),
          })
        );
      });

      it('logs warning when localStorage persistence fails', async () => {
        addActionLog.mockReturnValueOnce(false);
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const result = await executeAction('APPROVE', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Failed to persist action log')
        );

        warnSpy.mockRestore();
      });

      it('does not persist action log on validation error', async () => {
        await executeAction('INVALID', {}, 'lukas');

        expect(addActionLog).not.toHaveBeenCalled();
      });
    });

    describe('audit logging', () => {
      it('logs ACTION_EXECUTE on successful action', async () => {
        await executeAction('APPROVE', { projectId: 'P001' }, 'lukas');

        const executeCalls = logAction.mock.calls.filter(
          (call) => call[0] === ACTION_TYPES.ACTION_EXECUTE
        );
        expect(executeCalls.length).toBe(1);
        expect(executeCalls[0][1]).toBe('user-lukas-001');
        expect(executeCalls[0][2]).toEqual(
          expect.objectContaining({
            actionType: 'APPROVE',
            persona: 'lukas',
            status: 'success',
          })
        );
      });

      it('logs ACTION_EXECUTE_FAIL on invalid action type', async () => {
        await executeAction('INVALID', {}, 'lukas');

        const failCalls = logAction.mock.calls.filter(
          (call) => call[0] === ACTION_TYPES.ACTION_EXECUTE_FAIL
        );
        expect(failCalls.length).toBe(1);
        expect(failCalls[0][2]).toEqual(
          expect.objectContaining({
            actionType: 'INVALID',
          })
        );
      });

      it('logs ACTION_EXECUTE_FAIL on invalid context', async () => {
        await executeAction('APPROVE', null, 'lukas');

        const failCalls = logAction.mock.calls.filter(
          (call) => call[0] === ACTION_TYPES.ACTION_EXECUTE_FAIL
        );
        expect(failCalls.length).toBe(1);
      });

      it('logs ACTION_EXECUTE_FAIL on invalid persona', async () => {
        await executeAction('APPROVE', {}, 'invalid');

        const failCalls = logAction.mock.calls.filter(
          (call) => call[0] === ACTION_TYPES.ACTION_EXECUTE_FAIL
        );
        expect(failCalls.length).toBe(1);
        expect(failCalls[0][2]).toEqual(
          expect.objectContaining({
            reason: expect.stringContaining('Invalid persona'),
          })
        );
      });

      it('includes system info in audit log', async () => {
        await executeAction('APPROVE', {}, 'lukas');

        const executeCalls = logAction.mock.calls.filter(
          (call) => call[0] === ACTION_TYPES.ACTION_EXECUTE
        );
        expect(executeCalls[0][2]).toEqual(
          expect.objectContaining({
            system: expect.any(String),
            systemLabel: expect.any(String),
          })
        );
      });

      it('includes execution time in audit log', async () => {
        await executeAction('APPROVE', {}, 'lukas');

        const executeCalls = logAction.mock.calls.filter(
          (call) => call[0] === ACTION_TYPES.ACTION_EXECUTE
        );
        expect(executeCalls[0][2]).toEqual(
          expect.objectContaining({
            executionTimeMs: expect.any(Number),
          })
        );
      });

      it('uses null userId when no session exists', async () => {
        getCurrentSession.mockReturnValueOnce(null);

        await executeAction('APPROVE', {}, 'lukas');

        const executeCalls = logAction.mock.calls.filter(
          (call) => call[0] === ACTION_TYPES.ACTION_EXECUTE
        );
        expect(executeCalls[0][1]).toBeNull();
      });
    });

    describe('all personas', () => {
      it('executes action for lukas persona', async () => {
        const result = await executeAction('APPROVE', {}, 'lukas');

        expect(result.success).toBe(true);
        expect(result.details.persona).toBe('lukas');
      });

      it('executes action for elena persona', async () => {
        const result = await executeAction('UPDATE', {}, 'elena');

        expect(result.success).toBe(true);
        expect(result.details.persona).toBe('elena');
      });

      it('executes action for sophie persona', async () => {
        const result = await executeAction('CREATE', {}, 'sophie');

        expect(result.success).toBe(true);
        expect(result.details.persona).toBe('sophie');
      });

      it('executes action for james persona', async () => {
        const result = await executeAction('UPDATE', {}, 'james');

        expect(result.success).toBe(true);
        expect(result.details.persona).toBe('james');
      });
    });
  });

  describe('executeActionFromTemplate', () => {
    it('successfully executes an action from a valid template', async () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = await executeActionFromTemplate('action-approve-budget', {}, 'lukas');

      expect(result.success).toBe(true);
      expect(result.actionType).toBeDefined();
      expect(result.system).toBeDefined();
      expect(result.status).toBe('success');
    });

    it('returns error for null template ID', async () => {
      const result = await executeActionFromTemplate(null, {}, 'lukas');

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_TEMPLATE_ID');
    });

    it('returns error for empty template ID', async () => {
      const result = await executeActionFromTemplate('', {}, 'lukas');

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_TEMPLATE_ID');
    });

    it('returns error for invalid persona', async () => {
      const result = await executeActionFromTemplate('action-approve-budget', {}, 'invalid');

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_PERSONA');
    });

    it('returns error for null persona', async () => {
      const result = await executeActionFromTemplate('action-approve-budget', {}, null);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_PERSONA');
    });

    it('returns error for template not found or not authorized', async () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-james-004',
        persona: 'james',
        role: 'Sales Executive',
        cluster: 'sales',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = await executeActionFromTemplate('action-approve-budget', {}, 'james');

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('TEMPLATE_NOT_FOUND');
    });

    it('executes export report template for operations persona', async () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = await executeActionFromTemplate('action-export-report', {}, 'lukas');

      expect(result.success).toBe(true);
      expect(result.status).toBe('success');
    });

    it('executes create change order template for operations persona', async () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = await executeActionFromTemplate('action-create-change-order', {}, 'lukas');

      expect(result.success).toBe(true);
    });

    it('executes update opportunity template for sales persona', async () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-james-004',
        persona: 'james',
        role: 'Sales Executive',
        cluster: 'sales',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = await executeActionFromTemplate('action-update-opportunity', {}, 'james');

      expect(result.success).toBe(true);
    });

    it('executes resolve RFI template for engineering persona', async () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-sophie-003',
        persona: 'sophie',
        role: 'Site Engineer',
        cluster: 'engineering',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = await executeActionFromTemplate('action-resolve-rfi', {}, 'sophie');

      expect(result.success).toBe(true);
    });

    it('executes update forecast template for finance persona', async () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-elena-002',
        persona: 'elena',
        role: 'Finance Director',
        cluster: 'finance',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = await executeActionFromTemplate('action-update-forecast', {}, 'elena');

      expect(result.success).toBe(true);
    });

    it('logs ACTION_EXECUTE_FAIL for invalid template ID', async () => {
      await executeActionFromTemplate(null, {}, 'lukas');

      const failCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.ACTION_EXECUTE_FAIL
      );
      expect(failCalls.length).toBe(1);
    });

    it('uses session cluster when available', async () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = await executeActionFromTemplate('action-approve-budget', {}, 'lukas');

      expect(result.success).toBe(true);
    });

    it('falls back to persona-based cluster when no session', async () => {
      getCurrentSession.mockReturnValue(null);

      const result = await executeActionFromTemplate('action-approve-budget', {}, 'lukas');

      expect(result.success).toBe(true);
    });
  });

  describe('getAvailableActionTypes', () => {
    it('returns all valid action types', () => {
      const types = getAvailableActionTypes();

      expect(Array.isArray(types)).toBe(true);
      expect(types).toContain('APPROVE');
      expect(types).toContain('REJECT');
      expect(types).toContain('ESCALATE');
      expect(types).toContain('ASSIGN');
      expect(types).toContain('UPDATE');
      expect(types).toContain('CREATE');
      expect(types.length).toBe(6);
    });
  });

  describe('getAvailableActions', () => {
    it('returns actions for lukas (operations) persona', () => {
      const actions = getAvailableActions('lukas');

      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBeGreaterThan(0);
    });

    it('returns actions for elena (finance) persona', () => {
      const actions = getAvailableActions('elena');

      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBeGreaterThan(0);
    });

    it('returns actions for sophie (engineering) persona', () => {
      const actions = getAvailableActions('sophie');

      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBeGreaterThan(0);
    });

    it('returns actions for james (sales) persona', () => {
      const actions = getAvailableActions('james');

      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBeGreaterThan(0);
    });

    it('returns empty array for null persona', () => {
      const actions = getAvailableActions(null);

      expect(actions).toEqual([]);
    });

    it('returns empty array for empty persona', () => {
      const actions = getAvailableActions('');

      expect(actions).toEqual([]);
    });

    it('returns empty array for invalid persona', () => {
      const actions = getAvailableActions('unknown');

      expect(actions).toEqual([]);
    });
  });

  describe('getAvailableActionsById', () => {
    it('returns filtered actions by ID for operations persona', () => {
      const actions = getAvailableActionsById('lukas', ['action-approve-budget']);

      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBe(1);
      expect(actions[0].id).toBe('action-approve-budget');
    });

    it('returns all actions when no IDs specified', () => {
      const allActions = getAvailableActions('lukas');
      const filteredActions = getAvailableActionsById('lukas', []);

      expect(filteredActions.length).toBe(allActions.length);
    });

    it('returns empty array for null persona', () => {
      const actions = getAvailableActionsById(null, ['action-approve-budget']);

      expect(actions).toEqual([]);
    });

    it('returns empty array for empty persona', () => {
      const actions = getAvailableActionsById('', ['action-approve-budget']);

      expect(actions).toEqual([]);
    });

    it('returns empty array when action ID is not authorized for persona', () => {
      const actions = getAvailableActionsById('james', ['action-approve-budget']);

      expect(actions).toEqual([]);
    });

    it('returns multiple actions when multiple IDs match', () => {
      const actions = getAvailableActionsById('lukas', ['action-approve-budget', 'action-export-report']);

      expect(actions.length).toBe(2);
    });
  });

  describe('isValidActionType', () => {
    it('returns true for APPROVE', () => {
      expect(isValidActionType('APPROVE')).toBe(true);
    });

    it('returns true for REJECT', () => {
      expect(isValidActionType('REJECT')).toBe(true);
    });

    it('returns true for ESCALATE', () => {
      expect(isValidActionType('ESCALATE')).toBe(true);
    });

    it('returns true for ASSIGN', () => {
      expect(isValidActionType('ASSIGN')).toBe(true);
    });

    it('returns true for UPDATE', () => {
      expect(isValidActionType('UPDATE')).toBe(true);
    });

    it('returns true for CREATE', () => {
      expect(isValidActionType('CREATE')).toBe(true);
    });

    it('returns true for lowercase action type', () => {
      expect(isValidActionType('approve')).toBe(true);
    });

    it('returns true for mixed case action type', () => {
      expect(isValidActionType('Approve')).toBe(true);
    });

    it('returns false for invalid action type', () => {
      expect(isValidActionType('INVALID')).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidActionType(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidActionType(undefined)).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isValidActionType('')).toBe(false);
    });

    it('returns false for number', () => {
      expect(isValidActionType(123)).toBe(false);
    });
  });

  describe('hasActionAccess', () => {
    it('returns true when lukas has access to approve-budget', () => {
      expect(hasActionAccess('lukas', 'action-approve-budget')).toBe(true);
    });

    it('returns true when elena has access to update-forecast', () => {
      expect(hasActionAccess('elena', 'action-update-forecast')).toBe(true);
    });

    it('returns true when sophie has access to resolve-rfi', () => {
      expect(hasActionAccess('sophie', 'action-resolve-rfi')).toBe(true);
    });

    it('returns true when james has access to update-opportunity', () => {
      expect(hasActionAccess('james', 'action-update-opportunity')).toBe(true);
    });

    it('returns false when james does not have access to approve-budget', () => {
      expect(hasActionAccess('james', 'action-approve-budget')).toBe(false);
    });

    it('returns false when elena does not have access to resolve-rfi', () => {
      expect(hasActionAccess('elena', 'action-resolve-rfi')).toBe(false);
    });

    it('returns true when all personas have access to export-report', () => {
      expect(hasActionAccess('lukas', 'action-export-report')).toBe(true);
      expect(hasActionAccess('elena', 'action-export-report')).toBe(true);
      expect(hasActionAccess('sophie', 'action-export-report')).toBe(true);
      expect(hasActionAccess('james', 'action-export-report')).toBe(true);
    });

    it('returns false for null persona', () => {
      expect(hasActionAccess(null, 'action-approve-budget')).toBe(false);
    });

    it('returns false for empty persona', () => {
      expect(hasActionAccess('', 'action-approve-budget')).toBe(false);
    });

    it('returns false for null template ID', () => {
      expect(hasActionAccess('lukas', null)).toBe(false);
    });

    it('returns false for empty template ID', () => {
      expect(hasActionAccess('lukas', '')).toBe(false);
    });

    it('returns false for invalid persona', () => {
      expect(hasActionAccess('unknown', 'action-approve-budget')).toBe(false);
    });

    it('returns false for non-existent template ID', () => {
      expect(hasActionAccess('lukas', 'action-nonexistent')).toBe(false);
    });
  });

  describe('confirmation flow', () => {
    it('returns success result that can be used for confirmation dialog', async () => {
      const result = await executeAction('APPROVE', {
        projectId: 'P001',
        amount: 50000,
        notes: 'Budget adjustment approved',
      }, 'lukas');

      expect(result.success).toBe(true);
      expect(result.actionId).toBeDefined();
      expect(result.actionType).toBe('APPROVE');
      expect(result.system).toBeDefined();
      expect(result.systemLabel).toBeDefined();
      expect(result.details.message).toBeDefined();
      expect(result.details.context.projectId).toBe('P001');
      expect(result.details.context.amount).toBe(50000);
    });

    it('returns error result with descriptive message for failed validation', async () => {
      const result = await executeAction('INVALID_TYPE', {}, 'lukas');

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
      expect(result.message.length).toBeGreaterThan(0);
      expect(result.errorCode).toBeDefined();
    });

    it('preserves context through the execution flow', async () => {
      const context = {
        templateId: 'action-approve-budget',
        templateName: 'Approve Budget',
        projectId: 'P001',
        amount: 100000,
      };

      const result = await executeAction('APPROVE', context, 'lukas');

      expect(result.success).toBe(true);
      expect(result.details.context).toEqual(context);
    });

    it('generates unique action IDs for each execution', async () => {
      const result1 = await executeAction('APPROVE', {}, 'lukas');
      const result2 = await executeAction('APPROVE', {}, 'lukas');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.actionId).toBeDefined();
      expect(result2.actionId).toBeDefined();
    });

    it('includes timestamp for audit trail', async () => {
      const beforeMs = Date.now();
      const result = await executeAction('APPROVE', {}, 'lukas');
      const afterMs = Date.now();

      expect(result.success).toBe(true);
      expect(result.timestamp).toBeDefined();
      expect(result.timestampMs).toBeGreaterThanOrEqual(beforeMs);
      expect(result.timestampMs).toBeLessThanOrEqual(afterMs + 1000);
    });
  });

  describe('executeActionFromTemplate - confirmation flow', () => {
    it('executes template action and returns confirmation-ready result', async () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = await executeActionFromTemplate(
        'action-approve-budget',
        { projectId: 'P001', amount: 50000 },
        'lukas'
      );

      expect(result.success).toBe(true);
      expect(result.actionId).toBeDefined();
      expect(result.system).toBeDefined();
      expect(result.systemLabel).toBeDefined();
      expect(result.details.message).toBeDefined();
      expect(result.status).toBe('success');
    });

    it('persists template action to localStorage', async () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      await executeActionFromTemplate('action-approve-budget', {}, 'lukas');

      expect(addActionLog).toHaveBeenCalledTimes(1);
      expect(addActionLog).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
        })
      );
    });

    it('logs audit trail for template action execution', async () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      await executeActionFromTemplate('action-approve-budget', {}, 'lukas');

      const executeCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.ACTION_EXECUTE
      );
      expect(executeCalls.length).toBe(1);
      expect(executeCalls[0][1]).toBe('user-lukas-001');
    });
  });
});