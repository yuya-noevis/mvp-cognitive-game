/**
 * 障害種別ごとのDDAプロファイル定義
 *
 * 科学的根拠に基づくターゲット正答率と閾値:
 * - ASD: 失敗回避傾向が強く、成功体験重視（80-90%）
 * - ADHD: 適度な挑戦で飽き防止（70-85%）
 * - ID重度: 学習性無力感防止（85-95%）
 * - ID中度/軽度: ASDに準じる（80-90%）
 * - 定型: 天井・床効果回避（70-80%）
 * - unknown: 中間値（75-85%）
 */

export type DisabilityType =
  | 'asd'
  | 'adhd'
  | 'id-severe'
  | 'id-moderate'
  | 'id-mild'
  | 'typical'
  | 'unknown';

export interface DDAProfile {
  disabilityType: DisabilityType;
  targetAccuracyMin: number;
  targetAccuracyMax: number;
  /** 難化に必要なwindow境界超過回数（現在はboundary-cross検出で使用） */
  difficultyUpThreshold: number;
  /** 易化に必要なwindow境界超過回数 */
  difficultyDownThreshold: number;
  /** 即時易化の連続失敗回数 */
  emergencyEaseThreshold: number;
}

export const DDA_PROFILES: Record<DisabilityType, DDAProfile> = {
  'asd': {
    disabilityType: 'asd',
    targetAccuracyMin: 0.80,
    targetAccuracyMax: 0.90,
    difficultyUpThreshold: 2,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 2,
  },
  'adhd': {
    disabilityType: 'adhd',
    targetAccuracyMin: 0.70,
    targetAccuracyMax: 0.85,
    difficultyUpThreshold: 2,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 3,
  },
  'id-severe': {
    disabilityType: 'id-severe',
    targetAccuracyMin: 0.85,
    targetAccuracyMax: 0.95,
    difficultyUpThreshold: 3,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 2,
  },
  'id-moderate': {
    disabilityType: 'id-moderate',
    targetAccuracyMin: 0.80,
    targetAccuracyMax: 0.90,
    difficultyUpThreshold: 2,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 3,
  },
  'id-mild': {
    disabilityType: 'id-mild',
    targetAccuracyMin: 0.80,
    targetAccuracyMax: 0.90,
    difficultyUpThreshold: 2,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 3,
  },
  'typical': {
    disabilityType: 'typical',
    targetAccuracyMin: 0.70,
    targetAccuracyMax: 0.80,
    difficultyUpThreshold: 2,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 3,
  },
  'unknown': {
    disabilityType: 'unknown',
    targetAccuracyMin: 0.75,
    targetAccuracyMax: 0.85,
    difficultyUpThreshold: 2,
    difficultyDownThreshold: 1,
    emergencyEaseThreshold: 3,
  },
};
