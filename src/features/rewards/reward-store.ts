/**
 * RewardStore - 獲得済み報酬の永続化管理
 *
 * localStorage ベースでコレクション状態を保存・読み込み。
 */

import type { RewardItem, RewardStore, CollectedReward, RewardModeSettings } from './types';

const STORE_KEY = 'manas_reward_store_v1';
const MODE_KEY = 'manas_reward_mode_v1';

/** 報酬ストアを読み込む */
export function loadRewardStore(): RewardStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as RewardStore;
  } catch { /* SSR or corrupt data */ }
  return { collectedRewards: [], totalBonusStars: 0 };
}

/** 報酬ストアを保存する */
export function saveRewardStore(store: RewardStore): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch { /* quota */ }
}

/** 報酬を獲得してストアに追加 */
export function collectReward(reward: RewardItem): RewardStore {
  const store = loadRewardStore();
  const today = new Date().toISOString().split('T')[0];

  // ボーナススター加算
  if (reward.type === 'bonus_stars' && reward.bonusStars) {
    store.totalBonusStars += reward.bonusStars;
  }

  // コレクティブル追加（重複ならカウントアップ）
  const existing = store.collectedRewards.find(r => r.itemId === reward.id);
  if (existing) {
    existing.count++;
    existing.obtainedAt = today;
  } else {
    store.collectedRewards.push({
      itemId: reward.id,
      obtainedAt: today,
      count: 1,
    });
  }

  saveRewardStore(store);
  return store;
}

/** 報酬モード設定を読み込む */
export function loadRewardModeSettings(): RewardModeSettings {
  try {
    const raw = localStorage.getItem(MODE_KEY);
    if (raw) return JSON.parse(raw) as RewardModeSettings;
  } catch { /* SSR */ }
  return { predictableMode: false };
}

/** 報酬モード設定を保存する */
export function saveRewardModeSettings(settings: RewardModeSettings): void {
  try {
    localStorage.setItem(MODE_KEY, JSON.stringify(settings));
  } catch { /* quota */ }
}

/** 報酬ストアをリセット（テスト用） */
export function resetRewardStore(): void {
  try {
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(MODE_KEY);
  } catch { /* ignore */ }
}
