'use client';

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface DragHandleProps {
  children: ReactNode;
  onDragStart?: (e: React.DragEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  className?: string;
}

export default function DragHandle({
  children,
  onDragStart,
  onDragEnd,
  disabled = false,
  className = '',
}: DragHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const touchMovedRef = useRef(false);

  // ── Mouse / HTML5 DragEvent ──────────────────────────────────

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    onDragStart?.(e);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDragEnd?.(e);
  };

  // ── Touch events ─────────────────────────────────────────────

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled) return;
    touchMovedRef.current = false;
    setIsDragging(true);
    onDragStart?.(e);
  };

  const handleTouchMove = () => {
    touchMovedRef.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDragEnd?.(e);
    touchMovedRef.current = false;
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={[
        'transition-opacity select-none',
        disabled ? 'cursor-default opacity-50' : 'cursor-grab active:cursor-grabbing',
        isDragging ? 'opacity-50' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
