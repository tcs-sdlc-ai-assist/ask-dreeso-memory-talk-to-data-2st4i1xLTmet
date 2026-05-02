import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';

/**
 * Risk level constants
 * @enum {string}
 */
const RISK_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Color and style mappings for risk levels
 * @type {Object<string, Object>}
 */
const RISK_LEVEL_STYLES = {
  [RISK_LEVELS.HIGH]: {
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    accent: 'border-l-red-500',
    icon: 'text-red-400',
    glow: 'hover:shadow-[0_0_12px_rgba(239,68,68,0.2)]',
    label: 'High',
    dotColor: 'bg-red-500',
    dotGlow: 'shadow-[0_0_6px_rgba(239,68,68,0.6)]',
    barColor: 'bg-red-500',
  },
  [RISK_LEVELS.MEDIUM]: {
    badge: 'bg-accent-orange/20 text-accent-orange border-accent-orange/30',
    accent: 'border-l-accent-orange',
    icon: 'text-accent-orange',
    glow: 'hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    label: 'Medium',
    dotColor: 'bg-accent-orange',
    dotGlow: 'shadow-[0_0_6px_rgba(245,158,11,0.6)]',
    barColor: 'bg-accent-orange',
  },
  [RISK_LEVELS.LOW]: {
    badge: 'bg-accent-green/20 text-accent-green border-accent-green/30',
    accent: 'border-l-accent-green',
    icon: 'text-accent-green',
    glow: 'hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    label: 'Low',
    dotColor: 'bg-accent-green',
    dotGlow: 'shadow-[0_0_6px_rgba(16,185,129,0.6)]',
    barColor: 'bg-accent-green',
  },
};

/**
 * Default style for unknown risk levels
 * @type {Object}
 */
const DEFAULT_RISK_STYLE = {
  badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  accent: 'border-l-slate-500',
  icon: 'text-slate-400',
  glow: 'hover:shadow-[0_0_12px_rgba(100,116,139,0.2)]',
  label: 'Unknown',
  dotColor: 'bg-slate-500',
  dotGlow: '',
  barColor: 'bg-slate-500',
};

/**
 * Resolves the style object for a given risk level
 * @param {string} level - The risk level string
 * @returns {Object} The style object
 */
function getRiskLevelStyle(level) {
  if (!level || typeof level !== 'string') {
    return DEFAULT_RISK_STYLE;
  }
  const normalized = level.toLowerCase().trim();
  return RISK_LEVEL_STYLES[normalized] || DEFAULT_RISK_STYLE;
}

/**
 * Risk level icon component
 * @param {Object} props
 * @param {string} props.level - The risk level
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function RiskIcon({ level, className }) {
  const baseClass = classNames('w-5 h-5 flex-shrink-0', className);
  const normalized = level ? level.toLowerCase().trim() : '';

  switch (normalized) {
    case RISK_LEVELS.HIGH:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case RISK_LEVELS.MEDIUM:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case RISK_LEVELS.LOW:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      );
  }
}

RiskIcon.propTypes = {
  level: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Risk level badge component
 * @param {Object} props
 * @param {string} props.level - The risk level
 * @returns {React.ReactElement}
 */
function RiskBadge({ level }) {
  const style = getRiskLevelStyle(level);

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5',
        'px-2.5 py-1',
        'rounded-full',
        'text-xs font-semibold uppercase tracking-wider',
        'border',
        style.badge
      )}
    >
      <span
        className={classNames(
          'block w-1.5 h-1.5 rounded-full',
          style.dotColor,
          style.dotGlow
        )}
        aria-hidden="true"
      />
      {style.label}
    </span>
  );
}

RiskBadge.propTypes = {
  level: PropTypes.string.isRequired,
};

/**
 * Probability bar component
 * @param {Object} props
 * @param {number} props.probability - Probability value between 0 and 1
 * @param {string} props.barColor - Tailwind background class for the bar
 * @returns {React.ReactElement}
 */
function ProbabilityBar({ probability, barColor }) {
  const percent = Math.round(
    (typeof probability === 'number' && !isNaN(probability)
      ? Math.min(Math.max(probability, 0), 1)
      : 0) * 100
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 flex-shrink-0 w-16">Probability</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary-500/50 overflow-hidden">
        <div
          className={classNames(
            'h-full rounded-full transition-all duration-500 ease-out',
            barColor
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 flex-shrink-0 tabular-nums w-8 text-right">
        {percent}%
      </span>
    </div>
  );
}

ProbabilityBar.propTypes = {
  probability: PropTypes.number.isRequired,
  barColor: PropTypes.string.isRequired,
};

/**
 * Individual risk signal card component
 * @param {Object} props
 * @param {Object} props.risk - The risk object
 * @param {string} props.risk.level - Risk level ('high', 'medium', 'low')
 * @param {string} props.risk.title - Risk title
 * @param {string} [props.risk.description] - Risk description
 * @param {string} [props.risk.impact] - Impact assessment text
 * @param {number} [props.risk.probability] - Probability value between 0 and 1
 * @returns {React.ReactElement}
 */
function RiskSignalCard({ risk }) {
  const style = getRiskLevelStyle(risk.level);

  return (
    <div
      className={classNames(
        'glass-card',
        'p-5',
        'border-l-4',
        'transition-all duration-300 ease-in-out',
        'hover:bg-secondary-500/50',
        style.accent,
        style.glow
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <RiskIcon level={risk.level} className={style.icon} />
          <h3 className="text-sm font-semibold text-slate-100 leading-tight truncate">
            {risk.title}
          </h3>
        </div>
        <div className="flex-shrink-0">
          <RiskBadge level={risk.level} />
        </div>
      </div>

      {/* Description */}
      {risk.description && (
        <p className="text-sm text-slate-300 leading-relaxed mb-3 pl-8">
          {risk.description}
        </p>
      )}

      {/* Impact */}
      {risk.impact && (
        <div className="flex items-start gap-2 mb-3 pl-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex-shrink-0 pt-0.5">
            Impact
          </span>
          <span className="text-sm text-slate-200">
            {risk.impact}
          </span>
        </div>
      )}

      {/* Probability bar */}
      {typeof risk.probability === 'number' && (
        <div className="pl-8">
          <ProbabilityBar
            probability={risk.probability}
            barColor={style.barColor}
          />
        </div>
      )}
    </div>
  );
}

RiskSignalCard.propTypes = {
  risk: PropTypes.shape({
    level: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    impact: PropTypes.string,
    probability: PropTypes.number,
  }).isRequired,
};

/**
 * Summary header showing risk level counts
 * @param {Object} props
 * @param {Array<Object>} props.risks - Array of risk objects
 * @returns {React.ReactElement}
 */
function RiskSummaryHeader({ risks }) {
  const highCount = risks.filter(
    (r) => r.level && r.level.toLowerCase().trim() === RISK_LEVELS.HIGH
  ).length;
  const mediumCount = risks.filter(
    (r) => r.level && r.level.toLowerCase().trim() === RISK_LEVELS.MEDIUM
  ).length;
  const lowCount = risks.filter(
    (r) => r.level && r.level.toLowerCase().trim() === RISK_LEVELS.LOW
  ).length;

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-slate-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium text-slate-300">
          Risk Signals
        </span>
      </div>
      <div className="flex items-center gap-3">
        {highCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-red-400">
            <span className="block w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
            {highCount} High
          </span>
        )}
        {mediumCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-accent-orange">
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-orange" aria-hidden="true" />
            {mediumCount} Medium
          </span>
        )}
        {lowCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-accent-green">
            <span className="block w-1.5 h-1.5 rounded-full bg-accent-green" aria-hidden="true" />
            {lowCount} Low
          </span>
        )}
      </div>
    </div>
  );
}

RiskSummaryHeader.propTypes = {
  risks: PropTypes.arrayOf(
    PropTypes.shape({
      level: PropTypes.string.isRequired,
    })
  ).isRequired,
};

/**
 * Risk signal visualization component showing risk level indicators
 * (high/medium/low) with color-coded badges, risk descriptions, and
 * impact assessments. Uses glassmorphism cards with color accents.
 *
 * @param {Object} props
 * @param {Array<Object>} props.risks - Array of risk objects, each containing:
 *   - {string} level - Risk level ('high', 'medium', 'low')
 *   - {string} title - Risk title
 *   - {string} [description] - Risk description
 *   - {string} [impact] - Impact assessment text
 *   - {number} [probability] - Probability value between 0 and 1
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement|null} The risk signal component or null if no risks
 */
export function RiskSignal({ risks, className }) {
  if (!Array.isArray(risks) || risks.length === 0) {
    return null;
  }

  const validRisks = risks.filter(
    (risk) =>
      risk &&
      typeof risk === 'object' &&
      risk.level &&
      typeof risk.level === 'string' &&
      risk.title &&
      typeof risk.title === 'string'
  );

  if (validRisks.length === 0) {
    return null;
  }

  // Sort risks: high first, then medium, then low
  const levelOrder = { high: 0, medium: 1, low: 2 };
  const sortedRisks = [...validRisks].sort((a, b) => {
    const aOrder = levelOrder[a.level.toLowerCase().trim()] ?? 3;
    const bOrder = levelOrder[b.level.toLowerCase().trim()] ?? 3;
    return aOrder - bOrder;
  });

  return (
    <div
      className={classNames('w-full', className)}
      role="region"
      aria-label="Risk signals"
    >
      <RiskSummaryHeader risks={sortedRisks} />

      <div className="space-y-3">
        {sortedRisks.map((risk, index) => (
          <div
            key={`risk-${index}`}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 80}ms`,
              animationFillMode: 'both',
            }}
          >
            <RiskSignalCard risk={risk} />
          </div>
        ))}
      </div>
    </div>
  );
}

RiskSignal.propTypes = {
  risks: PropTypes.arrayOf(
    PropTypes.shape({
      level: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      impact: PropTypes.string,
      probability: PropTypes.number,
    })
  ).isRequired,
  className: PropTypes.string,
};

export default RiskSignal;