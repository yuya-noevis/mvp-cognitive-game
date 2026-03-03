'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpaceMap } from './SpaceMap';
import { useTier } from '@/features/gating';
import { CATEGORIES } from '@/games/integrated';
import type { Tier } from '@/features/gating';

interface AdventureMapProps {
  className?: string;
}

/** カテゴリを惑星として扱い、ティア解放に応じて新エリアを出現させる */
interface PlanetArea {
  categoryId: string;
  name: string;
  color: string;
  /** この惑星が可視になる最低ティア */
  minTier: Tier;
}

/**
 * 5カテゴリ惑星のティア別解放マッピング
 *
 * ティア1: ひかりラボ + ことばライブラリ + かんかくドーム (基本3惑星)
 * ティア2: + ひらめきタワー
 * ティア3: + こころハウス (全惑星解放)
 */
const PLANET_AREAS: PlanetArea[] = [
  { categoryId: 'attention-inhibition', name: 'ひかりラボ', color: '#6C3CE1', minTier: 1 },
  { categoryId: 'memory-learning', name: 'ことばライブラリ', color: '#4ECDC4', minTier: 1 },
  { categoryId: 'perception-spatial', name: 'かんかくドーム', color: '#2ED573', minTier: 1 },
  { categoryId: 'flexibility-control', name: 'ひらめきタワー', color: '#FFD43B', minTier: 2 },
  { categoryId: 'social-language', name: 'こころハウス', color: '#FF6B9D', minTier: 3 },
];

/**
 * AdventureMap - 冒険マップ（ティア解放型宇宙マップの拡張）
 *
 * SpaceMapをベースに、ティア解放時に新しい惑星エリアが出現する演出を追加。
 * ティアバッジ表示と、新エリア出現バナーを表示する。
 */
export function AdventureMap({ className = '' }: AdventureMapProps) {
  const { tier, loading } = useTier();

  const visibleAreas = useMemo(
    () => PLANET_AREAS.filter(area => area.minTier <= tier),
    [tier],
  );

  const nextArea = useMemo(
    () => PLANET_AREAS.find(area => area.minTier === tier + 1),
    [tier],
  );

  return (
    <div className={`relative ${className}`}>
      {/* Main SpaceMap */}
      <SpaceMap />

      {/* Tier progress indicator (bottom bar) */}
      {!loading && (
        <div
          className="fixed bottom-20 left-4 right-4 z-10 flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: 'rgba(26, 26, 64, 0.9)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Visible planet indicators */}
          <div className="flex gap-2 flex-1">
            {PLANET_AREAS.map(area => {
              const isVisible = area.minTier <= tier;
              return (
                <div key={area.categoryId} className="flex flex-col items-center gap-0.5">
                  <motion.div
                    animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0.6, opacity: 0.3 }}
                    className="w-6 h-6 rounded-full"
                    style={{
                      background: isVisible
                        ? `radial-gradient(circle at 35% 35%, ${area.color} 0%, ${area.color}88 100%)`
                        : 'rgba(136, 136, 170, 0.2)',
                      boxShadow: isVisible ? `0 0 8px ${area.color}44` : 'none',
                    }}
                  />
                  <span
                    className="text-[8px] font-bold leading-none"
                    style={{ color: isVisible ? area.color : '#8888AA' }}
                  >
                    {area.name.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Next unlock hint */}
          {nextArea && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <span className="text-[10px]" style={{ color: '#8888AA' }}>
                つぎ:
              </span>
              <span className="text-[10px] font-bold" style={{ color: nextArea.color }}>
                {nextArea.name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tier unlock announcement overlay (shown briefly when new area unlocks) */}
      {/* This would be triggered via a state flag in production */}
    </div>
  );
}

/**
 * TierUnlockBanner - ティア解放時に表示するバナー
 */
export function TierUnlockBanner({
  newTier,
  areaName,
  areaColor,
  onDismiss,
}: {
  newTier: number;
  areaName: string;
  areaColor: string;
  onDismiss: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(10, 10, 30, 0.85)' }}
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="flex flex-col items-center gap-4 p-8"
        >
          <motion.div
            animate={{
              boxShadow: [
                `0 0 20px ${areaColor}44`,
                `0 0 60px ${areaColor}66`,
                `0 0 20px ${areaColor}44`,
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${areaColor} 0%, ${areaColor}88 100%)`,
            }}
          >
            <span className="text-4xl">🌟</span>
          </motion.div>

          <p className="text-sm font-bold" style={{ color: areaColor }}>
            ティア {newTier} かいほう！
          </p>

          <p className="text-xl font-bold" style={{ color: '#F0F0FF' }}>
            あたらしい わくせい！
          </p>

          <p className="text-base font-bold" style={{ color: areaColor }}>
            {areaName}
          </p>

          <p className="text-sm" style={{ color: '#B8B8D0' }}>
            あたらしい ぼうけんが はじまるよ！
          </p>

          <motion.p
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-xs mt-4"
            style={{ color: '#8888AA' }}
          >
            タップして つづける
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
