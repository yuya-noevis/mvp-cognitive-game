import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
} from '@/lib/constants';

/**
 * つみあげタワー（計画・実行 - Tower of London）
 *
 * Tower of London (Shallice, 1982):
 * - 色付きブロックを目標配置に移動（最小手数で）
 * - DDA: 最小手数（2→3→4→5手）, 制約条件
 * - 測定: 初手潜時, 余分手数, 完了率
 * 根拠: Shallice (1982), Krikorian et al. (1994)
 */
export const tsumitageTowerConfig: GameConfig = {
  id: 'tsumitage-tower',
  name: 'つみあげタワー',
  primary_domain: 'planning',
  secondary_domains: ['working_memory', 'problem_solving'],
  trial_count_range: { min: 8, max: 15 },
  stage_trial_count: { '3-5': 6, '6-9': 8, '10-15': 10 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: 3,
    min_trials_before_adjust: 2,
    parameters: [
      {
        name: 'min_moves',
        type: 'numeric',
        min: 2,
        max: 5,
        step: 1,
        initial: 2,
        direction: 'up_is_harder',
      },
      {
        name: 'peg_count',
        type: 'numeric',
        min: 3,
        max: 3,
        step: 0,
        initial: 3,
        direction: 'up_is_harder',
      },
      {
        name: 'ball_count',
        type: 'numeric',
        min: 3,
        max: 4,
        step: 1,
        initial: 3,
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { min_moves: 2, ball_count: 3 },
    '6-9': { min_moves: 2, ball_count: 3 },
    '10-15': { min_moves: 3, ball_count: 3 },
  },
  safety: {
    consecutive_error_threshold: 2,
    max_session_duration_ms: 12 * 60 * 1000,
    inactivity_timeout_ms: 45_000,
  },
};
