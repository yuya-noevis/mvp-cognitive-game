'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LessonProgressBarProps {
  /** 現在の試行番号 (1-indexed) */
  current: number;
  /** 合計試行数 */
  total: number;
  /** ティア (1: ドットインジケーター, 2-3: 横バー + パーセンテージ) */
  tier?: 1 | 2 | 3;
  className?: string;
}

/**
 * LessonProgressBar - レッスン内プログレスバー
 *
 * ティア1: ドットインジケーター (filled/empty dots)
 * ティア2-3: 横バー + パーセンテージ
 */
export function LessonProgressBar({
  current,
  total,
  tier = 1,
  className = '',
}: LessonProgressBarProps) {
  const progress = total > 0 ? Math.min(current / total, 1) : 0;
  const percent = Math.round(progress * 100);

  // Tier 1: Dot indicator
  if (tier === 1) {
    // Limit dots to max 10 for visual clarity
    const dotCount = Math.min(total, 10);
    const filledDots = Math.min(
      Math.round(progress * dotCount),
      dotCount,
    );

    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {Array.from({ length: dotCount }, (_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              scale: i === filledDots - 1 ? [1, 1.3, 1] : 1,
              background: i < filledDots ? '#6C3CE1' : 'rgba(136, 136, 170, 0.3)',
            }}
            transition={{
              duration: 0.3,
              scale: { duration: 0.4 },
            }}
            className="rounded-full"
            style={{
              width: 10,
              height: 10,
              boxShadow: i < filledDots ? '0 0 6px rgba(108, 60, 225, 0.4)' : 'none',
            }}
          />
        ))}
        <span
          className="text-[10px] ml-1 font-bold"
          style={{ color: '#8888AA' }}
        >
          {current}/{total}
        </span>
      </div>
    );
  }

  // Tier 2-3: Horizontal bar + percentage
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex-1 h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(136, 136, 170, 0.15)' }}
      >
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            background: 'linear-gradient(90deg, #6C3CE1 0%, #8B5CF6 100%)',
            boxShadow: '0 0 8px rgba(108, 60, 225, 0.3)',
          }}
        />
      </div>
      <span
        className="text-xs font-bold min-w-[36px] text-right"
        style={{ color: '#B8B8D0' }}
      >
        {percent}%
      </span>
    </div>
  );
}
