import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { EXECUTION_ACTION_TYPES } from '../services/actionExecutor.js';
import { SYSTEM_SOURCES } from '../utils/constants.js';

/**
 * Execution state constants
 * @enum {string}
 */
const EXECUTION_STATES = {
  IDLE: 'idle',
  CONFIRMING: 'confirming',
  EXECUTING: 'executing',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Auto-dismiss delay for success/error states in milliseconds
 * @type {number}
 */
const STATE_DISMISS_DELAY = 3000;

/**
 * Action type display labels
 * @type {Object<string, Object>}
 */
const ACTION_TYPE_CONFIG = {
  [EXECUTION_ACTION_TYPES.APPROVE]: {
    label: 'Approve',
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/15',
    borderColor: 'border-accent-green/30',
    hoverBorderColor: 'hover:border-accent-green/60',
    hoverBgColor: 'hover:bg-accent-green/20',
    glow: 'hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]',
    activeGlow: 'shadow-[0_0_16px_rgba(16,185,129,0.35)]',
  },
  [EXECUTION_ACTION_TYPES.REJECT]: {
    label: 'Reject',
    color: 'text-red-400',
    bgColor: 'bg-red-500/15',
    borderColor: 'border-red-500/30',
    hoverBorderColor: 'hover:border-red-500/60',
    hoverBgColor: 'hover:bg-red-500/20',
    glow: 'hover:shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    activeGlow: 'shadow-[0_0_16px_rgba(239,68,68,0.35)]',
  },
  [EXECUTION_ACTION_TYPES.ESCALATE]: {
    label: 'Escalate',
    color: 'text-accent-orange',
    bgColor: 'bg-accent-orange/15',
    borderColor: 'border-accent-orange/30',
    hoverBorderColor: 'hover:border-accent-orange/60',
    hoverBgColor: 'hover:bg-accent-orange/20',
    glow: 'hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    activeGlow: 'shadow-[0_0_16px_rgba(245,158,11,0.35)]',
  },
  [EXECUTION_ACTION_TYPES.ASSIGN]: {
    label: 'Assign',
    color: 'text-accent-cyan',
    bgColor: 'bg-accent-cyan/15',
    borderColor: 'border-accent-cyan/30',
    hoverBorderColor: 'hover:border-accent-cyan/60',
    hoverBgColor: 'hover:bg-accent-cyan/20',
    glow: 'hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]',
    activeGlow: 'shadow-[0_0_16px_rgba(6,182,212,0.35)]',
  },
  [EXECUTION_ACTION_TYPES.UPDATE]: {
    label: 'Update',
    color: 'text-accent-blue',
    bgColor: 'bg-accent-blue/15',
    borderColor: 'border-accent-blue/30',
    hoverBorderColor: 'hover:border-accent-blue/60',
    hoverBgColor: 'hover:bg-accent-blue/20',
    glow: 'hover:shadow-[0_0_12px_rgba(59,130,246,0.25)]',
    activeGlow: 'shadow-[0_0_16px_rgba(59,130,246,0.35)]',
  },
  [EXECUTION_ACTION_TYPES.CREATE]: {
    label: 'Create',
    color: 'text-accent-purple',
    bgColor: 'bg-accent-purple/15',
    borderColor: 'border-accent-purple/30',
    hoverBorderColor: 'hover:border-accent-purple/60',
    hoverBgColor: 'hover:bg-accent-purple/20',
    glow: 'hover:shadow-[0_0_12px_rgba(139,92,246,0.25)]',
    activeGlow: 'shadow-[0_0_16px_rgba(139,92,246,0.35)]',
  },
};

/**
 * Default action type config for unknown types
 * @type {Object}
 */
const DEFAULT_ACTION_TYPE_CONFIG = {
  label: 'Execute',
  color: 'text-slate-300',
  bgColor: 'bg-white/5',
  borderColor: 'border-white/10',
  hoverBorderColor: 'hover:border-white/20',
  hoverBgColor: 'hover:bg-white/10',
  glow: 'hover:shadow-[0_0_12px_rgba(255,255,255,0.1)]',
  activeGlow: 'shadow-[0_0_16px_rgba(255,255,255,0.15)]',
};

/**
 * Resolves the action type configuration
 * @param {string} actionType - The action type string
 * @returns {Object} The action type configuration object
 */
function getActionTypeConfig(actionType) {
  if (!actionType || typeof actionType !== 'string') {
    return DEFAULT_ACTION_TYPE_CONFIG;
  }
  const normalized = actionType.toUpperCase().trim();
  return ACTION_TYPE_CONFIG[normalized] || DEFAULT_ACTION_TYPE_CONFIG;
}

/**
 * Resolves the system display label
 * @param {string} system - The system identifier
 * @returns {string} The system display label
 */
function getSystemLabel(system) {
  if (!system || typeof system !== 'string') {
    return 'System';
  }
  const normalized = system.toLowerCase().trim();
  const systemEntry = Object.values(SYSTEM_SOURCES).find(
    (s) => s.id === normalized || s.name.toLowerCase() === normalized
  );
  if (systemEntry) {
    return systemEntry.label;
  }
  return system;
}

/**
 * System icon component
 * @param {Object} props
 * @param {string} props.system - The system identifier
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function SystemIcon({ system, className }) {
  const baseClass = classNames('w-4 h-4 flex-shrink-0', className);
  const normalized = system ? system.toLowerCase().trim() : '';

  switch (normalized) {
    case SYSTEM_SOURCES.SAP.id:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    case SYSTEM_SOURCES.PROCORE.id:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      );
    case SYSTEM_SOURCES.SALESFORCE.id:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      );
    case SYSTEM_SOURCES.PRIMAVERA.id:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
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

SystemIcon.propTypes = {
  system: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Action type icon component
 * @param {Object} props
 * @param {string} props.actionType - The action type
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function ActionTypeIcon({ actionType, className }) {
  const baseClass = classNames('w-4 h-4 flex-shrink-0', className);
  const normalized = actionType ? actionType.toUpperCase().trim() : '';

  switch (normalized) {
    case EXECUTION_ACTION_TYPES.APPROVE:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    case EXECUTION_ACTION_TYPES.REJECT:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      );
    case EXECUTION_ACTION_TYPES.ESCALATE:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      );
    case EXECUTION_ACTION_TYPES.ASSIGN:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
        </svg>
      );
    case EXECUTION_ACTION_TYPES.UPDATE:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      );
    case EXECUTION_ACTION_TYPES.CREATE:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
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

ActionTypeIcon.propTypes = {
  actionType: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Loading spinner SVG component
 * @returns {React.ReactElement}
 */
function LoadingSpinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
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
 * Success check icon component
 * @returns {React.ReactElement}
 */
function SuccessIcon() {
  return (
    <svg
      className="w-4 h-4 text-accent-green"
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
  );
}

/**
 * Error icon component
 * @returns {React.ReactElement}
 */
function ErrorIcon() {
  return (
    <svg
      className="w-4 h-4 text-red-400"
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
  );
}

/**
 * Enterprise action trigger button component for executing simulated enterprise actions.
 * Shows action type, target system icon, and confirmation state.
 * Includes loading spinner and success/error states with auto-dismiss.
 *
 * @param {Object} props
 * @param {string} props.actionType - The action type (APPROVE, REJECT, ESCALATE, ASSIGN, UPDATE, CREATE)
 * @param {string} [props.system] - The target system identifier (e.g., 'sap', 'procore', 'salesforce', 'primavera')
 * @param {Object} [props.context={}] - The action context data
 * @param {function} props.onExecute - Callback when the action is confirmed and executed, receives (actionType, context)
 * @param {boolean} [props.isExecuting=false] - Whether the action is currently being executed externally
 * @param {string} [props.label] - Optional custom label override
 * @param {string} [props.confirmationMessage] - Optional custom confirmation message
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The action button component
 */
export function ActionButton({
  actionType,
  system,
  context = {},
  onExecute,
  isExecuting = false,
  label,
  confirmationMessage,
  className,
}) {
  const [executionState, setExecutionState] = useState(EXECUTION_STATES.IDLE);
  const [resultMessage, setResultMessage] = useState(null);

  const config = getActionTypeConfig(actionType);
  const systemLabel = getSystemLabel(system);
  const displayLabel = label || config.label;
  const confirmMessage = confirmationMessage || `Are you sure you want to ${displayLabel.toLowerCase()} this action?`;

  const isDisabled = isExecuting || executionState === EXECUTION_STATES.EXECUTING;
  const isInConfirmState = executionState === EXECUTION_STATES.CONFIRMING;
  const isInSuccessState = executionState === EXECUTION_STATES.SUCCESS;
  const isInErrorState = executionState === EXECUTION_STATES.ERROR;
  const isInExecutingState = executionState === EXECUTION_STATES.EXECUTING || isExecuting;

  /**
   * Handles the initial button click - enters confirmation state
   */
  const handleClick = useCallback(() => {
    if (isDisabled || isInSuccessState || isInErrorState) {
      return;
    }

    if (isInConfirmState) {
      // Already in confirm state, do nothing (user should click confirm or cancel)
      return;
    }

    setExecutionState(EXECUTION_STATES.CONFIRMING);
  }, [isDisabled, isInConfirmState, isInSuccessState, isInErrorState]);

  /**
   * Handles the confirmation click - executes the action
   */
  const handleConfirm = useCallback(async () => {
    if (isDisabled) {
      return;
    }

    setExecutionState(EXECUTION_STATES.EXECUTING);
    setResultMessage(null);

    try {
      if (typeof onExecute === 'function') {
        const result = await onExecute(actionType, context);

        if (result && result.success) {
          setExecutionState(EXECUTION_STATES.SUCCESS);
          setResultMessage(
            (result.details && result.details.message) || `${displayLabel} completed successfully.`
          );
        } else {
          setExecutionState(EXECUTION_STATES.ERROR);
          setResultMessage(
            (result && result.message) || `${displayLabel} failed. Please try again.`
          );
        }
      } else {
        setExecutionState(EXECUTION_STATES.SUCCESS);
        setResultMessage(`${displayLabel} completed successfully.`);
      }
    } catch (_err) {
      setExecutionState(EXECUTION_STATES.ERROR);
      setResultMessage(`${displayLabel} failed. Please try again.`);
    }

    // Auto-dismiss success/error state after delay
    setTimeout(() => {
      setExecutionState(EXECUTION_STATES.IDLE);
      setResultMessage(null);
    }, STATE_DISMISS_DELAY);
  }, [isDisabled, onExecute, actionType, context, displayLabel]);

  /**
   * Handles the cancel click - returns to idle state
   */
  const handleCancel = useCallback(() => {
    setExecutionState(EXECUTION_STATES.IDLE);
    setResultMessage(null);
  }, []);

  /**
   * Handles keyboard events
   * @param {React.KeyboardEvent} event
   */
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape' && isInConfirmState) {
      event.preventDefault();
      handleCancel();
    }
  }, [isInConfirmState, handleCancel]);

  // Render confirmation state
  if (isInConfirmState) {
    return (
      <div
        className={classNames(
          'w-full',
          'animate-fade-in',
          className
        )}
        onKeyDown={handleKeyDown}
      >
        <div
          className={classNames(
            'glass-card p-4',
            'border',
            config.borderColor,
            config.activeGlow
          )}
        >
          {/* Confirmation message */}
          <p className="text-sm text-slate-300 mb-3">
            {confirmMessage}
          </p>

          {/* System target info */}
          {system && (
            <div className="flex items-center gap-2 mb-3">
              <SystemIcon system={system} className="text-slate-400" />
              <span className="text-xs text-slate-400">
                Target: {systemLabel}
              </span>
            </div>
          )}

          {/* Confirm / Cancel buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDisabled}
              className={classNames(
                'flex items-center justify-center gap-2',
                'px-4 py-2',
                'rounded-lg',
                'text-sm font-semibold',
                'text-white',
                'bg-gradient-accent',
                'transition-all duration-300 ease-in-out',
                'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
                'hover:translate-y-[-1px]',
                'active:translate-y-0',
                'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none'
              )}
              aria-label={`Confirm ${displayLabel}`}
            >
              <ActionTypeIcon actionType={actionType} className="text-white" />
              <span>Confirm {displayLabel}</span>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isDisabled}
              className={classNames(
                'flex items-center justify-center',
                'px-4 py-2',
                'rounded-lg',
                'text-sm font-medium',
                'text-slate-400',
                'bg-secondary-500/40',
                'border border-white/10',
                'transition-all duration-300 ease-in-out',
                'hover:text-slate-200',
                'hover:bg-secondary-500/60',
                'hover:border-white/20',
                'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-0',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label="Cancel action"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render executing state
  if (isInExecutingState) {
    return (
      <div
        className={classNames('w-full', className)}
      >
        <button
          type="button"
          disabled
          className={classNames(
            'inline-flex items-center gap-2',
            'px-4 py-2.5',
            'rounded-xl',
            'border',
            'text-sm font-medium',
            'cursor-not-allowed',
            'transition-all duration-300 ease-in-out',
            config.bgColor,
            config.borderColor,
            config.color,
            'opacity-80'
          )}
          aria-label={`Executing ${displayLabel}`}
          aria-busy="true"
        >
          <LoadingSpinner />
          <span>Executing...</span>
          {system && (
            <SystemIcon system={system} className="text-slate-500" />
          )}
        </button>
      </div>
    );
  }

  // Render success state
  if (isInSuccessState) {
    return (
      <div
        className={classNames('w-full', className)}
      >
        <div
          className={classNames(
            'inline-flex items-center gap-2',
            'px-4 py-2.5',
            'rounded-xl',
            'border',
            'text-sm font-medium',
            'bg-accent-green/10',
            'border-accent-green/30',
            'text-accent-green',
            'animate-fade-in'
          )}
          role="status"
          aria-label="Action completed successfully"
        >
          <SuccessIcon />
          <span>{resultMessage || `${displayLabel} completed successfully.`}</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (isInErrorState) {
    return (
      <div
        className={classNames('w-full', className)}
      >
        <div
          className={classNames(
            'inline-flex items-center gap-2',
            'px-4 py-2.5',
            'rounded-xl',
            'border',
            'text-sm font-medium',
            'bg-red-500/10',
            'border-red-500/30',
            'text-red-400',
            'animate-fade-in'
          )}
          role="alert"
          aria-label="Action failed"
        >
          <ErrorIcon />
          <span>{resultMessage || `${displayLabel} failed.`}</span>
        </div>
      </div>
    );
  }

  // Render idle state (default button)
  return (
    <div
      className={classNames('w-full', className)}
    >
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={classNames(
          'inline-flex items-center gap-2',
          'px-4 py-2.5',
          'rounded-xl',
          'border',
          'text-sm font-medium',
          'cursor-pointer',
          'transition-all duration-300 ease-in-out',
          'hover:translate-y-[-1px]',
          'active:translate-y-0',
          'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
          config.bgColor,
          config.borderColor,
          config.hoverBorderColor,
          config.hoverBgColor,
          config.glow,
          config.color
        )}
        aria-label={`${displayLabel}${system ? ` in ${systemLabel}` : ''}`}
      >
        <ActionTypeIcon actionType={actionType} className={config.color} />
        <span>{displayLabel}</span>
        {system && (
          <>
            <span className="text-slate-500 text-xs">•</span>
            <SystemIcon system={system} className="text-slate-400" />
            <span className="text-xs text-slate-400">{systemLabel}</span>
          </>
        )}
      </button>
    </div>
  );
}

ActionButton.propTypes = {
  actionType: PropTypes.string.isRequired,
  system: PropTypes.string,
  context: PropTypes.object,
  onExecute: PropTypes.func.isRequired,
  isExecuting: PropTypes.bool,
  label: PropTypes.string,
  confirmationMessage: PropTypes.string,
  className: PropTypes.string,
};

export default ActionButton;