import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
} from '@/lib/constants';

/**
 * おぼえてならべて（ワーキングメモリ）
 *
 * Corsiブロック課題のゲーム化。
 * 順番に光る宝石を覚えて同じ順番でタップ。
 * ステアケース法（2-down/1-up）で系列長を調整。
 */
/**
 * おぼえてならべて（ワーキングメモリ - Corsi前後スパン）
 *
 * Corsi Block-Tapping Task (Corsi, 1972) + 逆順序再生:
 * - 順方向: 視空間短期記憶
 * - 逆方向: 実行ワーキングメモリ（executive WM）
 * - 初期スパン長を年齢別に設定
 * 根拠: Corsi (1972), Kessels et al. (2000)
 */
export const oboeteNarabeteConfig: GameConfig = {
  id: 'oboete-narabete',
  name: 'おぼえてならべて',
  primary_domain: 'working_memory',
  secondary_domains: ['visuospatial', 'attention'],
  trial_count_range: { min: 15, max: 25 },
  stage_trial_count: { '3-5': 8, '6-9': 10, '10-15': 12 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: 2, // Staircase: 2 trials per level
    min_trials_before_adjust: 2,
    parameters: [
      {
        name: 'sequence_length',
        type: 'numeric',
        min: 2,
        max: 9,
        step: 1,
        initial: 2,
        direction: 'up_is_harder',
      },
      {
        name: 'display_speed_ms',
        type: 'numeric',
        min: 600,
        max: 1200,
        step: 100,
        initial: 1000,
        direction: 'down_is_harder',
      },
      {
        name: 'grid_size',
        type: 'categorical',
        levels: ['2x2', '3x3', '4x4'],
        initial: '3x3',
        direction: 'up_is_harder',
      },
      {
        name: 'recall_direction',
        type: 'categorical',
        levels: ['forward', 'backward'],
        initial: 'forward',
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { sequence_length: 2, grid_size: '2x2', display_speed_ms: 1200, recall_direction: 'forward' },
    '6-9': { sequence_length: 3, grid_size: '3x3', display_speed_ms: 1000, recall_direction: 'forward' },
    '10-15': { sequence_length: 4, grid_size: '3x3', display_speed_ms: 800, recall_direction: 'forward' },
  },
  safety: {
    consecutive_error_threshold: 2,
    max_session_duration_ms: 10 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};
