'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tier } from '@/features/gating';

interface SessionProgressBarProps {
  progress: number;
  currentTrial: number;
  totalTrials: number;
  isWarmup: boolean;
  tier: Tier;
}

function DotIndicator({ currentTrial, totalTrials, isWarmup }: {
  currentTrial: number;
  totalTrials: number;
  isWarmup: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-2">
      <AnimatePresence>
        {isWarmup && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="text-xs mr-1"
            style={{ color: 'rgba(184, 184, 208, 0.6)' }}
          >
            れんしゅう
          </motion.span>
        )}
      </AnimatePresence>
      <div className="flex gap-1.5">
        {Array.from({ length: totalTrials }).map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              background: i < currentTrial
                ? (isWarmup ? 'rgba(184, 184, 208, 0.4)' : '#6C3CE1')
                : 'rgba(255, 255, 255, 0.12)',
            }}
            animate={i === currentTrial ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

function BarIndicator({ progress, currentTrial, totalTrials, isWarmup }: {
  progress: number;
  currentTrial: number;
  totalTrials: number;
  isWarmup: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <AnimatePresence>
        {isWarmup && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="text-xs whitespace-nowrap"
            style={{ color: 'rgba(184, 184, 208, 0.6)' }}
          >
            れんしゅう
          </motion.span>
        )}
      </AnimatePresence>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: isWarmup
              ? 'rgba(184, 184, 208, 0.3)'
              : 'linear-gradient(90deg, #6C3CE1, #8B5CF6)',
          }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs tabular-nums whitespace-nowrap" style={{ color: '#B8B8D0' }}>
        {currentTrial}/{totalTrials}
      </span>
    </div>
  );
}

export function SessionProgressBar({ progress, currentTrial, totalTrials, isWarmup, tier }: SessionProgressBarProps) {
  if (tier === 1) {
    return <DotIndicator currentTrial={currentTrial} totalTrials={totalTrials} isWarmup={isWarmup} />;
  }
  return <BarIndicator progress={progress} currentTrial={currentTrial} totalTrials={totalTrials} isWarmup={isWarmup} />;
}

export function WarmupStartBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -20] }}
        transition={{ duration: 1.2, times: [0, 0.2, 0.7, 1] }}
        className="text-3xl font-bold"
        style={{ color: '#FFD43B' }}
      >
        スタート！
      </motion.div>
    </motion.div>
  );
}
