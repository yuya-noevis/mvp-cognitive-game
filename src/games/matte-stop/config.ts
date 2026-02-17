import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * まって！ストップ（抑制・衝動コントロール）
 *
 * Go/No-Go課題のゲーム化。
 * 動物が走ってくる→タップ（Go）。赤い旗→タップしない（No-Go）。
 */
/**
 * まって！ストップ（抑制・衝動コントロール - SSRT測定追加）
 *
 * Go/No-Go + Stop-Signal Paradigm:
 * - Go:No-Go比を75:25に（Logan & Cowan, 1984）
 * - SSD（Stop Signal Delay）の階段法を追加（Band et al., 2003）
 * - SSRT（Stop Signal Reaction Time）の算出
 * 根拠: Verbruggen & Logan (2008)
 */
export const matteStopConfig: GameConfig = {
  id: 'matte-stop',
  name: 'まって！ストップ',
  primary_domain: 'inhibition',
  secondary_domains: ['attention', 'processing_speed'],
  trial_count_range: { min: 25, max: 35 },
  stage_trial_count: { '3-5': 8, '6-9': 12, '10-15': 15 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
      {
        name: 'nogo_ratio',
        type: 'numeric',
        min: 0.2,
        max: 0.4,
        step: 0.05,
        initial: 0.25,
        direction: 'up_is_harder',
      },
      {
        name: 'response_window_ms',
        type: 'numeric',
        min: 1500,
        max: 2500,
        step: 200,
        initial: 2500,
        direction: 'down_is_harder',
      },
      {
        name: 'cue_complexity',
        type: 'categorical',
        levels: ['color', 'shape', 'color_and_shape'],
        initial: 'color',
        direction: 'up_is_harder',
      },
      {
        name: 'ssd_ms',
        type: 'numeric',
        min: 100,
        max: 500,
        step: 50,
        initial: 250,
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { response_window_ms: 3000, nogo_ratio: 0.25, ssd_ms: 300 },
    '6-9': { response_window_ms: 2500, nogo_ratio: 0.25, ssd_ms: 250 },
    '10-15': { response_window_ms: 2000, nogo_ratio: 0.25, ssd_ms: 200 },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 10 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};

/** Go:No-Go標準比（Logan & Cowan, 1984） */
export const GO_NOGO_RATIO = 0.75;

/** SSD階段法ステップ（Band et al., 2003）*/
export const SSD_STEP_MS = 50;
