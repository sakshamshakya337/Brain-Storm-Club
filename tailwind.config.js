/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode using 'class' strategy
  theme: {
    extend: {
      colors: {
        bg: { primary: 'var(--bg-primary)', secondary: 'var(--bg-secondary)', card: 'var(--bg-card)', elevated: 'var(--bg-elevated)' },
        text: { primary: 'var(--text-primary)', secondary: 'var(--text-secondary)', muted: 'var(--text-muted)' },
        slate: {
          800: 'var(--color-slate-800, #1e293b)',
          900: 'var(--color-slate-900, #0f172a)',
          950: 'var(--color-slate-950, #020617)',
        },
        brand: { primary: 'var(--brand-primary)', secondary: 'var(--brand-secondary)', accent: 'var(--brand-accent)' },
        state: { success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)' },
        border: 'var(--border)',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: { card: '1rem' },
    },
  },
  plugins: [],
}
