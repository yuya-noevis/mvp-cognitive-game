'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { StageGameState } from '@/features/stage-system/types';
import { COGNITIVE_DOMAINS } from '@/lib/constants';
import { TrophyIcon, DomainIcon, StarIcon, SparkleIcon } from '@/components/icons';
import Luna from '@/components/mascot/Luna';

interface StageCelebrationProps {
  games: StageGameState[];
  stageNumber: number;
  onComplete: () => void;
}

/**
 * StageCelebration - 宇宙テーマ ステージ完了報酬画面
 */
export function StageCelebration({ games, stageNumber, onComplete }: StageCelebrationProps) {
  const [showStars, setShowStars] = useState(false);
  const [showSpecial, setShowSpecial] = useState(false);

  const isSpecialReward = useMemo(() => Math.random() < 0.3, []);

  const avgAccuracy = useMemo(() => {
    const completed = games.filter(g => g.isCompleted && g.accuracy > 0);
    if (completed.length === 0) return 0;
    return completed.reduce((sum, g) => sum + g.accuracy, 0) / completed.length;
  }, [games]);

  useEffect(() => {
    const t1 = setTimeout(() => setShowStars(true), 500);
    const t2 = setTimeout(() => setShowSpecial(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const encouragement = avgAccuracy >= 0.8
    ? 'すばらしい！'
    : avgAccuracy >= 0.6
      ? 'がんばったね！'
      : 'よくちょうせんしたね！';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-space relative overflow-hidden">
      {/* Celebration stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="animate-twinkle"
            style={{
              position: 'absolute',
              left: `${(i * 47) % 100}%`,
              top: `${(i * 67) % 100}%`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              borderRadius: '50%',
              background: '#FFD43B',
              opacity: 0.4 + (i % 3) * 0.15,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-10">
        <div className="animate-pop-in mb-2">
          <Luna
            expression="excited"
            pose="jumping"
            size={130}
            speechBubble={encouragement}
          />
        </div>

        <div className="animate-scale-in mb-4" style={{ animationDelay: '200ms' }}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
               style={{ background: 'rgba(255, 212, 59, 0.15)' }}>
            <TrophyIcon size={24} style={{ color: '#FFD43B' }} />
            <span className="text-lg font-bold" style={{ color: '#FFD43B' }}>
              ステージ {stageNumber} クリア！
            </span>
          </div>
        </div>

        {showStars && (
          <div className="flex justify-center gap-3 mb-6 animate-fade-in-up">
            {games.map((game, i) => {
              const domain = COGNITIVE_DOMAINS.find(d => d.key === game.domain);
              return (
                <div key={`${game.gameId}-${i}`}
                     className="flex flex-col items-center animate-scale-in"
                     style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-1"
                       style={{ background: `${domain?.color ?? '#6C3CE1'}20` }}>
                    <DomainIcon domain={game.domain} size={24} style={{ color: domain?.color ?? '#6C3CE1' }} />
                  </div>
                  {game.isCompleted && game.accuracy >= 0.8 && (
                    <StarIcon size={12} style={{ color: '#FFD43B' }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {showSpecial && isSpecialReward && (
          <div className="mb-6 p-4 rounded-2xl animate-scale-in"
               style={{ background: 'rgba(255, 212, 59, 0.15)', border: '1px solid rgba(255, 212, 59, 0.3)' }}>
            <SparkleIcon size={32} style={{ color: '#FFD43B' }} />
            <p className="text-sm font-bold mt-1" style={{ color: '#FFD43B' }}>
              スペシャルボーナス！
            </p>
          </div>
        )}

        <p className="text-sm mb-8" style={{ color: '#8888AA' }}>
          きのうより がんばった！
        </p>

        <button
          onClick={onComplete}
          className="btn-cosmic tap-target-large px-14 py-6 text-lg rounded-2xl animate-gentle-bounce tap-interactive active:scale-95"
        >
          つぎへすすむ
        </button>
      </div>
    </div>
  );
}
