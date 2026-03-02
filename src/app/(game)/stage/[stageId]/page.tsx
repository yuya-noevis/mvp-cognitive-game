'use client';

import React, { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AgeGroup } from '@/types';
import { useStageSession } from '@/features/stage-system/useStageSession';
import { VisualSchedule } from '@/components/stage/VisualSchedule';
import { StageBreak } from '@/components/stage/StageBreak';
import { StageCelebration } from '@/components/stage/StageCelebration';
import { PlayIcon } from '@/components/icons';
import { useChildProfile } from '@/hooks/useChildProfile';

import { GAME_COMPONENTS } from '@/games/game-components';

export default function StagePage() {
  const params = useParams();
  const router = useRouter();
  const stageNumber = parseInt(params.stageId as string, 10) || 1;
  const { child, loading: childLoading } = useChildProfile();

  const ageGroup: AgeGroup = child?.ageGroup ?? '6-9';

  const stage = useStageSession({ ageGroup, stageNumber });

  // Start stage on mount if not started
  React.useEffect(() => {
    if (!stage.stageState && !childLoading) {
      stage.startStage(stageNumber);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageNumber, childLoading]);

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

  if (childLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-space">
        <div className="animate-gentle-pulse" style={{ color: '#B8B8D0' }}>読み込み中...</div>
      </div>
    );
  }

  // Not initialized yet
  if (!stage.stageState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-space">
        <div className="animate-gentle-pulse">
          <PlayIcon size={40} style={{ color: '#6C3CE1' }} />
        </div>
      </div>
    );
  }

  // Break between games
  if (stage.isBreakActive && stage.stageState) {
    const prevGame = stage.stageState.games[stage.stageState.currentGameIndex - 1] ?? stage.stageState.games[0];
    const nextGame = stage.currentGame;

    return (
      <StageBreak
        completedGame={prevGame}
        nextGame={nextGame}
        onContinue={handleBreakContinue}
      />
    );
  }

  // Celebration
  if (stage.isCelebrating && stage.stageState) {
    return (
      <StageCelebration
        games={stage.stageState.games}
        stageNumber={stage.stageState.stageNumber}
        onComplete={handleCelebrationComplete}
      />
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
        <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-space">
          <p className="text-lg" style={{ color: '#8888AA' }}>
            ゲームを読み込み中...
          </p>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col bg-space">
        {/* Stage visual schedule bar */}
        <div style={{
          background: 'rgba(42, 42, 90, 0.6)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
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
