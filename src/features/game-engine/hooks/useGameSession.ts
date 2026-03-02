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
import type { DDAProfile } from '@/features/dda/disability-profile';
import { FrustrationDetector } from '@/features/safety/FrustrationDetector';
import { EventLogger } from '@/features/logging/EventLogger';
import { nowMs } from '@/lib/utils';
import {
  createGameSession,
  saveTrialBatch,
  endGameSession as endGameSessionDb,
  saveEvents,
  updateDailyMetrics,
} from '@/lib/supabase/game-persistence';
import type { BiometricInput } from '@/features/camera/types';
import { useSessionContext } from '@/features/session/SessionContext';
import { useChildProfile } from '@/hooks/useChildProfile';
import { getITI } from '@/features/dda/iti-config';


export interface UseGameSessionOptions {
  gameConfig: GameConfig;
  ageGroup: AgeGroup;
  childId?: string; // anon_child_id for DB persistence
  onEventFlush?: (events: unknown[]) => Promise<void>;
  biometricFeed?: BiometricInput | null;
  disabilityProfile?: DDAProfile;
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
  applyWarmupAdjustment: (adjustment: number) => void;
  /** 障害種別に基づくITI (ms) を返す */
  getITIMs: () => number;
}

interface TrialRecord {
  session_id: string;
  trial_number: number;
  target_domain: string;
  difficulty: DifficultyParams;
  stimulus: Record<string, unknown>;
  correct_answer: Record<string, unknown>;
  response?: Record<string, unknown>;
  is_correct?: boolean;
  reaction_time_ms?: number;
  error_type?: string | null;
  hints_used: number;
  started_at: string;
  ended_at?: string;
}

const TRIAL_BATCH_SIZE = 5;

export function useGameSession({
  gameConfig,
  ageGroup,
  childId,
  onEventFlush,
  biometricFeed,
  disabilityProfile,
}: UseGameSessionOptions): GameSessionControls {
  const sessionCtx = useSessionContext();
  // Resolve profile: explicit prop > context > undefined
  const resolvedProfile = disabilityProfile ?? sessionCtx?.disabilityProfile;

  // Auto-resolve childId from profile if not explicitly provided
  const { child } = useChildProfile();
  const resolvedChildId = childId ?? child?.anonChildId;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentTrial, setCurrentTrial] = useState<TrialState | null>(null);
  const [trialNumber, setTrialNumber] = useState(0);
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [isSessionEnded, setIsSessionEnded] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyParams>({});
  const [totalTrials, setTotalTrials] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  // Keep refs in sync with state so endSession always reads latest values (avoids stale closure)
  const totalTrialsRef = useRef(0);
  const totalCorrectRef = useRef(0);
  const difficultyRef = useRef<DifficultyParams>({});
  // Track whether endSession has been called (to avoid double-ending on unmount)
  const sessionEndedRef = useRef(false);
  // Stable refs for values needed in unmount cleanup (closure captures initial values otherwise)
  const resolvedChildIdRef = useRef<string | undefined>(undefined);
  const gameConfigRef = useRef(gameConfig);

  const trialEngineRef = useRef<TrialEngine>(new TrialEngine());
  const ddaEngineRef = useRef<DDAEngine>(new DDAEngine(gameConfig.dda, resolvedProfile));
  const frustrationRef = useRef<FrustrationDetector>(new FrustrationDetector());
  const loggerRef = useRef<EventLogger>(new EventLogger({
    bufferSize: 20,
    onFlush: onEventFlush ?? (async () => {}),
  }));

  // DB session ID (may differ from local UUID if DB is used)
  const dbSessionIdRef = useRef<string | null>(null);
  // Promise for DB session creation (to await in endSession)
  const dbSessionPromiseRef = useRef<Promise<string | null> | null>(null);
  // Track if DB session creation was attempted
  const dbSessionCreatedRef = useRef(false);
  // Trial buffer for batch inserts (buffered regardless of DB session readiness)
  const trialBufferRef = useRef<Omit<TrialRecord, 'session_id'>[]>([]);
  // Session start time for duration calculation
  const sessionStartRef = useRef<number>(0);

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

  // Keep stable refs up to date
  resolvedChildIdRef.current = resolvedChildId;
  gameConfigRef.current = gameConfig;

  // Pass biometric data to DDA when it changes
  useEffect(() => {
    if (biometricFeed && ddaEngineRef.current.recordBiometricInput) {
      ddaEngineRef.current.recordBiometricInput(biometricFeed);
    }
  }, [biometricFeed]);

  // Apply warmup adjustment from session context
  const warmupAdjAppliedRef = useRef(false);
  useEffect(() => {
    const adj = sessionCtx?.warmupAdjustment;
    if (adj !== undefined && adj < 0 && !warmupAdjAppliedRef.current) {
      warmupAdjAppliedRef.current = true;
      ddaEngineRef.current.adjustStartLevel(adj);
      const warmupDiff = ddaEngineRef.current.getCurrentParams();
      setDifficulty(warmupDiff);
      difficultyRef.current = warmupDiff;
    }
  }, [sessionCtx?.warmupAdjustment]);

  // Lazy DB session creation: if session is active but DB session wasn't created
  // (because resolvedChildId wasn't available yet), create it now
  useEffect(() => {
    if (
      sessionId &&
      resolvedChildId &&
      !dbSessionIdRef.current &&
      !dbSessionCreatedRef.current &&
      !isSessionEnded
    ) {
      dbSessionCreatedRef.current = true;
      const promise = createGameSession(resolvedChildId, gameConfig.id, difficulty);
      dbSessionPromiseRef.current = promise;
      promise.then((id) => {
        if (id) {
          console.log('[GameSession] DB session created (lazy):', id);
          dbSessionIdRef.current = id;
          // Flush any trials buffered before DB session was ready
          if (trialBufferRef.current.length > 0) {
            const batch = trialBufferRef.current.map(t => ({ ...t, session_id: id }));
            trialBufferRef.current = [];
            saveTrialBatch(batch);
          }
        }
      });
    }
  }, [sessionId, resolvedChildId, isSessionEnded, gameConfig.id, difficulty]);

  const flushTrialBuffer = useCallback(async () => {
    if (trialBufferRef.current.length === 0) return;
    const dbId = dbSessionIdRef.current;
    if (!dbId) return; // Can't flush without session_id; will be flushed when available
    const batch = trialBufferRef.current.map(t => ({ ...t, session_id: dbId }));
    trialBufferRef.current = [];
    await saveTrialBatch(batch);
  }, []);

  // On unmount: flush trial buffer and close any open DB session (important for mixed session)
  useEffect(() => {
    return () => {
      const dbId = dbSessionIdRef.current;
      const hasTrials = trialBufferRef.current.length > 0;
      const sessionNotEnded = !sessionEndedRef.current && dbId;

      if (!dbId && !hasTrials) return;

      const currentTrials = totalTrialsRef.current;
      const currentCorrect = totalCorrectRef.current;
      const currentDifficulty = difficultyRef.current;
      const durationMs = nowMs() - sessionStartRef.current;

      // Fire-and-forget on unmount
      (async () => {
        if (dbId && hasTrials) {
          console.log('[GameSession] Unmount flush:', trialBufferRef.current.length, 'trials to session:', dbId);
          const batch = trialBufferRef.current.map(t => ({ ...t, session_id: dbId }));
          trialBufferRef.current = [];
          await saveTrialBatch(batch);
        }
        // Close the DB session if endSession was never called (e.g. mixed session game switch)
        if (sessionNotEnded) {
          console.log('[GameSession] Unmount: closing open DB session:', dbId);
          sessionEndedRef.current = true;
          const summary = {
            trial_count: currentTrials,
            correct_count: currentCorrect,
            accuracy: currentTrials > 0 ? currentCorrect / currentTrials : 0,
            hints_used: 0,
            breaks_taken: 0,
            duration_ms: durationMs,
          };
          await endGameSessionDb(dbId, 'completed', currentDifficulty, summary);

          // Update daily metrics
          const childId = resolvedChildIdRef.current;
          if (childId && currentTrials > 0) {
            await updateDailyMetrics(
              childId,
              gameConfigRef.current.primary_domain,
              'accuracy',
              currentTrials > 0 ? currentCorrect / currentTrials : 0,
              1,
              currentTrials,
            );
          }
        }
      })();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = useCallback(() => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setIsSessionEnded(false);
    setIsBreakActive(false);
    setTotalTrials(0);
    setTotalCorrect(0);
    setTrialNumber(0);
    totalTrialsRef.current = 0;
    totalCorrectRef.current = 0;
    sessionEndedRef.current = false;
    sessionStartRef.current = nowMs();

    trialEngineRef.current.reset();
    ddaEngineRef.current.reset();
    frustrationRef.current.reset();

    // Apply age-based adjustments to initial difficulty
    const initialDiff = ddaEngineRef.current.getCurrentParams();
    const ageAdjustments = gameConfig.age_adjustments[ageGroup] ?? {};
    const adjustedDiff = { ...initialDiff, ...ageAdjustments } as DifficultyParams;
    setDifficulty(adjustedDiff);
    difficultyRef.current = adjustedDiff;

    loggerRef.current.setSessionId(newSessionId);
    frustrationRef.current.startSession(nowMs());
    loggerRef.current.log('session_start', {
      game_id: gameConfig.id,
      age_group: ageGroup,
      initial_difficulty: adjustedDiff,
    });

    // Create DB session if childId available
    dbSessionCreatedRef.current = false;
    dbSessionIdRef.current = null;
    dbSessionPromiseRef.current = null;
    if (resolvedChildId) {
      dbSessionCreatedRef.current = true;
      const promise = createGameSession(resolvedChildId, gameConfig.id, adjustedDiff);
      dbSessionPromiseRef.current = promise;
      promise.then((id) => {
        if (id) {
          console.log('[GameSession] DB session created:', id);
          dbSessionIdRef.current = id;
          // Flush any trials buffered before DB session was ready
          if (trialBufferRef.current.length > 0) {
            const batch = trialBufferRef.current.map(t => ({ ...t, session_id: id }));
            trialBufferRef.current = [];
            saveTrialBatch(batch);
          }
        }
      });
    }
  }, [gameConfig, ageGroup, resolvedChildId]);

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
    return null;
  }, []);

  const completeTrial = useCallback((isCorrect: boolean, errorType: ErrorType = null): AdaptiveChange | null => {
    const completed = trialEngineRef.current.completeTrial(isCorrect, errorType);
    setCurrentTrial(null);
    setTotalTrials(prev => prev + 1);
    totalTrialsRef.current += 1;
    if (isCorrect) {
      setTotalCorrect(prev => prev + 1);
      totalCorrectRef.current += 1;
    }

    // Report to session manager if present
    sessionCtx?.onTrialComplete(isCorrect, completed.reactionTimeMs ?? 0);

    loggerRef.current.log('trial_end', {
      is_correct: isCorrect,
      error_type: errorType,
      reaction_time_ms: completed.reactionTimeMs,
      hints_used: completed.hintsUsed,
    }, completed.trialId);

    // Always buffer trial for DB persistence (session_id assigned at flush time)
    trialBufferRef.current.push({
      trial_number: completed.trialNumber,
      target_domain: gameConfig.primary_domain,
      difficulty: completed.difficulty,
      stimulus: completed.stimulus,
      correct_answer: completed.correctAnswer,
      response: completed.response as unknown as Record<string, unknown> | undefined,
      is_correct: isCorrect,
      reaction_time_ms: completed.reactionTimeMs ?? undefined,
      error_type: errorType,
      hints_used: completed.hintsUsed,
      started_at: new Date(completed.startedAt).toISOString(),
      ended_at: new Date().toISOString(),
    });

    // Flush when buffer reaches batch size and DB session is ready
    if (trialBufferRef.current.length >= TRIAL_BATCH_SIZE && dbSessionIdRef.current) {
      flushTrialBuffer();
    }

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
          const forceDiff = ddaEngineRef.current.getCurrentParams();
          setDifficulty(forceDiff);
          difficultyRef.current = forceDiff;
          loggerRef.current.log('adaptive_change', forceChange as unknown as Record<string, unknown>);
          return forceChange;
        }
      }
    }

    // DDA adjustment
    const adaptiveChange = ddaEngineRef.current.recordTrialResult(isCorrect);
    if (adaptiveChange) {
      const adaptDiff = ddaEngineRef.current.getCurrentParams();
      setDifficulty(adaptDiff);
      difficultyRef.current = adaptDiff;
      loggerRef.current.log('adaptive_change', adaptiveChange as unknown as Record<string, unknown>);
      return adaptiveChange;
    }

    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameConfig.primary_domain, flushTrialBuffer]);

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

  const applyWarmupAdjustment = useCallback((adjustment: number) => {
    ddaEngineRef.current.adjustStartLevel(adjustment);
    const newDiff = ddaEngineRef.current.getCurrentParams();
    setDifficulty(newDiff);
    difficultyRef.current = newDiff;
  }, []);

  const getITIMs = useCallback((): number => {
    return getITI(resolvedProfile?.disabilityType);
  }, [resolvedProfile?.disabilityType]);

  const endSession = useCallback((reason: SessionEndReason) => {
    // Guard against double-calling endSession
    if (sessionEndedRef.current) {
      console.log('[GameSession] endSession already called, skipping duplicate call');
      return;
    }
    sessionEndedRef.current = true;

    // Use refs to avoid stale closure issues with React state
    const currentTrials = totalTrialsRef.current;
    const currentCorrect = totalCorrectRef.current;
    const currentDifficulty = difficultyRef.current;

    setIsSessionEnded(true);
    loggerRef.current.log('session_end', {
      reason,
      total_trials: currentTrials,
      total_correct: currentCorrect,
      final_difficulty: currentDifficulty,
    });
    loggerRef.current.flush();

    const durationMs = nowMs() - sessionStartRef.current;
    const summary = {
      trial_count: currentTrials,
      correct_count: currentCorrect,
      accuracy: currentTrials > 0 ? currentCorrect / currentTrials : 0,
      hints_used: 0,
      breaks_taken: 0,
      duration_ms: durationMs,
    };

    console.log('[GameSession] endSession called:', { reason, summary, dbSessionId: dbSessionIdRef.current });

    // Flush remaining trials and end DB session
    // Await the DB session promise if it hasn't resolved yet
    (async () => {
      let dbId = dbSessionIdRef.current;
      if (!dbId && dbSessionPromiseRef.current) {
        console.log('[GameSession] Waiting for DB session promise...');
        dbId = await dbSessionPromiseRef.current;
      }
      if (dbId) {
        // Flush any remaining buffered trials
        if (trialBufferRef.current.length > 0) {
          console.log('[GameSession] Flushing', trialBufferRef.current.length, 'buffered trials to DB session:', dbId);
          const batch = trialBufferRef.current.map(t => ({ ...t, session_id: dbId! }));
          trialBufferRef.current = [];
          await saveTrialBatch(batch);
        }
        console.log('[GameSession] Ending DB session:', dbId, summary);
        await endGameSessionDb(dbId, reason, currentDifficulty, summary);

        // Update daily metrics if we have accuracy data
        if (resolvedChildId && currentTrials > 0) {
          const accuracy = currentCorrect / currentTrials;
          console.log('[GameSession] Updating daily metrics:', { domain: gameConfig.primary_domain, accuracy, currentTrials });
          await updateDailyMetrics(
            resolvedChildId,
            gameConfig.primary_domain,
            'accuracy',
            accuracy,
            1,
            currentTrials,
          );
        }
      } else {
        console.warn('[GameSession] No DB session ID available — records NOT saved to Supabase. resolvedChildId was:', resolvedChildId);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedChildId, gameConfig.primary_domain]);

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
    applyWarmupAdjustment,
    getITIMs,
  };
}
