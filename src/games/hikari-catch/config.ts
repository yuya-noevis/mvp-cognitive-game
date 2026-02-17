import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * ひかりキャッチ（注意 - Sustained/Selective Attention）
 *
 * CPT（Continuous Performance Test）のゲーム化。
 * ターゲット（光る生き物）をタップし、非ターゲットを避ける。
 */
/**
 * ひかりキャッチ（注意 - CPT-3準拠に強化）
 *
 * Conners CPT-3 (2014) 準拠:
 * - ISI（刺激間間隔）を1000/2000/4000msの3条件に
 * - ターゲット出現率を20%に固定（CPT標準のGo率）
 * - d'（感度指標）計算用のHit/FA記録
 */
export const hikariCatchConfig: GameConfig = {
  id: 'hikari-catch',
  name: 'ひかりキャッチ',
  primary_domain: 'attention',
  secondary_domains: ['processing_speed', 'inhibition'],
  trial_count_range: { min: 20, max: 30 },
  stage_trial_count: { '3-5': 10, '6-9': 12, '10-15': 16 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
      {
        name: 'distractor_count',
        type: 'numeric',
        min: 0,
        max: 3,
        step: 1,
        initial: 0,
        direction: 'up_is_harder',
      },
      {
        name: 'display_duration_ms',
        type: 'numeric',
        min: 800,
        max: 2000,
        step: 200,
        initial: 2000,
        direction: 'down_is_harder',
      },
      {
        name: 'similarity',
        type: 'categorical',
        levels: ['low', 'mid', 'high'],
        initial: 'low',
        direction: 'up_is_harder',
      },
      {
        name: 'isi_ms',
        type: 'categorical',
        levels: [4000, 2000, 1000],
        initial: 4000,
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { display_duration_ms: 2500, distractor_count: 0, isi_ms: 4000 },
    '6-9': { display_duration_ms: 2000, distractor_count: 0, isi_ms: 2000 },
    '10-15': { display_duration_ms: 1500, distractor_count: 1, isi_ms: 2000 },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 10 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};

/** CPT-3標準: ターゲット出現率 */
export const CPT_TARGET_RATE = 0.20;
