'use client';

import { useEffect, useRef } from 'react';
import type { AgentAppearance, AgentDirection } from '@/types/agent';

interface AgentSpriteProps {
  appearance: AgentAppearance;
  primaryColor: string;
  direction?: AgentDirection;
  size?: number;
  animated?: boolean;
}

// Draw a pixel-art agent character onto a 2D canvas context.
// Matches the drawing logic in Renderer.ts drawAgent(), adapted for a standalone canvas.
function drawAgentFrame(
  ctx: CanvasRenderingContext2D,
  appearance: AgentAppearance,
  direction: AgentDirection,
  canvasSize: number,
  frameIndex: number
): void {
  const { hairColor, outfitColor, skinColor, accessories } = appearance;

  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Scale so the ~28px-tall character fills the canvas nicely
  const scale = canvasSize / 40;
  ctx.save();
  ctx.scale(scale, scale);

  // Centre the character in a 40x40 virtual canvas
  const drawX = 4;
  const drawY = 4;

  const walkFrames = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const isWalking = walkFrames.includes(frameIndex);
  const bounceY = isWalking ? (frameIndex % 2 === 0 ? -1 : 1) : 0;

  const charX = drawX;
  const charY = drawY + bounceY;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(charX + 8, charY + 30, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (16x14)
  ctx.fillStyle = outfitColor;
  ctx.fillRect(charX, charY + 12, 16, 14);

  // Legs
  ctx.fillStyle = darken(outfitColor, 0.3);
  if (isWalking) {
    const legOffset = frameIndex % 4 < 2 ? 2 : -2;
    ctx.fillRect(charX + 2, charY + 22, 4, 6 + legOffset);
    ctx.fillRect(charX + 10, charY + 22, 4, 6 - legOffset);
  } else {
    ctx.fillRect(charX + 2, charY + 22, 4, 6);
    ctx.fillRect(charX + 10, charY + 22, 4, 6);
  }

  // Arms
  ctx.fillStyle = outfitColor;
  if (direction === 'left') {
    ctx.fillRect(charX - 3, charY + 13, 4, 8);
  } else if (direction === 'right') {
    ctx.fillRect(charX + 15, charY + 13, 4, 8);
  } else {
    ctx.fillRect(charX - 2, charY + 13, 3, 8);
    ctx.fillRect(charX + 15, charY + 13, 3, 8);
  }

  // Head (12x12)
  ctx.fillStyle = skinColor;
  ctx.fillRect(charX + 2, charY, 12, 12);

  // Hair
  ctx.fillStyle = hairColor;
  ctx.fillRect(charX + 2, charY, 12, 5);
  ctx.fillRect(charX + 2, charY + 3, 2, 4);
  ctx.fillRect(charX + 12, charY + 3, 2, 4);

  // Eyes (depends on direction)
  ctx.fillStyle = '#1a1a2e';
  if (direction === 'up') {
    ctx.fillStyle = hairColor;
    ctx.fillRect(charX + 2, charY, 12, 8);
  } else if (direction === 'left') {
    ctx.fillRect(charX + 3, charY + 6, 2, 2);
  } else if (direction === 'right') {
    ctx.fillRect(charX + 11, charY + 6, 2, 2);
  } else {
    // down / front
    ctx.fillRect(charX + 4, charY + 6, 2, 2);
    ctx.fillRect(charX + 9, charY + 6, 2, 2);
    // smile
    ctx.fillStyle = darken(skinColor, 0.2);
    ctx.fillRect(charX + 6, charY + 9, 4, 1);
  }

  // Accessories
  for (const acc of accessories) {
    drawAccessory(ctx, acc, charX, charY, outfitColor);
  }

  ctx.restore();
}

function drawAccessory(
  ctx: CanvasRenderingContext2D,
  accessory: string,
  drawX: number,
  drawY: number,
  outfitColor: string
): void {
  switch (accessory) {
    case 'glasses':
    case 'glasses_round':
    case 'glasses_neon':
      ctx.fillStyle = accessory === 'glasses_neon' ? '#10b981' : accessory === 'glasses_round' ? '#92400e' : '#374151';
      ctx.fillRect(drawX + 3, drawY + 6, 3, 2);
      ctx.fillRect(drawX + 10, drawY + 6, 3, 2);
      ctx.fillRect(drawX + 6, drawY + 6, 4, 1);
      break;
    case 'headphones':
    case 'headphones_pink':
      ctx.fillStyle = accessory === 'headphones_pink' ? '#db2777' : '#111827';
      ctx.fillRect(drawX + 1, drawY + 2, 2, 6);
      ctx.fillRect(drawX + 13, drawY + 2, 2, 6);
      ctx.fillRect(drawX + 2, drawY + 1, 12, 2);
      break;
    case 'hat':
    case 'hat_cap':
    case 'hat_beanie':
    case 'hat_cowboy':
      ctx.fillStyle = accessory === 'hat_beanie' ? '#7c3aed' : accessory === 'hat_cowboy' ? '#78350f' : darken(outfitColor, 0.2);
      ctx.fillRect(drawX + 2, drawY - 4, 12, 4);
      ctx.fillRect(drawX, drawY - 1, 16, 2);
      break;
    case 'badge':
    case 'badge_red':
      ctx.fillStyle = accessory === 'badge_red' ? '#dc2626' : '#fbbf24';
      ctx.fillRect(drawX + 6, drawY + 14, 4, 5);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(drawX + 7, drawY + 15, 2, 3);
      break;
    case 'tie':
    case 'tie_blue':
      ctx.fillStyle = accessory === 'tie_blue' ? '#2563eb' : '#dc2626';
      ctx.fillRect(drawX + 7, drawY + 12, 3, 10);
      ctx.fillRect(drawX + 6, drawY + 12, 5, 3);
      break;
    case 'scarf':
    case 'scarf_green':
      ctx.fillStyle = accessory === 'scarf_green' ? '#16a34a' : '#7c3aed';
      ctx.fillRect(drawX + 2, drawY + 11, 12, 3);
      break;
  }
}

function darken(hex: string, ratio: number): string {
  if (!hex || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const d = 1 - ratio;
  return `rgb(${Math.floor(r * d)},${Math.floor(g * d)},${Math.floor(b * d)})`;
}

export default function AgentSprite({
  appearance,
  primaryColor: _primaryColor,
  direction = 'down',
  size = 64,
  animated = false,
}: AgentSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (animated) {
      let lastTime = performance.now();
      let elapsed = 0;

      const tick = (now: number) => {
        const dt = now - lastTime;
        lastTime = now;
        elapsed += dt;

        // Advance frame every ~150ms
        if (elapsed >= 150) {
          frameRef.current = (frameRef.current + 1) % 8; // 8 walk frames
          elapsed = 0;
        }

        drawAgentFrame(ctx, appearance, direction, size, frameRef.current);
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);

      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    } else {
      // Single static frame
      drawAgentFrame(ctx, appearance, direction, size, 0);
    }
  }, [appearance, direction, size, animated]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        imageRendering: 'pixelated',
        width: size,
        height: size,
      }}
    />
  );
}
