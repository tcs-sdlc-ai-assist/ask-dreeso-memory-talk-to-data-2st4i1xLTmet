import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { formatTimestamp } from '../utils/helpers.js';
import { SOURCE_STATUS } from '../services/sourceTransparencyService.js';

/**
 * Status dot color mappings
 * @type {Object<string, Object>}
 */
const STATUS_DOT_STYLES = {
  [SOURCE_STATUS.LIVE]: {
    dot: 'bg-accent-green',
    glow: 'shadow-[0_0_6px_rgba(16,185,129,0.6)]',
    label: 'Live',
    textColor: 'text-accent-green',
  },
  [SOURCE_STATUS.CACHED]: {
    dot: 'bg-accent-orange',
    glow: 'shadow-[0_0_6px_rgba(245,158,11,0.6)]',
    label: 'Cached',
    textColor: 'text-accent-orange',
  },
  [SOURCE_STATUS.OFFLINE]: {
    dot: 'bg-red-500',
    glow: 'shadow-[0_0_6px_rgba(239,68,68,0.6)]',
    label: 'Offline',
    textColor: 'text-red-500',
  },
};

/**
 * Default status dot style for unknown statuses
 * @type {Object}
 */
const DEFAULT_STATUS_STYLE = {
  dot: 'bg-slate-500',
  glow: '',
  label: 'Unknown',
  textColor: 'text-slate-500',
};

/**
 * Resolves the status dot style for a given status
 * @param {string} status - The source status
 * @returns {Object} The status dot style object
 */
function getStatusStyle(status) {
  return STATUS_DOT_STYLES[status] || DEFAULT_STATUS_STYLE;
}

/**
 * Confidence bar color based on confidence value
 * @param {number} confidence - Confidence value between 0 and 1
 * @returns {string} Tailwind background class for the confidence bar
 */
function getConfidenceBarColor(confidence) {
  if (typeof confidence !== 'number' || isNaN(confidence)) {
    return 'bg-slate-500';
  }
  if (confidence >= 0.95) {
    return 'bg-accent-green';
  }
  if (confidence >= 0.80) {
    return 'bg-accent-blue';
  }
  if (confidence >= 0.60) {
    return 'bg-accent-orange';
  }
  return 'bg-red-500';
}

/**
 * Individual source indicator item component
 * @param {Object} props
 * @param {Object} props.source - The source transparency object
 * @param {string} props.source.systemId - The source system ID
 * @param {string} props.source.systemName - The source system name
 * @param {string} props.source.systemLabel - The source system display label
 * @param {string} props.source.color - The source system brand color
 * @param {string} props.source.status - Source status ('live', 'cached', 'offline')
 * @param {boolean} props.source.isLive - Whether the source is live
 * @param {string} props.source.lastUpdated - ISO timestamp of last update
 * @param {number} props.source.confidence - Confidence value between 0 and 1
 * @param {string} props.source.confidenceLabel - Human-readable confidence label
 * @param {string|null} props.source.latency - Latency string or null
 * @param {string} props.source.indicatorColor - Hex color for the status indicator dot
 * @returns {React.ReactElement}
 */
function SourceIndicatorItem({ source }) {
  const statusStyle = getStatusStyle(source.status);
  const confidencePercent = Math.round((source.confidence || 0) * 100);
  const confidenceBarColor = getConfidenceBarColor(source.confidence);
  const formattedTime = formatTimestamp(source.lastUpdated, { relative: true });

  return (
    <div
      className={classNames(
        'flex items-center gap-3',
        'px-3 py-2.5',
        'rounded-lg',
        'bg-secondary-500/20',
        'border border-white/5',
        'transition-all duration-300 ease-in-out',
        'hover:bg-secondary-500/30',
        'hover:border-white/10'
      )}
    >
      {/* Status dot */}
      <div className="flex-shrink-0 relative">
        <span
          className={classNames(
            'block w-2.5 h-2.5 rounded-full',
            statusStyle.dot,
            statusStyle.glow
          )}
          aria-hidden="true"
        />
        {source.status === SOURCE_STATUS.LIVE && (
          <span
            className={classNames(
              'absolute inset-0 w-2.5 h-2.5 rounded-full',
              statusStyle.dot,
              'animate-ping opacity-75'
            )}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Source info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-200 truncate">
            {source.systemLabel || source.systemName}
          </span>
          <span
            className={classNames(
              'text-xs font-medium flex-shrink-0',
              statusStyle.textColor
            )}
          >
            {statusStyle.label}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-xs text-slate-400 truncate">
            {formattedTime}
          </span>
          {source.latency && (
            <span className="text-xs text-slate-500 flex-shrink-0">
              {source.latency}
            </span>
          )}
        </div>

        {/* Confidence bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-secondary-500/50 overflow-hidden">
            <div
              className={classNames(
                'h-full rounded-full transition-all duration-500 ease-out',
                confidenceBarColor
              )}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0 tabular-nums">
            {confidencePercent}%
          </span>
        </div>
      </div>
    </div>
  );
}

SourceIndicatorItem.propTypes = {
  source: PropTypes.shape({
    systemId: PropTypes.string.isRequired,
    systemName: PropTypes.string.isRequired,
    systemLabel: PropTypes.string.isRequired,
    color: PropTypes.string,
    status: PropTypes.string.isRequired,
    isLive: PropTypes.bool,
    lastUpdated: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired,
    confidenceLabel: PropTypes.string,
    latency: PropTypes.string,
    indicatorColor: PropTypes.string,
  }).isRequired,
};

/**
 * Source transparency indicator component showing data provenance for query results.
 * Displays green dots for live data sources, yellow for cached, red for offline.
 * Shows system name, status dot, last updated time, and confidence percentage.
 *
 * @param {Object} props
 * @param {Array<Object>} props.sources - Array of source transparency objects from sourceTransparencyService
 * @param {string} [props.className] - Additional class names for the wrapper
 * @param {boolean} [props.compact=false] - Whether to render in compact mode
 * @returns {React.ReactElement|null} The source indicator component or null if no sources
 */
export function SourceIndicator({ sources, className, compact = false }) {
  if (!Array.isArray(sources) || sources.length === 0) {
    return null;
  }

  const validSources = sources.filter(
    (source) =>
      source &&
      typeof source === 'object' &&
      source.systemId &&
      source.systemName &&
      source.status
  );

  if (validSources.length === 0) {
    return null;
  }

  const liveCount = validSources.filter(
    (s) => s.status === SOURCE_STATUS.LIVE
  ).length;

  if (compact) {
    return (
      <div
        className={classNames('flex items-center gap-2 flex-wrap', className)}
        role="group"
        aria-label="Data sources"
      >
        {validSources.map((source) => {
          const statusStyle = getStatusStyle(source.status);
          return (
            <div
              key={source.systemId}
              className={classNames(
                'inline-flex items-center gap-1.5',
                'px-2 py-1',
                'rounded-full',
                'bg-secondary-500/20',
                'border border-white/5',
                'text-xs'
              )}
              title={`${source.systemLabel} — ${statusStyle.label} — ${Math.round((source.confidence || 0) * 100)}% confidence`}
            >
              <span
                className={classNames(
                  'block w-1.5 h-1.5 rounded-full',
                  statusStyle.dot
                )}
                aria-hidden="true"
              />
              <span className="text-slate-300">
                {source.systemLabel || source.systemName}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={classNames('w-full', className)}
      role="group"
      aria-label="Data source transparency"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-slate-400"
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
          <span className="text-sm font-medium text-slate-300">
            Data Sources
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {liveCount}/{validSources.length} live
        </span>
      </div>

      {/* Source list */}
      <div className="space-y-2">
        {validSources.map((source, index) => (
          <div
            key={source.systemId}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 80}ms`,
              animationFillMode: 'both',
            }}
          >
            <SourceIndicatorItem source={source} />
          </div>
        ))}
      </div>
    </div>
  );
}

SourceIndicator.propTypes = {
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      systemId: PropTypes.string.isRequired,
      systemName: PropTypes.string.isRequired,
      systemLabel: PropTypes.string.isRequired,
      color: PropTypes.string,
      status: PropTypes.string.isRequired,
      isLive: PropTypes.bool,
      lastUpdated: PropTypes.string.isRequired,
      confidence: PropTypes.number.isRequired,
      confidenceLabel: PropTypes.string,
      latency: PropTypes.string,
      indicatorColor: PropTypes.string,
    })
  ).isRequired,
  className: PropTypes.string,
  compact: PropTypes.bool,
};

export default SourceIndicator;