'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EarnedBadge, BadgeRank } from '@/features/badges/types';
import { BADGE_DEFINITIONS } from '@/features/badges/badge-definitions';

interface BadgeUnlockProps {
  /** 新しく解放されたバッジ */
  newBadges: EarnedBadge[];
  /** 全て表示し終わった時のコールバック */
  onComplete: () => void;
  className?: string;
}

const RANK_COLORS: Record<BadgeRank, { primary: string; secondary: string; glow: string }> = {
  bronze: {
    primary: '#CD7F32',
    secondary: '#E8A857',
    glow: 'rgba(205, 127, 50, 0.4)',
  },
  silver: {
    primary: '#C0C0C0',
    secondary: '#E0E0E0',
    glow: 'rgba(192, 192, 192, 0.4)',
  },
  gold: {
    primary: '#FFD43B',
    secondary: '#FFE066',
    glow: 'rgba(255, 212, 59, 0.5)',
  },
};

const RANK_LABELS: Record<BadgeRank, string> = {
  bronze: 'ブロンズ',
  silver: 'シルバー',
  gold: 'ゴールド',
};

/**
 * BadgeUnlock - バッジ解放アニメーション
 *
 * 新しいバッジが解放された時にオーバーレイで表示。
 * 複数バッジの場合は順番に表示。
 */
export function BadgeUnlock({
  newBadges,
  onComplete,
  className = '',
}: BadgeUnlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentBadge = newBadges[currentIndex];
  const badgeDef = currentBadge
    ? BADGE_DEFINITIONS.find(d => d.id === currentBadge.badgeId)
    : undefined;

  useEffect(() => {
    if (!currentBadge) {
      onComplete();
    }
  }, [currentBadge, onComplete]);

  const handleNext = () => {
    if (currentIndex < newBadges.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (!currentBadge || !badgeDef) return null;

  const colors = RANK_COLORS[currentBadge.rank];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`badge-${currentIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
        style={{ background: 'rgba(10, 10, 30, 0.85)' }}
        onClick={handleNext}
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="flex flex-col items-center gap-4 p-8"
        >
          {/* "New Badge!" text */}
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm font-bold tracking-wider uppercase"
            style={{ color: colors.primary }}
          >
            バッジ かいほう！
          </motion.p>

          {/* Badge icon with glow */}
          <motion.div
            animate={{
              boxShadow: [
                `0 0 20px ${colors.glow}`,
                `0 0 40px ${colors.glow}`,
                `0 0 20px ${colors.glow}`,
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-28 h-28 rounded-3xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            }}
          >
            <span className="text-5xl">{badgeDef.icon}</span>
          </motion.div>

          {/* Badge name */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-bold"
            style={{ color: '#F0F0FF' }}
          >
            {badgeDef.name}
          </motion.p>

          {/* Rank */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm px-3 py-1 rounded-full font-bold"
            style={{
              background: `${colors.primary}22`,
              color: colors.primary,
              border: `1px solid ${colors.primary}44`,
            }}
          >
            {RANK_LABELS[currentBadge.rank]}
          </motion.span>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-base text-center"
            style={{ color: '#B8B8D0' }}
          >
            {badgeDef.description}
          </motion.p>

          {/* Criteria */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xs"
            style={{ color: '#8888AA' }}
          >
            {badgeDef.criteria[currentBadge.rank].label}
          </motion.p>

          {/* Tap to continue */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0.3, 0.7] }}
            transition={{ delay: 1.2, repeat: Infinity, duration: 2 }}
            className="text-xs mt-4"
            style={{ color: '#8888AA' }}
          >
            タップして つづける
          </motion.p>

          {/* Badge count indicator */}
          {newBadges.length > 1 && (
            <div className="flex gap-1.5 mt-2">
              {newBadges.map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: i === currentIndex ? colors.primary : 'rgba(136, 136, 170, 0.3)',
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
