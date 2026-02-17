import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * タッチでGO!（運動スキル - Fitts' Law）
 *
 * Fitts' Law pointing task (Fitts, 1954):
 * - 画面に出現するターゲットをすばやく正確にタップ
 * - DDA: ターゲットサイズ（大→小）, ターゲット間距離, 時間制限
 * - 測定: スループット（bits/s）, エラー率, 速度-正確性トレードオフ
 *
 * Index of Difficulty (ID) = log2(2D/W)
 * where D = distance, W = target width
 *
 * 根拠: Fitts (1954), Accot & Zhai (2003)
 */
export const touchDeGoConfig: GameConfig = {
  id: 'touch-de-go',
  name: 'タッチでGO!',
  primary_domain: 'motor_skills',
  secondary_domains: ['processing_speed', 'attention'],
  trial_count_range: { min: 15, max: 30 },
  stage_trial_count: { '3-5': 10, '6-9': 15, '10-15': 20 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
      {
        name: 'target_size_px',
        type: 'numeric',
        min: 40,
        max: 100,
        step: 10,
        initial: 100,
        direction: 'down_is_harder',
      },
      {
        name: 'time_limit_ms',
        type: 'numeric',
        min: 1500,
        max: 4000,
        step: 500,
        initial: 4000,
        direction: 'down_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { target_size_px: 100, time_limit_ms: 4000 },
    '6-9': { target_size_px: 80, time_limit_ms: 3000 },
    '10-15': { target_size_px: 60, time_limit_ms: 2500 },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 8 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};
