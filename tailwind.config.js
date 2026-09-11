/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        'paper-dim': 'var(--paper-dim)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        spark: 'var(--spark)',
        'spark-soft': 'var(--spark-soft)',
        'spark-glow': 'var(--spark-glow)',
        circuit: 'var(--circuit)',
        border: 'var(--border)',
        
        // Retain existing background/text structures for other pages compatibility
        bg: { primary: 'var(--paper)', secondary: 'var(--paper-dim)', card: 'var(--paper)', elevated: 'var(--paper)' },
        text: { primary: 'var(--ink)', secondary: 'var(--ink-soft)', muted: 'var(--ink-soft)' },
        brand: { primary: 'var(--spark)', secondary: 'var(--circuit)', accent: 'var(--circuit)' }
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: { card: '10px' },
      boxShadow: {
        'sys': '0 4px 20px rgba(25, 26, 31, 0.05)',
      }
    },
  },
  plugins: [],
}
