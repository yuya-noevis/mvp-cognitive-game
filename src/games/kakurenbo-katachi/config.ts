import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * かくれんぼカタチ（知覚処理 - Embedded Figures Test）
 *
 * Children's Embedded Figures Test (Witkin et al., 1971):
 * - 複雑な図の中に隠れた単純図形を見つけてタップ
 * - DDA: 背景複雑度, ターゲットサイズ, 色類似度
 * - 測定: 正答率, 発見時間, 視覚的場依存度
 * 根拠: Witkin et al. (1971), Shah & Frith (1983) - ASD研究
 */
export const kakurenboKatachiConfig: GameConfig = {
  id: 'kakurenbo-katachi',
  name: 'かくれんぼカタチ',
  primary_domain: 'perceptual',
  secondary_domains: ['attention', 'visuospatial'],
  trial_count_range: { min: 10, max: 18 },
  stage_trial_count: { '3-5': 6, '6-9': 8, '10-15': 10 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
      {
        name: 'distractor_count',
        type: 'numeric',
        min: 3,
        max: 8,
        step: 1,
        initial: 3,
        direction: 'up_is_harder',
      },
      {
        name: 'target_size',
        type: 'categorical',
        levels: ['large', 'medium', 'small'],
        initial: 'large',
        direction: 'up_is_harder',
      },
      {
        name: 'color_similarity',
        type: 'categorical',
        levels: ['low', 'mid', 'high'],
        initial: 'low',
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { distractor_count: 3, target_size: 'large', color_similarity: 'low' },
    '6-9': { distractor_count: 4, target_size: 'medium', color_similarity: 'low' },
    '10-15': { distractor_count: 5, target_size: 'medium', color_similarity: 'mid' },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 10 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};
