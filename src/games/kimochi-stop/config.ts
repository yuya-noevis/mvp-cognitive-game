import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * きもちストップ（情動調整 - Emotional Go/No-Go）
 *
 * Emotional Go/No-Go (Hare et al., 2008):
 * - 笑顔→タップ（Go）、怒り顔→我慢（No-Go）のブロック、後半で逆転
 * - DDA: 表示時間, 感情強度, Go/No-Go逆転頻度
 * - 測定: 感情別の抑制コスト（commission error率の差）
 * 根拠: Hare et al. (2008), Tottenham et al. (2011)
 */
export const kimochiStopConfig: GameConfig = {
  id: 'kimochi-stop',
  name: 'きもちストップ',
  primary_domain: 'emotion_regulation',
  secondary_domains: ['inhibition', 'social_cognition'],
  trial_count_range: { min: 16, max: 30 },
  stage_trial_count: { '3-5': 8, '6-9': 12, '10-15': 15 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
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
        name: 'block_switch_freq',
        type: 'numeric',
        min: 4,
        max: 8,
        step: 1,
        initial: 8,
        direction: 'down_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { display_duration_ms: 2500, block_switch_freq: 8 },
    '6-9': { display_duration_ms: 2000, block_switch_freq: 8 },
    '10-15': { display_duration_ms: 1500, block_switch_freq: 6 },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 10 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};
