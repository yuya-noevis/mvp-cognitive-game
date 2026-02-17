'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CosmicProgressBarProps {
  progress: number; // 0-1
  className?: string;
}

/**
 * CosmicProgressBar — Duolingo ABC風の太い丸角バー
 *
 * cosmic → nebula グラデーション
 * spring アニメーション + 先端にキラキラ
 */
export function CosmicProgressBar({ progress, className = '' }: CosmicProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <div
      className={`relative h-3 rounded-full overflow-hidden ${className}`}
      style={{ background: 'rgba(255,255,255,0.1)' }}
    >
      <motion.div
        className="h-full rounded-full relative"
        style={{
          background: 'linear-gradient(90deg, #6C3CE1 0%, #FF6B9D 100%)',
          boxShadow: clampedProgress > 0.05 ? 'inset 0 2px 0 rgba(255,255,255,0.2)' : 'none',
        }}
        initial={false}
        animate={{ width: `${Math.max(clampedProgress * 100, 2)}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {/* Sparkle at tip */}
        {clampedProgress > 0.05 && (
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-gentle-pulse"
            style={{
              background: '#FFD43B',
              boxShadow: '0 0 6px #FFD43B, 0 0 12px rgba(255,212,59,0.5)',
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
