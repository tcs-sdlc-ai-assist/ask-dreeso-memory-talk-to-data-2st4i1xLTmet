import { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { SYSTEM_SOURCES } from '../utils/constants.js';

/**
 * Execution state constants
 * @enum {string}
 */
const CONFIRMATION_STATES = {
  IDLE: 'idle',
  EXECUTING: 'executing',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Maps system IDs to their display labels
 * @type {Object<string, string>}
 */
const SYSTEM_LABELS = {
  [SYSTEM_SOURCES.SAP.id]: SYSTEM_SOURCES.SAP.label,
  [SYSTEM_SOURCES.PROCORE.id]: SYSTEM_SOURCES.PROCORE.label,
  [SYSTEM_SOURCES.SALESFORCE.id]: SYSTEM_SOURCES.SALESFORCE.label,
  [SYSTEM_SOURCES.PRIMAVERA.id]: SYSTEM_SOURCES.PRIMAVERA.label,
};

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
  return SYSTEM_LABELS[normalized] || system;
}

/**
 * System icon component
 * @param {Object} props
 * @param {string} props.system - The system identifier
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function SystemIcon({ system, className }) {
  const baseClass = classNames('w-5 h-5 flex-shrink-0', className);
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
 * Loading spinner SVG component
 * @returns {React.ReactElement}
 */
function LoadingSpinner() {
  return (
    <svg
      className="w-5 h-5 animate-spin"
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
  );
}

/**
 * Error icon component
 * @returns {React.ReactElement}
 */
function ErrorIcon() {
  return (
    <svg
      className="w-10 h-10 text-red-400"
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
 * Warning/confirmation icon component
 * @returns {React.ReactElement}
 */
function ConfirmIcon() {
  return (
    <svg
      className="w-10 h-10 text-accent-orange"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Resolves the action display name from an action object
 * @param {Object} action - The action object
 * @returns {string} The display name
 */
function getActionDisplayName(action) {
  if (!action || typeof action !== 'object') {
    return 'Action';
  }
  return action.name || action.title || action.actionType || 'Action';
}

/**
 * Resolves the action description from an action object
 * @param {Object} action - The action object
 * @returns {string|null} The description or null
 */
function getActionDescription(action) {
  if (!action || typeof action !== 'object') {
    return null;
  }
  return action.description || action.confirmationMessage || null;
}

/**
 * Resolves the target system from an action object
 * @param {Object} action - The action object
 * @returns {string|null} The system identifier or null
 */
function getActionSystem(action) {
  if (!action || typeof action !== 'object') {
    return null;
  }
  return action.system || action.systemId || null;
}

/**
 * Resolves the system label from an action object
 * @param {Object} action - The action object
 * @returns {string|null} The system label or null
 */
function getActionSystemLabel(action) {
  if (!action || typeof action !== 'object') {
    return null;
  }
  if (action.systemLabel) {
    return action.systemLabel;
  }
  const system = getActionSystem(action);
  if (system) {
    return getSystemLabel(system);
  }
  return null;
}

/**
 * Action execution confirmation dialog component showing action details,
 * target system, and confirm/cancel buttons. Uses glassmorphism modal overlay
 * with smooth transition animations.
 *
 * @param {Object} props
 * @param {Object} props.action - The action object containing details about the action to confirm
 * @param {string} [props.action.name] - Action display name
 * @param {string} [props.action.title] - Action title (fallback for name)
 * @param {string} [props.action.actionType] - Action type identifier
 * @param {string} [props.action.description] - Action description text
 * @param {string} [props.action.confirmationMessage] - Custom confirmation message
 * @param {string} [props.action.system] - Target system identifier
 * @param {string} [props.action.systemId] - Target system identifier (alternative)
 * @param {string} [props.action.systemLabel] - Target system display label
 * @param {Array} [props.action.fields] - Action field definitions
 * @param {function} props.onConfirm - Callback when the action is confirmed, receives the action object
 * @param {function} props.onCancel - Callback when the action is cancelled
 * @param {boolean} [props.isVisible=false] - Whether the dialog is visible
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement|null} The action confirmation dialog or null if not visible
 */
export function ActionConfirmation({
  action,
  onConfirm,
  onCancel,
  isVisible = false,
  className,
}) {
  const [confirmationState, setConfirmationState] = useState(CONFIRMATION_STATES.IDLE);
  const [resultMessage, setResultMessage] = useState(null);
  const overlayRef = useRef(null);
  const dialogRef = useRef(null);

  const actionName = getActionDisplayName(action);
  const actionDescription = getActionDescription(action);
  const actionSystem = getActionSystem(action);
  const actionSystemLabel = getActionSystemLabel(action);

  const isExecuting = confirmationState === CONFIRMATION_STATES.EXECUTING;
  const isSuccess = confirmationState === CONFIRMATION_STATES.SUCCESS;
  const isError = confirmationState === CONFIRMATION_STATES.ERROR;
  const isIdle = confirmationState === CONFIRMATION_STATES.IDLE;

  /**
   * Resets the confirmation state to idle
   */
  const resetState = useCallback(() => {
    setConfirmationState(CONFIRMATION_STATES.IDLE);
    setResultMessage(null);
  }, []);

  // Reset state when visibility changes
  useEffect(() => {
    if (isVisible) {
      resetState();
    }
  }, [isVisible, resetState]);

  // Handle escape key to cancel
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isVisible && isIdle) {
        event.preventDefault();
        if (typeof onCancel === 'function') {
          onCancel();
        }
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, isIdle, onCancel]);

  // Trap focus within dialog when visible
  useEffect(() => {
    if (isVisible && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isVisible, confirmationState]);

  /**
   * Handles overlay click to cancel (only when clicking the backdrop)
   * @param {React.MouseEvent} event
   */
  const handleOverlayClick = useCallback((event) => {
    if (event.target === overlayRef.current && isIdle) {
      if (typeof onCancel === 'function') {
        onCancel();
      }
    }
  }, [isIdle, onCancel]);

  /**
   * Handles the confirm button click
   */
  const handleConfirm = useCallback(async () => {
    if (isExecuting || isSuccess || isError) {
      return;
    }

    setConfirmationState(CONFIRMATION_STATES.EXECUTING);
    setResultMessage(null);

    try {
      if (typeof onConfirm === 'function') {
        const result = await onConfirm(action);

        if (result && result.success) {
          setConfirmationState(CONFIRMATION_STATES.SUCCESS);
          setResultMessage(
            (result.details && result.details.message) ||
            (result.message) ||
            `${actionName} completed successfully.`
          );
        } else if (result && result.success === false) {
          setConfirmationState(CONFIRMATION_STATES.ERROR);
          setResultMessage(
            result.message || `${actionName} failed. Please try again.`
          );
        } else {
          // If no result object, assume success
          setConfirmationState(CONFIRMATION_STATES.SUCCESS);
          setResultMessage(`${actionName} completed successfully.`);
        }
      } else {
        setConfirmationState(CONFIRMATION_STATES.SUCCESS);
        setResultMessage(`${actionName} completed successfully.`);
      }
    } catch (_err) {
      setConfirmationState(CONFIRMATION_STATES.ERROR);
      setResultMessage(`${actionName} failed. Please try again.`);
    }
  }, [isExecuting, isSuccess, isError, onConfirm, action, actionName]);

  /**
   * Handles the cancel button click
   */
  const handleCancel = useCallback(() => {
    if (isExecuting) {
      return;
    }

    resetState();

    if (typeof onCancel === 'function') {
      onCancel();
    }
  }, [isExecuting, resetState, onCancel]);

  /**
   * Handles the close button click after success or error
   */
  const handleClose = useCallback(() => {
    resetState();

    if (typeof onCancel === 'function') {
      onCancel();
    }
  }, [resetState, onCancel]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      className={classNames(
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'p-4 sm:p-6',
        'bg-primary-500/70',
        'backdrop-blur-sm',
        'animate-fade-in',
        className
      )}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Confirm action: ${actionName}`}
    >
      <div
        ref={dialogRef}
        className={classNames(
          'w-full max-w-md',
          'glass-card-lg',
          'p-6 sm:p-8',
          'animate-slide-up',
          'relative'
        )}
      >
        {/* Idle / Confirmation State */}
        {isIdle && (
          <div className="animate-fade-in">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div
                className={classNames(
                  'flex items-center justify-center',
                  'w-16 h-16',
                  'rounded-full',
                  'bg-accent-orange/10',
                  'border border-accent-orange/20'
                )}
              >
                <ConfirmIcon />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 text-center mb-2">
              Confirm {actionName}
            </h2>

            {/* Description */}
            {actionDescription && (
              <p className="text-sm text-slate-300 text-center leading-relaxed mb-5">
                {actionDescription}
              </p>
            )}

            {!actionDescription && (
              <p className="text-sm text-slate-300 text-center leading-relaxed mb-5">
                Are you sure you want to execute this action? This operation cannot be undone.
              </p>
            )}

            {/* Target System Info */}
            {actionSystem && (
              <div
                className={classNames(
                  'flex items-center justify-center gap-2',
                  'px-4 py-3',
                  'rounded-xl',
                  'bg-secondary-500/40',
                  'border border-white/5',
                  'mb-6'
                )}
              >
                <SystemIcon system={actionSystem} className="text-slate-400" />
                <span className="text-sm text-slate-300">
                  Target System:
                </span>
                <span className="text-sm font-semibold text-slate-100">
                  {actionSystemLabel}
                </span>
              </div>
            )}

            {/* Action Fields Preview */}
            {action && Array.isArray(action.fields) && action.fields.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Required Fields
                </p>
                <div className="space-y-1.5">
                  {action.fields.map((field, index) => (
                    <div
                      key={field.name || `field-${index}`}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-secondary-500/20"
                    >
                      <span className="text-xs text-slate-400">
                        {field.label || field.name}
                      </span>
                      {field.required && (
                        <span className="text-xs text-accent-orange font-medium">
                          Required
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className={classNames(
                  'flex-1 flex items-center justify-center',
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
                aria-label="Cancel action"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
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
                aria-label={`Confirm ${actionName}`}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Confirm</span>
              </button>
            </div>
          </div>
        )}

        {/* Executing State */}
        {isExecuting && (
          <div className="animate-fade-in">
            <div className="flex flex-col items-center justify-center py-8">
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

              <h2 className="text-lg font-bold text-slate-100 text-center mb-2">
                Executing {actionName}
              </h2>

              <p className="text-sm text-slate-400 text-center">
                Please wait while the action is being processed...
              </p>

              {actionSystem && (
                <div className="flex items-center gap-2 mt-4">
                  <SystemIcon system={actionSystem} className="text-slate-500" />
                  <span className="text-xs text-slate-500">
                    Communicating with {actionSystemLabel}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className="animate-fade-in">
            <div className="flex flex-col items-center justify-center py-6">
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
                <SuccessIcon />
              </div>

              <h2 className="text-lg font-bold text-slate-100 text-center mb-2">
                Action Completed
              </h2>

              <p className="text-sm text-slate-300 text-center leading-relaxed mb-6">
                {resultMessage || `${actionName} completed successfully.`}
              </p>

              <button
                type="button"
                onClick={handleClose}
                className={classNames(
                  'flex items-center justify-center gap-2',
                  'px-6 py-3',
                  'rounded-xl',
                  'text-sm font-semibold',
                  'text-white',
                  'bg-accent-green/20',
                  'border border-accent-green/30',
                  'transition-all duration-300 ease-in-out',
                  'hover:bg-accent-green/30',
                  'hover:border-accent-green/50',
                  'focus:outline-none focus:ring-2 focus:ring-accent-green/50 focus:ring-offset-0'
                )}
                aria-label="Close confirmation dialog"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Done</span>
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="animate-fade-in">
            <div className="flex flex-col items-center justify-center py-6">
              <div
                className={classNames(
                  'flex items-center justify-center',
                  'w-16 h-16',
                  'rounded-full',
                  'bg-red-500/10',
                  'border border-red-500/20',
                  'mb-5'
                )}
              >
                <ErrorIcon />
              </div>

              <h2 className="text-lg font-bold text-slate-100 text-center mb-2">
                Action Failed
              </h2>

              <p className="text-sm text-slate-300 text-center leading-relaxed mb-6">
                {resultMessage || `${actionName} failed. Please try again.`}
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleClose}
                  className={classNames(
                    'flex-1 flex items-center justify-center',
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
                  aria-label="Close dialog"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetState();
                  }}
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
                  aria-label="Retry action"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Retry</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ActionConfirmation.propTypes = {
  action: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    actionType: PropTypes.string,
    description: PropTypes.string,
    confirmationMessage: PropTypes.string,
    system: PropTypes.string,
    systemId: PropTypes.string,
    systemLabel: PropTypes.string,
    fields: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        label: PropTypes.string,
        type: PropTypes.string,
        required: PropTypes.bool,
      })
    ),
  }),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isVisible: PropTypes.bool,
  className: PropTypes.string,
};

export default ActionConfirmation;