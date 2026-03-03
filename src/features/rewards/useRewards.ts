/**
 * useRewards - 報酬システム React Hook
 *
 * 宝箱UIの状態管理 + 報酬獲得 + 予測可能モード対応
 */

import { useState, useCallback, useMemo } from 'react';
import type { RewardItem, TreasureChestData, ChestState } from './types';
import { rollTreasureChests, PREDICTABLE_REWARD } from './reward-table';
import { collectReward, loadRewardModeSettings, loadRewardStore } from './reward-store';

interface UseRewardsOptions {
  /** 植物の成長レベル (1-5) */
  growthLevel?: number;
}

interface UseRewardsReturn {
  /** 宝箱3つのデータ */
  chests: TreasureChestData[];
  /** 選択した報酬（開封後） */
  selectedReward: RewardItem | null;
  /** 予測可能モードかどうか */
  isPredictableMode: boolean;
  /** 宝箱を選択して開封する */
  selectChest: (chestId: number) => void;
  /** 開封アニメーション完了後に呼ぶ（報酬をストアに保存） */
  confirmReward: () => void;
  /** 獲得済みボーナススター合計 */
  totalBonusStars: number;
  /** 宝箱フローをリセット（次のセッション用） */
  reset: () => void;
}

export function useRewards({ growthLevel = 1 }: UseRewardsOptions = {}): UseRewardsReturn {
  const modeSettings = useMemo(() => loadRewardModeSettings(), []);
  const isPredictableMode = modeSettings.predictableMode;

  const [chests, setChests] = useState<TreasureChestData[]>(() => {
    if (isPredictableMode) {
      // 予測可能モード: 宝箱は表示しない（固定報酬）
      return [];
    }
    const [r1, r2, r3] = rollTreasureChests(growthLevel);
    return [
      { id: 0, state: 'closed' as ChestState, reward: r1 },
      { id: 1, state: 'closed' as ChestState, reward: r2 },
      { id: 2, state: 'closed' as ChestState, reward: r3 },
    ];
  });

  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(
    isPredictableMode ? PREDICTABLE_REWARD : null,
  );

  const [totalBonusStars, setTotalBonusStars] = useState(() => loadRewardStore().totalBonusStars);

  const selectChest = useCallback((chestId: number) => {
    if (isPredictableMode) return;

    setChests(prev =>
      prev.map(chest => ({
        ...chest,
        state: chest.id === chestId ? 'opening' : chest.state === 'closed' ? 'closed' : chest.state,
      })),
    );

    // Short delay for animation before revealing
    setTimeout(() => {
      setChests(prev => {
        const selected = prev.find(c => c.id === chestId);
        if (selected) setSelectedReward(selected.reward);
        return prev.map(chest => ({
          ...chest,
          state: chest.id === chestId ? 'opened' : 'closed',
        }));
      });
    }, 600);
  }, [isPredictableMode]);

  const confirmReward = useCallback(() => {
    if (selectedReward) {
      const store = collectReward(selectedReward);
      setTotalBonusStars(store.totalBonusStars);
    }
  }, [selectedReward]);

  const reset = useCallback(() => {
    if (isPredictableMode) {
      setSelectedReward(PREDICTABLE_REWARD);
      return;
    }
    const [r1, r2, r3] = rollTreasureChests(growthLevel);
    setChests([
      { id: 0, state: 'closed', reward: r1 },
      { id: 1, state: 'closed', reward: r2 },
      { id: 2, state: 'closed', reward: r3 },
    ]);
    setSelectedReward(null);
  }, [growthLevel, isPredictableMode]);

  return {
    chests,
    selectedReward,
    isPredictableMode,
    selectChest,
    confirmReward,
    totalBonusStars,
    reset,
  };
}
