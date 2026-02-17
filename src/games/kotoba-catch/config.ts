import type { GameConfig } from '@/types';
import {
  DDA_TARGET_ACCURACY_MIN,
  DDA_TARGET_ACCURACY_MAX,
  DDA_DEFAULT_WINDOW_SIZE,
  DDA_MIN_TRIALS_BEFORE_ADJUST,
} from '@/lib/constants';

/**
 * ことばキャッチ（言語 - 受容語彙 PPVT型）
 *
 * Peabody Picture Vocabulary Test (Dunn & Dunn, 2007):
 * - 音声で単語を聞く → 4枚の絵から正しいものを選ぶ
 * - DDA: 語彙難易度（基本名詞 → 動詞 → 形容詞 → 抽象語）, 選択肢類似度
 * - 測定: 正答率, 品詞別正答率, 反応時間
 * - 音声はWeb Speech API使用（TTS）
 * 根拠: Dunn & Dunn (2007), 日本語版PVT-R (上野ら, 2008)
 */
export const kotobaCatchConfig: GameConfig = {
  id: 'kotoba-catch',
  name: 'ことばキャッチ',
  primary_domain: 'language',
  secondary_domains: ['attention', 'memory'],
  trial_count_range: { min: 12, max: 24 },
  stage_trial_count: { '3-5': 8, '6-9': 10, '10-15': 12 },
  dda: {
    target_accuracy_min: DDA_TARGET_ACCURACY_MIN,
    target_accuracy_max: DDA_TARGET_ACCURACY_MAX,
    window_size: DDA_DEFAULT_WINDOW_SIZE,
    min_trials_before_adjust: DDA_MIN_TRIALS_BEFORE_ADJUST,
    parameters: [
      {
        name: 'word_category',
        type: 'categorical',
        levels: ['basic_noun', 'verb', 'adjective', 'abstract'],
        initial: 'basic_noun',
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
    ],
  },
  age_adjustments: {
    '3-5': { word_category: 'basic_noun', choice_count: 2 },
    '6-9': { word_category: 'basic_noun', choice_count: 3 },
    '10-15': { word_category: 'basic_noun', choice_count: 4 },
  },
  safety: {
    consecutive_error_threshold: 3,
    max_session_duration_ms: 10 * 60 * 1000,
    inactivity_timeout_ms: 30_000,
  },
};
