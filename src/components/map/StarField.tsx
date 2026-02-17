'use client';

import React, { useMemo } from 'react';

interface StarFieldProps {
  count?: number;
  className?: string;
}

/**
 * StarField — 背景の星々
 *
 * CSS + ランダム配置。一部がtwinkle。
 */
export function StarField({ count = 120, className = '' }: StarFieldProps) {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      twinkle: Math.random() > 0.7,
      delay: Math.random() * 4,
      duration: Math.random() * 2 + 1.5,
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {stars.map((star) => (
        <div
          key={star.id}
          className={star.twinkle ? 'animate-twinkle' : ''}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            background: star.size > 2 ? '#FFD43B' : '#F0F0FF',
            opacity: star.opacity,
            boxShadow: star.size > 1.5 ? `0 0 ${star.size * 2}px rgba(255, 212, 59, 0.3)` : 'none',
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
