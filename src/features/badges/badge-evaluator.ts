/**
 * BadgeEvaluator - バッジ判定ロジック
 *
 * 入力データからどのバッジの何ランクを達成しているかを判定する。
 * 重複なし: 同じバッジのより高いランクを達成したら上位のみ表示。
 */

import type { BadgeCategory, BadgeRank, EarnedBadge, BadgeEvaluationInput, BadgeStore } from './types';
import { BADGE_DEFINITIONS } from './badge-definitions';

const STORAGE_KEY = 'manas_badge_store_v1';

/** カテゴリIDから判定に使うaccuracy keyへのマッピング */
const CATEGORY_ACCURACY_MAP: Record<string, string> = {
  'strength-attention': 'attention-inhibition',
  'strength-memory': 'memory-learning',
  'strength-flexibility': 'flexibility-control',
  'strength-perception': 'perception-spatial',
  'strength-social': 'social-language',
};

/** ランクの順序 (高い方が後) */
const RANK_ORDER: BadgeRank[] = ['bronze', 'silver', 'gold'];

/**
 * バッジIDに対応する入力値を取得
 */
function getValueForBadge(badgeId: string, input: BadgeEvaluationInput): number {
  switch (badgeId) {
    case 'play-count':
      return input.totalSessionCount;
    case 'play-days':
      return input.totalPlayDays;
    case 'all-games':
      return input.uniqueGamesPlayed;
    case 'streak':
      return input.currentStreakDays;
    case 'tier-up':
      return input.maxTierReached;
    case 'first-session':
      return input.totalSessionCount >= 1 ? 1 : 0;
    default: {
      // Discovery badges: category accuracy (0-1 → 0-100)
      const categoryKey = CATEGORY_ACCURACY_MAP[badgeId];
      if (categoryKey && input.categoryAccuracies[categoryKey] !== undefined) {
        return Math.round(input.categoryAccuracies[categoryKey] * 100);
      }
      return 0;
    }
  }
}

/**
 * 全バッジを評価して達成済みバッジリストを返す
 *
 * 各バッジの最高達成ランクのみを返す (スタック: bronze → silver → gold)
 */
export function evaluateBadges(input: BadgeEvaluationInput): EarnedBadge[] {
  const today = new Date().toISOString().split('T')[0];
  const earned: EarnedBadge[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    const value = getValueForBadge(badge.id, input);

    // 最高ランクを判定（goldから降順チェック）
    let highestRank: BadgeRank | null = null;
    for (let i = RANK_ORDER.length - 1; i >= 0; i--) {
      const rank = RANK_ORDER[i];
      if (value >= badge.criteria[rank].threshold) {
        highestRank = rank;
        break;
      }
    }

    if (highestRank) {
      earned.push({
        badgeId: badge.id,
        rank: highestRank,
        earnedAt: today,
      });
    }
  }

  return earned;
}

/**
 * 前回のバッジ状態と比較して新しく解放されたバッジを検出
 */
export function detectNewBadges(
  previousBadges: EarnedBadge[],
  currentBadges: EarnedBadge[],
): EarnedBadge[] {
  const prevMap = new Map(previousBadges.map(b => [`${b.badgeId}-${b.rank}`, b]));
  return currentBadges.filter(b => !prevMap.has(`${b.badgeId}-${b.rank}`));
}

/**
 * バッジストアを読み込む
 */
export function loadBadgeStore(): BadgeStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BadgeStore;
  } catch { /* SSR */ }
  return { earnedBadges: [] };
}

/**
 * バッジストアを保存する
 */
export function saveBadgeStore(store: BadgeStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch { /* quota */ }
}

/**
 * バッジを評価してストアを更新し、新しいバッジがあれば返す
 */
export function updateBadges(input: BadgeEvaluationInput): {
  allBadges: EarnedBadge[];
  newBadges: EarnedBadge[];
} {
  const store = loadBadgeStore();
  const currentBadges = evaluateBadges(input);
  const newBadges = detectNewBadges(store.earnedBadges, currentBadges);

  // ストアを更新
  const updatedStore: BadgeStore = { earnedBadges: currentBadges };
  saveBadgeStore(updatedStore);

  return { allBadges: currentBadges, newBadges };
}

/**
 * バッジストアをリセット (テスト用)
 */
export function resetBadgeStore(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

/**
 * カテゴリ別にバッジをグループ化
 */
export function groupBadgesByCategory(
  badges: EarnedBadge[],
): Record<BadgeCategory, EarnedBadge[]> {
  const result: Record<BadgeCategory, EarnedBadge[]> = {
    effort: [],
    growth: [],
    discovery: [],
    special: [],
  };

  for (const badge of badges) {
    const def = BADGE_DEFINITIONS.find(d => d.id === badge.badgeId);
    if (def) {
      result[def.category].push(badge);
    }
  }

  return result;
}
