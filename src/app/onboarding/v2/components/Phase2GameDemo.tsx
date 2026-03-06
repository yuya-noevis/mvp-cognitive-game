'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { StarIcon, TargetIcon, ColorDotIcon } from '@/components/icons';
import { touchDeGoConfig } from '@/games/touch-de-go/config';
import { nowMs, randomInt } from '@/lib/utils';
import Mogura from '@/components/mascot/Mogura';
import { getChildName } from '@/features/onboarding-profile';
import type { Honorific } from '@/features/onboarding-profile';

const DEMO_MAX_TRIALS = 4;

interface Phase2GameDemoProps {
  ageGroup: AgeGroup;
  childName: string;
  honorific: Honorific | '';
  onComplete: (calibrationResult?: { touchSuccess: boolean; shapeMatchAccuracy: number; goNoGoSuccess: boolean }) => void;
}

type Phase = 'intro' | 'ready' | 'waiting' | 'target' | 'feedback' | 'result';

const TARGET_VISUALS: { render: (size: number) => React.ReactNode }[] = [
  { render: (s) => <StarIcon size={s} className="text-amber-400" style={{ fill: '#fbbf24', stroke: '#f59e0b' }} /> },
  { render: (s) => <TargetIcon size={s} style={{ color: '#8B5CF6' }} /> },
  { render: (s) => <ColorDotIcon color="#3b82f6" size={s} /> },
  { render: (s) => <ColorDotIcon color="#22c55e" size={s} /> },
];

export function Phase2GameDemo({ ageGroup, childName, honorific, onComplete }: Phase2GameDemoProps) {
  const session = useGameSession({ gameConfig: touchDeGoConfig, ageGroup });

  const [uiPhase, setUiPhase] = useState<Phase>('intro');
  const [targetX, setTargetX] = useState(50);
  const [targetY, setTargetY] = useState(50);
  const [targetVisualIndex, setTargetVisualIndex] = useState(0);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusOnsetRef = useRef(0);

  // Fullscreen game area
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [gameAreaSize, setGameAreaSize] = useState({ w: 280, h: 400 });

  const targetSize = (session.difficulty.target_size_px as number) || 100;
  const timeLimit = (session.difficulty.time_limit_ms as number) || 4000;

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const handleMiss = useCallback(() => {
    const response: TrialResponse = {
      type: 'timeout',
      value: { timed_out: true },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);
    session.completeTrial(false, 'omission');
    setFeedbackCorrect(false);
    setUiPhase('feedback');
  }, [session]);

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= DEMO_MAX_TRIALS) {
      session.endSession('completed');
      setUiPhase('result');
      return;
    }

    setUiPhase('waiting');
    const delay = randomInt(500, 1200);
    timerRef.current = setTimeout(() => {
      const margin = targetSize / 2 + 10;
      const x = randomInt(margin, 260 - margin);
      const y = randomInt(margin, 260 - margin);
      setTargetX(x);
      setTargetY(y);
      setTargetVisualIndex(randomInt(0, TARGET_VISUALS.length - 1));
      setUiPhase('target');
      stimulusOnsetRef.current = nowMs();

      session.startTrial(
        { target_x: x, target_y: y, target_size: targetSize, time_limit: timeLimit },
        { target_position: { x, y } },
      );
      session.presentStimulus();

      timerRef.current = setTimeout(handleMiss, timeLimit);
    }, delay);
  }, [session, targetSize, timeLimit, handleMiss]);

  const handleTargetTap = useCallback(() => {
    if (uiPhase !== 'target') return;
    clearTimer();

    const rt = nowMs() - stimulusOnsetRef.current;
    const response: TrialResponse = {
      type: 'tap',
      value: { reaction_time_ms: rt, target_size: targetSize },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);
    session.completeTrial(true, null);
    setFeedbackCorrect(true);
    setUiPhase('feedback');
  }, [uiPhase, session, clearTimer, targetSize]);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackCorrect(null);

    if (session.totalTrials >= DEMO_MAX_TRIALS) {
      setUiPhase('result');
      return;
    }

    setUiPhase('ready');
    setTimeout(nextTrial, randomInt(300, 600));
  }, [session.totalTrials, nextTrial]);

  // Auto-start first trial after session starts
  useEffect(() => {
    if (session.sessionId && uiPhase === 'ready' && session.totalTrials === 0) {
      nextTrial();
    }
  }, [session.sessionId, uiPhase, session.totalTrials, nextTrial]);

  useEffect(() => { return clearTimer; }, [clearTimer]);

  // Track window size for fullscreen game area
  useEffect(() => {
    const update = () => {
      setGameAreaSize({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Fullscreen target positioning (recomputed when targetX/Y change)
  const fsTargetX = useMemo(() => {
    const margin = targetSize / 2 + 20;
    return randomInt(margin, Math.max(margin + 1, gameAreaSize.w - margin));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetX, gameAreaSize.w]);
  const fsTargetY = useMemo(() => {
    const margin = targetSize / 2 + 80;
    return randomInt(margin, Math.max(margin + 1, gameAreaSize.h - margin - 40));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetY, gameAreaSize.h]);

  const displayName = getChildName(childName, honorific);
  const accuracy = session.totalTrials > 0 ? session.totalCorrect / session.totalTrials : 0;

  // --- Render ---

  if (uiPhase === 'intro') {
    return (
      <div className="flex flex-col items-center gap-6 pt-4">
        <Mogura expression="excited" size={140} />

        <div className="text-center">
          <h2 className="text-xl font-bold text-stardust">
            {displayName}、<br />まずゲームをためしてみよう！
          </h2>
          <p className="text-sm text-moon mt-2">
            でてきたものを すばやく タップ！
          </p>
        </div>

        <div
          className="w-full rounded-2xl px-5 py-4 text-center"
          style={{ background: 'rgba(108, 60, 225, 0.1)', border: '1px solid rgba(108, 60, 225, 0.2)' }}
        >
          <p className="text-sm text-moon">
            <span className="text-cosmic font-bold">タッチでGO!</span> という<br />
            あそびで {DEMO_MAX_TRIALS} かいやってみよう
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            session.startSession();
            setUiPhase('ready');
          }}
          className="w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity active:scale-[0.98]"
        >
          はじめる！
        </button>
      </div>
    );
  }

  if (uiPhase === 'result') {
    const starCount = accuracy >= 0.8 ? 3 : accuracy >= 0.5 ? 2 : 1;

    return (
      <div className="flex flex-col items-center gap-6 pt-4">
        <Mogura expression="excited" size={140} />

        <div className="text-center">
          <h2 className="text-2xl font-bold text-stardust">よくできました！</h2>
          <p className="text-base text-moon mt-1">
            {displayName} すごい！
          </p>
        </div>

        {/* Star rating */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((star) => (
            <svg
              key={star}
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill={star <= starCount ? '#FFD43B' : 'rgba(255,255,255,0.1)'}
              className="transition-all duration-300"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>

        <div
          className="w-full rounded-2xl px-5 py-4 text-center"
          style={{ background: 'rgba(78, 205, 196, 0.1)', border: '1px solid rgba(78, 205, 196, 0.2)' }}
        >
          <p className="text-sm" style={{ color: '#4ECDC4' }}>
            {session.totalTrials}かい チャレンジしたよ！
          </p>
        </div>

        <button
          type="button"
          onClick={() => onComplete({
            touchSuccess: accuracy > 0,
            shapeMatchAccuracy: accuracy,
            goNoGoSuccess: accuracy >= 0.5,
          })}
          className="w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg transition-opacity active:scale-[0.98]"
        >
          つぎへ
        </button>
      </div>
    );
  }

  return (
    <div
      ref={gameAreaRef}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(13,13,43,0.98)' }}
    >
      {/* Top bar with instruction + progress */}
      <div className="flex-shrink-0 pt-14 pb-3 px-5 flex flex-col items-center gap-2">
        <p className="text-base font-medium text-moon">
          でてきたら すばやく タップ！
        </p>
        <div className="flex gap-2">
          {Array.from({ length: DEMO_MAX_TRIALS }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-2.5 rounded-full"
              style={{
                background: i < session.totalTrials
                  ? 'rgba(108, 60, 225, 0.8)'
                  : 'rgba(255, 255, 255, 0.1)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen game area */}
      <div className="relative flex-1 overflow-hidden">
        {uiPhase === 'waiting' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full animate-gentle-pulse"
                  style={{
                    background: 'rgba(108, 60, 225, 0.5)',
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {uiPhase === 'target' && (
          <button
            onClick={handleTargetTap}
            className="absolute rounded-full flex items-center justify-center
              animate-scale-in active:scale-75 transition-transform"
            style={{
              left: `${fsTargetX}px`,
              top: `${fsTargetY - 100}px`,
              width: `${Math.max(targetSize, 100)}px`,
              height: `${Math.max(targetSize, 100)}px`,
              transform: 'translate(-50%, -50%)',
              background: 'rgba(108,60,225,0.2)',
              border: '3px solid rgba(108,60,225,0.6)',
            }}
          >
            {TARGET_VISUALS[targetVisualIndex].render(Math.round(Math.max(targetSize, 100) * 0.5))}
          </button>
        )}
      </div>

      {feedbackCorrect !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <TrialFeedback isCorrect={feedbackCorrect} onComplete={handleFeedbackComplete} />
        </div>
      )}
    </div>
  );
}
