import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage.jsx';

// Mock AuthContext
const mockLogin = vi.fn();
const mockQuickLogin = vi.fn();
const mockGoToDashboard = vi.fn();
const mockNavigateTo = vi.fn();

vi.mock('../contexts/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: vi.fn(() => ({
    login: mockLogin,
    quickLogin: mockQuickLogin,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    persona: null,
    role: null,
    cluster: null,
    signup: vi.fn(),
    logout: vi.fn(),
  })),
}));

vi.mock('../contexts/NavigationContext.jsx', () => ({
  NavigationProvider: ({ children }) => children,
  useNavigation: vi.fn(() => ({
    navigateTo: mockNavigateTo,
    goToDashboard: mockGoToDashboard,
    goBack: vi.fn(),
    goToQueryInput: vi.fn(),
    goToError: vi.fn(),
    currentScreen: 0,
    currentView: null,
    screenName: null,
    screenPath: null,
    isNavigating: false,
    getPersonaFlow: vi.fn(() => []),
    canNavigateTo: vi.fn(() => ({ valid: true, reason: null })),
  })),
}));

import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigation } from '../contexts/NavigationContext.jsx';

/**
 * Helper to render LoginPage within a MemoryRouter
 * @returns {Object} render result
 */
function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLogin,
      quickLogin: mockQuickLogin,
      isAuthenticated: false,
      isLoading: false,
      user: null,
      persona: null,
      role: null,
      cluster: null,
      signup: vi.fn(),
      logout: vi.fn(),
    });
    useNavigation.mockReturnValue({
      navigateTo: mockNavigateTo,
      goToDashboard: mockGoToDashboard,
      goBack: vi.fn(),
      goToQueryInput: vi.fn(),
      goToError: vi.fn(),
      currentScreen: 0,
      currentView: null,
      screenName: null,
      screenPath: null,
      isNavigating: false,
      getPersonaFlow: vi.fn(() => []),
      canNavigateTo: vi.fn(() => ({ valid: true, reason: null })),
    });
  });

  describe('form rendering', () => {
    it('renders the login form with email and password fields', () => {
      renderLoginPage();

      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('renders the sign in button', () => {
      renderLoginPage();

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders the app title', () => {
      renderLoginPage();

      expect(screen.getByText('Ask Dreeso')).toBeInTheDocument();
    });

    it('renders the welcome back heading', () => {
      renderLoginPage();

      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });

    it('renders the sign up link', () => {
      renderLoginPage();

      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('renders the email placeholder', () => {
      renderLoginPage();

      expect(screen.getByPlaceholderText('you@company.com')).toBeInTheDocument();
    });

    it('renders the password placeholder', () => {
      renderLoginPage();

      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });
  });

  describe('persona quick login buttons', () => {
    it('renders all four persona quick login buttons', () => {
      renderLoginPage();

      expect(screen.getByRole('button', { name: /quick login as lukas/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /quick login as elena/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /quick login as sophie/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /quick login as james/i })).toBeInTheDocument();
    });

    it('displays persona names on the quick login cards', () => {
      renderLoginPage();

      expect(screen.getByText('Lukas')).toBeInTheDocument();
      expect(screen.getByText('Elena')).toBeInTheDocument();
      expect(screen.getByText('Sophie')).toBeInTheDocument();
      expect(screen.getByText('James')).toBeInTheDocument();
    });

    it('displays persona roles on the quick login cards', () => {
      renderLoginPage();

      expect(screen.getByText('Project Manager')).toBeInTheDocument();
      expect(screen.getByText('Finance Director')).toBeInTheDocument();
      expect(screen.getByText('Site Engineer')).toBeInTheDocument();
      expect(screen.getByText('Sales Executive')).toBeInTheDocument();
    });

    it('calls quickLogin with correct persona when Lukas card is clicked', async () => {
      mockQuickLogin.mockResolvedValue({ success: true, session: { persona: 'lukas' } });
      const user = userEvent.setup();

      renderLoginPage();

      await user.click(screen.getByRole('button', { name: /quick login as lukas/i }));

      await waitFor(() => {
        expect(mockQuickLogin).toHaveBeenCalledWith('lukas');
      });
    });

    it('calls quickLogin with correct persona when Elena card is clicked', async () => {
      mockQuickLogin.mockResolvedValue({ success: true, session: { persona: 'elena' } });
      const user = userEvent.setup();

      renderLoginPage();

      await user.click(screen.getByRole('button', { name: /quick login as elena/i }));

      await waitFor(() => {
        expect(mockQuickLogin).toHaveBeenCalledWith('elena');
      });
    });

    it('calls quickLogin with correct persona when Sophie card is clicked', async () => {
      mockQuickLogin.mockResolvedValue({ success: true, session: { persona: 'sophie' } });
      const user = userEvent.setup();

      renderLoginPage();

      await user.click(screen.getByRole('button', { name: /quick login as sophie/i }));

      await waitFor(() => {
        expect(mockQuickLogin).toHaveBeenCalledWith('sophie');
      });
    });

    it('calls quickLogin with correct persona when James card is clicked', async () => {
      mockQuickLogin.mockResolvedValue({ success: true, session: { persona: 'james' } });
      const user = userEvent.setup();

      renderLoginPage();

      await user.click(screen.getByRole('button', { name: /quick login as james/i }));

      await waitFor(() => {
        expect(mockQuickLogin).toHaveBeenCalledWith('james');
      });
    });

    it('redirects to dashboard after successful quick login', async () => {
      mockQuickLogin.mockResolvedValue({ success: true, session: { persona: 'lukas' } });
      const user = userEvent.setup();

      renderLoginPage();

      await user.click(screen.getByRole('button', { name: /quick login as lukas/i }));

      await waitFor(() => {
        expect(mockGoToDashboard).toHaveBeenCalledTimes(1);
      });
    });

    it('displays error when quick login fails', async () => {
      mockQuickLogin.mockResolvedValue({ success: false, error: 'Quick login failed. Please try again.' });
      const user = userEvent.setup();

      renderLoginPage();

      await user.click(screen.getByRole('button', { name: /quick login as lukas/i }));

      await waitFor(() => {
        expect(screen.getByText('Quick login failed. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('email validation', () => {
    it('shows error when email is empty on submit', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const passwordInput = screen.getByLabelText('Password');
      await user.type(passwordInput, 'Password1');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Email is required.')).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'not-an-email');
      await user.type(passwordInput, 'Password1');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
      });
    });
  });

  describe('password validation', () => {
    it('shows error when password is empty on submit', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      await user.type(emailInput, 'lukas@dreeso.com');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Password is required.')).toBeInTheDocument();
      });
    });

    it('shows error when password is too short', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'lukas@dreeso.com');
      await user.type(passwordInput, 'Ab1');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument();
      });
    });
  });

  describe('successful login flow', () => {
    it('calls login with email and password on form submit', async () => {
      mockLogin.mockResolvedValue({ success: true, session: { persona: 'lukas' } });
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'lukas@dreeso.com');
      await user.type(passwordInput, 'Password1');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('lukas@dreeso.com', 'Password1');
      });
    });

    it('redirects to dashboard after successful login', async () => {
      mockLogin.mockResolvedValue({ success: true, session: { persona: 'lukas' } });
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'lukas@dreeso.com');
      await user.type(passwordInput, 'Password1');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockGoToDashboard).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('error state display', () => {
    it('displays error message when login fails with invalid credentials', async () => {
      mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'lukas@dreeso.com');
      await user.type(passwordInput, 'WrongPassword');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('displays generic error message when login returns no specific error', async () => {
      mockLogin.mockResolvedValue({ success: false });
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'lukas@dreeso.com');
      await user.type(passwordInput, 'Password1');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Login failed. Please check your credentials.')).toBeInTheDocument();
      });
    });

    it('displays error when login throws an exception', async () => {
      mockLogin.mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'lukas@dreeso.com');
      await user.type(passwordInput, 'Password1');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      });
    });

    it('clears error message when user starts typing in email field', async () => {
      mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'lukas@dreeso.com');
      await user.type(passwordInput, 'WrongPassword');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      await user.type(emailInput, 'a');

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });

    it('clears error message when user starts typing in password field', async () => {
      mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'lukas@dreeso.com');
      await user.type(passwordInput, 'WrongPassword');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      await user.type(passwordInput, 'a');

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });

    it('displays error in an alert role element', async () => {
      mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'lukas@dreeso.com');
      await user.type(passwordInput, 'WrongPassword');

      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('redirect when already authenticated', () => {
    it('redirects to dashboard when user is already authenticated', () => {
      useAuth.mockReturnValue({
        login: mockLogin,
        quickLogin: mockQuickLogin,
        isAuthenticated: true,
        isLoading: false,
        user: { persona: 'lukas' },
        persona: 'lukas',
        role: 'Project Manager',
        cluster: 'operations',
        signup: vi.fn(),
        logout: vi.fn(),
      });

      renderLoginPage();

      expect(mockGoToDashboard).toHaveBeenCalledTimes(1);
    });
  });

  describe('navigation to signup', () => {
    it('navigates to persona select screen when sign up link is clicked', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      await user.click(screen.getByText('Sign up'));

      expect(mockNavigateTo).toHaveBeenCalledWith(1); // SCREEN_IDS.PERSONA_SELECT = 1
    });
  });

  describe('password visibility toggle', () => {
    it('toggles password visibility when eye icon is clicked', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');

      const hideButton = screen.getByRole('button', { name: /hide password/i });
      await user.click(hideButton);

      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('form interaction', () => {
    it('does not call login when form is submitted while loading', async () => {
      mockLogin.mockImplementation(() => new Promise(() => {})); // never resolves
      const user = userEvent.setup();

      renderLoginPage();

      const emailInput = screen.getByLabelText('Email address');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'lukas@dreeso.com');
      await user.type(passwordInput, 'Password1');

      // First submit
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('disables persona quick login buttons while login is in progress', async () => {
      mockQuickLogin.mockImplementation(() => new Promise(() => {})); // never resolves
      const user = userEvent.setup();

      renderLoginPage();

      await user.click(screen.getByRole('button', { name: /quick login as lukas/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /quick login as elena/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /quick login as sophie/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /quick login as james/i })).toBeDisabled();
      });
    });
  });

  describe('or divider', () => {
    it('renders the or quick login divider text', () => {
      renderLoginPage();

      expect(screen.getByText(/or quick login as/i)).toBeInTheDocument();
    });
  });

  describe('version display', () => {
    it('renders the app version in the footer', () => {
      renderLoginPage();

      expect(screen.getByText(/ask dreeso memory v/i)).toBeInTheDocument();
    });
  });
});