/**
 * ティア昇格ロジック
 *
 * プレイ実績をlocalStorageから読み取り、ティア昇格条件を判定する。
 * Supabaseが利用できない環境でもローカルで動作する。
 */

import type { Tier } from './tier-system';
import { saveTier } from './use-tier';

// localStorage キー（session-manager の記録形式に合わせる）
const GAME_RESULTS_KEY = 'manas_session_results_v1';

/** セッション結果の保存形式 */
export interface StoredSessionResult {
  gameId: string;
  accuracy: number; // 0-1
  timestamp: number; // epoch ms
}

/** ティア昇格チェックの入力 */
export interface TierProgressionInput {
  currentTier: Tier;
  gameRecords: StoredSessionResult[];
}

/** ティア昇格チェックの結果 */
export interface TierPromotionResult {
  shouldPromote: boolean;
  nextTier?: Tier;
  reason?: string;
}

/**
 * Tier 1 → Tier 2 の昇格条件
 *
 * Tier 1 ゲーム（ひかりレスキューLv1-3, タッチアドベンチャーLv1-3, たんけんめいろLv1-3）
 * のいずれかで 正答率80%以上のセッションを達成していること。
 */
const TIER1_ELIGIBLE_GAME_IDS: string[] = [
  'hikari-rescue',
  'touch-adventure',
  'tanken-meiro',
];

/**
 * Tier 2 → Tier 3 の昇格条件
 *
 * Tier 2 ゲーム（oboete-susumu, rule-change, kurukuru-puzzle, kotoba-ehon, kimochi-friends）
 * のいずれかで 正答率80%以上のセッションを 2 回以上達成していること。
 */
const TIER2_ELIGIBLE_GAME_IDS: string[] = [
  'oboete-susumu',
  'rule-change',
  'kurukuru-puzzle',
  'kotoba-ehon',
  'kimochi-friends',
];

const ACCURACY_THRESHOLD = 0.8;
const TIER2_REQUIRED_SUCCESSES = 2;

/** ティア昇格条件を満たしているかチェックする */
export function checkTierPromotion(
  input: TierProgressionInput,
): TierPromotionResult {
  const { currentTier, gameRecords } = input;

  if (currentTier === 1) {
    // Tier 1 → Tier 2: Tier 1 ゲームで正答率80%以上を1回達成
    const hasQualifyingRecord = gameRecords.some(
      (r) =>
        TIER1_ELIGIBLE_GAME_IDS.includes(r.gameId) &&
        r.accuracy >= ACCURACY_THRESHOLD,
    );

    if (hasQualifyingRecord) {
      return {
        shouldPromote: true,
        nextTier: 2,
        reason: 'Tier 1 ゲームで正答率80%以上を達成しました',
      };
    }

    return { shouldPromote: false };
  }

  if (currentTier === 2) {
    // Tier 2 → Tier 3: Tier 2 ゲームで正答率80%以上を2回以上達成
    const qualifyingRecords = gameRecords.filter(
      (r) =>
        TIER2_ELIGIBLE_GAME_IDS.includes(r.gameId) &&
        r.accuracy >= ACCURACY_THRESHOLD,
    );

    if (qualifyingRecords.length >= TIER2_REQUIRED_SUCCESSES) {
      return {
        shouldPromote: true,
        nextTier: 3,
        reason: 'Tier 2 ゲームで一貫した成功を達成しました',
      };
    }

    return { shouldPromote: false };
  }

  // Tier 3 は最高ティア
  return { shouldPromote: false };
}

/**
 * localStorageからセッション結果を読み込む
 */
export function loadGameRecords(): StoredSessionResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GAME_RESULTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredSessionResult[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * セッション結果をlocalStorageに保存する
 */
export function saveGameRecord(record: StoredSessionResult): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadGameRecords();
    // 最大100件まで保持（古いものから削除）
    const updated = [...existing, record].slice(-100);
    window.localStorage.setItem(GAME_RESULTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore quota errors
  }
}

/**
 * ゲームセッション終了時にティア昇格チェックを実行し、
 * 昇格条件を満たしていれば新しいティアを保存して返す。
 *
 * @returns 昇格した場合は新しいティア、昇格しなければ undefined
 */
export function tryPromoteTier(
  currentTier: Tier,
  gameId: string,
  accuracy: number,
): Tier | undefined {
  // 現在のセッション結果を記録
  const record: StoredSessionResult = {
    gameId,
    accuracy,
    timestamp: Date.now(),
  };
  saveGameRecord(record);

  // 昇格チェック
  const allRecords = loadGameRecords();
  const result = checkTierPromotion({ currentTier, gameRecords: allRecords });

  if (result.shouldPromote && result.nextTier) {
    saveTier(result.nextTier);
    return result.nextTier;
  }

  return undefined;
}
