import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { classNames, getDeviceType } from '../utils/helpers.js';
import { BREAKPOINTS } from '../utils/constants.js';

/**
 * @typedef {Object} ResponsiveContextValue
 * @property {'mobile'|'tablet'|'desktop'|'large-desktop'} deviceType - Current device type
 * @property {number} columns - Number of grid columns for the current device
 * @property {boolean} isMobile - Whether the current device is mobile
 * @property {boolean} isTablet - Whether the current device is tablet
 * @property {boolean} isDesktop - Whether the current device is desktop or large-desktop
 * @property {number} windowWidth - Current window width in pixels
 * @property {number} windowHeight - Current window height in pixels
 */

const ResponsiveContext = createContext(null);

/**
 * Column count mappings per device type
 * @type {Object<string, number>}
 */
const DEVICE_COLUMNS = {
  mobile: 4,
  tablet: 8,
  desktop: 12,
  'large-desktop': 12,
};

/**
 * Resolves the number of grid columns for a given device type
 * @param {'mobile'|'tablet'|'desktop'|'large-desktop'} deviceType - The device type
 * @returns {number} The number of grid columns
 */
function getColumnsForDevice(deviceType) {
  return DEVICE_COLUMNS[deviceType] || 12;
}

/**
 * Gets the current window dimensions safely
 * @returns {{ width: number, height: number }} The window dimensions
 */
function getWindowDimensions() {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Responsive layout wrapper component implementing a 12-column grid system.
 * Detects device type (desktop/tablet/mobile) and provides layout context
 * to all children via the ResponsiveContext. Includes responsive padding,
 * max-width constraints, and grid utilities per breakpoint.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.className] - Additional class names for the outer wrapper
 * @param {boolean} [props.fullWidth=false] - Whether to use full width without max-width constraint
 * @param {boolean} [props.noPadding=false] - Whether to remove default horizontal padding
 * @returns {React.ReactElement} The responsive layout wrapper component
 */
export function ResponsiveLayout({ children, className, fullWidth = false, noPadding = false }) {
  const [deviceType, setDeviceType] = useState(() => getDeviceType());
  const [windowDimensions, setWindowDimensions] = useState(() => getWindowDimensions());

  /**
   * Updates device type and window dimensions on resize
   */
  const handleResize = useCallback(() => {
    const newDeviceType = getDeviceType();
    const newDimensions = getWindowDimensions();

    setDeviceType(newDeviceType);
    setWindowDimensions(newDimensions);
  }, []);

  // Listen for window resize events
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Use a simple throttle to avoid excessive re-renders
    let rafId = null;
    const throttledResize = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        handleResize();
        rafId = null;
      });
    };

    window.addEventListener('resize', throttledResize);

    // Initial sync
    handleResize();

    return () => {
      window.removeEventListener('resize', throttledResize);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [handleResize]);

  const columns = getColumnsForDevice(deviceType);
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop' || deviceType === 'large-desktop';

  const contextValue = useMemo(() => ({
    deviceType,
    columns,
    isMobile,
    isTablet,
    isDesktop,
    windowWidth: windowDimensions.width,
    windowHeight: windowDimensions.height,
  }), [deviceType, columns, isMobile, isTablet, isDesktop, windowDimensions.width, windowDimensions.height]);

  return (
    <ResponsiveContext.Provider value={contextValue}>
      <div
        className={classNames(
          'w-full min-h-screen',
          'bg-gradient-mesh',
          'flex flex-col',
          'transition-all duration-300 ease-in-out'
        )}
      >
        <div
          className={classNames(
            'w-full flex-1',
            'flex flex-col',
            !fullWidth && 'mx-auto max-w-[1920px]',
            !noPadding && 'px-4 sm:px-6 lg:px-8 xl:px-10',
            className
          )}
        >
          {children}
        </div>
      </div>
    </ResponsiveContext.Provider>
  );
}

ResponsiveLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  noPadding: PropTypes.bool,
};

/**
 * Custom hook for consuming the ResponsiveContext.
 * Provides device type detection, column count, and boolean device flags.
 * Can be used outside of ResponsiveLayout — falls back to window-based detection.
 *
 * @returns {ResponsiveContextValue} The responsive context value
 */
export function useResponsive() {
  const context = useContext(ResponsiveContext);

  // If used outside of ResponsiveLayout, provide a fallback based on window detection
  const [fallback, setFallback] = useState(() => {
    if (context !== null) {
      return null;
    }
    const dt = getDeviceType();
    const dims = getWindowDimensions();
    return {
      deviceType: dt,
      columns: getColumnsForDevice(dt),
      isMobile: dt === 'mobile',
      isTablet: dt === 'tablet',
      isDesktop: dt === 'desktop' || dt === 'large-desktop',
      windowWidth: dims.width,
      windowHeight: dims.height,
    };
  });

  useEffect(() => {
    if (context !== null) {
      return;
    }

    const handleResize = () => {
      const dt = getDeviceType();
      const dims = getWindowDimensions();
      setFallback({
        deviceType: dt,
        columns: getColumnsForDevice(dt),
        isMobile: dt === 'mobile',
        isTablet: dt === 'tablet',
        isDesktop: dt === 'desktop' || dt === 'large-desktop',
        windowWidth: dims.width,
        windowHeight: dims.height,
      });
    };

    let rafId = null;
    const throttledResize = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        handleResize();
        rafId = null;
      });
    };

    window.addEventListener('resize', throttledResize);

    return () => {
      window.removeEventListener('resize', throttledResize);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [context]);

  if (context !== null) {
    return context;
  }

  return fallback;
}

/**
 * Responsive grid container component that applies the correct grid columns
 * based on the current device type.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.className] - Additional class names
 * @param {number} [props.gap=4] - Gap size (Tailwind spacing scale)
 * @returns {React.ReactElement} The responsive grid component
 */
export function ResponsiveGrid({ children, className, gap = 4 }) {
  const gapClass = `gap-${gap}`;

  return (
    <div
      className={classNames(
        'grid w-full',
        'grid-cols-4 sm:grid-cols-8 lg:grid-cols-12',
        gapClass,
        className
      )}
    >
      {children}
    </div>
  );
}

ResponsiveGrid.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  gap: PropTypes.number,
};

/**
 * Responsive grid column component that spans a specified number of columns
 * across different breakpoints.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {number} [props.span=12] - Number of columns to span on desktop (lg+)
 * @param {number} [props.spanTablet] - Number of columns to span on tablet (sm-lg). Defaults to span.
 * @param {number} [props.spanMobile] - Number of columns to span on mobile (<sm). Defaults to 4 (full width).
 * @param {string} [props.className] - Additional class names
 * @returns {React.ReactElement} The responsive column component
 */
export function ResponsiveColumn({ children, span = 12, spanTablet, spanMobile, className }) {
  const mobileSpan = spanMobile || 4;
  const tabletSpan = spanTablet || Math.min(span, 8);
  const desktopSpan = span;

  const mobileClass = `col-span-${mobileSpan}`;
  const tabletClass = `sm:col-span-${tabletSpan}`;
  const desktopClass = `lg:col-span-${desktopSpan}`;

  return (
    <div
      className={classNames(
        mobileClass,
        tabletClass,
        desktopClass,
        className
      )}
    >
      {children}
    </div>
  );
}

ResponsiveColumn.propTypes = {
  children: PropTypes.node.isRequired,
  span: PropTypes.number,
  spanTablet: PropTypes.number,
  spanMobile: PropTypes.number,
  className: PropTypes.string,
};

/**
 * Component that conditionally renders children based on device type.
 * Useful for showing/hiding content per breakpoint without CSS.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} [props.mobile=false] - Show on mobile
 * @param {boolean} [props.tablet=false] - Show on tablet
 * @param {boolean} [props.desktop=false] - Show on desktop
 * @returns {React.ReactElement|null} The children or null
 */
export function ResponsiveShow({ children, mobile = false, tablet = false, desktop = false }) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  if (isMobile && mobile) {
    return children;
  }

  if (isTablet && tablet) {
    return children;
  }

  if (isDesktop && desktop) {
    return children;
  }

  return null;
}

ResponsiveShow.propTypes = {
  children: PropTypes.node.isRequired,
  mobile: PropTypes.bool,
  tablet: PropTypes.bool,
  desktop: PropTypes.bool,
};

export default ResponsiveLayout;