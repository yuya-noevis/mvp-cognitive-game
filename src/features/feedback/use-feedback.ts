'use client';

import { useCallback, useState, useRef } from 'react';
import type { FeedbackSettings } from './feedback-config';
import type { FeedbackEffectType } from './VisualFeedback';
import { soundManager } from './sound-manager';
import { vibrationManager } from './vibration-manager';
import { StreakTracker } from './streak-tracker';

export function useFeedback(settings: FeedbackSettings) {
  const [currentEffect, setCurrentEffect] = useState<FeedbackEffectType>(null);
  const streakTracker = useRef(new StreakTracker());

  const triggerCorrect = useCallback(() => {
    const result = streakTracker.current.recordCorrect();

    // サウンド
    if (settings.soundEnabled) {
      if (result.isStreak3 || result.isStreak5) {
        soundManager.playStreak(settings.soundVolume);
      } else {
        soundManager.playCorrect(settings.soundVolume);
      }
    }

    // 振動
    if (settings.vibrationEnabled) {
      if (result.isStreak3 || result.isStreak5) {
        vibrationManager.vibrateStreak();
      } else {
        vibrationManager.vibrateCorrect();
      }
    }

    // 視覚エフェクト
    if (result.isStreak5) {
      setCurrentEffect('streak-5');
    } else if (result.isStreak3) {
      setCurrentEffect('streak-3');
    } else {
      setCurrentEffect('correct');
    }

    return result;
  }, [settings]);

  const triggerIncorrect = useCallback(() => {
    const result = streakTracker.current.recordIncorrect();

    // サウンド（L1では鳴らさない = soundEnabled: false）
    if (settings.soundEnabled) {
      soundManager.playIncorrect(settings.soundVolume);
    }

    // 振動なし（不正解で振動は罰になる）

    // 視覚: 画面揺れ
    setCurrentEffect('incorrect');

    return result;
  }, [settings]);

  const triggerNearMiss = useCallback(() => {
    streakTracker.current.recordNearMiss();
    setCurrentEffect('near-miss');
  }, []);

  const clearEffect = useCallback(() => {
    setCurrentEffect(null);
  }, []);

  const resetStreak = useCallback(() => {
    streakTracker.current.reset();
  }, []);

  return {
    triggerCorrect,
    triggerIncorrect,
    triggerNearMiss,
    clearEffect,
    resetStreak,
    currentEffect,
    streakStats: streakTracker.current.getStats(),
  };
}
