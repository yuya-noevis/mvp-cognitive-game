/**
 * AssistLog 型定義
 *
 * 保護者・支援者の介入ログ記録に必要な型。
 * 設計ドキュメント Section 7（保護者への介入支援ログ）に準拠。
 */

import type { InstructionLevel } from '@/features/instruction/instruction-level';
import type { GameId } from '@/types';

// ============================================
// 信頼度フラグ
// ============================================

/**
 * セッションスコアの信頼度。
 * 介入レベルに応じて自動判定される。
 *
 * - high: 介入なし（assist_mode=false）
 * - medium: 介入あり、デモ再視聴1回以下
 * - low: 介入あり、デモ再視聴2回以上
 */
export type ConfidenceFlag = 'high' | 'medium' | 'low';

// ============================================
// AssistLogEntry
// ============================================

/**
 * 1セッション分の介入ログエントリ。
 * セッション終了時に生成される。
 */
export interface AssistLogEntry {
  /** セッションID */
  session_id: string;
  /** ゲームID */
  game_id: GameId;
  /** 匿名子どもID */
  user_id: string;
  /** 介入モードが有効だったか */
  assist_mode: boolean;
  /** デモ再視聴回数 */
  demo_replay_count: number;
  /** 使用された指示レベル */
  instruction_level: InstructionLevel;
  /** セッション長（ミリ秒） */
  session_duration: number;
  /** セッション実施時刻（ISO 8601） */
  time_of_day: string;
  /** デバイス情報 */
  device_info: string;
  /** 信頼度フラグ（介入レベルから自動算出） */
  confidence: ConfidenceFlag;
}

// ============================================
// スコア付き信頼度
// ============================================

/**
 * 信頼度フラグ付きスコア。
 * 介入ありセッションのスコアに付与される。
 */
export interface ScoredWithConfidence {
  /** スコア値（0-1の正答率など） */
  score: number;
  /** 信頼度フラグ */
  confidence: ConfidenceFlag;
}
