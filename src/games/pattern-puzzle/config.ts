import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * パターンパズル（推論 - Raven's CPM）
 *
 * Raven's Coloured Progressive Matrices:
 * - 3×3グリッドのパターン完成（欠損部分を選ぶ）
 * - DDA: パターン複雑度（単純繰返し → 回転 → 合成）, 選択肢数
 * - 測定: 正答率, 推論タイプ別正答率
 * 根拠: Raven (1938), Cotton et al. (2005)
 */
export const patternPuzzleConfig: GameConfig = {
  id: 'pattern-puzzle',
  name: 'パターンパズル',
  primary_domain: 'reasoning',
  secondary_domains: ['visuospatial', 'attention'],
  trial_count_range: { min: 8, max: 16 },
  stage_trial_count: { '3-5': 6, '6-9': 8, '10-15': 10 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
      {
        name: 'pattern_type',
        type: 'categorical',
        levels: ['repeat', 'progression', 'rotation', 'combination'],
        initial: 'repeat',
        direction: 'up_is_harder',
      },
      {
        name: 'choice_count',
        type: 'numeric',
        min: 3,
        max: 6,
        step: 1,
        initial: 3,
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { pattern_type: 'repeat', choice_count: 3 },
    '6-9': { pattern_type: 'repeat', choice_count: 4 },
    '10-15': { pattern_type: 'progression', choice_count: 4 },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 12 * 60 * 1000,
    inactivity_timeout_ms: 45_000,
  },
};
