import type { CognitiveDomain, GameId, MasteryLevel } from '@/types';
import type { MasteryRecord } from './types';
import {
  MASTERY_ACCURACY_THRESHOLD,
  MASTERY_CONSECUTIVE_SESSIONS,
  SPACED_REPETITION,
} from '@/lib/constants';
import { updateHalfLife, needsReview } from '@/lib/stage-config';

/**
 * MasteryTracker - DTT習熟基準の追跡
 *
 * 設計根拠：
 * - 80% × 2連続セッション = 習熟（Leaf & McEachin, 1999）
 * - 5段階レベル管理
 * - 回帰検知（習熟後のスコア低下でリプレイ推奨）
 * - 間隔反復スケジュール（Half-Life Regression）
 */
export class MasteryTracker {
  private records: Map<string, MasteryRecord> = new Map();

  /** ドメイン+ゲームのキー生成 */
  private key(domain: CognitiveDomain, gameId: GameId): string {
    return `${domain}:${gameId}`;
  }

  /** レコード取得（なければ初期化） */
  getRecord(domain: CognitiveDomain, gameId: GameId): MasteryRecord {
    const k = this.key(domain, gameId);
    if (!this.records.has(k)) {
      this.records.set(k, {
        domain,
        gameId,
        level: 1,
        consecutiveMasterySessions: 0,
        recentAccuracies: [],
        lastPlayedAt: 0,
        halfLifeHours: SPACED_REPETITION.INITIAL_HALF_LIFE_HOURS,
        nextReviewAt: 0,
      });
    }
    return this.records.get(k)!;
  }

  /** 全レコード取得 */
  getAllRecords(): MasteryRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * セッション結果を記録し、習熟判定を行う
   * @returns レベルが変わった場合は新しいレベル、変わらない場合はnull
   */
  recordSessionResult(
    domain: CognitiveDomain,
    gameId: GameId,
    accuracy: number,
    nowMs: number,
  ): { levelChanged: boolean; newLevel: MasteryLevel; regression: boolean } {
    const record = this.getRecord(domain, gameId);
    record.lastPlayedAt = nowMs;
    record.recentAccuracies.push(accuracy);

    // 直近10セッション分のみ保持
    if (record.recentAccuracies.length > 10) {
      record.recentAccuracies.shift();
    }

    const oldLevel = record.level;
    let regression = false;

    // 習熟判定: 正答率 >= 80% か
    if (accuracy >= MASTERY_ACCURACY_THRESHOLD) {
      record.consecutiveMasterySessions++;

      // 2連続セッションで習熟確認 → レベルアップ
      if (record.consecutiveMasterySessions >= MASTERY_CONSECUTIVE_SESSIONS) {
        if (record.level < 5) {
          record.level = Math.min(record.level + 1, 5) as MasteryLevel;
        }
        record.consecutiveMasterySessions = 0;

        // 半減期を延長（正答）
        record.halfLifeHours = updateHalfLife(record.halfLifeHours, true);
      }
    } else {
      record.consecutiveMasterySessions = 0;

      // 半減期を短縮（不正答）
      record.halfLifeHours = updateHalfLife(record.halfLifeHours, false);

      // 回帰検知: 既に習熟していたのにスコアが低下
      if (record.level >= 2 && accuracy < MASTERY_ACCURACY_THRESHOLD - 0.1) {
        regression = true;
      }
    }

    // 次回復習推奨日を計算
    record.nextReviewAt = nowMs + record.halfLifeHours * 60 * 60 * 1000;

    const levelChanged = record.level !== oldLevel;
    return { levelChanged, newLevel: record.level, regression };
  }

  /**
   * 復習が必要なドメインを取得
   */
  getDomainsNeedingReview(nowMs: number): CognitiveDomain[] {
    const domains: CognitiveDomain[] = [];

    for (const record of this.records.values()) {
      if (record.lastPlayedAt === 0) continue;

      const elapsedHours = (nowMs - record.lastPlayedAt) / (60 * 60 * 1000);
      if (needsReview(elapsedHours, record.halfLifeHours)) {
        domains.push(record.domain);
      }
    }

    return domains;
  }

  /**
   * ドメインのレベルを取得
   */
  getLevel(domain: CognitiveDomain, gameId: GameId): MasteryLevel {
    return this.getRecord(domain, gameId).level;
  }

  /**
   * 全ドメインの進捗サマリ
   */
  getProgressSummary(): Record<CognitiveDomain, { level: MasteryLevel; lastAccuracy: number }> {
    const summary: Record<string, { level: MasteryLevel; lastAccuracy: number }> = {};

    for (const record of this.records.values()) {
      const lastAccuracy = record.recentAccuracies.length > 0
        ? record.recentAccuracies[record.recentAccuracies.length - 1]
        : 0;
      summary[record.domain] = { level: record.level, lastAccuracy };
    }

    return summary as Record<CognitiveDomain, { level: MasteryLevel; lastAccuracy: number }>;
  }

  /** 状態をシリアライズ */
  serialize(): MasteryRecord[] {
    return Array.from(this.records.values());
  }

  /** 状態を復元 */
  restore(records: MasteryRecord[]): void {
    this.records.clear();
    for (const record of records) {
      this.records.set(this.key(record.domain, record.gameId), record);
    }
  }
}
