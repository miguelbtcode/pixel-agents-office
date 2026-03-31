'use client';

import { useEffect, useRef } from 'react';
import type { Agent, AgentId } from '@/types/agent';
import type { Room } from '@/types/office';

const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;
const MINI_W = 160;
const MINI_H = 120;
const SCALE_X = MINI_W / MAP_WIDTH;
const SCALE_Y = MINI_H / MAP_HEIGHT;

// Gather-inspired room colors
const ROOM_COLORS: Record<string, string> = {
  workspace: '#2a2a4a',
  meeting_room: '#252550',
  kitchen: '#2a3a2a',
  server_room: '#3a2a2a',
};

interface MiniMapProps {
  rooms: Room[];
  agents: Record<AgentId, Agent>;
  cameraX: number;
  cameraY: number;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
  onClickMiniMap?: (worldX: number, worldY: number) => void;
}

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

    // Background
    ctx.fillStyle = 'rgba(18,18,30,0.9)';
    ctx.fillRect(0, 0, MINI_W, MINI_H);

    // Rooms
    for (const room of rooms) {
      const rx = room.bounds.x * SCALE_X;
      const ry = room.bounds.y * SCALE_Y;
      const rw = room.bounds.width * SCALE_X;
      const rh = room.bounds.height * SCALE_Y;
      ctx.fillStyle = ROOM_COLORS[room.type] ?? '#2a2a4a';
      ctx.fillRect(rx, ry, rw, rh);
    }

    // Walls
    ctx.fillStyle = '#4a4a6a';
    ctx.fillRect(0, 0, MINI_W, SCALE_Y);
    ctx.fillRect(0, (MAP_HEIGHT - 1) * SCALE_Y, MINI_W, SCALE_Y);
    ctx.fillRect(0, 0, SCALE_X, MINI_H);
    ctx.fillRect((MAP_WIDTH - 1) * SCALE_X, 0, SCALE_X, MINI_H);

    // Horizontal divider at y=14
    const divY = 14 * SCALE_Y;
    ctx.fillRect(0, divY, MINI_W, SCALE_Y);

    // Vertical walls
    ctx.fillRect(13 * SCALE_X, divY, SCALE_X, (MAP_HEIGHT - 14) * SCALE_Y);
    ctx.fillRect(25 * SCALE_X, divY, SCALE_X, (MAP_HEIGHT - 14) * SCALE_Y);

    // Doors
    ctx.fillStyle = '#6a5acd';
    for (const d of [{ x: 6, y: 14 }, { x: 14, y: 14 }, { x: 24, y: 14 }]) {
      ctx.fillRect(d.x * SCALE_X, d.y * SCALE_Y, SCALE_X, SCALE_Y);
    }

    // Camera viewport
    const vpTileX = cameraX / TILE_SIZE;
    const vpTileY = cameraY / TILE_SIZE;
    const vpTileW = canvasWidth / zoom / TILE_SIZE;
    const vpTileH = canvasHeight / zoom / TILE_SIZE;
    const vpX = vpTileX * SCALE_X;
    const vpY = vpTileY * SCALE_Y;
    const vpW = vpTileW * SCALE_X;
    const vpH = vpTileH * SCALE_Y;

    ctx.fillStyle = 'rgba(90,140,255,0.1)';
    ctx.fillRect(vpX, vpY, vpW, vpH);
    ctx.strokeStyle = 'rgba(90,140,255,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(vpX, vpY, vpW, vpH);

    // Agent dots
    for (const agent of Object.values(agents)) {
      const dotX = (agent.position.px / TILE_SIZE + 0.5) * SCALE_X;
      const dotY = (agent.position.py / TILE_SIZE + 0.5) * SCALE_Y;

      ctx.beginPath();
      ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = agent.primaryColor;
      ctx.fill();
    }

    // Label
    ctx.font = 'bold 7px monospace';
    ctx.fillStyle = 'rgba(136,136,170,0.8)';
    ctx.textBaseline = 'top';
    ctx.fillText('MAP', 4, 3);
  }, [rooms, agents, cameraX, cameraY, zoom, canvasWidth, canvasHeight]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onClickMiniMap) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const displayScaleX = MINI_W / rect.width;
    const displayScaleY = MINI_H / rect.height;
    const mx = (e.clientX - rect.left) * displayScaleX;
    const my = (e.clientY - rect.top) * displayScaleY;
    const tileX = mx / SCALE_X;
    const tileY = my / SCALE_Y;
    onClickMiniMap(tileX * TILE_SIZE, tileY * TILE_SIZE);
  };

  return (
    <div className="absolute bottom-3 left-3 z-10 panel-glass" style={{ padding: 0 }}>
      <canvas
        ref={canvasRef}
        width={MINI_W}
        height={MINI_H}
        onClick={handleClick}
        className={onClickMiniMap ? 'cursor-crosshair' : ''}
        style={{
          imageRendering: 'pixelated',
          display: 'block',
        }}
        aria-label="Mini map — click to pan"
      />
    </div>
  );
}
