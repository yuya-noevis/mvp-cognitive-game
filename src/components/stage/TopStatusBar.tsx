'use client';

import React from 'react';
import { CrownIcon, FireIcon, GemHexIcon, LightningBoltIcon } from '@/components/icons';

interface TopStatusBarProps {
  streakDays?: number;
  gems?: number;
  lives?: number;
}

/**
 * TopStatusBar - Duolingo風ステータスバー
 * ストリーク・ジェム・ライフ・リーグ表示
 */
export function TopStatusBar({ streakDays = 0, gems = 640, lives = 25 }: TopStatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5"
         style={{ background: 'var(--color-surface)' }}>
      {/* League/Crown */}
      <button className="flex items-center justify-center w-10 h-10 rounded-xl tap-interactive"
              style={{ background: 'var(--duo-node-active, var(--color-primary))' }}>
        <CrownIcon size={22} style={{ color: 'white' }} />
      </button>

      {/* Streak */}
      <div className="flex items-center gap-1.5">
        <FireIcon size={22} style={{ color: streakDays > 0 ? 'var(--duo-streak, #FF9600)' : 'var(--color-text-muted)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
          {streakDays}
        </span>
      </div>

      {/* Gems */}
      <div className="flex items-center gap-1.5">
        <GemHexIcon size={22} style={{ color: 'var(--duo-gem, #1CB0F6)' }} />
        <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
          {gems}
        </span>
      </div>

      {/* Lives */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
           style={{ background: 'var(--duo-heart, #FF4B82)', opacity: 0.9 }}>
        <LightningBoltIcon size={16} style={{ color: 'white' }} />
        <span className="text-sm font-bold" style={{ color: 'white' }}>
          {lives}
        </span>
      </div>
    </div>
  );
}
