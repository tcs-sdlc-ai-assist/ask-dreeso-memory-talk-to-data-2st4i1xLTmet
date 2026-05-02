/**
 * Application-wide constants and configuration values
 * @module constants
 */

/**
 * Persona definitions with roles and cluster mappings
 * @typedef {Object} Persona
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} role - Job title/role
 * @property {string} cluster - Organizational cluster
 * @property {string} avatar - Avatar identifier
 */
export const PERSONAS = {
  LUKAS: {
    id: 'lukas',
    name: 'Lukas',
    role: 'Project Manager',
    cluster: 'operations',
    avatar: 'lukas',
  },
  ELENA: {
    id: 'elena',
    name: 'Elena',
    role: 'Finance Director',
    cluster: 'finance',
    avatar: 'elena',
  },
  SOPHIE: {
    id: 'sophie',
    name: 'Sophie',
    role: 'Site Engineer',
    cluster: 'engineering',
    avatar: 'sophie',
  },
  JAMES: {
    id: 'james',
    name: 'James',
    role: 'Sales Executive',
    cluster: 'sales',
    avatar: 'james',
  },
};

/**
 * Screen identifiers for navigation flow (0-20)
 * @enum {number}
 */
export const SCREEN_IDS = {
  SPLASH: 0,
  PERSONA_SELECT: 1,
  DASHBOARD: 2,
  QUERY_INPUT: 3,
  LOADING: 4,
  RESULT_OVERVIEW: 5,
  RESULT_DETAIL: 6,
  CTA_PRIMARY: 7,
  CTA_SECONDARY: 8,
  ACTION_CONFIRM: 9,
  ACTION_EXECUTE: 10,
  CONFIRMATION: 11,
  HISTORY: 12,
  SETTINGS: 13,
  HELP: 14,
  NOTIFICATIONS: 15,
  PROFILE: 16,
  DATA_SOURCE: 17,
  EXPORT: 18,
  FEEDBACK: 19,
  ERROR: 20,
};

/**
 * View states for the query flow
 * @enum {string}
 */
export const VIEW_STATES = {
  QUERY_INPUT: 'QUERY_INPUT',
  LOADING: 'LOADING',
  RESULT: 'RESULT',
  CTA_INTERACTION: 'CTA_INTERACTION',
  ACTION_EXECUTION: 'ACTION_EXECUTION',
  CONFIRMATION: 'CONFIRMATION',
};

/**
 * localStorage key constants
 * @enum {string}
 */
export const STORAGE_KEYS = {
  SELECTED_PERSONA: 'ask_dreeso_selected_persona',
  QUERY_HISTORY: 'ask_dreeso_query_history',
  USER_PREFERENCES: 'ask_dreeso_user_preferences',
  THEME: 'ask_dreeso_theme',
  LAST_SESSION: 'ask_dreeso_last_session',
  ONBOARDING_COMPLETE: 'ask_dreeso_onboarding_complete',
};

/**
 * System data sources
 * @enum {Object}
 */
export const SYSTEM_SOURCES = {
  SAP: {
    id: 'sap',
    name: 'SAP',
    label: 'SAP ERP',
    color: '#0070F2',
  },
  PROCORE: {
    id: 'procore',
    name: 'Procore',
    label: 'Procore',
    color: '#F47E20',
  },
  SALESFORCE: {
    id: 'salesforce',
    name: 'Salesforce',
    label: 'Salesforce CRM',
    color: '#00A1E0',
  },
  PRIMAVERA: {
    id: 'primavera',
    name: 'Primavera',
    label: 'Oracle Primavera',
    color: '#C74634',
  },
};

/**
 * Color palette matching the design system
 * @enum {Object}
 */
export const COLOR_PALETTE = {
  primary: {
    dark: '#0A1A2F',
    medium: '#1E2A44',
    light: '#3A4E72',
  },
  accent: {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    cyan: '#06B6D4',
    pink: '#EC4899',
    green: '#10B981',
    orange: '#F59E0B',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
  },
  glass: {
    background: 'rgba(30, 42, 68, 0.4)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.14)',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

/**
 * Animation duration constants (in milliseconds)
 * @enum {number}
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  DEFAULT: 300,
  SLOW: 500,
  EXTRA_SLOW: 800,
  SKELETON_SHIMMER: 1800,
  PAGE_TRANSITION: 400,
  LOADING_MIN: 1200,
  LOADING_MAX: 3000,
};

/**
 * Responsive breakpoints matching Tailwind config
 * @enum {number}
 */
export const BREAKPOINTS = {
  XS: 475,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
  '3XL': 1920,
};