'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { GrowthLevel } from '@/features/rewards/plant-growth';
import { getPlantGrowthInfo } from '@/features/rewards/plant-growth';

interface PlantGrowthProps {
  /** 成長レベル 1-5 */
  level: GrowthLevel;
  /** 連続プレイ日数 */
  streakDays?: number;
  /** XP倍率表示 */
  showXpMultiplier?: boolean;
  /** コンパクトモード（バッジ内表示用） */
  compact?: boolean;
  className?: string;
}

/** レベル別の植物ビジュアル */
const PLANT_VISUALS: Record<GrowthLevel, {
  emoji: string;
  bgGradient: string;
  glowColor: string;
  size: number;
}> = {
  1: {
    emoji: '🌱',
    bgGradient: 'radial-gradient(circle, rgba(46, 213, 115, 0.15) 0%, transparent 70%)',
    glowColor: 'rgba(46, 213, 115, 0.2)',
    size: 48,
  },
  2: {
    emoji: '🌿',
    bgGradient: 'radial-gradient(circle, rgba(46, 213, 115, 0.2) 0%, transparent 70%)',
    glowColor: 'rgba(46, 213, 115, 0.3)',
    size: 56,
  },
  3: {
    emoji: '🌷',
    bgGradient: 'radial-gradient(circle, rgba(255, 107, 157, 0.2) 0%, transparent 70%)',
    glowColor: 'rgba(255, 107, 157, 0.3)',
    size: 64,
  },
  4: {
    emoji: '🌳',
    bgGradient: 'radial-gradient(circle, rgba(46, 213, 115, 0.25) 0%, transparent 70%)',
    glowColor: 'rgba(46, 213, 115, 0.35)',
    size: 72,
  },
  5: {
    emoji: '🌲🌳🌴',
    bgGradient: 'radial-gradient(circle, rgba(255, 212, 59, 0.25) 0%, transparent 70%)',
    glowColor: 'rgba(255, 212, 59, 0.3)',
    size: 80,
  },
};

/**
 * PlantGrowth - 植物ストリーク可視化コンポーネント
 *
 * 連続プレイに応じて植物が成長する視覚表現。
 * レベル1(種)からレベル5(森)まで段階的に表示。
 */
export function PlantGrowth({
  level,
  streakDays,
  showXpMultiplier = false,
  compact = false,
  className = '',
}: PlantGrowthProps) {
  const info = getPlantGrowthInfo(level);
  const visual = PLANT_VISUALS[level];

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-2xl ${className}`}
        style={{
          background: 'rgba(46, 213, 115, 0.08)',
          border: '1px solid rgba(46, 213, 115, 0.2)',
        }}
      >
        <span className="text-xl leading-none">{visual.emoji}</span>
        <div className="flex flex-col">
          <span className="text-xs font-bold" style={{ color: '#2ED573' }}>
            Lv.{level} {info.label}
          </span>
          {streakDays !== undefined && (
            <span className="text-[10px]" style={{ color: '#8888AA' }}>
              {streakDays}にち れんぞく
            </span>
          )}
        </div>
        {showXpMultiplier && info.xpMultiplier > 1 && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-auto"
            style={{ background: 'rgba(255, 212, 59, 0.2)', color: '#FFD43B' }}
          >
            XP x{info.xpMultiplier}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Growth visualization */}
      <motion.div
        className="relative flex items-center justify-center"
        style={{
          width: visual.size + 40,
          height: visual.size + 40,
          background: visual.bgGradient,
          borderRadius: '50%',
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 ${level * 8}px ${visual.glowColor}`,
          }}
        />

        {/* Plant emoji */}
        <motion.span
          className="relative z-10"
          style={{ fontSize: visual.size * 0.6 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          {visual.emoji}
        </motion.span>

        {/* Growth level dots */}
        <div className="absolute -bottom-2 flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 6,
                height: 6,
                background: i <= level ? '#2ED573' : 'rgba(136, 136, 170, 0.3)',
                boxShadow: i <= level ? '0 0 4px rgba(46, 213, 115, 0.4)' : 'none',
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Label */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-base font-bold" style={{ color: '#F0F0FF' }}>
          {info.label}
        </p>
        <p className="text-xs" style={{ color: '#B8B8D0' }}>
          {info.description}
        </p>
      </div>

      {/* Streak days */}
      {streakDays !== undefined && (
        <p className="text-sm font-bold" style={{ color: '#2ED573' }}>
          {streakDays}にち れんぞく プレイ！
        </p>
      )}

      {/* XP multiplier badge */}
      {showXpMultiplier && info.xpMultiplier > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255, 212, 59, 0.15)',
            border: '1px solid rgba(255, 212, 59, 0.25)',
          }}
        >
          <span className="text-sm" style={{ color: '#FFD43B' }}>
            XP x{info.xpMultiplier}
          </span>
          {info.hasBonusItem && (
            <span className="text-xs" style={{ color: '#B8B8D0' }}>
              + ボーナス
            </span>
          )}
        </motion.div>
      )}

      {/* Special bonuses at higher levels */}
      {info.hasRareBoost && (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA' }}
        >
          レアアイテム かくりつUP
        </span>
      )}
      {info.hasExclusiveReward && (
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255, 212, 59, 0.15)', color: '#FFD43B' }}
        >
          げんてい ほうしゅう
        </span>
      )}
    </div>
  );
}
