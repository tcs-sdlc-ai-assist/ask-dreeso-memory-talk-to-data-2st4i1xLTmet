import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames, formatTimestamp } from '../utils/helpers.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigation } from '../contexts/NavigationContext.jsx';
import { SCREEN_IDS, VIEW_STATES, PERSONAS } from '../utils/constants.js';
import { getAuditLogs, getAuditLogCount, exportAuditLogs, ACTION_TYPES } from '../services/auditLogService.js';
import { getQueryResults, getActionLogs, clearAllData } from '../services/localStorageService.js';
import { getAllSources, getSourceSummary } from '../services/sourceTransparencyService.js';
import { GlassCard } from '../components/GlassCard.jsx';
import { PersonaBar } from '../components/PersonaBar.jsx';
import { ForecastChart } from '../components/ForecastChart.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

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
};

/**
 * Action type display labels and colors
 * @type {Object<string, Object>}
 */
const ACTION_TYPE_DISPLAY = {
  [ACTION_TYPES.LOGIN]: { label: 'Login', color: 'text-accent-green', icon: 'login' },
  [ACTION_TYPES.LOGOUT]: { label: 'Logout', color: 'text-slate-400', icon: 'logout' },
  [ACTION_TYPES.QUERY]: { label: 'Query', color: 'text-accent-blue', icon: 'query' },
  [ACTION_TYPES.QUERY_FAIL]: { label: 'Query Failed', color: 'text-red-400', icon: 'query' },
  [ACTION_TYPES.ACTION_EXECUTE]: { label: 'Action Executed', color: 'text-accent-purple', icon: 'action' },
  [ACTION_TYPES.ACTION_EXECUTE_FAIL]: { label: 'Action Failed', color: 'text-red-400', icon: 'action' },
  [ACTION_TYPES.CTA_CLICK]: { label: 'CTA Click', color: 'text-accent-cyan', icon: 'cta' },
  [ACTION_TYPES.NAVIGATE]: { label: 'Navigate', color: 'text-slate-400', icon: 'navigate' },
  [ACTION_TYPES.PERSONA_SELECT]: { label: 'Persona Select', color: 'text-accent-orange', icon: 'persona' },
  [ACTION_TYPES.SIGNUP]: { label: 'Signup', color: 'text-accent-green', icon: 'login' },
};

/**
 * Timeline event icon component
 * @param {Object} props
 * @param {string} props.icon - Icon identifier
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function TimelineIcon({ icon, className }) {
  const baseClass = classNames('w-4 h-4 flex-shrink-0', className);

  switch (icon) {
    case 'login':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    case 'logout':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
        </svg>
      );
    case 'query':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      );
    case 'action':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      );
    case 'cta':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
      );
    case 'navigate':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    case 'persona':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
  }
}

TimelineIcon.propTypes = {
  icon: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Stat icon component for summary cards
 * @param {Object} props
 * @param {string} props.icon - Icon identifier
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function SummaryStatIcon({ icon, className }) {
  const baseClass = classNames('w-5 h-5 flex-shrink-0', className);

  switch (icon) {
    case 'query':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      );
    case 'action':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      );
    case 'system':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
        </svg>
      );
    case 'audit':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    case 'time':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    case 'cta':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
  }
}

SummaryStatIcon.propTypes = {
  icon: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Summary stat card component
 * @param {Object} props
 * @param {string} props.label - Stat label
 * @param {number|string} props.value - Stat value
 * @param {string} [props.icon] - Icon identifier
 * @param {string} [props.color] - Hex color
 * @param {number} props.index - Card index for animation delay
 * @returns {React.ReactElement}
 */
function SummaryStatCard({ label, value, icon, color, index }) {
  return (
    <div
      className={classNames(
        'glass-card p-4 sm:p-5',
        'transition-all duration-300 ease-in-out',
        'hover:bg-secondary-500/50',
        'hover:translate-y-[-2px]',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">
          {label}
        </p>
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
          style={{ backgroundColor: color ? `${color}20` : 'rgba(59,130,246,0.12)' }}
        >
          <SummaryStatIcon icon={icon} className="w-4 h-4" />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-100 tabular-nums">
        {value}
      </p>
    </div>
  );
}

SummaryStatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.string,
  color: PropTypes.string,
  index: PropTypes.number.isRequired,
};

/**
 * Query history list item component
 * @param {Object} props
 * @param {Object} props.result - Query result object
 * @param {number} props.index - Item index
 * @returns {React.ReactElement}
 */
function QueryHistoryItem({ result, index }) {
  const isError = result.status === 'error';

  return (
    <div
      className={classNames(
        'flex items-start gap-3',
        'px-4 py-3',
        'rounded-xl',
        'bg-secondary-500/20',
        'border border-white/5',
        'transition-all duration-300 ease-in-out',
        'hover:bg-secondary-500/30',
        'hover:border-white/10',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      {/* Index badge */}
      <div
        className={classNames(
          'flex items-center justify-center',
          'w-6 h-6',
          'rounded-full',
          'flex-shrink-0',
          'text-xs font-bold',
          isError
            ? 'bg-red-500/20 text-red-400'
            : 'bg-accent-blue/20 text-accent-blue'
        )}
      >
        {index + 1}
      </div>

      {/* Query details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 leading-relaxed truncate">
          {result.query || 'No query text'}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className={classNames(
            'text-xs font-medium',
            isError ? 'text-red-400' : 'text-accent-green'
          )}>
            {isError ? 'Error' : (result.outputType || 'kpi')}
          </span>
          {result.title && (
            <span className="text-xs text-slate-500 truncate">
              {result.title}
            </span>
          )}
          {typeof result.responseTimeMs === 'number' && result.responseTimeMs > 0 && (
            <span className="text-xs text-slate-500 tabular-nums flex-shrink-0">
              {result.responseTimeMs}ms
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

QueryHistoryItem.propTypes = {
  result: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * Action log list item component
 * @param {Object} props
 * @param {Object} props.log - Action log entry
 * @param {number} props.index - Item index
 * @returns {React.ReactElement}
 */
function ActionLogItem({ log, index }) {
  const isSuccess = log.status === 'success';

  return (
    <div
      className={classNames(
        'flex items-start gap-3',
        'px-4 py-3',
        'rounded-xl',
        'bg-secondary-500/20',
        'border border-white/5',
        'transition-all duration-300 ease-in-out',
        'hover:bg-secondary-500/30',
        'hover:border-white/10',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      {/* Status dot */}
      <div className="flex-shrink-0 pt-1">
        <span
          className={classNames(
            'block w-2.5 h-2.5 rounded-full',
            isSuccess
              ? 'bg-accent-green shadow-[0_0_6px_rgba(16,185,129,0.6)]'
              : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
          )}
          aria-hidden="true"
        />
      </div>

      {/* Action details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200">
            {log.action || 'Unknown Action'}
          </span>
          {log.systemLabel && (
            <span className="text-xs text-slate-500">
              → {log.systemLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className={classNames(
            'text-xs font-medium',
            isSuccess ? 'text-accent-green' : 'text-red-400'
          )}>
            {isSuccess ? 'Success' : 'Failed'}
          </span>
          {typeof log.executionTimeMs === 'number' && (
            <span className="text-xs text-slate-500 tabular-nums">
              {log.executionTimeMs}ms
            </span>
          )}
          {log.timestamp && (
            <span className="text-xs text-slate-500">
              {formatTimestamp(log.timestamp, { relative: true })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

ActionLogItem.propTypes = {
  log: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * Timeline event component for the persona journey
 * @param {Object} props
 * @param {Object} props.event - Audit log event
 * @param {number} props.index - Event index
 * @param {boolean} props.isLast - Whether this is the last event
 * @returns {React.ReactElement}
 */
function TimelineEvent({ event, index, isLast }) {
  const display = ACTION_TYPE_DISPLAY[event.actionType] || {
    label: event.actionType || 'Event',
    color: 'text-slate-400',
    icon: 'default',
  };

  const details = event.details || {};
  let description = '';

  if (event.actionType === ACTION_TYPES.QUERY && details.query) {
    description = details.query;
  } else if (event.actionType === ACTION_TYPES.NAVIGATE && details.to) {
    description = `→ ${details.to.screenName || 'Screen'}`;
  } else if (event.actionType === ACTION_TYPES.CTA_CLICK && details.ctaLabel) {
    description = details.ctaLabel;
  } else if (event.actionType === ACTION_TYPES.ACTION_EXECUTE && details.actionType) {
    description = `${details.actionType} in ${details.systemLabel || 'System'}`;
  } else if (event.actionType === ACTION_TYPES.PERSONA_SELECT && details.persona) {
    description = `Selected ${details.persona}`;
  } else if (event.actionType === ACTION_TYPES.LOGIN && details.persona) {
    description = `Logged in as ${details.persona}`;
  }

  return (
    <div
      className={classNames(
        'flex gap-3',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
    >
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={classNames(
            'flex items-center justify-center',
            'w-7 h-7',
            'rounded-full',
            'bg-secondary-500/60',
            'border border-white/10'
          )}
        >
          <TimelineIcon icon={display.icon} className={display.color} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 min-h-[24px] bg-white/10" />
        )}
      </div>

      {/* Event content */}
      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-center gap-2">
          <span className={classNames('text-sm font-medium', display.color)}>
            {display.label}
          </span>
          {event.timestamp && (
            <span className="text-xs text-slate-500">
              {formatTimestamp(event.timestamp, { relative: true })}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

TimelineEvent.propTypes = {
  event: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  isLast: PropTypes.bool.isRequired,
};

/**
 * Systems accessed summary component
 * @param {Object} props
 * @param {Array} props.sources - Array of source transparency objects
 * @returns {React.ReactElement}
 */
function SystemsAccessedSummary({ sources }) {
  if (!Array.isArray(sources) || sources.length === 0) {
    return (
      <p className="text-sm text-slate-500">No systems accessed during this session.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {sources.map((source, index) => (
        <div
          key={source.systemId}
          className={classNames(
            'flex items-center gap-3',
            'px-3 py-2.5',
            'rounded-lg',
            'bg-secondary-500/20',
            'border border-white/5',
            'animate-fade-in'
          )}
          style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
        >
          <span
            className={classNames(
              'block w-2.5 h-2.5 rounded-full',
              source.isLive
                ? 'bg-accent-green shadow-[0_0_6px_rgba(16,185,129,0.6)]'
                : 'bg-accent-orange shadow-[0_0_6px_rgba(245,158,11,0.6)]'
            )}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {source.systemLabel}
            </p>
            <p className="text-xs text-slate-500">
              {source.isLive ? 'Live' : 'Cached'} • {Math.round(source.confidence * 100)}% confidence
            </p>
          </div>
          {source.latency && (
            <span className="text-xs text-slate-500 flex-shrink-0 tabular-nums">
              {source.latency}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

SystemsAccessedSummary.propTypes = {
  sources: PropTypes.array.isRequired,
};

/**
 * Copy to clipboard success state duration
 * @type {number}
 */
const COPY_SUCCESS_DURATION = 2000;

/**
 * Demo summary screen component (Screen 20).
 * Shows complete session overview — all queries asked, actions taken,
 * systems accessed, and audit log summary. Includes export capability
 * (copy to clipboard) and session reset option. Displays persona journey timeline.
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The demo summary screen component
 */
export function DemoSummaryScreen({ className }) {
  const { persona, role, cluster, isAuthenticated, logout } = useAuth();
  const { goToDashboard, navigateTo } = useNavigation();

  const [copyState, setCopyState] = useState('idle'); // 'idle' | 'copied' | 'error'
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const currentPersona = persona || PERSONAS.LUKAS.id;
  const currentRole = role || 'User';
  const currentCluster = cluster || 'operations';

  /**
   * Session data aggregation
   */
  const sessionData = useMemo(() => {
    const queryResults = getQueryResults();
    const actionLogs = getActionLogs();
    const auditLogCount = getAuditLogCount();
    const allSources = getAllSources();

    // Get audit logs for timeline (most recent 50)
    const auditLogs = getAuditLogs({
      limit: 50,
      sortOrder: 'asc',
    });

    // Filter meaningful timeline events
    const timelineEvents = auditLogs.filter((log) => {
      const type = log.actionType;
      return (
        type === ACTION_TYPES.LOGIN ||
        type === ACTION_TYPES.QUERY ||
        type === ACTION_TYPES.ACTION_EXECUTE ||
        type === ACTION_TYPES.CTA_CLICK ||
        type === ACTION_TYPES.PERSONA_SELECT ||
        type === ACTION_TYPES.NAVIGATE
      );
    });

    // Count queries
    const totalQueries = queryResults.length;
    const successfulQueries = queryResults.filter((r) => r.status === 'success').length;
    const failedQueries = queryResults.filter((r) => r.status === 'error').length;

    // Count actions
    const totalActions = actionLogs.length;
    const successfulActions = actionLogs.filter((a) => a.status === 'success').length;

    // Count CTA clicks
    const ctaClicks = auditLogs.filter((l) => l.actionType === ACTION_TYPES.CTA_CLICK).length;

    // Calculate average response time
    const responseTimes = queryResults
      .filter((r) => typeof r.responseTimeMs === 'number' && r.responseTimeMs > 0)
      .map((r) => r.responseTimeMs);
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length)
      : 0;

    // Unique systems accessed
    const systemsAccessed = new Set();
    queryResults.forEach((r) => {
      if (Array.isArray(r.sourceIds)) {
        r.sourceIds.forEach((id) => systemsAccessed.add(id));
      }
    });
    actionLogs.forEach((a) => {
      if (a.system) {
        systemsAccessed.add(a.system);
      }
    });

    // Session duration
    const timestamps = auditLogs
      .map((l) => l.timestampMs || new Date(l.timestamp).getTime())
      .filter((t) => !isNaN(t));
    const sessionStartMs = timestamps.length > 0 ? Math.min(...timestamps) : Date.now();
    const sessionEndMs = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();
    const sessionDurationMs = sessionEndMs - sessionStartMs;
    const sessionDurationMinutes = Math.max(1, Math.round(sessionDurationMs / 60000));

    return {
      queryResults,
      actionLogs,
      auditLogCount,
      allSources,
      timelineEvents,
      totalQueries,
      successfulQueries,
      failedQueries,
      totalActions,
      successfulActions,
      ctaClicks,
      avgResponseTime,
      systemsAccessedCount: systemsAccessed.size,
      sessionDurationMinutes,
      sessionStartMs,
    };
  }, []);

  /**
   * Summary stats for the KPI cards
   */
  const summaryStats = useMemo(() => [
    { label: 'Queries Asked', value: sessionData.totalQueries, icon: 'query', color: '#3B82F6' },
    { label: 'Actions Taken', value: sessionData.totalActions, icon: 'action', color: '#8B5CF6' },
    { label: 'Systems Accessed', value: sessionData.systemsAccessedCount, icon: 'system', color: '#06B6D4' },
    { label: 'CTA Interactions', value: sessionData.ctaClicks, icon: 'cta', color: '#F59E0B' },
    { label: 'Avg Response Time', value: `${sessionData.avgResponseTime}ms`, icon: 'time', color: '#10B981' },
    { label: 'Audit Log Entries', value: sessionData.auditLogCount, icon: 'audit', color: '#EC4899' },
  ], [sessionData]);

  /**
   * Handles export to clipboard
   */
  const handleExportToClipboard = useCallback(async () => {
    try {
      const exportData = exportAuditLogs();
      const queryResults = getQueryResults();
      const actionLogs = getActionLogs();

      const exportObject = {
        exportedAt: new Date().toISOString(),
        persona: currentPersona,
        role: currentRole,
        cluster: currentCluster,
        sessionSummary: {
          totalQueries: sessionData.totalQueries,
          successfulQueries: sessionData.successfulQueries,
          failedQueries: sessionData.failedQueries,
          totalActions: sessionData.totalActions,
          successfulActions: sessionData.successfulActions,
          ctaInteractions: sessionData.ctaClicks,
          avgResponseTimeMs: sessionData.avgResponseTime,
          systemsAccessed: sessionData.systemsAccessedCount,
          sessionDurationMinutes: sessionData.sessionDurationMinutes,
          auditLogEntries: sessionData.auditLogCount,
        },
        queries: queryResults.map((r) => ({
          query: r.query,
          outputType: r.outputType,
          title: r.title,
          status: r.status,
          responseTimeMs: r.responseTimeMs,
          timestamp: r.timestamp,
        })),
        actions: actionLogs.map((a) => ({
          action: a.action,
          system: a.system,
          systemLabel: a.systemLabel,
          status: a.status,
          executionTimeMs: a.executionTimeMs,
          timestamp: a.timestamp,
        })),
        auditLog: exportData,
      };

      const jsonString = JSON.stringify(exportObject, null, 2);

      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(jsonString);
        setCopyState('copied');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = jsonString;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopyState('copied');
      }

      setTimeout(() => {
        setCopyState('idle');
      }, COPY_SUCCESS_DURATION);
    } catch (_err) {
      setCopyState('error');
      setTimeout(() => {
        setCopyState('idle');
      }, COPY_SUCCESS_DURATION);
    }
  }, [currentPersona, currentRole, currentCluster, sessionData]);

  /**
   * Handles session reset
   */
  const handleResetSession = useCallback(() => {
    setIsResetting(true);

    try {
      clearAllData();
      logout();
      navigateTo(SCREEN_IDS.SPLASH);
    } catch (_err) {
      console.error('DemoSummaryScreen: Failed to reset session.');
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  }, [logout, navigateTo]);

  /**
   * Handles back to dashboard navigation
   */
  const handleBackToDashboard = useCallback(() => {
    goToDashboard();
  }, [goToDashboard]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div
        className={classNames(
          'w-full',
          'flex flex-col',
          'gap-0',
          className
        )}
      >
        {/* Persona Bar */}
        <PersonaBar
          persona={currentPersona}
          role={currentRole}
          currentCluster={currentCluster}
        />

        {/* Navigation breadcrumb */}
        <div className="px-1 py-3 animate-fade-in">
          <button
            type="button"
            onClick={handleBackToDashboard}
            className={classNames(
              'inline-flex items-center gap-1.5',
              'text-xs font-medium',
              'text-slate-400',
              'transition-all duration-200',
              'hover:text-accent-blue',
              'focus:outline-none focus:text-accent-blue'
            )}
            aria-label="Back to dashboard"
          >
            <svg
              className="w-3.5 h-3.5"
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
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="py-4 sm:py-6 space-y-6">
          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 mb-2">
              Demo Session Summary
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Complete overview of your session — queries asked, actions taken, systems accessed, and full audit trail.
            </p>
            {sessionData.sessionStartMs && (
              <p className="text-xs text-slate-500 mt-1">
                Session duration: ~{sessionData.sessionDurationMinutes} {sessionData.sessionDurationMinutes === 1 ? 'minute' : 'minutes'}
              </p>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {summaryStats.map((stat, index) => (
              <SummaryStatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                index={index}
              />
            ))}
          </div>

          {/* Persona Journey Timeline */}
          <GlassCard className="!p-5 sm:!p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100 mb-4">
              Persona Journey Timeline
            </h2>
            {sessionData.timelineEvents.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                {sessionData.timelineEvents.map((event, index) => (
                  <TimelineEvent
                    key={event.id || `timeline-${index}`}
                    event={event}
                    index={index}
                    isLast={index === sessionData.timelineEvents.length - 1}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">
                No journey events recorded yet. Start by asking a query.
              </p>
            )}
          </GlassCard>

          {/* Queries Asked */}
          <GlassCard className="!p-5 sm:!p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-100">
                Queries Asked
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">
                {sessionData.totalQueries} total • {sessionData.successfulQueries} successful
              </span>
            </div>
            {sessionData.queryResults.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                {sessionData.queryResults.map((result, index) => (
                  <QueryHistoryItem
                    key={result.id || `query-${index}`}
                    result={result}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">
                No queries have been asked during this session.
              </p>
            )}
          </GlassCard>

          {/* Actions Taken */}
          <GlassCard className="!p-5 sm:!p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-100">
                Actions Taken
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">
                {sessionData.totalActions} total • {sessionData.successfulActions} successful
              </span>
            </div>
            {sessionData.actionLogs.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
                {sessionData.actionLogs.map((log, index) => (
                  <ActionLogItem
                    key={log.id || `action-${index}`}
                    log={log}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-4 text-center">
                No actions have been executed during this session.
              </p>
            )}
          </GlassCard>

          {/* Systems Accessed */}
          <GlassCard className="!p-5 sm:!p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100 mb-4">
              Systems Accessed
            </h2>
            <SystemsAccessedSummary sources={sessionData.allSources} />
          </GlassCard>

          {/* Session Performance KPIs */}
          {sessionData.totalQueries > 0 && (
            <div className="animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <ForecastChart
                data={[
                  { label: 'Total Queries', value: sessionData.totalQueries, unit: '', trend: 'stable', change: 0 },
                  { label: 'Success Rate', value: sessionData.totalQueries > 0 ? Math.round((sessionData.successfulQueries / sessionData.totalQueries) * 100) : 0, unit: '%', trend: 'up', change: 0 },
                  { label: 'Avg Response', value: sessionData.avgResponseTime, unit: 'ms', trend: 'down', change: 0 },
                  { label: 'Actions Executed', value: sessionData.totalActions, unit: '', trend: 'stable', change: 0 },
                ]}
                chartType="kpi"
                title="Session Performance"
                subtitle="Key performance metrics for this demo session"
              />
            </div>
          )}

          {/* Export & Reset Actions */}
          <GlassCard variant="elevated" className="!p-5 sm:!p-6">
            <h2 className="text-base sm:text-lg font-semibold text-slate-100 mb-2">
              Session Actions
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              Export your session data or reset to start a new demo.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Export to Clipboard */}
              <button
                type="button"
                onClick={handleExportToClipboard}
                disabled={copyState === 'copied'}
                className={classNames(
                  'flex items-center justify-center gap-2',
                  'px-5 py-3',
                  'rounded-xl',
                  'text-sm font-semibold',
                  'transition-all duration-300 ease-in-out',
                  'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
                  copyState === 'copied'
                    ? 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                    : copyState === 'error'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'text-white bg-gradient-accent hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:translate-y-[-1px] active:translate-y-0'
                )}
                aria-label={copyState === 'copied' ? 'Copied to clipboard' : 'Export session data to clipboard'}
              >
                {copyState === 'copied' ? (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Copied to Clipboard</span>
                  </>
                ) : copyState === 'error' ? (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Copy Failed</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    <span>Export to Clipboard</span>
                  </>
                )}
              </button>

              {/* Back to Dashboard */}
              <button
                type="button"
                onClick={handleBackToDashboard}
                className={classNames(
                  'flex items-center justify-center gap-2',
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
                aria-label="Back to dashboard"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                <span>Dashboard</span>
              </button>

              {/* Reset Session */}
              {!showResetConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className={classNames(
                    'flex items-center justify-center gap-2',
                    'px-5 py-3',
                    'rounded-xl',
                    'text-sm font-semibold',
                    'text-red-400',
                    'bg-red-500/10',
                    'border border-red-500/20',
                    'transition-all duration-300 ease-in-out',
                    'hover:bg-red-500/20',
                    'hover:border-red-500/40',
                    'focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-0'
                  )}
                  aria-label="Reset session"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span>Reset Session</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetSession}
                    disabled={isResetting}
                    className={classNames(
                      'flex items-center justify-center gap-2',
                      'px-4 py-3',
                      'rounded-xl',
                      'text-sm font-semibold',
                      'text-white',
                      'bg-red-500/80',
                      'transition-all duration-300 ease-in-out',
                      'hover:bg-red-500',
                      'focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-0',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    aria-label="Confirm reset"
                  >
                    {isResetting ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <span>Confirm Reset</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    disabled={isResetting}
                    className={classNames(
                      'flex items-center justify-center',
                      'px-4 py-3',
                      'rounded-xl',
                      'text-sm font-medium',
                      'text-slate-400',
                      'bg-secondary-500/40',
                      'border border-white/10',
                      'transition-all duration-300 ease-in-out',
                      'hover:text-slate-200',
                      'hover:bg-secondary-500/60',
                      'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-0',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                    aria-label="Cancel reset"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-xs text-slate-500">
              Ask Dreeso Memory v{import.meta.env.VITE_APP_VERSION || '1.0.0'} • Session data stored locally
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

DemoSummaryScreen.propTypes = {
  className: PropTypes.string,
};

export default DemoSummaryScreen;