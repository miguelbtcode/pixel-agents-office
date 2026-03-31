'use client';

import { useEffect, useState } from 'react';

interface AgentBubbleProps {
  text: string;
  agentName: string;
  primaryColor: string;
  position: { x: number; y: number }; // screen coordinates of the agent
  onExpire: () => void;
  duration?: number; // ms, default 4000
}

export default function AgentBubble({
  text,
  agentName,
  primaryColor,
  position,
  onExpire,
  duration = 4000,
}: AgentBubbleProps) {
  // Phase: 'in' → 'visible' → 'out' → expired
  const [phase, setPhase] = useState<'in' | 'visible' | 'out'>('in');

  useEffect(() => {
    // Fade in for 200ms, then show for (duration - 400)ms, then fade out for 200ms
    const fadeInTimer = setTimeout(() => setPhase('visible'), 200);
    const fadeOutTimer = setTimeout(() => setPhase('out'), duration - 200);
    const expireTimer = setTimeout(() => onExpire(), duration);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(expireTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const opacity =
    phase === 'in' ? 0 : phase === 'visible' ? 1 : 0;

  const transition =
    phase === 'in'
      ? 'opacity 200ms ease-in'
      : phase === 'out'
      ? 'opacity 200ms ease-out'
      : 'none';

  // Position bubble above the agent (offset up by ~60px for agent height + bubble)
  const bubbleX = position.x;
  const bubbleY = position.y - 60;

  return (
    <div
      className="pointer-events-none absolute z-30"
      style={{
        left: bubbleX,
        top: bubbleY,
        transform: 'translate(-50%, -100%)',
        opacity,
        transition,
      }}
    >
      {/* Bubble box: pixel-art border style */}
      <div
        className="relative bg-white border-2 border-slate-700 px-2 py-1.5 min-w-[80px] max-w-[160px]"
        style={{
          boxShadow: '2px 2px 0px #374151',
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        {/* Agent name */}
        <div
          className="text-[6px] mb-1 leading-none"
          style={{ color: primaryColor }}
        >
          {agentName}
        </div>

        {/* Message text */}
        <div className="text-[7px] text-slate-800 leading-relaxed break-words">
          {text}
        </div>

        {/* Tail triangle pointing downward (toward agent) */}
        <div
          className="absolute left-1/2"
          style={{
            bottom: -8,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '8px solid #374151',
          }}
        />
        {/* Inner tail (covers border to show white fill) */}
        <div
          className="absolute left-1/2"
          style={{
            bottom: -5,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '6px solid white',
          }}
        />
      </div>
    </div>
  );
}
