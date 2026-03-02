'use client';

import { createContext, useContext } from 'react';

export interface FeedbackContextValue {
  triggerCorrect: () => void;
  triggerIncorrect: () => void;
  triggerNearMiss: () => void;
  /** 2連続不正解時: ゲーム側がヒントを表示するためのコールバック（任意） */
  onShowHint?: () => void;
  /** 3連続不正解時: ゲーム側がデモを再生するためのコールバック（任意） */
  onShowDemo?: () => void;
}

export const FeedbackContext = createContext<FeedbackContextValue | null>(null);

/** TrialFeedback等の共有コンポーネントからフィードバックをトリガーするためのhook */
export function useFeedbackContext(): FeedbackContextValue | null {
  return useContext(FeedbackContext);
}
