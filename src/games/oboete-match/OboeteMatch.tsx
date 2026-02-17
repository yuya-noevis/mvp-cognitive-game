'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { ColorDotIcon } from '@/components/icons';
import { oboeteMatchConfig } from './config';
import { nowMs, shuffle, randomInt } from '@/lib/utils';

interface OboeteMatchProps {
  ageGroup: AgeGroup;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

type Phase = 'ready' | 'sample' | 'delay' | 'choice' | 'feedback';

// Stimulus patterns: colored shape combinations
const PATTERNS = [
  { color: '#ef4444', label: 'red-circle' },
  { color: '#eab308', label: 'yellow-circle' },
  { color: '#3b82f6', label: 'blue-circle' },
  { color: '#22c55e', label: 'green-circle' },
  { color: '#a855f7', label: 'purple-circle' },
  { color: '#f97316', label: 'orange-circle' },
  { color: '#1f2937', label: 'black-square' },
  { color: '#92400e', label: 'brown-circle' },
];

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
    <GameShell gameName="おぼえてマッチ" session={session}
               stageMode={stageMode} maxTrials={effectiveMaxTrials} onStageComplete={onStageComplete}>
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Sample display */}
        {phase === 'sample' && samplePattern && (
          <div className="text-center mb-6">
            <p className="text-lg font-medium mb-3" style={{ color: 'var(--color-primary-dark)' }}>
              これを おぼえてね！
            </p>
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto"
                 style={{ background: 'var(--color-primary-bg)' }}>
              <ColorDotIcon color={samplePattern.color} size={80} />
            </div>
          </div>
        )}

        {/* Delay phase */}
        {phase === 'delay' && (
          <div className="text-center mb-6">
            <div className="w-32 h-32 rounded-3xl flex items-center justify-center mx-auto animate-gentle-pulse"
                 style={{ background: 'var(--color-border-light)' }}>
              <span className="text-4xl" style={{ color: 'var(--color-text-muted)' }}>?</span>
            </div>
            <p className="text-base mt-3" style={{ color: 'var(--color-text-muted)' }}>
              おぼえてるかな...
            </p>
          </div>
        )}

        {/* Choice phase */}
        {phase === 'choice' && (
          <div className="text-center">
            <p className="text-lg font-medium mb-4" style={{ color: 'var(--color-primary-dark)' }}>
              おなじものは どれ？
            </p>
            <div className="grid grid-cols-2 gap-4">
              {choices.map(choice => (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice)}
                  className="tap-target-large w-24 h-24 rounded-2xl flex items-center justify-center
                    border-4 border-gray-200 hover:border-indigo-300 active:scale-95 transition-all"
                  style={{ background: 'var(--color-surface)' }}
                >
                  <ColorDotIcon color={choice.pattern.color} size={56} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ready state */}
        {phase === 'ready' && (
          <div className="text-center">
            <span className="text-2xl" style={{ color: 'var(--color-text-muted)' }}>
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
