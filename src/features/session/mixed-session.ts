import type { IntegratedGameId } from '@/games/integrated/types';
import type { Tier } from '@/features/gating';

export interface MixedSessionConfig {
  tier: Tier;
  gameCount: number;
  trialsPerGame: number;
  warmupTrials: number;
}

export interface SessionGameSlot {
  gameId: IntegratedGameId;
  trialCount: number;
  order: number;
}

export interface MixedSessionPlan {
  config: MixedSessionConfig;
  games: SessionGameSlot[];
  totalTrials: number;
}

export function getMixedSessionConfig(tier: Tier): MixedSessionConfig {
  switch (tier) {
    case 1:
      return { tier, gameCount: 2, trialsPerGame: 2, warmupTrials: 1 };
    case 2:
      return { tier, gameCount: 3, trialsPerGame: 2, warmupTrials: 1 };
    case 3:
      return { tier, gameCount: 3, trialsPerGame: 3, warmupTrials: 2 };
  }
}
