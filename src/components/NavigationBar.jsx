import { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../utils/helpers.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigation } from '../contexts/NavigationContext.jsx';
import { SCREEN_IDS } from '../utils/constants.js';

/**
 * Logo component for the navigation bar
 * @param {Object} props
 * @param {function} [props.onClick] - Click handler for logo
 * @returns {React.ReactElement}
 */
function AppLogo({ onClick }) {
  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={classNames(
        'flex items-center gap-2 cursor-pointer',
        'transition-all duration-300 ease-in-out',
        'hover:opacity-90'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label="Go to dashboard"
    >
      <div
        className={classNames(
          'flex items-center justify-center',
          'w-8 h-8 sm:w-9 sm:h-9',
          'rounded-lg',
          'bg-gradient-accent',
          'shadow-glass-sm'
        )}
      >
        <svg
          className="w-5 h-5 text-white"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="text-base sm:text-lg font-bold text-gradient-accent hidden xs:inline">
        Ask Dreeso
      </span>
    </div>
  );
}

AppLogo.propTypes = {
  onClick: PropTypes.func,
};

/**
 * Navigation link item configuration
 * @typedef {Object} NavLinkConfig
 * @property {number} screenId - Target screen ID
 * @property {string} label - Display label
 * @property {string} icon - Icon type identifier
 */

/**
 * Navigation links configuration for authenticated users
 * @type {Array<NavLinkConfig>}
 */
const NAV_LINKS = [
  { screenId: SCREEN_IDS.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
  { screenId: SCREEN_IDS.QUERY_INPUT, label: 'Query', icon: 'query' },
  { screenId: SCREEN_IDS.HISTORY, label: 'History', icon: 'history' },
  { screenId: SCREEN_IDS.NOTIFICATIONS, label: 'Alerts', icon: 'notifications' },
  { screenId: SCREEN_IDS.SETTINGS, label: 'Settings', icon: 'settings' },
];

/**
 * Navigation icon component
 * @param {Object} props
 * @param {string} props.icon - Icon type identifier
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function NavIcon({ icon, className }) {
  const baseClass = classNames('w-4 h-4 flex-shrink-0', className);

  switch (icon) {
    case 'dashboard':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      );
    case 'query':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      );
    case 'history':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    case 'notifications':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      );
    case 'settings':
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg className={baseClass} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
      );
  }
}

NavIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string,
};

/**
 * Desktop navigation link component
 * @param {Object} props
 * @param {Object} props.link - Navigation link configuration
 * @param {number} props.link.screenId - Target screen ID
 * @param {string} props.link.label - Display label
 * @param {string} props.link.icon - Icon type identifier
 * @param {boolean} props.isActive - Whether this link is currently active
 * @param {function} props.onClick - Click handler
 * @returns {React.ReactElement}
 */
function DesktopNavLink({ link, isActive, onClick }) {
  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick(link.screenId);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classNames(
        'flex items-center gap-2',
        'px-3 py-2',
        'rounded-lg',
        'text-sm font-medium',
        'transition-all duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
        isActive
          ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <NavIcon icon={link.icon} className={isActive ? 'text-accent-blue' : ''} />
      <span>{link.label}</span>
    </button>
  );
}

DesktopNavLink.propTypes = {
  link: PropTypes.shape({
    screenId: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

/**
 * Mobile navigation link component
 * @param {Object} props
 * @param {Object} props.link - Navigation link configuration
 * @param {number} props.link.screenId - Target screen ID
 * @param {string} props.link.label - Display label
 * @param {string} props.link.icon - Icon type identifier
 * @param {boolean} props.isActive - Whether this link is currently active
 * @param {function} props.onClick - Click handler
 * @returns {React.ReactElement}
 */
function MobileNavLink({ link, isActive, onClick }) {
  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick(link.screenId);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classNames(
        'flex items-center gap-3 w-full',
        'px-4 py-3',
        'rounded-xl',
        'text-sm font-medium',
        'transition-all duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
        isActive
          ? 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30'
          : 'text-slate-300 hover:text-slate-100 hover:bg-white/5 border border-transparent'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <NavIcon icon={link.icon} className={isActive ? 'text-accent-blue' : 'text-slate-400'} />
      <span>{link.label}</span>
    </button>
  );
}

MobileNavLink.propTypes = {
  link: PropTypes.shape({
    screenId: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

/**
 * Logout button component
 * @param {Object} props
 * @param {function} props.onClick - Click handler
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement}
 */
function LogoutButton({ onClick, className }) {
  const handleClick = () => {
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={classNames(
        'flex items-center gap-2',
        'px-3 py-2',
        'rounded-lg',
        'text-sm font-medium',
        'text-slate-400',
        'transition-all duration-300 ease-in-out',
        'hover:text-red-400 hover:bg-red-500/10',
        'focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-0',
        className
      )}
      aria-label="Log out"
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
          clipRule="evenodd"
        />
      </svg>
      <span>Logout</span>
    </button>
  );
}

LogoutButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

/**
 * Hamburger menu toggle button component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the mobile menu is open
 * @param {function} props.onToggle - Toggle handler
 * @returns {React.ReactElement}
 */
function HamburgerButton({ isOpen, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={classNames(
        'flex items-center justify-center',
        'w-9 h-9',
        'rounded-lg',
        'text-slate-400',
        'transition-all duration-300 ease-in-out',
        'hover:text-slate-200 hover:bg-white/5',
        'focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:ring-offset-0',
        'lg:hidden'
      )}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}

HamburgerButton.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

/**
 * Persona info display for the navigation bar
 * @param {Object} props
 * @param {string} props.persona - Persona identifier
 * @param {string} [props.role] - Persona role
 * @returns {React.ReactElement}
 */
function NavPersonaInfo({ persona, role }) {
  if (!persona) {
    return null;
  }

  const displayName = persona.charAt(0).toUpperCase() + persona.slice(1);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={classNames(
          'flex items-center justify-center',
          'w-7 h-7',
          'rounded-full',
          'bg-gradient-accent',
          'text-white text-xs font-bold',
          'flex-shrink-0'
        )}
        aria-hidden="true"
      >
        {displayName.charAt(0)}
      </div>
      <div className="min-w-0 hidden sm:block">
        <p className="text-xs font-medium text-slate-200 truncate">{displayName}</p>
        {role && (
          <p className="text-xs text-slate-500 truncate">{role}</p>
        )}
      </div>
    </div>
  );
}

NavPersonaInfo.propTypes = {
  persona: PropTypes.string,
  role: PropTypes.string,
};

/**
 * Primary navigation bar component with app logo, persona info, screen navigation
 * links, and logout button. Responsive: full nav on desktop, hamburger menu on
 * mobile/tablet. Uses glassmorphism styling per design system.
 *
 * @param {Object} props
 * @param {string} [props.className] - Additional class names for the wrapper
 * @returns {React.ReactElement|null} The navigation bar component or null if not authenticated
 */
export function NavigationBar({ className }) {
  const { isAuthenticated, persona, role, logout } = useAuth();
  const { currentScreen, navigateTo, goToDashboard } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  /**
   * Closes the mobile menu
   */
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  /**
   * Toggles the mobile menu open/closed
   */
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  /**
   * Handles navigation link click
   * @param {number} screenId - Target screen ID
   */
  const handleNavClick = useCallback((screenId) => {
    navigateTo(screenId);
    closeMobileMenu();
  }, [navigateTo, closeMobileMenu]);

  /**
   * Handles logo click - navigate to dashboard
   */
  const handleLogoClick = useCallback(() => {
    goToDashboard();
    closeMobileMenu();
  }, [goToDashboard, closeMobileMenu]);

  /**
   * Handles logout button click
   */
  const handleLogout = useCallback(() => {
    closeMobileMenu();
    logout();
  }, [logout, closeMobileMenu]);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  // Close mobile menu on screen resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav
      ref={mobileMenuRef}
      className={classNames(
        'w-full',
        'glass-card-sm',
        'border-b border-white/5',
        'sticky top-0 z-50',
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Desktop and mobile top bar */}
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <AppLogo onClick={handleLogoClick} />
          </div>

          {/* Center: Desktop navigation links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <DesktopNavLink
                key={link.screenId}
                link={link}
                isActive={currentScreen === link.screenId}
                onClick={handleNavClick}
              />
            ))}
          </div>

          {/* Right: Persona info, logout, hamburger */}
          <div className="flex items-center gap-3">
            <NavPersonaInfo persona={persona} role={role} />

            {/* Desktop logout */}
            <div className="hidden lg:block">
              <LogoutButton onClick={handleLogout} />
            </div>

            {/* Mobile hamburger */}
            <HamburgerButton
              isOpen={isMobileMenuOpen}
              onToggle={toggleMobileMenu}
            />
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div
          className={classNames(
            'lg:hidden',
            'border-t border-white/5',
            'px-4 py-3',
            'animate-slide-down',
            'bg-secondary-500/60',
            'backdrop-blur-xl'
          )}
        >
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <MobileNavLink
                key={link.screenId}
                link={link}
                isActive={currentScreen === link.screenId}
                onClick={handleNavClick}
              />
            ))}
          </div>

          {/* Mobile logout */}
          <div className="mt-3 pt-3 border-t border-white/5">
            <LogoutButton onClick={handleLogout} className="w-full justify-center" />
          </div>
        </div>
      )}
    </nav>
  );
}

NavigationBar.propTypes = {
  className: PropTypes.string,
};

export default NavigationBar;