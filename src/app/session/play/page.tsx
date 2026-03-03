'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import type { AgeGroup } from '@/types';
import { INTEGRATED_GAME_MAP, resolveSourceGame } from '@/games/integrated';
import type { IntegratedGameId } from '@/games/integrated';
import { GAME_COMPONENTS } from '@/games/game-components';
import { useChildProfile } from '@/hooks/useChildProfile';
import { useTier, checkGameAccess } from '@/features/gating';
import { useInstructionLevel, GameInstruction } from '@/features/instruction';
import { FeedbackContext } from '@/features/feedback/FeedbackContext';
import { useFeedback } from '@/features/feedback/use-feedback';
import { VisualFeedback } from '@/features/feedback/VisualFeedback';
import { useSensoryFeedbackSettings } from '@/features/sensory/useSensoryFeedbackSettings';
import { dailyTracker } from '@/features/session/daily-tracker';
import { getDailyLimitConfig } from '@/features/session/session-config';
import { SessionProvider } from '@/features/session/SessionContext';
import type { SessionContextValue } from '@/features/session/SessionContext';
import { MixedSessionProgressBar } from '@/features/session/SessionProgressBar';
import { WarmupStartBanner } from '@/features/session/SessionProgressBar';
import { loadDisabilityType } from '@/features/dda/disability-profile-store';
import { DDA_PROFILES } from '@/features/dda/disability-profile';
import type { DDAProfile } from '@/features/dda/disability-profile';
import { getMixedSessionConfig } from '@/features/session/mixed-session';
import type { MixedSessionPlan, SessionGameSlot } from '@/features/session/mixed-session';
import { MixedSessionManager } from '@/features/session/mixed-session-manager';
import { selectGamesForSession, getRecentGames, saveRecentGames, saveLastGameOrder } from '@/features/session/session-engine';
import { saveMixedSessionRecord } from '@/features/session/mixed-session-record';
import { loadUnitState, getSessionType, advanceUnit } from '@/features/session/unit-tracker';
import type { SessionType } from '@/features/session/unit-tracker';

// Transition UI components (v3 Section 10)
import { GameTransition } from '@/components/transitions/GameTransition';
import { SessionEndWarning, useSessionEndWarningPolled } from '@/components/transitions/SessionEndWarning';
import { SessionComplete, calcStarCount } from '@/components/transitions/SessionComplete';
import { TreasureChest } from '@/components/rewards/TreasureChest';
import { useRewards } from '@/features/rewards/useRewards';
import { loadDailyStreak } from '@/features/feedback/daily-streak';
import { soundManager } from '@/features/feedback/sound-manager';

type PagePhase = 'daily-limit' | 'instruction' | 'playing' | 'transition' | 'session-complete' | 'treasure-chest';

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

  // Guard against double-initialization from useEffect re-firing
  const sessionInitializedRef = useRef(false);

  // Mixed session state
  const managerRef = useRef<MixedSessionManager | null>(null);
  const [sessionPlan, setSessionPlan] = useState<MixedSessionPlan | null>(null);
  const [currentGameId, setCurrentGameId] = useState<IntegratedGameId | null>(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [isWarmup, setIsWarmup] = useState(true);
  const [showStartBanner, setShowStartBanner] = useState(false);
  const [gameKey, setGameKey] = useState(0);

  // Transition state
  const [transitionNextName, setTransitionNextName] = useState('');
  const [transitionNextIcon, setTransitionNextIcon] = useState('🎮');

  // Instruction tracking for current game
  const [pendingInstruction, setPendingInstruction] = useState<IntegratedGameId | null>(null);

  // DDA
  const [ddaProfile, setDdaProfile] = useState<DDAProfile | undefined>(undefined);
  const [warmupAdjustment, setWarmupAdjustment] = useState<number | undefined>(undefined);

  // Unit / session type
  const [sessionType, setSessionType] = useState<SessionType>('normal');

  // Rewards (treasure chest)
  const [growthLevel] = useState(() => {
    try { return loadDailyStreak().growthLevel; } catch { return 1 as const; }
  });
  const { chests, selectedReward, isPredictableMode, selectChest, confirmReward } = useRewards({ growthLevel });

  // Feedback settings: instructionLevel × sensory settings
  const feedbackSettings = useSensoryFeedbackSettings(instructionLevel);
  const { triggerCorrect, triggerIncorrect, triggerNearMiss, clearEffect, currentEffect } =
    useFeedback(feedbackSettings);
  const feedbackCtx = useMemo(
    () => ({ triggerCorrect, triggerIncorrect, triggerNearMiss }),
    [triggerCorrect, triggerIncorrect, triggerNearMiss],
  );

  // セッション終了警告（セッション残り1分前にトースト表示）
  const dailyLimit = useMemo(() => getDailyLimitConfig(tier), [tier]);
  const maxSessionMs = dailyLimit.maxTotalMinutes * 60 * 1000;
  const getElapsedMs = useCallback(() => {
    return managerRef.current?.getSessionDurationMs() ?? 0;
  }, []);
  const { showWarning: showEndWarning, remainingMinutes: endWarningMinutes } =
    useSessionEndWarningPolled(getElapsedMs, maxSessionMs, 60000, 5000);

  // Build session plan
  const buildSessionPlan = useCallback((sType: SessionType): MixedSessionPlan | null => {
    const config = getMixedSessionConfig(tier);
    // review: recencyフィルタ無効化で全カテゴリカバー
    const recentGameIds = sType === 'review' ? [] : getRecentGames();
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
    const dailyLimitConfig = getDailyLimitConfig(tier);
    const check = dailyTracker.canStartSession(dailyLimitConfig);
    if (!check.allowed) {
      setLimitReason(check.reason ?? '');
      setPhase('daily-limit');
      return;
    }

    // Unit tracking: determine session type
    const unitState = loadUnitState();
    const sType = getSessionType(unitState);
    setSessionType(sType);

    const plan = buildSessionPlan(sType);
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

    // 毎ゲーム説明画面を表示（1ゲーム目）
    const firstGameId = manager.getCurrentGameId();
    setPendingInstruction(firstGameId);
    setPhase('instruction');
  }, [tier, buildSessionPlan]);

  // Initialize on mount (only once)
  useEffect(() => {
    if (!loading && !tierLoading && !instrLoading && !sessionInitializedRef.current) {
      sessionInitializedRef.current = true;
      initSession();
    }
  }, [loading, tierLoading, instrLoading, initSession]);

  const handleInstructionComplete = useCallback(() => {
    // AudioContext をユーザージェスチャー内で事前初期化
    soundManager.warmup();
    setPendingInstruction(null);
    setPhase('playing');
  }, []);

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

    // Warmup ended → apply warmup adjustment (v3 Section 9)
    if (wasWarmup && !manager.isWarmup()) {
      setWarmupAdjustment(manager.getWarmupAdjustment());
      setShowStartBanner(true);
      setTimeout(() => setShowStartBanner(false), 1300);
    }

    // Game switch → show transition screen
    if (result.isGameSwitch && result.nextGameId) {
      const nextConfig = INTEGRATED_GAME_MAP[result.nextGameId];
      setTransitionNextName(nextConfig?.name ?? '');
      setTransitionNextIcon(INTEGRATED_GAME_MAP[result.nextGameId]?.icon ?? '🎮');
      setPhase('transition');
      return;
    }

    // Session complete
    if (result.isSessionComplete) {
      console.log('[MixedSession] Session complete! Saving record...');
      const plan = manager.getPlan();
      const stats = manager.getScoredStats();
      const gameIds = plan.games.map(g => g.gameId);

      // Build per-game accuracy (v3 Section 9)
      const perGameAccuracy: Partial<Record<IntegratedGameId, number>> = {};
      for (const game of plan.games) {
        const gameResults = manager.getGameResults(game.gameId);
        if (gameResults.length > 0) {
          const correct = gameResults.filter(r => r.correct).length;
          perGameAccuracy[game.gameId] = correct / gameResults.length;
        }
      }

      // Save recent games for diversity
      saveRecentGames(gameIds);
      // ASD order stabilization (v3 Section 9)
      saveLastGameOrder(gameIds);
      dailyTracker.recordSessionEnd(manager.getSessionDurationMs());
      // Save mixed session record to localStorage
      saveMixedSessionRecord({
        timestamp: Date.now(),
        gameIds,
        totalCorrect: stats.totalCorrect,
        totalAttempts: stats.totalAttempts,
        accuracy: stats.accuracy,
        durationSec: manager.getSessionDurationSec(),
        perGameAccuracy,
      });
      // Advance unit tracker (v3 Section 9)
      advanceUnit(loadUnitState());
      setPhase('session-complete');
    }
  }, []);

  const handleTransitionComplete = useCallback(() => {
    const manager = managerRef.current;
    if (!manager) return;

    const nextGameId = manager.getCurrentGameId();
    setCurrentGameId(nextGameId);
    setGameKey(prev => prev + 1);

    // 2nd+ ゲームでも説明画面を表示
    setPendingInstruction(nextGameId);
    setPhase('instruction');
  }, []);

  const sessionCtxValue = useMemo<SessionContextValue>(() => ({
    onTrialComplete: handleTrialComplete,
    hideEndScreen: true,
    disabilityProfile: ddaProfile,
    warmupAdjustment,
  }), [handleTrialComplete, ddaProfile, warmupAdjustment]);

  const handleGoHome = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleRewardPhase = useCallback(() => {
    setPhase('treasure-chest');
  }, []);

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
          nextGameName={transitionNextName}
          nextGameIcon={transitionNextIcon}
          duration={3000}
          onComplete={handleTransitionComplete}
        />
      </AnimatePresence>
    );
  }

  // Session complete
  if (phase === 'session-complete') {
    const manager = managerRef.current;
    const stats = manager?.getScoredStats() ?? { totalCorrect: 0, totalAttempts: 0, accuracy: 0 };
    const gameCount = manager?.getPlan().games.length ?? 0;
    const starCount = calcStarCount(stats.accuracy);

    return (
      <SessionComplete
        gameCount={gameCount}
        starCount={starCount}
        totalCorrect={stats.totalCorrect}
        totalAttempts={stats.totalAttempts}
        onGoHome={handleRewardPhase}
        ctaLabel="ごほうびをもらう"
      />
    );
  }

  // Treasure chest reward
  if (phase === 'treasure-chest') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-space">
        <TreasureChest
          chests={chests}
          selectedReward={selectedReward}
          onSelectChest={selectChest}
          onConfirmReward={() => {
            confirmReward();
            handleGoHome();
          }}
          isPredictableMode={isPredictableMode}
        />
      </div>
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
                sessionType={sessionType}
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

          {/* セッション終了前の予告トースト（v3 Section 10）*/}
          <SessionEndWarning
            visible={showEndWarning}
            remainingMinutes={endWarningMinutes}
          />
        </div>
      </FeedbackContext>
    </SessionProvider>
  );
}
