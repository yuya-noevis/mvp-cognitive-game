'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { GameSessionControls } from './hooks/useGameSession';
import Mogura from '@/components/mascot/Mogura';
import { CosmicProgressBar } from '@/components/ui/CosmicProgressBar';
import type { GameId } from '@/types';

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
  'kakurenbo-katachi': 'kankaku',
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
  const building = gameId ? GAME_BUILDING_MAP[gameId] || 'hikari' : 'hikari';
  const bgGradient = BUILDING_GRADIENTS[building];

  // Session not started yet — Pre-start screen
  if (!session.sessionId) {
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center px-5 relative overflow-hidden"
        style={{ background: bgGradient }}
      >
        <StarParticles count={25} />

        <div className="text-center animate-fade-in-up relative z-10">
          <div className="mb-4">
            <Mogura expression="encouraging" size={120} />
          </div>
          <p className="text-lg font-bold text-stardust mb-6">{gameName}で あそぼう!</p>
          <button
            onClick={session.startSession}
            className="btn-cosmic px-14 py-5 text-xl rounded-2xl tap-interactive active:translate-y-[2px] active:shadow-sm transition-all duration-150"
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
        <div className="flex min-h-dvh items-center justify-center" style={{ background: bgGradient }}>
          <div className="animate-gentle-pulse">
            <Mogura expression="happy" size={64} />
          </div>
        </div>
      );
    }

    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center px-5 relative overflow-hidden"
        style={{ background: bgGradient }}
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
          <div className="flex items-center justify-center gap-1 mt-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            {[1, 2, 3].map((star) => {
              const accuracy = session.totalTrials > 0 ? session.totalCorrect / session.totalTrials : 0;
              const filled = star <= (accuracy >= 0.8 ? 3 : accuracy >= 0.5 ? 2 : 1);
              return (
                <svg key={star} width="36" height="36" viewBox="0 0 24 24" fill={filled ? '#FFD43B' : 'rgba(255,255,255,0.15)'}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              );
            })}
          </div>

          <p className="text-base text-moon mt-2 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            {session.totalTrials}かい チャレンジしたよ!
          </p>

          <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <button
              onClick={() => router.push('/')}
              className="btn-comet px-14 py-5 text-lg rounded-2xl tap-interactive active:translate-y-[2px] active:shadow-sm transition-all duration-150"
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
      <div
        className="flex min-h-dvh flex-col items-center justify-center px-5"
        style={{ background: bgGradient }}
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
            <button
              onClick={session.endBreak}
              className="btn-cosmic w-full h-12 text-lg rounded-2xl tap-interactive active:translate-y-[2px] active:shadow-sm transition-all duration-150"
            >
              つづける
            </button>
            <button
              onClick={() => session.endSession('user_quit')}
              className="w-full h-12 text-base font-medium rounded-2xl tap-interactive bg-galaxy-light text-moon"
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

  // Active game
  return (
    <div className="flex min-h-dvh flex-col" style={{ background: bgGradient }}>
      <StarParticles count={20} />

      {/* Header: h-12 px-4 */}
      <header className="flex items-center gap-3 h-12 px-4 relative z-10">
        {/* Mogura face */}
        <div className="flex-shrink-0">
          <Mogura expression="encouraging" size={28} />
        </div>

        {/* Progress bar */}
        <CosmicProgressBar progress={progress} className="flex-1 mx-1" />

        {/* Pause/settings button */}
        <button
          onClick={() => session.endSession('user_quit')}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg tap-interactive"
          aria-label="一時停止"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B8B8D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </header>

      {/* Game content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        {children}
      </main>
    </div>
  );
}
