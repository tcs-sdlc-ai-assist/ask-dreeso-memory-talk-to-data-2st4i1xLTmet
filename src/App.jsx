import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import router from './router.jsx';

/**
 * Root application component.
 * Wraps the entire app with AppContext (AuthContext + NavigationContext),
 * ErrorBoundary, and RouterProvider. Sets up the global layout structure
 * and design system provider.
 *
 * Note: AppProvider composes AuthProvider and NavigationProvider internally.
 * NavigationProvider requires a Router ancestor, so AppProvider is rendered
 * inside the RouterProvider via the router configuration.
 *
 * @returns {React.ReactElement} The root application component
 */
function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;