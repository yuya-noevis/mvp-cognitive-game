'use client';

import React from 'react';
import type { DailyStreak } from '@/features/feedback/daily-streak';

interface DailyStreakBadgeProps {
  streak: DailyStreak;
  /** 猶予を使って休みをまたいだ場合 true */
  graceConsumedToday?: boolean;
  className?: string;
}

const GROWTH_EMOJIS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '🌱',
  2: '🌿',
  3: '🌸',
  4: '🌻',
  5: '🌟',
};

/**
 * DailyStreakBadge - 日次プレイストリーク表示バッジ
 *
 * - ストリーク日数 + 成長レベルの植物アイコンを表示
 * - 猶予日使用時は特別メッセージを表示
 * - 猶予日が利用可能な場合は盾アイコンを表示
 */
export function DailyStreakBadge({
  streak,
  graceConsumedToday = false,
  className = '',
}: DailyStreakBadgeProps) {
  const { currentDays, growthLevel, graceAvailableThisWeek, graceUsedThisWeek } = streak;

  if (currentDays === 0) return null;

  const growthEmoji = GROWTH_EMOJIS[growthLevel];

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-2xl ${className}`}
      style={{
        background: graceConsumedToday
          ? 'rgba(78, 205, 196, 0.12)'
          : 'rgba(255, 212, 59, 0.1)',
        border: graceConsumedToday
          ? '1px solid rgba(78, 205, 196, 0.25)'
          : '1px solid rgba(255, 212, 59, 0.2)',
      }}
    >
      {/* Growth plant icon */}
      <span className="text-lg leading-none" role="img" aria-label="成長レベル">
        {growthEmoji}
      </span>

      {/* Streak count */}
      <span
        className="text-sm font-bold"
        style={{ color: graceConsumedToday ? '#4ECDC4' : '#FFD43B' }}
      >
        {currentDays}日
      </span>

      {/* Grace consumed message */}
      {graceConsumedToday && (
        <span className="text-xs" style={{ color: '#4ECDC4' }}>
          おやすみしたけどストリーク続いてるよ！
        </span>
      )}

      {/* Grace shield indicator (available but not used) */}
      {graceAvailableThisWeek && !graceUsedThisWeek && !graceConsumedToday && (
        <span
          className="text-xs px-1.5 py-0.5 rounded-full"
          style={{
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#8B5CF6',
            fontSize: '10px',
          }}
          title="今週は1回お休みができます"
        >
          盾
        </span>
      )}
    </div>
  );
}

/**
 * StreakGraceNotice - 週初め猶予付与通知
 * セッション開始時に表示する
 */
export function StreakGraceNotice({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-fade-in-up"
      style={{
        background: 'rgba(139, 92, 246, 0.15)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
      }}
    >
      <span className="text-2xl" role="img" aria-label="盾">
        🛡️
      </span>
      <p className="flex-1 text-sm font-bold" style={{ color: '#C4B5FD' }}>
        {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-xs px-2 py-1 rounded-lg tap-interactive"
          style={{ color: '#8888AA', background: 'rgba(255,255,255,0.05)' }}
          aria-label="閉じる"
        >
          OK
        </button>
      )}
    </div>
  );
}
