import type { IntegratedGameId } from '@/games/integrated/types';

const STORAGE_KEY = 'manas-mixed-session-records';
const MAX_RECORDS = 30;

export interface MixedSessionRecord {
  id: string;
  timestamp: number;
  gameIds: IntegratedGameId[];
  totalCorrect: number;
  totalAttempts: number;
  accuracy: number;
  durationSec: number;
}

export function saveMixedSessionRecord(record: Omit<MixedSessionRecord, 'id'>): void {
  try {
    const existing = loadMixedSessionRecords();
    const newRecord: MixedSessionRecord = {
      ...record,
      id: `mixed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
    existing.unshift(newRecord);
    if (existing.length > MAX_RECORDS) existing.length = MAX_RECORDS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    console.log('[MixedSession] Record saved:', newRecord);
  } catch (e) {
    console.error('[MixedSession] Failed to save record:', e);
  }
}

export function loadMixedSessionRecords(): MixedSessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MixedSessionRecord[];
  } catch {
    return [];
  }
}
