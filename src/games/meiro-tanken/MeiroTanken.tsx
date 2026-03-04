'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { AgeGroup, TrialResponse } from '@/types';
import { GameShell } from '@/features/game-engine/GameShell';
import { useGameSession } from '@/features/game-engine/hooks/useGameSession';
import { TrialFeedback } from '@/components/feedback/TrialFeedback';
import { FlagIcon } from '@/components/icons';
import { meiroTankenConfig } from './config';
import { nowMs, randomInt } from '@/lib/utils';
import { detectNearMiss, type NearMissResult, NOT_NEAR_MISS } from '@/features/near-miss';

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
  const [nearMissResult, setNearMissResult] = useState<NearMissResult>(NOT_NEAR_MISS);
  const startTimeRef = useRef(0);
  const mazeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    setNearMissResult(NOT_NEAR_MISS);
    setPhase('playing');
    startTimeRef.current = nowMs();

    session.startTrial(
      { maze_size: mazeSize },
      { goal: { row: mazeSize - 1, col: mazeSize - 1 } },
    );
    session.presentStimulus();

    // めいろのタイムアウト（30秒）
    if (mazeTimeoutRef.current) clearTimeout(mazeTimeoutRef.current);
    mazeTimeoutRef.current = setTimeout(() => {
      handleMazeTimeout(newMaze, mazeSize);
    }, 30_000);
  }, [session, effectiveMaxTrials, mazeSize]);

  // めいろタイムアウト時のニアミス判定
  const handleMazeTimeout = useCallback((currentMaze: CellType[][], currentMazeSize: number) => {
    if (phase !== 'playing') return;

    const response: TrialResponse = {
      type: 'timeout',
      value: { timed_out: true, path_length: path.length, errors },
      timestamp_ms: nowMs(),
    };
    session.recordResponse(response);
    session.completeTrial(false, 'omission');

    // ニアミス判定: ゴールまでの距離で判定
    const goalRow = currentMazeSize - 1;
    const goalCol = currentMazeSize - 1;
    const nmResult = detectNearMiss({
      gameId: 'meiro-tanken',
      correctAnswer: { goal: { row: goalRow, col: goalCol } },
      userResponse: {},
      errorType: 'omission',
      extra: {
        playerPosition: playerPos,
        goalPosition: { row: goalRow, col: goalCol },
        mazeSize: currentMazeSize,
      },
    });

    setNearMissResult(nmResult);
    setFeedbackCorrect(false);
    setPhase('feedback');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, playerPos, path, errors, session]);

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
      if (mazeTimeoutRef.current) clearTimeout(mazeTimeoutRef.current);
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
    setNearMissResult(NOT_NEAR_MISS);
    setPhase('ready');
    setTimeout(nextTrial, session.getITIMs());
  }, [nextTrial, session]);

  useEffect(() => {
    if (session.sessionId && phase === 'ready' && session.totalTrials === 0) {
      nextTrial();
    }
  }, [session.sessionId, phase, session.totalTrials, nextTrial]);

  // Cleanup maze timeout on unmount
  useEffect(() => {
    return () => {
      if (mazeTimeoutRef.current) clearTimeout(mazeTimeoutRef.current);
    };
  }, []);

  return (
    <GameShell gameName="めいろたんけん" session={session}
               stageMode={stageMode} maxTrials={effectiveMaxTrials} onStageComplete={onStageComplete}>
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <p className="text-lg font-medium mb-3" style={{ color: 'var(--color-primary-dark)' }}>
          ゴールまで すすもう！
        </p>

        {/* Maze grid */}
        <div className="grid gap-1 w-full"
             style={{ gridTemplateColumns: `repeat(${mazeSize}, 1fr)` }}>
          {maze.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = playerPos.row === r && playerPos.col === c;
              const isVisited = path.includes(`${r},${c}`);

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellTap(r, c)}
                  disabled={phase !== 'playing'}
                  className="aspect-square rounded-lg flex items-center justify-center transition-all active:scale-90"
                  style={{
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
                    <span className="inline-block rounded-full w-1/2 h-1/2" style={{ background: 'white' }} />
                  )}
                  {!isPlayer && cell === 'start' && !isVisited && (
                    <span className="text-xs font-bold" style={{ color: 'var(--color-primary-dark)' }}>S</span>
                  )}
                  {!isPlayer && cell === 'goal' && (
                    <FlagIcon size={20} style={{ color: '#4ECDC4' }} />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {feedbackCorrect !== null && (
        <TrialFeedback
          isCorrect={feedbackCorrect}
          isNearMiss={nearMissResult.isNearMiss}
          nearMissMessage={nearMissResult.message}
          onComplete={handleFeedbackComplete}
        />
      )}
    </GameShell>
  );
}
