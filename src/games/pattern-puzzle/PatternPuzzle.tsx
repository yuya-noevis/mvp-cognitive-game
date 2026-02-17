'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { patternPuzzleConfig } from './config';
import { nowMs, shuffle, randomInt } from '@/lib/utils';

interface PatternPuzzleProps {
  ageGroup: AgeGroup;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

type Phase = 'ready' | 'showing' | 'feedback';

// Simple shapes and colors for pattern building
const SHAPES = ['●', '■', '▲', '◆', '★', '♥'];
const COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899'];

interface PatternCell {
  shape: string;
  color: string;
  isMissing: boolean;
}

interface PatternTrial {
  grid: PatternCell[]; // 9 cells (3x3), last one is missing
  correctAnswer: { shape: string; color: string };
  choices: { id: string; shape: string; color: string; isCorrect: boolean }[];
}

function generatePatternTrial(patternType: string, choiceCount: number): PatternTrial {
  const shapeIdx = randomInt(0, SHAPES.length - 1);
  const colorIdx = randomInt(0, COLORS.length - 1);

  let grid: PatternCell[] = [];
  let correctShape: string;
  let correctColor: string;

  if (patternType === 'repeat') {
    // Simple repeating pattern: same shape/color in each row
    const rowShapes = [SHAPES[shapeIdx], SHAPES[(shapeIdx + 1) % SHAPES.length], SHAPES[(shapeIdx + 2) % SHAPES.length]];
    const rowColors = [COLORS[colorIdx], COLORS[(colorIdx + 1) % COLORS.length], COLORS[(colorIdx + 2) % COLORS.length]];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({ shape: rowShapes[r], color: rowColors[r], isMissing: false });
      }
    }
    correctShape = rowShapes[2];
    correctColor = rowColors[2];
  } else if (patternType === 'progression') {
    // Each row uses the same shape but progresses in color
    const shape = SHAPES[shapeIdx];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({
          shape,
          color: COLORS[(colorIdx + c) % COLORS.length],
          isMissing: false,
        });
      }
    }
    correctShape = shape;
    correctColor = COLORS[(colorIdx + 2) % COLORS.length];
  } else if (patternType === 'rotation') {
    // Shape changes along columns
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({
          shape: SHAPES[(shapeIdx + c) % SHAPES.length],
          color: COLORS[(colorIdx + r) % COLORS.length],
          isMissing: false,
        });
      }
    }
    correctShape = SHAPES[(shapeIdx + 2) % SHAPES.length];
    correctColor = COLORS[(colorIdx + 2) % COLORS.length];
  } else {
    // Combination: both shape and color change
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid.push({
          shape: SHAPES[(shapeIdx + r + c) % SHAPES.length],
          color: COLORS[(colorIdx + r) % COLORS.length],
          isMissing: false,
        });
      }
    }
    correctShape = SHAPES[(shapeIdx + 4) % SHAPES.length];
    correctColor = COLORS[(colorIdx + 2) % COLORS.length];
  }

  // Mark last cell as missing
  grid[8] = { ...grid[8], isMissing: true };

  // Generate choices
  const correctChoice = {
    id: `correct_${randomInt(0, 9999)}`,
    shape: correctShape,
    color: correctColor,
    isCorrect: true,
  };

  const distractors: typeof correctChoice[] = [];
  for (let i = 1; i < choiceCount; i++) {
    distractors.push({
      id: `dist_${i}_${randomInt(0, 9999)}`,
      shape: SHAPES[(shapeIdx + i + 3) % SHAPES.length],
      color: COLORS[(colorIdx + i + 1) % COLORS.length],
      isCorrect: false,
    });
  }

  return {
    grid,
    correctAnswer: { shape: correctShape, color: correctColor },
    choices: shuffle([correctChoice, ...distractors]),
  };
}

export default function PatternPuzzle({ ageGroup, stageMode, maxTrials: stageModeTrials, onStageComplete }: PatternPuzzleProps) {
  const session = useGameSession({ gameConfig: patternPuzzleConfig, ageGroup });

  const [phase, setPhase] = useState<Phase>('ready');
  const [trial, setTrial] = useState<PatternTrial | null>(null);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);

  const effectiveMaxTrials = stageModeTrials ?? patternPuzzleConfig.trial_count_range.max;
  const patternType = (session.difficulty.pattern_type as string) || 'repeat';
  const choiceCount = (session.difficulty.choice_count as number) || 3;

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= effectiveMaxTrials) {
      session.endSession('completed');
      return;
    }

    const newTrial = generatePatternTrial(patternType, choiceCount);
    setTrial(newTrial);
    setPhase('showing');

    session.startTrial(
      { pattern_type: patternType, choice_count: choiceCount },
      { correct: newTrial.correctAnswer },
    );
    session.presentStimulus();
  }, [session, effectiveMaxTrials, patternType, choiceCount]);

  const handleSelect = useCallback((choice: { id: string; shape: string; color: string; isCorrect: boolean }) => {
    if (phase !== 'showing' || !trial) return;

    const response: TrialResponse = {
      type: 'select',
      value: { selected: { shape: choice.shape, color: choice.color } },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);

    const isCorrect = choice.isCorrect;
    session.completeTrial(isCorrect, isCorrect ? null : 'selection');

    setFeedbackCorrect(isCorrect);
    setPhase('feedback');
  }, [phase, trial, session]);

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
    <GameShell gameName="パターンパズル" session={session}
               stageMode={stageMode} maxTrials={effectiveMaxTrials} onStageComplete={onStageComplete}>
      <div className="flex flex-col items-center w-full max-w-md">
        <p className="text-lg font-medium mb-4" style={{ color: 'var(--color-primary-dark)' }}>
          ？に はいるのは どれ？
        </p>

        {/* 3x3 Grid */}
        {trial && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {trial.grid.map((cell, i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-xl flex items-center justify-center border-2"
                  style={{
                    background: cell.isMissing ? 'var(--color-border-light)' : 'var(--color-surface)',
                    borderColor: cell.isMissing ? 'var(--color-primary)' : 'var(--color-border-light)',
                    borderStyle: cell.isMissing ? 'dashed' : 'solid',
                  }}
                >
                  {cell.isMissing ? (
                    <span className="text-2xl" style={{ color: 'var(--color-primary)' }}>？</span>
                  ) : (
                    <span className="text-3xl" style={{ color: cell.color }}>{cell.shape}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Choices */}
            <div className="flex gap-3 flex-wrap justify-center">
              {trial.choices.map(choice => (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice)}
                  disabled={phase !== 'showing'}
                  className="tap-target-large w-16 h-16 rounded-xl flex items-center justify-center
                    border-2 border-gray-200 hover:border-purple-500 active:scale-95 transition-all"
                  style={{ background: 'var(--color-surface)' }}
                >
                  <span className="text-2xl" style={{ color: choice.color }}>{choice.shape}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback isCorrect={feedbackCorrect} onComplete={handleFeedbackComplete} />
      )}
    </GameShell>
  );
}
