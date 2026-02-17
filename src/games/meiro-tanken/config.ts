import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
} from '@/lib/constants';

/**
 * めいろたんけん（問題解決 - Maze Navigation）
 *
 * Porteus Maze Test (Porteus, 1965) + CANTAB SOC:
 * - シンプルな迷路をゴールまでタップで移動
 * - DDA: 迷路サイズ（3×3→5×5→7×7）, 分岐数, デッドエンド数
 * - 測定: 完了時間, エラー数（行き止まり接触）, 効率（最短経路比）
 * 根拠: Porteus (1965), Kirsch et al. (2006)
 */
export const meiroTankenConfig: GameConfig = {
  id: 'meiro-tanken',
  name: 'めいろたんけん',
  primary_domain: 'problem_solving',
  secondary_domains: ['planning', 'visuospatial'],
  trial_count_range: { min: 6, max: 12 },
  stage_trial_count: { '3-5': 4, '6-9': 6, '10-15': 8 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: 3,
    min_trials_before_adjust: 2,
    parameters: [
      {
        name: 'maze_size',
        type: 'categorical',
        levels: [3, 5, 7],
        initial: 3,
        direction: 'up_is_harder',
      },
      {
        name: 'dead_ends',
        type: 'numeric',
        min: 0,
        max: 4,
        step: 1,
        initial: 0,
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { maze_size: 3, dead_ends: 0 },
    '6-9': { maze_size: 3, dead_ends: 1 },
    '10-15': { maze_size: 5, dead_ends: 2 },
  },
  safety: {
    consecutive_error_threshold: 2,
    max_session_duration_ms: 12 * 60 * 1000,
    inactivity_timeout_ms: 45_000,
  },
};
