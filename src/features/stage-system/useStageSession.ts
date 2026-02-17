'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AgeGroup, GameId, CognitiveDomain } from '@/types';
import type { StageState, StageGameState, StageStatus } from './types';
import { MasteryTracker } from './MasteryTracker';
import { StageScheduleGenerator } from './StageScheduleGenerator';
import { nowMs } from '@/lib/utils';

export interface UseStageSessionOptions {
  ageGroup: AgeGroup;
  stageNumber?: number;
}

export interface StageSessionControls {
  // State
  stageState: StageState | null;
  currentGame: StageGameState | null;
  isStageActive: boolean;
  isBreakActive: boolean;
  isCelebrating: boolean;
  isCompleted: boolean;
  progress: number; // 0-1 overall progress

  // Actions
  startStage: (stageNumber?: number) => void;
  completeCurrentGame: (accuracy: number) => void;
  startBreak: () => void;
  endBreak: () => void;
  skipToNextGame: () => void;
  endStage: () => void;

  // Mastery
  masteryTracker: MasteryTracker;
}

/**
 * useStageSession - ステージ管理フック
 *
 * 既存の useGameSession をラップし、ステージ全体のフローを制御：
 * - ステージ内のゲーム順序管理
 * - ゲーム間の休憩タイミング制御（TEACCH「終わり」の構造化）
 * - 1ステージ完了判定
 * - 習熟判定ロジック（80% × 2セッション）
 */
export function useStageSession({
  ageGroup,
  stageNumber: initialStageNumber = 1,
}: UseStageSessionOptions): StageSessionControls {
  const [stageState, setStageState] = useState<StageState | null>(null);
  const masteryTrackerRef = useRef<MasteryTracker>(new MasteryTracker());
  const schedulerRef = useRef<StageScheduleGenerator>(
    new StageScheduleGenerator(masteryTrackerRef.current),
  );

  const startStage = useCallback((stageNum?: number) => {
    const number = stageNum ?? initialStageNumber;
    const stageId = uuidv4();

    // ステージのゲーム構成を生成
    const games = schedulerRef.current.generateStageGames(ageGroup, number);

    const newState: StageState = {
      status: 'playing',
      stageId,
      stageNumber: number,
      ageGroup,
      games,
      currentGameIndex: 0,
      startedAt: nowMs(),
      totalElapsedMs: 0,
    };

    setStageState(newState);
  }, [ageGroup, initialStageNumber]);

  const completeCurrentGame = useCallback((accuracy: number) => {
    setStageState(prev => {
      if (!prev) return null;

      const games = [...prev.games];
      const currentGame = games[prev.currentGameIndex];
      if (!currentGame) return prev;

      // ゲーム完了記録
      games[prev.currentGameIndex] = {
        ...currentGame,
        isCompleted: true,
        accuracy,
      };

      // 習熟判定
      masteryTrackerRef.current.recordSessionResult(
        currentGame.domain,
        currentGame.gameId,
        accuracy,
        nowMs(),
      );

      const nextIndex = prev.currentGameIndex + 1;
      const isLastGame = nextIndex >= games.length;

      if (isLastGame) {
        // ステージ完了 → 祝福画面
        return {
          ...prev,
          games,
          status: 'celebration' as StageStatus,
        };
      }

      // 次のゲームの前に休憩
      return {
        ...prev,
        games,
        status: 'break' as StageStatus,
        currentGameIndex: nextIndex,
      };
    });
  }, []);

  const startBreak = useCallback(() => {
    setStageState(prev => prev ? { ...prev, status: 'break' } : null);
  }, []);

  const endBreak = useCallback(() => {
    setStageState(prev => prev ? { ...prev, status: 'playing' } : null);
  }, []);

  const skipToNextGame = useCallback(() => {
    setStageState(prev => {
      if (!prev) return null;

      const nextIndex = prev.currentGameIndex + 1;
      if (nextIndex >= prev.games.length) {
        return { ...prev, status: 'celebration' as StageStatus };
      }

      return {
        ...prev,
        currentGameIndex: nextIndex,
        status: 'playing' as StageStatus,
      };
    });
  }, []);

  const endStage = useCallback(() => {
    setStageState(prev => prev ? { ...prev, status: 'completed' } : null);
  }, []);

  // 経過時間の追跡
  useEffect(() => {
    if (!stageState || stageState.status === 'completed' || stageState.status === 'idle') {
      return;
    }

    const interval = setInterval(() => {
      setStageState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          totalElapsedMs: nowMs() - prev.startedAt,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stageState?.status]);

  // Derived state
  const currentGame = stageState?.games[stageState.currentGameIndex] ?? null;
  const isStageActive = stageState?.status === 'playing';
  const isBreakActive = stageState?.status === 'break';
  const isCelebrating = stageState?.status === 'celebration';
  const isCompleted = stageState?.status === 'completed';

  const progress = stageState
    ? stageState.games.filter(g => g.isCompleted).length / stageState.games.length
    : 0;

  return {
    stageState,
    currentGame,
    isStageActive,
    isBreakActive,
    isCelebrating,
    isCompleted,
    progress,
    startStage,
    completeCurrentGame,
    startBreak,
    endBreak,
    skipToNextGame,
    endStage,
    masteryTracker: masteryTrackerRef.current,
  };
}
