'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { StarIcon, TargetIcon, ColorDotIcon, type IconProps } from '@/components/icons';
import { touchDeGoConfig } from './config';
import { nowMs, randomInt } from '@/lib/utils';

interface TouchDeGoProps {
  ageGroup: AgeGroup;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

type Phase = 'ready' | 'waiting' | 'target' | 'feedback';

// Target visual variants: star, target, blue/yellow/green dots
interface TargetVisual {
  render: (size: number) => React.ReactNode;
}
const TARGET_VISUALS: TargetVisual[] = [
  { render: (s) => <StarIcon size={s} className="text-amber-400" style={{ fill: '#fbbf24', stroke: '#f59e0b' }} /> },
  { render: (s) => <TargetIcon size={s} className="text-indigo-500" /> },
  { render: (s) => <ColorDotIcon color="#3b82f6" size={s} /> },
  { render: (s) => <ColorDotIcon color="#eab308" size={s} /> },
  { render: (s) => <ColorDotIcon color="#22c55e" size={s} /> },
];

export default function TouchDeGo({ ageGroup, stageMode, maxTrials: stageModeTrials, onStageComplete }: TouchDeGoProps) {
  const session = useGameSession({ gameConfig: touchDeGoConfig, ageGroup });

  const [phase, setPhase] = useState<Phase>('ready');
  const [targetX, setTargetX] = useState(50);
  const [targetY, setTargetY] = useState(50);
  const [targetVisualIndex, setTargetVisualIndex] = useState(0);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusOnsetRef = useRef(0);

  const effectiveMaxTrials = stageModeTrials ?? touchDeGoConfig.trial_count_range.max;
  const targetSize = (session.difficulty.target_size_px as number) || 100;
  const timeLimit = (session.difficulty.time_limit_ms as number) || 4000;

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= effectiveMaxTrials) {
      session.endSession('completed');
      return;
    }

    setPhase('waiting');

    // Random delay before target appears
    const delay = randomInt(500, 1500);
    timerRef.current = setTimeout(() => {
      // Random position (keep within safe area considering target size)
      const margin = targetSize / 2 + 10;
      const x = randomInt(margin, 300 - margin);
      const y = randomInt(margin, 300 - margin);
      setTargetX(x);
      setTargetY(y);
      setTargetVisualIndex(randomInt(0, TARGET_VISUALS.length - 1));
      setPhase('target');
      stimulusOnsetRef.current = nowMs();

      session.startTrial(
        { target_x: x, target_y: y, target_size: targetSize, time_limit: timeLimit },
        { target_position: { x, y } },
      );
      session.presentStimulus();

      // Time limit
      timerRef.current = setTimeout(() => {
        handleMiss();
      }, timeLimit);
    }, delay);
  }, [session, effectiveMaxTrials, targetSize, timeLimit]);

  const handleTargetTap = useCallback(() => {
    if (phase !== 'target') return;
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
    setPhase('feedback');
  }, [phase, session, clearTimer, targetSize]);

  const handleMiss = useCallback(() => {
    const response: TrialResponse = {
      type: 'timeout',
      value: { timed_out: true },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);
    session.completeTrial(false, 'omission');

    setFeedbackCorrect(false);
    setPhase('feedback');
  }, [session]);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackCorrect(null);
    setPhase('ready');
    setTimeout(nextTrial, randomInt(300, 600));
  }, [nextTrial]);

  useEffect(() => {
    if (session.sessionId && phase === 'ready' && session.totalTrials === 0) {
      nextTrial();
    }
  }, [session.sessionId, phase, session.totalTrials, nextTrial]);

  useEffect(() => { return clearTimer; }, [clearTimer]);

  return (
    <GameShell gameName="タッチでGO!" session={session}
               stageMode={stageMode} maxTrials={effectiveMaxTrials} onStageComplete={onStageComplete}>
      <div className="flex flex-col items-center w-full max-w-md">
        <p className="text-lg font-medium mb-4" style={{ color: 'var(--color-primary-dark)' }}>
          でてきたら すばやく タップ！
        </p>

        {/* Game area */}
        <div className="relative rounded-3xl overflow-hidden"
             style={{
               width: '300px',
               height: '300px',
               background: 'var(--color-surface)',
               border: '2px solid var(--color-border-light)',
             }}>
          {phase === 'waiting' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl animate-gentle-pulse" style={{ color: 'var(--color-text-muted)' }}>
                ...
              </span>
            </div>
          )}

          {phase === 'target' && (
            <button
              onClick={handleTargetTap}
              className="absolute rounded-full flex items-center justify-center
                animate-scale-in active:scale-75 transition-transform"
              style={{
                left: `${targetX}px`,
                top: `${targetY}px`,
                width: `${targetSize}px`,
                height: `${targetSize}px`,
                transform: 'translate(-50%, -50%)',
                background: 'var(--color-primary-bg)',
                border: '3px solid var(--color-primary)',
              }}
            >
              {TARGET_VISUALS[targetVisualIndex].render(Math.round(targetSize * 0.5))}
            </button>
          )}
        </div>
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback isCorrect={feedbackCorrect} onComplete={handleFeedbackComplete} />
      )}
    </GameShell>
  );
}
