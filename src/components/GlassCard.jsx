import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';

/**
 * Variant class mappings for the GlassCard component
 * @type {Object<string, string>}
 */
const VARIANT_CLASSES = {
  default: 'glass-card',
  elevated: 'glass-card-lg',
  interactive: 'glass-card glass-card-hover',
};

/**
 * Glassmorphism card component implementing the design system's response card style.
 * Features backdrop-blur, semi-transparent background, subtle border, rounded corners, and shadow.
 * Supports three variants: default, elevated, and interactive.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional class names to apply
 * @param {function} [props.onClick] - Click handler for the card
 * @param {'default'|'elevated'|'interactive'} [props.variant='default'] - Card style variant
 * @returns {React.ReactElement} The glassmorphism card component
 */
export function GlassCard({ children, className, onClick, variant = 'default' }) {
  const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.default;

  const isClickable = typeof onClick === 'function';

  const combinedClassName = classNames(
    variantClass,
    'p-6',
    {
      'cursor-pointer': isClickable,
      'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0': isClickable,
    },
    className
  );

  const handleKeyDown = isClickable
    ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(event);
        }
      }
    : undefined;

  return (
    <div
      className={combinedClassName}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {children}
    </div>
  );
}

GlassCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'elevated', 'interactive']),
};

export default GlassCard;