/**
 * NeedCalculator - 支援優先度 Need 算出
 *
 * Need (0-100): 次に優先支援すべき度合い
 *
 * 算出ロジック (from prompt-3):
 *   need += (100 - score) * 0.35
 *   if trend === 'declining': need += 20
 *   else if trend === 'stable': need += 5
 *   need += min(20, lastPlayedDaysAgo * 4)
 *   if load > 70: need -= 15  // 負荷高 → 休ませるべき
 *   if confidence === 'low': need += 10  // データ不足 → 収集優先
 */

import type { DomainScore, ScoreConfidence, ScoreTrend } from '@/types';

/**
 * Calculate Need score for a single domain.
 */
export function calculateNeed(
  score: number,
  confidence: ScoreConfidence,
  load: number,
  trend: ScoreTrend,
  lastPlayedDaysAgo: number,
): number {
  let need = 0;

  // Low score → higher need
  need += (100 - score) * 0.35;

  // Declining trend → much higher need
  if (trend === 'declining') need += 20;
  else if (trend === 'stable') need += 5;

  // Not played recently → higher need (max +20)
  need += Math.min(20, lastPlayedDaysAgo * 4);

  // High load → reduce need (child should rest)
  if (load > 70) need -= 15;

  // Low confidence → slightly higher need (need more data)
  if (confidence === 'low') need += 10;

  return Math.min(100, Math.max(0, Math.round(need)));
}

/**
 * Calculate Need for all domain scores and return sorted priority list.
 * Highest need first.
 */
export function calculateNeedPriority(
  domainScores: DomainScore[],
  lastPlayedDaysAgoMap: Record<string, number>,
): DomainScore[] {
  return domainScores
    .map(ds => ({
      ...ds,
      need: calculateNeed(
        ds.score,
        ds.confidence,
        ds.load,
        ds.scoreTrend,
        lastPlayedDaysAgoMap[ds.domain] ?? 7,
      ),
    }))
    .sort((a, b) => b.need - a.need);
}

/**
 * Get the top N domains by Need (for "きょうのおすすめ").
 */
export function getTopNeedDomains(
  domainScores: DomainScore[],
  lastPlayedDaysAgoMap: Record<string, number>,
  n: number = 3,
): DomainScore[] {
  return calculateNeedPriority(domainScores, lastPlayedDaysAgoMap).slice(0, n);
}
