import type { InstructionLevel } from './instruction-level';
import type { IntegratedGameId } from '@/games/integrated/types';

const STORAGE_KEY = 'manas_instruction_logs_v1';
/** 保持するログの最大件数（古いものから削除） */
const MAX_LOG_ENTRIES = 200;

/**
 * 指示レベルのログエントリ
 */
export interface InstructionLog {
  /** 対象ゲームID */
  gameId: IntegratedGameId;
  /** 使用された指示レベル */
  instructionLevel: InstructionLevel;
  /** デモ再視聴回数 */
  demoReplayCount: number;
  /** 動的調整によって変更されたか */
  autoAdjusted: boolean;
  /** ISO 8601 形式のタイムスタンプ */
  timestamp: string;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** ログ全件を localStorage から読み込む */
export function loadInstructionLogs(): InstructionLog[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as InstructionLog[];
  } catch { /* ignore */ }
  return [];
}

/** 1件のログエントリを localStorage に追記する */
export function appendInstructionLog(entry: Omit<InstructionLog, 'timestamp'>): void {
  if (!canUseStorage()) return;
  try {
    const logs = loadInstructionLogs();
    const newEntry: InstructionLog = {
      ...entry,
      timestamp: new Date().toISOString(),
    };
    logs.push(newEntry);
    // 最大件数を超えた場合は古いものから削除
    const trimmed = logs.length > MAX_LOG_ENTRIES
      ? logs.slice(logs.length - MAX_LOG_ENTRIES)
      : logs;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

/**
 * 指定ゲームの直近 N 件のログを取得する。
 * ティア判定の補助データとして使用できる。
 */
export function getRecentLogsForGame(
  gameId: IntegratedGameId,
  limit = 10,
): InstructionLog[] {
  const all = loadInstructionLogs();
  return all
    .filter(log => log.gameId === gameId)
    .slice(-limit);
}

/** 全ログを削除する（デバッグ・リセット用） */
export function clearInstructionLogs(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}
