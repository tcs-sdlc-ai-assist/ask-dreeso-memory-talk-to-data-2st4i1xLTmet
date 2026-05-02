import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';

/**
 * Cluster icon color mappings by domain/icon identifier
 * @type {Object<string, Object>}
 */
const CLUSTER_ICON_STYLES = {
  operations: {
    gradient: 'from-accent-blue to-accent-cyan',
    iconColor: 'text-accent-blue',
    borderAccent: 'border-accent-blue/30',
    activeBorder: 'border-accent-blue/60',
    activeBg: 'bg-accent-blue/10',
    glow: 'hover:shadow-[0_0_16px_rgba(59,130,246,0.25)]',
    activeGlow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    badgeBg: 'bg-accent-blue/15',
    badgeText: 'text-accent-blue',
  },
  finance: {
    gradient: 'from-accent-green to-accent-cyan',
    iconColor: 'text-accent-green',
    borderAccent: 'border-accent-green/30',
    activeBorder: 'border-accent-green/60',
    activeBg: 'bg-accent-green/10',
    glow: 'hover:shadow-[0_0_16px_rgba(16,185,129,0.25)]',
    activeGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    badgeBg: 'bg-accent-green/15',
    badgeText: 'text-accent-green',
  },
  engineering: {
    gradient: 'from-accent-purple to-accent-pink',
    iconColor: 'text-accent-purple',
    borderAccent: 'border-accent-purple/30',
    activeBorder: 'border-accent-purple/60',
    activeBg: 'bg-accent-purple/10',
    glow: 'hover:shadow-[0_0_16px_rgba(139,92,246,0.25)]',
    activeGlow: 'shadow-[0_0_20px_rgba(139,92,246,0.3)]',
    badgeBg: 'bg-accent-purple/15',
    badgeText: 'text-accent-purple',
  },
  sales: {
    gradient: 'from-accent-orange to-accent-blue',
    iconColor: 'text-accent-orange',
    borderAccent: 'border-accent-orange/30',
    activeBorder: 'border-accent-orange/60',
    activeBg: 'bg-accent-orange/10',
    glow: 'hover:shadow-[0_0_16px_rgba(245,158,11,0.25)]',
    activeGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    badgeBg: 'bg-accent-orange/15',
    badgeText: 'text-accent-orange',
  },
  risk: {
    gradient: 'from-red-500 to-accent-orange',
    iconColor: 'text-red-400',
    borderAccent: 'border-red-500/30',
    activeBorder: 'border-red-500/60',
    activeBg: 'bg-red-500/10',
    glow: 'hover:shadow-[0_0_16px_rgba(239,68,68,0.25)]',
    activeGlow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    badgeBg: 'bg-red-500/15',
    badgeText: 'text-red-400',
  },
  portfolio: {
    gradient: 'from-accent-cyan to-accent-blue',
    iconColor: 'text-accent-cyan',
    borderAccent: 'border-accent-cyan/30',
    activeBorder: 'border-accent-cyan/60',
    activeBg: 'bg-accent-cyan/10',
    glow: 'hover:shadow-[0_0_16px_rgba(6,182,212,0.25)]',
    activeGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    badgeBg: 'bg-accent-cyan/15',
    badgeText: 'text-accent-cyan',
  },
};

/**
 * Default cluster icon style for unknown clusters
 * @type {Object}
 */
const DEFAULT_CLUSTER_ICON_STYLE = {
  gradient: 'from-slate-500 to-slate-400',
  iconColor: 'text-slate-400',
  borderAccent: 'border-white/10',
  activeBorder: 'border-white/20',
  activeBg: 'bg-white/5',
  glow: 'hover:shadow-[0_0_16px_rgba(255,255,255,0.1)]',
  activeGlow: 'shadow-[0_0_20px_rgba(255,255,255,0.15)]',
  badgeBg: 'bg-slate-500/15',
  badgeText: 'text-slate-400',
};

/**
 * Resolves the cluster icon style for a given icon/domain identifier
 * @param {string} icon - The icon/domain identifier
 * @returns {Object} The cluster icon style object
 */
function getClusterIconStyle(icon) {
  if (!icon || typeof icon !== 'string') {
    return DEFAULT_CLUSTER_ICON_STYLE;
  }
  const normalized = icon.toLowerCase().trim();
  return CLUSTER_ICON_STYLES[normalized] || DEFAULT_CLUSTER_ICON_STYLE;
}

/**
 * Cluster icon SVG component
 * @param {Object} props
 * @param {string} props.icon - The icon/domain identifier
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function ClusterIcon({ icon, className }) {
  const baseClass = classNames('w-6 h-6 flex-shrink-0', className);
  const normalized = icon ? icon.toLowerCase().trim() : '';

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
  icon: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Formats a data count for display
 * @param {number} count - The data count
 * @returns {string} Formatted count string
 */
function formatDataCount(count) {
  if (count === null || count === undefined || typeof count !== 'number' || isNaN(count)) {
    return '—';
  }

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  return count.toLocaleString('en-US');
}

/**
 * Active indicator check icon component
 * @returns {React.ReactElement}
 */
function ActiveCheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-white"
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
  );
}

/**
 * Intelligence cluster selection card component displaying cluster name,
 * description, icon, and data count. Uses glassmorphism styling with
 * hover animation and active state indicator.
 *
 * @param {Object} props
 * @param {Object} props.cluster - Cluster data object
 * @param {string} props.cluster.name - Cluster display name
 * @param {string} [props.cluster.description] - Cluster description text
 * @param {string} [props.cluster.icon] - Icon/domain identifier (e.g., 'operations', 'finance', 'engineering', 'sales', 'risk', 'portfolio')
 * @param {number} [props.cluster.dataCount] - Number of data points in the cluster
 * @param {string} [props.cluster.id] - Unique cluster identifier
 * @param {string} [props.cluster.domain] - Cluster domain identifier
 * @param {string} [props.cluster.color] - Cluster brand color hex string
 * @param {Array} [props.cluster.kpis] - Array of KPI objects for the cluster
 * @param {Array} [props.cluster.sources] - Array of source system IDs
 * @param {function} [props.onClick] - Click handler, receives the cluster object
 * @param {boolean} [props.isActive=false] - Whether this cluster is currently selected/active
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The intelligence cluster card component
 */
export function IntelligenceClusterCard({ cluster, onClick, isActive = false, className }) {
  if (!cluster || typeof cluster !== 'object') {
    return null;
  }

  const clusterName = cluster.name || 'Unknown Cluster';
  const clusterDescription = cluster.description || null;
  const clusterIcon = cluster.icon || cluster.domain || null;
  const clusterDataCount = typeof cluster.dataCount === 'number' ? cluster.dataCount : null;
  const clusterSources = Array.isArray(cluster.sources) ? cluster.sources : [];
  const clusterKpis = Array.isArray(cluster.kpis) ? cluster.kpis : [];

  const style = getClusterIconStyle(clusterIcon);
  const isClickable = typeof onClick === 'function';

  /**
   * Handles card click
   */
  const handleClick = () => {
    if (isClickable) {
      onClick(cluster);
    }
  };

  /**
   * Handles keyboard events
   * @param {React.KeyboardEvent} event
   */
  const handleKeyDown = (event) => {
    if (isClickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(cluster);
    }
  };

  return (
    <div
      className={classNames(
        'w-full',
        'glass-card',
        'p-5 sm:p-6',
        'border',
        'transition-all duration-300 ease-in-out',
        isActive
          ? [style.activeBorder, style.activeBg, style.activeGlow]
          : [style.borderAccent, 'hover:bg-secondary-500/50'],
        !isActive && style.glow,
        isClickable && 'cursor-pointer',
        isClickable && !isActive && 'hover:translate-y-[-2px]',
        isClickable && 'active:translate-y-0',
        isClickable && 'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
        'relative',
        'overflow-hidden',
        className
      )}
      onClick={handleClick}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      tabIndex={isClickable ? 0 : undefined}
      role={isClickable ? 'button' : undefined}
      aria-pressed={isClickable ? isActive : undefined}
      aria-label={`${clusterName}${isActive ? ' (active)' : ''}`}
    >
      {/* Active indicator */}
      {isActive && (
        <div
          className={classNames(
            'absolute top-3 right-3',
            'flex items-center justify-center',
            'w-6 h-6',
            'rounded-full',
            'bg-gradient-to-br',
            style.gradient,
            'animate-fade-in'
          )}
          aria-hidden="true"
        >
          <ActiveCheckIcon />
        </div>
      )}

      {/* Header: Icon + Name */}
      <div className="flex items-start gap-3 mb-3">
        {/* Icon container */}
        <div
          className={classNames(
            'flex items-center justify-center',
            'w-10 h-10 sm:w-11 sm:h-11',
            'rounded-xl',
            'bg-gradient-to-br',
            style.gradient,
            'flex-shrink-0',
            'shadow-glass-sm'
          )}
          aria-hidden="true"
        >
          <ClusterIcon icon={clusterIcon} className="text-white w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        {/* Name */}
        <div className="min-w-0 flex-1 pt-0.5">
          <h3
            className={classNames(
              'text-sm sm:text-base font-semibold',
              isActive ? 'text-slate-50' : 'text-slate-100',
              'leading-tight',
              'truncate',
              'pr-6'
            )}
          >
            {clusterName}
          </h3>
        </div>
      </div>

      {/* Description */}
      {clusterDescription && (
        <p
          className={classNames(
            'text-xs sm:text-sm',
            'text-slate-400',
            'leading-relaxed',
            'mb-4',
            'line-clamp-2'
          )}
        >
          {clusterDescription}
        </p>
      )}

      {/* Footer: Data count + Sources */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        {/* Data count badge */}
        {clusterDataCount !== null && (
          <div
            className={classNames(
              'inline-flex items-center gap-1.5',
              'px-2.5 py-1',
              'rounded-full',
              'text-xs font-semibold',
              style.badgeBg,
              style.badgeText
            )}
          >
            <svg
              className="w-3 h-3 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="tabular-nums">{formatDataCount(clusterDataCount)}</span>
            <span className="text-slate-500 font-normal">points</span>
          </div>
        )}

        {/* KPI count indicator */}
        {clusterKpis.length > 0 && clusterDataCount === null && (
          <div
            className={classNames(
              'inline-flex items-center gap-1.5',
              'px-2.5 py-1',
              'rounded-full',
              'text-xs font-semibold',
              style.badgeBg,
              style.badgeText
            )}
          >
            <span className="tabular-nums">{clusterKpis.length}</span>
            <span className="text-slate-500 font-normal">KPIs</span>
          </div>
        )}

        {/* Source count */}
        {clusterSources.length > 0 && (
          <div className="flex items-center gap-1">
            <svg
              className="w-3.5 h-3.5 text-slate-500"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs text-slate-500">
              {clusterSources.length} {clusterSources.length === 1 ? 'source' : 'sources'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

IntelligenceClusterCard.propTypes = {
  cluster: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    icon: PropTypes.string,
    domain: PropTypes.string,
    dataCount: PropTypes.number,
    color: PropTypes.string,
    kpis: PropTypes.arrayOf(PropTypes.object),
    sources: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
  className: PropTypes.string,
};

export default IntelligenceClusterCard;