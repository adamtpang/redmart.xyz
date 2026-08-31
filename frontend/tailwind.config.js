/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#1A0A0A',
          1: '#241111',
          2: '#2E1818',
          3: '#381F1F',
        },
        border: {
          DEFAULT: 'rgba(255,200,180,0.10)',
          hover: 'rgba(255,200,180,0.16)',
          active: 'rgba(255,200,180,0.22)',
        },
        text: {
          primary: 'rgba(255,245,238,0.95)',
          secondary: 'rgba(255,245,238,0.65)',
          tertiary: 'rgba(255,245,238,0.38)',
        },
        accent: {
          DEFAULT: '#8B2232',
          light: '#C2344D',
          dim: 'rgba(139,34,50,0.18)',
          hover: 'rgba(139,34,50,0.28)',
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
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-foreground)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', foreground: 'var(--destructive-foreground)' },
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '16px' }],
        'sm': ['12px', { lineHeight: '16px' }],
        'base': ['13px', { lineHeight: '20px' }],
        'lg': ['14px', { lineHeight: '20px' }],
        'xl': ['16px', { lineHeight: '24px' }],
        '2xl': ['20px', { lineHeight: '28px' }],
        '3xl': ['24px', { lineHeight: '32px' }],
        '4xl': ['36px', { lineHeight: '42px' }],
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
        ops: ['"Space Grotesk"', 'Arial', 'sans-serif'],
        opsmono: ['"IBM Plex Mono"', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
