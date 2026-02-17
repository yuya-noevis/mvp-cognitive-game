'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { katachiSagashiConfig } from './config';
import { nowMs, shuffle, randomInt } from '@/lib/utils';

interface KatachiSagashiProps {
  ageGroup: AgeGroup;
  maxTrials?: number;
}

type Phase = 'ready' | 'showing' | 'feedback';

// Simple shapes for matching
const SHAPES = [
  { name: 'circle', path: 'M50,10 a40,40 0 1,0 0,80 a40,40 0 1,0 0,-80', color: '#6366f1' },
  { name: 'square', path: 'M15,15 L85,15 L85,85 L15,85 Z', color: '#22c55e' },
  { name: 'triangle', path: 'M50,10 L90,85 L10,85 Z', color: '#f59e0b' },
  { name: 'diamond', path: 'M50,5 L95,50 L50,95 L5,50 Z', color: '#ec4899' },
  { name: 'star', path: 'M50,5 L61,35 L95,35 L68,57 L79,90 L50,70 L21,90 L32,57 L5,35 L39,35 Z', color: '#8b5cf6' },
  { name: 'hexagon', path: 'M50,5 L90,25 L90,75 L50,95 L10,75 L10,25 Z', color: '#14b8a6' },
];

interface ShapeChoice {
  shape: typeof SHAPES[0];
  rotation: number;
  isTarget: boolean;
  id: string;
}

export default function KatachiSagashi({ ageGroup, maxTrials: maxTrialsProp }: KatachiSagashiProps) {
  const session = useGameSession({
    gameConfig: katachiSagashiConfig,
    ageGroup,
  });

  const [phase, setPhase] = useState<Phase>('ready');
  const [target, setTarget] = useState<typeof SHAPES[0] | null>(null);
  const [choices, setChoices] = useState<ShapeChoice[]>([]);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);

  const maxTrials = maxTrialsProp ?? katachiSagashiConfig.trial_count_range.max;
  const choiceCount = (session.difficulty.choice_count as number) || 2;
  const rotationDeg = (session.difficulty.rotation_degrees as number) || 0;

  const generateTrial = useCallback(() => {
    const targetShape = SHAPES[randomInt(0, SHAPES.length - 1)];
    const otherShapes = SHAPES.filter(s => s.name !== targetShape.name);

    const distractors = shuffle(otherShapes).slice(0, choiceCount - 1);
    const allChoices: ShapeChoice[] = [
      {
        shape: targetShape,
        rotation: rotationDeg > 0 ? randomInt(0, Math.floor(rotationDeg / 90)) * 90 : 0,
        isTarget: true,
        id: `target_${randomInt(0, 9999)}`,
      },
      ...distractors.map((s, i) => ({
        shape: s,
        rotation: 0,
        isTarget: false,
        id: `dist_${i}_${randomInt(0, 9999)}`,
      })),
    ];

    return { targetShape, choices: shuffle(allChoices) };
  }, [choiceCount, rotationDeg]);

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= maxTrials) {
      session.endSession('completed');
      return;
    }

    const { targetShape, choices: newChoices } = generateTrial();
    setTarget(targetShape);
    setChoices(newChoices);
    setPhase('showing');

    session.startTrial(
      { target: targetShape.name, choices: newChoices.map(c => c.shape.name), rotation: rotationDeg },
      { target_id: newChoices.find(c => c.isTarget)!.id },
    );
    session.presentStimulus();
  }, [session, maxTrials, generateTrial, rotationDeg]);

  const handleSelect = useCallback((choice: ShapeChoice) => {
    if (phase !== 'showing') return;

    const response: TrialResponse = {
      type: 'select',
      value: { selected_id: choice.id, selected_shape: choice.shape.name },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);

    const isCorrect = choice.isTarget;
    session.completeTrial(isCorrect, isCorrect ? null : 'selection');

    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [phase, session]);

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

  return (
    <GameShell gameName="かたちさがし" session={session} maxTrials={maxTrials}>
      {/* Target display */}
      {target && (
        <div className="mb-6 text-center">
          <p className="text-lg font-medium mb-2" style={{ color: '#8B5CF6' }}>
            おなじ かたちは どれ？
          </p>
          <div className="inline-block p-4 rounded-2xl shadow-md border-2"
            style={{ background: 'rgba(26,26,64,0.85)', borderColor: 'rgba(139,92,246,0.3)' }}>
            <svg width="80" height="80" viewBox="0 0 100 100">
              <path d={target.path} fill={target.color} />
            </svg>
          </div>
        </div>
      )}

      {/* Choices */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleSelect(choice)}
            disabled={phase !== 'showing'}
            className="tap-target-large aspect-square rounded-2xl border-4
              flex items-center justify-center
              hover:border-purple-500 active:scale-95 transition-all"
            style={{ background: 'rgba(26,26,64,0.85)', borderColor: 'rgba(139,92,246,0.2)' }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 100 100"
              style={{ transform: `rotate(${choice.rotation}deg)` }}
            >
              <path d={choice.shape.path} fill={choice.shape.color} />
            </svg>
          </button>
        ))}
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
