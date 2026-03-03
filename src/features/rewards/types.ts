/**
 * Reward System Types - 報酬システム型定義
 *
 * 宝箱メカニクス + コレクティブル + ボーナス + レアアイテム
 */

/** 報酬の種類 */
export type RewardType = 'collectible' | 'bonus_stars' | 'rare_effect';

/** レアリティ */
export type RewardRarity = 'common' | 'uncommon' | 'rare';

/** コレクティブルのカテゴリ */
export type CollectibleCategory = 'costume' | 'background';

/** 報酬アイテム定義 */
export interface RewardItem {
  id: string;
  type: RewardType;
  rarity: RewardRarity;
  name: string;
  description: string;
  icon: string; // emoji or image key
  /** コレクティブルの場合のカテゴリ */
  collectibleCategory?: CollectibleCategory;
  /** ボーナススター数（bonus_stars type のみ） */
  bonusStars?: number;
}

/** 宝箱の状態 */
export type ChestState = 'closed' | 'selected' | 'opening' | 'opened';

/** 宝箱1つのデータ */
export interface TreasureChestData {
  id: number;
  state: ChestState;
  reward: RewardItem;
}

/** 報酬モード設定 */
export interface RewardModeSettings {
  /** ASD予測可能報酬モード: true の場合、宝箱なしで毎回同じ報酬 */
  predictableMode: boolean;
}

/** 獲得済み報酬（永続化用） */
export interface CollectedReward {
  itemId: string;
  obtainedAt: string; // ISO date string
  count: number;
}

/** 報酬ストア全体 */
export interface RewardStore {
  collectedRewards: CollectedReward[];
  totalBonusStars: number;
}
