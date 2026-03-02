'use client';

/**
 * UnifiedFeedback - 全ゲーム共通のフィードバックラッパー
 *
 * 役割:
 * - FeedbackContext を子コンポーネントに提供
 * - VisualFeedback オーバーレイの表示管理
 * - SoundManager・VibrationManager の初期化（use-feedback内で行われる）
 * - 感覚過敏設定（SensorySettings）との自動連動
 * - InstructionLevel に基づくフィードバック強度設定
 *
 * 使用方法:
 * ```tsx
 * <UnifiedFeedback instructionLevel="L3">
 *   <YourGameComponent />
 * </UnifiedFeedback>
 * ```
 */

import React, { useMemo } from 'react';
import { FeedbackContext } from '@/features/feedback/FeedbackContext';
import { useFeedback } from '@/features/feedback/use-feedback';
import { VisualFeedback } from '@/features/feedback/VisualFeedback';
import { useSensoryFeedbackSettings } from '@/features/sensory/useSensoryFeedbackSettings';
import type { InstructionLevel } from '@/features/instruction';
import type { FeedbackCallbacks } from '@/features/feedback/use-feedback';

interface UnifiedFeedbackProps {
  children: React.ReactNode;
  /**
   * 指示レベル（フィードバック強度の基準）。
   * 省略時は 'L3'（標準）。
   */
  instructionLevel?: InstructionLevel;
  /**
   * 2連続不正解時のヒント表示コールバック（任意）。
   * ゲームコンポーネント側で実装して渡す。
   */
  onShowHint?: () => void;
  /**
   * 3連続不正解時のデモ再生コールバック（任意）。
   * ゲームコンポーネント側で実装して渡す。
   */
  onShowDemo?: () => void;
}

export function UnifiedFeedback({
  children,
  instructionLevel = 'L3',
  onShowHint,
  onShowDemo,
}: UnifiedFeedbackProps) {
  // 感覚過敏設定 × 指示レベル → FeedbackSettings
  const feedbackSettings = useSensoryFeedbackSettings(instructionLevel);

  // ヒント・デモコールバック
  const callbacks = useMemo<FeedbackCallbacks>(
    () => ({ onShowHint, onShowDemo }),
    [onShowHint, onShowDemo],
  );

  // フィードバックhook
  const {
    triggerCorrect,
    triggerIncorrect,
    triggerNearMiss,
    clearEffect,
    currentEffect,
  } = useFeedback(feedbackSettings, callbacks);

  // FeedbackContext に渡す値
  const feedbackCtx = useMemo(
    () => ({
      triggerCorrect,
      triggerIncorrect,
      triggerNearMiss,
      onShowHint,
      onShowDemo,
    }),
    [triggerCorrect, triggerIncorrect, triggerNearMiss, onShowHint, onShowDemo],
  );

  return (
    <FeedbackContext value={feedbackCtx}>
      {children}
      {/* 視覚フィードバックオーバーレイ（全ゲーム共通） */}
      <VisualFeedback
        type={currentEffect}
        intensity={feedbackSettings.visualIntensity}
        onComplete={clearEffect}
      />
    </FeedbackContext>
  );
}
