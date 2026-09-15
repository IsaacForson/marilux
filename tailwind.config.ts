import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0A09',
          800: '#141211',
          700: '#1D1A18',
          600: '#2A2522',
          500: '#3B3532',
          400: '#5A524D',
          300: '#857B74',
        },
        soft: '#FBFAF8',
        ivory: {
          DEFAULT: '#F4EFE7',
          deep: '#EDE5D9',
        },
        nude: {
          DEFAULT: '#E3D3C1',
          deep: '#C9AE93',
        },
        champagne: {
          DEFAULT: '#D9BC8C',
          light: '#EBD6B3',
          deep: '#B99863',
        },
        rosegold: {
          DEFAULT: '#C08A7E',
          light: '#DCAFA4',
          deep: '#A26C61',
        },
        blush: {
          DEFAULT: '#F1DCD9',
          deep: '#E4BFBA',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.2' }],
      },
      letterSpacing: {
        luxe: '0.22em',
        wide2: '0.32em',
      },
      maxWidth: {
        shell: '96rem',
      },
      screens: {
        xs: '420px',
      },
      backgroundImage: {
        'gold-sheen':
          'linear-gradient(100deg, #B99863 0%, #EBD6B3 28%, #D9BC8C 46%, #F6ECD8 62%, #B99863 100%)',
        'rose-sheen':
          'linear-gradient(100deg, #A26C61 0%, #DCAFA4 32%, #F1DCD9 52%, #C08A7E 78%, #A26C61 100%)',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
        silk: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        sheen: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-12px,0)' },
        },
        auraDrift: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(3%,-4%,0) scale(1.06)' },
          '66%': { transform: 'translate3d(-3%,3%,0) scale(0.97)' },
        },
        marquee: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-50%,0,0)' },
        },
      },
      animation: {
        sheen: 'sheen 7s linear infinite',
        float: 'float 7s ease-in-out infinite',
        aura: 'auraDrift 22s ease-in-out infinite',
        marquee: 'marquee 46s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
