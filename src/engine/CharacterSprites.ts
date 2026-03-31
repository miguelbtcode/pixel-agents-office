/**
 * Pixel-art character sprite system.
 *
 * Each sprite is a SpriteData = string[][] (rows x cols of hex color strings).
 * Empty string '' means transparent pixel.
 * Characters are 16 wide x 24 tall pixels (matching Gather/pixel-agents style).
 *
 * Palette tokens used in templates:
 *   H = hair, S = skin, E = eye color, O = outfit, D = outfit dark (legs/shadow),
 *   B = outline/black, W = white, T = transparent, X = shoe color
 */

import type { AgentAppearance, AgentDirection } from '@/types/agent';

export type SpriteData = string[][];

// ════════════════════════════════════════════════════════════════
// Color utilities
// ════════════════════════════════════════════════════════════════

function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = 1 - amount;
  return (
    '#' +
    Math.max(0, Math.floor(r * f)).toString(16).padStart(2, '0') +
    Math.max(0, Math.floor(g * f)).toString(16).padStart(2, '0') +
    Math.max(0, Math.floor(b * f)).toString(16).padStart(2, '0')
  );
}

function lighten(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (
    '#' +
    Math.min(255, Math.floor(r + (255 - r) * amount)).toString(16).padStart(2, '0') +
    Math.min(255, Math.floor(g + (255 - g) * amount)).toString(16).padStart(2, '0') +
    Math.min(255, Math.floor(b + (255 - b) * amount)).toString(16).padStart(2, '0')
  );
}

// ════════════════════════════════════════════════════════════════
// Sprite Templates (16x24, token-based)
// ════════════════════════════════════════════════════════════════
// T=transparent, B=outline, H=hair, h=hair dark, S=skin, s=skin shadow,
// E=eye, M=mouth, O=outfit, o=outfit shadow, D=outfit dark, W=white, X=shoe

// ── DOWN (front-facing) ────────────────────────────────────────

const DOWN_IDLE: string[] = [
  '....BBBBBB......',
  '...BHHHHHHBh....',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHhB...',
  '..BSSSSSSSSB....',
  '..BSESSSESB.....',
  '..BSSSsSSSB.....',
  '..BSSSMSSB......',
  '...BSSSSB.......',
  '...BOOOOB.......',
  '..BOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '..BOOOOOOB......',
  '..BOOOOOOB......',
  '...BDDDDBB.....',
  '...BDDBBDDB.....',
  '...BDDBBDDB.....',
  '...BDDBBDDB.....',
  '...BXXBBXXB.....',
  '..BXXXXBXXXB....',
  '..BBBBBBBBBB....',
  '................',
];

const DOWN_WALK1: string[] = [
  '....BBBBBB......',
  '...BHHHHHHBh....',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHhB...',
  '..BSSSSSSSSB....',
  '..BSESSSESB.....',
  '..BSSSsSSSB.....',
  '..BSSSMSSB......',
  '...BSSSSB.......',
  '...BOOOOB.......',
  '..BOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '..BOOOOOOB......',
  '..BOOOOOOB......',
  '...BDDDDBB.....',
  '..BDDB..BDDB....',
  '..BDDB...BDDB...',
  '..BXXB...BXXB...',
  '.BXXXXB.BXXXXB..',
  '.BBBBB...BBBBB..',
  '................',
  '................',
];

const DOWN_WALK2: string[] = [
  '....BBBBBB......',
  '...BHHHHHHBh....',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHhB...',
  '..BSSSSSSSSB....',
  '..BSESSSESB.....',
  '..BSSSsSSSB.....',
  '..BSSSMSSB......',
  '...BSSSSB.......',
  '...BOOOOB.......',
  '..BOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '..BOOOOOOB......',
  '..BOOOOOOB......',
  '...BDDDDBB.....',
  '...BDDB.BDDB....',
  '..BDDB...BDDB...',
  '..BXXB...BXXB...',
  '.BXXXXB.BXXXXB..',
  '.BBBBB...BBBBB..',
  '................',
  '................',
];

// ── UP (back-facing) ──────────────────────────────────────────

const UP_IDLE: string[] = [
  '....BBBBBB......',
  '...BHHHHHHBh....',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHHHB..',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHB....',
  '..BSSSSSSSSB....',
  '..BSSSSSSB......',
  '...BSSSSB.......',
  '...BOOOOB.......',
  '..BOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '..BOOOOOOB......',
  '..BOOOOOOB......',
  '...BDDDDBB.....',
  '...BDDBBDDB.....',
  '...BDDBBDDB.....',
  '...BDDBBDDB.....',
  '...BXXBBXXB.....',
  '..BXXXXBXXXB....',
  '..BBBBBBBBBB....',
  '................',
];

const UP_WALK1: string[] = [
  '....BBBBBB......',
  '...BHHHHHHBh....',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHHHB..',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHB....',
  '..BSSSSSSSSB....',
  '..BSSSSSSB......',
  '...BSSSSB.......',
  '...BOOOOB.......',
  '..BOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '..BOOOOOOB......',
  '..BOOOOOOB......',
  '...BDDDDBB.....',
  '..BDDB..BDDB....',
  '..BDDB...BDDB...',
  '..BXXB...BXXB...',
  '.BXXXXB.BXXXXB..',
  '.BBBBB...BBBBB..',
  '................',
  '................',
];

const UP_WALK2: string[] = [
  '....BBBBBB......',
  '...BHHHHHHBh....',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHHHB..',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHB....',
  '..BSSSSSSSSB....',
  '..BSSSSSSB......',
  '...BSSSSB.......',
  '...BOOOOB.......',
  '..BOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '.BOOOOOOOOB.....',
  '..BOOOOOOB......',
  '..BOOOOOOB......',
  '...BDDDDBB.....',
  '...BDDB.BDDB....',
  '..BDDB...BDDB...',
  '..BXXB...BXXB...',
  '.BXXXXB.BXXXXB..',
  '.BBBBB...BBBBB..',
  '................',
  '................',
];

// ── RIGHT (side-facing) ────────────────────────────────────────

const RIGHT_IDLE: string[] = [
  '.....BBBBBB.....',
  '....BHHHHHHBh...',
  '...BHHHHHHHHHB..',
  '...BHHHHHHHHhB..',
  '...BSSSSSSSSBB..',
  '...BSSSSSESBWB..',
  '...BSSSsSSSBB...',
  '...BSSSSSBB....',
  '....BSSSSB......',
  '....BOOOOB......',
  '...BOOOOOOB.....',
  '..BOOOOOOOB.....',
  '..BOOOOOOOOB....',
  '..BOOOOOOOB.....',
  '...BOOOOOOB.....',
  '...BOOOOOOB.....',
  '....BDDDDBB....',
  '....BDDBBDDB....',
  '....BDDBBDDB....',
  '....BDDBBDDB....',
  '....BXXBBXXB....',
  '...BXXXXBXXXB...',
  '...BBBBBBBBBB...',
  '................',
];

const RIGHT_WALK1: string[] = [
  '.....BBBBBB.....',
  '....BHHHHHHBh...',
  '...BHHHHHHHHHB..',
  '...BHHHHHHHHhB..',
  '...BSSSSSSSSBB..',
  '...BSSSSSESBWB..',
  '...BSSSsSSSBB...',
  '...BSSSSSBB....',
  '....BSSSSB......',
  '....BOOOOB......',
  '...BOOOOOOB.....',
  '..BOOOOOOOB.....',
  '..BOOOOOOOOB....',
  '..BOOOOOOOB.....',
  '...BOOOOOOB.....',
  '...BOOOOOOB.....',
  '....BDDDDBB....',
  '...BDDB..BDDB...',
  '...BDDB...BDDB..',
  '...BXXB...BXXB..',
  '..BXXXXB.BXXXXB.',
  '..BBBBB...BBBBB.',
  '................',
  '................',
];

const RIGHT_WALK2: string[] = [
  '.....BBBBBB.....',
  '....BHHHHHHBh...',
  '...BHHHHHHHHHB..',
  '...BHHHHHHHHhB..',
  '...BSSSSSSSSBB..',
  '...BSSSSSESBWB..',
  '...BSSSsSSSBB...',
  '...BSSSSSBB....',
  '....BSSSSB......',
  '....BOOOOB......',
  '...BOOOOOOB.....',
  '..BOOOOOOOB.....',
  '..BOOOOOOOOB....',
  '..BOOOOOOOB.....',
  '...BOOOOOOB.....',
  '...BOOOOOOB.....',
  '....BDDDDBB....',
  '....BDDB.BDDB...',
  '...BDDB...BDDB..',
  '...BXXB...BXXB..',
  '..BXXXXB.BXXXXB.',
  '..BBBBB...BBBBB.',
  '................',
  '................',
];

// ════════════════════════════════════════════════════════════════
// Template → SpriteData conversion
// ════════════════════════════════════════════════════════════════

function templateToSprite(
  template: string[],
  palette: Record<string, string>,
): SpriteData {
  return template.map((row) =>
    row.split('').map((ch) => palette[ch] ?? ''),
  );
}

function flipHorizontal(sprite: SpriteData): SpriteData {
  return sprite.map((row) => [...row].reverse());
}

/** Build a full palette from an agent's appearance */
function buildPalette(appearance: AgentAppearance): Record<string, string> {
  const { hairColor, outfitColor, skinColor } = appearance;
  return {
    H: hairColor,
    h: darken(hairColor, 0.25),
    S: skinColor,
    s: darken(skinColor, 0.15),
    E: '#1a1a2e',
    M: darken(skinColor, 0.3),
    O: outfitColor,
    o: darken(outfitColor, 0.15),
    D: darken(outfitColor, 0.35),
    X: darken(outfitColor, 0.5),
    B: '#1a1020',
    W: '#ffffff',
    '.': '',
  };
}

// ════════════════════════════════════════════════════════════════
// Public API
// ════════════════════════════════════════════════════════════════

export interface CharacterSpriteSet {
  idle: Record<AgentDirection, SpriteData>;
  walk: Record<AgentDirection, [SpriteData, SpriteData, SpriteData]>;
}

/** Sprite cache keyed by a hash of the appearance */
const spriteCache = new Map<string, CharacterSpriteSet>();

function appearanceKey(appearance: AgentAppearance): string {
  return `${appearance.hairColor}|${appearance.outfitColor}|${appearance.skinColor}`;
}

/**
 * Generate a full set of pixel-art character sprites for an agent appearance.
 * Returns idle sprites (4 directions) and walk sprites (4 directions x 3 frames).
 * Walk animation is played as [0, 1, 0, 2] (step-rest-step pattern).
 */
export function getCharacterSprites(appearance: AgentAppearance): CharacterSpriteSet {
  const key = appearanceKey(appearance);
  const cached = spriteCache.get(key);
  if (cached) return cached;

  const palette = buildPalette(appearance);

  // Build all sprites from templates
  const downIdle = templateToSprite(DOWN_IDLE, palette);
  const downW1 = templateToSprite(DOWN_WALK1, palette);
  const downW2 = templateToSprite(DOWN_WALK2, palette);

  const upIdle = templateToSprite(UP_IDLE, palette);
  const upW1 = templateToSprite(UP_WALK1, palette);
  const upW2 = templateToSprite(UP_WALK2, palette);

  const rightIdle = templateToSprite(RIGHT_IDLE, palette);
  const rightW1 = templateToSprite(RIGHT_WALK1, palette);
  const rightW2 = templateToSprite(RIGHT_WALK2, palette);

  const leftIdle = flipHorizontal(rightIdle);
  const leftW1 = flipHorizontal(rightW1);
  const leftW2 = flipHorizontal(rightW2);

  const result: CharacterSpriteSet = {
    idle: {
      down: downIdle,
      up: upIdle,
      left: leftIdle,
      right: rightIdle,
    },
    walk: {
      down: [downIdle, downW1, downW2],
      up: [upIdle, upW1, upW2],
      left: [leftIdle, leftW1, leftW2],
      right: [rightIdle, rightW1, rightW2],
    },
  };

  spriteCache.set(key, result);
  return result;
}

// ════════════════════════════════════════════════════════════════
// Canvas rendering helpers
// ════════════════════════════════════════════════════════════════

/** Sprite canvas cache for zoom levels */
const canvasCache = new Map<string, HTMLCanvasElement>();

function spriteCacheKey(sprite: SpriteData, zoom: number): string {
  // Use first and last row + zoom as a quick hash
  const h = sprite.length > 0
    ? sprite[0].join('') + sprite[sprite.length - 1].join('') + zoom
    : '' + zoom;
  return h;
}

/**
 * Get a pre-rendered canvas for a sprite at a given zoom level.
 * Pixels are rendered as filled rectangles for pixel-perfect scaling.
 */
export function getCachedSpriteCanvas(
  sprite: SpriteData,
  zoom: number,
): HTMLCanvasElement {
  const key = spriteCacheKey(sprite, zoom);
  const cached = canvasCache.get(key);
  if (cached) return cached;

  const rows = sprite.length;
  const cols = rows > 0 ? sprite[0].length : 0;

  const canvas = document.createElement('canvas');
  canvas.width = cols * zoom;
  canvas.height = rows * zoom;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = sprite[r][c];
      if (color === '') continue;
      ctx.fillStyle = color;
      ctx.fillRect(c * zoom, r * zoom, zoom, zoom);
    }
  }

  canvasCache.set(key, canvas);
  return canvas;
}

/**
 * Draw a sprite directly to a canvas context at a world position.
 * Uses drawImage with a pre-cached canvas for performance.
 */
export function drawSpriteAt(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteData,
  worldX: number,
  worldY: number,
  zoom: number,
): void {
  const cached = getCachedSpriteCanvas(sprite, zoom);
  ctx.drawImage(cached, worldX, worldY);
}

/**
 * Draw an accessory overlay on top of a character sprite.
 * Accessories modify specific pixels on the sprite.
 */
export function drawAccessoryOverlay(
  ctx: CanvasRenderingContext2D,
  accessory: string,
  worldX: number,
  worldY: number,
  zoom: number,
  outfitColor: string,
): void {
  const z = zoom;

  switch (accessory) {
    case 'glasses':
    case 'glasses_round':
    case 'glasses_neon': {
      const color = accessory === 'glasses_neon' ? '#10b981' : accessory === 'glasses_round' ? '#92400e' : '#374151';
      ctx.fillStyle = color;
      // Left lens
      ctx.fillRect(worldX + 4 * z, worldY + 5 * z, 2 * z, 1 * z);
      // Right lens
      ctx.fillRect(worldX + 8 * z, worldY + 5 * z, 2 * z, 1 * z);
      // Bridge
      ctx.fillRect(worldX + 6 * z, worldY + 5 * z, 2 * z, 1 * z);
      break;
    }
    case 'headphones':
    case 'headphones_pink': {
      const color = accessory === 'headphones_pink' ? '#db2777' : '#222233';
      ctx.fillStyle = color;
      // Left earpiece
      ctx.fillRect(worldX + 2 * z, worldY + 2 * z, 1 * z, 3 * z);
      // Right earpiece
      ctx.fillRect(worldX + 12 * z, worldY + 2 * z, 1 * z, 3 * z);
      // Band
      ctx.fillRect(worldX + 3 * z, worldY + 1 * z, 10 * z, 1 * z);
      break;
    }
    case 'hat':
    case 'hat_cap':
    case 'hat_beanie':
    case 'hat_cowboy': {
      const color = accessory === 'hat_beanie' ? '#7c3aed' : accessory === 'hat_cowboy' ? '#78350f' : darken(outfitColor, 0.2);
      ctx.fillStyle = color;
      ctx.fillRect(worldX + 4 * z, worldY - 1 * z, 8 * z, 2 * z);
      ctx.fillRect(worldX + 3 * z, worldY + 0 * z, 10 * z, 1 * z);
      break;
    }
    case 'badge':
    case 'badge_red': {
      ctx.fillStyle = accessory === 'badge_red' ? '#dc2626' : '#fbbf24';
      ctx.fillRect(worldX + 7 * z, worldY + 10 * z, 2 * z, 3 * z);
      break;
    }
    case 'tie':
    case 'tie_blue': {
      ctx.fillStyle = accessory === 'tie_blue' ? '#2563eb' : '#dc2626';
      ctx.fillRect(worldX + 7 * z, worldY + 9 * z, 2 * z, 6 * z);
      break;
    }
    case 'scarf':
    case 'scarf_green': {
      ctx.fillStyle = accessory === 'scarf_green' ? '#16a34a' : '#7c3aed';
      ctx.fillRect(worldX + 3 * z, worldY + 8 * z, 10 * z, 2 * z);
      break;
    }
  }
}
