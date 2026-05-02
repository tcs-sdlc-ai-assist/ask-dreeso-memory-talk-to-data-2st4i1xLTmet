/**
 * Shared utility/helper functions
 * @module helpers
 */

import { BREAKPOINTS } from './constants.js';

/**
 * Generates a unique identifier string
 * @param {number} [length=16] - Length of the generated ID
 * @returns {string} A unique identifier string
 */
export function generateId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

/**
 * Formats a timestamp into a human-readable string
 * @param {number|string|Date} timestamp - The timestamp to format
 * @param {Object} [options] - Intl.DateTimeFormat options
 * @param {string} [options.locale='en-US'] - Locale string
 * @param {boolean} [options.includeTime=true] - Whether to include time
 * @param {boolean} [options.relative=false] - Whether to use relative time
 * @returns {string} Formatted timestamp string
 */
export function formatTimestamp(timestamp, options = {}) {
  const {
    locale = 'en-US',
    includeTime = true,
    relative = false,
  } = options;

  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  if (relative) {
    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'just now';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
  }

  /** @type {Intl.DateTimeFormatOptions} */
  const formatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(date);
}

/**
 * Hashes a password string using the Web Crypto API (SHA-256)
 * @param {string} password - The password to hash
 * @returns {Promise<string>} The hex-encoded hash string
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (err) {
    throw new Error(`Failed to hash password: ${err.message}`);
  }
}

/**
 * Validates an email address format
 * @param {string} email - The email address to validate
 * @returns {boolean} Whether the email is valid
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a password against security requirements
 * @param {string} password - The password to validate
 * @param {Object} [options] - Validation options
 * @param {number} [options.minLength=8] - Minimum password length
 * @param {boolean} [options.requireUppercase=true] - Require uppercase letter
 * @param {boolean} [options.requireLowercase=true] - Require lowercase letter
 * @param {boolean} [options.requireNumber=true] - Require a number
 * @param {boolean} [options.requireSpecial=false] - Require a special character
 * @returns {{ valid: boolean, errors: string[] }} Validation result with error messages
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options;

  const errors = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Creates a debounced version of a function
 * @param {Function} fn - The function to debounce
 * @param {number} [delay=300] - Delay in milliseconds
 * @returns {Function} Debounced function with a cancel method
 */
export function debounce(fn, delay = 300) {
  let timeoutId = null;

  /** @type {Function & { cancel: Function }} */
  const debounced = function (...args) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = function () {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Creates a throttled version of a function
 * @param {Function} fn - The function to throttle
 * @param {number} [limit=300] - Minimum time between calls in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit = 300) {
  let inThrottle = false;
  let lastArgs = null;
  let lastContext = null;

  const throttled = function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs !== null) {
          fn.apply(lastContext, lastArgs);
          lastArgs = null;
          lastContext = null;
        }
      }, limit);
    } else {
      lastArgs = args;
      lastContext = this;
    }
  };

  return throttled;
}

/**
 * Utility for conditionally joining class names together
 * Supports strings, objects, and arrays
 * @param {...(string|Object<string, boolean>|Array|undefined|null|false)} args - Class name arguments
 * @returns {string} Combined class name string
 */
export function classNames(...args) {
  const classes = [];

  for (const arg of args) {
    if (!arg) {
      continue;
    }

    if (typeof arg === 'string') {
      classes.push(arg.trim());
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg);
      if (inner) {
        classes.push(inner);
      }
    } else if (typeof arg === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) {
          classes.push(key.trim());
        }
      }
    }
  }

  return classes.filter(Boolean).join(' ');
}

/**
 * Truncates text to a specified length and appends an ellipsis
 * @param {string} text - The text to truncate
 * @param {number} [maxLength=100] - Maximum length before truncation
 * @param {string} [suffix='…'] - Suffix to append when truncated
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100, suffix = '…') {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength).trimEnd();
  return `${truncated}${suffix}`;
}

/**
 * Detects the current device type based on window width
 * Uses breakpoints from constants
 * @returns {'mobile'|'tablet'|'desktop'|'large-desktop'} The detected device type
 */
export function getDeviceType() {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const width = window.innerWidth;

  if (width < BREAKPOINTS.SM) {
    return 'mobile';
  }

  if (width < BREAKPOINTS.LG) {
    return 'tablet';
  }

  if (width < BREAKPOINTS.XL) {
    return 'desktop';
  }

  return 'large-desktop';
}