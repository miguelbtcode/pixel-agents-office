/**
 * Pixel-art character sprite system.
 *
 * Each sprite is SpriteData = string[][] (rows x cols of hex color strings).
 * Empty string '' = transparent pixel.
 * Characters are 16 wide x 24 tall (matching pixel-agents / Gather style).
 *
 * Palette tokens:
 *   H = hair, h = hair dark, S = skin, s = skin shadow,
 *   E = eye, M = mouth, O = outfit, o = outfit dark, D = leg/dark outfit,
 *   X = shoe, B = outline, W = white eye, . = transparent
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

// ════════════════════════════════════════════════════════════════
// Sprite templates — each row is EXACTLY 16 characters
// ════════════════════════════════════════════════════════════════

/* ── DOWN (front-facing) idle ─────────────────────────────── */
const T_DOWN_IDLE: string[] = [
  '....BBBBBB......', // row 0  - hair top outline
  '...BHHHHHHBh....', // row 1  - hair
  '..BHHHHHHHHhB...', // row 2  - hair sides
  '..BHHhHHHHhHB...', // row 3  - hair detail
  '..BSSSSSSSSSB...', // row 4  - forehead
  '..BSWESSWSEsB...', // row 5  - eyes (W=white, E=pupil)
  '..BSSSSsSSSsB...', // row 6  - nose area
  '...BSSSMMSSsB...', // row 7  - mouth
  '...BSSSSSSSB....', // row 8  - chin
  '....BOOOOB......', // row 9  - collar
  '...BOOOOOOOB....', // row 10 - shoulders
  '..BOoOOOOOoOB...', // row 11 - torso + arm shadow
  '..BOoOOOOOoOB...', // row 12 - torso
  '..BOoOOOOOoOB...', // row 13 - torso
  '...BOOOOOOOB....', // row 14 - waist
  '...BODDDDOOB....', // row 15 - belt
  '....BDDDDDB.....', // row 16 - upper legs
  '....BDD..DDB....', // row 17 - legs apart
  '....BDD..DDB....', // row 18 - legs
  '....BDD..DDB....', // row 19 - lower legs
  '...BXXX..XXXB...', // row 20 - ankles/shoes
  '...BXXX..XXXB...', // row 21 - shoes
  '...BBBB..BBBB...', // row 22 - shoe outline
  '................', // row 23 - empty
];

/* ── DOWN walk frame 1 (left foot forward) ────────────────── */
const T_DOWN_WALK1: string[] = [
  '....BBBBBB......',
  '...BHHHHHHBh....',
  '..BHHHHHHHHhB...',
  '..BHHhHHHHhHB...',
  '..BSSSSSSSSSB...',
  '..BSWESSWSEsB...',
  '..BSSSSsSSSsB...',
  '...BSSSMMSSsB...',
  '...BSSSSSSSB....',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '...BDD....DDB...',
  '..BDDB.....DDB..',
  '..BXXB.....BXXB.',
  '..BXXB....BXXXB.',
  '.BXXXB....BBBBB.',
  '.BBBBB..........',
  '................',
];

/* ── DOWN walk frame 2 (right foot forward) ───────────────── */
const T_DOWN_WALK2: string[] = [
  '....BBBBBB......',
  '...BHHHHHHBh....',
  '..BHHHHHHHHhB...',
  '..BHHhHHHHhHB...',
  '..BSSSSSSSSSB...',
  '..BSWESSWSEsB...',
  '..BSSSSsSSSsB...',
  '...BSSSMMSSsB...',
  '...BSSSSSSSB....',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '...DDB....BDD...',
  '..BDDB.....BDD..',
  '.BXXB......BXXB.',
  '.BXXXB.....BXXB.',
  '.BBBBB.....BXXXB',
  '...........BBBBB',
  '................',
];

/* ── UP (back-facing) idle ────────────────────────────────── */
const T_UP_IDLE: string[] = [
  '....BBBBBB......',
  '...BHHHHHHBh....',
  '..BHHHHHHHHhB...',
  '..BHHhHHHHhHB...',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHHB...',
  '..BHHSSSSHHhB...',
  '...BSSSSSSSB....',
  '...BSSSSSSSB....',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '....BDD..DDB....',
  '....BDD..DDB....',
  '....BDD..DDB....',
  '...BXXX..XXXB...',
  '...BXXX..XXXB...',
  '...BBBB..BBBB...',
  '................',
];

/* ── UP walk frame 1 ──────────────────────────────────────── */
const T_UP_WALK1: string[] = [
  '....BBBBBB......',
  '...BHHHHHHBh....',
  '..BHHHHHHHHhB...',
  '..BHHhHHHHhHB...',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHHB...',
  '..BHHSSSSHHhB...',
  '...BSSSSSSSB....',
  '...BSSSSSSSB....',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '...BDD....DDB...',
  '..BDDB.....DDB..',
  '..BXXB.....BXXB.',
  '..BXXB....BXXXB.',
  '.BXXXB....BBBBB.',
  '.BBBBB..........',
  '................',
];

/* ── UP walk frame 2 ──────────────────────────────────────── */
const T_UP_WALK2: string[] = [
  '....BBBBBB......',
  '...BHHHHHHBh....',
  '..BHHHHHHHHhB...',
  '..BHHhHHHHhHB...',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHHB...',
  '..BHHSSSSHHhB...',
  '...BSSSSSSSB....',
  '...BSSSSSSSB....',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '...DDB....BDD...',
  '..BDDB.....BDD..',
  '.BXXB......BXXB.',
  '.BXXXB.....BXXB.',
  '.BBBBB.....BXXXB',
  '...........BBBBB',
  '................',
];

/* ── RIGHT (side-facing) idle ─────────────────────────────── */
const T_RIGHT_IDLE: string[] = [
  '.....BBBBBB.....',
  '....BHHHHHHBh...',
  '...BHHHHHHHHhB..',
  '...BHHhHHHHhHB..',
  '...BSSSSSSSSBB..',
  '...BSSSSWESB.B..',
  '...BSSSSsSSSBB..',
  '...BSSSSSSBB....',
  '....BSSSSB......',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '...BOoOOOOOOB...',
  '...BOOOOOOOOOB..',
  '...BOoOOOOOOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '....BDD..DDB....',
  '....BDD..DDB....',
  '....BDD..DDB....',
  '...BXXX..XXXB...',
  '...BXXX..XXXB...',
  '...BBBB..BBBB...',
  '................',
];

/* ── RIGHT walk frame 1 ──────────────────────────────────── */
const T_RIGHT_WALK1: string[] = [
  '.....BBBBBB.....',
  '....BHHHHHHBh...',
  '...BHHHHHHHHhB..',
  '...BHHhHHHHhHB..',
  '...BSSSSSSSSBB..',
  '...BSSSSWESB.B..',
  '...BSSSSsSSSBB..',
  '...BSSSSSSBB....',
  '....BSSSSB......',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '...BOoOOOOOOB...',
  '...BOOOOOOOOOB..',
  '...BOoOOOOOOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '...BDD....DDB...',
  '..BDDB.....DDB..',
  '..BXXB.....BXXB.',
  '..BXXB....BXXXB.',
  '.BXXXB....BBBBB.',
  '.BBBBB..........',
  '................',
];

/* ── RIGHT walk frame 2 ──────────────────────────────────── */
const T_RIGHT_WALK2: string[] = [
  '.....BBBBBB.....',
  '....BHHHHHHBh...',
  '...BHHHHHHHHhB..',
  '...BHHhHHHHhHB..',
  '...BSSSSSSSSBB..',
  '...BSSSSWESB.B..',
  '...BSSSSsSSSBB..',
  '...BSSSSSSBB....',
  '....BSSSSB......',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '...BOoOOOOOOB...',
  '...BOOOOOOOOOB..',
  '...BOoOOOOOOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '...DDB....BDD...',
  '..BDDB.....BDD..',
  '.BXXB......BXXB.',
  '.BXXXB.....BXXB.',
  '.BBBBB.....BXXXB',
  '...........BBBBB',
  '................',
];

// ════════════════════════════════════════════════════════════════
// Template → SpriteData conversion
// ════════════════════════════════════════════════════════════════

function templateToSprite(
  template: string[],
  palette: Record<string, string>,
): SpriteData {
  return template.map((row) => {
    // Pad or trim to exactly 16 chars
    const normalized = row.padEnd(16, '.').slice(0, 16);
    return normalized.split('').map((ch) => palette[ch] ?? '');
  });
}

function flipHorizontal(sprite: SpriteData): SpriteData {
  return sprite.map((row) => [...row].reverse());
}

function buildPalette(appearance: AgentAppearance): Record<string, string> {
  const { hairColor, outfitColor, skinColor } = appearance;
  return {
    H: hairColor,
    h: darken(hairColor, 0.25),
    S: skinColor,
    s: darken(skinColor, 0.15),
    E: '#1a1020', // pupil
    W: '#ffffff', // eye white
    M: darken(skinColor, 0.3),
    O: outfitColor,
    o: darken(outfitColor, 0.15),
    D: darken(outfitColor, 0.35),
    X: darken(outfitColor, 0.5),
    B: '#1a1020', // outline
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

const spriteCache = new Map<string, CharacterSpriteSet>();

function appearanceKey(appearance: AgentAppearance): string {
  return `${appearance.hairColor}|${appearance.outfitColor}|${appearance.skinColor}`;
}

/**
 * Generate a full set of pixel-art character sprites for an agent.
 * Walk animation plays as [idle, walk1, idle, walk2] cycle.
 */
export function getCharacterSprites(appearance: AgentAppearance): CharacterSpriteSet {
  const key = appearanceKey(appearance);
  const cached = spriteCache.get(key);
  if (cached) return cached;

  const palette = buildPalette(appearance);

  const downIdle = templateToSprite(T_DOWN_IDLE, palette);
  const downW1 = templateToSprite(T_DOWN_WALK1, palette);
  const downW2 = templateToSprite(T_DOWN_WALK2, palette);

  const upIdle = templateToSprite(T_UP_IDLE, palette);
  const upW1 = templateToSprite(T_UP_WALK1, palette);
  const upW2 = templateToSprite(T_UP_WALK2, palette);

  const rightIdle = templateToSprite(T_RIGHT_IDLE, palette);
  const rightW1 = templateToSprite(T_RIGHT_WALK1, palette);
  const rightW2 = templateToSprite(T_RIGHT_WALK2, palette);

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
// Accessory overlay drawing
// ════════════════════════════════════════════════════════════════

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
      ctx.fillRect(worldX + 3 * z, worldY + 5 * z, 3 * z, 1 * z);
      ctx.fillRect(worldX + 8 * z, worldY + 5 * z, 3 * z, 1 * z);
      ctx.fillRect(worldX + 6 * z, worldY + 5 * z, 2 * z, 1 * z);
      break;
    }
    case 'headphones':
    case 'headphones_pink': {
      const color = accessory === 'headphones_pink' ? '#db2777' : '#222233';
      ctx.fillStyle = color;
      ctx.fillRect(worldX + 2 * z, worldY + 1 * z, 1 * z, 4 * z);
      ctx.fillRect(worldX + 13 * z, worldY + 1 * z, 1 * z, 4 * z);
      ctx.fillRect(worldX + 3 * z, worldY + 0 * z, 10 * z, 1 * z);
      break;
    }
    case 'hat':
    case 'hat_cap':
    case 'hat_beanie':
    case 'hat_cowboy': {
      const color = accessory === 'hat_beanie' ? '#7c3aed' : accessory === 'hat_cowboy' ? '#78350f' : darken(outfitColor, 0.2);
      ctx.fillStyle = color;
      ctx.fillRect(worldX + 4 * z, worldY - 1 * z, 8 * z, 2 * z);
      ctx.fillRect(worldX + 3 * z, worldY + 0, 10 * z, 1 * z);
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
