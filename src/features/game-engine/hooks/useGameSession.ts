'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  GameConfig,
  DifficultyParams,
  TrialResponse,
  ErrorType,
  AdaptiveChange,
  SafetyAction,
  SessionEndReason,
  AgeGroup,
} from '@/types';
import type { TrialState } from '../types';
import { TrialEngine } from '../TrialEngine';
import { DDAEngine } from '@/features/dda/DDAEngine';
import { FrustrationDetector } from '@/features/safety/FrustrationDetector';
import { EventLogger } from '@/features/logging/EventLogger';
import { nowMs } from '@/lib/utils';

export interface UseGameSessionOptions {
  gameConfig: GameConfig;
  ageGroup: AgeGroup;
  onEventFlush?: (events: unknown[]) => Promise<void>;
}

export interface GameSessionControls {
  // State
  sessionId: string | null;
  currentTrial: TrialState | null;
  trialNumber: number;
  isBreakActive: boolean;
  isSessionEnded: boolean;
  difficulty: DifficultyParams;
  totalTrials: number;
  totalCorrect: number;

  // Actions
  startSession: () => void;
  startTrial: (stimulus: Record<string, unknown>, correctAnswer: Record<string, unknown>) => TrialState;
  presentStimulus: () => void;
  recordResponse: (response: TrialResponse) => SafetyAction | null;
  completeTrial: (isCorrect: boolean, errorType?: ErrorType) => AdaptiveChange | null;
  useHint: () => void;
  startBreak: () => void;
  endBreak: () => void;
  endSession: (reason: SessionEndReason) => void;
}

export function useGameSession({
  gameConfig,
  ageGroup,
  onEventFlush,
}: UseGameSessionOptions): GameSessionControls {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentTrial, setCurrentTrial] = useState<TrialState | null>(null);
  const [trialNumber, setTrialNumber] = useState(0);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyParams>({});
  const [totalTrials, setTotalTrials] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const trialEngineRef = useRef<TrialEngine>(new TrialEngine());
  const ddaEngineRef = useRef<DDAEngine>(new DDAEngine(gameConfig.dda));
  const frustrationRef = useRef<FrustrationDetector>(new FrustrationDetector());
  const loggerRef = useRef<EventLogger>(new EventLogger({
    bufferSize: 20,
    onFlush: onEventFlush ?? (async () => {}),
  }));

  // Inactivity check interval
  useEffect(() => {
    if (!sessionId || isBreakActive || isSessionEnded) return;

    const interval = setInterval(() => {
      const action = frustrationRef.current.checkInactivity(nowMs());
      if (action) {
        setIsBreakActive(true);
        loggerRef.current.log('break_suggested', { reason: action.reason });
      }

      const durationAction = frustrationRef.current.checkSessionDuration(nowMs());
      if (durationAction) {
        endSession('completed');
      }
    }, 1000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isBreakActive, isSessionEnded]);

  const startSession = useCallback(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setIsSessionEnded(false);
    setIsBreakActive(false);
    setTotalTrials(0);
    setTotalCorrect(0);
    setTrialNumber(0);

    trialEngineRef.current.reset();
    ddaEngineRef.current.reset();
    frustrationRef.current.reset();

    // Apply age-based adjustments to initial difficulty (age_adjustments is Partial; omit undefined)
    const initialDiff = ddaEngineRef.current.getCurrentParams();
    const ageAdjustments = gameConfig.age_adjustments[ageGroup] ?? {};
    const adjustedDiff = { ...initialDiff, ...ageAdjustments } as DifficultyParams;
    setDifficulty(adjustedDiff);

    loggerRef.current.setSessionId(newSessionId);
    frustrationRef.current.startSession(nowMs());
    loggerRef.current.log('session_start', {
      game_id: gameConfig.id,
      age_group: ageGroup,
      initial_difficulty: adjustedDiff,
    });
  }, [gameConfig, ageGroup]);

  const startTrial = useCallback((
    stimulus: Record<string, unknown>,
    correctAnswer: Record<string, unknown>,
  ): TrialState => {
    const trial = trialEngineRef.current.startTrial(stimulus, correctAnswer, difficulty);
    setCurrentTrial({ ...trial });
    setTrialNumber(trial.trialNumber);

    loggerRef.current.log('trial_start', {
      trial_number: trial.trialNumber,
      difficulty,
    }, trial.trialId);

    return trial;
  }, [difficulty]);

  const presentStimulus = useCallback(() => {
    trialEngineRef.current.presentStimulus();
    const trial = trialEngineRef.current.getCurrentTrial();
    if (trial) {
      setCurrentTrial({ ...trial });
      loggerRef.current.log('stimulus_presented', {
        stimulus: trial.stimulus,
      }, trial.trialId);
    }
  }, []);

  const recordResponse = useCallback((response: TrialResponse): SafetyAction | null => {
    trialEngineRef.current.recordResponse(response);
    const trial = trialEngineRef.current.getCurrentTrial();
    if (trial) {
      setCurrentTrial({ ...trial });
      loggerRef.current.log('response', {
        response_type: response.type,
        reaction_time_ms: trial.reactionTimeMs,
      }, trial.trialId);
    }
    return null; // Safety check happens in completeTrial
  }, []);

  const completeTrial = useCallback((isCorrect: boolean, errorType: ErrorType = null): AdaptiveChange | null => {
    const completed = trialEngineRef.current.completeTrial(isCorrect, errorType);
    setCurrentTrial(null);
    setTotalTrials(prev => prev + 1);
    if (isCorrect) setTotalCorrect(prev => prev + 1);

    loggerRef.current.log('trial_end', {
      is_correct: isCorrect,
      error_type: errorType,
      reaction_time_ms: completed.reactionTimeMs,
      hints_used: completed.hintsUsed,
    }, completed.trialId);

    // Safety check
    const safetyAction = frustrationRef.current.recordResult(
      isCorrect,
      completed.reactionTimeMs ?? 0,
      nowMs(),
    );

    if (safetyAction) {
      loggerRef.current.log('frustration_detected', {
        action: safetyAction.type,
        reason: safetyAction.reason,
      });

      if (safetyAction.type === 'suggest_break') {
        setIsBreakActive(true);
        loggerRef.current.log('break_suggested', { reason: safetyAction.reason });
      }

      if (safetyAction.type === 'show_hint' || safetyAction.type === 'reduce_difficulty') {
        const forceChange = ddaEngineRef.current.forceReduceDifficulty();
        if (forceChange) {
          setDifficulty(ddaEngineRef.current.getCurrentParams());
          loggerRef.current.log('adaptive_change', forceChange as unknown as Record<string, unknown>);
          return forceChange;
        }
      }
    }

    // DDA adjustment
    const adaptiveChange = ddaEngineRef.current.recordTrialResult(isCorrect);
    if (adaptiveChange) {
      setDifficulty(ddaEngineRef.current.getCurrentParams());
      loggerRef.current.log('adaptive_change', adaptiveChange as unknown as Record<string, unknown>);
      return adaptiveChange;
    }

    return null;
  }, []);

  const useHint = useCallback(() => {
    trialEngineRef.current.useHint();
    const trial = trialEngineRef.current.getCurrentTrial();
    if (trial) {
      setCurrentTrial({ ...trial });
      loggerRef.current.log('hint_used', {
        hints_total: trial.hintsUsed,
      }, trial.trialId);
    }
  }, []);

  const startBreak = useCallback(() => {
    setIsBreakActive(true);
    loggerRef.current.log('break_started', {});
  }, []);

  const endBreak = useCallback(() => {
    setIsBreakActive(false);
    loggerRef.current.log('break_ended', {});
  }, []);

  const endSession = useCallback((reason: SessionEndReason) => {
    setIsSessionEnded(true);
    loggerRef.current.log('session_end', {
      reason,
      total_trials: totalTrials,
      total_correct: totalCorrect,
      final_difficulty: difficulty,
    });
    loggerRef.current.flush();
  }, [totalTrials, totalCorrect, difficulty]);

  return {
    sessionId,
    currentTrial,
    trialNumber,
    isBreakActive,
    isSessionEnded,
    difficulty,
    totalTrials,
    totalCorrect,
    startSession,
    startTrial,
    presentStimulus,
    recordResponse,
    completeTrial,
    useHint,
    startBreak,
    endBreak,
    endSession,
  };
}
