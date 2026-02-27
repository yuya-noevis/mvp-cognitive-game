import type { InstructionLevel } from '@/features/instruction';

/** フィードバック強度設定（保護者が変更可能） */
export interface FeedbackSettings {
  soundEnabled: boolean;
  soundVolume: number;       // 0-1
  vibrationEnabled: boolean;
  visualIntensity: 'subtle' | 'standard' | 'vivid';
}

export const DEFAULT_FEEDBACK_SETTINGS: FeedbackSettings = {
  soundEnabled: true,
  soundVolume: 0.7,
  vibrationEnabled: true,
  visualIntensity: 'standard',
};

/** 指示レベルに応じたデフォルト設定 */
export function getFeedbackSettingsForLevel(level: InstructionLevel): FeedbackSettings {
  switch (level) {
    case 'L1':
      return {
        soundEnabled: false,   // 非言語モード: 音なし
        soundVolume: 0,
        vibrationEnabled: true,
        visualIntensity: 'subtle',
      };
    case 'L2':
      return {
        soundEnabled: true,
        soundVolume: 0.5,
        vibrationEnabled: true,
        visualIntensity: 'standard',
      };
    case 'L3':
      return DEFAULT_FEEDBACK_SETTINGS;
    case 'L4':
      return {
        ...DEFAULT_FEEDBACK_SETTINGS,
        soundVolume: 0.5,  // ASD: やや控えめ
      };
  }
}
