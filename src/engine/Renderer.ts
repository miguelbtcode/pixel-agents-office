import type { Agent } from '@/types/agent';
import type { FurnitureItem } from '@/types/office';
import { TileMap } from './TileMap';

const TILE_SIZE = 32; // pixels per tile

// Tile colour palette
const TILE_COLORS: Record<number, string> = {
  0: '#0d1117', // void
  1: '#2d3748', // floor
  2: '#4a5568', // wall
  3: '#1a2744', // carpet
  4: '#805ad5', // door
  5: '#60a5fa', // window
};

const TILE_BORDER_COLORS: Record<number, string> = {
  2: '#2d3748', // wall inner shadow
};

class Renderer {
  private canvas: HTMLCanvasElement;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  private ctx!: CanvasRenderingContext2D;
  private _hasContext = false;
  private tileMap: TileMap;

  // Camera state (public so OfficeCanvas can manipulate)
  cameraX: number;
  cameraY: number;
  zoom: number;

  // Animation time in seconds (updated each frame via setTime)
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
    this.zoom = 1;
    this.time = 0;
  }

  /** Update the current animation time (seconds). Called from the game loop. */
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
    this.ctx.fillStyle = '#0d1117';
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

    // Determine which tiles are actually visible to skip off-screen drawing
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
  // Tile drawing
  // ─────────────────────────────────────────────

  private drawTile(x: number, y: number, tileType: number): void {
    if (!this._hasContext) return;
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const s = TILE_SIZE;

    const color = TILE_COLORS[tileType] ?? '#0d1117';
    this.ctx.fillStyle = color;
    this.ctx.fillRect(px, py, s, s);

    switch (tileType) {
      case 2: {
        // Wall: darker top/left border for 3D feel
        const border = TILE_BORDER_COLORS[2];
        this.ctx.fillStyle = border;
        // Top edge
        this.ctx.fillRect(px, py, s, 3);
        // Left edge
        this.ctx.fillRect(px, py, 3, s);
        // Highlight bottom-right
        this.ctx.fillStyle = '#606878';
        this.ctx.fillRect(px + s - 2, py, 2, s);
        this.ctx.fillRect(px, py + s - 2, s, 2);
        break;
      }
      case 3: {
        // Carpet: subtle dot pattern
        this.ctx.fillStyle = 'rgba(255,255,255,0.04)';
        for (let dy = 4; dy < s; dy += 8) {
          for (let dx = 4; dx < s; dx += 8) {
            this.ctx.fillRect(px + dx, py + dy, 2, 2);
          }
        }
        break;
      }
      case 1: {
        // Floor: subtle scanline effect — every 4th pixel row slightly darker (static)
        this.ctx.fillStyle = 'rgba(0,0,0,0.06)';
        for (let row = 0; row < s; row += 4) {
          this.ctx.fillRect(px, py + row, s, 1);
        }
        break;
      }
      case 4: {
        // Door: frame + panel inset
        this.ctx.fillStyle = '#6d28d9';
        this.ctx.fillRect(px + 2, py + 2, s - 4, s - 4);
        // Door knob
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillRect(px + s - 8, py + s / 2 - 2, 3, 4);
        break;
      }
      case 5: {
        // Window: inner lighter rect
        this.ctx.fillStyle = '#93c5fd';
        this.ctx.fillRect(px + 3, py + 3, s - 6, s - 6);
        // Cross divider
        this.ctx.fillStyle = '#bfdbfe';
        this.ctx.fillRect(px + s / 2 - 1, py + 3, 2, s - 6);
        this.ctx.fillRect(px + 3, py + s / 2 - 1, s - 6, 2);
        break;
      }
      default:
        break;
    }

    // Thin grid line
    this.ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    this.ctx.lineWidth = 0.5;
    this.ctx.strokeRect(px, py, s, s);
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
    this.ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this.ctx.fillRect(px + 1, py + 1, pw - 2, 3);

    // Dark bottom edge shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.35)';
    this.ctx.fillRect(px + 1, py + ph - 4, pw - 2, 3);

    // Category-specific decorations
    const cat = item.catalogId;

    if (cat === 'desk_office') {
      // Monitor shape on desk
      this.ctx.fillStyle = '#111827';
      this.ctx.fillRect(px + 4, py + 3, pw - 8, ph - 10);
      // Screen glow
      this.ctx.fillStyle = '#1e40af';
      this.ctx.fillRect(px + 6, py + 5, pw - 12, ph - 14);
    } else if (cat === 'table_meeting') {
      // Table surface lines
      this.ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let lx = px + 6; lx < px + pw - 4; lx += 10) {
        this.ctx.fillRect(lx, py + 4, 1, ph - 8);
      }
    } else if (cat === 'server_rack') {
      // Server rack: blinking LEDs
      this.ctx.fillStyle = '#22c55e';
      this.ctx.fillRect(px + 4, py + 4, 4, 3);
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.fillRect(px + 4, py + 10, 4, 3);
      this.ctx.fillStyle = '#ef4444';
      this.ctx.fillRect(px + 4, py + 16, 4, 3);
      // Rack lines
      this.ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let ry = py + 6; ry < py + ph - 4; ry += 6) {
        this.ctx.fillRect(px + 2, ry, pw - 4, 1);
      }
    } else if (cat === 'coffee_machine') {
      // Coffee machine: spout + cup
      this.ctx.fillStyle = '#92400e';
      this.ctx.fillRect(px + pw / 2 - 4, py + ph - 10, 8, 6);
      // Display
      this.ctx.fillStyle = '#065f46';
      this.ctx.fillRect(px + 3, py + 4, pw - 6, 8);
      // Animated steam puffs (3 circles oscillating using this.time)
      const steamCenterX = px + pw / 2;
      const steamBaseY = py + 2;
      const steamAlpha = 0.25 + 0.15 * Math.abs(Math.sin(this.time * 1.8));
      this.ctx.fillStyle = `rgba(200,220,240,${steamAlpha})`;
      // Puff 1 — offset with sin phase 0
      const p1x = steamCenterX - 3 + 2 * Math.sin(this.time * 2.0);
      const p1y = steamBaseY - 4 * Math.abs(Math.sin(this.time * 1.5));
      this.ctx.beginPath();
      this.ctx.arc(p1x, p1y, 2, 0, Math.PI * 2);
      this.ctx.fill();
      // Puff 2 — offset with sin phase π/2
      const p2x = steamCenterX + 1 + 2 * Math.sin(this.time * 2.0 + 1.0);
      const p2y = steamBaseY - 4 * Math.abs(Math.sin(this.time * 1.5 + 1.0)) - 2;
      this.ctx.beginPath();
      this.ctx.arc(p2x, p2y, 1.5, 0, Math.PI * 2);
      this.ctx.fill();
      // Puff 3 — offset with sin phase π
      const p3x = steamCenterX - 1 + 2 * Math.sin(this.time * 2.0 + 2.0);
      const p3y = steamBaseY - 4 * Math.abs(Math.sin(this.time * 1.5 + 2.0)) - 5;
      this.ctx.beginPath();
      this.ctx.arc(p3x, p3y, 1, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (cat === 'vending_machine') {
      // Vending machine: rows of items
      this.ctx.fillStyle = '#1e3a8a';
      this.ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4);
      // Colourful snack rows
      const snackColors = ['#ef4444', '#f59e0b', '#10b981', '#6366f1'];
      snackColors.forEach((sc, i) => {
        this.ctx.fillStyle = sc;
        this.ctx.fillRect(px + 4, py + 4 + i * 8, pw - 8, 5);
      });
    } else if (cat.includes('chair')) {
      // Chair: seat + back
      this.ctx.fillStyle = 'rgba(255,255,255,0.12)';
      this.ctx.fillRect(px + 4, py + 4, pw - 8, ph - 10);
      // Chair back
      this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
      this.ctx.fillRect(px + 4, py + 2, pw - 8, 4);
    } else if (cat === 'table_small') {
      // Small table: circular top indicator
      this.ctx.beginPath();
      this.ctx.arc(px + pw / 2, py + ph / 2, Math.min(pw, ph) / 2 - 4, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255,255,255,0.08)';
      this.ctx.fill();
    }

    // Border
    this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
  }

  // ─────────────────────────────────────────────
  // Agent drawing
  // ─────────────────────────────────────────────

  drawAgent(agent: Agent, frameIndex: number): void {
    if (!this._hasContext) return;
    this.ctx.save();
    this.applyCamera();

    const { px, py } = agent.position;
    const { hairColor, outfitColor, skinColor } = agent.appearance;
    const dir = agent.direction;

    // Walking bounce: slight vertical offset based on frame
    const walkFrames = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    const isWalking = walkFrames.includes(frameIndex);
    const bounceY = isWalking ? (frameIndex % 2 === 0 ? -1 : 1) : 0;

    // Center the character in the tile
    const drawX = px + TILE_SIZE / 2 - 8;
    const drawY = py + TILE_SIZE / 2 - 12 + bounceY;

    // Shadow
    this.ctx.fillStyle = 'rgba(0,0,0,0.25)';
    this.ctx.beginPath();
    this.ctx.ellipse(px + TILE_SIZE / 2, py + TILE_SIZE - 4, 8, 3, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Body (16x14)
    this.ctx.fillStyle = outfitColor;
    this.ctx.fillRect(drawX, drawY + 12, 16, 14);

    // Legs (2 small rects)
    this.ctx.fillStyle = this.darken(outfitColor, 0.3);
    if (isWalking) {
      // Alternate leg positions
      const legOffset = frameIndex % 4 < 2 ? 2 : -2;
      this.ctx.fillRect(drawX + 2, drawY + 22, 4, 6 + legOffset);
      this.ctx.fillRect(drawX + 10, drawY + 22, 4, 6 - legOffset);
    } else {
      this.ctx.fillRect(drawX + 2, drawY + 22, 4, 6);
      this.ctx.fillRect(drawX + 10, drawY + 22, 4, 6);
    }

    // Arms
    this.ctx.fillStyle = outfitColor;
    if (dir === 'left') {
      this.ctx.fillRect(drawX - 3, drawY + 13, 4, 8);
    } else if (dir === 'right') {
      this.ctx.fillRect(drawX + 15, drawY + 13, 4, 8);
    } else {
      this.ctx.fillRect(drawX - 2, drawY + 13, 3, 8);
      this.ctx.fillRect(drawX + 15, drawY + 13, 3, 8);
    }

    // Head (12x12)
    this.ctx.fillStyle = skinColor;
    this.ctx.fillRect(drawX + 2, drawY, 12, 12);

    // Hair (12x5 on top of head)
    this.ctx.fillStyle = hairColor;
    this.ctx.fillRect(drawX + 2, drawY, 12, 5);
    // Side hair details
    this.ctx.fillRect(drawX + 2, drawY + 3, 2, 4);
    this.ctx.fillRect(drawX + 12, drawY + 3, 2, 4);

    // Eyes (2x2 dots, position depends on direction)
    this.ctx.fillStyle = '#1a1a2e';
    if (dir === 'up') {
      // No eyes visible from back
      // Just back of hair
      this.ctx.fillStyle = hairColor;
      this.ctx.fillRect(drawX + 2, drawY, 12, 8);
    } else if (dir === 'left') {
      this.ctx.fillRect(drawX + 3, drawY + 6, 2, 2);
    } else if (dir === 'right') {
      this.ctx.fillRect(drawX + 11, drawY + 6, 2, 2);
    } else {
      // down / default: front face
      this.ctx.fillRect(drawX + 4, drawY + 6, 2, 2);
      this.ctx.fillRect(drawX + 9, drawY + 6, 2, 2);
      // Smile dot
      this.ctx.fillStyle = this.darken(skinColor, 0.2);
      this.ctx.fillRect(drawX + 6, drawY + 9, 4, 1);
    }

    // Accessories
    for (const acc of agent.appearance.accessories) {
      this.drawAccessory(acc, drawX, drawY, outfitColor);
    }

    // Working state: blinking cursor/light on the desk in front of the agent
    if (agent.state === 'working') {
      const blinkOn = Math.sin(this.time * 4.0) > 0;
      if (blinkOn) {
        // Small green cursor square drawn just below the agent (at desk position)
        this.ctx.fillStyle = '#22c55e';
        this.ctx.fillRect(drawX + 6, drawY + 30, 2, 4);
        // Faint screen glow on the desk below
        this.ctx.fillStyle = 'rgba(34,197,94,0.18)';
        this.ctx.fillRect(drawX - 2, drawY + 28, 20, 6);
      }
    }

    this.ctx.restore();
  }

  private drawAccessory(
    accessory: string,
    drawX: number,
    drawY: number,
    outfitColor: string
  ): void {
    switch (accessory) {
      case 'glasses':
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(drawX + 3, drawY + 6, 3, 2);
        this.ctx.fillRect(drawX + 10, drawY + 6, 3, 2);
        this.ctx.fillRect(drawX + 6, drawY + 6, 4, 1);
        break;
      case 'headphones':
        this.ctx.fillStyle = '#111827';
        this.ctx.fillRect(drawX + 1, drawY + 2, 2, 6);
        this.ctx.fillRect(drawX + 13, drawY + 2, 2, 6);
        this.ctx.fillRect(drawX + 2, drawY + 1, 12, 2);
        break;
      case 'hat':
        this.ctx.fillStyle = this.darken(outfitColor, 0.2);
        this.ctx.fillRect(drawX + 2, drawY - 4, 12, 4);
        this.ctx.fillRect(drawX, drawY - 1, 16, 2);
        break;
      case 'badge':
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillRect(drawX + 6, drawY + 14, 4, 5);
        this.ctx.fillStyle = '#92400e';
        this.ctx.fillRect(drawX + 7, drawY + 15, 2, 3);
        break;
    }
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
    const bubbleY = py - 10;

    const fontSize = 9;
    this.ctx.font = `bold ${fontSize}px monospace`;

    // Measure text to size the bubble
    const maxWidth = 120;
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
    const padX = 6;
    const padY = 4;
    const bubbleW = textW + padX * 2;
    const bubbleH = lines.length * lineH + padY * 2;
    const bx = centerX - bubbleW / 2;
    const by = bubbleY - bubbleH - 8;

    // Bubble background
    this.ctx.fillStyle = 'rgba(255,255,255,0.92)';
    this.roundRect(bx, by, bubbleW, bubbleH, 4);
    this.ctx.fill();

    // Bubble border
    this.ctx.strokeStyle = '#374151';
    this.ctx.lineWidth = 1;
    this.roundRect(bx, by, bubbleW, bubbleH, 4);
    this.ctx.stroke();

    // Tail triangle
    this.ctx.fillStyle = 'rgba(255,255,255,0.92)';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 4, by + bubbleH);
    this.ctx.lineTo(centerX + 4, by + bubbleH);
    this.ctx.lineTo(centerX, by + bubbleH + 8);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = '#374151';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    // Text
    this.ctx.fillStyle = '#111827';
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
    const tagY = py + TILE_SIZE + 2;

    const fontSize = 8;
    this.ctx.font = `bold ${fontSize}px monospace`;
    const textW = this.ctx.measureText(agent.name).width;
    const padX = 4;
    const padY = 2;
    const tagW = textW + padX * 2;
    const tagH = fontSize + padY * 2;
    const tx = centerX - tagW / 2;

    // Tag background with agent primary color
    this.ctx.fillStyle = agent.primaryColor + 'cc'; // semi-transparent
    this.roundRect(tx, tagY, tagW, tagH, 3);
    this.ctx.fill();

    // Name text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(agent.name, tx + padX, tagY + padY);

    this.ctx.restore();
  }

  // ─────────────────────────────────────────────
  // Editor placement preview
  // ─────────────────────────────────────────────

  /**
   * Draw a semi-transparent placement preview rectangle at the given tile
   * position with the given footprint dimensions. Call this after drawMap
   * and before drawing agents so it renders above the map.
   */
  drawPlacementPreview(
    tileX: number,
    tileY: number,
    tileW: number,
    tileH: number,
    color: string,
    isValid: boolean
  ): void {
    if (!this._hasContext) return;
    this.ctx.save();
    this.applyCamera();

    const px = tileX * TILE_SIZE;
    const py = tileY * TILE_SIZE;
    const pw = tileW * TILE_SIZE;
    const ph = tileH * TILE_SIZE;

    // Semi-transparent fill
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillStyle = isValid ? color : '#ef4444';
    this.ctx.fillRect(px, py, pw, ph);

    // Border
    this.ctx.globalAlpha = 0.9;
    this.ctx.strokeStyle = isValid ? '#a78bfa' : '#fca5a5';
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
      -this.cameraY * this.zoom
    );
  }

  // ─────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────

  /** Darken a hex colour by a ratio (0–1) */
  private darken(hex: string, ratio: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const d = 1 - ratio;
    return `rgb(${Math.floor(r * d)},${Math.floor(g * d)},${Math.floor(b * d)})`;
  }

  /** Helper for rounded rectangles (Canvas 2D path) */
  private roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
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
