'use client';

import React, { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AgeGroup, GameId } from '@/types';
import { useStageSession } from '@/features/stage-system/useStageSession';
import { VisualSchedule } from '@/components/stage/VisualSchedule';
import { StageBreak } from '@/components/stage/StageBreak';
import { StageCelebration } from '@/components/stage/StageCelebration';
import { GAME_CONFIGS } from '@/games';
import { PlayIcon } from '@/components/icons';

// Dynamic imports for all game components
import dynamic from 'next/dynamic';

const GAME_COMPONENTS: Record<string, React.ComponentType<{ ageGroup: AgeGroup; stageMode?: boolean; maxTrials?: number; onStageComplete?: (accuracy: number) => void }>> = {
  'hikari-catch': dynamic(() => import('@/games/hikari-catch/HikariCatch')),
  'matte-stop': dynamic(() => import('@/games/matte-stop/MatteStop')),
  'oboete-narabete': dynamic(() => import('@/games/oboete-narabete/OboeteNarabete')),
  'katachi-sagashi': dynamic(() => import('@/games/katachi-sagashi/KatachiSagashi')),
  'irokae-switch': dynamic(() => import('@/games/irokae-switch/IrokaeSwitch')),
  'hayawaza-touch': dynamic(() => import('@/games/hayawaza-touch/HayawazaTouch')),
  'oboete-match': dynamic(() => import('@/games/oboete-match/OboeteMatch')),
  'tsumitage-tower': dynamic(() => import('@/games/tsumitage-tower/TsumitageTower')),
  'pattern-puzzle': dynamic(() => import('@/games/pattern-puzzle/PatternPuzzle')),
  'meiro-tanken': dynamic(() => import('@/games/meiro-tanken/MeiroTanken')),
  'kakurenbo-katachi': dynamic(() => import('@/games/kakurenbo-katachi/KakurenboKatachi')),
  'kotoba-catch': dynamic(() => import('@/games/kotoba-catch/KotobaCatch')),
  'kimochi-yomitori': dynamic(() => import('@/games/kimochi-yomitori/KimochiYomitori')),
  'kimochi-stop': dynamic(() => import('@/games/kimochi-stop/KimochiStop')),
  'touch-de-go': dynamic(() => import('@/games/touch-de-go/TouchDeGo')),
};

export default function StagePage() {
  const params = useParams();
  const router = useRouter();
  const stageNumber = parseInt(params.stageId as string, 10) || 1;

  // TODO: Get from child profile after auth implementation
  const ageGroup: AgeGroup = '6-9';

  const stage = useStageSession({ ageGroup, stageNumber });

  // Start stage on mount if not started
  React.useEffect(() => {
    if (!stage.stageState) {
      stage.startStage(stageNumber);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageNumber]);

  const handleGameComplete = useCallback((accuracy: number) => {
    stage.completeCurrentGame(accuracy);
  }, [stage]);

  const handleBreakContinue = useCallback(() => {
    stage.endBreak();
  }, [stage]);

  const handleCelebrationComplete = useCallback(() => {
    stage.endStage();
    router.push('/select');
  }, [stage, router]);

  // Not initialized yet
  if (!stage.stageState) {
    return (
      <div data-theme="duo" className="flex min-h-screen items-center justify-center"
           style={{ background: 'var(--color-bg)' }}>
        <div className="animate-gentle-pulse">
          <PlayIcon size={40} style={{ color: 'var(--duo-node-active, var(--color-primary))' }} />
        </div>
      </div>
    );
  }

  // Break between games
  if (stage.isBreakActive && stage.stageState) {
    const prevGame = stage.stageState.games[stage.stageState.currentGameIndex - 1] ?? stage.stageState.games[0];
    const nextGame = stage.currentGame;

    return (
      <div data-theme="duo">
        <StageBreak
          completedGame={prevGame}
          nextGame={nextGame}
          onContinue={handleBreakContinue}
        />
      </div>
    );
  }

  // Celebration
  if (stage.isCelebrating && stage.stageState) {
    return (
      <div data-theme="duo">
        <StageCelebration
          games={stage.stageState.games}
          stageNumber={stage.stageState.stageNumber}
          onComplete={handleCelebrationComplete}
        />
      </div>
    );
  }

  // Completed
  if (stage.isCompleted) {
    router.push('/select');
    return null;
  }

  // Playing current game
  if (stage.isStageActive && stage.currentGame) {
    const gameId = stage.currentGame.gameId;
    const GameComponent = GAME_COMPONENTS[gameId];

    if (!GameComponent) {
      return (
        <div data-theme="duo" className="flex min-h-screen flex-col items-center justify-center p-8"
             style={{ background: 'var(--color-bg)' }}>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            ゲームを読み込み中...
          </p>
        </div>
      );
    }

    return (
      <div data-theme="duo" className="flex min-h-screen flex-col" style={{ background: 'var(--color-bg)' }}>
        {/* Stage visual schedule bar */}
        <div style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border-light, rgba(255,255,255,0.1))',
        }}>
          <VisualSchedule
            games={stage.stageState.games}
            currentGameIndex={stage.stageState.currentGameIndex}
          />
        </div>

        {/* Current game */}
        <div className="flex-1">
          <GameComponent
            ageGroup={ageGroup}
            stageMode={true}
            maxTrials={stage.currentGame.trialCount}
            onStageComplete={handleGameComplete}
          />
        </div>
      </div>
    );
  }

  return null;
}
