'use client';

import { createContext, useContext } from 'react';
import type { DDAProfile } from '@/features/dda/disability-profile';

export interface SessionContextValue {
  /** Called by useGameSession after each trial completes */
  onTrialComplete: (isCorrect: boolean, responseTimeMs: number) => void;
  /** If true, GameShell should hide its built-in end screen */
  hideEndScreen: boolean;
  /** Disability-based DDA profile for the current user */
  disabilityProfile?: DDAProfile;
  /** Warmup adjustment to apply (set by page when warmup ends) */
  warmupAdjustment?: number;
}

const SessionCtx = createContext<SessionContextValue | null>(null);

export const SessionProvider = SessionCtx.Provider;

export function useSessionContext(): SessionContextValue | null {
  return useContext(SessionCtx);
}
