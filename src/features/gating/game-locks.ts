import type { Tier } from './tier-system';
import type { IntegratedGameId } from '@/games/integrated/types';

export interface GameLockRule {
  gameId: IntegratedGameId;
  /** どのティアから解放されるか */
  unlockTier: Tier;
  /** レベル帯ごとのロック */
  levelLocks: {
    minLevel: number;
    maxLevel: number;
    requiredTier: Tier;
    /** 人間向け説明（将来の条件実装用） */
    additionalCondition?: string;
  }[];
}

export const GAME_LOCK_RULES: GameLockRule[] = [
  {
    gameId: 'hikari-rescue',
    unlockTier: 1,
    levelLocks: [
      { minLevel: 1, maxLevel: 3, requiredTier: 1 },
      { minLevel: 4, maxLevel: 15, requiredTier: 2 },
      {
        minLevel: 16,
        maxLevel: 25,
        requiredTier: 3,
        additionalCondition: '抑制プロファイル十分',
      },
    ],
  },
  {
    gameId: 'oboete-susumu',
    unlockTier: 1,
    levelLocks: [
      { minLevel: 1, maxLevel: 8, requiredTier: 1 },
      { minLevel: 9, maxLevel: 13, requiredTier: 2 },
      {
        minLevel: 14,
        maxLevel: 25,
        requiredTier: 3,
        additionalCondition: '順方向span≥3',
      },
    ],
  },
  {
    gameId: 'rule-change',
    unlockTier: 2,
    levelLocks: [
      { minLevel: 1, maxLevel: 8, requiredTier: 2 },
      { minLevel: 9, maxLevel: 13, requiredTier: 2 },
      {
        minLevel: 14,
        maxLevel: 25,
        requiredTier: 3,
        additionalCondition: '2ルール理解成功',
      },
    ],
  },
  {
    gameId: 'kurukuru-puzzle',
    unlockTier: 1,
    levelLocks: [
      { minLevel: 1, maxLevel: 8, requiredTier: 1 },
      { minLevel: 9, maxLevel: 13, requiredTier: 2 },
      {
        minLevel: 14,
        maxLevel: 25,
        requiredTier: 3,
        additionalCondition: '視覚マッチ正答率≥80%',
      },
    ],
  },
  {
    gameId: 'tanken-meiro',
    unlockTier: 1,
    levelLocks: [
      { minLevel: 1, maxLevel: 13, requiredTier: 1 },
      {
        minLevel: 14,
        maxLevel: 25,
        requiredTier: 3,
        additionalCondition: '迷路完遂可能+順方向span≥3',
      },
    ],
  },
  {
    gameId: 'kotoba-ehon',
    unlockTier: 2,
    levelLocks: [
      { minLevel: 1, maxLevel: 8, requiredTier: 2 },
      { minLevel: 9, maxLevel: 25, requiredTier: 3 },
    ],
  },
  {
    gameId: 'kimochi-friends',
    unlockTier: 2,
    levelLocks: [
      { minLevel: 1, maxLevel: 8, requiredTier: 2 },
      { minLevel: 9, maxLevel: 18, requiredTier: 3 },
      {
        minLevel: 19,
        maxLevel: 25,
        requiredTier: 3,
        additionalCondition: 'きもちよみとり+Go/No-Go成立',
      },
    ],
  },
  {
    gameId: 'touch-adventure',
    unlockTier: 1,
    levelLocks: [
      { minLevel: 1, maxLevel: 13, requiredTier: 1 },
      { minLevel: 14, maxLevel: 25, requiredTier: 3 },
    ],
  },
];
