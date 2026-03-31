'use client';

import { useEffect, useRef } from 'react';
import type { AgentAppearance, AgentDirection } from '@/types/agent';
import { getCharacterSprites, type SpriteData } from '@/engine/CharacterSprites';

interface AgentSpriteProps {
  appearance: AgentAppearance;
  primaryColor: string;
  direction?: AgentDirection;
  size?: number;
  animated?: boolean;
}

/**
 * Draw a pixel-art sprite onto a canvas, scaled to fill the given canvas size.
 */
function drawSpriteToCanvas(
  ctx: CanvasRenderingContext2D,
  sprite: SpriteData,
  canvasSize: number,
): void {
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  const rows = sprite.length;
  const cols = rows > 0 ? sprite[0].length : 0;
  if (rows === 0 || cols === 0) return;

  // Scale to fit the canvas with padding
  const pixelSize = Math.floor(canvasSize / Math.max(rows, cols));
  const offsetX = Math.floor((canvasSize - cols * pixelSize) / 2);
  const offsetY = Math.floor((canvasSize - rows * pixelSize) / 2);

  ctx.imageSmoothingEnabled = false;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = sprite[r][c];
      if (color === '') continue;
      ctx.fillStyle = color;
      ctx.fillRect(offsetX + c * pixelSize, offsetY + r * pixelSize, pixelSize, pixelSize);
    }
  }
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

    const sprites = getCharacterSprites(appearance);

    if (animated) {
      let lastTime = performance.now();
      let elapsed = 0;

      const tick = (now: number) => {
        const dt = now - lastTime;
        lastTime = now;
        elapsed += dt;

        if (elapsed >= 200) {
          frameRef.current = (frameRef.current + 1) % 3;
          elapsed = 0;
        }

        const sprite = sprites.walk[direction][frameRef.current];
        drawSpriteToCanvas(ctx, sprite, size);
        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);

      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    } else {
      // Static idle frame
      const sprite = sprites.idle[direction];
      drawSpriteToCanvas(ctx, sprite, size);
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
