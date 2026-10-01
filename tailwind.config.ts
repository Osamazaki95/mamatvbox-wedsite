import type { Config } from 'tailwindcss';

/**
 * Arabic glyphs need taller line boxes than Latin, and large display sizes
 * must shrink on small screens — both are handled here once for every page.
 */
const fluid = (min: number, vw: number, max: number) => `clamp(${min}rem, ${vw}vw, ${max}rem)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.25rem', screens: { '2xl': '1280px' } },
    extend: {
      screens: { xs: '420px', '3xl': '1680px' },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.6' }],
        xs: ['0.75rem', { lineHeight: '1.7' }],
        sm: ['0.875rem', { lineHeight: '1.75' }],
        base: ['1rem', { lineHeight: '1.8' }],
        lg: ['1.125rem', { lineHeight: '1.7' }],
        xl: ['1.25rem', { lineHeight: '1.65' }],
        '2xl': [fluid(1.25, 3.2, 1.5), { lineHeight: '1.55' }],
        '3xl': [fluid(1.45, 3.6, 1.875), { lineHeight: '1.5' }],
        '4xl': [fluid(1.65, 4.4, 2.25), { lineHeight: '1.45' }],
        '5xl': [fluid(1.9, 5.2, 3), { lineHeight: '1.4' }],
        '6xl': [fluid(2.1, 6, 3.75), { lineHeight: '1.38' }],
        '7xl': [fluid(2.8, 9, 4.5), { lineHeight: '1.2' }],
      },
      colors: {
        bg: '#0B0D12',
        surface: '#111318',
        card: '#1A1D23',
        panel: '#22252B',
        line: '#2A2E36',
        ink: '#F2F4F7',
        muted: '#9CA3AF',
        dim: '#6B7280',
        gold: { DEFAULT: '#FBBF24', deep: '#D99A0B', soft: '#FBBF2420' },
        teal: { DEFAULT: '#4FE3D0', deep: '#22C5B1', soft: '#4FE3D01F' },
        violet: { DEFAULT: '#A78BFA', soft: '#A78BFA22' },
        danger: { DEFAULT: '#EF4444', deep: '#B91C1C', soft: '#EF444420' },
        warn: '#F59E0B',
        ok: '#22C55E',
      },
      fontFamily: {
        sans: ['var(--font-plex)', 'system-ui', 'sans-serif'],
        display: ['var(--font-alexandria)', 'var(--font-plex)', 'sans-serif'],
        logo: ['var(--font-logo)', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: { xl2: '1.25rem', xl3: '1.75rem' },
      boxShadow: {
        gold: '0 10px 30px -8px rgba(251,191,36,.45)',
        teal: '0 10px 30px -10px rgba(79,227,208,.45)',
        card: '0 20px 50px -20px rgba(0,0,0,.7)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(-100%)' } },
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.35' } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        'spin-slow': 'spinSlow 14s linear infinite',
        floaty: 'floaty 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
