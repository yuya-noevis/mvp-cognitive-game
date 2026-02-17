'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { StageGameState } from '@/features/stage-system/types';
import { COGNITIVE_DOMAINS, STAGE_BREAK_DURATION_MS } from '@/lib/constants';
import { DomainIcon, SparkleIcon } from '@/components/icons';
import { ManasCharacter } from '@/components/mascot/ManasCharacter';

interface StageBreakProps {
  completedGame: StageGameState;
  nextGame: StageGameState | null;
  onContinue: () => void;
}

/**
 * StageBreak - ゲーム間の休憩画面
 *
 * 設計根拠：
 * - 深呼吸アニメーション（15-30秒）→ セルフレギュレーション支援
 * - ABA「強化」: 前のゲームの成果をシンプルに称賛
 * - TEACCH: 次のゲームのプレビュー（予測可能性）
 * - ポジティブフィードバックのみ
 */
export function StageBreak({ completedGame, nextGame, onContinue }: StageBreakProps) {
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [timeLeft, setTimeLeft] = useState(Math.ceil(STAGE_BREAK_DURATION_MS / 1000));
  const [canContinue, setCantContinue] = useState(false);

  const completedDomain = COGNITIVE_DOMAINS.find(d => d.key === completedGame.domain);
  const nextDomain = nextGame ? COGNITIVE_DOMAINS.find(d => d.key === nextGame.domain) : null;

  // Breathing animation cycle: 4s in, 2s hold, 4s out
  useEffect(() => {
    const cycle = () => {
      setBreathPhase('in');
      const holdTimer = setTimeout(() => setBreathPhase('hold'), 4000);
      const outTimer = setTimeout(() => setBreathPhase('out'), 6000);
      const resetTimer = setTimeout(cycle, 10000);
      return () => {
        clearTimeout(holdTimer);
        clearTimeout(outTimer);
        clearTimeout(resetTimer);
      };
    };

    const cleanup = cycle();
    return cleanup;
  }, []);

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCantContinue(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  const breathScale = breathPhase === 'in' ? 'scale-110' : breathPhase === 'hold' ? 'scale-110' : 'scale-90';
  const breathText = breathPhase === 'in' ? 'すって...' : breathPhase === 'hold' ? 'とめて...' : 'はいて...';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8"
         style={{ background: 'linear-gradient(180deg, rgba(28,176,246,0.08) 0%, #F7F7F7 100%)' }}>
      <div className="text-center animate-fade-in-up max-w-sm">
        {/* Previous game praise */}
        <div className="mb-6">
          <DomainIcon domain={completedGame.domain} size={40} style={{ color: completedDomain?.color ?? '#58CC02' }} />
          <p className="text-lg font-bold mt-2" style={{ color: '#58CC02' }}>
            がんばったね！
          </p>
          {completedGame.accuracy >= 0.8 && (
            <p className="text-sm mt-1 inline-flex items-center gap-1 justify-center" style={{ color: '#58CC02' }}>
              <SparkleIcon size={14} style={{ color: '#FFC800' }} /> とてもよくできたよ！
            </p>
          )}
        </div>

        {/* Mascot breathing with child */}
        <div className="mb-8">
          <div className={`transition-transform duration-[4000ms] ease-in-out ${breathScale}`}>
            <ManasCharacter
              expression="sleeping"
              pose="sitting"
              size={100}
              speechBubble={breathText}
            />
          </div>
        </div>

        {/* Next game preview (TEACCH: predictability) */}
        {nextGame && nextDomain && (
          <div className="mb-6 p-4 rounded-2xl"
               style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p className="text-sm mb-2" style={{ color: '#AFAFAF' }}>
              つぎのゲーム
            </p>
            <div className="flex items-center justify-center gap-3">
              <DomainIcon domain={nextGame.domain} size={32} style={{ color: nextDomain.color }} />
              <span className="text-base font-bold" style={{ color: '#4B4B4B' }}>
                {nextDomain.labelKana}
              </span>
            </div>
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`tap-target-large px-14 py-6 text-lg font-bold rounded-2xl transition-all
            ${canContinue ? 'btn-duo-green animate-gentle-bounce' : ''}`}
          style={{
            opacity: canContinue ? 1 : 0.4,
            background: canContinue ? undefined : '#EEEEEE',
            color: canContinue ? undefined : '#AFAFAF',
          }}
        >
          {canContinue ? 'つづける' : `${timeLeft}びょう...`}
        </button>
      </div>
    </div>
  );
}
