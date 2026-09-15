import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /* ---- Theme-swapping semantics -------------------------------------
         * Every one of these reads a CSS variable set per theme in
         * globals.css, so a single class works in both light and dark.
         * ------------------------------------------------------------------ */
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          800: 'rgb(var(--c-ink-800) / <alpha-value>)',
          700: 'rgb(var(--c-ink-700) / <alpha-value>)',
          600: 'rgb(var(--c-ink-600) / <alpha-value>)',
          500: 'rgb(var(--c-ink-500) / <alpha-value>)',
          400: 'rgb(var(--c-ink-400) / <alpha-value>)',
          300: 'rgb(var(--c-ink-300) / <alpha-value>)',
        },
        /* Primary reading colour. Light ivory on dark, near-black on light. */
        ivory: {
          DEFAULT: 'rgb(var(--c-fg) / <alpha-value>)',
          deep: 'rgb(var(--c-fg-deep) / <alpha-value>)',
        },
        /* Gold for type, rules and borders — darkens on light backgrounds so
         * it keeps its contrast ratio. */
        accent: {
          DEFAULT: 'rgb(var(--c-accent) / <alpha-value>)',
          light: 'rgb(var(--c-accent-light) / <alpha-value>)',
          deep: 'rgb(var(--c-accent-deep) / <alpha-value>)',
        },
        danger: 'rgb(var(--c-danger) / <alpha-value>)',
        success: 'rgb(var(--c-success) / <alpha-value>)',
        warn: 'rgb(var(--c-warn) / <alpha-value>)',

        /* Hairlines and surface fills, with per-theme alpha baked in. */
        line: {
          DEFAULT: 'rgb(var(--c-line) / var(--a-line))',
          2: 'rgb(var(--c-line) / var(--a-line-2))',
          3: 'rgb(var(--c-line) / var(--a-line-3))',
        },
        fill: {
          DEFAULT: 'rgb(var(--c-fill) / var(--a-fill))',
          2: 'rgb(var(--c-fill) / var(--a-fill-2))',
        },

        /* ---- Fixed brand colours ------------------------------------------
         * These do not move between themes: the gold of a filled button is
         * the brand, and the dark type on top of it must stay dark.
         * ------------------------------------------------------------------ */
        champagne: {
          DEFAULT: '#D9BC8C',
          light: '#EBD6B3',
          deep: '#B99863',
        },
        onaccent: '#17120C',
        rosegold: {
          DEFAULT: '#C08A7E',
          light: '#DCAFA4',
          deep: '#A26C61',
        },
        soft: '#FBFAF8',
        nude: { DEFAULT: '#E3D3C1', deep: '#C9AE93' },
        blush: { DEFAULT: '#F1DCD9', deep: '#E4BFBA' },
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
        /* The sheen is a variable so light mode can use a deeper gold that
         * still reads against ivory. */
        'gold-sheen': 'var(--gold-sheen)',
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
