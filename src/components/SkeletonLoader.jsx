import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';

/**
 * Skeleton line element with shimmer animation
 * @param {Object} props
 * @param {string} [props.width] - Width class or inline width
 * @param {string} [props.height] - Height class
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function SkeletonLine({ width, height, className }) {
  return (
    <div
      className={classNames(
        'skeleton animate-pulse rounded',
        height || 'h-3.5',
        width || 'w-full',
        className
      )}
    />
  );
}

SkeletonLine.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Text variant skeleton - renders multiple lines of text placeholders
 * @param {Object} props
 * @param {number} props.lines - Number of text lines to render
 * @param {string} [props.width] - Width override for lines
 * @returns {React.ReactElement}
 */
function SkeletonText({ lines, width }) {
  const lineWidths = [];
  for (let i = 0; i < lines; i++) {
    if (i === 0) {
      lineWidths.push(width || 'w-3/4');
    } else if (i === lines - 1) {
      lineWidths.push('w-1/2');
    } else {
      lineWidths.push(width || 'w-full');
    }
  }

  return (
    <div className="space-y-3">
      {lineWidths.map((w, index) => (
        <SkeletonLine key={index} width={w} height="skeleton-text" />
      ))}
    </div>
  );
}

SkeletonText.propTypes = {
  lines: PropTypes.number.isRequired,
  width: PropTypes.string,
};

/**
 * Card variant skeleton - renders a glassmorphism card placeholder
 * @param {Object} props
 * @param {string} [props.width] - Width override
 * @param {string} [props.height] - Height override
 * @returns {React.ReactElement}
 */
function SkeletonCard({ width, height }) {
  return (
    <div
      className={classNames(
        'glass-card animate-pulse p-6',
        width || 'w-full',
        height || 'h-40'
      )}
    >
      <div className="flex flex-col space-y-4 h-full">
        <SkeletonLine width="w-2/5" height="skeleton-title" />
        <div className="space-y-2 flex-1">
          <SkeletonLine width="w-full" height="skeleton-text" />
          <SkeletonLine width="w-4/5" height="skeleton-text" />
          <SkeletonLine width="w-3/5" height="skeleton-text" />
        </div>
        <div className="flex items-center space-x-3">
          <SkeletonLine width="w-10 h-10" height="skeleton-avatar" className="rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="w-1/3" height="skeleton-text" />
            <SkeletonLine width="w-1/4" height="h-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

SkeletonCard.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
};

/**
 * Table variant skeleton - renders a table placeholder with header and rows
 * @param {Object} props
 * @param {number} props.lines - Number of table rows to render
 * @param {string} [props.width] - Width override
 * @returns {React.ReactElement}
 */
function SkeletonTable({ lines, width }) {
  const columns = 4;
  const rows = lines > 0 ? lines : 4;

  return (
    <div className={classNames('glass-card animate-pulse p-5', width || 'w-full')}>
      {/* Table header */}
      <div className="flex items-center space-x-4 pb-4 mb-4 border-b border-white/5">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLine
            key={`header-${colIndex}`}
            width={colIndex === 0 ? 'w-1/4' : 'w-1/5'}
            height="h-4"
          />
        ))}
      </div>
      {/* Table rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex items-center space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonLine
                key={`cell-${rowIndex}-${colIndex}`}
                width={colIndex === 0 ? 'w-1/4' : 'w-1/5'}
                height="skeleton-text"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

SkeletonTable.propTypes = {
  lines: PropTypes.number.isRequired,
  width: PropTypes.string,
};

/**
 * Chart variant skeleton - renders a chart area placeholder
 * @param {Object} props
 * @param {string} [props.width] - Width override
 * @param {string} [props.height] - Height override
 * @returns {React.ReactElement}
 */
function SkeletonChart({ width, height }) {
  return (
    <div
      className={classNames(
        'glass-card animate-pulse p-5',
        width || 'w-full',
        height || 'h-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Chart title */}
        <SkeletonLine width="w-1/3" height="skeleton-title" className="mb-4" />
        {/* Chart area */}
        <div className="flex-1 flex items-end space-x-2 pb-4">
          {Array.from({ length: 7 }).map((_, index) => {
            const barHeights = ['h-1/3', 'h-2/3', 'h-1/2', 'h-4/5', 'h-3/5', 'h-full', 'h-2/5'];
            return (
              <div
                key={`bar-${index}`}
                className={classNames(
                  'skeleton rounded-t flex-1',
                  barHeights[index % barHeights.length]
                )}
              />
            );
          })}
        </div>
        {/* Chart x-axis labels */}
        <div className="flex items-center space-x-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonLine
              key={`label-${index}`}
              width="flex-1"
              height="h-2"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

SkeletonChart.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
};

/**
 * Reusable skeleton loader component with animated pulse effect.
 * Supports variants: text, card, table, chart.
 * Uses Tailwind animate-pulse with glassmorphism styling matching design system.
 *
 * @param {Object} props
 * @param {'text'|'card'|'table'|'chart'} [props.variant='text'] - Skeleton variant type
 * @param {number} [props.lines=3] - Number of lines/rows (used by text and table variants)
 * @param {string} [props.width] - Width override (Tailwind class)
 * @param {string} [props.height] - Height override (Tailwind class)
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The skeleton loader component
 */
export function SkeletonLoader({ variant = 'text', lines = 3, width, height, className }) {
  const renderVariant = () => {
    switch (variant) {
      case 'card':
        return <SkeletonCard width={width} height={height} />;
      case 'table':
        return <SkeletonTable lines={lines} width={width} />;
      case 'chart':
        return <SkeletonChart width={width} height={height} />;
      case 'text':
      default:
        return <SkeletonText lines={lines} width={width} />;
    }
  };

  return (
    <div
      className={classNames('w-full', className)}
      role="status"
      aria-label="Loading"
      aria-busy="true"
    >
      {renderVariant()}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

SkeletonLoader.propTypes = {
  variant: PropTypes.oneOf(['text', 'card', 'table', 'chart']),
  lines: PropTypes.number,
  width: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.string,
};

export default SkeletonLoader;