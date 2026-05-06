/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Cal Sans', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef9ff',
          100: '#d8f1ff',
          200: '#b9e8ff',
          300: '#88daff',
          400: '#50c2fd',
          500: '#28a6fa',
          600: '#1189ef',
          700: '#0a70dc',
          800: '#0f59b2',
          900: '#124c8c',
          950: '#0e2f55',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          soft: 'var(--ink-soft)',
          muted: 'var(--ink-muted)',
          faint: 'var(--ink-faint)',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,.04), 0 4px 16px -4px rgba(0,0,0,.08)',
        'card-hover': '0 4px 6px -2px rgba(0,0,0,.06), 0 12px 32px -8px rgba(0,0,0,.14)',
        'sidebar': '1px 0 0 0 #eaecf0',
        'modal': '0 8px 32px -8px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.06)',
      },
      animation: {
        'fade-in': 'fadeIn .25s ease forwards',
        'slide-up': 'slideUp .3s cubic-bezier(.16,1,.3,1) forwards',
        'skeleton': 'skeleton 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        skeleton: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .4 },
        },
      },
    },
  },
  plugins: [],
}
