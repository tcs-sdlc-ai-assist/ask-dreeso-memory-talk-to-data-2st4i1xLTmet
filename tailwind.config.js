/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A1A2F',
          50: '#1A3A5F',
          100: '#163254',
          200: '#122A49',
          300: '#0E223E',
          400: '#0C1E37',
          500: '#0A1A2F',
          600: '#081527',
          700: '#06101F',
          800: '#040B17',
          900: '#02060F',
        },
        secondary: {
          DEFAULT: '#1E2A44',
          50: '#3A4E72',
          100: '#344668',
          200: '#2E3E5E',
          300: '#283654',
          400: '#23304C',
          500: '#1E2A44',
          600: '#18223A',
          700: '#131A30',
          800: '#0E1426',
          900: '#090E1C',
        },
        accent: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
          pink: '#EC4899',
          green: '#10B981',
          orange: '#F59E0B',
        },
      },
      fontFamily: {
        urbanist: ['Urbanist', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '50': '12.5rem',
        '58': '14.5rem',
        '66': '16.5rem',
        '74': '18.5rem',
        '82': '20.5rem',
        '90': '22.5rem',
        '100': '25rem',
        '120': '30rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.5)',
        'glow': '0 0 15px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 30px rgba(59, 130, 246, 0.6)',
        'glow-purple': '0 0 15px rgba(139, 92, 246, 0.5)',
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};