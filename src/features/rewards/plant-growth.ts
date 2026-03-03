/**
 * PlantGrowth - 植物ストリークのXP倍率計算
 *
 * 成長レベルに応じたXP倍率:
 *   1 (種):  基本 XP × 1.0
 *   2 (芽):  XP × 1.2
 *   3 (花):  XP × 1.5
 *   4 (木):  XP × 2.0
 *   5 (森):  XP × 2.5
 */

export type GrowthLevel = 1 | 2 | 3 | 4 | 5;

export interface PlantGrowthInfo {
  level: GrowthLevel;
  label: string;
  description: string;
  xpMultiplier: number;
  /** ボーナスアイテム付与（レベル3以上） */
  hasBonusItem: boolean;
  /** レア確率UP（レベル4以上） */
  hasRareBoost: boolean;
  /** 限定報酬（レベル5のみ） */
  hasExclusiveReward: boolean;
}

const GROWTH_TABLE: Record<GrowthLevel, PlantGrowthInfo> = {
  1: {
    level: 1,
    label: 'たね',
    description: 'つちから めが でかけ',
    xpMultiplier: 1.0,
    hasBonusItem: false,
    hasRareBoost: false,
    hasExclusiveReward: false,
  },
  2: {
    level: 2,
    label: 'め',
    description: 'ちいさな ふたば',
    xpMultiplier: 1.2,
    hasBonusItem: false,
    hasRareBoost: false,
    hasExclusiveReward: false,
  },
  3: {
    level: 3,
    label: 'はな',
    description: 'はなが さく',
    xpMultiplier: 1.5,
    hasBonusItem: true,
    hasRareBoost: false,
    hasExclusiveReward: false,
  },
  4: {
    level: 4,
    label: 'き',
    description: 'りっぱな きに せいちょう',
    xpMultiplier: 2.0,
    hasBonusItem: true,
    hasRareBoost: true,
    hasExclusiveReward: false,
  },
  5: {
    level: 5,
    label: 'もり',
    description: 'もりが ひろがる',
    xpMultiplier: 2.5,
    hasBonusItem: true,
    hasRareBoost: true,
    hasExclusiveReward: true,
  },
};

/**
 * 成長レベルから詳細情報を取得
 */
export function getPlantGrowthInfo(level: GrowthLevel): PlantGrowthInfo {
  return GROWTH_TABLE[level];
}

/**
 * XP倍率を計算
 */
export function calculateXpMultiplier(growthLevel: GrowthLevel): number {
  return GROWTH_TABLE[growthLevel].xpMultiplier;
}

/**
 * 基本XPに成長レベルの倍率を適用
 */
export function applyGrowthXpBonus(baseXp: number, growthLevel: GrowthLevel): number {
  return Math.round(baseXp * calculateXpMultiplier(growthLevel));
}

/**
 * 連続プレイ日数から成長レベルを決定する純粋関数
 *
 * ルール:
 * - プレイした日: +1 (最大5)
 * - プレイしなかった日: -1 (最低1、消滅しない)
 *
 * @param consecutiveDays 連続プレイ日数
 * @returns 成長レベル 1-5
 */
export function calculateGrowthLevel(consecutiveDays: number): GrowthLevel {
  if (consecutiveDays <= 0) return 1;
  if (consecutiveDays >= 5) return 5;
  return Math.min(5, Math.max(1, consecutiveDays)) as GrowthLevel;
}
