/**
 * 信頼度フラグ判定ロジック
 *
 * 設計ドキュメント Section 7 に基づく信頼度判定:
 * - assist_mode=false → confidence: 'high'
 * - assist_mode=true かつ demo_replay_count <= 1 → confidence: 'medium'
 * - assist_mode=true かつ demo_replay_count > 1 → confidence: 'low'
 */

import type { ConfidenceFlag, ScoredWithConfidence } from './types';

/**
 * 介入状態に基づいて信頼度フラグを算出する。
 *
 * @param assistMode - 介入モードが有効か
 * @param demoReplayCount - デモ再視聴回数
 * @returns 信頼度フラグ
 */
export function computeConfidence(
  assistMode: boolean,
  demoReplayCount: number,
): ConfidenceFlag {
  if (!assistMode) {
    return 'high';
  }
  if (demoReplayCount <= 1) {
    return 'medium';
  }
  return 'low';
}

/**
 * スコアに信頼度フラグを付与する。
 *
 * @param score - スコア値（例: 正答率 0.0-1.0）
 * @param assistMode - 介入モードが有効か
 * @param demoReplayCount - デモ再視聴回数
 * @returns 信頼度フラグ付きスコア
 */
export function scoreWithConfidence(
  score: number,
  assistMode: boolean,
  demoReplayCount: number,
): ScoredWithConfidence {
  return {
    score,
    confidence: computeConfidence(assistMode, demoReplayCount),
  };
}
