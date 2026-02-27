import type { DailyLimitConfig } from './session-config';

interface DailyRecord {
  date: string;
  sessionCount: number;
  totalPlayTimeMs: number;
  lastSessionEndTime: number;
}

const STORAGE_KEY = 'manas-daily-play-record';

export class DailyTracker {
  private getRecord(): DailyRecord {
    const today = new Date().toISOString().split('T')[0];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const record = JSON.parse(stored) as DailyRecord;
        if (record.date === today) return record;
      }
    } catch { /* ignore */ }
    return { date: today, sessionCount: 0, totalPlayTimeMs: 0, lastSessionEndTime: 0 };
  }

  private saveRecord(record: DailyRecord): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch { /* ignore */ }
  }

  recordSessionEnd(durationMs: number): void {
    const record = this.getRecord();
    record.sessionCount++;
    record.totalPlayTimeMs += durationMs;
    record.lastSessionEndTime = Date.now();
    this.saveRecord(record);
  }

  canStartSession(dailyLimit: DailyLimitConfig): {
    allowed: boolean;
    reason?: string;
    waitMinutes?: number;
  } {
    const record = this.getRecord();

    if (record.sessionCount >= dailyLimit.maxSessions) {
      return {
        allowed: false,
        reason: 'きょうは たくさん がんばったね！また あした あそぼう',
      };
    }

    if (record.totalPlayTimeMs >= dailyLimit.maxTotalMinutes * 60 * 1000) {
      return {
        allowed: false,
        reason: 'きょうは たくさん がんばったね！また あした あそぼう',
      };
    }

    if (record.lastSessionEndTime > 0) {
      const elapsedMin = (Date.now() - record.lastSessionEndTime) / 60000;
      if (elapsedMin < dailyLimit.cooldownMinutes) {
        const waitMin = Math.ceil(dailyLimit.cooldownMinutes - elapsedMin);
        return {
          allowed: false,
          reason: `すこし おやすみしよう！あと ${waitMin}ふん まってね`,
          waitMinutes: waitMin,
        };
      }
    }

    return { allowed: true };
  }

  getTodayStats(): { sessionCount: number; totalPlayTimeMin: number } {
    const record = this.getRecord();
    return {
      sessionCount: record.sessionCount,
      totalPlayTimeMin: Math.round(record.totalPlayTimeMs / 60000),
    };
  }

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }
}

export const dailyTracker = new DailyTracker();
