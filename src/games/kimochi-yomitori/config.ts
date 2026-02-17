import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * きもちよみとり（社会認知 - 表情認識）
 *
 * Facial Emotion Recognition (Ekman, 1992):
 * - イラスト表情を見て感情ラベルを選ぶ（4択）
 * - 基本6感情: 喜び, 悲しみ, 怒り, 驚き, 恐れ, 嫌悪
 * - DDA: 感情の明瞭度（誇張 → 微妙）, 選択肢の感情距離
 * - 測定: 正答率, 感情カテゴリ別正答率, 混同パターン
 * - イラストはSVGで生成（写真不使用 = 子供向け + 肖像権回避）
 * 根拠: Ekman & Friesen (1976), Baron-Cohen et al. (2001)
 */
export const kimochiYomitoriConfig: GameConfig = {
  id: 'kimochi-yomitori',
  name: 'きもちよみとり',
  primary_domain: 'social_cognition',
  secondary_domains: ['emotion_regulation', 'attention'],
  trial_count_range: { min: 10, max: 18 },
  stage_trial_count: { '3-5': 6, '6-9': 8, '10-15': 10 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
      {
        name: 'emotion_clarity',
        type: 'categorical',
        levels: ['exaggerated', 'clear', 'subtle'],
        initial: 'exaggerated',
        direction: 'up_is_harder',
      },
      {
        name: 'choice_count',
        type: 'numeric',
        min: 2,
        max: 4,
        step: 1,
        initial: 2,
        direction: 'up_is_harder',
      },
      {
        name: 'emotion_distance',
        type: 'categorical',
        levels: ['far', 'mid', 'close'],
        initial: 'far',
        direction: 'up_is_harder',
      },
    ],
  },
  age_adjustments: {
    '3-5': { emotion_clarity: 'exaggerated', choice_count: 2, emotion_distance: 'far' },
    '6-9': { emotion_clarity: 'clear', choice_count: 3, emotion_distance: 'far' },
    '10-15': { emotion_clarity: 'clear', choice_count: 4, emotion_distance: 'mid' },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 10 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};
