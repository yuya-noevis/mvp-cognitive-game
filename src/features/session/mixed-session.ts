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

/** 1セッション = 3ゲーム × 各6試行（計18試行） */
const GAMES_PER_SESSION = 3;
const TRIALS_PER_GAME = 6;

export function getMixedSessionConfig(tier: Tier): MixedSessionConfig {
  switch (tier) {
    case 1:
      return { tier, gameCount: GAMES_PER_SESSION, trialsPerGame: TRIALS_PER_GAME, warmupTrials: 1 };
    case 2:
      return { tier, gameCount: GAMES_PER_SESSION, trialsPerGame: TRIALS_PER_GAME, warmupTrials: 1 };
    case 3:
      return { tier, gameCount: GAMES_PER_SESSION, trialsPerGame: TRIALS_PER_GAME, warmupTrials: 2 };
  }
}
