import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigation } from '../contexts/NavigationContext.jsx';
import { SCREEN_IDS, VIEW_STATES, PERSONAS } from '../utils/constants.js';
import { executeQuery, executeFollowUpQuery, getDefaultResult } from '../services/queryEngine.js';
import { executeAction, executeActionFromTemplate, getAvailableActionsById } from '../services/actionExecutor.js';
import { handleCTAClick as ctaHandleCTAClick } from '../services/ctaEngine.js';
import { getDashboardStats, getIntelligenceClustersForPersona } from '../data/mockData.js';
import { QueryInput } from '../components/QueryInput.jsx';
import { StructuredOutput } from '../components/StructuredOutput.jsx';
import { SkeletonLoader } from '../components/SkeletonLoader.jsx';
import { PersonaBar } from '../components/PersonaBar.jsx';
import { GlassCard } from '../components/GlassCard.jsx';
import { IntelligenceClusterCard } from '../components/IntelligenceClusterCard.jsx';
import { ForecastChart } from '../components/ForecastChart.jsx';
import { ActionButton } from '../components/ActionButton.jsx';
import { ActionConfirmation } from '../components/ActionConfirmation.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

/**
 * Dashboard stat icon component
 * @param {Object} props
 * @param {string} props.icon - Icon identifier
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function StatIcon({ icon, className }) {
  const baseClass = classNames('w-5 h-5 flex-shrink-0', className);

  switch (icon) {
    case 'folder':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      );
    case 'alert':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case 'check':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case 'dollar':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
        </svg>
      );
    case 'trending':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      );
    case 'chart':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
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

StatIcon.propTypes = {
  icon: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Dashboard quick stat card component
 * @param {Object} props
 * @param {Object} props.stat - Stat data object
 * @param {string} props.stat.label - Stat label
 * @param {number} props.stat.value - Stat value
 * @param {string} [props.stat.unit] - Stat unit
 * @param {string} [props.stat.icon] - Icon identifier
 * @param {string} [props.stat.color] - Hex color
 * @param {number} props.index - Card index for animation delay
 * @returns {React.ReactElement}
 */
function QuickStatCard({ stat, index }) {
  const formattedValue = useMemo(() => {
    if (stat.unit === 'M') {
      return `$${stat.value}M`;
    }
    if (stat.unit === '%') {
      return `${stat.value}%`;
    }
    return String(stat.value);
  }, [stat.value, stat.unit]);

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
          {stat.label}
        </p>
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
          style={{ backgroundColor: stat.color ? `${stat.color}20` : 'rgba(59,130,246,0.12)' }}
        >
          <StatIcon
            icon={stat.icon}
            className="w-4 h-4"
            style={{ color: stat.color || '#3B82F6' }}
          />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-slate-100 tabular-nums">
        {formattedValue}
      </p>
    </div>
  );
}

QuickStatCard.propTypes = {
  stat: PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    unit: PropTypes.string,
    icon: PropTypes.string,
    color: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * Loading spinner SVG component
 * @returns {React.ReactElement}
 */
function LoadingSpinner() {
  return (
    <svg
      className="w-8 h-8 animate-spin text-accent-blue"
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
 * Loading state component for query processing
 * @param {Object} props
 * @param {string} [props.message] - Loading message
 * @returns {React.ReactElement}
 */
function QueryLoadingState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div
        className={classNames(
          'flex items-center justify-center',
          'w-16 h-16',
          'rounded-full',
          'bg-accent-blue/10',
          'border border-accent-blue/20',
          'mb-5'
        )}
      >
        <LoadingSpinner />
      </div>
      <p className="text-sm text-slate-300 font-medium mb-1">
        {message || 'Processing your query...'}
      </p>
      <p className="text-xs text-slate-500">
        Analyzing data across enterprise systems
      </p>
      <div className="mt-6 w-full max-w-md">
        <SkeletonLoader variant="text" lines={3} />
      </div>
    </div>
  );
}

QueryLoadingState.propTypes = {
  message: PropTypes.string,
};

/**
 * Screen 2: Dashboard overview with query input and quick stats
 * @param {Object} props
 * @param {function} props.onQuerySubmit - Query submit handler
 * @param {boolean} props.isLoading - Whether a query is loading
 * @param {string} props.persona - Current persona identifier
 * @param {string} [props.cluster] - Current cluster
 * @returns {React.ReactElement}
 */
function DashboardScreen({ onQuerySubmit, isLoading, persona, cluster }) {
  const stats = useMemo(() => getDashboardStats(persona), [persona]);
  const clusters = useMemo(() => getIntelligenceClustersForPersona(persona), [persona]);
  const [activeCluster, setActiveCluster] = useState(null);

  const defaultResult = useMemo(() => getDefaultResult(persona), [persona]);

  const handleClusterClick = useCallback((clusterObj) => {
    setActiveCluster((prev) =>
      prev && prev.id === clusterObj.id ? null : clusterObj
    );
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <QuickStatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      )}

      {/* Query Input */}
      <GlassCard variant="elevated" className="!p-5 sm:!p-6">
        <h2 className="text-base sm:text-lg font-semibold text-slate-100 mb-4">
          Ask anything about your projects
        </h2>
        <QueryInput
          onSubmit={onQuerySubmit}
          isLoading={isLoading}
          persona={persona}
          placeholder="e.g., Show me project risks, What is the schedule status?"
        />
      </GlassCard>

      {/* Intelligence Clusters */}
      {clusters.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
            Intelligence Clusters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {clusters.map((clusterObj, index) => (
              <div
                key={clusterObj.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
              >
                <IntelligenceClusterCard
                  cluster={clusterObj}
                  onClick={handleClusterClick}
                  isActive={activeCluster && activeCluster.id === clusterObj.id}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Cluster KPIs */}
      {activeCluster && Array.isArray(activeCluster.kpis) && activeCluster.kpis.length > 0 && (
        <div className="animate-fade-in">
          <ForecastChart
            data={activeCluster.kpis}
            chartType="kpi"
            title={activeCluster.name}
            subtitle={activeCluster.description}
          />
        </div>
      )}

      {/* Default Overview */}
      {!activeCluster && defaultResult && (
        <div className="animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <ForecastChart
            data={defaultResult.data}
            chartType="kpi"
            title="Portfolio Performance Overview"
            subtitle="Key metrics across your active project portfolio"
          />
        </div>
      )}
    </div>
  );
}

DashboardScreen.propTypes = {
  onQuerySubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  persona: PropTypes.string.isRequired,
  cluster: PropTypes.string,
};

/**
 * Screen 3-5: Result display screen with structured output
 * @param {Object} props
 * @param {Object} props.result - Query result object
 * @param {function} props.onCtaClick - CTA click handler
 * @param {function} props.onNewQuery - New query handler
 * @param {function} props.onActionExecute - Action execution handler
 * @param {string} props.persona - Current persona identifier
 * @param {boolean} props.isLoading - Whether a follow-up query is loading
 * @param {Array} [props.availableActions] - Available action templates
 * @returns {React.ReactElement}
 */
function ResultScreen({ result, onCtaClick, onNewQuery, onActionExecute, persona, isLoading, availableActions }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* New Query Input */}
      <GlassCard className="!p-4 sm:!p-5">
        <QueryInput
          onSubmit={onNewQuery}
          isLoading={isLoading}
          persona={persona}
          placeholder="Ask a follow-up question..."
        />
      </GlassCard>

      {/* Structured Output */}
      {result && (
        <StructuredOutput
          result={result}
          persona={persona}
          onCtaClick={onCtaClick}
        />
      )}

      {/* Available Actions */}
      {Array.isArray(availableActions) && availableActions.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
            Available Actions
          </h3>
          <div className="space-y-2">
            {availableActions.map((action) => (
              <ActionButton
                key={action.id}
                actionType={inferActionType(action)}
                system={action.system}
                context={{ templateId: action.id, templateName: action.name }}
                onExecute={(actionType, context) => onActionExecute(action, context)}
                label={action.name}
                confirmationMessage={action.confirmationMessage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

ResultScreen.propTypes = {
  result: PropTypes.object,
  onCtaClick: PropTypes.func.isRequired,
  onNewQuery: PropTypes.func.isRequired,
  onActionExecute: PropTypes.func.isRequired,
  persona: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  availableActions: PropTypes.array,
};

/**
 * Infers action type from a template object
 * @param {Object} template - Action template
 * @returns {string} Action type string
 */
function inferActionType(template) {
  if (!template || !template.name || typeof template.name !== 'string') {
    return 'UPDATE';
  }
  const name = template.name.toLowerCase();
  if (name.includes('approve')) return 'APPROVE';
  if (name.includes('reject')) return 'REJECT';
  if (name.includes('create') || name.includes('schedule')) return 'CREATE';
  if (name.includes('assign')) return 'ASSIGN';
  if (name.includes('escalate')) return 'ESCALATE';
  return 'UPDATE';
}

/**
 * Screen 6: Action execution and confirmation screen
 * @param {Object} props
 * @param {Object} props.action - The action being executed
 * @param {Object} props.result - The current query result context
 * @param {function} props.onConfirm - Confirm handler
 * @param {function} props.onCancel - Cancel handler
 * @param {boolean} props.isVisible - Whether the confirmation dialog is visible
 * @returns {React.ReactElement}
 */
function ActionScreen({ action, result, onConfirm, onCancel, isVisible }) {
  return (
    <ActionConfirmation
      action={action}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isVisible={isVisible}
    />
  );
}

ActionScreen.propTypes = {
  action: PropTypes.object,
  result: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isVisible: PropTypes.bool.isRequired,
};

/**
 * Lukas persona flow screen component (Screens 2-6).
 * Screen 2: Project & Portfolio overview with query input.
 * Screen 3: Project risk analysis results.
 * Screen 4: Portfolio performance forecast.
 * Screen 5: Cross-system project analytics (SAP + Procore).
 * Screen 6: Action execution for project decisions.
 * Each screen supports all view states (query, loading, result, CTA, action, confirmation).
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The Lukas flow screen component
 */
export function LukasFlowScreen({ className }) {
  const { persona, role, cluster, isAuthenticated } = useAuth();
  const { currentScreen, navigateTo, goToDashboard } = useNavigation();

  const [viewState, setViewState] = useState(VIEW_STATES.QUERY_INPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [actionConfirmation, setActionConfirmation] = useState(null);
  const [isActionDialogVisible, setIsActionDialogVisible] = useState(false);

  const currentPersona = persona || PERSONAS.LUKAS.id;
  const currentRole = role || PERSONAS.LUKAS.role;
  const currentCluster = cluster || PERSONAS.LUKAS.cluster;

  /**
   * Available actions for the current result
   */
  const availableActions = useMemo(() => {
    if (!queryResult || !queryResult.actions || !Array.isArray(queryResult.actions)) {
      return [];
    }
    return getAvailableActionsById(currentPersona, queryResult.actions);
  }, [queryResult, currentPersona]);

  /**
   * Handles query submission
   * @param {string} queryText - The query text
   */
  const handleQuerySubmit = useCallback(async (queryText) => {
    if (isLoading) return;

    setIsLoading(true);
    setViewState(VIEW_STATES.LOADING);

    try {
      const result = await executeQuery(queryText, currentPersona);

      setQueryResult(result);
      setQueryHistory((prev) => [
        ...prev,
        { query: queryText, resultId: result.id, timestamp: result.timestamp },
      ]);
      setViewState(VIEW_STATES.RESULT);
    } catch (_err) {
      setQueryResult({
        id: 'error-result',
        status: 'error',
        outputType: 'error',
        message: 'An error occurred while processing your query. Please try again.',
        data: [],
        sources: [],
        ctaBubbles: [],
        timestamp: new Date().toISOString(),
      });
      setViewState(VIEW_STATES.RESULT);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentPersona]);

  /**
   * Handles follow-up query from CTA or new input
   * @param {string} queryText - The query text
   */
  const handleFollowUpQuery = useCallback(async (queryText) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const result = await executeFollowUpQuery(queryText, currentPersona);

      setQueryResult(result);
      setQueryHistory((prev) => [
        ...prev,
        { query: queryText, resultId: result.id, timestamp: result.timestamp, isFollowUp: true },
      ]);
      setViewState(VIEW_STATES.RESULT);
    } catch (_err) {
      setQueryResult({
        id: 'error-result',
        status: 'error',
        outputType: 'error',
        message: 'An error occurred while processing your follow-up query. Please try again.',
        data: [],
        sources: [],
        ctaBubbles: [],
        timestamp: new Date().toISOString(),
      });
      setViewState(VIEW_STATES.RESULT);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentPersona]);

  /**
   * Handles CTA bubble click
   * @param {Object} cta - The CTA object
   */
  const handleCtaClick = useCallback((cta) => {
    if (!cta || typeof cta !== 'object') return;

    const ctaResult = ctaHandleCTAClick(cta, queryResult);

    if (ctaResult.success && ctaResult.queryText) {
      handleFollowUpQuery(ctaResult.queryText);
    }
  }, [queryResult, handleFollowUpQuery]);

  /**
   * Handles action execution from ActionButton
   * @param {Object} action - The action template
   * @param {Object} context - The action context
   * @returns {Promise<Object>} The action result
   */
  const handleActionExecute = useCallback(async (action, context) => {
    setActionConfirmation({
      name: action.name,
      description: action.description,
      confirmationMessage: action.confirmationMessage,
      system: action.system,
      systemLabel: action.systemLabel,
      fields: action.fields,
      actionType: inferActionType(action),
      templateId: action.id,
    });
    setIsActionDialogVisible(true);

    return { success: true, details: { message: 'Confirmation dialog opened.' } };
  }, []);

  /**
   * Handles action confirmation from ActionConfirmation dialog
   * @param {Object} action - The action object
   * @returns {Promise<Object>} The execution result
   */
  const handleActionConfirm = useCallback(async (action) => {
    if (!action) {
      return { success: false, message: 'No action to confirm.' };
    }

    try {
      const templateId = action.templateId || null;
      let result;

      if (templateId) {
        result = await executeActionFromTemplate(templateId, {}, currentPersona);
      } else {
        const actionType = action.actionType || 'UPDATE';
        result = await executeAction(actionType, { templateName: action.name }, currentPersona);
      }

      if (result.success) {
        setViewState(VIEW_STATES.CONFIRMATION);
      }

      return result;
    } catch (_err) {
      return {
        success: false,
        message: 'Action execution failed. Please try again.',
      };
    }
  }, [currentPersona]);

  /**
   * Handles action cancellation
   */
  const handleActionCancel = useCallback(() => {
    setIsActionDialogVisible(false);
    setActionConfirmation(null);
  }, []);

  /**
   * Handles returning to dashboard/query input
   */
  const handleBackToDashboard = useCallback(() => {
    setViewState(VIEW_STATES.QUERY_INPUT);
    setQueryResult(null);
    setActionConfirmation(null);
    setIsActionDialogVisible(false);
  }, []);

  /**
   * Renders the current view based on viewState
   * @returns {React.ReactElement}
   */
  const renderCurrentView = () => {
    switch (viewState) {
      case VIEW_STATES.QUERY_INPUT:
        return (
          <DashboardScreen
            onQuerySubmit={handleQuerySubmit}
            isLoading={isLoading}
            persona={currentPersona}
            cluster={currentCluster}
          />
        );

      case VIEW_STATES.LOADING:
        return <QueryLoadingState message="Analyzing your project data..." />;

      case VIEW_STATES.RESULT:
        return (
          <ResultScreen
            result={queryResult}
            onCtaClick={handleCtaClick}
            onNewQuery={handleFollowUpQuery}
            onActionExecute={handleActionExecute}
            persona={currentPersona}
            isLoading={isLoading}
            availableActions={availableActions}
          />
        );

      case VIEW_STATES.CTA_INTERACTION:
        return (
          <ResultScreen
            result={queryResult}
            onCtaClick={handleCtaClick}
            onNewQuery={handleFollowUpQuery}
            onActionExecute={handleActionExecute}
            persona={currentPersona}
            isLoading={isLoading}
            availableActions={availableActions}
          />
        );

      case VIEW_STATES.ACTION_EXECUTION:
        return (
          <ResultScreen
            result={queryResult}
            onCtaClick={handleCtaClick}
            onNewQuery={handleFollowUpQuery}
            onActionExecute={handleActionExecute}
            persona={currentPersona}
            isLoading={isLoading}
            availableActions={availableActions}
          />
        );

      case VIEW_STATES.CONFIRMATION:
        return (
          <div className="space-y-6 animate-fade-in">
            <GlassCard variant="elevated" className="!p-6 sm:!p-8">
              <div className="flex flex-col items-center text-center">
                <div
                  className={classNames(
                    'flex items-center justify-center',
                    'w-16 h-16',
                    'rounded-full',
                    'bg-accent-green/10',
                    'border border-accent-green/20',
                    'mb-5'
                  )}
                >
                  <svg
                    className="w-10 h-10 text-accent-green"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-100 mb-2">
                  Action Completed Successfully
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-md">
                  Your action has been executed and logged. You can continue querying or return to the dashboard.
                </p>

                <div className="flex items-center gap-3 w-full max-w-sm">
                  <button
                    type="button"
                    onClick={handleBackToDashboard}
                    className={classNames(
                      'flex-1 flex items-center justify-center gap-2',
                      'px-4 py-3',
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
                    Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewState(VIEW_STATES.RESULT)}
                    className={classNames(
                      'flex-1 flex items-center justify-center gap-2',
                      'px-4 py-3',
                      'rounded-xl',
                      'text-sm font-semibold',
                      'text-white',
                      'bg-gradient-accent',
                      'transition-all duration-300 ease-in-out',
                      'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
                      'hover:translate-y-[-1px]',
                      'active:translate-y-0',
                      'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0'
                    )}
                    aria-label="Continue querying"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        );

      default:
        return (
          <DashboardScreen
            onQuerySubmit={handleQuerySubmit}
            isLoading={isLoading}
            persona={currentPersona}
            cluster={currentCluster}
          />
        );
    }
  };

  // If not authenticated or not Lukas persona, show nothing
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
        {viewState !== VIEW_STATES.QUERY_INPUT && (
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
        )}

        {/* Main Content */}
        <div className="py-4 sm:py-6">
          {renderCurrentView()}
        </div>

        {/* Action Confirmation Dialog */}
        {actionConfirmation && (
          <ActionScreen
            action={actionConfirmation}
            result={queryResult}
            onConfirm={handleActionConfirm}
            onCancel={handleActionCancel}
            isVisible={isActionDialogVisible}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

LukasFlowScreen.propTypes = {
  className: PropTypes.string,
};

export default LukasFlowScreen;