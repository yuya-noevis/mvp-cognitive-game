'use client';

import { useMemo } from 'react';
import type { FeedbackSettings } from '@/features/feedback/feedback-config';
import type { InstructionLevel } from '@/features/instruction';
import { getFeedbackSettingsForLevel } from '@/features/feedback/feedback-config';
import { useSensorySettings } from './SensorySettingsContext';
import { volumeLevelToNumber } from './types';

/**
 * 指示レベル由来のFeedbackSettingsに感覚過敏設定を上書きしたものを返す。
 *
 * 優先順位:
 *   soundEffectVolume が 'off' → soundEnabled = false
 *   それ以外 → instructionLevel の soundEnabled を尊重した上で volume を上書き
 *   vibration 'off' → vibrationEnabled = false
 */
export function useSensoryFeedbackSettings(instructionLevel: InstructionLevel): FeedbackSettings {
  const { settings } = useSensorySettings();

  return useMemo<FeedbackSettings>(() => {
    const base = getFeedbackSettingsForLevel(instructionLevel);
    const volumeNum = volumeLevelToNumber(settings.soundEffectVolume);

    const soundEnabled =
      settings.soundEffectVolume === 'off'
        ? false
        : base.soundEnabled;

    const vibrationEnabled =
      settings.vibration === 'off'
        ? false
        : base.vibrationEnabled;

    return {
      ...base,
      soundEnabled,
      soundVolume: soundEnabled ? volumeNum : 0,
      vibrationEnabled,
    };
  }, [instructionLevel, settings]);
}
