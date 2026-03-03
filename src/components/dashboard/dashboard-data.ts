/**
 * Dashboard data layer
 *
 * Aggregates MixedSessionRecord data into structures needed by
 * the parent dashboard: daily summary, weekly trends, monthly best skill.
 *
 * Uses localStorage data from mixed-session-record.ts and
 * cognitive-profile-tracker.ts (buildCategoryScores).
 */

import type { IntegratedGameId, CognitiveCategory } from '@/games/integrated/types';
import type { MixedSessionRecord } from '@/features/session/mixed-session-record';
import { loadMixedSessionRecords } from '@/features/session/mixed-session-record';
import { INTEGRATED_GAME_MAP } from '@/games/integrated';
import { CATEGORIES } from '@/games/integrated/categories';

// ============================================================
// Types
// ============================================================

export interface DailySummaryData {
  date: string; // YYYY-MM-DD
  gamesPlayed: { id: IntegratedGameId; name: string; icon: string }[];
  sessionCount: number;
  totalDurationSec: number;
  overallAccuracy: number;
}

export interface CategoryScoreSnapshot {
  category: CognitiveCategory;
  label: string;
  /** 加重平均正答率 0-100 */
  score: number;
  sampleCount: number;
}

export interface WeeklyTrendPoint {
  weekLabel: string; // e.g. "2/17" (week starting date)
  weekStart: string; // YYYY-MM-DD
  categories: Record<CognitiveCategory, number>; // score per category
  overallAccuracy: number;
}

export interface MonthlyBestSkillData {
  category: CognitiveCategory;
  label: string;
  improvement: number; // percentage points of improvement
  currentScore: number;
}

// ============================================================
// Category label map
// ============================================================

export const CATEGORY_LABELS: Record<CognitiveCategory, string> = {
  'attention-inhibition': 'ちゅうい・よくせい',
  'memory-learning': 'きおく・がくしゅう',
  'flexibility-control': 'じゅうなんせい',
  'perception-spatial': 'ちかく・くうかん',
  'social-language': 'しゃかい・ことば',
};

export const CATEGORY_DISPLAY_NAMES: Record<CognitiveCategory, string> = {
  'attention-inhibition': '注意・抑制',
  'memory-learning': '記憶・学習',
  'flexibility-control': '柔軟性・実行制御',
  'perception-spatial': '知覚・空間・推論',
  'social-language': '社会認知・言語',
};

export const CATEGORY_COLORS: Record<CognitiveCategory, string> = {
  'attention-inhibition': '#8B5CF6',
  'memory-learning': '#4ECDC4',
  'flexibility-control': '#FFD43B',
  'perception-spatial': '#2ED573',
  'social-language': '#FF8FB3',
};

export const ALL_CATEGORIES: CognitiveCategory[] = [
  'attention-inhibition',
  'memory-learning',
  'flexibility-control',
  'perception-spatial',
  'social-language',
];

// ============================================================
// Daily Summary
// ============================================================

function getDateString(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getTodayString(): string {
  return getDateString(Date.now());
}

export function buildDailySummary(dateStr?: string): DailySummaryData {
  const targetDate = dateStr ?? getTodayString();
  const records = loadMixedSessionRecords();

  const todayRecords = records.filter(
    (r) => getDateString(r.timestamp) === targetDate,
  );

  const gamesSet = new Map<IntegratedGameId, { name: string; icon: string }>();
  let totalDurationSec = 0;
  let totalCorrect = 0;
  let totalAttempts = 0;

  for (const rec of todayRecords) {
    totalDurationSec += rec.durationSec;
    totalCorrect += rec.totalCorrect;
    totalAttempts += rec.totalAttempts;

    for (const gid of rec.gameIds) {
      if (!gamesSet.has(gid)) {
        const config = INTEGRATED_GAME_MAP[gid];
        if (config) {
          gamesSet.set(gid, { name: config.name, icon: config.icon });
        }
      }
    }
  }

  return {
    date: targetDate,
    gamesPlayed: Array.from(gamesSet.entries()).map(([id, meta]) => ({
      id,
      ...meta,
    })),
    sessionCount: todayRecords.length,
    totalDurationSec,
    overallAccuracy:
      totalAttempts > 0
        ? Math.round((totalCorrect / totalAttempts) * 100)
        : 0,
  };
}

// ============================================================
// Category Scores (wrapper around cognitive-profile-tracker)
// ============================================================

/**
 * Build 5-category scores from MixedSessionRecord data.
 * Returns all 5 categories, filling 0 for missing ones.
 */
export function buildDashboardCategoryScores(): CategoryScoreSnapshot[] {
  const records = loadMixedSessionRecords();
  return buildCategoryScoresFromRecords(records);
}

export function buildCategoryScoresFromRecords(
  records: MixedSessionRecord[],
): CategoryScoreSnapshot[] {
  const recent = records.slice(0, 10);

  const acc: Record<
    string,
    { weightedSum: number; weightTotal: number; count: number }
  > = {};

  for (let i = 0; i < recent.length; i++) {
    const rec = recent[i];
    if (!rec.perGameAccuracy) continue;

    const weight = recent.length - i;

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

  return ALL_CATEGORIES.map((cat) => {
    const data = acc[cat];
    const catDef = CATEGORIES.find((c) => c.id === cat);
    return {
      category: cat,
      label: CATEGORY_DISPLAY_NAMES[cat],
      score:
        data && data.weightTotal > 0
          ? Math.round((data.weightedSum / data.weightTotal) * 100)
          : 0,
      sampleCount: data?.count ?? 0,
    };
  });
}

// ============================================================
// Weekly Trend
// ============================================================

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Monday = start of week
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Build weekly trend data for the last N weeks.
 * Each week has per-category average accuracy.
 */
export function buildWeeklyTrend(weekCount = 8): WeeklyTrendPoint[] {
  const records = loadMixedSessionRecords();
  return buildWeeklyTrendFromRecords(records, weekCount);
}

export function buildWeeklyTrendFromRecords(
  records: MixedSessionRecord[],
  weekCount = 8,
): WeeklyTrendPoint[] {
  const now = new Date();
  const currentWeekStart = getWeekStart(now);

  // Build week buckets
  const weeks: { start: Date; label: string }[] = [];
  for (let i = weekCount - 1; i >= 0; i--) {
    const ws = new Date(currentWeekStart);
    ws.setDate(ws.getDate() - i * 7);
    weeks.push({
      start: ws,
      label: `${ws.getMonth() + 1}/${ws.getDate()}`,
    });
  }

  return weeks.map((week) => {
    const weekEnd = new Date(week.start);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekRecords = records.filter((r) => {
      const t = r.timestamp;
      return t >= week.start.getTime() && t < weekEnd.getTime();
    });

    // Per-category accuracy
    const catAcc: Record<string, { sum: number; count: number }> = {};
    let totalCorrect = 0;
    let totalAttempts = 0;

    for (const rec of weekRecords) {
      totalCorrect += rec.totalCorrect;
      totalAttempts += rec.totalAttempts;

      if (!rec.perGameAccuracy) continue;
      for (const [gameId, accuracy] of Object.entries(rec.perGameAccuracy)) {
        const config = INTEGRATED_GAME_MAP[gameId as IntegratedGameId];
        if (!config) continue;
        const cat = config.category;
        if (!catAcc[cat]) catAcc[cat] = { sum: 0, count: 0 };
        catAcc[cat].sum += accuracy;
        catAcc[cat].count++;
      }
    }

    const categories = {} as Record<CognitiveCategory, number>;
    for (const cat of ALL_CATEGORIES) {
      const data = catAcc[cat];
      categories[cat] =
        data && data.count > 0
          ? Math.round((data.sum / data.count) * 100)
          : 0;
    }

    return {
      weekLabel: week.label,
      weekStart: getDateString(week.start.getTime()),
      categories,
      overallAccuracy:
        totalAttempts > 0
          ? Math.round((totalCorrect / totalAttempts) * 100)
          : 0,
    };
  });
}

// ============================================================
// Monthly Best Skill
// ============================================================

/**
 * Identify the category with the most improvement this month.
 * Compares first half vs second half of the month's data.
 */
export function buildMonthlyBestSkill(): MonthlyBestSkillData | null {
  const records = loadMixedSessionRecords();
  return buildMonthlyBestSkillFromRecords(records);
}

export function buildMonthlyBestSkillFromRecords(
  records: MixedSessionRecord[],
): MonthlyBestSkillData | null {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const midMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    Math.floor(now.getDate() / 2) || 1,
  );

  const monthRecords = records.filter(
    (r) => r.timestamp >= monthStart.getTime(),
  );
  if (monthRecords.length < 2) return null;

  const earlyRecords = monthRecords.filter(
    (r) => r.timestamp < midMonth.getTime(),
  );
  const lateRecords = monthRecords.filter(
    (r) => r.timestamp >= midMonth.getTime(),
  );

  if (earlyRecords.length === 0 || lateRecords.length === 0) return null;

  function categoryAvg(
    recs: MixedSessionRecord[],
  ): Record<CognitiveCategory, number> {
    const acc: Record<string, { sum: number; count: number }> = {};
    for (const rec of recs) {
      if (!rec.perGameAccuracy) continue;
      for (const [gameId, accuracy] of Object.entries(rec.perGameAccuracy)) {
        const config = INTEGRATED_GAME_MAP[gameId as IntegratedGameId];
        if (!config) continue;
        const cat = config.category;
        if (!acc[cat]) acc[cat] = { sum: 0, count: 0 };
        acc[cat].sum += accuracy;
        acc[cat].count++;
      }
    }
    const result = {} as Record<CognitiveCategory, number>;
    for (const cat of ALL_CATEGORIES) {
      const data = acc[cat];
      result[cat] =
        data && data.count > 0 ? (data.sum / data.count) * 100 : 0;
    }
    return result;
  }

  const earlyAvg = categoryAvg(earlyRecords);
  const lateAvg = categoryAvg(lateRecords);

  let bestCat: CognitiveCategory | null = null;
  let bestImprovement = -Infinity;

  for (const cat of ALL_CATEGORIES) {
    // Only count categories with data in both periods
    if (earlyAvg[cat] === 0 && lateAvg[cat] === 0) continue;
    const improvement = lateAvg[cat] - earlyAvg[cat];
    if (improvement > bestImprovement) {
      bestImprovement = improvement;
      bestCat = cat;
    }
  }

  if (!bestCat || bestImprovement <= 0) return null;

  return {
    category: bestCat,
    label: CATEGORY_DISPLAY_NAMES[bestCat],
    improvement: Math.round(bestImprovement),
    currentScore: Math.round(lateAvg[bestCat]),
  };
}

// ============================================================
// Week-over-week comparison
// ============================================================

export interface WeekComparison {
  category: CognitiveCategory;
  label: string;
  thisWeek: number;
  lastWeek: number;
  change: number; // positive = improvement
}

export function buildWeekComparison(): WeekComparison[] {
  const trend = buildWeeklyTrend(2);
  if (trend.length < 2) return [];

  const lastWeek = trend[0];
  const thisWeek = trend[1];

  return ALL_CATEGORIES.map((cat) => ({
    category: cat,
    label: CATEGORY_DISPLAY_NAMES[cat],
    thisWeek: thisWeek.categories[cat],
    lastWeek: lastWeek.categories[cat],
    change: thisWeek.categories[cat] - lastWeek.categories[cat],
  }));
}
