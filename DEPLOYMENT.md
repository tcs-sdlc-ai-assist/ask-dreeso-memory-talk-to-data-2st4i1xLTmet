# Deployment Guide

This document covers deployment procedures for the **Ask Dreeso Memory** application, including Vercel deployment, build validation, environment configuration, and CI/CD integration.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build Configuration](#build-configuration)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [SPA Rewrite Configuration](#spa-rewrite-configuration)
- [Build Validation Checklist](#build-validation-checklist)
- [CI/CD with GitHub + Vercel](#cicd-with-github--vercel)
- [Manual Deployment](#manual-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 18+ and **npm** 9+
- A [Vercel](https://vercel.com) account (free tier is sufficient)
- A GitHub repository connected to Vercel (for automatic deployments)

---

## Build Configuration

The project uses **Vite 5** as the build tool. The build configuration is defined in `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

| Setting | Value | Description |
|---|---|---|
| Build command | `npm run build` | Runs `vite build` to produce optimized output |
| Output directory | `dist/` | Contains the production-ready static files |
| Dev server port | `3000` | Local development server port |
| Framework | Vite | Detected automatically by Vercel |

---

## Environment Variables

Environment variables are accessed via `import.meta.env.VITE_*` throughout the application. Only variables prefixed with `VITE_` are exposed to the client-side bundle.

### Available Variables

| Variable | Default | Required | Description |
|---|---|---|---|
| `VITE_APP_TITLE` | `Ask Dreeso Memory` | No | Application title displayed in the browser tab and UI |
| `VITE_APP_VERSION` | `1.0.0` | No | Application version used for display and cache-busting |

### Local Development

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` as needed. The `.env` file is excluded from version control via `.gitignore`.

### Vercel Environment Variables

Set environment variables in the Vercel dashboard:

1. Navigate to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings** → **Environment Variables**
3. Add each variable with the appropriate scope:
   - **Production** — applied to production deployments
   - **Preview** — applied to preview/branch deployments
   - **Development** — applied when using `vercel dev`

| Variable | Value | Scope |
|---|---|---|
| `VITE_APP_TITLE` | `Ask Dreeso Memory` | Production, Preview |
| `VITE_APP_VERSION` | `1.0.0` | Production, Preview |

> **Note:** Environment variables set in the Vercel dashboard override any `.env` files in the repository. Vercel injects them at build time.

---

## Vercel Deployment

### Initial Setup

1. **Import the repository** into Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select **Import Git Repository**
   - Choose the `ask-dreeso-memory` repository from GitHub

2. **Configure the project settings**:

   | Setting | Value |
   |---|---|
   | Framework Preset | **Vite** |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |
   | Node.js Version | 18.x |

3. **Add environment variables** (see [Environment Variables](#environment-variables) above)

4. Click **Deploy** to trigger the first deployment

### Deployment Flow

Every deployment follows this sequence:

```
npm install → npm run build → dist/ uploaded to Vercel CDN
```

Vercel automatically:
- Installs dependencies from `package.json`
- Runs the build command (`vite build`)
- Deploys the contents of `dist/` to the global CDN
- Applies SPA rewrite rules from `vercel.json`
- Assigns a unique deployment URL (e.g., `ask-dreeso-memory-abc123.vercel.app`)

### Production Domain

After the first deployment, configure a custom domain:

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow the DNS configuration instructions provided by Vercel

---

## SPA Rewrite Configuration

The application uses client-side routing via React Router v6. All routes must fall back to `index.html` for the SPA to handle navigation correctly.

The `vercel.json` file at the project root configures this:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures that:
- Direct URL access to any route (e.g., `/lukas`, `/elena`, `/summary`) serves `index.html`
- Browser refresh on any route works correctly
- React Router handles all client-side routing after the initial page load
- 404 handling is managed by the `NotFoundPage` component via the `*` catch-all route

### Route Overview

| Route | Component | Auth Required |
|---|---|---|
| `/` | `LoginPage` | No |
| `/signup` | `SignupPage` | No |
| `/persona` | `OnboardingPage` | No |
| `/onboarding` | `OnboardingPage` | No |
| `/dashboard` | `LukasFlowScreen` | Yes |
| `/lukas` | `LukasFlowScreen` | Yes (operations) |
| `/elena` | `ElenaFlowScreen` | Yes (finance) |
| `/sophie` | `SophieFlowScreen` | Yes (engineering) |
| `/james` | `JamesFlowScreen` | Yes (sales) |
| `/final` | `FinalFlowScreen` | Yes |
| `/summary` | `DemoSummaryScreen` | Yes |
| `/history` | `DemoSummaryScreen` | Yes |
| `/settings` | `DemoSummaryScreen` | Yes |
| `/notifications` | `DemoSummaryScreen` | Yes |
| `/error` | `NotFoundPage` | No |
| `*` | `NotFoundPage` | No |

---

## Build Validation Checklist

Before deploying, run through this checklist locally to ensure the build is clean:

### 1. Clean Install

```bash
rm -rf node_modules
npm install
```

Verify that `npm install` completes without errors or peer dependency warnings.

### 2. Lint Check

```bash
npm run lint
```

Ensure zero warnings and zero errors. The lint configuration enforces `--max-warnings 0`.

### 3. Run Tests

```bash
npm run test
```

All unit and integration tests must pass:
- `authService.test.js` — Login, signup, quickLogin, logout, session validation
- `navigationService.test.js` — Navigation, screen config, persona flows, role-based access
- `queryEngine.test.js` — Query execution, multi-system orchestration, follow-up queries
- `actionExecutor.test.js` — All action types, system targeting, template execution
- `LoginPage.test.jsx` — Form rendering, validation, persona quick login, error states

### 4. Production Build

```bash
npm run build
```

Verify that:
- The build completes without errors
- The `dist/` directory is created
- `dist/index.html` exists
- `dist/assets/` contains JS and CSS bundles

### 5. Preview the Build

```bash
npm run preview
```

Open [http://localhost:4173](http://localhost:4173) and verify:
- The login page renders correctly
- Persona quick login works
- Navigation between screens functions
- The gradient mesh background and glassmorphism cards display properly
- The Urbanist font loads from Google Fonts

### 6. Verify dist/ Contents

```bash
ls -la dist/
ls -la dist/assets/
```

Expected structure:

```
dist/
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
├── vite.svg
└── index.html
```

### Quick Validation Script

Run all checks in sequence:

```bash
rm -rf node_modules dist
npm install
npm run lint
npm run test
npm run build
ls dist/index.html && echo "✅ Build validated successfully" || echo "❌ Build validation failed"
```

---

## CI/CD with GitHub + Vercel

### Automatic Deployments

When the GitHub repository is connected to Vercel, deployments are triggered automatically:

| Trigger | Deployment Type | URL |
|---|---|---|
| Push to `main` branch | **Production** | Custom domain / `project.vercel.app` |
| Push to any other branch | **Preview** | `project-branch-hash.vercel.app` |
| Pull request opened/updated | **Preview** | Linked to the PR with status checks |

### GitHub Integration Setup

1. Connect the repository in the Vercel dashboard (done during initial setup)
2. Vercel automatically installs a GitHub App for webhook integration
3. Each push triggers a new deployment
4. PR comments include deployment preview URLs

### Branch Protection (Recommended)

Configure branch protection rules on `main`:

1. Go to GitHub → **Settings** → **Branches** → **Branch protection rules**
2. Add rule for `main`:
   - ✅ Require status checks to pass before merging
   - ✅ Require the **Vercel** deployment check to pass
   - ✅ Require branches to be up to date before merging

### Build Caching

Vercel caches `node_modules` between deployments. To force a clean install:

1. Go to **Settings** → **General** → **Build & Development Settings**
2. Override the install command with: `npm ci`

Using `npm ci` ensures a clean, reproducible install from `package-lock.json` on every deployment.

### Deployment Notifications

Configure notifications in the Vercel dashboard:

1. Go to **Settings** → **Notifications**
2. Add Slack, email, or webhook integrations for:
   - Deployment succeeded
   - Deployment failed
   - Domain configuration changes

### Environment Variable Management per Branch

For different configurations between staging and production:

| Variable | Production | Preview |
|---|---|---|
| `VITE_APP_TITLE` | `Ask Dreeso Memory` | `Ask Dreeso Memory (Preview)` |
| `VITE_APP_VERSION` | `1.0.0` | `1.0.0-preview` |

Set these in the Vercel dashboard with the appropriate scope (Production vs Preview).

---

## Manual Deployment

For deployments without Vercel or for self-hosted environments:

### 1. Build the Application

```bash
npm install
npm run build
```

### 2. Serve the dist/ Directory

Use any static file server. The key requirement is that **all routes must fall back to `index.html`** for SPA routing to work.

#### Using `serve` (npm package)

```bash
npx serve dist -s -l 3000
```

The `-s` flag enables SPA mode (rewrites all routes to `index.html`).

#### Using Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Using Apache (.htaccess)

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

#### Using Docker

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Troubleshooting

### Build Fails with "Module not found"

Ensure all dependencies are listed in `package.json`. Run:

```bash
rm -rf node_modules
npm install
npm run build
```

### Blank Page After Deployment

1. Check that `vercel.json` contains the SPA rewrite rule
2. Verify the output directory is set to `dist` in Vercel settings
3. Open browser DevTools → Console for JavaScript errors
4. Ensure the `index.html` references the correct asset paths

### Fonts Not Loading

The Urbanist font is loaded from Google Fonts via the `<link>` tag in `index.html`. Ensure:
- The CDN is not blocked by a Content Security Policy
- The `<link rel="preconnect">` tags are present in `index.html`

### Environment Variables Not Available

- Variables must be prefixed with `VITE_` to be exposed to the client bundle
- Variables are injected at **build time**, not runtime
- After changing environment variables in Vercel, trigger a **new deployment** (redeploy)
- Verify with: `console.log(import.meta.env.VITE_APP_TITLE)` in the browser console

### localStorage Quota Exceeded

The application uses localStorage for session management, query results, action logs, and audit trails. If the quota is exceeded:
- The `localStorageService` automatically prunes old entries (100 query results, 1000 action logs, 1000 audit entries)
- Users can reset session data from the Demo Summary screen (`/summary`)
- Clear localStorage manually via browser DevTools → Application → Local Storage

### Preview Deployments Show Stale Data

Preview deployments share the same localStorage namespace in the browser. To isolate:
- Use incognito/private browsing for preview deployments
- Clear localStorage between testing different deployments