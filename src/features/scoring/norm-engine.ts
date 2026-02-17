/**
 * NormEngine - 年齢帯基準値による内部正規化
 *
 * 内部的に年齢帯の基準値（norm）で正規化するが、
 * ユーザーには一切表示しない。
 *
 * ⚠️ 平均値、偏差値、順位、他児比較は表示禁止。
 * スコアは「この子自身の変化」のみを追跡する。
 */

import type { AgeGroup } from '@/types';

/** Internal norm values per age band (NOT shown to users) */
interface AgeNorms {
  /** Baseline accuracy for age group */
  baselineAccuracy: number;
  /** Baseline reaction time (ms) for age group */
  baselineReactionTimeMs: number;
  /** Baseline max difficulty level */
  baselineMaxLevel: number;
}

const AGE_NORMS: Record<AgeGroup, AgeNorms> = {
  '3-5': {
    baselineAccuracy: 0.60,
    baselineReactionTimeMs: 3000,
    baselineMaxLevel: 2,
  },
  '6-9': {
    baselineAccuracy: 0.70,
    baselineReactionTimeMs: 2000,
    baselineMaxLevel: 3,
  },
  '10-15': {
    baselineAccuracy: 0.80,
    baselineReactionTimeMs: 1500,
    baselineMaxLevel: 5,
  },
};

/**
 * Normalize a raw accuracy to 0-100 scale based on age norms.
 * Score 50 = age-typical performance.
 */
export function normalizeAccuracy(rawAccuracy: number, ageGroup: AgeGroup): number {
  const norms = AGE_NORMS[ageGroup];
  // Map: baseline = 50, perfect (1.0) = 100
  const ratio = rawAccuracy / norms.baselineAccuracy;
  const score = Math.min(100, Math.max(0, ratio * 50));
  return Math.round(score);
}

/**
 * Normalize reaction time to 0-100 (lower RT = higher score).
 */
export function normalizeReactionTime(rtMs: number, ageGroup: AgeGroup): number {
  const norms = AGE_NORMS[ageGroup];
  // Faster than baseline = higher score
  // baseline = 50, instant (0ms) = 100, 2x baseline = 0
  const ratio = 1 - (rtMs / (norms.baselineReactionTimeMs * 2));
  const score = Math.min(100, Math.max(0, ratio * 100));
  return Math.round(score);
}

/**
 * Normalize difficulty level reached to 0-100.
 */
export function normalizeDifficultyLevel(level: number, ageGroup: AgeGroup): number {
  const norms = AGE_NORMS[ageGroup];
  const ratio = level / norms.baselineMaxLevel;
  const score = Math.min(100, Math.max(0, ratio * 50));
  return Math.round(score);
}

/**
 * Get age norms (internal use only, never expose to UI).
 */
export function getAgeNorms(ageGroup: AgeGroup): AgeNorms {
  return AGE_NORMS[ageGroup];
}
