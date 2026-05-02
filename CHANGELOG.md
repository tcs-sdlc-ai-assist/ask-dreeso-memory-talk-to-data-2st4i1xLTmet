# Changelog

All notable changes to the **Ask Dreeso Memory** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-06-01

### Added

#### Authentication Module
- Email/password login with SHA-256 hashed credential validation against mock user store.
- Signup flow with full name, email, password (strength indicator), confirm password, and role selection.
- Persona quick login for four predefined personas: Lukas (Project Manager), Elena (Finance Director), Sophie (Site Engineer), and James (Sales Executive).
- Session management with 2-hour expiration, automatic validation, and refresh capability.
- Role-to-cluster mapping for operations, finance, engineering, and sales domains.
- `AuthContext` provider with `useAuth` hook exposing login, signup, quickLogin, logout, and session state.

#### Navigation Engine
- 21-screen navigation system (Screen IDs 0–20) with full configuration metadata.
- Persona-specific screen flows defining ordered accessible screens per cluster.
- Role-based access control enforcing cluster-level permissions on authenticated screens.
- `NavigationContext` provider with `useNavigation` hook for programmatic navigation.
- `ProtectedRoute` component with authentication guard, role validation, and fallback screens.
- React Router v6 integration with `createBrowserRouter`, lazy-loaded routes, and Suspense boundaries.
- Browser back/forward synchronization with localStorage-persisted navigation state.

#### Talk-to-Data Query Engine
- Natural language query interpretation matching against predefined keyword patterns per persona.
- Four persona-specific query response sets: Lukas (4 queries), Elena (4 queries), Sophie (4 queries), James (4 queries).
- Structured output types: `table`, `kpi`, `forecast`, `risk`, and `error`.
- Multi-system data orchestration mapping queries to SAP, Procore, Salesforce, and Primavera sources.
- Simulated async execution delay (1.2–3.0 seconds) for realistic loading states.
- Follow-up query support with reduced delay (0.5–1.2 seconds) for CTA-driven interactions.
- Default fallback response for unmatched queries returning general analytics KPIs.
- Query result persistence to localStorage with automatic pruning at 100 entries.

#### Intelligence Clusters
- Six intelligence cluster domains: Operations, Finance, Engineering, Sales, Risk, and Portfolio.
- Cluster-specific KPI data with trend indicators (up, down, stable) and percentage changes.
- Persona-to-cluster mapping providing 3 relevant clusters per persona.
- `IntelligenceClusterCard` component with domain-specific icons, color accents, and active state.
- Interactive cluster selection toggling KPI visualization on dashboard screens.

#### CTA Bubbles
- Contextual CTA bubble generation engine producing 3–4 follow-up suggestions per query result.
- Three CTA action types: `drill_down` (deeper analysis), `action` (trigger execution), `navigation` (related screen).
- Six CTA context categories: project risks, budget overview, schedule status, pipeline analysis, quality metrics, portfolio overview.
- `CTABubble` component with action-type-specific styling, icons, and staggered fade-in animations.
- CTA click handling with audit logging and automatic follow-up query execution.

#### Source Transparency
- Data provenance indicators for all four enterprise systems (SAP, Procore, Salesforce, Primavera).
- Three source status types: live (green dot with ping animation), cached (yellow dot), offline (red dot).
- Confidence scoring based on source latency: ≤100ms → 98%, ≤200ms → 95%, ≤500ms → 90%.
- `SourceIndicator` component with full and compact rendering modes.
- Source summary aggregation with overall confidence calculation and live/cached/offline counts.

#### Action Execution Layer
- Simulated enterprise action execution across SAP, Procore, Salesforce, and Primavera.
- Six action types: APPROVE, REJECT, ESCALATE, ASSIGN, UPDATE, CREATE.
- Action template system with 7 predefined templates: Approve Budget, Create Change Order, Update Forecast, Schedule Risk Review, Update Opportunity, Resolve RFI, Export Report.
- Role-based action access control filtering templates by persona cluster.
- `ActionButton` component with confirmation flow, executing state, success/error states, and auto-dismiss.
- `ActionConfirmation` modal dialog with glassmorphism overlay, system target info, and field previews.
- Action result persistence to localStorage with execution time tracking.

#### Audit Logging
- Centralized audit log service capturing 100% of user actions with timestamped entries.
- 16 action types: LOGIN, LOGIN_FAIL, LOGOUT, SIGNUP, SIGNUP_FAIL, NAVIGATE, NAVIGATE_FAIL, QUERY, QUERY_FAIL, ACTION_EXECUTE, ACTION_EXECUTE_FAIL, CTA_CLICK, PERSONA_SELECT, SESSION_EXPIRED, DATA_EXPORT, SETTINGS_CHANGE.
- Automatic log rotation at 1,000 entries to prevent localStorage quota exhaustion.
- Filtering by action type, user ID, date range, and sort order.
- Export capability producing serializable JSON with metadata and full entry history.

#### Responsive UI Components
- `ResponsiveLayout` wrapper implementing 12-column grid system with device type detection.
- `ResponsiveGrid` and `ResponsiveColumn` components for breakpoint-aware layouts.
- `NavigationBar` with desktop full nav and mobile hamburger menu with slide-down animation.
- `PersonaBar` showing current user avatar, name, role, and active cluster badge.
- `QueryInput` with search-style input, typing indicator, character counter, and suggested query chips.
- `StructuredOutput` dynamic renderer selecting DataTable, ForecastChart, RiskSignal, or KPI grid.
- `DataTable` with desktop table, tablet stacked cards, and mobile horizontal scroll layouts.
- `ForecastChart` with pure SVG bar charts, line charts with gradient fills, and KPI card grids.
- `RiskSignal` with color-coded risk cards, probability bars, and summary header.
- `SkeletonLoader` with text, card, table, and chart variants using shimmer animation.
- `GlassCard` with default, elevated, and interactive variants.
- `ErrorBoundary` class component with fallback UI, retry button, and audit log integration.

#### Design System Compliance
- Dark theme with primary background `#0A1A2F` and secondary `#1E2A44`.
- Gradient mesh background with blue, purple, and cyan radial gradients.
- Glassmorphism card system with backdrop-blur, semi-transparent backgrounds, and subtle borders.
- Accent color palette: blue (`#3B82F6`), purple (`#8B5CF6`), cyan (`#06B6D4`), green (`#10B981`), orange (`#F59E0B`), pink (`#EC4899`).
- Urbanist font family loaded via Google Fonts with weight range 100–900.
- Custom scrollbar styling for WebKit and Firefox browsers.
- Animation system: fade-in, slide-up, slide-down, pulse-slow, and skeleton shimmer keyframes.
- Tailwind CSS configuration with extended colors, spacing, shadows, and responsive breakpoints.

#### Page Screens
- `LoginPage` (Screen 0a) with email/password form and persona quick login grid.
- `SignupPage` (Screen 0b) with full registration form and password strength indicator.
- `OnboardingPage` (Screen 1) with persona selection cards, cluster previews, and role descriptions.
- `LukasFlowScreen` (Screens 2–6) for Project Manager operations flow.
- `ElenaFlowScreen` (Screens 7–10) for Finance Director commercial flow.
- `SophieFlowScreen` (Screens 11–14) for Site Engineer engineering flow.
- `JamesFlowScreen` (Screens 15–18) for Sales Executive pipeline flow.
- `FinalFlowScreen` (Screen 19) for cross-persona analytics with all intelligence clusters.
- `DemoSummaryScreen` (Screen 20) with session overview, persona journey timeline, and export.
- `NotFoundPage` for 404 catch-all with navigation back to home or dashboard.

#### Mock Data
- 4 predefined user accounts with persona assignments and hashed passwords.
- 4 source system indicators with live status, sync timestamps, and latency values.
- 6 intelligence cluster definitions with domain-specific KPIs and source mappings.
- 16 query-response mappings across all four personas.
- 18 CTA bubble definitions across 6 context categories.
- 7 action templates with required fields, role restrictions, and confirmation messages.
- Dashboard quick stats, suggested queries, and notification data per persona.

#### Testing
- Unit tests for `authService` covering login, signup, quickLogin, logout, session validation, and audit logging.
- Unit tests for `navigationService` covering navigation, screen config, persona flows, role-based access, and audit logging.
- Unit tests for `queryEngine` covering query execution, multi-system orchestration, follow-up queries, and result structure.
- Unit tests for `actionExecutor` covering all action types, system targeting, template execution, and access control.
- Integration tests for `LoginPage` covering form rendering, validation, persona quick login, error states, and navigation.
- Test setup with jsdom environment, `@testing-library/jest-dom` matchers, and localStorage mock.

#### Infrastructure
- Vite 5 build configuration with React plugin, path aliases, and dev server on port 3000.
- Vitest configuration with jsdom environment, global test utilities, and V8 coverage.
- ESLint configuration with React, React Hooks, and React Refresh plugins.
- PostCSS configuration with Tailwind CSS and Autoprefixer.
- Vercel deployment configuration with SPA rewrite rules.
- Environment variable support via `.env.example` with `VITE_APP_TITLE` and `VITE_APP_VERSION`.