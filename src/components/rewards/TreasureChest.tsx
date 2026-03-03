'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TreasureChestData, RewardItem } from '@/features/rewards/types';

interface TreasureChestProps {
  /** 3つの宝箱データ */
  chests: TreasureChestData[];
  /** 開封された報酬（まだ選んでいなければ null） */
  selectedReward: RewardItem | null;
  /** 宝箱を選択 */
  onSelectChest: (chestId: number) => void;
  /** 報酬を受け取る */
  onConfirmReward: () => void;
  /** 予測可能報酬モード */
  isPredictableMode?: boolean;
  className?: string;
}

/** 宝箱のビジュアルプロパティ（それぞれ少し違う色調） */
const CHEST_COLORS = [
  { base: '#8B5CF6', highlight: '#A78BFA', shadow: '#6D28D9' },
  { base: '#4ECDC4', highlight: '#7EDDD6', shadow: '#3ABBB3' },
  { base: '#FFD43B', highlight: '#FFE066', shadow: '#E6BE35' },
];

function ChestIcon({
  chest,
  colorIndex,
  onSelect,
}: {
  chest: TreasureChestData;
  colorIndex: number;
  onSelect: () => void;
}) {
  const colors = CHEST_COLORS[colorIndex];
  const isClosed = chest.state === 'closed';
  const isOpening = chest.state === 'opening';
  const isOpened = chest.state === 'opened';

  return (
    <motion.button
      onClick={isClosed ? onSelect : undefined}
      whileTap={isClosed ? { scale: 0.9 } : undefined}
      animate={
        isOpening
          ? {
              scale: [1, 1.15, 1.05],
              rotate: [0, -5, 5, -3, 0],
            }
          : isOpened
            ? { scale: 1, y: -10 }
            : { scale: 1, y: [0, -4, 0] }
      }
      transition={
        isOpening
          ? { duration: 0.6, ease: 'easeInOut' }
          : isClosed
            ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: colorIndex * 0.3 }
            : { duration: 0.3 }
      }
      className="flex flex-col items-center gap-2"
      style={{ cursor: isClosed ? 'pointer' : 'default' }}
      aria-label={isClosed ? `たからばこ ${colorIndex + 1} をえらぶ` : undefined}
    >
      {/* Chest body */}
      <div
        className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{
          background: isOpened
            ? `linear-gradient(135deg, ${colors.base}44 0%, ${colors.highlight}22 100%)`
            : `linear-gradient(135deg, ${colors.base} 0%, ${colors.highlight} 100%)`,
          boxShadow: isClosed
            ? `0 4px 0 ${colors.shadow}, 0 6px 16px ${colors.base}44`
            : isOpened
              ? `0 0 24px ${colors.base}33`
              : `0 0 20px ${colors.base}66`,
          border: isOpened ? `2px solid ${colors.base}44` : 'none',
        }}
      >
        {/* Lock / sparkle icon */}
        {isClosed && (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-9H9V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2z" />
          </svg>
        )}

        {isOpening && (
          <motion.div
            animate={{ rotate: [0, 360], scale: [0.5, 1.2, 1] }}
            transition={{ duration: 0.6 }}
            className="text-3xl"
          >
            ✨
          </motion.div>
        )}

        {isOpened && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-3xl"
          >
            {chest.reward.icon}
          </motion.span>
        )}
      </div>

      {/* Label */}
      <span
        className="text-xs font-bold"
        style={{
          color: isOpened ? colors.base : isClosed ? '#F0F0FF' : '#8888AA',
        }}
      >
        {isOpened ? chest.reward.name : isClosed ? '？' : '...'}
      </span>
    </motion.button>
  );
}

/**
 * TreasureChest - 宝箱3択UI
 *
 * セッション完了後に表示。3つの宝箱から1つを選んで開封する。
 * ASD予測可能モードでは宝箱を表示せず、固定報酬をそのまま表示する。
 */
export function TreasureChest({
  chests,
  selectedReward,
  onSelectChest,
  onConfirmReward,
  isPredictableMode = false,
  className = '',
}: TreasureChestProps) {
  const hasSelected = selectedReward !== null;

  // 予測可能モード: 宝箱なし、固定報酬表示
  if (isPredictableMode && selectedReward) {
    return (
      <div className={`flex flex-col items-center gap-6 ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-5xl">{selectedReward.icon}</span>
          <p className="text-lg font-bold" style={{ color: '#FFD43B' }}>
            {selectedReward.name}
          </p>
          <p className="text-sm" style={{ color: '#B8B8D0' }}>
            {selectedReward.description}
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onConfirmReward}
          className="px-8 py-3 rounded-2xl font-bold text-base"
          style={{
            background: 'linear-gradient(135deg, #6C3CE1 0%, #8B5CF6 100%)',
            color: '#fff',
            boxShadow: '0 4px 0 #5B2CC9, 0 6px 12px rgba(108, 60, 225, 0.3)',
          }}
        >
          うけとる
        </motion.button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      {/* Title */}
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-center"
        style={{ color: '#F0F0FF' }}
      >
        {hasSelected ? 'おめでとう！' : 'たからばこを えらぼう！'}
      </motion.p>

      {/* Chests row */}
      {!hasSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-end gap-6"
        >
          {chests.map((chest, i) => (
            <ChestIcon
              key={chest.id}
              chest={chest}
              colorIndex={i}
              onSelect={() => onSelectChest(chest.id)}
            />
          ))}
        </motion.div>
      )}

      {/* Revealed reward */}
      <AnimatePresence>
        {hasSelected && selectedReward && (
          <motion.div
            key="reward-reveal"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex flex-col items-center gap-3"
          >
            {/* Rarity glow */}
            <div
              className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background:
                  selectedReward.rarity === 'rare'
                    ? 'radial-gradient(circle, rgba(255, 212, 59, 0.3) 0%, transparent 70%)'
                    : selectedReward.rarity === 'uncommon'
                      ? 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(78, 205, 196, 0.15) 0%, transparent 70%)',
                boxShadow:
                  selectedReward.rarity === 'rare'
                    ? '0 0 40px rgba(255, 212, 59, 0.3)'
                    : 'none',
              }}
            >
              <span className="text-5xl">{selectedReward.icon}</span>
            </div>

            <p
              className="text-lg font-bold"
              style={{
                color:
                  selectedReward.rarity === 'rare'
                    ? '#FFD43B'
                    : selectedReward.rarity === 'uncommon'
                      ? '#A78BFA'
                      : '#4ECDC4',
              }}
            >
              {selectedReward.name}
            </p>

            {selectedReward.rarity === 'rare' && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(255, 212, 59, 0.2)', color: '#FFD43B' }}
              >
                レア！
              </span>
            )}

            <p className="text-sm text-center" style={{ color: '#B8B8D0' }}>
              {selectedReward.description}
            </p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileTap={{ scale: 0.93, y: 3 }}
              onClick={onConfirmReward}
              className="mt-2 px-8 py-3 rounded-2xl font-bold text-base"
              style={{
                background: 'linear-gradient(135deg, #6C3CE1 0%, #8B5CF6 100%)',
                color: '#fff',
                boxShadow: '0 4px 0 #5B2CC9, 0 6px 12px rgba(108, 60, 225, 0.3)',
              }}
            >
              うけとる
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
