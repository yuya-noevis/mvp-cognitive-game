/**
 * Badge System Types - マイルストーンバッジ型定義
 *
 * 4種類: 努力 (effort) / 成長 (growth) / 発見 (discovery) / 特別 (special)
 * 3ランク: ブロンズ → シルバー → ゴールド (スタック)
 */

/** バッジカテゴリ */
export type BadgeCategory = 'effort' | 'growth' | 'discovery' | 'special';

/** バッジランク (昇順でスタック) */
export type BadgeRank = 'bronze' | 'silver' | 'gold';

/** バッジ定義 */
export interface BadgeDefinition {
  id: string;
  category: BadgeCategory;
  name: string;
  description: string;
  icon: string;
  /** ランクごとの達成条件 */
  criteria: Record<BadgeRank, BadgeCriteria>;
}

/** バッジの達成条件 */
export interface BadgeCriteria {
  /** 達成に必要な数値（プレイ回数、日数など） */
  threshold: number;
  /** 条件の説明文 */
  label: string;
}

/** 獲得済みバッジレコード */
export interface EarnedBadge {
  badgeId: string;
  rank: BadgeRank;
  earnedAt: string; // ISO date string
}

/** バッジストア全体 */
export interface BadgeStore {
  earnedBadges: EarnedBadge[];
}

/** バッジ判定用の入力データ */
export interface BadgeEvaluationInput {
  /** 累計プレイ回数 */
  totalSessionCount: number;
  /** 累計プレイ日数 */
  totalPlayDays: number;
  /** 体験済みゲーム数 */
  uniqueGamesPlayed: number;
  /** 全ゲーム数 */
  totalGamesAvailable: number;
  /** 現在のティア */
  currentTier: number;
  /** 最高到達ティア */
  maxTierReached: number;
  /** カテゴリ別の加重正答率 (0-1) */
  categoryAccuracies: Record<string, number>;
  /** 連続プレイ日数（現在のストリーク） */
  currentStreakDays: number;
}
