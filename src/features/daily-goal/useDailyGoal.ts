/**
 * useDailyGoal — きょうのめあて（Daily Goal）
 *
 * 3段階のゴール設定:
 * - ちょっとだけ (1ゲーム)
 * - ふつう (2ゲーム) ← デフォルト
 * - たくさん (3ゲーム)
 *
 * localStorage で選択とその日の完了数を保持。
 * 日付が変わると completed がリセットされる。
 */

const STORAGE_KEY = 'manas_daily_goal_v1';

export type GoalLevel = 'little' | 'normal' | 'lots';

export interface DailyGoalData {
  level: GoalLevel;
  target: number;
  completed: number;
  date: string; // YYYY-MM-DD
}

export const GOAL_OPTIONS: { level: GoalLevel; label: string; emoji: string; target: number }[] = [
  { level: 'little', label: 'ちょっとだけ', emoji: '🌱', target: 1 },
  { level: 'normal', label: 'ふつう', emoji: '🌿', target: 2 },
  { level: 'lots', label: 'たくさん', emoji: '🌳', target: 3 },
];

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getTarget(level: GoalLevel): number {
  return GOAL_OPTIONS.find(o => o.level === level)?.target ?? 2;
}

interface PersistedGoal {
  level: GoalLevel;
  completed: number;
  date: string;
}

function loadPersisted(): PersistedGoal | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedGoal;
  } catch {
    return null;
  }
}

function savePersisted(state: PersistedGoal): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* SSR / quota */ }
}

/**
 * 今日のゴール状態を読み取る。
 * 日付が変わった場合は completed をリセットし、level は引き継ぐ。
 */
export function loadDailyGoal(): DailyGoalData {
  const today = toDateStr(new Date());
  const persisted = loadPersisted();

  if (!persisted) {
    // 初回: デフォルト「ふつう」
    return { level: 'normal', target: 2, completed: 0, date: today };
  }

  // 日付が変わっていたらcompletedリセット
  if (persisted.date !== today) {
    const fresh: PersistedGoal = { level: persisted.level, completed: 0, date: today };
    savePersisted(fresh);
    return { level: fresh.level, target: getTarget(fresh.level), completed: 0, date: today };
  }

  return {
    level: persisted.level,
    target: getTarget(persisted.level),
    completed: persisted.completed,
    date: persisted.date,
  };
}

/**
 * ゴールレベルを変更する。
 */
export function setDailyGoalLevel(level: GoalLevel): DailyGoalData {
  const today = toDateStr(new Date());
  const persisted = loadPersisted();
  const completed = persisted?.date === today ? persisted.completed : 0;

  const next: PersistedGoal = { level, completed, date: today };
  savePersisted(next);

  return { level, target: getTarget(level), completed, date: today };
}

/**
 * ゲーム完了を記録する。
 * セッション完了時に呼び出す。
 *
 * @returns 更新後のデータ + ゴール達成したかどうか
 */
export function recordGameCompletion(): { goal: DailyGoalData; justAchieved: boolean } {
  const today = toDateStr(new Date());
  const persisted = loadPersisted() ?? { level: 'normal' as GoalLevel, completed: 0, date: today };

  // 日付が変わっていたらリセット
  const completed = persisted.date === today ? persisted.completed + 1 : 1;
  const level = persisted.level;
  const target = getTarget(level);

  const next: PersistedGoal = { level, completed, date: today };
  savePersisted(next);

  const goal: DailyGoalData = { level, target, completed, date: today };
  const justAchieved = completed === target;

  return { goal, justAchieved };
}
