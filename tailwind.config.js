/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Stripe-inspired palette
        primary: {
          50: '#f5f4ff',
          100: '#ebe9ff',
          200: '#d7d4ff',
          300: '#b6afff',
          400: '#8d81ff',
          500: '#635BFF',
          600: '#554cf5',
          700: '#463ee6',
          800: '#3a33c7',
          900: '#2f2aa6',
          950: '#241f85',
        },
        accent: {
          50: '#e6fbff',
          100: '#ccf6ff',
          200: '#99edff',
          300: '#66e3ff',
          400: '#33daff',
          500: '#00D4FF',
          600: '#00bfe6',
          700: '#00a8cc',
          800: '#0092b3',
          900: '#007a99',
        },
        secondary: {
          50: '#e6edf5',
          100: '#cfe0ee',
          200: '#a1c2db',
          300: '#6ea2c6',
          400: '#3e7faa',
          500: '#1f4f73',
          600: '#153a57',
          700: '#0f2d45',
          800: '#0b2134',
          900: '#0A2540',
          950: '#071a2e',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fefce8',
          100: '#fef9c3',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      boxShadow: {
        'stripe': '0 2px 4px rgba(0,0,0,.08)',
        'stripe-lg': '0 8px 16px rgba(0,0,0,.12)',
        'stripe-xl': '0 16px 32px rgba(0,0,0,.16)',
        'inner-stripe': 'inset 0 1px 3px rgba(0,0,0,.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
