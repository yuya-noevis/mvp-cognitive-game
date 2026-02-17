import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * いろかえスイッチ（認知的柔軟性）
 *
 * DCCS（Dimensional Change Card Sort）のゲーム化。
 * カードを「色」→「形」にルール切り替え。Perseverative Errorを測定。
 */
/**
 * いろかえスイッチ（認知的柔軟性 - DCCS境界条件追加）
 *
 * Zelazo (2006) DCCS 3段階構造:
 * - プレスイッチ（1ルールのみ）
 * - ポストスイッチ（ルール切替）
 * - 境界条件（両方の次元を統合）
 * - 切替コスト測定（switch trial vs repeat trial のRT差）
 * 根拠: Zelazo (2006), Miyake et al. (2000)
 */
export const irokaeSwitchConfig: GameConfig = {
  id: 'irokae-switch',
  name: 'いろかえスイッチ',
  primary_domain: 'cognitive_flexibility',
  secondary_domains: ['inhibition', 'working_memory'],
  trial_count_range: { min: 24, max: 40 },
  stage_trial_count: { '3-5': 8, '6-9': 12, '10-15': 15 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
      {
        name: 'switch_frequency',
        type: 'numeric',
        min: 4,
        max: 8,
        step: 1,
        initial: 8,
        direction: 'down_is_harder',
      },
      {
        name: 'cue_salience',
        type: 'categorical',
        levels: ['high', 'mid', 'low'],
        initial: 'high',
        direction: 'up_is_harder',
      },
      {
        name: 'dimensions',
        type: 'numeric',
        min: 2,
        max: 3,
        step: 1,
        initial: 2,
        direction: 'up_is_harder',
      },
      {
        name: 'phase',
        type: 'categorical',
        levels: ['pre_switch', 'post_switch', 'border'],
        initial: 'pre_switch',
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { switch_frequency: 8, cue_salience: 'high', dimensions: 2, phase: 'pre_switch' },
    '6-9': { switch_frequency: 8, cue_salience: 'high', dimensions: 2, phase: 'pre_switch' },
    '10-15': { switch_frequency: 6, cue_salience: 'mid', dimensions: 2, phase: 'pre_switch' },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 10 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};
