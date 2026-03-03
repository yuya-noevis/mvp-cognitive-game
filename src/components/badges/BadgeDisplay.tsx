'use client';

import React from 'react';
import type { EarnedBadge, BadgeRank, BadgeCategory } from '@/features/badges/types';
import { BADGE_DEFINITIONS } from '@/features/badges/badge-definitions';
import { groupBadgesByCategory } from '@/features/badges/badge-evaluator';

interface BadgeDisplayProps {
  /** 獲得済みバッジ一覧 */
  badges: EarnedBadge[];
  /** 全バッジを表示するか (false = 獲得済みのみ) */
  showAll?: boolean;
  /** コンパクトモード */
  compact?: boolean;
  className?: string;
}

/** ランク別の色設定 */
const RANK_COLORS: Record<BadgeRank, { bg: string; border: string; text: string; glow: string }> = {
  bronze: {
    bg: 'rgba(205, 127, 50, 0.15)',
    border: 'rgba(205, 127, 50, 0.3)',
    text: '#CD7F32',
    glow: 'rgba(205, 127, 50, 0.2)',
  },
  silver: {
    bg: 'rgba(192, 192, 192, 0.15)',
    border: 'rgba(192, 192, 192, 0.3)',
    text: '#C0C0C0',
    glow: 'rgba(192, 192, 192, 0.2)',
  },
  gold: {
    bg: 'rgba(255, 212, 59, 0.15)',
    border: 'rgba(255, 212, 59, 0.3)',
    text: '#FFD43B',
    glow: 'rgba(255, 212, 59, 0.3)',
  },
};

/** ランクの日本語表示 */
const RANK_LABELS: Record<BadgeRank, string> = {
  bronze: 'ブロンズ',
  silver: 'シルバー',
  gold: 'ゴールド',
};

/** カテゴリの日本語表示 */
const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  effort: 'どりょく',
  growth: 'せいちょう',
  discovery: 'はっけん',
  special: 'とくべつ',
};

/** カテゴリの色 */
const CATEGORY_COLORS: Record<BadgeCategory, string> = {
  effort: '#4ECDC4',
  growth: '#2ED573',
  discovery: '#8B5CF6',
  special: '#FFD43B',
};

function BadgeIcon({
  badge,
  rank,
  locked = false,
  compact = false,
}: {
  badge: typeof BADGE_DEFINITIONS[0];
  rank: BadgeRank;
  locked?: boolean;
  compact?: boolean;
}) {
  const colors = RANK_COLORS[rank];
  const size = compact ? 48 : 64;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-2xl flex items-center justify-center relative"
        style={{
          width: size,
          height: size,
          background: locked ? 'rgba(136, 136, 170, 0.1)' : colors.bg,
          border: `2px solid ${locked ? 'rgba(136, 136, 170, 0.2)' : colors.border}`,
          boxShadow: locked ? 'none' : `0 0 12px ${colors.glow}`,
          opacity: locked ? 0.5 : 1,
        }}
      >
        <span
          style={{
            fontSize: compact ? 20 : 28,
            filter: locked ? 'grayscale(1)' : 'none',
          }}
        >
          {badge.icon}
        </span>

        {/* Rank indicator */}
        {!locked && (
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{
              background: colors.text,
              color: '#1A1A40',
            }}
          >
            {rank === 'gold' ? 'G' : rank === 'silver' ? 'S' : 'B'}
          </div>
        )}
      </div>

      {!compact && (
        <>
          <span
            className="text-xs font-bold text-center max-w-[72px] leading-tight"
            style={{ color: locked ? '#8888AA' : '#F0F0FF' }}
          >
            {badge.name}
          </span>
          {!locked && (
            <span
              className="text-[10px]"
              style={{ color: colors.text }}
            >
              {RANK_LABELS[rank]}
            </span>
          )}
        </>
      )}
    </div>
  );
}

/**
 * BadgeDisplay - バッジコレクション表示
 *
 * 獲得済みバッジをカテゴリ別に表示。
 * showAll=true で未獲得バッジもグレーアウト表示。
 */
export function BadgeDisplay({
  badges,
  showAll = false,
  compact = false,
  className = '',
}: BadgeDisplayProps) {
  const grouped = groupBadgesByCategory(badges);
  const earnedIds = new Set(badges.map(b => b.badgeId));

  const categories: BadgeCategory[] = ['effort', 'growth', 'discovery', 'special'];

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {categories.map(category => {
        const categoryBadges = grouped[category];
        const allInCategory = BADGE_DEFINITIONS.filter(d => d.category === category);

        // Only show categories that have badges to display
        const visibleBadges = showAll ? allInCategory : allInCategory.filter(d => earnedIds.has(d.id));
        if (visibleBadges.length === 0) return null;

        return (
          <div key={category}>
            {/* Category header */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: CATEGORY_COLORS[category] }}
              />
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: CATEGORY_COLORS[category] }}
              >
                {CATEGORY_LABELS[category]}
              </span>
            </div>

            {/* Badges grid */}
            <div className="flex flex-wrap gap-3">
              {visibleBadges.map(def => {
                const earned = categoryBadges.find(b => b.badgeId === def.id);
                return (
                  <BadgeIcon
                    key={def.id}
                    badge={def}
                    rank={earned?.rank ?? 'bronze'}
                    locked={!earned}
                    compact={compact}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {badges.length === 0 && !showAll && (
        <p className="text-sm text-center py-4" style={{ color: '#8888AA' }}>
          まだ バッジが ないよ。あそんで ゲットしよう！
        </p>
      )}
    </div>
  );
}
