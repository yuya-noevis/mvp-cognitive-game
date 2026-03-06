'use client';

import React, { useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { GameSessionControls } from './hooks/useGameSession';
import Mogura from '@/components/mascot/Mogura';
import { MoguraSpeech } from '@/components/mascot/MoguraSpeech';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { CosmicProgressBar } from '@/components/ui/CosmicProgressBar';
import { ComboCounter } from '@/components/feedback/ComboCounter';
import type { GameId } from '@/types';
import { useSessionContext } from '@/features/session/SessionContext';

interface GameShellProps {
  gameName: string;
  gameId?: GameId;
  session: GameSessionControls;
  children: React.ReactNode;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

// Building theme gradients based on game → building mapping
const GAME_BUILDING_MAP: Record<string, string> = {
  'hikari-catch': 'hikari',
  'matte-stop': 'hikari',
  'oboete-narabete': 'hikari',
  'kimochi-yomitori': 'kokoro',
  'kimochi-stop': 'kokoro',
  'irokae-switch': 'hirameki',
  'pattern-puzzle': 'hirameki',
  'tsumitage-tower': 'hirameki',
  'meiro-tanken': 'hirameki',
  'katachi-sagashi': 'kankaku',
  'hayawaza-touch': 'kankaku',
  'touch-de-go': 'kankaku',
  'kotoba-catch': 'kotoba',
  'oboete-match': 'kotoba',
};

const BUILDING_GRADIENTS: Record<string, string> = {
  hikari: 'linear-gradient(180deg, #1A1A40 0%, #2A1A50 50%, #3A2060 100%)',
  kokoro: 'linear-gradient(180deg, #1A1A40 0%, #2A1A50 50%, #4A2080 100%)',
  hirameki: 'linear-gradient(180deg, #1A1A40 0%, #1A2A40 50%, #1A3A50 100%)',
  kankaku: 'linear-gradient(180deg, #1A1A40 0%, #1A2A3A 50%, #1A3A40 100%)',
  kotoba: 'linear-gradient(180deg, #1A1A40 0%, #2A2A30 50%, #3A3A20 100%)',
};

function StarParticles({ count = 25 }: { count?: number }) {
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      left: `${(i * 37 + 13) % 100}%`,
      top: `${(i * 53 + 7) % 100}%`,
      size: 1 + (i % 3),
      opacity: 0.3 + (i % 5) * 0.1,
      delay: `${(i * 0.4) % 3}s`,
      twinkle: i % 3 === 0,
    })),
    [count]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s, i) => (
        <div
          key={i}
          className={s.twinkle ? 'animate-twinkle' : ''}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: '50%',
            background: '#FFFFFF',
            opacity: s.opacity,
            animationDelay: s.delay,
          }}
        />
      ))}
    </div>
  );
}

/**
 * GameShell - Mobile-optimized game UI wrapper with building-themed backgrounds
 */
export function GameShell({ gameName, gameId, session, children, stageMode, maxTrials, onStageComplete }: GameShellProps) {
  const router = useRouter();
  const sessionCtx = useSessionContext();
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const handleQuitRequest = useCallback(() => {
    setShowQuitConfirm(true);
  }, []);

  const handleQuitConfirm = useCallback(() => {
    setShowQuitConfirm(false);
    session.endSession('user_quit');
  }, [session]);

  const handleQuitCancel = useCallback(() => {
    setShowQuitConfirm(false);
  }, []);
  const building = gameId ? GAME_BUILDING_MAP[gameId] || 'hikari' : 'hikari';
  const bgGradient = BUILDING_GRADIENTS[building];

  const safeAreaStyle = {
    background: bgGradient,
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  };

  // Session not started yet — Pre-start screen
  if (!session.sessionId) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center px-5 overflow-hidden z-30"
        style={safeAreaStyle}
      >
        <StarParticles count={25} />

        <div className="text-center animate-fade-in-up relative z-10">
          <div className="mb-4">
            <MoguraSpeech expression="encouraging" size={120} message={`${gameName}で あそぼう!`} />
          </div>
          <CosmicButton
            variant="primary"
            size="lg"
            onClick={session.startSession}
            ariaLabel={`${gameName}をはじめる`}
            className="px-14"
          >
            はじめる
          </CosmicButton>
        </div>
      </div>
    );
  }

  // Session ended — defer to page-level SessionComplete if session context active
  if (session.isSessionEnded && sessionCtx?.hideEndScreen) {
    return null;
  }

  // Session ended
  if (session.isSessionEnded) {
    if (stageMode && onStageComplete) {
      const accuracy = session.totalTrials > 0
        ? session.totalCorrect / session.totalTrials
        : 0;
      setTimeout(() => onStageComplete(accuracy), 0);
      return (
        <div className="fixed inset-0 flex items-center justify-center z-30" style={safeAreaStyle}>
          <div className="animate-gentle-pulse">
            <Mogura expression="happy" size={64} />
          </div>
        </div>
      );
    }

    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center px-5 overflow-hidden z-30"
        style={safeAreaStyle}
      >
        <StarParticles count={20} />

        <div className="text-center relative z-10">
          {/* Rocket animation */}
          <div className="animate-rocket-fly fixed left-1/2 -translate-x-1/2 bottom-0 z-20 pointer-events-none">
            <Image src="/assets/rocket.png" alt="" width={60} height={60} />
          </div>

          <div className="animate-pop-in">
            <Mogura expression="excited" size={130} />
          </div>

          <p className="text-xl font-bold text-stardust mt-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            すごいね! がんばったね!
          </p>

          {/* Star rating */}
          <div className="flex items-center justify-center gap-1 mt-4 animate-fade-in-up" role="img" aria-label={`星${session.totalTrials > 0 ? (session.totalCorrect / session.totalTrials >= 0.8 ? 3 : session.totalCorrect / session.totalTrials >= 0.5 ? 2 : 1) : 1}つ`} style={{ animationDelay: '400ms' }}>
            {[1, 2, 3].map((star) => {
              const accuracy = session.totalTrials > 0 ? session.totalCorrect / session.totalTrials : 0;
              const filled = star <= (accuracy >= 0.8 ? 3 : accuracy >= 0.5 ? 2 : 1);
              return (
                <svg key={star} width="36" height="36" viewBox="0 0 24 24" fill={filled ? '#FFD43B' : 'rgba(255,255,255,0.15)'} aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              );
            })}
          </div>

          <p className="text-base text-moon mt-2 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            {session.totalTrials}かい チャレンジしたよ!
          </p>

          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <CosmicButton
              variant="secondary"
              size="lg"
              onClick={() => router.push('/')}
              ariaLabel="ホームにもどる"
              className="px-14"
            >
              もどる
            </CosmicButton>
          </div>
        </div>
      </div>
    );
  }

  // Break screen
  if (session.isBreakActive) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center px-5 z-30"
        style={safeAreaStyle}
      >
        <div className="text-center animate-fade-in-up">
          <Mogura expression="sleepy" size={120} />

          <h2 className="text-2xl font-bold text-stardust mt-4 mb-2">
            ひとやすみ
          </h2>
          <p className="text-base text-moon mb-8">
            すこし やすんでから つづけよう
          </p>
          <div className="flex flex-col items-center gap-3 w-full">
            <CosmicButton
              variant="primary"
              size="md"
              onClick={session.endBreak}
              ariaLabel="ゲームをつづける"
              className="w-full"
            >
              つづける
            </CosmicButton>
            <CosmicButton
              variant="ghost"
              size="md"
              onClick={() => session.endSession('user_quit')}
              ariaLabel="ゲームをおわる"
              className="w-full"
            >
              おわる
            </CosmicButton>
          </div>
        </div>
      </div>
    );
  }

  // Progress calculation
  const progress = maxTrials ? Math.min(session.trialNumber / maxTrials, 1) : 0;

  // Active game
  return (
    <div className="fixed inset-0 flex flex-col z-30" style={safeAreaStyle}>
      <StarParticles count={20} />

      {/* Header: hidden when mixed session provides its own controls */}
      {!sessionCtx && (
        <header className="flex items-center gap-3 h-10 px-3 relative z-10 flex-shrink-0">
          {/* Mogura face */}
          <div className="flex-shrink-0">
            <Mogura expression="encouraging" size={28} />
          </div>

          {/* Combo counter */}
          <ComboCounter />

          {/* Progress bar */}
          <CosmicProgressBar progress={progress} className="flex-1 mx-1" />

          {/* Pause/settings button */}
          <button
            onClick={handleQuitRequest}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg tap-interactive"
            aria-label="ゲームをやめる"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8B8D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </header>
      )}

      {/* Game content — full viewport width, fills remaining height */}
      <main className={`flex-1 flex flex-col px-2 relative z-10 overflow-y-auto ${sessionCtx ? 'pt-10' : ''}`}>
        {children}
      </main>

      {/* Quit confirmation dialog */}
      {showQuitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          role="dialog"
          aria-modal="true"
          aria-label="やめる確認"
        >
          <div
            className="w-full max-w-[300px] rounded-3xl p-6 text-center animate-pop-in"
            style={{ background: '#1A1A40' }}
          >
            <Mogura expression="sleepy" size={64} />
            <p className="text-base font-bold text-stardust mt-3 mb-1">
              やめちゃうの?
            </p>
            <p className="text-xs text-moon mb-5">
              つづけると もっと たのしいよ!
            </p>
            <div className="flex flex-col gap-2">
              <CosmicButton
                variant="primary"
                size="md"
                onClick={handleQuitCancel}
                ariaLabel="ゲームをつづける"
                className="w-full"
              >
                つづける
              </CosmicButton>
              <CosmicButton
                variant="ghost"
                size="md"
                onClick={handleQuitConfirm}
                ariaLabel="ゲームをやめる"
                className="w-full"
              >
                やめる
              </CosmicButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
