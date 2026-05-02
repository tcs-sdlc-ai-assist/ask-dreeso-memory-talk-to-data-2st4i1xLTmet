import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { ResponsiveLayout } from './components/ResponsiveLayout.jsx';
import { NavigationBar } from './components/NavigationBar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AppProvider } from './contexts/AppContext.jsx';

/**
 * Lazy-loaded page components for code splitting
 */
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const SignupPage = lazy(() => import('./pages/SignupPage.jsx'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage.jsx'));
const LukasFlowScreen = lazy(() => import('./pages/LukasFlowScreen.jsx'));
const ElenaFlowScreen = lazy(() => import('./pages/ElenaFlowScreen.jsx'));
const SophieFlowScreen = lazy(() => import('./pages/SophieFlowScreen.jsx'));
const JamesFlowScreen = lazy(() => import('./pages/JamesFlowScreen.jsx'));
const FinalFlowScreen = lazy(() => import('./pages/FinalFlowScreen.jsx'));
const DemoSummaryScreen = lazy(() => import('./pages/DemoSummaryScreen.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

/**
 * Loading fallback component displayed while lazy-loaded pages are being fetched
 * @returns {React.ReactElement}
 */
function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-mesh">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent shadow-glow">
          <svg
            className="w-8 h-8 text-white animate-spin"
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
        </div>
        <p className="text-sm text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Wraps a lazy-loaded component with Suspense and ErrorBoundary
 * @param {React.ReactNode} component - The lazy-loaded component element
 * @returns {React.ReactElement}
 */
function withSuspense(component) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoadingFallback />}>
        {component}
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Layout wrapper for authenticated pages with NavigationBar
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement}
 */
function AuthenticatedLayout({ children }) {
  return (
    <ResponsiveLayout>
      <NavigationBar />
      <main className="flex-1 py-2 sm:py-4">
        {children}
      </main>
    </ResponsiveLayout>
  );
}

/**
 * Layout wrapper for public pages (no NavigationBar)
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement}
 */
function PublicLayout({ children }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoadingFallback />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Root layout that mounts global application providers once for all routes.
 * Ensures hooks like useAuth/useNavigation are always used within context.
 * @returns {React.ReactElement}
 */
function ProviderLayout() {
  return (
    <AppProvider>
      <Outlet />
    </AppProvider>
  );
}

/**
 * React Router configuration with all application routes.
 * Public routes: /, /signup, /onboarding
 * Protected persona routes: /lukas/:screenId, /elena/:screenId, /sophie/:screenId, /james/:screenId
 * Protected shared routes: /final, /summary
 * Catch-all: * (404)
 *
 * @type {import('react-router-dom').Router}
 */
const router = createBrowserRouter([
  {
    element: <ProviderLayout />,
    children: [
      // Public routes
      {
        path: '/',
        element: <PublicLayout><LoginPage /></PublicLayout>,
      },
      {
        path: '/signup',
        element: <PublicLayout><SignupPage /></PublicLayout>,
      },
      {
        path: '/onboarding',
        element: <PublicLayout><OnboardingPage /></PublicLayout>,
      },
      {
        path: '/persona',
        element: <PublicLayout><OnboardingPage /></PublicLayout>,
      },

  // Lukas persona routes
      {
        path: '/lukas',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute requiredRoles={['operations']}>
              {withSuspense(<LukasFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },
      {
        path: '/lukas/:screenId',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute requiredRoles={['operations']}>
              {withSuspense(<LukasFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // Elena persona routes
      {
        path: '/elena',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute requiredRoles={['finance']}>
              {withSuspense(<ElenaFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },
      {
        path: '/elena/:screenId',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute requiredRoles={['finance']}>
              {withSuspense(<ElenaFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // Sophie persona routes
      {
        path: '/sophie',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute requiredRoles={['engineering']}>
              {withSuspense(<SophieFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },
      {
        path: '/sophie/:screenId',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute requiredRoles={['engineering']}>
              {withSuspense(<SophieFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // James persona routes
      {
        path: '/james',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute requiredRoles={['sales']}>
              {withSuspense(<JamesFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },
      {
        path: '/james/:screenId',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute requiredRoles={['sales']}>
              {withSuspense(<JamesFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // Cross-persona final analytics route
      {
        path: '/final',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute>
              {withSuspense(<FinalFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // Demo summary route
      {
        path: '/summary',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute>
              {withSuspense(<DemoSummaryScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // Dashboard route (generic authenticated landing)
      {
        path: '/dashboard',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute>
              {withSuspense(<LukasFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // Query route
      {
        path: '/query',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute>
              {withSuspense(<LukasFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // Results routes
      {
        path: '/results',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute>
              {withSuspense(<LukasFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },
      {
        path: '/results/detail',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute>
              {withSuspense(<LukasFlowScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // History route
      {
        path: '/history',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute>
              {withSuspense(<DemoSummaryScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // Settings route
      {
        path: '/settings',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute>
              {withSuspense(<DemoSummaryScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // Notifications route
      {
        path: '/notifications',
        element: (
          <AuthenticatedLayout>
            <ProtectedRoute>
              {withSuspense(<DemoSummaryScreen />)}
            </ProtectedRoute>
          </AuthenticatedLayout>
        ),
      },

  // Error route
      {
        path: '/error',
        element: <PublicLayout><NotFoundPage /></PublicLayout>,
      },

  // 404 catch-all
      {
        path: '*',
        element: <PublicLayout><NotFoundPage /></PublicLayout>,
      },
    ],
  },
]);

export default router;