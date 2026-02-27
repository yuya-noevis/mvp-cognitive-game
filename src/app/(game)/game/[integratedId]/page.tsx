'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import type { GameId, AgeGroup } from '@/types';
import { GAME_CONFIGS } from '@/games';
import { INTEGRATED_GAME_MAP, resolveSourceGame } from '@/games/integrated';
import type { IntegratedGameId } from '@/games/integrated';
import { SearchIcon } from '@/components/icons';
import { useChildProfile } from '@/hooks/useChildProfile';
import { useTier, checkGameAccess } from '@/features/gating';
import { useInstructionLevel, GameInstruction } from '@/features/instruction';
import { FeedbackContext } from '@/features/feedback/FeedbackContext';
import { useFeedback } from '@/features/feedback/use-feedback';
import { getFeedbackSettingsForLevel } from '@/features/feedback/feedback-config';
import { VisualFeedback } from '@/features/feedback/VisualFeedback';
import { SessionManager } from '@/features/session/session-manager';
import { dailyTracker } from '@/features/session/daily-tracker';
import { getDailyLimitConfig } from '@/features/session/session-config';
import { SessionProvider } from '@/features/session/SessionContext';
import type { SessionContextValue } from '@/features/session/SessionContext';
import { SessionProgressBar, WarmupStartBanner } from '@/features/session/SessionProgressBar';
import { SessionComplete } from '@/features/session/SessionComplete';
import { loadDisabilityType } from '@/features/dda/disability-profile-store';
import { DDA_PROFILES } from '@/features/dda/disability-profile';
import type { DDAProfile } from '@/features/dda/disability-profile';

const SEEN_KEY_PREFIX = 'manas_instruction_seen_';

// Dev override for session trial count
const DEV_SESSION_OVERRIDE_KEY = 'manas_session_trials_dev_override';

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

type PagePhase = 'daily-limit' | 'instruction' | 'playing' | 'session-complete';

export default function IntegratedGamePage() {
  const params = useParams();
  const router = useRouter();
  const integratedId = params.integratedId as string;
  const { child, loading } = useChildProfile();
  const { tier, loading: tierLoading } = useTier();
  const { instructionLevel, loading: instrLoading } = useInstructionLevel();

  const [phase, setPhase] = useState<PagePhase>('instruction');
  const [hasSeen, setHasSeen] = useState(false);
  const [limitReason, setLimitReason] = useState<string>('');

  // Session manager state
  const sessionManagerRef = useRef<SessionManager | null>(null);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [sessionTrialIndex, setSessionTrialIndex] = useState(0);
  const [sessionTotalTrials, setSessionTotalTrials] = useState(0);
  const [isWarmup, setIsWarmup] = useState(true);
  const [showStartBanner, setShowStartBanner] = useState(false);
  const [gameKey, setGameKey] = useState(0); // key to force remount game on replay

  // Disability profile for DDA
  const [ddaProfile, setDdaProfile] = useState<DDAProfile | undefined>(undefined);
  const [warmupAdjustment, setWarmupAdjustment] = useState<number | undefined>(undefined);

  // Feedback settings (unconditional for hooks rules)
  const feedbackSettings = useMemo(
    () => getFeedbackSettingsForLevel(instructionLevel),
    [instructionLevel],
  );
  const {
    triggerCorrect,
    triggerIncorrect,
    triggerNearMiss,
    clearEffect,
    currentEffect,
  } = useFeedback(feedbackSettings);

  const feedbackCtx = useMemo(
    () => ({ triggerCorrect, triggerIncorrect, triggerNearMiss }),
    [triggerCorrect, triggerIncorrect, triggerNearMiss],
  );

  // Check localStorage for instruction seen
  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(`${SEEN_KEY_PREFIX}${integratedId}`);
      if (seen) {
        setHasSeen(true);
      }
    } catch { /* ignore */ }
  }, [integratedId]);

  // Initialize session manager and check daily limit
  const initSession = useCallback(() => {
    const manager = new SessionManager(tier);

    // Dev override for trial count
    try {
      const override = localStorage.getItem(DEV_SESSION_OVERRIDE_KEY);
      if (override) {
        const count = parseInt(override, 10);
        if (!isNaN(count) && count > 0) {
          manager.overrideMaxTrials(count);
          manager.overrideWarmupTrials(0);
        }
      }
    } catch { /* ignore */ }

    // Load disability profile for DDA
    const disType = loadDisabilityType();
    setDdaProfile(DDA_PROFILES[disType]);
    setWarmupAdjustment(undefined);

    const dailyLimit = manager.getDailyLimit();
    const check = dailyTracker.canStartSession(dailyLimit);

    if (!check.allowed) {
      setLimitReason(check.reason ?? '');
      setPhase('daily-limit');
      return;
    }

    manager.start();
    sessionManagerRef.current = manager;
    setSessionTotalTrials(manager.getTotalTrialCount());
    setSessionTrialIndex(0);
    setSessionProgress(0);
    setIsWarmup(manager.isWarmup());

    if (hasSeen) {
      setPhase('playing');
    } else {
      setPhase('instruction');
    }
  }, [tier, hasSeen]);

  // Initialize on mount (after loading)
  useEffect(() => {
    if (!loading && !tierLoading && !instrLoading) {
      initSession();
    }
  }, [loading, tierLoading, instrLoading, initSession]);

  const handleInstructionComplete = useCallback(() => {
    setPhase('playing');
    try {
      window.localStorage.setItem(`${SEEN_KEY_PREFIX}${integratedId}`, '1');
    } catch { /* ignore */ }
    setHasSeen(true);
  }, [integratedId]);

  const handleShowInstruction = useCallback(() => {
    setPhase('instruction');
  }, []);

  // Session context: receive trial completions from useGameSession
  const handleTrialComplete = useCallback((isCorrect: boolean, responseTimeMs: number) => {
    const manager = sessionManagerRef.current;
    if (!manager) return;

    const wasWarmup = manager.isWarmup();
    const result = manager.recordTrial(isCorrect, responseTimeMs);

    setSessionTrialIndex(manager.getCurrentTrialIndex());
    setSessionProgress(result.progress);
    setIsWarmup(manager.isWarmup());

    // Warmup just ended → show "スタート！" banner + apply DDA warmup adjustment
    if (wasWarmup && !manager.isWarmup()) {
      setShowStartBanner(true);
      setTimeout(() => setShowStartBanner(false), 1300);

      const adj = manager.getWarmupAdjustment();
      if (adj < 0) {
        setWarmupAdjustment(adj);
      }
    }

    // Session complete
    if (result.isSessionComplete) {
      dailyTracker.recordSessionEnd(manager.getSessionDurationMs());
      setPhase('session-complete');
    }
  }, []);

  const sessionCtxValue = useMemo<SessionContextValue>(() => ({
    onTrialComplete: handleTrialComplete,
    hideEndScreen: true,
    disabilityProfile: ddaProfile,
    warmupAdjustment,
  }), [handleTrialComplete, ddaProfile, warmupAdjustment]);

  // Handlers for session complete screen
  const handleNextSession = useCallback(() => {
    setGameKey(prev => prev + 1);
    initSession();
  }, [initSession]);

  const handleGoHome = useCallback(() => {
    router.push('/');
  }, [router]);

  const ageGroup: AgeGroup = child?.ageGroup ?? '6-9';

  // Validate integrated game ID
  const integratedConfig = INTEGRATED_GAME_MAP[integratedId as IntegratedGameId];

  // Tier-based level restrictions
  const access = integratedConfig
    ? checkGameAccess(integratedId as IntegratedGameId, tier)
    : null;

  // TODO: ユーザーの実際の進行レベルをDBから取得（現在はデフォルト1）
  const rawUserLevel = 1;
  const userLevel = access
    ? Math.min(rawUserLevel, access.maxAccessibleLevel)
    : rawUserLevel;

  const sourceGameId = integratedConfig
    ? resolveSourceGame(integratedId as IntegratedGameId, userLevel)
    : null;

  const GameComponent = sourceGameId ? GAME_COMPONENTS[sourceGameId] : null;

  if (loading || tierLoading || instrLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-space">
        <div className="animate-gentle-pulse" style={{ color: '#B8B8D0' }}>読み込み中...</div>
      </div>
    );
  }

  // Tier access denied
  if (access && !access.accessible) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 animate-fade-in bg-space">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
             style={{ background: 'rgba(255, 212, 59, 0.15)' }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: '#FFD43B' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-lg font-medium text-center" style={{ color: '#B8B8D0' }}>
          {access.lockedReason ?? 'このゲームはまだ遊べないよ'}
        </p>
      </div>
    );
  }

  if (!integratedConfig || !GameComponent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 animate-fade-in bg-space">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
             style={{ background: 'rgba(255, 212, 59, 0.15)' }}>
          <SearchIcon size={32} style={{ color: '#FFD43B' }} />
        </div>
        <p className="text-lg font-medium" style={{ color: '#B8B8D0' }}>
          ゲームが見つかりません
        </p>
      </div>
    );
  }

  // Daily limit reached
  if (phase === 'daily-limit') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-space">
        <div className="text-center max-w-sm">
          <p className="text-6xl mb-6">
            {limitReason.includes('おやすみ') ? '☕' : '🌟'}
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

  // Instruction screen
  if (phase === 'instruction') {
    return (
      <GameInstruction
        gameId={integratedId as IntegratedGameId}
        instructionLevel={instructionLevel}
        onComplete={handleInstructionComplete}
      />
    );
  }

  // Session complete screen
  if (phase === 'session-complete') {
    const manager = sessionManagerRef.current;
    const stats = manager?.getScoredStats() ?? { totalCorrect: 0, totalAttempts: 0, accuracy: 0 };
    const dailyLimit = getDailyLimitConfig(tier);
    const canPlayCheck = dailyTracker.canStartSession(dailyLimit);

    return (
      <SessionComplete
        scoredResults={manager?.getScoredResults() ?? []}
        streakStats={stats}
        sessionDurationSec={manager?.getSessionDurationSec() ?? 0}
        onNextSession={handleNextSession}
        onGoHome={handleGoHome}
        dailyStats={dailyTracker.getTodayStats()}
        canPlayMore={canPlayCheck.allowed}
      />
    );
  }

  // Game play phase
  const totalTrials = sessionManagerRef.current?.getTotalTrialCount();

  return (
    <SessionProvider value={sessionCtxValue}>
      <FeedbackContext value={feedbackCtx}>
        <div className="relative">
          {/* Session progress bar */}
          <div className="fixed top-0 left-0 right-0 z-40">
            <SessionProgressBar
              progress={sessionProgress}
              currentTrial={sessionTrialIndex}
              totalTrials={sessionTotalTrials}
              isWarmup={isWarmup}
              tier={tier}
            />
          </div>

          {/* "?" button to re-show instructions */}
          {hasSeen && (
            <button
              onClick={handleShowInstruction}
              className="fixed top-12 left-4 z-50 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-transform active:scale-90"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#B8B8D0',
                backdropFilter: 'blur(8px)',
              }}
              aria-label="指示を表示"
            >
              ?
            </button>
          )}

          <GameComponent
            key={gameKey}
            ageGroup={ageGroup}
            maxTrials={totalTrials}
          />

          {/* Visual feedback overlay */}
          <VisualFeedback
            type={currentEffect}
            intensity={feedbackSettings.visualIntensity}
            onComplete={clearEffect}
          />

          {/* "スタート！" banner after warmup */}
          <AnimatePresence>
            {showStartBanner && <WarmupStartBanner />}
          </AnimatePresence>
        </div>
      </FeedbackContext>
    </SessionProvider>
  );
}
