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
        space: {
          950: '#060913',
          900: '#0a0e1a',
          850: '#0e1526',
          800: '#141d34',
          700: '#1e293b',
          600: '#334155',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          glow: 'rgba(6, 182, 212, 0.25)',
        },
        telemetry: {
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px -2px rgba(6, 182, 212, 0.35)',
        'neon-green': '0 0 15px -2px rgba(16, 185, 129, 0.35)',
        'neon-yellow': '0 0 15px -2px rgba(245, 158, 11, 0.35)',
        'neon-red': '0 0 15px -2px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}

