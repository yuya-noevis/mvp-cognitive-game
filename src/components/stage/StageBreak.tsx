'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { StageGameState } from '@/features/stage-system/types';
import { COGNITIVE_DOMAINS, STAGE_BREAK_DURATION_MS } from '@/lib/constants';
import { DomainIcon, SparkleIcon } from '@/components/icons';
import Luna from '@/components/mascot/Luna';

interface StageBreakProps {
  completedGame: StageGameState;
  nextGame: StageGameState | null;
  onContinue: () => void;
}

/**
 * StageBreak - 宇宙テーマ ゲーム間休憩画面
 */
export function StageBreak({ completedGame, nextGame, onContinue }: StageBreakProps) {
  const [breathPhase, setBreathPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [timeLeft, setTimeLeft] = useState(Math.ceil(STAGE_BREAK_DURATION_MS / 1000));
  const [canContinue, setCantContinue] = useState(false);

  const completedDomain = COGNITIVE_DOMAINS.find(d => d.key === completedGame.domain);
  const nextDomain = nextGame ? COGNITIVE_DOMAINS.find(d => d.key === nextGame.domain) : null;

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
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-space">
      <div className="text-center animate-fade-in-up max-w-sm">
        {/* Previous game praise */}
        <div className="mb-6">
          <DomainIcon domain={completedGame.domain} size={40} style={{ color: completedDomain?.color ?? '#8B5CF6' }} />
          <p className="text-lg font-bold mt-2" style={{ color: '#2ED573' }}>
            がんばったね！
          </p>
          {completedGame.accuracy >= 0.8 && (
            <p className="text-sm mt-1 inline-flex items-center gap-1 justify-center" style={{ color: '#FFD43B' }}>
              <SparkleIcon size={14} style={{ color: '#FFD43B' }} /> とてもよくできたよ！
            </p>
          )}
        </div>

        {/* Mascot breathing */}
        <div className="mb-8">
          <div className={`transition-transform duration-[4000ms] ease-in-out ${breathScale}`}>
            <Luna
              expression="sleepy"
              pose="sitting"
              size={100}
              speechBubble={breathText}
            />
          </div>
        </div>

        {/* Next game preview */}
        {nextGame && nextDomain && (
          <div className="mb-6 p-4 rounded-2xl"
               style={{
                 background: 'rgba(42, 42, 90, 0.6)',
                 border: '1px solid rgba(108, 60, 225, 0.2)',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
               }}>
            <p className="text-sm mb-2" style={{ color: '#8888AA' }}>
              つぎのゲーム
            </p>
            <div className="flex items-center justify-center gap-3">
              <DomainIcon domain={nextGame.domain} size={32} style={{ color: nextDomain.color }} />
              <span className="text-base font-bold" style={{ color: '#F0F0FF' }}>
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
            ${canContinue ? 'btn-cosmic animate-gentle-bounce' : ''}`}
          style={{
            opacity: canContinue ? 1 : 0.4,
            background: canContinue ? undefined : 'rgba(42, 42, 90, 0.4)',
            color: canContinue ? undefined : '#8888AA',
          }}
        >
          {canContinue ? 'つづける' : `${timeLeft}びょう...`}
        </button>
      </div>
    </div>
  );
}
