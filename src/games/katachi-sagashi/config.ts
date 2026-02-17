import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * かたちさがし（視覚・視空間 + 知覚処理）
 *
 * 見本と同じ形を選択肢から見つける。
 * 回転マッチングで空間認知力を測定・訓練。
 */
/**
 * かたちさがし（視空間 - Shepard & Metzler準拠 Mental Rotation）
 *
 * 回転角度を0°/45°/90°/135°/180°に標準化
 * 鏡像刺激を50%混入（弁別力向上）
 * 根拠: Shepard & Metzler (1971), Frick et al. (2013)
 */
export const katachiSagashiConfig: GameConfig = {
  id: 'katachi-sagashi',
  name: 'かたちさがし',
  primary_domain: 'visuospatial',
  secondary_domains: ['attention'],
  trial_count_range: { min: 15, max: 20 },
  stage_trial_count: { '3-5': 8, '6-9': 10, '10-15': 12 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
      {
        name: 'choice_count',
        type: 'numeric',
        min: 2,
        max: 5,
        step: 1,
        initial: 2,
        direction: 'up_is_harder',
      },
      {
        name: 'distractor_similarity',
        type: 'categorical',
        levels: ['low', 'mid', 'high'],
        initial: 'low',
        direction: 'up_is_harder',
      },
      {
        name: 'rotation_degrees',
        type: 'categorical',
        levels: [0, 45, 90, 135, 180],
        initial: 0,
        direction: 'up_is_harder',
      },
      {
        name: 'mirror_ratio',
        type: 'numeric',
        min: 0,
        max: 0.5,
        step: 0.1,
        initial: 0,
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { choice_count: 2, rotation_degrees: 0, mirror_ratio: 0 },
    '6-9': { choice_count: 3, rotation_degrees: 45, mirror_ratio: 0.2 },
    '10-15': { choice_count: 3, rotation_degrees: 90, mirror_ratio: 0.5 },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 10 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};
