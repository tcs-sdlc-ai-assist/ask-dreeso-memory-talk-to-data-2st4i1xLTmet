# Ask Dreeso Memory

Enterprise Intelligence Platform — a React 18 single-page application that simulates a natural language query interface across four enterprise personas (Project Manager, Finance Director, Site Engineer, Sales Executive). Each persona accesses tailored dashboards, analytics, and actionable insights powered by mock data from SAP, Procore, Salesforce, and Oracle Primavera.

## Tech Stack

- **React 18** — UI framework with hooks, context providers, and lazy-loaded routes
- **Vite 5** — Build tool and dev server with HMR
- **Tailwind CSS 3** — Utility-first styling with custom dark theme and glassmorphism design system
- **React Router v6** — Client-side routing with `createBrowserRouter` and protected routes
- **localStorage** — Client-side persistence for sessions, query results, action logs, and audit trail
- **Vitest** — Unit and integration testing with jsdom environment
- **ESLint** — Code quality with React, React Hooks, and React Refresh plugins

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
npm install
```

### Environment Variables

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env
```

Available variables:

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_TITLE` | `Ask Dreeso Memory` | Application title displayed in the browser tab and UI |
| `VITE_APP_VERSION` | `1.0.0` | Application version used for display and cache-busting |

Environment variables are accessed via `import.meta.env.VITE_*` throughout the application.

### Development

```bash
npm run dev
```

Starts the Vite dev server on [http://localhost:3000](http://localhost:3000) with hot module replacement.

### Build

```bash
npm run build
```

Produces an optimized production build in the `dist/` directory.

### Preview

```bash
npm run preview
```

Serves the production build locally for verification before deployment.

### Lint

```bash
npm run lint
```

Runs ESLint across all `.js` and `.jsx` files with zero-warning enforcement.

### Test

```bash
npm run test
```

Runs the Vitest test suite with jsdom environment and `@testing-library/jest-dom` matchers.

## Folder Structure

```
ask-dreeso-memory/
├── public/
│   └── vite.svg
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ActionButton.jsx
│   │   ├── ActionConfirmation.jsx
│   │   ├── CTABubble.jsx
│   │   ├── DataTable.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── ForecastChart.jsx
│   │   ├── GlassCard.jsx
│   │   ├── IntelligenceClusterCard.jsx
│   │   ├── NavigationBar.jsx
│   │   ├── PersonaBar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── QueryInput.jsx
│   │   ├── ResponsiveLayout.jsx
│   │   ├── RiskSignal.jsx
│   │   ├── SkeletonLoader.jsx
│   │   ├── SourceIndicator.jsx
│   │   └── StructuredOutput.jsx
│   ├── contexts/            # React context providers
│   │   ├── AppContext.jsx
│   │   ├── AuthContext.jsx
│   │   └── NavigationContext.jsx
│   ├── data/                # Mock data repository
│   │   └── mockData.js
│   ├── pages/               # Page-level screen components
│   │   ├── DemoSummaryScreen.jsx
│   │   ├── ElenaFlowScreen.jsx
│   │   ├── FinalFlowScreen.jsx
│   │   ├── JamesFlowScreen.jsx
│   │   ├── LoginPage.jsx
│   │   ├── LukasFlowScreen.jsx
│   │   ├── NotFoundPage.jsx
│   │   ├── OnboardingPage.jsx
│   │   ├── SignupPage.jsx
│   │   └── SophieFlowScreen.jsx
│   ├── services/            # Business logic and data services
│   │   ├── actionExecutor.js
│   │   ├── auditLogService.js
│   │   ├── authService.js
│   │   ├── ctaEngine.js
│   │   ├── localStorageService.js
│   │   ├── navigationService.js
│   │   ├── queryEngine.js
│   │   └── sourceTransparencyService.js
│   ├── test/                # Test setup and utilities
│   │   └── setup.js
│   ├── utils/               # Shared utilities and constants
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx              # Root application component
│   ├── index.css            # Global styles and Tailwind directives
│   ├── main.jsx             # Application entry point
│   └── router.jsx           # React Router configuration
├── .env.example
├── .gitignore
├── CHANGELOG.md
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
├── vite.config.js
└── vitest.config.js
```

## Architecture

### Screen Navigation (Screens 0–20)

The application implements a 21-screen navigation system with full configuration metadata:

| Screen ID | Name | Path | Auth Required |
|---|---|---|---|
| 0 | Splash / Login | `/` | No |
| 1 | Persona Select / Onboarding | `/persona` | No |
| 2 | Dashboard | `/dashboard` | Yes |
| 3 | Query Input | `/query` | Yes |
| 4 | Loading | `/loading` | Yes |
| 5 | Result Overview | `/results` | Yes |
| 6 | Result Detail | `/results/detail` | Yes |
| 7–8 | CTA Interactions | `/cta` | Yes |
| 9–10 | Action Confirm / Execute | `/action/*` | Yes |
| 11 | Confirmation | `/confirmation` | Yes |
| 12 | History | `/history` | Yes |
| 13 | Settings | `/settings` | Yes |
| 14 | Help | `/help` | Yes |
| 15 | Notifications | `/notifications` | Yes |
| 16 | Profile | `/profile` | Yes |
| 17 | Data Source | `/data-source` | Yes |
| 18 | Export | `/export` | Yes |
| 19 | Feedback | `/feedback` | Yes |
| 20 | Error | `/error` | No |

### Persona Flows

Each persona has a dedicated flow screen component with persona-specific dashboards, query responses, and available actions:

| Persona | Role | Cluster | Flow Screens | Route |
|---|---|---|---|---|
| **Lukas** | Project Manager | Operations | 2–6 | `/lukas` |
| **Elena** | Finance Director | Finance | 7–10 | `/elena` |
| **Sophie** | Site Engineer | Engineering | 11–14 | `/sophie` |
| **James** | Sales Executive | Sales | 15–18 | `/james` |

Additional shared screens:

- **Screen 19** — Cross-persona analytics (`/final`)
- **Screen 20** — Demo session summary (`/summary`)

### View States

Each persona flow screen supports six view states:

1. **QUERY_INPUT** — Dashboard with query input and intelligence clusters
2. **LOADING** — Animated loading state with skeleton loaders
3. **RESULT** — Structured output with data tables, KPI grids, charts, or risk signals
4. **CTA_INTERACTION** — Follow-up suggestion bubbles
5. **ACTION_EXECUTION** — Enterprise action execution with confirmation dialog
6. **CONFIRMATION** — Action completion confirmation

### Authentication

- Email/password login with SHA-256 hashed credential validation
- Persona quick login for four predefined personas
- Session management with 2-hour expiration stored in localStorage
- Role-to-cluster mapping for access control (operations, finance, engineering, sales)

### Talk-to-Data Query Engine

- Natural language query interpretation matching against predefined keyword patterns
- 16 query-response mappings across all four personas (4 per persona)
- Structured output types: `table`, `kpi`, `forecast`, `risk`, `error`
- Multi-system data orchestration mapping queries to SAP, Procore, Salesforce, and Primavera
- Simulated async execution delay (1.2–3.0s for queries, 0.5–1.2s for follow-ups)
- Query result persistence to localStorage with automatic pruning at 100 entries

### Intelligence Clusters

Six intelligence cluster domains with persona-specific mappings:

- **Operations** — Project delivery, scheduling, resource allocation
- **Finance** — Revenue tracking, cost management, budget forecasting
- **Engineering** — Quality metrics, safety compliance, RFI management
- **Sales** — Pipeline management, win rates, client engagement
- **Risk** — Cross-project risk identification and mitigation
- **Portfolio** — Cross-portfolio performance and strategic alignment

### Action Execution Layer

- Simulated enterprise action execution across SAP, Procore, Salesforce, and Primavera
- Six action types: APPROVE, REJECT, ESCALATE, ASSIGN, UPDATE, CREATE
- Seven predefined action templates with role-based access control
- Confirmation flow with glassmorphism modal dialog

### Audit Logging

- Centralized audit log capturing 100% of user actions with timestamped entries
- 16 action types covering login, navigation, queries, actions, CTA clicks, and more
- Automatic log rotation at 1,000 entries
- Export capability producing serializable JSON

### Source Transparency

- Data provenance indicators for all four enterprise systems
- Three source status types: live (green), cached (yellow), offline (red)
- Confidence scoring based on source latency

### Design System

- Dark theme with primary background `#0A1A2F` and secondary `#1E2A44`
- Gradient mesh background with blue, purple, and cyan radial gradients
- Glassmorphism card system with backdrop-blur and semi-transparent backgrounds
- Accent color palette: blue, purple, cyan, green, orange, pink
- Urbanist font family via Google Fonts
- Custom scrollbar styling for WebKit and Firefox
- Animation system: fade-in, slide-up, slide-down, pulse-slow, skeleton shimmer

## Mock Data

All data is simulated client-side with no external API dependencies:

- 4 predefined user accounts with persona assignments
- 4 source system indicators with live status and latency values
- 6 intelligence cluster definitions with domain-specific KPIs
- 16 query-response mappings across all four personas
- 18 CTA bubble definitions across 6 context categories
- 7 action templates with required fields and role restrictions
- Dashboard quick stats, suggested queries, and notifications per persona

## Testing

The project includes unit and integration tests:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npx vitest --watch

# Run tests with coverage
npx vitest --coverage
```

Test coverage includes:

- **authService** — Login, signup, quickLogin, logout, session validation, audit logging
- **navigationService** — Navigation, screen config, persona flows, role-based access, audit logging
- **queryEngine** — Query execution, multi-system orchestration, follow-up queries, result structure
- **actionExecutor** — All action types, system targeting, template execution, access control
- **LoginPage** — Form rendering, validation, persona quick login, error states, navigation

## Deployment

### Vercel

The project includes a `vercel.json` configuration with SPA rewrite rules. Deploy directly from the repository:

1. Connect the repository to Vercel
2. Set the framework preset to **Vite**
3. Set the build command to `npm run build`
4. Set the output directory to `dist`
5. Add environment variables (`VITE_APP_TITLE`, `VITE_APP_VERSION`) in the Vercel dashboard

All routes are rewritten to `/index.html` for client-side routing support.

### Manual Deployment

```bash
npm run build
```

Serve the contents of the `dist/` directory with any static file server. Ensure all routes fall back to `index.html` for SPA routing.

## License

Private