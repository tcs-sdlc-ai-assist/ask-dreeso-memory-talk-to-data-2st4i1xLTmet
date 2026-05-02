import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigation } from '../contexts/NavigationContext.jsx';
import { PERSONAS, SCREEN_IDS } from '../utils/constants.js';

/**
 * Persona avatar color mappings for quick login buttons
 * @type {Object<string, string>}
 */
const PERSONA_GRADIENTS = {
  [PERSONAS.LUKAS.id]: 'from-accent-blue to-accent-cyan',
  [PERSONAS.ELENA.id]: 'from-accent-green to-accent-cyan',
  [PERSONAS.SOPHIE.id]: 'from-accent-purple to-accent-pink',
  [PERSONAS.JAMES.id]: 'from-accent-orange to-accent-blue',
};

/**
 * Persona cluster badge colors
 * @type {Object<string, string>}
 */
const CLUSTER_BADGE_STYLES = {
  operations: 'bg-accent-blue/15 text-accent-blue',
  finance: 'bg-accent-green/15 text-accent-green',
  engineering: 'bg-accent-purple/15 text-accent-purple',
  sales: 'bg-accent-orange/15 text-accent-orange',
};

/**
 * Loading spinner SVG component
 * @returns {React.ReactElement}
 */
function LoadingSpinner() {
  return (
    <svg
      className="w-5 h-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Email icon SVG component
 * @returns {React.ReactElement}
 */
function EmailIcon() {
  return (
    <svg
      className="w-5 h-5 text-slate-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  );
}

/**
 * Lock icon SVG component
 * @returns {React.ReactElement}
 */
function LockIcon() {
  return (
    <svg
      className="w-5 h-5 text-slate-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Eye icon for password visibility toggle
 * @param {Object} props
 * @param {boolean} props.visible - Whether the password is visible
 * @returns {React.ReactElement}
 */
function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg
        className="w-5 h-5 text-slate-400"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
          clipRule="evenodd"
        />
        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
      </svg>
    );
  }

  return (
    <svg
      className="w-5 h-5 text-slate-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path
        fillRule="evenodd"
        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

EyeIcon.propTypes = {
  visible: PropTypes.bool.isRequired,
};

/**
 * Quick login persona card component
 * @param {Object} props
 * @param {Object} props.persona - Persona object from constants
 * @param {function} props.onClick - Click handler
 * @param {boolean} props.isLoading - Whether a login is in progress
 * @param {string|null} props.loadingPersona - The persona currently being logged in
 * @returns {React.ReactElement}
 */
function PersonaQuickLoginCard({ persona, onClick, isLoading, loadingPersona }) {
  const gradient = PERSONA_GRADIENTS[persona.id] || 'from-slate-500 to-slate-400';
  const clusterStyle = CLUSTER_BADGE_STYLES[persona.cluster] || 'bg-slate-500/15 text-slate-400';
  const isThisLoading = isLoading && loadingPersona === persona.id;
  const isDisabled = isLoading;

  const handleClick = () => {
    if (!isDisabled && typeof onClick === 'function') {
      onClick(persona.id);
    }
  };

  const handleKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !isDisabled) {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      className={classNames(
        'flex flex-col items-center gap-2',
        'p-4',
        'rounded-xl',
        'border border-white/10',
        'bg-secondary-500/30',
        'backdrop-blur-sm',
        'transition-all duration-300 ease-in-out',
        'hover:bg-secondary-500/50',
        'hover:border-white/20',
        'hover:translate-y-[-2px]',
        'hover:shadow-[0_0_16px_rgba(59,130,246,0.15)]',
        'active:translate-y-0',
        'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:bg-secondary-500/30 disabled:hover:border-white/10',
        'cursor-pointer',
        'w-full'
      )}
      aria-label={`Quick login as ${persona.name}`}
    >
      {/* Avatar */}
      <div
        className={classNames(
          'flex items-center justify-center',
          'w-12 h-12',
          'rounded-full',
          'bg-gradient-to-br',
          gradient,
          'text-white text-lg font-bold',
          'flex-shrink-0',
          'shadow-glass-sm'
        )}
        aria-hidden="true"
      >
        {isThisLoading ? (
          <LoadingSpinner />
        ) : (
          persona.name.charAt(0)
        )}
      </div>

      {/* Name */}
      <span className="text-sm font-semibold text-slate-100">
        {persona.name}
      </span>

      {/* Role */}
      <span className="text-xs text-slate-400 text-center leading-tight">
        {persona.role}
      </span>

      {/* Cluster badge */}
      <span
        className={classNames(
          'inline-flex items-center',
          'px-2 py-0.5',
          'rounded-full',
          'text-xs font-medium',
          clusterStyle
        )}
      >
        {persona.cluster.charAt(0).toUpperCase() + persona.cluster.slice(1)}
      </span>
    </button>
  );
}

PersonaQuickLoginCard.propTypes = {
  persona: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    cluster: PropTypes.string.isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadingPersona: PropTypes.string,
};

/**
 * Login page component (Screen 0a).
 * Provides email/password login form, persona quick login buttons,
 * and link to signup. Includes form validation, error display,
 * and loading states with gradient background per design system.
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The login page component
 */
export function LoginPage({ className }) {
  const { login, quickLogin, isAuthenticated } = useAuth();
  const { navigateTo, goToDashboard } = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState(null);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    goToDashboard();
    return null;
  }

  /**
   * Validates the login form fields
   * @returns {{ valid: boolean, error: string|null }}
   */
  const validateForm = () => {
    if (!email || !email.trim()) {
      return { valid: false, error: 'Email is required.' };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return { valid: false, error: 'Please enter a valid email address.' };
    }

    if (!password) {
      return { valid: false, error: 'Password is required.' };
    }

    if (password.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters.' };
    }

    return { valid: true, error: null };
  };

  /**
   * Handles email/password form submission
   * @param {React.FormEvent} event
   */
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const validation = validateForm();
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingPersona(null);

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        goToDashboard();
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (_err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isLoading, login, goToDashboard]);

  /**
   * Handles quick login as a persona
   * @param {string} personaId - The persona identifier
   */
  const handleQuickLogin = useCallback(async (personaId) => {
    if (isLoading) {
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingPersona(personaId);

    try {
      const result = await quickLogin(personaId);

      if (result.success) {
        goToDashboard();
      } else {
        setError(result.error || 'Quick login failed. Please try again.');
      }
    } catch (_err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingPersona(null);
    }
  }, [isLoading, quickLogin, goToDashboard]);

  /**
   * Handles navigation to signup page
   */
  const handleGoToSignup = useCallback(() => {
    navigateTo(SCREEN_IDS.PERSONA_SELECT);
  }, [navigateTo]);

  /**
   * Handles email input change
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handleEmailChange = useCallback((event) => {
    setEmail(event.target.value);
    if (error) {
      setError(null);
    }
  }, [error]);

  /**
   * Handles password input change
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handlePasswordChange = useCallback((event) => {
    setPassword(event.target.value);
    if (error) {
      setError(null);
    }
  }, [error]);

  /**
   * Toggles password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const personaList = [PERSONAS.LUKAS, PERSONAS.ELENA, PERSONAS.SOPHIE, PERSONAS.JAMES];

  return (
    <div
      className={classNames(
        'flex items-center justify-center min-h-screen',
        'bg-gradient-mesh',
        'px-4 py-8 sm:px-6 sm:py-12',
        className
      )}
    >
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div
            className={classNames(
              'flex items-center justify-center',
              'w-14 h-14 sm:w-16 sm:h-16',
              'rounded-2xl',
              'bg-gradient-accent',
              'shadow-glow',
              'mb-4'
            )}
          >
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gradient-accent mb-1">
            Ask Dreeso
          </h1>
          <p className="text-sm text-slate-400">
            Enterprise Intelligence Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card-lg p-6 sm:p-8">
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-slate-400">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={classNames(
                'flex items-start gap-3',
                'px-4 py-3',
                'rounded-xl',
                'bg-red-500/10',
                'border border-red-500/20',
                'mb-5',
                'animate-fade-in'
              )}
              role="alert"
            >
              <svg
                className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Email
              </label>
              <div
                className={classNames(
                  'relative flex items-center',
                  'rounded-xl',
                  'bg-secondary-500/40',
                  'border',
                  'transition-all duration-300 ease-in-out',
                  error && !email.trim()
                    ? 'border-red-500/50'
                    : 'border-white/10 focus-within:border-accent-blue/50',
                  'focus-within:shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                )}
              >
                <div className="flex-shrink-0 pl-3">
                  <EmailIcon />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@company.com"
                  disabled={isLoading}
                  autoComplete="email"
                  className={classNames(
                    'flex-1',
                    'w-full',
                    'px-3 py-3',
                    'bg-transparent',
                    'text-sm',
                    'font-medium',
                    'text-slate-100',
                    'placeholder:text-slate-500',
                    'focus:outline-none',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    'transition-colors duration-200'
                  )}
                  aria-label="Email address"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div
                className={classNames(
                  'relative flex items-center',
                  'rounded-xl',
                  'bg-secondary-500/40',
                  'border',
                  'transition-all duration-300 ease-in-out',
                  error && !password
                    ? 'border-red-500/50'
                    : 'border-white/10 focus-within:border-accent-blue/50',
                  'focus-within:shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                )}
              >
                <div className="flex-shrink-0 pl-3">
                  <LockIcon />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
                  className={classNames(
                    'flex-1',
                    'w-full',
                    'px-3 py-3',
                    'bg-transparent',
                    'text-sm',
                    'font-medium',
                    'text-slate-100',
                    'placeholder:text-slate-500',
                    'focus:outline-none',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    'transition-colors duration-200'
                  )}
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  className={classNames(
                    'flex-shrink-0 pr-3',
                    'transition-opacity duration-200',
                    'hover:opacity-80',
                    'focus:outline-none',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={classNames(
                'w-full flex items-center justify-center gap-2',
                'px-4 py-3',
                'rounded-xl',
                'text-sm font-semibold',
                'text-white',
                'bg-gradient-accent',
                'transition-all duration-300 ease-in-out',
                'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
                'hover:translate-y-[-1px]',
                'active:translate-y-0',
                'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none'
              )}
              aria-label="Sign in"
            >
              {isLoading && !loadingPersona ? (
                <>
                  <LoadingSpinner />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              or quick login as
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Persona Quick Login Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {personaList.map((persona) => (
              <PersonaQuickLoginCard
                key={persona.id}
                persona={persona}
                onClick={handleQuickLogin}
                isLoading={isLoading}
                loadingPersona={loadingPersona}
              />
            ))}
          </div>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={handleGoToSignup}
                disabled={isLoading}
                className={classNames(
                  'text-accent-blue font-semibold',
                  'transition-all duration-200',
                  'hover:text-accent-cyan',
                  'hover:underline',
                  'focus:outline-none focus:underline',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline'
                )}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Ask Dreeso Memory v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </p>
        </div>
      </div>
    </div>
  );
}

LoginPage.propTypes = {
  className: PropTypes.string,
};

export default LoginPage;