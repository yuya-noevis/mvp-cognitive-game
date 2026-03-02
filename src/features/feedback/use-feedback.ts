'use client';

import { useCallback, useState, useRef } from 'react';
import type { FeedbackSettings } from './feedback-config';
import type { FeedbackEffectType } from './VisualFeedback';
import { soundManager } from './sound-manager';
import { vibrationManager } from './vibration-manager';
import { StreakTracker } from './streak-tracker';

export interface FeedbackCallbacks {
  /**
   * 2連続不正解時にゲームへヒント表示を要求するコールバック。
   * ゲーム側で実装して渡す（任意）。
   */
  onShowHint?: () => void;
  /**
   * 3連続不正解時にゲームへデモ再生を要求するコールバック。
   * ゲーム側で実装して渡す（任意）。
   */
  onShowDemo?: () => void;
}

export function useFeedback(settings: FeedbackSettings, callbacks?: FeedbackCallbacks) {
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

    // 視覚エフェクト（ティア・感覚過敏設定に応じた強度はVisualFeedback側で処理）
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

    // 2連続不正解: ヒント表示コールバック
    if (result.shouldShowHint && callbacks?.onShowHint) {
      callbacks.onShowHint();
    }

    // 3連続不正解: デモ再生コールバック
    if (result.shouldShowDemo && callbacks?.onShowDemo) {
      callbacks.onShowDemo();
    }

    return result;
  }, [settings, callbacks]);

  const triggerNearMiss = useCallback(() => {
    // 惜しい判定: 連続正解ブーストを失わない
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
