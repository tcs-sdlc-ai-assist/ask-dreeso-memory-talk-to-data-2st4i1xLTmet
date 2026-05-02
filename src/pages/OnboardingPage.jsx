import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigation } from '../contexts/NavigationContext.jsx';
import { PERSONAS, SCREEN_IDS } from '../utils/constants.js';
import { getIntelligenceClustersForPersona } from '../data/mockData.js';
import { setItem } from '../services/localStorageService.js';
import { STORAGE_KEYS } from '../utils/constants.js';

/**
 * Persona avatar gradient mappings
 * @type {Object<string, string>}
 */
const PERSONA_GRADIENTS = {
  [PERSONAS.LUKAS.id]: 'from-accent-blue to-accent-cyan',
  [PERSONAS.ELENA.id]: 'from-accent-green to-accent-cyan',
  [PERSONAS.SOPHIE.id]: 'from-accent-purple to-accent-pink',
  [PERSONAS.JAMES.id]: 'from-accent-orange to-accent-blue',
};

/**
 * Cluster badge color mappings
 * @type {Object<string, string>}
 */
const CLUSTER_BADGE_STYLES = {
  operations: 'bg-accent-blue/15 text-accent-blue border-accent-blue/30',
  finance: 'bg-accent-green/15 text-accent-green border-accent-green/30',
  engineering: 'bg-accent-purple/15 text-accent-purple border-accent-purple/30',
  sales: 'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
  risk: 'bg-red-500/15 text-red-400 border-red-500/30',
  portfolio: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30',
};

/**
 * Persona descriptions for the onboarding cards
 * @type {Object<string, Object>}
 */
const PERSONA_DETAILS = {
  [PERSONAS.LUKAS.id]: {
    title: 'Project Director',
    description: 'Oversee project delivery, scheduling, and resource allocation across your portfolio. Get real-time insights into project health, risks, and budget performance.',
    highlights: ['Portfolio oversight', 'Schedule tracking', 'Risk management', 'Budget monitoring'],
  },
  [PERSONAS.ELENA.id]: {
    title: 'Senior QS',
    description: 'Manage financial performance, revenue tracking, and cost analytics. Access cash flow forecasts, budget variance reports, and quantity surveying insights.',
    highlights: ['Revenue analysis', 'Budget variance', 'Cash flow forecasting', 'QS analytics'],
  },
  [PERSONAS.SOPHIE.id]: {
    title: 'Project Manager',
    description: 'Monitor engineering quality, safety compliance, and technical performance. Track RFIs, defect rates, and resource allocation across your sites.',
    highlights: ['Quality metrics', 'Safety compliance', 'RFI management', 'Resource allocation'],
  },
  [PERSONAS.JAMES.id]: {
    title: 'Sales Director',
    description: 'Drive business development with pipeline analytics, win rate tracking, and client engagement metrics. Forecast revenue and manage opportunities.',
    highlights: ['Pipeline management', 'Win rate analysis', 'Revenue forecasting', 'Client engagement'],
  },
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
 * Cluster icon SVG component
 * @param {Object} props
 * @param {string} props.domain - The cluster domain identifier
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function ClusterIcon({ domain, className }) {
  const baseClass = classNames('w-4 h-4 flex-shrink-0', className);
  const normalized = domain ? domain.toLowerCase().trim() : '';

  switch (normalized) {
    case 'operations':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      );
    case 'finance':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      );
    case 'engineering':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
      );
    case 'sales':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      );
    case 'risk':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case 'portfolio':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      );
  }
}

ClusterIcon.propTypes = {
  domain: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Cluster preview badge component
 * @param {Object} props
 * @param {Object} props.cluster - The cluster object
 * @param {string} props.cluster.domain - Cluster domain identifier
 * @param {string} props.cluster.name - Cluster display name
 * @returns {React.ReactElement}
 */
function ClusterPreviewBadge({ cluster }) {
  const style = CLUSTER_BADGE_STYLES[cluster.domain] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5',
        'px-2.5 py-1',
        'rounded-full',
        'text-xs font-medium',
        'border',
        style
      )}
    >
      <ClusterIcon domain={cluster.domain} className="w-3 h-3" />
      <span className="truncate max-w-[120px]">
        {cluster.name.replace(' Intelligence', '')}
      </span>
    </span>
  );
}

ClusterPreviewBadge.propTypes = {
  cluster: PropTypes.shape({
    domain: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

/**
 * Persona onboarding card component
 * @param {Object} props
 * @param {Object} props.persona - Persona object from constants
 * @param {function} props.onSelect - Selection handler
 * @param {boolean} props.isLoading - Whether a login is in progress
 * @param {string|null} props.loadingPersona - The persona currently being logged in
 * @param {number} props.index - Card index for animation delay
 * @returns {React.ReactElement}
 */
function PersonaOnboardingCard({ persona, onSelect, isLoading, loadingPersona, index }) {
  const gradient = PERSONA_GRADIENTS[persona.id] || 'from-slate-500 to-slate-400';
  const details = PERSONA_DETAILS[persona.id] || {
    title: persona.role,
    description: 'Access enterprise intelligence tailored to your role.',
    highlights: [],
  };
  const clusters = getIntelligenceClustersForPersona(persona.id);
  const isThisLoading = isLoading && loadingPersona === persona.id;
  const isDisabled = isLoading;

  const handleClick = () => {
    if (!isDisabled && typeof onSelect === 'function') {
      onSelect(persona.id);
    }
  };

  const handleKeyDown = (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && !isDisabled) {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
    >
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        className={classNames(
          'w-full text-left',
          'glass-card',
          'p-5 sm:p-6',
          'border border-white/10',
          'transition-all duration-300 ease-in-out',
          'hover:bg-secondary-500/50',
          'hover:border-white/20',
          'hover:translate-y-[-3px]',
          'hover:shadow-[0_0_24px_rgba(59,130,246,0.15)]',
          'active:translate-y-0',
          'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:bg-transparent disabled:hover:border-white/10',
          'cursor-pointer',
          'relative overflow-hidden'
        )}
        aria-label={`Select persona: ${persona.name} — ${details.title}`}
      >
        {/* Header: Avatar + Name + Title */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div
            className={classNames(
              'flex items-center justify-center',
              'w-14 h-14 sm:w-16 sm:h-16',
              'rounded-2xl',
              'bg-gradient-to-br',
              gradient,
              'text-white text-xl sm:text-2xl font-bold',
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

          {/* Name + Title */}
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-tight">
              {persona.name}
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              {details.title}
            </p>
            <span
              className={classNames(
                'inline-flex items-center',
                'mt-2 px-2.5 py-0.5',
                'rounded-full',
                'text-xs font-medium',
                CLUSTER_BADGE_STYLES[persona.cluster] || 'bg-slate-500/15 text-slate-400 border-slate-500/30',
                'border'
              )}
            >
              {persona.cluster.charAt(0).toUpperCase() + persona.cluster.slice(1)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {details.description}
        </p>

        {/* Highlights */}
        {details.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {details.highlights.map((highlight, hIndex) => (
              <span
                key={`highlight-${hIndex}`}
                className={classNames(
                  'inline-flex items-center',
                  'px-2.5 py-1',
                  'rounded-lg',
                  'text-xs font-medium',
                  'bg-secondary-500/40',
                  'text-slate-300',
                  'border border-white/5'
                )}
              >
                <svg
                  className="w-3 h-3 text-accent-blue mr-1.5 flex-shrink-0"
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
                {highlight}
              </span>
            ))}
          </div>
        )}

        {/* Cluster Previews */}
        {clusters.length > 0 && (
          <div className="pt-3 border-t border-white/5">
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
              Intelligence Clusters
            </p>
            <div className="flex flex-wrap gap-2">
              {clusters.map((cluster) => (
                <ClusterPreviewBadge
                  key={cluster.id}
                  cluster={cluster}
                />
              ))}
            </div>
          </div>
        )}

        {/* Select indicator */}
        <div
          className={classNames(
            'absolute top-4 right-4',
            'flex items-center justify-center',
            'w-8 h-8',
            'rounded-full',
            'bg-white/5',
            'border border-white/10',
            'transition-all duration-300 ease-in-out',
            'group-hover:bg-accent-blue/20 group-hover:border-accent-blue/40'
          )}
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>
    </div>
  );
}

PersonaOnboardingCard.propTypes = {
  persona: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    cluster: PropTypes.string.isRequired,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  loadingPersona: PropTypes.string,
  index: PropTypes.number.isRequired,
};

/**
 * Onboarding page component (Screen 1).
 * Displays persona cards with descriptions and cluster previews.
 * Selection triggers quick login and routes to persona-specific dashboard flow.
 * Shown after first login or when navigating to persona selection.
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The onboarding page component
 */
export function OnboardingPage({ className }) {
  const { quickLogin, isAuthenticated } = useAuth();
  const { goToDashboard, navigateTo } = useNavigation();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState(null);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    goToDashboard();
    return null;
  }

  /**
   * Handles persona selection
   * @param {string} personaId - The selected persona identifier
   */
  const handlePersonaSelect = useCallback(async (personaId) => {
    if (isLoading) {
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingPersona(personaId);

    try {
      const result = await quickLogin(personaId);

      if (result.success) {
        setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
        goToDashboard();
      } else {
        setError(result.error || 'Failed to select persona. Please try again.');
      }
    } catch (_err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingPersona(null);
    }
  }, [isLoading, quickLogin, goToDashboard]);

  /**
   * Handles navigation to login page
   */
  const handleGoToLogin = useCallback(() => {
    navigateTo(SCREEN_IDS.SPLASH);
  }, [navigateTo]);

  const personaList = [PERSONAS.LUKAS, PERSONAS.ELENA, PERSONAS.SOPHIE, PERSONAS.JAMES];

  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-start min-h-screen',
        'bg-gradient-mesh',
        'px-4 py-8 sm:px-6 sm:py-12 lg:px-8',
        className
      )}
    >
      <div className="w-full max-w-4xl animate-fade-in">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-10 sm:mb-12">
          <div
            className={classNames(
              'flex items-center justify-center',
              'w-14 h-14 sm:w-16 sm:h-16',
              'rounded-2xl',
              'bg-gradient-accent',
              'shadow-glow',
              'mb-5'
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

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient-accent mb-2 text-center">
            Welcome to Ask Dreeso
          </h1>
          <p className="text-sm sm:text-base text-slate-400 text-center max-w-lg leading-relaxed">
            Select your persona to access tailored enterprise intelligence. Each role provides specialized dashboards, analytics, and actionable insights.
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
              'mb-6',
              'max-w-md mx-auto',
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

        {/* Persona Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          {personaList.map((persona, index) => (
            <PersonaOnboardingCard
              key={persona.id}
              persona={persona}
              onSelect={handlePersonaSelect}
              isLoading={isLoading}
              loadingPersona={loadingPersona}
              index={index}
            />
          ))}
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Have an account?{' '}
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
              Sign in with email
            </button>
          </p>
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

OnboardingPage.propTypes = {
  className: PropTypes.string,
};

export default OnboardingPage;