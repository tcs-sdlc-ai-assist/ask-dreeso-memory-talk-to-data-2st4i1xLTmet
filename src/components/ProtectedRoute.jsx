import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigation } from '../contexts/NavigationContext.jsx';
import { SCREEN_IDS } from '../utils/constants.js';

/**
 * Loading spinner component displayed while auth state is being resolved
 * @returns {React.ReactElement}
 */
function AuthLoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-mesh">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent shadow-glow">
          <svg
            className="w-8 h-8 text-white animate-spin"
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
        </div>
        <p className="text-sm text-slate-400 font-medium">Verifying access...</p>
      </div>
    </div>
  );
}

/**
 * Access denied screen displayed when user lacks required role
 * @param {Object} props
 * @param {function} props.onGoBack - Handler to navigate back
 * @param {function} props.onGoToDashboard - Handler to navigate to dashboard
 * @returns {React.ReactElement}
 */
function AccessDeniedScreen({ onGoBack, onGoToDashboard }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-mesh">
      <div className="glass-card-lg p-8 sm:p-10 max-w-md w-full mx-4 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-5">
            <svg
              className="w-8 h-8 text-red-400"
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
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-2">
            Access Denied
          </h2>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            You do not have the required permissions to access this page. Please contact your administrator or navigate to an authorized area.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              onClick={onGoBack}
              className="flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 bg-secondary-500/40 border border-white/10 transition-all duration-300 ease-in-out hover:text-slate-100 hover:bg-secondary-500/60 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-0"
              aria-label="Go back"
            >
              Go Back
            </button>

            <button
              type="button"
              onClick={onGoToDashboard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-accent transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:translate-y-[-1px] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0"
              aria-label="Go to dashboard"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

AccessDeniedScreen.propTypes = {
  onGoBack: PropTypes.func.isRequired,
  onGoToDashboard: PropTypes.func.isRequired,
};

/**
 * Unauthenticated screen displayed when user is not logged in.
 * Redirects to persona select screen.
 * @param {Object} props
 * @param {function} props.onGoToLogin - Handler to navigate to login/persona select
 * @returns {React.ReactElement}
 */
function UnauthenticatedScreen({ onGoToLogin }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-mesh">
      <div className="glass-card-lg p-8 sm:p-10 max-w-md w-full mx-4 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent-blue/10 border border-accent-blue/20 mb-5">
            <svg
              className="w-8 h-8 text-accent-blue"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-2">
            Authentication Required
          </h2>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            You need to sign in to access this page. Please log in with your credentials or select a persona to continue.
          </p>

          {/* Action */}
          <button
            type="button"
            onClick={onGoToLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-accent transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:translate-y-[-1px] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0"
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
            <span>Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}

UnauthenticatedScreen.propTypes = {
  onGoToLogin: PropTypes.func.isRequired,
};

/**
 * Checks if a user's cluster matches any of the required roles
 * @param {string|null} cluster - The user's cluster identifier
 * @param {Array<string>} requiredRoles - Array of allowed role/cluster strings
 * @returns {boolean} Whether the user has access
 */
function hasRequiredRole(cluster, requiredRoles) {
  if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
    return true;
  }

  if (!cluster || typeof cluster !== 'string') {
    return false;
  }

  const normalizedCluster = cluster.toLowerCase().trim();

  return requiredRoles.some((role) => {
    if (!role || typeof role !== 'string') {
      return false;
    }
    return role.toLowerCase().trim() === normalizedCluster;
  });
}

/**
 * Authentication and role-based route guard component.
 * Checks authentication status and validates that the current persona
 * has access based on optional required roles. Redirects unauthenticated
 * users to the persona select/login screen. Shows an access denied screen
 * when the user's cluster does not match the required roles.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected content to render when access is granted
 * @param {Array<string>} [props.requiredRoles] - Optional array of allowed cluster/role strings
 *   (e.g., ['operations', 'finance']). If omitted or empty, any authenticated user can access.
 * @returns {React.ReactElement} The protected content, loading screen, or access denied screen
 */
export function ProtectedRoute({ children, requiredRoles }) {
  const { isAuthenticated, isLoading, cluster } = useAuth();
  const { navigateTo, goBack, goToDashboard } = useNavigation();

  /**
   * Navigates to the persona select / login screen
   */
  const handleGoToLogin = useCallback(() => {
    navigateTo(SCREEN_IDS.PERSONA_SELECT);
  }, [navigateTo]);

  /**
   * Navigates back to the previous screen
   */
  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

  /**
   * Navigates to the dashboard
   */
  const handleGoToDashboard = useCallback(() => {
    goToDashboard();
  }, [goToDashboard]);

  /**
   * Determines if the user has the required role access
   */
  const hasAccess = useMemo(() => {
    if (!isAuthenticated) {
      return false;
    }
    return hasRequiredRole(cluster, requiredRoles);
  }, [isAuthenticated, cluster, requiredRoles]);

  // Show loading screen while auth state is being resolved
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // Show unauthenticated screen if user is not logged in
  if (!isAuthenticated) {
    return <UnauthenticatedScreen onGoToLogin={handleGoToLogin} />;
  }

  // Show access denied screen if user lacks required role
  if (!hasAccess) {
    return (
      <AccessDeniedScreen
        onGoBack={handleGoBack}
        onGoToDashboard={handleGoToDashboard}
      />
    );
  }

  // Render protected content
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;