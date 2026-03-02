'use client';

import React, { useState, useEffect } from 'react';
import type { Tier } from '@/features/gating';
import type { IntegratedGameId } from '@/games/integrated/types';
import { INTEGRATED_GAME_MAP } from '@/games/integrated/game-map';
import { GAME_LOCK_RULES } from '@/features/gating/game-locks';
import { SparkleIcon, StarIcon } from '@/components/icons';
import Luna from '@/components/mascot/Luna';

interface TierUpCelebrationProps {
  /** 昇格後の新しいティア */
  newTier: Tier;
  /** アニメーション完了時のコールバック（約3秒後） */
  onComplete: () => void;
}

/** ティア名の日本語ラベル */
const TIER_LABELS: Record<Tier, string> = {
  1: 'ティア 1',
  2: 'ティア 2',
  3: 'ティア 3',
};

/** ティアのサブタイトル */
const TIER_SUBTITLES: Record<Tier, string> = {
  1: 'はじまりのぼうけん',
  2: 'ルール・べんべつ',
  3: 'すべてのせかい',
};

/**
 * TierUpCelebration - ティア昇格演出コンポーネント
 *
 * ティアが上がった時に表示される。新しく解放されたゲームアイコンと
 * お祝いメッセージを表示し、約3秒後に onComplete を呼ぶ。
 */
export function TierUpCelebration({ newTier, onComplete }: TierUpCelebrationProps) {
  const [showContent, setShowContent] = useState(false);
  const [showGames, setShowGames] = useState(false);

  // 新しく解放されたゲームを特定する（現在のティアで初めてアクセスできるもの）
  const newlyUnlockedGames = GAME_LOCK_RULES
    .filter((rule) => rule.unlockTier === newTier)
    .map((rule) => rule.gameId);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 300);
    const t2 = setTimeout(() => setShowGames(true), 800);
    const t3 = setTimeout(() => onComplete(), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-space animate-fade-in overflow-hidden">
      {/* 背景の星エフェクト */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="animate-twinkle"
            style={{
              position: 'absolute',
              left: `${(i * 43) % 100}%`,
              top: `${(i * 61) % 100}%`,
              width: `${2 + (i % 4)}px`,
              height: `${2 + (i % 4)}px`,
              borderRadius: '50%',
              background: i % 3 === 0 ? '#FFD43B' : i % 3 === 1 ? '#8B5CF6' : '#4ECDC4',
              opacity: 0.3 + (i % 4) * 0.15,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* マスコット */}
        <div className="animate-pop-in mb-2">
          <Luna
            expression="excited"
            pose="jumping"
            size={120}
            speechBubble="やったね！"
          />
        </div>

        {/* メインメッセージ */}
        {showContent && (
          <div className="animate-scale-in mb-4">
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-3"
              style={{ background: 'rgba(255, 212, 59, 0.15)' }}
            >
              <SparkleIcon size={20} style={{ color: '#FFD43B' }} />
              <span className="text-base font-bold" style={{ color: '#FFD43B' }}>
                {TIER_LABELS[newTier]}
              </span>
              <SparkleIcon size={20} style={{ color: '#FFD43B' }} />
            </div>

            <p className="text-2xl font-bold mb-1" style={{ color: '#F0F0FF' }}>
              あたらしいゲームが
            </p>
            <p className="text-2xl font-bold mb-2" style={{ color: '#F0F0FF' }}>
              あそべるようになったよ！
            </p>
            <p className="text-sm" style={{ color: '#8888AA' }}>
              {TIER_SUBTITLES[newTier]}
            </p>
          </div>
        )}

        {/* 新しく解放されたゲームのアイコン */}
        {showGames && newlyUnlockedGames.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mt-4 animate-fade-in-up">
            {newlyUnlockedGames.map((gameId, i) => {
              const config = INTEGRATED_GAME_MAP[gameId as IntegratedGameId];
              if (!config) return null;
              return (
                <div
                  key={gameId}
                  className="flex flex-col items-center animate-scale-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
                    style={{
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1.5px solid rgba(139, 92, 246, 0.4)',
                    }}
                  >
                    <StarIcon size={20} style={{ color: '#8B5CF6' }} />
                  </div>
                  <span
                    className="text-[10px] font-bold leading-tight text-center max-w-[60px]"
                    style={{ color: '#B8B8D0' }}
                  >
                    {config.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* プログレスドット */}
        <div className="flex gap-2 mt-8">
          {([1, 2, 3] as Tier[]).map((t) => (
            <div
              key={t}
              className="rounded-full transition-all duration-500"
              style={{
                width: t === newTier ? '24px' : '8px',
                height: '8px',
                background: t <= newTier ? '#8B5CF6' : 'rgba(139, 92, 246, 0.2)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
