'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { FlagIcon } from '@/components/icons';
import { meiroTankenConfig } from './config';
import { nowMs, randomInt } from '@/lib/utils';

interface MeiroTankenProps {
  ageGroup: AgeGroup;
  stageMode?: boolean;
  maxTrials?: number;
  onStageComplete?: (accuracy: number) => void;
}

type Phase = 'ready' | 'playing' | 'feedback';
type CellType = 'path' | 'wall' | 'start' | 'goal';

interface MazeCell {
  type: CellType;
  row: number;
  col: number;
}

/**
 * Simple maze generation using recursive backtracking
 */
function generateMaze(size: number): CellType[][] {
  // Initialize all as walls
  const grid: CellType[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 'wall' as CellType)
  );

  // Carve paths using simple pattern for small grids
  // Start at top-left, goal at bottom-right
  grid[0][0] = 'start';
  grid[size - 1][size - 1] = 'goal';

  // Create a guaranteed path
  let r = 0, c = 0;
  const visited = new Set<string>();
  visited.add(`${r},${c}`);

  while (r !== size - 1 || c !== size - 1) {
    // Prefer moving right and down
    const moveDown = r < size - 1;
    const moveRight = c < size - 1;

    if (moveDown && moveRight) {
      if (Math.random() < 0.5) {
        r++;
      } else {
        c++;
      }
    } else if (moveDown) {
      r++;
    } else {
      c++;
    }

    if (grid[r][c] === 'wall') {
      grid[r][c] = 'path';
    }
    visited.add(`${r},${c}`);
  }

  grid[size - 1][size - 1] = 'goal';

  // Add some extra paths for exploration
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === 'wall' && Math.random() < 0.3) {
        // Check if adjacent to a path
        const hasAdjacentPath = [
          [i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]
        ].some(([nr, nc]) =>
          nr >= 0 && nr < size && nc >= 0 && nc < size &&
          grid[nr][nc] !== 'wall'
        );

        if (hasAdjacentPath) {
          grid[i][j] = 'path';
        }
      }
    }
  }

  return grid;
}

export default function MeiroTanken({ ageGroup, stageMode, maxTrials: stageModeTrials, onStageComplete }: MeiroTankenProps) {
  const session = useGameSession({ gameConfig: meiroTankenConfig, ageGroup });

  const [phase, setPhase] = useState<Phase>('ready');
  const [maze, setMaze] = useState<CellType[][]>([]);
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });
  const [path, setPath] = useState<string[]>([]);
  const [errors, setErrors] = useState(0);
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const startTimeRef = useRef(0);

  const effectiveMaxTrials = stageModeTrials ?? meiroTankenConfig.trial_count_range.max;
  const mazeSize = (session.difficulty.maze_size as number) || 3;

  const nextTrial = useCallback(() => {
    if (session.totalTrials >= effectiveMaxTrials) {
      session.endSession('completed');
      return;
    }

    const newMaze = generateMaze(mazeSize);
    setMaze(newMaze);
    setPlayerPos({ row: 0, col: 0 });
    setPath(['0,0']);
    setErrors(0);
    setPhase('playing');
    startTimeRef.current = nowMs();

    session.startTrial(
      { maze_size: mazeSize },
      { goal: { row: mazeSize - 1, col: mazeSize - 1 } },
    );
    session.presentStimulus();
  }, [session, effectiveMaxTrials, mazeSize]);

  const handleCellTap = useCallback((row: number, col: number) => {
    if (phase !== 'playing') return;

    // Must be adjacent to current position
    const dr = Math.abs(row - playerPos.row);
    const dc = Math.abs(col - playerPos.col);
    if (dr + dc !== 1) return;

    // Must be path or goal
    if (maze[row][col] === 'wall') {
      setErrors(prev => prev + 1);
      return;
    }

    setPlayerPos({ row, col });
    setPath(prev => [...prev, `${row},${col}`]);

    // Check if reached goal
    if (maze[row][col] === 'goal') {
      const totalTime = nowMs() - startTimeRef.current;
      const response: TrialResponse = {
        type: 'sequence',
        value: { path_length: path.length + 1, errors, time_ms: totalTime },
        timestamp_ms: nowMs(),
      };
      session.recordResponse(response);
      session.completeTrial(true, null);
      setFeedbackCorrect(true);
      setPhase('feedback');
    }
  }, [phase, playerPos, maze, path, errors, session]);

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

  const cellSize = Math.min(280 / mazeSize, 80);

  return (
    <GameShell gameName="めいろたんけん" session={session}
               stageMode={stageMode} maxTrials={effectiveMaxTrials} onStageComplete={onStageComplete}>
      <div className="flex flex-col items-center w-full max-w-md">
        <p className="text-lg font-medium mb-4" style={{ color: 'var(--color-primary-dark)' }}>
          ゴールまで すすもう！
        </p>

        {/* Maze grid */}
        <div className="grid gap-1"
             style={{ gridTemplateColumns: `repeat(${mazeSize}, ${cellSize}px)` }}>
          {maze.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = playerPos.row === r && playerPos.col === c;
              const isVisited = path.includes(`${r},${c}`);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellTap(r, c)}
                  disabled={phase !== 'playing'}
                  className="rounded-lg flex items-center justify-center transition-all active:scale-90"
                  style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    background: cell === 'wall'
                      ? 'var(--color-text-muted)'
                      : isPlayer
                        ? 'var(--color-primary)'
                        : isVisited
                          ? 'var(--color-primary-bg)'
                          : cell === 'goal'
                            ? 'var(--color-success-bg)'
                            : 'var(--color-surface)',
                    border: `2px solid ${cell === 'wall' ? 'var(--color-text-muted)' : 'var(--color-border-light)'}`,
                  }}
                >
                  {isPlayer && (
                    <span className="inline-block rounded-full"
                      style={{ width: `${cellSize * 0.5}px`, height: `${cellSize * 0.5}px`, background: 'white' }} />
                  )}
                  {!isPlayer && cell === 'start' && !isVisited && (
                    <span className="text-xs font-bold" style={{ color: 'var(--color-primary-dark)' }}>S</span>
                  )}
                  {!isPlayer && cell === 'goal' && (
                    <FlagIcon size={Math.max(cellSize * 0.5, 16)} style={{ color: '#4ECDC4' }} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback isCorrect={feedbackCorrect} onComplete={handleFeedbackComplete} />
      )}
    </GameShell>
  );
}
