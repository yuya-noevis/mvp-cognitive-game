'use client';

import React from 'react';
import type { GameSessionControls } from './hooks/useGameSession';
import { StarIcon } from '@/components/icons';
import { ManasCharacter, ManasFace } from '@/components/mascot/ManasCharacter';

interface GameShellProps {
  gameName: string;
  session: GameSessionControls;
  children: React.ReactNode;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

/**
 * GameShell - Duolingo ABC風ゲームUIラッパー
 *
 * エクササイズ中: 白背景 + Xボタン + 緑プログレスバー
 * 開始画面・終了画面・休憩画面もDuolingo ABCスタイル
 */
export function GameShell({ gameName, session, children, stageMode, maxTrials, onStageComplete }: GameShellProps) {
  // Session not started yet
  if (!session.sessionId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8"
           style={{ background: '#F7F7F7' }}>
        <div className="text-center animate-fade-in-up">
          <div className="mb-4">
            <ManasCharacter
              expression="encouraging"
              pose="waving"
              size={120}
              speechBubble={`${gameName}で あそぼう！`}
            />
          </div>

          <button
            onClick={session.startSession}
            className="btn-duo-green px-14 py-5 text-xl rounded-2xl tap-interactive active:scale-95"
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
        <div className="flex min-h-screen items-center justify-center" style={{ background: '#F7F7F7' }}>
          <div className="animate-gentle-pulse">
            <ManasFace expression="happy" size={64} />
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8"
           style={{ background: '#F7F7F7' }}>
        <div className="text-center animate-pop-in">
          <div className="mb-2">
            <ManasCharacter
              expression="excited"
              pose="jumping"
              size={130}
              speechBubble="すごいね！がんばったね！"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8 animate-fade-in-up"
               style={{ background: 'rgba(88,204,2,0.12)', animationDelay: '300ms' }}>
            <StarIcon size={20} style={{ color: '#FFC800' }} />
            <p className="text-base font-medium" style={{ color: '#58CC02' }}>
              {session.totalTrials}かい チャレンジしたよ！
            </p>
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <button
              onClick={() => window.history.back()}
              className="btn-duo-blue px-14 py-5 text-lg rounded-2xl tap-interactive active:scale-95"
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
      <div className="flex min-h-screen flex-col items-center justify-center p-8"
           style={{ background: '#F7F7F7' }}>
        <div className="text-center animate-fade-in-up">
          <div className="mb-4">
            <ManasCharacter
              expression="sleeping"
              pose="sitting"
              size={120}
              speechBubble="ちょっと やすもう"
            />
          </div>

          <h2 className="text-2xl font-bold mb-3" style={{ color: '#4B4B4B' }}>
            ひとやすみ
          </h2>
          <p className="text-base mb-8" style={{ color: '#777777' }}>
            すこし やすんでから つづけよう
          </p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={session.endBreak}
              className="btn-duo-green px-14 py-5 text-lg rounded-2xl tap-interactive active:scale-95"
            >
              つづける
            </button>
            <button
              onClick={() => session.endSession('user_quit')}
              className="px-8 py-3 text-base font-medium rounded-xl tap-interactive"
              style={{ background: '#E5E5E5', color: '#777777', boxShadow: '0 2px 0 #D5D5D5' }}
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

  // Active game - clean white bg + X button + green progress bar (Duolingo ABC exercise style)
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#F7F7F7' }}>
      {/* Header: X button + green progress bar */}
      <header className="flex items-center gap-3 px-4 py-3">
        {/* X close button (Duo ABC style) */}
        <button
          onClick={() => session.endSession('user_quit')}
          className="flex-shrink-0 tap-target tap-interactive"
          aria-label="おわる"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#E5E5E5" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </button>

        {/* Green progress bar (Duo ABC style) */}
        <div className="flex-1 h-4 rounded-full overflow-hidden relative"
             style={{ background: '#E5E5E5' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(progress * 100, 2)}%`,
              background: 'linear-gradient(90deg, #58CC02 0%, #7DD836 100%)',
              boxShadow: progress > 0.05 ? 'inset 0 2px 0 rgba(255,255,255,0.2)' : 'none',
            }}
          />
          {/* Green dot at start position */}
          {progress <= 0.05 && (
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                 style={{ background: '#58CC02' }} />
          )}
        </div>
      </header>

      {/* Game content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
