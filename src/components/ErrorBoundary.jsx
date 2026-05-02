import { Component } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { logAction, ACTION_TYPES } from '../services/auditLogService.js';
import { getCurrentSession } from '../services/authService.js';

/**
 * Fallback UI component displayed when an error is caught by the ErrorBoundary.
 * Shows error message, optional details, and a retry button.
 *
 * @param {Object} props
 * @param {Error} props.error - The caught error object
 * @param {function} props.onRetry - Callback to retry/reset the error boundary
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function ErrorFallback({ error, onRetry, className }) {
  const errorMessage = error && error.message
    ? error.message
    : 'An unexpected error occurred.';

  return (
    <div
      className={classNames(
        'flex items-center justify-center min-h-[300px] w-full',
        'p-4 sm:p-6',
        className
      )}
      role="alert"
      aria-label="Application error"
    >
      <div className="glass-card-lg p-8 sm:p-10 max-w-lg w-full animate-fade-in">
        <div className="flex flex-col items-center text-center">
          {/* Error Icon */}
          <div
            className={classNames(
              'flex items-center justify-center',
              'w-16 h-16',
              'rounded-full',
              'bg-red-500/10',
              'border border-red-500/20',
              'mb-5'
            )}
          >
            <svg
              className="w-8 h-8 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-2">
            Something went wrong
          </h2>

          {/* Error Message */}
          <p className="text-sm text-slate-300 leading-relaxed mb-2">
            An error occurred while rendering this section. Please try again or contact support if the problem persists.
          </p>

          {/* Error Details */}
          <div
            className={classNames(
              'w-full',
              'px-4 py-3',
              'rounded-xl',
              'bg-secondary-500/40',
              'border border-white/5',
              'mb-6',
              'overflow-hidden'
            )}
          >
            <p className="text-xs text-slate-400 font-mono break-words">
              {errorMessage}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              className={classNames(
                'flex-1 flex items-center justify-center',
                'px-4 py-3',
                'rounded-xl',
                'text-sm font-semibold',
                'text-slate-300',
                'bg-secondary-500/40',
                'border border-white/10',
                'transition-all duration-300 ease-in-out',
                'hover:text-slate-100',
                'hover:bg-secondary-500/60',
                'hover:border-white/20',
                'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-0'
              )}
              aria-label="Reload page"
            >
              Reload Page
            </button>

            <button
              type="button"
              onClick={onRetry}
              className={classNames(
                'flex-1 flex items-center justify-center gap-2',
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
              aria-label="Try again"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ErrorFallback.propTypes = {
  error: PropTypes.object,
  onRetry: PropTypes.func.isRequired,
  className: PropTypes.string,
};

/**
 * Logs an error to the audit log service
 * @param {Error} error - The error object
 * @param {Object} [errorInfo] - React error info with componentStack
 */
function logErrorToAuditService(error, errorInfo) {
  try {
    const session = getCurrentSession();
    const userId = session ? session.userId : null;

    logAction(ACTION_TYPES.NAVIGATE_FAIL, userId, {
      type: 'ERROR_BOUNDARY',
      errorMessage: error ? error.message : 'Unknown error',
      errorName: error ? error.name : 'Error',
      errorStack: error && error.stack ? error.stack.slice(0, 500) : null,
      componentStack: errorInfo && errorInfo.componentStack
        ? errorInfo.componentStack.slice(0, 500)
        : null,
      persona: session ? session.persona : null,
      timestamp: new Date().toISOString(),
    });
  } catch (_err) {
    // Silently fail — we don't want error logging to cause additional errors
    console.error('ErrorBoundary: Failed to log error to audit service.');
  }
}

/**
 * React error boundary component that catches rendering errors in its child
 * component tree. Displays a fallback UI with error message and retry button.
 * Logs errors to auditLogService. Prevents full app crashes from component-level failures.
 *
 * @class ErrorBoundary
 * @extends {Component}
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @param {React.ReactElement} [props.fallback] - Optional custom fallback UI element
 * @param {function} [props.onError] - Optional callback when an error is caught, receives (error, errorInfo)
 * @param {string} [props.className] - Additional class names for the fallback wrapper
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    this.handleRetry = this.handleRetry.bind(this);
  }

  /**
   * Derives error state from a caught error
   * @param {Error} error - The caught error
   * @returns {Object} Updated state
   */
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Lifecycle method called when an error is caught.
   * Logs the error to the audit service and calls the optional onError callback.
   * @param {Error} error - The caught error
   * @param {Object} errorInfo - React error info with componentStack
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log error to audit service
    logErrorToAuditService(error, errorInfo);

    // Log to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional onError callback
    if (typeof this.props.onError === 'function') {
      try {
        this.props.onError(error, errorInfo);
      } catch (_err) {
        // Silently fail — callback errors should not cascade
        console.error('ErrorBoundary: onError callback threw an error.');
      }
    }
  }

  /**
   * Resets the error state to allow re-rendering of children
   */
  handleRetry() {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.element,
  onError: PropTypes.func,
  className: PropTypes.string,
};

export { ErrorBoundary, ErrorFallback };
export default ErrorBoundary;