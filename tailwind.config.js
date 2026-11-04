/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        solo: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#bcd2ff',
          300: '#8eb4ff',
          400: '#598bff',
          500: '#3366ff',
          600: '#1f47f5',
          700: '#1735e1',
          800: '#1a2db6',
          900: '#1c2b8f',
          950: '#141b57',
        },
        mana: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        ember: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(51, 102, 255, 0.45)',
        'glow-mana': '0 0 18px rgba(6, 182, 212, 0.5)',
        'glow-ember': '0 0 18px rgba(249, 115, 22, 0.5)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 14px rgba(51,102,255,0.35)' },
          '50%': { boxShadow: '0 0 28px rgba(51,102,255,0.65)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        rise: 'rise 0.5s ease-out both',
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
        floaty: 'floaty 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
