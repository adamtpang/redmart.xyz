/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0C0A0A',
          1: '#161212',
          2: '#1E1818',
          3: '#262020',
        },
        border: {
          DEFAULT: 'rgba(255,220,220,0.08)',
          hover: 'rgba(255,220,220,0.14)',
          active: 'rgba(255,220,220,0.20)',
        },
        text: {
          primary: 'rgba(255,248,245,0.95)',
          secondary: 'rgba(255,248,245,0.68)',
          tertiary: 'rgba(255,248,245,0.42)',
        },
        accent: {
          DEFAULT: '#8B2232',
          light: '#C2344D',
          dim: 'rgba(139,34,50,0.15)',
          hover: 'rgba(139,34,50,0.25)',
        },
        gold: {
          DEFAULT: '#C9A84C',
          dim: 'rgba(201,168,76,0.15)',
        },
        status: {
          success: '#4CAF72',
          warning: '#D4A03C',
          error: '#C2344D',
          info: '#5B7DB1',
        }
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '16px' }],
        'sm': ['12px', { lineHeight: '16px' }],
        'base': ['13px', { lineHeight: '20px' }],
        'lg': ['14px', { lineHeight: '20px' }],
        'xl': ['16px', { lineHeight: '24px' }],
        '2xl': ['20px', { lineHeight: '28px' }],
        '3xl': ['24px', { lineHeight: '32px' }],
      },
      fontFamily: {
        display: ['Calluna', 'Georgia', 'serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
