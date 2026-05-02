import { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { classNames, debounce } from '../utils/helpers.js';
import { getSuggestedQueries } from '../data/mockData.js';

/**
 * Maximum allowed query length
 * @type {number}
 */
const MAX_QUERY_LENGTH = 256;

/**
 * Debounce delay for typing indicator in milliseconds
 * @type {number}
 */
const TYPING_INDICATOR_DELAY = 300;

/**
 * Validates a query string against constraints
 * @param {string} query - The query string to validate
 * @returns {{ valid: boolean, error: string|null }} Validation result
 */
function validateQueryInput(query) {
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query cannot be empty.' };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Query cannot be empty.' };
  }

  if (trimmed.length > MAX_QUERY_LENGTH) {
    return { valid: false, error: `Query must be ${MAX_QUERY_LENGTH} characters or fewer.` };
  }

  return { valid: true, error: null };
}

/**
 * Search icon SVG component
 * @returns {React.ReactElement}
 */
function SearchIcon() {
  return (
    <svg
      className="w-5 h-5 text-slate-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Submit arrow icon SVG component
 * @returns {React.ReactElement}
 */
function SubmitIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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
 * Typing indicator dots component
 * @returns {React.ReactElement}
 */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1" aria-hidden="true">
      <span className="block w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" style={{ animationDelay: '0ms' }} />
      <span className="block w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" style={{ animationDelay: '150ms' }} />
      <span className="block w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

/**
 * Suggested query chip component
 * @param {Object} props
 * @param {string} props.query - The suggested query text
 * @param {function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether the chip is disabled
 * @returns {React.ReactElement}
 */
function SuggestionChip({ query, onClick, disabled }) {
  const handleClick = () => {
    if (!disabled && typeof onClick === 'function') {
      onClick(query);
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
      disabled={disabled}
      className={classNames(
        'inline-flex items-center',
        'px-3 py-1.5',
        'rounded-full',
        'text-xs sm:text-sm',
        'font-medium',
        'border border-white/10',
        'bg-secondary-500/30',
        'backdrop-blur-sm',
        'text-slate-300',
        'transition-all duration-300 ease-in-out',
        'hover:border-accent-blue/40',
        'hover:bg-accent-blue/10',
        'hover:text-slate-200',
        'hover:translate-y-[-1px]',
        'active:translate-y-0',
        'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:border-white/10 disabled:hover:bg-secondary-500/30'
      )}
      aria-label={`Ask: ${query}`}
    >
      {query}
    </button>
  );
}

SuggestionChip.propTypes = {
  query: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

/**
 * Natural language query input component with search-style input field,
 * submit button, and placeholder suggestions. Includes input validation,
 * debounced typing indicator, and design system styling (glassmorphism input,
 * gradient accents).
 *
 * @param {Object} props
 * @param {function} props.onSubmit - Callback when a query is submitted, receives the query string
 * @param {string} [props.placeholder='Ask anything about your projects...'] - Input placeholder text
 * @param {boolean} [props.isLoading=false] - Whether a query is currently being processed
 * @param {string} [props.persona] - Current persona identifier for suggested queries
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement} The query input component
 */
export function QueryInput({
  onSubmit,
  placeholder = 'Ask anything about your projects...',
  isLoading = false,
  persona,
  className,
}) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);

  const debouncedSetTypingFalse = useRef(
    debounce(() => {
      setIsTyping(false);
    }, TYPING_INDICATOR_DELAY)
  );

  // Clean up debounce on unmount
  useEffect(() => {
    const debouncedFn = debouncedSetTypingFalse.current;
    return () => {
      if (debouncedFn && typeof debouncedFn.cancel === 'function') {
        debouncedFn.cancel();
      }
    };
  }, []);

  const suggestedQueries = persona ? getSuggestedQueries(persona) : [];

  /**
   * Handles input value changes
   * @param {React.ChangeEvent<HTMLInputElement>} event
   */
  const handleChange = useCallback((event) => {
    const value = event.target.value;
    setQuery(value);

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }

    // Show typing indicator
    if (value.trim().length > 0) {
      setIsTyping(true);
      debouncedSetTypingFalse.current();
    } else {
      setIsTyping(false);
      if (debouncedSetTypingFalse.current && typeof debouncedSetTypingFalse.current.cancel === 'function') {
        debouncedSetTypingFalse.current.cancel();
      }
    }
  }, [error]);

  /**
   * Handles form submission
   * @param {React.FormEvent} event
   */
  const handleSubmit = useCallback((event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const validation = validateQueryInput(query);

    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError(null);
    setIsTyping(false);

    if (debouncedSetTypingFalse.current && typeof debouncedSetTypingFalse.current.cancel === 'function') {
      debouncedSetTypingFalse.current.cancel();
    }

    if (typeof onSubmit === 'function') {
      onSubmit(query.trim());
    }
  }, [query, isLoading, onSubmit]);

  /**
   * Handles clicking a suggested query
   * @param {string} suggestedQuery - The suggested query text
   */
  const handleSuggestionClick = useCallback((suggestedQuery) => {
    if (isLoading) {
      return;
    }

    setQuery(suggestedQuery);
    setError(null);
    setIsTyping(false);

    if (typeof onSubmit === 'function') {
      onSubmit(suggestedQuery.trim());
    }
  }, [isLoading, onSubmit]);

  /**
   * Handles keyboard events on the input
   * @param {React.KeyboardEvent<HTMLInputElement>} event
   */
  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      setQuery('');
      setError(null);
      setIsTyping(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, []);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const isSubmitDisabled = isLoading || !hasQuery;
  const characterCount = trimmedQuery.length;
  const isNearLimit = characterCount > MAX_QUERY_LENGTH * 0.85;

  return (
    <div
      className={classNames('w-full', className)}
    >
      {/* Input form */}
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={classNames(
            'relative flex items-center',
            'w-full',
            'rounded-2xl',
            'bg-secondary-500/40',
            'backdrop-blur-xl',
            'border',
            'transition-all duration-300 ease-in-out',
            'shadow-glass-sm',
            error
              ? 'border-red-500/50 focus-within:border-red-500/70'
              : 'border-white/10 focus-within:border-accent-blue/50',
            'focus-within:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
            'hover:border-white/15'
          )}
        >
          {/* Search icon */}
          <div className="flex-shrink-0 pl-4 sm:pl-5">
            <SearchIcon />
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            maxLength={MAX_QUERY_LENGTH}
            autoComplete="off"
            spellCheck="true"
            className={classNames(
              'flex-1',
              'w-full',
              'px-3 py-3.5 sm:py-4',
              'bg-transparent',
              'text-sm sm:text-base',
              'font-medium',
              'text-slate-100',
              'placeholder:text-slate-500',
              'focus:outline-none',
              'disabled:opacity-60 disabled:cursor-not-allowed',
              'transition-colors duration-200'
            )}
            aria-label="Enter your query"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? 'query-input-error' : undefined}
          />

          {/* Typing indicator */}
          {isTyping && !isLoading && (
            <div className="flex-shrink-0 pr-1">
              <TypingIndicator />
            </div>
          )}

          {/* Submit button */}
          <div className="flex-shrink-0 pr-2 sm:pr-3">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={classNames(
                'flex items-center justify-center',
                'w-9 h-9 sm:w-10 sm:h-10',
                'rounded-xl',
                'text-white',
                'transition-all duration-300 ease-in-out',
                'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
                isSubmitDisabled
                  ? 'bg-secondary-500/50 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-accent hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:translate-y-[-1px] active:translate-y-0 cursor-pointer'
              )}
              aria-label={isLoading ? 'Processing query' : 'Submit query'}
            >
              {isLoading ? <LoadingSpinner /> : <SubmitIcon />}
            </button>
          </div>
        </div>

        {/* Error message and character count */}
        <div className="flex items-center justify-between mt-2 px-1 min-h-[1.25rem]">
          <div className="flex-1">
            {error && (
              <p
                id="query-input-error"
                className="text-xs text-red-400 animate-fade-in"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>
          {hasQuery && (
            <span
              className={classNames(
                'text-xs tabular-nums flex-shrink-0 ml-2',
                isNearLimit ? 'text-accent-orange' : 'text-slate-500'
              )}
            >
              {characterCount}/{MAX_QUERY_LENGTH}
            </span>
          )}
        </div>
      </form>

      {/* Suggested queries */}
      {Array.isArray(suggestedQueries) && suggestedQueries.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2 px-1">
            Suggested queries
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((suggestedQuery, index) => (
              <div
                key={`suggestion-${index}`}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
              >
                <SuggestionChip
                  query={suggestedQuery}
                  onClick={handleSuggestionClick}
                  disabled={isLoading}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

QueryInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  isLoading: PropTypes.bool,
  persona: PropTypes.string,
  className: PropTypes.string,
};

export default QueryInput;