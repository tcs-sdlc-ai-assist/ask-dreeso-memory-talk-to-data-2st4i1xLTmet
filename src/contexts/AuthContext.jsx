import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  login as authLogin,
  signup as authSignup,
  quickLogin as authQuickLogin,
  logout as authLogout,
  getCurrentSession,
  validateSession,
  isAuthenticated as checkIsAuthenticated,
} from '../services/authService.js';

/**
 * @typedef {Object} AuthContextValue
 * @property {Object|null} user - Current user session object
 * @property {string|null} persona - Current persona identifier
 * @property {string|null} role - Current user role
 * @property {string|null} cluster - Current user cluster
 * @property {boolean} isAuthenticated - Whether the user is authenticated
 * @property {boolean} isLoading - Whether auth state is being initialized
 * @property {function} login - Login with email and password
 * @property {function} signup - Register a new user
 * @property {function} quickLogin - Login as a predefined persona
 * @property {function} logout - Log out the current user
 */

const AuthContext = createContext(null);

/**
 * Extracts user state from a session object
 * @param {Object|null} session - The session object
 * @returns {Object} The extracted user state
 */
function extractUserState(session) {
  if (!session) {
    return {
      user: null,
      persona: null,
      role: null,
      cluster: null,
      isAuthenticated: false,
    };
  }

  return {
    user: session,
    persona: session.persona || null,
    role: session.role || null,
    cluster: session.cluster || null,
    isAuthenticated: true,
  };
}

/**
 * Authentication context provider component.
 * Provides authentication state and methods to all children.
 * Initializes from localStorage on mount.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} The provider component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [persona, setPersona] = useState(null);
  const [role, setRole] = useState(null);
  const [cluster, setCluster] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Applies a session to the local state
   * @param {Object|null} session - The session object
   */
  const applySession = useCallback((session) => {
    const state = extractUserState(session);
    setUser(state.user);
    setPersona(state.persona);
    setRole(state.role);
    setCluster(state.cluster);
    setIsAuthenticated(state.isAuthenticated);
  }, []);

  /**
   * Clears all auth state
   */
  const clearState = useCallback(() => {
    setUser(null);
    setPersona(null);
    setRole(null);
    setCluster(null);
    setIsAuthenticated(false);
  }, []);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    try {
      const validation = validateSession();
      if (validation.valid && validation.session) {
        applySession(validation.session);
      } else {
        clearState();
      }
    } catch (_err) {
      clearState();
    } finally {
      setIsLoading(false);
    }
  }, [applySession, clearState]);

  /**
   * Authenticates a user with email and password
   * @param {string} email - The user's email address
   * @param {string} password - The user's password
   * @returns {Promise<Object>} Result object with success, session, or error
   */
  const login = useCallback(async (email, password) => {
    try {
      const result = await authLogin(email, password);

      if (result.success && result.session) {
        applySession(result.session);
      }

      return result;
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      return { success: false, error: 'An error occurred during login. Please try again.' };
    }
  }, [applySession]);

  /**
   * Registers a new user account
   * @param {string} fullName - The user's full name
   * @param {string} email - The user's email address
   * @param {string} password - The user's password
   * @param {string} userRole - The user's role
   * @returns {Promise<Object>} Result object with success, userId, or error
   */
  const signup = useCallback(async (fullName, email, password, userRole) => {
    try {
      const result = await authSignup(fullName, email, password, userRole);
      return result;
    } catch (err) {
      console.error('AuthContext: Signup error:', err);
      return { success: false, error: 'An error occurred during signup. Please try again.' };
    }
  }, []);

  /**
   * Authenticates as a predefined persona without password
   * @param {string} personaName - The persona name (e.g., 'lukas', 'elena', 'sophie', 'james')
   * @returns {Promise<Object>} Result object with success, session, or error
   */
  const quickLogin = useCallback(async (personaName) => {
    try {
      const result = await authQuickLogin(personaName);

      if (result.success && result.session) {
        applySession(result.session);
      }

      return result;
    } catch (err) {
      console.error('AuthContext: Quick login error:', err);
      return { success: false, error: 'An error occurred during quick login. Please try again.' };
    }
  }, [applySession]);

  /**
   * Logs out the current user
   */
  const logout = useCallback(() => {
    try {
      authLogout();
    } catch (err) {
      console.error('AuthContext: Logout error:', err);
    } finally {
      clearState();
    }
  }, [clearState]);

  const value = useMemo(() => ({
    user,
    persona,
    role,
    cluster,
    isAuthenticated,
    isLoading,
    login,
    signup,
    quickLogin,
    logout,
  }), [
    user,
    persona,
    role,
    cluster,
    isAuthenticated,
    isLoading,
    login,
    signup,
    quickLogin,
    logout,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook for consuming the AuthContext.
 * Must be used within an AuthProvider.
 *
 * @returns {AuthContextValue} The authentication context value
 * @throws {Error} If used outside of an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;