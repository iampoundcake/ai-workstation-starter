/** @type {import('tailwindcss').Config} */
// Theme-aware: every color resolves through CSS variables injected at boot
// from src/data/tokens.ts (THEMES map). Switching `theme` in config.json
// swaps every utility's value.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        serif: ['var(--font-serif)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        ink: 'rgb(var(--color-ink-rgb) / <alpha-value>)',
        wall: 'rgb(var(--color-wall-rgb) / <alpha-value>)',
        shelf: 'rgb(var(--color-shelf-rgb) / <alpha-value>)',
        cream: 'rgb(var(--color-cream-rgb) / <alpha-value>)',
        pencil: 'rgb(var(--color-pencil-rgb) / <alpha-value>)',
        bookplate: 'rgb(var(--color-bookplate-rgb) / <alpha-value>)',
        sage: {
          DEFAULT: 'rgb(var(--color-sage-rgb) / <alpha-value>)',
          10: 'rgb(var(--color-sage-rgb) / 0.10)',
          20: 'rgb(var(--color-sage-rgb) / 0.20)',
          30: 'rgb(var(--color-sage-rgb) / 0.30)',
        },
        terracotta: 'rgb(var(--color-terracotta-rgb) / <alpha-value>)',
        brass: 'rgb(var(--color-brass-rgb) / <alpha-value>)',
        lavender: 'rgb(var(--color-lavender-rgb) / <alpha-value>)',
      },
      maxWidth: {
        prose: '65ch',
      },
      letterSpacing: {
        label: '0.1em',
      },
    },
  },
  plugins: [],
}
