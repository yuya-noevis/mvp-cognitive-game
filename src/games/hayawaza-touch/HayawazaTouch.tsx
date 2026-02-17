'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { StarIcon } from '@/components/icons';
import { hayawazaTouchConfig } from './config';
import { RESPONSE_WINDOW_BY_AGE } from '@/lib/constants';
import { nowMs, randomInt } from '@/lib/utils';

interface HayawazaTouchProps {
  ageGroup: AgeGroup;
  maxTrials?: number;
}

type Phase = 'ready' | 'fixation' | 'stimulus' | 'feedback' | 'iti';

// Crescent moon SVG for non-target stimulus
function MoonIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="currentColor" fillOpacity={0.3} stroke="currentColor" strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HayawazaTouch({ ageGroup, maxTrials: maxTrialsProp }: HayawazaTouchProps) {
  const session = useGameSession({
    gameConfig: hayawazaTouchConfig,
    ageGroup,
  });

  const [phase, setPhase] = useState<Phase>('ready');
  const [isTarget, setIsTarget] = useState(true);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusOnsetRef = useRef(0);

  const maxTrials = maxTrialsProp ?? hayawazaTouchConfig.trial_count_range.max;
  const mode = (session.difficulty.mode as string) || 'srt';
  const responseWindow = RESPONSE_WINDOW_BY_AGE[ageGroup];

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= maxTrials) {
      session.endSession('completed');
      return;
    }

    // In SRT mode, always target. In CRT, 70% target.
    const target = mode === 'srt' ? true : Math.random() < 0.7;
    setIsTarget(target);

    // Show fixation
    setPhase('fixation');
    const isi = randomInt(1000, 2500); // Variable ISI to prevent anticipation

    timerRef.current = setTimeout(() => {
      setPhase('stimulus');
      stimulusOnsetRef.current = nowMs();

      session.startTrial(
        { mode, is_target: target },
        { expected: target ? 'tap' : 'withhold' },
      );
      session.presentStimulus();

      // Response window timeout
      timerRef.current = setTimeout(() => {
        handleTimeout(target);
      }, responseWindow);
    }, isi);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, maxTrials, mode, responseWindow]);

  const handleTap = useCallback(() => {
    if (phase !== 'stimulus') return;
    clearTimer();

    const rt = nowMs() - stimulusOnsetRef.current;

    // Check for anticipation (very fast response < 150ms)
    const isAnticipation = rt < 150;

    const response: TrialResponse = {
      type: 'tap',
      value: { reaction_time_ms: rt, anticipation: isAnticipation },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);

    let isCorrect: boolean;
    let errorType = null;

    if (isAnticipation) {
      // Anticipation responses are not counted as errors but are logged
      isCorrect = false;
      errorType = 'commission' as const;
    } else if (mode === 'srt') {
      isCorrect = true;
    } else {
      // CRT mode
      isCorrect = isTarget;
      errorType = !isTarget ? 'commission' as const : null;
    }

    session.completeTrial(isCorrect, errorType);
    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [phase, session, mode, isTarget, clearTimer]);

  const handleTimeout = useCallback((wasTarget: boolean) => {
    const response: TrialResponse = {
      type: 'timeout',
      value: { timed_out: true },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);

    // In CRT mode, timeout on non-target is correct (withholding)
    const isCorrect = mode === 'crt' && !wasTarget;
    const errorType = wasTarget ? 'omission' as const : null;
    session.completeTrial(isCorrect, errorType);

    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [session, mode]);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackCorrect(null);
    setPhase('iti');
    setTimeout(nextTrial, randomInt(500, 800));
  }, [nextTrial]);

  useEffect(() => {
    if (session.sessionId && phase === 'ready' && session.totalTrials === 0) {
      nextTrial();
    }
  }, [session.sessionId, phase, session.totalTrials, nextTrial]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return (
    <GameShell gameName="はやわざタッチ" session={session} maxTrials={maxTrials}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {/* Instruction */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-1 text-lg text-indigo-600 font-medium flex-wrap">
            {mode === 'srt' ? (
              <>
                <StarIcon size={22} className="text-amber-400 inline" style={{ fill: '#fbbf24', stroke: '#f59e0b' }} />
                <span>が でたら タップ！</span>
              </>
            ) : (
              <>
                <StarIcon size={22} className="text-amber-400 inline" style={{ fill: '#fbbf24', stroke: '#f59e0b' }} />
                <span>だけ タップ！</span>
                <MoonIcon size={22} className="text-indigo-300 inline" />
                <span>は まって！</span>
              </>
            )}
          </div>
        </div>

        {/* Stimulus area */}
        <button
          onClick={handleTap}
          disabled={phase !== 'stimulus'}
          className="w-48 h-48 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            backgroundColor: phase === 'stimulus' ? '#e0e7ff' : '#f5f5f5',
          }}
        >
          {phase === 'fixation' && (
            <span className="text-4xl text-gray-400">+</span>
          )}
          {phase === 'stimulus' && (
            isTarget
              ? <StarIcon size={80} className="text-amber-400" style={{ fill: '#fbbf24', stroke: '#f59e0b' }} />
              : <MoonIcon size={80} className="text-indigo-300" />
          )}
          {(phase === 'ready' || phase === 'iti') && (
            <span className="text-xl text-gray-300">...</span>
          )}
        </button>

        {/* Note: Speed is NOT shown to the child - only in parent reports */}
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback
          isCorrect={feedbackCorrect}
          onComplete={handleFeedbackComplete}
        />
      )}
    </GameShell>
  );
}
