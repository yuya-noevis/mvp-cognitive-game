import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * はやわざタッチ（処理速度）
 *
 * SRT（単純反応時間）→ CRT（選択反応時間）で処理速度を計測。
 *
 * 安全策：
 * - 年齢別の反応窓（3-5歳: 3000ms, 6-9歳: 2500ms, 10-15歳: 2000ms）
 * - 「速さ」を子どもに可視化しない（保護者レポートのみ）
 * - 無制限モード設定あり
 */
/**
 * はやわざタッチ（処理速度 - Hick-Hyman法則準拠）
 *
 * 選択肢数を段階的に増加（1→2→4）してHick-Hyman法則検証:
 * RT = a + b * log2(n) where n = 選択肢数
 * SRT→CRT移行で情報処理効率を測定
 * 根拠: Hick (1952), Hyman (1953), Deary et al. (2001)
 */
export const hayawazaTouchConfig: GameConfig = {
  id: 'hayawaza-touch',
  name: 'はやわざタッチ',
  primary_domain: 'processing_speed',
  secondary_domains: ['attention', 'inhibition'],
  trial_count_range: { min: 20, max: 40 },
  stage_trial_count: { '3-5': 10, '6-9': 15, '10-15': 20 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
      {
        name: 'mode',
        type: 'categorical',
        levels: ['srt', 'crt'],
        initial: 'srt',
        direction: 'up_is_harder',
      },
      {
        name: 'target_count',
        type: 'categorical',
        levels: [1, 2, 4],
        initial: 1,
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { mode: 'srt', target_count: 1 },
    '6-9': { mode: 'srt', target_count: 1 },
    '10-15': { mode: 'srt', target_count: 1 },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 8 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};
