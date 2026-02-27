'use client';

import { createContext, useContext } from 'react';

export interface FeedbackContextValue {
  triggerCorrect: () => void;
  triggerIncorrect: () => void;
  triggerNearMiss: () => void;
}

export const FeedbackContext = createContext<FeedbackContextValue | null>(null);

/** TrialFeedback等の共有コンポーネントからフィードバックをトリガーするためのhook */
export function useFeedbackContext(): FeedbackContextValue | null {
  return useContext(FeedbackContext);
}
