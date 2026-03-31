'use client';

import { useEffect, useRef } from 'react';
import type { Agent, AgentId } from '@/types/agent';
import type { Room } from '@/types/office';

// Map dimensions (must match mapLayout)
const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;

// MiniMap canvas size
const MINI_W = 160;
const MINI_H = 120;

// Scale factors: world-tile -> mini-pixel
const SCALE_X = MINI_W / MAP_WIDTH;
const SCALE_Y = MINI_H / MAP_HEIGHT;

// Room type -> fill color
const ROOM_COLORS: Record<string, string> = {
  workspace: '#1e293b',
  meeting_room: '#1a2744',
  kitchen: '#1a2e1a',
  server_room: '#2a1a1a',
};

interface MiniMapProps {
  /** All room definitions from the map layout */
  rooms: Room[];
  /** Current agent record (keyed by AgentId) */
  agents: Record<AgentId, Agent>;
  /** Camera world-pixel X offset */
  cameraX: number;
  /** Camera world-pixel Y offset */
  cameraY: number;
  /** Current zoom level */
  zoom: number;
  /** Visible canvas width in screen pixels */
  canvasWidth: number;
  /** Visible canvas height in screen pixels */
  canvasHeight: number;
  /** Called when user clicks on the mini-map; provides world pixel coords */
  onClickMiniMap?: (worldX: number, worldY: number) => void;
}

// Tile size used by the main renderer (must stay in sync with Renderer.ts)
const TILE_SIZE = 32;

export default function MiniMap({
  rooms,
  agents,
  cameraX,
  cameraY,
  zoom,
  canvasWidth,
  canvasHeight,
  onClickMiniMap,
}: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Background ─────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, MINI_W, MINI_H);

    // ── Draw rooms as colored blocks ──────────────────────────────
    for (const room of rooms) {
      const rx = room.bounds.x * SCALE_X;
      const ry = room.bounds.y * SCALE_Y;
      const rw = room.bounds.width * SCALE_X;
      const rh = room.bounds.height * SCALE_Y;
      ctx.fillStyle = ROOM_COLORS[room.type] ?? '#1e293b';
      ctx.fillRect(rx, ry, rw, rh);
    }

    // ── Draw wall border (entire map edge) ─────────────────────────
    ctx.fillStyle = '#374151';
    // Top/bottom border rows
    ctx.fillRect(0, 0, MINI_W, SCALE_Y);
    ctx.fillRect(0, (MAP_HEIGHT - 1) * SCALE_Y, MINI_W, SCALE_Y);
    // Left/right border cols
    ctx.fillRect(0, 0, SCALE_X, MINI_H);
    ctx.fillRect((MAP_WIDTH - 1) * SCALE_X, 0, SCALE_X, MINI_H);

    // ── Draw horizontal divider wall at tile y=14 ──────────────────
    const divY = 14 * SCALE_Y;
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, divY, MINI_W, SCALE_Y);

    // vertical wall between meeting_room and kitchen at x=13
    const vWall1 = 13 * SCALE_X;
    ctx.fillRect(vWall1, divY, SCALE_X, (MAP_HEIGHT - 14) * SCALE_Y);

    // vertical wall between kitchen and server_room at x=25
    const vWall2 = 25 * SCALE_X;
    ctx.fillRect(vWall2, divY, SCALE_X, (MAP_HEIGHT - 14) * SCALE_Y);

    // ── Draw doors ─────────────────────────────────────────────────
    const doorTiles = [
      { x: 6, y: 14 },
      { x: 14, y: 14 },
      { x: 24, y: 14 },
    ];
    ctx.fillStyle = '#805ad5';
    for (const d of doorTiles) {
      ctx.fillRect(d.x * SCALE_X, d.y * SCALE_Y, SCALE_X, SCALE_Y);
    }

    // ── Draw camera viewport rectangle ────────────────────────────
    const vpTileX = cameraX / TILE_SIZE;
    const vpTileY = cameraY / TILE_SIZE;
    const vpTileW = canvasWidth / zoom / TILE_SIZE;
    const vpTileH = canvasHeight / zoom / TILE_SIZE;

    const vpX = vpTileX * SCALE_X;
    const vpY = vpTileY * SCALE_Y;
    const vpW = vpTileW * SCALE_X;
    const vpH = vpTileH * SCALE_Y;

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(vpX, vpY, vpW, vpH);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(vpX, vpY, vpW, vpH);

    // ── Draw agent dots (3px radius) ───────────────────────────────
    for (const agent of Object.values(agents)) {
      // agent.position.px/py are world pixel coords
      const dotX = (agent.position.px / TILE_SIZE + 0.5) * SCALE_X;
      const dotY = (agent.position.py / TILE_SIZE + 0.5) * SCALE_Y;

      // Outer shadow ring
      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fill();

      // Colored fill
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = agent.primaryColor;
      ctx.fill();
    }

    // ── "MAP" label (pixel font feel) ─────────────────────────────
    ctx.font = 'bold 7px monospace';
    ctx.fillStyle = 'rgba(148,163,184,0.85)';
    ctx.textBaseline = 'top';
    ctx.fillText('MAP', 4, 3);
  }, [rooms, agents, cameraX, cameraY, zoom, canvasWidth, canvasHeight]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onClickMiniMap) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    // Scale from display size to canvas resolution
    const displayScaleX = MINI_W / rect.width;
    const displayScaleY = MINI_H / rect.height;
    const mx = (e.clientX - rect.left) * displayScaleX;
    const my = (e.clientY - rect.top) * displayScaleY;

    // Convert mini-map pixel -> tile coords -> world pixel
    const tileX = mx / SCALE_X;
    const tileY = my / SCALE_Y;
    onClickMiniMap(tileX * TILE_SIZE, tileY * TILE_SIZE);
  };

  return (
    <div
      className="absolute bottom-3 left-3 z-10"
      style={{ background: 'rgba(0,0,0,0.7)' }}
    >
      <canvas
        ref={canvasRef}
        width={MINI_W}
        height={MINI_H}
        onClick={handleClick}
        className={onClickMiniMap ? 'cursor-crosshair' : ''}
        style={{
          border: '2px solid #475569',
          imageRendering: 'pixelated',
          display: 'block',
        }}
        aria-label="Mini map — click to pan"
      />
    </div>
  );
}
