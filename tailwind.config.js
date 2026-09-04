/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B0B0B',
        surface: '#161616',
        elevated: '#1E1E1E',
        line: '#262626',
        text: '#F5F5F3',
        muted: '#8A8A87',
        accent: '#8B82F0',
        accentDim: '#2A2740',
        warn: '#F0A93B',
        warnDim: '#3A2E18',
        danger: '#C86B6B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        title: ['28px', { lineHeight: '34px', letterSpacing: '-0.02em' }],
        subtitle: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        body: ['16px', { lineHeight: '24px' }],
        aux: ['13px', { lineHeight: '18px' }],
        micro: ['11px', { lineHeight: '16px' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
      },
      borderRadius: {
        card: '12px',
        button: '14px',
        modal: '16px',
      },
      boxShadow: {
        modal: '0 24px 64px rgba(0, 0, 0, 0.64)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
