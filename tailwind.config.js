/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        btc: {
          50: '#fff8e1',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#F7931A',
          600: '#e68a00',
          700: '#cc7a00',
          800: '#b36b00',
          900: '#995c00',
        },
        forge: {
          50: '#fef3e2',
          100: '#fde4b9',
          200: '#fcd48c',
          300: '#fbc35f',
          400: '#fab63d',
          500: '#F7931A',
          600: '#e07d0e',
          700: '#c46a08',
          800: '#a85704',
          900: '#8c4502',
        },
        surface: {
          900: '#0a0a0f',
          800: '#101018',
          700: '#16161f',
          600: '#1e1e2a',
          500: '#262636',
          400: '#303044',
          300: '#3a3a52',
        },
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-line': 'glowLine 3s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(247, 147, 26, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(247, 147, 26, 0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowLine: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
