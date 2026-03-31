import type { Agent } from '@/types/agent';
import type { FurnitureItem } from '@/types/office';
import { TileMap } from './TileMap';
import {
  getCharacterSprites,
  drawAccessoryOverlay,
  type SpriteData,
} from './CharacterSprites';

const TILE_SIZE = 32; // pixels per tile

// ═══════════════════════════════════════════════════════════════
// Gather / Pixel-agents inspired tile palette
// ═══════════════════════════════════════════════════════════════

const TILE_COLORS: Record<number, string> = {
  0: '#12121e', // void — deep dark
  1: '#3a3a5c', // floor — warm purple-gray (like Gather office floor)
  2: '#4a4a6a', // wall — lighter purple-gray
  3: '#2a2a50', // carpet — deep blue-purple
  4: '#6a5acd', // door — slate blue-purple
  5: '#5a8cff', // window — accent blue
};

const TILE_BORDER_COLORS: Record<number, string> = {
  2: '#3a3a5c',
};

class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private _hasContext = false;
  private tileMap: TileMap;

  // Camera state
  cameraX: number;
  cameraY: number;
  zoom: number;

  // Animation time
  private time: number;

  // Sprite canvas cache (zoom → Map<spriteKey, canvas>)
  private spriteCanvasCache = new Map<string, HTMLCanvasElement>();

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
    this.zoom = 1;
    this.time = 0;
  }

  setTime(t: number): void {
    this.time = t;
  }

  // ─────────────────────────────────────────────
  // Coordinate helpers
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // Core operations
  // ─────────────────────────────────────────────

  get isReady(): boolean {
    return this._hasContext;
  }

  clear(): void {
    if (!this._hasContext) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#12121e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  // ─────────────────────────────────────────────
  // Map drawing
  // ─────────────────────────────────────────────

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
        const tileType = this.tileMap.getTile(x, y);
        this.drawTile(x, y, tileType);
      }
    }

    // Draw furniture on top of tiles
    for (const item of furniture) {
      this.drawFurniture(item);
    }

    this.ctx.restore();
  }

  // ─────────────────────────────────────────────
  // Tile drawing — Gather-inspired style
  // ─────────────────────────────────────────────

  private drawTile(x: number, y: number, tileType: number): void {
    if (!this._hasContext) return;
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const s = TILE_SIZE;

    const color = TILE_COLORS[tileType] ?? '#12121e';
    this.ctx.fillStyle = color;
    this.ctx.fillRect(px, py, s, s);

    switch (tileType) {
      case 2: {
        // Wall: 3D brick effect
        const border = TILE_BORDER_COLORS[2];
        // Top/left highlight
        this.ctx.fillStyle = '#5a5a7a';
        this.ctx.fillRect(px, py, s, 2);
        this.ctx.fillRect(px, py, 2, s);
        // Bottom/right shadow
        this.ctx.fillStyle = border;
        this.ctx.fillRect(px + s - 2, py, 2, s);
        this.ctx.fillRect(px, py + s - 2, s, 2);
        // Brick pattern
        this.ctx.fillStyle = 'rgba(255,255,255,0.04)';
        this.ctx.fillRect(px + 2, py + 4, s / 2 - 2, 1);
        this.ctx.fillRect(px + s / 2 + 2, py + 12, s / 2 - 4, 1);
        this.ctx.fillRect(px + 4, py + 20, s / 2 - 2, 1);
        this.ctx.fillRect(px + s / 2, py + 28, s / 2 - 2, 1);
        break;
      }
      case 3: {
        // Carpet: warm dot pattern
        this.ctx.fillStyle = 'rgba(100,100,200,0.06)';
        for (let dy = 2; dy < s; dy += 4) {
          for (let dx = 2; dx < s; dx += 4) {
            this.ctx.fillRect(px + dx, py + dy, 2, 2);
          }
        }
        // Subtle border highlight
        this.ctx.fillStyle = 'rgba(100,100,200,0.1)';
        this.ctx.fillRect(px, py, s, 1);
        this.ctx.fillRect(px, py, 1, s);
        break;
      }
      case 1: {
        // Floor: subtle tile grid pattern (Gather-style)
        // Checkerboard tint
        if ((x + y) % 2 === 0) {
          this.ctx.fillStyle = 'rgba(255,255,255,0.03)';
          this.ctx.fillRect(px, py, s, s);
        }
        // Subtle grid lines
        this.ctx.fillStyle = 'rgba(255,255,255,0.06)';
        this.ctx.fillRect(px, py, s, 1);
        this.ctx.fillRect(px, py, 1, s);
        break;
      }
      case 4: {
        // Door: frame + panel
        this.ctx.fillStyle = '#5a4abf';
        this.ctx.fillRect(px + 2, py + 2, s - 4, s - 4);
        // Arch top
        this.ctx.fillStyle = '#7a6adf';
        this.ctx.fillRect(px + 4, py + 2, s - 8, 3);
        // Door knob
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillRect(px + s - 8, py + s / 2 - 1, 3, 3);
        break;
      }
      case 5: {
        // Window: glowing blue
        this.ctx.fillStyle = '#4a7adf';
        this.ctx.fillRect(px + 3, py + 3, s - 6, s - 6);
        // Cross divider
        this.ctx.fillStyle = '#6a9aff';
        this.ctx.fillRect(px + s / 2 - 1, py + 3, 2, s - 6);
        this.ctx.fillRect(px + 3, py + s / 2 - 1, s - 6, 2);
        // Glow effect
        this.ctx.fillStyle = 'rgba(90,140,255,0.15)';
        this.ctx.fillRect(px, py, s, s);
        break;
      }
      default:
        break;
    }

    // Subtle grid overlay for non-void tiles
    if (tileType !== 0) {
      this.ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
    }
  }

  // ─────────────────────────────────────────────
  // Furniture drawing
  // ─────────────────────────────────────────────

  private drawFurniture(item: FurnitureItem): void {
    if (!this._hasContext) return;
    const px = item.x * TILE_SIZE;
    const py = item.y * TILE_SIZE;
    const pw = item.width * TILE_SIZE;
    const ph = item.height * TILE_SIZE;

    // Base fill
    this.ctx.fillStyle = item.color;
    this.ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);

    // Light top edge highlight
    this.ctx.fillStyle = 'rgba(255,255,255,0.18)';
    this.ctx.fillRect(px + 1, py + 1, pw - 2, 2);

    // Dark bottom edge shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.fillRect(px + 1, py + ph - 3, pw - 2, 2);

    // Category-specific decorations
    const cat = item.catalogId;

    if (cat === 'desk_office') {
      // Monitor shape
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.fillRect(px + 4, py + 3, pw - 8, ph - 10);
      // Screen glow
      const glow = 0.5 + 0.2 * Math.sin(this.time * 2.0);
      this.ctx.fillStyle = `rgba(90,140,255,${glow * 0.4})`;
      this.ctx.fillRect(px + 5, py + 4, pw - 10, ph - 12);
      // Screen content lines
      this.ctx.fillStyle = 'rgba(90,200,140,0.4)';
      for (let ly = py + 6; ly < py + ph - 10; ly += 3) {
        const lw = 4 + Math.floor(Math.random() * 6);
        this.ctx.fillRect(px + 6, ly, Math.min(lw, pw - 14), 1);
      }
    } else if (cat === 'table_meeting') {
      this.ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let lx = px + 6; lx < px + pw - 4; lx += 10) {
        this.ctx.fillRect(lx, py + 4, 1, ph - 8);
      }
    } else if (cat === 'server_rack') {
      // Server rack: blinking LEDs
      const blink = Math.sin(this.time * 3.0) > 0;
      this.ctx.fillStyle = blink ? '#22c55e' : '#166534';
      this.ctx.fillRect(px + 4, py + 4, 3, 2);
      this.ctx.fillStyle = '#5a8cff';
      this.ctx.fillRect(px + 4, py + 9, 3, 2);
      this.ctx.fillStyle = blink ? '#166534' : '#ef4444';
      this.ctx.fillRect(px + 4, py + 14, 3, 2);
      // Rack horizontal lines
      this.ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let ry = py + 6; ry < py + ph - 4; ry += 5) {
        this.ctx.fillRect(px + 2, ry, pw - 4, 1);
      }
    } else if (cat === 'coffee_machine') {
      // Coffee display
      this.ctx.fillStyle = '#065f46';
      this.ctx.fillRect(px + 3, py + 4, pw - 6, 6);
      // Cup
      this.ctx.fillStyle = '#92400e';
      this.ctx.fillRect(px + pw / 2 - 3, py + ph - 8, 6, 5);
      // Animated steam
      const steamAlpha = 0.2 + 0.15 * Math.abs(Math.sin(this.time * 1.8));
      this.ctx.fillStyle = `rgba(200,220,240,${steamAlpha})`;
      const cx = px + pw / 2;
      const sy = py + 2;
      this.ctx.beginPath();
      this.ctx.arc(cx + Math.sin(this.time * 2) * 2, sy - Math.abs(Math.sin(this.time * 1.5)) * 3, 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(cx + Math.sin(this.time * 2 + 1) * 2, sy - Math.abs(Math.sin(this.time * 1.5 + 1)) * 3 - 2, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (cat === 'vending_machine') {
      this.ctx.fillStyle = '#1a2a5a';
      this.ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4);
      const snackColors = ['#ef4444', '#f59e0b', '#10b981', '#5a8cff'];
      snackColors.forEach((sc, i) => {
        this.ctx.fillStyle = sc;
        this.ctx.fillRect(px + 4, py + 4 + i * 7, pw - 8, 4);
      });
    } else if (cat.includes('chair')) {
      this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
      this.ctx.fillRect(px + 3, py + 3, pw - 6, ph - 8);
      this.ctx.fillStyle = 'rgba(0,0,0,0.25)';
      this.ctx.fillRect(px + 3, py + 2, pw - 6, 3);
    } else if (cat === 'table_small') {
      this.ctx.beginPath();
      this.ctx.arc(px + pw / 2, py + ph / 2, Math.min(pw, ph) / 2 - 4, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255,255,255,0.08)';
      this.ctx.fill();
    }

    // Pixel-art border
    this.ctx.strokeStyle = 'rgba(0,0,0,0.45)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
  }

  // ─────────────────────────────────────────────
  // Agent drawing — pixel-art sprite system
  // ─────────────────────────────────────────────

  drawAgent(agent: Agent, frameIndex: number): void {
    if (!this._hasContext) return;
    this.ctx.save();
    this.applyCamera();

    const { px: agentPx, py: agentPy } = agent.position;
    const dir = agent.direction;

    // Get the sprite set for this agent's appearance
    const sprites = getCharacterSprites(agent.appearance);

    // Determine which sprite to use based on state and frame
    let sprite: SpriteData;
    const walkFrames = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    const isWalking = walkFrames.includes(frameIndex);

    if (isWalking) {
      // Walk animation: cycle through [0, 1, 0, 2] pattern
      const walkCycle = [0, 1, 0, 2];
      const walkIdx = walkCycle[frameIndex % 4];
      sprite = sprites.walk[dir][walkIdx];
    } else {
      sprite = sprites.idle[dir];
    }

    // Character dimensions from sprite data
    const spriteH = sprite.length;
    const spriteW = spriteH > 0 ? sprite[0].length : 16;

    // Center the sprite in the tile, anchor at bottom
    const drawX = agentPx + (TILE_SIZE - spriteW) / 2;
    const drawY = agentPy + TILE_SIZE - spriteH;

    // Walking bounce
    const bounceY = isWalking ? (frameIndex % 2 === 0 ? -1 : 0) : 0;

    // Shadow ellipse
    this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
    this.ctx.beginPath();
    this.ctx.ellipse(
      agentPx + TILE_SIZE / 2,
      agentPy + TILE_SIZE - 2,
      7, 3, 0, 0, Math.PI * 2,
    );
    this.ctx.fill();

    // Draw the sprite pixel by pixel
    for (let r = 0; r < spriteH; r++) {
      const row = sprite[r];
      for (let c = 0; c < row.length; c++) {
        const color = row[c];
        if (color === '') continue;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(drawX + c, drawY + r + bounceY, 1, 1);
      }
    }

    // Draw accessories on top
    for (const acc of agent.appearance.accessories) {
      drawAccessoryOverlay(
        this.ctx,
        acc,
        drawX,
        drawY + bounceY,
        1, // zoom = 1 since we're in world coords
        agent.appearance.outfitColor,
      );
    }

    // Working state: screen glow effect
    if (agent.state === 'working') {
      const blinkOn = Math.sin(this.time * 4.0) > 0;
      if (blinkOn) {
        this.ctx.fillStyle = 'rgba(90,200,140,0.2)';
        this.ctx.fillRect(drawX - 1, drawY + spriteH - 2, spriteW + 2, 4);
        this.ctx.fillStyle = '#5ac88c';
        this.ctx.fillRect(drawX + spriteW / 2 - 1, drawY + spriteH + 1, 2, 3);
      }
    }

    this.ctx.restore();
  }

  // ─────────────────────────────────────────────
  // Speech bubble
  // ─────────────────────────────────────────────

  drawSpeechBubble(agent: Agent, text: string): void {
    if (!this._hasContext) return;
    this.ctx.save();
    this.applyCamera();

    const { px, py } = agent.position;
    const centerX = px + TILE_SIZE / 2;
    const bubbleY = py - 8;

    const fontSize = 8;
    this.ctx.font = `bold ${fontSize}px monospace`;

    const maxWidth = 110;
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

    const lineH = fontSize + 3;
    const textW = Math.max(...lines.map((l) => this.ctx.measureText(l).width));
    const padX = 5;
    const padY = 3;
    const bubbleW = textW + padX * 2;
    const bubbleH = lines.length * lineH + padY * 2;
    const bx = centerX - bubbleW / 2;
    const by = bubbleY - bubbleH - 6;

    // Bubble background — pixel-art style (no rounded corners)
    this.ctx.fillStyle = 'rgba(30,30,46,0.92)';
    this.ctx.fillRect(bx, by, bubbleW, bubbleH);

    // Border
    this.ctx.strokeStyle = '#6a6a8a';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(bx, by, bubbleW, bubbleH);

    // Tail
    this.ctx.fillStyle = 'rgba(30,30,46,0.92)';
    this.ctx.fillRect(centerX - 3, by + bubbleH, 6, 4);
    this.ctx.fillRect(centerX - 1, by + bubbleH + 4, 2, 2);

    // Text
    this.ctx.fillStyle = '#e0e0f0';
    this.ctx.textBaseline = 'top';
    lines.forEach((l, i) => {
      this.ctx.fillText(l, bx + padX, by + padY + i * lineH);
    });

    this.ctx.restore();
  }

  // ─────────────────────────────────────────────
  // Name tag
  // ─────────────────────────────────────────────

  drawAgentNameTag(agent: Agent): void {
    if (!this._hasContext) return;
    this.ctx.save();
    this.applyCamera();

    const { px, py } = agent.position;
    const centerX = px + TILE_SIZE / 2;
    const tagY = py + TILE_SIZE + 1;

    const fontSize = 7;
    this.ctx.font = `bold ${fontSize}px monospace`;
    const textW = this.ctx.measureText(agent.name).width;
    const padX = 3;
    const padY = 2;
    const tagW = textW + padX * 2;
    const tagH = fontSize + padY * 2;
    const tx = centerX - tagW / 2;

    // Semi-transparent dark background
    this.ctx.fillStyle = 'rgba(30,30,46,0.75)';
    this.ctx.fillRect(tx, tagY, tagW, tagH);

    // Colored bottom accent line
    this.ctx.fillStyle = agent.primaryColor;
    this.ctx.fillRect(tx, tagY + tagH - 1, tagW, 1);

    // Name text
    this.ctx.fillStyle = '#e0e0f0';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(agent.name, tx + padX, tagY + padY);

    this.ctx.restore();
  }

  // ─────────────────────────────────────────────
  // Editor placement preview
  // ─────────────────────────────────────────────

  drawPlacementPreview(
    tileX: number,
    tileY: number,
    tileW: number,
    tileH: number,
    color: string,
    isValid: boolean,
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
    this.ctx.lineWidth = 2 / this.zoom;
    this.ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

    this.ctx.globalAlpha = 1;
    this.ctx.restore();
  }

  // ─────────────────────────────────────────────
  // Camera helpers
  // ─────────────────────────────────────────────

  private applyCamera(): void {
    if (!this._hasContext) return;
    this.ctx.setTransform(
      this.zoom, 0,
      0, this.zoom,
      -this.cameraX * this.zoom,
      -this.cameraY * this.zoom,
    );
  }

  // ─────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────

  private darken(hex: string, ratio: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const d = 1 - ratio;
    return `rgb(${Math.floor(r * d)},${Math.floor(g * d)},${Math.floor(b * d)})`;
  }

  private roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }
}

export { Renderer, TILE_SIZE };
