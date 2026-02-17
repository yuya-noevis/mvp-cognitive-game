'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { GemIcon } from '@/components/icons';
import { oboeteNarabeteConfig } from './config';
import { nowMs, randomInt } from '@/lib/utils';

interface OboeteNarabeteProps {
  ageGroup: AgeGroup;
  maxTrials?: number;
}

type Phase = 'ready' | 'showing_sequence' | 'input' | 'feedback';

const GEM_COLORS = [
  'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400',
  'bg-yellow-400', 'bg-pink-400', 'bg-cyan-400', 'bg-orange-400', 'bg-teal-400',
];

function getGridDimension(gridSize: string): number {
  const [rows] = gridSize.split('x').map(Number);
  return rows || 3;
}

export default function OboeteNarabete({ ageGroup, maxTrials: maxTrialsProp }: OboeteNarabeteProps) {
  const session = useGameSession({
    gameConfig: oboeteNarabeteConfig,
    ageGroup,
  });

  const [phase, setPhase] = useState<Phase>('ready');
  const [gridDim, setGridDim] = useState(3);
  const [sequence, setSequence] = useState<number[]>([]);
  const [highlightedCell, setHighlightedCell] = useState<number | null>(null);
  const [inputSequence, setInputSequence] = useState<number[]>([]);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const maxTrials = maxTrialsProp ?? oboeteNarabeteConfig.trial_count_range.max;
  const seqLength = (session.difficulty.sequence_length as number) || 2;
  const displaySpeed = (session.difficulty.display_speed_ms as number) || 1000;
  const gridSize = (session.difficulty.grid_size as string) || '3x3';

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  // Generate a random sequence of cell indices
  const generateSequence = useCallback((length: number, gridTotal: number): number[] => {
    const seq: number[] = [];
    while (seq.length < length) {
      const cell = randomInt(0, gridTotal - 1);
      if (seq[seq.length - 1] !== cell) {
        seq.push(cell);
      }
    }
    return seq;
  }, []);

  // Show sequence animation
  const showSequence = useCallback((seq: number[], speed: number) => {
    setPhase('showing_sequence');
    let i = 0;

    const showNext = () => {
      if (i < seq.length) {
        setHighlightedCell(seq[i]);
        timerRef.current = setTimeout(() => {
          setHighlightedCell(null);
          i++;
          timerRef.current = setTimeout(showNext, 200); // Gap between highlights
        }, speed);
      } else {
        setHighlightedCell(null);
        setPhase('input');
        setInputSequence([]);
      }
    };

    timerRef.current = setTimeout(showNext, 500);
  }, []);

  // Start next trial
  const nextTrial = useCallback(() => {
    if (session.totalTrials >= maxTrials) {
      session.endSession('completed');
      return;
    }

    const dim = getGridDimension(gridSize);
    setGridDim(dim);
    const totalCells = dim * dim;
    const seq = generateSequence(seqLength, totalCells);
    setSequence(seq);

    session.startTrial(
      { sequence: seq, grid_size: gridSize, sequence_length: seqLength },
      { expected_sequence: seq },
    );
    session.presentStimulus();

    showSequence(seq, displaySpeed);
  }, [session, maxTrials, gridSize, seqLength, generateSequence, showSequence, displaySpeed]);

  // Handle cell tap during input phase
  const handleCellTap = useCallback((cellIndex: number) => {
    if (phase !== 'input') return;

    const newInput = [...inputSequence, cellIndex];
    setInputSequence(newInput);

    // Flash the cell
    setHighlightedCell(cellIndex);
    setTimeout(() => setHighlightedCell(null), 200);

    // Check if sequence is complete
    if (newInput.length === sequence.length) {
      const isCorrect = newInput.every((val, idx) => val === sequence[idx]);

      // Find first error position
      let errorType = null;
      if (!isCorrect) {
        const errorPos = newInput.findIndex((val, idx) => val !== sequence[idx]);
        errorType = 'position' as const;
      }

      const response: TrialResponse = {
        type: 'sequence',
        value: { input_sequence: newInput },
        timestamp_ms: nowMs(),
      };
      session.recordResponse(response);
      session.completeTrial(isCorrect, errorType);

      setFeedbackCorrect(isCorrect);
      setPhase('feedback');
    }
  }, [phase, inputSequence, sequence, session]);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackCorrect(null);
    setPhase('ready');
    setTimeout(nextTrial, 800);
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

  const totalCells = gridDim * gridDim;

  return (
    <GameShell gameName="おぼえてならべて" session={session} maxTrials={maxTrials}>
      {/* Instruction */}
      <div className="mb-4 text-center">
        <p className="text-lg font-medium" style={{ color: '#8B5CF6' }}>
          {phase === 'showing_sequence' ? 'よく みてね！' : phase === 'input' ? 'おなじ じゅんばんで タップ！' : ''}
        </p>
        {phase === 'input' && (
          <p className="text-sm text-gray-400 mt-1">
            {inputSequence.length} / {sequence.length}
          </p>
        )}
      </div>

      {/* Grid */}
      <div
        className="grid gap-3 w-full max-w-xs"
        style={{ gridTemplateColumns: `repeat(${gridDim}, 1fr)` }}
      >
        {Array.from({ length: totalCells }, (_, i) => (
          <button
            key={i}
            onClick={() => handleCellTap(i)}
            disabled={phase !== 'input'}
            className={`tap-target-large aspect-square rounded-2xl border-4 transition-all duration-200
              ${highlightedCell === i
                ? 'bg-amber-300 border-amber-500 scale-110'
                : 'bg-purple-900/20 border-purple-700/30'}
              ${phase === 'input' ? 'active:scale-95 cursor-pointer' : 'cursor-default'}`}
          >
            {highlightedCell === i && (
              <GemIcon size={28} className="text-amber-500" />
            )}
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
