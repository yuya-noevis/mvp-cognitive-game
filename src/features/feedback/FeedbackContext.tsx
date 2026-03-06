'use client';

import { createContext, useContext } from 'react';

export interface FeedbackContextValue {
  triggerCorrect: () => void;
  triggerIncorrect: () => void;
  triggerNearMiss: () => void;
  /** 現在の連続正解数（コンボカウンター用） */
  consecutiveCorrect: number;
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
