'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { ColorDotIcon } from '@/components/icons';
import { tsumitageTowerConfig } from './config';
import { nowMs, randomInt } from '@/lib/utils';

interface TsumitageTowerProps {
  ageGroup: AgeGroup;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

type Phase = 'ready' | 'playing' | 'feedback';

const BALL_COLORS = ['#EF4444', '#3B82F6', '#22C55E', '#F59E0B'];

// Peg capacities: [3, 2, 1] for classic Tower of London
const PEG_CAPACITIES = [3, 2, 1];

type PegState = number[][]; // pegs[pegIndex] = array of ball indices (bottom to top)

interface Puzzle {
  initial: PegState;
  goal: PegState;
  minMoves: number;
}

// Pre-defined puzzles by difficulty (min moves)
function generatePuzzle(minMoves: number, ballCount: number): Puzzle {
  // Simple puzzle generation for 3 balls, 3 pegs
  const puzzles2: Puzzle[] = [
    { initial: [[0, 1, 2], [], []], goal: [[0, 1], [2], []], minMoves: 2 },
    { initial: [[0, 1, 2], [], []], goal: [[0], [1, 2], []], minMoves: 2 },
  ];

  const puzzles3: Puzzle[] = [
    { initial: [[0, 1, 2], [], []], goal: [[2], [0, 1], []], minMoves: 3 },
    { initial: [[0, 1, 2], [], []], goal: [[], [0, 2], [1]], minMoves: 3 },
  ];

  const puzzles4: Puzzle[] = [
    { initial: [[0, 1, 2], [], []], goal: [[], [0], [1, 2]], minMoves: 4 },
    { initial: [[0, 1, 2], [], []], goal: [[1], [], [0, 2]], minMoves: 4 },
  ];

  const puzzles5: Puzzle[] = [
    { initial: [[0, 1, 2], [], []], goal: [[], [], [0, 1, 2]], minMoves: 5 },
    { initial: [[0, 1, 2], [], []], goal: [[2], [1], [0]], minMoves: 5 },
  ];

  const pool = minMoves <= 2 ? puzzles2 : minMoves === 3 ? puzzles3 : minMoves === 4 ? puzzles4 : puzzles5;
  return pool[randomInt(0, pool.length - 1)];
}

export default function TsumitageTower({ ageGroup, stageMode, maxTrials: stageModeTrials, onStageComplete }: TsumitageTowerProps) {
  const session = useGameSession({ gameConfig: tsumitageTowerConfig, ageGroup });

  const [phase, setPhase] = useState<Phase>('ready');
  const [pegs, setPegs] = useState<PegState>([[], [], []]);
  const [goal, setGoal] = useState<PegState>([[], [], []]);
  const [minMoves, setMinMoves] = useState(2);
  const [moveCount, setMoveCount] = useState(0);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const startTimeRef = useRef(0);

  const effectiveMaxTrials = stageModeTrials ?? tsumitageTowerConfig.trial_count_range.max;
  const diffMinMoves = (session.difficulty.min_moves as number) || 2;
  const ballCount = (session.difficulty.ball_count as number) || 3;

  const isGoalReached = useCallback((current: PegState, goalState: PegState): boolean => {
    return goalState.every((goalPeg, i) =>
      goalPeg.length === current[i].length &&
      goalPeg.every((ball, j) => ball === current[i][j])
    );
  }, []);

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= effectiveMaxTrials) {
      session.endSession('completed');
      return;
    }

    const puzzle = generatePuzzle(diffMinMoves, ballCount);
    setPegs(puzzle.initial.map(p => [...p]));
    setGoal(puzzle.goal);
    setMinMoves(puzzle.minMoves);
    setMoveCount(0);
    setSelectedPeg(null);
    setPhase('playing');
    startTimeRef.current = nowMs();

    session.startTrial(
      { initial: puzzle.initial, goal: puzzle.goal, min_moves: puzzle.minMoves },
      { min_moves: puzzle.minMoves },
    );
    session.presentStimulus();
  }, [session, effectiveMaxTrials, diffMinMoves, ballCount]);

  const handlePegTap = useCallback((pegIndex: number) => {
    if (phase !== 'playing') return;

    if (selectedPeg === null) {
      // Select source peg (must have balls)
      if (pegs[pegIndex].length > 0) {
        setSelectedPeg(pegIndex);
      }
    } else {
      // Deselect if same peg
      if (selectedPeg === pegIndex) {
        setSelectedPeg(null);
        return;
      }

      // Move ball from selectedPeg to pegIndex
      const sourcePeg = [...pegs[selectedPeg]];
      const targetPeg = [...pegs[pegIndex]];

      // Check capacity
      if (targetPeg.length >= PEG_CAPACITIES[pegIndex]) {
        setSelectedPeg(null);
        return;
      }

      const ball = sourcePeg.pop()!;
      targetPeg.push(ball);

      const newPegs = pegs.map((p, i) => {
        if (i === selectedPeg) return sourcePeg;
        if (i === pegIndex) return targetPeg;
        return [...p];
      });

      setPegs(newPegs);
      setMoveCount(prev => prev + 1);
      setSelectedPeg(null);

      // Check if goal is reached
      if (isGoalReached(newPegs, goal)) {
        const isOptimal = moveCount + 1 <= minMoves;
        const response: TrialResponse = {
          type: 'sequence',
          value: { moves: moveCount + 1, min_moves: minMoves, optimal: isOptimal },
          timestamp_ms: nowMs(),
        };
        session.recordResponse(response);
        session.completeTrial(true, null);
        setFeedbackCorrect(true);
        setPhase('feedback');
      }
    }
  }, [phase, selectedPeg, pegs, goal, moveCount, minMoves, session, isGoalReached]);

  // Give up after too many moves
  useEffect(() => {
    if (phase === 'playing' && moveCount > minMoves * 3) {
      const response: TrialResponse = {
        type: 'sequence',
        value: { moves: moveCount, min_moves: minMoves, gave_up: true },
        timestamp_ms: nowMs(),
      };
      session.recordResponse(response);
      session.completeTrial(false, null);
      setFeedbackCorrect(false);
      setPhase('feedback');
    }
  }, [moveCount, minMoves, phase, session]);

  const handleFeedbackComplete = useCallback(() => {
    setFeedbackCorrect(null);
    setPhase('ready');
    setTimeout(nextTrial, 800);
  }, [nextTrial]);

  useEffect(() => {
    if (session.sessionId && phase === 'ready' && session.totalTrials === 0) {
      nextTrial();
    }
  }, [session.sessionId, phase, session.totalTrials, nextTrial]);

  return (
    <GameShell gameName="つみあげタワー" session={session}
               stageMode={stageMode} maxTrials={effectiveMaxTrials} onStageComplete={onStageComplete}>
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Goal display */}
        <div className="mb-4 text-center">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
            めざすかたち
          </p>
          <div className="flex justify-center gap-4">
            {goal.map((peg, i) => (
              <div key={`goal-${i}`} className="flex flex-col-reverse items-center">
                {peg.map((ball, j) => (
                  <ColorDotIcon key={j} color={BALL_COLORS[ball]} size={20} />
                ))}
                <div className="w-8 h-1 rounded mt-1" style={{ background: 'var(--color-border-light)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Instruction */}
        <p className="text-base font-medium mb-4" style={{ color: 'var(--color-primary-dark)' }}>
          {selectedPeg !== null ? 'どこに おく？' : 'うごかす ボールを えらんで！'}
        </p>

        {/* Move counter */}
        <div className="mb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {moveCount}てめ（さいしょう: {minMoves}）
        </div>

        {/* Current pegs */}
        <div className="flex justify-center gap-6">
          {pegs.map((peg, i) => (
            <button
              key={`peg-${i}`}
              onClick={() => handlePegTap(i)}
              disabled={phase !== 'playing'}
              className={`flex flex-col-reverse items-center justify-end
                w-20 rounded-2xl p-2 transition-all active:scale-95
                ${selectedPeg === i ? 'ring-4 ring-indigo-400' : ''}
                ${phase === 'playing' ? 'cursor-pointer' : 'cursor-default'}`}
              style={{
                background: selectedPeg === i ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                minHeight: `${PEG_CAPACITIES[i] * 40 + 20}px`,
                border: '2px solid var(--color-border-light)',
              }}
            >
              {peg.map((ball, j) => (
                <ColorDotIcon key={j} color={BALL_COLORS[ball]} size={32} />
              ))}
              <div className="w-12 h-2 rounded-full mt-auto"
                   style={{ background: 'var(--color-border-light)' }} />
            </button>
          ))}
        </div>
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback isCorrect={feedbackCorrect} onComplete={handleFeedbackComplete} />
      )}
    </GameShell>
  );
}
