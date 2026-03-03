import type { GameId, CognitiveDomain } from '@/types';
import type { DisabilityType } from '@/features/dda/disability-profile';
import {
  computeRecallProbability,
} from '@/lib/stage-config';
import { SPACED_REPETITION } from '@/lib/constants';
import type {
  WeakPattern,
  InSessionMiss,
  DisabilityRepetitionProfile,
  ReviewTrial,
  RepetitionSchedule,
  SpacedRepetitionState,
} from './types';
import {
  MASTERY_CONSECUTIVE_CORRECT,
  MAX_IN_SESSION_RETRIES,
  MAX_REVIEW_PATTERNS,
  SESSIONS_PER_UNIT,
} from './types';

// ============================================
// 障害別補正プロファイル定義
// ============================================

/**
 * 障害種別ごとの間隔反復補正プロファイル
 *
 * 設計根拠（game-design-v3.md Section 13）:
 * - ID: base_interval x 0.7, max_interval x 0.5
 * - ADHD: 標準 (x 1.0)
 * - ASD: 標準間隔だが刺激フォーマット固定
 */
export const DISABILITY_REPETITION_PROFILES: Record<DisabilityType, DisabilityRepetitionProfile> = {
  'asd': {
    baseIntervalMultiplier: 1.0,
    maxIntervalMultiplier: 1.0,
    fixStimulusFormat: true,
  },
  'adhd': {
    baseIntervalMultiplier: 1.0,
    maxIntervalMultiplier: 1.0,
    fixStimulusFormat: false,
  },
  'id-severe': {
    baseIntervalMultiplier: 0.7,
    maxIntervalMultiplier: 0.5,
    fixStimulusFormat: false,
  },
  'id-moderate': {
    baseIntervalMultiplier: 0.7,
    maxIntervalMultiplier: 0.5,
    fixStimulusFormat: false,
  },
  'id-mild': {
    baseIntervalMultiplier: 0.7,
    maxIntervalMultiplier: 0.5,
    fixStimulusFormat: false,
  },
  'typical': {
    baseIntervalMultiplier: 1.0,
    maxIntervalMultiplier: 1.0,
    fixStimulusFormat: false,
  },
  'unknown': {
    baseIntervalMultiplier: 1.0,
    maxIntervalMultiplier: 1.0,
    fixStimulusFormat: false,
  },
};

// ============================================
// SpacedRepetitionEngine
// ============================================

/**
 * SpacedRepetitionEngine - Half-Life Regressionベースの間隔反復エンジン
 *
 * 設計根拠:
 * - Settles & Meeder (2016) "A Trainable Spaced Repetition Model for Language Learning"
 * - p(recall) = 2^(-t/h) where t = elapsed time, h = half-life
 * - 障害特性別の補正（ID: 短間隔、ASD: フォーマット固定、ADHD: 標準）
 *
 * 主要機能:
 * 1. セッション内再出題: 不正解パターンをセッション末尾で再出題
 * 2. セッション間スケジューリング: 1日→3日→7日の間隔反復
 * 3. 障害別補正: DisabilityType に応じた間隔調整
 * 4. ユニットレビュー（ボス戦）: 5セッション目に苦手要素を集約
 */
export class SpacedRepetitionEngine {
  private weakPatterns: Map<string, WeakPattern> = new Map();
  private inSessionMisses: InSessionMiss[] = [];
  private disabilityType: DisabilityType;
  private sessionInUnit: number;

  constructor(disabilityType: DisabilityType = 'unknown', sessionInUnit: number = 1) {
    this.disabilityType = disabilityType;
    this.sessionInUnit = sessionInUnit;
  }

  // ============================================
  // 障害別補正
  // ============================================

  /** 現在の障害別プロファイルを取得 */
  getDisabilityProfile(): DisabilityRepetitionProfile {
    return DISABILITY_REPETITION_PROFILES[this.disabilityType];
  }

  /** 障害種別を更新 */
  setDisabilityType(type: DisabilityType): void {
    this.disabilityType = type;
  }

  /** 現在の障害種別を取得 */
  getDisabilityType(): DisabilityType {
    return this.disabilityType;
  }

  // ============================================
  // Half-Life Regression 間隔計算
  // ============================================

  /**
   * 障害別補正済みの基本半減期（時間）を計算
   */
  getBaseHalfLife(): number {
    const profile = this.getDisabilityProfile();
    return SPACED_REPETITION.INITIAL_HALF_LIFE_HOURS * profile.baseIntervalMultiplier;
  }

  /**
   * 障害別補正済みの最大半減期（時間）を計算
   */
  getMaxHalfLife(): number {
    const profile = this.getDisabilityProfile();
    return SPACED_REPETITION.MAX_HALF_LIFE_HOURS * profile.maxIntervalMultiplier;
  }

  /**
   * 半減期の更新（正答/不正答に基づく）
   *
   * Half-Life Regression:
   * - 正答: h_new = h_old * multiplier_on_success (2.0)
   * - 不正答: h_new = h_old * multiplier_on_failure (0.5)
   * - 上限: max_half_life（障害別補正適用）
   */
  updateHalfLife(currentHalfLife: number, wasCorrect: boolean): number {
    const multiplier = wasCorrect
      ? SPACED_REPETITION.CORRECT_MULTIPLIER
      : SPACED_REPETITION.INCORRECT_MULTIPLIER;

    const newHalfLife = currentHalfLife * multiplier;
    return Math.max(1, Math.min(newHalfLife, this.getMaxHalfLife()));
  }

  /**
   * 次回出題日時を計算
   *
   * 設計仕様: 不正解パターンを1日後→3日後→7日後に再出題
   * 実際の間隔は半減期に基づいて動的に調整される。
   * p(recall) = 0.5 となるタイミング = halfLife 時間後
   */
  computeNextReviewAt(halfLifeHours: number, nowMs: number): number {
    return nowMs + halfLifeHours * 60 * 60 * 1000;
  }

  /**
   * 記憶強度（想起確率）を計算
   */
  computeRecallProbability(elapsedHours: number, halfLifeHours: number): number {
    return computeRecallProbability(elapsedHours, halfLifeHours);
  }

  // ============================================
  // セッション内再出題
  // ============================================

  /**
   * セッション内不正解を記録
   */
  recordInSessionMiss(miss: InSessionMiss): void {
    // 同じパターンの重複は避ける
    const existing = this.inSessionMisses.find(m => m.patternKey === miss.patternKey);
    if (!existing) {
      this.inSessionMisses.push(miss);
    }
  }

  /**
   * セッション末尾で再出題すべきパターンを取得
   *
   * 仕様: セッション内で不正解だった問題を、同セッション末尾で再出題
   * 最大 MAX_IN_SESSION_RETRIES 個まで
   */
  getInSessionRetries(): InSessionMiss[] {
    return this.inSessionMisses.slice(0, MAX_IN_SESSION_RETRIES);
  }

  /**
   * セッション内不正解記録をクリア（セッション終了時）
   */
  clearInSessionMisses(): void {
    this.inSessionMisses = [];
  }

  /**
   * 現在のセッション内不正解数を取得
   */
  getInSessionMissCount(): number {
    return this.inSessionMisses.length;
  }

  // ============================================
  // 苦手パターン管理
  // ============================================

  /**
   * 苦手パターンを記録（不正解時に呼び出し）
   *
   * 既存パターンの場合は統計を更新、新規の場合は作成
   */
  recordWeakPattern(
    gameId: GameId,
    domain: CognitiveDomain,
    patternKey: string,
    stimulus: Record<string, unknown>,
    correctAnswer: Record<string, unknown>,
    difficulty: Record<string, unknown>,
    nowMs: number,
  ): WeakPattern {
    const id = `${gameId}:${domain}:${patternKey}`;
    const existing = this.weakPatterns.get(id);
    const profile = this.getDisabilityProfile();

    if (existing) {
      // 既存パターンの統計更新（不正解）
      existing.lastTestedAt = nowMs;
      existing.consecutiveCorrect = 0;
      existing.consecutiveIncorrect++;
      existing.totalAttempts++;
      existing.isMastered = false;

      // 半減期を短縮
      existing.halfLifeHours = this.updateHalfLife(existing.halfLifeHours, false);
      existing.nextReviewAt = this.computeNextReviewAt(existing.halfLifeHours, nowMs);

      return existing;
    }

    // 新規パターンの作成
    const pattern: WeakPattern = {
      id,
      gameId,
      domain,
      patternKey,
      stimulus,
      correctAnswer,
      difficulty,
      createdAt: nowMs,
      lastTestedAt: nowMs,
      consecutiveCorrect: 0,
      consecutiveIncorrect: 1,
      totalAttempts: 1,
      totalCorrect: 0,
      halfLifeHours: this.getBaseHalfLife(),
      nextReviewAt: this.computeNextReviewAt(this.getBaseHalfLife(), nowMs),
      isMastered: false,
      fixedStimulusFormat: profile.fixStimulusFormat,
    };

    this.weakPatterns.set(id, pattern);
    return pattern;
  }

  /**
   * 苦手パターンの正答を記録
   *
   * 連続正解数が MASTERY_CONSECUTIVE_CORRECT に達したら卒業
   */
  recordPatternCorrect(patternId: string, nowMs: number): WeakPattern | null {
    const pattern = this.weakPatterns.get(patternId);
    if (!pattern) return null;

    pattern.lastTestedAt = nowMs;
    pattern.consecutiveCorrect++;
    pattern.consecutiveIncorrect = 0;
    pattern.totalAttempts++;
    pattern.totalCorrect++;

    // 半減期を延長
    pattern.halfLifeHours = this.updateHalfLife(pattern.halfLifeHours, true);
    pattern.nextReviewAt = this.computeNextReviewAt(pattern.halfLifeHours, nowMs);

    // 卒業判定
    if (pattern.consecutiveCorrect >= MASTERY_CONSECUTIVE_CORRECT) {
      pattern.isMastered = true;
    }

    return pattern;
  }

  /**
   * 苦手パターンの不正答を記録
   */
  recordPatternIncorrect(patternId: string, nowMs: number): WeakPattern | null {
    const pattern = this.weakPatterns.get(patternId);
    if (!pattern) return null;

    pattern.lastTestedAt = nowMs;
    pattern.consecutiveCorrect = 0;
    pattern.consecutiveIncorrect++;
    pattern.totalAttempts++;
    pattern.isMastered = false;

    // 半減期を短縮
    pattern.halfLifeHours = this.updateHalfLife(pattern.halfLifeHours, false);
    pattern.nextReviewAt = this.computeNextReviewAt(pattern.halfLifeHours, nowMs);

    return pattern;
  }

  /**
   * 特定パターンを取得
   */
  getPattern(patternId: string): WeakPattern | null {
    return this.weakPatterns.get(patternId) ?? null;
  }

  /**
   * 全苦手パターンを取得
   */
  getAllPatterns(): WeakPattern[] {
    return Array.from(this.weakPatterns.values());
  }

  /**
   * 未習熟の苦手パターンを取得
   */
  getActivePatterns(): WeakPattern[] {
    return this.getAllPatterns().filter(p => !p.isMastered);
  }

  // ============================================
  // セッション間スケジューリング
  // ============================================

  /**
   * 復習が必要なパターンのスケジュールを取得
   *
   * 仕様: 不正解パターンを1日後→3日後→7日後に再出題
   * 実装: p(recall) < REVIEW_THRESHOLD のパターンを抽出し、優先度順にソート
   */
  getRepetitionSchedule(nowMs: number): RepetitionSchedule {
    const duePatterns: WeakPattern[] = [];

    for (const pattern of this.weakPatterns.values()) {
      if (pattern.isMastered) continue;

      // 次回出題予定日時を超過しているか
      if (nowMs >= pattern.nextReviewAt) {
        duePatterns.push(pattern);
        continue;
      }

      // 記憶強度が閾値以下か
      const elapsedHours = (nowMs - pattern.lastTestedAt) / (60 * 60 * 1000);
      const recallProb = this.computeRecallProbability(elapsedHours, pattern.halfLifeHours);
      if (recallProb < SPACED_REPETITION.REVIEW_THRESHOLD) {
        duePatterns.push(pattern);
      }
    }

    // 優先度順にソート: 記憶強度が低い（忘れやすい）ものを先に
    duePatterns.sort((a, b) => {
      const elapsedA = (nowMs - a.lastTestedAt) / (60 * 60 * 1000);
      const elapsedB = (nowMs - b.lastTestedAt) / (60 * 60 * 1000);
      const recallA = this.computeRecallProbability(elapsedA, a.halfLifeHours);
      const recallB = this.computeRecallProbability(elapsedB, b.halfLifeHours);
      return recallA - recallB; // 低い方が先
    });

    const earliestDueAt = duePatterns.length > 0
      ? Math.min(...duePatterns.map(p => p.nextReviewAt))
      : null;

    return {
      duePatternCount: duePatterns.length,
      earliestDueAt,
      duePatterns,
    };
  }

  /**
   * 特定ゲームの復習パターンを取得
   */
  getDuePatternsForGame(gameId: GameId, nowMs: number): WeakPattern[] {
    const schedule = this.getRepetitionSchedule(nowMs);
    return schedule.duePatterns.filter(p => p.gameId === gameId);
  }

  /**
   * 特定ドメインの復習パターンを取得
   */
  getDuePatternsForDomain(domain: CognitiveDomain, nowMs: number): WeakPattern[] {
    const schedule = this.getRepetitionSchedule(nowMs);
    return schedule.duePatterns.filter(p => p.domain === domain);
  }

  // ============================================
  // ユニットレビュー（ボス戦）
  // ============================================

  /**
   * 現在のユニット内セッション番号を設定
   */
  setSessionInUnit(session: number): void {
    this.sessionInUnit = session;
  }

  /**
   * 現在のユニット内セッション番号を取得
   */
  getSessionInUnit(): number {
    return this.sessionInUnit;
  }

  /**
   * ユニットレビュー（ボス戦）セッションかどうかを判定
   *
   * 仕様: 5セッション目がユニットレビュー
   */
  isUnitReviewSession(): boolean {
    return this.sessionInUnit === SESSIONS_PER_UNIT;
  }

  /**
   * ユニットレビュー（ボス戦）用の試行リストを生成
   *
   * 仕様: 過去4セッションの苦手要素を集約して再テスト
   * 優先度は以下の基準で算出:
   * 1. 連続不正解数が多いほど優先
   * 2. 記憶強度が低いほど優先
   * 3. 出題回数が少ないほど優先（まだ十分に練習していない）
   */
  generateUnitReviewTrials(nowMs: number): ReviewTrial[] {
    const activePatterns = this.getActivePatterns();

    const trials: ReviewTrial[] = activePatterns.map(pattern => {
      const elapsedHours = (nowMs - pattern.lastTestedAt) / (60 * 60 * 1000);
      const recallProb = this.computeRecallProbability(elapsedHours, pattern.halfLifeHours);

      // 優先度スコア計算
      // - 想起確率が低いほど高スコア (0-1 反転) → 最大 40点
      // - 連続不正解数 → 最大 30点
      // - 出題回数が少ないほど高スコア → 最大 30点
      const recallScore = (1 - recallProb) * 40;
      const incorrectScore = Math.min(pattern.consecutiveIncorrect * 10, 30);
      const noveltyScore = Math.max(30 - pattern.totalAttempts * 5, 0);

      return {
        weakPattern: pattern,
        priorityScore: recallScore + incorrectScore + noveltyScore,
      };
    });

    // 優先度順にソート（高い方が先）
    trials.sort((a, b) => b.priorityScore - a.priorityScore);

    return trials.slice(0, MAX_REVIEW_PATTERNS);
  }

  // ============================================
  // セッションライフサイクル
  // ============================================

  /**
   * セッション開始時の処理
   *
   * - セッション内不正解記録をクリア
   * - セッション番号を進める
   */
  startSession(): void {
    this.clearInSessionMisses();
  }

  /**
   * セッション終了時の処理
   *
   * - セッション内不正解をWeakPatternに昇格
   * - セッション番号を進める
   */
  endSession(nowMs: number): {
    newWeakPatterns: WeakPattern[];
    retryCount: number;
  } {
    const newPatterns: WeakPattern[] = [];

    // セッション内不正解をWeakPatternに昇格
    for (const miss of this.inSessionMisses) {
      const pattern = this.recordWeakPattern(
        miss.gameId,
        miss.domain,
        miss.patternKey,
        miss.stimulus,
        miss.correctAnswer,
        miss.difficulty,
        nowMs,
      );
      newPatterns.push(pattern);
    }

    const retryCount = this.inSessionMisses.length;
    this.clearInSessionMisses();

    // セッション番号を進める
    this.sessionInUnit++;
    if (this.sessionInUnit > SESSIONS_PER_UNIT) {
      this.sessionInUnit = 1;
    }

    return { newWeakPatterns: newPatterns, retryCount };
  }

  // ============================================
  // 永続化
  // ============================================

  /**
   * 状態をシリアライズ
   */
  serialize(): SpacedRepetitionState {
    return {
      weakPatterns: this.getAllPatterns(),
      inSessionMisses: [...this.inSessionMisses],
      sessionInUnit: this.sessionInUnit,
      disabilityType: this.disabilityType,
    };
  }

  /**
   * 状態を復元
   */
  restore(state: SpacedRepetitionState): void {
    this.weakPatterns.clear();
    for (const pattern of state.weakPatterns) {
      this.weakPatterns.set(pattern.id, pattern);
    }
    this.inSessionMisses = [...state.inSessionMisses];
    this.sessionInUnit = state.sessionInUnit;
    this.disabilityType = state.disabilityType;
  }
}
