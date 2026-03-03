import type { GameId, CognitiveDomain } from '@/types';
import type { DisabilityType } from '@/features/dda/disability-profile';

// ============================================
// WeakPattern - 苦手パターンのデータモデル
// ============================================

/**
 * 苦手パターン: セッション内で不正解だった問題の記録
 *
 * 間隔反復エンジンの最小管理単位。
 * 不正解パターンはゲームID + ドメイン + 刺激情報で一意に識別される。
 */
export interface WeakPattern {
  /** 一意識別子 (gameId:domain:patternKey) */
  id: string;
  /** ゲームID */
  gameId: GameId;
  /** 認知ドメイン */
  domain: CognitiveDomain;
  /** パターンキー（刺激を識別する文字列、例: "level3:distractor2"） */
  patternKey: string;
  /** 刺激情報（再出題時に使用） */
  stimulus: Record<string, unknown>;
  /** 正解情報 */
  correctAnswer: Record<string, unknown>;
  /** 現在の難易度パラメータ */
  difficulty: Record<string, unknown>;
  /** 初回不正解日時 (ms) */
  createdAt: number;
  /** 最終出題日時 (ms) */
  lastTestedAt: number;
  /** 連続正解数 */
  consecutiveCorrect: number;
  /** 連続不正解数 */
  consecutiveIncorrect: number;
  /** 総出題回数 */
  totalAttempts: number;
  /** 総正解回数 */
  totalCorrect: number;
  /** Half-Life: 記憶の半減期（時間） */
  halfLifeHours: number;
  /** 次回出題予定日時 (ms) */
  nextReviewAt: number;
  /** パターンが習熟済みか（連続3回正解で卒業） */
  isMastered: boolean;
  /** ASD用: 刺激フォーマット固定フラグ */
  fixedStimulusFormat: boolean;
}

// ============================================
// セッション内再出題
// ============================================

/**
 * セッション内の不正解記録
 * セッション末尾での再出題に使用
 */
export interface InSessionMiss {
  /** パターンキー */
  patternKey: string;
  /** ゲームID */
  gameId: GameId;
  /** ドメイン */
  domain: CognitiveDomain;
  /** 刺激情報 */
  stimulus: Record<string, unknown>;
  /** 正解情報 */
  correctAnswer: Record<string, unknown>;
  /** 難易度 */
  difficulty: Record<string, unknown>;
  /** 不正解時の試行番号 */
  trialNumber: number;
}

// ============================================
// 障害別補正パラメータ
// ============================================

/**
 * 障害種別ごとの間隔反復補正パラメータ
 *
 * 設計根拠（game-design-v3.md Section 13）:
 * - ID: 間隔を短く（base_interval x 0.7, max_interval x 0.5）
 * - ADHD: 標準（base_interval x 1.0）
 * - ASD: 間隔は標準だが、刺激フォーマットを固定
 */
export interface DisabilityRepetitionProfile {
  /** 基本間隔の乗数 */
  baseIntervalMultiplier: number;
  /** 最大間隔の乗数 */
  maxIntervalMultiplier: number;
  /** 刺激フォーマット固定フラグ（ASD向け） */
  fixStimulusFormat: boolean;
}

// ============================================
// ユニットレビュー（ボス戦）
// ============================================

/**
 * ユニットレビュー用の試行情報
 * 5セッション目で過去4セッションの苦手要素を集約して再テスト
 */
export interface ReviewTrial {
  /** 対象の苦手パターン */
  weakPattern: WeakPattern;
  /** 優先度スコア（高いほど復習が必要） */
  priorityScore: number;
}

// ============================================
// スケジュール
// ============================================

/**
 * 次回セッションのスケジュール情報
 */
export interface RepetitionSchedule {
  /** 復習が必要なパターンの数 */
  duePatternCount: number;
  /** 最も早い復習予定日時 (ms) */
  earliestDueAt: number | null;
  /** 復習パターン一覧（優先度順） */
  duePatterns: WeakPattern[];
}

/**
 * 間隔反復エンジンの状態（永続化用）
 */
export interface SpacedRepetitionState {
  /** 全苦手パターン */
  weakPatterns: WeakPattern[];
  /** セッション内不正解記録 */
  inSessionMisses: InSessionMiss[];
  /** 現在のセッション番号（ユニット内） */
  sessionInUnit: number;
  /** 障害種別 */
  disabilityType: DisabilityType;
}

// ============================================
// エンジン設定定数
// ============================================

/** パターン卒業に必要な連続正解数 */
export const MASTERY_CONSECUTIVE_CORRECT = 3;

/** セッション末尾再出題の最大数 */
export const MAX_IN_SESSION_RETRIES = 5;

/** ユニットレビューで出題する最大パターン数 */
export const MAX_REVIEW_PATTERNS = 10;

/** 1ユニット内のセッション数 */
export const SESSIONS_PER_UNIT = 5;
