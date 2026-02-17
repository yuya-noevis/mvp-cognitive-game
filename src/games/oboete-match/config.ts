import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * おぼえてマッチ（記憶 - CANTAB DMS）
 *
 * Delayed Matching to Sample (Sahakian et al., 1988):
 * - 刺激を見せる → 遅延期間 → 複数選択肢から同じものを選ぶ
 * - DDA: 遅延時間（0/4/8/12秒）, 選択肢数（2→4→6）
 * - 測定: 正答率, 遅延効果, 類似刺激の弁別力
 */
export const oboeteMatchConfig: GameConfig = {
  id: 'oboete-match',
  name: 'おぼえてマッチ',
  primary_domain: 'memory',
  secondary_domains: ['attention', 'visuospatial'],
  trial_count_range: { min: 12, max: 24 },
  stage_trial_count: { '3-5': 8, '6-9': 10, '10-15': 12 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
      {
        name: 'delay_ms',
        type: 'categorical',
        levels: [0, 4000, 8000, 12000],
        initial: 0,
        direction: 'up_is_harder',
      },
      {
        name: 'choice_count',
        type: 'numeric',
        min: 2,
        max: 6,
        step: 1,
        initial: 2,
        direction: 'up_is_harder',
      },
      {
        name: 'similarity',
        type: 'categorical',
        levels: ['low', 'mid', 'high'],
        initial: 'low',
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { delay_ms: 0, choice_count: 2, similarity: 'low' },
    '6-9': { delay_ms: 4000, choice_count: 3, similarity: 'low' },
    '10-15': { delay_ms: 4000, choice_count: 4, similarity: 'mid' },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 10 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};
