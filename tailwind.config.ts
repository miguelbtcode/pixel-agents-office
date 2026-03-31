import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['PixelFont', 'Courier New', 'monospace'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        accent: 'var(--color-accent)',
        'accent-green': 'var(--color-accent-green)',
        'text-base': 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        'pixel-shadow': 'var(--pixel-shadow)',
      },
      keyframes: {
        'entry-flash': {
          '0%': { backgroundColor: 'rgba(90, 140, 255, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        'entry-flash': 'entry-flash 3s ease-out forwards',
        'slide-up': 'slide-up 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
