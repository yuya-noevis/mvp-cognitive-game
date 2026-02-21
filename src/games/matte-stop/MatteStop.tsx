'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { matteStopConfig } from './config';
import { nowMs, randomInt } from '@/lib/utils';

interface MatteStopProps {
  ageGroup: AgeGroup;
  maxTrials?: number;
}

type TrialType = 'go' | 'nogo';
type Phase = 'ready' | 'fixation' | 'stimulus' | 'feedback' | 'iti';

// Go stimulus: star, NoGo stimulus: rock (PNG images)
const GO_STIMULUS = '/assets/game/stimulus-star.png';
const NOGO_STIMULUS = '/assets/game/stimulus-rock.png';

export default function MatteStop({ ageGroup, maxTrials: maxTrialsProp }: MatteStopProps) {
  const session = useGameSession({
    gameConfig: matteStopConfig,
    ageGroup,
  });

  const [phase, setPhase] = useState<Phase>('ready');
  const [trialType, setTrialType] = useState<TrialType>('go');
  const [animal, setAnimal] = useState('dog');
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const [responded, setResponded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stimulusOnsetRef = useRef<number>(0);

  const maxTrials = maxTrialsProp ?? matteStopConfig.trial_count_range.max;
  const responseWindow = (session.difficulty.response_window_ms as number) || 2500;
  const nogoRatio = (session.difficulty.nogo_ratio as number) || 0.2;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start next trial
  const nextTrial = useCallback(() => {
    if (session.totalTrials >= maxTrials) {
      session.endSession('completed');
      return;
    }

    // Determine trial type
    const isNogo = Math.random() < nogoRatio;
    const type: TrialType = isNogo ? 'nogo' : 'go';
    setTrialType(type);
    setResponded(false);

    // Fixation cross
    setPhase('fixation');
    timerRef.current = setTimeout(() => {
      // Show stimulus
      setPhase('stimulus');
      stimulusOnsetRef.current = nowMs();

      session.startTrial(
        { trial_type: type },
        { expected_response: type === 'go' ? 'tap' : 'withhold' },
      );
      session.presentStimulus();

      // Response window timeout
      timerRef.current = setTimeout(() => {
        if (!responded) {
          handleTimeout(type);
        }
      }, responseWindow);
    }, randomInt(500, 1000)); // Random fixation duration
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, maxTrials, nogoRatio, responseWindow, responded]);

  // Handle tap response
  const handleTap = useCallback(() => {
    if (phase !== 'stimulus' || responded) return;
    setResponded(true);
    clearTimer();

    const rt = nowMs() - stimulusOnsetRef.current;
    const response: TrialResponse = {
      type: 'tap',
      value: { tapped: true },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);

    const isCorrect = trialType === 'go';
    const errorType = trialType === 'nogo' ? 'commission' as const : null;
    session.completeTrial(isCorrect, errorType);

    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [phase, responded, trialType, session, clearTimer]);

  // Handle timeout (no response within window)
  const handleTimeout = useCallback((type: TrialType) => {
    setResponded(true);
    const response: TrialResponse = {
      type: 'withhold',
      value: { tapped: false },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);

    const isCorrect = type === 'nogo'; // Withholding on nogo is correct
    const errorType = type === 'go' ? 'omission' as const : null;
    session.completeTrial(isCorrect, errorType);

    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [session]);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackCorrect(null);
    setPhase('iti');
    setTimeout(nextTrial, randomInt(800, 1200));
  }, [nextTrial]);

  // Auto-start
  useEffect(() => {
    if (session.sessionId && phase === 'ready' && session.totalTrials === 0) {
      nextTrial();
    }
  }, [session.sessionId, phase, session.totalTrials, nextTrial]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return (
    <GameShell gameName="まって！ストップ" gameId="matte-stop" session={session} maxTrials={maxTrials}>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {/* Instruction */}
        <div className="mb-6 text-center">
          <p className="text-lg font-medium text-cosmic-light">
            ほしが きたら タップ!
          </p>
          <p className="text-base text-moon font-medium mt-1">
            いわ のときは まって!
          </p>
        </div>

        {/* Stimulus area */}
        <div
          className="relative w-64 h-64 rounded-3xl flex items-center justify-center cursor-pointer select-none"
          style={{ backgroundColor: phase === 'stimulus' ? (trialType === 'nogo' ? 'rgba(42,42,90,0.4)' : 'rgba(108,60,225,0.15)') : 'rgba(42,42,90,0.2)' }}
          onClick={handleTap}
        >
          {phase === 'fixation' && (
            <span className="text-4xl text-moon">+</span>
          )}

          {phase === 'stimulus' && (
            <div className="flex flex-col items-center animate-scale-in">
              <Image
                src={trialType === 'go' ? GO_STIMULUS : NOGO_STIMULUS}
                alt={trialType === 'go' ? 'star' : 'rock'}
                width={100}
                height={100}
              />
            </div>
          )}

          {phase === 'ready' && (
            <span className="text-xl text-moon">じゅんびちゅう...</span>
          )}

          {phase === 'iti' && (
            <span className="text-2xl text-moon">...</span>
          )}
        </div>
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback
          isCorrect={feedbackCorrect}
          variant={feedbackCorrect && trialType === 'nogo' ? 'nogo_correct' : 'normal'}
          onComplete={handleFeedbackComplete}
        />
      )}
    </GameShell>
  );
}
