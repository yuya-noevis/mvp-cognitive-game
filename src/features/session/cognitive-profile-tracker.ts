import type { IntegratedGameId, CognitiveCategory } from '@/games/integrated/types';
import { INTEGRATED_GAME_MAP } from '@/games/integrated';
import { CATEGORIES } from '@/games/integrated/categories';
import { loadMixedSessionRecords } from './mixed-session-record';

const RECENT_SESSION_COUNT = 10;

interface CategoryScore {
  category: CognitiveCategory;
  weightedAccuracy: number;
  sampleCount: number;
}

/**
 * 直近セッションの perGameAccuracy からカテゴリ別加重平均正答率を算出。
 * 新しいセッションほど重みが大きい (線形減衰)。
 */
export function buildCategoryScores(): CategoryScore[] {
  const records = loadMixedSessionRecords().slice(0, RECENT_SESSION_COUNT);
  if (records.length === 0) return [];

  // category → { weightedSum, weightTotal }
  const acc: Record<string, { weightedSum: number; weightTotal: number; count: number }> = {};

  for (let i = 0; i < records.length; i++) {
    const rec = records[i];
    if (!rec.perGameAccuracy) continue;

    // Recency weight: most recent = records.length, oldest = 1
    const weight = records.length - i;

    for (const [gameId, accuracy] of Object.entries(rec.perGameAccuracy)) {
      const config = INTEGRATED_GAME_MAP[gameId as IntegratedGameId];
      if (!config) continue;
      const cat = config.category;
      if (!acc[cat]) acc[cat] = { weightedSum: 0, weightTotal: 0, count: 0 };
      acc[cat].weightedSum += accuracy * weight;
      acc[cat].weightTotal += weight;
      acc[cat].count++;
    }
  }

  return Object.entries(acc).map(([cat, { weightedSum, weightTotal, count }]) => ({
    category: cat as CognitiveCategory,
    weightedAccuracy: weightTotal > 0 ? weightedSum / weightTotal : 0,
    sampleCount: count,
  }));
}

/**
 * ゲーム候補に対して認知プロファイルベースの重みを返す。
 * 弱いカテゴリのゲーム → 3, 中 → 2, 強 → 1
 */
export function buildGameSelectionWeights(
  candidates: IntegratedGameId[],
): Record<IntegratedGameId, number> {
  const scores = buildCategoryScores();
  const weights: Record<string, number> = {};

  // No data yet → equal weights
  if (scores.length === 0) {
    for (const id of candidates) weights[id] = 1;
    return weights as Record<IntegratedGameId, number>;
  }

  // Sort by accuracy ascending
  const sorted = [...scores].sort((a, b) => a.weightedAccuracy - b.weightedAccuracy);
  const categoryWeight: Record<string, number> = {};

  for (let i = 0; i < sorted.length; i++) {
    const ratio = sorted.length > 1 ? i / (sorted.length - 1) : 0.5;
    // Bottom third → 3, middle → 2, top → 1
    if (ratio < 0.33) {
      categoryWeight[sorted[i].category] = 3;
    } else if (ratio < 0.67) {
      categoryWeight[sorted[i].category] = 2;
    } else {
      categoryWeight[sorted[i].category] = 1;
    }
  }

  for (const id of candidates) {
    const cat = getCategoryForGameId(id);
    weights[id] = categoryWeight[cat] ?? 1;
  }

  return weights as Record<IntegratedGameId, number>;
}

function getCategoryForGameId(gameId: IntegratedGameId): string {
  for (const cat of CATEGORIES) {
    if (cat.gameIds.includes(gameId)) return cat.id;
  }
  return 'unknown';
}
