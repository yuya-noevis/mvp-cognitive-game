export type {
  RewardType,
  RewardRarity,
  CollectibleCategory,
  RewardItem,
  ChestState,
  TreasureChestData,
  RewardModeSettings,
  CollectedReward,
  RewardStore,
} from './types';

export {
  REWARD_POOL,
  getRarityProbabilities,
  rollRarity,
  pickRewardByRarity,
  rollTreasureChests,
  PREDICTABLE_REWARD,
} from './reward-table';

export {
  loadRewardStore,
  saveRewardStore,
  collectReward,
  loadRewardModeSettings,
  saveRewardModeSettings,
  resetRewardStore,
} from './reward-store';

export { useRewards } from './useRewards';

export type { GrowthLevel, PlantGrowthInfo } from './plant-growth';
export {
  getPlantGrowthInfo,
  calculateXpMultiplier,
  applyGrowthXpBonus,
  calculateGrowthLevel,
} from './plant-growth';
