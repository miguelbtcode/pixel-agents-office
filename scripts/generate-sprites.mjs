#!/usr/bin/env node
/**
 * Generate PNG sprite sheets for each agent character.
 *
 * Each sprite sheet is 112x96 pixels:
 *   - 7 columns (frames): walk0(idle), walk1, walk2, type0, type1, read0, read1
 *   - 3 rows (directions): down, up, right
 *   - Each frame is 16x32 pixels
 *
 * Left direction is generated at runtime by flipping right.
 *
 * Usage:  node scripts/generate-sprites.mjs
 * Output: public/sprites/agents/<name>.png
 */

import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'sprites', 'agents');

const FRAME_W = 16;
const FRAME_H = 32;
const COLS = 7; // frames per row
const ROWS = 3; // directions
const SHEET_W = FRAME_W * COLS; // 112
const SHEET_H = FRAME_H * ROWS; // 96

// ═══════════════════════════════════════════════════════════════
// Color helpers
// ═══════════════════════════════════════════════════════════════

function hexToRGBA(hex) {
  if (!hex || hex === '') return [0, 0, 0, 0];
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
}

function darken(hex, amount) {
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

// ═══════════════════════════════════════════════════════════════
// Sprite templates — 16 wide x 32 tall
// Each character in the template maps to a palette token.
// '.' = transparent
// ═══════════════════════════════════════════════════════════════

// ── DOWN (front-facing) ─────────────────────────────────────

const T_DOWN_IDLE = [
  '................', // 0
  '................', // 1
  '....HHHHHH......', // 2  hair top
  '...HHHHHHHH.....',  // 3  hair
  '..HHHhHHHhHH....',  // 4  hair detail
  '..HHHhHHHhHH....',  // 5  hair sides
  '..BSSSSSSSSSB...',  // 6  forehead
  '..BSWESSWEssB...',  // 7  eyes
  '..BSSsSSsSssB...',  // 8  nose
  '...BSSSMMSsB....',  // 9  mouth
  '....BSSSSB......',  // 10 chin
  '....BOOOOB......',  // 11 collar
  '...BOOOOOOOB....',  // 12 shoulders
  '..BOoOOOOOoOB...',  // 13 torso
  '..BOoOOOOOoOB...',  // 14 torso
  '..BOoOOOOOoOB...',  // 15 torso
  '..BOoOOOOOoOB...',  // 16 torso
  '...BOOOOOOOB....',  // 17 waist
  '...BODDDDOOB....',  // 18 belt
  '....BDDDDDB.....',  // 19 upper legs
  '....BDDDDDB.....',  // 20 legs
  '....BDD..DDB....',  // 21 legs split
  '....BDD..DDB....',  // 22 legs
  '....BDD..DDB....',  // 23 legs
  '....BDD..DDB....',  // 24 lower legs
  '...BXXX..XXXB...',  // 25 ankles
  '...BXXX..XXXB...',  // 26 shoes
  '...BXXX..XXXB...',  // 27 shoes
  '...BBBB..BBBB...',  // 28 shoe sole
  '................',  // 29
  '................',  // 30
  '................',  // 31
];

const T_DOWN_WALK1 = [
  '................',
  '................',
  '....HHHHHH......',
  '...HHHHHHHH.....',
  '..HHHhHHHhHH....',
  '..HHHhHHHhHH....',
  '..BSSSSSSSSSB...',
  '..BSWESSWEssB...',
  '..BSSsSSsSssB...',
  '...BSSSMMSsB....',
  '....BSSSSB......',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '....BDDDDDB.....',
  '...BDD....DDB...',
  '..BDDB.....DDB..',
  '..BDDB.....DDB..',
  '..BXXB.....BXXB.',
  '..BXXB....BXXXB.',
  '.BXXXB....BBBBB.',
  '.BBBBB..........',
  '................',
  '................',
  '................',
  '................',
];

const T_DOWN_WALK2 = [
  '................',
  '................',
  '....HHHHHH......',
  '...HHHHHHHH.....',
  '..HHHhHHHhHH....',
  '..HHHhHHHhHH....',
  '..BSSSSSSSSSB...',
  '..BSWESSWEssB...',
  '..BSSsSSsSssB...',
  '...BSSSMMSsB....',
  '....BSSSSB......',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '....BDDDDDB.....',
  '...DDB....BDD...',
  '..BDDB.....BDD..',
  '..BDDB.....BDD..',
  '.BXXB......BXXB.',
  '.BXXXB.....BXXB.',
  '.BBBBB.....BXXXB',
  '...........BBBBB',
  '................',
  '................',
  '................',
  '................',
];

// ── UP (back-facing) ─────────────────────────────────────

const T_UP_IDLE = [
  '................',
  '................',
  '....HHHHHH......',
  '...HHHHHHHH.....',
  '..HHHhHHHhHH....',
  '..HHHHHHHHHH....',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHHB...',
  '..BHHSSSSHHhB...',
  '...BSSSSSSSB....',
  '....BSSSSB......',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '....BDDDDDB.....',
  '....BDD..DDB....',
  '....BDD..DDB....',
  '....BDD..DDB....',
  '....BDD..DDB....',
  '...BXXX..XXXB...',
  '...BXXX..XXXB...',
  '...BXXX..XXXB...',
  '...BBBB..BBBB...',
  '................',
  '................',
  '................',
];

const T_UP_WALK1 = [
  '................',
  '................',
  '....HHHHHH......',
  '...HHHHHHHH.....',
  '..HHHhHHHhHH....',
  '..HHHHHHHHHH....',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHHB...',
  '..BHHSSSSHHhB...',
  '...BSSSSSSSB....',
  '....BSSSSB......',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '....BDDDDDB.....',
  '...BDD....DDB...',
  '..BDDB.....DDB..',
  '..BDDB.....DDB..',
  '..BXXB.....BXXB.',
  '..BXXB....BXXXB.',
  '.BXXXB....BBBBB.',
  '.BBBBB..........',
  '................',
  '................',
  '................',
  '................',
];

const T_UP_WALK2 = [
  '................',
  '................',
  '....HHHHHH......',
  '...HHHHHHHH.....',
  '..HHHhHHHhHH....',
  '..HHHHHHHHHH....',
  '..BHHHHHHHHHB...',
  '..BHHHHHHHHHB...',
  '..BHHSSSSHHhB...',
  '...BSSSSSSSB....',
  '....BSSSSB......',
  '....BOOOOB......',
  '...BOOOOOOOB....',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '..BOoOOOOOoOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '....BDDDDDB.....',
  '...DDB....BDD...',
  '..BDDB.....BDD..',
  '..BDDB.....BDD..',
  '.BXXB......BXXB.',
  '.BXXXB.....BXXB.',
  '.BBBBB.....BXXXB',
  '...........BBBBB',
  '................',
  '................',
  '................',
  '................',
];

// ── RIGHT (side-facing) ─────────────────────────────────────

const T_RIGHT_IDLE = [
  '................',
  '................',
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '...HHHhHHHhHH...',
  '...HHHhHHHHHH...',
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
  '...BOoOOOOOOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '....BDDDDDB.....',
  '....BDD..DDB....',
  '....BDD..DDB....',
  '....BDD..DDB....',
  '....BDD..DDB....',
  '...BXXX..XXXB...',
  '...BXXX..XXXB...',
  '...BXXX..XXXB...',
  '...BBBB..BBBB...',
  '................',
  '................',
  '................',
];

const T_RIGHT_WALK1 = [
  '................',
  '................',
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '...HHHhHHHhHH...',
  '...HHHhHHHHHH...',
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
  '...BOoOOOOOOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '....BDDDDDB.....',
  '...BDD....DDB...',
  '..BDDB.....DDB..',
  '..BDDB.....DDB..',
  '..BXXB.....BXXB.',
  '..BXXB....BXXXB.',
  '.BXXXB....BBBBB.',
  '.BBBBB..........',
  '................',
  '................',
  '................',
  '................',
];

const T_RIGHT_WALK2 = [
  '................',
  '................',
  '.....HHHHHH.....',
  '....HHHHHHHH....',
  '...HHHhHHHhHH...',
  '...HHHhHHHHHH...',
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
  '...BOoOOOOOOB...',
  '...BOOOOOOOB....',
  '...BODDDDOOB....',
  '....BDDDDDB.....',
  '....BDDDDDB.....',
  '...DDB....BDD...',
  '..BDDB.....BDD..',
  '..BDDB.....BDD..',
  '.BXXB......BXXB.',
  '.BXXXB.....BXXB.',
  '.BBBBB.....BXXXB',
  '...........BBBBB',
  '................',
  '................',
  '................',
  '................',
];

// All templates grouped by direction → [idle, walk1, walk2]
// Frame layout in sheet: walk0(idle), walk1, walk2, type0, type1, read0, read1
// For type/read we reuse idle for now; can be replaced with proper frames later.
const DIRECTIONS = [
  { name: 'down', frames: [T_DOWN_IDLE, T_DOWN_WALK1, T_DOWN_WALK2] },
  { name: 'up',   frames: [T_UP_IDLE, T_UP_WALK1, T_UP_WALK2] },
  { name: 'right', frames: [T_RIGHT_IDLE, T_RIGHT_WALK1, T_RIGHT_WALK2] },
];

// ═══════════════════════════════════════════════════════════════
// Agent palette definitions
// ═══════════════════════════════════════════════════════════════

const AGENTS = [
  {
    name: 'luna',
    hair: '#7c3aed', skin: '#fde68a', outfit: '#a78bfa',
  },
  {
    name: 'max',
    hair: '#065f46', skin: '#fed7aa', outfit: '#34d399',
  },
  {
    name: 'ava',
    hair: '#1e40af', skin: '#fde68a', outfit: '#60a5fa',
  },
  {
    name: 'sam',
    hair: '#92400e', skin: '#fed7aa', outfit: '#fbbf24',
  },
  {
    name: 'rio',
    hair: '#991b1b', skin: '#fed7aa', outfit: '#f87171',
  },
];

function buildPalette(agent) {
  const { hair, skin, outfit } = agent;
  return {
    H: hair,
    h: darken(hair, 0.25),
    S: skin,
    s: darken(skin, 0.15),
    E: '#1a1020',
    W: '#ffffff',
    M: darken(skin, 0.3),
    O: outfit,
    o: darken(outfit, 0.15),
    D: darken(outfit, 0.35),
    X: darken(outfit, 0.5),
    B: '#1a1020',
    '.': '',
  };
}

// ═══════════════════════════════════════════════════════════════
// Minimal PNG encoder (RGBA, no filtering)
// ═══════════════════════════════════════════════════════════════

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (~crc) >>> 0;
}

function writeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const combined = Buffer.concat([typeBytes, data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, combined, checksum]);
}

function encodePNG(width, height, rgba) {
  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw pixel data with filter byte (0 = None) per row
  const rowSize = 1 + width * 4; // filter byte + RGBA
  const rawBuf = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    rawBuf[y * rowSize] = 0; // filter: None
    rgba.copy(rawBuf, y * rowSize + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawBuf, { level: 9 });

  // IEND
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    sig,
    writeChunk('IHDR', ihdr),
    writeChunk('IDAT', compressed),
    writeChunk('IEND', iend),
  ]);
}

// ═══════════════════════════════════════════════════════════════
// Sprite sheet rendering
// ═══════════════════════════════════════════════════════════════

function renderTemplate(template, palette) {
  const rows = [];
  for (const row of template) {
    const normalized = row.padEnd(FRAME_W, '.').slice(0, FRAME_W);
    rows.push(normalized.split('').map(ch => palette[ch] ?? ''));
  }
  // Pad to FRAME_H rows
  while (rows.length < FRAME_H) {
    rows.push(Array(FRAME_W).fill(''));
  }
  return rows;
}

function generateSheet(agent) {
  const palette = buildPalette(agent);
  const rgba = Buffer.alloc(SHEET_W * SHEET_H * 4); // all transparent

  for (let dirIdx = 0; dirIdx < DIRECTIONS.length; dirIdx++) {
    const dir = DIRECTIONS[dirIdx];
    // 7 frames: idle, walk1, walk2, type0(idle), type1(idle), read0(idle), read1(idle)
    const frames = [
      dir.frames[0], // walk0 = idle
      dir.frames[1], // walk1
      dir.frames[2], // walk2
      dir.frames[0], // type0 = idle (placeholder)
      dir.frames[0], // type1 = idle (placeholder)
      dir.frames[0], // read0 = idle (placeholder)
      dir.frames[0], // read1 = idle (placeholder)
    ];

    for (let f = 0; f < frames.length; f++) {
      const sprite = renderTemplate(frames[f], palette);
      const offsetX = f * FRAME_W;
      const offsetY = dirIdx * FRAME_H;

      for (let y = 0; y < FRAME_H; y++) {
        for (let x = 0; x < FRAME_W; x++) {
          const color = sprite[y]?.[x] ?? '';
          const [r, g, b, a] = hexToRGBA(color);
          const px = ((offsetY + y) * SHEET_W + (offsetX + x)) * 4;
          rgba[px] = r;
          rgba[px + 1] = g;
          rgba[px + 2] = b;
          rgba[px + 3] = a;
        }
      }
    }
  }

  return encodePNG(SHEET_W, SHEET_H, rgba);
}

// ═══════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const agent of AGENTS) {
    const png = generateSheet(agent);
    const filePath = join(OUT_DIR, `${agent.name}.png`);
    const stream = createWriteStream(filePath);
    stream.write(png);
    stream.end();
    console.log(`  Generated: ${filePath} (${png.length} bytes)`);
  }

  console.log('\nDone! Sprite sheets generated in public/sprites/agents/');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
