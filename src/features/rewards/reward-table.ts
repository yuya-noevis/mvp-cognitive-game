/**
 * RewardTable - 報酬テーブル定義と抽選ロジック
 *
 * 確率:
 *   - common:   60%
 *   - uncommon: 30%
 *   - rare:     10%
 *
 * 植物ストリークレベル4以上でレア確率UP:
 *   - レベル4: rare 15%, uncommon 30%, common 55%
 *   - レベル5: rare 20%, uncommon 30%, common 50%
 */

import type { RewardItem, RewardRarity } from './types';

/** 報酬プールの全アイテム */
export const REWARD_POOL: RewardItem[] = [
  // --- Common コレクティブル (衣装) ---
  {
    id: 'costume-star-cape',
    type: 'collectible',
    rarity: 'common',
    name: 'ほしのマント',
    description: 'キラキラひかる ほしがらマント',
    icon: '🌟',
    collectibleCategory: 'costume',
  },
  {
    id: 'costume-moon-hat',
    type: 'collectible',
    rarity: 'common',
    name: 'おつきさまぼうし',
    description: 'まるい おつきさまの ぼうし',
    icon: '🎩',
    collectibleCategory: 'costume',
  },
  {
    id: 'costume-rainbow-scarf',
    type: 'collectible',
    rarity: 'common',
    name: 'にじいろマフラー',
    description: 'なないろに ひかる マフラー',
    icon: '🧣',
    collectibleCategory: 'costume',
  },
  {
    id: 'costume-cloud-shoes',
    type: 'collectible',
    rarity: 'common',
    name: 'くもの くつ',
    description: 'ふわふわ うかぶ くつ',
    icon: '👟',
    collectibleCategory: 'costume',
  },

  // --- Common コレクティブル (背景テーマ) ---
  {
    id: 'bg-sunset-meadow',
    type: 'collectible',
    rarity: 'common',
    name: 'ゆうやけの はらっぱ',
    description: 'きれいな ゆうやけの はいけい',
    icon: '🌅',
    collectibleCategory: 'background',
  },
  {
    id: 'bg-ocean-floor',
    type: 'collectible',
    rarity: 'common',
    name: 'うみのそこ',
    description: 'おさかなが およぐ はいけい',
    icon: '🐠',
    collectibleCategory: 'background',
  },

  // --- Common ボーナススター ---
  {
    id: 'bonus-stars-1',
    type: 'bonus_stars',
    rarity: 'common',
    name: 'ボーナススター ×3',
    description: 'キラキラの ほしが 3つ！',
    icon: '⭐',
    bonusStars: 3,
  },

  // --- Uncommon コレクティブル ---
  {
    id: 'costume-galaxy-wings',
    type: 'collectible',
    rarity: 'uncommon',
    name: 'ぎんがの はね',
    description: 'うちゅうの ほしが ちりばめられた はね',
    icon: '🦋',
    collectibleCategory: 'costume',
  },
  {
    id: 'bg-northern-lights',
    type: 'collectible',
    rarity: 'uncommon',
    name: 'オーロラのそら',
    description: 'きれいな オーロラの はいけい',
    icon: '🌌',
    collectibleCategory: 'background',
  },
  {
    id: 'costume-crystal-crown',
    type: 'collectible',
    rarity: 'uncommon',
    name: 'クリスタルかんむり',
    description: 'キラキラ ひかる クリスタルの かんむり',
    icon: '👑',
    collectibleCategory: 'costume',
  },
  {
    id: 'bonus-stars-2',
    type: 'bonus_stars',
    rarity: 'uncommon',
    name: 'ボーナススター ×5',
    description: 'キラキラの ほしが 5つ！',
    icon: '🌟',
    bonusStars: 5,
  },

  // --- Rare アイテム ---
  {
    id: 'rare-shooting-star',
    type: 'rare_effect',
    rarity: 'rare',
    name: 'ながれぼしエフェクト',
    description: 'せいかいすると ながれぼしが とぶ！',
    icon: '☄️',
  },
  {
    id: 'rare-confetti-burst',
    type: 'rare_effect',
    rarity: 'rare',
    name: 'きらきらフラワー',
    description: 'せいかいすると おはなが ちる！',
    icon: '🌸',
  },
  {
    id: 'bg-cosmic-garden',
    type: 'collectible',
    rarity: 'rare',
    name: 'うちゅうの おにわ',
    description: 'おほしさまが さく ふしぎな おにわ',
    icon: '🪐',
    collectibleCategory: 'background',
  },
  {
    id: 'bonus-stars-3',
    type: 'bonus_stars',
    rarity: 'rare',
    name: 'ボーナススター ×10',
    description: 'キラキラの ほしが 10こ！',
    icon: '💫',
    bonusStars: 10,
  },
];

/** レアリティ別の基本確率 */
interface RarityProbability {
  common: number;
  uncommon: number;
  rare: number;
}

/** 成長レベル別の確率テーブル */
const RARITY_PROBABILITIES: Record<number, RarityProbability> = {
  1: { common: 0.60, uncommon: 0.30, rare: 0.10 },
  2: { common: 0.60, uncommon: 0.30, rare: 0.10 },
  3: { common: 0.60, uncommon: 0.30, rare: 0.10 },
  4: { common: 0.55, uncommon: 0.30, rare: 0.15 },
  5: { common: 0.50, uncommon: 0.30, rare: 0.20 },
};

/**
 * 成長レベルに基づいてレアリティ確率を取得
 */
export function getRarityProbabilities(growthLevel: number): RarityProbability {
  const level = Math.max(1, Math.min(5, growthLevel));
  return RARITY_PROBABILITIES[level] ?? RARITY_PROBABILITIES[1];
}

/**
 * レアリティを抽選する
 * @param growthLevel 植物の成長レベル (1-5)
 * @param rng オプションの乱数関数 (テスト用)
 */
export function rollRarity(growthLevel: number, rng: () => number = Math.random): RewardRarity {
  const probs = getRarityProbabilities(growthLevel);
  const roll = rng();

  if (roll < probs.rare) return 'rare';
  if (roll < probs.rare + probs.uncommon) return 'uncommon';
  return 'common';
}

/**
 * 指定レアリティのアイテムプールからランダムに1つ選ぶ
 */
export function pickRewardByRarity(rarity: RewardRarity, rng: () => number = Math.random): RewardItem {
  const pool = REWARD_POOL.filter(item => item.rarity === rarity);
  if (pool.length === 0) {
    // Fallback: common pool
    const fallback = REWARD_POOL.filter(item => item.rarity === 'common');
    return fallback[Math.floor(rng() * fallback.length)];
  }
  return pool[Math.floor(rng() * pool.length)];
}

/**
 * 宝箱3つ分の報酬を抽選する（重複なし）
 * @param growthLevel 植物の成長レベル (1-5)
 * @param rng オプションの乱数関数 (テスト用)
 */
export function rollTreasureChests(
  growthLevel: number,
  rng: () => number = Math.random,
): [RewardItem, RewardItem, RewardItem] {
  const picked: RewardItem[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < 3; i++) {
    const rarity = rollRarity(growthLevel, rng);
    const pool = REWARD_POOL.filter(
      item => item.rarity === rarity && !usedIds.has(item.id),
    );

    let reward: RewardItem;
    if (pool.length === 0) {
      // Fallback: pick from any rarity not yet used
      const anyPool = REWARD_POOL.filter(item => !usedIds.has(item.id));
      reward = anyPool[Math.floor(rng() * anyPool.length)];
    } else {
      reward = pool[Math.floor(rng() * pool.length)];
    }

    usedIds.add(reward.id);
    picked.push(reward);
  }

  return picked as [RewardItem, RewardItem, RewardItem];
}

/**
 * 予測可能報酬モード用: 常に同じ報酬を返す
 */
export const PREDICTABLE_REWARD: RewardItem = {
  id: 'predictable-bonus-stars',
  type: 'bonus_stars',
  rarity: 'common',
  name: 'ボーナススター ×3',
  description: 'きょうも がんばったね！ほしが 3つ！',
  icon: '⭐',
  bonusStars: 3,
};
