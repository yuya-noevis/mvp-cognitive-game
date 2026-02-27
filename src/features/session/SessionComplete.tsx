'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { TrialResult } from './session-manager';

interface SessionCompleteProps {
  scoredResults: TrialResult[];
  streakStats: { totalCorrect: number; totalAttempts: number; accuracy: number };
  sessionDurationSec: number;
  onNextSession: () => void;
  onGoHome: () => void;
  dailyStats: { sessionCount: number; totalPlayTimeMin: number };
  canPlayMore: boolean;
}

function getStarCount(accuracy: number): number {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.7) return 2;
  return 1;
}

function getMessage(accuracy: number): string {
  if (accuracy >= 0.9) return 'すごい！かんぺき！';
  if (accuracy >= 0.7) return 'よくできたね！';
  if (accuracy >= 0.5) return 'がんばったね！';
  return 'いっしょに がんばろう！';
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0, rotate: -30 }}
          animate={i <= count
            ? { opacity: 1, scale: 1, rotate: 0 }
            : { opacity: 0.2, scale: 0.8, rotate: 0 }
          }
          transition={{ delay: 0.3 + i * 0.2, duration: 0.4, type: 'spring', stiffness: 200 }}
          className="text-4xl"
          style={{ color: i <= count ? '#FFD43B' : 'rgba(255, 255, 255, 0.15)' }}
        >
          ★
        </motion.div>
      ))}
    </div>
  );
}

export function SessionComplete({
  streakStats,
  onNextSession,
  onGoHome,
  dailyStats,
  canPlayMore,
}: SessionCompleteProps) {
  const starCount = getStarCount(streakStats.accuracy);
  const message = getMessage(streakStats.accuracy);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-space">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 max-w-sm w-full"
      >
        <Stars count={starCount} />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-2xl font-bold text-center"
          style={{ color: '#E8E8F0' }}
        >
          {message}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: 'rgba(255, 255, 255, 0.06)' }}
        >
          <span className="text-lg" style={{ color: '#B8B8D0' }}>
            {streakStats.totalCorrect} / {streakStats.totalAttempts} もん せいかい
          </span>
        </motion.div>

        {!canPlayMore && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="text-sm text-center"
            style={{ color: 'rgba(184, 184, 208, 0.7)' }}
          >
            きょうは {dailyStats.sessionCount}かい あそんだよ
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col gap-3 w-full mt-4"
        >
          {canPlayMore ? (
            <button
              onClick={onNextSession}
              className="w-full py-4 rounded-2xl text-lg font-bold transition-transform active:scale-95"
              style={{ background: '#6C3CE1', color: '#fff' }}
            >
              もういちど あそぶ
            </button>
          ) : (
            <p
              className="text-center text-sm py-2"
              style={{ color: 'rgba(184, 184, 208, 0.7)' }}
            >
              きょうは たくさん がんばったね！
            </p>
          )}

          <button
            onClick={onGoHome}
            className="w-full py-3 rounded-2xl text-base font-medium transition-transform active:scale-95"
            style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#B8B8D0' }}
          >
            おうちに もどる
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
