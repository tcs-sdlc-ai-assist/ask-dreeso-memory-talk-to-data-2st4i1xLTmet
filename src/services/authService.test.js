import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  login,
  signup,
  quickLogin,
  logout,
  getCurrentSession,
  validateSession,
  refreshSession,
  isAuthenticated,
} from './authService.js';
import { getSession, setSession, clearSession, getItem, setItem } from './localStorageService.js';
import { logAction, ACTION_TYPES } from './auditLogService.js';
import { PERSONAS, STORAGE_KEYS } from '../utils/constants.js';

vi.mock('./localStorageService.js', () => ({
  getSession: vi.fn(),
  setSession: vi.fn(),
  clearSession: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
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

vi.mock('../utils/helpers.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    generateId: vi.fn(() => 'mock-generated-id-12345678'),
    hashPassword: vi.fn(async (password) => {
      if (password === 'Password1') {
        return '4ac91ac7c5ef22c1a7b7d7b1a315bce82e7f0e2b0a0e1f3c5d6a7b8c9d0e1f2a';
      }
      return `hashed-${password}`;
    }),
  };
});

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSession.mockReturnValue(null);
    setSession.mockReturnValue(true);
    clearSession.mockReturnValue(true);
    getItem.mockReturnValue(null);
    setItem.mockReturnValue(true);
  });

  describe('login', () => {
    it('successfully logs in with valid credentials for lukas', async () => {
      const result = await login('lukas@dreeso.com', 'Password1');

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.persona).toBe('lukas');
      expect(result.session.role).toBe(PERSONAS.LUKAS.role);
      expect(result.session.cluster).toBe(PERSONAS.LUKAS.cluster);
      expect(result.session.email).toBe('lukas@dreeso.com');
      expect(result.session.token).toBeDefined();
      expect(result.session.expiresAt).toBeGreaterThan(Date.now());
      expect(setSession).toHaveBeenCalledTimes(1);
      expect(setItem).toHaveBeenCalledWith(STORAGE_KEYS.SELECTED_PERSONA, 'lukas');
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.LOGIN,
        expect.any(String),
        expect.objectContaining({
          email: 'lukas@dreeso.com',
          persona: 'lukas',
        })
      );
    });

    it('returns error when email is empty', async () => {
      const result = await login('', 'Password1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email is required');
      expect(setSession).not.toHaveBeenCalled();
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.LOGIN_FAIL,
        null,
        expect.objectContaining({ reason: 'Email is required' })
      );
    });

    it('returns error when email is null', async () => {
      const result = await login(null, 'Password1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('returns error when password is empty', async () => {
      const result = await login('lukas@dreeso.com', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password is required');
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.LOGIN_FAIL,
        null,
        expect.objectContaining({ reason: 'Password is required' })
      );
    });

    it('returns error when password is null', async () => {
      const result = await login('lukas@dreeso.com', null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password is required');
    });

    it('returns error for invalid email format', async () => {
      const result = await login('not-an-email', 'Password1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.LOGIN_FAIL,
        null,
        expect.objectContaining({ reason: 'Invalid email format' })
      );
    });

    it('returns error for non-existent user', async () => {
      const result = await login('nonexistent@dreeso.com', 'Password1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.LOGIN_FAIL,
        null,
        expect.objectContaining({ reason: 'Invalid credentials' })
      );
    });

    it('returns error for wrong password', async () => {
      const result = await login('lukas@dreeso.com', 'WrongPassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('returns error when session persistence fails', async () => {
      setSession.mockReturnValue(false);

      const result = await login('lukas@dreeso.com', 'Password1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create session. Please try again.');
    });

    it('handles case-insensitive email lookup', async () => {
      const result = await login('LUKAS@DREESO.COM', 'Password1');

      expect(result.success).toBe(true);
      expect(result.session.persona).toBe('lukas');
    });
  });

  describe('signup', () => {
    it('successfully creates a new user account', async () => {
      const result = await signup('Test User', 'test@example.com', 'TestPass1', 'Project Manager');

      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.SIGNUP,
        expect.any(String),
        expect.objectContaining({
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'Project Manager',
        })
      );
    });

    it('returns error when full name is empty', async () => {
      const result = await signup('', 'test@example.com', 'TestPass1', 'Project Manager');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Full name is required');
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.SIGNUP_FAIL,
        null,
        expect.objectContaining({ reason: 'Full name is required' })
      );
    });

    it('returns error when email is empty', async () => {
      const result = await signup('Test User', '', 'TestPass1', 'Project Manager');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email is required');
    });

    it('returns error for invalid email format', async () => {
      const result = await signup('Test User', 'bad-email', 'TestPass1', 'Project Manager');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email format');
    });

    it('returns error when password is too short', async () => {
      const result = await signup('Test User', 'test@example.com', 'Ab1', 'Project Manager');

      expect(result.success).toBe(false);
      expect(result.error).toContain('at least 8 characters');
    });

    it('returns error when password lacks uppercase', async () => {
      const result = await signup('Test User', 'test@example.com', 'testpass1', 'Project Manager');

      expect(result.success).toBe(false);
      expect(result.error).toContain('uppercase');
    });

    it('returns error when password lacks lowercase', async () => {
      const result = await signup('Test User', 'test@example.com', 'TESTPASS1', 'Project Manager');

      expect(result.success).toBe(false);
      expect(result.error).toContain('lowercase');
    });

    it('returns error when password lacks number', async () => {
      const result = await signup('Test User', 'test@example.com', 'TestPasss', 'Project Manager');

      expect(result.success).toBe(false);
      expect(result.error).toContain('number');
    });

    it('returns error when role is empty', async () => {
      const result = await signup('Test User', 'test@example.com', 'TestPass1', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Role is required');
    });

    it('returns error when email already exists (mock user)', async () => {
      const result = await signup('Lukas Clone', 'lukas@dreeso.com', 'TestPass1', 'Project Manager');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });

    it('returns error when user persistence fails', async () => {
      setItem.mockReturnValue(false);

      const result = await signup('Test User', 'newuser@example.com', 'TestPass1', 'Project Manager');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create account. Please try again.');
    });

    it('maps finance role to finance cluster', async () => {
      setItem.mockImplementation((key, value) => {
        if (key === 'ask_dreeso_users') {
          const users = value;
          expect(users[users.length - 1].cluster).toBe('finance');
        }
        return true;
      });

      const result = await signup('Finance User', 'finance@example.com', 'TestPass1', 'Finance Director');

      expect(result.success).toBe(true);
    });

    it('maps engineering role to engineering cluster', async () => {
      setItem.mockImplementation((key, value) => {
        if (key === 'ask_dreeso_users') {
          const users = value;
          expect(users[users.length - 1].cluster).toBe('engineering');
        }
        return true;
      });

      const result = await signup('Engineer User', 'engineer@example.com', 'TestPass1', 'Site Engineer');

      expect(result.success).toBe(true);
    });

    it('maps sales role to sales cluster', async () => {
      setItem.mockImplementation((key, value) => {
        if (key === 'ask_dreeso_users') {
          const users = value;
          expect(users[users.length - 1].cluster).toBe('sales');
        }
        return true;
      });

      const result = await signup('Sales User', 'sales@example.com', 'TestPass1', 'Sales Executive');

      expect(result.success).toBe(true);
    });
  });

  describe('quickLogin', () => {
    it('successfully logs in as Lukas', async () => {
      const result = await quickLogin('lukas');

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.persona).toBe('lukas');
      expect(result.session.role).toBe(PERSONAS.LUKAS.role);
      expect(result.session.cluster).toBe(PERSONAS.LUKAS.cluster);
      expect(setSession).toHaveBeenCalledTimes(1);
      expect(setItem).toHaveBeenCalledWith(STORAGE_KEYS.SELECTED_PERSONA, 'lukas');
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.PERSONA_SELECT,
        expect.any(String),
        expect.objectContaining({ persona: 'lukas' })
      );
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.LOGIN,
        expect.any(String),
        expect.objectContaining({
          persona: 'lukas',
          method: 'quickLogin',
        })
      );
    });

    it('successfully logs in as Elena', async () => {
      const result = await quickLogin('elena');

      expect(result.success).toBe(true);
      expect(result.session.persona).toBe('elena');
      expect(result.session.role).toBe(PERSONAS.ELENA.role);
      expect(result.session.cluster).toBe(PERSONAS.ELENA.cluster);
    });

    it('successfully logs in as Sophie', async () => {
      const result = await quickLogin('sophie');

      expect(result.success).toBe(true);
      expect(result.session.persona).toBe('sophie');
      expect(result.session.role).toBe(PERSONAS.SOPHIE.role);
      expect(result.session.cluster).toBe(PERSONAS.SOPHIE.cluster);
    });

    it('successfully logs in as James', async () => {
      const result = await quickLogin('james');

      expect(result.success).toBe(true);
      expect(result.session.persona).toBe('james');
      expect(result.session.role).toBe(PERSONAS.JAMES.role);
      expect(result.session.cluster).toBe(PERSONAS.JAMES.cluster);
    });

    it('handles case-insensitive persona name', async () => {
      const result = await quickLogin('LUKAS');

      expect(result.success).toBe(true);
      expect(result.session.persona).toBe('lukas');
    });

    it('handles persona name with whitespace', async () => {
      const result = await quickLogin('  elena  ');

      expect(result.success).toBe(true);
      expect(result.session.persona).toBe('elena');
    });

    it('returns error for invalid persona name', async () => {
      const result = await quickLogin('unknown');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid persona');
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.LOGIN_FAIL,
        null,
        expect.objectContaining({ reason: 'Invalid persona' })
      );
    });

    it('returns error when persona name is empty', async () => {
      const result = await quickLogin('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Persona name is required');
    });

    it('returns error when persona name is null', async () => {
      const result = await quickLogin(null);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Persona name is required');
    });

    it('returns error when session persistence fails', async () => {
      setSession.mockReturnValue(false);

      const result = await quickLogin('lukas');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create session. Please try again.');
    });
  });

  describe('logout', () => {
    it('clears session and selected persona on logout', () => {
      const mockSession = {
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      };
      getSession.mockReturnValue(mockSession);

      logout();

      expect(clearSession).toHaveBeenCalledTimes(1);
      expect(setItem).toHaveBeenCalledWith(STORAGE_KEYS.SELECTED_PERSONA, null);
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.LOGOUT,
        'user-lukas-001',
        expect.objectContaining({ persona: 'lukas' })
      );
    });

    it('handles logout when no session exists', () => {
      getSession.mockReturnValue(null);

      logout();

      expect(clearSession).toHaveBeenCalledTimes(1);
      expect(setItem).toHaveBeenCalledWith(STORAGE_KEYS.SELECTED_PERSONA, null);
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.LOGOUT,
        null,
        expect.objectContaining({ persona: null })
      );
    });
  });

  describe('getCurrentSession', () => {
    it('returns the current session from localStorage', () => {
      const mockSession = {
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      };
      getSession.mockReturnValue(mockSession);

      const session = getCurrentSession();

      expect(session).toEqual(mockSession);
      expect(session.userId).toBe('user-lukas-001');
      expect(session.persona).toBe('lukas');
    });

    it('returns null when no session exists', () => {
      getSession.mockReturnValue(null);

      const session = getCurrentSession();

      expect(session).toBeNull();
    });
  });

  describe('validateSession', () => {
    it('returns valid for a non-expired session', () => {
      const mockSession = {
        userId: 'user-lukas-001',
        persona: 'lukas',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      };
      getSession.mockReturnValue(mockSession);

      const result = validateSession();

      expect(result.valid).toBe(true);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('returns invalid when no session exists', () => {
      getSession.mockReturnValue(null);

      const result = validateSession();

      expect(result.valid).toBe(false);
      expect(result.session).toBeNull();
      expect(result.error).toBe('No active session');
    });

    it('returns invalid for expired session and clears it', () => {
      const mockSession = {
        userId: 'user-lukas-001',
        persona: 'lukas',
        token: 'test-token',
        expiresAt: Date.now() - 1000,
      };
      getSession.mockReturnValue(mockSession);

      const result = validateSession();

      expect(result.valid).toBe(false);
      expect(result.session).toBeNull();
      expect(result.error).toBe('Session expired');
      expect(clearSession).toHaveBeenCalledTimes(1);
      expect(setItem).toHaveBeenCalledWith(STORAGE_KEYS.SELECTED_PERSONA, null);
      expect(logAction).toHaveBeenCalledWith(
        ACTION_TYPES.SESSION_EXPIRED,
        'user-lukas-001',
        expect.objectContaining({ reason: 'Session expired' })
      );
    });

    it('returns invalid for session with missing userId', () => {
      const mockSession = {
        persona: 'lukas',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      };
      getSession.mockReturnValue(mockSession);

      const result = validateSession();

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid session');
      expect(clearSession).toHaveBeenCalledTimes(1);
    });

    it('returns invalid for session with missing token', () => {
      const mockSession = {
        userId: 'user-lukas-001',
        persona: 'lukas',
        expiresAt: Date.now() + 7200000,
      };
      getSession.mockReturnValue(mockSession);

      const result = validateSession();

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid session');
    });

    it('returns invalid for session with missing expiresAt', () => {
      const mockSession = {
        userId: 'user-lukas-001',
        persona: 'lukas',
        token: 'test-token',
      };
      getSession.mockReturnValue(mockSession);

      const result = validateSession();

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid session');
    });
  });

  describe('refreshSession', () => {
    it('extends the session expiration for a valid session', () => {
      const originalExpiry = Date.now() + 1000;
      const mockSession = {
        userId: 'user-lukas-001',
        persona: 'lukas',
        token: 'test-token',
        expiresAt: originalExpiry,
      };
      getSession.mockReturnValue(mockSession);

      const refreshed = refreshSession();

      expect(refreshed).not.toBeNull();
      expect(refreshed.expiresAt).toBeGreaterThan(originalExpiry);
      expect(refreshed.userId).toBe('user-lukas-001');
      expect(setSession).toHaveBeenCalledTimes(1);
    });

    it('returns null when no valid session exists', () => {
      getSession.mockReturnValue(null);

      const refreshed = refreshSession();

      expect(refreshed).toBeNull();
    });

    it('returns null when session persistence fails', () => {
      const mockSession = {
        userId: 'user-lukas-001',
        persona: 'lukas',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      };
      getSession.mockReturnValue(mockSession);
      setSession.mockReturnValue(false);

      const refreshed = refreshSession();

      expect(refreshed).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when a valid session exists', () => {
      const mockSession = {
        userId: 'user-lukas-001',
        persona: 'lukas',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      };
      getSession.mockReturnValue(mockSession);

      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when no session exists', () => {
      getSession.mockReturnValue(null);

      expect(isAuthenticated()).toBe(false);
    });

    it('returns false when session is expired', () => {
      const mockSession = {
        userId: 'user-lukas-001',
        persona: 'lukas',
        token: 'test-token',
        expiresAt: Date.now() - 1000,
      };
      getSession.mockReturnValue(mockSession);

      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('audit log integration', () => {
    it('logs LOGIN action on successful login', async () => {
      await login('lukas@dreeso.com', 'Password1');

      const loginCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.LOGIN
      );
      expect(loginCalls.length).toBe(1);
      expect(loginCalls[0][1]).toBe('user-lukas-001');
      expect(loginCalls[0][2]).toEqual(
        expect.objectContaining({
          email: 'lukas@dreeso.com',
          persona: 'lukas',
        })
      );
    });

    it('logs LOGIN_FAIL action on failed login', async () => {
      await login('lukas@dreeso.com', 'WrongPassword');

      const failCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.LOGIN_FAIL
      );
      expect(failCalls.length).toBeGreaterThanOrEqual(1);
    });

    it('logs PERSONA_SELECT and LOGIN on quickLogin', async () => {
      await quickLogin('elena');

      const personaSelectCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.PERSONA_SELECT
      );
      const loginCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.LOGIN
      );

      expect(personaSelectCalls.length).toBe(1);
      expect(personaSelectCalls[0][2]).toEqual(
        expect.objectContaining({
          persona: 'elena',
          role: PERSONAS.ELENA.role,
          cluster: PERSONAS.ELENA.cluster,
        })
      );

      expect(loginCalls.length).toBe(1);
      expect(loginCalls[0][2]).toEqual(
        expect.objectContaining({
          persona: 'elena',
          method: 'quickLogin',
        })
      );
    });

    it('logs LOGOUT action on logout', () => {
      const mockSession = {
        userId: 'user-elena-002',
        persona: 'elena',
        role: 'Finance Director',
        cluster: 'finance',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      };
      getSession.mockReturnValue(mockSession);

      logout();

      const logoutCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.LOGOUT
      );
      expect(logoutCalls.length).toBe(1);
      expect(logoutCalls[0][1]).toBe('user-elena-002');
      expect(logoutCalls[0][2]).toEqual(
        expect.objectContaining({ persona: 'elena' })
      );
    });

    it('logs SIGNUP action on successful signup', async () => {
      await signup('New User', 'newuser@example.com', 'TestPass1', 'Operations Manager');

      const signupCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.SIGNUP
      );
      expect(signupCalls.length).toBe(1);
      expect(signupCalls[0][2]).toEqual(
        expect.objectContaining({
          email: 'newuser@example.com',
          fullName: 'New User',
          role: 'Operations Manager',
        })
      );
    });

    it('logs SIGNUP_FAIL action on failed signup', async () => {
      await signup('', 'test@example.com', 'TestPass1', 'Project Manager');

      const failCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.SIGNUP_FAIL
      );
      expect(failCalls.length).toBe(1);
    });

    it('logs SESSION_EXPIRED when validating an expired session', () => {
      const mockSession = {
        userId: 'user-sophie-003',
        persona: 'sophie',
        token: 'test-token',
        expiresAt: Date.now() - 5000,
      };
      getSession.mockReturnValue(mockSession);

      validateSession();

      const expiredCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.SESSION_EXPIRED
      );
      expect(expiredCalls.length).toBe(1);
      expect(expiredCalls[0][1]).toBe('user-sophie-003');
      expect(expiredCalls[0][2]).toEqual(
        expect.objectContaining({ reason: 'Session expired' })
      );
    });
  });
});