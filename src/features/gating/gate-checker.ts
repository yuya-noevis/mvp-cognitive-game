import type { Tier } from './tier-system';
import { GAME_LOCK_RULES } from './game-locks';
import type { IntegratedGameId } from '@/games/integrated/types';

export interface GameAccessResult {
  accessible: boolean;
  maxAccessibleLevel: number;
  lockedReason?: string;
}

export function checkGameAccess(
  gameId: IntegratedGameId,
  userTier: Tier,
): GameAccessResult {
  const rule = GAME_LOCK_RULES.find((r) => r.gameId === gameId);
  if (!rule) return { accessible: true, maxAccessibleLevel: 25 };

  // ゲーム自体がロックされているか
  if (userTier < rule.unlockTier) {
    return {
      accessible: false,
      maxAccessibleLevel: 0,
      lockedReason: 'このゲームはもう少し成長してから遊べるよ',
    };
  }

  // アクセス可能な最大レベルを計算
  let maxLevel = 0;
  for (const lock of rule.levelLocks) {
    if (userTier >= lock.requiredTier) {
      maxLevel = Math.max(maxLevel, lock.maxLevel);
    }
  }

  return {
    accessible: true,
    maxAccessibleLevel: maxLevel,
  };
}

export function getAccessibleGames(userTier: Tier): {
  accessible: IntegratedGameId[];
  locked: IntegratedGameId[];
} {
  const accessible: IntegratedGameId[] = [];
  const locked: IntegratedGameId[] = [];

  for (const rule of GAME_LOCK_RULES) {
    if (userTier >= rule.unlockTier) {
      accessible.push(rule.gameId);
    } else {
      locked.push(rule.gameId);
    }
  }

  return { accessible, locked };
}
