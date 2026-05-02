import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigation } from '../contexts/NavigationContext.jsx';
import { SCREEN_IDS } from '../utils/constants.js';

/**
 * Role options for the signup form
 * @type {Array<Object>}
 */
const ROLE_OPTIONS = [
  { value: '', label: 'Select your role' },
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Finance Director', label: 'Finance Director' },
  { value: 'Quantity Surveyor', label: 'Quantity Surveyor' },
  { value: 'Site Engineer', label: 'Site Engineer' },
  { value: 'Sales Executive', label: 'Sales Executive' },
  { value: 'Business Development', label: 'Business Development' },
  { value: 'Operations Manager', label: 'Operations Manager' },
  { value: 'Technical Lead', label: 'Technical Lead' },
];

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
 * User icon SVG component
 * @returns {React.ReactElement}
 */
function UserIcon() {
  return (
    <svg
      className="w-5 h-5 text-slate-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
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
 * Briefcase icon SVG component for role selection
 * @returns {React.ReactElement}
 */
function BriefcaseIcon() {
  return (
    <svg
      className="w-5 h-5 text-slate-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
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
 * Success icon SVG component
 * @returns {React.ReactElement}
 */
function SuccessIcon() {
  return (
    <svg
      className="w-8 h-8 text-accent-green"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Password strength indicator component
 * @param {Object} props
 * @param {string} props.password - The password to evaluate
 * @returns {React.ReactElement|null}
 */
function PasswordStrengthIndicator({ password }) {
  if (!password || password.length === 0) {
    return null;
  }

  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 1;

  let label = 'Weak';
  let color = 'bg-red-500';
  let textColor = 'text-red-400';

  if (strength >= 4) {
    label = 'Strong';
    color = 'bg-accent-green';
    textColor = 'text-accent-green';
  } else if (strength >= 3) {
    label = 'Medium';
    color = 'bg-accent-orange';
    textColor = 'text-accent-orange';
  }

  const percent = Math.min((strength / 5) * 100, 100);

  return (
    <div className="mt-1.5 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-secondary-500/50 overflow-hidden">
          <div
            className={classNames(
              'h-full rounded-full transition-all duration-500 ease-out',
              color
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={classNames('text-xs font-medium flex-shrink-0', textColor)}>
          {label}
        </span>
      </div>
    </div>
  );
}

PasswordStrengthIndicator.propTypes = {
  password: PropTypes.string,
};

/**
 * Signup page component (Screen 0b).
 * Provides Full Name, Email, Password, Confirm Password, and Role Selection
 * dropdown. Includes form validation (email format, password strength, password
 * match). Stores new user in localStorage. Redirects to login on success.
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The signup page component
 */
export function SignupPage({ className }) {
  const { signup, isAuthenticated } = useAuth();
  const { navigateTo, goToDashboard } = useNavigation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    goToDashboard();
    return null;
  }

  /**
   * Validates the signup form fields
   * @returns {{ valid: boolean, errors: Object, generalError: string|null }}
   */
  const validateForm = () => {
    const errors = {};
    let generalError = null;

    // Full Name validation
    if (!fullName || !fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    } else if (fullName.trim().length > 100) {
      errors.fullName = 'Full name must be 100 characters or fewer.';
    }

    // Email validation
    if (!email || !email.trim()) {
      errors.email = 'Email is required.';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required.';
    } else {
      if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters.';
      } else if (!/[A-Z]/.test(password)) {
        errors.password = 'Password must contain at least one uppercase letter.';
      } else if (!/[a-z]/.test(password)) {
        errors.password = 'Password must contain at least one lowercase letter.';
      } else if (!/[0-9]/.test(password)) {
        errors.password = 'Password must contain at least one number.';
      }
    }

    // Confirm Password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password && confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    // Role validation
    if (!role || !role.trim()) {
      errors.role = 'Please select a role.';
    }

    const hasErrors = Object.keys(errors).length > 0;

    if (hasErrors) {
      // Set the first error as the general error
      const firstErrorKey = Object.keys(errors)[0];
      generalError = errors[firstErrorKey];
    }

    return { valid: !hasErrors, errors, generalError };
  };

  /**
   * Handles form submission
   * @param {React.FormEvent} event
   */
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();

    if (isLoading || isSuccess) {
      return;
    }

    const validation = validateForm();
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setError(validation.generalError);
      return;
    }

    setError(null);
    setFieldErrors({});
    setIsLoading(true);

    try {
      const result = await signup(fullName.trim(), email.trim(), password, role.trim());

      if (result.success) {
        setIsSuccess(true);
        // Redirect to login after a short delay
        setTimeout(() => {
          navigateTo(SCREEN_IDS.SPLASH);
        }, 2500);
      } else {
        setError(result.error || 'Signup failed. Please try again.');
      }
    } catch (_err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [fullName, email, password, confirmPassword, role, isLoading, isSuccess, signup, navigateTo]);

  /**
   * Handles navigation to login page
   */
  const handleGoToLogin = useCallback(() => {
    navigateTo(SCREEN_IDS.SPLASH);
  }, [navigateTo]);

  /**
   * Handles full name input change
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handleFullNameChange = useCallback((event) => {
    setFullName(event.target.value);
    if (fieldErrors.fullName) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.fullName;
        return next;
      });
    }
    if (error) {
      setError(null);
    }
  }, [fieldErrors.fullName, error]);

  /**
   * Handles email input change
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handleEmailChange = useCallback((event) => {
    setEmail(event.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
    if (error) {
      setError(null);
    }
  }, [fieldErrors.email, error]);

  /**
   * Handles password input change
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handlePasswordChange = useCallback((event) => {
    setPassword(event.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
    }
    if (error) {
      setError(null);
    }
  }, [fieldErrors.password, error]);

  /**
   * Handles confirm password input change
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handleConfirmPasswordChange = useCallback((event) => {
    setConfirmPassword(event.target.value);
    if (fieldErrors.confirmPassword) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.confirmPassword;
        return next;
      });
    }
    if (error) {
      setError(null);
    }
  }, [fieldErrors.confirmPassword, error]);

  /**
   * Handles role selection change
   * @param {React.ChangeEvent<HTMLSelectElement>} event
   */
  const handleRoleChange = useCallback((event) => {
    setRole(event.target.value);
    if (fieldErrors.role) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.role;
        return next;
      });
    }
    if (error) {
      setError(null);
    }
  }, [fieldErrors.role, error]);

  /**
   * Toggles password visibility
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  /**
   * Toggles confirm password visibility
   */
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  // Success state
  if (isSuccess) {
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
          <div className="glass-card-lg p-8 sm:p-10">
            <div className="flex flex-col items-center text-center">
              {/* Success Icon */}
              <div
                className={classNames(
                  'flex items-center justify-center',
                  'w-16 h-16',
                  'rounded-full',
                  'bg-accent-green/10',
                  'border border-accent-green/20',
                  'mb-5'
                )}
              >
                <SuccessIcon />
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-2">
                Account Created!
              </h2>

              {/* Description */}
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Your account has been created successfully. You will be redirected to the login page shortly.
              </p>

              {/* Manual redirect button */}
              <button
                type="button"
                onClick={handleGoToLogin}
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
                  'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0'
                )}
                aria-label="Go to login"
              >
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
                <span>Go to Login</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Signup Card */}
        <div className="glass-card-lg p-6 sm:p-8">
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-1">
              Create your account
            </h2>
            <p className="text-sm text-slate-400">
              Fill in the details below to get started
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

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label
                htmlFor="signup-fullname"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Full Name
              </label>
              <div
                className={classNames(
                  'relative flex items-center',
                  'rounded-xl',
                  'bg-secondary-500/40',
                  'border',
                  'transition-all duration-300 ease-in-out',
                  fieldErrors.fullName
                    ? 'border-red-500/50'
                    : 'border-white/10 focus-within:border-accent-blue/50',
                  'focus-within:shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                )}
              >
                <div className="flex-shrink-0 pl-3">
                  <UserIcon />
                </div>
                <input
                  id="signup-fullname"
                  type="text"
                  value={fullName}
                  onChange={handleFullNameChange}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  autoComplete="name"
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
                  aria-label="Full name"
                  aria-invalid={fieldErrors.fullName ? 'true' : 'false'}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-xs text-red-400 mt-1 px-1 animate-fade-in">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="signup-email"
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
                  fieldErrors.email
                    ? 'border-red-500/50'
                    : 'border-white/10 focus-within:border-accent-blue/50',
                  'focus-within:shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                )}
              >
                <div className="flex-shrink-0 pl-3">
                  <EmailIcon />
                </div>
                <input
                  id="signup-email"
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
                  aria-invalid={fieldErrors.email ? 'true' : 'false'}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-400 mt-1 px-1 animate-fade-in">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="signup-password"
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
                  fieldErrors.password
                    ? 'border-red-500/50'
                    : 'border-white/10 focus-within:border-accent-blue/50',
                  'focus-within:shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                )}
              >
                <div className="flex-shrink-0 pl-3">
                  <LockIcon />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Create a strong password"
                  disabled={isLoading}
                  autoComplete="new-password"
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
                  aria-invalid={fieldErrors.password ? 'true' : 'false'}
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
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1 px-1 animate-fade-in">
                  {fieldErrors.password}
                </p>
              )}
              <PasswordStrengthIndicator password={password} />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Confirm Password
              </label>
              <div
                className={classNames(
                  'relative flex items-center',
                  'rounded-xl',
                  'bg-secondary-500/40',
                  'border',
                  'transition-all duration-300 ease-in-out',
                  fieldErrors.confirmPassword
                    ? 'border-red-500/50'
                    : 'border-white/10 focus-within:border-accent-blue/50',
                  'focus-within:shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                )}
              >
                <div className="flex-shrink-0 pl-3">
                  <LockIcon />
                </div>
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  autoComplete="new-password"
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
                  aria-label="Confirm password"
                  aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isLoading}
                  className={classNames(
                    'flex-shrink-0 pr-3',
                    'transition-opacity duration-200',
                    'hover:opacity-80',
                    'focus:outline-none',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  tabIndex={-1}
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-400 mt-1 px-1 animate-fade-in">
                  {fieldErrors.confirmPassword}
                </p>
              )}
              {confirmPassword && password && confirmPassword === password && !fieldErrors.confirmPassword && (
                <div className="flex items-center gap-1 mt-1 px-1 animate-fade-in">
                  <svg
                    className="w-3.5 h-3.5 text-accent-green"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs text-accent-green">Passwords match</span>
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label
                htmlFor="signup-role"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Role
              </label>
              <div
                className={classNames(
                  'relative flex items-center',
                  'rounded-xl',
                  'bg-secondary-500/40',
                  'border',
                  'transition-all duration-300 ease-in-out',
                  fieldErrors.role
                    ? 'border-red-500/50'
                    : 'border-white/10 focus-within:border-accent-blue/50',
                  'focus-within:shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                )}
              >
                <div className="flex-shrink-0 pl-3">
                  <BriefcaseIcon />
                </div>
                <select
                  id="signup-role"
                  value={role}
                  onChange={handleRoleChange}
                  disabled={isLoading}
                  className={classNames(
                    'flex-1',
                    'w-full',
                    'px-3 py-3',
                    'bg-transparent',
                    'text-sm',
                    'font-medium',
                    'appearance-none',
                    role ? 'text-slate-100' : 'text-slate-500',
                    'focus:outline-none',
                    'disabled:opacity-60 disabled:cursor-not-allowed',
                    'transition-colors duration-200',
                    'cursor-pointer'
                  )}
                  aria-label="Select your role"
                  aria-invalid={fieldErrors.role ? 'true' : 'false'}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-secondary-500 text-slate-100"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="flex-shrink-0 pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-slate-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              {fieldErrors.role && (
                <p className="text-xs text-red-400 mt-1 px-1 animate-fade-in">
                  {fieldErrors.role}
                </p>
              )}
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
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none',
                'mt-6'
              )}
              aria-label="Create account"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={handleGoToLogin}
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
                Sign in
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

SignupPage.propTypes = {
  className: PropTypes.string,
};

export default SignupPage;