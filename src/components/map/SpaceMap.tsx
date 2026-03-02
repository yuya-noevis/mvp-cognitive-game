'use client';

import React, { useState } from 'react';
import { StarField } from './StarField';
import { Planet } from './Planet';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { LockIcon, SparkleIcon } from '@/components/icons';
import { INTEGRATED_GAME_MAP, INTEGRATED_GAME_LIST } from '@/games/integrated';
import { CATEGORIES } from '@/games/integrated';
import type { IntegratedGameId } from '@/games/integrated/types';
import { useTier, getAccessibleGames } from '@/features/gating';
import Link from 'next/link';

/** カテゴリカラーマッピング */
const CATEGORY_COLORS: Record<string, string> = {
  'hikari':   '#6C3CE1', // ひかりラボ — 紫
  'kotoba':   '#4ECDC4', // ことばライブラリ — シアン
  'hirameki': '#FFD43B', // ひらめきタワー — 黄
  'kankaku':  '#2ED573', // かんかくドーム — 緑
  'kokoro':   '#FF6B9D', // こころハウス — ピンク
};

/** ティアのラベル */
const TIER_LABELS = {
  1: 'ティア 1 — はじまりのぼうけん',
  2: 'ティア 2 — ルール・べんべつ',
  3: 'ティア 3 — すべてのせかい',
} as const;

interface SpaceMapProps {
  /** 後方互換用（廃止予定）。指定しても useTier() の結果が優先される。 */
  unlockedSystems?: string[];
  className?: string;
}

/**
 * SpaceMap — ティア連動型宇宙マップ
 *
 * useTier() + getAccessibleGames() を使って現在のティアに基づき
 * 解放済みゲームを動的に算出する。
 */
export function SpaceMap({ className = '' }: SpaceMapProps) {
  const { tier, loading } = useTier();
  const [selectedGameId, setSelectedGameId] = useState<IntegratedGameId | null>(null);
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);

  // ティアに基づいてアクセス可能なゲームを取得
  const { accessible, locked } = loading
    ? { accessible: [] as IntegratedGameId[], locked: [] as IntegratedGameId[] }
    : getAccessibleGames(tier);

  const selectedConfig = selectedGameId ? INTEGRATED_GAME_MAP[selectedGameId] : null;

  // ロックされたゲームをタップしたときのハンドラ
  const handleLockedTap = (gameId: IntegratedGameId) => {
    const config = INTEGRATED_GAME_MAP[gameId];
    setLockedMessage(
      `「${config?.name ?? 'このゲーム'}」は\nもうすこし がんばると あそべるよ！`,
    );
  };

  return (
    <div className={`relative min-h-screen bg-space overflow-x-auto ${className}`}>
      <StarField count={150} />

      {/* Nebula decorations */}
      <div
        className="absolute top-[10%] left-[5%] w-40 h-40 rounded-full animate-nebula-drift"
        style={{ background: 'radial-gradient(circle, rgba(108,60,225,0.1) 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[60%] right-[10%] w-56 h-56 rounded-full animate-nebula-drift"
        style={{ background: 'radial-gradient(circle, rgba(255,107,157,0.08) 0%, transparent 70%)', animationDelay: '4s' }}
      />

      {/* ティアバッジ（右上） */}
      {!loading && (
        <div className="absolute top-4 right-4 z-10">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#8B5CF6',
            }}
          >
            <SparkleIcon size={12} style={{ color: '#8B5CF6' }} />
            <span>Tier {tier}</span>
          </div>
        </div>
      )}

      {/* カテゴリ星系のスクロールビュー */}
      <div
        className="flex items-start gap-0 overflow-x-auto snap-x snap-mandatory px-4 pt-20 pb-24 min-h-screen"
        style={{ scrollBehavior: 'smooth' }}
      >
        {CATEGORIES.map((category) => {
          const categoryColor = CATEGORY_COLORS[category.buildingId] ?? '#6C3CE1';
          // このカテゴリのゲームのうち1つでも解放されているかで星系のロック判定
          const hasAnyUnlocked = category.gameIds.some((id) => accessible.includes(id));

          return (
            <div
              key={category.id}
              className="flex-shrink-0 w-screen snap-center flex flex-col items-center px-4"
            >
              {/* 星系名 */}
              <h2
                className="text-lg font-bold mb-8 text-center"
                style={{ color: hasAnyUnlocked ? categoryColor : '#8888AA' }}
              >
                {category.name}
              </h2>

              {/* 母星（カテゴリ中央） */}
              <div className="relative">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center mb-8 mx-auto animate-gentle-pulse"
                  style={{
                    background: hasAnyUnlocked
                      ? `radial-gradient(circle at 35% 35%, ${categoryColor}FF 0%, ${categoryColor}88 100%)`
                      : 'radial-gradient(circle, #3A3A6A 0%, #2A2A5A 100%)',
                    boxShadow: hasAnyUnlocked
                      ? `0 0 40px ${categoryColor}44, 0 0 80px ${categoryColor}22`
                      : '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill={hasAnyUnlocked ? 'white' : '#8888AA'}
                  >
                    <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                  </svg>
                </div>

                {/* 衛星ゲーム惑星 */}
                <div className="flex flex-wrap justify-center gap-6 max-w-[320px] mx-auto">
                  {category.gameIds.map((gameId) => {
                    const config = INTEGRATED_GAME_MAP[gameId];
                    if (!config) return null;
                    const isLocked = locked.includes(gameId) || !accessible.includes(gameId);

                    return (
                      <Planet
                        key={gameId}
                        name={config.name}
                        color={categoryColor}
                        size={70}
                        locked={isLocked}
                        icon={
                          <span style={{ fontSize: '24px' }}>{config.icon}</span>
                        }
                        onClick={
                          isLocked
                            ? () => handleLockedTap(gameId)
                            : () => setSelectedGameId(gameId)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ゲーム詳細ボトムシート */}
      <BottomSheet
        isOpen={!!selectedGameId && !lockedMessage}
        onClose={() => setSelectedGameId(null)}
        title={selectedConfig?.name}
      >
        {selectedConfig && selectedGameId && (
          <div className="flex flex-col items-center gap-4 pb-4">
            {/* ゲームアイコン */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(108, 60, 225, 0.15)',
                border: '2px solid rgba(108, 60, 225, 0.3)',
              }}
            >
              <span style={{ fontSize: '40px' }}>{selectedConfig.icon}</span>
            </div>

            <p className="text-sm text-center" style={{ color: '#B8B8D0' }}>
              {selectedConfig.description}
            </p>

            <Link href={`/game/${selectedGameId}`} className="w-full">
              <CosmicButton variant="primary" size="lg" className="w-full">
                あそぶ
              </CosmicButton>
            </Link>
          </div>
        )}
      </BottomSheet>

      {/* ロックメッセージダイアログ */}
      <BottomSheet
        isOpen={!!lockedMessage}
        onClose={() => setLockedMessage(null)}
        title="まだあそべないよ"
      >
        <div className="flex flex-col items-center gap-4 pb-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255, 212, 59, 0.15)' }}
          >
            <LockIcon size={32} style={{ color: '#FFD43B' }} />
          </div>
          <p
            className="text-base font-medium text-center whitespace-pre-line"
            style={{ color: '#B8B8D0' }}
          >
            {lockedMessage}
          </p>
          <p className="text-sm text-center" style={{ color: '#8888AA' }}>
            {TIER_LABELS[tier]}
          </p>
          <CosmicButton
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => setLockedMessage(null)}
          >
            わかった
          </CosmicButton>
        </div>
      </BottomSheet>
    </div>
  );
}
