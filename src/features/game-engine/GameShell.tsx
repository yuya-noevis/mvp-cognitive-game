'use client';

import React from 'react';
import type { GameSessionControls } from './hooks/useGameSession';
import { StarIcon } from '@/components/icons';
import Luna, { LunaFaceOnly } from '@/components/mascot/Luna';
import { CosmicProgressBar } from '@/components/ui/CosmicProgressBar';

interface GameShellProps {
  gameName: string;
  session: GameSessionControls;
  children: React.ReactNode;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

/**
 * GameShell - 宇宙テーマ ゲームUIラッパー
 *
 * エクササイズ中: 宇宙背景 + CosmicProgressBar
 * 開始画面・終了画面・休憩画面も宇宙テーマ
 */
export function GameShell({ gameName, session, children, stageMode, maxTrials, onStageComplete }: GameShellProps) {
  // Session not started yet
  if (!session.sessionId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-space relative overflow-hidden">
        {/* Subtle stars */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={i % 3 === 0 ? 'animate-twinkle' : ''}
              style={{
                position: 'absolute',
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                width: `${1 + (i % 3)}px`,
                height: `${1 + (i % 3)}px`,
                borderRadius: '50%',
                background: '#F0F0FF',
                opacity: 0.3 + (i % 5) * 0.1,
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center animate-fade-in-up relative z-10">
          <div className="mb-4">
            <Luna
              expression="encouraging"
              pose="waving"
              size={120}
              speechBubble={`${gameName}で あそぼう！`}
            />
          </div>

          <button
            onClick={session.startSession}
            className="btn-cosmic px-14 py-5 text-xl rounded-2xl tap-interactive active:scale-95"
          >
            はじめる
          </button>
        </div>
      </div>
    );
  }

  // Session ended
  if (session.isSessionEnded) {
    if (stageMode && onStageComplete) {
      const accuracy = session.totalTrials > 0
        ? session.totalCorrect / session.totalTrials
        : 0;
      setTimeout(() => onStageComplete(accuracy), 0);
      return (
        <div className="flex min-h-screen items-center justify-center bg-space">
          <div className="animate-gentle-pulse">
            <LunaFaceOnly expression="happy" size={64} />
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-space relative overflow-hidden">
        <div className="text-center animate-pop-in relative z-10">
          <div className="mb-2">
            <Luna
              expression="excited"
              pose="jumping"
              size={130}
              speechBubble="すごいね！がんばったね！"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 animate-fade-in-up"
               style={{ background: 'rgba(255,212,59,0.15)', animationDelay: '300ms' }}>
            <StarIcon size={20} style={{ color: '#FFD43B' }} />
            <p className="text-base font-medium" style={{ color: '#FFD43B' }}>
              {session.totalTrials}かい チャレンジしたよ！
            </p>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <button
              onClick={() => window.history.back()}
              className="btn-comet px-14 py-5 text-lg rounded-2xl tap-interactive active:scale-95"
            >
              もどる
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Break screen
  if (session.isBreakActive) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-space">
        <div className="text-center animate-fade-in-up">
          <div className="mb-4">
            <Luna
              expression="sleeping"
              pose="sitting"
              size={120}
              speechBubble="ちょっと やすもう"
            />
          </div>

          <h2 className="text-2xl font-bold mb-3" style={{ color: '#F0F0FF' }}>
            ひとやすみ
          </h2>
          <p className="text-base mb-8" style={{ color: '#B8B8D0' }}>
            すこし やすんでから つづけよう
          </p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={session.endBreak}
              className="btn-cosmic px-14 py-5 text-lg rounded-2xl tap-interactive active:scale-95"
            >
              つづける
            </button>
            <button
              onClick={() => session.endSession('user_quit')}
              className="px-8 py-3 text-base font-medium rounded-2xl tap-interactive"
              style={{ background: 'rgba(42,42,90,0.6)', color: '#B8B8D0', boxShadow: '0 2px 0 rgba(0,0,0,0.2)' }}
            >
              おわる
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Progress calculation
  const progress = maxTrials ? Math.min(session.trialNumber / maxTrials, 1) : 0;

  // Active game - cosmic background + CosmicProgressBar
  return (
    <div className="flex min-h-screen flex-col bg-space">
      {/* Header: close button + cosmic progress bar */}
      <header className="flex items-center gap-3 px-4 py-3">
        {/* Close button */}
        <button
          onClick={() => session.endSession('user_quit')}
          className="flex-shrink-0 tap-target tap-interactive"
          aria-label="おわる"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#B8B8D0" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>

        {/* Cosmic progress bar */}
        <CosmicProgressBar progress={progress} className="flex-1" />
      </header>

      {/* Game content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
