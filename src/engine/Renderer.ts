import type { Agent } from '@/types/agent';
import type { FurnitureItem } from '@/types/office';
import { TileMap } from './TileMap';
import {
  getCharacterSprites,
  drawAccessoryOverlay,
  type SpriteData,
} from './CharacterSprites';

// ═══════════════════════════════════════════════════════════════
// Match pixel-agents: 16px tiles, integer zoom, pixel-perfect
// ═══════════════════════════════════════════════════════════════
const TILE_SIZE = 16;

// Gather / pixel-agents inspired palette
const WALL_COLOR = '#3A3A5C';
const FLOOR_BASE = '#4a4260';
const FLOOR_ALT = '#453d5a';
const CARPET_BASE = '#2e2a52';
const CARPET_ALT = '#2a264e';
const VOID_COLOR = '#12121e';
const DOOR_COLOR = '#6a5acd';
const WINDOW_COLOR = '#5a8cff';

class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private _hasContext = false;
  private tileMap: TileMap;

  cameraX: number;
  cameraY: number;
  zoom: number;
  private time: number;

  constructor(canvas: HTMLCanvasElement, tileMap: TileMap) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.ctx = ctx;
      this._hasContext = true;
    }
    this.tileMap = tileMap;
    this.cameraX = 0;
    this.cameraY = 0;
    this.zoom = 2;
    this.time = 0;
  }

  setTime(t: number): void {
    this.time = t;
  }

  // ─── Coordinate helpers ──────────────────────────────────
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: (worldX - this.cameraX) * this.zoom,
      y: (worldY - this.cameraY) * this.zoom,
    };
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: screenX / this.zoom + this.cameraX,
      y: screenY / this.zoom + this.cameraY,
    };
  }

  screenToTile(screenX: number, screenY: number): { x: number; y: number } {
    const world = this.screenToWorld(screenX, screenY);
    return {
      x: Math.floor(world.x / TILE_SIZE),
      y: Math.floor(world.y / TILE_SIZE),
    };
  }

  // ─── Core operations ─────────────────────────────────────
  get isReady(): boolean {
    return this._hasContext;
  }

  clear(): void {
    if (!this._hasContext) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = VOID_COLOR;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  // ─── Map drawing ─────────────────────────────────────────
  drawMap(furniture: FurnitureItem[]): void {
    if (!this._hasContext) return;
    this.ctx.save();
    this.applyCamera();

    const mapW = this.tileMap.getWidth();
    const mapH = this.tileMap.getHeight();

    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(this.canvas.width, this.canvas.height);
    const startX = Math.max(0, Math.floor(topLeft.x / TILE_SIZE));
    const startY = Math.max(0, Math.floor(topLeft.y / TILE_SIZE));
    const endX = Math.min(mapW - 1, Math.ceil(bottomRight.x / TILE_SIZE));
    const endY = Math.min(mapH - 1, Math.ceil(bottomRight.y / TILE_SIZE));

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        this.drawTile(x, y, this.tileMap.getTile(x, y));
      }
    }

    // Furniture
    for (const item of furniture) {
      this.drawFurniture(item);
    }

    this.ctx.restore();
  }

  // ─── Tile rendering (Gather-style) ───────────────────────
  private drawTile(x: number, y: number, tileType: number): void {
    if (!this._hasContext) return;
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const s = TILE_SIZE;

    switch (tileType) {
      case 0: // void
        this.ctx.fillStyle = VOID_COLOR;
        this.ctx.fillRect(px, py, s, s);
        break;

      case 1: { // floor — checkerboard tile pattern
        const isAlt = (x + y) % 2 === 0;
        this.ctx.fillStyle = isAlt ? FLOOR_ALT : FLOOR_BASE;
        this.ctx.fillRect(px, py, s, s);
        // Subtle grid lines (pixel-agents style)
        this.ctx.fillStyle = 'rgba(255,255,255,0.05)';
        this.ctx.fillRect(px, py, s, 1);
        this.ctx.fillRect(px, py, 1, s);
        // Tiny floor detail dots
        if ((x * 7 + y * 13) % 5 === 0) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.04)';
          this.ctx.fillRect(px + 6, py + 6, 2, 2);
        }
        break;
      }

      case 2: { // wall — 3D brick style
        this.ctx.fillStyle = WALL_COLOR;
        this.ctx.fillRect(px, py, s, s);
        // Top highlight
        this.ctx.fillStyle = '#5a5a7a';
        this.ctx.fillRect(px, py, s, 1);
        this.ctx.fillRect(px, py, 1, s);
        // Bottom shadow
        this.ctx.fillStyle = '#2a2a3c';
        this.ctx.fillRect(px + s - 1, py, 1, s);
        this.ctx.fillRect(px, py + s - 1, s, 1);
        // Brick lines
        this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.ctx.fillRect(px + 1, py + 4, s - 2, 1);
        this.ctx.fillRect(px + 1, py + 9, s - 2, 1);
        this.ctx.fillRect(px + s / 2, py + 1, 1, 3);
        this.ctx.fillRect(px + 4, py + 5, 1, 4);
        this.ctx.fillRect(px + s / 2 + 3, py + 10, 1, 4);
        break;
      }

      case 3: { // carpet
        const isAlt = (x + y) % 2 === 0;
        this.ctx.fillStyle = isAlt ? CARPET_ALT : CARPET_BASE;
        this.ctx.fillRect(px, py, s, s);
        // Diamond pattern on carpet
        this.ctx.fillStyle = 'rgba(100,100,220,0.06)';
        this.ctx.fillRect(px + 3, py + 3, 2, 2);
        this.ctx.fillRect(px + 11, py + 3, 2, 2);
        this.ctx.fillRect(px + 7, py + 7, 2, 2);
        this.ctx.fillRect(px + 3, py + 11, 2, 2);
        this.ctx.fillRect(px + 11, py + 11, 2, 2);
        break;
      }

      case 4: { // door
        this.ctx.fillStyle = DOOR_COLOR;
        this.ctx.fillRect(px, py, s, s);
        // Door panel
        this.ctx.fillStyle = '#7a6adf';
        this.ctx.fillRect(px + 2, py + 1, s - 4, s - 2);
        // Knob
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillRect(px + s - 4, py + 7, 2, 2);
        break;
      }

      case 5: { // window
        this.ctx.fillStyle = WALL_COLOR;
        this.ctx.fillRect(px, py, s, s);
        // Glass
        this.ctx.fillStyle = '#4a7adf';
        this.ctx.fillRect(px + 2, py + 2, s - 4, s - 4);
        // Cross frame
        this.ctx.fillStyle = '#6a9aff';
        this.ctx.fillRect(px + s / 2, py + 2, 1, s - 4);
        this.ctx.fillRect(px + 2, py + s / 2, s - 4, 1);
        // Glow
        this.ctx.fillStyle = 'rgba(90,140,255,0.12)';
        this.ctx.fillRect(px, py, s, s);
        break;
      }
    }
  }

  // ─── Furniture ───────────────────────────────────────────
  private drawFurniture(item: FurnitureItem): void {
    if (!this._hasContext) return;
    const px = item.x * TILE_SIZE;
    const py = item.y * TILE_SIZE;
    const pw = item.width * TILE_SIZE;
    const ph = item.height * TILE_SIZE;

    this.ctx.fillStyle = item.color;
    this.ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);

    // Top highlight
    this.ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this.ctx.fillRect(px + 1, py + 1, pw - 2, 1);
    // Bottom shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.25)';
    this.ctx.fillRect(px + 1, py + ph - 2, pw - 2, 1);

    const cat = item.catalogId;
    if (cat === 'desk_office') {
      // Screen
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.fillRect(px + 2, py + 2, pw - 4, ph - 5);
      const glow = 0.3 + 0.2 * Math.sin(this.time * 2);
      this.ctx.fillStyle = `rgba(90,140,255,${glow})`;
      this.ctx.fillRect(px + 3, py + 3, pw - 6, ph - 7);
    } else if (cat === 'server_rack') {
      const blink = Math.sin(this.time * 3) > 0;
      this.ctx.fillStyle = blink ? '#22c55e' : '#166534';
      this.ctx.fillRect(px + 2, py + 2, 2, 2);
      this.ctx.fillStyle = '#5a8cff';
      this.ctx.fillRect(px + 2, py + 5, 2, 2);
      this.ctx.fillStyle = blink ? '#166534' : '#ef4444';
      this.ctx.fillRect(px + 2, py + 8, 2, 2);
    } else if (cat === 'coffee_machine') {
      this.ctx.fillStyle = '#065f46';
      this.ctx.fillRect(px + 2, py + 2, pw - 4, 4);
      // Steam
      const a = 0.2 + 0.1 * Math.abs(Math.sin(this.time * 1.8));
      this.ctx.fillStyle = `rgba(200,220,240,${a})`;
      this.ctx.fillRect(px + pw / 2 - 1, py - 1, 2, 2);
    } else if (cat === 'vending_machine') {
      this.ctx.fillStyle = '#1a2a5a';
      this.ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);
      ['#ef4444', '#f59e0b', '#10b981', '#5a8cff'].forEach((c, i) => {
        this.ctx.fillStyle = c;
        this.ctx.fillRect(px + 2, py + 2 + i * 3, pw - 4, 2);
      });
    }

    // Pixel border
    this.ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
  }

  // ─── Agent drawing (pixel-art sprites) ───────────────────
  drawAgent(agent: Agent, frameIndex: number): void {
    if (!this._hasContext) return;
    this.ctx.save();
    this.applyCamera();

    const { px: agentPx, py: agentPy } = agent.position;
    const dir = agent.direction;
    const sprites = getCharacterSprites(agent.appearance);

    // Determine sprite
    let sprite: SpriteData;
    const walkFrames = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    const isWalking = walkFrames.includes(frameIndex);

    if (isWalking) {
      const walkCycle = [0, 1, 0, 2]; // idle-step1-idle-step2
      const walkIdx = walkCycle[frameIndex % 4];
      sprite = sprites.walk[dir][walkIdx];
    } else {
      sprite = sprites.idle[dir];
    }

    const spriteH = sprite.length;
    const spriteW = spriteH > 0 ? sprite[0].length : 16;

    // Center horizontally in tile, anchor at bottom
    const drawX = agentPx + (TILE_SIZE - spriteW) / 2;
    const drawY = agentPy + TILE_SIZE - spriteH;
    const bounceY = isWalking ? (frameIndex % 2 === 0 ? -1 : 0) : 0;

    // Shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.25)';
    this.ctx.beginPath();
    this.ctx.ellipse(agentPx + TILE_SIZE / 2, agentPy + TILE_SIZE - 1, 5, 2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw sprite pixel by pixel
    for (let r = 0; r < spriteH; r++) {
      const row = sprite[r];
      for (let c = 0; c < row.length; c++) {
        const color = row[c];
        if (color === '') continue;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(drawX + c, drawY + r + bounceY, 1, 1);
      }
    }

    // Accessories
    for (const acc of agent.appearance.accessories) {
      drawAccessoryOverlay(this.ctx, acc, drawX, drawY + bounceY, 1, agent.appearance.outfitColor);
    }

    // Working glow
    if (agent.state === 'working') {
      const blinkOn = Math.sin(this.time * 4) > 0;
      if (blinkOn) {
        this.ctx.fillStyle = 'rgba(90,200,140,0.18)';
        this.ctx.fillRect(drawX - 1, drawY + spriteH - 1, spriteW + 2, 3);
        this.ctx.fillStyle = '#5ac88c';
        this.ctx.fillRect(drawX + spriteW / 2 - 1, drawY + spriteH + 1, 2, 2);
      }
    }

    this.ctx.restore();
  }

  // ─── Speech bubble ───────────────────────────────────────
  drawSpeechBubble(agent: Agent, text: string): void {
    if (!this._hasContext) return;
    this.ctx.save();
    this.applyCamera();

    const { px, py } = agent.position;
    const centerX = px + TILE_SIZE / 2;
    const bubbleBaseY = py - 10;

    const fontSize = 5;
    this.ctx.font = `bold ${fontSize}px monospace`;

    const maxWidth = 70;
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (this.ctx.measureText(testLine).width > maxWidth) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);

    const lineH = fontSize + 2;
    const textW = Math.max(...lines.map((l) => this.ctx.measureText(l).width));
    const padX = 3;
    const padY = 2;
    const bubbleW = textW + padX * 2;
    const bubbleH = lines.length * lineH + padY * 2;
    const bx = centerX - bubbleW / 2;
    const by = bubbleBaseY - bubbleH - 4;

    // Dark bubble background (pixel-agents style)
    this.ctx.fillStyle = 'rgba(30,30,46,0.92)';
    this.ctx.fillRect(bx, by, bubbleW, bubbleH);
    this.ctx.strokeStyle = '#6a6a8a';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(bx, by, bubbleW, bubbleH);

    // Tail
    this.ctx.fillStyle = 'rgba(30,30,46,0.92)';
    this.ctx.fillRect(centerX - 2, by + bubbleH, 4, 3);
    this.ctx.fillRect(centerX - 1, by + bubbleH + 3, 2, 1);

    // Text
    this.ctx.fillStyle = '#e0e0f0';
    this.ctx.textBaseline = 'top';
    lines.forEach((l, i) => {
      this.ctx.fillText(l, bx + padX, by + padY + i * lineH);
    });

    this.ctx.restore();
  }

  // ─── Name tag (floating label like Gather) ───────────────
  drawAgentNameTag(agent: Agent): void {
    if (!this._hasContext) return;
    this.ctx.save();
    this.applyCamera();

    const { px, py } = agent.position;
    const centerX = px + TILE_SIZE / 2;
    const tagY = py + TILE_SIZE + 1;

    const fontSize = 5;
    this.ctx.font = `bold ${fontSize}px monospace`;
    const textW = this.ctx.measureText(agent.name).width;
    const padX = 2;
    const padY = 1;
    const tagW = textW + padX * 2;
    const tagH = fontSize + padY * 2;
    const tx = centerX - tagW / 2;

    // Semi-transparent background
    this.ctx.fillStyle = 'rgba(30,30,46,0.7)';
    this.ctx.fillRect(tx, tagY, tagW, tagH);

    // Agent color accent line at bottom
    this.ctx.fillStyle = agent.primaryColor;
    this.ctx.fillRect(tx, tagY + tagH - 1, tagW, 1);

    // Text
    this.ctx.fillStyle = '#e0e0f0';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(agent.name, tx + padX, tagY + padY);

    this.ctx.restore();
  }

  // ─── Editor placement preview ────────────────────────────
  drawPlacementPreview(
    tileX: number, tileY: number,
    tileW: number, tileH: number,
    color: string, isValid: boolean,
  ): void {
    if (!this._hasContext) return;
    this.ctx.save();
    this.applyCamera();

    const px = tileX * TILE_SIZE;
    const py = tileY * TILE_SIZE;
    const pw = tileW * TILE_SIZE;
    const ph = tileH * TILE_SIZE;

    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = isValid ? color : '#ef4444';
    this.ctx.fillRect(px, py, pw, ph);

    this.ctx.globalAlpha = 0.9;
    this.ctx.strokeStyle = isValid ? '#5a8cff' : '#fca5a5';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);

    this.ctx.globalAlpha = 1;
    this.ctx.restore();
  }

  // ─── Camera ──────────────────────────────────────────────
  private applyCamera(): void {
    if (!this._hasContext) return;
    this.ctx.setTransform(
      this.zoom, 0, 0, this.zoom,
      -this.cameraX * this.zoom,
      -this.cameraY * this.zoom,
    );
  }
}

export { Renderer, TILE_SIZE };
