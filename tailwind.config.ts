import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['Press Start 2P', 'monospace'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        accent: 'var(--color-accent)',
        'text-base': 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
      },
    },
  },
  plugins: [],
};

export default config;
