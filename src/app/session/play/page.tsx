'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import type { GameId, AgeGroup } from '@/types';
import { INTEGRATED_GAME_MAP, resolveSourceGame } from '@/games/integrated';
import type { IntegratedGameId } from '@/games/integrated';
import { useChildProfile } from '@/hooks/useChildProfile';
import { useTier, checkGameAccess } from '@/features/gating';
import { useInstructionLevel, GameInstruction } from '@/features/instruction';
import { FeedbackContext } from '@/features/feedback/FeedbackContext';
import { useFeedback } from '@/features/feedback/use-feedback';
import { getFeedbackSettingsForLevel } from '@/features/feedback/feedback-config';
import { VisualFeedback } from '@/features/feedback/VisualFeedback';
import { dailyTracker } from '@/features/session/daily-tracker';
import { getDailyLimitConfig } from '@/features/session/session-config';
import { SessionProvider } from '@/features/session/SessionContext';
import type { SessionContextValue } from '@/features/session/SessionContext';
import { MixedSessionProgressBar } from '@/features/session/SessionProgressBar';
import { WarmupStartBanner } from '@/features/session/SessionProgressBar';
import { SessionComplete } from '@/features/session/SessionComplete';
import { GameTransition } from '@/features/session/GameTransition';
import { loadDisabilityType } from '@/features/dda/disability-profile-store';
import { DDA_PROFILES } from '@/features/dda/disability-profile';
import type { DDAProfile } from '@/features/dda/disability-profile';
import { getMixedSessionConfig } from '@/features/session/mixed-session';
import type { MixedSessionPlan, SessionGameSlot } from '@/features/session/mixed-session';
import { MixedSessionManager } from '@/features/session/mixed-session-manager';
import { selectGamesForSession, getRecentGames, saveRecentGames } from '@/features/session/session-engine';
import { saveMixedSessionRecord } from '@/features/session/mixed-session-record';

const SEEN_KEY_PREFIX = 'manas_instruction_seen_';

// Lazy load all game components
const GAME_COMPONENTS: Record<GameId, React.ComponentType<{ ageGroup: AgeGroup; maxTrials?: number }>> = {
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

type PagePhase = 'daily-limit' | 'instruction' | 'playing' | 'transition' | 'session-complete';

function resolveGameComponent(integratedId: IntegratedGameId, userTier: number) {
  const config = INTEGRATED_GAME_MAP[integratedId];
  if (!config) return null;
  const access = checkGameAccess(integratedId, userTier as 1 | 2 | 3);
  const rawUserLevel = 1;
  const userLevel = access ? Math.min(rawUserLevel, access.maxAccessibleLevel) : rawUserLevel;
  const sourceGameId = resolveSourceGame(integratedId, userLevel);
  return { sourceGameId, component: GAME_COMPONENTS[sourceGameId], config };
}

export default function MixedSessionPlayPage() {
  const router = useRouter();
  const { child, loading } = useChildProfile();
  const { tier, loading: tierLoading } = useTier();
  const { instructionLevel, loading: instrLoading } = useInstructionLevel();

  const [phase, setPhase] = useState<PagePhase>('playing');
  const [limitReason, setLimitReason] = useState('');

  // Mixed session state
  const managerRef = useRef<MixedSessionManager | null>(null);
  const [sessionPlan, setSessionPlan] = useState<MixedSessionPlan | null>(null);
  const [currentGameId, setCurrentGameId] = useState<IntegratedGameId | null>(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isWarmup, setIsWarmup] = useState(true);
  const [showStartBanner, setShowStartBanner] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  // Transition state
  const [transitionFrom, setTransitionFrom] = useState('');
  const [transitionTo, setTransitionTo] = useState('');

  // Instruction tracking for current game
  const [pendingInstruction, setPendingInstruction] = useState<IntegratedGameId | null>(null);

  // DDA
  const [ddaProfile, setDdaProfile] = useState<DDAProfile | undefined>(undefined);
  const [warmupAdjustment, setWarmupAdjustment] = useState<number | undefined>(undefined);

  // Feedback
  const feedbackSettings = useMemo(
    () => getFeedbackSettingsForLevel(instructionLevel),
    [instructionLevel],
  );
  const { triggerCorrect, triggerIncorrect, triggerNearMiss, clearEffect, currentEffect } =
    useFeedback(feedbackSettings);
  const feedbackCtx = useMemo(
    () => ({ triggerCorrect, triggerIncorrect, triggerNearMiss }),
    [triggerCorrect, triggerIncorrect, triggerNearMiss],
  );

  // Build session plan
  const buildSessionPlan = useCallback((): MixedSessionPlan | null => {
    const config = getMixedSessionConfig(tier);
    const recentGameIds = getRecentGames();
    const selectedGames = selectGamesForSession({
      tier,
      gameCount: config.gameCount,
      recentGameIds,
    });

    if (selectedGames.length === 0) return null;

    const games: SessionGameSlot[] = selectedGames.map((gameId, index) => ({
      gameId,
      trialCount: config.trialsPerGame,
      order: index,
    }));

    const scoredTotal = games.reduce((sum, g) => sum + g.trialCount, 0);

    return {
      config,
      games,
      totalTrials: scoredTotal + config.warmupTrials,
    };
  }, [tier]);

  // Initialize session
  const initSession = useCallback(() => {
    const dailyLimit = getDailyLimitConfig(tier);
    const check = dailyTracker.canStartSession(dailyLimit);
    if (!check.allowed) {
      setLimitReason(check.reason ?? '');
      setPhase('daily-limit');
      return;
    }

    const plan = buildSessionPlan();
    if (!plan) return;

    const manager = new MixedSessionManager(plan);
    managerRef.current = manager;
    setSessionPlan(plan);
    setCurrentGameId(manager.getCurrentGameId());
    setSessionProgress(0);
    setIsWarmup(true);
    setWarmupAdjustment(undefined);

    // Load DDA profile
    const disType = loadDisabilityType();
    setDdaProfile(DDA_PROFILES[disType]);

    // Check if first game needs instruction
    const firstGameId = manager.getCurrentGameId();
    try {
      const seen = window.localStorage.getItem(`${SEEN_KEY_PREFIX}${firstGameId}`);
      if (!seen) {
        setPendingInstruction(firstGameId);
        setPhase('instruction');
        return;
      }
    } catch { /* ignore */ }

    setPhase('playing');
  }, [tier, buildSessionPlan]);

  // Initialize on mount
  useEffect(() => {
    if (!loading && !tierLoading && !instrLoading) {
      initSession();
    }
  }, [loading, tierLoading, instrLoading, initSession]);

  const handleInstructionComplete = useCallback(() => {
    if (pendingInstruction) {
      try {
        window.localStorage.setItem(`${SEEN_KEY_PREFIX}${pendingInstruction}`, '1');
      } catch { /* ignore */ }
    }
    setPendingInstruction(null);
    setPhase('playing');
  }, [pendingInstruction]);

  // Trial complete handler
  const handleTrialComplete = useCallback((isCorrect: boolean, responseTimeMs: number) => {
    const manager = managerRef.current;
    if (!manager) return;

    const wasWarmup = manager.isWarmup();
    const result = manager.recordTrial(isCorrect, responseTimeMs);
    console.log('[MixedSession] trial:', {
      isCorrect, wasWarmup,
      progress: result.progress,
      isGameSwitch: result.isGameSwitch,
      isSessionComplete: result.isSessionComplete,
      totalCompleted: manager.getTotalTrialsCompleted(),
    });

    setSessionProgress(result.progress);
    setIsWarmup(manager.isWarmup());

    // Warmup ended
    if (wasWarmup && !manager.isWarmup()) {
      setShowStartBanner(true);
      setTimeout(() => setShowStartBanner(false), 1300);
    }

    // Game switch
    if (result.isGameSwitch && result.nextGameId) {
      const prevConfig = INTEGRATED_GAME_MAP[manager.getPlan().games[manager.getCurrentGameIndex() - 1]?.gameId];
      const nextConfig = INTEGRATED_GAME_MAP[result.nextGameId];
      setTransitionFrom(prevConfig?.name ?? '');
      setTransitionTo(nextConfig?.name ?? '');
      setPhase('transition');
      return;
    }

    // Session complete
    if (result.isSessionComplete) {
      console.log('[MixedSession] Session complete! Saving record...');
      const plan = manager.getPlan();
      const stats = manager.getScoredStats();
      // Save recent games for diversity
      saveRecentGames(plan.games.map(g => g.gameId));
      dailyTracker.recordSessionEnd(manager.getSessionDurationMs());
      // Save mixed session record to localStorage
      saveMixedSessionRecord({
        timestamp: Date.now(),
        gameIds: plan.games.map(g => g.gameId),
        totalCorrect: stats.totalCorrect,
        totalAttempts: stats.totalAttempts,
        accuracy: stats.accuracy,
        durationSec: manager.getSessionDurationSec(),
      });
      setPhase('session-complete');
    }
  }, []);

  const handleTransitionComplete = useCallback(() => {
    const manager = managerRef.current;
    if (!manager) return;

    const nextGameId = manager.getCurrentGameId();
    setCurrentGameId(nextGameId);
    setGameKey(prev => prev + 1);

    // 2nd+ games in mixed session: skip instruction, go straight to playing.
    // Transition screen already introduces the next game.
    setPhase('playing');
  }, []);

  const sessionCtxValue = useMemo<SessionContextValue>(() => ({
    onTrialComplete: handleTrialComplete,
    hideEndScreen: true,
    disabilityProfile: ddaProfile,
    warmupAdjustment,
  }), [handleTrialComplete, ddaProfile, warmupAdjustment]);

  const handleNextSession = useCallback(() => {
    setGameKey(prev => prev + 1);
    initSession();
  }, [initSession]);

  const handleGoHome = useCallback(() => {
    router.push('/');
  }, [router]);

  const ageGroup: AgeGroup = child?.ageGroup ?? '6-9';

  // Loading
  if (loading || tierLoading || instrLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-space">
        <div className="animate-gentle-pulse" style={{ color: '#B8B8D0' }}>読み込み中...</div>
      </div>
    );
  }

  // Daily limit
  if (phase === 'daily-limit') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-space">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-6">
            {limitReason.includes('おやすみ') ? '\u2615' : '\uD83C\uDF1F'}
          </p>
          <p className="text-xl font-bold mb-8" style={{ color: '#E8E8F0' }}>
            {limitReason}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 rounded-2xl text-lg font-medium transition-transform active:scale-95"
            style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#B8B8D0' }}
          >
            おうちに もどる
          </button>
        </div>
      </div>
    );
  }

  // Instruction
  if (phase === 'instruction' && pendingInstruction) {
    return (
      <GameInstruction
        gameId={pendingInstruction}
        instructionLevel={instructionLevel}
        onComplete={handleInstructionComplete}
      />
    );
  }

  // Transition between games
  if (phase === 'transition') {
    return (
      <AnimatePresence>
        <GameTransition
          fromGameName={transitionFrom}
          toGameName={transitionTo}
          onComplete={handleTransitionComplete}
        />
      </AnimatePresence>
    );
  }

  // Session complete
  if (phase === 'session-complete') {
    const manager = managerRef.current;
    const stats = manager?.getScoredStats() ?? { totalCorrect: 0, totalAttempts: 0, accuracy: 0 };
    const dailyLimit = getDailyLimitConfig(tier);
    const canPlayCheck = dailyTracker.canStartSession(dailyLimit);

    return (
      <SessionComplete
        scoredResults={manager?.getResults().map((r, i) => ({
          trialIndex: i,
          phase: 'scored' as const,
          correct: r.correct,
          responseTimeMs: r.responseTimeMs,
          timestamp: r.timestamp,
        })) ?? []}
        streakStats={stats}
        sessionDurationSec={manager?.getSessionDurationSec() ?? 0}
        onNextSession={handleNextSession}
        onGoHome={handleGoHome}
        dailyStats={dailyTracker.getTodayStats()}
        canPlayMore={canPlayCheck.allowed}
      />
    );
  }

  // Resolve current game component
  if (!currentGameId) return null;
  const resolved = resolveGameComponent(currentGameId, tier);
  if (!resolved?.component) return null;

  const GameComponent = resolved.component;

  // Mixed session manager controls all game transitions via onTrialComplete.
  // Pass a very large maxTrials so the game never self-terminates via endSession().
  // This prevents the dark screen freeze caused by GameShell returning null.
  const manager = managerRef.current;
  const maxTrials = 999;

  return (
    <SessionProvider value={sessionCtxValue}>
      <FeedbackContext value={feedbackCtx}>
        <div className="relative">
          {/* Mixed session progress bar */}
          <div className="fixed top-0 left-0 right-0 z-40">
            {sessionPlan && (
              <MixedSessionProgressBar
                progress={sessionProgress}
                isWarmup={isWarmup}
                tier={tier}
                plan={sessionPlan}
                currentGameIndex={manager?.getCurrentGameIndex() ?? 0}
              />
            )}
          </div>

          {/* Home button (no confirm for mixed session) */}
          <button
            onClick={() => router.push('/')}
            className="fixed top-12 left-4 z-50 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-transform active:scale-90"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#B8B8D0',
              backdropFilter: 'blur(8px)',
            }}
            aria-label="ホームに戻る"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </button>

          <GameComponent
            key={gameKey}
            ageGroup={ageGroup}
            maxTrials={maxTrials}
          />

          {/* Visual feedback overlay */}
          <VisualFeedback
            type={currentEffect}
            intensity={feedbackSettings.visualIntensity}
            onComplete={clearEffect}
          />

          {/* Warmup start banner */}
          <AnimatePresence>
            {showStartBanner && <WarmupStartBanner />}
          </AnimatePresence>
        </div>
      </FeedbackContext>
    </SessionProvider>
  );
}
