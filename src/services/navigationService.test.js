import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  navigateTo,
  getCurrentScreen,
  getCurrentView,
  getPersona,
  getScreenConfig,
  getScreenPath,
  getScreenIdByPath,
  validateNavigation,
  getPersonaFlow,
  navigateBack,
  navigateToDashboard,
  navigateToQueryInput,
  navigateToError,
  getAllScreenConfigs,
  getFullNavigationState,
  getCurrentScreenConfig,
  currentScreenRequiresAuth,
} from './navigationService.js';
import { SCREEN_IDS, VIEW_STATES, PERSONAS, STORAGE_KEYS } from '../utils/constants.js';

vi.mock('./localStorageService.js', () => ({
  getNavigationState: vi.fn(() => null),
  setNavigationState: vi.fn(() => true),
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
  getCurrentSession: vi.fn(() => null),
}));

import { getNavigationState, setNavigationState, getItem } from './localStorageService.js';
import { logAction, ACTION_TYPES } from './auditLogService.js';
import { getCurrentSession } from './authService.js';

describe('navigationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getNavigationState.mockReturnValue(null);
    setNavigationState.mockReturnValue(true);
    getItem.mockReturnValue(null);
    getCurrentSession.mockReturnValue(null);
  });

  describe('navigateTo', () => {
    it('successfully navigates to a public screen without authentication', () => {
      const result = navigateTo(SCREEN_IDS.SPLASH);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(setNavigationState).toHaveBeenCalledTimes(1);
      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: SCREEN_IDS.SPLASH,
          screenName: 'Splash',
        })
      );
    });

    it('successfully navigates to persona select screen without authentication', () => {
      const result = navigateTo(SCREEN_IDS.PERSONA_SELECT);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: SCREEN_IDS.PERSONA_SELECT,
          screenName: 'Persona Select',
        })
      );
    });

    it('successfully navigates to dashboard with valid authenticated session', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateTo(SCREEN_IDS.DASHBOARD);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: SCREEN_IDS.DASHBOARD,
          currentView: VIEW_STATES.QUERY_INPUT,
          persona: 'lukas',
          cluster: 'operations',
        })
      );
    });

    it('successfully navigates with a specific view state', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateTo(SCREEN_IDS.QUERY_INPUT, VIEW_STATES.LOADING);

      expect(result.success).toBe(true);
      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: SCREEN_IDS.QUERY_INPUT,
          currentView: VIEW_STATES.LOADING,
        })
      );
    });

    it('returns error for invalid screen ID (negative)', () => {
      const result = navigateTo(-1);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid screen ID');
      expect(setNavigationState).not.toHaveBeenCalled();
    });

    it('returns error for invalid screen ID (too high)', () => {
      const result = navigateTo(21);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid screen ID');
      expect(setNavigationState).not.toHaveBeenCalled();
    });

    it('returns error for non-integer screen ID', () => {
      const result = navigateTo(2.5);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid screen ID');
    });

    it('returns error for string screen ID', () => {
      const result = navigateTo('dashboard');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid screen ID');
    });

    it('returns error for null screen ID', () => {
      const result = navigateTo(null);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid screen ID');
    });

    it('returns error for undefined screen ID', () => {
      const result = navigateTo(undefined);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid screen ID');
    });

    it('returns error for invalid view state', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateTo(SCREEN_IDS.DASHBOARD, 'INVALID_VIEW');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid view state');
    });

    it('returns error when navigating to auth-required screen without session', () => {
      getCurrentSession.mockReturnValue(null);

      const result = navigateTo(SCREEN_IDS.DASHBOARD);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication required');
    });

    it('returns error when navigating to auth-required screen with wrong cluster', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-test-001',
        persona: 'test',
        role: 'Test Role',
        cluster: 'nonexistent_cluster',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateTo(SCREEN_IDS.DASHBOARD);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });

    it('returns error when setNavigationState fails', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });
      setNavigationState.mockReturnValue(false);

      const result = navigateTo(SCREEN_IDS.DASHBOARD);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to update navigation state');
    });

    it('allows navigation to error screen without authentication', () => {
      getCurrentSession.mockReturnValue(null);

      const result = navigateTo(SCREEN_IDS.ERROR);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('allows all valid clusters to access dashboard', () => {
      const clusters = ['operations', 'finance', 'engineering', 'sales'];

      for (const cluster of clusters) {
        vi.clearAllMocks();
        setNavigationState.mockReturnValue(true);
        getCurrentSession.mockReturnValue({
          userId: `user-${cluster}-001`,
          persona: cluster,
          role: 'Test Role',
          cluster,
          token: 'test-token',
          expiresAt: Date.now() + 7200000,
        });

        const result = navigateTo(SCREEN_IDS.DASHBOARD);

        expect(result.success).toBe(true);
      }
    });

    it('uses default view state when null is passed', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateTo(SCREEN_IDS.DASHBOARD, null);

      expect(result.success).toBe(true);
      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentView: VIEW_STATES.QUERY_INPUT,
        })
      );
    });
  });

  describe('getCurrentScreen', () => {
    it('returns SPLASH (0) when no navigation state exists', () => {
      getNavigationState.mockReturnValue(null);

      const screen = getCurrentScreen();

      expect(screen).toBe(SCREEN_IDS.SPLASH);
    });

    it('returns the current screen from navigation state', () => {
      getNavigationState.mockReturnValue({
        currentScreen: SCREEN_IDS.DASHBOARD,
        currentView: VIEW_STATES.QUERY_INPUT,
      });

      const screen = getCurrentScreen();

      expect(screen).toBe(SCREEN_IDS.DASHBOARD);
    });

    it('returns SPLASH when navigation state has no currentScreen', () => {
      getNavigationState.mockReturnValue({
        currentView: VIEW_STATES.QUERY_INPUT,
      });

      const screen = getCurrentScreen();

      expect(screen).toBe(SCREEN_IDS.SPLASH);
    });

    it('returns SPLASH when currentScreen is not a number', () => {
      getNavigationState.mockReturnValue({
        currentScreen: 'dashboard',
        currentView: VIEW_STATES.QUERY_INPUT,
      });

      const screen = getCurrentScreen();

      expect(screen).toBe(SCREEN_IDS.SPLASH);
    });
  });

  describe('getCurrentView', () => {
    it('returns null when no navigation state exists', () => {
      getNavigationState.mockReturnValue(null);

      const view = getCurrentView();

      expect(view).toBeNull();
    });

    it('returns the current view from navigation state', () => {
      getNavigationState.mockReturnValue({
        currentScreen: SCREEN_IDS.DASHBOARD,
        currentView: VIEW_STATES.RESULT,
      });

      const view = getCurrentView();

      expect(view).toBe(VIEW_STATES.RESULT);
    });

    it('returns null when navigation state has no currentView', () => {
      getNavigationState.mockReturnValue({
        currentScreen: SCREEN_IDS.DASHBOARD,
      });

      const view = getCurrentView();

      expect(view).toBeNull();
    });

    it('returns null when currentView is empty string', () => {
      getNavigationState.mockReturnValue({
        currentScreen: SCREEN_IDS.DASHBOARD,
        currentView: '',
      });

      const view = getCurrentView();

      expect(view).toBeNull();
    });
  });

  describe('getPersona', () => {
    it('returns persona from session when available', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const persona = getPersona();

      expect(persona).toBe('lukas');
    });

    it('returns persona from localStorage when no session', () => {
      getCurrentSession.mockReturnValue(null);
      getItem.mockReturnValue('elena');

      const persona = getPersona();

      expect(persona).toBe('elena');
    });

    it('returns persona from navigation state as fallback', () => {
      getCurrentSession.mockReturnValue(null);
      getItem.mockReturnValue(null);
      getNavigationState.mockReturnValue({
        currentScreen: SCREEN_IDS.DASHBOARD,
        persona: 'sophie',
      });

      const persona = getPersona();

      expect(persona).toBe('sophie');
    });

    it('returns null when no persona is available anywhere', () => {
      getCurrentSession.mockReturnValue(null);
      getItem.mockReturnValue(null);
      getNavigationState.mockReturnValue(null);

      const persona = getPersona();

      expect(persona).toBeNull();
    });
  });

  describe('getScreenConfig', () => {
    it('returns config for a valid screen ID', () => {
      const config = getScreenConfig(SCREEN_IDS.DASHBOARD);

      expect(config).toBeDefined();
      expect(config.id).toBe(SCREEN_IDS.DASHBOARD);
      expect(config.name).toBe('Dashboard');
      expect(config.path).toBe('/dashboard');
      expect(config.requiresAuth).toBe(true);
    });

    it('returns config for splash screen', () => {
      const config = getScreenConfig(SCREEN_IDS.SPLASH);

      expect(config).toBeDefined();
      expect(config.id).toBe(SCREEN_IDS.SPLASH);
      expect(config.name).toBe('Splash');
      expect(config.path).toBe('/');
      expect(config.requiresAuth).toBe(false);
    });

    it('returns config for error screen', () => {
      const config = getScreenConfig(SCREEN_IDS.ERROR);

      expect(config).toBeDefined();
      expect(config.id).toBe(SCREEN_IDS.ERROR);
      expect(config.name).toBe('Error');
      expect(config.requiresAuth).toBe(false);
    });

    it('returns null for invalid screen ID', () => {
      const config = getScreenConfig(99);

      expect(config).toBeNull();
    });

    it('returns null for negative screen ID', () => {
      const config = getScreenConfig(-1);

      expect(config).toBeNull();
    });

    it('returns null for non-integer screen ID', () => {
      const config = getScreenConfig(2.5);

      expect(config).toBeNull();
    });

    it('returns null for string screen ID', () => {
      const config = getScreenConfig('dashboard');

      expect(config).toBeNull();
    });

    it('returns null for null screen ID', () => {
      const config = getScreenConfig(null);

      expect(config).toBeNull();
    });

    it('returns a copy of the config (not a reference)', () => {
      const config1 = getScreenConfig(SCREEN_IDS.DASHBOARD);
      const config2 = getScreenConfig(SCREEN_IDS.DASHBOARD);

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
    });
  });

  describe('getScreenPath', () => {
    it('returns path for dashboard screen', () => {
      const path = getScreenPath(SCREEN_IDS.DASHBOARD);

      expect(path).toBe('/dashboard');
    });

    it('returns path for splash screen', () => {
      const path = getScreenPath(SCREEN_IDS.SPLASH);

      expect(path).toBe('/');
    });

    it('returns path for query input screen', () => {
      const path = getScreenPath(SCREEN_IDS.QUERY_INPUT);

      expect(path).toBe('/query');
    });

    it('returns null for invalid screen ID', () => {
      const path = getScreenPath(99);

      expect(path).toBeNull();
    });

    it('returns null for null screen ID', () => {
      const path = getScreenPath(null);

      expect(path).toBeNull();
    });
  });

  describe('getScreenIdByPath', () => {
    it('returns screen ID for dashboard path', () => {
      const id = getScreenIdByPath('/dashboard');

      expect(id).toBe(SCREEN_IDS.DASHBOARD);
    });

    it('returns screen ID for root path', () => {
      const id = getScreenIdByPath('/');

      expect(id).toBe(SCREEN_IDS.SPLASH);
    });

    it('returns screen ID for query path', () => {
      const id = getScreenIdByPath('/query');

      expect(id).toBe(SCREEN_IDS.QUERY_INPUT);
    });

    it('returns screen ID for error path', () => {
      const id = getScreenIdByPath('/error');

      expect(id).toBe(SCREEN_IDS.ERROR);
    });

    it('returns null for unknown path', () => {
      const id = getScreenIdByPath('/unknown-path');

      expect(id).toBeNull();
    });

    it('returns null for null path', () => {
      const id = getScreenIdByPath(null);

      expect(id).toBeNull();
    });

    it('returns null for empty string path', () => {
      const id = getScreenIdByPath('');

      expect(id).toBeNull();
    });
  });

  describe('validateNavigation', () => {
    it('returns valid for public screens without persona', () => {
      const result = validateNavigation(SCREEN_IDS.SPLASH);

      expect(result.valid).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('returns valid for error screen without persona', () => {
      const result = validateNavigation(SCREEN_IDS.ERROR);

      expect(result.valid).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('returns valid for dashboard with operations persona', () => {
      const result = validateNavigation(SCREEN_IDS.DASHBOARD, 'lukas');

      expect(result.valid).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('returns valid for dashboard with finance persona', () => {
      const result = validateNavigation(SCREEN_IDS.DASHBOARD, 'elena');

      expect(result.valid).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('returns valid for dashboard with engineering persona', () => {
      const result = validateNavigation(SCREEN_IDS.DASHBOARD, 'sophie');

      expect(result.valid).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('returns valid for dashboard with sales persona', () => {
      const result = validateNavigation(SCREEN_IDS.DASHBOARD, 'james');

      expect(result.valid).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('returns invalid for auth-required screen without session or persona', () => {
      getCurrentSession.mockReturnValue(null);

      const result = validateNavigation(SCREEN_IDS.DASHBOARD);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Authentication required');
    });

    it('returns valid for auth-required screen with valid session', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = validateNavigation(SCREEN_IDS.DASHBOARD);

      expect(result.valid).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('returns invalid for invalid screen ID', () => {
      const result = validateNavigation(99);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Invalid screen ID');
    });

    it('returns invalid for negative screen ID', () => {
      const result = validateNavigation(-1);

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Invalid screen ID');
    });

    it('handles case-insensitive persona names', () => {
      const result = validateNavigation(SCREEN_IDS.DASHBOARD, 'LUKAS');

      expect(result.valid).toBe(true);
    });

    it('handles persona names with whitespace', () => {
      const result = validateNavigation(SCREEN_IDS.DASHBOARD, '  elena  ');

      expect(result.valid).toBe(true);
    });
  });

  describe('getPersonaFlow', () => {
    it('returns flow for lukas persona', () => {
      const flow = getPersonaFlow('lukas');

      expect(Array.isArray(flow)).toBe(true);
      expect(flow.length).toBeGreaterThan(0);
      expect(flow).toContain(SCREEN_IDS.SPLASH);
      expect(flow).toContain(SCREEN_IDS.DASHBOARD);
      expect(flow).toContain(SCREEN_IDS.QUERY_INPUT);
      expect(flow).toContain(SCREEN_IDS.ERROR);
    });

    it('returns flow for elena persona', () => {
      const flow = getPersonaFlow('elena');

      expect(Array.isArray(flow)).toBe(true);
      expect(flow.length).toBeGreaterThan(0);
      expect(flow).toContain(SCREEN_IDS.DASHBOARD);
    });

    it('returns flow for sophie persona', () => {
      const flow = getPersonaFlow('sophie');

      expect(Array.isArray(flow)).toBe(true);
      expect(flow.length).toBeGreaterThan(0);
      expect(flow).toContain(SCREEN_IDS.DASHBOARD);
    });

    it('returns flow for james persona', () => {
      const flow = getPersonaFlow('james');

      expect(Array.isArray(flow)).toBe(true);
      expect(flow.length).toBeGreaterThan(0);
      expect(flow).toContain(SCREEN_IDS.DASHBOARD);
    });

    it('returns default flow for null persona', () => {
      const flow = getPersonaFlow(null);

      expect(Array.isArray(flow)).toBe(true);
      expect(flow.length).toBeGreaterThan(0);
    });

    it('returns default flow for undefined persona', () => {
      const flow = getPersonaFlow(undefined);

      expect(Array.isArray(flow)).toBe(true);
      expect(flow.length).toBeGreaterThan(0);
    });

    it('returns default flow for unknown persona', () => {
      const flow = getPersonaFlow('unknown');

      expect(Array.isArray(flow)).toBe(true);
      expect(flow.length).toBeGreaterThan(0);
    });

    it('handles case-insensitive persona names', () => {
      const flow = getPersonaFlow('LUKAS');

      expect(Array.isArray(flow)).toBe(true);
      expect(flow).toContain(SCREEN_IDS.DASHBOARD);
    });

    it('returns a copy of the flow (not a reference)', () => {
      const flow1 = getPersonaFlow('lukas');
      const flow2 = getPersonaFlow('lukas');

      expect(flow1).toEqual(flow2);
      expect(flow1).not.toBe(flow2);
    });
  });

  describe('navigateBack', () => {
    it('navigates to dashboard when at the first screen', () => {
      getNavigationState.mockReturnValue({
        currentScreen: SCREEN_IDS.SPLASH,
        currentView: null,
      });
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateBack();

      expect(result.success).toBe(true);
      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: SCREEN_IDS.DASHBOARD,
        })
      );
    });

    it('navigates to dashboard when current screen is persona select and user is authenticated', () => {
      getNavigationState.mockReturnValue({
        currentScreen: SCREEN_IDS.DASHBOARD,
        currentView: VIEW_STATES.QUERY_INPUT,
      });
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateBack();

      expect(result.success).toBe(true);
    });

    it('navigates to dashboard when no navigation state exists', () => {
      getNavigationState.mockReturnValue(null);
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateBack();

      expect(result.success).toBe(true);
    });
  });

  describe('navigateToDashboard', () => {
    it('navigates to dashboard screen', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateToDashboard();

      expect(result.success).toBe(true);
      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: SCREEN_IDS.DASHBOARD,
        })
      );
    });

    it('fails when not authenticated', () => {
      getCurrentSession.mockReturnValue(null);

      const result = navigateToDashboard();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication required');
    });
  });

  describe('navigateToQueryInput', () => {
    it('navigates to query input screen with default view state', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateToQueryInput();

      expect(result.success).toBe(true);
      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: SCREEN_IDS.QUERY_INPUT,
          currentView: VIEW_STATES.QUERY_INPUT,
        })
      );
    });

    it('navigates to query input screen with custom view state', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateToQueryInput(VIEW_STATES.LOADING);

      expect(result.success).toBe(true);
      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: SCREEN_IDS.QUERY_INPUT,
          currentView: VIEW_STATES.LOADING,
        })
      );
    });

    it('fails when not authenticated', () => {
      getCurrentSession.mockReturnValue(null);

      const result = navigateToQueryInput();

      expect(result.success).toBe(false);
    });
  });

  describe('navigateToError', () => {
    it('navigates to error screen without authentication', () => {
      getCurrentSession.mockReturnValue(null);

      const result = navigateToError();

      expect(result.success).toBe(true);
      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: SCREEN_IDS.ERROR,
        })
      );
    });

    it('navigates to error screen with authentication', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateToError();

      expect(result.success).toBe(true);
    });
  });

  describe('getAllScreenConfigs', () => {
    it('returns an array of all screen configurations', () => {
      const configs = getAllScreenConfigs();

      expect(Array.isArray(configs)).toBe(true);
      expect(configs.length).toBe(21);
    });

    it('each config has required fields', () => {
      const configs = getAllScreenConfigs();

      for (const config of configs) {
        expect(config).toHaveProperty('id');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('path');
        expect(config).toHaveProperty('requiresAuth');
        expect(config).toHaveProperty('description');
      }
    });
  });

  describe('getFullNavigationState', () => {
    it('returns null when no navigation state exists', () => {
      getNavigationState.mockReturnValue(null);

      const state = getFullNavigationState();

      expect(state).toBeNull();
    });

    it('returns the full navigation state object', () => {
      const mockState = {
        currentScreen: SCREEN_IDS.DASHBOARD,
        currentView: VIEW_STATES.QUERY_INPUT,
        persona: 'lukas',
        cluster: 'operations',
        screenName: 'Dashboard',
        path: '/dashboard',
        timestamp: '2024-06-01T10:00:00Z',
      };
      getNavigationState.mockReturnValue(mockState);

      const state = getFullNavigationState();

      expect(state).toEqual(mockState);
    });
  });

  describe('getCurrentScreenConfig', () => {
    it('returns config for the current screen', () => {
      getNavigationState.mockReturnValue({
        currentScreen: SCREEN_IDS.DASHBOARD,
        currentView: VIEW_STATES.QUERY_INPUT,
      });

      const config = getCurrentScreenConfig();

      expect(config).toBeDefined();
      expect(config.id).toBe(SCREEN_IDS.DASHBOARD);
      expect(config.name).toBe('Dashboard');
    });

    it('returns splash config when no navigation state exists', () => {
      getNavigationState.mockReturnValue(null);

      const config = getCurrentScreenConfig();

      expect(config).toBeDefined();
      expect(config.id).toBe(SCREEN_IDS.SPLASH);
    });
  });

  describe('currentScreenRequiresAuth', () => {
    it('returns true when current screen requires auth', () => {
      getNavigationState.mockReturnValue({
        currentScreen: SCREEN_IDS.DASHBOARD,
        currentView: VIEW_STATES.QUERY_INPUT,
      });

      const requiresAuth = currentScreenRequiresAuth();

      expect(requiresAuth).toBe(true);
    });

    it('returns false when current screen does not require auth', () => {
      getNavigationState.mockReturnValue({
        currentScreen: SCREEN_IDS.SPLASH,
        currentView: null,
      });

      const requiresAuth = currentScreenRequiresAuth();

      expect(requiresAuth).toBe(false);
    });

    it('returns false when no navigation state exists (splash screen)', () => {
      getNavigationState.mockReturnValue(null);

      const requiresAuth = currentScreenRequiresAuth();

      expect(requiresAuth).toBe(false);
    });
  });

  describe('audit logging integration', () => {
    it('logs NAVIGATE action on successful navigation', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      navigateTo(SCREEN_IDS.DASHBOARD);

      const navigateCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.NAVIGATE
      );
      expect(navigateCalls.length).toBe(1);
      expect(navigateCalls[0][1]).toBe('user-lukas-001');
      expect(navigateCalls[0][2]).toEqual(
        expect.objectContaining({
          to: expect.objectContaining({
            screen: SCREEN_IDS.DASHBOARD,
            screenName: 'Dashboard',
            path: '/dashboard',
          }),
          persona: 'lukas',
          cluster: 'operations',
        })
      );
    });

    it('logs NAVIGATE_FAIL action on invalid screen ID', () => {
      navigateTo(-1);

      const failCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.NAVIGATE_FAIL
      );
      expect(failCalls.length).toBe(1);
      expect(failCalls[0][2]).toEqual(
        expect.objectContaining({
          reason: 'Invalid screen ID',
        })
      );
    });

    it('logs NAVIGATE_FAIL action on invalid view state', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      navigateTo(SCREEN_IDS.DASHBOARD, 'INVALID_VIEW');

      const failCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.NAVIGATE_FAIL
      );
      expect(failCalls.length).toBe(1);
      expect(failCalls[0][2]).toEqual(
        expect.objectContaining({
          reason: 'Invalid view state',
        })
      );
    });

    it('logs NAVIGATE_FAIL action when authentication is required', () => {
      getCurrentSession.mockReturnValue(null);

      navigateTo(SCREEN_IDS.DASHBOARD);

      const failCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.NAVIGATE_FAIL
      );
      expect(failCalls.length).toBe(1);
      expect(failCalls[0][2]).toEqual(
        expect.objectContaining({
          reason: 'Authentication required',
        })
      );
    });

    it('logs NAVIGATE_FAIL action when access is denied for cluster', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-test-001',
        persona: 'test',
        role: 'Test Role',
        cluster: 'nonexistent_cluster',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      navigateTo(SCREEN_IDS.DASHBOARD);

      const failCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.NAVIGATE_FAIL
      );
      expect(failCalls.length).toBe(1);
      expect(failCalls[0][2]).toEqual(
        expect.objectContaining({
          reason: 'Access denied for cluster',
        })
      );
    });

    it('logs NAVIGATE_FAIL action when persistence fails', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });
      setNavigationState.mockReturnValue(false);

      navigateTo(SCREEN_IDS.DASHBOARD);

      const failCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.NAVIGATE_FAIL
      );
      expect(failCalls.length).toBe(1);
      expect(failCalls[0][2]).toEqual(
        expect.objectContaining({
          reason: 'Failed to persist navigation state',
        })
      );
    });

    it('includes previous navigation state in NAVIGATE log', () => {
      const previousState = {
        currentScreen: SCREEN_IDS.QUERY_INPUT,
        currentView: VIEW_STATES.QUERY_INPUT,
        screenName: 'Query Input',
      };
      getNavigationState.mockReturnValue(previousState);
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      navigateTo(SCREEN_IDS.RESULT_OVERVIEW);

      const navigateCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.NAVIGATE
      );
      expect(navigateCalls.length).toBe(1);
      expect(navigateCalls[0][2]).toEqual(
        expect.objectContaining({
          from: expect.objectContaining({
            screen: SCREEN_IDS.QUERY_INPUT,
            view: VIEW_STATES.QUERY_INPUT,
            screenName: 'Query Input',
          }),
        })
      );
    });

    it('logs null for from when no previous navigation state exists', () => {
      getNavigationState.mockReturnValue(null);
      getCurrentSession.mockReturnValue(null);

      navigateTo(SCREEN_IDS.SPLASH);

      const navigateCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.NAVIGATE
      );
      expect(navigateCalls.length).toBe(1);
      expect(navigateCalls[0][2]).toEqual(
        expect.objectContaining({
          from: null,
        })
      );
    });

    it('uses null userId when no session exists', () => {
      getCurrentSession.mockReturnValue(null);

      navigateTo(SCREEN_IDS.SPLASH);

      const navigateCalls = logAction.mock.calls.filter(
        (call) => call[0] === ACTION_TYPES.NAVIGATE
      );
      expect(navigateCalls.length).toBe(1);
      expect(navigateCalls[0][1]).toBeNull();
    });
  });

  describe('role-based access enforcement', () => {
    it('allows operations cluster to access all auth-required screens', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const authScreens = [
        SCREEN_IDS.DASHBOARD,
        SCREEN_IDS.QUERY_INPUT,
        SCREEN_IDS.LOADING,
        SCREEN_IDS.RESULT_OVERVIEW,
        SCREEN_IDS.RESULT_DETAIL,
        SCREEN_IDS.HISTORY,
        SCREEN_IDS.SETTINGS,
      ];

      for (const screenId of authScreens) {
        vi.clearAllMocks();
        setNavigationState.mockReturnValue(true);
        getCurrentSession.mockReturnValue({
          userId: 'user-lukas-001',
          persona: 'lukas',
          role: 'Project Manager',
          cluster: 'operations',
          token: 'test-token',
          expiresAt: Date.now() + 7200000,
        });

        const result = navigateTo(screenId);
        expect(result.success).toBe(true);
      }
    });

    it('allows finance cluster to access dashboard', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-elena-002',
        persona: 'elena',
        role: 'Finance Director',
        cluster: 'finance',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateTo(SCREEN_IDS.DASHBOARD);

      expect(result.success).toBe(true);
    });

    it('allows engineering cluster to access dashboard', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-sophie-003',
        persona: 'sophie',
        role: 'Site Engineer',
        cluster: 'engineering',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateTo(SCREEN_IDS.DASHBOARD);

      expect(result.success).toBe(true);
    });

    it('allows sales cluster to access dashboard', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-james-004',
        persona: 'james',
        role: 'Sales Executive',
        cluster: 'sales',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateTo(SCREEN_IDS.DASHBOARD);

      expect(result.success).toBe(true);
    });

    it('denies access for unknown cluster', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-test-001',
        persona: 'test',
        role: 'Unknown Role',
        cluster: 'unknown',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateTo(SCREEN_IDS.DASHBOARD);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });

    it('denies access when cluster is null', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-test-001',
        persona: 'test',
        role: 'Test Role',
        cluster: null,
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateTo(SCREEN_IDS.DASHBOARD);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });

    it('denies access when cluster is empty string', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-test-001',
        persona: 'test',
        role: 'Test Role',
        cluster: '',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      const result = navigateTo(SCREEN_IDS.DASHBOARD);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access denied');
    });
  });

  describe('navigation state persistence', () => {
    it('persists navigation state with all required fields', () => {
      getCurrentSession.mockReturnValue({
        userId: 'user-lukas-001',
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        token: 'test-token',
        expiresAt: Date.now() + 7200000,
      });

      navigateTo(SCREEN_IDS.DASHBOARD, VIEW_STATES.RESULT);

      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: SCREEN_IDS.DASHBOARD,
          currentView: VIEW_STATES.RESULT,
          persona: 'lukas',
          cluster: 'operations',
          screenName: 'Dashboard',
          path: '/dashboard',
          timestamp: expect.any(String),
        })
      );
    });

    it('persists null persona and cluster for public screens', () => {
      getCurrentSession.mockReturnValue(null);

      navigateTo(SCREEN_IDS.SPLASH);

      expect(setNavigationState).toHaveBeenCalledWith(
        expect.objectContaining({
          currentScreen: SCREEN_IDS.SPLASH,
          persona: null,
          cluster: null,
        })
      );
    });
  });
});