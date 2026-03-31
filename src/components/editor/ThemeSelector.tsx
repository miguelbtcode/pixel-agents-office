'use client';

import { useOfficeStore } from '@/store/useOfficeStore';
import type { OfficeTheme, OfficeThemeConfig } from '@/types/office';

const THEMES: OfficeThemeConfig[] = [
  {
    id: 'modern',
    name: 'Modern',
    floorColor: '#e2e8f0',
    wallColor: '#94a3b8',
    carpetColor: '#bfdbfe',
    furnitureColor: '#475569',
    accentColor: '#3b82f6',
    bgColor: '#f1f5f9',
  },
  {
    id: 'retro',
    name: 'Retro',
    floorColor: '#d6b896',
    wallColor: '#8b6343',
    carpetColor: '#c4864a',
    furnitureColor: '#78350f',
    accentColor: '#f59e0b',
    bgColor: '#fef3c7',
  },
  {
    id: 'dark',
    name: 'Dark',
    floorColor: '#1e293b',
    wallColor: '#334155',
    carpetColor: '#1a1a44',
    furnitureColor: '#1f2937',
    accentColor: '#7c3aed',
    bgColor: '#0f172a',
  },
  {
    id: 'neon',
    name: 'Neon',
    floorColor: '#0a0a0a',
    wallColor: '#111111',
    carpetColor: '#050510',
    furnitureColor: '#111111',
    accentColor: '#00ffff',
    bgColor: '#000000',
  },
];

const THEME_SWATCHES: Record<OfficeTheme, string[]> = {
  modern: ['#e2e8f0', '#94a3b8', '#3b82f6'],
  retro: ['#d6b896', '#8b6343', '#f59e0b'],
  dark: ['#1e293b', '#334155', '#7c3aed'],
  neon: ['#0a0a0a', '#00ffff', '#ff00ff'],
};

export default function ThemeSelector() {
  const activeTheme = useOfficeStore((state) => state.activeTheme);
  const setTheme = useOfficeStore((state) => state.setTheme);

  return (
    <div className="flex flex-col gap-1">
      <span className="font-pixel text-[7px] tracking-wide px-1" style={{ color: 'var(--color-text-muted)' }}>THEME</span>
      <div className="flex gap-1 flex-wrap">
        {THEMES.map((theme) => {
          const isActive = activeTheme === theme.id;
          const swatches = THEME_SWATCHES[theme.id];
          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              title={theme.name}
              className="flex flex-col items-center gap-1 px-2 py-2 transition-colors"
              style={{
                border: `2px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                backgroundColor: isActive ? 'rgba(90,140,255,0.1)' : 'transparent',
              }}
            >
              <div className="flex gap-px">
                {swatches.map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3"
                    style={{ backgroundColor: color, border: '1px solid var(--color-border)' }}
                  />
                ))}
              </div>
              <span
                className="font-pixel text-[7px]"
                style={{ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
              >
                {theme.name.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
