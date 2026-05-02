import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigation } from '../contexts/NavigationContext.jsx';
import { SCREEN_IDS } from '../utils/constants.js';

/**
 * 404 Not Found page component.
 * Displayed for unmatched routes. Shows design system styling with
 * gradient background and navigation back to home/login or dashboard.
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The 404 page component
 */
export function NotFoundPage({ className }) {
  const { isAuthenticated } = useAuth();
  const { navigateTo, goToDashboard } = useNavigation();

  /**
   * Handles navigation to the appropriate home screen
   */
  const handleGoHome = useCallback(() => {
    if (isAuthenticated) {
      goToDashboard();
    } else {
      navigateTo(SCREEN_IDS.SPLASH);
    }
  }, [isAuthenticated, goToDashboard, navigateTo]);

  /**
   * Handles navigation to the persona select / login screen
   */
  const handleGoToLogin = useCallback(() => {
    navigateTo(SCREEN_IDS.PERSONA_SELECT);
  }, [navigateTo]);

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
            {/* 404 Icon */}
            <div
              className={classNames(
                'flex items-center justify-center',
                'w-20 h-20',
                'rounded-full',
                'bg-accent-purple/10',
                'border border-accent-purple/20',
                'mb-6'
              )}
            >
              <svg
                className="w-10 h-10 text-accent-purple"
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

            {/* 404 Number */}
            <h1 className="text-5xl sm:text-6xl font-bold text-gradient-accent mb-3">
              404
            </h1>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-2">
              Page Not Found
            </h2>

            {/* Description */}
            <p className="text-sm text-slate-300 leading-relaxed mb-8 max-w-sm">
              The page you&apos;re looking for doesn&apos;t exist or has been moved. Please check the URL or navigate back to a known page.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <button
                type="button"
                onClick={handleGoHome}
                className={classNames(
                  'flex-1 flex items-center justify-center gap-2',
                  'px-5 py-3',
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
                aria-label={isAuthenticated ? 'Go to dashboard' : 'Go to home'}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>{isAuthenticated ? 'Dashboard' : 'Home'}</span>
              </button>

              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  className={classNames(
                    'flex-1 flex items-center justify-center gap-2',
                    'px-5 py-3',
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
                  aria-label="Go to sign in"
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
                  <span>Sign In</span>
                </button>
              )}

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.history.back();
                    }
                  }}
                  className={classNames(
                    'flex-1 flex items-center justify-center gap-2',
                    'px-5 py-3',
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
                  aria-label="Go back"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Go Back</span>
                </button>
              )}
            </div>
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

NotFoundPage.propTypes = {
  className: PropTypes.string,
};

export default NotFoundPage;