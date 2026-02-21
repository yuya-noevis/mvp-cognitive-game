'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { oboeteMatchConfig } from './config';
import { nowMs, shuffle, randomInt } from '@/lib/utils';

interface OboeteMatchProps {
  ageGroup: AgeGroup;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

type Phase = 'ready' | 'sample' | 'delay' | 'choice' | 'feedback';

// Stimulus patterns using PNG images
const PATTERNS = [
  { image: '/assets/game/stimulus-star.png', label: 'star' },
  { image: '/assets/game/stimulus-rocket.png', label: 'rocket' },
  { image: '/assets/game/stimulus-ufo.png', label: 'ufo' },
  { image: '/assets/game/stimulus-planet.png', label: 'planet' },
  { image: '/assets/game/stimulus-alien.png', label: 'alien' },
  { image: '/assets/game/stimulus-sun.png', label: 'sun' },
  { image: '/assets/game/stimulus-moon.png', label: 'moon' },
  { image: '/assets/game/stimulus-comet.png', label: 'comet' },
];

const CARD_BACK = '/assets/game/card-back.png';

interface Choice {
  id: string;
  pattern: typeof PATTERNS[0];
  isTarget: boolean;
}

export default function OboeteMatch({ ageGroup, stageMode, maxTrials: stageModeTrials, onStageComplete }: OboeteMatchProps) {
  const session = useGameSession({ gameConfig: oboeteMatchConfig, ageGroup });

  const [phase, setPhase] = useState<Phase>('ready');
  const [samplePattern, setSamplePattern] = useState<typeof PATTERNS[0] | null>(null);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveMaxTrials = stageModeTrials ?? oboeteMatchConfig.trial_count_range.max;
  const delayMs = (session.difficulty.delay_ms as number) || 0;
  const choiceCount = (session.difficulty.choice_count as number) || 2;

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= effectiveMaxTrials) {
      session.endSession('completed');
      return;
    }

    // Select sample pattern
    const sample = PATTERNS[randomInt(0, PATTERNS.length - 1)];
    setSamplePattern(sample);

    // Generate choices
    const others = PATTERNS.filter(p => p.label !== sample.label);
    const distractors = shuffle(others).slice(0, choiceCount - 1);
    const allChoices: Choice[] = shuffle([
      { id: `target_${randomInt(0, 9999)}`, pattern: sample, isTarget: true },
      ...distractors.map((p, i) => ({
        id: `dist_${i}_${randomInt(0, 9999)}`,
        pattern: p,
        isTarget: false,
      })),
    ]);
    setChoices(allChoices);

    // Show sample
    setPhase('sample');
    session.startTrial(
      { sample: sample.label, delay_ms: delayMs, choice_count: choiceCount },
      { target_label: sample.label },
    );
    session.presentStimulus();

    // After 2s sample display → delay phase
    timerRef.current = setTimeout(() => {
      if (delayMs > 0) {
        setPhase('delay');
        timerRef.current = setTimeout(() => setPhase('choice'), delayMs);
      } else {
        setPhase('choice');
      }
    }, 2000);
  }, [session, effectiveMaxTrials, choiceCount, delayMs]);

  const handleSelect = useCallback((choice: Choice) => {
    if (phase !== 'choice') return;
    clearTimer();

    const response: TrialResponse = {
      type: 'select',
      value: { selected: choice.pattern.label, isTarget: choice.isTarget },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);

    const isCorrect = choice.isTarget;
    session.completeTrial(isCorrect, isCorrect ? null : 'selection');

    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [phase, session, clearTimer]);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackCorrect(null);
    setPhase('ready');
    setTimeout(nextTrial, 600);
  }, [nextTrial]);

  useEffect(() => {
    if (session.sessionId && phase === 'ready' && session.totalTrials === 0) {
      nextTrial();
    }
  }, [session.sessionId, phase, session.totalTrials, nextTrial]);

  useEffect(() => { return clearTimer; }, [clearTimer]);

  return (
    <GameShell gameName="おぼえてマッチ" gameId="oboete-match" session={session}
               stageMode={stageMode} maxTrials={effectiveMaxTrials} onStageComplete={onStageComplete}>
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Sample display */}
        {phase === 'sample' && samplePattern && (
          <div className="text-center mb-6">
            <p className="text-lg font-medium mb-3 text-cosmic-light">
              これを おぼえてね!
            </p>
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto bg-galaxy-light">
              <Image src={samplePattern.image} alt={samplePattern.label} width={80} height={80} />
            </div>
          </div>
        )}

        {/* Delay phase — show card back */}
        {phase === 'delay' && (
          <div className="text-center mb-6">
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto animate-gentle-pulse bg-galaxy-light">
              <Image src={CARD_BACK} alt="card back" width={80} height={80} />
            </div>
            <p className="text-base mt-3 text-moon">
              おぼえてるかな...
            </p>
          </div>
        )}

        {/* Choice phase */}
        {phase === 'choice' && (
          <div className="text-center">
            <p className="text-lg font-medium mb-4 text-cosmic-light">
              おなじものは どれ?
            </p>
            <div className="grid grid-cols-2 gap-4">
              {choices.map(choice => (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice)}
                  className="tap-target-large w-24 h-24 rounded-2xl flex items-center justify-center
                    border-2 border-galaxy-light active:scale-95 transition-all bg-galaxy-light"
                >
                  <Image src={choice.pattern.image} alt={choice.pattern.label} width={56} height={56} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ready state */}
        {phase === 'ready' && (
          <div className="text-center">
            <span className="text-xl text-moon">
              じゅんびちゅう...
            </span>
          </div>
        )}
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback isCorrect={feedbackCorrect} onComplete={handleFeedbackComplete} />
      )}
    </GameShell>
  );
}
