import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { DataTable } from './DataTable.jsx';
import { RiskSignal } from './RiskSignal.jsx';
import { ForecastChart } from './ForecastChart.jsx';
import { SourceIndicator } from './SourceIndicator.jsx';
import { CTABubble } from './CTABubble.jsx';
import { getSources } from '../services/sourceTransparencyService.js';
import { getCTAs } from '../services/ctaEngine.js';

/**
 * Output type constants
 * @enum {string}
 */
const OUTPUT_TYPES = {
  TABLE: 'table',
  KPI: 'kpi',
  FORECAST: 'forecast',
  RISK: 'risk',
  ERROR: 'error',
};

/**
 * Resolves the output type from a query result object
 * @param {Object} result - The query result object
 * @returns {string} The resolved output type
 */
function resolveOutputType(result) {
  if (!result || typeof result !== 'object') {
    return OUTPUT_TYPES.ERROR;
  }

  const outputType = result.outputType || result.resultType || null;

  if (!outputType || typeof outputType !== 'string') {
    return OUTPUT_TYPES.KPI;
  }

  const normalized = outputType.toLowerCase().trim();

  switch (normalized) {
    case 'table':
      return OUTPUT_TYPES.TABLE;
    case 'kpi':
      return OUTPUT_TYPES.KPI;
    case 'forecast':
      return OUTPUT_TYPES.FORECAST;
    case 'risk':
      return OUTPUT_TYPES.RISK;
    case 'error':
      return OUTPUT_TYPES.ERROR;
    default:
      return OUTPUT_TYPES.KPI;
  }
}

/**
 * Extracts column definitions from table data for DataTable
 * @param {Array<Object>} data - The table data array
 * @returns {Array<Object>} Column definitions
 */
function extractTableColumns(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  const firstRow = data[0];
  if (!firstRow || typeof firstRow !== 'object') {
    return [];
  }

  return Object.keys(firstRow)
    .filter((key) => key !== 'id')
    .map((key) => {
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      return {
        key,
        label,
        sortable: true,
      };
    });
}

/**
 * Transforms risk-type data into the format expected by RiskSignal
 * @param {Array<Object>} data - The raw data array
 * @returns {Array<Object>} Transformed risk objects
 */
function transformRiskData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map((item) => {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const level = resolveRiskLevel(item);

    return {
      level,
      title: item.risk || item.title || item.name || 'Unknown Risk',
      description: item.description || item.details || null,
      impact: item.impact || null,
      probability: typeof item.probability === 'number' ? item.probability : null,
    };
  }).filter(Boolean);
}

/**
 * Resolves the risk level from a data item
 * @param {Object} item - The data item
 * @returns {string} The risk level ('high', 'medium', 'low')
 */
function resolveRiskLevel(item) {
  if (!item || typeof item !== 'object') {
    return 'medium';
  }

  if (item.level && typeof item.level === 'string') {
    return item.level.toLowerCase().trim();
  }

  if (item.impact && typeof item.impact === 'string') {
    const normalized = item.impact.toLowerCase().trim();
    if (normalized === 'high' || normalized === 'critical') {
      return 'high';
    }
    if (normalized === 'low' || normalized === 'minor') {
      return 'low';
    }
    return 'medium';
  }

  if (typeof item.probability === 'number') {
    if (item.probability >= 0.7) {
      return 'high';
    }
    if (item.probability >= 0.4) {
      return 'medium';
    }
    return 'low';
  }

  return 'medium';
}

/**
 * Determines the chart type for forecast data
 * @param {Array<Object>} data - The forecast data array
 * @returns {'line'|'bar'} The chart type
 */
function resolveForecastChartType(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return 'line';
  }

  const firstItem = data[0];
  if (!firstItem || typeof firstItem !== 'object') {
    return 'line';
  }

  // If data has month/time-series keys, use line chart
  if ('month' in firstItem || 'date' in firstItem || 'period' in firstItem) {
    return 'line';
  }

  return 'bar';
}

/**
 * Error state component for invalid or error results
 * @param {Object} props
 * @param {string} [props.message] - Error message to display
 * @returns {React.ReactElement}
 */
function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <svg
        className="w-12 h-12 text-red-400 mb-4"
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
      <p className="text-sm text-slate-300 font-medium mb-1">Unable to display results</p>
      <p className="text-xs text-slate-500 text-center max-w-sm">
        {message || 'An error occurred while processing your query. Please try again.'}
      </p>
    </div>
  );
}

ErrorState.propTypes = {
  message: PropTypes.string,
};

/**
 * Empty state component when no data is available
 * @returns {React.ReactElement}
 */
function EmptyState() {
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
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-slate-400 font-medium">No data available</p>
      <p className="text-xs text-slate-500 mt-1">Try asking a different question</p>
    </div>
  );
}

/**
 * Result header component showing title and summary
 * @param {Object} props
 * @param {string} [props.title] - Result title
 * @param {string} [props.summary] - Result summary text
 * @param {number} [props.responseTimeMs] - Response time in milliseconds
 * @returns {React.ReactElement|null}
 */
function ResultHeader({ title, summary, responseTimeMs }) {
  if (!title && !summary) {
    return null;
  }

  return (
    <div className="mb-5 animate-fade-in">
      {title && (
        <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-2">
          {title}
        </h2>
      )}
      {summary && (
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {summary}
        </p>
      )}
      {typeof responseTimeMs === 'number' && responseTimeMs > 0 && (
        <p className="text-xs text-slate-500 mt-2 tabular-nums">
          Response time: {responseTimeMs}ms
        </p>
      )}
    </div>
  );
}

ResultHeader.propTypes = {
  title: PropTypes.string,
  summary: PropTypes.string,
  responseTimeMs: PropTypes.number,
};

/**
 * Renders the appropriate visualization component based on output type
 * @param {Object} props
 * @param {string} props.outputType - The resolved output type
 * @param {Array} props.data - The result data array
 * @returns {React.ReactElement}
 */
function VisualizationRenderer({ outputType, data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <EmptyState />;
  }

  switch (outputType) {
    case OUTPUT_TYPES.TABLE: {
      const columns = extractTableColumns(data);
      if (columns.length === 0) {
        return <EmptyState />;
      }
      return (
        <DataTable
          columns={columns}
          data={data}
          sortable
        />
      );
    }

    case OUTPUT_TYPES.KPI: {
      return (
        <ForecastChart
          data={data}
          chartType="kpi"
        />
      );
    }

    case OUTPUT_TYPES.FORECAST: {
      const chartType = resolveForecastChartType(data);
      return (
        <ForecastChart
          data={data}
          chartType={chartType}
        />
      );
    }

    case OUTPUT_TYPES.RISK: {
      const risks = transformRiskData(data);
      if (risks.length === 0) {
        return <EmptyState />;
      }
      return (
        <RiskSignal risks={risks} />
      );
    }

    case OUTPUT_TYPES.ERROR: {
      return <ErrorState />;
    }

    default: {
      return (
        <ForecastChart
          data={data}
          chartType="kpi"
        />
      );
    }
  }
}

VisualizationRenderer.propTypes = {
  outputType: PropTypes.string.isRequired,
  data: PropTypes.array,
};

/**
 * Dynamic structured output renderer that selects the appropriate visualization
 * component (DataTable, RiskSignal, ForecastChart) based on outputType from
 * query results. Includes source transparency indicators and contextual CTA
 * bubble integration.
 *
 * @param {Object} props
 * @param {Object} props.result - The query result object from queryEngine containing:
 *   - {string} outputType - Result type ('table', 'kpi', 'forecast', 'risk', 'error')
 *   - {Array} data - The result data array
 *   - {Array} [sources] - Source indicator objects
 *   - {Array} [sourceIds] - Source system IDs
 *   - {Array} [ctaBubbles] - CTA bubble objects
 *   - {string} [ctaContext] - CTA context key
 *   - {string} [title] - Result title
 *   - {string} [summary] - Result summary text
 *   - {number} [responseTimeMs] - Response time in milliseconds
 *   - {string} [status] - Result status ('success' or 'error')
 *   - {string} [message] - Error message if status is 'error'
 * @param {string} [props.persona] - Current persona identifier for CTA generation
 * @param {function} [props.onCtaClick] - Callback when a CTA bubble is clicked, receives the CTA object
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The structured output component
 */
export function StructuredOutput({ result, persona, onCtaClick, className }) {
  const outputType = useMemo(() => resolveOutputType(result), [result]);

  const isError = useMemo(() => {
    if (!result || typeof result !== 'object') {
      return true;
    }
    return result.status === 'error' || outputType === OUTPUT_TYPES.ERROR;
  }, [result, outputType]);

  const data = useMemo(() => {
    if (!result || typeof result !== 'object') {
      return [];
    }
    return Array.isArray(result.data) ? result.data : [];
  }, [result]);

  const sourceTransparency = useMemo(() => {
    if (!result || typeof result !== 'object') {
      return [];
    }
    try {
      const sources = getSources(result);
      return Array.isArray(sources) ? sources : [];
    } catch (_err) {
      return [];
    }
  }, [result]);

  const ctaBubbles = useMemo(() => {
    if (!result || typeof result !== 'object') {
      return [];
    }

    if (!persona || typeof persona !== 'string') {
      // Fall back to result's ctaBubbles if no persona
      if (Array.isArray(result.ctaBubbles) && result.ctaBubbles.length > 0) {
        return result.ctaBubbles.map((bubble) => ({
          id: bubble.id || `cta-${Math.random().toString(36).slice(2, 10)}`,
          label: bubble.label || bubble.query || '',
          queryText: bubble.query || bubble.queryText || bubble.label || '',
          actionType: bubble.actionType || 'drill_down',
        })).filter((cta) => cta.label);
      }
      return [];
    }

    try {
      const ctas = getCTAs(result, persona);
      return Array.isArray(ctas) ? ctas : [];
    } catch (_err) {
      // Fall back to result's ctaBubbles
      if (Array.isArray(result.ctaBubbles) && result.ctaBubbles.length > 0) {
        return result.ctaBubbles.map((bubble) => ({
          id: bubble.id || `cta-${Math.random().toString(36).slice(2, 10)}`,
          label: bubble.label || bubble.query || '',
          queryText: bubble.query || bubble.queryText || bubble.label || '',
          actionType: bubble.actionType || 'drill_down',
        })).filter((cta) => cta.label);
      }
      return [];
    }
  }, [result, persona]);

  /**
   * Handles CTA bubble click
   * @param {Object} cta - The clicked CTA object
   */
  const handleCtaClick = (cta) => {
    if (typeof onCtaClick === 'function') {
      onCtaClick(cta);
    }
  };

  // Error state
  if (isError) {
    return (
      <div
        className={classNames('w-full', className)}
        role="region"
        aria-label="Query result"
      >
        <div className="glass-card p-6 animate-fade-in">
          <ErrorState
            message={result && result.message ? result.message : undefined}
          />
        </div>
      </div>
    );
  }

  // No result
  if (!result || typeof result !== 'object') {
    return (
      <div
        className={classNames('w-full', className)}
        role="region"
        aria-label="Query result"
      >
        <div className="glass-card p-6 animate-fade-in">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames('w-full space-y-5', className)}
      role="region"
      aria-label={result.title ? `Query result: ${result.title}` : 'Query result'}
    >
      {/* Result Header */}
      <ResultHeader
        title={result.title}
        summary={result.summary}
        responseTimeMs={result.responseTimeMs}
      />

      {/* Main Visualization */}
      <div className="animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
        <VisualizationRenderer
          outputType={outputType}
          data={data}
        />
      </div>

      {/* Source Transparency Indicators */}
      {sourceTransparency.length > 0 && (
        <div
          className="animate-fade-in"
          style={{ animationDelay: '200ms', animationFillMode: 'both' }}
        >
          <SourceIndicator
            sources={sourceTransparency}
            compact={false}
          />
        </div>
      )}

      {/* CTA Bubbles */}
      {ctaBubbles.length > 0 && (
        <div
          className="animate-fade-in"
          style={{ animationDelay: '300ms', animationFillMode: 'both' }}
        >
          <div className="pt-2">
            <p className="text-xs text-slate-500 mb-2 px-1">
              Follow-up suggestions
            </p>
            <CTABubble
              ctas={ctaBubbles}
              onCtaClick={handleCtaClick}
            />
          </div>
        </div>
      )}
    </div>
  );
}

StructuredOutput.propTypes = {
  result: PropTypes.shape({
    id: PropTypes.string,
    outputType: PropTypes.string,
    resultType: PropTypes.string,
    data: PropTypes.array,
    sources: PropTypes.array,
    sourceIds: PropTypes.arrayOf(PropTypes.string),
    ctaBubbles: PropTypes.array,
    ctaContext: PropTypes.string,
    actions: PropTypes.array,
    cluster: PropTypes.string,
    title: PropTypes.string,
    summary: PropTypes.string,
    timestamp: PropTypes.string,
    responseTimeMs: PropTypes.number,
    status: PropTypes.string,
    message: PropTypes.string,
    query: PropTypes.string,
    persona: PropTypes.string,
  }),
  persona: PropTypes.string,
  onCtaClick: PropTypes.func,
  className: PropTypes.string,
};

export default StructuredOutput;