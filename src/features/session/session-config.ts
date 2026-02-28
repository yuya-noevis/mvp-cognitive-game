import type { Tier } from '@/features/gating';

export interface SessionConfig {
  maxTrials: number;
  targetDurationSec: number;
  warmupTrials: number;
  trialTimeLimitSec: number;
}

export interface DailyLimitConfig {
  maxSessions: number;
  maxTotalMinutes: number;
  cooldownMinutes: number;
}

export function getSessionConfig(tier: Tier): SessionConfig {
  switch (tier) {
    case 1:
      return {
        maxTrials: 5,
        targetDurationSec: 90,
        warmupTrials: 1,
        trialTimeLimitSec: 25,
      };
    case 2:
      return {
        maxTrials: 7,
        targetDurationSec: 150,
        warmupTrials: 2,
        trialTimeLimitSec: 25,
      };
    case 3:
      return {
        maxTrials: 12,
        targetDurationSec: 300,
        warmupTrials: 2,
        trialTimeLimitSec: 20,
      };
  }
}

export function getDailyLimitConfig(tier: Tier): DailyLimitConfig {
  switch (tier) {
    case 1:
      return { maxSessions: 5, maxTotalMinutes: 4, cooldownMinutes: 2 };
    case 2:
      return { maxSessions: 8, maxTotalMinutes: 9, cooldownMinutes: 1 };
    case 3:
      return { maxSessions: 12, maxTotalMinutes: 30, cooldownMinutes: 0 };
  }
}
