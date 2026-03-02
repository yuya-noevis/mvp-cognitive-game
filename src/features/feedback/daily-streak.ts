/**
 * DailyStreak - 日次プレイ連続ストリーク管理
 *
 * 設計方針:
 * - 7日以上連続でプレイした場合、週1回の「猶予日」を付与
 * - 猶予日: 1日休んでもストリークと成長レベルを維持
 * - 毎週月曜日に猶予使用フラグをリセット
 * - 成長レベル: 1〜5（花の成長をイメージ）
 */

export interface DailyStreak {
  currentDays: number;
  growthLevel: 1 | 2 | 3 | 4 | 5;
  lastPlayedDate: string; // YYYY-MM-DD
  graceAvailableThisWeek: boolean;
  graceUsedThisWeek: boolean;
}

export interface DailyStreakState {
  streak: DailyStreak;
  /** 猶予を使って休みを乗り越えたか（今回初めて猶予を消費した場合 true） */
  graceConsumedToday: boolean;
  /** 本日はじめてのプレイで表示するメッセージ */
  sessionStartMessage: string | null;
}

const GRACE_UNLOCK_DAYS = 7;
const MAX_GROWTH_LEVEL = 5 as const;
const MIN_GROWTH_LEVEL = 1 as const;
const STORAGE_KEY = 'manas_daily_streak_v1';

/** YYYY-MM-DD 形式の今日の日付を返す */
function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** 月曜日を週の起点とした ISO 週番号文字列 (YYYY-Www) */
function toWeekStr(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  // Day of week: 0=Sun,1=Mon,...,6=Sat
  const day = d.getUTCDay();
  // Shift so Monday = 0
  const diff = (day + 6) % 7;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - diff);
  const year = monday.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const weekNum = Math.ceil(((monday.getTime() - start.getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(weekNum).padStart(2, '0')}`;
}

/** 日付差 (days) を計算: dateStr2 - dateStr1 */
function dayDiff(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00Z').getTime();
  const d2 = new Date(dateStr2 + 'T00:00:00Z').getTime();
  return Math.round((d2 - d1) / 86400000);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

interface PersistedStreak {
  currentDays: number;
  growthLevel: number;
  lastPlayedDate: string;
  graceAvailableThisWeek: boolean;
  graceUsedThisWeek: boolean;
  /** 猶予使用を記録した週の文字列 (YYYY-Www) */
  graceWeekStr: string;
  /** 猶予が解放された週の文字列 */
  graceUnlockWeekStr: string;
}

function defaultPersisted(today: string): PersistedStreak {
  return {
    currentDays: 0,
    growthLevel: 1,
    lastPlayedDate: '',
    graceAvailableThisWeek: false,
    graceUsedThisWeek: false,
    graceWeekStr: '',
    graceUnlockWeekStr: '',
  };
}

function loadPersisted(): PersistedStreak | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedStreak;
  } catch {
    return null;
  }
}

function savePersisted(state: PersistedStreak): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* SSR / quota */ }
}

/**
 * セッション完了時にストリークを更新する。
 * 毎セッション開始後に1回呼ぶ。
 *
 * @param today - 今日の日付 (YYYY-MM-DD)、省略時は実際の今日
 * @returns 更新後の DailyStreakState
 */
export function updateDailyStreak(today?: string): DailyStreakState {
  const todayStr = today ?? toDateStr(new Date());
  const todayWeek = toWeekStr(todayStr);

  const prev: PersistedStreak = loadPersisted() ?? defaultPersisted(todayStr);

  // 毎週月曜日: graceUsedThisWeek をリセット
  const graceWeekReset = prev.graceWeekStr !== todayWeek && prev.graceUsedThisWeek;
  let graceUsedThisWeek = graceWeekReset ? false : prev.graceUsedThisWeek;
  let graceWeekStr = graceWeekReset ? '' : prev.graceWeekStr;

  // 猶予解放: 連続日数が GRACE_UNLOCK_DAYS 以上 & 今週まだ解放していない
  let graceAvailableThisWeek = prev.graceAvailableThisWeek;
  let graceUnlockWeekStr = prev.graceUnlockWeekStr;

  const diff = prev.lastPlayedDate ? dayDiff(prev.lastPlayedDate, todayStr) : -1;

  let currentDays = prev.currentDays;
  let growthLevel = prev.growthLevel as 1 | 2 | 3 | 4 | 5;
  let graceConsumedToday = false;
  let sessionStartMessage: string | null = null;

  if (!prev.lastPlayedDate || diff < 0) {
    // 初回 or 未来日付 (異常ケース): 1日目から開始
    currentDays = 1;
    growthLevel = clamp(growthLevel + 1, MIN_GROWTH_LEVEL, MAX_GROWTH_LEVEL) as 1 | 2 | 3 | 4 | 5;
  } else if (diff === 0) {
    // 同じ日に複数回プレイ → 変更なし
    // 猶予メッセージは既に消費済み or 不要
  } else if (diff === 1) {
    // 連続プレイ: ストリーク継続
    currentDays += 1;
    growthLevel = clamp(growthLevel + 1, MIN_GROWTH_LEVEL, MAX_GROWTH_LEVEL) as 1 | 2 | 3 | 4 | 5;
  } else if (diff === 2) {
    // 1日休み
    if (!graceUsedThisWeek && graceAvailableThisWeek) {
      // 猶予を消費: ストリーク継続、成長レベル変更なし
      graceConsumedToday = true;
      graceUsedThisWeek = true;
      graceWeekStr = todayWeek;
      // ストリーク日数は「昨日もプレイしたことにする」 → そのままカウントアップ
      currentDays += 1;
      sessionStartMessage = 'おやすみしたけどストリーク続いてるよ！';
    } else {
      // 猶予なし or 使用済み: 成長レベル -1、ストリーク継続するが昨日は休み扱い
      // ストリークリセットはしない（1日の休みはリセットしない仕様）
      currentDays += 1;
      growthLevel = clamp(growthLevel - 1, MIN_GROWTH_LEVEL, MAX_GROWTH_LEVEL) as 1 | 2 | 3 | 4 | 5;
    }
  } else {
    // 2日以上の休み: ストリークリセット
    currentDays = 1;
    growthLevel = MIN_GROWTH_LEVEL;
  }

  // 猶予を解放: 連続 GRACE_UNLOCK_DAYS 日以上 & 今週まだ解放していない
  if (currentDays >= GRACE_UNLOCK_DAYS && graceUnlockWeekStr !== todayWeek) {
    graceAvailableThisWeek = true;
    graceUnlockWeekStr = todayWeek;
    if (!sessionStartMessage) {
      sessionStartMessage = '今週は1回お休みができます';
    }
  }

  const next: PersistedStreak = {
    currentDays,
    growthLevel,
    lastPlayedDate: todayStr,
    graceAvailableThisWeek,
    graceUsedThisWeek,
    graceWeekStr,
    graceUnlockWeekStr,
  };

  savePersisted(next);

  const streak: DailyStreak = {
    currentDays,
    growthLevel: growthLevel as 1 | 2 | 3 | 4 | 5,
    lastPlayedDate: todayStr,
    graceAvailableThisWeek,
    graceUsedThisWeek,
  };

  return { streak, graceConsumedToday, sessionStartMessage };
}

/**
 * 現在のストリーク状態を読み取る（更新なし）。
 */
export function loadDailyStreak(): DailyStreak {
  const today = toDateStr(new Date());
  const persisted = loadPersisted() ?? defaultPersisted(today);
  return {
    currentDays: persisted.currentDays,
    growthLevel: clamp(persisted.growthLevel, MIN_GROWTH_LEVEL, MAX_GROWTH_LEVEL) as 1 | 2 | 3 | 4 | 5,
    lastPlayedDate: persisted.lastPlayedDate,
    graceAvailableThisWeek: persisted.graceAvailableThisWeek,
    graceUsedThisWeek: persisted.graceUsedThisWeek,
  };
}

/**
 * テスト・デモ用: ストリーク状態をリセット
 */
export function resetDailyStreak(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

/**
 * セッション日付リストからストリークを計算する（純粋関数版）。
 * ダッシュボードの履歴データから再計算する場合に使用。
 *
 * @param sessionDates - プレイ済み日付の配列 (YYYY-MM-DD)、昇順
 * @param today - 基準日 (YYYY-MM-DD)
 */
export function calculateStreak(sessionDates: string[], today: string): DailyStreak {
  if (sessionDates.length === 0) {
    return {
      currentDays: 0,
      growthLevel: 1,
      lastPlayedDate: '',
      graceAvailableThisWeek: false,
      graceUsedThisWeek: false,
    };
  }

  const sorted = [...new Set(sessionDates)].sort();

  // Simulate the streak calculation from scratch
  let currentDays = 0;
  let growthLevel: number = 1;
  let graceUsedThisWeek = false;
  let graceWeekStr = '';
  let graceAvailableThisWeek = false;
  let graceUnlockWeekStr = '';
  let prevDate = '';

  for (const dateStr of sorted) {
    const todayWeek = toWeekStr(dateStr);

    // Weekly reset of graceUsed
    if (graceWeekStr !== todayWeek && graceUsedThisWeek) {
      graceUsedThisWeek = false;
      graceWeekStr = '';
    }

    if (!prevDate) {
      currentDays = 1;
      growthLevel = clamp(growthLevel + 1, MIN_GROWTH_LEVEL, MAX_GROWTH_LEVEL);
    } else {
      const diff = dayDiff(prevDate, dateStr);
      if (diff === 0) {
        // Same day, no change
      } else if (diff === 1) {
        currentDays += 1;
        growthLevel = clamp(growthLevel + 1, MIN_GROWTH_LEVEL, MAX_GROWTH_LEVEL);
      } else if (diff === 2) {
        if (!graceUsedThisWeek && graceAvailableThisWeek) {
          graceUsedThisWeek = true;
          graceWeekStr = todayWeek;
          currentDays += 1;
        } else {
          currentDays += 1;
          growthLevel = clamp(growthLevel - 1, MIN_GROWTH_LEVEL, MAX_GROWTH_LEVEL);
        }
      } else {
        currentDays = 1;
        growthLevel = MIN_GROWTH_LEVEL;
      }
    }

    // Unlock grace
    if (currentDays >= GRACE_UNLOCK_DAYS && graceUnlockWeekStr !== todayWeek) {
      graceAvailableThisWeek = true;
      graceUnlockWeekStr = todayWeek;
    }

    prevDate = dateStr;
  }

  // Check if streak is still valid as of "today"
  if (prevDate && today > prevDate) {
    const diffToday = dayDiff(prevDate, today);
    if (diffToday > 2) {
      // More than 2 days gap → reset
      currentDays = 0;
      growthLevel = MIN_GROWTH_LEVEL;
    }
  }

  return {
    currentDays,
    growthLevel: clamp(growthLevel, MIN_GROWTH_LEVEL, MAX_GROWTH_LEVEL) as 1 | 2 | 3 | 4 | 5,
    lastPlayedDate: prevDate,
    graceAvailableThisWeek,
    graceUsedThisWeek,
  };
}
