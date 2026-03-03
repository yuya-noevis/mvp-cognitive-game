'use client';

/**
 * useAssistLog - 保護者介入ログ収集 Hook
 *
 * セッション中の介入情報を自動収集し、
 * セッション終了時にAssistLogEntryを生成する。
 *
 * 機能:
 * - assist_mode の ON/OFF 切り替え
 * - デモ再視聴回数の自動カウント
 * - セッション長の自動計測
 * - デバイス情報の自動取得
 * - セッション終了時のログエントリ生成
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { InstructionLevel } from '@/features/instruction/instruction-level';
import type { GameId } from '@/types';
import { nowMs } from '@/lib/utils';
import { computeConfidence } from './confidence';
import { getDeviceInfo } from './device-info';
import type { AssistLogEntry, ConfidenceFlag } from './types';

const STORAGE_KEY = 'manas_assist_logs_v1';
/** 保持するログの最大件数（古いものから削除） */
const MAX_LOG_ENTRIES = 200;

export interface UseAssistLogOptions {
  /** ゲームID */
  gameId: GameId;
  /** 匿名子どもID */
  userId?: string;
  /** 現在の指示レベル */
  instructionLevel: InstructionLevel;
}

export interface AssistLogControls {
  /** 現在の assist_mode 状態 */
  assistMode: boolean;
  /** assist_mode を切り替える */
  setAssistMode: (enabled: boolean) => void;
  /** デモ再視聴回数 */
  demoReplayCount: number;
  /** デモ再視聴を記録する（デモ再生ボタンのコールバック用） */
  recordDemoReplay: () => void;
  /** 現在の信頼度フラグ */
  confidence: ConfidenceFlag;
  /** セッション開始を記録する（useGameSession.startSession と併用） */
  startSession: (sessionId: string) => void;
  /** セッション終了時にログエントリを生成・保存する */
  finalizeLog: () => AssistLogEntry | null;
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/** 保存済みログを読み込む */
export function loadAssistLogs(): AssistLogEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as AssistLogEntry[];
  } catch { /* ignore */ }
  return [];
}

/** ログエントリを localStorage に保存する */
function saveAssistLog(entry: AssistLogEntry): void {
  if (!canUseStorage()) return;
  try {
    const logs = loadAssistLogs();
    logs.push(entry);
    const trimmed = logs.length > MAX_LOG_ENTRIES
      ? logs.slice(logs.length - MAX_LOG_ENTRIES)
      : logs;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

/** 全ログを削除する（デバッグ・リセット用） */
export function clearAssistLogs(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export function useAssistLog({
  gameId,
  userId,
  instructionLevel,
}: UseAssistLogOptions): AssistLogControls {
  const [assistMode, setAssistMode] = useState(false);
  const [demoReplayCount, setDemoReplayCount] = useState(0);
  const [confidence, setConfidence] = useState<ConfidenceFlag>('high');

  const sessionIdRef = useRef<string | null>(null);
  const sessionStartMsRef = useRef<number>(0);
  const deviceInfoRef = useRef<string>('unknown');

  // デバイス情報を初回マウント時に取得
  useEffect(() => {
    deviceInfoRef.current = getDeviceInfo();
  }, []);

  // assist_mode または demoReplayCount が変更されたら confidence を再計算
  useEffect(() => {
    setConfidence(computeConfidence(assistMode, demoReplayCount));
  }, [assistMode, demoReplayCount]);

  const handleSetAssistMode = useCallback((enabled: boolean) => {
    setAssistMode(enabled);
  }, []);

  const recordDemoReplay = useCallback(() => {
    setDemoReplayCount(prev => prev + 1);
  }, []);

  const startSession = useCallback((sessionId: string) => {
    sessionIdRef.current = sessionId;
    sessionStartMsRef.current = nowMs();
    // セッション開始時にカウンタをリセット
    setDemoReplayCount(0);
  }, []);

  const finalizeLog = useCallback((): AssistLogEntry | null => {
    const sid = sessionIdRef.current;
    if (!sid) return null;

    const entry: AssistLogEntry = {
      session_id: sid,
      game_id: gameId,
      user_id: userId ?? '',
      assist_mode: assistMode,
      demo_replay_count: demoReplayCount,
      instruction_level: instructionLevel,
      session_duration: sessionStartMsRef.current > 0
        ? nowMs() - sessionStartMsRef.current
        : 0,
      time_of_day: new Date().toISOString(),
      device_info: deviceInfoRef.current,
      confidence: computeConfidence(assistMode, demoReplayCount),
    };

    // localStorage に保存
    saveAssistLog(entry);

    return entry;
  }, [gameId, userId, assistMode, demoReplayCount, instructionLevel]);

  return {
    assistMode,
    setAssistMode: handleSetAssistMode,
    demoReplayCount,
    recordDemoReplay,
    confidence,
    startSession,
    finalizeLog,
  };
}
