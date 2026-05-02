/**
 * Client-side authentication service
 * Implements login, signup, quick login, logout, session management.
 * All operations are audit-logged via auditLogService.
 * @module authService
 */

import { getSession, setSession, clearSession, getItem, setItem } from './localStorageService.js';
import { logAction, ACTION_TYPES } from './auditLogService.js';
import { findUserByEmail, findUserByUsername, MOCK_USERS } from '../data/mockData.js';
import { PERSONAS, STORAGE_KEYS } from '../utils/constants.js';
import { generateId, hashPassword, validateEmail, validatePassword } from '../utils/helpers.js';

/**
 * localStorage key for registered users
 * @type {string}
 */
const USERS_STORAGE_KEY = 'ask_dreeso_users';

/**
 * Session duration in milliseconds (2 hours)
 * @type {number}
 */
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

/**
 * Retrieves the registered users array from localStorage.
 * Falls back to an empty array if nothing is stored.
 * @returns {Array<Object>} Array of user objects
 */
function getStoredUsers() {
  const users = getItem(USERS_STORAGE_KEY);
  if (!Array.isArray(users)) {
    return [];
  }
  return users;
}

/**
 * Stores the users array to localStorage.
 * @param {Array<Object>} users - Array of user objects
 * @returns {boolean} Whether the operation succeeded
 */
function setStoredUsers(users) {
  if (!Array.isArray(users)) {
    return false;
  }
  return setItem(USERS_STORAGE_KEY, users);
}

/**
 * Finds a user by email in both mock users and stored users.
 * @param {string} email - The email to search for
 * @returns {Object|null} The user object or null
 */
function findUserAcrossStores(email) {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check mock users first
  const mockUser = findUserByEmail(normalizedEmail);
  if (mockUser) {
    return mockUser;
  }

  // Check stored (signed-up) users
  const storedUsers = getStoredUsers();
  const storedUser = storedUsers.find(
    (u) => u.email.toLowerCase() === normalizedEmail
  );
  if (storedUser) {
    return storedUser;
  }

  return null;
}

/**
 * Creates a session object from a user record.
 * @param {Object} user - The user object
 * @returns {Object} The session object
 */
function createSessionObject(user) {
  const now = Date.now();
  return {
    userId: user.id,
    fullName: user.name || user.fullName || user.username,
    email: user.email,
    role: user.role,
    persona: user.persona || user.username,
    cluster: user.cluster,
    avatar: user.avatar || user.persona || user.username,
    token: generateId(32),
    createdAt: new Date(now).toISOString(),
    expiresAt: now + SESSION_DURATION_MS,
  };
}

/**
 * Authenticates a user with email and password.
 * Validates against mock users and stored users with hashed password comparison.
 *
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise<Object>} Result object with success, session, or error
 */
export async function login(email, password) {
  if (!email || typeof email !== 'string' || !email.trim()) {
    logAction(ACTION_TYPES.LOGIN_FAIL, null, { email, reason: 'Email is required' });
    return { success: false, error: 'Email is required' };
  }

  if (!password || typeof password !== 'string') {
    logAction(ACTION_TYPES.LOGIN_FAIL, null, { email, reason: 'Password is required' });
    return { success: false, error: 'Password is required' };
  }

  if (!validateEmail(email)) {
    logAction(ACTION_TYPES.LOGIN_FAIL, null, { email, reason: 'Invalid email format' });
    return { success: false, error: 'Invalid email format' };
  }

  const user = findUserAcrossStores(email);

  if (!user) {
    logAction(ACTION_TYPES.LOGIN_FAIL, null, { email, reason: 'Invalid credentials' });
    return { success: false, error: 'Invalid credentials' };
  }

  try {
    const hashedInput = await hashPassword(password);

    if (user.passwordHash !== hashedInput) {
      logAction(ACTION_TYPES.LOGIN_FAIL, user.id, { email, reason: 'Invalid credentials' });
      return { success: false, error: 'Invalid credentials' };
    }

    const session = createSessionObject(user);
    const stored = setSession(session);

    if (!stored) {
      logAction(ACTION_TYPES.LOGIN_FAIL, user.id, { email, reason: 'Failed to persist session' });
      return { success: false, error: 'Failed to create session. Please try again.' };
    }

    setItem(STORAGE_KEYS.SELECTED_PERSONA, session.persona);

    logAction(ACTION_TYPES.LOGIN, user.id, {
      email: user.email,
      persona: session.persona,
      role: session.role,
    });

    return { success: true, session };
  } catch (err) {
    logAction(ACTION_TYPES.LOGIN_FAIL, null, { email, reason: err.message });
    return { success: false, error: 'An error occurred during login. Please try again.' };
  }
}

/**
 * Registers a new user account.
 * Creates a new user in localStorage with hashed password.
 *
 * @param {string} fullName - The user's full name
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @param {string} role - The user's role
 * @returns {Promise<Object>} Result object with success, userId, or error
 */
export async function signup(fullName, email, password, role) {
  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    logAction(ACTION_TYPES.SIGNUP_FAIL, null, { email, reason: 'Full name is required' });
    return { success: false, error: 'Full name is required' };
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    logAction(ACTION_TYPES.SIGNUP_FAIL, null, { email, reason: 'Email is required' });
    return { success: false, error: 'Email is required' };
  }

  if (!validateEmail(email)) {
    logAction(ACTION_TYPES.SIGNUP_FAIL, null, { email, reason: 'Invalid email format' });
    return { success: false, error: 'Invalid email format' };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    logAction(ACTION_TYPES.SIGNUP_FAIL, null, { email, reason: passwordValidation.errors.join(', ') });
    return { success: false, error: passwordValidation.errors[0] };
  }

  if (!role || typeof role !== 'string' || !role.trim()) {
    logAction(ACTION_TYPES.SIGNUP_FAIL, null, { email, reason: 'Role is required' });
    return { success: false, error: 'Role is required' };
  }

  // Check if email already exists
  const existingUser = findUserAcrossStores(email);
  if (existingUser) {
    logAction(ACTION_TYPES.SIGNUP_FAIL, null, { email, reason: 'Email already exists' });
    return { success: false, error: 'Email already exists' };
  }

  try {
    const hashedPw = await hashPassword(password);
    const userId = `user-${generateId(8)}`;

    // Determine cluster from role
    const cluster = mapRoleToCluster(role);

    const newUser = {
      id: userId,
      username: fullName.toLowerCase().split(' ')[0],
      fullName: fullName.trim(),
      name: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashedPw,
      persona: fullName.toLowerCase().split(' ')[0],
      role: role.trim(),
      cluster,
      avatar: fullName.toLowerCase().split(' ')[0],
      createdAt: new Date().toISOString(),
    };

    const storedUsers = getStoredUsers();
    storedUsers.push(newUser);
    const saved = setStoredUsers(storedUsers);

    if (!saved) {
      logAction(ACTION_TYPES.SIGNUP_FAIL, null, { email, reason: 'Failed to persist user' });
      return { success: false, error: 'Failed to create account. Please try again.' };
    }

    logAction(ACTION_TYPES.SIGNUP, userId, {
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
    });

    return { success: true, userId };
  } catch (err) {
    logAction(ACTION_TYPES.SIGNUP_FAIL, null, { email, reason: err.message });
    return { success: false, error: 'An error occurred during signup. Please try again.' };
  }
}

/**
 * Authenticates as a predefined persona without password.
 * Used for quick demo/persona switching.
 *
 * @param {string} personaName - The persona name (e.g., 'lukas', 'elena', 'sophie', 'james')
 * @returns {Promise<Object>} Result object with success, session, or error
 */
export async function quickLogin(personaName) {
  if (!personaName || typeof personaName !== 'string') {
    logAction(ACTION_TYPES.LOGIN_FAIL, null, { persona: personaName, reason: 'Persona name is required' });
    return { success: false, error: 'Persona name is required' };
  }

  const normalizedName = personaName.toLowerCase().trim();

  // Find the persona in PERSONAS constant
  const personaKey = Object.keys(PERSONAS).find(
    (key) => PERSONAS[key].id === normalizedName
  );

  if (!personaKey) {
    logAction(ACTION_TYPES.LOGIN_FAIL, null, { persona: personaName, reason: 'Invalid persona' });
    return { success: false, error: 'Invalid persona' };
  }

  const persona = PERSONAS[personaKey];

  // Find the corresponding mock user
  const mockUser = findUserByUsername(persona.id);

  if (!mockUser) {
    logAction(ACTION_TYPES.LOGIN_FAIL, null, { persona: personaName, reason: 'Persona user not found' });
    return { success: false, error: 'Persona user not found' };
  }

  const session = createSessionObject(mockUser);
  const stored = setSession(session);

  if (!stored) {
    logAction(ACTION_TYPES.LOGIN_FAIL, mockUser.id, { persona: personaName, reason: 'Failed to persist session' });
    return { success: false, error: 'Failed to create session. Please try again.' };
  }

  setItem(STORAGE_KEYS.SELECTED_PERSONA, session.persona);

  logAction(ACTION_TYPES.PERSONA_SELECT, mockUser.id, {
    persona: session.persona,
    role: session.role,
    cluster: session.cluster,
  });

  logAction(ACTION_TYPES.LOGIN, mockUser.id, {
    email: mockUser.email,
    persona: session.persona,
    role: session.role,
    method: 'quickLogin',
  });

  return { success: true, session };
}

/**
 * Logs out the current user.
 * Clears session and selected persona from localStorage.
 *
 * @returns {void}
 */
export function logout() {
  const currentSession = getSession();
  const userId = currentSession ? currentSession.userId : null;

  clearSession();
  setItem(STORAGE_KEYS.SELECTED_PERSONA, null);

  logAction(ACTION_TYPES.LOGOUT, userId, {
    persona: currentSession ? currentSession.persona : null,
  });
}

/**
 * Retrieves the current session from localStorage.
 *
 * @returns {Object|null} The session object or null if no session exists
 */
export function getCurrentSession() {
  return getSession();
}

/**
 * Validates the current session integrity and expiration.
 *
 * @returns {{ valid: boolean, session: Object|null, error: string|null }} Validation result
 */
export function validateSession() {
  const session = getSession();

  if (!session) {
    return { valid: false, session: null, error: 'No active session' };
  }

  if (!session.userId || !session.token || !session.expiresAt) {
    logAction(ACTION_TYPES.SESSION_EXPIRED, session.userId || null, {
      reason: 'Invalid session structure',
    });
    clearSession();
    return { valid: false, session: null, error: 'Invalid session' };
  }

  const now = Date.now();
  if (now > session.expiresAt) {
    logAction(ACTION_TYPES.SESSION_EXPIRED, session.userId, {
      reason: 'Session expired',
      expiredAt: new Date(session.expiresAt).toISOString(),
    });
    clearSession();
    setItem(STORAGE_KEYS.SELECTED_PERSONA, null);
    return { valid: false, session: null, error: 'Session expired' };
  }

  return { valid: true, session, error: null };
}

/**
 * Refreshes the current session by extending its expiration.
 *
 * @returns {Object|null} The refreshed session or null if no valid session
 */
export function refreshSession() {
  const validation = validateSession();

  if (!validation.valid || !validation.session) {
    return null;
  }

  const refreshedSession = {
    ...validation.session,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  const stored = setSession(refreshedSession);
  if (!stored) {
    return null;
  }

  return refreshedSession;
}

/**
 * Checks if a user is currently authenticated with a valid session.
 *
 * @returns {boolean} Whether the user is authenticated
 */
export function isAuthenticated() {
  const validation = validateSession();
  return validation.valid;
}

/**
 * Maps a role string to a cluster identifier.
 * @param {string} role - The role string
 * @returns {string} The cluster identifier
 */
function mapRoleToCluster(role) {
  if (!role || typeof role !== 'string') {
    return 'operations';
  }

  const normalizedRole = role.toLowerCase().trim();

  if (normalizedRole.includes('finance') || normalizedRole.includes('qs') || normalizedRole.includes('quantity')) {
    return 'finance';
  }
  if (normalizedRole.includes('engineer') || normalizedRole.includes('technical') || normalizedRole.includes('site')) {
    return 'engineering';
  }
  if (normalizedRole.includes('sales') || normalizedRole.includes('business') || normalizedRole.includes('bd')) {
    return 'sales';
  }
  if (normalizedRole.includes('project') || normalizedRole.includes('operations') || normalizedRole.includes('manager')) {
    return 'operations';
  }

  return 'operations';
}