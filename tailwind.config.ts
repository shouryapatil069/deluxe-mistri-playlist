import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          500: '#d94d34',
          700: '#b23620',
          900: '#742314',
        },
        timber: {
          800: '#3e2723',
          900: '#271915',
        }
      },
      fontFamily: {
        devanagari: ['var(--font-yatra)', 'var(--font-rozha)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
} satisfies Config;
