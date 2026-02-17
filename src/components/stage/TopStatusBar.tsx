'use client';

import React from 'react';
import { CrownIcon, FireIcon, GemHexIcon, LightningBoltIcon } from '@/components/icons';

interface TopStatusBarProps {
  streakDays?: number;
  gems?: number;
  lives?: number;
}

/**
 * TopStatusBar - 宇宙テーマ ステータスバー
 */
export function TopStatusBar({ streakDays = 0, gems = 640, lives = 25 }: TopStatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5"
         style={{
           background: 'rgba(26, 26, 64, 0.9)',
           backdropFilter: 'blur(8px)',
           borderBottom: '1px solid rgba(108, 60, 225, 0.15)',
         }}>
      {/* Crown */}
      <button className="flex items-center justify-center w-10 h-10 rounded-xl tap-interactive"
              style={{ background: 'rgba(108, 60, 225, 0.3)' }}>
        <CrownIcon size={22} style={{ color: '#FFD43B' }} />
      </button>

      {/* Streak */}
      <div className="flex items-center gap-1.5">
        <FireIcon size={22} style={{ color: streakDays > 0 ? '#FF6B9D' : '#8888AA' }} />
        <span className="text-sm font-bold" style={{ color: '#F0F0FF' }}>
          {streakDays}
        </span>
      </div>

      {/* Gems */}
      <div className="flex items-center gap-1.5">
        <GemHexIcon size={22} style={{ color: '#4ECDC4' }} />
        <span className="text-sm font-bold" style={{ color: '#F0F0FF' }}>
          {gems}
        </span>
      </div>

      {/* Lives */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
           style={{ background: 'rgba(255, 107, 157, 0.2)' }}>
        <LightningBoltIcon size={16} style={{ color: '#FF6B9D' }} />
        <span className="text-sm font-bold" style={{ color: '#FF6B9D' }}>
          {lives}
        </span>
      </div>
    </div>
  );
}
