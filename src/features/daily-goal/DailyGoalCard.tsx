'use client';

/**
 * DailyGoalCard — ホーム画面に表示する「きょうのめあて」カード
 *
 * 3段階のゴール選択 + 進捗表示。
 * ゴール達成時にはMoguraが喜ぶ。
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Mogura from '@/components/mascot/Mogura';
import {
  loadDailyGoal,
  setDailyGoalLevel,
  GOAL_OPTIONS,
  type DailyGoalData,
  type GoalLevel,
} from './useDailyGoal';

export function DailyGoalCard() {
  const [goal, setGoal] = useState<DailyGoalData | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    setGoal(loadDailyGoal());
  }, []);

  const handleSelectLevel = useCallback((level: GoalLevel) => {
    const updated = setDailyGoalLevel(level);
    setGoal(updated);
    setShowSelector(false);
  }, []);

  if (!goal) return null;

  const isAchieved = goal.completed >= goal.target;
  const progress = Math.min(goal.completed / goal.target, 1);
  const currentOption = GOAL_OPTIONS.find(o => o.level === goal.level);

  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{ background: 'rgba(255, 255, 255, 0.08)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium" style={{ color: 'rgba(184, 184, 208, 0.6)' }}>
          きょうの めあて
        </span>
        <button
          type="button"
          onClick={() => setShowSelector(!showSelector)}
          className="text-xs tap-interactive px-2 py-0.5 rounded-full"
          style={{
            color: '#6C3CE1',
            background: 'rgba(108, 60, 225, 0.15)',
          }}
          aria-label="めあてを変更する"
        >
          かえる
        </button>
      </div>

      {/* Goal selector (expandable) */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-2"
          >
            <div className="flex gap-2">
              {GOAL_OPTIONS.map((opt) => {
                const isSelected = goal.level === opt.level;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => handleSelectLevel(opt.level)}
                    className="flex-1 flex flex-col items-center py-2 rounded-xl tap-interactive transition-colors"
                    style={{
                      background: isSelected ? 'rgba(108, 60, 225, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? '1.5px solid rgba(108, 60, 225, 0.5)' : '1.5px solid transparent',
                    }}
                    aria-pressed={isSelected}
                    aria-label={`${opt.label}（${opt.target}ゲーム）`}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    <span className="text-[10px] text-stardust mt-0.5">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current goal + progress */}
      <div className="flex items-center gap-3">
        {/* Mogura reaction */}
        <div className="flex-shrink-0">
          <Mogura
            expression={isAchieved ? 'excited' : goal.completed > 0 ? 'happy' : 'encouraging'}
            size={36}
          />
        </div>

        {/* Progress info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm text-stardust">
              {currentOption?.emoji} {currentOption?.label}
            </span>
            <span className="text-xs text-moon">
              {goal.completed}/{goal.target}
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.1)' }}
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`きょうのめあて: ${goal.completed}/${goal.target}ゲーム`}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isAchieved
                  ? 'linear-gradient(90deg, #2ED573 0%, #FFD43B 100%)'
                  : 'linear-gradient(90deg, #6C3CE1 0%, #8B5CF6 100%)',
              }}
              initial={false}
              animate={{ width: `${Math.max(progress * 100, 3)}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
          </div>
        </div>
      </div>

      {/* Achievement message */}
      <AnimatePresence>
        {isAchieved && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold text-center mt-2"
            style={{ color: '#FFD43B' }}
          >
            めあて たっせい! すごいね!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
