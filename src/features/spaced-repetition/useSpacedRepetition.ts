'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameId, CognitiveDomain } from '@/types';
import type { DisabilityType } from '@/features/dda/disability-profile';
import { SpacedRepetitionEngine } from './SpacedRepetitionEngine';
import type {
  WeakPattern,
  InSessionMiss,
  RepetitionSchedule,
  ReviewTrial,
  SpacedRepetitionState,
} from './types';

// ============================================
// localStorage 永続化
// ============================================

const STORAGE_KEY = 'manas-spaced-repetition';

function loadState(): SpacedRepetitionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SpacedRepetitionState;
  } catch {
    return null;
  }
}

function saveState(state: SpacedRepetitionState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ============================================
// Hook Interface
// ============================================

export interface UseSpacedRepetitionOptions {
  disabilityType?: DisabilityType;
  /** 自動永続化を有効にするか（デフォルト: true） */
  autoPersist?: boolean;
}

export interface SpacedRepetitionControls {
  // --- セッション内再出題 ---
  /** 不正解パターンを記録（セッション内再出題用） */
  recordMiss: (miss: InSessionMiss) => void;
  /** セッション末尾で再出題すべきパターンを取得 */
  getRetries: () => InSessionMiss[];
  /** セッション内不正解数 */
  missCount: number;

  // --- 苦手パターン管理 ---
  /** 苦手パターンの不正答を記録（セッション間スケジューリング用） */
  recordIncorrect: (
    gameId: GameId,
    domain: CognitiveDomain,
    patternKey: string,
    stimulus: Record<string, unknown>,
    correctAnswer: Record<string, unknown>,
    difficulty: Record<string, unknown>,
  ) => WeakPattern;
  /** 苦手パターンの正答を記録 */
  recordCorrect: (patternId: string) => WeakPattern | null;
  /** 全苦手パターンを取得 */
  allPatterns: WeakPattern[];
  /** 未習熟の苦手パターンを取得 */
  activePatterns: WeakPattern[];

  // --- スケジュール ---
  /** 次回出題スケジュールを取得 */
  getSchedule: () => RepetitionSchedule;
  /** 特定ゲームの復習パターンを取得 */
  getDueForGame: (gameId: GameId) => WeakPattern[];
  /** 特定ドメインの復習パターンを取得 */
  getDueForDomain: (domain: CognitiveDomain) => WeakPattern[];

  // --- ユニットレビュー（ボス戦） ---
  /** ユニットレビューセッションかどうか */
  isReviewSession: boolean;
  /** ユニットレビュー用の試行リストを生成 */
  generateReviewTrials: () => ReviewTrial[];
  /** ユニット内セッション番号 */
  sessionInUnit: number;

  // --- セッションライフサイクル ---
  /** セッション開始 */
  startSession: () => void;
  /** セッション終了 */
  endSession: () => { newWeakPatterns: WeakPattern[]; retryCount: number };

  // --- エンジン直接参照 ---
  engine: SpacedRepetitionEngine;
}

/**
 * useSpacedRepetition - 間隔反復エンジンのReact Hook
 *
 * ゲームセッションとの統合インターフェースを提供。
 * 不正解パターンの記録、次回出題スケジュールの取得、
 * ユニットレビュー（ボス戦）統合を管理する。
 */
export function useSpacedRepetition(
  options: UseSpacedRepetitionOptions = {},
): SpacedRepetitionControls {
  const {
    disabilityType = 'unknown',
    autoPersist = true,
  } = options;

  // エンジンをrefで保持（再レンダリングで再生成しない）
  const engineRef = useRef<SpacedRepetitionEngine | null>(null);

  // 初回マウント時にエンジンを初期化
  if (!engineRef.current) {
    engineRef.current = new SpacedRepetitionEngine(disabilityType);
    // localStorage から復元
    const savedState = loadState();
    if (savedState) {
      engineRef.current.restore(savedState);
    }
  }

  const engine = engineRef.current;

  // 状態トリガー（UIの再レンダリング用）
  const [, setUpdateCounter] = useState(0);
  const triggerUpdate = useCallback(() => {
    setUpdateCounter(c => c + 1);
  }, []);

  // 障害種別が変更されたら更新
  useEffect(() => {
    if (engine.getDisabilityType() !== disabilityType) {
      engine.setDisabilityType(disabilityType);
      triggerUpdate();
    }
  }, [disabilityType, engine, triggerUpdate]);

  // 永続化ヘルパー
  const persist = useCallback(() => {
    if (autoPersist) {
      saveState(engine.serialize());
    }
  }, [autoPersist, engine]);

  // --- セッション内再出題 ---
  const recordMiss = useCallback((miss: InSessionMiss) => {
    engine.recordInSessionMiss(miss);
    triggerUpdate();
  }, [engine, triggerUpdate]);

  const getRetries = useCallback(() => {
    return engine.getInSessionRetries();
  }, [engine]);

  // --- 苦手パターン管理 ---
  const recordIncorrect = useCallback((
    gameId: GameId,
    domain: CognitiveDomain,
    patternKey: string,
    stimulus: Record<string, unknown>,
    correctAnswer: Record<string, unknown>,
    difficulty: Record<string, unknown>,
  ) => {
    const pattern = engine.recordWeakPattern(
      gameId, domain, patternKey, stimulus, correctAnswer, difficulty, Date.now(),
    );
    persist();
    triggerUpdate();
    return pattern;
  }, [engine, persist, triggerUpdate]);

  const recordCorrect = useCallback((patternId: string) => {
    const pattern = engine.recordPatternCorrect(patternId, Date.now());
    persist();
    triggerUpdate();
    return pattern;
  }, [engine, persist, triggerUpdate]);

  // --- スケジュール ---
  const getSchedule = useCallback(() => {
    return engine.getRepetitionSchedule(Date.now());
  }, [engine]);

  const getDueForGame = useCallback((gameId: GameId) => {
    return engine.getDuePatternsForGame(gameId, Date.now());
  }, [engine]);

  const getDueForDomain = useCallback((domain: CognitiveDomain) => {
    return engine.getDuePatternsForDomain(domain, Date.now());
  }, [engine]);

  // --- ユニットレビュー ---
  const generateReviewTrials = useCallback(() => {
    return engine.generateUnitReviewTrials(Date.now());
  }, [engine]);

  // --- セッションライフサイクル ---
  const startSession = useCallback(() => {
    engine.startSession();
    triggerUpdate();
  }, [engine, triggerUpdate]);

  const endSession = useCallback(() => {
    const result = engine.endSession(Date.now());
    persist();
    triggerUpdate();
    return result;
  }, [engine, persist, triggerUpdate]);

  return {
    // セッション内再出題
    recordMiss,
    getRetries,
    missCount: engine.getInSessionMissCount(),

    // 苦手パターン管理
    recordIncorrect,
    recordCorrect,
    allPatterns: engine.getAllPatterns(),
    activePatterns: engine.getActivePatterns(),

    // スケジュール
    getSchedule,
    getDueForGame,
    getDueForDomain,

    // ユニットレビュー
    isReviewSession: engine.isUnitReviewSession(),
    generateReviewTrials,
    sessionInUnit: engine.getSessionInUnit(),

    // セッションライフサイクル
    startSession,
    endSession,

    // エンジン直接参照
    engine,
  };
}
