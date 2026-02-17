'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { StageGameState } from '@/features/stage-system/types';
import { COGNITIVE_DOMAINS } from '@/lib/constants';
import { TrophyIcon, DomainIcon, StarIcon, SparkleIcon } from '@/components/icons';
import { ManasCharacter } from '@/components/mascot/ManasCharacter';

interface StageCelebrationProps {
  games: StageGameState[];
  stageNumber: number;
  onComplete: () => void;
}

/**
 * StageCelebration - ステージ完了時の報酬画面
 *
 * 設計根拠：
 * - 変動比率強化スケジュール (VR): ランダムにスペシャル報酬
 *   Skinner (1957) - VRは最も消去耐性が高い強化スケジュール
 * - 自己比較のみ（他者比較なし）
 * - ポジティブフィードバックのみ
 */
export function StageCelebration({ games, stageNumber, onComplete }: StageCelebrationProps) {
  const [showStars, setShowStars] = useState(false);
  const [showSpecial, setShowSpecial] = useState(false);

  // VR強化: ランダムにスペシャル報酬（約30%の確率）
  const isSpecialReward = useMemo(() => Math.random() < 0.3, []);

  const avgAccuracy = useMemo(() => {
    const completed = games.filter(g => g.isCompleted && g.accuracy > 0);
    if (completed.length === 0) return 0;
    return completed.reduce((sum, g) => sum + g.accuracy, 0) / completed.length;
  }, [games]);

  useEffect(() => {
    // Staggered animation
    const t1 = setTimeout(() => setShowStars(true), 500);
    const t2 = setTimeout(() => setShowSpecial(true), 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const encouragement = avgAccuracy >= 0.8
    ? 'すばらしい！'
    : avgAccuracy >= 0.6
      ? 'がんばったね！'
      : 'よくちょうせんしたね！';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8"
         style={{ background: 'linear-gradient(180deg, rgba(88,204,2,0.1) 0%, #F7F7F7 100%)' }}>
      <div className="text-center">
        {/* Mascot celebrating */}
        <div className="animate-pop-in mb-2">
          <ManasCharacter
            expression="excited"
            pose="jumping"
            size={130}
            speechBubble={encouragement}
          />
        </div>

        {/* Trophy badge */}
        <div className="animate-scale-in mb-4" style={{ animationDelay: '200ms' }}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
               style={{ background: 'rgba(255, 200, 0, 0.15)' }}>
            <TrophyIcon size={24} style={{ color: '#FFC800' }} />
            <span className="text-lg font-bold" style={{ color: '#46A302' }}>
              ステージ {stageNumber} クリア！
            </span>
          </div>
        </div>

        {/* Game results - stars */}
        {showStars && (
          <div className="flex justify-center gap-3 mb-6 animate-fade-in-up">
            {games.map((game, i) => {
              const domain = COGNITIVE_DOMAINS.find(d => d.key === game.domain);
              return (
                <div key={`${game.gameId}-${i}`}
                     className="flex flex-col items-center animate-scale-in"
                     style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
                       style={{ background: `${domain?.color ?? 'var(--color-primary)'}20` }}>
                    <DomainIcon domain={game.domain} size={24} style={{ color: domain?.color ?? 'var(--color-primary)' }} />
                  </div>
                  {game.isCompleted && game.accuracy >= 0.8 && (
                    <StarIcon size={12} style={{ color: '#FFC800' }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Special reward (VR schedule) */}
        {showSpecial && isSpecialReward && (
          <div className="mb-6 p-4 rounded-2xl animate-scale-in"
               style={{ background: 'rgba(255, 200, 0, 0.15)' }}>
            <SparkleIcon size={32} style={{ color: '#FFC800' }} />
            <p className="text-sm font-bold mt-1" style={{ color: '#FFC800' }}>
              スペシャルボーナス！
            </p>
          </div>
        )}

        {/* Self-comparison only */}
        <p className="text-sm mb-8" style={{ color: '#AFAFAF' }}>
          きのうより がんばった！
        </p>

        {/* Continue button */}
        <button
          onClick={onComplete}
          className="btn-duo-green tap-target-large px-14 py-6 text-lg rounded-2xl animate-gentle-bounce tap-interactive active:scale-95"
        >
          つぎへすすむ
        </button>
      </div>
    </div>
  );
}
