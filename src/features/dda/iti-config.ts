/**
 * ITI（試行間インターバル）障害別設定
 *
 * 科学的根拠:
 * - ADHD: 短いITIで注意を持続させる（Rapport et al., 2001）
 * - ASD: 感覚処理の時間的余裕を確保（Marco et al., 2011）
 * - ID重度: 十分な情報処理時間（Matson & Shoemaker, 2009）
 * - ID中度/軽度: ASDに準じる中間値
 *
 * ITIはランダムな範囲内で均等分布とし、
 * 予測不可能性を適度に保ちながら過度な刺激を避ける。
 */

import type { DisabilityType } from './disability-profile';

export interface ITIRange {
  /** 最小インターバル（ms） */
  min: number;
  /** 最大インターバル（ms） */
  max: number;
}

/** 障害種別ごとの ITI 設定 */
export const ITI_BY_DISABILITY: Record<DisabilityType, ITIRange> = {
  adhd:       { min: 1000, max: 1500 },
  asd:        { min: 1500, max: 2000 },
  'id-mild':  { min: 2000, max: 2500 },
  'id-moderate': { min: 2000, max: 2500 },
  'id-severe': { min: 3000, max: 4000 },
  typical:    { min:  800, max: 1200 },
  unknown:    { min: 1200, max: 1800 },
};

/** デフォルト ITI（障害種別未設定時） */
export const DEFAULT_ITI_MS = 1500;

/**
 * 指定した障害種別に対応する ITI（ms）をランダムに生成する。
 *
 * @param disabilityType - 障害種別。未指定またはunknownの場合はデフォルト値を使用
 * @returns ランダムなITI（ms）
 */
export function getITI(disabilityType?: DisabilityType): number {
  if (!disabilityType) return DEFAULT_ITI_MS;
  const range = ITI_BY_DISABILITY[disabilityType];
  if (!range) return DEFAULT_ITI_MS;
  return Math.round(range.min + Math.random() * (range.max - range.min));
}

/**
 * Promise ベースの ITI 待機関数。
 * ゲームのトライアルループで await して使用する。
 *
 * @example
 * // トライアル完了後
 * await waitITI(disabilityType);
 * // 次のトライアル開始
 * startNextTrial();
 *
 * @param disabilityType - 障害種別
 * @returns ITI 待機完了を示す Promise
 */
export function waitITI(disabilityType?: DisabilityType): Promise<void> {
  const ms = getITI(disabilityType);
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * useGameSession の completeTrial コールバック後に
 * ITI 待機を挿入するラッパーファクトリー。
 *
 * @param completeTrial - useGameSession の completeTrial 関数
 * @param disabilityType - 障害種別
 * @returns ITI 込みの completeTrial 関数
 */
export function withITI<T>(
  completeTrial: (isCorrect: boolean) => T,
  disabilityType?: DisabilityType,
  onITIEnd?: () => void,
): (isCorrect: boolean) => T {
  return (isCorrect: boolean): T => {
    const result = completeTrial(isCorrect);
    const ms = getITI(disabilityType);
    setTimeout(() => {
      onITIEnd?.();
    }, ms);
    return result;
  };
}
