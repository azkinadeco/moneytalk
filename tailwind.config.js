/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
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
        'ios-sm': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'ios-card': '0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'ios-elevated': '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
