/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Fill-in shades used across the app (were missing → rendered as transparent/white)
        zinc: {
          750: '#333338',
          850: '#1f1f23',
        },
        apple: {
          gray: '#F2F2F7',
          darkBg: '#09090b',
          cardDark: '#18181b',
          cardLight: '#ffffff',
          green: '#10B981',
          red: '#EF4444',
          blue: '#007AFF',
          indigo: '#6366F1',
          gold: '#F59E0B',
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      padding: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      margin: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.06)',
        'ios-sm': '0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'ios-card': '0 8px 24px -6px rgba(0, 0, 0, 0.10), 0 2px 6px -1px rgba(0, 0, 0, 0.05)',
        'ios-elevated': '0 20px 40px -15px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0,0,0,0.04)',
      },
      scale: {
        98: '0.98',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(-6px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out both',
        'pop-in': 'pop-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
