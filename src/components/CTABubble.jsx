import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { CTA_ACTION_TYPES } from '../services/ctaEngine.js';

/**
 * Icon components for CTA action types
 * @param {Object} props
 * @param {string} props.actionType - The CTA action type
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement|null}
 */
function CTAIcon({ actionType, className }) {
  const baseClass = classNames('w-4 h-4 flex-shrink-0', className);

  switch (actionType) {
    case CTA_ACTION_TYPES.DRILL_DOWN:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
      );
    case CTA_ACTION_TYPES.ACTION:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      );
    case CTA_ACTION_TYPES.NAVIGATION:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
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

CTAIcon.propTypes = {
  actionType: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Color class mappings for CTA action types
 * @type {Object<string, Object>}
 */
const ACTION_TYPE_STYLES = {
  [CTA_ACTION_TYPES.DRILL_DOWN]: {
    border: 'border-accent-blue/30',
    hoverBorder: 'hover:border-accent-blue/60',
    text: 'text-accent-blue',
    hoverBg: 'hover:bg-accent-blue/10',
    glow: 'hover:shadow-[0_0_12px_rgba(59,130,246,0.25)]',
  },
  [CTA_ACTION_TYPES.ACTION]: {
    border: 'border-accent-purple/30',
    hoverBorder: 'hover:border-accent-purple/60',
    text: 'text-accent-purple',
    hoverBg: 'hover:bg-accent-purple/10',
    glow: 'hover:shadow-[0_0_12px_rgba(139,92,246,0.25)]',
  },
  [CTA_ACTION_TYPES.NAVIGATION]: {
    border: 'border-accent-cyan/30',
    hoverBorder: 'hover:border-accent-cyan/60',
    text: 'text-accent-cyan',
    hoverBg: 'hover:bg-accent-cyan/10',
    glow: 'hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]',
  },
};

/**
 * Default styles for unknown action types
 * @type {Object}
 */
const DEFAULT_ACTION_STYLE = {
  border: 'border-white/10',
  hoverBorder: 'hover:border-white/20',
  text: 'text-slate-300',
  hoverBg: 'hover:bg-white/5',
  glow: 'hover:shadow-[0_0_12px_rgba(255,255,255,0.1)]',
};

/**
 * Resolves the style object for a given action type
 * @param {string} actionType - The CTA action type
 * @returns {Object} The style object
 */
function getActionTypeStyle(actionType) {
  return ACTION_TYPE_STYLES[actionType] || DEFAULT_ACTION_STYLE;
}

/**
 * Individual CTA bubble button component
 * @param {Object} props
 * @param {Object} props.cta - The CTA object
 * @param {string} props.cta.id - Unique CTA identifier
 * @param {string} props.cta.label - Display label
 * @param {string} [props.cta.queryText] - Query text for the CTA
 * @param {string} [props.cta.actionType] - CTA action type
 * @param {function} props.onClick - Click handler
 * @returns {React.ReactElement}
 */
function CTABubbleItem({ cta, onClick }) {
  const style = getActionTypeStyle(cta.actionType);

  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick(cta);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={classNames(
        'inline-flex items-center gap-2',
        'px-4 py-2.5',
        'rounded-full',
        'border',
        'bg-secondary-500/30',
        'backdrop-blur-sm',
        'text-sm font-medium',
        'cursor-pointer',
        'transition-all duration-300 ease-in-out',
        'hover:translate-y-[-1px]',
        'active:translate-y-0',
        'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
        style.border,
        style.hoverBorder,
        style.hoverBg,
        style.glow
      )}
      aria-label={cta.queryText || cta.label}
    >
      <CTAIcon actionType={cta.actionType} className={style.text} />
      <span className="text-slate-200">{cta.label}</span>
    </button>
  );
}

CTABubbleItem.propTypes = {
  cta: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    queryText: PropTypes.string,
    actionType: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

/**
 * Contextual CTA bubble component rendering follow-up query suggestions.
 * Displays 3-4 rounded, styled bubbles per design system spec.
 * Includes hover animations (200-400ms) and responsive layout.
 *
 * @param {Object} props
 * @param {Array<Object>} props.ctas - Array of CTA objects with id, label, queryText, actionType
 * @param {function} props.onCtaClick - Callback when a CTA bubble is clicked, receives the CTA object
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement|null} The CTA bubbles component or null if no CTAs
 */
export function CTABubble({ ctas, onCtaClick, className }) {
  if (!Array.isArray(ctas) || ctas.length === 0) {
    return null;
  }

  const validCtas = ctas.filter(
    (cta) => cta && typeof cta === 'object' && cta.id && cta.label
  );

  if (validCtas.length === 0) {
    return null;
  }

  return (
    <div
      className={classNames(
        'w-full',
        className
      )}
      role="group"
      aria-label="Follow-up suggestions"
    >
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {validCtas.map((cta, index) => (
          <div
            key={cta.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <CTABubbleItem
              cta={cta}
              onClick={onCtaClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

CTABubble.propTypes = {
  ctas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      queryText: PropTypes.string,
      actionType: PropTypes.string,
    })
  ).isRequired,
  onCtaClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default CTABubble;