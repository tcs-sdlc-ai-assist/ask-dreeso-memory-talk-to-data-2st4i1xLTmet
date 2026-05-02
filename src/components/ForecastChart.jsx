import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';

/**
 * Default chart dimensions and configuration
 * @type {Object}
 */
const CHART_CONFIG = {
  BAR_GAP: 4,
  BAR_MIN_HEIGHT: 4,
  SVG_VIEWBOX_WIDTH: 600,
  SVG_VIEWBOX_HEIGHT: 300,
  PADDING_TOP: 20,
  PADDING_BOTTOM: 40,
  PADDING_LEFT: 50,
  PADDING_RIGHT: 20,
  GRID_LINES: 5,
  LINE_POINT_RADIUS: 4,
  LINE_POINT_RADIUS_HOVER: 6,
};

/**
 * Color palette for chart elements
 * @type {Array<string>}
 */
const CHART_COLORS = [
  '#3B82F6', // accent-blue
  '#8B5CF6', // accent-purple
  '#06B6D4', // accent-cyan
  '#10B981', // accent-green
  '#F59E0B', // accent-orange
  '#EC4899', // accent-pink
];

/**
 * Trend icon component for KPI cards
 * @param {Object} props
 * @param {string} props.trend - Trend direction ('up', 'down', 'stable')
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function TrendIcon({ trend, className }) {
  const baseClass = classNames('w-4 h-4 flex-shrink-0', className);

  if (trend === 'up') {
    return (
      <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
    );
  }

  if (trend === 'down') {
    return (
      <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
      </svg>
    );
  }

  // stable
  return (
    <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4 10a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}

TrendIcon.propTypes = {
  trend: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Resolves the trend color class
 * @param {string} trend - Trend direction
 * @returns {string} Tailwind text color class
 */
function getTrendColor(trend) {
  if (trend === 'up') return 'text-accent-green';
  if (trend === 'down') return 'text-red-400';
  return 'text-slate-400';
}

/**
 * Resolves the trend background class
 * @param {string} trend - Trend direction
 * @returns {string} Tailwind background class
 */
function getTrendBgColor(trend) {
  if (trend === 'up') return 'bg-accent-green/10';
  if (trend === 'down') return 'bg-red-500/10';
  return 'bg-slate-500/10';
}

/**
 * Formats a numeric value for display
 * @param {number} value - The numeric value
 * @param {string} [unit] - The unit string
 * @returns {string} Formatted value string
 */
function formatValue(value, unit) {
  if (value === null || value === undefined || typeof value !== 'number') {
    return '—';
  }

  let formatted;
  if (Number.isInteger(value)) {
    formatted = value.toLocaleString('en-US');
  } else {
    formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  if (unit) {
    if (unit === '%' || unit === '/5') {
      return `${formatted}${unit}`;
    }
    if (unit === 'M') {
      return `$${formatted}${unit}`;
    }
    if (unit === 'days' || unit === 'M/mo') {
      return `${formatted} ${unit}`;
    }
    return `${formatted}${unit}`;
  }

  return formatted;
}

/**
 * Formats a change value for display
 * @param {number} change - The change value
 * @returns {string} Formatted change string
 */
function formatChange(change) {
  if (change === null || change === undefined || typeof change !== 'number') {
    return '';
  }

  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * Calculates the min and max values from a data array
 * @param {Array<Object>} data - The data array
 * @param {Array<string>} keys - The keys to consider for min/max
 * @returns {{ min: number, max: number }} The min and max values
 */
function calculateMinMax(data, keys) {
  let min = Infinity;
  let max = -Infinity;

  for (const item of data) {
    for (const key of keys) {
      const val = item[key];
      if (typeof val === 'number' && !isNaN(val)) {
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }
  }

  if (min === Infinity) min = 0;
  if (max === -Infinity) max = 100;

  // Add some padding
  const range = max - min;
  if (range === 0) {
    min = min - 1;
    max = max + 1;
  } else {
    min = Math.floor(min - range * 0.1);
    max = Math.ceil(max + range * 0.1);
  }

  if (min > 0 && min < max * 0.3) {
    min = 0;
  }

  return { min, max };
}

/**
 * Generates grid line values
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} count - Number of grid lines
 * @returns {Array<number>} Array of grid line values
 */
function generateGridLines(min, max, count) {
  const lines = [];
  const step = (max - min) / (count - 1);
  for (let i = 0; i < count; i++) {
    lines.push(min + step * i);
  }
  return lines;
}

/**
 * Extracts numeric data keys from a data item (excluding label/string fields)
 * @param {Object} item - A data item
 * @returns {Array<string>} Array of numeric keys
 */
function getNumericKeys(item) {
  if (!item || typeof item !== 'object') return [];
  return Object.keys(item).filter((key) => {
    if (key === 'id' || key === 'label' || key === 'month' || key === 'unit' || key === 'trend' || key === 'change') {
      return false;
    }
    return typeof item[key] === 'number';
  });
}

/**
 * Gets the label key from a data item
 * @param {Object} item - A data item
 * @returns {string|null} The label key
 */
function getLabelKey(item) {
  if (!item || typeof item !== 'object') return null;
  if ('month' in item) return 'month';
  if ('label' in item) return 'label';
  if ('project' in item) return 'project';
  if ('name' in item) return 'name';
  return null;
}

/**
 * Formats a short label for axis display
 * @param {string} label - The full label
 * @param {number} [maxLen=8] - Maximum length
 * @returns {string} Shortened label
 */
function shortenLabel(label, maxLen = 8) {
  if (!label || typeof label !== 'string') return '';
  if (label.length <= maxLen) return label;
  return label.slice(0, maxLen - 1) + '…';
}

/**
 * SVG Bar Chart component
 * @param {Object} props
 * @param {Array<Object>} props.data - Chart data array
 * @returns {React.ReactElement}
 */
function BarChart({ data }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null;

    const labelKey = getLabelKey(data[0]);
    const numericKeys = getNumericKeys(data[0]);

    if (numericKeys.length === 0) return null;

    const { min, max } = calculateMinMax(data, numericKeys);
    const gridLines = generateGridLines(min, max, CHART_CONFIG.GRID_LINES);

    return { labelKey, numericKeys, min, max, gridLines };
  }, [data]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-500">
        No chart data available
      </div>
    );
  }

  const { labelKey, numericKeys, min, max, gridLines } = chartData;
  const { SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, PADDING_TOP, PADDING_BOTTOM, PADDING_LEFT, PADDING_RIGHT } = CHART_CONFIG;

  const chartWidth = SVG_VIEWBOX_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = SVG_VIEWBOX_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const range = max - min;

  const groupWidth = chartWidth / data.length;
  const barWidth = Math.max(
    4,
    (groupWidth - CHART_CONFIG.BAR_GAP * (numericKeys.length + 1)) / numericKeys.length
  );

  /**
   * Maps a value to a Y coordinate
   * @param {number} value
   * @returns {number}
   */
  const valueToY = (value) => {
    if (range === 0) return PADDING_TOP + chartHeight / 2;
    return PADDING_TOP + chartHeight - ((value - min) / range) * chartHeight;
  };

  return (
    <svg
      viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
      className="w-full h-auto"
      role="img"
      aria-label="Bar chart"
    >
      {/* Grid lines */}
      {gridLines.map((value, index) => {
        const y = valueToY(value);
        return (
          <g key={`grid-${index}`}>
            <line
              x1={PADDING_LEFT}
              y1={y}
              x2={SVG_VIEWBOX_WIDTH - PADDING_RIGHT}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <text
              x={PADDING_LEFT - 8}
              y={y + 4}
              textAnchor="end"
              fill="rgba(148,163,184,0.7)"
              fontSize="10"
              fontFamily="Urbanist, sans-serif"
            >
              {Number.isInteger(value) ? value : value.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((item, dataIndex) => {
        const groupX = PADDING_LEFT + dataIndex * groupWidth;
        const label = labelKey ? item[labelKey] : `${dataIndex + 1}`;

        return (
          <g key={`bar-group-${dataIndex}`}>
            {numericKeys.map((key, keyIndex) => {
              const value = item[key];
              if (typeof value !== 'number' || isNaN(value)) return null;

              const barX = groupX + CHART_CONFIG.BAR_GAP + keyIndex * (barWidth + CHART_CONFIG.BAR_GAP);
              const barY = valueToY(value);
              const barHeight = Math.max(CHART_CONFIG.BAR_MIN_HEIGHT, valueToY(min) - barY);
              const color = CHART_COLORS[keyIndex % CHART_COLORS.length];

              return (
                <g key={`bar-${dataIndex}-${keyIndex}`}>
                  <rect
                    x={barX}
                    y={barY}
                    width={barWidth}
                    height={barHeight}
                    rx="3"
                    ry="3"
                    fill={color}
                    opacity="0.85"
                    className="transition-opacity duration-300 hover:opacity-100"
                  >
                    <title>{`${key}: ${value}`}</title>
                  </rect>
                </g>
              );
            })}

            {/* X-axis label */}
            <text
              x={groupX + groupWidth / 2}
              y={SVG_VIEWBOX_HEIGHT - 8}
              textAnchor="middle"
              fill="rgba(148,163,184,0.7)"
              fontSize="9"
              fontFamily="Urbanist, sans-serif"
            >
              {shortenLabel(String(label), 10)}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      {numericKeys.length > 1 && numericKeys.map((key, index) => {
        const legendX = PADDING_LEFT + index * 100;
        const color = CHART_COLORS[index % CHART_COLORS.length];
        return (
          <g key={`legend-${index}`}>
            <rect
              x={legendX}
              y={4}
              width={10}
              height={10}
              rx="2"
              fill={color}
              opacity="0.85"
            />
            <text
              x={legendX + 14}
              y={13}
              fill="rgba(148,163,184,0.8)"
              fontSize="9"
              fontFamily="Urbanist, sans-serif"
            >
              {key}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

BarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * SVG Line Chart component
 * @param {Object} props
 * @param {Array<Object>} props.data - Chart data array
 * @returns {React.ReactElement}
 */
function LineChart({ data }) {
  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return null;

    const labelKey = getLabelKey(data[0]);
    const numericKeys = getNumericKeys(data[0]);

    if (numericKeys.length === 0) return null;

    const { min, max } = calculateMinMax(data, numericKeys);
    const gridLines = generateGridLines(min, max, CHART_CONFIG.GRID_LINES);

    return { labelKey, numericKeys, min, max, gridLines };
  }, [data]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-500">
        No chart data available
      </div>
    );
  }

  const { labelKey, numericKeys, min, max, gridLines } = chartData;
  const { SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT, PADDING_TOP, PADDING_BOTTOM, PADDING_LEFT, PADDING_RIGHT } = CHART_CONFIG;

  const chartWidth = SVG_VIEWBOX_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = SVG_VIEWBOX_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const range = max - min;

  const valueToY = (value) => {
    if (range === 0) return PADDING_TOP + chartHeight / 2;
    return PADDING_TOP + chartHeight - ((value - min) / range) * chartHeight;
  };

  const valueToX = (index) => {
    if (data.length <= 1) return PADDING_LEFT + chartWidth / 2;
    return PADDING_LEFT + (index / (data.length - 1)) * chartWidth;
  };

  return (
    <svg
      viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
      className="w-full h-auto"
      role="img"
      aria-label="Line chart"
    >
      {/* Grid lines */}
      {gridLines.map((value, index) => {
        const y = valueToY(value);
        return (
          <g key={`grid-${index}`}>
            <line
              x1={PADDING_LEFT}
              y1={y}
              x2={SVG_VIEWBOX_WIDTH - PADDING_RIGHT}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <text
              x={PADDING_LEFT - 8}
              y={y + 4}
              textAnchor="end"
              fill="rgba(148,163,184,0.7)"
              fontSize="10"
              fontFamily="Urbanist, sans-serif"
            >
              {Number.isInteger(value) ? value : value.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* Lines and points for each numeric key */}
      {numericKeys.map((key, keyIndex) => {
        const color = CHART_COLORS[keyIndex % CHART_COLORS.length];
        const points = data
          .map((item, dataIndex) => {
            const value = item[key];
            if (typeof value !== 'number' || isNaN(value)) return null;
            return {
              x: valueToX(dataIndex),
              y: valueToY(value),
              value,
              label: labelKey ? item[labelKey] : `${dataIndex + 1}`,
            };
          })
          .filter(Boolean);

        if (points.length === 0) return null;

        // Build path
        const pathD = points
          .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
          .join(' ');

        // Build gradient area path
        const areaD = points.length > 1
          ? `${pathD} L ${points[points.length - 1].x} ${PADDING_TOP + chartHeight} L ${points[0].x} ${PADDING_TOP + chartHeight} Z`
          : '';

        const gradientId = `line-gradient-${keyIndex}`;

        return (
          <g key={`line-${keyIndex}`}>
            {/* Area fill gradient */}
            {areaD && (
              <>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path
                  d={areaD}
                  fill={`url(#${gradientId})`}
                />
              </>
            )}

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />

            {/* Points */}
            {points.map((point, pointIndex) => (
              <g key={`point-${keyIndex}-${pointIndex}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={CHART_CONFIG.LINE_POINT_RADIUS}
                  fill={color}
                  stroke="rgba(10,26,47,0.8)"
                  strokeWidth="2"
                  className="transition-all duration-200"
                >
                  <title>{`${key}: ${point.value}`}</title>
                </circle>
                {/* Invisible larger hit area */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={CHART_CONFIG.LINE_POINT_RADIUS_HOVER * 2}
                  fill="transparent"
                  className="cursor-pointer"
                >
                  <title>{`${point.label} — ${key}: ${point.value}`}</title>
                </circle>
              </g>
            ))}
          </g>
        );
      })}

      {/* X-axis labels */}
      {data.map((item, index) => {
        const x = valueToX(index);
        const label = labelKey ? item[labelKey] : `${index + 1}`;
        return (
          <text
            key={`x-label-${index}`}
            x={x}
            y={SVG_VIEWBOX_HEIGHT - 8}
            textAnchor="middle"
            fill="rgba(148,163,184,0.7)"
            fontSize="9"
            fontFamily="Urbanist, sans-serif"
          >
            {shortenLabel(String(label), 10)}
          </text>
        );
      })}

      {/* Legend */}
      {numericKeys.length > 1 && numericKeys.map((key, index) => {
        const legendX = PADDING_LEFT + index * 100;
        const color = CHART_COLORS[index % CHART_COLORS.length];
        return (
          <g key={`legend-${index}`}>
            <line
              x1={legendX}
              y1={9}
              x2={legendX + 12}
              y2={9}
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx={legendX + 6} cy={9} r={3} fill={color} />
            <text
              x={legendX + 18}
              y={13}
              fill="rgba(148,163,184,0.8)"
              fontSize="9"
              fontFamily="Urbanist, sans-serif"
            >
              {key}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

/**
 * Individual KPI card component
 * @param {Object} props
 * @param {Object} props.kpi - KPI data object
 * @param {string} props.kpi.label - KPI label
 * @param {number} props.kpi.value - KPI value
 * @param {string} [props.kpi.unit] - KPI unit
 * @param {string} [props.kpi.trend] - Trend direction ('up', 'down', 'stable')
 * @param {number} [props.kpi.change] - Change percentage
 * @param {number} props.index - Card index for animation delay
 * @returns {React.ReactElement}
 */
function KPICard({ kpi, index }) {
  const trendColor = getTrendColor(kpi.trend);
  const trendBg = getTrendBgColor(kpi.trend);

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
      {/* Label */}
      <p className="text-xs sm:text-sm font-medium text-slate-400 mb-2 truncate">
        {kpi.label}
      </p>

      {/* Value */}
      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 tabular-nums mb-2">
        {formatValue(kpi.value, kpi.unit)}
      </p>

      {/* Trend */}
      {(kpi.trend || typeof kpi.change === 'number') && (
        <div className="flex items-center gap-1.5">
          {kpi.trend && (
            <div
              className={classNames(
                'inline-flex items-center gap-1',
                'px-1.5 py-0.5',
                'rounded-full',
                'text-xs font-medium',
                trendColor,
                trendBg
              )}
            >
              <TrendIcon trend={kpi.trend} className="w-3 h-3" />
              {typeof kpi.change === 'number' && (
                <span className="tabular-nums">{formatChange(kpi.change)}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

KPICard.propTypes = {
  kpi: PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    unit: PropTypes.string,
    trend: PropTypes.string,
    change: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * KPI grid component rendering multiple KPI cards
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of KPI data objects
 * @returns {React.ReactElement}
 */
function KPIGrid({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-slate-500">
        No KPI data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {data.map((kpi, index) => (
        <KPICard
          key={kpi.label || `kpi-${index}`}
          kpi={kpi}
          index={index}
        />
      ))}
    </div>
  );
}

KPIGrid.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      unit: PropTypes.string,
      trend: PropTypes.string,
      change: PropTypes.number,
    })
  ).isRequired,
};

/**
 * Empty state component for charts
 * @returns {React.ReactElement}
 */
function ChartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <svg
        className="w-12 h-12 text-slate-500 mb-4"
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
      <p className="text-sm text-slate-400 font-medium">No data to visualize</p>
      <p className="text-xs text-slate-500 mt-1">Try running a query to see results</p>
    </div>
  );
}

/**
 * Forecast and KPI visualization component rendering bar charts, trend lines,
 * and KPI cards using pure CSS/SVG (no external chart libraries).
 * Responsive across all breakpoints with glassmorphism styling.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - Array of data objects to visualize
 * @param {'bar'|'line'|'kpi'} [props.chartType='kpi'] - The type of chart to render
 * @param {string} [props.title] - Chart title
 * @param {string} [props.subtitle] - Chart subtitle/description
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The forecast chart component
 */
export function ForecastChart({ data, chartType = 'kpi', title, subtitle, className }) {
  const hasData = Array.isArray(data) && data.length > 0;

  const renderChart = () => {
    if (!hasData) {
      return <ChartEmptyState />;
    }

    switch (chartType) {
      case 'bar':
        return <BarChart data={data} />;
      case 'line':
        return <LineChart data={data} />;
      case 'kpi':
      default:
        return <KPIGrid data={data} />;
    }
  };

  const isGraphChart = chartType === 'bar' || chartType === 'line';

  return (
    <div
      className={classNames('w-full', className)}
      role="region"
      aria-label={title || 'Data visualization'}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base sm:text-lg font-semibold text-slate-100">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Chart content */}
      {isGraphChart && hasData ? (
        <div
          className={classNames(
            'glass-card p-4 sm:p-5',
            'border border-white/5',
            'overflow-hidden'
          )}
        >
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="min-w-[400px]">
              {renderChart()}
            </div>
          </div>
        </div>
      ) : (
        renderChart()
      )}
    </div>
  );
}

ForecastChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  chartType: PropTypes.oneOf(['bar', 'line', 'kpi']),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
};

export default ForecastChart;