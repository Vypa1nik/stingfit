import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#FAFAFA',
          dark: '#1A1A1A',
        },
        sidebar: {
          DEFAULT: '#F5F5F5',
          dark: '#141414',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#222222',
        },
        border: {
          DEFAULT: '#E5E5E5',
          dark: '#333333',
        },
        text: {
          primary: { DEFAULT: '#1A1A1A', dark: '#F5F5F5' },
          secondary: { DEFAULT: '#737373', dark: '#A3A3A3' },
          muted: { DEFAULT: '#A3A3A3', dark: '#666666' },
        },
        accent: {
          DEFAULT: '#FFD000',
          hover: '#FFFF00',
          light: '#FFF700',
          dark: '#FF7A00',
        },
        fitness: {
          black: '#000000',
          yellow: '#FFFF00',
          gold: '#FFD000',
          orange: '#FF7A00',
          surface: '#171700',
          warm: '#FFFBEA',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      spacing: {
        18: '4.5rem',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)',
        modal: '0 20px 60px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
} satisfies Config
